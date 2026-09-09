import type { Metadata } from "next";
import { crearClienteServidor } from "@/lib/supabase/server";
import { FormularioCurso } from "@/components/admin/FormularioCurso";
import { crearCurso } from "@/lib/actions/cursos";

export const metadata: Metadata = { title: "Nuevo curso — Admin DB" };

export default async function PaginaNuevoCurso() {
  const supabase = await crearClienteServidor();
  const { data: docentes } = await supabase.from("docentes").select("*").order("nombres");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-6 text-xl font-semibold text-azul-oscuro">Registrar nuevo curso</h1>
      <FormularioCurso accion={crearCurso} docentes={docentes ?? []} textoBoton="Registrar curso" />
    </div>
  );
}
