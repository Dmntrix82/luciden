"use client";

import { useActionState } from "react";
import { cambiarCorreoPropio } from "@/lib/actions/perfil";
import { Campo } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";

const estadoInicial: EstadoFormulario = {};

export function FormularioCambiarCorreo({ correoActual }: { correoActual: string }) {
  const [estado, accionFormulario, enProgreso] = useActionState(cambiarCorreoPropio, estadoInicial);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-azul-oscuro">Correo electrónico</h2>
      <p className="mt-1 text-xs text-gray-500">Actual: {correoActual}</p>
      <form action={accionFormulario} className="mt-4 flex flex-col gap-4">
        {estado.error && <Mensaje tipo="error" texto={estado.error} />}
        {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}
        <Campo etiqueta="Nuevo correo electrónico" nombre="email" type="email" requerido />
        <div>
          <Boton type="submit" disabled={enProgreso}>
            {enProgreso ? "Enviando..." : "Cambiar correo"}
          </Boton>
        </div>
      </form>
    </div>
  );
}
