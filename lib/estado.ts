import type { EstadoElemento, TipoElemento } from "@/types";

export const COLOR_ESTADO: Record<EstadoElemento, string> = {
  cerrado: "#22c55e",
  abierto: "#ef4444",
  desconocido: "#94a3b8",
};

export const LABEL_ESTADO: Record<EstadoElemento, string> = {
  cerrado: "Cerrado",
  abierto: "Abierto",
  desconocido: "Sin datos",
};

export const LABEL_TIPO: Record<TipoElemento, string> = {
  reconectador: "Reconectador",
  seccionador: "Seccionador",
  cuchilla: "Cuchilla",
  omnirouter: "Omnirouter",
  transformador: "Transformador",
  capacitor: "Capacitor",
  central_termica: "Central térmica",
  barra: "Barra",
  generador: "Generador",
};

// Un glifo simple por tipo, para diferenciar el marcador además del color
// (importante: el color solo indica estado, no alcanza para el tipo).
export const ICONO_TIPO: Record<TipoElemento, string> = {
  reconectador: "R",
  seccionador: "S",
  cuchilla: "C",
  omnirouter: "O",
  transformador: "T",
  capacitor: "K", // "C" ya la usa Cuchilla; K por kVAr
  central_termica: "★",
  barra: "B",
  generador: "G",
};

// Tipos que no manejan apertura/cierre operativo (no tiene sentido
// mostrarles el panel de ABRIR/CERRAR ni el semáforo verde/rojo).
export const TIPOS_SIN_MANIOBRA: ReadonlySet<TipoElemento> = new Set([
  "central_termica",
  "barra",
]);
