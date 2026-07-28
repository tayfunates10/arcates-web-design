import "server-only";

import type { KnowledgeVisibility } from "@prisma/client";
import { databaseConfigured, db } from "@/lib/db";

type AssistantRequest = {
  message: string;
  channel: "WEB" | "WHATSAPP";
  userId?: string | null;
  projectId?: string | null;
};

type KnowledgeItem = {
  title: string;
  content: string;
};

export async function generateAssistantReply(request: AssistantRequest) {
  const context = await findRelevantKnowledge(request);
  const aiReply = await requestOpenAI(request, context);
  return {
    text: aiReply ?? buildFallbackReply(request.message),
    source: aiReply ? "OPENAI_RESPONSES" : "RULE_ENGINE",
    knowledgeTitles: context.map((item) => item.title),
  };
}

async function findRelevantKnowledge(request: AssistantRequest): Promise<KnowledgeItem[]> {
  if (!databaseConfigured()) return [];

  const visibility: KnowledgeVisibility[] = request.userId
    ? ["PUBLIC", "CUSTOMER"]
    : ["PUBLIC"];

  const documents = await db.knowledgeDocument.findMany({
    where: {
      visibility: { in: visibility },
      OR: request.projectId ? [{ projectId: null }, { projectId: request.projectId }] : [{ projectId: null }],
    },
    select: { title: true, content: true },
    orderBy: { updatedAt: "desc" },
    take: 40,
  });

  const terms = normalize(request.message).split(" ").filter((term) => term.length >= 3);
  return documents
    .map((document) => ({
      ...document,
      score: terms.reduce((score, term) => score + countOccurrences(normalize(`${document.title} ${document.content}`), term), 0),
    }))
    .filter((document) => document.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map(({ title, content }) => ({ title, content: content.slice(0, 2_500) }));
}

async function requestOpenAI(request: AssistantRequest, context: KnowledgeItem[]) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim();
  if (!apiKey || !model) return null;

  const contextText = context.length
    ? context.map((item, index) => `[Kaynak ${index + 1}: ${item.title}]\n${item.content}`).join("\n\n")
    : "Bu soru için doğrulanmış bilgi tabanı kaydı bulunamadı.";

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: 500,
        instructions: [
          "Sen Arcates web çözümleri asistanısın.",
          "Türkçe, açık ve profesyonel yanıt ver.",
          "Yalnızca verilen bilgi tabanı ve kullanıcının mesajından çıkarılabilen bilgilere dayan.",
          "Fiyat, teslim tarihi, proje durumu veya hesap bilgisi uydurma.",
          "Bilgi eksikse bunu açıkça söyle ve gerekli tek sonraki bilgiyi sor.",
          "Hesapta değişiklik yaptığını veya destek kaydı oluşturduğunu söyleme; bu işlemler ayrı doğrulanmış araçlar gerektirir.",
          `Kanal: ${request.channel}`,
          `Doğrulanmış bilgi tabanı:\n${contextText}`,
        ].join("\n"),
        input: request.message,
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      console.error("OpenAI response failed", response.status, await response.text());
      return null;
    }

    const data = await response.json() as {
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };
    const text = data.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text" && item.text)
      .map((item) => item.text?.trim())
      .filter(Boolean)
      .join("\n");

    return text || null;
  } catch (error) {
    console.error("OpenAI request error", error);
    return null;
  }
}

function normalize(value: string) {
  return value.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9çğıöşü\s]/g, " ").replace(/\s+/g, " ").trim();
}

function countOccurrences(value: string, term: string) {
  let count = 0;
  let position = value.indexOf(term);
  while (position !== -1) {
    count += 1;
    position = value.indexOf(term, position + term.length);
  }
  return count;
}

export function buildFallbackReply(message: string) {
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
