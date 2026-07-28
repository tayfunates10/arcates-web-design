import { NextResponse } from "next/server";
import { destroyCurrentSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  await destroyCurrentSession();
  return NextResponse.redirect(new URL("/giris", request.url), 303);
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/hesabim", request.url), 303);
}
