export type TipoElemento =
  | "reconectador"
  | "seccionador"
  | "omnirouter"
  | "transformador";

export type TipoEvento = "apertura" | "cierre" | "falla" | "reposicion";

export type EstadoElemento = "cerrado" | "abierto" | "desconocido";

export interface Alimentador {
  id: string;
  nombre: string;
  tension_kv: 13.2 | 33;
  color_mapa: string;
  activo: boolean;
}

export interface ElementoEstado {
  id: string;
  nombre: string;
  tipo: TipoElemento;
  alimentador_id: string | null;
  alimentador_nombre: string | null;
  tension_kv: number | null;
  lat: number;
  lng: number;
  codigo: string | null;
  activo: boolean;
  ultimo_evento_tipo: TipoEvento | null;
  ultimo_evento_usuario: string | null;
  ultimo_evento_fecha: string | null;
  estado: EstadoElemento;
}

export interface EventoInput {
  client_uuid: string;
  elemento_id: string;
  tipo: TipoEvento;
  usuario: string;
  observaciones?: string;
  foto_url?: string;
  fecha: string; // ISO string, generada en el momento del registro (aunque se sincronice después)
}

export interface EventoPendiente extends EventoInput {
  intentos: number;
  creado_en: string;
}

export interface Transformador {
  id: string;
  elemento_id: string;
  potencia_kva: number;
  tension_primaria_kv: number;
  tension_secundaria_kv: number;
  fases: 1 | 3;
  fabricante?: string | null;
  numero_serie?: string | null;
  fecha_instalacion?: string | null;
}

export interface NuevoTransformadorInput {
  nombre: string;
  alimentador_id: string | null;
  lat: number;
  lng: number;
  potencia_kva: number;
  tension_primaria_kv: number;
  tension_secundaria_kv: number;
  fases: 1 | 3;
  fabricante?: string;
  numero_serie?: string;
}
