-- Instituto LUCIDEN — esquema inicial
-- Tablas: perfiles, estudiantes, contenido_pagina, historial_cambios
-- Incluye RLS por rol y triggers de auditoría en español.

create extension if not exists pgcrypto;

-- ============================================================
-- TABLA: perfiles
-- ============================================================
create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_usuario text unique,
  nombre_completo text,
  rol text not null default 'cliente' check (rol in ('cliente', 'admin_db', 'admin_contenido')),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.perfiles is 'Perfil y rol de cada usuario registrado.';

-- Devuelve el rol del usuario autenticado actual sin recursión de RLS.
create or replace function public.rol_actual()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select rol from public.perfiles where id = auth.uid();
$$;

-- Crea automáticamente el perfil al registrarse un usuario nuevo.
create or replace function public.manejar_usuario_nuevo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre_usuario, nombre_completo)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nombre_usuario',
    new.raw_user_meta_data ->> 'nombre_completo'
  );
  return new;
end;
$$;

create trigger trg_manejar_usuario_nuevo
after insert on auth.users
for each row execute function public.manejar_usuario_nuevo();

-- Impide que un usuario se auto-asigne un rol o se reactive/desactive.
create or replace function public.proteger_rol_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.rol is distinct from old.rol or new.activo is distinct from old.activo)
     and public.rol_actual() is distinct from 'admin_db' then
    raise exception 'No tienes permiso para modificar el rol o el estado de la cuenta.';
  end if;
  return new;
end;
$$;

create trigger trg_proteger_rol_perfil
before update on public.perfiles
for each row execute function public.proteger_rol_perfil();

alter table public.perfiles enable row level security;

create policy "perfiles_select_propio" on public.perfiles
  for select using (id = auth.uid());

create policy "perfiles_select_admin_db" on public.perfiles
  for select using (public.rol_actual() = 'admin_db');

create policy "perfiles_update_admin_db" on public.perfiles
  for update using (public.rol_actual() = 'admin_db');

-- ============================================================
-- TABLA: estudiantes
-- ============================================================
create table public.estudiantes (
  id uuid primary key default gen_random_uuid(),
  codigo_estudiante text not null unique,
  apellido_paterno text not null,
  apellido_materno text not null,
  nombres text not null,
  sexo text not null check (sexo in ('Masculino', 'Femenino')),
  fecha_nacimiento date not null,
  cedula_identidad text not null unique,
  fecha_inscripcion date not null,
  fecha_inicio date,
  fecha_final date,
  curso text not null,
  mensualidad numeric(10, 2) not null default 0,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid()
);

comment on table public.estudiantes is 'Registro de estudiantes del instituto.';

create index estudiantes_curso_idx on public.estudiantes (curso);
create index estudiantes_fecha_inscripcion_idx on public.estudiantes (fecha_inscripcion);

create or replace function public.actualizar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_estudiantes_updated_at
before update on public.estudiantes
for each row execute function public.actualizar_updated_at();

alter table public.estudiantes enable row level security;

create policy "estudiantes_todo_admin_db" on public.estudiantes
  for all
  using (public.rol_actual() = 'admin_db')
  with check (public.rol_actual() = 'admin_db');

-- ============================================================
-- TABLA: historial_cambios
-- ============================================================
create table public.historial_cambios (
  id uuid primary key default gen_random_uuid(),
  tabla_modificada text not null,
  registro_id text not null,
  accion text not null check (accion in ('creó', 'modificó', 'eliminó')),
  campo_modificado text,
  valor_anterior text,
  valor_nuevo text,
  descripcion_legible text not null,
  usuario_id uuid references auth.users(id),
  usuario_nombre text,
  fecha_hora timestamptz not null default now()
);

comment on table public.historial_cambios is 'Auditoría legible en español de cambios en estudiantes y contenido.';

create index historial_cambios_tabla_registro_idx on public.historial_cambios (tabla_modificada, registro_id);

alter table public.historial_cambios enable row level security;

create policy "historial_select_admins" on public.historial_cambios
  for select using (public.rol_actual() in ('admin_db', 'admin_contenido'));

-- Nombre legible del usuario autenticado actual, para usar en el historial.
create or replace function public.nombre_usuario_actual()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select coalesce(nombre_completo, nombre_usuario) from public.perfiles where id = auth.uid()),
    'Usuario desconocido'
  );
$$;

-- Etiqueta en español de cada campo de estudiantes, para mensajes legibles.
create or replace function public.etiqueta_campo_estudiante(campo text)
returns text
language sql
immutable
as $$
  select case campo
    when 'codigo_estudiante' then 'Código de Estudiante'
    when 'apellido_paterno' then 'Apellido Paterno'
    when 'apellido_materno' then 'Apellido Materno'
    when 'nombres' then 'Nombres'
    when 'sexo' then 'Sexo'
    when 'fecha_nacimiento' then 'Fecha de Nacimiento'
    when 'cedula_identidad' then 'Cédula de Identidad'
    when 'fecha_inscripcion' then 'Fecha de Inscripción'
    when 'fecha_inicio' then 'Fecha de Inicio'
    when 'fecha_final' then 'Fecha Final'
    when 'curso' then 'Curso'
    when 'mensualidad' then 'Mensualidad'
    when 'observaciones' then 'Observaciones'
    else campo
  end;
$$;

create or replace function public.registrar_historial_estudiante()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor text := public.nombre_usuario_actual();
  nombre_completo_estudiante text;
  campo text;
  valor_antes text;
  valor_despues text;
  claves_omitidas text[] := array['id', 'created_at', 'updated_at', 'created_by'];
