# Arcates E-posta Doğrulama ve Hesap Kurtarma

Arcates hesap e-postaları sunucu tarafında oluşturulur. Tarayıcıya e-posta sağlayıcısı anahtarı aktarılmaz.

## Yapılandırma

```env
NEXT_PUBLIC_SITE_URL=https://arcates.com
RESEND_API_KEY=re_...
EMAIL_FROM=Arcates <hesap@arcates.com>
EMAIL_REPLY_TO=destek@arcates.com
```

`EMAIL_FROM` adresindeki alan adı e-posta sağlayıcısında doğrulanmış olmalıdır. DNS kayıtları tamamlanmadan üretim gönderimleri etkin kabul edilmemelidir.

## E-posta doğrulama akışı

1. Kullanıcı kayıt formunu gönderir.
2. Kullanıcı ve müşteri kuruluşu tek veritabanı transaction’ında oluşturulur.
3. 32 bayt rastgele doğrulama tokenı üretilir.
4. Ham token yalnızca doğrulama bağlantısında kullanılır.
5. Veritabanında tokenın SHA-256 özeti, kullanıcı kimliği ve 24 saatlik süre tutulur.
6. Yeni doğrulama bağlantısı oluşturulduğunda önceki kullanılmamış bağlantılar iptal edilir.
7. Bağlantı tüketildiğinde `emailVerifiedAt` alanı güncellenir ve kullanıcı için güvenli oturum oluşturulur.
8. Kullanılmış, iptal edilmiş veya süresi dolmuş token yeniden kullanılamaz.

Doğrulanmamış müşteri hesapları giriş yapamaz. Yönetici seed hesabı oluşturulurken e-posta doğrulanmış olarak işaretlenir.

## Parola sıfırlama akışı

1. Talep ekranı hesap varlığını açıklamayan genel bir yanıt verir.
2. E-posta bir hesapla eşleşiyorsa 30 dakika geçerli tek kullanımlık bağlantı gönderilir.
3. Tokenın yalnızca SHA-256 özeti saklanır.
4. Yeni parola güçlü parola kurallarından ve tekrar eşleşmesinden geçer.
5. Token atomik olarak tüketilir.
6. Parola `scrypt` ve yeni rastgele tuz ile hashlenir.
7. Kullanıcının önceki tüm oturumları iptal edilir.
8. Yalnızca sıfırlama işlemini yapan cihaz için yeni oturum oluşturulur.

## Oran sınırlama

- Kayıt: e-posta başına 15 dakikada 5 deneme
- Giriş: e-posta başına 15 dakikada 8 deneme
- Doğrulama bağlantısı: e-posta başına saatte 3 istek
- Parola sıfırlama talebi: e-posta başına saatte 3 istek
- Token tüketme: token özeti başına 30 dakikada 6 deneme

Sayaçlar PostgreSQL üzerinde saklandığı için birden fazla uygulama konteynerinde ortak uygulanır.

## Teslimat davranışı

Gönderimler e-posta sağlayıcısına idempotency anahtarıyla iletilir. Audit log yalnızca teslimat durumu, sağlayıcı kimliği ve hata sınıfını içerir; ham token veya tam doğrulama bağlantısı audit metadata alanına yazılmaz.

Sağlayıcı yapılandırılmamışsa:

- Üretimde gönderilmiş gibi davranılmaz.
- Kullanıcı yeni bağlantı isteme ekranına yönlendirilir.
- Geliştirme ortamında bağlantı yalnızca sunucu konsoluna yazılır.

## İzleme

`/api/ready` çıktısındaki `emailConfigured` alanı API anahtarı, gönderen adresi ve site URL’sinin tanımlı olup olmadığını gösterir. Bu alan DNS doğrulamasını veya gerçek teslimatı garanti etmez; canlıya geçiş öncesinde gerçek test hesabına doğrulama ve sıfırlama e-postaları gönderilmelidir.

## Güvenlik kontrol listesi

- `RESEND_API_KEY` secret store veya izinleri kısıtlı ortam dosyasında tutulmalı
- Gönderen alanında SPF ve DKIM kayıtları doğrulanmalı
- `EMAIL_REPLY_TO` gerçekten takip edilen bir adres olmalı
- E-posta bağlantıları yalnızca HTTPS alan adına yönlenmeli
- Proxy ve uygulama loglarında query parametrelerinin gereksiz saklanması engellenmeli
- Parola veya token hiçbir log kaydına yazılmamalı
- E-posta teslimat hataları merkezi izleme sistemine aktarılmalı
