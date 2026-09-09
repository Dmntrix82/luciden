"use client";

import { useActionState } from "react";
import Link from "next/link";
import { solicitarRecuperacion, type EstadoFormulario } from "@/lib/actions/auth";
import { CampoAuth } from "@/components/auth/CampoAuth";
import { IconoCorreo } from "@/components/ui/Iconos";
import { Mensaje } from "@/components/ui/Mensaje";

const estadoInicial: EstadoFormulario = {};

export function FormularioRecuperar() {
  const [estado, accionFormulario, enProgreso] = useActionState(
    solicitarRecuperacion,
    estadoInicial
  );

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-azul-oscuro">Recuperar contraseña</h1>
      <p className="mt-2 text-sm text-gray-600">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form action={accionFormulario} className="mt-4">
        {estado.error && (
          <div className="mb-2">
            <Mensaje tipo="error" texto={estado.error} />
          </div>
        )}
        {estado.exito && (
          <div className="mb-2">
            <Mensaje tipo="exito" texto={estado.exito} />
          </div>
        )}

        <CampoAuth
          icono={<IconoCorreo />}
          type="email"
          name="email"
          placeholder="Correo electrónico"
          autoComplete="email"
          required
        />

        <button
          type="submit"
          disabled={enProgreso}
          className="h-12 w-full rounded-lg bg-azul-medio font-semibold text-white shadow-md transition-colors hover:bg-azul-oscuro disabled:opacity-60"
        >
          {enProgreso ? "Enviando..." : "Enviar enlace"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          <Link href="/login" className="font-medium text-azul-medio hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
