import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createChannelLinkCode } from "@/lib/channels/link-code";
import { databaseConfigured, db } from "@/lib/db";

export async function GET() {
  if (!databaseConfigured()) {
    return NextResponse.json({ error: "Veritabanı bağlantısı yapılandırılmadı." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Bu işlem için giriş yapmalısınız." }, { status: 401 });

  const connection = await db.channelConnection.findFirst({
    where: {
      userId: user.id,
      channel: "WHATSAPP",
      verifiedAt: { not: null },
      revokedAt: null,
    },
    select: { externalIdentity: true, verifiedAt: true },
  });

  return NextResponse.json({
    connected: Boolean(connection),
    phone: connection ? maskPhone(connection.externalIdentity) : null,
    verifiedAt: connection?.verifiedAt ?? null,
  });
}

export async function POST() {
  if (!databaseConfigured()) {
    return NextResponse.json({ error: "Veritabanı bağlantısı yapılandırılmadı." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Bu işlem için giriş yapmalısınız." }, { status: 401 });

  const activeConnection = await db.channelConnection.findFirst({
    where: { userId: user.id, channel: "WHATSAPP", verifiedAt: { not: null }, revokedAt: null },
    select: { id: true },
  });

  if (activeConnection) {
    return NextResponse.json({ error: "Hesabınız zaten bir WhatsApp numarasıyla bağlı." }, { status: 409 });
  }

  const linkCode = await createChannelLinkCode(user.id, "WHATSAPP");
  return NextResponse.json({
    code: linkCode.code,
    expiresAt: linkCode.expiresAt,
    instruction: `${linkCode.code} kodunu Arcates WhatsApp hattına metin olarak gönderin.`,
  }, { status: 201 });
}

export async function DELETE() {
  if (!databaseConfigured()) {
    return NextResponse.json({ error: "Veritabanı bağlantısı yapılandırılmadı." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Bu işlem için giriş yapmalısınız." }, { status: 401 });

  const result = await db.channelConnection.updateMany({
    where: { userId: user.id, channel: "WHATSAPP", revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await db.channelLinkCode.updateMany({
    where: { userId: user.id, channel: "WHATSAPP", consumedAt: null },
    data: { consumedAt: new Date() },
  });

  if (result.count) {
    await db.auditLog.create({
      data: {
        actorId: user.id,
        action: "CHANNEL_CONNECTION_REVOKE",
        entityType: "ChannelConnection",
        metadata: { channel: "WHATSAPP", revokedCount: result.count },
      },
    });
  }

  return NextResponse.json({ success: true, revoked: result.count });
}

function maskPhone(phone: string) {
  if (phone.length <= 6) return phone;
  return `${phone.slice(0, 3)}${"*".repeat(Math.max(3, phone.length - 6))}${phone.slice(-3)}`;
}
