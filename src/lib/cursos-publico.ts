import { crearClienteServidor } from "@/lib/supabase/server";
import type { Curso } from "@/types/database";

export async function obtenerCursosPublicos(): Promise<Curso[]> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("cursos")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  return data ?? [];
}
