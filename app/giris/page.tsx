import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/giris/actions";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "Arcates müşteri ve yönetim hesabınıza güvenli biçimde giriş yapın.",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const currentUser = await getCurrentUser();
  if (currentUser) redirect(["ADMIN", "OWNER", "STAFF"].includes(currentUser.role) ? "/admin" : "/hesabim");

  const { error } = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-card__intro">
          <span className="eyebrow">Güvenli hesap erişimi</span>
          <h1 id="login-title">Arcates hesabınıza giriş yapın.</h1>
          <p>Projelerinizi, destek taleplerinizi, belgelerinizi ve görüşmelerinizi tek alandan yönetin.</p>
        </div>

        {error ? <div className="form-alert form-alert--error" role="alert">{error}</div> : null}

        <form action={loginAction} className="auth-form">
          <label>
            <span>E-posta adresi</span>
            <input name="email" type="email" autoComplete="email" maxLength={254} required />
          </label>
          <label>
            <span>Parola</span>
            <input name="password" type="password" autoComplete="current-password" minLength={12} maxLength={128} required />
          </label>
          <button className="button button--primary auth-submit" type="submit">Giriş Yap</button>
        </form>

        <div className="auth-card__footer">
          <span>Henüz hesabınız yok mu?</span>
          <Link href="/kayit">Müşteri hesabı oluşturun</Link>
        </div>
      </section>
    </main>
  );
}
