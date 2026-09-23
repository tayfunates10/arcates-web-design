# Accessibility / WCAG

## Amaç
Görsel iyileştirmelerin erişilebilirliği düşürmemesini, mümkünse artırmasını sağlamak.

## Kontrol listesi
- Klavye ile tüm etkileşimler erişilebilir.
- `:focus-visible` belirgin ve marka uyumlu.
- Link ile button semantiği doğru.
- Form label'ları gerçek input ile ilişkili.
- Hata mesajı yalnızca renkle anlatılmıyor.
- Text/background kontrastı yeterli.
- Hover bilgisi focus ile de erişilebilir.
- Motion, `prefers-reduced-motion` altında kapanıyor veya sadeleşiyor.
- Icon-only kontrollerde aria-label bulunuyor.
- Accordion/menu dialog benzeri bileşenlerde expanded/controls durumları doğru.
- Başlık hiyerarşisi mantıklı.
- Skip link çalışıyor.
- Touch target'lar yeterli boyutta.

## Tasarım uygulaması
Focus ring'i kaldırma. Çok düşük opaklıklı metin kullanma. Küçük metadata için okunabilirlik eşiğini koru. Dekoratif SVG'leri screen reader akışına sokma.

## Definition of done
Mouse olmadan temel akışlar tamamlanabiliyor, focus kaybolmuyor ve reduced-motion modunda içerik erişilebilir kalıyor.
