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
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>(
    horariosIniciales.map((h) => h.dia_semana)
  );

  function alternarDia(dia: number) {
    setDiasSeleccionados((actuales) =>
      actuales.includes(dia) ? actuales.filter((d) => d !== dia) : [...actuales, dia]
    );
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
        <p className="mb-2 text-sm font-medium text-gray-700">¿Qué días hay clase?</p>
        <div className="flex flex-wrap gap-3">
          {DIAS_SEMANA.map((dia) => (
            <label key={dia.valor} className="flex items-center gap-1.5 text-sm text-gray-700">
              <input
                type="checkbox"
                name="dias"
                value={dia.valor}
                checked={diasSeleccionados.includes(dia.valor)}
                onChange={() => alternarDia(dia.valor)}
                className="h-4 w-4"
              />
              {dia.etiqueta}
            </label>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            etiqueta="Hora de inicio"
            nombre="hora_inicio"
            type="time"
            defaultValue={horariosIniciales[0]?.hora_inicio?.slice(0, 5)}
          />
          <Campo
            etiqueta="Hora de fin"
            nombre="hora_fin"
            type="time"
            defaultValue={horariosIniciales[0]?.hora_fin?.slice(0, 5)}
          />
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
