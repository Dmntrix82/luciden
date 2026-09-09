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

function leerDias(formData: FormData): number[] {
  return formData.getAll("dias").map((v) => Number(v)).filter((n) => n >= 1 && n <= 7);
}

async function sincronizarHorario(
  supabase: Awaited<ReturnType<typeof crearClienteServidor>>,
  cursoId: string,
  formData: FormData
): Promise<string | null> {
  const dias = leerDias(formData);
  const horaInicio = String(formData.get("hora_inicio") ?? "");
  const horaFin = String(formData.get("hora_fin") ?? "");

  await supabase.from("curso_horarios").delete().eq("curso_id", cursoId);

  if (dias.length === 0) return null;
  if (!horaInicio || !horaFin) return "Indica la hora de inicio y de fin del horario.";
  if (horaFin <= horaInicio) return "La hora de fin debe ser posterior a la hora de inicio.";

  const { error } = await supabase.from("curso_horarios").insert(
    dias.map((dia_semana) => ({ curso_id: cursoId, dia_semana, hora_inicio: horaInicio, hora_fin: horaFin }))
  );
  if (error) return "No se pudo guardar el horario.";
  return null;
}

export async function crearCurso(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = leerDatosCurso(formData);
  if (!datos.nombre) return { error: "El nombre del curso es obligatorio." };

  const supabase = await crearClienteServidor();
  const { data: nuevo, error } = await supabase.from("cursos").insert(datos).select("id").single();
  if (error || !nuevo) return { error: "No se pudo registrar el curso." };

  const errorHorario = await sincronizarHorario(supabase, nuevo.id, formData);
  if (errorHorario) return { error: errorHorario };

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

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("cursos").update(datos).eq("id", id);
  if (error) return { error: "No se pudo actualizar el curso." };

  const errorHorario = await sincronizarHorario(supabase, id, formData);
  if (errorHorario) return { error: errorHorario };

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
