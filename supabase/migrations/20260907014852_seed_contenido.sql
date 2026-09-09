-- Contenido inicial de la página pública: textos institucionales, paleta LUCIDEN
-- y lista de cursos vacía (a completar desde /admin-contenido).

insert into public.contenido_pagina (seccion, tipo, clave, valor) values
  ('hero', 'texto', 'titulo', 'Instituto LUCIDEN'),
  ('hero', 'texto', 'subtitulo', 'Formación de calidad para impulsar tu futuro profesional.'),
  ('nosotros', 'texto', 'titulo', 'Sobre nosotros'),
  ('nosotros', 'texto', 'texto', 'En el Instituto LUCIDEN ofrecemos programas de formación técnica y profesional, con un enfoque práctico orientado a la empleabilidad.'),
  ('paleta', 'color', 'color_azul_oscuro', '#1a237e'),
  ('paleta', 'color', 'color_azul_medio', '#1565c0'),
  ('paleta', 'color', 'color_azul_brillante', '#1e90ff'),
  ('tipografia', 'tipografia', 'tamano_base', '16'),
  ('cursos', 'texto', 'lista', '[]')
on conflict (seccion, clave) do nothing;
