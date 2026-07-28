import "server-only";

import { createHash, randomInt } from "node:crypto";
import type { ConversationChannel } from "@prisma/client";
import { db } from "@/lib/db";

const LINK_CODE_TTL_MS = 10 * 60 * 1000;

function normalizeCode(code: string) {
  return code.trim().toLocaleUpperCase("tr-TR").replace(/\s+/g, "");
}

function hashCode(code: string) {
  return createHash("sha256").update(normalizeCode(code)).digest("hex");
}

export async function createChannelLinkCode(userId: string, channel: ConversationChannel) {
  await db.channelLinkCode.updateMany({
    where: { userId, channel, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const code = `ARC-${randomInt(100_000, 1_000_000)}`;
  const expiresAt = new Date(Date.now() + LINK_CODE_TTL_MS);

  await db.channelLinkCode.create({
    data: {
      userId,
      channel,
      codeHash: hashCode(code),
      expiresAt,
    },
  });

  return { code, expiresAt };
}

export async function consumeChannelLinkCode(code: string, channel: ConversationChannel, externalIdentity: string) {
  const now = new Date();

  return db.$transaction(async (transaction) => {
    const linkCode = await transaction.channelLinkCode.findUnique({
      where: { codeHash: hashCode(code) },
    });

    if (!linkCode || linkCode.channel !== channel || linkCode.consumedAt || linkCode.expiresAt <= now) {
      return null;
    }

    await transaction.channelLinkCode.update({
      where: { id: linkCode.id },
      data: { consumedAt: now },
    });

    const connection = await transaction.channelConnection.upsert({
      where: { channel_externalIdentity: { channel, externalIdentity } },
      update: {
        userId: linkCode.userId,
        verifiedAt: now,
        revokedAt: null,
      },
      create: {
        userId: linkCode.userId,
        channel,
        externalIdentity,
        verifiedAt: now,
      },
    });

    await transaction.auditLog.create({
      data: {
        actorId: linkCode.userId,
        action: "CHANNEL_CONNECTION_VERIFY",
        entityType: "ChannelConnection",
        entityId: connection.id,
        metadata: { channel, externalIdentity },
      },
    });

    return { userId: linkCode.userId, connectionId: connection.id };
  });
}

export function extractArcatesLinkCode(message: string) {
  return message.toLocaleUpperCase("tr-TR").match(/\bARC-[0-9]{6}\b/)?.[0] ?? null;
}
