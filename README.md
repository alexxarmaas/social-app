# Tramassso

Aplicación Next.js para Tramassso: eventos, rutas con mapa, colaboradores y panel de administración para editar contenido sin tocar código.

## Instalación

```bash
npm install
```

## Configuración

```bash
cp .env.example .env
```

Edita `.env` con tus claves reales. No subas `.env` a GitHub.

## Variables necesarias

- `DATABASE_URL`: base de datos usada por Prisma y NextAuth.
- `NEXTAUTH_URL` y `NEXTAUTH_SECRET`: autenticación del panel admin.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`: contenido editable de eventos, rutas y colaboradores.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`: subida firmada de imágenes desde el admin.
- Variables `NEXT_PUBLIC_ADSENSE_*`: anuncios opcionales.

## Arranque local

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Supabase

Ejecuta estas SQL desde el SQL Editor del proyecto Supabase conectado:

1. `supabase/tramassso-content.sql`
2. `supabase/partners-and-route-coordinates.sql`

La segunda SQL añade `coordinates` a `public.routes` y crea `public.partners`.

Formato válido para coordenadas de rutas:

```json
[
  { "lat": 28.1234, "lng": -15.4321 },
  { "lat": 28.125, "lng": -15.44 }
]
```

El array debe tener al menos dos puntos. Si una ruta no tiene mapa, deja el campo vacío en el admin.

## Datos editables

El contenido se edita desde `/admin`:

- Eventos públicos.
- Rutas públicas, incluyendo coordenadas JSON para el mapa.
- Colaboradores públicos en `/partners`.
- Imágenes y logos mediante Cloudinary firmado.

Los logos de colaboradores se suben desde el mismo panel con `CloudinaryUploader`; no necesitas upload preset unsigned.

## Comandos

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run create-superadmin
```

## Superadmin

El superadmin se crea en la base de datos real configurada en `DATABASE_URL`; no hay bypass por correo en el código.

PowerShell:

```powershell
$env:SUPERADMIN_EMAIL="alexarmas2002@outlook.es"
$env:SUPERADMIN_PASSWORD="TU_CONTRASEÑA_SEGURA"
npm run create-superadmin
```

Bash:

```bash
SUPERADMIN_EMAIL="alexarmas2002@outlook.es" SUPERADMIN_PASSWORD="TU_CONTRASEÑA_SEGURA" npm run create-superadmin
```

Después podrás iniciar sesión en la ruta interna de acceso del equipo con el correo y la contraseña definida en `SUPERADMIN_PASSWORD`.

## Build

Antes de desplegar:

```bash
npm run build
```

## Seguridad

- Rota cualquier clave real que haya estado en GitHub.
- Mantén `.env` fuera del repositorio.
- `.env.example` debe contener solo placeholders.
- El uploader usa firma de servidor con `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`.
