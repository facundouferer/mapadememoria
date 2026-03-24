import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const dataPath = resolve(ROOT, 'src/data/centros.json');
const mapPath = resolve(ROOT, 'src/data/mapa-centros.json');
const statsPath = resolve(ROOT, 'src/data/stats.json');

const MANUAL_COORDS = {
  1: [-34.6423, -58.4755],
  2: [-31.3864, -64.3649],
  3: [-34.5389, -58.4636],
  4: [-24.7958, -65.424],
  5: [-34.7158, -58.4619],
  6: [-32.8733, -68.8536],
  9: [-34.9429, -58.1028],
  31: [-34.7051, -58.5114],
  33: [-34.6818, -58.5586],
  35: [-34.5961, -58.6352],
  40: [-27.4516, -58.9868],
  41: [-34.6606, -58.6423],
  42: [-34.7219, -58.3972],
  44: [-34.7108, -58.2741],
  50: [-34.6225, -58.3873],
  54: [-27.0552, -65.4099],
  78: [-34.9376, -58.0924],
  94: [-32.9643, -60.6873],
  157: [-38.6942, -62.2568],
  165: [-27.0543, -65.4094],
  187: [-31.388, -64.3675],
  196: [-34.6251, -58.4959],
  205: [-34.7107, -58.2809],
  243: [-34.7808, -58.5206],
  246: [-34.6952, -58.5095],
  302: [-34.6469, -58.6628],
  387: [-34.8457, -58.4778],
  710: [-34.6239, -68.3403],
  1077: [-38.9527, -69.2303],
};

const centros = JSON.parse(await readFile(dataPath, 'utf8'));
let existingStats = null;

try {
  existingStats = JSON.parse(await readFile(statsPath, 'utf8'));
} catch {
  existingStats = null;
}

for (const centro of centros) {
  const manual = MANUAL_COORDS[centro.id_ruvte];
  if (manual) {
    centro.geografia = {
      lat: manual[0],
      lng: manual[1],
      precision: 'aproximada',
      fuente_geocodificacion: 'Curado manual interno',
      texto_geocodificacion: centro.ubicacion?.texto_ubicacion_original ?? null,
      observaciones: 'Coordenada aproximada obtenida con cartografia publica.',
    };
    continue;
  }

  const text = `${centro.ubicacion?.texto_ubicacion_original ?? ''} ${centro.fuente?.texto_fuente ?? ''}`;
  if (/SIN DETERMINAR|SIN IDENTIFICAR|a corroborar/i.test(text)) {
    centro.geografia.precision = 'a_revisar';
  } else {
    centro.geografia.precision = 'sin_coordenadas';
  }
}

const mapRecords = centros.map((record) => ({
  id: record.id,
  id_ruvte: record.id_ruvte,
  slug: record.slug,
  nombre: record.nombre,
  lat: record.geografia.lat,
  lng: record.geografia.lng,
  provincia: record.ubicacion.provincia,
  zona: record.zona.codigo,
  subzona: record.subzona.codigo,
  area: record.area.codigo,
  tipo_lugar: record.clasificacion.tipo_lugar,
  dependencia: record.clasificacion.dependencia,
  precision: record.geografia.precision,
  espacio_memoria: record.memoria.espacio_memoria.es,
  senializado: record.memoria.senializaciones.length > 0,
}));

const precision = {
  exacta: 0,
  aproximada: 0,
  solo_localidad: 0,
  sin_coordenadas: 0,
  a_revisar: 0,
};

for (const centro of centros) {
  precision[centro.geografia.precision] += 1;
}

const stats = {
  total_registros: centros.length,
  total_con_coordenadas: centros.filter((c) => c.geografia.lat !== null && c.geografia.lng !== null).length,
  total_sin_coordenadas: centros.filter((c) => c.geografia.lat === null || c.geografia.lng === null).length,
  total_con_espacio_memoria: centros.filter((c) => c.memoria.espacio_memoria.es).length,
  total_con_senializacion: centros.filter((c) => c.memoria.senializaciones.length > 0).length,
  precision,
  reconciliacion: existingStats?.reconciliacion ?? null,
  advertencia:
    'Solo una porcion acotada del dataset tiene georreferenciacion manual aproximada. El resto se mantiene sin coordenadas o a revisar.',
};

await writeFile(dataPath, JSON.stringify(centros, null, 2), 'utf8');
await writeFile(mapPath, JSON.stringify(mapRecords, null, 2), 'utf8');
await writeFile(statsPath, JSON.stringify(stats, null, 2), 'utf8');

console.log(`Georreferenciacion aplicada. Coordenadas disponibles: ${stats.total_con_coordenadas}`);
