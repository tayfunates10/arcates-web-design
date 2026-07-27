import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ServiceIcon } from "@/components/icons";
import { DecisionSection, PageHero } from "@/components/page-general";
import { processSteps, services } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export function SolutionsPage() {
  return (
    <>
      <PageHero eyebrow="Web Çözümleri" title="İşletmenizin tamamına hizmet eden dijital altyapılar." description="Web tasarım, yazılım, satış, otomasyon, yapay zekâ, SEO ve teknik desteği birbirinden kopuk hizmetler olarak değil, tek bir sistem olarak planlıyoruz." />
      <section className="section page-section">
        <div className="container service-list-grid">
          {services.map((service, index) => (
            <Link href={`/web-cozumleri/${service.slug}`} className="service-list-card" key={service.slug}>
              <div className="service-list-card__head"><ServiceIcon name={service.icon} /><span>0{index + 1}</span></div>
              <h2>{service.title}</h2><p>{service.description}</p>
              <ul>{service.features.map((feature) => <li key={feature}><CheckIcon size={17} /> {feature}</li>)}</ul>
              <span className="text-link">Çözümü inceleyin <ArrowRightIcon size={18} /></span>
            </Link>
          ))}
        </div>
      </section>
      <DecisionSection />
    </>
  );
}

export function ServiceDetail({ service }: { service: (typeof services)[number] }) {
  const related = services.filter((item) => item.slug !== service.slug).slice(0, 3);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    provider: { "@type": "Organization", name: siteConfig.legalName },
    description: service.description,
    areaServed: "TR",
  };
  return (
    <>
      <section className="page-hero page-hero--service">
        <div className="container page-hero__service-grid">
          <div>
            <div className="eyebrow"><span /> Web Çözümleri</div>
            <h1>{service.title}</h1><p>{service.description}</p>
            <div className="hero__actions"><Link href="/teklif-al" className="button button--primary">Projenizi Başlatın <ArrowRightIcon size={18} /></Link><Link href="/projelerimiz" className="button button--secondary">İlgili Projeler</Link></div>
          </div>
          <div className="service-detail-icon"><ServiceIcon name={service.icon} size={132} /></div>
        </div>
      </section>
      <section className="section page-section">
        <div className="container detail-layout">
          <div className="detail-layout__main">
            <div className="eyebrow"><span /> Çözüm yaklaşımı</div>
            <h2>Hazır özellik listesi değil, hedefe bağlı sistem tasarımı.</h2>
            <p>{service.outcome} Projeyi kullanıcı ihtiyacı, içerik yapısı, operasyon, teknik riskler ve ölçüm planıyla birlikte ele alırız.</p>
            <div className="feature-panel">
              {service.features.map((feature, index) => <div key={feature}><span>0{index + 1}</span><strong>{feature}</strong><p>Bu alan proje keşfinde kapsamlandırılır, başarı ölçütü belirlenir ve teslim öncesi doğrulanır.</p></div>)}
            </div>
            <h2>Proje kapsamında neler planlanır?</h2>
            <div className="content-columns">
              <article><h3>Strateji ve içerik</h3><p>Hedef kitle, sayfa yapısı, kullanıcı yolculuğu, mesaj hiyerarşisi ve dönüşüm noktaları.</p></article>
              <article><h3>Tasarım ve deneyim</h3><p>Özgün arayüz, responsive davranış, erişilebilirlik, tasarım tokenları ve bileşen sistemi.</p></article>
              <article><h3>Teknik altyapı</h3><p>Uygulama mimarisi, veri modeli, entegrasyonlar, güvenlik, test, yayın ve izleme.</p></article>
              <article><h3>Büyüme ve bakım</h3><p>SEO, analitik, Core Web Vitals, içerik yönetimi, bakım süreçleri ve geliştirme yol haritası.</p></article>
            </div>
          </div>
          <aside className="detail-sidebar">
            <span className="eyebrow">Teslim yaklaşımı</span>
            <h3>Her aşama görünür ve doğrulanabilir.</h3>
            {processSteps.map((step) => <div key={step.id}><span>{step.id}</span><p><strong>{step.title}</strong>{step.description}</p></div>)}
          </aside>
        </div>
      </section>
      <section className="section section--process"><div className="container"><div className="section-heading"><div><div className="eyebrow"><span /> İlgili çözümler</div><h2>Birlikte daha güçlü çalışan hizmetler.</h2></div></div><div className="service-grid service-grid--three">{related.map((item) => <Link href={`/web-cozumleri/${item.slug}`} className="service-card" key={item.slug}><div className="service-card__icon"><ServiceIcon name={item.icon} /></div><h3>{item.shortTitle}</h3><p>{item.description}</p><span className="service-card__link">İnceleyin <ArrowRightIcon size={17} /></span></Link>)}</div></div></section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
