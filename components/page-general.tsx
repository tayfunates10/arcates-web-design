import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";

export function GenericPage({ page, path }: { page: { title: string; eyebrow: string; description: string; sections: { title: string; text: string }[] }; path: string }) {
  const isFaq = path === "sss";
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} description={page.description} />
      <section className="section page-section"><div className={`container ${isFaq ? "faq-list generic-faq" : "generic-grid"}`}>{page.sections.map((section, index) => isFaq ? <details key={section.title} open={index === 0}><summary>{section.title}<span /></summary><p>{section.text}</p></details> : <article key={section.title}><span>0{index + 1}</span><h2>{section.title}</h2><p>{section.text}</p></article>)}</div></section>
      <CtaBand />
    </>
  );
}

export function AccountPreview() {
  return (
    <section className="portal-shell"><div className="container portal-layout">
      <aside className="portal-sidebar"><div className="portal-sidebar__brand">Arcates <span>Client</span></div>{["Genel Bakış", "Projelerim", "Görevler", "Mesajlar", "Destek Talepleri", "Dosyalar", "Teklifler", "Güvenlik"].map((item, index) => <button className={index === 0 ? "active" : ""} key={item} type="button"><span>0{index + 1}</span>{item}</button>)}</aside>
      <div className="portal-main"><div className="portal-main__header"><div><span className="eyebrow">Müşteri alanı önizlemesi</span><h1>Genel Bakış</h1></div><Link href="/iletisim" className="button button--secondary">Destek Oluştur</Link></div>
        <div className="portal-metrics"><div><span>Aktif proje</span><strong>1</strong><small>Geliştirme aşaması</small></div><div><span>Açık görev</span><strong>6</strong><small>2 onay bekliyor</small></div><div><span>Destek talebi</span><strong>0</strong><small>Tüm talepler çözüldü</small></div></div>
        <div className="portal-grid"><section><span className="eyebrow">Aktif proje</span><h2>Arcates Web Platformu</h2><p>Tasarım sistemi ve genel site geliştirme aşaması.</p><div className="progress"><i /></div><small>Yüzde 38 tamamlandı</small></section><section><span className="eyebrow">Son güncellemeler</span>{["SVG ikon sistemi oluşturuldu", "Ana sayfa bileşenleri tamamlandı", "Chatbot arayüzü eklendi"].map((item) => <div className="activity" key={item}><CheckIcon size={18} /><span>{item}</span></div>)}</section></div>
      </div>
    </div></section>
  );
}

export function AdminPreview() {
  return (
    <section className="portal-shell"><div className="container portal-layout">
      <aside className="portal-sidebar"><div className="portal-sidebar__brand">Arcates <span>Admin</span></div>{["Dashboard", "Müşteriler", "Projeler", "Teklifler", "Destek", "Konuşmalar", "Chatbot", "Bilgi Tabanı", "SEO", "Ayarlar"].map((item, index) => <button className={index === 0 ? "active" : ""} key={item} type="button"><span>{String(index + 1).padStart(2, "0")}</span>{item}</button>)}</aside>
      <div className="portal-main"><div className="portal-main__header"><div><span className="eyebrow">Yönetim alanı önizlemesi</span><h1>Operasyon Paneli</h1></div><button className="button button--primary" type="button">Yeni Proje</button></div>
        <div className="portal-metrics"><div><span>Yeni talep</span><strong>12</strong><small>Son 30 gün</small></div><div><span>Aktif görüşme</span><strong>8</strong><small>3 insan desteğinde</small></div><div><span>Bilgi kapsaması</span><strong>84%</strong><small>26 kaynak aktif</small></div></div>
        <div className="portal-grid"><section><span className="eyebrow">Kanal merkezi</span><h2>Web ve WhatsApp</h2>{["Kurumsal site talebi", "Proje durum sorgusu", "Teknik destek"].map((item, index) => <div className="conversation-row" key={item}><i /><div><strong>{item}</strong><small>{index === 1 ? "WhatsApp" : "Web Chat"}</small></div><span>{index + 2} dk</span></div>)}</section><section><span className="eyebrow">Sistem sağlığı</span>{["Web uygulaması", "Chatbot API", "WhatsApp webhook", "Veritabanı"].map((item) => <div className="health-row" key={item}><span>{item}</span><strong>Çalışıyor</strong></div>)}</section></div>
      </div>
    </div></section>
  );
}

