import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { databaseConfigured, db } from "@/lib/db";

const GUEST_COOKIE = "arcates_guest";

export async function GET() {
  if (!databaseConfigured()) {
    return NextResponse.json({ messages: [], status: "AI_ACTIVE", configured: false });
  }

  const user = await getCurrentUser();
  const guestId = user ? null : (await cookies()).get(GUEST_COOKIE)?.value;
  if (!user && !guestId) {
    return NextResponse.json({ messages: [], status: "AI_ACTIVE", configured: true });
  }

  const externalId = user ? `web:user:${user.id}` : `web:guest:${guestId}`;
  const conversation = await db.conversation.findUnique({
    where: { channel_externalId: { channel: "WEB", externalId } },
    select: {
      id: true,
      status: true,
      assignedUserId: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, role: true, content: true, createdAt: true, metadata: true },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ messages: [], status: "AI_ACTIVE", configured: true });
  }

  return NextResponse.json({
    conversationId: conversation.id,
    status: conversation.status,
    humanActive: conversation.status === "HUMAN_ACTIVE",
    waiting: conversation.status === "WAITING",
    assigned: Boolean(conversation.assignedUserId),
    messages: conversation.messages.reverse().map((message) => ({
      id: message.id,
      role: message.role === "USER" ? "user" : "assistant",
      content: message.content,
      createdAt: message.createdAt,
      source: readSource(message.metadata),
    })),
  });
}

function readSource(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const source = (metadata as Record<string, unknown>).source;
  return typeof source === "string" ? source : null;
}
