# Cómo modificar los datos de Tramassso

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

## Configuración inicial en Supabase

1. Abre Supabase.
2. Ve a SQL Editor.
3. Ejecuta `supabase/tramassso-content.sql`.
4. Ejecuta `supabase/partners-and-route-coordinates.sql`.
5. Copia estas claves a `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

Si aparece un error de caché de esquema, el proyecto Supabase conectado no tiene creadas las tablas o PostgREST todavía no ha refrescado. Ejecuta la SQL en el mismo proyecto indicado en `NEXT_PUBLIC_SUPABASE_URL` y recarga la página.

Puedes comprobarlo con:

```sql
select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('events', 'routes', 'partners');
```

## Campos de eventos

- Título
- Descripción
- Fecha y hora
- Ubicación
- Imagen principal
- Galería de imágenes

## Campos de rutas

- Título
- Descripción
- Punto de salida
- Punto de llegada
- Distancia en km
- Tiempo estimado en minutos
- Imagen principal
- Galería de imágenes
- Coordenadas de la ruta

Formato de coordenadas:

```json
[
  { "lat": 28.1234, "lng": -15.4321 },
  { "lat": 28.125, "lng": -15.44 }
]
```

Debe ser JSON válido con al menos dos puntos. Si el campo queda vacío, se guarda `null` y la página de detalle muestra “Mapa no disponible para esta ruta.”.

## Campos de colaboradores

- Nombre
- Categoría
- Logo
- Web
- Descripción
- Destacado

Los colaboradores se gestionan desde `/admin` y se publican en `/partners`. Los destacados aparecen primero, seguidos por los más recientes.

## Imágenes y logos

El panel usa Cloudinary con firma de servidor. Necesitas:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

No necesitas upload preset unsigned. La ruta `/api/admin/cloudinary-signature` firma la subida y solo responde a usuarios con rol `admin` o `superadmin`.

## Acceso admin

El layout de `/admin` exige sesión de NextAuth y `role = "admin"` o `role = "superadmin"`. El usuario debe existir en la tabla Prisma `User`.

Desde `/admin` puedes:

- Crear, editar y eliminar eventos.
- Crear, editar y eliminar rutas.
- Añadir coordenadas JSON para mapas de rutas.
- Crear, editar y eliminar colaboradores.
- Subir portadas, galerías y logos con Cloudinary.

## Variables necesarias

- `DATABASE_URL`: base de datos usada por Prisma y NextAuth.
- `NEXTAUTH_URL`: URL pública de la app.
- `NEXTAUTH_SECRET`: secreto de NextAuth.
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave anónima pública de Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: clave de servicio para guardar contenido desde el servidor.
- `CLOUDINARY_CLOUD_NAME`: nombre del cloud de Cloudinary.
- `CLOUDINARY_API_KEY`: API key de Cloudinary.
- `CLOUDINARY_API_SECRET`: secreto usado solo en servidor para firmar subidas.

## Seguridad

No subas `.env`. El repositorio debe tener solo `.env.example`.
Si alguna clave real ya estuvo en GitHub, rótala en Supabase, Cloudinary y cualquier servicio afectado.
