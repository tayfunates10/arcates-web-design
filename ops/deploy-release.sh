#!/usr/bin/env bash
set -Eeuo pipefail

ENV_FILE="${ENV_FILE:-.env.production}"
WITH_PROXY="${WITH_PROXY:-true}"
RELEASE_TAG="${1:-${ARCATES_RELEASE_TAG:-}}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Environment file not found: $ENV_FILE" >&2
  exit 1
fi

if [[ -z "$RELEASE_TAG" ]]; then
  echo "Usage: bash ops/deploy-release.sh <release-tag>" >&2
  echo "Use an immutable tag such as 0.4.0 or sha-abcdef0." >&2
  exit 64
fi

if [[ ! "$RELEASE_TAG" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$ && ! "$RELEASE_TAG" =~ ^sha-[0-9a-f]{7,64}$ ]]; then
  echo "Release tag must be a semantic version or an immutable sha-* tag." >&2
  exit 64
fi

export ARCATES_RELEASE_TAG="$RELEASE_TAG"
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
"${compose[@]}" pull db migrate web
"${compose[@]}" up -d db
"${compose[@]}" run --rm --no-deps migrate
"${compose[@]}" up -d --no-deps --no-build --remove-orphans web

if [[ "$WITH_PROXY" == "true" ]]; then
  "${compose[@]}" up -d --no-deps --no-build proxy
fi

web_id="$("${compose[@]}" ps -q web)"
if [[ -z "$web_id" ]]; then
  echo "Web container was not created." >&2
  exit 1
fi

for attempt in $(seq 1 30); do
  status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$web_id")"
  if [[ "$status" == "healthy" ]]; then
    echo "Arcates release ${RELEASE_TAG} is healthy."
    "${compose[@]}" ps
    exit 0
  fi
  if [[ "$status" == "unhealthy" || "$status" == "exited" || "$status" == "dead" ]]; then
    echo "Web container entered state: ${status}" >&2
    "${compose[@]}" logs --tail=120 web >&2
    exit 1
  fi
  echo "Waiting for web readiness (${attempt}/30, state=${status})"
  sleep 5
done

echo "Timed out waiting for web readiness." >&2
"${compose[@]}" logs --tail=120 web >&2
exit 1
