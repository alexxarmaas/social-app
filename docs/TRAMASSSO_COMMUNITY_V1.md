# Tramassso Community V1 — plan de ejecución

## Objetivo
Transformar la web de eventos y rutas en una comunidad gratuita del motor, conservando funcionalidades y datos actuales. Monetización mediante anuncios etiquetados y patrocinios, sin bloquear funciones esenciales.

## Estado comprobado (2026-10-24)
- Next.js 16 / React 19 / Prisma PostgreSQL / Supabase.
- Esquema Prisma incluye User, Car, Club, ClubMember, Post, Event, EventAttendee, MarketplaceListing, Store.
- Portada actual prioriza eventos, rutas y colaboradores.
- Layout ya incorpora Google AdSense condicional, Analytics y Speed Insights.
- README documenta AdSense en eventos/rutas, gestión de eventos vía Supabase y RecceMind.
- IMPORTANTE: los modelos Prisma no prueban que existan APIs o pantallas completas. Existen dos almacenes (Prisma y Supabase); no duplicar entidades sin decidir fuente de verdad.

## P0 — Auditoría y estabilización
1. Inventariar rutas, APIs, autenticación, roles, tablas y migraciones realmente utilizadas.
2. Verificar despliegue, CI, test, accesibilidad, rendimiento móvil, SEO, consentimiento publicitario.
3. Mapear flujo de inscripciones Supabase frente a Event/EventAttendee Prisma y definir integración sin migraciones destructivas.
4. Ejecutar npm run check, npm run build y npm audit --omit=dev en entorno reproducible.
5. No tocar RecceMind ni credenciales ni despliegue de producción.

## P1 — Experiencia pública y comunidad
1. Replantear portada: comunidad, garajes destacados, próximos encuentros, rutas y colaboradores.
2. Registro/login y onboarding móvil; perfiles públicos con alias y privacidad.
3. Garaje: CRUD con validación, subida de imágenes, galería, modificaciones y URL compartible; autorización por propietario.
4. Tarjetas OpenGraph de coche y compartir en Instagram/WhatsApp.
5. Carnet digital numerado, QR no adivinable y control de exposición de datos.
6. Estados vacíos, skeletons, errores, navegación y diseño responsive.

## P2 — Eventos y clubes
1. Reutilizar la gestión actual de eventos e inscripciones.
2. Cupos transaccionales, lista de espera, cancelaciones, duplicados, confirmaciones y check-in idempotente.
3. Clubes con administración por roles y separación de permisos.
4. Primera prueba en Tramassso x Santana (12/12/2026, 60 coches).

## P3 — Monetización gratuita
1. Mantener AdSense existente; validar ads.txt, slots, CMP, política de privacidad y consentimiento.
2. Añadir módulo de patrocinadores con campañas, ubicaciones, inicio/fin, creatividad, URL y métricas agregadas.
3. Etiquetar publicidad; no mezclar patrocinados con contenido orgánico sin indicación.
4. Evitar anuncios en formularios, autenticación, QR y flujos de inscripción.
5. Dashboard: usuarios activos, fichas creadas, tráfico referido, impresiones, clics y rendimiento por posición.

## Métricas de lanzamiento
- Activación: % registros con primer coche.
- Retención: usuarios activos a 7 y 30 días.
- Viralidad: visitas y registros desde fichas compartidas.
- Eventos: ratio de inscripción y asistencia.
- Ingresos: RPM real, ingresos publicitarios y patrocinadores recurrentes.

## Condiciones de entrega
- Cada cambio en PR pequeño y reversible, con pruebas.
- Migraciones aditivas; sin borrados de datos.
- Comprobar seguridad, RLS/permisos, límites de subida y anti-spam.
- No activar anuncios personalizados sin consentimiento adecuado.

## Avance de implementación (rama feat/tramassso-community-v1)
- Implementados registro y login públicos, perfiles y Garage CRUD con validación Zod y subida Cloudinary.
- Implementada portada orientada a comunidad, navegación responsive y SEO de Garage.
- Implementados directorio de clubes, creación de clubs, solicitudes y moderación exclusiva del propietario.
- Pendiente: verificación de email, antispam distribuido, QA manual, CMP, políticas legales, carnet QR, marketplace y unificación de datos de eventos.
- La primera CI (tras Garage y portada) pasó lint, typecheck, tests y build. Nueva CI requerida tras cambios de Clubs.


## Segunda iteración — Identidad e integraciones

- [x] Restauración de negro/naranja/rojo en portada, navegación, Garage, Clubes y formularios.
- [x] Inscripciones de eventos conectadas al Garage autenticado mediante un GET privado que expone solo marca, modelo y año.
- [x] Carnet digital **visual** para cada afiliación aprobada, con identificador de referencia privado (sin QR ni numeración consecutiva).
- [x] Clubes administrados y carnets visibles en el área privada del miembro.
- [x] Colaboradores destacados procedentes del panel Supabase integrados en Inicio, Garage y Clubes.
- [x] Clics salientes a colaboradores medidos en Vercel Analytics por posicion.
- [x] Página pública \`/anunciarse\` conectada al formulario de contacto existente.
- [x] Tarjeta OpenGraph dinámica de vehículos para compartir y guardar.
- [x] Editor privado de perfil (nombre público, biografía y zona).

**Validaciones automáticas:** CI GitHub Actions (\`npm run check\`, \`npm run build\`) y despliegue Preview de Vercel para cada commit.

**Pendiente para release:** pruebas E2E y accesibilidad en móvil; revisión de protección contra registros masivos en serverless (rate limiting distribuido), verificación de email, CAPTCHA opcional, mecanismo real de check-in QR, carnet consecutivo si se desea, auditoría RGPD/CMP, promoción y monitorización de producción. No confundir carnet visual con entrada verificada.
