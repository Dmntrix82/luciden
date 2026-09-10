import type { Metadata } from "next";
import { obtenerUsuarioActual } from "@/lib/supabase/perfil";
import { TarjetaCurso } from "@/components/publico/TarjetaCurso";
import { obtenerCursosPublicos } from "@/lib/cursos-publico";

export const metadata: Metadata = { title: "Mi cuenta — Instituto LUCIDEN" };

export default async function PaginaCliente() {
  const usuario = await obtenerUsuarioActual();
  const cursos = await obtenerCursosPublicos();

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-azul-oscuro">Mi cuenta</h1>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Nombre completo</dt>
            <dd className="font-medium text-gray-900">
              {usuario?.perfil?.nombre_completo ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Nombre de usuario</dt>
            <dd className="font-medium text-gray-900">
              {usuario?.perfil?.nombre_usuario ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Correo electrónico</dt>
            <dd className="font-medium text-gray-900">{usuario?.email ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-azul-oscuro">Cursos disponibles</h2>
        {cursos.length === 0 ? (
          <p className="mt-4 text-gray-500">Todavía no hay cursos publicados.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {cursos.map((curso) => (
              <TarjetaCurso key={curso.id} curso={curso} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
