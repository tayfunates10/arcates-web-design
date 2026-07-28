import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/app/kayit/actions";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Müşteri Hesabı Oluştur",
  description: "Arcates proje, teklif ve destek süreçlerinizi yönetmek için güvenli müşteri hesabı oluşturun.",
  robots: { index: false, follow: false },
};

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const currentUser = await getCurrentUser();
  if (currentUser) redirect(["ADMIN", "OWNER", "STAFF"].includes(currentUser.role) ? "/admin" : "/hesabim");

  const { error } = await searchParams;

  return (
    <main className="auth-shell auth-shell--wide">
      <section className="auth-card" aria-labelledby="register-title">
        <div className="auth-card__intro">
          <span className="eyebrow">Müşteri hesabı</span>
          <h1 id="register-title">Proje alanınızı oluşturun.</h1>
          <p>Teklif, proje ilerlemesi, belgeler, destek kayıtları ve chatbot görüşmeleri tek hesapta birleşir.</p>
        </div>

        {error ? <div className="form-alert form-alert--error" role="alert">{error}</div> : null}

        <form action={registerAction} className="auth-form auth-form--grid">
          <label>
            <span>Ad soyad</span>
            <input name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required />
          </label>
          <label>
            <span>Şirket veya marka</span>
            <input name="company" type="text" autoComplete="organization" minLength={2} maxLength={120} required />
          </label>
          <label className="auth-form__full">
            <span>E-posta adresi</span>
            <input name="email" type="email" autoComplete="email" maxLength={254} required />
          </label>
          <div className="auth-form__full">
            <label htmlFor="register-password"><span>Parola</span></label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              aria-describedby="register-password-help"
              required
            />
            <small id="register-password-help">En az 12 karakter; büyük harf, küçük harf ve sayı içermelidir.</small>
          </div>
          <label className="auth-consent auth-form__full">
            <input name="consent" type="checkbox" required />
            <span><Link href="/gizlilik-politikasi">Gizlilik Politikası</Link> ve <Link href="/kullanim-kosullari">Kullanım Koşulları</Link> metinlerini okudum ve kabul ediyorum.</span>
          </label>
          <button className="button button--primary auth-submit auth-form__full" type="submit">Hesabı Oluştur</button>
        </form>

        <div className="auth-card__footer">
          <span>Zaten hesabınız var mı?</span>
          <Link href="/giris">Giriş yapın</Link>
        </div>
      </section>
    </main>
  );
}
