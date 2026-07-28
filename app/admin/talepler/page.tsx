import type { Metadata } from "next";
import Link from "next/link";
import { updateLeadStatusAction } from "@/app/admin/talepler/actions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proje Talepleri",
  robots: { index: false, follow: false },
};

type LeadsPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

const leadStatuses = [
  ["NEW", "Yeni"],
  ["CONTACTED", "İletişime geçildi"],
  ["QUALIFIED", "Nitelikli talep"],
  ["PROPOSAL", "Teklif gönderildi"],
  ["WON", "Kazanıldı"],
  ["LOST", "Kaybedildi"],
] as const;

const moneyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const { success, error } = await searchParams;
  const leads = await db.lead.findMany({
    orderBy: { updatedAt: "desc" },
    include: { contact: true },
  });

  return (
    <main className="portal-shell">
      <div className="container">
        <header className="portal-main__header knowledge-header">
          <div>
            <span className="eyebrow">Satış operasyonu</span>
            <h1>Proje Talepleri</h1>
            <p>Web sitesi ve chatbot üzerinden gelen talepleri değerlendirme, teklif ve sonuç aşamalarında yönetin.</p>
          </div>
          <Link className="button button--secondary" href="/admin">Yönetim Paneline Dön</Link>
        </header>

        {success ? <div className="form-alert form-alert--success" role="status">{success}</div> : null}
        {error ? <div className="form-alert form-alert--error" role="alert">{error}</div> : null}

        <section className="knowledge-panel page-section">
          <div className="portal-wide-card__header">
            <div><span className="eyebrow">Satış hattı</span><h2>{leads.length} talep</h2></div>
          </div>
          <div className="operations-list">
            {leads.length ? leads.map((lead) => (
              <article className="operation-card" key={lead.id}>
                <div className="operation-card__header">
                  <div>
                    <strong>{lead.title}</strong>
                    <small>{lead.contact.company || lead.contact.name} · {lead.service || "Çözüm belirtilmedi"}</small>
                  </div>
                  <span>{lead.budget != null ? moneyFormatter.format(lead.budget) : "Bütçe yok"}</span>
                </div>
                <p>{lead.description}</p>
                <div className="operation-meta">
                  <span>{lead.contact.email || "E-posta yok"}</span>
                  <span>{lead.contact.phone || "Telefon yok"}</span>
                  <span>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(lead.createdAt)}</span>
                </div>
                <form action={updateLeadStatusAction} className="operation-form operation-form--compact">
                  <input type="hidden" name="leadId" value={lead.id} />
                  <label><span>Satış aşaması</span><select name="status" defaultValue={lead.status}>{leadStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <button className="button button--secondary" type="submit">Aşamayı Güncelle</button>
                </form>
              </article>
            )) : <div className="dashboard-empty"><strong>Henüz talep yok</strong><p>Teklif formundan gelen proje talepleri burada listelenecek.</p></div>}
          </div>
        </section>
      </div>
    </main>
  );
}
