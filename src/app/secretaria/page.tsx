import type { Metadata } from "next";
import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { formatearHorario } from "@/lib/dias-semana";
import { BotonAsistenciaDocente } from "@/components/admin/BotonAsistenciaDocente";

export const metadata: Metadata = { title: "Cursos — Secretaría" };

export default async function PaginaSecretaria() {
  const supabase = await crearClienteServidor();
  const hoy = new Date().toISOString().slice(0, 10);

  const [{ data: cursos }, { data: horarios }, { data: asistenciasHoy }] = await Promise.all([
    supabase.from("cursos").select("*, docentes(id, nombres)").order("nombre"),
    supabase.from("curso_horarios").select("*"),
    supabase.from("asistencia_docentes").select("docente_id").eq("fecha", hoy),
  ]);

  const horariosPorCurso = new Map<string, { dia_semana: number; hora_inicio: string; hora_fin: string }[]>();
  for (const h of horarios ?? []) {
    const lista = horariosPorCurso.get(h.curso_id) ?? [];
    lista.push(h);
    horariosPorCurso.set(h.curso_id, lista);
  }

  const docentesMarcados = new Set((asistenciasHoy ?? []).map((a) => a.docente_id));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-azul-oscuro">Cursos</h1>

      <div className="flex flex-col gap-3">
        {(cursos ?? []).map((curso) => {
          const lista = horariosPorCurso.get(curso.id) ?? [];
          return (
            <div key={curso.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/secretaria/cursos/${curso.id}`} className="font-medium text-azul-oscuro hover:underline">
                    {curso.nombre}
                  </Link>
                  {lista.length > 0 && (
                    <p className="text-sm text-gray-500">
                      {formatearHorario(lista.map((h) => h.dia_semana), lista[0].hora_inicio, lista[0].hora_fin)}
                    </p>
                  )}
                </div>
                {curso.docentes ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{curso.docentes.nombres}</span>
                    <BotonAsistenciaDocente
                      docenteId={curso.docentes.id}
                      yaMarcado={docentesMarcados.has(curso.docentes.id)}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Sin docente asignado</span>
                )}
              </div>
            </div>
          );
        })}
        {(cursos ?? []).length === 0 && <p className="text-sm text-gray-500">No hay cursos registrados.</p>}
      </div>
    </div>
  );
}
