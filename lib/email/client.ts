import "server-only";

import { createHash } from "node:crypto";

export type TransactionalEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  idempotencySource: string;
};

export function emailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim()
    && process.env.EMAIL_FROM?.trim()
    && process.env.NEXT_PUBLIC_SITE_URL?.trim(),
  );
}

export async function sendTransactionalEmail(email: TransactionalEmail) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const replyTo = process.env.EMAIL_REPLY_TO?.trim();

  if (!apiKey || !from) {
    return { delivered: false as const, reason: "NOT_CONFIGURED" as const };
  }

  const idempotencyKey = createHash("sha256")
    .update(`arcates:${email.idempotencySource}`)
    .digest("hex");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      signal: AbortSignal.timeout(12_000),
    });

    const payload = await response.json().catch(() => null) as { id?: string; message?: string } | null;
    if (!response.ok || !payload?.id) {
      return {
        delivered: false as const,
        reason: "PROVIDER_ERROR" as const,
        status: response.status,
        message: payload?.message?.slice(0, 500) ?? "E-posta sağlayıcısı isteği reddetti.",
      };
    }

    return { delivered: true as const, providerId: payload.id };
  } catch (error) {
    return {
      delivered: false as const,
      reason: "NETWORK_ERROR" as const,
      message: error instanceof Error ? error.message.slice(0, 500) : "Bilinmeyen ağ hatası",
    };
  }
}

export function escapeEmailHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
