import { COLOR_ESTADO, ICONO_TIPO } from "@/lib/estado";
import type { ElementoEstado } from "@/types";

/**
 * Construye el <div> que MapLibre usa como marcador custom: el círculo
 * de color/glifo (estado + tipo) y, debajo, una etiqueta con el nombre
 * o código real del equipo. En campo se trabaja por ID (ej: "SEC-14"),
 * no por la letra del glifo, así que el texto tiene que estar siempre
 * visible, sin necesidad de tocar el marcador.
 */
export function crearMarcadorEl(elemento: ElementoEstado, seleccionado: boolean) {
  const tamaño = seleccionado ? 40 : 32;

  const contenedor = document.createElement("div");
  contenedor.style.position = "relative";
  contenedor.style.width = `${tamaño}px`;
  contenedor.style.height = `${tamaño}px`;
  contenedor.style.cursor = "pointer";

  const circulo = document.createElement("div");
  circulo.style.width = `${tamaño}px`;
  circulo.style.height = `${tamaño}px`;
  circulo.style.borderRadius = "9999px";
  circulo.style.display = "flex";
  circulo.style.alignItems = "center";
  circulo.style.justifyContent = "center";
  circulo.style.fontWeight = "700";
  circulo.style.fontFamily = "'Barlow Condensed', sans-serif";
  circulo.style.fontSize = seleccionado ? "16px" : "14px";
  circulo.style.color = "#0b0f14";
  circulo.style.background = COLOR_ESTADO[elemento.estado];
  circulo.style.border = seleccionado ? "3px solid #ffb100" : "2px solid #0b0f14";
  circulo.style.boxShadow = "0 2px 6px rgba(0,0,0,0.5)";
  circulo.textContent = ICONO_TIPO[elemento.tipo];

  const etiqueta = document.createElement("div");
  etiqueta.textContent = elemento.codigo || elemento.nombre;
  etiqueta.style.position = "absolute";
  etiqueta.style.top = "100%";
  etiqueta.style.left = "50%";
  etiqueta.style.transform = "translateX(-50%)";
  etiqueta.style.marginTop = "3px";
  etiqueta.style.fontFamily = "'Barlow Condensed', sans-serif";
  etiqueta.style.fontSize = "12px";
  etiqueta.style.fontWeight = "600";
  etiqueta.style.color = "#f1f5f9";
  etiqueta.style.background = "rgba(11, 15, 20, 0.85)";
  etiqueta.style.padding = "1px 6px";
  etiqueta.style.borderRadius = "4px";
  etiqueta.style.whiteSpace = "nowrap";
  etiqueta.style.maxWidth = "140px";
  etiqueta.style.overflow = "hidden";
  etiqueta.style.textOverflow = "ellipsis";
  etiqueta.style.pointerEvents = "none";

  contenedor.appendChild(circulo);
  contenedor.appendChild(etiqueta);

  contenedor.setAttribute("role", "button");
  contenedor.setAttribute(
    "aria-label",
    `${elemento.nombre}, ${elemento.tipo}, estado ${elemento.estado}`
  );
  return contenedor;
}
