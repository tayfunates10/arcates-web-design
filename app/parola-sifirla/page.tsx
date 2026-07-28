import type { Metadata } from "next";
import Link from "next/link";
import { resetPasswordAction } from "@/app/parola-sifirla/actions";

export const metadata: Metadata = {
  title: "Parola Sıfırla",
  description: "Arcates hesabınız için yeni ve güçlü bir parola belirleyin.",
  robots: { index: false, follow: false },
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token = "", error } = await searchParams;
  const tokenAvailable = token.length >= 32 && token.length <= 256;

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="reset-password-title">
        <div className="auth-card__intro">
          <span className="eyebrow">Hesap kurtarma</span>
          <h1 id="reset-password-title">Yeni parolanızı belirleyin.</h1>
          <p>Yeni parola en az 12 karakter, büyük harf, küçük harf ve sayı içermelidir.</p>
        </div>

        {error ? <div className="form-alert form-alert--error" role="alert">{error}</div> : null}
        {!tokenAvailable ? <div className="form-alert form-alert--error" role="alert">Parola sıfırlama bağlantısı eksik veya geçersiz.</div> : null}

        {tokenAvailable ? (
          <form action={resetPasswordAction} className="auth-form">
            <input name="token" type="hidden" value={token} />
            <label>
              <span>Yeni parola</span>
              <input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
            </label>
            <label>
              <span>Yeni parola tekrarı</span>
              <input name="passwordConfirm" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
            </label>
            <button className="button button--primary auth-submit" type="submit">Parolayı Güvenli Biçimde Değiştir</button>
          </form>
        ) : null}

        <div className="auth-card__footer">
          <span>Yeni bağlantıya mı ihtiyacınız var?</span>
          <Link href="/parolami-unuttum">Sıfırlama bağlantısı isteyin</Link>
        </div>
      </section>
    </main>
  );
}
