export type IconName =
  | "web"
  | "commerce"
  | "software"
  | "saas"
  | "ai"
  | "automation"
  | "design"
  | "performance"
  | "support";

export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  outcome: string;
  icon: IconName;
  features: string[];
};

export const services: Service[] = [
  {
    slug: "kurumsal-web-tasarim",
    title: "Kurumsal Web Tasarım",
    shortTitle: "Kurumsal Web",
    description: "Markanızı doğru anlatan, hızlı ve yönetilebilir kurumsal web deneyimleri.",
    outcome: "Güven oluşturan dijital vitrin ve ölçülebilir müşteri kazanımı.",
    icon: "web",
    features: ["Özgün arayüz", "İçerik yönetimi", "Teknik SEO", "Mobil öncelikli yapı"],
  },
  {
    slug: "e-ticaret-sistemleri",
    title: "E-Ticaret Sistemleri",
    shortTitle: "E-Ticaret",
    description: "Ürün, sipariş ve ödeme süreçlerini tek merkezde yöneten satış altyapıları.",
    outcome: "Daha az işlem yükü, daha yüksek dönüşüm ve ölçeklenebilir operasyon.",
    icon: "commerce",
    features: ["Ürün yönetimi", "Ödeme entegrasyonu", "Sipariş otomasyonu", "Dönüşüm analitiği"],
  },
  {
    slug: "ozel-web-yazilimlari",
    title: "Özel Web Yazılımları",
    shortTitle: "Özel Yazılım",
    description: "Hazır sistemlerin sınırlarını aşan, iş akışınıza göre geliştirilen uygulamalar.",
    outcome: "Tekrarlanan işleri azaltan ve işletmenize uyum sağlayan dijital sistem.",
    icon: "software",
    features: ["İhtiyaç analizi", "Modüler mimari", "API entegrasyonları", "Yetki yönetimi"],
  },
  {
    slug: "saas-gelistirme",
    title: "SaaS Ürün Geliştirme",
    shortTitle: "SaaS",
    description: "Fikirden yayına, abonelik tabanlı dijital ürünlerin uçtan uca geliştirilmesi.",
    outcome: "Doğrulanabilir, sürdürülebilir ve büyümeye hazır ürün altyapısı.",
    icon: "saas",
    features: ["Ürün stratejisi", "Çok kiracılı mimari", "Abonelik sistemi", "Ürün analitiği"],
  },
  {
    slug: "yapay-zeka-entegrasyonlari",
    title: "Yapay Zekâ Entegrasyonları",
    shortTitle: "Yapay Zekâ",
    description: "Bilgiye dayalı chatbotlar, içerik akışları ve karar destek sistemleri.",
    outcome: "Daha hızlı destek, daha iyi yönlendirme ve kontrollü otomasyon.",
    icon: "ai",
    features: ["RAG bilgi tabanı", "Araç çağırma", "İnsan aktarımı", "Yetki kontrollü işlemler"],
  },
  {
    slug: "is-otomasyonlari",
    title: "İş Otomasyonları",
    shortTitle: "Otomasyon",
    description: "Form, bildirim, teklif, rapor ve operasyon akışlarını birbirine bağlayan sistemler.",
    outcome: "Daha az manuel işlem ve daha tutarlı iş süreçleri.",
    icon: "automation",
    features: ["Süreç haritalama", "Webhook altyapısı", "Bildirim akışları", "Raporlama"],
  },
  {
    slug: "ui-ux-tasarim",
    title: "UI/UX Tasarımı",
    shortTitle: "UI/UX",
    description: "Kullanıcı hedefleri ile iş hedeflerini aynı arayüzde buluşturan tasarım sistemi.",
    outcome: "Daha kolay kullanılan, daha güvenilir ve daha yüksek dönüşümlü deneyim.",
    icon: "design",
    features: ["Kullanıcı akışları", "Wireframe", "Tasarım sistemi", "Erişilebilirlik"],
  },
  {
    slug: "seo-performans",
    title: "SEO ve Performans",
    shortTitle: "SEO ve Performans",
    description: "Arama motorları ve gerçek kullanıcı performansı için teknik iyileştirme.",
    outcome: "Daha hızlı sayfalar, daha güçlü taranabilirlik ve sürdürülebilir görünürlük.",
    icon: "performance",
    features: ["Core Web Vitals", "Teknik SEO", "Yapısal veri", "İçerik mimarisi"],
  },
  {
    slug: "bakim-teknik-destek",
    title: "Bakım ve Teknik Destek",
    shortTitle: "Teknik Destek",
    description: "Yayın sonrası izleme, güncelleme, güvenlik ve geliştirme desteği.",
    outcome: "Kesintileri azaltan ve sistemin güncel kalmasını sağlayan devamlılık.",
    icon: "support",
    features: ["Uptime izleme", "Güvenlik güncellemeleri", "Hata yönetimi", "Geliştirme desteği"],
  },
];

