# Tramassso

Aplicación Next.js para Tramassso: eventos, rutas de conducción y panel de administración para editar contenido sin tocar código.

## Arranque local

```bash
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:3000`.

## Variables necesarias

Edita `.env` con tus claves reales. No subas `.env` a GitHub.

- `DATABASE_URL`: base de datos usada por Prisma y NextAuth.
- `NEXTAUTH_URL` y `NEXTAUTH_SECRET`: autenticación del panel admin.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`: contenido editable de eventos y rutas.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: subida de imágenes desde el admin.
- Variables `NEXT_PUBLIC_ADSENSE_*`: anuncios opcionales.

## Datos editables

El contenido de eventos y rutas se edita desde `/admin`.

1. Crea las tablas de Supabase con `supabase/tramassso-content.sql`.
2. Crea un usuario admin en tu base Prisma con `role = "admin"`.
3. Entra en `/login` y luego `/admin`.
4. Crea, edita o elimina eventos y rutas desde el panel.

Consulta `docs/EDITAR_DATOS.md` para la guía completa.

## Comandos

```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm run start    # servir producción
npm run lint     # lint
```

## Notas de seguridad

- Rota cualquier clave real que haya estado en GitHub.
- Mantén `.env` fuera del repositorio.
- Usa un upload preset unsigned de Cloudinary restringido por carpeta, formato y tamaño.
