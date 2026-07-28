import { createHmac, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { extractArcatesLinkCode, consumeChannelLinkCode } from "@/lib/channels/link-code";
import { generateAssistantReply } from "@/lib/chat/engine";
import { databaseConfigured, db } from "@/lib/db";
import { sendWhatsAppText, whatsappConfigured } from "@/lib/whatsapp/client";

type WhatsAppMessage = {
  id: string;
  from: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: {
    button_reply?: { title?: string };
    list_reply?: { title?: string };
  };
};

type WhatsAppStatus = {
  id: string;
  status: string;
  timestamp?: string;
  recipient_id?: string;
};

type WhatsAppPayload = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      field?: string;
      value?: {
        contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
        messages?: WhatsAppMessage[];
        statuses?: WhatsAppStatus[];
      };
    }>;
  }>;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && expectedToken && token === expectedToken && challenge) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  return NextResponse.json({ error: "Webhook doğrulanamadı." }, { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();

  if (!appSecret) {
    return NextResponse.json({ error: "WhatsApp uygulama sırrı yapılandırılmadı." }, { status: 503 });
  }
  if (!isValidSignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ error: "Geçersiz webhook imzası." }, { status: 401 });
  }
  if (!databaseConfigured()) {
    return NextResponse.json({ error: "Webhook veri deposu yapılandırılmadı." }, { status: 503 });
  }

  let payload: WhatsAppPayload;
  try {
    payload = JSON.parse(rawBody) as WhatsAppPayload;
  } catch {
    return NextResponse.json({ error: "Geçersiz webhook verisi." }, { status: 400 });
  }

  const messages: Array<{ message: WhatsAppMessage; profileName?: string }> = [];
  const statuses: WhatsAppStatus[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const profileName = change.value?.contacts?.[0]?.profile?.name;
      for (const message of change.value?.messages ?? []) messages.push({ message, profileName });
      statuses.push(...(change.value?.statuses ?? []));
    }
  }

  try {
    for (const status of statuses) await storeStatus(status);
    for (const item of messages) await processIncomingMessage(item.message, item.profileName);
  } catch (error) {
    console.error("WhatsApp webhook processing failed", error);
    return NextResponse.json({ error: "Webhook işlenemedi." }, { status: 500 });
  }

  return NextResponse.json({ received: true, messages: messages.length, statuses: statuses.length });
}

async function storeStatus(status: WhatsAppStatus) {
  const externalId = `status:${status.id}:${status.status}:${status.timestamp ?? "unknown"}`;
  await db.webhookEvent.upsert({
    where: { provider_externalId: { provider: "WHATSAPP", externalId } },
    update: { processedAt: new Date() },
    create: {
      provider: "WHATSAPP",
      externalId,
      eventType: `MESSAGE_${status.status.toUpperCase()}`,
      payload: status as Prisma.InputJsonValue,
      processedAt: new Date(),
    },
  });
}

