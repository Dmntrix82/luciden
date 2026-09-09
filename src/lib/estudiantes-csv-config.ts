export interface ColumnaCSV {
  clave: string;
  etiqueta: string;
  alias: string[];
}

export const COLUMNAS_CSV: ColumnaCSV[] = [
  { clave: "codigo_estudiante", etiqueta: "Código", alias: ["codigo", "codigo_estudiante", "codigo_de_estudiante"] },
  { clave: "apellido_paterno", etiqueta: "Apellido Paterno", alias: ["apellido_paterno"] },
  { clave: "apellido_materno", etiqueta: "Apellido Materno", alias: ["apellido_materno"] },
  { clave: "nombres", etiqueta: "Nombres", alias: ["nombres", "nombre"] },
  { clave: "sexo", etiqueta: "Sexo", alias: ["sexo"] },
  { clave: "fecha_nacimiento", etiqueta: "Fecha de Nacimiento", alias: ["fecha_de_nacimiento", "fecha_nacimiento"] },
  { clave: "cedula_identidad", etiqueta: "Cédula de Identidad", alias: ["cedula_de_identidad", "cedula_identidad", "ci"] },
  { clave: "fecha_inscripcion", etiqueta: "Fecha de Inscripción", alias: ["fecha_de_inscripcion", "fecha_inscripcion"] },
  { clave: "fecha_inicio", etiqueta: "Fecha de Inicio", alias: ["fecha_de_inicio", "fecha_inicio"] },
  { clave: "fecha_final", etiqueta: "Fecha Final", alias: ["fecha_final"] },
  { clave: "curso", etiqueta: "Curso", alias: ["curso"] },
  { clave: "mensualidad", etiqueta: "Mensualidad", alias: ["mensualidad"] },
  { clave: "observaciones", etiqueta: "Observaciones", alias: ["observaciones"] },
];

export const CAMPOS_OBLIGATORIOS = [
  "codigo_estudiante",
  "apellido_paterno",
  "apellido_materno",
  "nombres",
  "sexo",
  "fecha_nacimiento",
  "cedula_identidad",
  "fecha_inscripcion",
  "curso",
  "mensualidad",
];
