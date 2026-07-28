import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

export async function getRequestIp() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim()
    || requestHeaders.get("x-real-ip")?.trim()
    || "unknown";
}

export async function getHashedRequestIdentity(prefix = "ip") {
  const ip = await getRequestIp();
  const userAgent = (await headers()).get("user-agent")?.slice(0, 250) ?? "unknown";
  const pepper = process.env.RATE_LIMIT_SECRET?.trim() || "arcates-rate-limit-v1";
  return createHash("sha256").update(`${pepper}:${prefix}:${ip}:${userAgent}`).digest("hex");
}

export function isTrustedBrowserRequest(request: Request) {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const requestOrigin = new URL(request.url).origin;
    const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
      : requestOrigin;
    return origin === requestOrigin || origin === configuredOrigin;
  } catch {
    return false;
  }
}
