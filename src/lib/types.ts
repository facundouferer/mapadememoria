export type PrecisionGeografica = 'exacta' | 'aproximada' | 'solo_localidad' | 'sin_coordenadas' | 'a_revisar';

export interface Centro {
	id: string;
	id_ruvte: number;
	slug: string;
	nombre: string;
	alias: string[];
	zona: {
		codigo: string | null;
		nombre: string | null;
	};
	subzona: {
		codigo: string | null;
		nombre: string | null;
	};
	area: {
		codigo: string | null;
		nombre: string | null;
	};
	ubicacion: {
		provincia: string | null;
		partido_departamento: string | null;
		localidad: string | null;
		direccion: string | null;
		referencia: string | null;
		texto_ubicacion_original: string | null;
	};
	geografia: {
		lat: number | null;
		lng: number | null;
		precision: PrecisionGeografica;
		fuente_geocodificacion: string | null;
		texto_geocodificacion: string | null;
		observaciones: string | null;
	};
	clasificacion: {
		tipo_lugar: string | null;
		dependencia: string | null;
	};
	testimonios: number;
	memoria: {
		espacio_memoria: {
			es: boolean;
			descripcion: string | null;
		};
		senializaciones: string[];
	};
	notas: string[];
	fuente: {
		documento: string;
		pagina_pdf: number;
		texto_fuente: string;
	};
}

export interface CentroMapa {
	id: string;
	id_ruvte: number;
	slug: string;
	nombre: string;
	lat: number | null;
	lng: number | null;
	provincia: string | null;
	zona: string | null;
	subzona: string | null;
	area: string | null;
	tipo_lugar: string | null;
	dependencia: string | null;
	precision: PrecisionGeografica;
	espacio_memoria: boolean;
	senializado: boolean;
}

export interface StatsDataset {
	total_registros: number;
	total_con_coordenadas: number;
	total_sin_coordenadas: number;
	total_con_espacio_memoria: number;
	total_con_senializacion: number;
	precision: Record<PrecisionGeografica, number>;
	advertencia: string;
}
