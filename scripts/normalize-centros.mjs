import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const inputPath = resolve(ROOT, 'src/data/raw/ruvte-pages.json');
const outputPath = resolve(ROOT, 'src/data/centros.json');
const mapOutputPath = resolve(ROOT, 'src/data/mapa-centros.json');
const statsOutputPath = resolve(ROOT, 'src/data/stats.json');
const EXPECTED_TOTAL = 807;
const SIN_ESTABLECER = '[SIN ESTABLECER]';

const TIPOS_LUGAR = [
  'DEPENDENCIA POLICIA FEDERAL',
  'DEPENDENCIA POLICIA PROVINCIAL',
  'DEPENDENCIA GENDARMERIA',
  'DEPENDENCIA PREFECTURA',
  'DEPENDENCIA ESTATAL',
  'DEPENDENCIA SERVICIO PENITENCIARIO FEDERAL',
  'DEPENDENCIA SERVICIO PENITENCIARIO PROVINCIAL',
  'UNIDAD MILITAR EJERCITO',
  'UNIDAD MILITAR MARINA',
  'UNIDAD MILITAR FUERZA AEREA',
  'UNIDAD PENITENCIARIA FEDERAL',
  'UNIDAD PENITENCIARIA PROVINCIAL',
  'HOSPITAL MILITAR',
  'HOSPITAL PUBLICO',
  'ESTABLECIMIENTO PRIVADO',
  'ESTABLECIMIENTO EDUCATIVO',
  'OTROS',
  '[SIN ESTABLECER]',
];

const cleanLine = (line) => line.replace(/\s+/g, ' ').trim();

const FOOTER_PATTERNS = [
  /listado\s+alfabetico\s+por\s+zona/i,
  /ruvte\s+av\.\s+del\s+libertador\s+8151/i,
  /addhh@jus\.gob\.ar/i,
  /programa\s+registro\s+unificado/i,
  /informacion\s+en\s+proceso\s+de\s+ampliacion/i,
  /^\d+\s*$/,
  /^centros\s+clandestinos\s+de\s+detencion$/i,
  /^registro\s+unificado\s+de\s+victimas/i,
];

const isFooter = (line) => FOOTER_PATTERNS.some((pattern) => pattern.test(line.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));

const splitLineByEmbeddedId = (line) => {
  const parts = [];
  let remainder = line;

  while (remainder) {
    const match = remainder.match(/ID\s*RUVTE\s*(\d+)/i);
    if (!match || match.index === undefined) {
      if (remainder.trim()) {
        parts.push(remainder.trim());
      }
      break;
    }

    const before = remainder.slice(0, match.index).trim();
    const idLine = `ID RUVTE ${match[1]}`;
    const after = remainder.slice(match.index + match[0].length).trim();

    if (before) {
      parts.push(before);
    }

    parts.push(idLine);
    remainder = after;
  }

  return parts;
};

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const isTestimoniosLine = (line) => /\btestimonio\/s\b/i.test(line);
const isMemoryLine = (line) => /ESPACIO DE MEMORIA|Sitio señalizado/i.test(line);
const isProvinciaContextLine = (line) => /^provincia\s+de\s+|^provincia\s+del\s+/i.test(line);
const parseZonaHeader = (line) => line.match(/^Zona\s+([0-9IVXLC]+)(?:\s+·\s+(.+))?$/i);
const isZonaContextLine = (line) => Boolean(parseZonaHeader(line));
const isSubzonaContextLine = (line) => /^Subzona\s+/i.test(line);
const isAreaContextLine = (line) => /^Area\s+/i.test(line);
const isContextLine = (line) =>
  isZonaContextLine(line) ||
  isSubzonaContextLine(line) ||
  isAreaContextLine(line) ||
  isProvinciaContextLine(line);

const isTipoLugarLine = (line) => TIPOS_LUGAR.some((tipo) => line.startsWith(tipo));

const looksLikeAddress = (value) => {
  const line = value.toUpperCase();
  return (
    /\d/.test(line) ||
    line.includes(' · ') ||
    /\bCAPITAL\s+FEDERAL$/.test(line) ||
    /\b(AV\.|AVENIDA|CALLE|RUTA|KM|PASAJE|PJE\.|BOULEVARD|BLVD\.|ESQUINA|E\/)\b/.test(line)
  );
};

