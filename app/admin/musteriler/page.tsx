import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Müşteri Kuruluşları",
  robots: { index: false, follow: false },
};

export default async function CustomersAdminPage() {
  await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const organizations = await db.organization.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      members: { include: { user: { select: { name: true, email: true, role: true } } } },
      projects: { orderBy: { updatedAt: "desc" }, select: { id: true, name: true, status: true, progress: true } },
      _count: { select: { supportTickets: true, conversations: true } },
    },
  });

  return (
    <main className="portal-shell">
      <div className="container">
        <header className="portal-main__header knowledge-header">
          <div>
            <span className="eyebrow">Müşteri yönetimi</span>
            <h1>Kuruluşlar</h1>
            <p>Müşteri hesaplarını, üyeleri, projeleri, destek kayıtlarını ve konuşma kapsamını birlikte görüntüleyin.</p>
          </div>
          <Link className="button button--secondary" href="/admin">Yönetim Paneline Dön</Link>
        </header>

        <section className="knowledge-panel page-section">
          <div className="portal-wide-card__header">
            <div><span className="eyebrow">Müşteri dizini</span><h2>{organizations.length} kuruluş</h2></div>
            <Link className="text-link" href="/admin/projeler">Yeni proje oluştur</Link>
          </div>
          <div className="operations-list">
            {organizations.length ? organizations.map((organization) => (
              <article className="operation-card" key={organization.id}>
                <div className="operation-card__header">
                  <div><strong>{organization.name}</strong><small>{organization.slug}</small></div>
                  <span>{organization.projects.length} proje</span>
                </div>
                <div className="customer-summary-grid">
                  <div><span>Üyeler</span><strong>{organization.members.length}</strong></div>
                  <div><span>Destek kayıtları</span><strong>{organization._count.supportTickets}</strong></div>
                  <div><span>Konuşmalar</span><strong>{organization._count.conversations}</strong></div>
                </div>
                <div className="customer-members">
                  {organization.members.map((membership) => (
                    <div key={membership.id}>
                      <span>{membership.user.name}</span>
                      <small>{membership.user.email} · {membership.role}</small>
                    </div>
                  ))}
                </div>
                {organization.projects.length ? (
                  <div className="customer-projects">
                    {organization.projects.map((project) => (
                      <div key={project.id}>
                        <span>{project.name}</span>
                        <div className="dashboard-progress"><i style={{ width: `${project.progress}%` }} /></div>
                        <small>{project.status} · {project.progress}%</small>
                      </div>
                    ))}
                  </div>
                ) : <div className="dashboard-empty"><p>Bu kuruluş için henüz proje oluşturulmamış.</p></div>}
              </article>
            )) : <div className="dashboard-empty"><strong>Henüz müşteri kuruluşu yok</strong><p>Müşteri kayıt sayfasından hesap oluşturulduğunda kuruluş burada görünür.</p></div>}
          </div>
        </section>
      </div>
    </main>
  );
}
