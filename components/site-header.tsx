"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArcatesMark, ChevronDownIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/icons";
import { services } from "@/lib/content";
import { mainNavigation } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
      <div className="container site-header__inner">
        <Link href="/" className="brand" aria-label="Arcates ana sayfa" onClick={() => setOpen(false)}>
          <span className="brand__mark"><ArcatesMark size={34} /></span>
          <span className="brand__text">Arcates</span>
        </Link>

        <nav className="desktop-nav" aria-label="Ana menü">
          {mainNavigation.map((item) =>
            item.href === "/web-cozumleri" ? (
              <div className="nav-mega" key={item.href}>
                <Link href={item.href} className="nav-link nav-link--with-icon">
                  {item.label}<ChevronDownIcon size={16} />
                </Link>
                <div className="mega-panel">
                  <div className="mega-panel__intro">
                    <span className="eyebrow">Web Çözümleri</span>
                    <strong>İş hedefinize göre tasarlanan dijital altyapılar.</strong>
                    <p>Kurumsal web, özel yazılım, e-ticaret, SaaS, yapay zekâ ve otomasyon.</p>
                    <Link href="/web-cozumleri" className="text-link">Tüm çözümleri inceleyin</Link>
                  </div>
                  <div className="mega-panel__grid">
                    {services.slice(0, 6).map((service) => (
                      <Link key={service.slug} href={`/web-cozumleri/${service.slug}`} className="mega-panel__item">
                        <span>{service.shortTitle}</span>
                        <small>{service.description}</small>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link href={item.href} className="nav-link" key={item.href}>{item.label}</Link>
            ),
          )}
        </nav>

        <div className="site-header__actions">
          <button type="button" className="icon-button desktop-only" aria-label="Site içinde ara">
            <SearchIcon size={20} />
          </button>
          <Link href="/giris" className="header-login desktop-only"><UserIcon size={19} /> Giriş Yap</Link>
          <Link href="/teklif-al" className="button button--primary desktop-only">Projenizi Başlatın</Link>
          <button
            type="button"
            className="icon-button mobile-menu-button"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div className={`mobile-nav${open ? " mobile-nav--open" : ""}`} aria-hidden={!open}>
        <nav className="container mobile-nav__inner" aria-label="Mobil menü">
          {mainNavigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
          <div className="mobile-nav__services">
            {services.slice(0, 5).map((service) => (
              <Link key={service.slug} href={`/web-cozumleri/${service.slug}`} onClick={() => setOpen(false)}>
                {service.shortTitle}
              </Link>
            ))}
          </div>
          <div className="mobile-nav__actions">
            <Link href="/giris" className="button button--secondary" onClick={() => setOpen(false)}>Giriş Yap</Link>
            <Link href="/teklif-al" className="button button--primary" onClick={() => setOpen(false)}>Projenizi Başlatın</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
