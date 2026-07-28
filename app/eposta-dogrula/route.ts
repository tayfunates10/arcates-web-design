import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { consumeAuthToken } from "@/lib/auth/token-store";
import { databaseConfigured } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();

  if (!databaseConfigured() || !token || token.length > 256) {
    return NextResponse.redirect(new URL("/giris?error=Doğrulama+bağlantısı+geçersiz+veya+süresi+dolmuş.", request.url), 303);
  }

  const userId = await consumeAuthToken(token, "VERIFY_EMAIL", async (transaction, user) => {
    await transaction.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
    });
    await transaction.auditLog.create({
      data: {
        actorId: user.id,
        action: "EMAIL_VERIFIED",
        entityType: "User",
        entityId: user.id,
      },
    });
    return user.id;
  });

  if (!userId) {
    return NextResponse.redirect(new URL("/giris?error=Doğrulama+bağlantısı+geçersiz+veya+süresi+dolmuş.", request.url), 303);
  }

  await createSession(userId);
  return NextResponse.redirect(new URL("/hesabim?verified=1", request.url), 303);
}
