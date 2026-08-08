"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { obtenerEstiloMapa } from "@/lib/mapStyles";
import type { ModoMapa } from "@/types";

// Centro por defecto: El Bolsón, Río Negro, Argentina
const EL_BOLSON_CENTER: [number, number] = [-71.5321, -41.9622];
const DEFAULT_ZOOM = 13;

interface UseMapOptions {
  containerId: string;
  center?: [number, number];
  zoom?: number;
}

export function useMap({
  containerId,
  center = EL_BOLSON_CENTER,
  zoom = DEFAULT_ZOOM,
}: UseMapOptions) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapListo, setMapListo] = useState(false);
  const [errorMapa, setErrorMapa] = useState<string | null>(null);
  const [modoMapa, setModoMapaState] = useState<ModoMapa>("calles");

  useEffect(() => {
    const el = document.getElementById(containerId);
    if (!el || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerId,
        style: obtenerEstiloMapa("calles"),
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
      }),
      "top-right"
    );

    map.on("load", () => setMapListo(true));
    map.on("error", (e) => {
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

  function cambiarModoMapa(modo: ModoMapa) {
    const map = mapRef.current;
    if (!map) return;
    // setStyle reemplaza capas/fuentes del mapa base, pero NO afecta a los
    // maplibregl.Marker (son elementos DOM propios, no capas del estilo),
    // así que los marcadores de elementos sobreviven al cambio sin
    // necesidad de recrearlos.
    map.setStyle(obtenerEstiloMapa(modo));
    setModoMapaState(modo);
  }

  return { map: mapRef.current, mapListo, errorMapa, modoMapa, cambiarModoMapa };
}
