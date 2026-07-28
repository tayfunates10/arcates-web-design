#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${BASE_URL:-}}"
ALLOW_HTTP="${ALLOW_HTTP:-false}"
ALLOW_PRIVATE_TARGET="${ALLOW_PRIVATE_TARGET:-false}"
METRICS_TOKEN="${METRICS_TOKEN:-}"

if [[ -z "$BASE_URL" ]]; then
  echo "Usage: BASE_URL=https://arcates.example bash ops/smoke-test.sh" >&2
  exit 64
fi

BASE_URL="${BASE_URL%/}"

readarray -t URL_PARTS < <(node -e '
  const raw = process.argv[1];
  try {
    const url = new URL(raw);
    console.log(url.protocol);
    console.log(url.hostname);
  } catch {
    process.exit(2);
  }
' "$BASE_URL") || {
  echo "BASE_URL is not a valid absolute URL." >&2
  exit 64
}

PROTOCOL="${URL_PARTS[0]}"
HOSTNAME="${URL_PARTS[1]}"

if [[ "$PROTOCOL" != "https:" && "$ALLOW_HTTP" != "true" ]]; then
  echo "Smoke tests require HTTPS. Set ALLOW_HTTP=true only for local testing." >&2
  exit 64
fi

if [[ "$ALLOW_PRIVATE_TARGET" != "true" ]]; then
  if [[ "$HOSTNAME" == "localhost" || "$HOSTNAME" == "127.0.0.1" || "$HOSTNAME" == "::1" ]]; then
    echo "Local targets are blocked. Set ALLOW_PRIVATE_TARGET=true for local testing." >&2
    exit 64
  fi
  if [[ "$HOSTNAME" =~ ^10\. || "$HOSTNAME" =~ ^192\.168\. || "$HOSTNAME" =~ ^172\.(1[6-9]|2[0-9]|3[0-1])\. ]]; then
    echo "Private network targets are blocked by default." >&2
    exit 64
  fi
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

request() {
  local name="$1"
  local path="$2"
  local body_file="$TMP_DIR/${name}.body"
  local header_file="$TMP_DIR/${name}.headers"
  shift 2

  echo "Checking ${path}"
  curl \
    --fail \
    --silent \
    --show-error \
    --location \
    --connect-timeout 10 \
    --max-time 30 \
    --retry 3 \
    --retry-delay 2 \
    --retry-all-errors \
    --dump-header "$header_file" \
    --output "$body_file" \
    "$@" \
    "${BASE_URL}${path}"
}

request health "/api/health"
grep -Eq '"status"[[:space:]]*:[[:space:]]*"ok"' "$TMP_DIR/health.body" || {
  echo "Health endpoint did not return status=ok." >&2
  exit 1
}
grep -Eiq '^cache-control:.*no-store' "$TMP_DIR/health.headers" || {
  echo "Health endpoint is missing Cache-Control: no-store." >&2
  exit 1
}

request ready "/api/ready"
grep -Eq '"status"[[:space:]]*:[[:space:]]*"ready"' "$TMP_DIR/ready.body" || {
  echo "Readiness endpoint did not return status=ready." >&2
  exit 1
}

request home "/"
grep -Eiq 'arcates' "$TMP_DIR/home.body" || {
  echo "Home page does not contain the Arcates brand." >&2
  exit 1
}
grep -Eiq '^x-content-type-options:[[:space:]]*nosniff' "$TMP_DIR/home.headers" || {
  echo "Home page is missing X-Content-Type-Options: nosniff." >&2
  exit 1
}

grep -Eiq '^referrer-policy:' "$TMP_DIR/home.headers" || {
  echo "Home page is missing Referrer-Policy." >&2
  exit 1
}

request robots "/robots.txt"
grep -Eiq 'sitemap:' "$TMP_DIR/robots.body" || {
  echo "robots.txt does not reference a sitemap." >&2
  exit 1
}

request sitemap "/sitemap.xml"
grep -Eiq '<urlset|<sitemapindex' "$TMP_DIR/sitemap.body" || {
  echo "sitemap.xml is not a valid sitemap document." >&2
  exit 1
}

if [[ -n "$METRICS_TOKEN" ]]; then
  request metrics "/api/metrics" -H "Authorization: Bearer ${METRICS_TOKEN}"
  grep -Eq '^arcates_up[[:space:]]+1$' "$TMP_DIR/metrics.body" || {
    echo "Metrics endpoint did not report arcates_up 1." >&2
    exit 1
  }
else
  echo "Skipping protected metrics check because METRICS_TOKEN is not set."
fi

echo "All Arcates smoke tests passed for ${BASE_URL}."
