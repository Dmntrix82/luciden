"use client";

import { useActionState } from "react";
import { Campo, CampoSelect, CampoTextarea } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";
import type { Curso, Docente } from "@/types/database";

type AccionFormulario = (
  prevState: EstadoFormulario,
  formData: FormData
) => Promise<EstadoFormulario>;

const estadoInicial: EstadoFormulario = {};

export function FormularioCurso({
  accion,
  valoresIniciales,
  docentes,
  textoBoton,
}: {
  accion: AccionFormulario;
  valoresIniciales?: Curso;
  docentes: Docente[];
  textoBoton: string;
}) {
  const [estado, accionFormulario, enProgreso] = useActionState(accion, estadoInicial);

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
        <Campo etiqueta="Horario" nombre="horario" defaultValue={valoresIniciales?.horario ?? undefined} />
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
