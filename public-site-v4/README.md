# FÍBARO Public Site V4

Fuente canónica de la web pública de FÍBARO.

## Producción

- Web: https://www.fibaroteleco.com
- Área cliente / panel: https://panel.fibaroteleco.com
- Vercel web: `fibaro-direct-v1`
- Vercel panel: `fibaro-panel-v1`
- Rama de producción: `main`
- Root Directory en Vercel: `public-site-v4`

## Despliegue

El proyecto `fibaro-direct-v1` está conectado a `internobras/fibaro-app`. Los commits en `main` que afecten a `public-site-v4` generan despliegues de producción automáticos.

`/area-cliente` redirige al dominio definitivo del panel.

## Backend

El formulario y los eventos públicos se integran con Supabase `fibaro-platform` mediante la función `submit-intake`.

## Activos

Los activos críticos de la web deben permanecer versionados y reproducibles. No se debe depender de un despliegue manual como fuente única de verdad.
