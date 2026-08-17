# Supabase setup

TaskFlow uses [Supabase](https://supabase.com) for two things:

1. **Auth** — login via "Continue with Google" (no passwords, no SMS).
2. **Database** — your tasks, tags, and profile are stored in Supabase Postgres, scoped to your account with Row Level Security.

Everything below is free: Supabase's free tier and Google OAuth both cost
nothing at this app's scale (~100 users).

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign up (GitHub login is easiest).
2. **New project** → pick an organization, name it (e.g. `taskflow`), set a database password (save it somewhere — you likely won't need it again, but it's your Postgres root password), pick the region closest to you, and create it. Provisioning takes ~1–2 minutes.

## 2. Get your API keys

1. In your new project: **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** and the **anon public** key (not the `service_role` key — never put that one in frontend code).
3. In the project root, copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
4. Paste your values into `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
   `.env` is already gitignored — don't commit it.

## 3. Create the database tables

1. In the Supabase dashboard: **SQL Editor** → **New query**.
2. Open [`supabase/schema.sql`](supabase/schema.sql) from this repo, paste its full contents into the editor, and click **Run**.
3. This creates three tables (`profiles`, `tags`, `tasks`), each with Row Level Security policies so a user can only ever read/write their own rows. You can double check under **Table Editor** that all three exist, and under **Authentication → Policies** that RLS is enabled.

## 4. Set up "Continue with Google"

Google OAuth needs a client ID/secret from **Google Cloud Console** (separate, also free), which you then paste into Supabase.

### 4a. Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and create a new project (or reuse one) — top-left project picker → **New Project**.
2. **APIs & Services → OAuth consent screen**:
   - User type: **External**.
   - Fill in app name (e.g. "TaskFlow"), your email as support/developer contact.
   - Scopes: leave defaults (`email`, `profile`, `openid`) — no need to add more.
   - Test users: while the app is "Testing" (default), add the Google accounts that should be able to log in (yourself + anyone testing). Or publish the app (Publishing status → **Publish App**) to allow any Google account — fine at this scale, and Google doesn't require verification review for these basic scopes.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Name: anything, e.g. "TaskFlow web".
   - **Authorized JavaScript origins**: add `http://localhost:5173` (Vite's dev port) and, later, your production URL.
   - **Authorized redirect URIs**: add your Supabase callback URL — this is `https://<your-project-ref>.supabase.co/auth/v1/callback` (find `<your-project-ref>` in the Project URL from step 2; it's the part before `.supabase.co`).
   - Create it, then copy the **Client ID** and **Client Secret** shown.

### 4b. Supabase dashboard

1. **Authentication → Providers → Google** → toggle it **on**.
2. Paste the **Client ID** and **Client Secret** from Google Cloud. Save.
3. **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:5173` for now (update to your real domain once deployed).
   - **Redirect URLs**: add `http://localhost:5173` (and your production URL later). This is the allowlist of URLs Supabase will redirect back to after Google login — the app requests `redirectTo: window.location.origin`, so it must match exactly.

## 5. Install and run

```
npm install
npm run dev
```

Open the app — you should see the login page. Click **Continue with Google**, sign in, and on first login you'll be asked to pick a display name. After that you land in the app, and your tasks/tags persist in Supabase (check **Table Editor → tasks/tags** in Supabase to see rows appear as you use the app).

If you instead see a "Supabase isn't configured yet" screen, double-check `.env` has both values set and restart `npm run dev` (Vite only reads `.env` at startup).

## 6. Deploying later

Whenever you deploy this to a real domain, update three places to match the new URL:

- Google Cloud Console → your OAuth client → add the production URL to **Authorized JavaScript origins** (the redirect URI stays the Supabase callback URL, unchanged).
- Supabase → **Authentication → URL Configuration** → add the production URL to **Site URL** / **Redirect URLs**.
- Your deployment's env vars → same `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

## Notes on the free tier

- Supabase's free tier includes 500MB database storage and 50,000 monthly active users — far more than the ~100 users this app expects.
- A free-tier Supabase project **pauses after 7 days with no API requests**. If that happens, the dashboard will show a "paused" banner with a one-click **Restore** button — no data is lost, it just needs waking up.
- Google OAuth itself is free with no request limits relevant to this app's scale.
