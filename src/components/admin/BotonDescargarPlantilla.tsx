"use client";

import { COLUMNAS_CSV } from "@/lib/estudiantes-csv-config";
import { Boton } from "@/components/ui/Boton";

export function BotonDescargarPlantilla() {
  function descargar() {
    const encabezado = COLUMNAS_CSV.map((c) => c.etiqueta).join(",");
    const ejemplo = [
      "EST-0001",
      "Pérez",
      "Gómez",
      "Juan",
      "Masculino",
      "2005-03-14",
      "12345678",
      "2026-01-15",
      "2026-02-01",
      "2026-11-30",
      "Diseño Gráfico",
      "350",
      "Activo",
      "",
    ].join(",");

    const csv = "﻿" + [encabezado, ejemplo].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "plantilla-estudiantes.csv";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }

  return (
    <Boton type="button" variante="secundario" onClick={descargar}>
      Descargar plantilla CSV
    </Boton>
  );
}
