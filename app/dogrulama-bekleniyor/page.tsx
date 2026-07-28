import type { Metadata } from "next";
import Link from "next/link";
import { resendVerificationAction } from "@/app/dogrulama-bekleniyor/actions";

export const metadata: Metadata = {
  title: "E-posta Doğrulaması",
  description: "Arcates hesabınız için e-posta doğrulama bağlantısını yönetin.",
  robots: { index: false, follow: false },
};

type VerificationPendingPageProps = {
  searchParams: Promise<{ delivery?: string; message?: string }>;
};

export default async function VerificationPendingPage({ searchParams }: VerificationPendingPageProps) {
  const { delivery, message } = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="verification-title">
        <div className="auth-card__intro">
          <span className="eyebrow">Hesap güvenliği</span>
          <h1 id="verification-title">E-posta adresinizi doğrulayın.</h1>
          <p>Hesap ve proje verilerine erişmeden önce size gönderilen tek kullanımlık doğrulama bağlantısını açın.</p>
        </div>

        {delivery === "sent" ? <div className="form-alert form-alert--success" role="status">Doğrulama bağlantısı gönderildi. Gelen kutusu ve gereksiz klasörünü kontrol edin.</div> : null}
        {delivery === "pending" ? <div className="form-alert" role="status">Hesabınız oluşturuldu. E-posta servisi henüz gönderimi tamamlamadı; aşağıdaki formdan yeniden deneyebilirsiniz.</div> : null}
        {message ? <div className="form-alert form-alert--success" role="status">{message}</div> : null}

        <form action={resendVerificationAction} className="auth-form">
          <label>
            <span>E-posta adresi</span>
            <input name="email" type="email" autoComplete="email" maxLength={254} required />
          </label>
          <button className="button button--primary auth-submit" type="submit">Yeni Doğrulama Bağlantısı Gönder</button>
        </form>

        <div className="auth-card__footer">
          <span>Adresinizi doğruladınız mı?</span>
          <Link href="/giris">Giriş sayfasına dönün</Link>
        </div>
      </section>
    </main>
  );
}
