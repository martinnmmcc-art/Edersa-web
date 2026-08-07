# EDERSA · Red MT El Bolsón

PWA operativa para visualizar la red de media tensión (13.2kV / 33kV) de
El Bolsón y registrar eventos de campo (apertura/cierre de reconectadores,
seccionadores, omnirouter y transformadores), online y offline.

## Stack

- **Next.js 14 (App Router)** — frontend, desplegado en Vercel
- **Supabase** — Postgres + PostGIS, Realtime, Auth (preparado, no activo)
- **Mapbox GL JS** — mapa interactivo
- **IndexedDB (vía `idb`)** — cola de eventos offline
- **Tailwind CSS** — UI, con tokens propios para uso en campo (ver
  `tailwind.config.js`: paleta `estado.*` y `panel.*`)

## Estructura del proyecto

```
app/
  layout.tsx            # layout raíz, registra el service worker
  manifest.ts            # manifest de la PWA (Next lo sirve solo)
  mapa/page.tsx           # pantalla principal (el "Google Maps" de la red)
components/
  Map/
    MapView.tsx           # ciclo de vida de los marcadores sobre el mapa
    crearMarcadorEl.ts     # look del marcador (color=estado, glifo=tipo)
  Panel/
    EventPanel.tsx         # botones grandes ABRIR/CERRAR
    FilterBar.tsx          # filtro por tipo y por alimentador
  Transformadores/
    TransformadorForm.tsx  # alta de transformador (elemento + detalle técnico)
  UI/
    SyncStatus.tsx         # indicador online/offline + pendientes
    IdentificacionOperario.tsx  # "login" liviano sin contraseña (fase inicial)
    RegistrarServiceWorker.tsx
hooks/
  useMap.ts               # ciclo de vida de Mapbox (pedido explícitamente)
  useOfflineSync.ts        # cola offline -> Supabase (pedido explícitamente)
  useElementosEstado.ts    # estado de la red (online + caché offline + realtime)
  useUsuarioLocal.ts
lib/
  supabase/client.ts       # cliente único de Supabase
  db/offlineQueue.ts       # wrapper de IndexedDB
  estado.ts                # colores/labels de estado y tipo
services/
  elementosService.ts      # lectura de elementos + suscripción realtime
  eventosService.ts        # registrar evento (con fallback offline)
  transformadoresService.ts
types/index.ts
sql/001_schema.sql         # esquema completo de Supabase
public/sw.js                # service worker (cachea el shell de la app)
```

## Modelo de datos (resumen)

- **alimentadores**: feeders de 13.2kV / 33kV.
- **elementos**: reconectadores, seccionadores, omnirouter y
  transformadores. Cada uno pertenece a un alimentador (opcional) y tiene
  lat/lng + geometría PostGIS.
- **eventos**: histórico de apertura/cierre/falla/reposición por
  elemento. `client_uuid` es la clave para que un evento generado offline
  nunca se duplique al sincronizar (constraint `unique`).
- **transformadores**: detalle técnico 1:1 con un `elemento` de tipo
  `transformador` (potencia, tensiones, fases, fabricante, serie).
- **v_elementos_estado**: vista que calcula el estado actual de cada
  elemento a partir de su último evento. Es lo único que consume el mapa
  para pintar colores — así el estado nunca se guarda "a mano", siempre
  se deriva del histórico de eventos.

El SQL completo, con índices, la vista y las políticas RLS iniciales,
está en `sql/001_schema.sql`. Correlo una sola vez en el SQL Editor de tu
proyecto de Supabase (o como migration si usás el CLI).

## Cómo funciona el modo offline

1. Al registrar un evento, `eventosService.registrarEvento` intenta
   insertar directo en Supabase.
2. Si `navigator.onLine` es `false`, o el insert falla (red inestable),
   el evento se guarda en IndexedDB (`lib/db/offlineQueue.ts`) con un
   `client_uuid` generado en el momento.
3. `useOfflineSync` escucha `online`/`offline` del navegador **y** hace
   un chequeo cada 30s (porque en campo es común tener wifi/datos
   "conectados" pero sin salida real a internet). Al detectar conexión,
   reintenta enviar todo lo pendiente en orden.
4. El mapa en sí también funciona offline: `useElementosEstado` guarda
   un snapshot de la red en IndexedDB cada vez que la carga con éxito, y
   lo usa como fuente si no hay conexión.
5. El *shell* de la app (HTML/JS/CSS) se cachea aparte con un service
   worker (`public/sw.js`), para que la PWA abra incluso sin conexión.

Esta separación es intencional: datos operativos (eventos, elementos) van
por IndexedDB con lógica de negocio propia; assets estáticos van por el
service worker con una estrategia cache-first genérica.

## Setup local

```bash
npm install
cp .env.example .env.local   # completar con tus claves reales
npm run dev
```

Variables necesarias en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — de tu
  proyecto en supabase.com (Settings → API).
- `NEXT_PUBLIC_MAPBOX_TOKEN` — token público de mapbox.com (Access
  Tokens). Alcanza con el token por defecto para empezar.

## Deploy

1. **GitHub**: `git init && git add . && git commit -m "init" && git push`
   a un repo nuevo.
2. **Supabase**: creá un proyecto, corré `sql/001_schema.sql` en el SQL
   Editor, y cargá alimentadores/elementos iniciales (a mano o con un
   `insert` propio — no incluí seed de datos reales de la red porque son
   datos operativos de EDERSA).
3. **Vercel**: importá el repo, agregá las 3 variables de entorno de
   arriba en Project Settings → Environment Variables, y deploy. Cada
   push a `main` vuelve a desplegar solo.

## Íconos de la PWA

El manifest (`app/manifest.ts`) referencia `/icons/icon-192.png` y
`/icons/icon-512.png`. Agregá esos dos archivos en `public/icons/` con el
logo de EDERSA (no los incluyo generados para no inventar una marca).

## Qué falta a propósito (fase inicial)

- **Auth real**: `IdentificacionOperario` es un nombre guardado en
  `localStorage`, no un login. Las políticas RLS de `sql/001_schema.sql`
  ya están separadas y comentadas para el día que se active Supabase
  Auth: hay que cambiar `using (true)` por `using (auth.role() =
  'authenticated')` y agregar `user_id` a `eventos`.
- **Fotos de evento**: la columna `foto_url` en `eventos` ya existe;
  falta el input de cámara + subida a Supabase Storage.
- **Capas por alimentador con trazado de línea** (hoy el filtro por
  alimentador funciona sobre los elementos, pero no se dibuja el tendido
  como polyline — para eso hay que cargar la geometría del tendido, que
  no estaba en el modelo de datos original).

## Convenciones de código

- Todo lo que habla con Supabase vive en `services/`, nunca directo en
  componentes.
- `hooks/` conecta `services/`+`lib/` con React; no tiene lógica de UI.
- `components/` es lo único que sabe de JSX/Tailwind.
- Nombres de dominio (elemento, alimentador, evento, apertura/cierre) en
  español, consistente con cómo los llama el equipo de EDERSA.
