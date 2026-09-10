"use client";

import { useActionState } from "react";
import { cambiarContrasenaPropia } from "@/lib/actions/perfil";
import { CampoContrasena } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";

const estadoInicial: EstadoFormulario = {};

export function FormularioCambiarContrasena() {
  const [estado, accionFormulario, enProgreso] = useActionState(cambiarContrasenaPropia, estadoInicial);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-azul-oscuro">Contraseña</h2>
      <form action={accionFormulario} className="mt-4 flex flex-col gap-4">
        {estado.error && <Mensaje tipo="error" texto={estado.error} />}
        {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}
        <CampoContrasena etiqueta="Nueva contraseña" nombre="password" requerido minLength={8} />
        <div>
          <Boton type="submit" disabled={enProgreso}>
            {enProgreso ? "Guardando..." : "Cambiar contraseña"}
          </Boton>
        </div>
      </form>
    </div>
  );
}
