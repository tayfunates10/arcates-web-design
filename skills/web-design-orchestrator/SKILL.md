# Web Design Orchestrator

## Ne zaman kullanılır
Bir sayfanın, bölümün veya tüm sitenin görünümünü iyileştirme; yeniden tasarlama; tutarsız UI'ı birleştirme; premium görsel kaliteye taşıma isteklerinde kullan.

## Hedef
İşi tekil CSS düzeltmelerine bölmek yerine kullanıcı deneyimi, görsel sistem, responsive, erişilebilirlik, motion, performans ve QA açısından bütün olarak ele almak.

## İş akışı
1. Mevcut route ve bileşenleri çıkar.
2. Global tokenları, tipografiyi, container/spacing kurallarını ve ortak component sınıflarını oku.
3. `ui-ux-audit` ile sorunları sınıflandır: hierarchy, spacing, density, consistency, interaction, mobile, accessibility.
4. `visual-design-system` ile ortak çözümü belirle.
5. `responsive-design` ve `accessibility-wcag` gereksinimlerini aynı patch'e dahil et.
6. Hareket gerekiyorsa `motion-interaction` kullan; gereksiz animasyon ekleme.
7. CTA ve içerik okunabilirliği değişiyorsa `conversion-hierarchy` uygula.
8. `web-performance` ile LCP/CLS/INP riskini kontrol et.
9. `visual-qa-regression` ile desktop/tablet/mobile kritik yüzeyleri doğrula.
10. Son olarak `nextjs-frontend-craft` kurallarıyla build/type güvenliğini kontrol et.

## Arcates özel ilkeleri
- Koyu lacivert taban, mavi/cyan vurgu, kontrollü glass ve ince grid dokusu korunur.
- Premium görünüm; daha fazla efekt değil daha iyi hiyerarşi, boşluk, yüzey ve kontrastla sağlanır.
- Ana sayfa, alt sayfalar, auth, teklif formu, müşteri portalı ve admin ekranları aynı ürün ailesi gibi görünmelidir.
- Her yeni görsel desen reusable olmalı; yalnızca tek route'a gömülü hack yapılmamalıdır.

## Definition of done
Tutarlı tasarım sistemi, mobil uyum, görünür focus, reduced-motion desteği, temiz build/typecheck ve kritik akışlarda görsel regresyon olmaması.
