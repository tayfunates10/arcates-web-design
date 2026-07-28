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
- GHCR sürüm imajları, build provenance, CodeQL ve Dependabot

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

## Kaynak koddan Docker kurulumu

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

## Sürümlü GHCR yayını

`vMAJOR.MINOR.PATCH` biçiminde Git etiketi gönderildiğinde GitHub Actions aşağıdaki imajları üretir:

```text
ghcr.io/tayfunates10/arcates-web-design:<sürüm>
ghcr.io/tayfunates10/arcates-web-design-migrate:<sürüm>
```

Web ve migration imajları ayrı digestlerle yayınlanır. Public repository yayınlarında GitHub build provenance attestasyonu oluşturulur.

Sürüm imajını sunucuya kurmak için:

```bash
bash ops/backup-postgres.sh
bash ops/deploy-release.sh 0.4.0
```

Önceki web imajına kontrollü dönüş:

```bash
ROLLBACK_CONFIRM=ARCATES_ROLLBACK \
  bash ops/rollback-release.sh 0.3.0
```

Rollback veritabanı migration’larını geri almaz. Önceki web sürümü mevcut şemayla uyumlu olmalıdır.

Ayrıntılı yayın prosedürü:

```text
docs/release.md
```

## Sağlık, metrik ve smoke testleri

```bash
curl -fsS https://alan-adiniz/api/health
curl -fsS https://alan-adiniz/api/ready
curl -fsS -H "Authorization: Bearer $METRICS_TOKEN" https://alan-adiniz/api/metrics
```

Canlı doğrulama:

```bash
BASE_URL=https://alan-adiniz \
METRICS_TOKEN="$METRICS_TOKEN" \
npm run smoke
```

Smoke testi HTTPS, liveness, readiness, ana sayfa, güvenlik başlıkları, robots, sitemap ve isteğe bağlı metrik uçlarını doğrular. Aynı kontrol GitHub Actions içindeki `Live Smoke Test` iş akışından manuel olarak çalıştırılabilir.

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

Ayrıntılı operasyon rehberi:

```text
docs/operations.md
```

## Kalite ve tedarik zinciri kontrolleri

```bash
npm run release:check
```

GitHub Actions ayrıca:

- Temiz PostgreSQL servisi başlatır
- Migration deploy ve schema drift kontrolü yapar
- Owner ve başlangıç içeriklerini seed eder
- Kritik davranış testlerini çalıştırır
- Operasyon scriptlerini ve iki Compose dağıtım biçimini doğrular
- Caddy yapılandırmasını doğrular
- TypeScript ve Next.js production build’i çalıştırır
- Migration ve uygulama Docker hedeflerini ayrı ayrı derler
- CodeQL ile JavaScript ve TypeScript güvenlik taraması yapar
- Dependabot ile npm, Docker ve GitHub Actions bağımlılıklarını izler
- Sürüm etiketlerinde GHCR imajı ve provenance üretir

## Güvenlik ilkeleri

- Gizli değerler istemci koduna aktarılmaz.
- Oturum ve hesap kurtarma tokenlarının yalnızca SHA-256 özeti saklanır.
- Parolalar rastgele tuz ile `scrypt` kullanılarak hashlenir.
- Yönetim sayfaları rol kontrolü olmadan açılmaz.
- Değişiklik yapan chatbot işlemleri açık kullanıcı onayı ister.
- PostgreSQL internete açılmaz.
- Metrik ucu sabit zamanlı bearer token doğrulaması kullanır.
- Geri yükleme ve rollback scriptleri açık onay değişkeni olmadan çalışmaz.
- Canlı dağıtımda değişmez semantik sürüm veya `sha-*` etiketi kullanılır.

Güvenlik açığı bildirimleri için `SECURITY.md` dosyasını izleyin. Hassas bulguları herkese açık issue olarak paylaşmayın.

## Canlı ortamda kalan işlemler

- Gerçek alan adı ve DNS yönlendirmesi
- Sunucu secret store veya korumalı `.env.production`
- GHCR paket erişim politikası
- Resend alan adı doğrulaması
- OpenAI ve Meta üretim anahtarları
- WhatsApp üretim telefon numarası ve webhook aboneliği
- Sunucu dışı otomatik yedek kopyası
- Merkezi hata izleme ve log toplama
- Hukuk uzmanı tarafından doğrulanmış yasal metinler
