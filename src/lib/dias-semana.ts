export const DIAS_SEMANA: { valor: number; etiqueta: string; corta: string }[] = [
  { valor: 1, etiqueta: "Lunes", corta: "Lun" },
  { valor: 2, etiqueta: "Martes", corta: "Mar" },
  { valor: 3, etiqueta: "Miércoles", corta: "Mié" },
  { valor: 4, etiqueta: "Jueves", corta: "Jue" },
  { valor: 5, etiqueta: "Viernes", corta: "Vie" },
  { valor: 6, etiqueta: "Sábado", corta: "Sáb" },
  { valor: 7, etiqueta: "Domingo", corta: "Dom" },
];

export function diaSemanaISO(fecha: Date): number {
  const dia = fecha.getDay(); // 0=domingo..6=sábado
  return dia === 0 ? 7 : dia;
}

export function formatearHorario(dias: number[], horaInicio: string, horaFin: string): string {
  if (dias.length === 0) return "Sin horario definido";
  const nombres = dias
    .sort((a, b) => a - b)
    .map((d) => DIAS_SEMANA.find((ds) => ds.valor === d)?.corta ?? "")
    .join(", ");
  return `${nombres} · ${horaInicio.slice(0, 5)} a ${horaFin.slice(0, 5)}`;
}
