import "server-only";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  authTokenEventType,
  generateAuthToken,
  hashAuthToken,
  parseAuthTokenPayload,
  type AuthTokenKind,
} from "@/lib/auth/token-core";

const TOKEN_PROVIDER = "AUTH_TOKEN";

export async function issueAuthToken(userId: string, kind: AuthTokenKind, ttlMs: number) {
  const token = generateAuthToken();
  const tokenHash = hashAuthToken(token);
  const eventType = authTokenEventType(kind, userId);
  const expiresAt = new Date(Date.now() + ttlMs);

  await db.$transaction([
    db.webhookEvent.updateMany({
      where: {
        provider: TOKEN_PROVIDER,
        eventType,
        processedAt: null,
        failedAt: null,
      },
      data: { failedAt: new Date() },
    }),
    db.webhookEvent.create({
      data: {
        provider: TOKEN_PROVIDER,
        externalId: tokenHash,
        eventType,
        payload: { userId, expiresAt: expiresAt.toISOString() } satisfies Prisma.InputJsonValue,
      },
    }),
  ]);

  return { token, expiresAt };
}

export async function consumeAuthToken(token: string, kind: AuthTokenKind) {
  const tokenHash = hashAuthToken(token);

  return db.$transaction(async (transaction) => {
    const record = await transaction.webhookEvent.findUnique({
      where: {
        provider_externalId: {
          provider: TOKEN_PROVIDER,
          externalId: tokenHash,
        },
      },
    });

    if (!record || record.processedAt || record.failedAt || !record.eventType.startsWith(`${kind}:`)) return null;

    const payload = parseAuthTokenPayload(record.payload);
    if (!payload || payload.expiresAt <= new Date()) {
      await transaction.webhookEvent.update({
        where: { id: record.id },
        data: { failedAt: new Date() },
      });
      return null;
    }

    const consumed = await transaction.webhookEvent.updateMany({
      where: { id: record.id, processedAt: null, failedAt: null },
      data: { processedAt: new Date() },
    });
    if (consumed.count !== 1) return null;

    return transaction.user.findUnique({ where: { id: payload.userId } });
  });
}
