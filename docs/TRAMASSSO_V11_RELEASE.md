# Tramassso Community 1.1 — activacion controlada

Se implementaron fases 1 a 3 en feat/tramassso-community-v1. La rama NO ha sido fusionada a master.

## Orden de activacion

1. Crear y verificar una base de datos y un despliegue de staging separados. La Preview actual puede compartir la base de produccion.
2. Revisar y desplegar Prisma: prisma/migrations/20261024150000_community_v11_security_social/migration.sql.
3. Revisar y aplicar en Supabase staging: supabase/migrations/20261024_event_tickets_waitlist.sql. Mantener RLS y RPC restringidos a service_role.
4. Configurar SMTP, Cloudinary, NEXTAUTH_URL, NEXTAUTH_SECRET, DATABASE_URL, SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY por entorno (no exponer secretos).
5. Habilitar COMMUNITY_SECURITY_V2_ENABLED y COMMUNITY_ACCOUNT_VERIFICATION_ENABLED. Probar usuario legacy y cuenta nueva, verificacion y reset.
6. Habilitar COMMUNITY_REGISTRATION_ENABLED tras QA del correo saliente y actualizacion de politica de privacidad.
7. Habilitar EVENT_TICKETING_V2_ENABLED y NEXT_PUBLIC_EVENT_WAITLIST_ENABLED tras QA de aforo y entradas. Reconstruir la app para la variable publica.
8. Habilitar COMMUNITY_SOCIAL_ENABLED y COMMUNITY_GALLERY_ENABLED tras probar moderacion y almacenamiento.
9. Revisar RGPD, cookies/CMP, WAF, backups y pruebas E2E antes de fusionar o abrir al publico.

## Funcionalidades

- Fase 1: email verificado y reset con tokens hash, limites PostgreSQL y registro cerrado si la configuracion falta.
- Fase 2: reserva atomica por coche, espera FIFO, correos de promocion, confirmacion con QR, check-in de un solo uso y cancelacion del titular.
- Fase 3: muro moderado, likes, follows, reportes, publicaciones de club, buscador de coches y fotos adicionales.
- Datos: Prisma para comunidad; Supabase para inscripciones. No duplicar asistentes.

## Aceptacion

- Verificar que 100 peticiones simultaneas con aforo 60 nunca superen 60 solicitudes activas.
- Probar matriculas duplicadas, cancelacion, promocion FIFO, correo, QR, entrada ya utilizada y permisos de admin.
- Probar login de cuentas anteriores, caducidad de tokens y bloqueo distribuido.
- Probar propietario de coche, imagenes, club, follow, likes, reportes y moderacion.
- Probar en movil, SEO, accesibilidad, consentimiento y rendimiento.

## Limitaciones conocidas

- QR es un secreto portador; proteger enlaces. Check-in restringido al equipo admin de Tramassso.
- SMTP sin cola persistente de reintentos; revisar entregabilidad.
- Los JWT activos pueden sobrevivir al reset de clave hasta la expiracion de sesion (8 horas).
- Falta tratamiento de moderacion para fichas y fotos de vehiculos; se recomienda una beta limitada inicialmente.
- La tabla CommunityRateLimit requiere limpieza de registros caducados.
- Rollback: desactivar flags sin eliminar columnas o borrar datos nuevos.
