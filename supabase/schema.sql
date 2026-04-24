-- =====================================================
-- Dual Portfolio — Supabase Schema (v2)
-- drawings & arch_videos belong to arch_works
-- design_videos can optionally belong to design_works
-- =====================================================

create extension if not exists "pgcrypto";

create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  tagline text not null default '',
  bio text not null default '',
  photo_url text,
  cv_url text,
  linkedin text,
  instagram text,
  tiktok text,
  email text,
  skills text[] default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('design_work', 'arch_work', 'zine', 'drawing')),
  created_at timestamptz not null default now()
);

create table if not exists public.design_works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references public.categories(id) on delete set null,
  sub_type text,
  year int,
  description text,
  photo_url text,
  photos text[] default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.design_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  design_work_id uuid references public.design_works(id) on delete set null,
  video_type text,
  video_url text,
  thumbnail_url text,
  description text,
  year int,
  created_at timestamptz not null default now()
);

create table if not exists public.zines (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issue text,
  year int,
  cover_url text,
  photos text[] default '{}',
  description text,
  page_count int,
  pdf_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.arch_works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references public.categories(id) on delete set null,
  year int,
  description text,
  photo_url text,
  photos text[] default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.drawings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  arch_work_id uuid references public.arch_works(id) on delete cascade,
  drawing_type text,
  image_url text,
  photos text[] default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.arch_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  arch_work_id uuid references public.arch_works(id) on delete cascade,
  video_type text,
  video_url text,
  thumbnail_url text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  company text,
  period text,
  description text,
  side text not null default 'both' check (side in ('design', 'arch', 'both')),
  created_at timestamptz not null default now()
);

create table if not exists public.cv_downloads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  downloaded_at timestamptz not null default now()
);

insert into public.profile (name, tagline, bio)
select 'Your Name', 'Graphic Designer · Illustrator · Building Designer', 'Your bio here.'
where not exists (select 1 from public.profile);

-- RLS
alter table public.profile enable row level security;
alter table public.categories enable row level security;
alter table public.design_works enable row level security;
alter table public.design_videos enable row level security;
alter table public.zines enable row level security;
alter table public.arch_works enable row level security;
alter table public.drawings enable row level security;
alter table public.arch_videos enable row level security;
alter table public.experience enable row level security;
alter table public.cv_downloads enable row level security;

create policy "Public read profile" on public.profile for select using (true);
create policy "Public read categories" on public.categories for select using (true);
create policy "Public read design_works" on public.design_works for select using (true);
create policy "Public read design_videos" on public.design_videos for select using (true);
create policy "Public read zines" on public.zines for select using (true);
create policy "Public read arch_works" on public.arch_works for select using (true);
create policy "Public read drawings" on public.drawings for select using (true);
create policy "Public read arch_videos" on public.arch_videos for select using (true);
create policy "Public read experience" on public.experience for select using (true);
create policy "Public insert cv_downloads" on public.cv_downloads for insert with check (true);

create policy "Admin all profile" on public.profile for all to authenticated using (true) with check (true);
create policy "Admin all categories" on public.categories for all to authenticated using (true) with check (true);
create policy "Admin all design_works" on public.design_works for all to authenticated using (true) with check (true);
create policy "Admin all design_videos" on public.design_videos for all to authenticated using (true) with check (true);
create policy "Admin all zines" on public.zines for all to authenticated using (true) with check (true);
create policy "Admin all arch_works" on public.arch_works for all to authenticated using (true) with check (true);
create policy "Admin all drawings" on public.drawings for all to authenticated using (true) with check (true);
create policy "Admin all arch_videos" on public.arch_videos for all to authenticated using (true) with check (true);
create policy "Admin all experience" on public.experience for all to authenticated using (true) with check (true);
create policy "Admin read cv_downloads" on public.cv_downloads for select to authenticated using (true);
create policy "Admin delete cv_downloads" on public.cv_downloads for delete to authenticated using (true);