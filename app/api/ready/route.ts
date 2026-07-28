import { NextResponse } from "next/server";
import { databaseConfigured, db } from "@/lib/db";
import { whatsappConfigured } from "@/lib/whatsapp/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    database: false,
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim() && process.env.OPENAI_MODEL?.trim()),
    whatsappConfigured: whatsappConfigured(),
  };

  if (databaseConfigured()) {
    try {
      await db.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      console.error("Readiness database check failed", error);
    }
  }

  const ready = checks.database;
  return NextResponse.json({
    status: ready ? "ready" : "not_ready",
    checks,
    timestamp: new Date().toISOString(),
  }, {
    status: ready ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
