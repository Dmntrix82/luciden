import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { FormularioDocente } from "@/components/admin/FormularioDocente";
import { completarDatosDocente } from "@/lib/actions/usuarios";

export const metadata: Metadata = { title: "Completar datos de docente — Admin DB" };

export default async function PaginaCompletarDocente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await crearClienteServidor();
  const { data: perfil } = await supabase.from("perfiles").select("*").eq("id", id).single();

  if (!perfil) notFound();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-2 text-xl font-semibold text-azul-oscuro">
        Completar datos de docente — {perfil.nombre_completo}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Esta cuenta ya puede iniciar sesión con su correo. Solo falta completar sus datos de contrato.
      </p>
      <FormularioDocente
        accion={completarDatosDocente.bind(null, id)}
        ocultarNombre
        ocultarCuenta
        textoBoton="Guardar y habilitar acceso"
      />
    </div>
  );
}
