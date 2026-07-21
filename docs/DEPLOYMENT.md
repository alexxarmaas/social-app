# Despliegue en Vercel

1. Importa el repositorio en Vercel y usa Node.js 22.
2. Añade las variables de `.env.example` en cada entorno que corresponda.
3. Usa una URL PostgreSQL con SSL para `DATABASE_URL`.
4. Ejecuta `npx prisma migrate deploy` contra la base de producción antes del primer tráfico.
5. Ejecuta completas, en orden, `supabase/migrations/20260708_tramassso_content.sql` y `supabase/migrations/20260721_engagement_features.sql` en el SQL Editor de Supabase. La segunda activa inscripciones, modos de participación y archivos GPX; ambas son idempotentes.
6. Configura el dominio definitivo en `NEXTAUTH_URL` y actualiza `metadataBase` en `app/lib/seo.ts` si no es `https://tramassso.com`.
7. Despliega y verifica `/`, `/events`, `/routes`, `/partners`, el login y el panel `/admin`.
8. Si activas las notificaciones, añade en Vercel las variables SMTP de `.env.example` y prueba tanto una solicitud de contacto como una inscripción. Los datos deben quedar guardados en `/admin` aunque falle el correo.

No uses claves de servicio en variables `NEXT_PUBLIC_*`. AdSense gestiona el consentimiento europeo mediante la CMP certificada configurada en la cuenta de Google.
Para AdSense, comprueba que `/ads.txt` sea publico y activa el mensaje europeo de la CMP de Google. Las unidades responsive de eventos y rutas ya tienen identificadores por defecto; usa las variables `NEXT_PUBLIC_ADSENSE_SLOT_*` solo si necesitas sustituirlos por entorno.
