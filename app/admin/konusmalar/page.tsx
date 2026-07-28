import type { Metadata } from "next";
import Link from "next/link";
import {
  assignConversationAction,
  closeConversationAction,
  resumeAiConversationAction,
  sendAgentMessageAction,
} from "@/app/admin/konusmalar/actions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Konuşma Merkezi",
  robots: { index: false, follow: false },
};

type ConversationPageProps = {
  searchParams: Promise<{ conversation?: string; success?: string; error?: string }>;
};

const statusLabels = {
  AI_ACTIVE: "AI aktif",
  HUMAN_ACTIVE: "Temsilci aktif",
  WAITING: "Temsilci bekliyor",
  CLOSED: "Kapalı",
} as const;

const statusPriority = {
  WAITING: 0,
  HUMAN_ACTIVE: 1,
  AI_ACTIVE: 2,
  CLOSED: 3,
} as const;

export default async function ConversationsAdminPage({ searchParams }: ConversationPageProps) {
  const currentUser = await requireRole(["STAFF", "ADMIN", "OWNER"]);
  const { conversation: requestedConversationId, success, error } = await searchParams;

  const conversations = await db.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      contact: { select: { name: true, email: true, phone: true, company: true } },
      organization: { select: { name: true } },
      project: { select: { name: true } },
      participants: { include: { user: { select: { name: true, email: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, createdAt: true } },
    },
  });

  conversations.sort((left, right) => {
    const statusDifference = statusPriority[left.status] - statusPriority[right.status];
    return statusDifference || right.updatedAt.getTime() - left.updatedAt.getTime();
  });

  const selectedId = requestedConversationId && conversations.some((item) => item.id === requestedConversationId)
    ? requestedConversationId
    : conversations[0]?.id;

  const selected = selectedId ? await db.conversation.findUnique({
    where: { id: selectedId },
    include: {
      contact: true,
      organization: { select: { name: true } },
      project: { select: { name: true } },
      participants: { include: { user: { select: { name: true, email: true } } } },
      messages: { orderBy: { createdAt: "asc" }, take: 250 },
    },
  }) : null;

  const assignedUser = selected?.assignedUserId
    ? await db.user.findUnique({ where: { id: selected.assignedUserId }, select: { name: true, email: true } })
    : null;

  const canTakeOver = selected
    ? !selected.assignedUserId || selected.assignedUserId === currentUser.id || currentUser.role !== "STAFF"
    : false;

  return (
    <main className="portal-shell conversation-center-shell">
      <div className="container">
        <header className="portal-main__header knowledge-header">
          <div>
            <span className="eyebrow">Web ve WhatsApp</span>
            <h1>Konuşma Merkezi</h1>
            <p>AI görüşmelerini izleyin, temsilci taleplerini devralın ve aynı konuşma üzerinden güvenli insan desteği verin.</p>
          </div>
          <Link className="button button--secondary" href="/admin">Yönetim Paneline Dön</Link>
        </header>

        {success ? <div className="form-alert form-alert--success" role="status">{success}</div> : null}
        {error ? <div className="form-alert form-alert--error" role="alert">{error}</div> : null}

        <div className="conversation-center">
          <aside className="conversation-inbox" aria-label="Konuşmalar">
            <div className="conversation-inbox__header">
              <strong>{conversations.length} konuşma</strong>
              <span>{conversations.filter((item) => item.status === "WAITING").length} bekliyor</span>
            </div>
            <div className="conversation-inbox__list">
              {conversations.length ? conversations.map((item) => (
                <Link
                  className={`conversation-inbox__item${item.id === selectedId ? " active" : ""}`}
                  href={`/admin/konusmalar?conversation=${item.id}`}
                  key={item.id}
                >
                  <div className="conversation-inbox__item-top">
                    <strong>{conversationIdentity(item)}</strong>
                    <span>{item.channel === "WHATSAPP" ? "WhatsApp" : "Web"}</span>
                  </div>
                  <p>{item.messages[0]?.content || "Henüz mesaj yok"}</p>
                  <div className="conversation-inbox__item-bottom">
                    <span className={`conversation-state conversation-state--${item.status.toLocaleLowerCase("tr-TR")}`}>{statusLabels[item.status]}</span>
                    <small>{formatDateTime(item.updatedAt)}</small>
                  </div>
                </Link>
              )) : <div className="dashboard-empty"><p>Henüz konuşma bulunmuyor.</p></div>}
            </div>
          </aside>

          <section className="conversation-workspace">
            {selected ? (
              <>
                <header className="conversation-workspace__header">
                  <div>
                    <span className="eyebrow">{selected.channel === "WHATSAPP" ? "WhatsApp" : "Web Chat"}</span>
                    <h2>{conversationIdentity(selected)}</h2>
                    <p>
                      {selected.organization?.name || "Kuruluş eşleşmedi"}
                      {selected.project ? ` · ${selected.project.name}` : ""}
                      {assignedUser ? ` · Temsilci: ${assignedUser.name}` : " · Atanmamış"}
                    </p>
                  </div>
                  <span className={`conversation-state conversation-state--${selected.status.toLocaleLowerCase("tr-TR")}`}>{statusLabels[selected.status]}</span>
                </header>

                <div className="conversation-toolbar">
                  {selected.status !== "HUMAN_ACTIVE" || selected.assignedUserId !== currentUser.id ? (
                    <form action={assignConversationAction}>
                      <input type="hidden" name="conversationId" value={selected.id} />
                      <button className="button button--primary" type="submit" disabled={!canTakeOver}>Görüşmeyi Devral</button>
                    </form>
                  ) : null}
                  {selected.status !== "AI_ACTIVE" ? (
                    <form action={resumeAiConversationAction}>
                      <input type="hidden" name="conversationId" value={selected.id} />
                      <button className="button button--secondary" type="submit">AI Moduna Aktar</button>
                    </form>
                  ) : null}
                  {selected.status !== "CLOSED" ? (
                    <form action={closeConversationAction}>
                      <input type="hidden" name="conversationId" value={selected.id} />
                      <button className="button button--secondary" type="submit">Görüşmeyi Kapat</button>
                    </form>
                  ) : null}
                </div>

                <div className="conversation-customer-meta">
                  <div><span>Ad</span><strong>{selected.contact?.name || selected.participants[0]?.user.name || "Anonim ziyaretçi"}</strong></div>
                  <div><span>E-posta</span><strong>{selected.contact?.email || selected.participants[0]?.user.email || "Yok"}</strong></div>
                  <div><span>Telefon</span><strong>{selected.contact?.phone || "Yok"}</strong></div>
                  <div><span>Durum</span><strong>{statusLabels[selected.status]}</strong></div>
                </div>

                <div className="conversation-transcript" aria-label="Mesaj geçmişi">
                  {selected.messages.length ? selected.messages.map((message) => (
                    <article className={`transcript-message transcript-message--${message.role.toLocaleLowerCase("tr-TR")}`} key={message.id}>
                      <div className="transcript-message__meta">
                        <strong>{messageAuthor(message.role)}</strong>
                        <span>{formatDateTime(message.createdAt)}</span>
                      </div>
                      <p>{message.content}</p>
                    </article>
                  )) : <div className="dashboard-empty"><p>Bu konuşmada henüz mesaj yok.</p></div>}
                </div>

                <form action={sendAgentMessageAction} className="agent-composer">
                  <input type="hidden" name="conversationId" value={selected.id} />
                  <label className="sr-only" htmlFor="agent-message">Temsilci mesajı</label>
                  <textarea
                    id="agent-message"
                    name="message"
                    rows={4}
                    minLength={1}
                    maxLength={4000}
                    placeholder={selected.channel === "WHATSAPP" ? "WhatsApp üzerinden gönderilecek temsilci mesajı" : "Web sohbetinde görünecek temsilci mesajı"}
                    disabled={selected.status === "CLOSED" || !canTakeOver}
                    required
                  />
                  <button className="button button--primary" type="submit" disabled={selected.status === "CLOSED" || !canTakeOver}>Temsilci Mesajını Gönder</button>
                </form>
              </>
            ) : <div className="dashboard-empty"><strong>Konuşma seçilmedi</strong><p>Mesajlar oluştuğunda konuşma merkezi burada çalışmaya başlayacak.</p></div>}
          </section>
        </div>
      </div>
    </main>
  );
}

function conversationIdentity(conversation: {
  contact: { name: string; company?: string | null } | null;
  participants: Array<{ user: { name: string } }>;
  externalId?: string | null;
}) {
  return conversation.contact?.company
    || conversation.contact?.name
    || conversation.participants[0]?.user.name
    || (conversation.externalId?.startsWith("web:guest:") ? "Anonim web ziyaretçisi" : "Bilinmeyen kullanıcı");
}

function messageAuthor(role: "USER" | "ASSISTANT" | "AGENT" | "SYSTEM" | "TOOL") {
  if (role === "USER") return "Kullanıcı";
  if (role === "AGENT") return "Arcates temsilcisi";
  if (role === "SYSTEM") return "Sistem";
  if (role === "TOOL") return "Güvenli işlem";
  return "Arcates Asistan";
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(date);
}
