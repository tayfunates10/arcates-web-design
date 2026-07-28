# Arcates yayın öncesi QA raporu

**Tarih:** 28 Temmuz 2026  
**Kapsam:** `v0.4.0` öncesi kod, veritabanı, production çalışma ve gerçek tarayıcı kullanım doğrulaması  
**Yayın durumu:** Canlıya alma, sürüm etiketi ve container yayını yapılmadı.

## Otomatik kalite kapıları

- Prisma CLI, Client ve PostgreSQL adapter sürüm uyumluluğu
- Üretim bağımlılıklarında yüksek ve kritik güvenlik açığı denetimi
- Prisma schema doğrulaması
- Temiz PostgreSQL üzerinde migration deploy ve migration status
- Veritabanı ile Prisma şeması arasında drift denetimi
- Tekrarlanabilir owner, CMS ve izole QA müşteri verisi seed işlemleri
- Mevcut davranış testleri
- TypeScript kontrolü
- Next.js production build
- Production uygulama başlangıcı
- Health, readiness, robots ve sitemap kontrolleri
- Yerel HTTPS reverse-proxy üzerinden Secure cookie ve yönlendirme davranışı
- CodeQL güvenlik analizi

## Chromium kullanım senaryoları

1. Sitemap içindeki tüm yayınlanmış sayfaların açılması, belge başlığı, tek ana içerik landmark'ı ve yatay taşma kontrolü
2. Mobil menünün açılması, kapanması ve küçük ekranda viewport sınırlarında kalması
3. Cross-site, hatalı ve yetkisiz API isteklerinin reddedilmesi; metrics token doğrulaması
4. Teklif formundan referans numaralı proje talebi oluşturulması
5. Müşteri kaydı, doğrulama bekleme sayfası ve doğrulanmamış hesabın girişte engellenmesi
6. Misafir chatbot konuşması, kalıcı mesaj geçmişi ve insan temsilciye aktarım
7. Owner girişi, tüm yönetim alanları, müşteri projesi oluşturma/güncelleme ve güvenli çıkış
8. Doğrulanmış müşteri girişi, proje görünümü, destek talebi, admin erişim reddi ve güvenli çıkış

## Test sırasında bulunan ve giderilen sorunlar

- Kök layout ile sayfaların iç içe `<main>` üretmesi giderildi.
- Ana sayfa, catch-all içerik sayfaları, teklif ve destek sayfalarındaki eksik ana içerik landmark'ları eklendi.
- Kayıt formundaki parola alanının erişilebilir adı yardım metninden ayrıldı ve `aria-describedby` ile bağlandı.
- Çıkış yönlendirmesinin reverse-proxy arkasında iç HTTP originine gitmesi engellendi; güvenilir public origin kullanılıyor.
- Chatbot geçmiş yükleme isteğinin yeni mesajları eski state ile ezebildiği yarış durumu giderildi.
- Chatbot ilk geçmiş yüklenmeden mesaj gönderimini açmıyor; gönderim sırasında periyodik yenileme kanonik mesajları bozamıyor.
- QA verisi yalnızca `ARCATES_E2E=true`, localhost ve tam olarak `arcates_qa` veritabanında çalışabilecek şekilde sınırlandırıldı.

## Dış servis sınırları

Aşağıdaki servislerin kod yolları, yapılandırma kontrolleri ve güvenli fallback davranışları test edilmiştir; gerçek üçüncü taraf teslimatı ancak kullanıcıya ait üretim kimlik bilgileriyle doğrulanabilir:

- Resend e-posta domaini ve gerçek e-posta teslimatı
- OpenAI gerçek model yanıtı ve kota davranışı
- Meta WhatsApp production webhook doğrulaması ve mesaj teslimatı
- Gerçek domain, DNS, TLS sertifikası ve üretim sunucusu

Bu maddeler kod hatası olarak değerlendirilmez; canlıya geçişten önce gerçek üretim hesaplarıyla ayrı entegrasyon kabul testi gerektirir.

## Sonuç

Arcates'in mevcut `v0.4.0` uygulama kapsamı yayın öncesi otomatik kalite ve gerçek Chromium kullanım testleriyle doğrulanmıştır. Canlı yayın, domain ve sunucu hazırlığı kullanıcı tarafından ayrıca başlatılana kadar kapalı tutulacaktır. Node.js 26 major çalışma zamanı yükseltmesi bu sürüme dahil değildir ve `v0.5.0` hattında ele alınacaktır.
