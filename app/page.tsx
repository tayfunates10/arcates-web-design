import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ServiceIcon } from "@/components/icons";
import { HeroSystem } from "@/components/hero-system";
import { blogPosts, faqItems, processSteps, projects, services } from "@/lib/content";

export default function HomePage() {
  return (
    <main>
      <section className="hero section-shell">
        <div className="container hero__grid">
          <div className="hero__content">
            <div className="eyebrow"><span /> Dijital mühendislik ve web çözümleri</div>
            <h1>İşletmeniz için hızlı, ölçeklenebilir ve <span>akıllı</span> dijital sistemler.</h1>
            <p className="hero__lead">Kurumsal web sitelerinden özel yazılımlara, e-ticaretten yapay zekâ otomasyonlarına kadar dijital altyapınızı tasarlıyor, geliştiriyor ve sürdürüyoruz.</p>
            <div className="hero__actions">
              <Link href="/teklif-al" className="button button--primary">Projenizi Başlatın <ArrowRightIcon size={18} /></Link>
              <Link href="/projelerimiz" className="button button--secondary">Projeleri İnceleyin</Link>
            </div>
            <div className="hero__trust">
              <span><CheckIcon size={18} /> Performans odaklı</span>
              <span><CheckIcon size={18} /> SEO temelli</span>
              <span><CheckIcon size={18} /> Yönetilebilir altyapı</span>
            </div>
          </div>
          <HeroSystem />
        </div>
      </section>

      <section className="trust-strip" aria-label="Arcates kalite yaklaşımı">
        <div className="container trust-strip__grid">
          {[
            ["01", "Mobil öncelikli tasarım"],
            ["02", "Ölçülebilir performans"],
            ["03", "Gelişmiş SEO mimarisi"],
            ["04", "Güvenli yönetim sistemi"],
            ["05", "Sürekli teknik destek"],
          ].map(([id, title]) => <div key={id}><span>{id}</span><strong>{title}</strong></div>)}
        </div>
      </section>

      <section className="section section--services">
        <div className="container">
          <SectionHeading eyebrow="Web Çözümleri" title="Tek bir web sitesinden daha fazlasını tasarlıyoruz." description="İş hedefinizi, kullanıcı deneyimini, yazılım mimarisini ve büyüme sistemlerini tek çözüm altında birleştiriyoruz." href="/web-cozumleri" />
          <div className="service-grid">
            {services.map((service) => (
              <Link href={`/web-cozumleri/${service.slug}`} className="service-card" key={service.slug}>
                <div className="service-card__icon"><ServiceIcon name={service.icon} /></div>
                <span className="service-card__index">0{services.indexOf(service) + 1}</span>
                <h3>{service.shortTitle}</h3>
                <p>{service.description}</p>
                <span className="service-card__link">Detaylı inceleyin <ArrowRightIcon size={17} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section solution-finder">
        <div className="container solution-finder__grid">
          <div>
            <div className="eyebrow"><span /> Akıllı çözüm yönlendirmesi</div>
            <h2>Hangi dijital çözüme ihtiyacınız olduğunu birlikte belirleyelim.</h2>
            <p>İşletmenizi, mevcut sisteminizi ve hedefinizi birkaç cümleyle anlatın. Arcates Asistan uygun hizmetleri, temel özellikleri ve sonraki adımı düzenli bir kapsam halinde oluştursun.</p>
            <button className="button button--primary" type="button" data-open-chat>Arcates Asistan ile Başlayın <ArrowRightIcon size={18} /></button>
          </div>
          <div className="solution-map" aria-label="Çözüm belirleme adımları">
            {[
              ["01", "İhtiyacınızı anlatın", "Doğal dille hedefinizi ve mevcut durumunuzu paylaşın."],
              ["02", "Sistem analiz etsin", "Hizmet, özellik, entegrasyon ve içerik ihtiyaçları eşleştirilsin."],
              ["03", "Kapsam oluşturulsun", "Uygun çözüm ve doğrulanması gereken kararlar netleştirilsin."],
            ].map(([id, title, text]) => (
              <div className="solution-map__item" key={id}>
                <span>{id}</span><div><strong>{title}</strong><p>{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Projelerimiz" title="Tasarımı teknik sonuçlarla birleştiren çalışmalar." description="Her projeyi yalnızca görünümüyle değil, çözdüğü problem, kurduğu sistem ve ürettiği sonuç üzerinden anlatıyoruz." href="/projelerimiz" />
          <div className="project-grid">
            {projects.map((project, index) => (
              <Link href={`/projelerimiz/${project.slug}`} className="project-card" key={project.slug}>
                <div className={`project-card__visual project-card__visual--${index + 1}`}>
                  <div className="project-card__window">
                    <span /><span /><span />
                    <div className="project-card__diagram"><i /><i /><i /><i /></div>
                  </div>
                </div>
                <div className="project-card__body">
                  <span className="project-card__category">{project.category}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <div className="project-card__metrics">{project.metrics.map((metric) => <span key={metric}>{metric}</span>)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--process">
        <div className="container">
          <SectionHeading eyebrow="Çalışma Sistemi" title="Belirsizliği azaltan altı aşamalı geliştirme süreci." description="Her adımın amacı, çıktısı ve doğrulama yöntemi proje başlamadan tanımlanır." href="/nasil-calisiyoruz" />
          <div className="process-grid">
            {processSteps.map((step) => (
              <article key={step.id} className="process-card">
                <span>{step.id}</span><h3>{step.title}</h3><p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section quality-section">
        <div className="container quality-section__grid">
          <div>
            <div className="eyebrow"><span /> Kalite yaklaşımı</div>
            <h2>SEO, performans ve güvenlik sonradan eklenen özellikler değildir.</h2>
            <p>Mimari kararları ilk günden erişilebilirlik, Core Web Vitals, taranabilirlik, güvenli veri akışı ve bakım kolaylığı ile birlikte veririz.</p>
            <Link href="/web-cozumleri/seo-performans" className="text-link">Teknik yaklaşımı inceleyin <ArrowRightIcon size={18} /></Link>
          </div>
          <div className="quality-metrics">
            {[
              ["LCP", "≤ 2,5 sn", "Yükleme deneyimi"],
              ["INP", "≤ 200 ms", "Etkileşim yanıtı"],
              ["CLS", "≤ 0,1", "Görsel kararlılık"],
              ["A11Y", "WCAG", "Erişilebilir arayüz"],
            ].map(([code, value, label]) => <div key={code}><span>{code}</span><strong>{value}</strong><small>{label}</small></div>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Bilgi Merkezi" title="Daha doğru dijital kararlar için teknik rehberler." description="Web tasarım, yazılım, yapay zekâ, SEO ve performans konularını uygulanabilir içeriklerle açıklıyoruz." href="/blog" />
          <div className="blog-grid">
            {blogPosts.map((post) => (
              <Link href={`/blog/${post.slug}`} className="blog-card" key={post.slug}>
                <span>{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p><small>{post.readingTime}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section faq-section">
        <div className="container faq-section__grid">
          <div>
            <div className="eyebrow"><span /> Sık Sorulan Sorular</div>
            <h2>Proje başlamadan önce bilmeniz gerekenler.</h2>
            <p>Daha özel bir sorunuz varsa sağ alttaki Arcates Asistan üzerinden doğrudan yazabilirsiniz.</p>
            <Link href="/sss" className="button button--secondary">Tüm soruları inceleyin</Link>
          </div>
          <div className="faq-list">
            {faqItems.map((item) => (
              <details key={item.question}>
                <summary>{item.question}<span /></summary><p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section final-cta">
        <div className="container final-cta__inner">
          <span className="final-cta__grid" />
          <div><div className="eyebrow"><span /> Yeni proje</div><h2>İşletmenizin bir sonraki dijital sistemini birlikte oluşturalım.</h2></div>
          <div className="final-cta__actions">
            <Link href="/teklif-al" className="button button--light">Projenizi Başlatın <ArrowRightIcon size={18} /></Link>
            <Link href="/iletisim" className="button button--ghost">İletişime Geçin</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({ eyebrow, title, description, href }: { eyebrow: string; title: string; description: string; href: string }) {
  return (
    <div className="section-heading">
      <div><div className="eyebrow"><span /> {eyebrow}</div><h2>{title}</h2><p>{description}</p></div>
      <Link href={href} className="text-link">Tümünü inceleyin <ArrowRightIcon size={18} /></Link>
    </div>
  );
}
