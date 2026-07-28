import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { databaseConfigured, db } from "@/lib/db";
import { consumeRateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { isTrustedBrowserRequest } from "@/lib/security/request";
import { firstValidationError, supportTicketSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isTrustedBrowserRequest(request)) {
    return NextResponse.json({ error: "İstek kaynağı doğrulanamadı." }, { status: 403 });
  }
  if (!databaseConfigured()) {
    return NextResponse.json({ error: "Destek kayıt sistemi henüz yapılandırılmadı." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Bu işlem için giriş yapmalısınız." }, { status: 401 });

  const rateLimit = await consumeRateLimit({
    scope: "support-create",
    limit: 10,
    windowMs: 15 * 60 * 1000,
    identity: user.id,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Kısa sürede çok fazla destek kaydı oluşturuldu. Daha sonra tekrar deneyin." },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const parsed = supportTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstValidationError(parsed.error) }, { status: 422 });
  }

  let organizationId: string | null = null;
  let projectId: string | null = null;

  const membership = await db.organizationMember.findFirst({
    where: { userId: user.id },
    select: { organizationId: true },
  });
  organizationId = membership?.organizationId ?? null;

  if (parsed.data.projectId) {
    const project = await db.project.findFirst({
      where: {
        id: parsed.data.projectId,
        members: { some: { userId: user.id } },
      },
      select: { id: true, organizationId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Bu projeye destek kaydı oluşturma yetkiniz yok." }, { status: 403 });
    }

    projectId = project.id;
    organizationId = project.organizationId;
  }

  const ticket = await db.supportTicket.create({
    data: {
      requesterId: user.id,
      organizationId,
      projectId,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: user.id,
      action: "SUPPORT_TICKET_CREATE",
      entityType: "SupportTicket",
      entityId: ticket.id,
    },
  });

  return NextResponse.json({
    success: true,
    reference: ticket.id,
    message: "Destek talebiniz oluşturuldu.",
  }, { status: 201, headers: rateLimitHeaders(rateLimit) });
}
