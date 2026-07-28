import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon } from "@/components/icons";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Müşteri Paneli",
  robots: { index: false, follow: false },
};

const projectStatusLabels = {
  DISCOVERY: "Keşif",
  PLANNING: "Planlama",
  DESIGN: "Tasarım",
  DEVELOPMENT: "Geliştirme",
  VALIDATION: "Doğrulama",
  LIVE: "Canlı",
  PAUSED: "Duraklatıldı",
  COMPLETED: "Tamamlandı",
} as const;

export default async function CustomerDashboardPage() {
  const user = await requireUser();

  const [membership, projects, tickets, conversations] = await Promise.all([
    db.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    }),
    db.project.findMany({
      where: { members: { some: { userId: user.id } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    db.supportTicket.findMany({
      where: { requesterId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    db.conversation.findMany({
      where: { participants: { some: { userId: user.id } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
  ]);

  const activeProjects = projects.filter((project) => !["COMPLETED", "PAUSED"].includes(project.status));
  const openTickets = tickets.filter((ticket) => !["RESOLVED", "CLOSED"].includes(ticket.status));

  return (
    <main className="portal-shell">
      <div className="container portal-layout">
        <aside className="portal-sidebar">
          <div className="portal-sidebar__brand">Arcates <span>Client</span></div>
          <nav aria-label="Müşteri paneli">
            <Link className="active" href="/hesabim"><span>01</span>Genel Bakış</Link>
            <Link href="/hesabim#projeler"><span>02</span>Projelerim</Link>
            <Link href="/hesabim#destek"><span>03</span>Destek Talepleri</Link>
            <Link href="/hesabim#konusmalar"><span>04</span>Konuşmalar</Link>
            <Link href="/destek/bilgi-merkezi"><span>05</span>Bilgi Merkezi</Link>
          </nav>
          <form action="/cikis" method="post"><button type="submit"><span>06</span>Güvenli Çıkış</button></form>
        </aside>

        <div className="portal-main">
          <header className="portal-main__header">
            <div>
              <span className="eyebrow">{membership?.organization.name ?? "Arcates müşterisi"}</span>
              <h1>Hoş geldiniz, {user.name}.</h1>
            </div>
            <Link href="/destek/destek-talebi" className="button button--secondary">Destek Oluştur</Link>
          </header>

          <div className="portal-metrics">
            <div><span>Aktif proje</span><strong>{activeProjects.length}</strong><small>Hesabınıza bağlı çalışmalar</small></div>
            <div><span>Açık destek kaydı</span><strong>{openTickets.length}</strong><small>Son güncelleme sırasıyla</small></div>
            <div><span>Konuşma geçmişi</span><strong>{conversations.length}</strong><small>Web ve WhatsApp birleşik görünüm</small></div>
          </div>

          <div className="portal-grid" id="projeler">
            <section>
              <span className="eyebrow">Projeleriniz</span>
              <h2>Güncel ilerleme</h2>
              {projects.length ? projects.map((project) => (
                <article className="dashboard-list-row" key={project.id}>
                  <div><strong>{project.name}</strong><small>{projectStatusLabels[project.status]}</small></div>
                  <div className="dashboard-progress" aria-label={`Yüzde ${project.progress} tamamlandı`}><i style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }} /></div>
                  <span>{project.progress}%</span>
                </article>
              )) : <EmptyState title="Henüz proje bulunmuyor" text="Onaylanan projeniz başladığında aşamalar ve teslimatlar burada görünür." />}
            </section>

            <section id="destek">
              <span className="eyebrow">Destek</span>
              <h2>Son talepler</h2>
              {tickets.length ? tickets.map((ticket) => (
                <div className="activity" key={ticket.id}>
                  <CheckIcon size={18} />
                  <div><strong>{ticket.title}</strong><small>{ticket.status.replaceAll("_", " ")}</small></div>
                </div>
              )) : <EmptyState title="Açık talep yok" text="Teknik veya proje desteğine ihtiyaç duyduğunuzda yeni kayıt oluşturabilirsiniz." />}
            </section>
          </div>

          <section className="portal-wide-card" id="konusmalar">
            <span className="eyebrow">Konuşma merkezi</span>
            <h2>Web ve WhatsApp geçmişi</h2>
            {conversations.length ? conversations.map((conversation) => (
              <div className="conversation-row" key={conversation.id}>
                <i />
                <div><strong>{conversation.messages[0]?.content.slice(0, 90) || "Yeni görüşme"}</strong><small>{conversation.channel === "WHATSAPP" ? "WhatsApp" : "Web Chat"}</small></div>
                <span>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(conversation.updatedAt)}</span>
              </div>
            )) : <EmptyState title="Henüz konuşma yok" text="Chatbot görüşmeleriniz hesabınızla eşleştirildiğinde burada listelenecek." />}
          </section>
        </div>
      </div>
    </main>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="dashboard-empty"><strong>{title}</strong><p>{text}</p></div>;
}
