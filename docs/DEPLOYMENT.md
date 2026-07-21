# Despliegue en Vercel

1. Importa el repositorio en Vercel y usa Node.js 22.
2. Añade las variables de `.env.example` en cada entorno que corresponda.
3. Usa una URL PostgreSQL con SSL para `DATABASE_URL`.
4. Ejecuta `npx prisma migrate deploy` contra la base de producción antes del primer tráfico.
5. Ejecuta completa la migración `supabase/migrations/20260708_tramassso_content.sql` en el SQL Editor de Supabase. Hazlo también al actualizar una instalación existente: añade los filtros de rutas, Instagram de colaboradores y la bandeja de solicitudes.
6. Configura el dominio definitivo en `NEXTAUTH_URL` y actualiza `metadataBase` en `app/lib/seo.ts` si no es `https://tramassso.com`.
7. Despliega y verifica `/`, `/events`, `/routes`, `/partners`, el login y el panel `/admin`.
8. Si activas las notificaciones de contacto, añade en Vercel las variables SMTP de `.env.example` y envía una solicitud real desde la portada para comprobar tanto el correo como su copia en `/admin`.

No uses claves de servicio en variables `NEXT_PUBLIC_*`. AdSense gestiona el consentimiento europeo mediante la CMP certificada configurada en la cuenta de Google.
Para AdSense, comprueba que `/ads.txt` sea publico, activa el mensaje europeo de la CMP de Google y configura los identificadores de las unidades responsive antes de mostrar anuncios.
