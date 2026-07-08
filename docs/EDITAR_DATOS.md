# Cómo modificar los datos de Tramassso

## Eventos y rutas

Los eventos y rutas ya están preparados para editarse desde el panel `/admin`.

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

## Seguridad

No subas `.env`. El repositorio debe tener solo `.env.example`.
Si alguna clave real ya estuvo en GitHub, rótala en Supabase, Cloudinary y cualquier servicio afectado.
