import type { Metadata } from "next";
import Link from "next/link";
import { createKnowledgeDocumentAction, deleteKnowledgeDocumentAction } from "@/app/admin/bilgi-tabani/actions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bilgi Tabanı Yönetimi",
  robots: { index: false, follow: false },
};

type KnowledgePageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

const visibilityLabels = {
  PUBLIC: "Genel ziyaretçi",
  CUSTOMER: "Giriş yapan müşteri",
  PROJECT_PRIVATE: "Yalnızca proje üyeleri",
  INTERNAL: "Yalnızca iç ekip",
} as const;

export default async function KnowledgeBaseAdminPage({ searchParams }: KnowledgePageProps) {
  await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const { success, error } = await searchParams;

  const [documents, projects] = await Promise.all([
    db.knowledgeDocument.findMany({
      orderBy: { updatedAt: "desc" },
      include: { project: { select: { name: true } } },
    }),
    db.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="portal-shell">
      <div className="container">
        <header className="portal-main__header knowledge-header">
          <div>
            <span className="eyebrow">AI içerik yönetimi</span>
            <h1>Bilgi Tabanı</h1>
            <p>Web ve WhatsApp asistanlarının kullanabileceği doğrulanmış içerikleri erişim düzeyleriyle yönetin.</p>
          </div>
          <Link className="button button--secondary" href="/admin">Yönetim Paneline Dön</Link>
        </header>

        {success ? <div className="form-alert form-alert--success" role="status">{success}</div> : null}
        {error ? <div className="form-alert form-alert--error" role="alert">{error}</div> : null}

        <div className="knowledge-layout page-section">
          <section className="knowledge-panel knowledge-panel--sticky">
            <span className="eyebrow">Yeni kaynak</span>
            <h2>Doğrulanmış bilgi ekleyin</h2>
            <form action={createKnowledgeDocumentAction} className="request-form">
              <div className="request-form__grid">
                <label className="request-form__full">
                  <span>Başlık</span>
                  <input name="title" type="text" minLength={4} maxLength={160} required />
                </label>
                <label className="request-form__full">
                  <span>Slug</span>
                  <input name="slug" type="text" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" minLength={3} maxLength={160} placeholder="kurumsal-web-sureci" required />
                </label>
                <label>
                  <span>Erişim düzeyi</span>
                  <select name="visibility" defaultValue="PUBLIC">
                    {Object.entries(visibilityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label>
                  <span>İlgili proje</span>
                  <select name="projectId" defaultValue="">
                    <option value="">Genel bilgi</option>
                    {projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}
                  </select>
                </label>
                <label className="request-form__full">
                  <span>Bilgi içeriği</span>
                  <textarea name="content" rows={13} minLength={40} maxLength={30000} required />
                </label>
              </div>
              <button className="button button--primary auth-submit" type="submit">Bilgi Belgesini Kaydet</button>
            </form>
          </section>

          <section className="knowledge-panel">
            <span className="eyebrow">Aktif kaynaklar</span>
            <h2>{documents.length} bilgi belgesi</h2>
            <div className="knowledge-list">
              {documents.length ? documents.map((document) => (
                <article className="knowledge-row" key={document.id}>
                  <div className="knowledge-row__content">
                    <strong>{document.title}</strong>
                    <p>{document.content}</p>
                    <div className="knowledge-row__meta">
                      <span>{visibilityLabels[document.visibility]}</span>
                      <span>{document.project?.name ?? "Genel"}</span>
                      <span>{document.slug}</span>
                      <span>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(document.updatedAt)}</span>
                    </div>
                  </div>
                  <form action={deleteKnowledgeDocumentAction}>
                    <input type="hidden" name="documentId" value={document.id} />
                    <button type="submit">Sil</button>
                  </form>
                </article>
              )) : <div className="dashboard-empty"><strong>Bilgi tabanı boş</strong><p>İlk doğrulanmış içeriği eklediğinizde chatbot bu kaynağı erişim kurallarına göre kullanabilir.</p></div>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
