"use server";

import ExcelJS from "exceljs";
import { crearClienteServidor } from "@/lib/supabase/server";
import { analizarCSV, normalizarEncabezado, normalizarFecha } from "@/lib/csv";
import { CAMPOS_OBLIGATORIOS, COLUMNAS_CSV } from "@/lib/estudiantes-csv-config";
import type { Sexo } from "@/types/database";

export interface ErrorFilaImportacion {
  fila: number;
  mensaje: string;
}

export interface ResultadoImportacion {
  error?: string;
  total?: number;
  insertados?: number;
  errores?: ErrorFilaImportacion[];
}

const LIMITE_FILAS = 500;

async function leerFilas(archivo: File): Promise<string[][]> {
  const nombre = archivo.name.toLowerCase();

  if (nombre.endsWith(".xlsx") || nombre.endsWith(".xls")) {
    const buffer = await archivo.arrayBuffer();
    const libro = new ExcelJS.Workbook();
    await libro.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    const hoja = libro.worksheets[0];
    if (!hoja) return [];

    const filas: string[][] = [];
    hoja.eachRow((fila) => {
      const valores: string[] = [];
      // fila.values tiene un índice 0 vacío por convención de ExcelJS
      const celdas = Array.isArray(fila.values) ? fila.values.slice(1) : [];
      for (const celda of celdas) {
        if (celda instanceof Date) {
          const y = celda.getFullYear();
          const m = String(celda.getMonth() + 1).padStart(2, "0");
          const d = String(celda.getDate()).padStart(2, "0");
          valores.push(`${y}-${m}-${d}`);
        } else if (celda === null || celda === undefined) {
          valores.push("");
        } else if (typeof celda === "object" && "text" in celda) {
          valores.push(String((celda as { text: unknown }).text ?? ""));
        } else {
          valores.push(String(celda));
        }
      }
      filas.push(valores);
    });
    return filas.filter((f) => f.some((v) => v.trim() !== ""));
  }

  const texto = await archivo.text();
  return analizarCSV(texto);
}

