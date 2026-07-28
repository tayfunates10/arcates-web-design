"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { hashPassword } from "@/lib/auth/password";
import { sendVerificationEmail } from "@/lib/auth/email-flows";
import { databaseConfigured, db } from "@/lib/db";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { firstValidationError, registrationSchema } from "@/lib/validation";

function registrationError(message: string): never {
  redirect(`/kayit?error=${encodeURIComponent(message)}`);
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 54);
}

export async function registerAction(formData: FormData) {
  const parsed = registrationSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    password: formData.get("password"),
    consent: formData.get("consent"),
  });

  if (!parsed.success) registrationError(firstValidationError(parsed.error));
  if (!databaseConfigured()) registrationError("Veritabanı bağlantısı henüz yapılandırılmadı.");

  const rateLimit = await consumeRateLimit({
    scope: "auth:register",
    limit: 5,
    windowMs: 15 * 60 * 1000,
    identity: parsed.data.email,
  });
  if (!rateLimit.allowed) registrationError("Çok fazla kayıt denemesi yapıldı. Lütfen daha sonra tekrar deneyin.");

  const existingUser = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existingUser) registrationError("Bu e-posta adresiyle daha önce hesap oluşturulmuş.");

  const passwordHash = await hashPassword(parsed.data.password);
  const organizationSlug = `${slugify(parsed.data.company) || "musteri"}-${randomBytes(4).toString("hex")}`;

  const user = await db.$transaction(async (transaction) => {
    const createdUser = await transaction.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      },
    });

    const organization = await transaction.organization.create({
      data: {
        name: parsed.data.company,
        slug: organizationSlug,
        members: {
          create: {
            userId: createdUser.id,
            role: "CUSTOMER",
          },
        },
      },
    });

    await transaction.auditLog.create({
      data: {
        actorId: createdUser.id,
        action: "AUTH_REGISTER",
        entityType: "Organization",
        entityId: organization.id,
      },
    });

    return createdUser;
  });

  const delivery = await sendVerificationEmail(user);
  redirect(`/dogrulama-bekleniyor?delivery=${delivery.delivered ? "sent" : "pending"}`);
}
