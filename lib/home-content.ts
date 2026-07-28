import type { IconName } from "@/lib/content";

export type HomeService = {
  title: string;
  description: string;
  href: string;
  icon: IconName;
};

export const homeServices: HomeService[] = [
  {
    title: "Web Tasarım",
    description: "Markanızı doğru anlatan, hızlı, erişilebilir ve dönüşüm odaklı kurumsal web deneyimleri.",
    href: "/web-cozumleri/kurumsal-web-tasarim",
    icon: "web",
  },
  {
    title: "Özel Yazılım",
    description: "İş akışınıza göre geliştirilen güvenli, modüler ve ölçeklenebilir web uygulamaları.",
    href: "/web-cozumleri/ozel-web-yazilimlari",
    icon: "software",
  },
  {
    title: "SEO & İçerik",
    description: "Arama niyetini, teknik taranabilirliği ve sürdürülebilir içerik mimarisini birleştiren sistem.",
    href: "/web-cozumleri/seo-performans",
    icon: "performance",
  },
  {
    title: "Performans Optimizasyonu",
    description: "Core Web Vitals, yükleme süresi ve etkileşim performansını gerçek kullanıcı verileriyle iyileştirme.",
    href: "/web-cozumleri/seo-performans",
    icon: "performance",
  },
  {
    title: "Otomasyon & Entegrasyon",
    description: "Tekrarlanan operasyonları, bildirimleri ve veri akışlarını güvenilir entegrasyonlarla birleştirme.",
    href: "/web-cozumleri/is-otomasyonlari",
    icon: "automation",
  },
  {
    title: "Bakım & Destek",
    description: "Yayın sonrası izleme, güncelleme, güvenlik, hata yönetimi ve sürekli geliştirme desteği.",
    href: "/web-cozumleri/bakim-teknik-destek",
    icon: "support",
  },
  {
    title: "UX/UI Tasarım",
    description: "Kullanıcı hedefleriyle iş hedeflerini aynı akışta buluşturan erişilebilir tasarım sistemleri.",
    href: "/web-cozumleri/ui-ux-tasarim",
    icon: "design",
  },
  {
    title: "Dijital Strateji",
    description: "Ürün, kanal, teknoloji ve ölçüm kararlarını tek yol haritasında birleştiren danışmanlık.",
    href: "/nasil-calisiyoruz",
    icon: "ai",
  },
];

export const discoveryItems = [
  {
    title: "İş hedefleriniz nelerdir?",
    content: "Büyüme, satış, operasyon verimliliği veya marka güveni gibi öncelikleri ölçülebilir başarı göstergelerine dönüştürürüz.",
  },
  {
    title: "Hedef kitleniz kim?",
    content: "Kullanıcıların ihtiyaçlarını, karar anlarını ve cihaz davranışlarını analiz ederek doğru bilgi mimarisini kurarız.",
  },
  {
    title: "Mevcut durumunuz nedir?",
    content: "Mevcut siteyi, içerikleri, entegrasyonları, performansı ve teknik borcu birlikte değerlendiririz.",
  },
  {
    title: "Karşılaştığınız zorluklar",
    content: "Düşük dönüşüm, yavaşlık, yönetim güçlüğü veya kopuk süreçlerin kök nedenlerini görünür hale getiririz.",
  },
  {
    title: "Beklentileriniz ve bütçeniz",
    content: "Öncelikleri netleştirir, uygulanabilir kapsamı ve aşamalı teslim planını şeffaf biçimde oluştururuz.",
  },
] as const;

export const homeProjects = [
  {
    slug: "vektoryum",
    category: "SaaS · Yapay Zekâ",
    title: "Vektoryum",
    summary: "Raster görselleri üretime hazır vektör çıktılara dönüştüren kalite doğrulamalı SaaS sistemi.",
    accent: "cyan",
  },
  {
    slug: "class-reklam",
    category: "Kurumsal Web · Yerel SEO",
    title: "Class Reklam",
    summary: "Tabela hizmetlerini güçlü içerik mimarisi ve mobil öncelikli deneyimle buluşturan kurumsal platform.",
    accent: "blue",
  },
  {
    slug: "ergaxiom",
    category: "Yapay Zekâ · Otomasyon",
    title: "Ergaxiom",
    summary: "Masaüstü uygulamalarını öğrenen, yetki kontrollü ve doğrulanabilir görev akışları çalıştıran ajan sistemi.",
    accent: "violet",
  },
] as const;

export const homeProcess = [
  {
    id: "01",
    title: "Keşif & Planlama",
    description: "Hedefler, kullanıcılar, kapsam, riskler ve başarı ölçütleri netleştirilir.",
    icon: "analysis",
  },
  {
    id: "02",
    title: "Tasarım & Prototip",
    description: "Bilgi mimarisi, kullanıcı akışları ve etkileşimli prototip hazırlanır.",
    icon: "design",
  },
  {
    id: "03",
    title: "Geliştirme",
    description: "Modüler, erişilebilir, güvenli ve ölçeklenebilir uygulama geliştirilir.",
    icon: "code",
  },
  {
    id: "04",
    title: "Test & Yayın",
    description: "Fonksiyon, performans, SEO ve erişilebilirlik doğrulanarak teslim edilir.",
    icon: "launch",
  },
] as const;

export const homeMetrics = [
  { value: 0.9, decimals: 1, suffix: " sn", label: "Hedef yükleme hızı" },
  { value: 92, decimals: 0, suffix: "+", label: "Hedef SEO puanı" },
  { value: 35, decimals: 0, prefix: "%", suffix: "+", label: "Dönüşüm artışı hedefi" },
  { value: 98, decimals: 0, prefix: "%", suffix: "+", label: "Performans hedefi" },
  { value: 99.9, decimals: 1, prefix: "%", label: "Uptime hedefi" },
] as const;

export const homeArticles = [
  {
    slug: "kurumsal-web-sitesi-planlama",
    date: "28 Mayıs 2026",
    category: "Web Tasarım",
    title: "2025’te SEO sıralamalarında öne çıkmanın yeni yolları",
    visual: "network",
  },
  {
    slug: "core-web-vitals-iyilestirme",
    date: "20 Mayıs 2026",
    category: "Performans",
    title: "Web sitenizin hızını artırmanın 7 etkili yolu",
    visual: "speed",
  },
  {
    slug: "web-sitesine-yapay-zeka-chatbot-ekleme",
    date: "12 Mayıs 2026",
    category: "UX/UI",
    title: "Dönüşüm odaklı tasarımın 5 temel prensibi",
    visual: "interface",
  },
] as const;

export const homeFaq = [
  {
    title: "Proje süreci ne kadar sürüyor?",
    content: "Kapsama göre değişir. Kurumsal projeler çoğunlukla 4–8 hafta, daha kapsamlı yazılım projeleri aşamalı olarak planlanır.",
  },
  {
    title: "Hangi teknolojileri kullanıyorsunuz?",
    content: "Teknolojiyi moda göre değil; performans, güvenlik, bakım kolaylığı ve toplam sahip olma maliyetine göre seçiyoruz.",
  },
  {
    title: "Bakım ve destek sağlıyor musunuz?",
    content: "Evet. İzleme, güvenlik güncellemeleri, hata yönetimi, içerik desteği ve sürekli geliştirme seçenekleri sunuyoruz.",
  },
  {
    title: "Ücretlendirme nasıl yapılıyor?",
    content: "Kapsam, teslim aşamaları ve sorumluluklar netleştirildikten sonra şeffaf proje teklifi veya sürdürülebilir hizmet planı hazırlanır.",
  },
] as const;
