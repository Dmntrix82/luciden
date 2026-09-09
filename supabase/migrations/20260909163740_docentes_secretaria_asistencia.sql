-- Roles docente/secretaria, horario estructurado por curso, asistencia de
-- estudiantes y docentes, calificaciones, pagos, y el ciclo Editor→Lector
-- que se aplica automáticamente cuando vence el contrato (por fecha, no
-- por un campo que haya que sincronizar).

-- ============================================================
-- Roles nuevos
-- ============================================================
alter table public.perfiles drop constraint if exists perfiles_rol_check;
alter table public.perfiles add constraint perfiles_rol_check
  check (rol in ('cliente', 'admin_db', 'admin_contenido', 'docente', 'secretaria'));

-- Vigencia de contrato: null = sin vencimiento, o vigente si la fecha final
-- no ha pasado. Se evalúa siempre al vuelo, nunca queda un campo desincronizado.
create or replace function public.es_editor_activo(p_fecha_final date)
returns boolean
language sql
immutable
as $$
  select p_fecha_final is null or p_fecha_final >= current_date;
$$;

-- ============================================================
-- docentes: se vincula (opcionalmente) a una cuenta de acceso
-- ============================================================
alter table public.docentes add column perfil_id uuid references auth.users(id) on delete set null;
alter table public.docentes add constraint docentes_perfil_id_key unique (perfil_id);

create or replace function public.docente_id_propio()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select d.id
  from public.docentes d
  join public.perfiles p on p.id = auth.uid()
  where d.perfil_id = auth.uid() and p.rol = 'docente';
$$;

create or replace function public.docente_es_editor()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.es_editor_activo(d.fecha_final)
  from public.docentes d
  join public.perfiles p on p.id = auth.uid()
  where d.perfil_id = auth.uid() and p.rol = 'docente';
$$;

-- ============================================================
-- secretarias (siempre tiene cuenta de acceso: id = auth.users.id)
-- ============================================================
create table public.secretarias (
  id uuid primary key references auth.users(id) on delete cascade,
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

comment on table public.secretarias is 'Datos de contrato de la secretaría (rol secretaria).';

create trigger trg_secretarias_updated_at
before update on public.secretarias
for each row execute function public.actualizar_updated_at();

alter table public.secretarias enable row level security;

create policy "secretarias_todo_admin_db" on public.secretarias
  for all
  using (public.rol_actual() = 'admin_db')
  with check (public.rol_actual() = 'admin_db');

create policy "secretarias_select_propio" on public.secretarias
  for select using (id = auth.uid());

create or replace function public.secretaria_es_editor()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.es_editor_activo(s.fecha_final)
  from public.secretarias s
  join public.perfiles p on p.id = auth.uid()
  where s.id = auth.uid() and p.rol = 'secretaria';
$$;

-- ============================================================
-- Historial (creó/eliminó) para docentes/secretarias, ahora que
-- también pueden tener nombre en "nombres"
-- ============================================================
create trigger trg_historial_secretarias
after insert or update or delete on public.secretarias
for each row execute function public.registrar_historial_simple();

-- ============================================================
-- curso_horarios: días de la semana (1=lunes..7=domingo) + horas
-- ============================================================
create table public.curso_horarios (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 1 and 7),
  hora_inicio time not null,
  hora_fin time not null,
  created_at timestamptz not null default now(),
  unique (curso_id, dia_semana)
);

comment on table public.curso_horarios is '1=lunes ... 7=domingo. Un curso puede tener varios días.';

alter table public.curso_horarios enable row level security;

create policy "curso_horarios_select_publico" on public.curso_horarios
  for select using (true);

create policy "curso_horarios_todo_admin_db" on public.curso_horarios
  for all
  using (public.rol_actual() = 'admin_db')
  with check (public.rol_actual() = 'admin_db');

-- ============================================================
-- estudiantes: los docentes/secretaría necesitan poder verlos
-- (solo lectura, nunca editan el registro del estudiante)
-- ============================================================
create policy "estudiantes_select_docente" on public.estudiantes
  for select
  using (curso_id in (select id from public.cursos where docente_id = public.docente_id_propio()));

