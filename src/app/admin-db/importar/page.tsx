import type { Metadata } from "next";
import { FormularioImportarCSV } from "@/components/admin/FormularioImportarCSV";

export const metadata: Metadata = { title: "Importar estudiantes — Admin DB" };

export default function PaginaImportarEstudiantes() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-azul-oscuro">Importar estudiantes</h1>
      <FormularioImportarCSV />
    </div>
  );
}
