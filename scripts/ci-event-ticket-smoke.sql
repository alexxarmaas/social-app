-- Runs ONLY in temporary CI PostgreSQL, never against user data.
BEGIN;
DO $smoke$
DECLARE
  e uuid;
  first_registration jsonb;
  second_registration jsonb;
  first_id uuid;
  second_id uuid;
  result jsonb;
BEGIN
  INSERT INTO public.events(title,description,date,location,participation_mode,max_participants)
    VALUES ('CI Meet','Evento aislado de prueba',now()+interval '7 days','CI', 'managed', 1)
    RETURNING id INTO e;

  first_registration := public.trm_register_event_v2(
    e, 'Conductora Uno', 'one@example.com', '', 'Honda Prelude',
    '1234 ABC', 0, 'ci-user-1'
  );
  IF first_registration->>'status' <> 'new' THEN
    RAISE EXCEPTION 'First signup did not reserve a place: %', first_registration;
  END IF;

  second_registration := public.trm_register_event_v2(
    e, 'Conductor Dos', 'two@example.com', '', 'Volkswagen Polo',
    '5678 DEF', 1, 'ci-user-2'
  );
  IF second_registration->>'status' <> 'waitlisted' THEN
    RAISE EXCEPTION 'Second signup was not waitlisted: %', second_registration;
  END IF;

  IF public.trm_register_event_v2(
    e, 'Duplicado', 'one@example.com', '', 'Honda Prelude',
    '9876 FED', 0, 'ci-user-3'
  )->>'success' = 'true' THEN
    RAISE EXCEPTION 'Duplicate email was accepted';
  END IF;

  first_id := (first_registration->>'registrationId')::uuid;
  second_id := (second_registration->>'registrationId')::uuid;
  result := public.trm_set_event_status_v2(first_id, 'confirmed', repeat('a',64));
  IF result->>'success' <> 'true' THEN
    RAISE EXCEPTION 'Confirmation failed: %', result;
  END IF;

  result := public.trm_checkin_event_v2(e, repeat('a',64));
  IF result->>'success' <> 'true' THEN
    RAISE EXCEPTION 'Check-in failed: %', result;
  END IF;
  result := public.trm_checkin_event_v2(e, repeat('a',64));
  IF result->>'error' <> 'Entrada ya utilizada' THEN
    RAISE EXCEPTION 'Replay protection failed: %', result;
  END IF;

  result := public.trm_set_event_status_v2(first_id, 'cancelled', NULL);
  IF result->>'success' <> 'true' THEN
    RAISE EXCEPTION 'Cancellation failed: %', result;
  END IF;
  IF NOT EXISTS(
    SELECT 1 FROM public.event_registrations
      WHERE id=second_id AND status='new'
  ) THEN
    RAISE EXCEPTION 'Waitlist promotion failed';
  END IF;
  IF EXISTS(SELECT 1 FROM public.event_registrations WHERE id=first_id AND ticket_hash IS NOT NULL) THEN
    RAISE EXCEPTION 'Cancelled ticket still active';
  END IF;
END
$smoke$;

DO $grants$
BEGIN
  IF has_function_privilege('anon',
    'public.trm_checkin_event_v2(uuid,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Check-in function exposed to anon';
  END IF;
  IF has_function_privilege('authenticated',
    'public.trm_register_event_v2(uuid,text,text,text,text,text,integer,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Ticketing RPC exposed to authenticated role';
  END IF;
END
$grants$;
ROLLBACK;
