-- Al crear las tablas por conexión directa (en vez del editor de Supabase),
-- nunca se otorgaron los GRANT base a los roles anon/authenticated. RLS solo
-- se evalúa DESPUÉS de que el GRANT de la tabla permite la operación, así que
-- sin esto, todo select/insert/update autenticado fallaba con
-- "permission denied for table ..." (42501) sin importar las políticas RLS.

grant usage on schema public to anon, authenticated;

grant select on public.perfiles to authenticated;
grant update on public.perfiles to authenticated;

grant select, insert, update, delete on public.estudiantes to authenticated;

grant select on public.contenido_pagina to anon, authenticated;
grant insert, update, delete on public.contenido_pagina to authenticated;

grant select on public.historial_cambios to authenticated;
