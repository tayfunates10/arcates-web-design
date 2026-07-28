#!/usr/bin/env bash
set -Eeuo pipefail

ENV_FILE="${ENV_FILE:-.env.production}"
BACKUP_PATH="${1:-}"

if [[ -z "$BACKUP_PATH" ]]; then
  echo "Kullanım: RESTORE_CONFIRM=ARCATES_RESTORE bash ops/restore-postgres.sh backups/arcates-....dump" >&2
  exit 1
fi

if [[ "${RESTORE_CONFIRM:-}" != "ARCATES_RESTORE" ]]; then
  echo "Geri yükleme için RESTORE_CONFIRM=ARCATES_RESTORE açık onayı zorunludur." >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Ortam dosyası bulunamadı: $ENV_FILE" >&2
  exit 1
fi

if [[ ! -s "$BACKUP_PATH" ]]; then
  echo "Geçerli ve dolu bir yedek dosyası bulunamadı: $BACKUP_PATH" >&2
  exit 1
fi

checksum_path="$BACKUP_PATH.sha256"
if [[ -f "$checksum_path" ]]; then
  sha256sum --check "$checksum_path"
else
  echo "Uyarı: checksum dosyası bulunamadı; bütünlük doğrulaması atlandı." >&2
fi

compose=(docker compose --env-file "$ENV_FILE" -f docker-compose.yml)
web_was_stopped=false

restart_web() {
  if [[ "$web_was_stopped" == "true" ]]; then
    "${compose[@]}" start web >/dev/null 2>&1 || true
  fi
}
trap restart_web EXIT

"${compose[@]}" up -d db
"${compose[@]}" stop web >/dev/null 2>&1 || true
web_was_stopped=true

echo "Veritabanı geri yükleniyor: $BACKUP_PATH"
cat "$BACKUP_PATH" | "${compose[@]}" exec -T db sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges --exit-on-error'

"${compose[@]}" run --rm migrate
"${compose[@]}" start web
web_was_stopped=false
trap - EXIT

echo "Geri yükleme ve migration doğrulaması tamamlandı."
