-- TouchGrass schema (Requirements 1.3, 3.7, 4.4, 4.5, 6.2, 12.1–12.3).
-- Run in the Supabase SQL editor. No seed regular users / hangouts / comments (12.3).

-- ============================================================
-- Tables
-- ============================================================

-- profiles: one row per registered user (1.3, 12.1)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null check (char_length(display_name) between 1 and 50),
  score         int  not null default 0 check (score >= 0),
  streak        int  not null default 0 check (streak >= 0),
  last_log_date date,
  created_at    timestamptz not null default now()
);

-- hangouts: one row per logged activity (3.7, 12.1)
create table if not exists public.hangouts (
  id            uuid primary key default gen_random_uuid(),
  poster_id     uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null check (activity_type in ('Coffee','Gym','Dinner','Hike')),
  photo_url     text not null check (char_length(photo_url) > 0),
  points        int  not null check (points >= 0),
  created_at    timestamptz not null default now()
);

-- hangout_tags: optional tagged users (3.2, 3.7)
create table if not exists public.hangout_tags (
  hangout_id     uuid not null references public.hangouts(id) on delete cascade,
  tagged_user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (hangout_id, tagged_user_id)
);

-- cheers: reactions counted per hangout (4.4, 4.5, 12.1)
create table if not exists public.cheers (
  id          uuid primary key default gen_random_uuid(),
  hangout_id  uuid not null references public.hangouts(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (hangout_id, user_id) -- one cheer per user per hangout
);

-- comments: text responses counted per hangout (4.4, 12.1)
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  hangout_id  uuid not null references public.hangouts(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  body        text not null check (char_length(body) > 0),
  created_at  timestamptz not null default now()
);

-- user_badges: unlocked milestone awards (6.2, 6.4–6.7)
create table if not exists public.user_badges (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  badge_name   text not null check (badge_name in ('First Steps','Weekend Warrior','On Fire')),
  unlocked_at  timestamptz not null default now(),
  unique (user_id, badge_name) -- a badge unlocks at most once per user
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists hangouts_created_at_idx on public.hangouts (created_at desc);
create index if not exists hangouts_poster_created_idx on public.hangouts (poster_id, created_at desc);
create index if not exists cheers_hangout_idx on public.cheers (hangout_id);
create index if not exists comments_hangout_idx on public.comments (hangout_id);
create index if not exists profiles_rank_idx on public.profiles (score desc, streak desc, display_name asc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles     enable row level security;
alter table public.hangouts      enable row level security;
alter table public.hangout_tags  enable row level security;
alter table public.cheers        enable row level security;
alter table public.comments      enable row level security;
alter table public.user_badges   enable row level security;

-- profiles: readable by any authenticated user; writable only by the owner.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- hangouts: readable by any authenticated user; insert/delete by owner (supports rollback 10.5).
drop policy if exists hangouts_select on public.hangouts;
create policy hangouts_select on public.hangouts
  for select to authenticated using (true);

drop policy if exists hangouts_insert on public.hangouts;
create policy hangouts_insert on public.hangouts
  for insert to authenticated with check (poster_id = auth.uid());

drop policy if exists hangouts_delete on public.hangouts;
create policy hangouts_delete on public.hangouts
  for delete to authenticated using (poster_id = auth.uid());

-- hangout_tags: readable by any authenticated user; insert/delete by the tagging poster.
drop policy if exists hangout_tags_select on public.hangout_tags;
create policy hangout_tags_select on public.hangout_tags
  for select to authenticated using (true);

drop policy if exists hangout_tags_insert on public.hangout_tags;
create policy hangout_tags_insert on public.hangout_tags
  for insert to authenticated with check (
    exists (select 1 from public.hangouts h where h.id = hangout_id and h.poster_id = auth.uid())
  );

drop policy if exists hangout_tags_delete on public.hangout_tags;
create policy hangout_tags_delete on public.hangout_tags
  for delete to authenticated using (
    exists (select 1 from public.hangouts h where h.id = hangout_id and h.poster_id = auth.uid())
  );

-- cheers: readable by any authenticated user; insert/delete by the cheering user.
drop policy if exists cheers_select on public.cheers;
create policy cheers_select on public.cheers
  for select to authenticated using (true);

drop policy if exists cheers_insert on public.cheers;
create policy cheers_insert on public.cheers
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists cheers_delete on public.cheers;
create policy cheers_delete on public.cheers
  for delete to authenticated using (user_id = auth.uid());

-- comments: readable by any authenticated user; insert/delete by the comment author.
drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments
  for select to authenticated using (true);

drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments
  for delete to authenticated using (user_id = auth.uid());

-- user_badges: readable by any authenticated user; insert/select by the owner.
drop policy if exists user_badges_select on public.user_badges;
create policy user_badges_select on public.user_badges
  for select to authenticated using (true);

drop policy if exists user_badges_insert on public.user_badges;
create policy user_badges_insert on public.user_badges
  for insert to authenticated with check (user_id = auth.uid());

-- ============================================================
-- Storage bucket: hangout-photos (public read) (3.6, 4.3, 10.4)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('hangout-photos', 'hangout-photos', true)
on conflict (id) do nothing;

-- Public read of photo objects.
drop policy if exists hangout_photos_read on storage.objects;
create policy hangout_photos_read on storage.objects
  for select to public using (bucket_id = 'hangout-photos');

-- Authenticated users may upload only into their own {auth.uid()}/ folder.
drop policy if exists hangout_photos_insert on storage.objects;
create policy hangout_photos_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'hangout-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
