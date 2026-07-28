"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArcatesMark, ArrowRightIcon, CloseIcon, MenuIcon } from "@/components/icons";

const navigation = [
  { label: "Hizmetler", href: "/#services", section: "services", ariaLabel: "Web Çözümleri" },
  { label: "Projeler", href: "/#projects", section: "projects" },
  { label: "Süreç", href: "/#process", section: "process" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Blog", href: "/#blog", section: "blog" },
  { label: "SSS", href: "/#faq", section: "faq" },
  { label: "İletişim", href: "/iletisim" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        setScrolled(scrollTop > 18);
        setProgress(scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const sections = navigation
      .map((item) => ("section" in item ? document.getElementById(item.section) : null))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-28% 0px -58%", threshold: [0.08, 0.2, 0.4] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const panel = mobilePanelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
      <div className="container site-header__inner">
        <Link href="/" className="brand" aria-label="Arcates ana sayfa" onClick={closeMenu}>
          <span className="brand__mark"><ArcatesMark size={31} /></span>
          <span className="brand__text">Arcates</span>
        </Link>

        <nav className="desktop-nav" aria-label="Ana menü">
          {navigation.map((item) => {
            const section = "section" in item ? item.section : null;
            const active = section ? activeSection === section : pathname === item.href;
            return (
              <Link
                href={item.href}
                className={`nav-link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
                aria-label={"ariaLabel" in item ? item.ariaLabel : undefined}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-header__actions">
          <Link href="/teklif-al" className="button button--primary desktop-only">
            Ücretsiz Görüşme <ArrowRightIcon size={15} />
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            className="icon-button mobile-menu-button"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div
        ref={mobilePanelRef}
        id="mobile-navigation"
        className={`mobile-nav${open ? " mobile-nav--open" : ""}`}
        aria-hidden={!open}
      >
        <nav className="container mobile-nav__inner" aria-label="Mobil menü">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={"ariaLabel" in item ? item.ariaLabel : undefined}
              onClick={closeMenu}
              tabIndex={open ? 0 : -1}
            >
              {item.label}
            </Link>
          ))}
          <div className="mobile-nav__actions">
            <Link href="/giris" className="button button--secondary" onClick={closeMenu} tabIndex={open ? 0 : -1}>Giriş Yap</Link>
            <Link href="/teklif-al" className="button button--primary" onClick={closeMenu} tabIndex={open ? 0 : -1}>Ücretsiz Görüşme</Link>
          </div>
        </nav>
      </div>
      <span className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    </header>
  );
}
