"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  listarPendientes,
  eliminarPendiente,
  contarPendientes,
} from "@/lib/db/offlineQueue";
import { enviarEventoPendiente } from "@/services/eventosService";

const MAX_INTENTOS = 5;

/**
 * Mantiene sincronizada la cola de eventos offline con Supabase.
 * - Escucha online/offline del navegador.
 * - Al reconectar, intenta enviar todo lo pendiente en orden.
 * - Expone `pendientes` (cantidad) y `sincronizando` para mostrar en la UI.
 */
export function useOfflineSync() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendientes, setPendientes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const sincronizandoRef = useRef(false);

  const refrescarContador = useCallback(async () => {
    try {
      const n = await contarPendientes();
      setPendientes(n);
    } catch {
      // IndexedDB no disponible (SSR) -> ignorar
    }
  }, []);

  const sincronizar = useCallback(async () => {
    if (sincronizandoRef.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    sincronizandoRef.current = true;
    setSincronizando(true);
    try {
      const pendientesLista = await listarPendientes();
      for (const evento of pendientesLista) {
        try {
          await enviarEventoPendiente(evento);
          await eliminarPendiente(evento.client_uuid);
        } catch (err) {
          // Si un evento falla repetidamente, lo dejamos en cola pero
          // no bloqueamos el resto; se reintentará en el próximo ciclo.
          if (evento.intentos + 1 >= MAX_INTENTOS) {
            // eslint-disable-next-line no-console
            console.error(
              `[useOfflineSync] evento ${evento.client_uuid} superó reintentos`,
              err
            );
          }
        }
      }
    } finally {
      sincronizandoRef.current = false;
      setSincronizando(false);
      await refrescarContador();
    }
  }, [refrescarContador]);

  useEffect(() => {
    refrescarContador();

    const handleOnline = () => {
      setOnline(true);
      sincronizar();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Reintento periódico por si "online" del navegador da falso positivo
    // (wifi conectado pero sin salida a internet real, común en campo).
    const intervalo = setInterval(() => {
      if (navigator.onLine) sincronizar();
    }, 30_000);

    // Intento inicial al montar (por si quedaron pendientes de la sesión anterior)
    if (navigator.onLine) sincronizar();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { online, pendientes, sincronizando, sincronizarAhora: sincronizar };
}
