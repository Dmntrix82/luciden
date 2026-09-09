"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { EstadoFormulario } from "@/lib/actions/auth";
import type { Rol } from "@/types/database";

export async function cambiarRolUsuario(
  perfilId: string,
  nuevoRol: Rol
): Promise<{ error?: string; exito?: string }> {
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("perfiles").update({ rol: nuevoRol }).eq("id", perfilId);
  if (error) return { error: "No se pudo cambiar el rol." };

  revalidatePath("/admin-db/usuarios");
  return { exito: "Rol actualizado." };
}

export async function desactivarPersonal(perfilId: string) {
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("perfiles").update({ activo: false }).eq("id", perfilId);
  if (error) return { error: "No se pudo desactivar la cuenta." };

  revalidatePath("/admin-db/usuarios");
  return { exito: "Cuenta desactivada." };
}

export async function reactivarPersonal(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const perfilId = String(formData.get("perfil_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "");
  const fechaInicio = String(formData.get("fecha_inicio") ?? "");
  const fechaFinal = String(formData.get("fecha_final") ?? "") || null;

  if (!perfilId || !fechaInicio) {
    return { error: "Indica al menos la fecha de inicio del nuevo periodo." };
  }

  const supabase = await crearClienteServidor();

  const tabla = tipo === "secretaria" ? "secretarias" : "docentes";
  const filtro = tipo === "secretaria" ? { id: perfilId } : { perfil_id: perfilId };

  const { error: errorPersonal } = await supabase
    .from(tabla)
    .update({ fecha_inicio: fechaInicio, fecha_final: fechaFinal })
    .match(filtro);

  const { error: errorPerfil } = await supabase
    .from("perfiles")
    .update({ activo: true })
    .eq("id", perfilId);

  if (errorPersonal || errorPerfil) {
    return { error: "No se pudo reactivar la cuenta." };
  }

  revalidatePath("/admin-db/usuarios");
  return { exito: "Cuenta reactivada con el nuevo periodo." };
}

export async function completarDatosDocente(
  perfilId: string,
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const supabase = await crearClienteServidor();
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre_completo")
    .eq("id", perfilId)
    .single();

  const datos = {
    nombres: perfil?.nombre_completo ?? "",
    perfil_id: perfilId,
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

  const { error } = await supabase.from("docentes").insert(datos);
  if (error) return { error: "No se pudieron guardar los datos del docente." };

  revalidatePath("/admin-db/usuarios");
  revalidatePath("/admin-db/docentes");
  return { exito: "Datos completados. Ya tiene acceso como docente." };
}

export async function completarDatosSecretaria(
  perfilId: string,
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const supabase = await crearClienteServidor();

  const datos = {
    id: perfilId,
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

  const { error } = await supabase.from("secretarias").insert(datos);
  if (error) return { error: "No se pudieron guardar los datos de la secretaria." };

  revalidatePath("/admin-db/usuarios");
  return { exito: "Datos completados. Ya tiene acceso como secretaria." };
}
