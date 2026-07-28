import type { Metadata } from "next";
import { PageHero } from "@/components/page-general";
import { SupportForm } from "@/components/support-form";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destek Talebi Oluştur",
  description: "Arcates hesabınıza ve projenize bağlı izlenebilir destek talebi oluşturun.",
  robots: { index: false, follow: false },
};

export default async function SupportRequestPage() {
  const user = await requireUser();
  const projects = await db.project.findMany({
    where: { members: { some: { userId: user.id } } },
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageHero
        eyebrow="Güvenli müşteri desteği"
        title="Sorunu proje bağlamıyla birlikte kaydedin."
        description="Destek kayıtları hesabınıza bağlanır, öncelik ve durum bilgileriyle izlenir ve yönetim panelinde ilgili ekip tarafından ele alınır."
      />
      <section className="section page-section">
        <div className="container request-layout">
          <aside className="request-layout__aside">
            <span className="eyebrow">Daha hızlı çözüm</span>
            <h2>Talebinizde bulunması gereken bilgiler</h2>
            <ol>
              <li><span>01</span><div><strong>Gerçekleşen durum</strong><p>Şu anda ne olduğunu açık biçimde belirtin.</p></div></li>
              <li><span>02</span><div><strong>Beklenen sonuç</strong><p>Sistemin nasıl davranması gerektiğini açıklayın.</p></div></li>
              <li><span>03</span><div><strong>Tekrar adımları</strong><p>Sorunun hangi işlemlerden sonra oluştuğunu yazın.</p></div></li>
              <li><span>04</span><div><strong>Etkilenen alan</strong><p>İlgili proje, sayfa, cihaz veya kullanıcı rolünü belirtin.</p></div></li>
            </ol>
          </aside>
          <div className="request-layout__form">
            <SupportForm projects={projects} />
          </div>
        </div>
      </section>
    </>
  );
}
