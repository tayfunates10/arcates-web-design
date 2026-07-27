import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && expectedToken && token === expectedToken && challenge) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  return NextResponse.json({ error: "Webhook doğrulanamadı." }, { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (appSecret && !isValidSignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ error: "Geçersiz webhook imzası." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Geçersiz webhook verisi." }, { status: 400 });
  }

  // Üretim aşamasında payload önce idempotency anahtarıyla event store'a yazılacak,
  // ardından kuyruk üzerinden ortak konuşma motoruna aktarılacaktır.
  console.info("whatsapp_webhook_received", summarizePayload(payload));

  return NextResponse.json({ received: true });
}

function isValidSignature(body: string, signature: string | null, secret: string) {
  if (!signature?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const actual = signature.slice("sha256=".length);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(actual, "utf8"));
}

function summarizePayload(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return { object: "unknown" };
  const data = payload as { object?: unknown; entry?: unknown[] };
  return { object: String(data.object ?? "unknown"), entryCount: Array.isArray(data.entry) ? data.entry.length : 0 };
}
