-- Docentes, cursos (con relación a estudiantes), teléfonos múltiples por
-- estudiante, y estado de pago para las alertas visuales del panel.

-- ============================================================
-- TABLA: docentes
-- ============================================================
create table public.docentes (
  id uuid primary key default gen_random_uuid(),
  nombres text not null,
  direccion text,
  carnet_identidad text,
  celular text,
  fecha_inicio date,
  fecha_final date,
  documento_cv boolean not null default false,
  documento_carnet boolean not null default false,
  documento_contrato boolean not null default false,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.docentes is 'Personal docente del instituto (solo visible para admin_db).';

create trigger trg_docentes_updated_at
before update on public.docentes
for each row execute function public.actualizar_updated_at();

alter table public.docentes enable row level security;

create policy "docentes_todo_admin_db" on public.docentes
  for all
  using (public.rol_actual() = 'admin_db')
  with check (public.rol_actual() = 'admin_db');

-- ============================================================
-- TABLA: cursos
-- ============================================================
create table public.cursos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  docente_id uuid references public.docentes(id) on delete set null,
  horario text,
  informacion text,
  imagen_url text,
  fecha_inicio_clases date,
  fecha_fin_clases date,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cursos is 'Cursos del instituto: fuente de la lista de estudiantes y de las tarjetas públicas.';

create trigger trg_cursos_updated_at
before update on public.cursos
for each row execute function public.actualizar_updated_at();

alter table public.cursos enable row level security;

create policy "cursos_select_publico" on public.cursos
  for select using (true);

create policy "cursos_todo_admin_db" on public.cursos
  for all
  using (public.rol_actual() = 'admin_db')
  with check (public.rol_actual() = 'admin_db');

create policy "cursos_actualiza_admin_contenido" on public.cursos
  for update
  using (public.rol_actual() = 'admin_contenido')
  with check (public.rol_actual() = 'admin_contenido');

-- ============================================================
-- Historial simple (creó/modificó/eliminó) reutilizable para
-- tablas que no necesitan el detalle campo por campo.
-- ============================================================
create or replace function public.registrar_historial_simple()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor text := public.nombre_usuario_actual();
  etiqueta text := case tg_table_name
    when 'cursos' then 'curso'
    when 'docentes' then 'docente'
    else tg_table_name
  end;
  nombre_registro text;
begin
  if tg_op = 'INSERT' then
    nombre_registro := coalesce((to_jsonb(new) ->> 'nombre'), (to_jsonb(new) ->> 'nombres'), new.id::text);
    insert into public.historial_cambios (tabla_modificada, registro_id, accion, descripcion_legible, usuario_id, usuario_nombre)
    values (tg_table_name, new.id::text, 'creó', actor || ' creó el ' || etiqueta || ' "' || nombre_registro || '".', auth.uid(), actor);
    return new;
  elsif tg_op = 'UPDATE' then
    nombre_registro := coalesce((to_jsonb(new) ->> 'nombre'), (to_jsonb(new) ->> 'nombres'), new.id::text);
    insert into public.historial_cambios (tabla_modificada, registro_id, accion, descripcion_legible, usuario_id, usuario_nombre)
    values (tg_table_name, new.id::text, 'modificó', actor || ' modificó el ' || etiqueta || ' "' || nombre_registro || '".', auth.uid(), actor);
    return new;
  elsif tg_op = 'DELETE' then
    nombre_registro := coalesce((to_jsonb(old) ->> 'nombre'), (to_jsonb(old) ->> 'nombres'), old.id::text);
    insert into public.historial_cambios (tabla_modificada, registro_id, accion, descripcion_legible, usuario_id, usuario_nombre)
    values (tg_table_name, old.id::text, 'eliminó', actor || ' eliminó el ' || etiqueta || ' "' || nombre_registro || '".', auth.uid(), actor);
    return old;
  end if;
  return null;
end;
$$;

create trigger trg_historial_cursos
after insert or update or delete on public.cursos
for each row execute function public.registrar_historial_simple();

create trigger trg_historial_docentes
after insert or update or delete on public.docentes
for each row execute function public.registrar_historial_simple();

-- ============================================================
-- estudiantes: curso real (FK) y estado de pago
-- ============================================================
alter table public.estudiantes add column curso_id uuid references public.cursos(id);
alter table public.estudiantes add column estado_pago text not null default 'activo'
  check (estado_pago in ('activo', 'pago_pendiente', 'desactivado'));

-- "curso" (texto libre) queda obsoleto pero no se elimina, por si ya hay datos.
alter table public.estudiantes alter column curso drop not null;

create index estudiantes_curso_id_idx on public.estudiantes (curso_id);
create index estudiantes_estado_pago_idx on public.estudiantes (estado_pago);

-- ============================================================
-- TABLA: estudiante_telefonos (varios números por estudiante)
-- ============================================================
create table public.estudiante_telefonos (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references public.estudiantes(id) on delete cascade,
  numero text not null,
  etiqueta text,
  created_at timestamptz not null default now()
);

create index estudiante_telefonos_estudiante_idx on public.estudiante_telefonos (estudiante_id);

alter table public.estudiante_telefonos enable row level security;

create policy "telefonos_todo_admin_db" on public.estudiante_telefonos
  for all
  using (public.rol_actual() = 'admin_db')
  with check (public.rol_actual() = 'admin_db');

-- ============================================================
-- Permisos base (el mismo problema que ya nos afectó antes:
-- las políticas RLS no alcanzan sin el GRANT de tabla).
-- ============================================================
grant select, insert, update, delete on public.docentes to authenticated;
grant select, insert, update, delete on public.cursos to authenticated;
grant select on public.cursos to anon;
grant select, insert, update, delete on public.estudiante_telefonos to authenticated;
