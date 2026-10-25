-- Proposed production hardening for Prisma tables in Supabase public.
-- REVIEW AND AUTHORIZE BEFORE APPLYING TO PRODUCTION.
-- All these tables are accessed by the server-side Prisma connection (postgres),
-- not directly by Supabase Data API client roles anon/authenticated.
-- Do NOT revoke access to the lowercase Supabase content tables (events,
-- routes, partners, event_registrations, etc.).
-- Restricted server-only tables should not be exposed through Data API.
DO $isolate$
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
      EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon, authenticated', table_name);
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    END IF;
  END LOOP;
END
$isolate$;
-- Keep server-side postgres and service_role access intact.
-- Existing legacy accounts, clubs and registrations are NOT deleted or modified.
