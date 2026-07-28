import { NextResponse } from "next/server";
import { destroyCurrentSession } from "@/lib/auth/session";

function publicRedirectUrl(path: string, request: Request) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl = configuredSiteUrl || request.url;
  return new URL(path, baseUrl);
}

export async function POST(request: Request) {
  await destroyCurrentSession();
  return NextResponse.redirect(publicRedirectUrl("/giris", request), 303);
}

export async function GET(request: Request) {
  return NextResponse.redirect(publicRedirectUrl("/hesabim", request), 303);
}
