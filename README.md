# Tramassso

Web de eventos, rutas y colaboradores de Tramassso, con panel privado de contenido. Está construida con Next.js 16, React 19, Prisma/PostgreSQL, Supabase y Cloudinary.

## Requisitos

- Node.js 22 LTS y npm 10 o superior.
- Una base de datos PostgreSQL.
- Un proyecto Supabase para el contenido público.
- Cloudinary si se subirán imágenes desde el panel.

## Instalación local

```bash
git clone https://github.com/alexxarmaas/social-app.git
cd social-app
npm install
cp .env.example .env
```

Genera el secreto de sesión y cópialo en `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Completa las variables de `.env`, crea las tablas de Prisma y arranca la aplicación:

```bash
npx prisma migrate deploy
npm run create-superadmin
npm run dev
```

Abre `http://localhost:3000`. El panel está en `/admin` y el acceso interno en `/acceso-interno-tramassso`.

## Configuración de Supabase

Ejecuta `supabase/migrations/20260708_tramassso_content.sql` y después `supabase/migrations/20260721_engagement_features.sql` completos en el SQL Editor del proyecto. Las migraciones son idempotentes: crean el contenido, los modos de participación, la bandeja de inscripciones y el almacenamiento de GPX, y pueden repetirse tras un despliegue. Configura estas variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo servidor; nunca debe exponerse en el navegador)

Las solicitudes enviadas desde la portada quedan guardadas en `/admin`, sin Resend ni otro proveedor de correo. El administrador puede marcarlas como nuevas, vistas o respondidas.

Para recibir además una notificación en el correo de Nominalia, configura `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` y `CONTACT_TO_EMAIL`. La web guarda primero la solicitud en Supabase; si el SMTP no está disponible, el visitante recibe confirmación igualmente y la solicitud permanece en el panel.

## Eventos, inscripciones y rutas

Cada evento admite cuatro modos: solo información, lista de interesados de Tramassso, inscripción gestionada por Tramassso o enlace oficial externo. Las solicitudes propias aparecen en `/admin`, se pueden confirmar, cancelar y exportar como CSV; no se crean cuentas para organizadores externos. Todos los eventos ofrecen enlaces de Google Calendar y archivos `.ics`.

Las rutas admiten archivos GPX de hasta 1,5 MB. El panel extrae automáticamente el trazado para el mapa y publica la descarga del GPX en la ficha de la ruta.

## Cuenta administradora

Define `SUPERADMIN_EMAIL` y `SUPERADMIN_PASSWORD` en `.env` y ejecuta:

```bash
npm run create-superadmin
```

La contraseña debe tener al menos 12 caracteres. El seed de demostración borra datos y está bloqueado por defecto; solo se ejecuta con confirmación explícita:

```bash
ALLOW_DESTRUCTIVE_SEED=true SEED_USER_PASSWORD="una-clave-de-prueba-segura" npx prisma db seed
```

## Comandos

```bash
npm run dev        # desarrollo
npm run check      # lint, tipos y pruebas
npm run build      # build de producción
npm start          # servidor de producción
npm run create-superadmin
```

## Despliegue

Consulta [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Antes de publicar, ejecuta `npm run check`, `npm run build` y `npm audit --omit=dev`.

## Google AdSense

El dominio publica el identificador de editor en `/ads.txt` y en la metaetiqueta de verificacion. Antes de activar anuncios para trafico europeo, configura el mensaje de regulaciones europeas en AdSense mediante la CMP certificada de Google. Las unidades responsive de eventos y rutas usan los identificadores del proyecto; `NEXT_PUBLIC_ADSENSE_SLOT_EVENTS_1` y `NEXT_PUBLIC_ADSENSE_SLOT_ROUTES_1` permiten sustituirlos por entorno.

## Seguridad

- No subas `.env`, bases de datos ni archivos de usuarios al repositorio.
- Usa un `NEXTAUTH_SECRET` único de al menos 32 caracteres.
- Rota de inmediato cualquier clave que haya sido expuesta.
- Las imágenes del contenido deben usar HTTPS; las subidas admiten JPG, PNG, WebP, GIF o AVIF hasta 10 MB.
- La rama principal valida lint, tipos, pruebas y build mediante GitHub Actions.
