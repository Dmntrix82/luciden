-- admin_db también sube imágenes de curso desde su propio panel
-- (antes las políticas de storage solo dejaban escribir a admin_contenido).

drop policy if exists "contenido_publico_escritura_admin" on storage.objects;
drop policy if exists "contenido_publico_actualiza_admin" on storage.objects;
drop policy if exists "contenido_publico_elimina_admin" on storage.objects;

create policy "contenido_publico_escritura_admin" on storage.objects
  for insert with check (bucket_id = 'contenido-publico' and public.rol_actual() in ('admin_contenido', 'admin_db'));

create policy "contenido_publico_actualiza_admin" on storage.objects
  for update using (bucket_id = 'contenido-publico' and public.rol_actual() in ('admin_contenido', 'admin_db'));

create policy "contenido_publico_elimina_admin" on storage.objects
  for delete using (bucket_id = 'contenido-publico' and public.rol_actual() in ('admin_contenido', 'admin_db'));
