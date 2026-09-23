# Arcates UI/UX Skill Pack

Bu klasör, Arcates web arayüzünü tasarlamak, denetlemek, iyileştirmek ve doğrulamak için araç-bağımsız skill talimatlarını içerir.

## Skill sırası

1. `web-design-orchestrator` — işi kapsamlandırır ve diğer skill'leri doğru sırayla çağırır.
2. `ui-ux-audit` — mevcut arayüzde sorunları ve fırsatları çıkarır.
3. `visual-design-system` — renk, tipografi, yüzey, spacing, radius ve elevation sistemini korur.
4. `responsive-design` — desktop/tablet/mobile uyumunu düzeltir.
5. `accessibility-wcag` — klavye, focus, kontrast, semantik ve motion erişilebilirliğini denetler.
6. `motion-interaction` — hover, reveal, menu, accordion ve geçiş davranışlarını iyileştirir.
7. `conversion-hierarchy` — içerik hiyerarşisi, CTA görünürlüğü ve güven sinyallerini iyileştirir.
8. `web-performance` — Core Web Vitals ve istemci maliyetlerini korur.
9. `visual-qa-regression` — değişiklikleri ekran boyutları ve kritik kullanıcı akışlarıyla doğrular.
10. `nextjs-frontend-craft` — Next.js/React uygulama kalitesini korur.

## Ortak kurallar

- Mevcut işlevi kırmadan görsel kaliteyi artır.
- Tasarım değişikliklerini mümkün olduğunca ortak token/bileşen seviyesinde çöz.
- Yeni bağımlılık eklemek yerine mevcut CSS/React altyapısını tercih et.
- Mobil görünümü sonradan değil, değişiklikle aynı anda tasarla.
- Focus görünürlüğünü, klavye erişimini ve reduced-motion davranışını koru.
- Görsel geliştirme uğruna LCP/CLS/INP veya bundle boyutunu kötüleştirme.
- Değişiklik sonrası typecheck, build ve mevcut test kapılarını çalıştır.
