"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type ProjectOption = { id: string; name: string };
type FormState = { status: "idle" | "pending" | "success" | "error"; message: string; reference?: string };

export function SupportForm({ projects }: { projects: ProjectOption[] }) {
  const [state, setState] = useState<FormState>({ status: "idle", message: "" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status === "pending") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setState({ status: "pending", message: "Destek talebiniz doğrulanıyor." });

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          priority: formData.get("priority"),
          projectId: formData.get("projectId") || undefined,
        }),
      });
      const data = await response.json() as { message?: string; error?: string; reference?: string };

      if (!response.ok) {
        setState({ status: "error", message: data.error ?? "Destek talebi oluşturulamadı." });
        return;
      }

      form.reset();
      setState({ status: "success", message: data.message ?? "Destek talebiniz oluşturuldu.", reference: data.reference });
    } catch {
      setState({ status: "error", message: "Sunucuya bağlanılamadı. Lütfen tekrar deneyin." });
    }
  }

  return (
    <form className="request-form" onSubmit={onSubmit}>
      <div className="request-form__grid">
        <label className="request-form__full">
          <span>İlgili proje</span>
          <select name="projectId" defaultValue="">
            <option value="">Genel hesap veya teknik destek</option>
            {projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}
          </select>
        </label>
        <label>
          <span>Öncelik</span>
          <select name="priority" defaultValue="NORMAL">
            <option value="LOW">Düşük</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">Yüksek</option>
            <option value="URGENT">Acil</option>
          </select>
        </label>
        <label>
          <span>Kısa başlık</span>
          <input name="title" type="text" minLength={5} maxLength={160} required />
        </label>
        <label className="request-form__full">
          <span>Sorunu, beklenen davranışı ve tekrar adımlarını açıklayın</span>
          <textarea name="description" rows={8} minLength={20} maxLength={5000} required />
        </label>
      </div>

      {state.status !== "idle" ? (
        <div className={`form-alert form-alert--${state.status === "success" ? "success" : state.status === "error" ? "error" : "info"}`} role="status">
          {state.message}{state.reference ? <small>Referans: {state.reference}</small> : null}
        </div>
      ) : null}

      <button className="button button--primary auth-submit" type="submit" disabled={state.status === "pending"}>
        {state.status === "pending" ? "Oluşturuluyor" : "Destek Talebi Oluştur"}
      </button>
    </form>
  );
}
