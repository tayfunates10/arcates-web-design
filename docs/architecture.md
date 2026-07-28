# Arcates Platform Architecture

## Sistem sınırları

Arcates, dört ana sınırı olan bir Next.js App Router uygulamasıdır:

1. Genel erişimli pazarlama ve SEO sayfaları
2. Kimliği doğrulanmış müşteri ve yönetim panelleri
3. Sunucu tarafı konuşma ve iş API'leri
4. Harici WhatsApp ve model sağlayıcı adaptörleri

## İstek akışı

```text
Tarayıcı veya WhatsApp
          |
          v
Next.js route veya webhook
          |
          +--> doğrulama ve yetkilendirme
          |
          +--> ortak konuşma / iş servisi
          |
          +--> Prisma üzerinden PostgreSQL
          |
          +--> yapılandırıldıysa OpenAI veya WhatsApp adaptörü
```

## Kimlik doğrulama

- Parolalar rastgele tuz ile Node.js `scrypt` kullanılarak hashlenir.
- Tarayıcıya HTTP-only çerez içinde rastgele opak oturum belirteci verilir.
- PostgreSQL'de yalnızca belirtecin SHA-256 özeti tutulur.
- Oturumların sona erme zamanı vardır ve parola değiştirilmeden iptal edilebilir.
- Müşteri ve admin sayfaları özel veri sorgusundan önce sunucu tarafında rol kontrolü yapar.

## Veri sahipliği

- Kullanıcılar kuruluşlara `OrganizationMember` üzerinden bağlanır.
- Proje erişimi `ProjectMember` üzerinden verilir.
- Destek talebindeki proje kimliği sunucuda kullanıcının proje üyeliğine karşı doğrulanır.
- Web ve WhatsApp kanalları aynı `Conversation` ve `Message` tablolarını kullanır.
- Doğrulanmış `ChannelConnection`, WhatsApp kimliğini Arcates kullanıcısıyla eşleştirir.
- Web ziyaretçisi giriş yapmadan önce HTTP-only anonim kimlik kullanır; girişten sonraki konuşmalar kullanıcı katılımcısıyla ilişkilendirilir.

## Konuşma motoru

Konuşma motorunun iki yanıt yolu vardır:

1. `OPENAI_API_KEY` ve `OPENAI_MODEL` tanımlandığında temellendirilmiş OpenAI Responses API çağrısı
2. Model yapılandırılmadığında veya geçici olarak kullanılamadığında deterministik kural motoru

Model çağrısından önce yalnızca kullanıcının erişebildiği bilgi belgeleri seçilir. İsteklerde `store: false` kullanılır. Üretilen mesajın kaynağı ve kullanılan bilgi başlıkları mesaj metadata alanında saklanır.

Aynı motor hem `/api/chat` web sohbet route'u hem WhatsApp webhook işleyicisi tarafından çağrılır. Böylece hizmet açıklaması, bilgi erişim sınırları ve geri dönüş davranışı kanala göre ayrışmaz.

## WhatsApp işleme

- GET isteği Meta webhook doğrulamasını yapar.
- POST isteklerinde geçerli `x-hub-signature-256` HMAC imzası zorunludur.
- Her gelen mesaj ve durum, sağlayıcı ve dış kimlik benzersizliğiyle `WebhookEvent` tablosuna yazılır.
- Tekrarlanan webhook teslimatı ikinci bir konuşma mesajı oluşturmaz.
- Gelen WhatsApp metni web widget'ıyla aynı konuşma motoruna gönderilir.
- Çıkış mesajı yalnızca gerekli Cloud API ortam değişkenleri eksiksizse gönderilir.
- Gönderim yapılandırılmamışsa gelen olay ve üretilen yanıt kaydı korunur; mesaj gönderilmiş gibi işaretlenmez.

## Dağıtım gereksinimleri

- Node.js 22 veya üzeri
- PostgreSQL bağlantısı
- Üretimde HTTPS
- Güvenli ortam değişkeni yönetimi
- Uygulama başlatılmadan önce veritabanı şema uygulaması veya migration
- İlk veritabanı kurulumundan sonra owner seed komutu

## Kalite kapıları

GitHub Actions sırasıyla şunları çalıştırır:

1. Bağımlılık kurulumu ve Prisma Client üretimi
2. Prisma şema doğrulaması
3. TypeScript tip kontrolü
4. Next.js production build

Bu kontrollerden herhangi biri başarısızken değişiklik üretime hazır kabul edilmez.

## Üretim operasyonları

Kod ve şema dağıtıma hazır hale gelmiş olsa da gerçek servis bağlantıları hedef altyapıda tamamlanır. Canlı ortamda veritabanı migration yönetimi, secret store, hata izleme, oran sınırlama, yedekleme, WhatsApp üretim numarası aboneliği ve alan adı/HTTPS yapılandırması ayrı operasyon adımlarıdır. Bu işlemler yapılmadan sistem canlı müşteri verisiyle çalıştırılmamalıdır.
