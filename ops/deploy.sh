#!/usr/bin/env bash
set -Eeuo pipefail

ENV_FILE="${ENV_FILE:-.env.production}"
WITH_PROXY="${WITH_PROXY:-true}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Ortam dosyası bulunamadı: $ENV_FILE" >&2
  echo "Önce .env.production.example dosyasını kopyalayıp gerçek değerlerle doldurun." >&2
  exit 1
fi

compose=(docker compose --env-file "$ENV_FILE" -f docker-compose.yml)
if [[ "$WITH_PROXY" == "true" ]]; then
  compose+=(-f docker-compose.proxy.yml)
fi

"${compose[@]}" config --quiet
"${compose[@]}" pull db
"${compose[@]}" build migrate web
"${compose[@]}" up -d --remove-orphans
"${compose[@]}" ps

echo "Dağıtım başlatıldı. Sağlık durumunu kontrol edin:"
echo "  ${compose[*]} ps"
echo "  curl -fsS https://<alan-adiniz>/api/health"
