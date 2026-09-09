import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/supabase/perfil";
import { esEditorActivo } from "@/lib/personal-estado";
import { contarDiasDeClase, calcularPorcentajeAsistencia } from "@/lib/asistencia-calculo";
import { formatearFechaHora } from "@/lib/fecha";
import { TablaAsistenciaCurso, type FilaEstudiante } from "@/components/docente/TablaAsistenciaCurso";

export const metadata: Metadata = { title: "Curso — Docente" };

export default async function PaginaCursoDocente({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { id } = await params;
  const { fecha: fechaParam } = await searchParams;
  const fecha = fechaParam || new Date().toISOString().slice(0, 10);

  const usuario = await obtenerUsuarioActual();
  const supabase = await crearClienteServidor();

  const { data: docente } = await supabase
    .from("docentes")
    .select("*")
    .eq("perfil_id", usuario?.id ?? "")
    .single();

  const { data: curso } = await supabase.from("cursos").select("*").eq("id", id).single();

  if (!docente || !curso || curso.docente_id !== docente.id) notFound();

  const puedeEditar = esEditorActivo(docente.fecha_final);

  const [{ data: horarios }, { data: estudiantes }, { data: asistencias }, { data: calificaciones }] =
    await Promise.all([
      supabase.from("curso_horarios").select("*").eq("curso_id", id),
      supabase.from("estudiantes").select("*").eq("curso_id", id).order("apellido_paterno"),
      supabase.from("asistencias").select("*").eq("curso_id", id),
      supabase.from("calificaciones").select("*").eq("curso_id", id),
    ]);

  const diasSemana = (horarios ?? []).map((h) => h.dia_semana);
  const diasTranscurridos = curso.fecha_inicio_clases
    ? contarDiasDeClase(curso.fecha_inicio_clases, fecha, diasSemana)
    : 0;

  const filas: FilaEstudiante[] = (estudiantes ?? []).map((est) => {
    const propias = (asistencias ?? []).filter((a) => a.estudiante_id === est.id);
    const deHoy = propias.find((a) => a.fecha === fecha);
    const calificacion = (calificaciones ?? []).find((c) => c.estudiante_id === est.id);
    return {
      id: est.id,
      nombreCompleto: `${est.apellido_paterno} ${est.apellido_materno}, ${est.nombres}`,
      estadoHoy: deHoy?.estado ?? "",
      porcentaje: calcularPorcentajeAsistencia(propias, diasTranscurridos),
      notaFinal: calificacion?.nota_final ?? null,
      estadoCalificacion: calificacion?.estado ?? "en_curso",
    };
  });

  const fechaLegible = formatearFechaHora(fecha + "T00:00:00").split(" a las")[0];

  const fechaAnterior = new Date(fecha + "T00:00:00");
  fechaAnterior.setDate(fechaAnterior.getDate() - 1);
  const fechaSiguiente = new Date(fecha + "T00:00:00");
  fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-azul-oscuro">{curso.nombre}</h1>
        {!puedeEditar && (
          <p className="mt-1 text-sm text-yellow-700">
            Tu contrato venció: puedes ver esta lista pero no modificarla.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <Link
          href={`/docente/cursos/${id}?fecha=${fechaAnterior.toISOString().slice(0, 10)}`}
          className="text-azul-medio hover:underline"
        >
          ← Día anterior
        </Link>
        {fecha !== hoy && (
          <Link href={`/docente/cursos/${id}`} className="text-azul-medio hover:underline">
            Volver a hoy
          </Link>
        )}
        <Link
          href={`/docente/cursos/${id}?fecha=${fechaSiguiente.toISOString().slice(0, 10)}`}
          className="text-azul-medio hover:underline"
        >
          Día siguiente →
        </Link>
      </div>

      <TablaAsistenciaCurso
        cursoId={id}
        fecha={fecha}
        fechaLegible={fechaLegible}
        filasIniciales={filas}
        puedeEditarAsistencia={puedeEditar}
        mostrarCalificaciones
        puedeEditarCalificaciones={puedeEditar}
      />
    </div>
  );
}
