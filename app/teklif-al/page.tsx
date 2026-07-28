import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";
import { PageHero } from "@/components/page-general";

export const metadata: Metadata = {
  title: "Teklif Al",
  description: "Web sitesi, özel yazılım, e-ticaret, yapay zekâ ve otomasyon projeniz için kapsamlı teklif talebi oluşturun.",
  alternates: { canonical: "/teklif-al" },
};

export default function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Proje başlangıcı"
        title="İhtiyacınızı ölçülebilir bir proje kapsamına dönüştürelim."
        description="Hedefinizi, mevcut sisteminizi ve ihtiyaç duyduğunuz özellikleri paylaşın. Talebiniz yönetim panelindeki satış hattına güvenli biçimde kaydedilir."
      />
      <section className="section page-section">
        <div className="container request-layout">
          <aside className="request-layout__aside">
            <span className="eyebrow">Süreç nasıl işler?</span>
            <h2>Form yalnızca iletişim bilgisi toplamaz.</h2>
            <p>Verdiğiniz yanıtlar çözüm türünü, ana işlevleri, entegrasyonları ve keşif görüşmesinde netleştirilecek konuları belirler.</p>
            <ol>
              <li><span>01</span><div><strong>Talep doğrulama</strong><p>İletişim ve proje bilgileri sunucuda doğrulanır.</p></div></li>
              <li><span>02</span><div><strong>Kapsam analizi</strong><p>İhtiyaçlar hizmet ve teknik gereksinimlere ayrılır.</p></div></li>
              <li><span>03</span><div><strong>Keşif görüşmesi</strong><p>Belirsiz noktalar ve teslim kriterleri netleştirilir.</p></div></li>
              <li><span>04</span><div><strong>Teklif</strong><p>Kapsam, aşamalar ve maliyet kalemleri yazılı olarak sunulur.</p></div></li>
            </ol>
          </aside>
          <div className="request-layout__form">
            <LeadForm />
          </div>
        </div>
      </section>
    </>
  );
}