const parseContext = (line, context) => {
  const zona = parseZonaHeader(line);
  if (zona) {
    context.zona = zona[1].trim();
    context.subzona = null;
    context.area = null;
    context.partido = null;
    const provinciaHeader = zona[2]
      ?.trim()
      .replace(/^provincia\s+de\s+|^provincia\s+del\s+/i, '');
    if (provinciaHeader) {
      context.provincia = provinciaHeader;
    }
    return true;
  }

  const subzona = line.match(/^Subzona\s+(.+)$/i);
  if (subzona) {
    context.subzona = subzona[1].trim();
    context.area = null;
    context.partido = null;
    return true;
  }

  const area = line.match(/^Area\s+([^·]+)(?:\s+·\s+(.+))?$/i);
  if (area) {
    context.area = area[1].trim();
    context.partido = null;
    const territorial = area[2]?.trim();
    if (territorial) {
      const partido = territorial.match(/(?:partido|departamento)\s+de\s+(.+?)(?:\s+·|$)/i);
      if (partido) {
        context.partido = partido[1].trim();
      }
    }
    return true;
  }

  if (isProvinciaContextLine(line)) {
    context.provincia = line.replace(/^provincia\s+de\s+|^provincia\s+del\s+/i, '').trim();
    return true;
  }

  return false;
};

const parseUbicacion = (line, context) => {
  if (!line) {
    return {
      provincia: context.provincia ?? null,
      partido_departamento: context.partido ?? null,
      localidad: null,
      direccion: null,
      referencia: null,
      texto_ubicacion_original: null,
    };
  }

  if (line.includes(' · ')) {
    const pieces = line.split(' · ').map((part) => part.trim());
    const provincia = pieces.at(-1) ?? context.provincia ?? null;
    const partido = pieces.length > 1 ? pieces.at(-2) ?? context.partido ?? null : context.partido ?? null;
    const first = pieces[0] ?? null;
    const direccion = first && looksLikeAddress(first) ? first : null;
    const localidad = first && !looksLikeAddress(first) ? first : null;

    return {
      provincia,
      partido_departamento: partido,
      localidad,
      direccion,
      referencia: null,
      texto_ubicacion_original: line,
    };
  }

  const capitalFederal = line.match(/^(.*)\s+CAPITAL FEDERAL$/i);
  if (capitalFederal) {
    return {
      provincia: 'CAPITAL FEDERAL',
      partido_departamento: 'CAPITAL FEDERAL',
      localidad: 'CAPITAL FEDERAL',
      direccion: capitalFederal[1].trim() || null,
      referencia: null,
      texto_ubicacion_original: line,
    };
  }

  return {
    provincia: context.provincia ?? null,
    partido_departamento: context.partido ?? null,
    localidad: null,
    direccion: line,
    referencia: null,
    texto_ubicacion_original: line,
  };
};

const findLastIndexBefore = (array, endExclusive, predicate) => {
  for (let index = endExclusive - 1; index >= 0; index -= 1) {
    if (predicate(array[index])) {
      return index;
    }
  }
  return -1;
};

