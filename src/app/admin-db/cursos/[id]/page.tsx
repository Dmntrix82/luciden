import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { FormularioCurso } from "@/components/admin/FormularioCurso";
import { FormularioImagenCurso } from "@/components/admin/FormularioImagenCurso";
import { BotonEliminarGenerico } from "@/components/admin/BotonEliminarGenerico";
import { actualizarCurso, eliminarCurso } from "@/lib/actions/cursos";

export const metadata: Metadata = { title: "Editar curso — Admin DB" };

export default async function PaginaEditarCurso({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await crearClienteServidor();

  const [{ data: curso }, { data: docentes }, { data: horarios }] = await Promise.all([
    supabase.from("cursos").select("*").eq("id", id).single(),
    supabase.from("docentes").select("*").order("nombres"),
    supabase.from("curso_horarios").select("*").eq("curso_id", id).order("dia_semana"),
  ]);

  if (!curso) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-azul-oscuro">Editar curso — {curso.nombre}</h1>
          <BotonEliminarGenerico id={curso.id} nombre={curso.nombre} accion={eliminarCurso} />
        </div>
        <FormularioCurso
          accion={actualizarCurso.bind(null, id)}
          valoresIniciales={curso}
          horariosIniciales={horarios ?? []}
          docentes={docentes ?? []}
          textoBoton="Guardar cambios"
        />
      </div>

      <FormularioImagenCurso cursoId={curso.id} imagenUrl={curso.imagen_url} />
    </div>
  );
}
