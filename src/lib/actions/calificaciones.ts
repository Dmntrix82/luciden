"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { EstadoCalificacion } from "@/types/database";

export async function guardarCalificacion(
  estudianteId: string,
  cursoId: string,
  notaFinal: string,
  estado: EstadoCalificacion
): Promise<{ error?: string }> {
  const nota = notaFinal.trim() === "" ? null : Number(notaFinal);
  if (nota !== null && (!Number.isFinite(nota) || nota < 0 || nota > 100)) {
    return { error: "La nota debe estar entre 0 y 100." };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("calificaciones")
    .upsert(
      { estudiante_id: estudianteId, curso_id: cursoId, nota_final: nota, estado },
      { onConflict: "estudiante_id,curso_id" }
    );

  if (error) return { error: "No se pudo guardar la calificación." };

  revalidatePath(`/docente/cursos/${cursoId}`);
  return {};
}
