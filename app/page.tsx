import Link from "next/link";
import { Accordion } from "@/components/ui/accordion";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import { Reveal, StaggerContainer } from "@/components/motion/reveal";
import { ArticleVisual, CtaSystemVisual, MessageBubbleVisual, ProcessIcon, ProjectVisual } from "@/components/home-visuals";
import { ArrowRightIcon, CheckIcon, ServiceIcon } from "@/components/icons";
import { HeroSystem } from "@/components/hero-system";
import {
  discoveryItems,
  homeArticles,
  homeFaq,
  homeMetrics,
  homeProcess,
  homeProjects,
  homeServices,
} from "@/lib/home-content";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  return (
    <main className="home-v2">
      <section className="premium-hero section-shell" aria-labelledby="home-hero-title">
        <span className="premium-hero__grid" aria-hidden="true" />
        <span className="premium-hero__glow premium-hero__glow--one" aria-hidden="true" />
        <span className="premium-hero__glow premium-hero__glow--two" aria-hidden="true" />
        <div className="container premium-hero__layout">
          <div className="premium-hero__content">
            <Reveal variant="fade" delay={80}>
              <div className="premium-eyebrow"><span /> Dijital çözüm ortağınız</div>
            </Reveal>
            <Reveal delay={160}>
              <h1 id="home-hero-title">
                İşletmeniz için hızlı, ölçeklenebilir ve <span>akıllı</span> dijital sistemler.
              </h1>
            </Reveal>
            <Reveal delay={260}>
              <p className="premium-hero__lead">
                Web sitelerinden özel yazılıma, SEO’dan otomasyona kadar uçtan uca dijital çözümlerle işinizi büyütüyor; süreçlerinizi sadeleştiriyor ve sürdürülebilir sonuçlar üretiyoruz.
              </p>
            </Reveal>
            <Reveal delay={340}>
              <div className="premium-hero__actions">
                <Link href="/teklif-al" className="premium-button premium-button--primary">
                  Ücretsiz Görüşme <ArrowRightIcon size={17} />
                </Link>
                <Link href="#projects" className="premium-button premium-button--secondary">
                  Projelerimizi İncele
                </Link>
              </div>
            </Reveal>
            <Reveal delay={420}>
              <div className="premium-hero__trust" aria-label="Arcates güven göstergeleri">
                <span><CheckIcon size={17} /> 7+ yıllık deneyim</span>
                <span><CheckIcon size={17} /> 100+ proje deneyimi</span>
                <span><CheckIcon size={17} /> 7/24 destek altyapısı</span>
              </div>
            </Reveal>
          </div>
          <Reveal className="premium-hero__visual" variant="scale" delay={220}>
            <HeroSystem />
          </Reveal>
        </div>
      </section>

      <section id="services" className="premium-section premium-section--services" aria-labelledby="services-title">
        <div className="container">
          <SectionHeading
            eyebrow="Hizmetlerimiz"
            id="services-title"
            title="Tek bir web sitesinden daha fazlasını tasarlıyoruz."
            description="Strateji, tasarım, yazılım, içerik ve otomasyonu aynı ölçülebilir sistem içinde birleştiriyoruz."
            href="/web-cozumleri"
            linkLabel="Tüm hizmetleri gör"
          />
          <StaggerContainer className="premium-service-grid">
            {homeServices.map((service, index) => (
              <Link href={service.href} className="premium-card premium-service-card stagger-item" key={service.title}>
                <span className="premium-card__shine" aria-hidden="true" />
                <div className="premium-service-card__icon"><ServiceIcon name={service.icon} size={32} /></div>
                <span className="premium-service-card__index">0{index + 1}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <span className="premium-card__link">Detayları İncele <ArrowRightIcon size={16} /></span>
              </Link>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section id="discovery" className="premium-section premium-discovery" aria-labelledby="discovery-title">
        <span className="premium-discovery__glow" aria-hidden="true" />
        <div className="container premium-discovery__layout">
          <Reveal variant="left" className="premium-discovery__content">
            <div className="premium-eyebrow"><span /> Birlikte keşfedelim</div>
            <h2 id="discovery-title">Hangi dijital çözüme ihtiyacınız olduğunu birlikte belirleyelim.</h2>
            <p>Doğru sorularla mevcut durumunuzu, hedef kitlenizi ve büyüme fırsatlarınızı analiz ediyor; uygulanabilir yol haritasını birlikte oluşturuyoruz.</p>
            <button className="premium-button premium-button--primary" type="button" data-open-chat>
              Ücretsiz Görüşme Talep Edin <ArrowRightIcon size={17} />
            </button>
            <div className="premium-discovery__benefits">
              <span><CheckIcon size={17} /> Keşif & analiz</span>
              <span><CheckIcon size={17} /> Doğru strateji</span>
              <span><CheckIcon size={17} /> Net yol haritası</span>
            </div>
          </Reveal>
          <Reveal variant="right" className="premium-discovery__panel" delay={100}>
            <Accordion items={discoveryItems} />
          </Reveal>
        </div>
      </section>

      <section id="projects" className="premium-section" aria-labelledby="projects-title">
        <div className="container">
          <SectionHeading
            eyebrow="Öne çıkan projeler"
            id="projects-title"
            title="Tasarımın teknik sonuçlarla buluştuğu çalışmalar."
            description="Her projeyi yalnızca görünümüyle değil, çözdüğü problem ve kurduğu sürdürülebilir sistem üzerinden ele alıyoruz."
            href="/projelerimiz"
            linkLabel="Tüm projeleri gör"
          />
          <StaggerContainer className="premium-project-grid" amount={0.08}>
            {homeProjects.map((project) => (
              <Link href={`/projelerimiz/${project.slug}`} className="premium-project-card stagger-item" key={project.slug}>
                <ProjectVisual variant={project.accent} />
                <div className="premium-project-card__body">
                  <span>{project.category}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <span className="premium-card__link">Projeyi İncele <ArrowRightIcon size={16} /></span>
                </div>
              </Link>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section id="process" className="premium-section premium-process" aria-labelledby="process-title">
        <div className="container">
          <SectionHeading
            eyebrow="Çalışma sürecimiz"
            id="process-title"
            title="Belirsizliği azaltan dört aşamalı geliştirme süreci."
            description="Her aşamanın amacı, çıktısı ve doğrulama yöntemi proje başlamadan önce görünür hale gelir."
            href="/nasil-calisiyoruz"
            linkLabel="Süreci incele"
          />
          <StaggerContainer className="premium-process__timeline">
            {homeProcess.map((step) => (
              <article className="premium-process-card stagger-item" key={step.id}>
                <span className="premium-process-card__number">{step.id}</span>
                <div className="premium-process-card__icon"><ProcessIcon name={step.icon} /></div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="premium-section premium-metrics" aria-labelledby="metrics-title">
        <div className="container">
          <Reveal>
            <div className="premium-eyebrow"><span /> Sonuçlarla konuşuyoruz</div>
            <h2 id="metrics-title" className="sr-only">Arcates teknik performans hedefleri</h2>
          </Reveal>
          <StaggerContainer className="premium-metrics__grid">
            {homeMetrics.map((metric) => (
              <article className="premium-card premium-metric-card stagger-item" key={metric.label}>
                <AnimatedCounter
                  value={metric.value}
                  decimals={metric.decimals}
                  prefix={"prefix" in metric ? metric.prefix : undefined}
                  suffix={"suffix" in metric ? metric.suffix : undefined}
                />
                <p>{metric.label}</p>
              </article>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section id="blog" className="premium-section" aria-labelledby="insights-title">
        <div className="container">
          <SectionHeading
            eyebrow="İçgörüler"
            id="insights-title"
            title="Dijital dünyadan güncel içgörüler ve ipuçları."
            description="Web, performans, yapay zekâ ve kullanıcı deneyimi konularını uygulanabilir teknik rehberlerle açıklıyoruz."
            href="/blog"
            linkLabel="Tüm yazıları gör"
          />
          <StaggerContainer className="premium-article-grid">
            {homeArticles.map((article) => (
              <Link href={`/blog/${article.slug}`} className="premium-article-card stagger-item" key={article.slug}>
                <ArticleVisual variant={article.visual} />
                <div className="premium-article-card__body">
                  <div><time>{article.date}</time><span>{article.category}</span></div>
                  <h3>{article.title}</h3>
                  <span className="premium-card__link">Devamını Oku <ArrowRightIcon size={16} /></span>
                </div>
              </Link>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section id="faq" className="premium-section premium-faq" aria-labelledby="faq-title">
        <div className="container premium-faq__layout">
          <Reveal variant="left" className="premium-faq__questions">
            <div className="premium-eyebrow"><span /> Projeye başlamadan önce</div>
            <h2 id="faq-title">Bilmeniz gerekenler.</h2>
            <Accordion items={homeFaq} />
          </Reveal>
          <Reveal variant="right" className="premium-contact-card" delay={100}>
            <div>
              <div className="premium-eyebrow"><span /> İletişim</div>
              <h2>Hâlâ sorularınız mı var?</h2>
              <p>Ekibimiz tüm sorularınızı yanıtlamak ve projeniz için doğru çözümü sunmak için hazır.</p>
              <Link href="/iletisim" className="premium-button premium-button--primary">Bize Ulaşın <ArrowRightIcon size={17} /></Link>
              <div className="premium-contact-card__details">
                <span>E-posta<strong>{siteConfig.email}</strong></span>
                <span>Proje hattı<strong>Teklif formu üzerinden</strong></span>
              </div>
            </div>
            <MessageBubbleVisual />
          </Reveal>
        </div>
      </section>

      <section className="premium-final-cta" aria-labelledby="final-cta-title">
        <div className="container premium-final-cta__inner">
          <span className="premium-final-cta__grid" aria-hidden="true" />
          <Reveal variant="left" className="premium-final-cta__content">
            <h2 id="final-cta-title">İşletmenizin bir sonraki dijital sistemini birlikte oluşturalım.</h2>
            <p>Fikrinizi anlatın, en doğru çözümü birlikte şekillendirelim.</p>
            <div className="premium-final-cta__actions">
              <Link href="/teklif-al" className="premium-button premium-button--primary">Ücretsiz Görüşme Talep Edin <ArrowRightIcon size={17} /></Link>
              <Link href="#projects" className="premium-button premium-button--secondary">Projelerimizi İncele</Link>
            </div>
          </Reveal>
          <Reveal variant="right" className="premium-final-cta__visual" delay={120}>
            <CtaSystemVisual />
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  id,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string;
  id: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <Reveal className="premium-section-heading">
      <div>
        <div className="premium-eyebrow"><span /> {eyebrow}</div>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
      <Link href={href} className="premium-text-link">{linkLabel} <ArrowRightIcon size={17} /></Link>
    </Reveal>
  );
}
