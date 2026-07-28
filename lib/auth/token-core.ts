import { createHash, randomBytes } from "node:crypto";

export type AuthTokenKind = "VERIFY_EMAIL" | "RESET_PASSWORD";

export function generateAuthToken() {
  return randomBytes(32).toString("base64url");
}

export function hashAuthToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function authTokenEventType(kind: AuthTokenKind, userId: string) {
  return `${kind}:${userId}`;
}

export function parseAuthTokenPayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const record = payload as Record<string, unknown>;
  if (typeof record.userId !== "string" || typeof record.expiresAt !== "string") return null;
  const expiresAt = new Date(record.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) return null;
  return { userId: record.userId, expiresAt };
}
