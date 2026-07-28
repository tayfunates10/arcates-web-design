#!/usr/bin/env bash
set -Eeuo pipefail

ENV_FILE="${ENV_FILE:-.env.production}"
BACKUP_DIR="${BACKUP_DIR:-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Ortam dosyası bulunamadı: $ENV_FILE" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_path="$BACKUP_DIR/arcates-$timestamp.dump"
temporary_path="$backup_path.partial"

cleanup() {
  rm -f "$temporary_path"
}
trap cleanup EXIT

echo "PostgreSQL yedeği oluşturuluyor: $backup_path"
docker compose --env-file "$ENV_FILE" -f docker-compose.yml exec -T db sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --compress=9 --no-owner --no-privileges' \
  > "$temporary_path"

if [[ ! -s "$temporary_path" ]]; then
  echo "Yedek dosyası boş oluşturuldu; işlem iptal edildi." >&2
  exit 1
fi

mv "$temporary_path" "$backup_path"
chmod 600 "$backup_path"
sha256sum "$backup_path" > "$backup_path.sha256"
chmod 600 "$backup_path.sha256"

find "$BACKUP_DIR" -type f \( -name 'arcates-*.dump' -o -name 'arcates-*.dump.sha256' \) \
  -mtime "+$RETENTION_DAYS" -delete

trap - EXIT
echo "Yedek tamamlandı: $backup_path"