async function processIncomingMessage(message: WhatsAppMessage, profileName?: string) {
  if (!message.id || !message.from) return;

  const existingEvent = await db.webhookEvent.findUnique({
    where: { provider_externalId: { provider: "WHATSAPP", externalId: message.id } },
  });
  if (existingEvent?.processedAt) return;

  const event = existingEvent ?? await db.webhookEvent.create({
    data: {
      provider: "WHATSAPP",
      externalId: message.id,
      eventType: `MESSAGE_${(message.type ?? "UNKNOWN").toUpperCase()}`,
      payload: message as Prisma.InputJsonValue,
    },
  });

  try {
    const incomingText = extractText(message);
    const linkCode = incomingText ? extractArcatesLinkCode(incomingText) : null;
    const linkResult = linkCode
      ? await consumeChannelLinkCode(linkCode, "WHATSAPP", message.from)
      : null;
    const contact = await findOrCreateContact(message.from, profileName);
    const connection = await db.channelConnection.findUnique({
      where: { channel_externalIdentity: { channel: "WHATSAPP", externalIdentity: message.from } },
      select: { userId: true, verifiedAt: true, revokedAt: true },
    });
    const linkedUserId = connection?.verifiedAt && !connection.revokedAt ? connection.userId : null;
    const membership = linkedUserId ? await db.organizationMember.findFirst({
      where: { userId: linkedUserId },
      select: { organizationId: true },
    }) : null;

    const conversation = await db.conversation.upsert({
      where: { channel_externalId: { channel: "WHATSAPP", externalId: `whatsapp:${message.from}` } },
      update: {
        contactId: contact.id,
        organizationId: membership?.organizationId ?? undefined,
        status: "AI_ACTIVE",
      },
      create: {
        channel: "WHATSAPP",
        externalId: `whatsapp:${message.from}`,
        contactId: contact.id,
        organizationId: membership?.organizationId,
        status: "AI_ACTIVE",
      },
    });

    if (linkedUserId) {
      await db.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId: conversation.id, userId: linkedUserId } },
        update: { leftAt: null },
        create: { conversationId: conversation.id, userId: linkedUserId },
      });
    }

    await db.message.upsert({
      where: { conversationId_externalId: { conversationId: conversation.id, externalId: message.id } },
      update: {},
      create: {
        conversationId: conversation.id,
        externalId: message.id,
        role: "USER",
        content: incomingText ?? `[${message.type ?? "unsupported"} mesajı]`,
        metadata: { source: "WHATSAPP_WEBHOOK", type: message.type ?? "unknown" },
      },
    });

    const assistant = linkCode
      ? linkResult
        ? {
            text: "WhatsApp numaranız Arcates hesabınızla güvenli biçimde eşleştirildi. Bundan sonraki hesap ve proje sorgularında doğrulanmış kullanıcı bağlamı kullanılabilir.",
            source: "CHANNEL_LINK_VERIFIED",
            knowledgeTitles: [] as string[],
          }
        : {
            text: "Bağlantı kodu geçersiz, kullanılmış veya süresi dolmuş. Arcates müşteri panelinden yeni bir kod oluşturup tekrar gönderin.",
            source: "CHANNEL_LINK_REJECTED",
            knowledgeTitles: [] as string[],
          }
      : incomingText
        ? await generateAssistantReply({ message: incomingText, channel: "WHATSAPP", userId: linkedUserId })
        : {
            text: "Bu mesaj türünü şu anda otomatik olarak işleyemiyorum. Talebinizi metin olarak gönderirseniz çözüm kapsamını belirleyebilirim.",
            source: "UNSUPPORTED_MESSAGE_FALLBACK",
            knowledgeTitles: [] as string[],
          };

    let outboundMessageId: string | null = null;
    if (whatsappConfigured()) {
      outboundMessageId = await sendWhatsAppText({
        to: message.from,
        body: assistant.text,
        replyToMessageId: message.id,
      });
    }

    await db.message.create({
      data: {
        conversationId: conversation.id,
        externalId: outboundMessageId,
        role: "ASSISTANT",
        content: assistant.text,
        metadata: {
          source: assistant.source,
          knowledgeTitles: assistant.knowledgeTitles,
          delivery: outboundMessageId ? "SENT" : "NOT_CONFIGURED",
        },
      },
    });

    await db.webhookEvent.update({ where: { id: event.id }, data: { processedAt: new Date(), failedAt: null } });
  } catch (error) {
    await db.webhookEvent.update({ where: { id: event.id }, data: { failedAt: new Date() } });
    throw error;
  }
}

async function findOrCreateContact(phone: string, profileName?: string) {
  const existing = await db.contact.findFirst({ where: { phone } });
  if (existing) {
    return db.contact.update({
      where: { id: existing.id },
      data: profileName && profileName !== existing.name ? { name: profileName } : {},
    });
  }

  return db.contact.create({
    data: {
      name: profileName?.trim() || "WhatsApp kullanıcısı",
      phone,
      source: "WHATSAPP",
      consentAt: new Date(),
    },
  });
}

function extractText(message: WhatsAppMessage) {
  if (message.type === "text") return message.text?.body?.trim() || null;
  if (message.type === "button") return message.button?.text?.trim() || null;
  if (message.type === "interactive") {
    return message.interactive?.button_reply?.title?.trim()
      || message.interactive?.list_reply?.title?.trim()
      || null;
  }
  return null;
}

function isValidSignature(body: string, signature: string | null, secret: string) {
  if (!signature?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const actual = signature.slice("sha256=".length);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(actual, "utf8"));
}
