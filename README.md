# Arcates Web Design

Arcates için geliştirilen performans, SEO, müşteri yönetimi, içerik yayınlama ve yapay zekâ odaklı kurumsal web platformu.

## Uygulama kapsamı

- Next.js App Router, React ve TypeScript
- Responsive koyu Arcates tasarım sistemi
- Emoji ve ikon fontu içermeyen özel SVG ikonları
- Hizmetler, projeler, blog, destek, SSS ve yasal sayfalar
- PostgreSQL, Prisma ve sürümlü SQL migration’ları
- `scrypt` parola hash’i ve iptal edilebilir opak oturumlar
- Müşteri, proje, satış, destek ve konuşma yönetimi
- Yönetilebilir blog, vaka çalışması ve SSS içerikleri
- Web ve WhatsApp için ortak konuşma motoru
- OpenAI Responses API adaptörü ve güvenli kural motoru
- İnsan temsilci aktarımı ve açık onay gerektiren hesap araçları
- Metadata, canonical, Open Graph, JSON-LD, sitemap ve robots
- PostgreSQL tabanlı oran sınırlama
- Liveness, readiness ve korumalı Prometheus metrikleri
- Docker, Compose ve isteğe bağlı Caddy HTTPS katmanı
- PostgreSQL yedekleme ve kontrollü geri yükleme araçları

## Yerel kurulum

```bash
cp .env.example .env.local
npm install
npm run db:validate
npm run db:deploy
npm run db:seed
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

## Veritabanı ve migration

Yerel şema geliştirmesi:

```bash
npm run db:migrate
```

CI ve canlı ortam:

```bash
npm run db:deploy
npm run db:status
```

Üretim veritabanında `db:push` kullanılmamalıdır. GitHub Actions, migration’ları temiz PostgreSQL’e uygular ve migration sonucu ile Prisma şeması arasında drift kontrolü yapar.

## Zorunlu ortam değişkenleri

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/arcates?schema=public
RATE_LIMIT_SECRET=uzun-ve-rastgele-bir-deger
METRICS_TOKEN=farkli-uzun-ve-rastgele-bir-deger

ARCATES_OWNER_NAME=Arcates Owner
ARCATES_OWNER_EMAIL=owner@example.com
ARCATES_OWNER_PASSWORD=GuvenliParola123
```

Owner hesabı ve doğrulanmış başlangıç içerikleri:

```bash
npm run db:seed
```

Seed komutu tekrar çalıştırılabilir; aynı e-posta için ikinci owner hesabı oluşturmaz.

## OpenAI

```env
OPENAI_API_KEY=
OPENAI_MODEL=
```

Anahtar veya model tanımlı değilse chatbot doğrulanmış kural motoruyla çalışmaya devam eder. Model çağrıları yalnızca sunucudan yapılır ve API isteğinde saklama kapatılır.

## WhatsApp Cloud API

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

Webhook isteklerinde `x-hub-signature-256` doğrulaması zorunludur. Olaylar tekrar işlemeye karşı idempotency kaydıyla korunur.

## Docker ile üretim kurulumu

```bash
cp .env.production.example .env.production
chmod 600 .env.production
bash ops/deploy.sh
```

Caddy kullanılmayacaksa:

```bash
WITH_PROXY=false bash ops/deploy.sh
```

Servis sırası PostgreSQL sağlık kontrolü, migration deploy, web readiness ve isteğe bağlı Caddy HTTPS şeklindedir.

Ayrıntılı dağıtım, yedekleme ve geri yükleme rehberi:

```text
docs/operations.md
```

## Sağlık ve metrikler

```bash
curl -fsS https://alan-adiniz/api/health
curl -fsS https://alan-adiniz/api/ready
curl -fsS -H "Authorization: Bearer $METRICS_TOKEN" https://alan-adiniz/api/metrics
```

Metrik ucu kullanıcı verisi döndürmez; yalnızca operasyon sayaçları ve veritabanı sorgu süresini Prometheus metin biçiminde sunar.

## PostgreSQL yedeği

```bash
bash ops/backup-postgres.sh
```

Kontrollü geri yükleme:

```bash
RESTORE_CONFIRM=ARCATES_RESTORE \
  bash ops/restore-postgres.sh backups/arcates-YYYYMMDDTHHMMSSZ.dump
```

Her yedek için SHA-256 checksum oluşturulur. En az bir yedek kopyası uygulama sunucusu dışında tutulmalıdır.

## Kalite kontrolleri

```bash
npm run check
```

GitHub Actions ayrıca:

- Temiz PostgreSQL servisi başlatır
- Migration deploy ve schema drift kontrolü yapar
- Owner ve başlangıç içeriklerini seed eder
- Kritik davranış testlerini çalıştırır
- Operasyon scriptlerini ve Compose sözleşmesini doğrular
- Caddy yapılandırmasını doğrular
- TypeScript ve Next.js production build’i çalıştırır
- Migration ve uygulama Docker hedeflerini ayrı ayrı derler

## Güvenlik ilkeleri

- Gizli değerler istemci koduna aktarılmaz.
- Oturum belirteçlerinin yalnızca SHA-256 özeti saklanır.
- Parolalar rastgele tuz ile `scrypt` kullanılarak hashlenir.
- Yönetim sayfaları rol kontrolü olmadan açılmaz.
- Değişiklik yapan chatbot işlemleri açık kullanıcı onayı ister.
- PostgreSQL internete açılmaz.
- Metrik ucu sabit zamanlı bearer token doğrulaması kullanır.
- Geri yükleme scripti açık onay değişkeni olmadan çalışmaz.

## Canlı ortamda kalan işlemler

- Gerçek alan adı ve DNS yönlendirmesi
- Sunucu secret store veya korumalı `.env.production`
- OpenAI ve Meta üretim anahtarları
- WhatsApp üretim telefon numarası ve webhook aboneliği
- Sunucu dışı otomatik yedek kopyası
- Merkezi hata izleme ve log toplama
- Hukuk uzmanı tarafından doğrulanmış yasal metinler
