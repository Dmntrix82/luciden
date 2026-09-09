import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { FormularioSecretaria } from "@/components/admin/FormularioSecretaria";
import { completarDatosSecretaria } from "@/lib/actions/usuarios";

export const metadata: Metadata = { title: "Completar datos de secretaria — Admin DB" };

export default async function PaginaCompletarSecretaria({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await crearClienteServidor();
  const { data: perfil } = await supabase.from("perfiles").select("*").eq("id", id).single();

  if (!perfil) notFound();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-2 text-xl font-semibold text-azul-oscuro">
        Completar datos de secretaria — {perfil.nombre_completo}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Esta cuenta ya puede iniciar sesión con su correo. Solo falta completar sus datos de contrato.
      </p>
      <FormularioSecretaria
        accion={completarDatosSecretaria.bind(null, id)}
        nombreCompleto={perfil.nombre_completo ?? ""}
        ocultarCuenta
        textoBoton="Guardar y habilitar acceso"
      />
    </div>
  );
}
