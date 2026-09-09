import type { Metadata } from "next";
import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { formatearFechaHora } from "@/lib/fecha";
import { calcularAlerta } from "@/lib/estudiantes-estado";

export const metadata: Metadata = { title: "Panel — Admin DB" };

export default async function PaginaAdminDB() {
  const supabase = await crearClienteServidor();

  const [
    { count: totalEstudiantes },
    { data: mensualidades },
    { count: totalCursos },
    { data: pendientes },
    { data: ultimosCambios },
  ] = await Promise.all([
    supabase.from("estudiantes").select("id", { count: "exact", head: true }),
    supabase.from("estudiantes").select("mensualidad"),
    supabase.from("cursos").select("id", { count: "exact", head: true }),
    supabase.from("estudiantes").select("estado_pago, fecha_final").eq("estado_pago", "pago_pendiente"),
    supabase
      .from("historial_cambios")
      .select("descripcion_legible, fecha_hora")
      .order("fecha_hora", { ascending: false })
      .limit(5),
  ]);

  const totalMensualidades = (mensualidades ?? []).reduce(
    (suma, fila) => suma + Number(fila.mensualidad ?? 0),
    0
  );

  const alertas = (pendientes ?? []).reduce(
    (conteo, fila) => {
      const nivel = calcularAlerta(fila);
      if (nivel === "rojo") conteo.rojo++;
      else if (nivel === "amarillo") conteo.amarillo++;
      return conteo;
    },
    { rojo: 0, amarillo: 0 }
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-azul-oscuro">Panel de administración</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Estudiantes registrados</p>
          <p className="mt-1 text-3xl font-bold text-azul-oscuro">{totalEstudiantes ?? 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Cursos registrados</p>
          <p className="mt-1 text-3xl font-bold text-azul-oscuro">{totalCursos ?? 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Mensualidades totales</p>
          <p className="mt-1 text-3xl font-bold text-azul-oscuro">
            Bs. {totalMensualidades.toFixed(2)}
          </p>
        </div>
      </div>

      {(alertas.rojo > 0 || alertas.amarillo > 0) && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6">
          <h2 className="font-semibold text-yellow-900">Alertas de pago</h2>
          <p className="mt-1 text-sm text-yellow-800">
            {alertas.rojo > 0 && (
              <>
                <span className="font-semibold text-red-700">{alertas.rojo}</span> estudiante(s) con
                pago pendiente y su inscripción ya venció.{" "}
              </>
            )}
            {alertas.amarillo > 0 && (
              <>
                <span className="font-semibold text-yellow-800">{alertas.amarillo}</span> estudiante(s)
                con pago pendiente por vencer pronto.
              </>
            )}
          </p>
          <Link
            href="/admin-db/estudiantes?estado_pago=pago_pendiente"
            className="mt-3 inline-block text-sm font-medium text-azul-medio hover:underline"
          >
            Ver estudiantes con pago pendiente →
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin-db/nuevo-estudiante"
          className="rounded-md bg-azul-medio px-4 py-2 text-sm font-medium text-white hover:bg-azul-oscuro"
        >
          + Nuevo estudiante
        </Link>
        <Link
          href="/admin-db/estudiantes"
          className="rounded-md border border-azul-medio px-4 py-2 text-sm font-medium text-azul-medio hover:bg-azul-medio/10"
        >
          Ver todos los estudiantes
        </Link>
        <Link
          href="/admin-db/cursos"
          className="rounded-md border border-azul-medio px-4 py-2 text-sm font-medium text-azul-medio hover:bg-azul-medio/10"
        >
          Gestionar cursos
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-azul-oscuro">Actividad reciente</h2>
          <Link href="/admin-db/historial" className="text-sm text-azul-medio hover:underline">
            Ver historial completo
          </Link>
        </div>
        {(ultimosCambios ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no hay actividad registrada.</p>
        ) : (
          <ul className="flex flex-col gap-3 text-sm">
            {(ultimosCambios ?? []).map((cambio, indice) => (
              <li key={indice} className="border-b border-gray-100 pb-3 last:border-0">
                <p className="text-gray-800">{cambio.descripcion_legible}</p>
                <p className="text-xs text-gray-400">{formatearFechaHora(cambio.fecha_hora)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