export const projects = [
  {
    slug: "vektoryum",
    category: "SaaS ve Yapay Zekâ",
    title: "Vektoryum",
    summary: "Raster görselleri üretime uygun vektör çıktılara dönüştüren ileri seviye SaaS altyapısı.",
    result: "Çok formatlı çıktı, kalite ölçümü ve otomatik doğrulama akışı.",
    metrics: ["SVG, PDF, EPS, DXF", "Kalite değerlendirme", "Ölçeklenebilir işlem hattı"],
  },
  {
    slug: "class-reklam",
    category: "Kurumsal Web ve Yerel SEO",
    title: "Class Reklam",
    summary: "Tabela ve reklam üretim hizmetlerini yerel arama niyetiyle buluşturan kurumsal web deneyimi.",
    result: "Hizmet mimarisi, hızlı mobil deneyim ve içerik yönetimi.",
    metrics: ["Mobil öncelikli", "Yerel SEO", "Yönetilebilir içerik"],
  },
  {
    slug: "ergaxiom",
    category: "Yapay Zekâ ve Otomasyon",
    title: "Ergaxiom",
    summary: "Masaüstü uygulamalarını öğrenen ve doğrulanmış görev akışlarıyla kullanan ajan sistemi tasarımı.",
    result: "Yetkinlik paketleri, denetlenebilir araç kullanımı ve doğrulama katmanı.",
    metrics: ["Çoklu platform", "Yetki kontrollü", "Doğrulama odaklı"],
  },
] as const;

export const blogPosts = [
  {
    slug: "kurumsal-web-sitesi-planlama",
    category: "Web Tasarım",
    title: "Kurumsal web sitesi nasıl planlanır?",
    excerpt: "Amaç, içerik, kullanıcı akışı, teknik altyapı ve ölçüm sistemini tek planda birleştirme rehberi.",
    readingTime: "8 dakika",
  },
  {
    slug: "web-sitesine-yapay-zeka-chatbot-ekleme",
    category: "Yapay Zekâ",
    title: "Web sitesine güvenilir yapay zekâ chatbot nasıl eklenir?",
    excerpt: "Bilgi tabanı, yetkilendirme, insan aktarımı ve kanal bağımsız konuşma mimarisinin temelleri.",
    readingTime: "11 dakika",
  },
  {
    slug: "core-web-vitals-iyilestirme",
    category: "Performans",
    title: "Core Web Vitals değerleri nasıl iyileştirilir?",
    excerpt: "Gerçek kullanıcı deneyimini etkileyen yükleme, etkileşim ve görsel kararlılık sorunları.",
    readingTime: "9 dakika",
  },
] as const;

export const processSteps = [
  { id: "01", title: "Keşif", description: "Hedefleri, kullanıcıları, mevcut sistemi ve başarı ölçütlerini belirleriz." },
  { id: "02", title: "Planlama", description: "Bilgi mimarisi, teknik yapı, içerik planı ve teslim kapsamı oluşturulur." },
  { id: "03", title: "Tasarım", description: "Kullanıcı akışları ve Arcates tasarım sistemiyle arayüz hazırlanır." },
  { id: "04", title: "Geliştirme", description: "Erişilebilir, güvenli ve modüler uygulama bileşenleri geliştirilir." },
  { id: "05", title: "Doğrulama", description: "Fonksiyon, performans, erişilebilirlik, SEO ve güvenlik testleri uygulanır." },
  { id: "06", title: "Yayın", description: "Sistem canlıya alınır; ölçüm, izleme ve sürekli destek başlatılır." },
] as const;

export const faqItems = [
  {
    question: "Arcates hazır tema mı kullanır?",
    answer: "Projenin hedeflerine göre özgün arayüz ve modüler bileşen sistemi oluşturulur. Hazır çözümler yalnızca teknik ve ticari açıdan gerçekten uygun olduğunda değerlendirilir.",
  },
  {
    question: "Web sitesi içerikleri yönetilebilir mi?",
    answer: "Evet. Hizmetler, projeler, blog yazıları, SSS, SEO alanları ve medya içerikleri yetkili kullanıcılar tarafından yönetilebilir şekilde planlanır.",
  },
  {
    question: "Chatbot giriş yapmadan çalışır mı?",
    answer: "Ziyaretçi modunda hizmet yönlendirme, içerik bulma ve teklif kapsamı oluşturma işlevleri çalışır. Hesap işlemleri ve özel proje verileri için güvenli oturum gerekir.",
  },
  {
    question: "Web ve WhatsApp sohbetleri birleşebilir mi?",
    answer: "Evet. İki kanal ortak konuşma motorunu ve müşteri kaydını kullanır. Hesap eşleştirme açık doğrulamayla yapılır.",
  },
];

export type GenericPage = {
  title: string;
  eyebrow: string;
  description: string;
  sections: { title: string; text: string }[];
};

