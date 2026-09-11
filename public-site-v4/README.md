# FÍBARO Public Site V4

Fuente canónica de la web pública de FÍBARO desplegada en `fibaroteleco.com`.

## Producción
- Dominio: `https://www.fibaroteleco.com`
- Proyecto Vercel: `fibaro-direct-v1`
- Captación: Supabase Edge Function `submit-intake`
- Panel: `https://fibaro-panel-v1.vercel.app`
- WhatsApp: `+34 633 671 657`

## Despliegue
El proyecto Vercel `fibaro-direct-v1` está conectado al repositorio GitHub `internobras/fibaro-app` con **Root Directory** = `public-site-v4`.

La rama canónica de producción es `main`. Los cambios de esta carpeta deben desplegarse automáticamente desde Git y no depender de despliegues manuales.

Última verificación operativa del vínculo Git→Vercel: 2026-09-11.

## Activos de marca
Los logos siguen fijados a la revisión `9cc3f7a1a0887337a9cc612a27dad401721e344d` para evitar cambios accidentales. La fotografía de Alicia está incluida en esta propia carpeta como `alicia.b64`, por lo que el bundle público ya no necesita una reescritura externa para cargarla.

## Criterios funcionales
- Telecomunicaciones como eje principal; energía como línea secundaria.
- FÍBARO es canal comercial y de asesoramiento, no operadora de red.
- Alicia recibe contexto, atribución y consentimiento antes del contacto.
- Sin gas en el flujo comercial.
- Formularios con validación, honeypot, timeout, atribución UTM, referral, anonymous_id y soporte de factura en energía.
- Rutas públicas, legales y SEO servidas desde la misma aplicación estática.
