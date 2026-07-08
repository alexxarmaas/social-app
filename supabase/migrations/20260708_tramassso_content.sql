create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  date timestamptz not null,
  location text not null,
  cover_image_url text,
  gallery_urls text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  start_point text not null,
  end_point text not null,
  distance_km numeric(8,2) not null,
  drive_time_minutes integer not null,
  cover_image_url text,
  gallery_urls text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.routes enable row level security;

drop policy if exists "Public read events" on public.events;
create policy "Public read events"
  on public.events
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read routes" on public.routes;
create policy "Public read routes"
  on public.routes
  for select
  to anon, authenticated
  using (true);
