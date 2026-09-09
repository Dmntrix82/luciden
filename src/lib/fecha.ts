export function formatearFechaHora(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  const fechaTexto = new Intl.DateTimeFormat("es-BO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
  const horaTexto = new Intl.DateTimeFormat("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
  return `${fechaTexto} a las ${horaTexto}`;
}

export function formatearFecha(fechaISO: string): string {
  return new Intl.DateTimeFormat("es-BO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(fechaISO));
}
