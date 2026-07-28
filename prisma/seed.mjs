import { randomBytes, scrypt } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const KEY_LENGTH = 64;

const knowledgeDocuments = [
  {
    slug: "arcates-web-cozumleri",
    title: "Arcates web çözümleri",
    visibility: "PUBLIC",
    content: "Arcates; kurumsal web sitesi, e-ticaret sistemi, özel web yazılımı, SaaS geliştirme, yapay zekâ ve chatbot, iş otomasyonu, UI/UX tasarımı, SEO ve performans ile bakım ve teknik destek çözümleri sunar. Uygun çözüm, işletmenin hedefi, mevcut sistemi, kullanıcı rolleri, entegrasyon ihtiyacı ve teslim kriterleri analiz edilerek belirlenir. Kesin kapsam ve fiyat, ihtiyaç analizi yapılmadan verilmez.",
  },
  {
    slug: "arcates-proje-sureci",
    title: "Arcates proje süreci",
    visibility: "PUBLIC",
    content: "Arcates projeleri keşif ve ihtiyaç analizi, teknik planlama, kullanıcı deneyimi ve arayüz tasarımı, yazılım geliştirme, test ve optimizasyon, yayın ve izleme, bakım ve destek aşamalarından oluşur. Her aşamada ölçülebilir teslim kriterleri belirlenir. Teslim tarihi ve maliyet, proje kapsamı doğrulanmadan kesinleştirilmez.",
  },
  {
    slug: "arcates-chatbot-guvenligi",
    title: "Chatbot güvenlik ve yetki kuralları",
    visibility: "PUBLIC",
    content: "Arcates chatbotu genel ziyaretçilere hizmetleri, süreçleri ve doğrulanmış genel bilgileri açıklar. Proje durumu, destek kaydı, belge, teklif veya hesap bilgisi gibi özel veriler yalnızca güvenli giriş veya doğrulanmış kanal bağlantısı sonrasında kullanılabilir. Değişiklik yapan işlemler açık kullanıcı onayı ve sunucu tarafı yetkilendirme gerektirir. Chatbot doğrulanmamış fiyat, tarih veya işlem sonucu uydurmamalıdır.",
  },
  {
    slug: "arcates-destek-politikasi",
    title: "Arcates destek kaydı gereksinimleri",
    visibility: "CUSTOMER",
    content: "Destek taleplerinde gerçekleşen durum, beklenen sonuç, sorunu tekrar oluşturma adımları, etkilenen proje veya sayfa, kullanılan cihaz ve tarayıcı ile varsa hata mesajı belirtilmelidir. Destek talebi kullanıcı hesabına bağlanır, öncelik ve durum alanlarıyla izlenir. Acil öncelik yalnızca canlı sistemi veya kritik iş akışını durduran sorunlarda kullanılmalıdır.",
  },
];

function deriveKey(password, salt) {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const key = await deriveKey(password, salt);
  return `scrypt$16384$8$1$${salt}$${key.toString("base64url")}`;
}

async function main() {
  const email = process.env.ARCATES_OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.ARCATES_OWNER_PASSWORD;
  const name = process.env.ARCATES_OWNER_NAME?.trim() || "Arcates Owner";

  if (!email || !password) {
    throw new Error("ARCATES_OWNER_EMAIL ve ARCATES_OWNER_PASSWORD ortam değişkenleri zorunludur.");
  }
  if (password.length < 12 || !/[a-zçğıöşü]/.test(password) || !/[A-ZÇĞİÖŞÜ]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error("Owner parolası en az 12 karakter, büyük harf, küçük harf ve sayı içermelidir.");
  }

  const passwordHash = await hashPassword(password);
  const owner = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "OWNER" },
    create: { name, email, passwordHash, role: "OWNER", emailVerifiedAt: new Date() },
  });

  for (const document of knowledgeDocuments) {
    await prisma.knowledgeDocument.upsert({
      where: { slug: document.slug },
      update: {
        title: document.title,
        content: document.content,
        visibility: document.visibility,
        metadata: { source: "SYSTEM_SEED", reviewed: true },
      },
      create: {
        ...document,
        metadata: { source: "SYSTEM_SEED", reviewed: true },
      },
    });
  }

  console.log(`Arcates owner hesabı hazır: ${owner.email}`);
  console.log(`${knowledgeDocuments.length} doğrulanmış bilgi belgesi hazır.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
