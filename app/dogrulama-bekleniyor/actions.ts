"use server";

import { redirect } from "next/navigation";
import { sendVerificationEmail } from "@/lib/auth/email-flows";
import { databaseConfigured, db } from "@/lib/db";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { emailRequestSchema } from "@/lib/validation";

const GENERIC_MESSAGE = "Hesap doğrulanmamışsa yeni bağlantı e-posta adresine gönderildi.";

export async function resendVerificationAction(formData: FormData) {
  const parsed = emailRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success || !databaseConfigured()) {
    redirect(`/dogrulama-bekleniyor?message=${encodeURIComponent(GENERIC_MESSAGE)}`);
  }

  const rateLimit = await consumeRateLimit({
    scope: "auth:verification-resend",
    limit: 3,
    windowMs: 60 * 60 * 1000,
    identity: parsed.data.email,
  });

  if (rateLimit.allowed) {
    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (user && !user.emailVerifiedAt) await sendVerificationEmail(user);
  }

  redirect(`/dogrulama-bekleniyor?message=${encodeURIComponent(GENERIC_MESSAGE)}`);
}
