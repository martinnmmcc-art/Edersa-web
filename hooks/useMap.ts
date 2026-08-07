"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

// Centro por defecto: El Bolsón, Río Negro, Argentina
const EL_BOLSON_CENTER: [number, number] = [-71.5321, -41.9622];
const DEFAULT_ZOOM = 13;

interface UseMapOptions {
  containerId: string;
  center?: [number, number];
  zoom?: number;
}

/**
 * Hook responsable únicamente del ciclo de vida del mapa Mapbox:
 * lo crea, lo destruye al desmontar, y expone `map` cuando está listo.
 * No sabe nada de elementos ni de estado eléctrico: eso vive en los
 * componentes que consumen `map`.
 */
export function useMap({
  containerId,
  center = EL_BOLSON_CENTER,
  zoom = DEFAULT_ZOOM,
}: UseMapOptions) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapListo, setMapListo] = useState(false);
  const [errorMapa, setErrorMapa] = useState<string | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setErrorMapa(
        "Falta NEXT_PUBLIC_MAPBOX_TOKEN. Configuralo en .env.local / Vercel."
      );
      return;
    }
    mapboxgl.accessToken = token;

    const el = document.getElementById(containerId);
    if (!el || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerId,
      style: "mapbox://styles/mapbox/dark-v11", // buena legibilidad en campo / bajo luz
      center,
      zoom,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "top-right"
    );

    map.on("load", () => setMapListo(true));

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
