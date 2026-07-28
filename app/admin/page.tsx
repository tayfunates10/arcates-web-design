import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Arcates Yönetim Paneli",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const user = await requireRole(["STAFF", "ADMIN", "OWNER"]);

  const [leadCount, activeProjectCount, openTicketCount, activeConversationCount, knowledgeCount, organizationCount, latestLeads, latestTickets, latestConversations] = await db.$transaction([
    db.lead.count({ where: { status: "NEW" } }),
    db.project.count({ where: { status: { notIn: ["PAUSED", "COMPLETED"] } } }),
    db.supportTicket.count({ where: { status: { notIn: ["RESOLVED", "CLOSED"] } } }),
    db.conversation.count({ where: { status: { in: ["AI_ACTIVE", "HUMAN_ACTIVE", "WAITING"] } } }),
    db.knowledgeDocument.count(),
    db.organization.count(),
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { contact: true } }),
    db.supportTicket.findMany({ orderBy: { updatedAt: "desc" }, take: 5, include: { requester: true } }),
    db.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { contact: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
  ]);

  return (
    <main className="portal-shell">
      <div className="container portal-layout">
        <aside className="portal-sidebar">
          <div className="portal-sidebar__brand">Arcates <span>Admin</span></div>
          <nav aria-label="Yönetim paneli">
            <Link className="active" href="/admin"><span>01</span>Dashboard</Link>
            <Link href="/admin/musteriler"><span>02</span>Müşteriler</Link>
            <Link href="/admin/talepler"><span>03</span>Proje Talepleri</Link>
            <Link href="/admin/projeler"><span>04</span>Projeler</Link>
            <Link href="/admin/destek"><span>05</span>Destek</Link>
            <Link href="/admin/konusmalar"><span>06</span>Konuşmalar</Link>
            <Link href="/admin/bilgi-tabani"><span>07</span>Bilgi Tabanı</Link>
            <Link href="/"><span>08</span>Siteyi Görüntüle</Link>
          </nav>
          <form action="/cikis" method="post"><button type="submit"><span>09</span>Güvenli Çıkış</button></form>
        </aside>

        <div className="portal-main">
          <header className="portal-main__header">
            <div>
              <span className="eyebrow">{user.role} yetkisi · {organizationCount} kuruluş</span>
              <h1>Operasyon Paneli</h1>
              <p>{user.name} adına güvenli yönetim oturumu.</p>
            </div>
            <Link href="/teklif-al" className="button button--primary">Talep Formunu Aç</Link>
          </header>

          <div className="portal-metrics">
            <div><span>Yeni talep</span><strong>{leadCount}</strong><small>İşleme alınmayı bekliyor</small></div>
            <div><span>Aktif proje</span><strong>{activeProjectCount}</strong><small>Canlı operasyon görünümü</small></div>
            <div><span>Açık destek</span><strong>{openTicketCount}</strong><small>Önceliğe göre sıralanmalı</small></div>
          </div>

          <div className="portal-grid">
            <section id="talepler">
              <div className="portal-wide-card__header"><div><span className="eyebrow">Satış hattı</span><h2>Son proje talepleri</h2></div><Link className="text-link" href="/admin/talepler">Tümünü yönet</Link></div>
              {latestLeads.length ? latestLeads.map((lead) => (
                <div className="conversation-row" key={lead.id}>
                  <i />
                  <div><strong>{lead.title}</strong><small>{lead.contact.company || lead.contact.name} · {lead.service || "Kapsam belirlenmedi"}</small></div>
                  <span>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "short" }).format(lead.createdAt)}</span>
                </div>
              )) : <EmptyAdminState text="Henüz proje talebi bulunmuyor." />}
            </section>

            <section id="destek">
              <div className="portal-wide-card__header"><div><span className="eyebrow">Destek hattı</span><h2>Son destek kayıtları</h2></div><Link className="text-link" href="/admin/destek">Tümünü yönet</Link></div>
              {latestTickets.length ? latestTickets.map((ticket) => (
                <div className="health-row" key={ticket.id}>
                  <div><strong>{ticket.title}</strong><small>{ticket.requester.name}</small></div>
                  <span>{ticket.priority}</span>
                </div>
              )) : <EmptyAdminState text="Açık destek kaydı bulunmuyor." />}
            </section>
          </div>

          <section className="portal-wide-card" id="konusmalar">
            <div className="portal-wide-card__header">
              <div><span className="eyebrow">Kanal merkezi</span><h2>Aktif konuşmalar</h2></div>
              <Link className="text-link" href="/admin/konusmalar">{activeConversationCount} konuşmayı yönet</Link>
            </div>
            {latestConversations.length ? latestConversations.map((conversation) => (
              <Link className="conversation-row conversation-row--link" href={`/admin/konusmalar?conversation=${conversation.id}`} key={conversation.id}>
                <i />
                <div><strong>{conversation.contact?.name || "Anonim ziyaretçi"}</strong><small>{conversation.messages[0]?.content.slice(0, 100) || "Mesaj bekleniyor"}</small></div>
                <span>{conversation.channel === "WHATSAPP" ? "WhatsApp" : "Web Chat"}</span>
              </Link>
            )) : <EmptyAdminState text="Aktif konuşma bulunmuyor." />}
          </section>

          <section className="portal-wide-card" id="projeler">
            <div className="portal-wide-card__header">
              <div><span className="eyebrow">Sistem sağlığı</span><h2>Çekirdek servisler</h2></div>
              <Link className="text-link" href="/admin/bilgi-tabani">{knowledgeCount} bilgi kaynağını yönet</Link>
            </div>
            {["Next.js web uygulaması", "PostgreSQL veri katmanı", "Oturum ve yetki sistemi", "Ortak AI konuşma motoru"].map((service) => (
              <div className="health-row" key={service}><span>{service}</span><strong>Çalışıyor</strong></div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

function EmptyAdminState({ text }: { text: string }) {
  return <div className="dashboard-empty"><p>{text}</p></div>;
}
