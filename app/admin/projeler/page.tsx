import type { Metadata } from "next";
import Link from "next/link";
import { createProjectAction, updateProjectAction } from "@/app/admin/projeler/actions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proje Yönetimi",
  robots: { index: false, follow: false },
};

type ProjectAdminPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

const projectStatuses = [
  ["DISCOVERY", "Keşif"],
  ["PLANNING", "Planlama"],
  ["DESIGN", "Tasarım"],
  ["DEVELOPMENT", "Geliştirme"],
  ["VALIDATION", "Doğrulama"],
  ["LIVE", "Canlı"],
  ["PAUSED", "Duraklatıldı"],
  ["COMPLETED", "Tamamlandı"],
] as const;

export default async function ProjectAdminPage({ searchParams }: ProjectAdminPageProps) {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const { success, error } = await searchParams;
  const [organizations, projects] = await Promise.all([
    db.organization.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { members: true, projects: true } } } }),
    db.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: { organization: { select: { name: true } }, _count: { select: { members: true, supportTickets: true } } },
    }),
  ]);

  const canCreate = user.role === "ADMIN" || user.role === "OWNER";

  return (
    <main className="portal-shell">
      <div className="container">
        <header className="portal-main__header knowledge-header">
          <div>
            <span className="eyebrow">Operasyon yönetimi</span>
            <h1>Projeler</h1>
            <p>Müşteri kuruluşlarına proje açın; durum, ilerleme ve hedef tarihleri tek alandan yönetin.</p>
          </div>
          <Link className="button button--secondary" href="/admin">Yönetim Paneline Dön</Link>
        </header>

        {success ? <div className="form-alert form-alert--success" role="status">{success}</div> : null}
        {error ? <div className="form-alert form-alert--error" role="alert">{error}</div> : null}

        <div className="knowledge-layout page-section">
          <section className="knowledge-panel knowledge-panel--sticky">
            <span className="eyebrow">Yeni proje</span>
            <h2>Projeyi müşteri hesabına bağlayın</h2>
            {canCreate ? (
              <form action={createProjectAction} className="request-form">
                <div className="request-form__grid">
                  <label className="request-form__full">
                    <span>Müşteri kuruluşu</span>
                    <select name="organizationId" defaultValue="" required>
                      <option value="" disabled>Kuruluş seçin</option>
                      {organizations.map((organization) => (
                        <option value={organization.id} key={organization.id}>
                          {organization.name} · {organization._count.members} kullanıcı
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="request-form__full"><span>Proje adı</span><input name="name" type="text" minLength={3} maxLength={160} required /></label>
                  <label className="request-form__full"><span>Slug</span><input name="slug" type="text" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="ornek-web-projesi" required /></label>
                  <label className="request-form__full"><span>Hedef tarih</span><input name="targetDate" type="date" /></label>
                  <label className="request-form__full"><span>Proje açıklaması</span><textarea name="description" rows={7} maxLength={5000} /></label>
                </div>
                <button className="button button--primary auth-submit" type="submit">Projeyi Oluştur</button>
              </form>
            ) : <div className="dashboard-empty"><p>Proje oluşturma işlemi yalnızca ADMIN veya OWNER rolüyle kullanılabilir.</p></div>}
          </section>

          <section className="knowledge-panel">
            <span className="eyebrow">Aktif portföy</span>
            <h2>{projects.length} proje</h2>
            <div className="operations-list">
              {projects.length ? projects.map((project) => (
                <article className="operation-card" key={project.id}>
                  <div className="operation-card__header">
                    <div><strong>{project.name}</strong><small>{project.organization.name} · {project._count.members} üye · {project._count.supportTickets} destek kaydı</small></div>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="dashboard-progress"><i style={{ width: `${project.progress}%` }} /></div>
                  <form action={updateProjectAction} className="operation-form">
                    <input type="hidden" name="projectId" value={project.id} />
                    <label><span>Durum</span><select name="status" defaultValue={project.status}>{projectStatuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                    <label><span>İlerleme</span><input name="progress" type="number" min={0} max={100} defaultValue={project.progress} required /></label>
                    <label><span>Hedef tarih</span><input name="targetDate" type="date" defaultValue={project.targetDate ? project.targetDate.toISOString().slice(0, 10) : ""} /></label>
                    <button className="button button--secondary" type="submit">Güncelle</button>
                  </form>
                </article>
              )) : <div className="dashboard-empty"><strong>Henüz proje yok</strong><p>İlk müşteri projesini soldaki formdan oluşturun.</p></div>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
