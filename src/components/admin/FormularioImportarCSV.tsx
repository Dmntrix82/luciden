"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { importarEstudiantesCSV, type ResultadoImportacion } from "@/lib/actions/importar";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import { BotonDescargarPlantilla } from "@/components/admin/BotonDescargarPlantilla";

const estadoInicial: ResultadoImportacion = {};

export function FormularioImportarCSV() {
  const router = useRouter();
  const [estado, accionFormulario, enProgreso] = useActionState(
    importarEstudiantesCSV,
    estadoInicial
  );

  const huboExito = estado.insertados !== undefined && estado.insertados > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-azul-oscuro">1. Descarga la plantilla</h2>
        <p className="mt-1 text-sm text-gray-600">
          Usa este archivo como base: mantén los encabezados y agrega una fila por estudiante.
          Las fechas van en formato AAAA-MM-DD (ej. 2026-03-14). La columna &quot;Curso&quot; debe
          coincidir exactamente con el nombre de un curso ya registrado en{" "}
          <span className="font-medium">Admin DB → Cursos</span>.
        </p>
        <div className="mt-3">
          <BotonDescargarPlantilla />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-azul-oscuro">2. Sube tu archivo</h2>
        <p className="mt-1 text-sm text-gray-600">
          Acepta archivos .csv, .xlsx o .xls (máximo 500 filas por importación).
        </p>

        <form action={accionFormulario} className="mt-4 flex flex-col gap-3">
          {estado.error && <Mensaje tipo="error" texto={estado.error} />}

          <input
            type="file"
            name="archivo"
            accept=".csv,.xlsx,.xls"
            required
            className="text-sm"
          />

          <div>
            <Boton type="submit" disabled={enProgreso}>
              {enProgreso ? "Importando..." : "Importar estudiantes"}
            </Boton>
          </div>
        </form>
      </div>

      {estado.total !== undefined && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-azul-oscuro">Resultado de la importación</h2>
          <p className="mt-2 text-sm text-gray-700">
            {estado.insertados} de {estado.total} filas se registraron correctamente.
          </p>

          {huboExito && (
            <div className="mt-3">
              <Boton
                type="button"
                variante="secundario"
                onClick={() => router.push("/admin-db/estudiantes")}
              >
                Ver estudiantes
              </Boton>
            </div>
          )}

          {estado.errores && estado.errores.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-red-700">
                {estado.errores.length} fila{estado.errores.length === 1 ? "" : "s"} con problemas:
              </p>
              <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto text-sm text-red-600">
                {estado.errores.map((err, indice) => (
                  <li key={indice}>
                    Fila {err.fila}: {err.mensaje}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
