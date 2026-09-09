import { diaSemanaISO } from "@/lib/dias-semana";
import type { Asistencia, EstadoAsistencia } from "@/types/database";

const PUNTOS_POR_ESTADO: Record<EstadoAsistencia, number> = {
  presente: 1,
  atrasado: 0.5,
  falta: 0,
};

export function contarDiasDeClase(
  fechaInicio: string,
  fechaFinLimite: string,
  diasSemana: number[]
): number {
  if (diasSemana.length === 0) return 0;

  const inicio = new Date(fechaInicio + "T00:00:00");
  const fin = new Date(fechaFinLimite + "T00:00:00");
  if (fin < inicio) return 0;

  let contador = 0;
  const cursor = new Date(inicio);
  while (cursor <= fin) {
    if (diasSemana.includes(diaSemanaISO(cursor))) contador++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return contador;
}

export function calcularPorcentajeAsistencia(
  asistenciasEstudiante: Pick<Asistencia, "estado">[],
  diasDeClaseTranscurridos: number
): number | null {
  if (diasDeClaseTranscurridos <= 0) return null;
  const puntos = asistenciasEstudiante.reduce((suma, a) => suma + PUNTOS_POR_ESTADO[a.estado], 0);
  return Math.round((puntos / diasDeClaseTranscurridos) * 100);
}
