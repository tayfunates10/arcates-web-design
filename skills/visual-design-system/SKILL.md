# Visual Design System

## Amaç
Arcates'in bütün ekranlarında tek bir görsel dil üretmek.

## Token sistemi
Öncelikle CSS custom property kullan:
- background / surface
- text primary / secondary / muted
- accent blue / cyan / purple
- semantic success / warning / danger
- border soft / accent
- spacing scale
- radius scale
- elevation/shadow
- container ve reading width

Yeni sabit renk veya radius eklemeden önce mevcut tokenla çözmeyi dene.

## Görsel hiyerarşi
- Ana yüzey: düşük kontrastlı koyu zemin.
- İkincil yüzey: hafif daha açık panel.
- Etkileşimli yüzey: hover'da border/accent ve çok hafif lift.
- Vurgu: cyan/mavi yalnızca önemli affordance, ikon, CTA ve status için.
- Glow ve blur küçük dozlarda; okunabilirliği düşürmemeli.

## Tipografi
- Başlıklar sıkı letter-spacing ve güçlü hiyerarşi.
- Body metinleri rahat line-height, kontrollü max-width.
- Küçük metadata metinleri en az gerekli kontrasta sahip olmalı.
- Aynı seviyedeki başlıklar route'lar arasında yakın ölçekte kalmalı.

## Yüzey kuralları
Kart, form, modal, dashboard ve CTA panelleri aynı radius/elevation ailesini paylaşır. Border + subtle gradient + restrained shadow kombinasyonu tercih edilir.

## Kabul kriteri
Ana sayfa, alt sayfa, auth ve portal yan yana açıldığında aynı marka ve ürün sistemine ait görünmeli.
