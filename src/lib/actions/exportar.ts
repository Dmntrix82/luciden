"use server";

import { crearClienteServidor } from "@/lib/supabase/server";
import {
  columnaOrdenValida,
  expresionBusqueda,
  type FiltrosEstudiantes,
} from "@/lib/estudiantes-consulta";

function celdaCSV(valor: unknown) {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  if (/[",\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

const ENCABEZADOS: { clave: string; etiqueta: string }[] = [
  { clave: "codigo_estudiante", etiqueta: "Código" },
  { clave: "apellido_paterno", etiqueta: "Apellido Paterno" },
  { clave: "apellido_materno", etiqueta: "Apellido Materno" },
  { clave: "nombres", etiqueta: "Nombres" },
  { clave: "sexo", etiqueta: "Sexo" },
  { clave: "fecha_nacimiento", etiqueta: "Fecha de Nacimiento" },
  { clave: "cedula_identidad", etiqueta: "Cédula de Identidad" },
  { clave: "fecha_inscripcion", etiqueta: "Fecha de Inscripción" },
  { clave: "fecha_inicio", etiqueta: "Fecha de Inicio" },
  { clave: "fecha_final", etiqueta: "Fecha Final" },
  { clave: "curso", etiqueta: "Curso" },
  { clave: "mensualidad", etiqueta: "Mensualidad" },
  { clave: "observaciones", etiqueta: "Observaciones" },
];

export async function exportarEstudiantesCSV(
  filtros: FiltrosEstudiantes
): Promise<{ csv?: string; error?: string }> {
  const supabase = await crearClienteServidor();
  let consulta = supabase.from("estudiantes").select("*");

  if (filtros.buscar) {
    consulta = consulta.or(expresionBusqueda(filtros.buscar));
  }
  if (filtros.curso) {
    consulta = consulta.eq("curso", filtros.curso);
  }
  consulta = consulta.order(columnaOrdenValida(filtros.ordenar), {
    ascending: filtros.direccion !== "desc",
  });

  const { data, error } = await consulta;

  if (error) return { error: "No se pudo generar el archivo." };

  const filas = [
    ENCABEZADOS.map((columna) => celdaCSV(columna.etiqueta)).join(","),
    ...(data ?? []).map((estudiante) =>
      ENCABEZADOS.map((columna) =>
        celdaCSV((estudiante as unknown as Record<string, unknown>)[columna.clave])
      ).join(",")
    ),
  ];

  return { csv: "﻿" + filas.join("\n") };
}
