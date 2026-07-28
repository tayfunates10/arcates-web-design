"use client";

import { useEffect, useState } from "react";

type ConnectionState = {
  loading: boolean;
  connected: boolean;
  phone: string | null;
  code: string | null;
  expiresAt: string | null;
  message: string;
  error: boolean;
};

const initialState: ConnectionState = {
  loading: true,
  connected: false,
  phone: null,
  code: null,
  expiresAt: null,
  message: "WhatsApp bağlantısı kontrol ediliyor.",
  error: false,
};

export function WhatsAppLinkCard() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    void loadStatus();
  }, []);

  async function loadStatus() {
    try {
      const response = await fetch("/api/channels/whatsapp", { cache: "no-store" });
      const data = await response.json() as { connected?: boolean; phone?: string | null; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Bağlantı durumu alınamadı.");
      setState({
        loading: false,
        connected: Boolean(data.connected),
        phone: data.phone ?? null,
        code: null,
        expiresAt: null,
        message: data.connected ? "WhatsApp hesabınız doğrulandı." : "Henüz doğrulanmış WhatsApp numarası yok.",
        error: false,
      });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: true, message: error instanceof Error ? error.message : "Bağlantı durumu alınamadı." }));
    }
  }

  async function createCode() {
    setState((current) => ({ ...current, loading: true, error: false, message: "Tek kullanımlık kod oluşturuluyor." }));
    try {
      const response = await fetch("/api/channels/whatsapp", { method: "POST" });
      const data = await response.json() as { code?: string; expiresAt?: string; instruction?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Bağlantı kodu oluşturulamadı.");
      setState({
        loading: false,
        connected: false,
        phone: null,
        code: data.code ?? null,
        expiresAt: data.expiresAt ?? null,
        message: data.instruction ?? "Kodu WhatsApp hattına gönderin.",
        error: false,
      });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: true, message: error instanceof Error ? error.message : "Bağlantı kodu oluşturulamadı." }));
    }
  }

  async function revokeConnection() {
    setState((current) => ({ ...current, loading: true, error: false, message: "Bağlantı kaldırılıyor." }));
    try {
      const response = await fetch("/api/channels/whatsapp", { method: "DELETE" });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Bağlantı kaldırılamadı.");
      setState({ ...initialState, loading: false, message: "WhatsApp bağlantısı kaldırıldı." });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: true, message: error instanceof Error ? error.message : "Bağlantı kaldırılamadı." }));
    }
  }

  return (
    <section className="portal-wide-card channel-card" aria-labelledby="whatsapp-link-title">
      <div className="portal-wide-card__header">
        <div>
          <span className="eyebrow">Kanal bağlantısı</span>
          <h2 id="whatsapp-link-title">WhatsApp hesabı</h2>
        </div>
        <span className={`channel-status${state.connected ? " channel-status--connected" : ""}`}>
          {state.connected ? "Bağlı" : "Bağlı değil"}
        </span>
      </div>

      <p>{state.message}</p>

      {state.connected ? (
        <div className="channel-card__connected">
          <div><span>Doğrulanmış numara</span><strong>{state.phone ?? "Gizli numara"}</strong></div>
          <button className="button button--secondary" type="button" onClick={() => void revokeConnection()} disabled={state.loading}>Bağlantıyı Kaldır</button>
        </div>
      ) : (
        <>
          {state.code ? (
            <div className="channel-code">
              <span>Tek kullanımlık kod</span>
              <strong>{state.code}</strong>
              <small>{state.expiresAt ? `${new Intl.DateTimeFormat("tr-TR", { timeStyle: "short" }).format(new Date(state.expiresAt))} saatine kadar geçerli` : "10 dakika geçerli"}</small>
            </div>
          ) : null}
          <div className="channel-card__actions">
            <button className="button button--primary" type="button" onClick={() => void createCode()} disabled={state.loading}>
              {state.loading ? "Kontrol Ediliyor" : state.code ? "Yeni Kod Oluştur" : "Bağlantı Kodu Oluştur"}
            </button>
            {state.code ? <button className="button button--secondary" type="button" onClick={() => void loadStatus()} disabled={state.loading}>Bağlantıyı Kontrol Et</button> : null}
          </div>
        </>
      )}

      {state.error ? <div className="form-alert form-alert--error" role="alert">{state.message}</div> : null}
    </section>
  );
}
