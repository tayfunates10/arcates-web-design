# Motion & Interaction

## Amaç
Arayüze kontrollü, performanslı ve anlamlı hareket eklemek.

## Öncelik sırası
1. Hover/focus feedback
2. Menu/accordion state transition
3. Section reveal
4. Counter/progress gibi anlamlı hareket
5. Dekoratif ambient motion

## Kurallar
- Transform ve opacity önceliklidir.
- Layout değiştiren animasyonlardan kaçın.
- Süre çoğu mikro etkileşimde 150–280ms.
- Büyük reveal hareketleri kısa mesafeli olmalı.
- Hover'da aşırı scale yerine 1–4px lift/border/glow kullan.
- Aynı anda çok sayıda element animasyonunu sınırlı tut.
- Reduced-motion altında hareket minimuma iner.
- Interaction feedback hiçbir zaman sadece animasyona bağlı olmaz.

## Arcates dili
Teknolojik his için çizgi, halo, signal ve kontrollü glow kullanılabilir; fakat içerik okunabilirliği ve profesyonel ton her zaman önceliklidir.
