import { crearClienteServidor } from "@/lib/supabase/server";
import { formatearHorario } from "@/lib/dias-semana";
import type { Curso, CursoHorario } from "@/types/database";

export type CursoConHorario = Curso & { horarioFormateado: string | null };

export async function obtenerCursosPublicos(): Promise<CursoConHorario[]> {
  const supabase = await crearClienteServidor();
  const { data: cursos } = await supabase
    .from("cursos")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  if (!cursos || cursos.length === 0) return [];

  const { data: horarios } = await supabase
    .from("curso_horarios")
    .select("*")
    .in("curso_id", cursos.map((c) => c.id));

  const horariosPorCurso = new Map<string, CursoHorario[]>();
  for (const h of horarios ?? []) {
    const lista = horariosPorCurso.get(h.curso_id) ?? [];
    lista.push(h);
    horariosPorCurso.set(h.curso_id, lista);
  }

  return cursos.map((curso) => {
    const lista = horariosPorCurso.get(curso.id) ?? [];
    return {
      ...curso,
      horarioFormateado:
        lista.length > 0
          ? formatearHorario(lista.map((h) => h.dia_semana), lista[0].hora_inicio, lista[0].hora_fin)
          : null,
    };
  });
}
