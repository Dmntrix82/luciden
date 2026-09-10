import type { Metadata } from "next";
import { crearClienteServidor } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Reportes — Admin DB" };

function Tarjeta({ etiqueta, valor }: { etiqueta: string; valor: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <p className="text-sm text-gray-500">{etiqueta}</p>
      <p className="mt-1 text-3xl font-bold text-azul-oscuro">{valor}</p>
    </div>
  );
}

export default async function PaginaReportes() {
  const supabase = await crearClienteServidor();
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);

  const [
    { data: pagos },
    { data: pagosMes },
    { data: calificaciones },
    { count: deudas },
    { count: abandonos },
    { count: docentesActivos },
    { data: cursos },
  ] = await Promise.all([
    supabase.from("pagos").select("monto"),
    supabase.from("pagos").select("monto").gte("fecha_pago", inicioMes),
    supabase.from("calificaciones").select("estado"),
    supabase.from("estudiantes").select("id", { count: "exact", head: true }).eq("estado_pago", "pago_pendiente"),
    supabase.from("estudiantes").select("id", { count: "exact", head: true }).eq("abandono", true),
    supabase.from("docentes").select("id", { count: "exact", head: true }),
    supabase.from("cursos").select("created_at"),
  ]);

  const totalRecaudado = (pagos ?? []).reduce((s, p) => s + Number(p.monto), 0);
  const recaudadoMes = (pagosMes ?? []).reduce((s, p) => s + Number(p.monto), 0);
  const aprobados = (calificaciones ?? []).filter((c) => c.estado === "aprobado").length;
  const reprobados = (calificaciones ?? []).filter((c) => c.estado === "reprobado").length;

  const cursosPorMes = new Map<string, number>();
  for (const c of cursos ?? []) {
    const mes = c.created_at.slice(0, 7);
    cursosPorMes.set(mes, (cursosPorMes.get(mes) ?? 0) + 1);
  }
  const mesesOrdenados = Array.from(cursosPorMes.entries()).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-azul-oscuro">Reportes</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tarjeta etiqueta="Recaudado (histórico)" valor={`Bs. ${totalRecaudado.toFixed(2)}`} />
        <Tarjeta etiqueta="Recaudado este mes" valor={`Bs. ${recaudadoMes.toFixed(2)}`} />
        <Tarjeta etiqueta="Estudiantes con deuda" valor={deudas ?? 0} />
        <Tarjeta etiqueta="Aprobados" valor={aprobados} />
        <Tarjeta etiqueta="Reprobados" valor={reprobados} />
        <Tarjeta etiqueta="Abandonos" valor={abandonos ?? 0} />
        <Tarjeta etiqueta="Docentes registrados" valor={docentesActivos ?? 0} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-azul-oscuro">Cursos creados por mes</h2>
        {mesesOrdenados.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no hay datos.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {mesesOrdenados.map(([mes, total]) => (
              <li key={mes} className="flex justify-between border-b border-gray-100 pb-2 last:border-0">
                <span className="text-gray-700">{mes}</span>
                <span className="font-medium text-azul-medio">{total} curso(s)</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
