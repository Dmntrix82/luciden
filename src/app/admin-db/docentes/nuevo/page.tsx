import type { Metadata } from "next";
import { FormularioDocente } from "@/components/admin/FormularioDocente";
import { crearDocente } from "@/lib/actions/docentes";

export const metadata: Metadata = { title: "Nuevo docente — Admin DB" };

export default function PaginaNuevoDocente() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-6 text-xl font-semibold text-azul-oscuro">Registrar nuevo docente</h1>
      <FormularioDocente accion={crearDocente} textoBoton="Registrar docente" />
    </div>
  );
}
