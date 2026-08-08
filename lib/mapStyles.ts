import type { StyleSpecification } from "maplibre-gl";
import type { ModoMapa } from "@/types";

// OpenFreeMap: mapa vectorial de calles, gratis y sin límite de uso.
const ESTILO_CALLES = "https://tiles.openfreemap.org/styles/liberty";

// Esri World Imagery: satelital gratis sin token (uso público permitido).
const TILES_SATELITE = [
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
];

// Esri "Reference/World_Boundaries_and_Places": capa transparente con
// caminos, límites y nombres, para superponer sobre el satelital y
// armar la vista híbrida.
const TILES_REFERENCIA = [
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
];

// OpenTopoMap: relieve/topográfico, gratis, atribución obligatoria.
const TILES_TOPOGRAFICO = [
  "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
  "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
  "https://c.tile.opentopomap.org/{z}/{x}/{y}.png",
];

function estiloRaster(
  tiles: string[],
  attribution: string,
  capasExtra: { tiles: string[]; attribution: string }[] = []
): StyleSpecification {
  const sources: StyleSpecification["sources"] = {
    base: {
      type: "raster",
      tiles,
      tileSize: 256,
      attribution,
    },
  };
  const layers: StyleSpecification["layers"] = [
    { id: "base", type: "raster", source: "base" },
  ];

  capasExtra.forEach((capa, i) => {
    const id = `overlay-${i}`;
    sources[id] = {
      type: "raster",
      tiles: capa.tiles,
      tileSize: 256,
      attribution: capa.attribution,
    };
    layers.push({ id, type: "raster", source: id });
  });

  return { version: 8, sources, layers };
}

/**
 * Devuelve el estilo (URL o StyleSpecification) para el modo pedido.
 * "calles" es un estilo vectorial completo (URL); el resto se arma acá
 * como capas raster simples.
 */
export function obtenerEstiloMapa(modo: ModoMapa): string | StyleSpecification {
  switch (modo) {
    case "calles":
      return ESTILO_CALLES;
    case "satelite":
      return estiloRaster(
        TILES_SATELITE,
        "Imagery © Esri, Maxar, Earthstar Geographics"
      );
    case "hibrida":
      return estiloRaster(
        TILES_SATELITE,
        "Imagery © Esri, Maxar, Earthstar Geographics",
        [{ tiles: TILES_REFERENCIA, attribution: "© Esri" }]
      );
    case "topografico":
      return estiloRaster(
        TILES_TOPOGRAFICO,
        "© OpenTopoMap (CC-BY-SA) · © OpenStreetMap contributors"
      );
  }
}

export const OPCIONES_MODO_MAPA: { modo: ModoMapa; label: string }[] = [
  { modo: "calles", label: "Calles" },
  { modo: "satelite", label: "Satélite" },
  { modo: "hibrida", label: "Híbrida" },
  { modo: "topografico", label: "Relieve" },
];
