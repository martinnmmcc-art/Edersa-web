import { supabase } from "@/lib/supabase/client";
import type { NuevoTransformadorInput } from "@/types";

/**
 * Crea un transformador: primero el elemento base (mapa) y luego
 * su detalle técnico en `transformadores`, referenciando el elemento.
 * Si falla el segundo paso, revierte el elemento para no dejar
 * un marcador "transformador" sin datos técnicos.
 */
export async function crearTransformador(input: NuevoTransformadorInput) {
  const { data: elemento, error: errElemento } = await supabase
    .from("elementos")
    .insert({
      nombre: input.nombre,
      tipo: "transformador",
      alimentador_id: input.alimentador_id,
      lat: input.lat,
      lng: input.lng,
    })
    .select()
    .single();

  if (errElemento) throw errElemento;

  const { data: transformador, error: errTransformador } = await supabase
    .from("transformadores")
    .insert({
      elemento_id: elemento.id,
      potencia_kva: input.potencia_kva,
      tension_primaria_kv: input.tension_primaria_kv,
      tension_secundaria_kv: input.tension_secundaria_kv,
      fases: input.fases,
      fabricante: input.fabricante ?? null,
      numero_serie: input.numero_serie ?? null,
    })
    .select()
    .single();

  if (errTransformador) {
    // rollback manual del elemento creado
    await supabase.from("elementos").delete().eq("id", elemento.id);
    throw errTransformador;
  }

  return { elemento, transformador };
}

export async function obtenerTransformadorPorElemento(elementoId: string) {
  const { data, error } = await supabase
    .from("transformadores")
    .select("*")
    .eq("elemento_id", elementoId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
