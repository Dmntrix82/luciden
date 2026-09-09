import type { Metadata } from "next";
import { FormularioEstudiante } from "@/components/admin/FormularioEstudiante";
import { crearEstudiante } from "@/lib/actions/estudiantes";
import { crearClienteServidor } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nuevo estudiante — Admin DB" };

export default async function PaginaNuevoEstudiante() {
  const supabase = await crearClienteServidor();
  const { data: cursos } = await supabase
    .from("cursos")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-6 text-xl font-semibold text-azul-oscuro">Registrar nuevo estudiante</h1>
      <FormularioEstudiante
        accion={crearEstudiante}
        cursos={cursos ?? []}
        textoBoton="Registrar estudiante"
      />
    </div>
  );
}
