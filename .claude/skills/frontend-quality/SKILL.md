# Frontend Quality Skill

For Next.js/React UI work in Arcates.

## Implementation
- Prefer Server Components unless client-side state/effects are necessary.
- Reuse existing components and CSS architecture; avoid duplicate one-off systems.
- Keep TypeScript strict and avoid unsafe casts.
- Use semantic HTML and native controls first.

## Performance
- Protect Core Web Vitals: avoid layout shifts, oversized client bundles and unnecessary hydration.
- Prefer CSS/SVG effects to large decorative images when equivalent.
- Animate transform/opacity rather than layout properties.
- Avoid expensive blur/filter layers on small/mobile screens where possible.

## Verification
Run the repository quality chain: Prisma version check, schema validation, unit tests, typecheck and production build. Run Playwright UI tests when environment requirements are available. Never claim a check passed unless its CI/local execution confirms it.