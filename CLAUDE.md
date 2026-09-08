# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TaskFlow — a React 19 + Vite todo app. Auth and persistence are both Supabase
(Postgres + "Continue with Google" OAuth, no passwords). See `SUPABASE_SETUP.md`
for the full account/OAuth setup walkthrough and `supabase/schema.sql` for the
database schema.

## Commands

```
npm run dev       # start dev server (Vite, HMR) — http://localhost:5173
npm run build     # production build to dist/
npm run lint      # ESLint (flat config, eslint.config.js)
npm run preview   # serve the production build locally
```

There is no test suite/framework configured in this repo.

Local setup requires a `.env` (copied from `.env.example`) with
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — without it the app renders
`ConfigError` instead of starting. Vite only reads `.env` at startup, so
restart `npm run dev` after changing it.

## Architecture

**Top-level flow is a state machine in `src/App.jsx`**, not a router — it
switches between screens based on auth/profile state, in this order:
`ConfigError` (no Supabase env vars) → `LoadingScreen` (session check) →
`LoginPage` (no user) → `LoadingScreen` (profile fetch) →
`UsernameSetupPage` (user has no `profiles` row yet — this *is* the
first-login detection, there's no separate "new user" flag) → `TodoApp`
(the actual application).

**Data layer**: `src/services/*.js` are the only modules that touch
`supabase`. Each one pairs `mapXFromDb`/`mapXToDb` functions that convert
between the app's camelCase task/tag/profile shape and the DB's snake_case
columns — e.g. `doneAt` (epoch ms, used for sorting) ↔ `done_at` (timestamptz).
Every query filters `.eq("user_id", userId)` even though Row Level Security
already enforces it server-side; keep doing this for consistency/defense in
depth when adding queries.

`src/hooks/useAuth.js` tracks the Supabase session (`session` is `undefined`
mid-check, `null` signed out, or the session) and `src/hooks/useProfile.js`
fetches the `profiles` row for `user.id` — a `null` profile (no row) is what
routes to `UsernameSetupPage`.

**`src/pages/TodoApp.jsx` owns essentially all application state** (tasks,
tags, current view, filters, sort, open modal, etc.) as plain `useState` —
there's no store/reducer. It fetches tasks+tags once per `user.id` via
`Promise.all`, and its `handle*` functions are optimistic-after-await: call
the service, then merge the returned row into local state. Child components
(`Sidebar`, `TaskList`, `TaskModal`, `CalendarView`, `Metrics`, `TagManager`,
etc.) are presentational and receive data + handlers as props rather than
reading state themselves.

**Two independent persistence paths** — don't conflate them:
- Tasks/tags/profile → Supabase, via `src/services/`.
- Per-browser preferences → `localStorage`, keys in `src/constants/storage.js`:
  the color theme (`src/hooks/useTheme.js`, applied as `<html data-theme="...">`)
  and notification settings + "already notified" bookkeeping
  (`src/utils/notifications.js`).

**Search** (`src/utils/search.js`) runs client-side, not via Postgres
full-text search — `TodoApp` already holds every task in memory, so filtering
locally is instant and needs no round-trip. It feeds `sortAndFilterTasks`
(`src/utils/tasks.js`), which applies search → filters → sort in that order.

**Command palette** (`src/components/palette/`) is opened with Cmd/Ctrl+K. It
builds a flat item list (tasks, navigation, actions, filters, themes) and ranks
it with the subsequence matcher in `src/utils/fuzzy.js`; a leading `>` narrows
to commands only. Adding a new command means adding one entry in `buildItems`
and wiring a handler into `paletteActions` in `src/pages/TodoApp.jsx`.

**Notifications** only fire while the app is open in a tab — there's no service
worker or push backend. `runDueChecks` (`src/utils/notifications.js`) is called
on every task change and once a minute; it sends the daily digest once per day
at/after the chosen hour and a one-off alert when a task's due date passes.
Because tasks only carry a `date` (no time), "due time passed" means midnight
at the end of the due date. The digest marks everything currently overdue as
notified so it isn't immediately followed by a duplicate alert.

**Theming has two independent axes**: a color PALETTE (`data-theme`) and a
light/dark MODE (`data-mode`), both stamped on `<html>` by
`src/hooks/useTheme.js` and pre-stamped by an inline script in `index.html` so
reloads don't flash. Mode defaults to the OS preference.

Colors are **derived, not hand-picked**. `src/index.css` holds every
`--color-*` formula once; a palette supplies only hue/saturation knobs
(`--h`, `--sat-surface`, `--accent-h`…) and a mode supplies only the lightness
ramp (`--l-*`) plus alphas. That's why switching palettes repaints surfaces,
borders, text and shadows rather than just the accent.

**Adding a palette** means one ~6-line block in `src/styles/themes.css` plus an
entry in `PALETTES` (`src/constants/themes.js`). Rules to keep:
- A palette must **never** set a `--l-*` mode knob — themes.css loads after
  index.css at equal specificity, so it would override the light-mode ramp.
  Use `--accent-l-shift` to tune accent brightness in both modes.
- Keep the accent hue **≥30° from every priority hue** (red 0, orange 25,
  amber 43, green 160) so priority badges never read as accent chrome. If it
  crowds one, nudge that `--priority-*-h` in the palette block instead
  (see how `forest` moves Low and `sunset` moves Very High).
- Palette selectors are deliberately **not** `:root`-scoped, so the picker can
  put `data-theme` on a swatch and have it derive that palette's real colors.
  A palette must therefore declare every knob it relies on — including
  defaults like `--accent-l-shift:0%` — or nested swatches inherit the active
  palette's value.

**Priority and tag colors are theme-aware too.** `PRIORITY_COLORS`
(`src/constants/priorities.js`) holds `var(--color-priority-*)` references, not
hex, so they follow the palette; use the `withAlpha()` helper there rather than
string-concatenating hex alpha, which cannot work on a `var()`. Tag colors are
user-chosen hex from the database — render them via the `.tag-chip` class
(`src/styles/shared.css`) with `style={{ "--tag-color": tag.color }}`, which
darkens the ink in light mode so pale tags stay readable.

**Subtasks** are stored as a `jsonb` array directly on the `tasks` row
(`supabase/schema.sql`), not a separate table — they're only ever read/written
as a whole list alongside their parent task. `TodoApp.jsx`'s `handleTaskUpdate`
and `handleSaveTask` both auto-complete a task when every subtask is checked.

**Schema changes are manual**: there's no migration tool. `supabase/schema.sql`
is meant to be pasted into the Supabase SQL editor by hand; if you change it,
update the file and tell the user to re-run the relevant statements themselves
rather than assuming it's already applied to their project.
