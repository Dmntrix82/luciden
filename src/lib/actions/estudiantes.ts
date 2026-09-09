"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { EstadoFormulario } from "@/lib/actions/auth";
import type { EstadoPago, Sexo } from "@/types/database";

function leerDatosEstudiante(formData: FormData) {
  return {
    codigo_estudiante: String(formData.get("codigo_estudiante") ?? "").trim(),
    apellido_paterno: String(formData.get("apellido_paterno") ?? "").trim(),
    apellido_materno: String(formData.get("apellido_materno") ?? "").trim(),
    nombres: String(formData.get("nombres") ?? "").trim(),
    sexo: String(formData.get("sexo") ?? ""),
    fecha_nacimiento: String(formData.get("fecha_nacimiento") ?? ""),
    cedula_identidad: String(formData.get("cedula_identidad") ?? "").trim(),
    fecha_inscripcion: String(formData.get("fecha_inscripcion") ?? ""),
    fecha_inicio: String(formData.get("fecha_inicio") ?? "") || null,
    fecha_final: String(formData.get("fecha_final") ?? "") || null,
    curso_id: String(formData.get("curso_id") ?? "") || null,
    estado_pago: String(formData.get("estado_pago") ?? "activo"),
    mensualidad: formData.get("mensualidad"),
    observaciones: String(formData.get("observaciones") ?? "").trim() || null,
  };
}

function leerTelefonos(formData: FormData): string[] {
  return formData
    .getAll("telefonos")
    .map((valor) => String(valor).trim())
    .filter((valor) => valor.length > 0);
}

const ESTADOS_PAGO_VALIDOS = ["activo", "pago_pendiente", "desactivado"];

function validar(datos: ReturnType<typeof leerDatosEstudiante>): string | null {
  if (
    !datos.codigo_estudiante ||
    !datos.apellido_paterno ||
    !datos.apellido_materno ||
    !datos.nombres ||
    !datos.sexo ||
    !datos.fecha_nacimiento ||
    !datos.cedula_identidad ||
    !datos.fecha_inscripcion ||
    !datos.curso_id
  ) {
    return "Completa todos los campos obligatorios, incluyendo el curso.";
  }
  if (!["Masculino", "Femenino"].includes(datos.sexo)) {
    return "El sexo debe ser Masculino o Femenino.";
  }
  if (!ESTADOS_PAGO_VALIDOS.includes(datos.estado_pago)) {
    return "El estado de pago no es válido.";
  }
  const mensualidad = Number(datos.mensualidad);
  if (!Number.isFinite(mensualidad) || mensualidad < 0) {
    return "La mensualidad debe ser un número mayor o igual a 0.";
  }
  if (datos.fecha_inicio && datos.fecha_final && datos.fecha_final < datos.fecha_inicio) {
    return "La fecha final no puede ser anterior a la fecha de inicio.";
  }
  return null;
}

function mensajeErrorBaseDeDatos(error: { code?: string; message: string }) {
  if (error.code === "23505") {
    if (error.message.includes("codigo_estudiante")) {
      return "Ya existe un estudiante con ese código.";
    }
    if (error.message.includes("cedula_identidad")) {
      return "Ya existe un estudiante con esa cédula de identidad.";
    }
    return "Ya existe un registro con esos datos.";
  }
  return "No se pudo guardar el estudiante. Intenta nuevamente.";
}

async function sincronizarTelefonos(
  supabase: Awaited<ReturnType<typeof crearClienteServidor>>,
  estudianteId: string,
  telefonos: string[]
) {
  await supabase.from("estudiante_telefonos").delete().eq("estudiante_id", estudianteId);
  if (telefonos.length === 0) return;
  await supabase
    .from("estudiante_telefonos")
    .insert(telefonos.map((numero) => ({ estudiante_id: estudianteId, numero })));
}

export async function crearEstudiante(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = leerDatosEstudiante(formData);
  const errorValidacion = validar(datos);
  if (errorValidacion) return { error: errorValidacion };

  const supabase = await crearClienteServidor();
  const { data: nuevo, error } = await supabase
    .from("estudiantes")
    .insert({
      ...datos,
      sexo: datos.sexo as Sexo,
      estado_pago: datos.estado_pago as EstadoPago,
      mensualidad: Number(datos.mensualidad),
    })
    .select("id")
    .single();

  if (error || !nuevo) return { error: mensajeErrorBaseDeDatos(error!) };

  await sincronizarTelefonos(supabase, nuevo.id, leerTelefonos(formData));

  revalidatePath("/admin-db/estudiantes");
  redirect("/admin-db/estudiantes");
}

export async function actualizarEstudiante(
  id: string,
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = leerDatosEstudiante(formData);
  const errorValidacion = validar(datos);
  if (errorValidacion) return { error: errorValidacion };

  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("estudiantes")
    .update({
      ...datos,
      sexo: datos.sexo as Sexo,
      estado_pago: datos.estado_pago as EstadoPago,
      mensualidad: Number(datos.mensualidad),
    })
    .eq("id", id);

  if (error) return { error: mensajeErrorBaseDeDatos(error) };

  await sincronizarTelefonos(supabase, id, leerTelefonos(formData));

  revalidatePath("/admin-db/estudiantes");
  revalidatePath(`/admin-db/estudiantes/${id}`);
  return { exito: "Estudiante actualizado correctamente." };
}

export async function eliminarEstudiante(id: string) {
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("estudiantes").delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar el estudiante." };

  revalidatePath("/admin-db/estudiantes");
  return { exito: "Estudiante eliminado." };
}
