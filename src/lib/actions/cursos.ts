"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { EstadoFormulario } from "@/lib/actions/auth";

const BUCKET = "contenido-publico";
const TIPOS_IMAGEN_PERMITIDOS = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;

function leerDatosCurso(formData: FormData) {
  return {
    nombre: String(formData.get("nombre") ?? "").trim(),
    docente_id: String(formData.get("docente_id") ?? "") || null,
    informacion: String(formData.get("informacion") ?? "").trim() || null,
    fecha_inicio_clases: String(formData.get("fecha_inicio_clases") ?? "") || null,
    fecha_fin_clases: String(formData.get("fecha_fin_clases") ?? "") || null,
    activo: formData.get("activo") === "on",
  };
}

interface FilaHorario {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

function leerYValidarHorario(formData: FormData): { filas: FilaHorario[] } | { error: string } {
  const dias = formData.getAll("horario_dia");
  const inicios = formData.getAll("horario_inicio");
  const fines = formData.getAll("horario_fin");

  const filas: FilaHorario[] = [];
  const diasVistos = new Set<number>();

  for (let i = 0; i < dias.length; i++) {
    const diaTexto = String(dias[i] ?? "").trim();
    const horaInicio = String(inicios[i] ?? "").trim();
    const horaFin = String(fines[i] ?? "").trim();

    // Fila vacía (el admin dejó una fila sin completar): se ignora.
    if (!diaTexto && !horaInicio && !horaFin) continue;

    const dia = Number(diaTexto);
    if (!diaTexto || !Number.isInteger(dia) || dia < 1 || dia > 7) {
      return { error: `Selecciona un día válido en la fila de horario #${i + 1}.` };
    }
    if (!horaInicio || !horaFin) {
      return { error: `Completa la hora de inicio y de fin en la fila de horario #${i + 1}.` };
    }
    if (horaFin <= horaInicio) {
      return { error: `En la fila de horario #${i + 1}, la hora de fin debe ser posterior a la de inicio.` };
    }
    if (diasVistos.has(dia)) {
      return { error: `Ya agregaste ese mismo día más de una vez en el horario.` };
    }
    diasVistos.add(dia);

    filas.push({ dia_semana: dia, hora_inicio: horaInicio, hora_fin: horaFin });
  }

  return { filas };
}

export async function crearCurso(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = leerDatosCurso(formData);
  if (!datos.nombre) return { error: "El nombre del curso es obligatorio." };

  const horario = leerYValidarHorario(formData);
  if ("error" in horario) return { error: horario.error };

  const supabase = await crearClienteServidor();
  const { data: nuevo, error } = await supabase.from("cursos").insert(datos).select("id").single();
  if (error || !nuevo) return { error: "No se pudo registrar el curso." };

  if (horario.filas.length > 0) {
    const { error: errorHorario } = await supabase
      .from("curso_horarios")
      .insert(horario.filas.map((fila) => ({ curso_id: nuevo.id, ...fila })));
    if (errorHorario) {
      // El curso ya se creó; no lo revertimos, pero avisamos que el horario falló.
      return { error: "El curso se creó, pero no se pudo guardar el horario. Edítalo para intentarlo de nuevo." };
    }
  }

  revalidatePath("/admin-db/cursos");
  revalidatePath("/");
  redirect("/admin-db/cursos");
}

export async function actualizarCurso(
  id: string,
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = leerDatosCurso(formData);
  if (!datos.nombre) return { error: "El nombre del curso es obligatorio." };

  const horario = leerYValidarHorario(formData);
  if ("error" in horario) return { error: horario.error };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("cursos").update(datos).eq("id", id);
  if (error) return { error: "No se pudo actualizar el curso." };

  await supabase.from("curso_horarios").delete().eq("curso_id", id);
  if (horario.filas.length > 0) {
    const { error: errorHorario } = await supabase
      .from("curso_horarios")
      .insert(horario.filas.map((fila) => ({ curso_id: id, ...fila })));
    if (errorHorario) return { error: "No se pudo guardar el horario, pero el resto de los datos sí se actualizó." };
  }

  revalidatePath("/admin-db/cursos");
  revalidatePath("/");
  return { exito: "Curso actualizado correctamente." };
}

export async function eliminarCurso(id: string) {
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("cursos").delete().eq("id", id);
  if (error) {
    return { error: "No se pudo eliminar el curso. Verifica que no tenga estudiantes inscritos." };
  }

  revalidatePath("/admin-db/cursos");
  revalidatePath("/");
  return { exito: "Curso eliminado." };
}

export async function subirImagenCurso(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const id = String(formData.get("id") ?? "");
  const archivo = formData.get("archivo") as File | null;
  if (!id || !archivo || archivo.size === 0) {
    return { error: "Selecciona una imagen antes de subir." };
  }
  if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
    return { error: "Formato de imagen no permitido. Usa PNG, JPG, WEBP o GIF." };
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return { error: "La imagen no debe superar 5 MB." };
  }

  const supabase = await crearClienteServidor();
  const extension = archivo.name.split(".").pop();
  const ruta = `cursos/${id}.${extension}`;

  const { error: errorSubida } = await supabase.storage
    .from(BUCKET)
    .upload(ruta, archivo, { upsert: true, contentType: archivo.type });
  if (errorSubida) return { error: "No se pudo subir la imagen." };

  const { data: urlPublica } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
  const imagen_url = `${urlPublica.publicUrl}?v=${Date.now()}`;

  const { error } = await supabase.from("cursos").update({ imagen_url }).eq("id", id);
  if (error) return { error: "La imagen se subió pero no se pudo guardar la referencia." };

  revalidatePath("/admin-db/cursos");
  revalidatePath("/admin-contenido/cursos");
  revalidatePath("/");
  return { exito: "Imagen del curso actualizada." };
}
