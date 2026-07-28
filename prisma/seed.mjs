import { randomBytes, scrypt } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });
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

const cmsDocuments = [
  {
    slug: "kurumsal-web-sitesi-planlama",
    title: "Kurumsal web sitesi nasıl planlanır?",
    content: "Başarılı bir kurumsal web sitesi yalnızca sayfa ve görsellerden oluşmaz. İş hedefi, hedef müşteri, içerik mimarisi, dönüşüm noktaları ve teknik kalite aynı planda ele alınmalıdır.\n\n## Hedefi ve başarı ölçütünü belirleyin\n\nSitenin hangi kullanıcıya hangi değeri sunacağı ve başarının form, arama, satış ya da destek metriğiyle nasıl ölçüleceği başlangıçta tanımlanmalıdır.\n\n## İçerik mimarisini kullanıcı niyetine göre kurun\n\nHizmet sayfaları, vaka çalışmaları ve iletişim noktaları kullanıcının karar sırasını takip etmelidir.\n\n## Teknik kaliteyi başlangıca taşıyın\n\nSemantik HTML, mobil performans, erişilebilirlik, güvenlik başlıkları ve ölçüm sistemi sonradan eklenen işler değil temel gereksinimlerdir.",
    metadata: { cms: { kind: "BLOG", status: "PUBLISHED", category: "Web Tasarım", excerpt: "Amaç, içerik, kullanıcı akışı, teknik altyapı ve ölçüm sistemini tek planda birleştirme rehberi.", readingTime: "8 dakika", seoTitle: "Kurumsal Web Sitesi Planlama Rehberi", seoDescription: "Kurumsal web sitesi hedefi, içerik mimarisi, performans ve ölçüm planını adım adım oluşturun.", publishedAt: new Date().toISOString() } },
  },
  {
    slug: "web-sitesine-yapay-zeka-chatbot-ekleme",
    title: "Web sitesine güvenilir yapay zekâ chatbot nasıl eklenir?",
    content: "Güvenilir bir chatbot yalnızca modele soru gönderen bir pencere değildir. Doğrulanmış bilgi tabanı, kullanıcı kimliği, yetki kuralları, açık işlem onayı ve insan temsilci aktarımı birlikte tasarlanmalıdır.\n\n## Bilgi kaynağını sınırlandırın\n\nModel yalnızca erişim düzeyine uygun ve güncel kaynakları kullanmalı; fiyat, tarih veya hesap verisi uydurmamalıdır.\n\n## Okuma ve değiştirme araçlarını ayırın\n\nProje durumu okumak ile destek kaydı oluşturmak aynı yetki düzeyinde değildir. Değişiklik yapan araçlar açık kullanıcı onayı istemelidir.\n\n## İnsan desteğini gerçek bir durum olarak yönetin\n\nTemsilci görüşmeyi devraldığında AI otomatik yanıt vermeyi bırakmalı ve kanal durumu veritabanında korunmalıdır.",
    metadata: { cms: { kind: "BLOG", status: "PUBLISHED", category: "Yapay Zekâ", excerpt: "Bilgi tabanı, yetkilendirme, insan aktarımı ve kanal bağımsız konuşma mimarisinin temelleri.", readingTime: "11 dakika", seoTitle: "Güvenilir Yapay Zekâ Chatbot Mimarisi", seoDescription: "RAG, yetkilendirme, işlem onayı ve insan aktarımıyla güvenilir chatbot altyapısını planlayın.", publishedAt: new Date().toISOString() } },
  },
  {
    slug: "core-web-vitals-iyilestirme",
    title: "Core Web Vitals değerleri nasıl iyileştirilir?",
    content: "Core Web Vitals, gerçek kullanıcının yükleme hızı, etkileşim gecikmesi ve görsel kararlılık deneyimini ölçer. İyileştirme tek bir eklentiyle değil, sayfa üretim biçimi ve kaynak bütçesiyle yapılır.\n\n## Sunucu tarafı içeriği öne çıkarın\n\nKritik metin ve navigasyonun istemci JavaScript'i beklemeden üretilmesi ilk görüntüyü hızlandırır.\n\n## Görsel ve font bütçesi belirleyin\n\nDoğru boyutlandırma, modern formatlar ve gereksiz font ağırlıklarının kaldırılması LCP ve CLS değerlerini doğrudan etkiler.\n\n## Etkileşim kodunu küçültün\n\nHer bileşeni istemci tarafına taşımak yerine yalnızca gerçekten etkileşim gerektiren alanlarda JavaScript kullanılmalıdır.",
    metadata: { cms: { kind: "BLOG", status: "PUBLISHED", category: "Performans", excerpt: "Gerçek kullanıcı deneyimini etkileyen yükleme, etkileşim ve görsel kararlılık sorunları.", readingTime: "9 dakika", seoTitle: "Core Web Vitals İyileştirme Rehberi", seoDescription: "LCP, INP ve CLS değerlerini mimari, görsel ve JavaScript optimizasyonlarıyla iyileştirin.", publishedAt: new Date().toISOString() } },
  },
  {
    slug: "arcates-platformu",
    title: "Arcates Web Platformu",
    content: "Next.js sunucu bileşenleri, PostgreSQL veri modeli, güvenli oturumlar, müşteri operasyonları, içerik yönetimi ve web/WhatsApp konuşma motoru aynı uygulama sınırlarında modüler olarak tasarlandı.",
    metadata: { cms: { kind: "CASE_STUDY", status: "PUBLISHED", category: "Web Platformu ve Yapay Zekâ", excerpt: "Kurumsal siteyi müşteri, içerik, destek ve çok kanallı sohbet operasyonlarıyla birleştiren platform.", problem: "Tanıtım sitesi, müşteri takibi, destek kayıtları ve chatbot görüşmeleri farklı araçlarda parçalı yürütülüyordu.", solution: "Kimlik, kuruluş, proje, destek, içerik ve konuşma modelleri ortak PostgreSQL veri katmanında birleştirildi.", technical: "Next.js App Router, TypeScript, Prisma, PostgreSQL, güvenli opak oturumlar, rol tabanlı yetki, OpenAI adaptörü ve WhatsApp Cloud API webhook mimarisi kullanıldı.", result: "Tek uygulamada yönetilebilir içerik, müşteri paneli, operasyon merkezi ve doğrulanabilir çok kanallı destek altyapısı oluşturuldu.", metrics: ["Tek veri modeli", "Web ve WhatsApp", "Rol kontrollü operasyon"], seoTitle: "Arcates Web Platformu Vaka Çalışması", seoDescription: "Arcates kurumsal web, müşteri operasyonu, CMS ve yapay zekâ kanallarını tek platformda nasıl birleştirdi?", publishedAt: new Date().toISOString() } },
  },
  ...[
    ["faq-hazir-tema", "Arcates hazır tema mı kullanır?", "Projenin hedeflerine göre özgün arayüz ve modüler bileşen sistemi oluşturulur. Hazır çözümler yalnızca teknik ve ticari açıdan gerçekten uygun olduğunda değerlendirilir."],
    ["faq-icerik-yonetimi", "Web sitesi içerikleri yönetilebilir mi?", "Evet. Blog, vaka çalışmaları, SSS, SEO alanları ve bilgi tabanı yetkili kullanıcılar tarafından yönetilebilir."],
    ["faq-chatbot-giris", "Chatbot giriş yapmadan çalışır mı?", "Ziyaretçi modunda hizmet yönlendirme ve genel bilgi işlevleri çalışır. Hesap işlemleri ve özel proje verileri için güvenli oturum gerekir."],
    ["faq-web-whatsapp", "Web ve WhatsApp sohbetleri birleşebilir mi?", "Evet. İki kanal ortak konuşma motorunu kullanır. WhatsApp hesabı tek kullanımlık bağlantı koduyla doğrulanır."],
  ].map(([slug, title, content], index) => ({ slug, title, content, metadata: { cms: { kind: "FAQ", status: "PUBLISHED", sortOrder: index, publishedAt: new Date().toISOString() } } })),
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

  if (!email || !password) throw new Error("ARCATES_OWNER_EMAIL ve ARCATES_OWNER_PASSWORD ortam değişkenleri zorunludur.");
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
      update: { title: document.title, content: document.content, visibility: document.visibility, metadata: { source: "SYSTEM_SEED", reviewed: true } },
      create: { ...document, metadata: { source: "SYSTEM_SEED", reviewed: true } },
    });
  }

  for (const document of cmsDocuments) {
    await prisma.knowledgeDocument.upsert({
      where: { slug: document.slug },
      update: { title: document.title, content: document.content, visibility: "PUBLIC", metadata: document.metadata },
      create: { ...document, visibility: "PUBLIC" },
    });
  }

  console.log(`Arcates owner hesabı hazır: ${owner.email}`);
  console.log(`${knowledgeDocuments.length} doğrulanmış bilgi belgesi hazır.`);
  console.log(`${cmsDocuments.length} CMS içeriği hazır.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
