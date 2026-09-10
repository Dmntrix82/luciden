"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { EstadoFormulario } from "@/lib/actions/auth";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_USUARIO = /^[a-zA-Z0-9_]{3,30}$/;
const TIPOS_IMAGEN_PERMITIDOS = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const TAMANO_MAXIMO_BYTES = 3 * 1024 * 1024;

export async function actualizarPerfilPropio(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const nombreCompleto = String(formData.get("nombre_completo") ?? "").trim();
  const nombreUsuario = String(formData.get("nombre_usuario") ?? "").trim();

  if (!nombreCompleto) return { error: "El nombre completo es obligatorio." };
  if (!REGEX_USUARIO.test(nombreUsuario)) {
    return { error: "El nombre de usuario debe tener entre 3 y 30 caracteres (letras, números o guion bajo)." };
  }

  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const { data: actual } = await supabase.from("perfiles").select("nombre_usuario").eq("id", user.id).single();

  if (actual?.nombre_usuario !== nombreUsuario) {
    const { data: disponible } = await supabase.rpc("nombre_usuario_disponible", { nombre: nombreUsuario });
    if (!disponible) return { error: "Ese nombre de usuario ya está en uso." };
  }

  const { error } = await supabase
    .from("perfiles")
    .update({ nombre_completo: nombreCompleto, nombre_usuario: nombreUsuario })
    .eq("id", user.id);

  if (error) return { error: "No se pudo actualizar tu perfil." };

  revalidatePath("/mi-perfil");
  return { exito: "Perfil actualizado correctamente." };
}

export async function subirFotoPerfil(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const archivo = formData.get("archivo") as File | null;
  if (!archivo || archivo.size === 0) return { error: "Selecciona una imagen." };
  if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
    return { error: "Formato no permitido. Usa PNG, JPG, WEBP o GIF." };
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) return { error: "La imagen no debe superar 3 MB." };

  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const extension = archivo.name.split(".").pop();
  const ruta = `perfiles/${user.id}.${extension}`;

  const { error: errorSubida } = await supabase.storage
    .from("contenido-publico")
    .upload(ruta, archivo, { upsert: true, contentType: archivo.type });
  if (errorSubida) return { error: "No se pudo subir la imagen." };

  const { data: urlPublica } = supabase.storage.from("contenido-publico").getPublicUrl(ruta);
  const foto_url = `${urlPublica.publicUrl}?v=${Date.now()}`;

  const { error } = await supabase.from("perfiles").update({ foto_url }).eq("id", user.id);
  if (error) return { error: "La imagen se subió pero no se pudo guardar." };

  revalidatePath("/mi-perfil");
  return { exito: "Foto de perfil actualizada." };
}

export async function cambiarContrasenaPropia(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const nueva = String(formData.get("password") ?? "");
  if (nueva.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.updateUser({ password: nueva });
  if (error) return { error: "No se pudo cambiar la contraseña." };

  return { exito: "Contraseña actualizada correctamente." };
}

export async function cambiarCorreoPropio(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const nuevo = String(formData.get("email") ?? "").trim();
  if (!REGEX_EMAIL.test(nuevo)) return { error: "El correo electrónico no es válido." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.updateUser({ email: nuevo });
  if (error) return { error: "No se pudo actualizar el correo." };

  return {
    exito: "Te enviamos un enlace de confirmación a tu nuevo correo. El cambio se completa cuando lo confirmes.",
  };
}
