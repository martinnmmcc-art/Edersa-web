-- =========================================================
-- EDERSA · Red MT — Esquema inicial
-- Ejecutar en el SQL Editor de Supabase (o vía CLI / migration)
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists postgis; -- para geografía (lat/lng con índices espaciales)

-- ---------------------------------------------------------
-- 1. ALIMENTADORES (feeders de MT)
-- ---------------------------------------------------------
create table if not exists alimentadores (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,              -- ej: "Alim. Cerro Perito Moreno"
  tension_kv numeric not null check (tension_kv in (13.2, 33)),
  color_mapa text default '#38bdf8', -- color de la capa en el mapa
  activo boolean default true,
  creado_en timestamptz default now()
);

-- ---------------------------------------------------------
-- 2. ELEMENTOS (reconectadores, seccionadores, omnirouter, etc.)
-- ---------------------------------------------------------
create type tipo_elemento as enum (
  'reconectador',
  'seccionador',
  'omnirouter',
  'transformador'
);

create table if not exists elementos (
  id uuid primary key default uuid_generate_v4(),
  alimentador_id uuid references alimentadores(id) on delete set null,
  nombre text not null,              -- ej: "Seccionador SC-14"
  tipo tipo_elemento not null,
  codigo text unique,                -- código de inventario / GIS externo
  lat double precision not null,
  lng double precision not null,
  geom geography(Point, 4326) generated always as (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  ) stored,
  observaciones text,
  activo boolean default true,
  creado_en timestamptz default now()
);

create index if not exists idx_elementos_geom on elementos using gist (geom);
create index if not exists idx_elementos_alimentador on elementos (alimentador_id);
create index if not exists idx_elementos_tipo on elementos (tipo);

-- ---------------------------------------------------------
-- 3. EVENTOS (histórico operativo: apertura / cierre / falla / etc.)
-- ---------------------------------------------------------
create type tipo_evento as enum ('apertura', 'cierre', 'falla', 'reposicion');

create table if not exists eventos (
  id uuid primary key default uuid_generate_v4(),
  elemento_id uuid not null references elementos(id) on delete cascade,
  tipo tipo_evento not null,
  usuario text not null,             -- nombre/legajo del operario (login futuro -> user_id)
  observaciones text,
  foto_url text,                     -- preparado para adjuntar foto del evento
  origen text default 'online' check (origen in ('online', 'offline_sync')),
  client_uuid uuid,                  -- id generado en el dispositivo para evitar duplicados al sincronizar
  fecha timestamptz not null default now(),
  creado_en timestamptz default now(),
  unique (client_uuid)
);

create index if not exists idx_eventos_elemento on eventos (elemento_id, fecha desc);

-- ---------------------------------------------------------
-- 4. TRANSFORMADORES (detalle técnico, 1:1 con un elemento tipo 'transformador')
-- ---------------------------------------------------------
create table if not exists transformadores (
  id uuid primary key default uuid_generate_v4(),
  elemento_id uuid not null unique references elementos(id) on delete cascade,
  potencia_kva numeric not null,
  tension_primaria_kv numeric not null,
  tension_secundaria_kv numeric not null,
  fases smallint default 3 check (fases in (1, 3)),
  fabricante text,
  numero_serie text,
  fecha_instalacion date,
  creado_en timestamptz default now()
);

-- ---------------------------------------------------------
-- 5. VISTA: estado actual de cada elemento (según último evento)
--    Esta vista es la que consume el mapa.
-- ---------------------------------------------------------
create or replace view v_elementos_estado as
select
  e.id,
  e.nombre,
  e.tipo,
  e.alimentador_id,
  a.nombre as alimentador_nombre,
  a.tension_kv,
  e.lat,
  e.lng,
  e.codigo,
  e.activo,
  ult.tipo as ultimo_evento_tipo,
  ult.usuario as ultimo_evento_usuario,
  ult.fecha as ultimo_evento_fecha,
  case
    when ult.tipo in ('cierre', 'reposicion') then 'cerrado'
    when ult.tipo in ('apertura', 'falla') then 'abierto'
    else 'desconocido'
  end as estado
from elementos e
left join alimentadores a on a.id = e.alimentador_id
left join lateral (
  select tipo, usuario, fecha
  from eventos ev
  where ev.elemento_id = e.id
  order by fecha desc
  limit 1
) ult on true;

-- ---------------------------------------------------------
-- 6. Realtime: habilitar réplica para eventos y elementos
-- ---------------------------------------------------------
alter publication supabase_realtime add table eventos;
alter publication supabase_realtime add table elementos;

-- ---------------------------------------------------------
-- 7. RLS — fase inicial "modo prueba" (acceso abierto de lectura/escritura)
--    ⚠️ Reemplazar por políticas basadas en auth.uid() cuando se active login.
-- ---------------------------------------------------------
alter table alimentadores enable row level security;
alter table elementos enable row level security;
alter table eventos enable row level security;
alter table transformadores enable row level security;

create policy "lectura publica alimentadores" on alimentadores for select using (true);
create policy "lectura publica elementos" on elementos for select using (true);
create policy "lectura publica eventos" on eventos for select using (true);
create policy "lectura publica transformadores" on transformadores for select using (true);

-- Escritura abierta en modo prueba (sin login). Al activar Auth, cambiar
-- "using (true)" por "using (auth.role() = 'authenticated')" y agregar
-- columna user_id en eventos referenciando auth.users.
create policy "escritura publica eventos" on eventos for insert with check (true);
create policy "escritura publica elementos" on elementos for all using (true) with check (true);
create policy "escritura publica transformadores" on transformadores for all using (true) with check (true);
create policy "escritura publica alimentadores" on alimentadores for all using (true) with check (true);
