"use client";

import { useActionState } from "react";
import { guardarColores } from "@/lib/actions/contenido";
import { CAMPOS_COLOR } from "@/lib/contenido-config";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";
import { colorDe, type MapaContenido } from "@/lib/contenido-helpers";

const estadoInicial: EstadoFormulario = {};

export function FormularioColores({ mapa }: { mapa: MapaContenido }) {
  const [estado, accionFormulario, enProgreso] = useActionState(guardarColores, estadoInicial);

  return (
    <form
      action={accionFormulario}
      className="rounded-lg border border-gray-200 bg-white p-6"
    >
      <h2 className="font-semibold text-azul-oscuro">Paleta de colores</h2>
      {estado.error && <Mensaje tipo="error" texto={estado.error} />}
      {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CAMPOS_COLOR.map((campo) => (
          <div key={campo.clave} className="flex flex-col gap-1">
            <label htmlFor={campo.clave} className="text-sm font-medium text-gray-700">
              {campo.etiqueta}
            </label>
            <input
              id={campo.clave}
              name={campo.clave}
              type="color"
              defaultValue={colorDe(mapa, campo.clave)}
              className="h-10 w-full cursor-pointer rounded-md border border-gray-300"
            />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Boton type="submit" disabled={enProgreso}>
          {enProgreso ? "Guardando..." : "Guardar colores"}
        </Boton>
      </div>
    </form>
  );
}
