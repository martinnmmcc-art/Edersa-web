"use client";

import { FormEvent, useState } from "react";

export function IdentificacionOperario({
  onIdentificado,
}: {
  onIdentificado: (nombre: string) => void;
}) {
  const [nombre, setNombre] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const limpio = nombre.trim();
    if (limpio.length < 2) return;
    onIdentificado(limpio);
  }

  return (
    <div className="fixed inset-0 z-50 bg-panel flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide">EDERSA</h1>
          <p className="text-slate-400 text-sm">Red de media tensión · El Bolsón</p>
        </div>
        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Nombre del operario
          <input
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="campo-input"
            placeholder="Ej: J. Pérez"
          />
        </label>
        <button
          type="submit"
          disabled={nombre.trim().length < 2}
          className="h-touch rounded-xl bg-acento text-panel font-display text-xl disabled:opacity-40"
        >
          INGRESAR
        </button>
        <p className="text-xs text-slate-500">
          Modo prueba sin contraseña. Este nombre queda guardado en el
          dispositivo y se usa para identificar los eventos que registrés.
        </p>
      </form>
    </div>
  );
}
