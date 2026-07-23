-- Matricula obligatoria en nuevas solicitudes de eventos.
-- Los registros historicos se mantienen sin matricula para no bloquear la migracion.

alter table public.event_registrations
  add column if not exists license_plate text;

alter table public.event_registrations
  drop constraint if exists event_registrations_license_plate_format_check;

alter table public.event_registrations
  add constraint event_registrations_license_plate_format_check
  check (
    license_plate is null
    or (
      char_length(license_plate) between 4 and 16
      and license_plate = upper(license_plate)
    )
  );

create unique index if not exists event_registrations_active_license_plate_idx
  on public.event_registrations (event_id, license_plate)
  where status <> 'cancelled' and license_plate is not null;

create index if not exists event_registrations_license_plate_lookup_idx
  on public.event_registrations (license_plate)
  where license_plate is not null;

notify pgrst, 'reload schema';
