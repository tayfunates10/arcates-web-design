# Arcates Üretim Operasyonları

Bu belge Docker Compose, Caddy, PostgreSQL yedekleme ve metrik erişimi için güvenli çalışma akışını tanımlar.

## 1. Ortam dosyası

```bash
cp .env.production.example .env.production
chmod 600 .env.production
```

Aşağıdaki değerler mutlaka gerçek ve birbirinden farklı uzun rastgele değerlerle değiştirilmelidir:

- `POSTGRES_PASSWORD`
- `RATE_LIMIT_SECRET`
- `METRICS_TOKEN`
- `ARCATES_OWNER_PASSWORD`
- WhatsApp ve OpenAI gizli değerleri

`ARCATES_DOMAIN` DNS üzerinde sunucuya yönlenmiş olmalıdır. `ACME_EMAIL`, TLS sertifika bildirimlerinde kullanılacak geçerli e-posta adresidir.

## 2. Dağıtım

Caddy ile HTTPS dahil tam kurulum:

```bash
bash ops/deploy.sh
```

Caddy kullanılmadan yalnızca PostgreSQL, migration ve web servisleri:

```bash
WITH_PROXY=false bash ops/deploy.sh
```

Dağıtım sırası:

1. Compose sözleşmesi doğrulanır.
2. PostgreSQL imajı güncellenir.
3. Migration ve uygulama imajları derlenir.
4. PostgreSQL sağlık kontrolünden geçer.
5. `migrate` servisi kayıtlı migration’ları uygular.
6. Web servisi `/api/ready` sonucuna göre sağlıklı kabul edilir.
7. Proxy etkinse Caddy alan adı için TLS sertifikasını yönetir.

## 3. Sağlık kontrolleri

Liveness:

```bash
curl -fsS https://arcates.com/api/health
```

Readiness:

```bash
curl -fsS https://arcates.com/api/ready
```

`/api/health` uygulama işleminin yanıt verdiğini, `/api/ready` ise PostgreSQL bağımlılığının kullanılabilir olduğunu gösterir.

## 4. Korumalı metrikler

Metrik ucu yalnızca doğru bearer token ile yanıt verir:

```bash
curl -fsS \
  -H "Authorization: Bearer $METRICS_TOKEN" \
  https://arcates.com/api/metrics
```

Prometheus uyumlu metrikler:

- Uygulama hazır durumu
- Veritabanı sorgu süresi
- Toplam kullanıcı sayısı
- Aktif proje sayısı
- Açık destek kayıtları
- Temsilci bekleyen konuşmalar
- Başarısız webhook olayları
- Aktif oran sınırlama kovaları

Metrik tokenı URL parametresi olarak kullanılmamalı ve erişim loglarına yazılmamalıdır.

## 5. PostgreSQL yedeği

Manuel yedek:

```bash
bash ops/backup-postgres.sh
```

Farklı yedek dizini ve saklama süresi:

```bash
BACKUP_DIR=/srv/arcates-backups RETENTION_DAYS=30 bash ops/backup-postgres.sh
```

Her yedek için PostgreSQL custom-format dosyası ve SHA-256 checksum oluşturulur. Yedek dizini uygulama sunucusundan bağımsız ikinci bir konuma kopyalanmalıdır.

Örnek günlük cron kaydı:

```cron
15 3 * * * cd /srv/arcates && BACKUP_DIR=/srv/backups/arcates RETENTION_DAYS=30 bash ops/backup-postgres.sh >> /var/log/arcates-backup.log 2>&1
```

## 6. Geri yükleme

Geri yükleme mevcut veritabanındaki nesneleri değiştirebilen tehlikeli bir işlemdir. Açık onay değişkeni olmadan script çalışmaz:

```bash
RESTORE_CONFIRM=ARCATES_RESTORE \
  bash ops/restore-postgres.sh backups/arcates-YYYYMMDDTHHMMSSZ.dump
```

Akış:

1. Yedek dosyası ve varsa checksum doğrulanır.
2. Web servisi durdurulur.
3. PostgreSQL custom-format yedeği geri yüklenir.
4. Eksik migration’lar uygulanır.
5. Web servisi yeniden başlatılır.

Geri yükleme prosedürü düzenli olarak ayrı bir test ortamında denenmelidir.

## 7. Güncelleme ve geri dönüş

Yeni sürüm öncesinde:

```bash
bash ops/backup-postgres.sh
bash ops/deploy.sh
```

Uygulama imajında sorun varsa önceki Git commitine dönülüp yeniden build yapılabilir. Veritabanı migration’ları geriye doğru otomatik alınmamalıdır; veri değişiklikleri için ileri yönlü düzeltme migration’ı tercih edilmelidir.

## 8. Minimum sunucu güvenliği

- SSH parola girişi kapatılmalı, anahtar tabanlı erişim kullanılmalıdır.
- 22, 80 ve 443 dışındaki internet portları varsayılan olarak kapalı tutulmalıdır.
- PostgreSQL portu internete açılmamalıdır.
- `.env.production` yalnızca yetkili sistem kullanıcısı tarafından okunmalıdır.
- Docker ve işletim sistemi güvenlik güncellemeleri düzenli uygulanmalıdır.
- Yedeklerin en az bir kopyası sunucu dışında tutulmalıdır.
- Metrikler ve loglar için erişim kontrolü uygulanmalıdır.
