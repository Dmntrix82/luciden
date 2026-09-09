"use client";

import { useActionState } from "react";
import { reenviarVerificacion, type EstadoFormulario } from "@/lib/actions/auth";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";

const estadoInicial: EstadoFormulario = {};

export function FormularioReenviarVerificacion({ email }: { email: string }) {
  const [estado, accionFormulario, enProgreso] = useActionState(
    reenviarVerificacion,
    estadoInicial
  );

  return (
    <form action={accionFormulario} className="flex flex-col gap-3">
      <input type="hidden" name="email" value={email} />
      {estado.error && <Mensaje tipo="error" texto={estado.error} />}
      {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}
      <Boton type="submit" variante="secundario" disabled={enProgreso || !email}>
        {enProgreso ? "Enviando..." : "Reenviar correo de verificación"}
      </Boton>
    </form>
  );
}
