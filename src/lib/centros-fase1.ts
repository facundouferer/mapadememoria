import centrosRaw from '../data/centros.json';
import type { Centro, PrecisionGeografica } from './types';

export interface CentroFase1 {
	id: string;
	slug: string;
	nombre: string;
	alias: string[];
	jerarquia: {
		zona: string | null;
		subzona: string | null;
		area: string | null;
		provincia: string | null;
		partido: string | null;
		localidad: string | null;
	};
	tipo: string | null;
	dependencia: string | null;
	lat: number | null;
	lng: number | null;
	precision: PrecisionGeografica;
	senializacion: string[];
	espacio_memoria: boolean;
	id_ruvte: number;
	fuente: {
		documento: string;
		pagina_pdf: number;
		texto: string;
	};
}

export interface GrupoJerarquico {
	nombre: string;
	slug: string;
	total: number;
}

export const DATASET_VERSION = 'ruvte-2022-fase1-v1';

const centrosBase = centrosRaw as Centro[];

const normalizeText = (value: string | null | undefined): string | null => {
	const text = value?.trim();
	return text ? text : null;
};

export const slugifyTerm = (value: string): string =>
	value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0000-\u001f]/g, '')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s-]/g, ' ')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');

const asCentroFase1 = (centro: Centro): CentroFase1 => ({
	id: centro.id,
	slug: centro.slug,
	nombre: centro.nombre,
	alias: centro.alias,
	jerarquia: {
		zona: normalizeText(centro.zona.codigo ?? centro.zona.nombre),
		subzona: normalizeText(centro.subzona.codigo ?? centro.subzona.nombre),
		area: normalizeText(centro.area.codigo ?? centro.area.nombre),
		provincia: normalizeText(centro.ubicacion.provincia),
		partido: normalizeText(centro.ubicacion.partido_departamento),
		localidad: normalizeText(centro.ubicacion.localidad),
	},
	tipo: normalizeText(centro.clasificacion.tipo_lugar),
	dependencia: normalizeText(centro.clasificacion.dependencia),
	lat: centro.geografia.lat,
	lng: centro.geografia.lng,
	precision: centro.geografia.precision,
	senializacion: centro.memoria.senializaciones,
	espacio_memoria: centro.memoria.espacio_memoria.es,
	id_ruvte: centro.id_ruvte,
	fuente: {
		documento: centro.fuente.documento,
		pagina_pdf: centro.fuente.pagina_pdf,
		texto: centro.fuente.texto_fuente,
	},
});

const centros = centrosBase.map(asCentroFase1);

const collator = new Intl.Collator('es-AR', { sensitivity: 'base', numeric: true });

const buildGroupIndex = (values: Array<string | null>): GrupoJerarquico[] => {
	const totals = new Map<string, number>();
	for (const value of values) {
		if (!value) {
			continue;
		}
		totals.set(value, (totals.get(value) ?? 0) + 1);
	}

	return [...totals.entries()]
		.map(([nombre, total]) => ({
			nombre,
			slug: slugifyTerm(nombre),
			total,
		}))
		.sort((a, b) => collator.compare(a.nombre, b.nombre));
};

const provincias = buildGroupIndex(centros.map((centro) => centro.jerarquia.provincia));
const zonas = buildGroupIndex(centros.map((centro) => centro.jerarquia.zona));

export const getCentrosFase1 = (): CentroFase1[] => centros;

export const getCentrosCount = (): number => centros.length;

export const getCentroFase1BySlug = (slug: string): CentroFase1 | undefined =>
	centros.find((centro) => centro.slug === slug);

export const getProvincias = (): GrupoJerarquico[] => provincias;

export const getZonas = (): GrupoJerarquico[] => zonas;

export const getCentrosByProvinciaSlug = (provinciaSlug: string): CentroFase1[] => {
	return centros.filter((centro) => {
		const provincia = centro.jerarquia.provincia;
		return provincia ? slugifyTerm(provincia) === provinciaSlug : false;
	});
};

export const getCentrosByZonaSlug = (zonaSlug: string): CentroFase1[] => {
	return centros.filter((centro) => {
		const zona = centro.jerarquia.zona;
		return zona ? slugifyTerm(zona) === zonaSlug : false;
	});
};
