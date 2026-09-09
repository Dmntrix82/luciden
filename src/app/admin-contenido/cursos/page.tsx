import type { Metadata } from "next";
import { obtenerMapaContenido, cursosDe } from "@/lib/contenido";
import { ManejadorCursos } from "@/components/admin/ManejadorCursos";

export const metadata: Metadata = { title: "Cursos — Admin Contenido" };

export default async function PaginaCursosContenido() {
  const mapa = await obtenerMapaContenido();
  const cursos = cursosDe(mapa);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-azul-oscuro">Afiches de cursos</h1>
      <p className="text-sm text-gray-500">
        Estos cursos aparecen en la página principal y en el panel del cliente.
      </p>
      <ManejadorCursos cursosIniciales={cursos} />
    </div>
  );
}
