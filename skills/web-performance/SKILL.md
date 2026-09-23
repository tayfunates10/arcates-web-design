# Web Performance / Core Web Vitals

## Amaç
Görsel kaliteyi artırırken hız ve etkileşim maliyetini korumak.

## Kurallar
- Gereksiz JS bağımlılığı ekleme.
- CSS ile çözülebilecek dekorasyon için client component ekleme.
- Büyük blur/filter alanlarını ve sürekli animasyonu sınırlı tut.
- Layout shift yaratacak ölçüsüz medya ekleme.
- Hero'daki kritik içerik için ağır client hydration ekleme.
- Görseller varsa boyutları ve loading stratejisi açık olmalı.
- Font sayısı ve weight sayısını sınırlı tut.
- Büyük SVG/DOM sahnelerinde gereksiz node sayısını artırma.
- Scroll listener'lar requestAnimationFrame/passive yaklaşımını korumalı.
- Animasyonda transform/opacity kullan.

## Hedef
LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 hedefini bozacak değişiklik yapılmamalı.

## Doğrulama
Production build, bundle/client boundary gözden geçirme, önemli route'larda layout shift ve etkileşim kontrolü.
