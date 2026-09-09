import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Cliente con la Service Role Key: se salta RLS por completo.
 * Solo se usa desde Server Actions, nunca se expone al navegador.
 */
export function crearClienteAdmin() {
  const claveServicio = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!claveServicio) {
    throw new Error("Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, claveServicio, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
