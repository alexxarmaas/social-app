-- A public Supabase key must never have read or write privileges on Prisma tables.
DO $assert$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'User',
    'Car',
    'Post',
    'Comment',
    'Like',
    'Notification',
    'Club',
    'ClubMember',
    'Event',
    'EventAttendee',
    'MarketplaceListing',
    'Store',
    'Follow',
    'Conversation',
    'Message',
    'ClubMessage',
    'EventPhoto',
    '_ConversationParticipants',
    'PushSubscription',
    'Route',
    'Stop',
    'RecceMindStage',
    'AccountToken',
    'CommunityRateLimit',
    'CarPhoto',
    'PostReport'
  ] LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=table_name AND NOT rowsecurity) THEN
        RAISE EXCEPTION 'RLS missing on %', table_name;
      END IF;
      IF has_table_privilege('anon', format('public.%I', table_name), 'SELECT')
        OR has_table_privilege('anon', format('public.%I', table_name), 'DELETE')
        OR has_table_privilege('authenticated', format('public.%I', table_name), 'UPDATE') THEN
        RAISE EXCEPTION 'Public client privileges remain on %', table_name;
      END IF;
    END IF;
  END LOOP;
END
$assert$;
