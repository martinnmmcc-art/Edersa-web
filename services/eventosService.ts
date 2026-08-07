import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase/client";
import { encolarEvento } from "@/lib/db/offlineQueue";
import type { EventoInput, TipoEvento } from "@/types";

/**
 * Registra un evento operativo (apertura/cierre/etc.).
 * Si hay conexión, inserta directo en Supabase.
 * Si falla (sin internet, timeout, etc.), lo encola en IndexedDB
 * para que useOfflineSync lo reintente más tarde.
 */
export async function registrarEvento(params: {
  elemento_id: string;
  tipo: TipoEvento;
  usuario: string;
  observaciones?: string;
}): Promise<{ ok: boolean; offline: boolean }> {
  const evento: EventoInput = {
    client_uuid: uuidv4(),
    elemento_id: params.elemento_id,
    tipo: params.tipo,
    usuario: params.usuario,
    observaciones: params.observaciones,
    fecha: new Date().toISOString(),
  };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await encolarEvento({ ...evento, intentos: 0, creado_en: evento.fecha });
    return { ok: true, offline: true };
  }

  const { error } = await supabase.from("eventos").insert({
    client_uuid: evento.client_uuid,
    elemento_id: evento.elemento_id,
    tipo: evento.tipo,
    usuario: evento.usuario,
    observaciones: evento.observaciones ?? null,
    fecha: evento.fecha,
    origen: "online",
  });

  if (error) {
    // Conexión inestable / error de red: no perdemos el evento, lo encolamos.
    await encolarEvento({ ...evento, intentos: 0, creado_en: evento.fecha });
    return { ok: true, offline: true };
  }

  return { ok: true, offline: false };
}

/** Usado por useOfflineSync para reenviar un evento ya encolado. */
export async function enviarEventoPendiente(evento: EventoInput) {
  const { error } = await supabase.from("eventos").insert({
    client_uuid: evento.client_uuid,
    elemento_id: evento.elemento_id,
    tipo: evento.tipo,
    usuario: evento.usuario,
    observaciones: evento.observaciones ?? null,
    foto_url: evento.foto_url ?? null,
    fecha: evento.fecha,
    origen: "offline_sync",
  });

  // Si el error es de "unique violation" en client_uuid, el evento ya
  // se sincronizó antes (reintento duplicado) -> lo tratamos como éxito.
  if (error && error.code !== "23505") {
    throw error;
  }
}
