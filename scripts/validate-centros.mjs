import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const dataPath = resolve(ROOT, 'src/data/centros.json');

const VALID_PRECISION = new Set(['exacta', 'aproximada', 'solo_localidad', 'sin_coordenadas', 'a_revisar']);

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const data = JSON.parse(await readFile(dataPath, 'utf8'));

const idSet = new Set();
const slugSet = new Set();

for (const centro of data) {
  assert(centro.nombre, `Registro sin nombre: ${centro.id}`);
  assert(centro.zona?.codigo, `Registro sin zona: ${centro.id}`);
  assert(centro.subzona?.codigo, `Registro sin subzona: ${centro.id}`);
  assert(centro.area?.codigo, `Registro sin area: ${centro.id}`);
  assert(VALID_PRECISION.has(centro.geografia?.precision), `Precision invalida en ${centro.id}`);

  const lat = centro.geografia?.lat;
  const lng = centro.geografia?.lng;
  assert(lat === null || Number.isFinite(lat), `lat invalida en ${centro.id}`);
  assert(lng === null || Number.isFinite(lng), `lng invalida en ${centro.id}`);

  assert(!idSet.has(centro.id_ruvte), `ID RUVTE duplicado: ${centro.id_ruvte}`);
  idSet.add(centro.id_ruvte);

  assert(!slugSet.has(centro.slug), `Slug duplicado: ${centro.slug}`);
  slugSet.add(centro.slug);
}

console.log(`Validacion OK. Registros: ${data.length}`);
