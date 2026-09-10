"use client";

import { useActionState } from "react";
import { Campo, CampoContrasena, CampoTextarea } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";
import type { Docente } from "@/types/database";

type AccionFormulario = (
  prevState: EstadoFormulario,
  formData: FormData
) => Promise<EstadoFormulario>;

const estadoInicial: EstadoFormulario = {};

export function FormularioDocente({
  accion,
  valoresIniciales,
  ocultarNombre,
  ocultarCuenta,
  textoBoton,
}: {
  accion: AccionFormulario;
  valoresIniciales?: Docente;
  ocultarNombre?: boolean;
  ocultarCuenta?: boolean;
  textoBoton: string;
}) {
  const [estado, accionFormulario, enProgreso] = useActionState(accion, estadoInicial);
  const esNuevo = !valoresIniciales && !ocultarCuenta;

  return (
    <form action={accionFormulario} className="flex flex-col gap-6">
      {estado.error && <Mensaje tipo="error" texto={estado.error} />}
      {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {!ocultarNombre && (
          <Campo etiqueta="Nombres completos" nombre="nombres" requerido defaultValue={valoresIniciales?.nombres} />
        )}
        <Campo
          etiqueta="Carnet de identidad"
          nombre="carnet_identidad"
          defaultValue={valoresIniciales?.carnet_identidad ?? undefined}
        />
        <Campo etiqueta="Dirección" nombre="direccion" defaultValue={valoresIniciales?.direccion ?? undefined} />
        <Campo etiqueta="Celular" nombre="celular" defaultValue={valoresIniciales?.celular ?? undefined} />
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

      {esNuevo && (
        <fieldset className="rounded-lg border border-gray-200 p-4">
          <legend className="px-1 text-sm font-medium text-azul-oscuro">
            Cuenta de acceso a la plataforma
          </legend>
          <p className="mb-3 text-xs text-gray-500">
            El docente ingresará con este correo (o usuario) y contraseña. Podrá cambiarla después
            desde su perfil.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre de usuario" nombre="nombre_usuario" requerido autoComplete="off" />
            <Campo etiqueta="Correo electrónico" nombre="email" type="email" requerido autoComplete="off" />
            <CampoContrasena
              etiqueta="Contraseña (mínimo 8 caracteres)"
              nombre="password"
              requerido
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        </fieldset>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Documentos presentados</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="documento_cv" defaultChecked={valoresIniciales?.documento_cv} className="h-4 w-4" />
            CV
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="documento_carnet"
              defaultChecked={valoresIniciales?.documento_carnet}
              className="h-4 w-4"
            />
            Carnet
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="documento_contrato"
              defaultChecked={valoresIniciales?.documento_contrato}
              className="h-4 w-4"
            />
            Contrato
          </label>
        </div>
      </div>

      <CampoTextarea
        etiqueta="Observaciones (documentos faltantes, etc.)"
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