export async function importarEstudiantesCSV(
  _prevState: ResultadoImportacion,
  formData: FormData
): Promise<ResultadoImportacion> {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
  if (perfil?.rol !== "admin_db") {
    return { error: "No tienes permiso para importar estudiantes." };
  }

  const archivo = formData.get("archivo") as File | null;
  if (!archivo || archivo.size === 0) {
    return { error: "Selecciona un archivo CSV o Excel." };
  }

  let filas: string[][];
  try {
    filas = await leerFilas(archivo);
  } catch {
    return { error: "No se pudo leer el archivo. Verifica que sea un CSV o Excel válido." };
  }

  if (filas.length < 2) {
    return { error: "El archivo no tiene filas de datos (solo encabezados o está vacío)." };
  }

  const [encabezados, ...filasDatos] = filas;

  if (filasDatos.length > LIMITE_FILAS) {
    return { error: `El archivo tiene demasiadas filas. El máximo por importación es ${LIMITE_FILAS}.` };
  }

  const indicePorClave = new Map<string, number>();
  encabezados.forEach((encabezado, indice) => {
    const normalizado = normalizarEncabezado(encabezado);
    const columna = COLUMNAS_CSV.find((c) => c.alias.includes(normalizado));
    if (columna && !indicePorClave.has(columna.clave)) {
      indicePorClave.set(columna.clave, indice);
    }
  });

  const faltantes = CAMPOS_OBLIGATORIOS.filter((clave) => !indicePorClave.has(clave));
  if (faltantes.length > 0) {
    const etiquetas = faltantes
      .map((clave) => COLUMNAS_CSV.find((c) => c.clave === clave)?.etiqueta ?? clave)
      .join(", ");
    return {
      error: `Faltan columnas obligatorias en el archivo: ${etiquetas}. Descarga la plantilla para ver el formato esperado.`,
    };
  }

  const obtener = (fila: string[], clave: string) => {
    const indice = indicePorClave.get(clave);
    return indice === undefined ? "" : (fila[indice] ?? "").trim();
  };

  const errores: ErrorFilaImportacion[] = [];
  let insertados = 0;

  for (let i = 0; i < filasDatos.length; i++) {
    const fila = filasDatos[i];
    const numeroFila = i + 2; // +1 por encabezado, +1 porque las filas se cuentan desde 1

    const codigo_estudiante = obtener(fila, "codigo_estudiante");
    const apellido_paterno = obtener(fila, "apellido_paterno");
    const apellido_materno = obtener(fila, "apellido_materno");
    const nombres = obtener(fila, "nombres");
    let sexo = obtener(fila, "sexo");
    const cedula_identidad = obtener(fila, "cedula_identidad");
    const curso = obtener(fila, "curso");
    const mensualidadTexto = obtener(fila, "mensualidad");
    const observaciones = obtener(fila, "observaciones") || null;

    if (/^m$/i.test(sexo) || /^masculino$/i.test(sexo)) sexo = "Masculino";
    else if (/^f$/i.test(sexo) || /^femenino$/i.test(sexo)) sexo = "Femenino";

    if (
      !codigo_estudiante ||
      !apellido_paterno ||
      !apellido_materno ||
      !nombres ||
      !sexo ||
      !cedula_identidad ||
      !curso
    ) {
      errores.push({ fila: numeroFila, mensaje: "Faltan datos obligatorios." });
      continue;
    }
    if (sexo !== "Masculino" && sexo !== "Femenino") {
      errores.push({ fila: numeroFila, mensaje: `Sexo inválido: "${sexo}" (debe ser Masculino o Femenino).` });
      continue;
    }

    const fecha_nacimiento = normalizarFecha(obtener(fila, "fecha_nacimiento"));
    const fecha_inscripcion = normalizarFecha(obtener(fila, "fecha_inscripcion"));
    const fecha_inicio_texto = obtener(fila, "fecha_inicio");
    const fecha_final_texto = obtener(fila, "fecha_final");
    const fecha_inicio = fecha_inicio_texto ? normalizarFecha(fecha_inicio_texto) : null;
    const fecha_final = fecha_final_texto ? normalizarFecha(fecha_final_texto) : null;

    if (!fecha_nacimiento || !fecha_inscripcion) {
      errores.push({ fila: numeroFila, mensaje: "Fecha de nacimiento o de inscripción inválida (usa AAAA-MM-DD)." });
      continue;
    }
    if (fecha_inicio_texto && !fecha_inicio) {
      errores.push({ fila: numeroFila, mensaje: "Fecha de inicio inválida (usa AAAA-MM-DD)." });
      continue;
    }
    if (fecha_final_texto && !fecha_final) {
      errores.push({ fila: numeroFila, mensaje: "Fecha final inválida (usa AAAA-MM-DD)." });
      continue;
    }

    const mensualidad = Number(mensualidadTexto.replace(",", "."));
    if (!Number.isFinite(mensualidad) || mensualidad < 0) {
      errores.push({ fila: numeroFila, mensaje: `Mensualidad inválida: "${mensualidadTexto}".` });
      continue;
    }

    const { error } = await supabase.from("estudiantes").insert({
      codigo_estudiante,
      apellido_paterno,
      apellido_materno,
      nombres,
      sexo: sexo as Sexo,
      fecha_nacimiento,
      cedula_identidad,
      fecha_inscripcion,
      fecha_inicio,
      fecha_final,
      curso,
      mensualidad,
      observaciones,
    });

    if (error) {
      if (error.code === "23505") {
        errores.push({
          fila: numeroFila,
          mensaje: "Ya existe un estudiante con ese código o cédula de identidad.",
        });
      } else {
        errores.push({ fila: numeroFila, mensaje: "No se pudo guardar esta fila." });
      }
      continue;
    }

    insertados++;
  }

  return { total: filasDatos.length, insertados, errores };
}
