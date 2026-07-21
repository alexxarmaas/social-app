create schema if not exists public;
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
  distance_km numeric(8,2) not null check (distance_km > 0),
  drive_time_minutes integer not null check (drive_time_minutes > 0),
  cover_image_url text,
  gallery_urls text[] not null default '{}'::text[],
  coordinates jsonb,
  difficulty text not null default 'media' check (difficulty in ('facil', 'media', 'exigente')),
  route_type text not null default 'carretera' check (route_type in ('carretera', 'costa', 'montana', 'nocturna', 'exposicion')),
  recommended_time text,
  created_at timestamptz not null default now()
);

alter table public.routes add column if not exists coordinates jsonb;
alter table public.routes add column if not exists difficulty text not null default 'media';
alter table public.routes add column if not exists route_type text not null default 'carretera';
alter table public.routes add column if not exists recommended_time text;

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  logo_url text,
  website_url text,
  instagram_url text,
  description text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.partners add column if not exists instagram_url text;

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  brand text not null,
  brief text not null,
  status text not null default 'nuevo' check (status in ('nuevo', 'visto', 'respondido')),
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.routes enable row level security;
alter table public.partners enable row level security;
alter table public.contact_requests enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.events to anon, authenticated;
grant select on public.routes to anon, authenticated;
grant select on public.partners to anon, authenticated;

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

drop policy if exists "Public read partners" on public.partners;
create policy "Public read partners"
  on public.partners
  for select
  to anon, authenticated
  using (true);

create index if not exists events_date_idx on public.events (date);
create index if not exists partners_featured_created_at_idx on public.partners (is_featured desc, created_at desc);
create index if not exists contact_requests_status_created_at_idx on public.contact_requests (status, created_at desc);

-- Las escrituras se realizan exclusivamente con la service role desde rutas protegidas del servidor.

notify pgrst, 'reload schema';
