import { crearClienteServidor } from "@/lib/supabase/server";
import type { Perfil } from "@/types/database";

export interface UsuarioActual {
  id: string;
  email: string | undefined;
  perfil: Perfil | null;
}

export async function obtenerUsuarioActual(): Promise<UsuarioActual | null> {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil, error: errorPerfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (errorPerfil) {
    console.error("[obtenerUsuarioActual] error al leer perfil:", user.id, errorPerfil);
  }

  return { id: user.id, email: user.email, perfil: perfil ?? null };
}
