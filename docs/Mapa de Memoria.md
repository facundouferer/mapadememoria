
# Construir sitio estático en Astro con mapa OpenStreetMap de Centros Clandestinos de Detención a partir del PDF RUVTE 2022

Quiero que implementes esta issue completa.  
Tenés que construir un sitio en Astro, estático, sin backend, usando OpenStreetMap para mostrar en un mapa todos los Centros Clandestinos de Detención del PDF adjunto.  
Debés extraer, normalizar y estructurar los datos del PDF dentro del proyecto, georreferenciarlos con niveles de precisión, crear páginas individuales por centro, filtros, búsqueda y documentación metodológica.  
No simplifiques el alcance. Priorizá trazabilidad, claridad de datos y reproducibilidad del proceso de extracción.

## Objetivo

Construir un sitio web **100% estático**, sin backend, usando **Astro**, que permita:

1. visualizar en un **mapa basado en OpenStreetMap** todos los Centros Clandestinos de Detención (CCD) y otros lugares de reclusión ilegal relevados en el PDF adjunto;
2. navegar la información por **zona, subzona, área, provincia, partido/departamento y localidad**;
3. consultar la ficha completa de cada lugar;
4. filtrar, buscar y explorar los datos desde el mapa y desde listados;
5. mantener **todos los datos dentro del proyecto**, sin base de datos externa ni APIs de servidor.

El PDF fuente es el listado del **Registro Unificado de Víctimas del Terrorismo de Estado (RUVTE)**, actualización mayo 2022, e indica que reúne **807 lugares identificados**. El material está organizado por **zona operativa, subzonas y áreas**, y ordenado por **provincia y partido/departamento**. :contentReference[oaicite:1]{index=1}

---

## Resultado esperado

Entregar un proyecto funcional que:

- corra localmente con `npm install` + `npm run dev`;
- genere un sitio estático con `npm run build`;
- no requiera backend, base de datos ni servicios propios;
- lea sus datos desde archivos del repo;
- muestre un mapa interactivo con marcadores;
- tenga páginas de detalle por centro;
- preserve la mayor cantidad posible de información del PDF;
- documente claramente los supuestos y limitaciones, especialmente cuando una dirección no permita geolocalización exacta.

---

## Restricciones técnicas obligatorias

- **Framework principal:** Astro
- **Mapa:** biblioteca cliente compatible con **OpenStreetMap**
  - preferencia: **Leaflet** + tiles OSM
  - alternativa aceptable: **MapLibre GL JS** con fuente raster/vector libre compatible con OSM
- **Sin backend**
- **Sin base de datos**
- **Sin panel de administración**
- **Todos los datos deben vivir dentro del repo**
- El sitio debe poder desplegarse como **estático**
- El dataset debe quedar versionado en archivos de texto estructurados
- No depender de una API propia para servir ni enriquecer datos
- Se permite usar scripts locales de build/normalización si corren en Node durante desarrollo

---

## Entrada principal

El archivo PDF adjunto contiene el listado de los centros/lugares.

### Observaciones sobre la fuente

El PDF no es una tabla limpia; es un listado textual semiestructurado. Aun así, cada entrada suele contener:

- nombre principal del centro/lugar
- dirección o referencia de ubicación
- localidad / partido / provincia
- tipo de dependencia o establecimiento
- cantidad de testimonios
- ID RUVTE
- alias o nombres alternativos
- notas históricas o espaciales
- información de señalización y/o espacio de memoria
- pertenencia jerárquica a zona / subzona / área

Por ejemplo, el PDF presenta la jerarquía territorial-operativa con encabezados como **Zona 1**, **Subzona CF**, **Área I**, etc., y luego lista los lugares correspondientes. :contentReference[oaicite:2]{index=2}  
En páginas tempranas se observan registros con campos repetidos como dirección, dependencia, testimonios e ID RUVTE; por ejemplo para CABA aparecen entradas como comisarías, ESMA, Olimpo, Club Atlético, Automotores Orletti, etc. :contentReference[oaicite:3]{index=3}

