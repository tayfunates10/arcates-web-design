import type { Metadata } from "next";
import Link from "next/link";
import { requestPasswordResetAction } from "@/app/parolami-unuttum/actions";

export const metadata: Metadata = {
  title: "Parolamı Unuttum",
  description: "Arcates hesabınız için güvenli parola sıfırlama bağlantısı isteyin.",
  robots: { index: false, follow: false },
};

type ForgotPasswordPageProps = {
  searchParams: Promise<{ sent?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { sent } = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="forgot-password-title">
        <div className="auth-card__intro">
          <span className="eyebrow">Hesap kurtarma</span>
          <h1 id="forgot-password-title">Parolanızı güvenli biçimde yenileyin.</h1>
          <p>Hesap bu adresle eşleşiyorsa 30 dakika geçerli tek kullanımlık sıfırlama bağlantısı gönderilir.</p>
        </div>

        {sent ? <div className="form-alert form-alert--success" role="status">Hesap bu adresle eşleşiyorsa parola sıfırlama bağlantısı gönderildi.</div> : null}

        <form action={requestPasswordResetAction} className="auth-form">
          <label>
            <span>E-posta adresi</span>
            <input name="email" type="email" autoComplete="email" maxLength={254} required />
          </label>
          <button className="button button--primary auth-submit" type="submit">Sıfırlama Bağlantısı Gönder</button>
        </form>

        <div className="auth-card__footer">
          <span>Parolanızı hatırladınız mı?</span>
          <Link href="/giris">Giriş sayfasına dönün</Link>
        </div>
      </section>
    </main>
  );
}
