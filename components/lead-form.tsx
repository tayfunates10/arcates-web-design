"use client";

import type { FormEvent } from "react";
import { useState } from "react";

const services = [
  "Kurumsal web sitesi",
  "E-ticaret sistemi",
  "Özel web yazılımı",
  "SaaS geliştirme",
  "Yapay zekâ ve chatbot",
  "İş otomasyonu",
  "UI/UX tasarımı",
  "SEO ve performans",
  "Bakım ve teknik destek",
];

type SubmitState = {
  status: "idle" | "pending" | "success" | "error";
  message: string;
  reference?: string;
};

export function LeadForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle", message: "" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status === "pending") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setState({ status: "pending", message: "Talebiniz doğrulanıyor." });

    const budgetValue = String(formData.get("budget") ?? "").trim();
    const payload = {
      name: formData.get("name"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      service: formData.get("service"),
      budget: budgetValue ? Number(budgetValue) : undefined,
      description: formData.get("description"),
      consent: formData.get("consent") === "on",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as { message?: string; error?: string; reference?: string };

      if (!response.ok) {
        setState({ status: "error", message: data.error ?? "Talep kaydedilemedi." });
        return;
      }

      form.reset();
      setState({
        status: "success",
        message: data.message ?? "Talebiniz kaydedildi.",
        reference: data.reference,
      });
    } catch {
      setState({ status: "error", message: "Sunucuya bağlanılamadı. Lütfen tekrar deneyin." });
    }
  }

  return (
    <form className="request-form" onSubmit={onSubmit}>
      <div className="request-form__grid">
        <label><span>Ad soyad</span><input name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required /></label>
        <label><span>Şirket veya marka</span><input name="company" type="text" autoComplete="organization" maxLength={120} /></label>
        <label><span>E-posta adresi</span><input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
        <label><span>Telefon</span><input name="phone" type="tel" autoComplete="tel" maxLength={30} /></label>
        <label>
          <span>İlgilendiğiniz çözüm</span>
          <select name="service" defaultValue="">
            <option value="">Henüz emin değilim</option>
            {services.map((service) => <option key={service} value={service}>{service}</option>)}
          </select>
        </label>
        <label><span>Planlanan bütçe (TL)</span><input name="budget" type="number" min={0} max={100000000} step={1000} inputMode="numeric" /></label>
        <label className="request-form__full">
          <span>Projenizi ve hedefinizi anlatın</span>
          <textarea name="description" rows={7} minLength={20} maxLength={5000} required />
        </label>
        <label className="auth-consent request-form__full">
          <input name="consent" type="checkbox" required />
          <span>Talebimin değerlendirilmesi ve benimle iletişime geçilmesi için verdiğim bilgilerin işlenmesini kabul ediyorum.</span>
        </label>
      </div>

      {state.status !== "idle" ? (
        <div className={`form-alert form-alert--${state.status === "success" ? "success" : state.status === "error" ? "error" : "info"}`} role="status">
          {state.message}{state.reference ? <small>Referans: {state.reference}</small> : null}
        </div>
      ) : null}

      <button className="button button--primary auth-submit" type="submit" disabled={state.status === "pending"}>
        {state.status === "pending" ? "Kaydediliyor" : "Proje Talebini Gönder"}
      </button>
    </form>
  );
}
