"use client";

import { useState, useTransition } from "react";
import { marcarAsistencia } from "@/lib/actions/asistencias";
import { guardarCalificacion } from "@/lib/actions/calificaciones";
import type { EstadoAsistencia, EstadoCalificacion } from "@/types/database";

const COLORES_ESTADO: Record<string, string> = {
  presente: "bg-green-100 text-green-800 border-green-300",
  atrasado: "bg-yellow-100 text-yellow-800 border-yellow-300",
  falta: "bg-red-100 text-red-800 border-red-300",
  "": "bg-gray-100 text-gray-500 border-gray-300",
};

export interface FilaEstudiante {
  id: string;
  nombreCompleto: string;
  estadoHoy: EstadoAsistencia | "";
  porcentaje: number | null;
  notaFinal: number | null;
  estadoCalificacion: EstadoCalificacion;
}

export function TablaAsistenciaCurso({
  cursoId,
  fecha,
  fechaLegible,
  filasIniciales,
  puedeEditarAsistencia,
  mostrarCalificaciones,
  puedeEditarCalificaciones,
}: {
  cursoId: string;
  fecha: string;
  fechaLegible: string;
  filasIniciales: FilaEstudiante[];
  puedeEditarAsistencia: boolean;
  mostrarCalificaciones: boolean;
  puedeEditarCalificaciones: boolean;
}) {
  const [filas, setFilas] = useState(filasIniciales);
  const [, iniciarTransicion] = useTransition();

  function actualizarFila(id: string, cambios: Partial<FilaEstudiante>) {
    setFilas((actuales) => actuales.map((f) => (f.id === id ? { ...f, ...cambios } : f)));
  }

  function manejarAsistencia(estudianteId: string, estado: string) {
    if (!estado) return;
    actualizarFila(estudianteId, { estadoHoy: estado as EstadoAsistencia });
    iniciarTransicion(async () => {
      const resultado = await marcarAsistencia(cursoId, estudianteId, fecha, estado as EstadoAsistencia);
      if (resultado.error) window.alert(resultado.error);
    });
  }

  function manejarNota(estudianteId: string, notaTexto: string, estado: EstadoCalificacion) {
    iniciarTransicion(async () => {
      const resultado = await guardarCalificacion(estudianteId, cursoId, notaTexto, estado);
      if (resultado.error) window.alert(resultado.error);
    });
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-gris-claro text-gray-600">
          <tr>
            <th className="px-3 py-3">Estudiante</th>
            <th className="px-3 py-3">{fechaLegible}</th>
            <th className="px-3 py-3">% Asistencia</th>
            {mostrarCalificaciones && (
              <>
                <th className="px-3 py-3">Nota</th>
                <th className="px-3 py-3">Estado</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filas.map((fila) => (
            <tr key={fila.id}>
              <td className="px-3 py-2">{fila.nombreCompleto}</td>
              <td className="px-3 py-2">
                <select
                  value={fila.estadoHoy}
                  disabled={!puedeEditarAsistencia}
                  onChange={(e) => manejarAsistencia(fila.id, e.target.value)}
                  className={`rounded-md border px-2 py-1.5 text-xs font-medium disabled:opacity-70 ${COLORES_ESTADO[fila.estadoHoy]}`}
                >
                  <option value="" disabled>
                    Marcar
                  </option>
                  <option value="presente">Presente</option>
                  <option value="atrasado">Atrasado</option>
                  <option value="falta">Falta</option>
                </select>
              </td>
              <td className="px-3 py-2 text-gray-600">
                {fila.porcentaje === null ? "—" : `${fila.porcentaje}%`}
              </td>
              {mostrarCalificaciones && (
                <>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={fila.notaFinal ?? ""}
                      disabled={!puedeEditarCalificaciones}
                      onBlur={(e) => manejarNota(fila.id, e.target.value, fila.estadoCalificacion)}
                      className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-70"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={fila.estadoCalificacion}
                      disabled={!puedeEditarCalificaciones}
                      onChange={(e) => {
                        const nuevoEstado = e.target.value as EstadoCalificacion;
                        actualizarFila(fila.id, { estadoCalificacion: nuevoEstado });
                        manejarNota(fila.id, String(fila.notaFinal ?? ""), nuevoEstado);
                      }}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs disabled:opacity-70"
                    >
                      <option value="en_curso">En curso</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="reprobado">Reprobado</option>
                    </select>
                  </td>
                </>
              )}
            </tr>
          ))}
          {filas.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                No hay estudiantes inscritos en este curso.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
