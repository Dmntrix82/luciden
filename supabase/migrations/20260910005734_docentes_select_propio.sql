-- Faltaba: el propio docente nunca podía leer su fila en "docentes"
-- (solo existía la política para admin_db). Por eso su portal decía
-- que no tenía datos asociados aunque estuvieran bien configurados.
create policy "docentes_select_propio" on public.docentes
  for select using (perfil_id = auth.uid());
