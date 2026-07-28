"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { databaseConfigured, db } from "@/lib/db";
import { firstValidationError, loginSchema } from "@/lib/validation";

function loginError(message: string): never {
  redirect(`/giris?error=${encodeURIComponent(message)}`);
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) loginError(firstValidationError(parsed.error));
  if (!databaseConfigured()) loginError("Veritabanı bağlantısı henüz yapılandırılmadı.");

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const passwordValid = user?.passwordHash
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : false;

  if (!user || !passwordValid) {
    loginError("E-posta adresi veya parola hatalı.");
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
