import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ChatWidget } from "@/components/chat-widget";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Arcates | Web Tasarım, Yazılım ve Yapay Zekâ Çözümleri",
    template: "%s | Arcates",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "web tasarım",
    "özel web yazılımı",
    "e-ticaret",
    "SaaS geliştirme",
    "yapay zekâ chatbot",
    "iş otomasyonu",
    "teknik SEO",
  ],
  authors: [{ name: siteConfig.legalName }],
  creator: siteConfig.legalName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Arcates | Dijital Mühendislik ve Web Çözümleri",
    description: siteConfig.description,
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Arcates dijital mühendislik" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arcates | Dijital Mühendislik ve Web Çözümleri",
    description: siteConfig.description,
    images: ["/og.svg"],
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07111f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.legalName,
    url: siteConfig.url,
    email: siteConfig.email,
    description: siteConfig.description,
  };

  return (
    <html lang="tr">
      <body>
        <a className="skip-link" href="#main-content">Ana içeriğe geç</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <ChatWidget />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}
