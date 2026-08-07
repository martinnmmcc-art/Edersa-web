"use client";

import { useMemo, useState } from "react";
import { MapView } from "@/components/Map/MapView";
import { FilterBar } from "@/components/Panel/FilterBar";
import { EventPanel } from "@/components/Panel/EventPanel";
import { SyncStatus } from "@/components/UI/SyncStatus";
import { IdentificacionOperario } from "@/components/UI/IdentificacionOperario";
import { TransformadorForm } from "@/components/Transformadores/TransformadorForm";
import { useElementosEstado } from "@/hooks/useElementosEstado";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useUsuarioLocal } from "@/hooks/useUsuarioLocal";
import { obtenerAlimentadores } from "@/services/elementosService";
import { useEffect } from "react";
import type { Alimentador, ElementoEstado, TipoElemento } from "@/types";

const TODOS_LOS_TIPOS: TipoElemento[] = [
  "reconectador",
  "seccionador",
  "omnirouter",
  "transformador",
];

export default function MapaPage() {
  const { usuario, setUsuario, cargado } = useUsuarioLocal();
  const { elementos, cargando, error, recargar } = useElementosEstado();
  const { online, pendientes, sincronizando } = useOfflineSync();

  const [alimentadores, setAlimentadores] = useState<Alimentador[]>([]);
  const [tiposActivos, setTiposActivos] = useState<Set<TipoElemento>>(
    new Set(TODOS_LOS_TIPOS)
  );
  const [alimentadorId, setAlimentadorId] = useState<string | "todos">("todos");
  const [elementoSeleccionado, setElementoSeleccionado] =
    useState<ElementoEstado | null>(null);

  const [modoAltaTransformador, setModoAltaTransformador] = useState(false);
  const [ubicacionNuevoTransformador, setUbicacionNuevoTransformador] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mostrarFormTransformador, setMostrarFormTransformador] = useState(false);

  useEffect(() => {
    obtenerAlimentadores()
      .then((data) => setAlimentadores(data as Alimentador[]))
      .catch(() => {
        /* si falla (ej. offline), simplemente no se muestran filtros por alimentador */
      });
  }, []);

  const elementosFiltrados = useMemo(() => {
    return elementos.filter((el) => {
      if (!tiposActivos.has(el.tipo)) return false;
      if (alimentadorId !== "todos" && el.alimentador_id !== alimentadorId)
        return false;
      return true;
    });
  }, [elementos, tiposActivos, alimentadorId]);

  function toggleTipo(tipo: TipoElemento) {
    setTiposActivos((prev) => {
      const next = new Set(prev);
      if (next.has(tipo)) next.delete(tipo);
      else next.add(tipo);
      return next;
    });
  }

  function handleClickMapa(coords: { lat: number; lng: number }) {
    if (!modoAltaTransformador) return;
    setUbicacionNuevoTransformador(coords);
    setMostrarFormTransformador(true);
    setModoAltaTransformador(false);
  }

  if (!cargado) return null; // evita parpadeo mientras se lee localStorage

  if (!usuario) {
    return <IdentificacionOperario onIdentificado={setUsuario} />;
  }

  return (
    <main className="h-dvh w-full relative overflow-hidden">
      <MapView
        elementos={elementosFiltrados}
        elementoSeleccionadoId={elementoSeleccionado?.id ?? null}
        onSeleccionarElemento={setElementoSeleccionado}
        onClickMapa={handleClickMapa}
      />

      <FilterBar
        tiposActivos={tiposActivos}
        onToggleTipo={toggleTipo}
        alimentadores={alimentadores}
        alimentadorId={alimentadorId}
        onCambiarAlimentador={setAlimentadorId}
      />

      {(cargando || error) && (
        <div className="fixed top-24 inset-x-4 z-20 bg-panel-raised border border-panel-border rounded-lg p-3 text-sm text-slate-300">
          {cargando ? "Cargando red…" : error}
        </div>
      )}

      {/* Botón flotante: alta de transformador */}
      <button
        onClick={() => setModoAltaTransformador((v) => !v)}
        className={`fixed bottom-4 left-4 z-20 h-touch px-4 rounded-full font-semibold shadow-lg transition ${
          modoAltaTransformador
            ? "bg-acento text-panel"
            : "bg-panel-raised border border-panel-border text-slate-200"
        }`}
      >
        {modoAltaTransformador ? "Tocá el mapa…" : "+ Transformador"}
      </button>

      <SyncStatus online={online} pendientes={pendientes} sincronizando={sincronizando} />

      {elementoSeleccionado && (
        <EventPanel
          elemento={elementoSeleccionado}
          usuario={usuario}
          onCerrarPanel={() => setElementoSeleccionado(null)}
          onEventoRegistrado={() => recargar()}
        />
      )}

      {mostrarFormTransformador && (
        <TransformadorForm
          alimentadores={alimentadores}
          ubicacionPreseleccionada={ubicacionNuevoTransformador}
          onCerrar={() => {
            setMostrarFormTransformador(false);
            setUbicacionNuevoTransformador(null);
          }}
          onCreado={() => recargar()}
        />
      )}
    </main>
  );
}
