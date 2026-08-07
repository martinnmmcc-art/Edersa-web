import { supabase } from "@/lib/supabase/client";
import type { ElementoEstado } from "@/types";

/** Trae el estado actual de todos los elementos (vista v_elementos_estado). */
export async function obtenerElementosConEstado(): Promise<ElementoEstado[]> {
  const { data, error } = await supabase
    .from("v_elementos_estado")
    .select("*")
    .eq("activo", true);

  if (error) throw error;
  return (data ?? []) as ElementoEstado[];
}

export async function obtenerAlimentadores() {
  const { data, error } = await supabase
    .from("alimentadores")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  if (error) throw error;
  return data ?? [];
}

/**
 * Se suscribe a cambios en `eventos` (nuevo evento = posible cambio de estado)
 * y llama a `onCambio` para que el consumidor vuelva a pedir el estado.
 * Devuelve una función para cancelar la suscripción.
 */
export function suscribirseAEventos(onCambio: () => void) {
  const canal = supabase
    .channel("eventos-realtime")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "eventos" },
      () => onCambio()
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "elementos" },
      () => onCambio()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(canal);
  };
}

export async function crearElemento(input: {
  nombre: string;
  tipo: string;
  alimentador_id: string | null;
  lat: number;
  lng: number;
  codigo?: string;
}) {
  const { data, error } = await supabase
    .from("elementos")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}
