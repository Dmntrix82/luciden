"use server";

import { crearClienteServidor } from "@/lib/supabase/server";
import {
  columnaOrdenValida,
  expresionBusqueda,
  type FiltrosEstudiantes,
} from "@/lib/estudiantes-consulta";
import { COLUMNAS_CSV } from "@/lib/estudiantes-csv-config";
import { ETIQUETAS_ESTADO_PAGO } from "@/lib/estudiantes-estado";
import type { EstadoPago } from "@/types/database";

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
  let consulta = supabase.from("estudiantes").select("*, cursos(nombre)");

  if (filtros.buscar) {
    consulta = consulta.or(expresionBusqueda(filtros.buscar));
  }
  if (filtros.curso_id) {
    consulta = consulta.eq("curso_id", filtros.curso_id);
  }
  if (filtros.estado_pago) {
    consulta = consulta.eq("estado_pago", filtros.estado_pago as EstadoPago);
  }
  consulta = consulta.order(columnaOrdenValida(filtros.ordenar), {
    ascending: filtros.direccion !== "desc",
  });

  const { data, error } = await consulta;

  if (error) return { error: "No se pudo generar el archivo." };

  const filas = [
    COLUMNAS_CSV.map((columna) => celdaCSV(columna.etiqueta)).join(","),
    ...(data ?? []).map((estudiante) => {
      const fila = estudiante as unknown as Record<string, unknown> & {
        cursos: { nombre: string } | null;
      };
      return COLUMNAS_CSV.map((columna) => {
        if (columna.clave === "curso") return celdaCSV(fila.cursos?.nombre ?? "");
        if (columna.clave === "estado_pago") {
          return celdaCSV(ETIQUETAS_ESTADO_PAGO[fila.estado_pago as string] ?? fila.estado_pago);
        }
        return celdaCSV(fila[columna.clave]);
      }).join(",");
    }),
  ];

  return { csv: "﻿" + filas.join("\n") };
}
