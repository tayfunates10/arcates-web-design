# Arcates Web Design

Arcates için geliştirilen performans, SEO, müşteri yönetimi ve yapay zekâ odaklı kurumsal web platformu.

## Uygulama kapsamı

- Next.js App Router, React ve TypeScript altyapısı
- Koyu, responsive Arcates tasarım sistemi
- Emoji ve ikon fontu içermeyen özel SVG ikon kütüphanesi
- Ana sayfa, hizmetler, hizmet detayları, projeler, blog, destek ve yasal sayfalar
- PostgreSQL ve Prisma veri katmanı
- `scrypt` parola hash sistemi ve iptal edilebilir opak oturumlar
- Müşteri kayıt, giriş, çıkış ve rol tabanlı yönetim erişimi
- Veritabanından beslenen müşteri ve yönetici panelleri
- Kalıcı teklif talepleri ve yetkili destek kayıtları
- Ortak web ve WhatsApp konuşma modeli
- Bilgi tabanıyla temellendirilen OpenAI Responses API adaptörü
- OpenAI kullanılamadığında güvenli kural motoru geri dönüşü
- WhatsApp Cloud API webhook doğrulama, HMAC imza kontrolü, idempotency ve metin yanıtı
- Sitemap, robots, metadata, Open Graph ve JSON-LD altyapısı
- Core Web Vitals ve erişilebilirlik odaklı CSS
- Prisma doğrulama, TypeScript ve production build çalıştıran GitHub Actions

## Yerel kurulum

```bash
cp .env.example .env.local
npm install
npm run db:validate
npm run db:push
npm run db:seed
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

## Zorunlu veritabanı ayarları

`.env.local` içinde geçerli bir PostgreSQL bağlantısı tanımlayın:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/arcates?sslmode=require
```

İlk yönetici hesabı için:

```env
ARCATES_OWNER_NAME=Arcates Owner
ARCATES_OWNER_EMAIL=owner@example.com
ARCATES_OWNER_PASSWORD=GuvenliParola123
```

Ardından:

```bash
npm run db:seed
```

Seed komutu aynı e-posta için ikinci hesap açmaz; mevcut hesabı `OWNER` rolüyle günceller.

## OpenAI yapılandırması

```env
OPENAI_API_KEY=
OPENAI_MODEL=
```

Anahtar veya model tanımlı değilse chatbot çalışmaya devam eder ve doğrulanmış kural motorunu kullanır. Model çağrıları yalnızca sunucudan yapılır ve API isteğinde saklama kapatılır.

## WhatsApp Cloud API yapılandırması

```env
WHATSAPP_GRAPH_API_VERSION=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
```

Webhook adresi:

```text
/api/whatsapp/webhook
```

Gelen webhook isteklerinde `x-hub-signature-256` doğrulaması zorunludur. Her mesaj önce idempotency event store'a yazılır, daha sonra ortak konuşma ve mesaj tablolarına işlenir.

## Kalite kontrolleri

```bash
npm run db:validate
npm run typecheck
npm run build
```

Tümünü birlikte çalıştırmak için:

```bash
npm run check
```

## Güvenlik ilkeleri

- API anahtarları ve veritabanı bilgileri istemci koduna aktarılmaz.
- Oturum belirteçlerinin yalnızca SHA-256 özeti veritabanında tutulur.
- Parolalar rastgele tuz ile `scrypt` kullanılarak hashlenir.
- Yönetim sayfaları rol kontrolü olmadan açılmaz.
- Destek taleplerinde proje üyeliği sunucuda doğrulanır.
- WhatsApp webhook olayları tekrar işlense bile ikinci mesaj kaydı oluşturmaz.
- Chatbot fiyat, teslim tarihi veya hesap işlemi hakkında doğrulanmamış iddia üretmemesi için sınırlandırılmıştır.

## Üretim öncesinde tamamlanacak işlemler

Kod tabanı production build kontrolünden geçer; canlıya alınmadan önce hedef ortamda şu operasyonel adımlar tamamlanmalıdır:

- Gerçek PostgreSQL veritabanının oluşturulması ve şemanın uygulanması
- Owner hesabının seed edilmesi
- Alan adı ve HTTPS ayarları
- OpenAI ve WhatsApp anahtarlarının secret store üzerinden tanımlanması
- Meta tarafında webhook aboneliğinin ve üretim telefon numarasının etkinleştirilmesi
- Yedekleme, hata izleme, oran sınırlama ve uygulama metriklerinin hedef altyapıya bağlanması
- Yasal metinlerin hukuk uzmanı tarafından doğrulanması
