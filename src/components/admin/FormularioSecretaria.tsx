"use client";

import { useActionState } from "react";
import { Campo, CampoTextarea } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";
import type { Secretaria } from "@/types/database";

type AccionFormulario = (
  prevState: EstadoFormulario,
  formData: FormData
) => Promise<EstadoFormulario>;

const estadoInicial: EstadoFormulario = {};

export function FormularioSecretaria({
  accion,
  valoresIniciales,
  nombreCompleto,
  ocultarCuenta,
  textoBoton,
}: {
  accion: AccionFormulario;
  valoresIniciales?: Secretaria;
  nombreCompleto?: string;
  ocultarCuenta?: boolean;
  textoBoton: string;
}) {
  const [estado, accionFormulario, enProgreso] = useActionState(accion, estadoInicial);
  const esNuevo = !valoresIniciales && !ocultarCuenta;

  return (
    <form action={accionFormulario} className="flex flex-col gap-6">
      {estado.error && <Mensaje tipo="error" texto={estado.error} />}
      {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}

      {esNuevo ? (
        <fieldset className="rounded-lg border border-gray-200 p-4">
          <legend className="px-1 text-sm font-medium text-azul-oscuro">
            Cuenta de acceso a la plataforma
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre completo" nombre="nombre_completo" requerido />
            <Campo etiqueta="Nombre de usuario" nombre="nombre_usuario" requerido autoComplete="off" />
            <Campo etiqueta="Correo electrónico" nombre="email" type="email" requerido autoComplete="off" />
            <Campo
              etiqueta="Contraseña (mínimo 8 caracteres)"
              nombre="password"
              type="password"
              requerido
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        </fieldset>
      ) : (
        <p className="text-sm text-gray-600">
          Editando datos de <span className="font-medium">{nombreCompleto}</span>.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo
          etiqueta="Carnet de identidad"
          nombre="carnet_identidad"
          defaultValue={valoresIniciales?.carnet_identidad ?? undefined}
        />
        <Campo etiqueta="Celular" nombre="celular" defaultValue={valoresIniciales?.celular ?? undefined} />
        <Campo etiqueta="Dirección" nombre="direccion" defaultValue={valoresIniciales?.direccion ?? undefined} />
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
