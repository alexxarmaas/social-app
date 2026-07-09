-- Tramassso: coordenadas de rutas y directorio de colaboradores.
-- Ejecutar en el SQL Editor del proyecto Supabase conectado a la web.

alter table public.routes
  add column if not exists coordinates jsonb;

comment on column public.routes.coordinates is
  'Array JSON opcional de puntos de ruta con formato [{"lat":28.1234,"lng":-15.4321},{"lat":28.1250,"lng":-15.4400}].';

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  logo_url text,
  website_url text,
  description text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.partners enable row level security;

drop policy if exists "Lectura publica de colaboradores" on public.partners;
create policy "Lectura publica de colaboradores"
  on public.partners
  for select
  to anon, authenticated
  using (true);

create index if not exists partners_featured_created_at_idx
  on public.partners (is_featured desc, created_at desc);

create index if not exists partners_category_idx
  on public.partners (category);

grant select on public.partners to anon, authenticated;

notify pgrst, 'reload schema';
