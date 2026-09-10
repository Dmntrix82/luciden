import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { FormularioSecretaria } from "@/components/admin/FormularioSecretaria";
import { actualizarSecretaria } from "@/lib/actions/secretarias";

export const metadata: Metadata = { title: "Editar secretaria — Admin DB" };

export default async function PaginaEditarSecretaria({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await crearClienteServidor();

  const [{ data: perfil }, { data: secretaria }] = await Promise.all([
    supabase.from("perfiles").select("*").eq("id", id).single(),
    supabase.from("secretarias").select("*").eq("id", id).single(),
  ]);

  if (!perfil) notFound();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-6 text-xl font-semibold text-azul-oscuro">
        Editar secretaria — {perfil.nombre_completo}
      </h1>
      <FormularioSecretaria
        accion={actualizarSecretaria.bind(null, id)}
        valoresIniciales={secretaria ?? undefined}
        nombreCompleto={perfil.nombre_completo ?? ""}
        textoBoton="Guardar cambios"
      />
    </div>
  );
}
