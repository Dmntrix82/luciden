import { crearClienteServidor } from "@/lib/supabase/server";
import type { MapaContenido } from "@/lib/contenido-helpers";

export async function obtenerMapaContenido(): Promise<MapaContenido> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("contenido_pagina").select("seccion, clave, valor");

  const mapa: MapaContenido = {};
  for (const fila of data ?? []) {
    if (!mapa[fila.seccion]) mapa[fila.seccion] = {};
    mapa[fila.seccion][fila.clave] = fila.valor ?? "";
  }
  return mapa;
}

export type { MapaContenido } from "@/lib/contenido-helpers";
export { textoDe, colorDe, imagenDe, cursosDe } from "@/lib/contenido-helpers";
