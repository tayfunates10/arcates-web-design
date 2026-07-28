import "server-only";

import type { User } from "@prisma/client";
import { issueAuthToken } from "@/lib/auth/token-store";
import { db } from "@/lib/db";
import { escapeEmailHtml, sendTransactionalEmail } from "@/lib/email/client";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;

function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) throw new Error("NEXT_PUBLIC_SITE_URL e-posta bağlantıları için zorunludur.");
  return configured.replace(/\/$/, "");
}

function emailFrame(content: string) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#07111f;color:#f5f8fc;font-family:Arial,sans-serif"><div style="max-width:620px;margin:0 auto;padding:40px 24px"><div style="font-size:22px;font-weight:700;letter-spacing:.03em">Arcates</div><div style="margin-top:24px;padding:30px;border:1px solid #263850;border-radius:18px;background:#0d1929">${content}</div><p style="margin-top:20px;color:#8fa1b7;font-size:12px;line-height:1.6">Bu e-posta Arcates hesap güvenliği işlemi için otomatik oluşturuldu. Talebi siz başlatmadıysanız bağlantıyı kullanmayın.</p></div></body></html>`;
}

async function logDelivery(userId: string, action: string, delivered: boolean, providerId?: string, reason?: string) {
  await db.auditLog.create({
    data: {
      actorId: userId,
      action,
      entityType: "User",
      entityId: userId,
      metadata: { delivered, providerId: providerId ?? null, reason: reason ?? null },
    },
  });
}

export async function sendVerificationEmail(user: Pick<User, "id" | "name" | "email">) {
  const { token, expiresAt } = await issueAuthToken(user.id, "VERIFY_EMAIL", VERIFY_TTL_MS);
  const link = `${siteUrl()}/eposta-dogrula?token=${encodeURIComponent(token)}`;
  const safeName = escapeEmailHtml(user.name);
  const safeLink = escapeEmailHtml(link);

  const result = await sendTransactionalEmail({
    to: user.email,
    subject: "Arcates e-posta adresinizi doğrulayın",
    text: `Merhaba ${user.name}, Arcates hesabınızı doğrulamak için bağlantıyı açın: ${link}\n\nBağlantı 24 saat geçerlidir.`,
    html: emailFrame(`<p style="margin:0 0 16px;font-size:18px">Merhaba ${safeName},</p><p style="color:#b9c6d6;line-height:1.7">Arcates hesabınızı etkinleştirmek için e-posta adresinizi doğrulayın.</p><p style="margin:26px 0"><a href="${safeLink}" style="display:inline-block;padding:13px 20px;border-radius:10px;background:#1d8cff;color:#fff;text-decoration:none;font-weight:700">E-posta Adresimi Doğrula</a></p><p style="color:#8fa1b7;font-size:13px">Bağlantı 24 saat geçerlidir.</p>`),
    idempotencySource: `verify:${user.id}:${token}`,
  });

  await logDelivery(user.id, result.delivered ? "EMAIL_VERIFICATION_SENT" : "EMAIL_VERIFICATION_DELIVERY_FAILED", result.delivered, result.delivered ? result.providerId : undefined, result.delivered ? undefined : result.reason);

  if (!result.delivered && process.env.NODE_ENV !== "production") {
    console.info(`[Arcates development verification link] ${link}`);
  }

  return { ...result, expiresAt };
}

export async function sendPasswordResetEmail(user: Pick<User, "id" | "name" | "email">) {
  const { token, expiresAt } = await issueAuthToken(user.id, "RESET_PASSWORD", RESET_TTL_MS);
  const link = `${siteUrl()}/parola-sifirla?token=${encodeURIComponent(token)}`;
  const safeName = escapeEmailHtml(user.name);
  const safeLink = escapeEmailHtml(link);

  const result = await sendTransactionalEmail({
    to: user.email,
    subject: "Arcates parola sıfırlama bağlantısı",
    text: `Merhaba ${user.name}, Arcates parolanızı sıfırlamak için bağlantıyı açın: ${link}\n\nBağlantı 30 dakika geçerlidir.`,
    html: emailFrame(`<p style="margin:0 0 16px;font-size:18px">Merhaba ${safeName},</p><p style="color:#b9c6d6;line-height:1.7">Arcates hesabınız için parola sıfırlama talebi aldık.</p><p style="margin:26px 0"><a href="${safeLink}" style="display:inline-block;padding:13px 20px;border-radius:10px;background:#1d8cff;color:#fff;text-decoration:none;font-weight:700">Parolamı Sıfırla</a></p><p style="color:#8fa1b7;font-size:13px">Bağlantı 30 dakika geçerlidir ve yalnızca bir kez kullanılabilir.</p>`),
    idempotencySource: `reset:${user.id}:${token}`,
  });

  await logDelivery(user.id, result.delivered ? "PASSWORD_RESET_EMAIL_SENT" : "PASSWORD_RESET_EMAIL_DELIVERY_FAILED", result.delivered, result.delivered ? result.providerId : undefined, result.delivered ? undefined : result.reason);

  if (!result.delivered && process.env.NODE_ENV !== "production") {
    console.info(`[Arcates development password reset link] ${link}`);
  }

  return { ...result, expiresAt };
}
