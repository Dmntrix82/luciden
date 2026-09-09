"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import type { EstadoFormulario } from "@/lib/actions/auth";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_USUARIO = /^[a-zA-Z0-9_]{3,30}$/;

function leerDatosSecretaria(formData: FormData) {
  return {
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

export async function crearSecretaria(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = leerDatosSecretaria(formData);
  const nombreCompleto = String(formData.get("nombre_completo") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const nombreUsuario = String(formData.get("nombre_usuario") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!nombreCompleto) return { error: "El nombre es obligatorio." };
  if (!email || !REGEX_EMAIL.test(email)) return { error: "El correo electrónico no es válido." };
  if (!REGEX_USUARIO.test(nombreUsuario)) {
    return { error: "El nombre de usuario debe tener entre 3 y 30 caracteres (letras, números o guion bajo)." };
  }
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const supabase = await crearClienteServidor();
  const { data: disponible } = await supabase.rpc("nombre_usuario_disponible", { nombre: nombreUsuario });
  if (!disponible) return { error: "Ese nombre de usuario ya está en uso." };

  let admin;
  try {
    admin = crearClienteAdmin();
  } catch {
    return { error: "Falta configurar la Service Role Key en el servidor." };
  }

  const { data: creado, error: errorCreacion } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre_usuario: nombreUsuario, nombre_completo: nombreCompleto },
  });

  if (errorCreacion || !creado.user) {
    if (errorCreacion?.message.toLowerCase().includes("already been registered")) {
      return { error: "Ya existe una cuenta registrada con ese correo." };
    }
    return { error: "No se pudo crear la cuenta de la secretaria." };
  }

  const perfilId = creado.user.id;

  const { error: errorRol } = await supabase
    .from("perfiles")
    .update({ rol: "secretaria" })
    .eq("id", perfilId);

  const { error: errorSecretaria } = await supabase
    .from("secretarias")
    .insert({ id: perfilId, ...datos });

  if (errorRol || errorSecretaria) {
    await admin.auth.admin.deleteUser(perfilId);
    return { error: "No se pudo registrar a la secretaria. Intenta nuevamente." };
  }

  revalidatePath("/admin-db/usuarios");
  redirect("/admin-db/usuarios");
}

export async function actualizarSecretaria(
  id: string,
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const datos = leerDatosSecretaria(formData);

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("secretarias").update(datos).eq("id", id);
  if (error) return { error: "No se pudo actualizar a la secretaria." };

  revalidatePath("/admin-db/usuarios");
  return { exito: "Datos actualizados correctamente." };
}
