# Responsive & Accessibility Skill

## Responsive rules
- Build mobile-first behavior even when desktop is visually richer.
- No horizontal page overflow at 320-360px.
- Convert multi-column grids progressively: 4 -> 2 -> 1 where content requires it.
- Use clamp() for fluid headings/spacing and avoid fragile fixed heights.
- Navigation and CTA groups must remain usable with long localized text.

## Accessibility rules
- Preserve logical DOM reading order when visual layouts change.
- All icon-only controls need accessible names.
- Decorative SVG/background effects must be hidden from assistive technology.
- Inputs require labels; errors/status messages must be programmatically understandable.
- Focus must never be clipped or obscured by sticky UI.
- Under prefers-reduced-motion: disable non-essential animation, transitions and auto-moving effects.

## Acceptance
Keyboard-only navigation must reach every interactive control in a sensible sequence; text remains readable at 200% zoom; critical information never depends only on color.