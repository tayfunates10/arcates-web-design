"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArcatesMark, AttachmentIcon, CloseIcon, HistoryIcon, SendIcon } from "@/components/icons";

type Message = { id: string; role: "assistant" | "user"; content: string };

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
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

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
    if (!trimmed || pending) return;

    const nextMessage: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((current) => [...current, nextMessage]);
    setInput("");
    setPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = (await response.json()) as { reply?: string };
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply ?? "Bu konuyu bir uzmanla birlikte netleştirmemiz gerekiyor. Teklif sayfasından proje kapsamı oluşturabilirsiniz.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Şu anda bağlantı kurulamadı. İletişim veya teklif sayfasından talebinizi iletebilirsiniz.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className={`chat-widget${open ? " chat-widget--open" : ""}`}>
      {open ? (
        <section className="chat-panel" aria-label="Arcates çözüm asistanı">
          <header className="chat-panel__header">
            <div className="chat-panel__identity">
              <span className="chat-panel__mark"><ArcatesMark size={26} /></span>
              <div><strong>Arcates Asistan</strong><span><i /> Çözüm yönlendirmesi</span></div>
            </div>
            <div className="chat-panel__tools">
              <button type="button" aria-label="Görüşme geçmişi"><HistoryIcon size={19} /></button>
              <button type="button" aria-label="Sohbeti kapat" onClick={() => setOpen(false)}><CloseIcon size={19} /></button>
            </div>
          </header>

          <div className="chat-panel__messages" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`chat-message chat-message--${message.role}`}>{message.content}</div>
            ))}
            {messages.length === 1 ? (
              <div className="chat-quick-prompts">
                {quickPrompts.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => void sendMessage(prompt)}>{prompt}</button>
                ))}
              </div>
            ) : null}
            {pending ? <div className="chat-message chat-message--assistant chat-message--pending"><span /><span /><span /></div> : null}
            <div ref={endRef} />
          </div>

          <form className="chat-panel__composer" onSubmit={onSubmit}>
            <button type="button" aria-label="Dosya ekle" className="chat-panel__attach"><AttachmentIcon size={20} /></button>
            <label className="sr-only" htmlFor="chat-message">Mesajınız</label>
            <textarea
              id="chat-message"
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ne oluşturmak istiyorsunuz?"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(input);
                }
              }}
            />
            <button type="submit" aria-label="Mesajı gönder" className="chat-panel__send" disabled={!input.trim() || pending}><SendIcon size={20} /></button>
          </form>
          <p className="chat-panel__notice">Yanıtlar yönlendirme amaçlıdır. Hesap işlemleri güvenli giriş gerektirir.</p>
        </section>
      ) : null}

      <button type="button" className="chat-launcher" aria-label="Arcates asistanını aç" onClick={() => setOpen(true)}>
        <span className="chat-launcher__pulse" />
        <ArcatesMark size={30} />
      </button>
    </div>
  );
}
