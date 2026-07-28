"use server";

import { redirect } from "next/navigation";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { hashAuthToken } from "@/lib/auth/token-core";
import { consumeAuthToken } from "@/lib/auth/token-store";
import { databaseConfigured, db } from "@/lib/db";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { firstValidationError, passwordResetSchema } from "@/lib/validation";

function resetError(token: string, message: string): never {
  redirect(`/parola-sifirla?token=${encodeURIComponent(token)}&error=${encodeURIComponent(message)}`);
}

export async function resetPasswordAction(formData: FormData) {
  const rawToken = String(formData.get("token") ?? "").trim();
  const parsed = passwordResetSchema.safeParse({
    token: rawToken,
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!parsed.success) resetError(rawToken, firstValidationError(parsed.error));
  if (!databaseConfigured()) resetError(rawToken, "Parola sıfırlama sistemi henüz yapılandırılmadı.");

  const rateLimit = await consumeRateLimit({
    scope: "auth:password-reset-consume",
    limit: 6,
    windowMs: 30 * 60 * 1000,
    identity: hashAuthToken(parsed.data.token),
  });
  if (!rateLimit.allowed) resetError(rawToken, "Çok fazla sıfırlama denemesi yapıldı. Yeni bağlantı isteyin.");

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await consumeAuthToken(parsed.data.token, "RESET_PASSWORD");
  if (!user) resetError(rawToken, "Parola sıfırlama bağlantısı geçersiz, kullanılmış veya süresi dolmuş.");

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      },
    }),
    db.session.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    db.auditLog.create({
      data: {
        actorId: user.id,
        action: "PASSWORD_RESET_COMPLETED",
        entityType: "User",
        entityId: user.id,
      },
    }),
  ]);

  await createSession(user.id);
  redirect("/hesabim?password=reset");
}
