"use client";

import Link from "next/link";
import { ArcatesMark } from "@/components/icons";
import { footerNavigation, siteConfig } from "@/lib/site";

const resourceLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Sık Sorulan Sorular", href: "/sss" },
  { label: "Bilgi Merkezi", href: "/destek/bilgi-merkezi" },
  { label: "Sistem Durumu", href: "/destek/sistem-durumu" },
] as const;

const contactLinks = [
  { label: siteConfig.email, href: `mailto:${siteConfig.email}` },
  { label: "Proje Teklifi", href: "/teklif-al" },
  { label: "Destek Talebi", href: "/destek/destek-talebi" },
  { label: "İletişim", href: "/iletisim" },
] as const;

export function SiteFooter() {
  const scrollToTop = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <footer className="site-footer">
      <div className="container site-footer__top">
        <div className="site-footer__brand">
          <Link href="/" className="brand" aria-label="Arcates ana sayfa">
            <span className="brand__mark"><ArcatesMark size={34} /></span>
            <span className="brand__text">Arcates</span>
          </Link>
          <p>Web tasarım, özel yazılım, yapay zekâ ve otomasyonu ölçülebilir iş sonuçlarına dönüştüren dijital mühendislik stüdyosu.</p>
          <div className="footer-socials" aria-label="Arcates bağlantıları">
            <a href="https://github.com/tayfunates10" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 1.2-4-2-5-2.4M14.5 22v-3.1c0-.9.1-1.5-.4-2 3.3-.4 6.8-1.6 6.8-7.3A5.7 5.7 0 0 0 19.4 5c.2-.4.7-2-.2-4 0 0-1.3-.4-4.8 1.7a16.8 16.8 0 0 0-8.8 0C2.1.6.8 1 .8 1c-.9 2-.4 3.6-.2 4A5.7 5.7 0 0 0-.9 9.6c0 5.7 3.5 6.9 6.8 7.3-.4.4-.7 1.1-.7 2V22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <a href={`mailto:${siteConfig.email}`} aria-label="E-posta gönder">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <Link href="/iletisim" aria-label="İletişim sayfası">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H8l-4 4V4Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 9h8M8 12h5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </Link>
          </div>
        </div>
        <FooterColumn title="Hizmetler" links={footerNavigation.solutions} />
        <FooterColumn title="Şirket" links={footerNavigation.company} />
        <FooterColumn title="Kaynaklar" links={resourceLinks} />
        <FooterColumn title="İletişim" links={contactLinks} />
      </div>
      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} {siteConfig.legalName}. Tüm hakları saklıdır.</span>
        <div className="site-footer__bottom-links">
          <Link href="/gizlilik-politikasi">Gizlilik</Link>
          <Link href="/kvkk">KVKK</Link>
          <Link href="/kullanim-kosullari">Koşullar</Link>
          <button type="button" className="back-to-top" aria-label="Sayfanın başına dön" onClick={scrollToTop}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6M12 8v10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div className="footer-column">
      <strong>{title}</strong>
      <nav aria-label={`${title} bağlantıları`}>
        {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
      </nav>
    </div>
  );
}
