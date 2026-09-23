# Next.js Frontend Craft

## Amaç
Next.js App Router + React arayüz değişikliklerinin temiz, sürdürülebilir ve düşük istemci maliyetli kalmasını sağlamak.

## Kurallar
- Server component varsayılanını koru; yalnızca state/effect/browser API gereken yerde `"use client"`.
- Ortak görsel davranışı CSS/token/component seviyesinde çöz.
- Route içinde tekrar eden markup büyüyorsa reusable component çıkar.
- Metadata/SEO semantiğini görsel düzen uğruna bozma.
- Next Link kullanılan internal navigation'ı koru.
- Formların server action/API davranışına dokunmadan görünümü iyileştir.
- Yeni dependency eklemeden önce mevcut CSS/React çözümünü tercih et.
- TypeScript strict davranışını bozan any/cast ekleme.
- Hydration'a bağlı rastgele veya tarihsel görünüm farkı üretme.
- Client component içinde gereksiz global listener bırakma; cleanup zorunlu.

## Kontrol
Değişiklikten sonra typecheck, production build ve ilgili testler temiz olmalı. UI değişikliği bundle veya hydration maliyetini gereksiz yükseltmemeli.
