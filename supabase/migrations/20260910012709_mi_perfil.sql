-- Permite que cualquier usuario edite su propio nombre/usuario/foto
-- (el trigger proteger_rol_perfil ya bloquea que se cambien rol/activo
-- sin ser admin_db, así que esta política no abre esas puertas).

alter table public.perfiles add column foto_url text;

create policy "perfiles_update_propio" on public.perfiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Foto de perfil: cada usuario solo puede escribir su propio archivo
-- (perfiles/<su-uuid>.<ext>) dentro del bucket público existente.
create policy "perfiles_foto_insertar" on storage.objects
  for insert with check (bucket_id = 'contenido-publico' and name like 'perfiles/' || auth.uid()::text || '.%');

create policy "perfiles_foto_actualizar" on storage.objects
  for update using (bucket_id = 'contenido-publico' and name like 'perfiles/' || auth.uid()::text || '.%');
