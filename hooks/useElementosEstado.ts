"use client";

import { useCallback, useEffect, useState } from "react";
import {
  obtenerElementosConEstado,
  suscribirseAEventos,
} from "@/services/elementosService";
import { guardarCacheElementos, leerCacheElementos } from "@/lib/db/offlineQueue";
import type { ElementoEstado } from "@/types";

/**
 * Fuente única de verdad para "qué elementos existen y en qué estado están".
 * - Online: pide la vista v_elementos_estado y se suscribe a Realtime.
 * - Offline: sirve el último snapshot guardado en IndexedDB.
 */
export function useElementosEstado() {
  const [elementos, setElementos] = useState<ElementoEstado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const cache = await leerCacheElementos();
        setElementos(cache as ElementoEstado[]);
        setError(cache.length ? null : "Sin conexión y sin datos en caché.");
        return;
      }
      const data = await obtenerElementosConEstado();
      setElementos(data);
      setError(null);
      guardarCacheElementos(data); // fire-and-forget: refresca la caché offline
    } catch (err: any) {
      // Falló el pedido online (ej: conexión inestable): caemos a caché.
      const cache = await leerCacheElementos();
      if (cache.length) {
        setElementos(cache as ElementoEstado[]);
        setError(null);
      } else {
        setError(err?.message ?? "No se pudo cargar la red.");
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    const cancelar = suscribirseAEventos(() => cargar());
    return cancelar;
  }, [cargar]);

  return { elementos, cargando, error, recargar: cargar };
}
