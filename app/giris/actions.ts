"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth/session";
import { verifyPasswordWithFallback } from "@/lib/auth/password";
import { databaseConfigured, db } from "@/lib/db";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { firstValidationError, loginSchema } from "@/lib/validation";

function loginError(message: string, verificationRequired = false): never {
  const verify = verificationRequired ? "&verify=required" : "";
  redirect(`/giris?error=${encodeURIComponent(message)}${verify}`);
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) loginError(firstValidationError(parsed.error));
  if (!databaseConfigured()) loginError("Veritabanı bağlantısı henüz yapılandırılmadı.");

  const rateLimit = await consumeRateLimit({
    scope: "auth:login",
    limit: 8,
    windowMs: 15 * 60 * 1000,
    identity: parsed.data.email,
  });
  if (!rateLimit.allowed) loginError("Çok fazla giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin.");

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const passwordValid = await verifyPasswordWithFallback(parsed.data.password, user?.passwordHash);

  if (!user || !passwordValid) {
    loginError("E-posta adresi veya parola hatalı.");
  }

  if (!user.emailVerifiedAt) {
    loginError("Hesabınıza giriş yapmadan önce e-posta adresinizi doğrulamalısınız.", true);
  }

  await createSession(user.id);
  await db.auditLog.create({
    data: {
      actorId: user.id,
      action: "AUTH_LOGIN",
      entityType: "User",
      entityId: user.id,
    },
  });

  redirect(["ADMIN", "OWNER", "STAFF"].includes(user.role) ? "/admin" : "/hesabim");
}
