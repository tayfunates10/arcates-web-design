export const siteConfig = {
  name: "Arcates",
  legalName: "Arcates Web Solutions",
  description:
    "Kurumsal web siteleri, özel yazılımlar, e-ticaret, SaaS ve yapay zekâ otomasyonları geliştiren dijital mühendislik stüdyosu.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://arcates.com",
  locale: "tr_TR",
  email: "hello@arcates.com",
};

export const mainNavigation = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Web Çözümleri", href: "/web-cozumleri" },
  { label: "Projelerimiz", href: "/projelerimiz" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Blog", href: "/blog" },
  { label: "Destek", href: "/destek" },
] as const;

export const footerNavigation = {
  solutions: [
    { label: "Kurumsal Web Tasarım", href: "/web-cozumleri/kurumsal-web-tasarim" },
    { label: "E-Ticaret Sistemleri", href: "/web-cozumleri/e-ticaret-sistemleri" },
    { label: "Özel Web Yazılımları", href: "/web-cozumleri/ozel-web-yazilimlari" },
    { label: "Yapay Zekâ Entegrasyonları", href: "/web-cozumleri/yapay-zeka-entegrasyonlari" },
  ],
  company: [
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "Nasıl Çalışıyoruz", href: "/nasil-calisiyoruz" },
    { label: "Teknolojiler", href: "/teknolojiler" },
    { label: "İletişim", href: "/iletisim" },
  ],
  support: [
    { label: "Bilgi Merkezi", href: "/destek/bilgi-merkezi" },
    { label: "Destek Talebi", href: "/destek/destek-talebi" },
    { label: "Sistem Durumu", href: "/destek/sistem-durumu" },
    { label: "Sık Sorulan Sorular", href: "/sss" },
  ],
  legal: [
    { label: "Gizlilik", href: "/gizlilik-politikasi" },
    { label: "KVKK", href: "/kvkk" },
    { label: "Çerezler", href: "/cerez-politikasi" },
    { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
  ],
} as const;
