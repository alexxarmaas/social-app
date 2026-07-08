# Tramassso

Aplicación Next.js para Tramassso: eventos, rutas de conducción y panel de administración para editar contenido sin tocar código.

## Instalación

```bash
npm install
```

## Configuración

```bash
cp .env.example .env
```

Edita `.env` con tus claves reales. No subas `.env` a GitHub.

## Arranque local

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Variables necesarias

- `DATABASE_URL`: base de datos usada por Prisma y NextAuth.
- `NEXTAUTH_URL` y `NEXTAUTH_SECRET`: autenticación del panel admin.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`: contenido editable de eventos y rutas.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: subida de imágenes desde el admin.
- Variables `NEXT_PUBLIC_ADSENSE_*`: anuncios opcionales.

## Datos editables

El contenido de eventos y rutas se edita desde `/admin`.

1. Crea las tablas de Supabase con `supabase/tramassso-content.sql`.
2. Crea un usuario admin o superadmin en tu base Prisma con `role = "admin"` o `role = "superadmin"`.
3. Entra en la ruta interna de acceso del equipo y luego en `/admin`.
4. Crea, edita o elimina eventos y rutas desde el panel.

Consulta `docs/EDITAR_DATOS.md` para la guía completa.

## Comandos

```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm run start    # servir producción
npm run lint     # lint
npm run create-superadmin # crea o actualiza el superadmin
```

Para compilar antes de desplegar:

```bash
npm run build
```

## Supabase

Ejecuta `supabase/tramassso-content.sql` desde el SQL Editor de Supabase. Ese script crea las tablas de eventos y rutas usadas por el panel de administración. Después copia la URL del proyecto, la clave anónima y la clave de servicio a `.env`.

## Superadmin

El superadmin se crea en la base de datos real configurada en `DATABASE_URL`; no hay bypass por correo en el código. Si `DATABASE_URL` apunta a Supabase, el usuario se crea en Supabase. Si apunta a una base local, se crea localmente.

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

Después podrás iniciar sesión en la ruta interna de acceso del equipo con `alexarmas2002@outlook.es` y la contraseña definida en `SUPERADMIN_PASSWORD`.

## Notas de seguridad

- Rota cualquier clave real que haya estado en GitHub.
- Mantén `.env` fuera del repositorio.
- Usa un upload preset unsigned de Cloudinary restringido por carpeta, formato y tamaño.
