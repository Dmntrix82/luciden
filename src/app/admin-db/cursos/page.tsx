import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { Boton } from "@/components/ui/Boton";
import { BotonEliminarGenerico } from "@/components/admin/BotonEliminarGenerico";
import { eliminarCurso } from "@/lib/actions/cursos";

export const metadata: Metadata = { title: "Cursos — Admin DB" };

export default async function PaginaCursos() {
  const supabase = await crearClienteServidor();

  const [{ data: cursos }, { data: conteos }] = await Promise.all([
    supabase.from("cursos").select("*, docentes(nombres)").order("nombre"),
    supabase.from("estudiantes").select("curso_id"),
  ]);

  const totalPorCurso = new Map<string, number>();
  for (const fila of conteos ?? []) {
    if (!fila.curso_id) continue;
    totalPorCurso.set(fila.curso_id, (totalPorCurso.get(fila.curso_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-azul-oscuro">Cursos</h1>
        <Link href="/admin-db/cursos/nuevo">
          <Boton>+ Nuevo curso</Boton>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(cursos ?? []).map((curso) => (
          <div key={curso.id} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="relative h-32 w-full bg-gris-claro">
              {curso.imagen_url ? (
                <Image src={curso.imagen_url} alt={curso.nombre} fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-400">Sin imagen</div>
              )}
              {!curso.activo && (
                <span className="absolute right-2 top-2 rounded-full bg-gray-800/80 px-2 py-0.5 text-xs text-white">
                  Oculto
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <h2 className="font-semibold text-azul-oscuro">{curso.nombre}</h2>
              <p className="text-sm text-gray-500">
                {curso.docentes?.nombres ? `Docente: ${curso.docentes.nombres}` : "Sin docente asignado"}
              </p>
              {curso.horario && <p className="text-sm text-gray-500">Horario: {curso.horario}</p>}
              <p className="text-sm font-medium text-azul-medio">
                {totalPorCurso.get(curso.id) ?? 0} estudiante(s) inscrito(s)
              </p>
              <div className="mt-3 flex gap-2">
                <Link href={`/admin-db/cursos/${curso.id}`}>
                  <Boton variante="secundario" className="px-3 py-1.5">
                    Editar
                  </Boton>
                </Link>
                <BotonEliminarGenerico id={curso.id} nombre={curso.nombre} accion={eliminarCurso} />
              </div>
            </div>
          </div>
        ))}
        {(cursos ?? []).length === 0 && (
          <p className="col-span-full rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
            Todavía no hay cursos registrados.
          </p>
        )}
      </div>
    </div>
  );
}
