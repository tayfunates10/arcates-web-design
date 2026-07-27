# Arcates Web Design

Arcates için geliştirilen performans, SEO ve yapay zekâ odaklı kurumsal web platformu.

## İlk uygulama kapsamı

- Next.js App Router, React ve TypeScript altyapısı
- Koyu, responsive Arcates tasarım sistemi
- Emoji ve ikon fontu içermeyen özel SVG ikon kütüphanesi
- Ana sayfa, hizmetler, hizmet detayları, projeler, blog, destek ve yasal sayfa yapıları
- Müşteri ve yönetim paneli önizlemeleri
- Sabit web chatbotu ve güvenli yerel yönlendirme API'si
- WhatsApp Cloud API webhook doğrulama ve imza kontrolü başlangıcı
- Sitemap, robots, metadata, Open Graph ve JSON-LD altyapısı
- Core Web Vitals ve erişilebilirlik odaklı CSS
- GitHub Actions kalite kontrolü

## Çalıştırma

```bash
npm install
npm run dev
```

Üretim kontrolü:

```bash
npm run check
```

## Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın. API anahtarları istemci tarafına aktarılmamalıdır.

## Mimari notu

Mevcut chatbot API'si harici model kullanmadan güvenli ve deterministik hizmet yönlendirmesi yapar. Sonraki aşamada model sağlayıcı adaptörü, PostgreSQL konuşma kaydı, RAG bilgi tabanı, kimlik doğrulama, araç yetkilendirme ve ortak web/WhatsApp konuşma motoru eklenecektir.