---

## Alcance funcional

### 1. Home
La home debe introducir el proyecto y ofrecer dos accesos principales:

- explorar en mapa
- explorar en listado

Debe incluir:
- título del proyecto
- breve texto contextual
- fuente de datos
- nota metodológica sobre georreferenciación
- enlace al mapa
- enlace a listados/filtros

### 2. Vista de mapa
La vista principal del mapa debe:

- mostrar todos los centros con marcador cuando haya coordenadas;
- permitir zoom y paneo;
- abrir un popup o tarjeta breve con:
  - nombre
  - localidad / provincia
  - zona / subzona / área
  - tipo de lugar
  - enlace a ficha completa
- permitir filtros en cliente;
- permitir buscar por texto;
- manejar agrupación de marcadores si la densidad es alta.

### 3. Ficha individual por centro
Cada centro debe tener una URL propia, por ejemplo:

`/centros/esma`
`/centros/pozo-de-banfield`

La ficha debe mostrar, cuando exista:

- nombre
- alias
- ID RUVTE
- zona / subzona / área
- provincia
- partido/departamento
- localidad
- dirección
- coordenadas
- precisión geográfica
- tipo de lugar
- dependencia
- testimonios
- notas descriptivas
- estado de memoria / señalización / espacio de memoria
- fuente original
- advertencias sobre dirección incierta o ubicación aproximada
- link para volver al mapa filtrado si es posible

### 4. Listados navegables
Debe existir navegación adicional por:

- provincia
- zona
- subzona
- área
- tipo de lugar
- estado de señalización / espacio de memoria

### 5. Búsqueda
Agregar una búsqueda cliente por texto que contemple:

- nombre principal
- alias
- dirección
- localidad
- provincia
- partido/departamento
- ID RUVTE

### 6. Filtros
Los filtros mínimos deben ser:

- provincia
- zona
- subzona
- área
- tipo de lugar
- dependencia
- con/sin coordenadas
- con/sin señalización
- con/sin espacio de memoria

### 7. Leyenda y metodología
Debe haber una sección visible que explique:

- que el mapa se construye a partir del PDF fuente;
- que algunas ubicaciones son exactas y otras aproximadas;
- que algunas entradas no tienen dirección suficientemente precisa;
- qué significa cada nivel de precisión geográfica;
- qué datos fueron inferidos y cuáles provienen textual/directamente del PDF.

---

## Modelo de datos requerido

Crear un esquema de datos explícito y estable.  
Cada centro debe existir como un registro independiente.

### Formato recomendado
Usar **Markdown con frontmatter** o **JSON/YAML** dentro de `src/content` o `src/data`.

La recomendación principal es:

- `src/content/centros/*.md` para un archivo por centro, o
- `src/data/centros.json` si la IA considera que el parser del PDF produce mejor un JSON maestro

### Recomendación preferida
Usar **un archivo por centro** para facilitar mantenimiento, páginas individuales y edición manual posterior.

---

## Esquema mínimo por centro

Definir este esquema o uno equivalente:

