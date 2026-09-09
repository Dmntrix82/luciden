"use server";

import { crearClienteServidor } from "@/lib/supabase/server";
import {
  columnaOrdenValida,
  expresionBusqueda,
  type FiltrosEstudiantes,
} from "@/lib/estudiantes-consulta";
import { COLUMNAS_CSV } from "@/lib/estudiantes-csv-config";

function celdaCSV(valor: unknown) {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  if (/[",\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

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
    COLUMNAS_CSV.map((columna) => celdaCSV(columna.etiqueta)).join(","),
    ...(data ?? []).map((estudiante) =>
      COLUMNAS_CSV.map((columna) =>
        celdaCSV((estudiante as unknown as Record<string, unknown>)[columna.clave])
      ).join(",")
    ),
  ];

  return { csv: "﻿" + filas.join("\n") };
}
