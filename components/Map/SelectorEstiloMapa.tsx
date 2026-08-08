"use client";

import { useState } from "react";
import { OPCIONES_MODO_MAPA } from "@/lib/mapStyles";
import type { ModoMapa } from "@/types";

interface SelectorEstiloMapaProps {
  modoActual: ModoMapa;
  onCambiar: (modo: ModoMapa) => void;
}

export function SelectorEstiloMapa({ modoActual, onCambiar }: SelectorEstiloMapaProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="fixed top-40 right-3 z-20">
      {abierto && (
        <div className="mb-2 bg-panel-raised border border-panel-border rounded-xl overflow-hidden shadow-xl">
          {OPCIONES_MODO_MAPA.map(({ modo, label }) => (
            <button
              key={modo}
              onClick={() => {
                onCambiar(modo);
                setAbierto(false);
              }}
              className={`w-32 h-touch flex items-center px-3 text-sm font-medium border-b border-panel-border last:border-b-0 ${
                modo === modoActual
                  ? "bg-acento text-panel"
                  : "text-slate-200 active:bg-panel"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Cambiar tipo de mapa"
        className="w-touch h-touch rounded-xl bg-panel-raised border border-panel-border text-slate-200 flex items-center justify-center shadow-lg"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2 2 7l10 5 10-5-10-5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="m2 12 10 5 10-5M2 17l10 5 10-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
