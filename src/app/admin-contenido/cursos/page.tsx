import type { Metadata } from "next";
import { crearClienteServidor } from "@/lib/supabase/server";
import { FormularioImagenCurso } from "@/components/admin/FormularioImagenCurso";

export const metadata: Metadata = { title: "Cursos — Admin Contenido" };

export default async function PaginaCursosContenido() {
  const supabase = await crearClienteServidor();
  const { data: cursos } = await supabase.from("cursos").select("*").order("nombre");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-azul-oscuro">Afiches de cursos</h1>
      <p className="text-sm text-gray-500">
        Sube la imagen de cada curso. Los cursos en sí (nombre, docente, horario) los crea el
        administrador de base de datos.
      </p>

      {(cursos ?? []).length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          Todavía no hay cursos registrados en la base de datos.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {(cursos ?? []).map((curso) => (
            <div key={curso.id} className="flex flex-col gap-2">
              <p className="font-medium text-azul-oscuro">{curso.nombre}</p>
              <FormularioImagenCurso cursoId={curso.id} imagenUrl={curso.imagen_url} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
