# Responsive Design

## Amaç
Arayüzü yalnızca küçültmek yerine her breakpoint'te doğru içerik önceliğine göre yeniden akıtmak.

## Kontrol boyutları
En az:
- 1440px desktop
- 1024px tablet/compact desktop
- 768px tablet portrait
- 390px mobile
- 320px dar mobile

## Kurallar
- Container kenar boşlukları clamp/min ile akışkan olmalı.
- 3 kolon -> 2 -> 1 dönüşümü içerik yoğunluğuna göre yapılmalı.
- Sticky öğeler küçük ekranda statikleşmeli.
- CTA grupları mobilde tam genişlik veya uygun stack olmalı.
- Formlarda iki kolon alanlar mobilde tek kolona inmeli.
- Dashboard tablo benzeri satırlar overflow yaratmamalı; bilgi önceliğine göre grid yeniden kurulmalı.
- Header mobil menüsü focus-trap ve scroll lock davranışını korumalı.
- Min tap target yaklaşık 44px olmalı.
- Başlıklar clamp ile taşmadan ölçeklenmeli.

## Test
Her breakpoint'te horizontal overflow, kırpılan metin, üst üste binen fixed öğe, okunamayan footer, erişilemeyen CTA ve aşırı boşluk kontrol edilir.
