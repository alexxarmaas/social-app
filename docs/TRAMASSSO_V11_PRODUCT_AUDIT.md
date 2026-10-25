# Tramassso 1.1 — Auditoría de producto y plan de apertura
**Revisión:** 25/10/2026. **Repositorio:** alexxarmaas/social-app · PR #28 · rama feat/tramassso-community-v1.
**Principio:** plataforma gratuita con comunidad activa y monetización posterior por patrocinadores identificados y publicidad.

## 1. Hallazgos verificados

- **Código actual de producción:** master `3785362a`; rama v1.1 sin fusionar. Vercel Preview funcional, pero protegido contra escrituras por compartir credenciales productivas.
- **Datos existentes:** 3 usuarios, 2 clubes, 18 inscripciones (16 confirmadas, 2 nuevas) a 25/10. No borrar, reiniciar ni reemplazar.
- **Supabase:** tablas de contenido `events`, `routes`, `partners` y `event_registrations` con RLS. **22 tablas Prisma sin RLS**; se comprobaron permisos de SELECT/DELETE del rol `anon` sobre `User` y UPDATE de `authenticated` sobre `Car`. **Bloqueante P0.**
- **Migraciones:** la BD real tiene tablas Prisma preexistentes, pero no `public._prisma_migrations`. La instalación inicial no puede ejecutarse ciegamente; reconciliar baseline/estado real. Migraciones v1.1 y comentarios aún no ejecutadas en producción.
- **Registros:** verificación por email, recuperación y rate limit persistente están en código; las variables `COMMUNITY_*`/ `EVENT_TICKETING_*` no están activadas en el entorno de producción. Registro cerrado por diseño.
- **Eventos:** hasta la intervención no había eventos futuros. Creado en producción el evento informativo **Tramassso x Santana**, 12/12/2026 10:00, Cepsa P44, Vecindario, aforo 60, sin habilitar inscripciones.
- **Riesgos restantes:** políticas RGPD incompletas (responsable/plazos/proveedores), mecanismo de eliminación completa de cuenta pendiente, consentimiento publicitario/CMP por verificar; subida de fotos sin moderación específica de matrículas/rostros, SMTP sin cola de reintentos y tokens JWT que pueden sobrevivir al reset hasta caducidad.

## 2. Inventario de funciones

| Dominio | En código | Activación / tareas faltantes |
| --- | --- | --- |
| Portada móvil, rutas, eventos, colaboradores | Sí | QA real, fechas y contenidos nuevos |
| Registro, login, email verificado, reset | Sí | Migración Prisma, SMTP, flags, pruebas reales |
| Garage y álbum de coches | Sí | Migración de CarPhoto, Cloudinary y moderación |
| Buscador de coches y miembros | Sí | Evaluar rendimiento al crecer e indexación |
| Área personal «Mi Tramassso» | Sí | Lanzar tras comprobar auth y backend |
| Clubes, solicitudes, carnets visuales | Sí | Moderación de clubes; carnet no acredita entrada |
| Feed, likes, follows, reportes | Sí | Flag social, revisores y política de comunidad |
| Conversaciones y comentarios moderados | Sí | Migración `20261025170000_moderated_post_comments` |
| Notificaciones en la web | Sí | Flag social, probar follow/like/comment, sin push |
| Entradas QR, espera FIFO y check-in | Sí | Migración Supabase, ensayo de carga, activar flag |
| Contacto y patrocinadores existentes | Sí | Atribución, oferta comercial, contrato y reportes |
| AdSense | Parcial | CMP europea, verificación de slots e ingresos reales |
| Marketplace, tiendas, mensajes privados | Solo modelos Prisma | No son MVP funcional. Diferir por fraude, soporte y moderación |
| PWA, push y aplicación móvil | No son producto operativo | Diferir hasta tracción web y garantías de privacidad |

## 3. Cambios de esta auditoría

