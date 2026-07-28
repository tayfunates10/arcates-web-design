import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { handleAccountChatAction } from "@/lib/chat/account-tools";
import { generateAssistantReply } from "@/lib/chat/engine";
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
    return NextResponse.json({ reply: assistant.text, persisted: false, source: assistant.source });
  }

  try {
    const user = await getCurrentUser();
    const cookieStore = await cookies();
    const existingGuestId = cookieStore.get(GUEST_COOKIE)?.value;
    const guestId = user ? null : existingGuestId ?? randomUUID();
    const externalId = user ? `web:user:${user.id}` : `web:guest:${guestId}`;

    const conversation = await db.conversation.upsert({
      where: { channel_externalId: { channel: "WEB", externalId } },
      update: { status: "AI_ACTIVE" },
      create: { channel: "WEB", externalId, status: "AI_ACTIVE" },
    });

    if (user) {
      await db.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId: conversation.id, userId: user.id } },
        update: { leftAt: null },
        create: { conversationId: conversation.id, userId: user.id },
      });
    }

    const assistant = user
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

    await db.$transaction([
      db.message.create({
        data: {
          conversationId: conversation.id,
          role: "USER",
          content: parsed.data.message,
          metadata: { source: "WEB_WIDGET" },
        },
      }),
      db.message.create({
        data: {
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: assistant.text,
          metadata: {
            source: assistant.source,
            knowledgeTitles: assistant.knowledgeTitles,
          },
        },
      }),
    ]);

    const response = NextResponse.json({
      reply: assistant.text,
      conversationId: conversation.id,
      persisted: true,
      source: assistant.source,
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
