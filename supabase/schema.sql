-- TaskFlow schema. Run this once in the Supabase SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run) after creating your project.
--
-- Every table is scoped to the signed-in user via Row Level Security, so each
-- of your (up to ~100) users only ever sees their own rows.

-- ── profiles ─────────────────────────────────────────────────────────────
-- One row per user, created by the app right after they pick a display name
-- on first login (see src/pages/UsernameSetupPage.jsx) — not auto-created by
-- a trigger, since "no row yet" is exactly how we detect a first-time login.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ── tags ─────────────────────────────────────────────────────────────────
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;

create policy "tags_all_own" on public.tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists tags_user_id_idx on public.tags(user_id);

-- ── tasks ────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  priority text not null default 'Medium' check (priority in ('Very High', 'High', 'Medium', 'Low')),
  due date,
  notes text,
  tag_ids uuid[] not null default '{}',
  backlog boolean not null default false,
  done boolean not null default false,
  done_at timestamptz,
  -- Subtasks are small, nested, and only ever read/written as a whole list
  -- alongside their parent task — a jsonb column avoids a join table without
  -- costing anything at this app's scale.
  subtasks jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "tasks_all_own" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
