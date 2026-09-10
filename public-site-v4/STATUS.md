# FÍBARO Public Site V4 — Production status

Estado: **PRODUCTION READY**

Fecha de cierre técnico: 2026-09-11 (Europe/Madrid)

## Producción
- Dominio: https://www.fibaroteleco.com
- Vercel project: `fibaro-direct-v1`
- Deployment validado: `dpl_Aj32KfBvpSfwPu6q6CQMSYNGwqev`
- Panel: https://fibaro-panel-v1.vercel.app
- Supabase: `fibaro-platform` (`kgcuqxzpxykqszdeonte`)
- Intake Edge Function: `submit-intake` v4

## Validaciones cerradas
- `/` responde 200.
- `/telecom` responde 200 tras corrección de routing.
- `/privacidad` responde 200.
- `/area-cliente` redirige al panel.
- `app.js`, `site.css` y `alicia.b64` se sirven con tipos MIME correctos.
- Logo original y fotografía de Alicia están integrados.
- E2E real contra `submit-intake` completado: alta de lead, intake, asignación a Alicia, SLA, permiso y evento. Los datos ficticios del E2E fueron eliminados después de la comprobación.
- Limpieza adicional: eliminado un E2E antiguo residual (`E2E FIBARO BROWSER`). No quedan leads E2E identificados.

## Backend
- `submit-intake` acepta y valida nombre, teléfono, email opcional, consentimiento, servicio, CP, zona técnica, contexto del funnel, atribución UTM, referral, factura opcional y honeypot.
- Funciones administrativas usan JWT.
- `admin-invoice-reconciler` está activo.
- Conciliador disponible en `/dashboard/conciliacion`.

## Supabase
- 1 admin activo.
- 1 perfil Alicia activo.
- 6 compañías activas.
- 75 productos activos en catálogo.
- 5 autofacturas históricas, 65 líneas y 5 conciliaciones registradas.
- Eliminado índice duplicado `services_review_idx` conservando `idx_client_services_review`.
- Security Advisor: únicamente queda `Leaked Password Protection Disabled`, no bloqueante para el despliegue actual.

## Fuente canónica
`public-site-v4/` en `main` es la fuente mantenible de la web pública. No reutilizar ramas/bundles temporales antiguos como fuente de producción.
