"use client";

import { useActionState } from "react";
import { Campo, CampoSelect, CampoTextarea } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";
import type { Estudiante } from "@/types/database";

type AccionFormulario = (
  prevState: EstadoFormulario,
  formData: FormData
) => Promise<EstadoFormulario>;

const estadoInicial: EstadoFormulario = {};

export function FormularioEstudiante({
  accion,
  valoresIniciales,
  textoBoton,
}: {
  accion: AccionFormulario;
  valoresIniciales?: Estudiante;
  textoBoton: string;
}) {
  const [estado, accionFormulario, enProgreso] = useActionState(accion, estadoInicial);

  return (
    <form action={accionFormulario} className="flex flex-col gap-6">
      {estado.error && <Mensaje tipo="error" texto={estado.error} />}
      {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo
          etiqueta="Código de estudiante"
          nombre="codigo_estudiante"
          requerido
          defaultValue={valoresIniciales?.codigo_estudiante}
        />
        <Campo
          etiqueta="Cédula de identidad"
          nombre="cedula_identidad"
          requerido
          defaultValue={valoresIniciales?.cedula_identidad}
        />
        <Campo
          etiqueta="Apellido paterno"
          nombre="apellido_paterno"
          requerido
          defaultValue={valoresIniciales?.apellido_paterno}
        />
        <Campo
          etiqueta="Apellido materno"
          nombre="apellido_materno"
          requerido
          defaultValue={valoresIniciales?.apellido_materno}
        />
        <Campo
          etiqueta="Nombres"
          nombre="nombres"
          requerido
          defaultValue={valoresIniciales?.nombres}
        />
        <CampoSelect
          etiqueta="Sexo"
          nombre="sexo"
          requerido
          defaultValue={valoresIniciales?.sexo}
          opciones={[
            { valor: "Masculino", etiqueta: "Masculino" },
            { valor: "Femenino", etiqueta: "Femenino" },
          ]}
        />
        <Campo
          etiqueta="Fecha de nacimiento"
          nombre="fecha_nacimiento"
          type="date"
          requerido
          defaultValue={valoresIniciales?.fecha_nacimiento}
        />
        <Campo
          etiqueta="Curso"
          nombre="curso"
          requerido
          defaultValue={valoresIniciales?.curso}
        />
        <Campo
          etiqueta="Fecha de inscripción"
          nombre="fecha_inscripcion"
          type="date"
          requerido
          defaultValue={valoresIniciales?.fecha_inscripcion}
        />
        <Campo
          etiqueta="Mensualidad (Bs.)"
          nombre="mensualidad"
          type="number"
          min="0"
          step="0.01"
          requerido
          defaultValue={valoresIniciales?.mensualidad}
        />
        <Campo
          etiqueta="Fecha de inicio"
          nombre="fecha_inicio"
          type="date"
          defaultValue={valoresIniciales?.fecha_inicio ?? undefined}
        />
        <Campo
          etiqueta="Fecha final"
          nombre="fecha_final"
          type="date"
          defaultValue={valoresIniciales?.fecha_final ?? undefined}
        />
      </div>

      <CampoTextarea
        etiqueta="Observaciones"
        nombre="observaciones"
        defaultValue={valoresIniciales?.observaciones ?? undefined}
      />

      <div>
        <Boton type="submit" disabled={enProgreso}>
          {enProgreso ? "Guardando..." : textoBoton}
        </Boton>
      </div>
    </form>
  );
}
