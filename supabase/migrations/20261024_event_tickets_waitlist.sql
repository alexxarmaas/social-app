-- Tramassso Events v2: STAGED migration, do not apply to production without acceptance tests.
-- Based on the existing public.events and public.event_registrations schema (2026-10-24).
-- All functions are restricted to server-side service_role access.
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS user_id text,
  ADD COLUMN IF NOT EXISTS ticket_hash text,
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

ALTER TABLE public.event_registrations DROP CONSTRAINT IF EXISTS event_registrations_status_check;
ALTER TABLE public.event_registrations
  ADD CONSTRAINT event_registrations_status_check CHECK (status IN ('new','confirmed','cancelled','waitlisted'));

CREATE UNIQUE INDEX IF NOT EXISTS event_registrations_ticket_hash_key
  ON public.event_registrations(ticket_hash) WHERE ticket_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS event_registrations_account_lookup_idx
  ON public.event_registrations(user_id, event_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS event_registrations_waitlist_idx
  ON public.event_registrations(event_id, created_at ASC)
  WHERE status='waitlisted';
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Serialize bookings against the events row: no check-then-insert race.
CREATE OR REPLACE FUNCTION public.trm_register_event_v2(
  p_event_id uuid, p_name text, p_email text, p_phone text,
  p_vehicle text, p_license_plate text, p_companions int, p_user_id text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE ev public.events%ROWTYPE; places int; desired text; reg_id uuid;
BEGIN
  SELECT * INTO ev FROM public.events WHERE id=p_event_id FOR UPDATE;
  IF NOT FOUND OR ev.date < now() OR ev.participation_mode NOT IN ('managed','interest') THEN
    RETURN jsonb_build_object('error','Evento no disponible');
  END IF;
  IF length(p_name) NOT BETWEEN 2 AND 120 OR length(p_email)>160
     OR length(p_vehicle) NOT BETWEEN 2 AND 160
     OR length(p_license_plate) NOT BETWEEN 4 AND 16
     OR p_companions NOT BETWEEN 0 AND 20 THEN
    RETURN jsonb_build_object('error','Datos invalidos');
  END IF;
  desired := 'new';
  IF ev.participation_mode='managed' AND ev.max_participants IS NOT NULL THEN
    SELECT count(*) INTO places FROM public.event_registrations
      WHERE event_id=p_event_id AND status IN ('new','confirmed');
    IF places >= ev.max_participants THEN desired := 'waitlisted'; END IF;
  END IF;

  INSERT INTO public.event_registrations(
    event_id, participation_mode, name, email, phone,
    vehicle, license_plate, companions, status, privacy_accepted_at, user_id
  ) VALUES(
    p_event_id, ev.participation_mode, p_name, lower(p_email), nullif(p_phone,''),
    p_vehicle, p_license_plate, p_companions, desired, now(), p_user_id
  ) RETURNING id INTO reg_id;
  RETURN jsonb_build_object('success',true,'registrationId',reg_id,'status',desired);
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object('error','Ya existe una solicitud activa para ese correo o matricula');
END;
$$;
REVOKE ALL ON FUNCTION public.trm_register_event_v2(uuid,text,text,text,text,text,int,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trm_register_event_v2(uuid,text,text,text,text,text,int,text) TO service_role;

-- Updates, cancellations and waitlist promotions use the same event-row lock.
CREATE OR REPLACE FUNCTION public.trm_set_event_status_v2(
  p_registration_id uuid, p_status text, p_ticket_hash text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE r public.event_registrations%ROWTYPE; ev public.events%ROWTYPE;
        occupancy int; first_waitlist uuid; old_status text;
BEGIN
  IF p_status NOT IN ('new','confirmed','cancelled') THEN
    RETURN jsonb_build_object('error','Estado no permitido');
  END IF;
  -- This first lookup is a non-locking identity lookup, then lock event, then row.
  SELECT event_id INTO r.event_id FROM public.event_registrations WHERE id=p_registration_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Inscripcion no encontrada'); END IF;
  SELECT * INTO ev FROM public.events WHERE id=r.event_id FOR UPDATE;
  SELECT * INTO r FROM public.event_registrations WHERE id=p_registration_id FOR UPDATE;
  old_status := r.status;
  IF old_status='cancelled' AND p_status <> 'cancelled' THEN
    RETURN jsonb_build_object('error','Una solicitud cancelada no puede reactivarse');
  END IF;
  IF r.participation_mode <> 'managed' AND p_status='confirmed' THEN
    RETURN jsonb_build_object('error','No se expiden entradas para listas informativas');
  END IF;
  IF p_status='confirmed' AND (p_ticket_hash IS NULL OR p_ticket_hash !~ '^[a-f0-9]{64}$') THEN
    RETURN jsonb_build_object('error','El ticket requiere un hash valido');
  END IF;
  IF p_status IN ('new','confirmed') AND old_status='waitlisted' AND ev.max_participants IS NOT NULL THEN
    SELECT count(*) INTO occupancy FROM public.event_registrations
      WHERE event_id=ev.id AND status IN ('new','confirmed');
    IF occupancy >= ev.max_participants THEN
      RETURN jsonb_build_object('error','No hay plazas libres');
    END IF;
  END IF;
  UPDATE public.event_registrations
    SET status=p_status,
        ticket_hash=CASE WHEN p_status='confirmed' THEN p_ticket_hash ELSE NULL END,
        checked_in_at=CASE WHEN p_status='confirmed' AND old_status='confirmed' THEN checked_in_at ELSE NULL END
  WHERE id=p_registration_id;
  first_waitlist := NULL;
  IF p_status='cancelled' AND old_status IN ('new','confirmed') THEN
    SELECT id INTO first_waitlist FROM public.event_registrations
      WHERE event_id=ev.id AND status='waitlisted'
      ORDER BY created_at ASC, id ASC LIMIT 1 FOR UPDATE;
    IF first_waitlist IS NOT NULL THEN
      UPDATE public.event_registrations SET status='new' WHERE id=first_waitlist;
    END IF;
  END IF;
  RETURN jsonb_build_object('success',true,'promotedId',first_waitlist);
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object('error','El ticket ya existe');
END;
$$;
REVOKE ALL ON FUNCTION public.trm_set_event_status_v2(uuid,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trm_set_event_status_v2(uuid,text,text) TO service_role;

-- One-time admission: never do check-in as GET; safe against double scan.
CREATE OR REPLACE FUNCTION public.trm_checkin_event_v2(p_event_id uuid,p_ticket_hash text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE updated_id uuid;
BEGIN
  UPDATE public.event_registrations
    SET checked_in_at=now()
    WHERE event_id=p_event_id
      AND ticket_hash=p_ticket_hash
      AND status='confirmed'
      AND checked_in_at IS NULL
    RETURNING id INTO updated_id;
  IF updated_id IS NOT NULL THEN
    RETURN jsonb_build_object('success',true,'registrationId',updated_id);
  END IF;
  IF EXISTS(
    SELECT 1 FROM public.event_registrations
    WHERE event_id=p_event_id AND ticket_hash=p_ticket_hash
      AND status='confirmed' AND checked_in_at IS NOT NULL
  ) THEN RETURN jsonb_build_object('error','Entrada ya utilizada'); END IF;
  RETURN jsonb_build_object('error','Entrada invalida o cancelada');
END;
$$;
REVOKE ALL ON FUNCTION public.trm_checkin_event_v2(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trm_checkin_event_v2(uuid,text) TO service_role;

NOTIFY pgrst,'reload schema';
