export interface FiltrosEstudiantes {
  buscar?: string;
  curso?: string;
  ordenar?: string;
  direccion?: "asc" | "desc";
}

export const COLUMNAS_ORDENABLES = [
  "codigo_estudiante",
  "apellido_paterno",
  "nombres",
  "curso",
  "fecha_inscripcion",
  "mensualidad",
] as const;

const CAMPOS_BUSQUEDA = [
  "codigo_estudiante",
  "apellido_paterno",
  "apellido_materno",
  "nombres",
  "cedula_identidad",
];

export function columnaOrdenValida(ordenar: string | undefined): string {
  return COLUMNAS_ORDENABLES.includes(ordenar as (typeof COLUMNAS_ORDENABLES)[number])
    ? ordenar!
    : "apellido_paterno";
}

export function expresionBusqueda(termino: string): string {
  const limpio = termino.replace(/[%,]/g, "");
  return CAMPOS_BUSQUEDA.map((campo) => `${campo}.ilike.%${limpio}%`).join(",");
}
