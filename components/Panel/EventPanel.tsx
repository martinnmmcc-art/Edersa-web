"use client";

import { useState } from "react";
import { registrarEvento } from "@/services/eventosService";
import { COLOR_ESTADO, LABEL_ESTADO, LABEL_TIPO } from "@/lib/estado";
import type { ElementoEstado } from "@/types";

interface EventPanelProps {
  elemento: ElementoEstado;
  usuario: string;
  onCerrarPanel: () => void;
  onEventoRegistrado: (offline: boolean) => void;
}

export function EventPanel({
  elemento,
  usuario,
  onCerrarPanel,
  onEventoRegistrado,
}: EventPanelProps) {
  const [enviando, setEnviando] = useState<"apertura" | "cierre" | null>(null);

  async function handleRegistrar(tipo: "apertura" | "cierre") {
    setEnviando(tipo);
    try {
      const resultado = await registrarEvento({
        elemento_id: elemento.id,
        tipo,
        usuario,
      });
      onEventoRegistrado(resultado.offline);
      onCerrarPanel();
    } finally {
      setEnviando(null);
    }
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 bg-panel-raised border-t border-panel-border rounded-t-2xl shadow-2xl safe-area-bottom"
      role="dialog"
      aria-label={`Registrar evento para ${elemento.nombre}`}
    >
      <div className="max-w-lg mx-auto p-4 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {LABEL_TIPO[elemento.tipo]}
              {elemento.alimentador_nombre ? ` · ${elemento.alimentador_nombre}` : ""}
            </p>
            <h2 className="font-display text-2xl leading-tight">{elemento.nombre}</h2>
            <p
              className="text-sm mt-1 font-semibold"
              style={{ color: COLOR_ESTADO[elemento.estado] }}
            >
              Estado actual: {LABEL_ESTADO[elemento.estado]}
            </p>
          </div>
          <button
            onClick={onCerrarPanel}
            aria-label="Cerrar panel"
            className="text-slate-400 hover:text-slate-100 text-2xl leading-none px-2 h-touch"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleRegistrar("apertura")}
            disabled={enviando !== null}
            className="h-16 rounded-xl bg-estado-abierto text-white font-display text-2xl tracking-wide disabled:opacity-50 active:scale-95 transition"
          >
            {enviando === "apertura" ? "Guardando…" : "ABRIR"}
          </button>
          <button
            onClick={() => handleRegistrar("cierre")}
            disabled={enviando !== null}
            className="h-16 rounded-xl bg-estado-cerrado text-white font-display text-2xl tracking-wide disabled:opacity-50 active:scale-95 transition"
          >
            {enviando === "cierre" ? "Guardando…" : "CERRAR"}
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-3 text-center">
          Operario: {usuario}
        </p>
      </div>
    </div>
  );
}
