# Arcates Güvenlik Politikası

## Desteklenen sürümler

Arcates henüz ilk üretim sürümüne hazırlanmaktadır. Güvenlik düzeltmeleri yalnızca `main` dalındaki güncel sürüm ve en son yayınlanan semantik sürüm için hazırlanır.

| Sürüm | Güvenlik desteği |
| --- | --- |
| Güncel `main` | Evet |
| En son yayın | Evet |
| Daha eski sürümler | Hayır |

## Güvenlik açığı bildirme

Güvenlik açıklarını herkese açık issue, pull request, tartışma veya sosyal medya mesajıyla paylaşmayın.

Tercih edilen yöntem GitHub repository sayfasındaki **Security > Report a vulnerability** alanından private vulnerability report oluşturmaktır. Bu özellik erişilebilir değilse repository sahibine, açığın ayrıntılarını herkese açık olmayan bir kanaldan iletin.

Bildirimde mümkün olduğunca aşağıdakileri ekleyin:

- Etkilenen commit, sürüm veya endpoint
- Yeniden üretme adımları
- Beklenen ve gerçekleşen davranış
- Etki ve saldırı koşulları
- Varsa güvenli düzeltme önerisi
- Hassas veri içermeyen ekran görüntüsü veya log

Gerçek kullanıcı parolası, API anahtarı, oturum tokenı, e-posta doğrulama tokenı, WhatsApp erişim anahtarı veya kişisel veri göndermeyin.

## Yanıt süreci

- Bildirim alındığında kapsam ve tekrarlanabilirlik incelenir.
- Geçerli bulgular için etki ve öncelik belirlenir.
- Düzeltme ayrı ve sınırlı erişimli dalda hazırlanır.
- Test, CodeQL, migration, production build ve Docker doğrulamaları tamamlanır.
- Gerekirse anahtarlar iptal edilir, oturumlar sonlandırılır ve olay kaydı oluşturulur.
- Düzeltme yayınlandıktan sonra güvenli açıklama hazırlanır.

Kesin yanıt veya düzeltme süresi garanti edilmez; kullanıcı verisi, kimlik doğrulama, yetki atlama, uzaktan kod çalıştırma ve secret sızıntısı içeren bulgular en yüksek öncelikle ele alınır.

## Kapsam

Özellikle aşağıdaki alanlar kapsam içindedir:

- Kimlik doğrulama ve oturum yönetimi
- E-posta doğrulama ve parola sıfırlama
- Rol ve kuruluş izolasyonu
- Web ve WhatsApp webhook doğrulaması
- Chatbot araç yetkilendirmesi
- PostgreSQL veri erişimi ve migration'lar
- Dosya, secret ve ortam değişkeni sızıntıları
- Docker, Compose, Caddy ve CI/CD zinciri
- SSRF, XSS, CSRF, SQL injection ve yetkisiz veri erişimi

Yalnızca otomatik tarama çıktısı olup gerçek etki veya yeniden üretme adımı içermeyen bildirimler doğrulanmış açık sayılmaz.
