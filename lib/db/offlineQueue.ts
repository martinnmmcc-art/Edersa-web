import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { EventoPendiente } from "@/types";

interface EdersaDB extends DBSchema {
  eventos_pendientes: {
    key: string; // client_uuid
    value: EventoPendiente;
    indexes: { "by-fecha": string };
  };
  cache_elementos: {
    key: string; // id del elemento
    value: any; // snapshot de v_elementos_estado, para render offline
  };
}

const DB_NAME = "edersa-red-mt";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<EdersaDB>> | null = null;

function getDB() {
  if (typeof window === "undefined") {
    // En SSR no hay IndexedDB; el llamador debe evitar invocar esto en servidor.
    throw new Error("offlineQueue solo puede usarse en el cliente");
  }
  if (!dbPromise) {
    dbPromise = openDB<EdersaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("eventos_pendientes")) {
          const store = db.createObjectStore("eventos_pendientes", {
            keyPath: "client_uuid",
          });
          store.createIndex("by-fecha", "creado_en");
        }
        if (!db.objectStoreNames.contains("cache_elementos")) {
          db.createObjectStore("cache_elementos", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

/** Encola un evento generado offline (o cuando falla el insert online). */
export async function encolarEvento(evento: EventoPendiente) {
  const db = await getDB();
  await db.put("eventos_pendientes", evento);
}

/** Devuelve todos los eventos pendientes de sincronizar, ordenados por fecha. */
export async function listarPendientes(): Promise<EventoPendiente[]> {
  const db = await getDB();
  return db.getAllFromIndex("eventos_pendientes", "by-fecha");
}

export async function eliminarPendiente(client_uuid: string) {
  const db = await getDB();
  await db.delete("eventos_pendientes", client_uuid);
}

export async function contarPendientes(): Promise<number> {
  const db = await getDB();
  return db.count("eventos_pendientes");
}

/** Guarda un snapshot de elementos para poder pintar el mapa sin conexión. */
export async function guardarCacheElementos(elementos: any[]) {
  const db = await getDB();
  const tx = db.transaction("cache_elementos", "readwrite");
  await Promise.all(elementos.map((el) => tx.store.put(el)));
  await tx.done;
}

export async function leerCacheElementos(): Promise<any[]> {
  const db = await getDB();
  return db.getAll("cache_elementos");
}
