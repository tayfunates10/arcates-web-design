import "server-only";

import { createHash } from "node:crypto";
import { databaseConfigured, db } from "@/lib/db";
import { getHashedRequestIdentity } from "@/lib/security/request";

type RateLimitOptions = {
  scope: string;
  limit: number;
  windowMs: number;
  identity?: string | null;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: Date;
};

export async function consumeRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStartMs = Math.floor(now / options.windowMs) * options.windowMs;
  const windowStart = new Date(windowStartMs);
  const resetAt = new Date(windowStartMs + options.windowMs);
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt.getTime() - now) / 1000));

  if (!databaseConfigured()) {
    return {
      allowed: process.env.NODE_ENV !== "production",
      limit: options.limit,
      remaining: process.env.NODE_ENV !== "production" ? options.limit : 0,
      retryAfterSeconds,
      resetAt,
    };
  }

  const rawIdentity = options.identity?.trim() || await getHashedRequestIdentity(options.scope);
  const pepper = process.env.RATE_LIMIT_SECRET?.trim() || "arcates-rate-limit-v1";
  const identityHash = createHash("sha256").update(`${pepper}:${options.scope}:${rawIdentity}`).digest("hex");

  const bucket = await db.rateLimitBucket.upsert({
    where: {
      identityHash_scope_windowStart: {
        identityHash,
        scope: options.scope,
        windowStart,
      },
    },
    update: {
      count: { increment: 1 },
      expiresAt: resetAt,
    },
    create: {
      identityHash,
      scope: options.scope,
      windowStart,
      count: 1,
      expiresAt: resetAt,
    },
  });

  if (Math.random() < 0.01) {
    await db.rateLimitBucket.deleteMany({ where: { expiresAt: { lt: new Date(now - 60_000) } } });
  }

  return {
    allowed: bucket.count <= options.limit,
    limit: options.limit,
    remaining: Math.max(0, options.limit - bucket.count),
    retryAfterSeconds,
    resetAt,
  };
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "Retry-After": String(result.retryAfterSeconds),
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.resetAt.getTime() / 1000)),
  };
}
