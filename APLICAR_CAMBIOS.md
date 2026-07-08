# Aplicar este paquete

No pude escribir directamente en GitHub porque el conector devolvió `403 Resource not accessible by integration`.

Para aplicar los cambios:

1. Descarga y descomprime este ZIP dentro de tu repositorio local.
2. Sobrescribe los archivos existentes.
3. Elimina el archivo `.env` del repositorio si existe:
   ```bash
   git rm --cached .env
   rm -f .env
   ```
4. Crea tu `.env` local:
   ```bash
   cp .env.example .env
   ```
5. Ejecuta:
   ```bash
   npm install
   npm run build
   ```
6. Commit:
   ```bash
   git add .
   git commit -m "fix: translate site and prepare editable content"
   git push
   ```

Cambios incluidos:
- Limpieza de `.env.example` y `.gitignore`.
- Documentación en español.
- SQL de Supabase para eventos y rutas.
- Corrección de import roto `PushNotificationManager`.
- Corrección de tipos `params` para rutas dinámicas en Next 16.
- Textos principales traducidos al español.
- Mensajes de validación y API en español.