create policy "estudiantes_select_secretaria" on public.estudiantes
  for select using (public.rol_actual() = 'secretaria');

alter table public.estudiantes add column abandono boolean not null default false;

-- ============================================================
-- asistencias (estudiantes)
-- ============================================================
create table public.asistencias (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  estudiante_id uuid not null references public.estudiantes(id) on delete cascade,
  fecha date not null default current_date,
  estado text not null check (estado in ('presente', 'atrasado', 'falta')),
  registrado_por uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (curso_id, estudiante_id, fecha)
);

create index asistencias_curso_fecha_idx on public.asistencias (curso_id, fecha);

create trigger trg_asistencias_updated_at
before update on public.asistencias
for each row execute function public.actualizar_updated_at();

alter table public.asistencias enable row level security;

create policy "asistencias_todo_admin_db" on public.asistencias
  for all
  using (public.rol_actual() = 'admin_db')
  with check (public.rol_actual() = 'admin_db');

create policy "asistencias_select_docente" on public.asistencias
  for select using (curso_id in (select id from public.cursos where docente_id = public.docente_id_propio()));

create policy "asistencias_escribe_docente" on public.asistencias
  for insert with check (
    public.docente_es_editor()
    and curso_id in (select id from public.cursos where docente_id = public.docente_id_propio())
  );

create policy "asistencias_actualiza_docente" on public.asistencias
  for update using (
    public.docente_es_editor()
    and curso_id in (select id from public.cursos where docente_id = public.docente_id_propio())
  );

create policy "asistencias_select_secretaria" on public.asistencias
  for select using (public.rol_actual() = 'secretaria');

create policy "asistencias_escribe_secretaria" on public.asistencias
  for insert with check (public.rol_actual() = 'secretaria' and public.secretaria_es_editor());

create policy "asistencias_actualiza_secretaria" on public.asistencias
  for update using (public.rol_actual() = 'secretaria' and public.secretaria_es_editor());

-- ============================================================
-- asistencia_docentes (hora de llegada, la marca la secretaría)
-- ============================================================
create table public.asistencia_docentes (
  id uuid primary key default gen_random_uuid(),
  docente_id uuid not null references public.docentes(id) on delete cascade,
  fecha date not null default current_date,
  hora_llegada time not null default current_time,
  registrado_por uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (docente_id, fecha)
);

alter table public.asistencia_docentes enable row level security;

create policy "asistencia_docentes_todo_admin_db" on public.asistencia_docentes
  for all
  using (public.rol_actual() = 'admin_db')
  with check (public.rol_actual() = 'admin_db');

create policy "asistencia_docentes_select_secretaria" on public.asistencia_docentes
  for select using (public.rol_actual() = 'secretaria');

create policy "asistencia_docentes_escribe_secretaria" on public.asistencia_docentes
  for insert with check (public.rol_actual() = 'secretaria' and public.secretaria_es_editor());

create policy "asistencia_docentes_select_propio" on public.asistencia_docentes
  for select using (docente_id = public.docente_id_propio());

-- ============================================================
-- calificaciones
-- ============================================================
create table public.calificaciones (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references public.estudiantes(id) on delete cascade,
  curso_id uuid not null references public.cursos(id) on delete cascade,
  nota_final numeric(5, 2),
  estado text not null default 'en_curso' check (estado in ('en_curso', 'aprobado', 'reprobado')),
  observaciones text,
  registrado_por uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (estudiante_id, curso_id)
);

create trigger trg_calificaciones_updated_at
before update on public.calificaciones
for each row execute function public.actualizar_updated_at();

alter table public.calificaciones enable row level security;

create policy "calificaciones_todo_admin_db" on public.calificaciones
  for all
  using (public.rol_actual() = 'admin_db')
  with check (public.rol_actual() = 'admin_db');

create policy "calificaciones_select_secretaria" on public.calificaciones
  for select using (public.rol_actual() = 'secretaria');

create policy "calificaciones_select_docente" on public.calificaciones
  for select using (curso_id in (select id from public.cursos where docente_id = public.docente_id_propio()));

