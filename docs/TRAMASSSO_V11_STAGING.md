# Tramassso 1.1 — staging aislado (runbook)

**Estado:** preparado en GitHub; la activación de fases 1–3 necesita un proyecto Supabase propio y un despliegue Vercel separado. Nunca activar estos flags en producción por accidente.

## Inventario comprobado

- Vercel producción: proyecto \`tramassso\`.
- Supabase actual: proyecto \`tramassso-db\` (referencia de producción \`fqeoaupcdcrzmziuxxxk\`).
- La Preview original hereda variables Preview+Production; no es un staging independiente.
- Coste consultado en Supabase: proyecto adicional $0/mes en la organización disponible; ramificación de DB $0.01344/h (evitar opción con cargo horario salvo autorización).
- La rama \`feat/tramassso-community-v1\` incluye los cambios de fases 1–3, migraciones Prisma y Supabase, y tests en PostgreSQL 17 aislado.

## Recursos a provisionar

1. Proyecto **Supabase** independiente denominado \`tramassso-staging\` (región europea, p. ej. \`eu-west-1\`), con datos ficticios. Confirmar organización/condiciones de capacidad antes de crear.
2. Proyecto **Vercel** \`tramassso-staging\` vinculado a \`alexxarmaas/social-app\`, con rama de pruebas y protección de acceso habilitada. No asignar dominios públicos de producción.
3. Configurar SOLO en staging los secretos nuevos: \`DATABASE_URL\`, \`DIRECT_URL\`, \`SUPABASE_URL\`, \`NEXT_PUBLIC_SUPABASE_URL\`, \`SUPABASE_ANON_KEY\`, \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`, \`SUPABASE_SERVICE_ROLE_KEY\`, \`NEXTAUTH_SECRET\`, \`NEXTAUTH_URL\`, SMTP y Cloudinary. No copiar claves desde producción.
4. Mantener \`TRAMASSSO_STAGING_MODE=true\` y \`TRAMASSSO_STAGING_WRITE_ENABLED=false\` hasta aplicar las migraciones, verificar credenciales y probar lectura.
5. Ejecutar el preflight: \`npm run staging:check\` con variables reales en el proceso de staging. No imprime secretos.

## Orden de migraciones en la base aislada

1. \`npx prisma migrate deploy\` apuntando únicamente a la base nueva (nunca a producción).
2. Aplicar las migraciones SQL en \`supabase/migrations/\` por orden de nombre: contenido, engagement, servicios, matrículas, tickets/espera.
3. Validar RLS y permisos de funciones RPC. \`trm_checkin_event_v2\`, \`trm_register_event_v2\` y actualizaciones se ejecutan únicamente con service_role del backend.
4. Ejecutar la prueba de contrato contra PostgreSQL CI y comprobar \`supabase db advisors\` o el MCP de Supabase tras aplicar cambios.

## Activación por lotes (todas las variables se crean SOLO en staging)

| Lote | Flags | Comprobación previa |
| --- | --- | --- |
| 0 | \`TRAMASSSO_STAGING_WRITE_ENABLED=true\` | Preflight completo; Supabase y Prisma apuntan al proyecto nuevo |
| 1 | \`COMMUNITY_SECURITY_V2_ENABLED=true\`, \`COMMUNITY_ACCOUNT_VERIFICATION_ENABLED=true\` | Esquema Prisma migrado, correo saliente de pruebas |
| 1b | \`COMMUNITY_REGISTRATION_ENABLED=true\` | Registro y verificación del correo, reset y login probados; textos legales |
| 2 | \`EVENT_TICKETING_V2_ENABLED=true\`, \`NEXT_PUBLIC_EVENT_WAITLIST_ENABLED=true\` | RPC reservando plazas, cola FIFO, QR un solo uso, cancelación |
| 3 | \`COMMUNITY_SOCIAL_ENABLED=true\`, \`COMMUNITY_GALLERY_ENABLED=true\` | Moderación, likes, follows, privacidad e imágenes con cuentas ficticias |

**Importante:** las variables \`NEXT_PUBLIC_*\` se inyectan durante el build. Redesplegar tras cada cambio de estos flags. El modo staging y \`VERCEL_ENV=preview\` bloquean escrituras mediante \`proxy.ts\` salvo que \`isIsolatedStagingReady\` valide el proyecto y sus URLs de PostgreSQL. La protección adicional NO sustituye la revisión real de credenciales, acceso y RLS.

## Pruebas de aceptación

- Tres usuarios ficticios: uno registrado/verificado, uno no verificado, otro con rol de moderador.
- Crear/editar/borrar coches, cargar galería y navegar perfiles sin poder modificar otros propietarios.
- Concurrencia de 100 peticiones por evento de 60 coches; medir 60 admisiones como máximo y lista de espera FIFO.
- Probar placa duplicada, cancelación, correo de promoción, token QR duplicado y check-in sin permisos.
- Publicar en feed, seguir un perfil, like, reporte de abuso y revisión del moderador.
- Revisar responsive iPhone/desktop y accesibilidad, anuncios desactivados y noindex en staging.

## Seguridad y rollback

- La aplicación en Preview original es **solo lectura** y muestra un aviso; los API POST/PUT/PATCH/DELETE y el GET de Bonoa SSO están bloqueados hasta validar staging aislado.
- Staging no debe enviar correos reales, apuntar a Cloudinary productivo ni compartir datos de clientes.
- Para rollback, dejar \`TRAMASSSO_STAGING_WRITE_ENABLED=false\` y desactivar flags de fases 1–3; no borrar migraciones ni tablas en producción.
- La entrega permanece en PR borrador, sin fusionar a \`master\`.
