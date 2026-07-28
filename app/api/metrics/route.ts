import { timingSafeEqual } from "node:crypto";
import { databaseConfigured, db } from "@/lib/db";

export const dynamic = "force-dynamic";

function tokenMatches(request: Request) {
  const expected = process.env.METRICS_TOKEN?.trim();
  if (!expected) return false;

  const authorization = request.headers.get("authorization");
  const supplied = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : request.headers.get("x-metrics-token")?.trim();

  if (!supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length
    && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

function metric(name: string, help: string, value: number) {
  return `# HELP ${name} ${help}\n# TYPE ${name} gauge\n${name} ${value}`;
}

export async function GET(request: Request) {
  if (!tokenMatches(request)) {
    return new Response("Unauthorized\n", {
      status: 401,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "WWW-Authenticate": "Bearer",
      },
    });
  }

  if (!databaseConfigured()) {
    return new Response(`${metric("arcates_up", "Arcates application readiness", 0)}\n`, {
      status: 503,
      headers: { "Content-Type": "text/plain; version=0.0.4; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const startedAt = performance.now();
  try {
    const now = new Date();
    const [users, activeProjects, openTickets, waitingConversations, failedWebhooks, activeRateLimitBuckets] = await db.$transaction([
      db.user.count(),
      db.project.count({ where: { status: { notIn: ["PAUSED", "COMPLETED"] } } }),
      db.supportTicket.count({ where: { status: { notIn: ["RESOLVED", "CLOSED"] } } }),
      db.conversation.count({ where: { status: "WAITING" } }),
      db.webhookEvent.count({ where: { provider: "WHATSAPP", failedAt: { not: null }, processedAt: null } }),
      db.rateLimitBucket.count({ where: { expiresAt: { gt: now } } }),
    ]);
    const duration = Math.round((performance.now() - startedAt) * 1000) / 1000;

    const body = [
      metric("arcates_up", "Arcates application readiness", 1),
      metric("arcates_database_query_duration_ms", "Duration of the metrics database query in milliseconds", duration),
      metric("arcates_users_total", "Registered Arcates users", users),
      metric("arcates_projects_active", "Projects not paused or completed", activeProjects),
      metric("arcates_support_tickets_open", "Support tickets not resolved or closed", openTickets),
      metric("arcates_conversations_waiting", "Conversations waiting for a human agent", waitingConversations),
      metric("arcates_webhook_failures", "WhatsApp webhook events that failed before processing", failedWebhooks),
      metric("arcates_rate_limit_buckets_active", "Active rate limit buckets", activeRateLimitBuckets),
    ].join("\n");

    return new Response(`${body}\n`, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Metrics collection failed", error);
    return new Response(`${metric("arcates_up", "Arcates application readiness", 0)}\n`, {
      status: 503,
      headers: { "Content-Type": "text/plain; version=0.0.4; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}
