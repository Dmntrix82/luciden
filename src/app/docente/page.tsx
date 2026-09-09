import type { Metadata } from "next";
import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/supabase/perfil";
import { esEditorActivo } from "@/lib/personal-estado";
import { formatearHorario } from "@/lib/dias-semana";
import { Mensaje } from "@/components/ui/Mensaje";

export const metadata: Metadata = { title: "Mis cursos — Docente" };

export default async function PaginaDocente() {
  const usuario = await obtenerUsuarioActual();
  const supabase = await crearClienteServidor();

  const { data: docente } = await supabase
    .from("docentes")
    .select("*")
    .eq("perfil_id", usuario?.id ?? "")
    .single();

  if (!docente) {
    return (
      <Mensaje
        tipo="error"
        texto="Tu cuenta todavía no tiene datos de docente asociados. Contacta al administrador."
      />
    );
  }

  const editor = esEditorActivo(docente.fecha_final);

  const { data: cursos } = await supabase
    .from("cursos")
    .select("*")
    .eq("docente_id", docente.id)
    .order("nombre");

  const { data: horarios } = await supabase
    .from("curso_horarios")
    .select("*")
    .in("curso_id", (cursos ?? []).map((c) => c.id));

  const horariosPorCurso = new Map<string, { dia_semana: number; hora_inicio: string; hora_fin: string }[]>();
  for (const h of horarios ?? []) {
    const lista = horariosPorCurso.get(h.curso_id) ?? [];
    lista.push(h);
    horariosPorCurso.set(h.curso_id, lista);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-azul-oscuro">Hola, {docente.nombres}</h1>

      {!editor && (
        <Mensaje
          tipo="info"
          texto="Tu contrato venció. Puedes ver tus cursos pero no registrar asistencia ni notas hasta que se reactive tu cuenta."
        />
      )}

      <div className="flex flex-col gap-3">
        {(cursos ?? []).map((curso) => {
          const lista = horariosPorCurso.get(curso.id) ?? [];
          return (
            <Link
              key={curso.id}
              href={`/docente/cursos/${curso.id}`}
              className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-azul-medio"
            >
              <p className="font-medium text-azul-oscuro">{curso.nombre}</p>
              {lista.length > 0 && (
                <p className="text-sm text-gray-500">
                  {formatearHorario(lista.map((h) => h.dia_semana), lista[0].hora_inicio, lista[0].hora_fin)}
                </p>
              )}
            </Link>
          );
        })}
        {(cursos ?? []).length === 0 && (
          <p className="text-sm text-gray-500">Todavía no tienes cursos asignados.</p>
        )}
      </div>
    </div>
  );
}
