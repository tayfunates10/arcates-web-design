import type { Metadata } from "next";
import Link from "next/link";
import { updateSupportTicketAction } from "@/app/admin/destek/actions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destek Operasyonları",
  robots: { index: false, follow: false },
};

type SupportAdminPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

const statuses = [
  ["OPEN", "Açık"],
  ["IN_PROGRESS", "İşlemde"],
  ["WAITING_CUSTOMER", "Müşteri yanıtı bekleniyor"],
  ["RESOLVED", "Çözüldü"],
  ["CLOSED", "Kapatıldı"],
] as const;

const priorities = [
  ["LOW", "Düşük"],
  ["NORMAL", "Normal"],
  ["HIGH", "Yüksek"],
  ["URGENT", "Acil"],
] as const;

export default async function SupportAdminPage({ searchParams }: SupportAdminPageProps) {
  await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const { success, error } = await searchParams;
  const tickets = await db.supportTicket.findMany({
    orderBy: [{ status: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
    include: {
      requester: { select: { name: true, email: true } },
      organization: { select: { name: true } },
      project: { select: { name: true } },
    },
  });

  return (
    <main className="portal-shell">
      <div className="container">
        <header className="portal-main__header knowledge-header">
          <div>
            <span className="eyebrow">Destek operasyonu</span>
            <h1>Destek Kayıtları</h1>
            <p>Müşteri ve chatbot tarafından oluşturulan kayıtların öncelik ve çözüm durumunu yönetin.</p>
          </div>
          <Link className="button button--secondary" href="/admin">Yönetim Paneline Dön</Link>
        </header>

        {success ? <div className="form-alert form-alert--success" role="status">{success}</div> : null}
        {error ? <div className="form-alert form-alert--error" role="alert">{error}</div> : null}

        <section className="knowledge-panel page-section">
          <div className="portal-wide-card__header">
            <div><span className="eyebrow">Destek hattı</span><h2>{tickets.length} kayıt</h2></div>
          </div>
          <div className="operations-list">
            {tickets.length ? tickets.map((ticket) => (
              <article className="operation-card" key={ticket.id}>
                <div className="operation-card__header">
                  <div>
                    <strong>{ticket.title}</strong>
                    <small>{ticket.organization?.name || "Kuruluş yok"} · {ticket.project?.name || "Genel destek"}</small>
                  </div>
                  <span>{ticket.priority}</span>
                </div>
                <p>{ticket.description}</p>
                <div className="operation-meta">
                  <span>{ticket.requester.name}</span>
                  <span>{ticket.requester.email}</span>
                  <span>Referans: {ticket.id}</span>
                  <span>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(ticket.updatedAt)}</span>
                </div>
                <form action={updateSupportTicketAction} className="operation-form operation-form--compact">
                  <input type="hidden" name="ticketId" value={ticket.id} />
                  <label><span>Durum</span><select name="status" defaultValue={ticket.status}>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label><span>Öncelik</span><select name="priority" defaultValue={ticket.priority}>{priorities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <button className="button button--secondary" type="submit">Kaydı Güncelle</button>
                </form>
              </article>
            )) : <div className="dashboard-empty"><strong>Destek kaydı yok</strong><p>Müşteri paneli veya chatbot üzerinden oluşturulan destek kayıtları burada görünür.</p></div>}
          </div>
        </section>
      </div>
    </main>
  );
}
