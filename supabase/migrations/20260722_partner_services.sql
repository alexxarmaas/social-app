create table if not exists public.partner_services (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 100),
  description text check (description is null or char_length(description) <= 500),
  sort_order integer not null default 0 check (sort_order between 0 and 11),
  created_at timestamptz not null default now(),
  unique (partner_id, sort_order)
);

alter table public.partner_services enable row level security;

grant select on public.partner_services to anon, authenticated;

drop policy if exists "Public read partner services" on public.partner_services;
create policy "Public read partner services"
  on public.partner_services
  for select
  to anon, authenticated
  using (true);

create index if not exists partner_services_partner_sort_idx
  on public.partner_services (partner_id, sort_order);

create or replace function public.replace_partner_services(
  target_partner_id uuid,
  service_items jsonb
)
returns setof public.partner_services
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if target_partner_id is null then
    raise exception 'El colaborador es obligatorio.';
  end if;

  if service_items is null then
    service_items := '[]'::jsonb;
  end if;

  if jsonb_typeof(service_items) <> 'array' then
    raise exception 'Los servicios deben enviarse como una lista.';
  end if;

  if jsonb_array_length(service_items) > 12 then
    raise exception 'No se pueden guardar mas de 12 servicios.';
  end if;

  if not exists (select 1 from public.partners where id = target_partner_id) then
    raise exception 'El colaborador no existe.';
  end if;

  delete from public.partner_services
  where partner_id = target_partner_id;

  insert into public.partner_services (partner_id, name, description, sort_order)
  select
    target_partner_id,
    btrim(item.value ->> 'name'),
    nullif(btrim(coalesce(item.value ->> 'description', '')), ''),
    (item.ordinality - 1)::integer
  from jsonb_array_elements(service_items) with ordinality as item(value, ordinality);

  return query
  select *
  from public.partner_services
  where partner_id = target_partner_id
  order by sort_order asc;
end;
$$;

revoke all on function public.replace_partner_services(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.replace_partner_services(uuid, jsonb) to service_role;

notify pgrst, 'reload schema';