1. Directorio público de miembros con al menos un vehículo y búsqueda por alias/marca/modelo.
2. Sitemap dinámico de coches, clubes, miembros, eventos y publicaciones aprobadas; previews excluidas de robots.
3. Nuevo panel «Mi Tramassso» con primeros pasos, navegación unificada y accesos directos.
4. Vista `/admin/lanzamiento`: conteos agregados, flags, alertas de permisos/migraciones.
5. UX de registro cerrado: deja de anunciar una cuenta que devolvería error 503; `/empezar` permite explorar sin login.
6. Notificaciones privadas por likes/seguidores y comentarios aprobados; cola local en BD, sin email.
7. Conversaciones públicas con comentario pendiente de moderación, API de publicación y revisión del staff.
9. Muro segmentado entre publicaciones recientes y perfiles seguidos.
10. Eventos analíticos de registro, primera publicación de coche, clubes, follows, posts y solicitudes de eventos, sin correo, matrícula ni ID de usuario.
8. Evento de diciembre publicado en la web oficial en modo informativo sin registrar participantes.
9. Panel de lanzamiento para responsables (`/admin/lanzamiento`) con recuentos y alertas.
10. Instrumentación con Vercel Analytics de conversiones y acciones principales, sin datos personales.

## 4. Puerta de lanzamiento: validación imprescindible

**P0 seguridad y datos:**
- Supabase Advisor confirmó 22 errores de RLS desactivado en `public`; además 25 claves foráneas sin índice (optimización secundaria), 5 índices sin uso y 2 advertencias por políticas permisivas. Enlace de referencia: https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public.
- Verificar un backup **restaurable** y plan de reversión de Vercel.
- Revisar/autorizar `supabase/migrations/20261025_isolate_prisma_api.sql` para cerrar el acceso directo anon/auth a tablas privadas. No aplicarlo automáticamente sin validar permisos y relaciones.
- Reconciliar el historial Prisma antes de `prisma migrate deploy`; no reinstalar baseline.
- Revisar y aplicar migraciones v1.1, SQL de tickets y comentarios; verificar RLS y privilegios RPC.
- Confirmar `NEXTAUTH_URL`, SMTP, Cloudinary y secretos *en producción* sin mostrarlos.
- Completar privacidad, términos, derechos de usuarios y consentimiento de anuncios.

**P1 aceptación funcional:**
- Registro → correo → verificación → inicio → coche con foto → perfil público compartido.
- Clubs: solicitud/aceptación/rechazo, carnet visual y restricciones de propietario.
- Feed → moderación → comentario → notificación → reporte → ocultar.
- Evento 60 coches: simular 100 solicitudes concurrentes; confirmar 60 máximo, lista de espera FIFO, duplicados, cancelación, promoción, QR usado/reutilizado, roles.
- Recuperar login de cuentas legadas, rollback ante error, móvil iOS/Android, SEO, accesibilidad y errores 500.
- Activar flags en orden: seguridad, verificación, registro, eventos, social, galería. Redesplegar tras cambiar `NEXT_PUBLIC_*`.

## 5. Plan para ganar fuerza (metas, no métricas actuales)

**Semana 1 — Beta con 10–20 participantes voluntarios.** Reclutar desde Instagram existente; publicar 1–2 proyectos auténticos diarios y revisar cada moderación. Medir registros, % con primer coche, errores de subida y URLs compartidas.

**Semana 2 — Activación social y evento.** Promocionar Tramassso x Santana con enlace propio al evento; abrir inscripciones solo después de QA de aforo y check-in. Lanzar dinámica «enseña tu coche» y destacados semanales con permiso del propietario.

**Primer mes — Retención/SEO.** Registrar usuarios activos D7/D30, páginas vistas por coche, altas por canal UTM y clics de patrocinadores. Priorizar imágenes reales, títulos claros, enlaces compartibles, rutas y calendario actualizado.

**Publicidad:** medir tráfico antes de estimar ingresos. Empezar con 1–2 patrocinios locales claramente identificados; no colocar anuncios en formularios, QR ni acciones sensibles. No activar anuncios personalizados sin mecanismo de consentimiento adecuado.

## 6. Criterio de terminado

No etiquetar «listo para producción» hasta que P0 y P1 se validen con evidencias. CI verde solo prueba compilación, contratos y lógica aislada. El desarrollo queda en PR borrador hasta entonces.

## 7. Estado final de auditoría
- Última revisión: 25/10/2026. Publicación del evento piloto: https://www.tramassso.com/events/4c300fbd-bfaa-4a2a-a119-175a40409cd7
- URL oficial todavía sirve la versión de `master`; rama de comunidad pendiente de publicación completa.
- No confundir CI y Preview READY con tests E2E: no se han probado todavía registros ni check-in en producción.
- Próximo paso **obligatorio**: autorización y ejecución controlada del aislamiento de tablas privadas de Prisma, conciliación del historial de migraciones y backup verificable antes de abrir inscripciones o cuentas.
