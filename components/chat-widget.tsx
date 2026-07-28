"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArcatesMark, AttachmentIcon, CloseIcon, HistoryIcon, SendIcon } from "@/components/icons";

type Message = { id: string; role: "assistant" | "user"; content: string };
type ChatStatus = "AI_ACTIVE" | "WAITING" | "HUMAN_ACTIVE" | "CLOSED";

type HistoryResponse = {
  messages?: Message[];
  status?: ChatStatus;
};

type SendResponse = {
  reply?: string | null;
  error?: string;
  status?: ChatStatus;
};

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "İhtiyacınızı birkaç cümleyle anlatın. Size uygun web çözümünü, gerekli özellikleri ve sonraki adımı birlikte belirleyelim.",
  },
];

const quickPrompts = [
  "Kurumsal web sitesi istiyorum",
  "Özel yazılım projem var",
  "Yapay zekâ chatbot kurmak istiyorum",
  "Temsilciye bağlanmak istiyorum",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [historyReady, setHistoryReady] = useState(false);
  const [status, setStatus] = useState<ChatStatus>("AI_ACTIVE");
  const endRef = useRef<HTMLDivElement>(null);
  const refreshingRef = useRef(false);
  const pendingRef = useRef(false);

  const loadHistory = useCallback(async (force = false) => {
    if (refreshingRef.current || (pendingRef.current && !force)) return;
    refreshingRef.current = true;

    try {
      const response = await fetch("/api/chat/history", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as HistoryResponse;
      if (data.status) setStatus(data.status);
      if (data.messages) {
        setMessages(data.messages.length ? [...initialMessages, ...data.messages] : initialMessages);
      }
    } catch {
      // Sohbet kullanılabilir kalır; geçici geçmiş yenileme hatası sessizce tekrar denenir.
    } finally {
      refreshingRef.current = false;
      setHistoryReady(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setHistoryReady(false);
    void loadHistory();
    const interval = window.setInterval(() => void loadHistory(), 5_000);
    return () => window.clearInterval(interval);
  }, [loadHistory, open]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, pending]);

  useEffect(() => {
    const openFromPage = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-open-chat]")) setOpen(true);
    };
    document.addEventListener("click", openFromPage);
    return () => document.removeEventListener("click", openFromPage);
  }, []);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || pending || !historyReady) return;

    const nextMessage: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((current) => [...current, nextMessage]);
    setInput("");
    setPending(true);
    pendingRef.current = true;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await response.json() as SendResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Mesaj gönderilemedi.");
      }

      if (data.status) setStatus(data.status);
      if (data.reply) {
        setMessages((current) => [
          ...current,
          { id: crypto.randomUUID(), role: "assistant", content: data.reply as string },
        ]);
      }
      pendingRef.current = false;
      await loadHistory(true);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: error instanceof Error
            ? error.message
            : "Şu anda bağlantı kurulamadı. İletişim veya teklif sayfasından talebinizi iletebilirsiniz.",
        },
      ]);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  const stateLabel = status === "HUMAN_ACTIVE"
    ? "İnsan temsilci görüşmede"
    : status === "WAITING"
      ? "Temsilci bekleniyor"
      : "Çözüm yönlendirmesi";

  return (
    <div className={`chat-widget${open ? " chat-widget--open" : ""}`}>
      {open ? (
        <section className="chat-panel" aria-label="Arcates çözüm asistanı">
          <header className="chat-panel__header">
            <div className="chat-panel__identity">
              <span className="chat-panel__mark"><ArcatesMark size={26} /></span>
              <div><strong>Arcates Asistan</strong><span><i /> {stateLabel}</span></div>
            </div>
            <div className="chat-panel__tools">
              <button type="button" aria-label="Görüşme geçmişini yenile" onClick={() => void loadHistory()} disabled={!historyReady || pending}><HistoryIcon size={19} /></button>
              <button type="button" aria-label="Sohbeti kapat" onClick={() => setOpen(false)}><CloseIcon size={19} /></button>
            </div>
          </header>

          <div className="chat-panel__messages" aria-live="polite" aria-busy={!historyReady || pending}>
            {messages.map((message) => (
              <div key={message.id} className={`chat-message chat-message--${message.role}`}>{message.content}</div>
            ))}
            {messages.length === 1 ? (
              <div className="chat-quick-prompts">
                {quickPrompts.map((prompt) => (
                  <button key={prompt} type="button" disabled={!historyReady || pending} onClick={() => void sendMessage(prompt)}>{prompt}</button>
                ))}
              </div>
            ) : null}
            {pending && status === "AI_ACTIVE" ? <div className="chat-message chat-message--assistant chat-message--pending"><span /><span /><span /></div> : null}
            <div ref={endRef} />
          </div>

          <form className="chat-panel__composer" onSubmit={onSubmit}>
            <button type="button" aria-label="Dosya ekle" className="chat-panel__attach" disabled={!historyReady || pending}><AttachmentIcon size={20} /></button>
            <label className="sr-only" htmlFor="chat-message">Mesajınız</label>
            <textarea
              id="chat-message"
              rows={1}
              value={input}
              disabled={!historyReady || pending}
              onChange={(event) => setInput(event.target.value)}
              placeholder={!historyReady ? "Görüşme geçmişi yükleniyor" : status === "HUMAN_ACTIVE" || status === "WAITING" ? "Temsilciye mesajınızı yazın" : "Ne oluşturmak istiyorsunuz?"}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(input);
                }
              }}
            />
            <button type="submit" aria-label="Mesajı gönder" className="chat-panel__send" disabled={!historyReady || !input.trim() || pending}><SendIcon size={20} /></button>
          </form>
          <p className="chat-panel__notice">
            {status === "HUMAN_ACTIVE" || status === "WAITING"
              ? "Mesajlarınız aynı güvenli görüşmede temsilciye iletilir."
              : "Yanıtlar yönlendirme amaçlıdır. Hesap işlemleri güvenli giriş gerektirir."}
          </p>
        </section>
      ) : null}

      <button type="button" className="chat-launcher" aria-label="Arcates asistanını aç" onClick={() => setOpen(true)}>
        <span className="chat-launcher__pulse" />
        <ArcatesMark size={30} />
      </button>
    </div>
  );
}
