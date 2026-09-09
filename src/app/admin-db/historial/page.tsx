import type { Metadata } from "next";
import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { formatearFechaHora } from "@/lib/fecha";

export const metadata: Metadata = { title: "Historial de cambios — Admin DB" };

const TAMANO_PAGINA = 30;

const ETIQUETAS_ACCION: Record<string, string> = {
  creó: "Creación",
  modificó: "Modificación",
  eliminó: "Eliminación",
};

export default async function PaginaHistorial({
  searchParams,
}: {
  searchParams: Promise<{ tabla?: string; pagina?: string }>;
}) {
  const { tabla = "", pagina: paginaTexto } = await searchParams;
  const pagina = Math.max(1, Number(paginaTexto) || 1);

  const supabase = await crearClienteServidor();
  let consulta = supabase
    .from("historial_cambios")
    .select("*", { count: "exact" })
    .order("fecha_hora", { ascending: false });

  if (tabla) consulta = consulta.eq("tabla_modificada", tabla);

  consulta = consulta.range((pagina - 1) * TAMANO_PAGINA, pagina * TAMANO_PAGINA - 1);

  const { data: cambios, count } = await consulta;
  const totalPaginas = Math.max(1, Math.ceil((count ?? 0) / TAMANO_PAGINA));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-azul-oscuro">Historial de cambios</h1>

      <form method="get" className="flex items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="tabla" className="text-sm font-medium text-gray-700">
            Filtrar por
          </label>
          <select
            id="tabla"
            name="tabla"
            defaultValue={tabla}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-azul-medio focus:outline-none"
          >
            <option value="">Todo</option>
            <option value="estudiantes">Estudiantes</option>
            <option value="contenido_pagina">Contenido de la página</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-azul-medio px-4 py-2 text-sm font-medium text-white hover:bg-azul-oscuro"
        >
          Filtrar
        </button>
      </form>

      <div className="rounded-lg border border-gray-200 bg-white">
        {(cambios ?? []).length === 0 ? (
          <p className="p-6 text-center text-gray-500">No hay cambios registrados todavía.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {(cambios ?? []).map((cambio) => (
              <li key={cambio.id} className="flex flex-col gap-1 p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-azul-medio/10 px-2 py-0.5 text-xs font-medium text-azul-medio">
                    {ETIQUETAS_ACCION[cambio.accion] ?? cambio.accion}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatearFechaHora(cambio.fecha_hora)}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{cambio.descripcion_legible}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>página {pagina} de {totalPaginas}</span>
        <div className="flex gap-2">
          <Link
            href={`/admin-db/historial?tabla=${tabla}&pagina=${Math.max(1, pagina - 1)}`}
            aria-disabled={pagina <= 1}
            className={`rounded-md border px-3 py-1.5 ${
              pagina <= 1
                ? "pointer-events-none border-gray-200 text-gray-300"
                : "border-gray-300 hover:bg-gris-claro"
            }`}
          >
            Anterior
          </Link>
          <Link
            href={`/admin-db/historial?tabla=${tabla}&pagina=${Math.min(totalPaginas, pagina + 1)}`}
            aria-disabled={pagina >= totalPaginas}
            className={`rounded-md border px-3 py-1.5 ${
              pagina >= totalPaginas
                ? "pointer-events-none border-gray-200 text-gray-300"
                : "border-gray-300 hover:bg-gris-claro"
            }`}
          >
            Siguiente
          </Link>
        </div>
      </div>
    </div>
  );
}
