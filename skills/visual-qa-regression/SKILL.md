# Visual QA & Regression

## Amaç
Görsel değişikliklerin yalnızca "iyi görünmesini" değil, farklı route ve ekranlarda güvenli kalmasını doğrulamak.

## Kritik yüzeyler
- Ana sayfa
- Hizmet/proje/blog gibi dinamik alt sayfalar
- Teklif formu
- Giriş/kayıt/parola akışları
- Hesabım/müşteri portalı
- Admin dashboard
- Konuşma merkezi ve operasyon ekranları
- Header/footer/mobile navigation
- Chat widget

## Kontroller
- 1440 / 1024 / 768 / 390 genişlikleri
- Horizontal overflow
- Text clipping
- Z-index/fixed overlap
- Focus görünürlüğü
- Form state'leri
- Empty/error/success state'leri
- Long content
- Mobile keyboard/touch ergonomisi
- Reduced-motion

## Kod kapıları
- `npm test`
- `npm run typecheck`
- `npm run build`
- Mevcut Playwright testleri, özellikle premium ana sayfa ve kullanım akışları

## Kural
Bir görsel düzeltme mevcut test beklentisini anlamsız hale getiriyorsa testi kaldırma; yeni beklenen davranışı açıkça doğrulayacak şekilde güncelle.
