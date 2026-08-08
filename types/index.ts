export type TipoElemento =
  | "reconectador"
  | "seccionador"
  | "cuchilla"
  | "omnirouter"
  | "transformador"
  | "capacitor"
  | "central_termica"
  | "barra"
  | "generador";

export type TipoEvento = "apertura" | "cierre" | "falla" | "reposicion";

export type EstadoElemento = "cerrado" | "abierto" | "desconocido";

export type TensionSecundariaBT = "220" | "380" | "380/220";
export type TipoCapacitor = "fijo" | "automatico";
export type TipoMotor = "gas" | "diesel";

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
  fecha: string;
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
  tension_secundaria_v: TensionSecundariaBT;
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
  tension_secundaria_v: TensionSecundariaBT;
  fases: 1 | 3;
  fabricante?: string;
  numero_serie?: string;
}

export interface Capacitor {
  id: string;
  elemento_id: string;
  potencia_kvar: number;
  tension_kv: number;
  tipo: TipoCapacitor;
}

export interface NuevoCapacitorInput {
  nombre: string;
  alimentador_id: string | null;
  lat: number;
  lng: number;
  potencia_kvar: number;
  tension_kv: number;
  tipo: TipoCapacitor;
}

export interface Generador {
  id: string;
  elemento_id: string;
  tipo_motor: TipoMotor;
  potencia_kva: number;
  tension_salida_kv: number;
}

export interface NuevoGeneradorInput {
  nombre: string;
  alimentador_id: string | null;
  lat: number;
  lng: number;
  tipo_motor: TipoMotor;
  potencia_kva: number;
  tension_salida_kv: number;
}

export interface NuevoElementoInput {
  nombre: string;
  tipo: TipoElemento;
  alimentador_id: string | null;
  lat: number;
  lng: number;
  codigo?: string;
}

export interface ActualizarElementoInput {
  id: string;
  nombre: string;
  alimentador_id: string | null;
}

export type ModoMapa = "calles" | "satelite" | "hibrida" | "topografico";
