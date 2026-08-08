import { supabase } from "@/lib/supabase/client";
import type { NuevoGeneradorInput } from "@/types";

/**
 * Crea un generador (motor a gas/diésel de la central térmica): elemento
 * base + detalle técnico en `generadores`. El estado operativo (en
 * servicio / parado) se registra con los mismos eventos de
 * apertura/cierre que el resto de los equipos, no hay un campo aparte.
 */
export async function crearGenerador(input: NuevoGeneradorInput) {
  const { data: elemento, error: errElemento } = await supabase
    .from("elementos")
    .insert({
      nombre: input.nombre,
      tipo: "generador",
      alimentador_id: input.alimentador_id,
      lat: input.lat,
      lng: input.lng,
    })
    .select()
    .single();

  if (errElemento) throw errElemento;

  const { data: generador, error: errGenerador } = await supabase
    .from("generadores")
    .insert({
      elemento_id: elemento.id,
      tipo_motor: input.tipo_motor,
      potencia_kva: input.potencia_kva,
      tension_salida_kv: input.tension_salida_kv,
    })
    .select()
    .single();

  if (errGenerador) {
    await supabase.from("elementos").delete().eq("id", elemento.id);
    throw errGenerador;
  }

  return { elemento, generador };
}

export async function obtenerGeneradorPorElemento(elementoId: string) {
  const { data, error } = await supabase
    .from("generadores")
    .select("*")
    .eq("elemento_id", elementoId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