```yaml
id: "ruvte-3"
id_ruvte: 3
slug: "escuela-de-mecanica-de-la-armada-esma"
nombre: "Escuela de Mecánica de la Armada (ESMA)"
alias:
  - "ESMA"
  - "SELENIO"

zona:
  codigo: "1"
  nombre: "Zona 1"

subzona:
  codigo: "CF"
  nombre: "Subzona CF"

area:
  codigo: "IIIA"
  nombre: "Área IIIA"

ubicacion:
  provincia: "Capital Federal"
  partido_departamento: "Capital Federal"
  localidad: "Capital Federal"
  direccion: "Av. del Libertador 8151"
  referencia: "Predio entre Av. del Libertador, Av. Lugones, Calzadilla y Comodoro Rivadavia"

geografia:
  lat: null
  lng: null
  precision: "pendiente"
  fuente_geocodificacion: null

clasificacion:
  tipo_lugar: "Unidad Militar"
  dependencia: "Marina"

testimonios: 0

memoria:
  espacio_memoria:
    es: true
    creado: 2004
    inaugurado: 2007
  senializaciones:
    - fecha: "2014-03-24"
      tipo: "pilares"

notas:
  - "Registro extraído del PDF RUVTE 2022"
  - "Coordenadas pendientes de georreferenciación"

fuente:
  documento: "ruvte2022_anm_nomina_ccd_con_mapas_de_zonas_mayo_2022.pdf"
  pagina_pdf: 5
  texto_fuente: "fragmento o resumen normalizado"
````

---

## Campos obligatorios

Estos campos deben existir siempre, aunque algunos puedan tener valor `null`:

- `id`
    
- `id_ruvte` si existe en el PDF
    
- `slug`
    
- `nombre`
    
- `alias` (puede ser array vacío)
    
- `zona.codigo`
    
- `subzona.codigo`
    
- `area.codigo`
    
- `ubicacion.provincia`
    
- `ubicacion.partido_departamento`
    
- `ubicacion.localidad`
    
- `ubicacion.direccion`
    
- `ubicacion.referencia`
    
- `geografia.lat`
    
- `geografia.lng`
    
- `geografia.precision`
    
- `clasificacion.tipo_lugar`
    
- `clasificacion.dependencia`
    
- `testimonios`
    
- `memoria`
    
- `fuente.documento`
    
- `fuente.pagina_pdf`
    

---

## Campo clave: precisión geográfica

Agregar un campo obligatorio `geografia.precision` con valores controlados:

- `exacta`
    
- `aproximada`
    
- `solo_localidad`
    
- `sin_coordenadas`
    
- `a_revisar`
    

### Criterios

- `exacta`: dirección clara y coordenada puntual confiable
    
- `aproximada`: ubicación inferida por cruce de calles, predio o referencia
    
- `solo_localidad`: solo se pudo ubicar ciudad/localidad
    
- `sin_coordenadas`: no hay base suficiente
    
- `a_revisar`: extracción ambigua o conflicto de fuentes
    

Esto es importante porque el PDF contiene entradas con direcciones exactas, otras con referencias entre calles y otras marcadas como “sin determinar ubicación” o equivalentes.

---

## Estrategia de extracción desde el PDF

La IA debe implementar un proceso reproducible para transformar el PDF en datos estructurados.

### Objetivo de extracción

Detectar y normalizar:

1. encabezados de zona
    
2. encabezados de subzona
    
3. encabezados de área
    
4. provincia / partido / departamento
    
5. registros individuales de centros
    
6. atributos de cada centro
    

### Comportamiento esperado del parser

La IA debe leer el PDF y construir una estructura jerárquica de contexto:

- al encontrar `Zona X`, actualizar `zona_actual`
    
- al encontrar `Subzona Y`, actualizar `subzona_actual`
    
- al encontrar `Area Z`, actualizar `area_actual`
    
- al encontrar `provincia de ...` o `partido de ...`, actualizar contexto territorial
    
- cada bloque de líneas posteriores hasta el próximo registro debe agruparse como una entrada
    

### Señales textuales útiles del PDF

La IA debe detectar patrones como:

- `ID RUVTE ####`
    
- `0 testimonio/s`
    
- tipos institucionales:
    
    - `DEPENDENCIA POLICIA FEDERAL`
        
    - `DEPENDENCIA POLICIA PROVINCIAL`
        
    - `UNIDAD MILITAR EJERCITO`
        
    - `UNIDAD MILITAR MARINA`
        
    - `UNIDAD PENITENCIARIA`
        
    - `HOSPITAL MILITAR`
        
    - etc.
        
- líneas de señalización:
    
    - `Sitio señalizado el ...`
        
    - `ESPACIO DE MEMORIA creado en ...`
        

