"use client";

import { useState, FormEvent } from "react";
import { crearTransformador } from "@/services/transformadoresService";
import type { Alimentador } from "@/types";

interface TransformadorFormProps {
  alimentadores: Alimentador[];
  ubicacionPreseleccionada: { lat: number; lng: number } | null;
  onCerrar: () => void;
  onCreado: () => void;
}

export function TransformadorForm({
  alimentadores,
  ubicacionPreseleccionada,
  onCerrar,
  onCreado,
}: TransformadorFormProps) {
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const form = new FormData(e.currentTarget);
    const lat = Number(form.get("lat"));
    const lng = Number(form.get("lng"));

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setErrorMsg("Ubicación inválida. Tocá el mapa para fijar el punto.");
      return;
    }

    setGuardando(true);
    try {
      await crearTransformador({
        nombre: String(form.get("nombre")),
        alimentador_id: (form.get("alimentador_id") as string) || null,
        lat,
        lng,
        potencia_kva: Number(form.get("potencia_kva")),
        tension_primaria_kv: Number(form.get("tension_primaria_kv")),
        tension_secundaria_kv: Number(form.get("tension_secundaria_kv")),
        fases: Number(form.get("fases")) as 1 | 3,
        fabricante: String(form.get("fabricante") || ""),
        numero_serie: String(form.get("numero_serie") || ""),
      });
      onCreado();
      onCerrar();
    } catch (err: any) {
      setErrorMsg(err?.message ?? "No se pudo guardar el transformador.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-end sm:items-center justify-center">
      <div className="bg-panel-raised border border-panel-border rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5">
        <h2 className="font-display text-2xl mb-4">Nuevo transformador</h2>

        {!ubicacionPreseleccionada && (
          <p className="text-sm text-acento mb-3">
            Tip: cerrá este formulario, tocá el mapa en la ubicación del
            transformador y volvé a abrir &quot;Nuevo transformador&quot;
            para que la posición se cargue sola.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Campo label="Nombre / identificador">
            <input
              name="nombre"
              required
              className="campo-input"
              placeholder="Ej: TR-22 Barrio Usina"
            />
          </Campo>

          <Campo label="Alimentador">
            <select name="alimentador_id" className="campo-input">
              <option value="">Sin asignar</option>
              {alimentadores.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} ({a.tension_kv}kV)
                </option>
              ))}
            </select>
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Latitud">
              <input
                name="lat"
                required
                type="number"
                step="any"
                defaultValue={ubicacionPreseleccionada?.lat}
                className="campo-input"
              />
            </Campo>
            <Campo label="Longitud">
              <input
                name="lng"
                required
                type="number"
                step="any"
                defaultValue={ubicacionPreseleccionada?.lng}
                className="campo-input"
              />
            </Campo>
          </div>

          <Campo label="Potencia (kVA)">
            <input
              name="potencia_kva"
              required
              type="number"
              step="any"
              className="campo-input"
              placeholder="Ej: 100"
            />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Tensión primaria (kV)">
              <input
                name="tension_primaria_kv"
                required
                type="number"
                step="any"
                defaultValue={13.2}
                className="campo-input"
              />
            </Campo>
            <Campo label="Tensión secundaria (kV)">
              <input
                name="tension_secundaria_kv"
                required
                type="number"
                step="any"
                defaultValue={0.4}
                className="campo-input"
              />
            </Campo>
          </div>

          <Campo label="Fases">
            <select name="fases" className="campo-input" defaultValue={3}>
              <option value={3}>Trifásico</option>
              <option value={1}>Monofásico</option>
            </select>
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Fabricante (opcional)">
              <input name="fabricante" className="campo-input" />
            </Campo>
            <Campo label="N° de serie (opcional)">
              <input name="numero_serie" className="campo-input" />
            </Campo>
          </div>

          {errorMsg && (
            <p className="text-sm text-estado-abierto">{errorMsg}</p>
          )}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 h-touch rounded-xl border border-panel-border text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 h-touch rounded-xl bg-acento text-panel font-semibold disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-300">
      {label}
      {children}
    </label>
  );
}
