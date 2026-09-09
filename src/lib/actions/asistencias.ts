"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { EstadoAsistencia } from "@/types/database";

export async function marcarAsistencia(
  cursoId: string,
  estudianteId: string,
  fecha: string,
  estado: EstadoAsistencia
): Promise<{ error?: string }> {
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("asistencias")
    .upsert(
      { curso_id: cursoId, estudiante_id: estudianteId, fecha, estado },
      { onConflict: "curso_id,estudiante_id,fecha" }
    );

  if (error) return { error: "No se pudo guardar la asistencia." };

  revalidatePath(`/docente/cursos/${cursoId}`);
  revalidatePath(`/secretaria/cursos/${cursoId}`);
  return {};
}

export async function marcarLlegadaDocente(docenteId: string): Promise<{ error?: string; exito?: string }> {
  const supabase = await crearClienteServidor();
  const hoy = new Date().toISOString().slice(0, 10);

  const { data: existente } = await supabase
    .from("asistencia_docentes")
    .select("id")
    .eq("docente_id", docenteId)
    .eq("fecha", hoy)
    .maybeSingle();

  if (existente) return { error: "Ya se marcó la asistencia de este docente hoy." };

  const { error } = await supabase.from("asistencia_docentes").insert({ docente_id: docenteId, fecha: hoy });
  if (error) return { error: "No se pudo registrar la asistencia." };

  revalidatePath("/secretaria");
  return { exito: "Asistencia registrada." };
}

export async function corregirLlegadaDocente(
  id: string,
  horaLlegada: string
): Promise<{ error?: string; exito?: string }> {
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("asistencia_docentes").update({ hora_llegada: horaLlegada }).eq("id", id);
  if (error) return { error: "No se pudo corregir la hora." };

  revalidatePath("/admin-db/usuarios");
  return { exito: "Hora corregida." };
}
