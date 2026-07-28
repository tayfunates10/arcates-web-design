# Arcates Web Design

Arcates için geliştirilen performans, SEO, müşteri yönetimi, içerik yayınlama ve yapay zekâ odaklı kurumsal web platformu.

## Uygulama kapsamı

- Next.js App Router, React ve TypeScript altyapısı
- Koyu, responsive Arcates tasarım sistemi
- Emoji ve ikon fontu içermeyen özel SVG ikon kütüphanesi
- Ana sayfa, hizmetler, projeler, blog, destek, SSS ve yasal sayfalar
- PostgreSQL ve Prisma veri katmanı
- Sürümlü Prisma SQL migration’ları
- `scrypt` parola hash sistemi ve iptal edilebilir opak oturumlar
- Müşteri kayıt, giriş, çıkış ve rol tabanlı yönetim erişimi
- Veritabanından beslenen müşteri ve yönetici panelleri
- Kalıcı teklif talepleri ve yetkili destek kayıtları
- Web ve WhatsApp için ortak konuşma modeli
- Yönetilebilir blog, vaka çalışması ve SSS içerikleri
- Bilgi tabanıyla temellendirilen OpenAI Responses API adaptörü
- OpenAI kullanılamadığında güvenli kural motoru geri dönüşü
- WhatsApp Cloud API webhook doğrulaması, HMAC kontrolü ve idempotency
- Sitemap, robots, metadata, Open Graph ve JSON-LD altyapısı
- Core Web Vitals ve erişilebilirlik odaklı CSS
- Gerçek PostgreSQL, test, typecheck, production build ve Docker build kalite kapıları

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

Yeni bir şema değişikliği geliştirirken:

```bash
npm run db:migrate
```

Canlı veya CI ortamında yalnızca kayıtlı migration’ları uygulamak için:

```bash
npm run db:deploy
```

Üretim veritabanında `db:push` kullanılmamalıdır.

## Zorunlu veritabanı ayarları

`.env.local` içinde geçerli bir PostgreSQL bağlantısı tanımlayın:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/arcates?schema=public
RATE_LIMIT_SECRET=uzun-ve-rastgele-bir-deger
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

Seed komutu aynı e-posta için ikinci hesap açmaz; mevcut hesabı `OWNER` rolüyle günceller ve doğrulanmış başlangıç içeriklerini yeniden kullanılabilir biçimde oluşturur.

## OpenAI yapılandırması

```env
OPENAI_API_KEY=
OPENAI_MODEL=
```

Anahtar veya model tanımlı değilse chatbot çalışmaya devam eder ve doğrulanmış kural motorunu kullanır. Model çağrıları yalnızca sunucudan yapılır ve API isteğinde saklama kapatılır.

Chatbotun çalışma sırası:

1. Kullanıcının erişim düzeyine uygun bilgi tabanı kayıtları seçilir.
2. En ilgili kayıtlar yanıt bağlamına eklenir.
3. OpenAI yapılandırılmışsa temellendirilmiş yanıt istenir.
4. Model çağrısı başarısızsa kural motoru devreye girer.
5. Yanıtın kaynağı ve kullanılan bilgi başlıkları mesaj metadata alanına yazılır.

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

Gelen webhook isteklerinde `x-hub-signature-256` doğrulaması zorunludur. Her mesaj önce idempotency event store’a yazılır, daha sonra ortak konuşma ve mesaj tablolarına işlenir.

## Docker ile üretim kurulumu

Örnek üretim dosyasını kopyalayın ve değerleri değiştirin:

```bash
cp .env.production.example .env.production
```

Ardından migration ve uygulama servislerini başlatın:

```bash
docker compose --env-file .env.production up -d --build
```

Servis sırası:

1. PostgreSQL sağlık kontrolünden geçer.
2. `migrate` konteyneri kayıtlı migration’ları uygular ve kapanır.
3. `web` konteyneri başlatılır.
4. `/api/ready` başarılı olmadan uygulama sağlıklı kabul edilmez.

Uygulama varsayılan olarak yalnızca `127.0.0.1:3000` üzerinde yayınlanır. İnternet erişimi Nginx, Caddy veya Cloudflare Tunnel gibi HTTPS sağlayan bir reverse proxy üzerinden verilmelidir.

## Kalite kontrolleri

```bash
npm run db:validate
npm run db:deploy
npm test
npm run typecheck
npm run build
```

Uygulama seviyesindeki kontrolleri birlikte çalıştırmak için:

```bash
npm run check
```

GitHub Actions ayrıca:

- Temiz PostgreSQL servisi başlatır
- Migration’ları uygular
- Şema drift kontrolü yapar
- Owner ve başlangıç içeriklerini seed eder
- Kritik davranış testlerini çalıştırır
- TypeScript ve Next.js production build’i doğrular
- Migration ve uygulama Docker hedeflerini ayrı ayrı derler

## Güvenlik ilkeleri

- API anahtarları ve veritabanı bilgileri istemci koduna aktarılmaz.
- Oturum belirteçlerinin yalnızca SHA-256 özeti veritabanında tutulur.
- Parolalar rastgele tuz ile `scrypt` kullanılarak hashlenir.
- Yönetim sayfaları rol kontrolü olmadan açılmaz.
- Destek taleplerinde proje üyeliği sunucuda doğrulanır.
- WhatsApp webhook olayları tekrar işlense bile ikinci mesaj kaydı oluşturmaz.
- Chatbot fiyat, teslim tarihi veya hesap işlemi hakkında doğrulanmamış iddia üretmemesi için sınırlandırılmıştır.
- Değişiklik yapan sohbet araçları açık kullanıcı onayı olmadan çalışmaz.

## Üretim öncesinde tamamlanacak işlemler

- Alan adı, DNS ve HTTPS reverse proxy ayarları
- Güçlü üretim parolalarının secret store üzerinden tanımlanması
- Owner hesabının seed edilmesi
- OpenAI ve WhatsApp üretim anahtarlarının tanımlanması
- Meta webhook aboneliği ve üretim telefon numarasının etkinleştirilmesi
- PostgreSQL otomatik yedekleme ve geri yükleme testi
- Hata izleme, merkezi log ve uygulama metrikleri
- Yasal metinlerin hukuk uzmanı tarafından doğrulanması
