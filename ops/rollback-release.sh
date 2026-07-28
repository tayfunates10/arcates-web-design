#!/usr/bin/env bash
set -Eeuo pipefail

ENV_FILE="${ENV_FILE:-.env.production}"
WITH_PROXY="${WITH_PROXY:-true}"
TARGET_TAG="${1:-${ARCATES_ROLLBACK_TAG:-}}"
ROLLBACK_CONFIRM="${ROLLBACK_CONFIRM:-}"

if [[ "$ROLLBACK_CONFIRM" != "ARCATES_ROLLBACK" ]]; then
  echo "Rollback requires ROLLBACK_CONFIRM=ARCATES_ROLLBACK." >&2
  exit 64
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Environment file not found: $ENV_FILE" >&2
  exit 1
fi

if [[ -z "$TARGET_TAG" ]]; then
  echo "Usage: ROLLBACK_CONFIRM=ARCATES_ROLLBACK bash ops/rollback-release.sh <previous-tag>" >&2
  exit 64
fi

if [[ ! "$TARGET_TAG" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$ && ! "$TARGET_TAG" =~ ^sha-[0-9a-f]{7,64}$ ]]; then
  echo "Rollback target must be a semantic version or immutable sha-* tag." >&2
  exit 64
fi

export ARCATES_RELEASE_TAG="$TARGET_TAG"
compose=(
  docker compose
  --env-file "$ENV_FILE"
  -f docker-compose.yml
  -f docker-compose.registry.yml
)
if [[ "$WITH_PROXY" == "true" ]]; then
  compose+=(-f docker-compose.proxy.yml)
fi

"${compose[@]}" config --quiet
"${compose[@]}" pull web
"${compose[@]}" up -d --no-deps --no-build web

web_id="$("${compose[@]}" ps -q web)"
if [[ -z "$web_id" ]]; then
  echo "Web container was not created." >&2
  exit 1
fi

for attempt in $(seq 1 30); do
  status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$web_id")"
  if [[ "$status" == "healthy" ]]; then
    echo "Arcates web image rolled back to ${TARGET_TAG}."
    echo "Database migrations were intentionally not reverted."
    "${compose[@]}" ps
    exit 0
  fi
  if [[ "$status" == "unhealthy" || "$status" == "exited" || "$status" == "dead" ]]; then
    echo "Rollback target entered state: ${status}" >&2
    "${compose[@]}" logs --tail=120 web >&2
    exit 1
  fi
  echo "Waiting for rollback target (${attempt}/30, state=${status})"
  sleep 5
done

echo "Timed out waiting for rollback target readiness." >&2
"${compose[@]}" logs --tail=120 web >&2
exit 1