En las páginas visibles del PDF estos patrones aparecen repetidamente en múltiples registros.

### Requisitos del parser

- no perder el contexto de zona/subzona/área;
    
- no mezclar un centro con el siguiente;
    
- soportar variantes tipográficas;
    
- soportar líneas partidas;
    
- conservar texto no estructurable en `notas` o `fuente.texto_fuente`;
    
- registrar página de origen si se puede;
    
- generar logs de registros dudosos.
    

---

## Georreferenciación

El PDF no provee coordenadas geográficas explícitas; en general contiene direcciones o referencias de ubicación, por lo que la IA debe georreferenciar los registros. Esto debe tratarse como una etapa separada del parseo textual.

### Requisitos de georreferenciación

1. Intentar obtener lat/lng a partir de:
    
    - dirección completa
        
    - cruce de calles
        
    - predio y localidad
        
    - localidad/provincia como fallback
        
2. Guardar siempre:
    
    - lat
        
    - lng
        
    - nivel de precisión
        
    - texto original usado para geocodificar
        
    - observaciones
        
3. No inventar exactitud.  
    Si la dirección es ambigua, asignar `aproximada`, `solo_localidad` o `sin_coordenadas`.
    
4. Mantener el dato original del PDF aunque la geocodificación falle.
    

### Sugerencia

La IA puede crear un script local tipo:

- `scripts/extract-pdf.ts`
    
- `scripts/geocode-centros.ts`
    
- `scripts/validate-data.ts`
    

Si usa un geocoder durante el proceso de preparación de datos, el resultado final debe quedar guardado en el repo para que el sitio ya no dependa de ese servicio al ejecutarse.

---

## Estructura de carpetas deseada

La IA debe proponer e implementar una estructura similar a esta:

```text
/
├─ public/
│  └─ icons/
├─ scripts/
│  ├─ extract-pdf.ts
│  ├─ normalize-centros.ts
│  ├─ geocode-centros.ts
│  └─ validate-centros.ts
├─ src/
│  ├─ components/
│  │  ├─ MapView.astro
│  │  ├─ CentroPopup.astro
│  │  ├─ CentroCard.astro
│  │  ├─ FiltersPanel.astro
│  │  ├─ SearchBox.astro
│  │  └─ Legend.astro
│  ├─ content/
│  │  └─ centros/
│  │     ├─ escuela-de-mecanica-de-la-armada-esma.md
│  │     ├─ club-atletico.md
│  │     ├─ automotores-orletti.md
│  │     └─ ...
│  ├─ data/
│  │  ├─ provincias.json
│  │  ├─ zonas.json
│  │  └─ stats.json
│  ├─ layouts/
│  │  └─ BaseLayout.astro
│  ├─ lib/
│  │  ├─ content.ts
│  │  ├─ filters.ts
│  │  ├─ map.ts
│  │  └─ seo.ts
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ mapa.astro
│  │  ├─ centros/
│  │  │  ├─ index.astro
│  │  │  └─ [slug].astro
│  │  ├─ provincias/
│  │  │  └─ [provincia].astro
│  │  ├─ zonas/
│  │  │  └─ [zona].astro
│  │  └─ metodologia.astro
│  └─ styles/
│     └─ global.css
├─ package.json
├─ README.md
└─ astro.config.mjs
```

---

## Requisitos de UI/UX

### Mapa

- usar OpenStreetMap como base;
    
- mostrar marcadores diferenciados, idealmente por:
    
    - tipo de lugar, o
        
    - precisión geográfica, o
        
    - condición de espacio de memoria
        
- soportar clustering si hay muchos puntos cercanos;
    
- popup accesible y legible;
    
- botón para resetear vista;
    
- ajuste inicial para mostrar Argentina completa.
    

### Panel lateral o superior

Debe existir un panel de filtros con:

- búsqueda de texto
    
- provincia
    
