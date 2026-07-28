import type { Metadata } from "next";
import Link from "next/link";
import { deleteCmsContentAction, saveBlogAction, saveCaseStudyAction, saveFaqAction } from "@/app/admin/icerik/actions";
import { requireRole } from "@/lib/auth/session";
import { readCmsEnvelope, type CmsEnvelope } from "@/lib/cms/content";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İçerik Yönetimi",
  robots: { index: false, follow: false },
};

type ContentAdminPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

type CmsRecord = {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: Date;
  cms: CmsEnvelope;
};

export default async function ContentAdminPage({ searchParams }: ContentAdminPageProps) {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const { success, error } = await searchParams;
  const documents = await db.knowledgeDocument.findMany({
    select: { id: true, slug: true, title: true, content: true, metadata: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });
  const records: CmsRecord[] = documents.flatMap((document) => {
    const cms = readCmsEnvelope(document.metadata);
    return cms ? [{ id: document.id, slug: document.slug, title: document.title, content: document.content, updatedAt: document.updatedAt, cms }] : [];
  });
  const blogs = records.filter((record) => record.cms.kind === "BLOG");
  const cases = records.filter((record) => record.cms.kind === "CASE_STUDY");
  const faqs = records.filter((record) => record.cms.kind === "FAQ").sort((left, right) => (left.cms.sortOrder ?? 0) - (right.cms.sortOrder ?? 0));
  const canDelete = user.role === "ADMIN" || user.role === "OWNER";

  return (
    <main className="portal-shell">
      <div className="container">
        <header className="portal-main__header knowledge-header">
          <div>
            <span className="eyebrow">Yayın merkezi</span>
            <h1>İçerik Yönetimi</h1>
            <p>Blog, vaka çalışması ve SSS içeriklerini taslak, yayın ve arşiv durumlarıyla yönetin.</p>
          </div>
          <Link className="button button--secondary" href="/admin">Yönetim Paneline Dön</Link>
        </header>

        {success ? <div className="form-alert form-alert--success" role="status">{success}</div> : null}
        {error ? <div className="form-alert form-alert--error" role="alert">{error}</div> : null}

        <section className="portal-metrics">
          <div><span>Blog yazısı</span><strong>{blogs.length}</strong><small>{publishedCount(blogs)} yayında</small></div>
          <div><span>Vaka çalışması</span><strong>{cases.length}</strong><small>{publishedCount(cases)} yayında</small></div>
          <div><span>SSS kaydı</span><strong>{faqs.length}</strong><small>{publishedCount(faqs)} yayında</small></div>
        </section>

        <section className="knowledge-layout page-section">
          <div className="knowledge-panel knowledge-panel--sticky">
            <span className="eyebrow">Yeni içerik</span>
            <h2>Yayın kaydı oluşturun</h2>
            <details open><summary>Blog yazısı</summary><BlogForm /></details>
            <details><summary>Vaka çalışması</summary><CaseForm /></details>
            <details><summary>SSS kaydı</summary><FaqForm /></details>
          </div>

          <div className="knowledge-panel">
            <span className="eyebrow">İçerik arşivi</span>
            <h2>{records.length} yönetilebilir kayıt</h2>
            <ContentGroup title="Blog yazıları" records={blogs} canDelete={canDelete} />
            <ContentGroup title="Vaka çalışmaları" records={cases} canDelete={canDelete} />
            <ContentGroup title="Sık sorulan sorular" records={faqs} canDelete={canDelete} />
          </div>
        </section>
      </div>
    </main>
  );
}

function ContentGroup({ title, records, canDelete }: { title: string; records: CmsRecord[]; canDelete: boolean }) {
  return (
    <section className="operations-list">
      <h3>{title}</h3>
      {records.length ? records.map((record) => (
        <article className="operation-card" key={record.id}>
          <div className="operation-card__header">
            <div><strong>{record.title}</strong><small>/{record.slug} · {statusLabel(record.cms.status)} · {formatDate(record.updatedAt)}</small></div>
            <span>{record.cms.kind}</span>
          </div>
          <details>
            <summary>İçeriği düzenle</summary>
            {record.cms.kind === "BLOG" ? <BlogForm record={record} /> : record.cms.kind === "CASE_STUDY" ? <CaseForm record={record} /> : <FaqForm record={record} />}
          </details>
          {canDelete ? <form action={deleteCmsContentAction}><input type="hidden" name="id" value={record.id} /><button className="button button--secondary" type="submit">Kalıcı Olarak Sil</button></form> : null}
        </article>
      )) : <div className="dashboard-empty"><p>Bu içerik türünde henüz kayıt bulunmuyor.</p></div>}
    </section>
  );
}

function BlogForm({ record }: { record?: CmsRecord }) {
  return (
    <form action={saveBlogAction} className="request-form">
      <input type="hidden" name="id" value={record?.id ?? ""} />
      <div className="request-form__grid">
        <label><span>Başlık</span><input name="title" defaultValue={record?.title} minLength={4} maxLength={180} required /></label>
        <label><span>Slug</span><input name="slug" defaultValue={record?.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
        <label><span>Kategori</span><input name="category" defaultValue={record?.cms.category ?? "Rehber"} required /></label>
        <label><span>Okuma süresi</span><input name="readingTime" defaultValue={record?.cms.readingTime ?? "6 dakika"} required /></label>
        <label className="request-form__full"><span>Kısa özet</span><textarea name="excerpt" rows={3} defaultValue={record?.cms.excerpt} required /></label>
        <label className="request-form__full"><span>İçerik</span><textarea name="content" rows={14} defaultValue={record?.content} placeholder="Başlıklar için ## kullanabilirsiniz." required /></label>
        <SeoFields record={record} />
        <StatusField value={record?.cms.status} />
      </div>
      <button className="button button--primary auth-submit" type="submit">{record ? "Blog Yazısını Güncelle" : "Blog Yazısı Oluştur"}</button>
    </form>
  );
}

function CaseForm({ record }: { record?: CmsRecord }) {
  return (
    <form action={saveCaseStudyAction} className="request-form">
      <input type="hidden" name="id" value={record?.id ?? ""} />
      <div className="request-form__grid">
        <label><span>Başlık</span><input name="title" defaultValue={record?.title} required /></label>
        <label><span>Slug</span><input name="slug" defaultValue={record?.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
        <label className="request-form__full"><span>Kategori</span><input name="category" defaultValue={record?.cms.category ?? "Dijital Ürün"} required /></label>
        <label className="request-form__full"><span>Kısa özet</span><textarea name="excerpt" rows={3} defaultValue={record?.cms.excerpt} required /></label>
        <label className="request-form__full"><span>Başlangıç problemi</span><textarea name="problem" rows={4} defaultValue={record?.cms.problem} required /></label>
        <label className="request-form__full"><span>Çözüm yaklaşımı</span><textarea name="solution" rows={4} defaultValue={record?.cms.solution} required /></label>
        <label className="request-form__full"><span>Teknik sistem</span><textarea name="technical" rows={6} defaultValue={record?.cms.technical ?? record?.content} required /></label>
        <label className="request-form__full"><span>Sonuç</span><textarea name="result" rows={4} defaultValue={record?.cms.result} required /></label>
        <label className="request-form__full"><span>Metrikler — her satıra bir değer</span><textarea name="metrics" rows={4} defaultValue={record?.cms.metrics?.join("\n")} required /></label>
        <SeoFields record={record} />
        <StatusField value={record?.cms.status} />
      </div>
      <button className="button button--primary auth-submit" type="submit">{record ? "Vaka Çalışmasını Güncelle" : "Vaka Çalışması Oluştur"}</button>
    </form>
  );
}

function FaqForm({ record }: { record?: CmsRecord }) {
  return (
    <form action={saveFaqAction} className="request-form">
      <input type="hidden" name="id" value={record?.id ?? ""} />
      <div className="request-form__grid">
        <label className="request-form__full"><span>Soru</span><input name="title" defaultValue={record?.title} required /></label>
        <label><span>Slug</span><input name="slug" defaultValue={record?.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
        <label><span>Sıra</span><input name="sortOrder" type="number" min={0} max={10000} defaultValue={record?.cms.sortOrder ?? 0} required /></label>
        <label className="request-form__full"><span>Yanıt</span><textarea name="content" rows={6} defaultValue={record?.content} required /></label>
        <input type="hidden" name="seoTitle" value="" /><input type="hidden" name="seoDescription" value="" />
        <StatusField value={record?.cms.status} />
      </div>
      <button className="button button--primary auth-submit" type="submit">{record ? "SSS Kaydını Güncelle" : "SSS Kaydı Oluştur"}</button>
    </form>
  );
}

function SeoFields({ record }: { record?: CmsRecord }) {
  return <><label><span>SEO başlığı</span><input name="seoTitle" defaultValue={record?.cms.seoTitle ?? ""} maxLength={180} /></label><label><span>Meta açıklama</span><input name="seoDescription" defaultValue={record?.cms.seoDescription ?? ""} maxLength={320} /></label></>;
}

function StatusField({ value }: { value?: CmsEnvelope["status"] }) {
  return <label className="request-form__full"><span>Yayın durumu</span><select name="status" defaultValue={value ?? "DRAFT"}><option value="DRAFT">Taslak</option><option value="PUBLISHED">Yayınlanmış</option><option value="ARCHIVED">Arşivlenmiş</option></select></label>;
}

function publishedCount(records: CmsRecord[]) {
  return records.filter((record) => record.cms.status === "PUBLISHED").length;
}

function statusLabel(status: CmsEnvelope["status"]) {
  return status === "PUBLISHED" ? "Yayında" : status === "ARCHIVED" ? "Arşiv" : "Taslak";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
