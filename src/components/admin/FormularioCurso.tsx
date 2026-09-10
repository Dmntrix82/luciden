"use client";

import { useActionState, useState } from "react";
import { Campo, CampoSelect, CampoTextarea } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import { DIAS_SEMANA } from "@/lib/dias-semana";
import type { EstadoFormulario } from "@/lib/actions/auth";
import type { Curso, CursoHorario, Docente } from "@/types/database";

type AccionFormulario = (
  prevState: EstadoFormulario,
  formData: FormData
) => Promise<EstadoFormulario>;

const estadoInicial: EstadoFormulario = {};

interface FilaHorario {
  dia: string;
  inicio: string;
  fin: string;
}

function nuevaFila(): FilaHorario {
  return { dia: "", inicio: "", fin: "" };
}

export function FormularioCurso({
  accion,
  valoresIniciales,
  horariosIniciales = [],
  docentes,
  textoBoton,
}: {
  accion: AccionFormulario;
  valoresIniciales?: Curso;
  horariosIniciales?: CursoHorario[];
  docentes: Docente[];
  textoBoton: string;
}) {
  const [estado, accionFormulario, enProgreso] = useActionState(accion, estadoInicial);
  const [filas, setFilas] = useState<FilaHorario[]>(
    horariosIniciales.length > 0
      ? horariosIniciales.map((h) => ({
          dia: String(h.dia_semana),
          inicio: h.hora_inicio.slice(0, 5),
          fin: h.hora_fin.slice(0, 5),
        }))
      : [nuevaFila()]
  );

  function actualizarFila(indice: number, cambios: Partial<FilaHorario>) {
    setFilas((actuales) => actuales.map((f, i) => (i === indice ? { ...f, ...cambios } : f)));
  }

  return (
    <form action={accionFormulario} className="flex flex-col gap-6">
      {estado.error && <Mensaje tipo="error" texto={estado.error} />}
      {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre del curso" nombre="nombre" requerido defaultValue={valoresIniciales?.nombre} />
        <CampoSelect
          etiqueta="Docente"
          nombre="docente_id"
          defaultValue={valoresIniciales?.docente_id ?? undefined}
          opciones={docentes.map((d) => ({ valor: d.id, etiqueta: d.nombres }))}
        />
        <Campo
          etiqueta="Fecha de inicio de clases"
          nombre="fecha_inicio_clases"
          type="date"
          defaultValue={valoresIniciales?.fecha_inicio_clases ?? undefined}
        />
        <Campo
          etiqueta="Fecha de fin de clases"
          nombre="fecha_fin_clases"
          type="date"
          defaultValue={valoresIniciales?.fecha_fin_clases ?? undefined}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Horario de clases</p>
        <div className="flex flex-col gap-2">
          {filas.map((fila, indice) => (
            <div key={indice} className="flex flex-wrap items-end gap-2">
              <select
                name="horario_dia"
                value={fila.dia}
                onChange={(e) => actualizarFila(indice, { dia: e.target.value })}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-azul-medio focus:outline-none"
              >
                <option value="">Día</option>
                {DIAS_SEMANA.map((d) => (
                  <option key={d.valor} value={d.valor}>
                    {d.etiqueta}
                  </option>
                ))}
              </select>
              <input
                type="time"
                name="horario_inicio"
                value={fila.inicio}
                onChange={(e) => actualizarFila(indice, { inicio: e.target.value })}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-azul-medio focus:outline-none"
              />
              <span className="text-sm text-gray-500">a</span>
              <input
                type="time"
                name="horario_fin"
                value={fila.fin}
                onChange={(e) => actualizarFila(indice, { fin: e.target.value })}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-azul-medio focus:outline-none"
              />
              {filas.length > 1 && (
                <Boton
                  type="button"
                  variante="peligro"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setFilas((actuales) => actuales.filter((_, i) => i !== indice))}
                >
                  Quitar
                </Boton>
              )}
            </div>
          ))}
          <div>
            <Boton
              type="button"
              variante="secundario"
              className="px-3 py-1.5 text-xs"
              onClick={() => setFilas((actuales) => [...actuales, nuevaFila()])}
            >
              + Agregar otro día
            </Boton>
          </div>
        </div>
      </div>

      <CampoTextarea
        etiqueta="Información del curso"
        nombre="informacion"
        defaultValue={valoresIniciales?.informacion ?? undefined}
      />

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={valoresIniciales?.activo ?? true}
          className="h-4 w-4"
        />
        Visible en la página pública
      </label>

      <div>
        <Boton type="submit" disabled={enProgreso}>
          {enProgreso ? "Guardando..." : textoBoton}
        </Boton>
      </div>
    </form>
  );
}
