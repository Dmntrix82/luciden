"use client";

import { useActionState } from "react";
import { actualizarPerfilPropio } from "@/lib/actions/perfil";
import { Campo } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";

const estadoInicial: EstadoFormulario = {};

export function FormularioDatosPerfil({
  nombreCompleto,
  nombreUsuario,
}: {
  nombreCompleto: string | null;
  nombreUsuario: string | null;
}) {
  const [estado, accionFormulario, enProgreso] = useActionState(actualizarPerfilPropio, estadoInicial);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-azul-oscuro">Datos básicos</h2>
      <form action={accionFormulario} className="mt-4 flex flex-col gap-4">
        {estado.error && <Mensaje tipo="error" texto={estado.error} />}
        {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}
        <Campo
          etiqueta="Nombre completo"
          nombre="nombre_completo"
          defaultValue={nombreCompleto ?? ""}
          requerido
        />
        <Campo
          etiqueta="Nombre de usuario"
          nombre="nombre_usuario"
          defaultValue={nombreUsuario ?? ""}
          requerido
        />
        <div>
          <Boton type="submit" disabled={enProgreso}>
            {enProgreso ? "Guardando..." : "Guardar cambios"}
          </Boton>
        </div>
      </form>
    </div>
  );
}
