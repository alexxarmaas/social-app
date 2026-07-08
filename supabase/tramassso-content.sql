-- Tablas de contenido editable para Tramassso.
-- Ejecutar en Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  date timestamptz not null,
  location text not null,
  cover_image_url text,
  gallery_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  start_point text not null,
  end_point text not null,
  distance_km numeric not null check (distance_km > 0),
  drive_time_minutes integer not null check (drive_time_minutes > 0),
  cover_image_url text,
  gallery_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.routes enable row level security;

drop policy if exists "Eventos públicos de solo lectura" on public.events;
create policy "Eventos públicos de solo lectura"
on public.events
for select
to anon, authenticated
using (true);

drop policy if exists "Rutas públicas de solo lectura" on public.routes;
create policy "Rutas públicas de solo lectura"
on public.routes
for select
to anon, authenticated
using (true);

-- Escritura mediante service role desde el servidor.
-- No crees políticas públicas de insert/update/delete para anon.
