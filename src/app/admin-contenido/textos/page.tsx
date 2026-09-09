import type { Metadata } from "next";
import { obtenerMapaContenido } from "@/lib/contenido";
import { FormularioTextos } from "@/components/admin/FormularioTextos";

export const metadata: Metadata = { title: "Textos — Admin Contenido" };

export default async function PaginaTextos() {
  const mapa = await obtenerMapaContenido();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-azul-oscuro">Textos de la página</h1>
      <FormularioTextos mapa={mapa} />
    </div>
  );
}
