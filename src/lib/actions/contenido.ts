"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import {
  CAMPOS_COLOR,
  CAMPOS_TEXTO,
  CLAVE_FUENTE_PERSONALIZADA,
  CLAVE_TAMANO_BASE,
  SECCION_PALETA,
  SECCION_TIPOGRAFIA,
} from "@/lib/contenido-config";
import type { EstadoFormulario } from "@/lib/actions/auth";

const BUCKET = "contenido-publico";

async function requerirAdminContenido() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, autorizado: false as const, userId: null };

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  return { supabase, autorizado: perfil?.rol === "admin_contenido", userId: user.id };
}

export async function guardarTextos(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const { supabase, autorizado } = await requerirAdminContenido();
  if (!autorizado) return { error: "No tienes permiso para editar el contenido." };

  const filas = CAMPOS_TEXTO.map((campo) => ({
    seccion: campo.seccion,
    tipo: "texto" as const,
    clave: campo.clave,
    valor: String(formData.get(`${campo.seccion}.${campo.clave}`) ?? ""),
  }));

  const { error } = await supabase
    .from("contenido_pagina")
    .upsert(filas, { onConflict: "seccion,clave" });

  if (error) return { error: "No se pudieron guardar los textos. Intenta nuevamente." };

  revalidatePath("/");
  revalidatePath("/admin-contenido/textos");
  return { exito: "Textos actualizados correctamente." };
}

export async function guardarColores(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const { supabase, autorizado } = await requerirAdminContenido();
  if (!autorizado) return { error: "No tienes permiso para editar la paleta de colores." };

  const filas = CAMPOS_COLOR.map((campo) => ({
    seccion: SECCION_PALETA,
    tipo: "color" as const,
    clave: campo.clave,
    valor: String(formData.get(campo.clave) ?? campo.porDefecto),
  }));

  const { error } = await supabase
    .from("contenido_pagina")
    .upsert(filas, { onConflict: "seccion,clave" });

  if (error) return { error: "No se pudo guardar la paleta de colores." };

  revalidatePath("/");
  revalidatePath("/admin-contenido/tipografia");
  return { exito: "Paleta de colores actualizada." };
}

export async function guardarTamanoBase(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const { supabase, autorizado } = await requerirAdminContenido();
  if (!autorizado) return { error: "No tienes permiso para editar la tipografía." };

  const tamano = String(formData.get("tamano_base") ?? "16");
  const numero = Number(tamano);
  if (!Number.isFinite(numero) || numero < 12 || numero > 24) {
    return { error: "El tamaño de fuente debe estar entre 12 y 24 píxeles." };
  }

  const { error } = await supabase
    .from("contenido_pagina")
    .upsert(
      { seccion: SECCION_TIPOGRAFIA, tipo: "tipografia", clave: CLAVE_TAMANO_BASE, valor: tamano },
      { onConflict: "seccion,clave" }
    );

  if (error) return { error: "No se pudo guardar el tamaño de fuente." };

  revalidatePath("/");
  return { exito: "Tamaño de fuente actualizado." };
}

const TIPOS_IMAGEN_PERMITIDOS = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;

export async function subirImagen(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const { supabase, autorizado } = await requerirAdminContenido();
  if (!autorizado) return { error: "No tienes permiso para subir imágenes." };

  const seccion = String(formData.get("seccion") ?? "");
  const clave = String(formData.get("clave") ?? "");
  const archivo = formData.get("archivo") as File | null;

  if (!seccion || !clave || !archivo || archivo.size === 0) {
    return { error: "Selecciona una imagen antes de subir." };
  }
  if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
    return { error: "Formato de imagen no permitido. Usa PNG, JPG, WEBP, GIF o SVG." };
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return { error: "La imagen no debe superar 5 MB." };
  }

  const extension = archivo.name.split(".").pop();
  const ruta = `${seccion}/${clave}.${extension}`;

  const { error: errorSubida } = await supabase.storage
    .from(BUCKET)
    .upload(ruta, archivo, { upsert: true, contentType: archivo.type });

  if (errorSubida) return { error: "No se pudo subir la imagen. Intenta nuevamente." };

  const { data: urlPublica } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
  const valor = `${urlPublica.publicUrl}?v=${Date.now()}`;

  const { error } = await supabase
    .from("contenido_pagina")
    .upsert(
      { seccion, tipo: "imagen", clave, valor },
      { onConflict: "seccion,clave" }
    );

  if (error) return { error: "La imagen se subió pero no se pudo guardar la referencia." };

  revalidatePath("/");
  revalidatePath("/admin-contenido/imagenes");
  return { exito: "Imagen actualizada correctamente." };
}

export async function subirFuentePersonalizada(
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const { supabase, autorizado } = await requerirAdminContenido();
  if (!autorizado) return { error: "No tienes permiso para subir fuentes." };

  const archivo = formData.get("archivo") as File | null;
  if (!archivo || archivo.size === 0) {
    return { error: "Selecciona un archivo de fuente (.ttf o .woff)." };
  }
  const extension = (archivo.name.split(".").pop() ?? "").toLowerCase();
  if (!["ttf", "woff", "woff2"].includes(extension)) {
    return { error: "Solo se permiten archivos .ttf, .woff o .woff2." };
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return { error: "El archivo no debe superar 5 MB." };
  }

  const ruta = `tipografia/fuente-personalizada.${extension}`;
  const { error: errorSubida } = await supabase.storage
    .from(BUCKET)
    .upload(ruta, archivo, { upsert: true });

  if (errorSubida) return { error: "No se pudo subir la fuente. Intenta nuevamente." };

  const { data: urlPublica } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
  const valor = `${urlPublica.publicUrl}?v=${Date.now()}`;

  const { error } = await supabase
    .from("contenido_pagina")
    .upsert(
      { seccion: SECCION_TIPOGRAFIA, tipo: "tipografia", clave: CLAVE_FUENTE_PERSONALIZADA, valor },
      { onConflict: "seccion,clave" }
    );

  if (error) return { error: "La fuente se subió pero no se pudo guardar la referencia." };

  revalidatePath("/");
  return { exito: "Fuente personalizada actualizada." };
}
