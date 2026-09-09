import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { FormularioDocente } from "@/components/admin/FormularioDocente";
import { BotonEliminarGenerico } from "@/components/admin/BotonEliminarGenerico";
import { actualizarDocente, eliminarDocente } from "@/lib/actions/docentes";

export const metadata: Metadata = { title: "Editar docente — Admin DB" };

export default async function PaginaEditarDocente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await crearClienteServidor();
  const { data: docente } = await supabase.from("docentes").select("*").eq("id", id).single();

  if (!docente) notFound();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-azul-oscuro">Editar docente — {docente.nombres}</h1>
        <BotonEliminarGenerico id={docente.id} nombre={docente.nombres} accion={eliminarDocente} />
      </div>
      <FormularioDocente
        accion={actualizarDocente.bind(null, id)}
        valoresIniciales={docente}
        textoBoton="Guardar cambios"
      />
    </div>
  );
}
