# Despliegue en Vercel

1. Importa el repositorio en Vercel y usa Node.js 22.
2. Añade las variables de `.env.example` en cada entorno que corresponda.
3. Usa una URL PostgreSQL con SSL para `DATABASE_URL`.
4. Ejecuta `npx prisma migrate deploy` contra la base de producción antes del primer tráfico.
5. Ejecuta completas, en orden, `supabase/migrations/20260708_tramassso_content.sql` y `supabase/migrations/20260721_engagement_features.sql` en el SQL Editor de Supabase. La segunda activa inscripciones, modos de participación y archivos GPX; ambas son idempotentes.
6. Configura el dominio definitivo en `NEXTAUTH_URL` y actualiza `metadataBase` en `app/lib/seo.ts` si no es `https://tramassso.com`.
7. Para RecceMind, despliega primero el backend FastAPI en un servicio persistente y configura en Vercel `RECCEMIND_API_URL`, `RECCEMIND_SERVICE_TOKEN` y, opcionalmente, `RECCEMIND_API_TIMEOUT_MS`. El token debe coincidir con `RECCEMIND_SERVICE_TOKEN` del backend y nunca debe usar prefijo `NEXT_PUBLIC_`.
8. Despliega y verifica `/`, `/events`, `/routes`, `/partners`, el login, `/admin` y `/reccemind` con una cuenta administradora. Comprueba también que un usuario sin rol admin no pueda acceder a `/reccemind` y que `/api/reccemind/health` responda solo con sesión administrativa válida.
9. Si activas las notificaciones, añade en Vercel las variables SMTP de `.env.example` y prueba tanto una solicitud de contacto como una inscripción. Los datos deben quedar guardados en `/admin` aunque falle el correo.

## Backend de RecceMind

El repositorio `alexxarmaas/RecceMind` incluye un `backend/Dockerfile` preparado para ejecutar FastAPI y FFmpeg. Puedes desplegar esa imagen en Railway, Render, Fly.io, un VPS o cualquier plataforma que ejecute contenedores. Para producción se recomienda una base PostgreSQL persistente en `DATABASE_URL` en lugar del SQLite local.

Variables mínimas del backend:

```env
GOOGLE_MAPS_API_KEY="..."
DATABASE_URL="postgresql://..."
AUTO_CREATE_DB=false
RECCEMIND_SERVICE_TOKEN="mismo-secreto-que-en-vercel"
```

Ejecuta las migraciones Alembic antes de servir tráfico cuando `AUTO_CREATE_DB=false`.

No uses claves de servicio en variables `NEXT_PUBLIC_*`. AdSense gestiona el consentimiento europeo mediante la CMP certificada configurada en la cuenta de Google.
Para AdSense, comprueba que `/ads.txt` sea publico y activa el mensaje europeo de la CMP de Google. Las unidades responsive de eventos y rutas ya tienen identificadores por defecto; usa las variables `NEXT_PUBLIC_ADSENSE_SLOT_*` solo si necesitas sustituirlos por entorno.
