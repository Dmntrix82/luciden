"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { Rol } from "@/types/database";

export interface EstadoFormulario {
  error?: string;
  exito?: string;
}

async function obtenerOrigen() {
  const encabezados = await headers();
  const protocolo = encabezados.get("x-forwarded-proto") ?? "https";
  const host = encabezados.get("host");
  return `${protocolo}://${host}`;
}

function panelDeInicio(rol: Rol | undefined) {
  if (rol === "admin_db") return "/admin-db";
  if (rol === "admin_contenido") return "/admin-contenido";
  if (rol === "docente") return "/docente";
  if (rol === "secretaria") return "/secretaria";
  return "/cliente";
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_USUARIO = /^[a-zA-Z0-9_]{3,30}$/;

export async function registrarUsuario(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const email = String(formData.get("email") ?? "").trim();
  const nombreUsuario = String(formData.get("nombre_usuario") ?? "").trim();
  const nombreCompleto = String(formData.get("nombre_completo") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !nombreUsuario || !nombreCompleto || !password) {
    return { error: "Por favor completa todos los campos." };
  }
  if (!REGEX_EMAIL.test(email)) {
    return { error: "El correo electrónico no es válido." };
  }
  if (!REGEX_USUARIO.test(nombreUsuario)) {
    return {
      error: "El nombre de usuario debe tener entre 3 y 30 caracteres (letras, números o guion bajo).",
    };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await crearClienteServidor();

  const { data: disponible, error: errorDisponibilidad } = await supabase.rpc(
    "nombre_usuario_disponible",
    { nombre: nombreUsuario }
  );
  if (errorDisponibilidad) {
    return { error: "No se pudo verificar el nombre de usuario. Intenta nuevamente." };
  }
  if (!disponible) {
    return { error: "Ese nombre de usuario ya está en uso." };
  }

  const origen = await obtenerOrigen();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre_usuario: nombreUsuario, nombre_completo: nombreCompleto },
      emailRedirectTo: `${origen}/login`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Ya existe una cuenta registrada con ese correo." };
    }
    return { error: "No se pudo completar el registro. Intenta nuevamente." };
  }

  redirect(`/verificar-correo?email=${encodeURIComponent(email)}`);
}

export async function iniciarSesion(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const identificador = String(formData.get("identificador") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identificador || !password) {
    return { error: "Ingresa tu usuario o correo y tu contraseña." };
  }

  const supabase = await crearClienteServidor();

  let email = identificador;
  if (!REGEX_EMAIL.test(identificador)) {
    const { data: correoResuelto, error: errorResolucion } = await supabase.rpc(
      "correo_por_usuario",
      { p_usuario: identificador }
    );
    if (errorResolucion || !correoResuelto) {
      return { error: "Usuario o contraseña incorrectos." };
    }
    email = correoResuelto;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Debes verificar tu correo antes de ingresar. Revisa tu bandeja de entrada." };
    }
    return { error: "Usuario o contraseña incorrectos." };
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, activo")
    .eq("id", data.user.id)
    .single();

  if (perfil && !perfil.activo) {
    await supabase.auth.signOut();
    return { error: "Tu cuenta ha sido desactivada. Contacta al instituto." };
  }

  redirect(panelDeInicio(perfil?.rol));
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/");
}

export async function reenviarVerificacion(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Falta el correo electrónico." };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.resend({ type: "signup", email });

  if (error) {
    return { error: "No se pudo reenviar el correo. Intenta nuevamente en unos minutos." };
  }

  return { exito: "Correo de verificación reenviado. Revisa tu bandeja de entrada." };
}

export async function solicitarRecuperacion(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email || !REGEX_EMAIL.test(email)) {
    return { error: "Ingresa un correo electrónico válido." };
  }

  const supabase = await crearClienteServidor();
  const origen = await obtenerOrigen();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origen}/actualizar-contrasena`,
  });

  // Se responde igual exista o no la cuenta, para no revelar qué correos están registrados.
  return {
    exito: "Si ese correo está registrado, te enviamos un enlace para restablecer tu contraseña.",
  };
}
