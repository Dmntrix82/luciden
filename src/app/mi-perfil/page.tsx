import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/supabase/perfil";
import { FormularioFotoPerfil } from "@/components/perfil/FormularioFotoPerfil";
import { FormularioDatosPerfil } from "@/components/perfil/FormularioDatosPerfil";
import { FormularioCambiarCorreo } from "@/components/perfil/FormularioCambiarCorreo";
import { FormularioCambiarContrasena } from "@/components/perfil/FormularioCambiarContrasena";

export const metadata: Metadata = { title: "Mi perfil — Instituto LUCIDEN" };

export default async function PaginaMiPerfil() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/login");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-xl font-semibold text-azul-oscuro">Mi perfil</h1>
      <FormularioFotoPerfil
        fotoUrl={usuario.perfil?.foto_url ?? null}
        nombreCompleto={usuario.perfil?.nombre_completo ?? null}
      />
      <FormularioDatosPerfil
        nombreCompleto={usuario.perfil?.nombre_completo ?? null}
        nombreUsuario={usuario.perfil?.nombre_usuario ?? null}
      />
      <FormularioCambiarCorreo correoActual={usuario.email ?? "—"} />
      <FormularioCambiarContrasena />
    </div>
  );
}
