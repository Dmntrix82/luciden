import type { Metadata } from "next";
import { FormularioEstudiante } from "@/components/admin/FormularioEstudiante";
import { crearEstudiante } from "@/lib/actions/estudiantes";

export const metadata: Metadata = { title: "Nuevo estudiante — Admin DB" };

export default function PaginaNuevoEstudiante() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-6 text-xl font-semibold text-azul-oscuro">Registrar nuevo estudiante</h1>
      <FormularioEstudiante accion={crearEstudiante} textoBoton="Registrar estudiante" />
    </div>
  );
}