begin
  if tg_op = 'INSERT' then
    nombre_completo_estudiante := new.nombres || ' ' || new.apellido_paterno || ' ' || new.apellido_materno;
    insert into public.historial_cambios (
      tabla_modificada, registro_id, accion, descripcion_legible, usuario_id, usuario_nombre
    ) values (
      'estudiantes', new.id::text, 'creó',
      actor || ' registró al estudiante ' || nombre_completo_estudiante || ' (código ' || new.codigo_estudiante || ').',
      auth.uid(), actor
    );
    return new;

  elsif tg_op = 'UPDATE' then
    nombre_completo_estudiante := new.nombres || ' ' || new.apellido_paterno || ' ' || new.apellido_materno;
    for campo in select key from jsonb_each_text(to_jsonb(new)) loop
      if campo = any(claves_omitidas) then
        continue;
      end if;
      valor_antes := (to_jsonb(old) ->> campo);
      valor_despues := (to_jsonb(new) ->> campo);
      if valor_antes is distinct from valor_despues then
        insert into public.historial_cambios (
          tabla_modificada, registro_id, accion, campo_modificado,
          valor_anterior, valor_nuevo, descripcion_legible, usuario_id, usuario_nombre
        ) values (
          'estudiantes', new.id::text, 'modificó', campo,
          valor_antes, valor_despues,
          actor || ' modificó ' || public.etiqueta_campo_estudiante(campo) || ' del estudiante ' ||
            nombre_completo_estudiante || ': cambió de "' || coalesce(valor_antes, '(vacío)') ||
            '" a "' || coalesce(valor_despues, '(vacío)') || '".',
          auth.uid(), actor
        );
      end if;
    end loop;
    return new;

  elsif tg_op = 'DELETE' then
    nombre_completo_estudiante := old.nombres || ' ' || old.apellido_paterno || ' ' || old.apellido_materno;
    insert into public.historial_cambios (
      tabla_modificada, registro_id, accion, descripcion_legible, usuario_id, usuario_nombre
    ) values (
      'estudiantes', old.id::text, 'eliminó',
      actor || ' eliminó al estudiante ' || nombre_completo_estudiante || ' (código ' || old.codigo_estudiante || ').',
      auth.uid(), actor
    );
    return old;
  end if;
  return null;
end;
$$;

create trigger trg_historial_estudiantes
after insert or update or delete on public.estudiantes
for each row execute function public.registrar_historial_estudiante();

-- ============================================================
-- TABLA: contenido_pagina
-- ============================================================
create table public.contenido_pagina (
  id uuid primary key default gen_random_uuid(),
  seccion text not null,
  tipo text not null check (tipo in ('texto', 'imagen', 'tipografia', 'color')),
  clave text not null,
  valor text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  unique (seccion, clave)
);

comment on table public.contenido_pagina is 'Contenido editable de la página pública (textos, imágenes, tipografía, colores).';

alter table public.contenido_pagina enable row level security;

create policy "contenido_select_publico" on public.contenido_pagina
  for select using (true);

create policy "contenido_todo_admin_contenido" on public.contenido_pagina
  for all
  using (public.rol_actual() = 'admin_contenido')
  with check (public.rol_actual() = 'admin_contenido');

create or replace function public.registrar_historial_contenido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor text := public.nombre_usuario_actual();
begin
  new.updated_at = now();
  new.updated_by = auth.uid();

  if tg_op = 'INSERT' then
    insert into public.historial_cambios (
      tabla_modificada, registro_id, accion, campo_modificado, valor_nuevo,
      descripcion_legible, usuario_id, usuario_nombre
    ) values (
      'contenido_pagina', new.id::text, 'creó', new.clave, new.valor,
      actor || ' creó el contenido "' || new.clave || '" en la sección "' || new.seccion || '".',
      auth.uid(), actor
    );
    return new;

  elsif tg_op = 'UPDATE' then
    if old.valor is distinct from new.valor then
      insert into public.historial_cambios (
        tabla_modificada, registro_id, accion, campo_modificado,
        valor_anterior, valor_nuevo, descripcion_legible, usuario_id, usuario_nombre
      ) values (
        'contenido_pagina', new.id::text, 'modificó', new.clave,
        old.valor, new.valor,
        actor || ' modificó "' || new.clave || '" en la sección "' || new.seccion ||
          '": cambió de "' || coalesce(old.valor, '(vacío)') || '" a "' || coalesce(new.valor, '(vacío)') || '".',
        auth.uid(), actor
      );
    end if;
    return new;
  end if;
  return new;
end;
$$;

create trigger trg_historial_contenido_ins_upd
before insert or update on public.contenido_pagina
for each row execute function public.registrar_historial_contenido();

create or replace function public.registrar_historial_contenido_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor text := public.nombre_usuario_actual();
begin
  insert into public.historial_cambios (
    tabla_modificada, registro_id, accion, campo_modificado, valor_anterior,
    descripcion_legible, usuario_id, usuario_nombre
  ) values (
    'contenido_pagina', old.id::text, 'eliminó', old.clave, old.valor,
    actor || ' eliminó el contenido "' || old.clave || '" de la sección "' || old.seccion || '".',
    auth.uid(), actor
  );
  return old;
end;
$$;

create trigger trg_historial_contenido_del
before delete on public.contenido_pagina
for each row execute function public.registrar_historial_contenido_delete();
