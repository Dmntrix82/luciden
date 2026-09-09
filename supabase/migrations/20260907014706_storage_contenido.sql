-- Bucket público para imágenes y fuentes gestionadas por Admin Contenido.

insert into storage.buckets (id, name, public)
values ('contenido-publico', 'contenido-publico', true)
on conflict (id) do nothing;

create policy "contenido_publico_lectura" on storage.objects
  for select using (bucket_id = 'contenido-publico');

create policy "contenido_publico_escritura_admin" on storage.objects
  for insert with check (bucket_id = 'contenido-publico' and public.rol_actual() = 'admin_contenido');

create policy "contenido_publico_actualiza_admin" on storage.objects
  for update using (bucket_id = 'contenido-publico' and public.rol_actual() = 'admin_contenido');

create policy "contenido_publico_elimina_admin" on storage.objects
  for delete using (bucket_id = 'contenido-publico' and public.rol_actual() = 'admin_contenido');