const normalize = async () => {
  const raw = JSON.parse(await readFile(inputPath, 'utf8'));
  const lines = [];
  let dataStarted = false;
  const rawIds = new Set();
  const embeddedIdLines = [];

  for (const page of raw.pages) {
    const pageLines = page.text.split('\n').map(cleanLine).filter(Boolean);

    for (const rawLine of pageLines) {
      const idsInLine = [...rawLine.matchAll(/ID\s*RUVTE\s*(\d+)/gi)].map((match) => Number.parseInt(match[1], 10));
      for (const id of idsInLine) {
        rawIds.add(id);
      }

      if (idsInLine.length > 0 && !/^ID\s*RUVTE\s*\d+$/i.test(rawLine)) {
        embeddedIdLines.push({
          page: page.page,
          line: rawLine,
        });
      }

      for (const line of splitLineByEmbeddedId(rawLine)) {
        if (isFooter(line)) {
          continue;
        }

        if (!dataStarted) {
          if (!isZonaContextLine(line)) {
            continue;
          }
          dataStarted = true;
        }

        lines.push({ page: page.page, line });
      }
    }
  }

  const context = {
    zona: null,
    subzona: null,
    area: null,
    provincia: null,
    partido: null,
  };

  const records = [];
  let preBlock = [];
  let pendingRecord = null;
  const slugCount = new Map();

  const extractPostInfo = (startIndex) => {
    let nombre = null;
    const memoriaLine = [];
    const notas = [];
    let sawPotentialPreData = false;
    let sawStructAfterName = false;

    for (let lookahead = startIndex + 1; lookahead < lines.length; lookahead += 1) {
      const candidate = lines[lookahead].line;

      if (isContextLine(candidate) || /^ID RUVTE\s+\d+$/i.test(candidate)) {
        break;
      }

      if (isMemoryLine(candidate)) {
        memoriaLine.push(candidate);
        continue;
      }

      if (isTipoLugarLine(candidate) || isTestimoniosLine(candidate) || looksLikeAddress(candidate)) {
        sawPotentialPreData = true;
        if (nombre) {
          if (isTipoLugarLine(candidate) || looksLikeAddress(candidate)) {
            sawStructAfterName = true;
          }

          if (isTestimoniosLine(candidate) && sawStructAfterName) {
            break;
          }
        }
        continue;
      }

      if (!nombre) {
        const wordCount = candidate.split(/\s+/).length;
        if (sawPotentialPreData && wordCount <= 3) {
          notas.push(candidate);
          continue;
        }
        nombre = candidate;
        continue;
      }

      if (sawStructAfterName) {
        break;
      }

      notas.push(candidate);
    }

    return {
      nombre,
      memoriaLine,
      notas,
    };
  };

  const flushPendingRecord = () => {
    if (!pendingRecord) {
      return;
    }

    const baseSlug = slugify(pendingRecord.nombre) || `ruvte-${pendingRecord.id_ruvte}`;
    const existing = slugCount.get(baseSlug) ?? 0;
    slugCount.set(baseSlug, existing + 1);
    const slug = existing === 0 ? baseSlug : `${baseSlug}-${existing + 1}`;

    const geografia = {
      lat: null,
      lng: null,
      precision: 'sin_coordenadas',
      fuente_geocodificacion: null,
      texto_geocodificacion: pendingRecord.ubicacion.texto_ubicacion_original,
      observaciones: 'Sin coordenadas confiables en esta version del dataset.',
    };

    const finalRecord = {
      id: `ruvte-${pendingRecord.id_ruvte}`,
      id_ruvte: pendingRecord.id_ruvte,
      slug,
      nombre: pendingRecord.nombre,
      alias: pendingRecord.alias,
      zona: {
        codigo: pendingRecord.zona ?? SIN_ESTABLECER,
        nombre: pendingRecord.zona ? `Zona ${pendingRecord.zona}` : SIN_ESTABLECER,
      },
      subzona: {
        codigo: pendingRecord.subzona ?? SIN_ESTABLECER,
        nombre: pendingRecord.subzona ? `Subzona ${pendingRecord.subzona}` : SIN_ESTABLECER,
      },
      area: {
        codigo: pendingRecord.area ?? SIN_ESTABLECER,
        nombre: pendingRecord.area ? `Area ${pendingRecord.area}` : SIN_ESTABLECER,
      },
      ubicacion: pendingRecord.ubicacion,
      geografia,
      clasificacion: {
        tipo_lugar: pendingRecord.tipo_lugar,
        dependencia: pendingRecord.dependencia,
      },
      testimonios: pendingRecord.testimonios,
      memoria: {
        espacio_memoria: {
          es: pendingRecord.memoriaLine.some((line) => line.includes('ESPACIO DE MEMORIA')),
          descripcion: pendingRecord.memoriaLine.find((line) => line.includes('ESPACIO DE MEMORIA')) ?? null,
        },
        senializaciones: pendingRecord.memoriaLine.filter((line) => line.includes('Sitio señalizado')),
      },
      notas: pendingRecord.notas,
      fuente: {
        documento: 'ruvte2022_anm_nomina_ccd_con_mapas_de_zonas_mayo_2022.pdf',
        pagina_pdf: pendingRecord.page,
        texto_fuente: pendingRecord.rawText,
      },
    };

    records.push(finalRecord);
    pendingRecord = null;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const entry = lines[index];
    const line = entry.line;

    if (parseContext(line, context)) {
      flushPendingRecord();
      preBlock = [];
      continue;
    }

    const idMatch = line.match(/^ID RUVTE\s+(\d+)$/i);
    if (idMatch) {
      flushPendingRecord();

      const testimoniosIndex = findLastIndexBefore(preBlock, preBlock.length, isTestimoniosLine);
      const searchLimit = testimoniosIndex >= 0 ? testimoniosIndex : preBlock.length;
      const tipoIndex = findLastIndexBefore(preBlock, searchLimit, isTipoLugarLine);
      const locationSearchLimit = tipoIndex >= 0 ? tipoIndex : searchLimit;
      const locationIndex = findLastIndexBefore(preBlock, locationSearchLimit, looksLikeAddress);

      const tipo = tipoIndex >= 0 ? preBlock[tipoIndex] : 'OTROS';
      const dependencia = tipo.startsWith('DEPENDENCIA ') ? tipo.replace('DEPENDENCIA ', '') : tipo;
      const testimoniosLine = testimoniosIndex >= 0 ? preBlock[testimoniosIndex] : null;
      const testimonios = testimoniosLine ? Number.parseInt(testimoniosLine, 10) || 0 : 0;
      const locationLine = locationIndex >= 0 ? preBlock[locationIndex] : null;
      const aliasStart = testimoniosIndex >= 0 ? testimoniosIndex + 1 : 0;
      const alias = preBlock.slice(aliasStart).filter(
        (candidate) =>
          !isTestimoniosLine(candidate) &&
          !candidate.startsWith('ID RUVTE') &&
          !isTipoLugarLine(candidate) &&
          !isContextLine(candidate) &&
          !isMemoryLine(candidate) &&
          candidate !== locationLine,
      );

      const preNameCandidate = (() => {
        for (let preIndex = preBlock.length - 1; preIndex >= 0; preIndex -= 1) {
          const candidate = preBlock[preIndex];

          if (preIndex === locationIndex || preIndex === tipoIndex || preIndex === testimoniosIndex) {
            continue;
          }

          if (candidate.startsWith('ID RUVTE') || isContextLine(candidate) || isMemoryLine(candidate) || isFooter(candidate)) {
            continue;
          }

          return candidate;
        }

        return null;
      })();

      const postInfo = extractPostInfo(index);
      const nombre = postInfo.nombre ?? alias[0] ?? preNameCandidate ?? `Registro RUVTE ${idMatch[1]}`;

      pendingRecord = {
        id_ruvte: Number(idMatch[1]),
        nombre,
        alias,
        zona: context.zona,
        subzona: context.subzona,
        area: context.area,
        ubicacion: parseUbicacion(locationLine, context),
        tipo_lugar: tipo,
        dependencia,
        testimonios,
        memoriaLine: postInfo.memoriaLine,
        notas: postInfo.notas,
        rawText: [...preBlock, line, ...postInfo.memoriaLine, ...postInfo.notas].join(' | '),
        page: entry.page,
      };

      preBlock = [];
      continue;
    }

    preBlock.push(line);
  }

  flushPendingRecord();

  const uniqueRecords = records
    .filter((record) => Number.isFinite(record.id_ruvte))
    .sort((a, b) => a.id_ruvte - b.id_ruvte);

  const parsedIds = new Set(uniqueRecords.map((record) => record.id_ruvte));
  const missingIds = [...rawIds].filter((id) => !parsedIds.has(id)).sort((a, b) => a - b);
  const extraIds = [...parsedIds].filter((id) => !rawIds.has(id)).sort((a, b) => a - b);

  const mapRecords = uniqueRecords.map((record) => ({
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

  const precisionStats = {
    exacta: 0,
    aproximada: 0,
    solo_localidad: 0,
    sin_coordenadas: 0,
    a_revisar: 0,
  };

  for (const record of uniqueRecords) {
    precisionStats[record.geografia.precision] += 1;
  }

  const stats = {
    total_registros: uniqueRecords.length,
    total_con_coordenadas: uniqueRecords.filter((record) => record.geografia.lat !== null && record.geografia.lng !== null).length,
    total_sin_coordenadas: uniqueRecords.filter((record) => record.geografia.lat === null || record.geografia.lng === null).length,
    total_con_espacio_memoria: uniqueRecords.filter((record) => record.memoria.espacio_memoria.es).length,
    total_con_senializacion: uniqueRecords.filter((record) => record.memoria.senializaciones.length > 0).length,
    precision: precisionStats,
    reconciliacion: {
      esperado_pdf: EXPECTED_TOTAL,
      ids_detectados_en_texto: rawIds.size,
      ids_normalizados: uniqueRecords.length,
      ids_faltantes_en_normalizacion: missingIds,
      ids_extra_en_normalizacion: extraIds,
      lineas_id_embebido: embeddedIdLines,
      estado: uniqueRecords.length === EXPECTED_TOTAL ? 'ok' : 'pendiente_revision_manual',
    },
    advertencia:
      'El dataset es preliminar: conserva trazabilidad textual completa y marca sin_coordenadas donde no hubo georreferenciacion confiable.',
  };

  await mkdir(resolve(ROOT, 'src/data'), { recursive: true });
  await writeFile(outputPath, JSON.stringify(uniqueRecords, null, 2), 'utf8');
  await writeFile(mapOutputPath, JSON.stringify(mapRecords, null, 2), 'utf8');
  await writeFile(statsOutputPath, JSON.stringify(stats, null, 2), 'utf8');

  console.log(`Centros normalizados: ${uniqueRecords.length}`);
};

await normalize();
