import type { Metadata } from "next";
import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { Boton } from "@/components/ui/Boton";
import { BotonEliminarGenerico } from "@/components/admin/BotonEliminarGenerico";
import { eliminarDocente } from "@/lib/actions/docentes";

export const metadata: Metadata = { title: "Docentes — Admin DB" };

export default async function PaginaDocentes() {
  const supabase = await crearClienteServidor();
  const { data: docentes } = await supabase.from("docentes").select("*").order("nombres");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-azul-oscuro">Docentes</h1>
        <Link href="/admin-db/docentes/nuevo">
          <Boton>+ Nuevo docente</Boton>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-gris-claro text-gray-600">
            <tr>
              <th className="px-4 py-3">Nombres</th>
              <th className="px-4 py-3">Celular</th>
              <th className="px-4 py-3">Carnet</th>
              <th className="px-4 py-3">Documentos</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(docentes ?? []).map((docente) => {
              const documentos = [
                docente.documento_cv && "CV",
                docente.documento_carnet && "Carnet",
                docente.documento_contrato && "Contrato",
              ].filter(Boolean);
              return (
                <tr key={docente.id} className="hover:bg-gris-claro/60">
                  <td className="px-4 py-3">{docente.nombres}</td>
                  <td className="px-4 py-3">{docente.celular ?? "—"}</td>
                  <td className="px-4 py-3">{docente.carnet_identidad ?? "—"}</td>
                  <td className="px-4 py-3">
                    {documentos.length > 0 ? (
                      documentos.join(", ")
                    ) : (
                      <span className="text-yellow-700">Sin documentos registrados</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin-db/docentes/${docente.id}`}>
                        <Boton variante="secundario" className="px-3 py-1.5">
                          Editar
                        </Boton>
                      </Link>
                      <BotonEliminarGenerico id={docente.id} nombre={docente.nombres} accion={eliminarDocente} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(docentes ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Todavía no hay docentes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
