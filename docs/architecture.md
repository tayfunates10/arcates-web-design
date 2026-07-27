# Arcates Platform Architecture

## Amaç

Arcates web sitesi, müşteri alanı, yönetim paneli, web sohbeti ve WhatsApp sohbeti aynı kimlik, konuşma ve yetki modelini kullanır.

## Kanal bağımsız konuşma akışı

```text
Web Chat ───────┐
                ├── Channel Gateway ── Identity Resolver ── Conversation Engine
WhatsApp ───────┘                                         │
                                                          ├── Knowledge Retrieval
                                                          ├── Authorized Tools
                                                          ├── Human Handoff
                                                          └── Audit Log
```

## Güvenlik sınırları

- Ziyaretçi görüşmeleri anonim oturum kimliğiyle tutulur.
- Kullanıcı giriş yaptığında görüşme açık birleştirme işlemiyle hesaba bağlanır.
- WhatsApp telefon kimliği tek kullanımlık doğrulama koduyla hesaba bağlanır.
- Okuma ve değişiklik yapan araçlar ayrı yetkilere sahiptir.
- Teklif onayı, profil değişikliği, destek kaydı ve dosya işlemleri açık onay ister.
- Her araç çağrısı ve kimlik eşleştirme olayı denetim kaydına yazılır.
- Webhook olayları benzersiz sağlayıcı kimliğiyle kaydedilir ve tekrar işlenmez.

## Uygulama katmanları

1. Next.js web uygulaması ve sunucu bileşenleri
2. Route handler tabanlı BFF katmanı
3. Konuşma motoru ve model sağlayıcı adaptörü
4. PostgreSQL ve vektör arama
5. Redis tabanlı kuyruk ve kısa süreli oturum verisi
6. S3 uyumlu dosya depolama
7. WhatsApp Cloud API adaptörü
8. İzleme, hata raporlama ve audit log

## Mevcut durum

İlk kod turu genel siteyi, özel SVG sistemini, yerel chatbot yönlendirmesini, WhatsApp webhook doğrulama kabuğunu, SEO dosyalarını ve veri modeli sözleşmesini oluşturur. Kalıcı veri, kimlik doğrulama ve harici model bağlantısı sonraki uygulama turunda etkinleştirilecektir.
