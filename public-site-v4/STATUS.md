# FÍBARO Public Site V4 — estado

Estado operativo: producción.

## Producción

- Web pública: https://www.fibaroteleco.com
- Panel / área privada: https://panel.fibaroteleco.com
- Proyecto Vercel web: `fibaro-direct-v1`
- Proyecto Vercel panel: `fibaro-panel-v1`
- Fuente canónica web: `internobras/fibaro-app/public-site-v4`
- Rama de producción: `main`

## Integraciones

- GitHub → Vercel: despliegue automático activo desde `main`.
- Captación pública → Supabase `fibaro-platform`: activa.
- Panel operativo y conciliador DIGO: producción.
- Dominio `panel.fibaroteleco.com`: configurado para el panel de producción.
- `/area-cliente` redirige al dominio definitivo del panel.

## Cierre

La web pública y el panel tienen dominios definitivos, despliegue reproducible desde Git y conexión operativa con Supabase. Las pruebas E2E temporales se limpian después de validación y no deben conservarse como datos reales.
