import Link from "next/link";
import { CheckIcon } from "@/components/icons";
import { CtaBand, PageHero } from "@/components/page-general";
import { blogPosts, projects } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export function ProjectsPage() {
  return (
    <>
      <PageHero eyebrow="Projelerimiz" title="Sorunu, sistemi ve sonucu birlikte gösteren vaka çalışmaları." description="Her proje; başlangıç problemi, alınan kararlar, teknik yaklaşım ve doğrulanabilir çıktılar üzerinden anlatılır." />
      <section className="section page-section"><div className="container project-grid project-grid--listing">{projects.map((project, index) => <Link href={`/projelerimiz/${project.slug}`} className="project-card" key={project.slug}><div className={`project-card__visual project-card__visual--${index + 1}`}><div className="project-card__window"><span /><span /><span /><div className="project-card__diagram"><i /><i /><i /><i /></div></div></div><div className="project-card__body"><span className="project-card__category">{project.category}</span><h2>{project.title}</h2><p>{project.summary}</p><div className="project-card__metrics">{project.metrics.map((metric) => <span key={metric}>{metric}</span>)}</div></div></Link>)}</div></section>
    </>
  );
}

export function ProjectDetail({ project }: { project: (typeof projects)[number] }) {
  return (
    <>
      <PageHero eyebrow={project.category} title={project.title} description={project.summary} />
      <section className="section page-section"><div className="container case-study">
        <div className="case-study__visual"><div className="project-card__window project-card__window--large"><span /><span /><span /><div className="project-card__diagram"><i /><i /><i /><i /></div></div></div>
        <div className="case-study__grid">
          <article><span>01</span><h2>Başlangıç problemi</h2><p>Kullanıcı ihtiyacını, operasyon kısıtlarını ve kalite beklentisini tek bir ürün akışında birleştiren sürdürülebilir bir sistem gereksinimi.</p></article>
          <article><span>02</span><h2>Çözüm yaklaşımı</h2><p>Modüler mimari, doğrulama katmanları, yönetilebilir arayüz ve ölçülebilir performans hedefleriyle aşamalı geliştirme.</p></article>
          <article><span>03</span><h2>Teknik sistem</h2><p>Web uygulaması, görev akışları, veri modeli, güvenli servisler, raporlama ve üretim sonrası izleme birlikte tasarlandı.</p></article>
          <article><span>04</span><h2>Sonuç</h2><p>{project.result}</p></article>
        </div>
        <div className="case-study__metrics">{project.metrics.map((metric) => <div key={metric}><CheckIcon size={21} /><strong>{metric}</strong></div>)}</div>
      </div></section>
      <CtaBand />
    </>
  );
}

export function BlogPage() {
  return (
    <>
      <PageHero eyebrow="Bilgi Merkezi" title="Web, yazılım ve yapay zekâ için uygulanabilir rehberler." description="Teknik kavramları iş kararlarına dönüştüren, kaynaklı ve güncellenebilir içerikler." />
      <section className="section page-section"><div className="container blog-grid blog-grid--listing">{blogPosts.map((post) => <Link href={`/blog/${post.slug}`} className="blog-card" key={post.slug}><span>{post.category}</span><h2>{post.title}</h2><p>{post.excerpt}</p><small>{post.readingTime}</small></Link>)}</div></section>
    </>
  );
}

export function BlogDetail({ post }: { post: (typeof blogPosts)[number] }) {
  const schema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.excerpt, author: { "@type": "Organization", name: siteConfig.legalName } };
  return (
    <>
      <section className="article-hero"><div className="container article-hero__inner"><span>{post.category}</span><h1>{post.title}</h1><p>{post.excerpt}</p><small>{post.readingTime} okuma</small></div></section>
      <article className="article-body container">
        <p className="article-body__lead">Başarılı bir dijital sistem, görünüm ile teknik altyapının ayrı ayrı değil, aynı hedef doğrultusunda planlanmasıyla oluşur.</p>
        <h2>İlk olarak hedefi ve başarı ölçütünü tanımlayın</h2><p>Sayfa, özellik veya teknoloji seçmeden önce sistemin kim için, hangi problemi çözeceği ve başarının nasıl ölçüleceği açıklanmalıdır. Bu karar içerik mimarisini, kullanıcı akışını ve teknik kapsamı belirler.</p>
        <h2>Bilgi mimarisini kullanıcı niyetine göre kurun</h2><p>Kullanıcının hangi bilgiye hangi sırayla ihtiyaç duyduğunu belirlemek, menü ve sayfa listesinden daha önemlidir. Ana görevler kısa, anlaşılır ve kesintisiz akışlar halinde sunulmalıdır.</p>
        <h2>Performans ve SEO’yu geliştirme başlangıcına taşıyın</h2><p>Semantik HTML, sunucu tarafı içerik, doğru metadata, optimize görseller ve düşük istemci JavaScript’i sonradan yapılan iyileştirmeler değil, temel mimari kararlarıdır.</p>
        <h2>Otomasyonları yetki ve doğrulama ile sınırlandırın</h2><p>Chatbot veya iş akışı kullanıcı adına işlem yapacaksa okuma ve değiştirme araçları ayrılmalı, hassas işlemler açık onay istemeli ve her araç çağrısı denetim kaydına yazılmalıdır.</p>
        <div className="article-callout"><strong>Arcates yaklaşımı</strong><p>Her çözümü ihtiyaç, mimari, tasarım, geliştirme, doğrulama ve sürekli iyileştirme adımlarıyla ele alırız.</p></div>
      </article>
      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