create policy "calificaciones_escribe_docente" on public.calificaciones
  for insert with check (
    public.docente_es_editor()
    and curso_id in (select id from public.cursos where docente_id = public.docente_id_propio())
  );

create policy "calificaciones_actualiza_docente" on public.calificaciones
  for update using (
    public.docente_es_editor()
    and curso_id in (select id from public.cursos where docente_id = public.docente_id_propio())
  );

create or replace function public.registrar_historial_calificacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor text := public.nombre_usuario_actual();
  nombre_est text;
  nombre_curso text;
begin
  select (nombres || ' ' || apellido_paterno) into nombre_est
    from public.estudiantes where id = coalesce(new.estudiante_id, old.estudiante_id);
  select nombre into nombre_curso from public.cursos where id = coalesce(new.curso_id, old.curso_id);

  if tg_op = 'INSERT' then
    insert into public.historial_cambios (tabla_modificada, registro_id, accion, descripcion_legible, usuario_id, usuario_nombre)
    values (
      'calificaciones', new.id::text, 'creó',
      actor || ' registró la calificación de ' || nombre_est || ' en ' || nombre_curso ||
        ': ' || coalesce(new.nota_final::text, '(sin nota)') || ' (' || new.estado || ').',
      auth.uid(), actor
    );
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.historial_cambios (
      tabla_modificada, registro_id, accion, campo_modificado, valor_anterior, valor_nuevo, descripcion_legible, usuario_id, usuario_nombre
    )
    values (
      'calificaciones', new.id::text, 'modificó', 'nota_final',
      old.nota_final::text, new.nota_final::text,
      actor || ' modificó la calificación de ' || nombre_est || ' en ' || nombre_curso ||
        ': cambió de "' || coalesce(old.nota_final::text, '(vacío)') || '" a "' || coalesce(new.nota_final::text, '(vacío)') || '" (' || new.estado || ').',
      auth.uid(), actor
    );
    return new;
  end if;
  return null;
end;
$$;

create trigger trg_historial_calificaciones
after insert or update on public.calificaciones
for each row execute function public.registrar_historial_calificacion();

-- ============================================================
-- pagos (registro de mensualidades cobradas)
-- ============================================================
create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references public.estudiantes(id) on delete cascade,
  monto numeric(10, 2) not null check (monto > 0),
  fecha_pago date not null default current_date,
  mes_correspondiente text,
  observaciones text,
  registrado_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index pagos_estudiante_idx on public.pagos (estudiante_id);
create index pagos_fecha_idx on public.pagos (fecha_pago);

alter table public.pagos enable row level security;

create policy "pagos_todo_admin_db" on public.pagos
  for all
  using (public.rol_actual() = 'admin_db')
  with check (public.rol_actual() = 'admin_db');

create or replace function public.registrar_historial_pago()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor text := public.nombre_usuario_actual();
  nombre_est text;
begin
  select (nombres || ' ' || apellido_paterno) into nombre_est from public.estudiantes where id = new.estudiante_id;
  insert into public.historial_cambios (tabla_modificada, registro_id, accion, descripcion_legible, usuario_id, usuario_nombre)
  values (
    'pagos', new.id::text, 'creó',
    actor || ' registró un pago de Bs. ' || new.monto || ' de ' || nombre_est ||
      ' (' || coalesce(new.mes_correspondiente, 'sin mes especificado') || ').',
    auth.uid(), actor
  );
  return new;
end;
$$;

create trigger trg_historial_pagos
after insert on public.pagos
for each row execute function public.registrar_historial_pago();

-- ============================================================
-- Permisos base
-- ============================================================
grant select, insert, update, delete on public.secretarias to authenticated;
grant select on public.curso_horarios to anon, authenticated;
grant insert, update, delete on public.curso_horarios to authenticated;
grant select, insert, update, delete on public.asistencias to authenticated;
grant select, insert, update, delete on public.asistencia_docentes to authenticated;
grant select, insert, update, delete on public.calificaciones to authenticated;
grant select, insert, update, delete on public.pagos to authenticated;
