import { NextResponse } from "next/server";
import { databaseConfigured, db } from "@/lib/db";
import { consumeRateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { isTrustedBrowserRequest } from "@/lib/security/request";
import { firstValidationError, leadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isTrustedBrowserRequest(request)) {
    return NextResponse.json({ error: "İstek kaynağı doğrulanamadı." }, { status: 403 });
  }
  if (!databaseConfigured()) {
    return NextResponse.json({ error: "Teklif kayıt sistemi henüz yapılandırılmadı." }, { status: 503 });
  }

  const rateLimit = await consumeRateLimit({ scope: "public-lead", limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Kısa sürede çok fazla proje talebi gönderildi. Daha sonra tekrar deneyin." },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstValidationError(parsed.error) }, { status: 422 });
  }

  const { name, company, email, phone, service, budget, description } = parsed.data;

  const lead = await db.$transaction(async (transaction) => {
    const contact = await transaction.contact.create({
      data: {
        name,
        company: company || null,
        email,
        phone: phone || null,
        source: "WEBSITE_QUOTE_FORM",
        consentAt: new Date(),
      },
    });

    return transaction.lead.create({
      data: {
        contactId: contact.id,
        title: `${service || "Web çözümü"} proje talebi`,
        description,
        service: service || null,
        budget: budget ?? null,
        source: "WEBSITE_QUOTE_FORM",
      },
    });
  });

  return NextResponse.json({
    success: true,
    reference: lead.id,
    message: "Proje talebiniz güvenli biçimde kaydedildi.",
  }, { status: 201, headers: rateLimitHeaders(rateLimit) });
}
