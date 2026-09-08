---
description: Add a new color palette to TaskFlow (hue-derived token system)
---

Add a new color palette to this app called "$ARGUMENTS".

Theming has two axes — palette (`data-theme`) and light/dark mode
(`data-mode`) — and all `--color-*` values are DERIVED from knobs. You are
adding a palette, which works in both modes automatically. See the theming
notes in CLAUDE.md.

1. Add a `[data-theme="<id>"]` block to `src/styles/themes.css` setting only
   knobs: `--h`, `--sat-surface`, `--sat-text`, `--accent-h`, `--accent-s`,
   and `--accent-l-shift` (declare it even if `0%`). Copy the shape of an
   existing block.
2. Add `{ id, label }` to `PALETTES` in `src/constants/themes.js`.
3. Also add the new id to the `PALETTES` array in the inline pre-paint script
   in `index.html`, or the palette won't survive a reload.

Constraints (details in CLAUDE.md):
- Never set a `--l-*` mode knob in a palette block — it would override the
  light-mode ramp. Tune accent brightness with `--accent-l-shift`.
- Keep the accent hue at least 30 degrees from every priority hue (red 0,
  orange 25, amber 43, green 160). If it crowds one, nudge that
  `--priority-*-h` inside the palette block instead.

Do not change `DEFAULT_PALETTE`. Afterwards run `npm run lint` and
`npm run build`, and sanity-check the new palette in BOTH light and dark mode.
