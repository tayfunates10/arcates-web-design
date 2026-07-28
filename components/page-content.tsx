import Link from "next/link";
import { CheckIcon } from "@/components/icons";
import { CtaBand, PageHero } from "@/components/page-general";
import type { BlogEntry, CaseStudyEntry, FaqEntry } from "@/lib/cms/content";
import { siteConfig } from "@/lib/site";

export function ProjectsPage({ projects }: { projects: CaseStudyEntry[] }) {
  return (
    <>
      <PageHero eyebrow="Projelerimiz" title="Sorunu, sistemi ve sonucu birlikte gösteren vaka çalışmaları." description="Her proje; başlangıç problemi, alınan kararlar, teknik yaklaşım ve doğrulanabilir çıktılar üzerinden anlatılır." />
      <section className="section page-section"><div className="container project-grid project-grid--listing">{projects.map((project, index) => <Link href={`/projelerimiz/${project.slug}`} className="project-card" key={project.slug}><div className={`project-card__visual project-card__visual--${(index % 3) + 1}`}><div className="project-card__window"><span /><span /><span /><div className="project-card__diagram"><i /><i /><i /><i /></div></div></div><div className="project-card__body"><span className="project-card__category">{project.category}</span><h2>{project.title}</h2><p>{project.summary}</p><div className="project-card__metrics">{project.metrics.map((metric) => <span key={metric}>{metric}</span>)}</div></div></Link>)}</div></section>
    </>
  );
}

export function ProjectDetail({ project }: { project: CaseStudyEntry }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    author: { "@type": "Organization", name: siteConfig.legalName },
    dateModified: project.updatedAt.toISOString(),
  };

  return (
    <>
      <PageHero eyebrow={project.category} title={project.title} description={project.summary} />
      <section className="section page-section"><div className="container case-study">
        <div className="case-study__visual"><div className="project-card__window project-card__window--large"><span /><span /><span /><div className="project-card__diagram"><i /><i /><i /><i /></div></div></div>
        <div className="case-study__grid">
          <article><span>01</span><h2>Başlangıç problemi</h2><p>{project.problem}</p></article>
          <article><span>02</span><h2>Çözüm yaklaşımı</h2><p>{project.solution}</p></article>
          <article><span>03</span><h2>Teknik sistem</h2><p>{project.technical}</p></article>
          <article><span>04</span><h2>Sonuç</h2><p>{project.result}</p></article>
        </div>
        <div className="case-study__metrics">{project.metrics.map((metric) => <div key={metric}><CheckIcon size={21} /><strong>{metric}</strong></div>)}</div>
      </div></section>
      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}

export function BlogPage({ posts }: { posts: BlogEntry[] }) {
  return (
    <>
      <PageHero eyebrow="Bilgi Merkezi" title="Web, yazılım ve yapay zekâ için uygulanabilir rehberler." description="Teknik kavramları iş kararlarına dönüştüren, kaynaklı ve güncellenebilir içerikler." />
      <section className="section page-section"><div className="container blog-grid blog-grid--listing">{posts.map((post) => <Link href={`/blog/${post.slug}`} className="blog-card" key={post.slug}><span>{post.category}</span><h2>{post.title}</h2><p>{post.excerpt}</p><small>{post.readingTime}</small></Link>)}</div></section>
    </>
  );
}

export function BlogDetail({ post }: { post: BlogEntry }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: siteConfig.legalName },
    dateModified: post.updatedAt.toISOString(),
  };

  return (
    <>
      <section className="article-hero"><div className="container article-hero__inner"><span>{post.category}</span><h1>{post.title}</h1><p>{post.excerpt}</p><small>{post.readingTime} okuma</small></div></section>
      <article className="article-body container">{renderArticle(post.content)}<div className="article-callout"><strong>Arcates yaklaşımı</strong><p>Her çözümü ihtiyaç, mimari, tasarım, geliştirme, doğrulama ve sürekli iyileştirme adımlarıyla ele alırız.</p></div></article>
      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}

export function FaqPage({ items }: { items: FaqEntry[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <PageHero eyebrow="Sık Sorulan Sorular" title="Proje, süreç, destek ve yapay zekâ hakkında açık yanıtlar." description="Yanıtlar içerik yönetiminden güncellenir ve yalnızca yayınlanmış kayıtlar gösterilir." />
      <section className="section page-section"><div className="container faq-list generic-faq">{items.map((item, index) => <details key={item.slug} open={index === 0}><summary>{item.question}<span /></summary><p>{item.answer}</p></details>)}</div></section>
      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}

function renderArticle(content: string) {
  return content.split(/\n\s*\n/).map((block, index) => {
    const value = block.trim();
    if (!value) return null;
    if (value.startsWith("## ")) return <h2 key={`${value}-${index}`}>{value.slice(3)}</h2>;
    return <p className={index === 0 ? "article-body__lead" : undefined} key={`${value.slice(0, 30)}-${index}`}>{value}</p>;
  });
}
