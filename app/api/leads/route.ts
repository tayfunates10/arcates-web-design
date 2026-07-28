import { NextResponse } from "next/server";
import { databaseConfigured, db } from "@/lib/db";
import { firstValidationError, leadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!databaseConfigured()) {
    return NextResponse.json({ error: "Teklif kayıt sistemi henüz yapılandırılmadı." }, { status: 503 });
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
  }, { status: 201 });
}
