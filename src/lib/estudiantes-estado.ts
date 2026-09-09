export const DIAS_ALERTA_VENCIMIENTO = 7;

export type NivelAlerta = "rojo" | "amarillo" | null;

export function calcularAlerta(estudiante: {
  estado_pago: string;
  fecha_final: string | null;
}): NivelAlerta {
  if (estudiante.estado_pago !== "pago_pendiente" || !estudiante.fecha_final) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaFinal = new Date(estudiante.fecha_final + "T00:00:00");

  const diasRestantes = Math.round((fechaFinal.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0) return "rojo";
  if (diasRestantes <= DIAS_ALERTA_VENCIMIENTO) return "amarillo";
  return null;
}

export const ETIQUETAS_ESTADO_PAGO: Record<string, string> = {
  activo: "Activo",
  pago_pendiente: "Pago pendiente",
  desactivado: "Desactivado",
};
