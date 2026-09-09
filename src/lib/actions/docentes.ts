"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { EstadoFormulario } from "@/lib/actions/auth";

function leerDatosDocente(formData: FormData) {
  return {
    nombres: String(formData.get("nombres") ?? "").trim(),
    direccion: String(formData.get("direccion") ?? "").trim() || null,
    carnet_identidad: String(formData.get("carnet_identidad") ?? "").trim() || null,
    celular: String(formData.get("celular") ?? "").trim() || null,
    fecha_inicio: String(formData.get("fecha_inicio") ?? "") || null,
    fecha_final: String(formData.get("fecha_final") ?? "") || null,
    documento_cv: formData.get("documento_cv") === "on",
    documento_carnet: formData.get("documento_carnet") === "on",
    documento_contrato: formData.get("documento_contrato") === "on",
    observaciones: String(formData.get("observaciones") ?? "").trim() || null,
  };
}

export async function crearDocente(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = leerDatosDocente(formData);
  if (!datos.nombres) return { error: "El nombre del docente es obligatorio." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("docentes").insert(datos);
  if (error) return { error: "No se pudo registrar el docente." };

  revalidatePath("/admin-db/docentes");
  redirect("/admin-db/docentes");
}

export async function actualizarDocente(
  id: string,
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = leerDatosDocente(formData);
  if (!datos.nombres) return { error: "El nombre del docente es obligatorio." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("docentes").update(datos).eq("id", id);
  if (error) return { error: "No se pudo actualizar el docente." };

  revalidatePath("/admin-db/docentes");
  return { exito: "Docente actualizado correctamente." };
}

export async function eliminarDocente(id: string) {
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("docentes").delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar el docente. Verifica que no tenga cursos asignados." };

  revalidatePath("/admin-db/docentes");
  return { exito: "Docente eliminado." };
}
