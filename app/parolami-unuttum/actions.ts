"use server";

import { redirect } from "next/navigation";
import { sendPasswordResetEmail } from "@/lib/auth/email-flows";
import { databaseConfigured, db } from "@/lib/db";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { emailRequestSchema } from "@/lib/validation";

export async function requestPasswordResetAction(formData: FormData) {
  const parsed = emailRequestSchema.safeParse({ email: formData.get("email") });

  if (parsed.success && databaseConfigured()) {
    const rateLimit = await consumeRateLimit({
      scope: "auth:password-reset-request",
      limit: 3,
      windowMs: 60 * 60 * 1000,
      identity: parsed.data.email,
    });

    if (rateLimit.allowed) {
      const user = await db.user.findUnique({ where: { email: parsed.data.email } });
      if (user?.passwordHash) await sendPasswordResetEmail(user);
    }
  }

  redirect("/parolami-unuttum?sent=1");
}
