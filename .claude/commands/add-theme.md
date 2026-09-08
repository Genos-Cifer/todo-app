---
description: Add a new color theme to TaskFlow (updates both files it requires)
---

Add a new color theme to this app called "$ARGUMENTS".

This requires editing two files in sync (see CLAUDE.md architecture notes):

1. Add an entry to the `THEMES` array in `src/constants/themes.js` — pick a
   sensible `id` (lowercase, no spaces), a human-readable `label`, and an
   emoji `icon` that fits the theme.
2. Add a matching `[data-theme="<id>"]` block in `src/styles/themes.css`,
   following the existing pattern used by the other themes in that file —
   copy the CSS custom properties structure from an existing theme block and
   pick new color values that fit the theme's name/mood.

Do not change `DEFAULT_THEME`. After editing, run `npm run lint` to confirm
nothing broke.
