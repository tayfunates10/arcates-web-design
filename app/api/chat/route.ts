import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { databaseConfigured, db } from "@/lib/db";
import { chatMessageSchema, firstValidationError } from "@/lib/validation";

const GUEST_COOKIE = "arcates_guest";
const GUEST_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstValidationError(parsed.error) }, { status: 422 });
  }

  const reply = buildReply(parsed.data.message);
  if (!databaseConfigured()) return NextResponse.json({ reply, persisted: false });

  try {
    const user = await getCurrentUser();
    const cookieStore = await cookies();
    const existingGuestId = cookieStore.get(GUEST_COOKIE)?.value;
    const guestId = user ? null : existingGuestId ?? randomUUID();
    const externalId = user ? `web:user:${user.id}` : `web:guest:${guestId}`;

    const conversation = await db.conversation.upsert({
      where: { channel_externalId: { channel: "WEB", externalId } },
      update: { status: "AI_ACTIVE" },
      create: { channel: "WEB", externalId, status: "AI_ACTIVE" },
    });

    if (user) {
      await db.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId: conversation.id, userId: user.id } },
        update: { leftAt: null },
        create: { conversationId: conversation.id, userId: user.id },
      });
    }

    await db.$transaction([
      db.message.create({
        data: {
          conversationId: conversation.id,
          role: "USER",
          content: parsed.data.message,
          metadata: { source: "WEB_WIDGET" },
        },
      }),
      db.message.create({
        data: {
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: reply,
          metadata: { source: "RULE_ENGINE", version: 1 },
        },
      }),
    ]);

    const response = NextResponse.json({
      reply,
      conversationId: conversation.id,
      persisted: true,
    });

    if (guestId && !existingGuestId) {
      response.cookies.set(GUEST_COOKIE, guestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: GUEST_MAX_AGE_SECONDS,
      });
    }

    return response;
  } catch (error) {
    console.error("Chat persistence failed", error);
    return NextResponse.json({ reply, persisted: false });
  }
}

function buildReply(message: string) {
  const normalized = message.toLocaleLowerCase("tr-TR");

  if (/(chatbot|yapay zek|whatsapp|asistan)/.test(normalized)) {
    return "Size web ve WhatsApp kanallarında aynı bilgi tabanını kullanan bir chatbot altyapısı uygundur. İlk kapsam; ziyaretçi yönlendirmesi, teklif toplama, güvenli hesap eşleştirme, destek talebi ve insan temsilci aktarımını içermelidir. İşlem yapan araçlar giriş ve açık kullanıcı onayı gerektirir.";
  }
  if (/(e.?ticaret|ürün|satış|sipariş|ödeme)/.test(normalized)) {
    return "İhtiyacınız e-ticaret veya ürün kataloğu çözümüne yakın görünüyor. Ürün yönetimi, ödeme ve sipariş akışı, kargo bağlantıları, dönüşüm analitiği ve SEO kapsamını netleştirmeliyiz. Fiziksel ödeme mi, teklif toplama mı istediğinizi proje analizinde ayırırız.";
  }
  if (/(kurumsal|firma|şirket|web site|internet sitesi)/.test(normalized)) {
    return "Kurumsal web çözümü için marka mesajı, hizmet mimarisi, yönetim paneli, teknik SEO, mobil performans ve dönüşüm noktalarını birlikte planlamalıyız. Mevcut siteniz, hedef müşteriniz ve temel hizmetleriniz proje kapsamını belirler.";
  }
  if (/(özel yazılım|panel|crm|otomasyon|uygulama|saas)/.test(normalized)) {
    return "Bu ihtiyaç özel web yazılımı kapsamına giriyor. Kullanıcı rolleri, ana iş akışları, veri modeli, entegrasyonlar, raporlar ve doğrulama kuralları keşif aşamasında çıkarılmalıdır. Önce en kritik kullanıcı görevini ve bugün nasıl yürütüldüğünü tanımlayalım.";
  }
  if (/(seo|google|performans|hız|yavaş)/.test(normalized)) {
    return "SEO ve performans çalışmasını içerik, teknik taranabilirlik ve gerçek kullanıcı deneyimi olarak üç bölümde ele alırız. Core Web Vitals, sayfa mimarisi, semantik HTML, metadata, yapılandırılmış veri ve ölçüm sistemi birlikte incelenmelidir.";
  }
  if (/(fiyat|maliyet|bütçe|ücret|teklif)/.test(normalized)) {
    return "Net teklif; sayfa sayısı, özel özellikler, içerik hazırlığı, entegrasyonlar, kullanıcı rolleri ve bakım kapsamına göre oluşturulur. Önce ihtiyaçları kısa bir proje kapsamına dönüştürmek, eksik veya gereksiz kalemleri önler.";
  }

  return "Talebinizi web çözümü, özel yazılım, e-ticaret, yapay zekâ, otomasyon veya performans başlıklarından biriyle eşleştirebilirim. İşletmenizi, hedefinizi ve bugün kullandığınız yöntemi belirtirseniz daha net bir çözüm kapsamı oluşturabilirim.";
}
