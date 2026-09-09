-- Actualiza la paleta a los colores reales del logo, agrega el slogan
-- institucional, y permite iniciar sesión con nombre de usuario además de correo.

update public.contenido_pagina set valor = '#041b73' where seccion = 'paleta' and clave = 'color_azul_oscuro';
update public.contenido_pagina set valor = '#0236a2' where seccion = 'paleta' and clave = 'color_azul_medio';
update public.contenido_pagina set valor = '#0250ce' where seccion = 'paleta' and clave = 'color_azul_brillante';

insert into public.contenido_pagina (seccion, tipo, clave, valor) values
  ('paleta', 'color', 'color_blanco', '#fbfcfc')
on conflict (seccion, clave) do update set valor = excluded.valor;

update public.contenido_pagina
  set valor = 'Educación con Excelencia'
  where seccion = 'hero' and clave = 'subtitulo';

-- Resuelve el correo asociado a un nombre de usuario, para permitir el login
-- con usuario o correo sin exponer la tabla de perfiles a usuarios anónimos.
create or replace function public.correo_por_usuario(p_usuario text)
returns text
language sql
security definer
stable
set search_path = public, auth
as $$
  select u.email
  from auth.users u
  join public.perfiles p on p.id = u.id
  where p.nombre_usuario = p_usuario
  limit 1;
$$;

grant execute on function public.correo_por_usuario(text) to anon, authenticated;
