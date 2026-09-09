import type { Metadata } from "next";
import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { columnaOrdenValida, expresionBusqueda } from "@/lib/estudiantes-consulta";
import { calcularAlerta, ETIQUETAS_ESTADO_PAGO } from "@/lib/estudiantes-estado";
import { Boton } from "@/components/ui/Boton";
import { BotonExportarCSV } from "@/components/admin/BotonExportarCSV";
import { BotonEliminarEstudiante } from "@/components/admin/BotonEliminarEstudiante";
import type { EstadoPago } from "@/types/database";

export const metadata: Metadata = { title: "Estudiantes — Admin DB" };

const TAMANO_PAGINA = 20;

interface BusquedaParams {
  buscar?: string;
  curso_id?: string;
  estado_pago?: string;
  ordenar?: string;
  direccion?: string;
  pagina?: string;
}

const CLASES_FILA: Record<string, string> = {
  rojo: "bg-red-50 hover:bg-red-100",
  amarillo: "bg-yellow-50 hover:bg-yellow-100",
};

export default async function PaginaEstudiantes({
  searchParams,
}: {
  searchParams: Promise<BusquedaParams>;
}) {
  const parametros = await searchParams;
  const buscar = parametros.buscar?.trim() ?? "";
  const cursoId = parametros.curso_id ?? "";
  const estadoPago = parametros.estado_pago ?? "";
  const direccion = parametros.direccion === "desc" ? "desc" : "asc";
  const ordenar = columnaOrdenValida(parametros.ordenar);
  const pagina = Math.max(1, Number(parametros.pagina) || 1);

  const supabase = await crearClienteServidor();

  let consulta = supabase.from("estudiantes").select("*, cursos(nombre)", { count: "exact" });
  if (buscar) consulta = consulta.or(expresionBusqueda(buscar));
  if (cursoId) consulta = consulta.eq("curso_id", cursoId);
  if (estadoPago) consulta = consulta.eq("estado_pago", estadoPago as EstadoPago);
  consulta = consulta
    .order(ordenar, { ascending: direccion === "asc" })
    .range((pagina - 1) * TAMANO_PAGINA, pagina * TAMANO_PAGINA - 1);

  const { data: estudiantes, count, error } = await consulta;

  const { data: cursosDisponibles } = await supabase.from("cursos").select("id, nombre").order("nombre");

  const totalPaginas = Math.max(1, Math.ceil((count ?? 0) / TAMANO_PAGINA));

  function construirEnlace(cambios: Record<string, string>) {
    const params = new URLSearchParams({
      ...(buscar && { buscar }),
      ...(cursoId && { curso_id: cursoId }),
      ...(estadoPago && { estado_pago: estadoPago }),
      ordenar,
      direccion,
      pagina: String(pagina),
      ...cambios,
    });
    return `/admin-db/estudiantes?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-azul-oscuro">Estudiantes</h1>
        <div className="flex gap-2">
          <BotonExportarCSV filtros={{ buscar, curso_id: cursoId, estado_pago: estadoPago, ordenar, direccion }} />
          <Link href="/admin-db/importar">
            <Boton variante="secundario">Importar Excel/CSV</Boton>
          </Link>
          <Link href="/admin-db/nuevo-estudiante">
            <Boton>+ Nuevo estudiante</Boton>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-yellow-200" /> Pago pendiente, por vencer
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-red-200" /> Pago pendiente, ya vencido
        </span>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="buscar" className="text-sm font-medium text-gray-700">
            Buscar
          </label>
          <input
            id="buscar"
            name="buscar"
            defaultValue={buscar}
            placeholder="Nombre, apellido, código o cédula"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-azul-medio focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="curso_id" className="text-sm font-medium text-gray-700">
            Curso
          </label>
          <select
            id="curso_id"
            name="curso_id"
            defaultValue={cursoId}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-azul-medio focus:outline-none"
          >
            <option value="">Todos</option>
            {(cursosDisponibles ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="estado_pago" className="text-sm font-medium text-gray-700">
            Estado de pago
          </label>
          <select
            id="estado_pago"
            name="estado_pago"
            defaultValue={estadoPago}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-azul-medio focus:outline-none"
          >
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="pago_pendiente">Pago pendiente</option>
            <option value="desactivado">Desactivado</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="ordenar" className="text-sm font-medium text-gray-700">
            Ordenar por
          </label>
          <select
            id="ordenar"
            name="ordenar"
            defaultValue={ordenar}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-azul-medio focus:outline-none"
          >
            <option value="apellido_paterno">Apellido paterno</option>
            <option value="nombres">Nombres</option>
            <option value="codigo_estudiante">Código</option>
            <option value="fecha_inscripcion">Fecha de inscripción</option>
            <option value="fecha_final">Fecha final</option>
            <option value="mensualidad">Mensualidad</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="direccion" className="text-sm font-medium text-gray-700">
            Dirección
          </label>
          <select
            id="direccion"
            name="direccion"
            defaultValue={direccion}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-azul-medio focus:outline-none"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
        <Boton type="submit">Filtrar</Boton>
        {(buscar || cursoId || estadoPago) && (
          <Link href="/admin-db/estudiantes" className="text-sm text-gray-500 hover:underline">
            Limpiar filtros
          </Link>
        )}
      </form>

      {error && <p className="text-red-600">No se pudieron cargar los estudiantes.</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-gris-claro text-gray-600">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Apellidos y nombres</th>
              <th className="px-4 py-3">Curso</th>
              <th className="px-4 py-3">Cédula</th>
              <th className="px-4 py-3">Fecha final</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Mensualidad</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(estudiantes ?? []).map((estudiante) => {
              const alerta = calcularAlerta(estudiante);
              return (
                <tr key={estudiante.id} className={alerta ? CLASES_FILA[alerta] : "hover:bg-gris-claro/60"}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {estudiante.codigo_estudiante}
                  </td>
                  <td className="px-4 py-3">
                    {estudiante.apellido_paterno} {estudiante.apellido_materno}, {estudiante.nombres}
                  </td>
                  <td className="px-4 py-3">{estudiante.cursos?.nombre ?? "—"}</td>
                  <td className="px-4 py-3">{estudiante.cedula_identidad}</td>
                  <td className="px-4 py-3">{estudiante.fecha_final ?? "—"}</td>
                  <td className="px-4 py-3">{ETIQUETAS_ESTADO_PAGO[estudiante.estado_pago]}</td>
                  <td className="px-4 py-3">Bs. {Number(estudiante.mensualidad).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin-db/estudiantes/${estudiante.id}`}>
                        <Boton variante="secundario" className="px-3 py-1.5">
                          Editar
                        </Boton>
                      </Link>
                      <BotonEliminarEstudiante
                        id={estudiante.id}
                        nombreCompleto={`${estudiante.nombres} ${estudiante.apellido_paterno}`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(estudiantes ?? []).length === 0 && !error && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No se encontraron estudiantes con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {count ?? 0} estudiante{(count ?? 0) === 1 ? "" : "s"} — página {pagina} de {totalPaginas}
        </span>
        <div className="flex gap-2">
          <Link
            href={construirEnlace({ pagina: String(Math.max(1, pagina - 1)) })}
            aria-disabled={pagina <= 1}
            className={`rounded-md border px-3 py-1.5 ${
              pagina <= 1
                ? "pointer-events-none border-gray-200 text-gray-300"
                : "border-gray-300 hover:bg-gris-claro"
            }`}
          >
            Anterior
          </Link>
          <Link
            href={construirEnlace({ pagina: String(Math.min(totalPaginas, pagina + 1)) })}
            aria-disabled={pagina >= totalPaginas}
            className={`rounded-md border px-3 py-1.5 ${
              pagina >= totalPaginas
                ? "pointer-events-none border-gray-200 text-gray-300"
                : "border-gray-300 hover:bg-gris-claro"
            }`}
          >
            Siguiente
          </Link>
        </div>
      </div>
    </div>
  );
}
