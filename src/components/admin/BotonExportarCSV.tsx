"use client";

import { useState, useTransition } from "react";
import { exportarEstudiantesCSV } from "@/lib/actions/exportar";
import { Boton } from "@/components/ui/Boton";
import type { FiltrosEstudiantes } from "@/lib/estudiantes-consulta";

export function BotonExportarCSV({ filtros }: { filtros: FiltrosEstudiantes }) {
  const [enProgreso, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function exportar() {
    setError(null);
    iniciarTransicion(async () => {
      const resultado = await exportarEstudiantesCSV(filtros);
      if (resultado.error || !resultado.csv) {
        setError(resultado.error ?? "No se pudo generar el archivo.");
        return;
      }
      const blob = new Blob([resultado.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `estudiantes-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Boton variante="secundario" type="button" onClick={exportar} disabled={enProgreso}>
        {enProgreso ? "Generando..." : "Exportar a CSV"}
      </Boton>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
