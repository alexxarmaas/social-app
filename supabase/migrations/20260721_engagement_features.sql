-- Participacion en eventos y archivos GPX. Seguro para ejecutar mas de una vez.

alter table public.events add column if not exists participation_mode text not null default 'information';
alter table public.events add column if not exists organizer_name text;
alter table public.events add column if not exists external_registration_url text;
alter table public.events add column if not exists max_participants integer;

alter table public.routes add column if not exists gpx_filename text;
alter table public.routes add column if not exists gpx_data text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'events_participation_mode_check') then
    alter table public.events add constraint events_participation_mode_check
      check (participation_mode in ('information', 'interest', 'managed', 'external'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'events_max_participants_check') then
    alter table public.events add constraint events_max_participants_check
      check (max_participants is null or max_participants > 0);
  end if;
end $$;

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participation_mode text not null check (participation_mode in ('interest', 'managed')),
  name text not null,
  email text not null,
  phone text,
  vehicle text,
  companions integer not null default 0 check (companions between 0 and 20),
  status text not null default 'new' check (status in ('new', 'confirmed', 'cancelled')),
  privacy_accepted_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.event_registrations enable row level security;

create unique index if not exists event_registrations_active_email_idx
  on public.event_registrations (event_id, lower(email))
  where status <> 'cancelled';
create index if not exists event_registrations_event_created_idx
  on public.event_registrations (event_id, created_at desc);
create index if not exists event_registrations_status_created_idx
  on public.event_registrations (status, created_at desc);

-- No se conceden permisos a anon/authenticated: todas las operaciones pasan por
-- rutas de servidor validadas; la service role conserva el acceso administrativo.

notify pgrst, 'reload schema';
