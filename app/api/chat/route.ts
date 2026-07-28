import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { handleAccountChatAction } from "@/lib/chat/account-tools";
import { generateAssistantReply } from "@/lib/chat/engine";
import { handoffAcknowledgement, requestsHumanHandoff } from "@/lib/chat/handoff";
import { databaseConfigured, db } from "@/lib/db";
import { chatMessageSchema, firstValidationError } from "@/lib/validation";

const GUEST_COOKIE = "arcates_guest";
const GUEST_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstValidationError(parsed.error) }, { status: 422 });
  }

  if (!databaseConfigured()) {
    const assistant = await generateAssistantReply({ message: parsed.data.message, channel: "WEB" });
    return NextResponse.json({ reply: assistant.text, persisted: false, source: assistant.source, status: "AI_ACTIVE" });
  }

  try {
    const user = await getCurrentUser();
    const cookieStore = await cookies();
    const existingGuestId = cookieStore.get(GUEST_COOKIE)?.value;
    const guestId = user ? null : existingGuestId ?? randomUUID();
    const externalId = user ? `web:user:${user.id}` : `web:guest:${guestId}`;

    let conversation = await db.conversation.upsert({
      where: { channel_externalId: { channel: "WEB", externalId } },
      update: {},
      create: { channel: "WEB", externalId, status: "AI_ACTIVE" },
    });

    if (conversation.status === "CLOSED") {
      conversation = await db.conversation.update({
        where: { id: conversation.id },
        data: { status: "AI_ACTIVE", closedAt: null, assignedUserId: null },
      });
    }

    if (user) {
      await db.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId: conversation.id, userId: user.id } },
        update: { leftAt: null },
        create: { conversationId: conversation.id, userId: user.id },
      });
    }

    let assistant: { text: string; source: string; knowledgeTitles: string[] } | null = null;
    let finalStatus = conversation.status;

    if (conversation.status === "AI_ACTIVE" && requestsHumanHandoff(parsed.data.message)) {
      const updated = await db.conversation.update({
        where: { id: conversation.id },
        data: { status: "WAITING", assignedUserId: null, closedAt: null },
      });
      finalStatus = updated.status;
      assistant = handoffAcknowledgement();
    } else if (conversation.status === "AI_ACTIVE") {
      assistant = user
        ? await handleAccountChatAction({
            message: parsed.data.message,
            userId: user.id,
            conversationId: conversation.id,
          }) ?? await generateAssistantReply({
            message: parsed.data.message,
            channel: "WEB",
            userId: user.id,
          })
        : await generateAssistantReply({
            message: parsed.data.message,
            channel: "WEB",
          });
    }

    const writes = [
      db.message.create({
        data: {
          conversationId: conversation.id,
          role: "USER" as const,
          content: parsed.data.message,
          metadata: { source: "WEB_WIDGET" },
        },
      }),
    ];

    if (assistant) {
      writes.push(db.message.create({
        data: {
          conversationId: conversation.id,
          role: "ASSISTANT" as const,
          content: assistant.text,
          metadata: {
            source: assistant.source,
            knowledgeTitles: assistant.knowledgeTitles,
          },
        },
      }));
    }

    await db.$transaction(writes);

    const response = NextResponse.json({
      reply: assistant?.text ?? null,
      conversationId: conversation.id,
      persisted: true,
      source: assistant?.source ?? "HUMAN_CONVERSATION_PENDING",
      status: finalStatus,
      waiting: finalStatus === "WAITING",
      humanActive: finalStatus === "HUMAN_ACTIVE",
    });

    if (guestId && !existingGuestId) {
      response.cookies.set(GUEST_COOKIE, guestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: GUEST_MAX_AGE_SECONDS,
      });
    }

    return response;
  } catch (error) {
    console.error("Chat request failed", error);
    return NextResponse.json({ error: "Sohbet isteği şu anda işlenemedi." }, { status: 500 });
  }
}
