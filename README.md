# Tramassso

Plataforma de motor Tramassso: comunidad gratuita con Garage de coches, perfiles, clubes, eventos, rutas y colaboradores, con panel privado de contenido y consola interna de RecceMind. Está construida con Next.js 16, React 19, Prisma/PostgreSQL, Supabase y Cloudinary.

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

Abre `http://localhost:3000`. El panel está en `/admin`, el acceso interno en `/acceso-interno-tramassso` y RecceMind en `/reccemind` para usuarios con rol `admin` o `superadmin`.

## RecceMind

`/reccemind` es una consola web protegida que consume el backend FastAPI de RecceMind a través de un proxy server-side de Next.js. El navegador nunca recibe `RECCEMIND_SERVICE_TOKEN` ni necesita conocer la URL real del backend.

Configura en el servidor/Vercel:

```env
RECCEMIND_API_URL="https://tu-backend-reccemind.example.com"
RECCEMIND_SERVICE_TOKEN="el-mismo-secreto-configurado-en-el-backend"
RECCEMIND_API_TIMEOUT_MS="45000"
```

La consola permite actualmente:

- analizar una ruta por origen y destino;
- importar GPX;
- importar telemetría CSV (`lat`, `lon` y opcionalmente `speed`, `brake`, `gear`);
- visualizar el trazado en Leaflet;
- revisar curvas, radios, distancias y pacenotes;
- exportar las notas a CSV.

Si `RECCEMIND_SERVICE_TOKEN` está configurado en el backend, usa exactamente el mismo valor en Tramassso. No lo declares como `NEXT_PUBLIC_*`.

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
- Mantén `RECCEMIND_SERVICE_TOKEN` exclusivamente en variables de servidor.
- Rota de inmediato cualquier clave que haya sido expuesta.
- Las imágenes del contenido deben usar HTTPS; las subidas admiten JPG, PNG, WebP, GIF o AVIF hasta 10 MB.
- La rama principal valida lint, tipos, pruebas y build mediante GitHub Actions.


## Tramassso Community V1 (rama feat/tramassso-community-v1)

- **Identidad:** estética negra con naranja/rojo en la nueva experiencia.
- **Comunidad:** registro gratuito, acceso con credenciales y perfiles públicos con edición privada de nombre, biografía y zona.
- **Garage:** altas, ediciones, borrados, fotografía principal mediante Cloudinary, fichas SEO y carteles OpenGraph descargables.
- **Clubes:** creación de clubes, directorio, solicitudes de ingreso, moderación por propietario y carnet visual para miembros aprobados. El carnet **no** sirve como control de acceso ni es un QR verificable.
- **Eventos:** quien inicia sesión puede utilizar uno de sus vehículos guardados para completar el formulario Supabase de inscripción existente. La matrícula se sigue introduciendo manualmente por privacidad.
- **Colaboradores:** los destacados ya gestionados en Supabase se muestran en Inicio, Garage y Clubes; los clics se registran en Vercel Analytics incluyendo la sección. Se ha añadido \`/anunciarse\` reutilizando el formulario de contacto.
- **AdSense:** mantiene los espacios existentes; la nueva ubicación de Garage requiere \`NEXT_PUBLIC_ADSENSE_SLOT_GARAGE\` válido para mostrarse, sin reutilizar el identificador de eventos.

### Fuentes de datos

Las cuentas, coches y clubes utilizan **Prisma/PostgreSQL**. Los eventos, rutas, colaboradores y solicitudes de inscripción existentes mantienen **Supabase** como fuente de verdad. No se crean duplicados de inscripciones en Prisma.

### Puesta en producción

Primero, probar en Preview las rutas \`/register\`, \`/login\`, \`/account\`, \`/garage\`, \`/clubs\`, \`/events\` y \`/anunciarse\`, el proceso completo de registro y la subida de fotos. Configurar Cloudinary, correo, protección antiabuso distribuida, términos, privacidad y consentimiento publicitario antes de abrir el registro público. La rama no debe fusionarse sin validación manual. Más detalle en \`docs/TRAMASSSO_COMMUNITY_V1.md\`.