- zona
    
- subzona
    
- área
    
- tipo de lugar
    
- dependencia
    
- precisión geográfica
    
- con/sin ficha de memoria
    

### Fichas

Cada ficha debe incluir:

- breadcrumb
    
- resumen del lugar
    
- mapa pequeño o enlace al mapa principal
    
- metadatos en bloque ordenado
    
- nota de precisión geográfica
    
- fuente
    

### Accesibilidad

- controles navegables por teclado
    
- contraste adecuado
    
- texto alternativo donde corresponda
    
- no depender solo del color para codificación visual
    

---

## Requisitos de SEO y contenido

- título y descripción por página
    
- páginas estáticas indexables
    
- enlaces internos entre mapa, provincias, zonas y fichas
    
- metadata básica Open Graph
    
- página “Metodología”
    
- página “Fuentes”
    

---

## Requisitos de performance

- build estático liviano;
    
- no cargar todo el mapa antes de tiempo si puede evitarse;
    
- lazy load del componente de mapa;
    
- serialización eficiente de datos;
    
- si el dataset completo es grande, evaluar:
    
    - JSON resumido para mapa
        
    - contenido completo en páginas de detalle
        

### Recomendación de optimización

Generar dos salidas de datos:

1. **dataset liviano para el mapa**
    
    - id
        
    - slug
        
    - nombre
        
    - lat
        
    - lng
        
    - provincia
        
    - zona
        
    - subzona
        
    - area
        
    - tipo_lugar
        
    - precision
        
2. **dataset completo**
    
    - usado para fichas individuales
        

---

## Requisitos de calidad de datos

La IA debe validar los datos generados.

### Validaciones mínimas

- no duplicar `id_ruvte`
    
- no duplicar `slug`
    
- toda entrada debe tener `nombre`
    
- toda entrada debe heredar `zona/subzona/area`
    
- `lat/lng` deben ser numéricos o null
    
- `precision` debe ser uno de los valores permitidos
    
- registrar cantidad total de centros procesados
    
- informar cuántos tienen coordenadas exactas/aproximadas/sin coordenadas
    

### Reporte requerido

Generar un reporte final, por ejemplo en `README.md` o `data/stats.json`, que indique:

- total de registros extraídos
    
- total con coordenadas
    
- total sin coordenadas
    
- total con georreferenciación exacta
    
- total con georreferenciación aproximada
    
- total con ubicación solo por localidad
    
- total con espacio de memoria
    
- total con señalización
    

---

## Páginas mínimas a implementar

1. `/`
    
2. `/mapa`
    
3. `/centros`
    
4. `/centros/[slug]`
    
5. `/provincias/[provincia]`
    
6. `/zonas/[zona]`
    
7. `/metodologia`
    
8. `/fuentes`
    

---

## Comportamiento esperado del mapa

### En `/mapa`

- cargar todos los puntos disponibles;
    
- permitir filtrar sin recargar página;
    
- actualizar lista de resultados visible según filtros;
    
- al hacer click en un resultado, centrar marcador;
    
- al hacer click en marcador, abrir popup;
    
- permitir compartir URL con filtros básicos si es posible.
    

### Extras deseables

- hash o query params para filtros
    
- ajuste automático de bounds según resultados filtrados
    
- contador de resultados visibles
    
- botón “ver ficha completa”
    

---

## Contenido de la página de metodología

La IA debe crear una página que explique:

- de dónde sale la información;
    
- cómo se extrajo del PDF;
    
- qué campos fueron estructurados;
    
- cómo se realizó la georreferenciación;
    
- qué significan los niveles de precisión;
    
- limitaciones del dataset;
    
- aclaración de que ausencia de coordenadas exactas no implica ausencia de registro, sino limitación de la fuente o de la geocodificación.
    

---

## Requisitos de documentación técnica

El proyecto debe incluir un `README.md` con:

- descripción
    
- stack usado
    
- cómo instalar
    