export const genericPages: Record<string, GenericPage> = {
  hakkimizda: {
    title: "Dijital sistemleri iş hedefleriyle birlikte tasarlıyoruz.",
    eyebrow: "Hakkımızda",
    description: "Arcates; tasarım, yazılım, otomasyon ve yapay zekâyı tek bir mühendislik yaklaşımında birleştirir.",
    sections: [
      { title: "Amacımız", text: "İşletmelerin yalnızca görünen bir web sitesine değil, ölçülebilir değer üreten güvenilir dijital altyapılara sahip olmasını sağlamak." },
      { title: "Yaklaşımımız", text: "Her projeyi araştırma, açık kapsam, modüler mimari, doğrulama ve sürdürülebilir destek adımlarıyla ele alırız." },
      { title: "Kalite ilkelerimiz", text: "Erişilebilirlik, hız, güvenlik, açıklanabilir kararlar, ölçülebilir sonuçlar ve uzun vadeli bakım kolaylığı." },
    ],
  },
  "nasil-calisiyoruz": {
    title: "Belirsizliği azaltan, doğrulanabilir proje süreci.",
    eyebrow: "Nasıl Çalışıyoruz",
    description: "Her aşamada ne üretileceği, neyin test edileceği ve hangi kararın neden alındığı görünürdür.",
    sections: processSteps.map((step) => ({ title: `${step.id} — ${step.title}`, text: step.description })),
  },
  teknolojiler: {
    title: "İhtiyaca göre seçilen modern ve sürdürülebilir teknoloji altyapısı.",
    eyebrow: "Teknolojiler",
    description: "Teknoloji seçimini moda göre değil, performans, güvenlik, ekip yetkinliği ve toplam sahip olma maliyetine göre yaparız.",
    sections: [
      { title: "Web uygulamaları", text: "Next.js, React, TypeScript, semantik HTML, modern CSS ve sunucu bileşenleri." },
      { title: "Veri ve servisler", text: "PostgreSQL, güvenli API katmanları, kuyruk sistemleri, nesne depolama ve izleme araçları." },
      { title: "Yapay zekâ", text: "Model sağlayıcı adaptörleri, RAG bilgi tabanı, araç çağırma, yetkilendirme ve değerlendirme akışları." },
    ],
  },
  destek: {
    title: "Sorunu doğru bağlama ulaştıran destek merkezi.",
    eyebrow: "Destek",
    description: "Bilgi merkezi, sistem durumu, destek talepleri ve proje iletişimi aynı deneyim altında birleşir.",
    sections: [
      { title: "Bilgi merkezi", text: "Sık karşılaşılan işlemler için aranabilir ve chatbot tarafından kullanılabilir destek içerikleri." },
      { title: "Destek talepleri", text: "Öncelik, proje, durum, sorumlu ve çözüm geçmişiyle izlenebilir kayıt sistemi." },
      { title: "İnsan desteği", text: "Chatbotun çözemediği veya yetki gerektiren konular temsilciye bağlam kaybetmeden aktarılır." },
    ],
  },
  sss: {
    title: "Proje, süreç ve destek hakkında sık sorulan sorular.",
    eyebrow: "Sık Sorulan Sorular",
    description: "En yaygın sorulara açık yanıtlar. Daha özel bir konu için Arcates sohbetini kullanabilirsiniz.",
    sections: faqItems.map((item) => ({ title: item.question, text: item.answer })),
  },
  iletisim: {
    title: "Projenizin hedefini anlatarak başlayın.",
    eyebrow: "İletişim",
    description: "İhtiyacınızı birkaç cümleyle paylaşın; uygun çözüm kapsamını birlikte netleştirelim.",
    sections: [
      { title: "Yeni proje", text: "Kurumsal web, özel yazılım, e-ticaret, SaaS veya yapay zekâ projenizi chatbot üzerinden kapsamlandırabilirsiniz." },
      { title: "Mevcut müşteri", text: "Proje, dosya ve destek süreçleri için hesap alanını veya bağlı WhatsApp kanalını kullanabilirsiniz." },
    ],
  },
  "teklif-al": {
    title: "İhtiyaca göre oluşturulan net proje kapsamı.",
    eyebrow: "Teklif Al",
    description: "Hazır paket dayatmak yerine hedef, özellik, içerik, entegrasyon ve zamanlama ihtiyaçlarını birlikte belirleriz.",
    sections: [
      { title: "İhtiyaç analizi", text: "Chatbot veya form üzerinden hedef, kullanıcı, mevcut altyapı ve temel özellikler toplanır." },
      { title: "Kapsam özeti", text: "Sayfalar, özellikler, entegrasyonlar, teslimler ve varsayımlar yazılı olarak sunulur." },
      { title: "Teklif", text: "Onaylanan kapsam üzerinden iş planı, teslim yaklaşımı ve ticari şartlar hazırlanır." },
    ],
  },
};
