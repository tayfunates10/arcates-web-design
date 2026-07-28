import Link from "next/link";
import { ArcatesMark, ArrowRightIcon } from "@/components/icons";
import { footerNavigation, siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__top">
        <div className="site-footer__brand">
          <Link href="/" className="brand" aria-label="Arcates ana sayfa">
            <span className="brand__mark"><ArcatesMark size={38} /></span>
            <span className="brand__text">Arcates</span>
          </Link>
          <p>Web tasarım, özel yazılım, yapay zekâ ve otomasyonu ölçülebilir iş sonuçlarına dönüştüren dijital mühendislik stüdyosu.</p>
          <Link href="/teklif-al" className="text-link">Projenizi anlatın <ArrowRightIcon size={18} /></Link>
        </div>
        <FooterColumn title="Çözümler" links={footerNavigation.solutions} />
        <FooterColumn title="Şirket" links={footerNavigation.company} />
        <FooterColumn title="Destek" links={footerNavigation.support} />
        <FooterColumn title="Yasal" links={footerNavigation.legal} />
      </div>
      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} {siteConfig.legalName}. Tüm hakları saklıdır.</span>
        <div className="system-status"><span className="system-status__dot" /> Sistemler çalışıyor</div>
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
