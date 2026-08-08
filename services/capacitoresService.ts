import { supabase } from "@/lib/supabase/client";
import type { NuevoCapacitorInput } from "@/types";

/**
 * Crea un capacitor: elemento base + detalle técnico en `capacitores`.
 * Mismo patrón que transformadores (rollback si falla el segundo insert).
 */
export async function crearCapacitor(input: NuevoCapacitorInput) {
  const { data: elemento, error: errElemento } = await supabase
    .from("elementos")
    .insert({
      nombre: input.nombre,
      tipo: "capacitor",
      alimentador_id: input.alimentador_id,
      lat: input.lat,
      lng: input.lng,
    })
    .select()
    .single();

  if (errElemento) throw errElemento;

  const { data: capacitor, error: errCapacitor } = await supabase
    .from("capacitores")
    .insert({
      elemento_id: elemento.id,
      potencia_kvar: input.potencia_kvar,
      tension_kv: input.tension_kv,
      tipo: input.tipo,
    })
    .select()
    .single();

  if (errCapacitor) {
    await supabase.from("elementos").delete().eq("id", elemento.id);
    throw errCapacitor;
  }

  return { elemento, capacitor };
}

export async function obtenerCapacitorPorElemento(elementoId: string) {
  const { data, error } = await supabase
    .from("capacitores")
    .select("*")
    .eq("elemento_id", elementoId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
