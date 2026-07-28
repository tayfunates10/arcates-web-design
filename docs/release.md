# Arcates Sürüm ve Yayın Süreci

Bu belge, doğrulanmış bir Arcates sürümünün GitHub Container Registry'ye yayınlanması, hedef sunucuya kurulması, smoke testten geçirilmesi ve gerektiğinde önceki web sürümüne döndürülmesi için standart akışı tanımlar.

## Sürüm ilkeleri

- Üretim yayınları `vMAJOR.MINOR.PATCH` biçimindeki Git etiketleriyle başlatılır.
- Yayın etiketi yalnızca `main` geçmişinde bulunan bir commiti gösterebilir.
- Git etiketi ile `package.json` sürümü birebir eşleşmelidir.
- Canlı sunucuda `latest` etiketi kullanılmaz.
- Dağıtım için tam semantik sürüm etiketi veya değişmez `sha-*` etiketi kullanılır.
- Web ve migration imajları aynı kaynak committen üretilir.
- Veritabanı migration'ları ileri yönlüdür; otomatik şema geri dönüşü yapılmaz.
- Her canlı yayın öncesinde veritabanı yedeği alınır.

## Altyapı gereksinimleri

- Docker Engine
- `!reset` Compose merge etiketini destekleyen güncel Docker Compose v2
- En az iki CPU çekirdeği ve uygulama/veritabanı yüküne uygun bellek
- 80 ve 443 portları için erişim
- Alan adına yönlendirilmiş DNS kaydı
- Paket private ise yalnızca `read:packages` yetkili GHCR tokenı

Repository ayarlarında `ARCATES_SITE_URL` Actions değişkeni zorunlu olarak tanımlanmalıdır. Değer, sahip olunan üretim alan adının yalnızca HTTPS origin biçimi olmalıdır; örneğin `https://www.example.com`. Path, query, fragment, kullanıcı bilgisi, özel port, trailing slash, localhost veya private IP kabul edilmez. Değişken yoksa release iş akışı imaj üretmeden durur.

## Yayın öncesi kontrol

```bash
npm run release:check
bash ops/backup-postgres.sh
```

Aşağıdaki koşullar sağlanmalıdır:

- `main` kalite iş akışı yeşil
- Üretim bağımlılığı audit kapısı yüksek veya kritik açık göstermiyor
- CodeQL taraması kritik açık içermiyor veya private repository nedeniyle çalışmıyorsa eşdeğer inceleme tamamlanmış
- Sürüm numarası `package.json` içinde güncel
- `ARCATES_SITE_URL` gerçek ve sahip olunan üretim origin değerine ayarlanmış
- Yeni migration varsa temiz PostgreSQL üzerinde uygulanmış
- E-posta, OpenAI ve WhatsApp yapılandırma değişiklikleri belgelenmiş
- Geri dönüşte kullanılacak önceki çalışan sürüm etiketi kaydedilmiş

## GHCR imaj yayını

`main` üzerindeki doğrulanmış commit için Git etiketi oluşturulur:

```bash
git tag -a v0.4.0 -m "Arcates v0.4.0"
git push origin v0.4.0
```

Etiket aşağıdaki imajları üretir:

```text
ghcr.io/tayfunates10/arcates-web-design:0.4.0
ghcr.io/tayfunates10/arcates-web-design-migrate:0.4.0
```

Ayrıca tam sürüm, major/minor, major, `latest` ve değişmez `sha-*` etiketleri oluşturulur. Ön sürümlerde `latest` etiketi üretilmez.

İki imaj için SBOM üretilir. Public repository yayınlarında imaj digestleri için GitHub build provenance attestasyonu oluşturulur. Workflow sonunda GitHub Release açılır ve aşağıdaki iki dosya release varlığı olarak eklenir:

```text
arcates-release-manifest.txt
arcates-release-manifest.txt.sha256
```

Manifest; sürüm, kaynak commit, build sırasında kullanılan site URL'si ve iki imajın değişmez digestini içerir.

## Sunucuda yayın

`.env.production` içinde aşağıdaki değerler bulunmalıdır:

```env
ARCATES_WEB_IMAGE=ghcr.io/tayfunates10/arcates-web-design
ARCATES_MIGRATE_IMAGE=ghcr.io/tayfunates10/arcates-web-design-migrate
ARCATES_RELEASE_TAG=0.4.0
```

Private paket kullanılıyorsa sunucuda yalnızca paket okuma yetkili tokenla GHCR oturumu açılır:

```bash
echo "$GHCR_READ_TOKEN" | docker login ghcr.io -u tayfunates10 --password-stdin
```

Yayın:

```bash
bash ops/backup-postgres.sh
bash ops/deploy-release.sh 0.4.0
```

Deploy scripti sırasıyla:

1. Compose sözleşmesini doğrular.
2. PostgreSQL ve iki sürüm imajını çeker.
3. PostgreSQL sağlık kontrolünü bekler.
4. Migration imajını tek seferlik ve bağımlılıkları yeniden başlatmadan çalıştırır.
5. Web imajını migration'ı yeniden tetiklemeden başlatır.
6. Web healthcheck'i başarılı olana kadar bekler.
7. İsteğe bağlı Caddy proxy servisini başlatır.

`/api/health` çıktısındaki `version` alanı dağıtılan `ARCATES_RELEASE_TAG` değerini göstermelidir.

## Canlı smoke testi

```bash
BASE_URL="$ARCATES_SITE_URL" \
METRICS_TOKEN="$METRICS_TOKEN" \
bash ops/smoke-test.sh
```

Smoke testi şunları doğrular:

- HTTPS kullanımı
- Credential, query, fragment veya alt path içermeyen origin URL'si
- Local, private, link-local ve metadata hedeflerinin engellenmesi
- `/api/health`
- `/api/ready`
- Ana sayfa ve temel güvenlik başlıkları
- `robots.txt`
- `sitemap.xml`
- Token sağlanırsa `/api/metrics`

Aynı test GitHub Actions içindeki `Live Smoke Test` iş akışıyla manuel olarak çalıştırılabilir. Workflow yalnızca `main` dalına alındıktan sonra GitHub arayüzünde manuel çalıştırılabilir.

## Web sürümüne geri dönüş

Geri dönüş işlemi veritabanı migration'larını geri almaz. Önceki web imajı, mevcut veritabanı şemasıyla uyumlu olmalıdır.

```bash
ROLLBACK_CONFIRM=ARCATES_ROLLBACK \
bash ops/rollback-release.sh 0.3.0
```

Rollback sonrası smoke testi yeniden çalıştırılır:

```bash
BASE_URL="$ARCATES_SITE_URL" bash ops/smoke-test.sh
```

Önceki sürüm yeni şemayla uyumlu değilse otomatik rollback yapılmaz. Düzeltme sürümü hazırlanır veya hukuk ve operasyon onayıyla doğrulanmış yedekten kontrollü geri yükleme planı uygulanır.

## Acil durum kayıtları

Her yayın için aşağıdakiler kaydedilmelidir:

- Git etiketi
- Merge veya release commit SHA'sı
- Web ve migration imaj digestleri
- Release manifesti ve SHA-256 checksum
- Migration sonucu
- Yedek dosyası ve SHA-256 checksum
- Smoke test sonucu
- Yayını yapan kişi
- Yayın ve geri dönüş zamanı
- Karşılaşılan hata ve alınan karar
