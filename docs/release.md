# Arcates Sürüm ve Yayın Süreci

Bu belge, doğrulanmış bir Arcates sürümünün GitHub Container Registry'ye yayınlanması, hedef sunucuya kurulması, smoke testten geçirilmesi ve gerektiğinde önceki web sürümüne döndürülmesi için standart akışı tanımlar.

## Sürüm ilkeleri

- Üretim yayınları `vMAJOR.MINOR.PATCH` biçimindeki Git etiketleriyle başlatılır.
- Canlı sunucuda `latest` etiketi kullanılmaz.
- Dağıtım için tam semantik sürüm etiketi veya değişmez `sha-*` etiketi kullanılır.
- Web ve migration imajları aynı kaynak committen üretilir.
- Veritabanı migration'ları ileri yönlüdür; otomatik şema geri dönüşü yapılmaz.
- Her canlı yayın öncesinde veritabanı yedeği alınır.

## Yayın öncesi kontrol

```bash
npm run release:check
bash ops/backup-postgres.sh
```

Aşağıdaki koşullar sağlanmalıdır:

- `main` kalite iş akışı yeşil
- CodeQL taraması kritik açık içermiyor
- Sürüm numarası `package.json` içinde güncel
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

Public repository yayınlarında imaj digestleri için GitHub build provenance attestasyonu oluşturulur. İmaj digestleri workflow özetinden kaydedilmelidir.

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
4. Migration imajını tek seferlik çalıştırır.
5. Web imajını başlatır.
6. Web healthcheck'i başarılı olana kadar bekler.
7. İsteğe bağlı Caddy proxy servisini başlatır.

## Canlı smoke testi

```bash
BASE_URL=https://arcates.com \
METRICS_TOKEN="$METRICS_TOKEN" \
bash ops/smoke-test.sh
```

Smoke testi şunları doğrular:

- HTTPS kullanımı
- `/api/health`
- `/api/ready`
- Ana sayfa ve temel güvenlik başlıkları
- `robots.txt`
- `sitemap.xml`
- Token sağlanırsa `/api/metrics`

Aynı test GitHub Actions içindeki `Live Smoke Test` iş akışıyla manuel olarak çalıştırılabilir.

## Web sürümüne geri dönüş

Geri dönüş işlemi veritabanı migration'larını geri almaz. Önceki web imajı, mevcut veritabanı şemasıyla uyumlu olmalıdır.

```bash
ROLLBACK_CONFIRM=ARCATES_ROLLBACK \
bash ops/rollback-release.sh 0.3.0
```

Rollback sonrası smoke testi yeniden çalıştırılır:

```bash
BASE_URL=https://arcates.com bash ops/smoke-test.sh
```

Önceki sürüm yeni şemayla uyumlu değilse otomatik rollback yapılmaz. Düzeltme sürümü hazırlanır veya hukuk ve operasyon onayıyla doğrulanmış yedekten kontrollü geri yükleme planı uygulanır.

## Acil durum kayıtları

Her yayın için aşağıdakiler kaydedilmelidir:

- Git etiketi
- Merge veya release commit SHA'sı
- Web ve migration imaj digestleri
- Migration sonucu
- Yedek dosyası ve SHA-256 checksum
- Smoke test sonucu
- Yayını yapan kişi
- Yayın ve geri dönüş zamanı
- Karşılaşılan hata ve alınan karar
