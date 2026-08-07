"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

// Centro por defecto: El Bolsón, Río Negro, Argentina
const EL_BOLSON_CENTER: [number, number] = [-71.5321, -41.9622];
const DEFAULT_ZOOM = 13;

// OpenFreeMap: estilos de mapa vectorial gratuitos, sin token ni límite de
// uso (https://openfreemap.org). "Liberty" es un estilo tipo calle, buena
// legibilidad. Si en algún momento se quiere autohospedar el tile server
// (por control total / uso muy intensivo), OpenFreeMap también permite
// bajar los tiles y correrlos propios sin cambiar el resto del código.
const ESTILO_MAPA = "https://tiles.openfreemap.org/styles/liberty";

interface UseMapOptions {
  containerId: string;
  center?: [number, number];
  zoom?: number;
}

/**
 * Hook responsable únicamente del ciclo de vida del mapa (MapLibre GL):
 * lo crea, lo destruye al desmontar, y expone `map` cuando está listo.
 * No sabe nada de elementos ni de estado eléctrico: eso vive en los
 * componentes que consumen `map`.
 */
export function useMap({
  containerId,
  center = EL_BOLSON_CENTER,
  zoom = DEFAULT_ZOOM,
}: UseMapOptions) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapListo, setMapListo] = useState(false);
  const [errorMapa, setErrorMapa] = useState<string | null>(null);

  useEffect(() => {
    const el = document.getElementById(containerId);
    if (!el || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerId,
        style: ESTILO_MAPA,
        center,
        zoom,
      });
    } catch (err: any) {
      setErrorMapa(err?.message ?? "No se pudo inicializar el mapa.");
      return;
    }

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "top-right"
    );

    map.on("load", () => setMapListo(true));
    map.on("error", (e) => {
      // errores de tile server / red se reportan acá en vez de romper la UI
      // eslint-disable-next-line no-console
      console.error("[mapa] error", e?.error ?? e);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapListo(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  return { map: mapRef.current, mapListo, errorMapa };
}
