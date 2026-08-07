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
  seccionador: "Seccionador / cuchilla",
  omnirouter: "Omnirouter",
  transformador: "Transformador",
};

// Un glifo simple por tipo, para diferenciar el marcador además del color
// (importante: el color solo indica estado, no alcanza para el tipo).
export const ICONO_TIPO: Record<TipoElemento, string> = {
  reconectador: "R",
  seccionador: "S",
  omnirouter: "O",
  transformador: "T",
};
