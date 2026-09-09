-- Desactiva automáticamente a los estudiantes "activos" (sin deuda) cuya
-- fecha final ya pasó. Los que están en "pago_pendiente" NO se tocan:
-- deben quedar visibles como deuda hasta que alguien lo resuelva a mano.

-- El historial ya distingue "Usuario desconocido" (perfil no encontrado)
-- de un proceso sin sesión (cron); esto último ahora se lee como "Sistema".
create or replace function public.nombre_usuario_actual()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select case
    when auth.uid() is null then 'Sistema (proceso automático)'
    else coalesce(
      (select coalesce(nombre_completo, nombre_usuario) from public.perfiles where id = auth.uid()),
      'Usuario desconocido'
    )
  end;
$$;

create or replace function public.desactivar_estudiantes_vencidos()
returns void
language sql
security definer
set search_path = public
as $$
  update public.estudiantes
  set estado_pago = 'desactivado'
  where estado_pago = 'activo'
    and fecha_final is not null
    and fecha_final < current_date;
$$;

create extension if not exists pg_cron;

select cron.schedule(
  'desactivar-estudiantes-vencidos',
  '0 8 * * *', -- 08:00 UTC = 04:00 hora de Bolivia
  'select public.desactivar_estudiantes_vencidos();'
);
