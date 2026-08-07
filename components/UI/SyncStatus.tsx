"use client";

interface SyncStatusProps {
  online: boolean;
  pendientes: number;
  sincronizando: boolean;
}

export function SyncStatus({ online, pendientes, sincronizando }: SyncStatusProps) {
  if (online && pendientes === 0) {
    return (
      <div className="fixed bottom-4 right-4 z-20 flex items-center gap-2 bg-panel-raised border border-panel-border rounded-full px-3 py-1.5 text-xs text-slate-400">
        <span className="w-2 h-2 rounded-full bg-estado-cerrado" />
        En línea
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-20 flex items-center gap-2 bg-panel-raised border border-estado-offline/60 rounded-full px-3 py-1.5 text-xs text-estado-offline font-semibold">
      <span
        className={`w-2 h-2 rounded-full bg-estado-offline ${
          sincronizando ? "animate-pulse" : ""
        }`}
      />
      {online
        ? sincronizando
          ? `Sincronizando ${pendientes}…`
          : `${pendientes} evento(s) pendiente(s)`
        : `Sin conexión · ${pendientes} en cola`}
    </div>
  );
}
