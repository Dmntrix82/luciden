-- Funciones de apoyo para el flujo de registro público.

create or replace function public.nombre_usuario_disponible(nombre text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select not exists (select 1 from public.perfiles where nombre_usuario = nombre);
$$;

grant execute on function public.nombre_usuario_disponible(text) to anon, authenticated;
