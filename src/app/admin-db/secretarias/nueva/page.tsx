import type { Metadata } from "next";
import { FormularioSecretaria } from "@/components/admin/FormularioSecretaria";
import { crearSecretaria } from "@/lib/actions/secretarias";

export const metadata: Metadata = { title: "Nueva secretaria — Admin DB" };

export default function PaginaNuevaSecretaria() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="mb-6 text-xl font-semibold text-azul-oscuro">Registrar nueva secretaria</h1>
      <FormularioSecretaria accion={crearSecretaria} textoBoton="Registrar secretaria" />
    </div>
  );
}
