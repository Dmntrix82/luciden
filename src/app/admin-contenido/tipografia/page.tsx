import type { Metadata } from "next";
import { obtenerMapaContenido } from "@/lib/contenido";
import { FormularioColores } from "@/components/admin/FormularioColores";
import { FormularioTamano, FormularioFuente } from "@/components/admin/FormularioTipografia";

export const metadata: Metadata = { title: "Tipografía — Admin Contenido" };

export default async function PaginaTipografia() {
  const mapa = await obtenerMapaContenido();
  const tamanoActual = mapa["tipografia"]?.["tamano_base"] || "16";
  const fuenteActualUrl = mapa["tipografia"]?.["fuente_personalizada_url"];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-azul-oscuro">Tipografía y colores</h1>
      <FormularioColores mapa={mapa} />
      <FormularioTamano tamanoActual={tamanoActual} />
      <FormularioFuente fuenteActualUrl={fuenteActualUrl} />
    </div>
  );
}
