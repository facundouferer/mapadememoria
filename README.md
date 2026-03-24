# Mapa de Memoria

Sitio estatico en Astro para explorar centros clandestinos de detencion y otros lugares de reclusion ilegal relevados en el PDF RUVTE 2022.

## Requisitos

- Node.js >= 22.12.0
- npm

## Instalacion y desarrollo

```sh
npm install
npm run dev
```

## Rutas principales

- `/` inicio con acceso a mapa, listados y navegacion territorial
- `/mapa` explorador con OpenStreetMap + Leaflet, filtros y busqueda
- `/centros` listado completo con filtros y busqueda textual
- `/centros/[slug]` ficha detallada con trazabilidad a fuente
- `/provincias/[provincia]` centros por provincia + accesos a vistas filtradas
- `/zonas/[zona]` centros por zona + accesos a vistas filtradas
- `/metodologia` alcance, precision y limitaciones
- `/fuentes` documentos y archivos de datos del repo

## Datos y reproducibilidad

El sitio usa solo archivos versionados del repositorio:

- `src/data/centros.json` dataset principal normalizado
- `src/data/mapa-centros.json` proyeccion simplificada para mapa
- `src/data/stats.json` indicadores generales
- `docs/ruvte2022_anm_nomina_ccd_con_mapas_de_zonas_mayo_2022.pdf` fuente documental

Scripts del pipeline local:

```sh
npm run extract:pdf
npm run normalize:data
npm run geocode:data
npm run validate:data
npm run data:rebuild
```

## Validacion liviana

```sh
npm run astro -- check
```

No hay runner de tests configurado por ahora.

## Deploy en GitHub Pages

Este repo esta configurado como project page `facundouferer/mapadememoria`:

- `site`: `https://facundouferer.github.io`
- `base`: `/mapadememoria`
- Workflow: `.github/workflows/deploy.yml` (build con `withastro/action` + deploy con `actions/deploy-pages`)

Settings esperados en GitHub:

1. En `Settings > Pages`, seleccionar `Source: GitHub Actions`.
2. Mantener la rama `main` como rama de trabajo del repositorio.
3. Verificar que el workflow `Deploy to GitHub Pages` tenga permisos de Pages habilitados.

## Alcance y limitaciones

- Sitio 100% estatico, sin backend y sin base de datos externa.
- El universo de referencia declara 807 registros y el dataset actual contiene 807.
- La precision geografica se muestra explicitamente (exacta, aproximada, solo localidad, sin coordenadas, a revisar).
