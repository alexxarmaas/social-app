# Cómo modificar los datos de Tramassso

## Eventos y rutas

Los eventos y rutas ya están preparados para editarse desde el panel `/admin`.

## Instalación y arranque

```bash
npm install
cp .env.example .env
npm run dev
```

Para comprobar producción:

```bash
npm run build
```

### Campos de eventos

- Título
- Descripción
- Fecha y hora
- Ubicación
- Imagen principal
- Galería de imágenes

### Campos de rutas

- Título
- Descripción
- Punto de salida
- Punto de llegada
- Distancia en km
- Tiempo estimado en minutos
- Imagen principal
- Galería de imágenes

## Configuración inicial en Supabase

1. Abre Supabase.
2. Ve a SQL Editor.
3. Ejecuta el archivo `supabase/tramassso-content.sql`.
4. Copia estas claves a `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

Si aparece `Could not find the table 'public.events' in the schema cache` o `Could not find the table 'public.routes' in the schema cache`, el proyecto Supabase conectado no tiene creadas las tablas de contenido o PostgREST todavía no ha refrescado la caché. Ejecuta de nuevo `supabase/tramassso-content.sql` en el SQL Editor del mismo proyecto indicado en `NEXT_PUBLIC_SUPABASE_URL`.

Puedes comprobarlo en Supabase con:

```sql
select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('events', 'routes');
```

El resultado debe devolver `public.events` y `public.routes`. Si acabas de crear las tablas y el error persiste unos segundos, recarga la página para que PostgREST actualice la caché de esquema.

## Imágenes

El panel usa Cloudinary desde el navegador. Necesitas:

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

Crea un preset unsigned en Cloudinary y limita:
- carpeta de destino,
- tipos de archivo permitidos,
- tamaño máximo,
- moderación si lo necesitas.

## Acceso admin

El layout de `/admin` exige sesión de NextAuth y `role = "admin"`. El usuario debe existir en la tabla Prisma `User`.

Desde `/admin` puedes:

- Crear, editar y eliminar eventos.
- Crear, editar y eliminar rutas.
- Subir portada y galería con Cloudinary.

## Variables necesarias

- `DATABASE_URL`: base de datos usada por Prisma y NextAuth.
- `NEXTAUTH_URL`: URL pública de la app.
- `NEXTAUTH_SECRET`: secreto de NextAuth.
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave anónima pública de Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: clave de servicio para guardar contenido desde el servidor.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: nombre del cloud de Cloudinary.
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: preset unsigned restringido para subir imágenes.

## Seguridad

No subas `.env`. El repositorio debe tener solo `.env.example`.
Si alguna clave real ya estuvo en GitHub, rótala en Supabase, Cloudinary y cualquier servicio afectado.
