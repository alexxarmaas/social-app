# Tramassso 1.1 — release directo en producción (pendiente de aprobación de permisos)

## Preflight real, 25-10-2026

- Código en rama `feat/tramassso-community-v1`, PR #28. No fusionado a `master`.
- Supabase producción: `tramassso-db`. **Contiene 3 cuentas, 2 clubes, 18 inscripciones (16 confirmadas y 2 nuevas).** No resetear ni sembrar con datos de prueba.
- Vercel: proyecto `tramassso`; variables SMTP, Prisma, Cloudinary y Supabase presentes (valores no examinados).
- La Preview hereda la base de producción y bloquea escrituras, según `proxy.ts`.
- En la base productiva no consta `_prisma_migrations`: antes de usar `prisma migrate deploy` hay que conciliar el historial de migraciones existentes, nunca ejecutar la baseline completa sobre tablas ya creadas.
- Las columnas/tables V1.1 (AccountToken, CommunityRateLimit, CarPhoto, PostReport; User.emailVerifiedAt; event_registrations.ticket_hash) todavía no están creadas.
- **Hallazgo crítico:** `anon` tiene SELECT y DELETE sobre `public."User"`, `authenticated` tiene UPDATE sobre `public."Car"` y 22 tablas Prisma están sin RLS. La solución propuesta en `supabase/migrations/20261025_isolate_prisma_api.sql` solo afecta a tablas de Prisma. **NO aplicar a producción sin revisión y aprobación del propietario.** Test de regresión `scripts/ci-prisma-api-isolation-smoke.sql`.

## Checklist de despliegue productivo

1. Confirmar copia/restauración real de base de datos y rollback de dominio Vercel. No depender de una Preview que apunte a la misma base.
2. Autorizar y aplicar aislamiento de tablas Prisma de la Data API de Supabase; verificar permisos y RLS, probar login existente y páginas públicas.
3. Conciliar historial de migraciones Prisma antes de ejecutar `prisma migrate deploy` en producción. Revisar esquema live vs baseline (no reejecutar baseline).
4. Aplicar solo migraciones aditivas Prisma v1.1 y Supabase tickets v2 a la base productiva. Verificar todos los objetos SQL y restricciones.
5. Configurar y comprobar flags **Production** gradualmente: `COMMUNITY_SECURITY_V2_ENABLED`, `COMMUNITY_ACCOUNT_VERIFICATION_ENABLED`, `COMMUNITY_REGISTRATION_ENABLED`, `EVENT_TICKETING_V2_ENABLED`, `NEXT_PUBLIC_EVENT_WAITLIST_ENABLED`, `COMMUNITY_SOCIAL_ENABLED`, `COMMUNITY_GALLERY_ENABLED`. Confirmar correo y consentimiento.
6. Desplegar desde commit fijo sobre rama productiva; verificar inicio, login legacy, CRUD vehículos, evento existente, administración y RecceMind.
7. QA con cuenta ficticia: email, reset, aforo 60 con alta concurrencia, lista de espera FIFO, cancelación, QR reutilizado, reportes y galerías. No generar inscripciones ficticias en eventos reales.
8. Auditar privacidad/consentimiento publicitario, moderación, backups, logs y regresiones. Para detener nuevas funciones, poner flags a false (redesplegar los NEXT_PUBLIC).

**Las CI que usan PostgreSQL aislado no demuestran que las migraciones se hayan ejecutado en producción.**
