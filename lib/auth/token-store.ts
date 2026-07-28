import "server-only";

import { Prisma, type User } from "@prisma/client";
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
    db.webhookEvent.deleteMany({
      where: {
        provider: TOKEN_PROVIDER,
        createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        OR: [{ processedAt: { not: null } }, { failedAt: { not: null } }],
      },
    }),
  ]);

  return { token, expiresAt };
}

export async function consumeAuthToken<T>(
  token: string,
  kind: AuthTokenKind,
  onConsume: (transaction: Prisma.TransactionClient, user: User) => Promise<T>,
) {
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

    if (!record || record.processedAt || record.failedAt) return null;

    const payload = parseAuthTokenPayload(record.payload);
    if (
      !payload
      || record.eventType !== authTokenEventType(kind, payload.userId)
      || payload.expiresAt <= new Date()
    ) {
      await transaction.webhookEvent.update({
        where: { id: record.id },
        data: { failedAt: new Date() },
      });
      return null;
    }

    const user = await transaction.user.findUnique({ where: { id: payload.userId } });
    if (!user) return null;

    const consumed = await transaction.webhookEvent.updateMany({
      where: { id: record.id, processedAt: null, failedAt: null },
      data: { processedAt: new Date() },
    });
    if (consumed.count !== 1) return null;

    return onConsume(transaction, user);
  });
}
