import { COLOR_ESTADO, ICONO_TIPO } from "@/lib/estado";
import type { ElementoEstado } from "@/types";

/**
 * Construye el <div> que Mapbox usa como marcador custom.
 * Se separa de MapView para poder testear/ajustar el look sin tocar
 * la lógica de mapa.
 */
export function crearMarcadorEl(elemento: ElementoEstado, seleccionado: boolean) {
  const el = document.createElement("div");
  el.className = "grupo-marcador";
  el.style.width = seleccionado ? "40px" : "32px";
  el.style.height = seleccionado ? "40px" : "32px";
  el.style.borderRadius = "9999px";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.fontWeight = "700";
  el.style.fontFamily = "'Barlow Condensed', sans-serif";
  el.style.fontSize = seleccionado ? "16px" : "14px";
  el.style.color = "#0b0f14";
  el.style.background = COLOR_ESTADO[elemento.estado];
  el.style.border = seleccionado ? "3px solid #ffb100" : "2px solid #0b0f14";
  el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.5)";
  el.style.cursor = "pointer";
  el.textContent = ICONO_TIPO[elemento.tipo];
  el.setAttribute("role", "button");
  el.setAttribute(
    "aria-label",
    `${elemento.nombre}, ${elemento.tipo}, estado ${elemento.estado}`
  );
  return el;
}