- cómo ejecutar
    
- cómo reconstruir datos desde el PDF
    
- cómo correr validaciones
    
- cómo buildar
    
- limitaciones
    
- estructura del dataset
    
- decisión técnica del mapa elegido
    

---

## Entregables esperados

La IA debe entregar:

1. proyecto Astro completo;
    
2. componente de mapa funcionando con OpenStreetMap;
    
3. dataset estructurado dentro del proyecto;
    
4. script o proceso para reconstruir el dataset desde el PDF;
    
5. páginas individuales por centro;
    
6. listados navegables;
    
7. documentación técnica;
    
8. metodología y fuentes.
    

---

## Criterios de aceptación

### Aceptación funcional

-  El proyecto corre localmente sin backend
    
-  Existe una página de mapa con OSM
    
-  Los centros del PDF están cargados en el sitio
    
-  Cada centro tiene una ficha individual
    
-  Existen filtros por provincia, zona, subzona y área
    
-  Existe búsqueda textual
    
-  El sitio builda en modo estático
    

### Aceptación de datos

-  La extracción del PDF conserva la estructura zona/subzona/área
    
-  Cada centro tiene un identificador estable
    
-  Se conserva el ID RUVTE cuando exista
    
-  Se guarda la fuente/página o referencia de origen
    
-  La georreferenciación declara nivel de precisión
    
-  Los registros ambiguos no se presentan como exactos
    

### Aceptación de UX

-  El mapa es usable en desktop
    
-  El mapa es usable en mobile
    
-  Los popups son legibles
    
-  Las fichas tienen navegación clara
    
-  Hay explicación metodológica visible
    

### Aceptación de mantenimiento

-  Los datos quedan versionados en el repo
    
-  Existe script de regeneración del dataset
    
-  Existe validación de consistencia
    
-  La estructura es fácil de ampliar o corregir manualmente
    

---

## Notas importantes para la IA implementadora

1. **No asumir que el PDF es una tabla limpia.**  
    Tratarlo como fuente semiestructurada y diseñar extracción resiliente.
    
2. **No inventar coordenadas exactas.**  
    Si la fuente no permite precisión, usar una clasificación honesta.
    
3. **Conservar el texto original útil.**  
    Aunque haya una normalización, guardar notas o fragmentos fuente cuando ayuden a auditoría.
    
4. **Separar extracción, normalización y visualización.**  
    No mezclar toda la lógica en un único script.
    
5. **Priorizar claridad histórica y trazabilidad.**  
    Este proyecto no es solo técnico; la trazabilidad de los datos es central.
    
6. **Todo debe quedar dentro del repo final.**  
    Incluso si se usan herramientas externas durante preparación, el resultado final no debe depender de ellas para funcionar.
    

---

## Sugerencia de implementación por fases

### Fase 1

- bootstrap de Astro
    
- mapa base con OSM
    
- esquema de datos
    
- parser inicial del PDF
    

### Fase 2

- normalización de registros
    
- generación de slugs
    
- listados y páginas individuales
    

### Fase 3

- georreferenciación
    
- precisión geográfica
    
- clustering y filtros del mapa
    

### Fase 4

- metodología
    
- validaciones
    
- README y pulido final
    

---

## Ejemplos de registros que deben poder visualizarse

Tomar como referencia del PDF registros como:

- Escuela de Mecánica de la Armada (ESMA)
    
- Olimpo
    
- Club Atlético
    
- Automotores Orletti
    
- Pozo de Quilmes
    
- Pozo de Banfield
    

Estos aparecen en las páginas visibles del documento junto con dirección, dependencia, ID RUVTE y notas de memoria/señalización.

---

## Definición de “terminado”

Se considera terminado cuando exista un sitio Astro estático navegable con mapa OSM, datos integrados desde el PDF, páginas individuales para los centros, filtros funcionales, georreferenciación documentada y documentación suficiente para reconstruir o corregir el dataset sin backend.