export function SupportSubPage({ path }: { path: string }) {
  const data: Record<string, [string, string, string]> = {
    "destek/bilgi-merkezi": ["Bilgi Merkezi", "Yanıtı hızlıca bulun.", "Web sitesi, hesap, proje ve teknik işlemler için aranabilir destek içerikleri."],
    "destek/destek-talebi": ["Destek Talebi", "Sorunu bağlamıyla birlikte iletin.", "Proje, öncelik, ekran görüntüsü ve beklenen davranışı içeren izlenebilir destek kaydı."],
    "destek/sistem-durumu": ["Sistem Durumu", "Arcates servislerinin güncel durumu.", "Web uygulaması, chatbot, webhook ve veri servislerinin çalışma bilgisi."],
    "destek/uzaktan-destek": ["Uzaktan Destek", "Yetkili ve kontrollü teknik yardım.", "Açık kullanıcı onayı, sınırlı süre ve denetim kaydıyla yürütülen destek oturumu."],
  };
  const [eyebrow, title, description] = data[path];
  return <><PageHero eyebrow={eyebrow} title={title} description={description} /><section className="section page-section"><div className="container support-cards">{["Başlangıç", "Doğrulama", "Çözüm", "Takip"].map((item, index) => <article key={item}><span>0{index + 1}</span><h2>{item}</h2><p>İşlem, kullanıcıya açık durum bilgileri ve kayıtlı adımlarla yönetilir.</p></article>)}</div></section></>;
}

export function LegalPage({ path }: { path: string }) {
  const titles: Record<string, string> = { "gizlilik-politikasi": "Gizlilik Politikası", "cerez-politikasi": "Çerez Politikası", "kullanim-kosullari": "Kullanım Koşulları", kvkk: "KVKK Aydınlatma Metni" };
  return <><PageHero eyebrow="Yasal" title={titles[path]} description="Bu sayfa üretim öncesinde hukuk uzmanı tarafından doğrulanacak taslak içerik yapısını gösterir." /><article className="article-body container"><h2>Veri sorumluluğu</h2><p>Toplanan verilerin amacı, kapsamı, hukuki dayanağı, saklama süresi ve kullanıcı hakları açık biçimde belirtilmelidir.</p><h2>Hizmet sağlayıcılar</h2><p>Barındırma, analitik, iletişim, yapay zekâ ve mesajlaşma sağlayıcıları üretim yapılandırmasına göre listelenmelidir.</p><h2>Kullanıcı hakları</h2><p>Erişim, düzeltme, silme, itiraz ve başvuru yöntemleri ulaşılabilir ve doğrulanabilir iletişim kanallarıyla açıklanmalıdır.</p></article></>;
}

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="page-hero"><div className="container page-hero__inner"><div className="eyebrow"><span /> {eyebrow}</div><h1>{title}</h1><p>{description}</p><div className="hero__actions"><Link href="/teklif-al" className="button button--primary">Projenizi Başlatın <ArrowRightIcon size={18} /></Link><Link href="/iletisim" className="button button--secondary">İletişime Geçin</Link></div></div></section>;
}

export function DecisionSection() {
  return <section className="section final-cta"><div className="container final-cta__inner"><span className="final-cta__grid" /><div><div className="eyebrow"><span /> Çözüm seçimi</div><h2>Hangi hizmetin uygun olduğundan emin değil misiniz?</h2><p>Hedefinizi anlatın; ihtiyaçları hizmet, özellik ve teknik gereksinimlere ayıralım.</p></div><div className="final-cta__actions"><Link href="/teklif-al" className="button button--light">Kapsam Oluşturun <ArrowRightIcon size={18} /></Link></div></div></section>;
}

export function CtaBand() {
  return <section className="section final-cta"><div className="container final-cta__inner"><span className="final-cta__grid" /><div><div className="eyebrow"><span /> Birlikte geliştirelim</div><h2>Benzer bir sistemi işletmeniz için planlayalım.</h2></div><div className="final-cta__actions"><Link href="/teklif-al" className="button button--light">Projenizi Başlatın <ArrowRightIcon size={18} /></Link></div></div></section>;
}
