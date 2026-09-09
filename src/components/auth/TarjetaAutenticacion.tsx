"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { iniciarSesion, registrarUsuario, type EstadoFormulario } from "@/lib/actions/auth";
import { CampoAuth, CampoContrasenaAuth } from "@/components/auth/CampoAuth";
import { IconoUsuario, IconoCorreo, IconoCandado } from "@/components/ui/Iconos";
import { Mensaje } from "@/components/ui/Mensaje";

const estadoInicial: EstadoFormulario = {};

export function TarjetaAutenticacion({ modoInicial }: { modoInicial: "login" | "registro" }) {
  const [activo, setActivo] = useState(modoInicial === "registro");

  const [estadoLogin, accionLogin, enProgresoLogin] = useActionState(iniciarSesion, estadoInicial);
  const [estadoRegistro, accionRegistro, enProgresoRegistro] = useActionState(
    registrarUsuario,
    estadoInicial
  );

  return (
    <div className={`auth-container ${activo ? "activo" : ""}`}>
      <div className="auth-form-box login">
        <form action={accionLogin} className="w-full">
          <h1 className="text-2xl font-bold text-azul-oscuro">Iniciar sesión</h1>

          {estadoLogin.error && (
            <div className="mt-3">
              <Mensaje tipo="error" texto={estadoLogin.error} />
            </div>
          )}

          <CampoAuth
            icono={<IconoUsuario />}
            type="text"
            name="identificador"
            placeholder="Usuario o correo electrónico"
            autoComplete="username"
            required
          />
          <CampoContrasenaAuth
            name="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            required
          />

          <div className="-mt-2 mb-4 text-right text-sm">
            <Link href="/recuperar-contrasena" className="text-gray-500 hover:text-azul-medio">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={enProgresoLogin}
            className="h-12 w-full rounded-lg bg-azul-medio font-semibold text-white shadow-md transition-colors hover:bg-azul-oscuro disabled:opacity-60"
          >
            {enProgresoLogin ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>

      <div className="auth-form-box registro">
        <form action={accionRegistro} className="w-full">
          <h1 className="text-2xl font-bold text-azul-oscuro">Crear cuenta</h1>

          {estadoRegistro.error && (
            <div className="mt-3">
              <Mensaje tipo="error" texto={estadoRegistro.error} />
            </div>
          )}

          <CampoAuth
            icono={<IconoUsuario />}
            type="text"
            name="nombre_completo"
            placeholder="Nombre completo"
            autoComplete="name"
            required
          />
          <CampoAuth
            icono={<IconoUsuario />}
            type="text"
            name="nombre_usuario"
            placeholder="Nombre de usuario"
            autoComplete="username"
            required
          />
          <CampoAuth
            icono={<IconoCorreo />}
            type="email"
            name="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            required
          />
          <CampoContrasenaAuth
            name="password"
            placeholder="Contraseña (mínimo 8 caracteres)"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button
            type="submit"
            disabled={enProgresoRegistro}
            className="mt-2 h-12 w-full rounded-lg bg-azul-medio font-semibold text-white shadow-md transition-colors hover:bg-azul-oscuro disabled:opacity-60"
          >
            {enProgresoRegistro ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>
      </div>

      <div className="auth-toggle-box">
        <div className="auth-toggle-panel izquierda">
          <IconoCandado className="mb-3 h-10 w-10" />
          <h1 className="text-2xl font-bold">¡Bienvenido!</h1>
          <p className="mt-2 text-sm text-white/90">¿No tienes una cuenta?</p>
          <button
            type="button"
            onClick={() => setActivo(true)}
            className="mt-4 h-11 w-40 rounded-lg border-2 border-white font-semibold transition-colors hover:bg-white hover:text-azul-oscuro"
          >
            Regístrate
          </button>
        </div>
        <div className="auth-toggle-panel derecha">
          <IconoCandado className="mb-3 h-10 w-10" />
          <h1 className="text-2xl font-bold">¡Hola de nuevo!</h1>
          <p className="mt-2 text-sm text-white/90">¿Ya tienes una cuenta?</p>
          <button
            type="button"
            onClick={() => setActivo(false)}
            className="mt-4 h-11 w-40 rounded-lg border-2 border-white font-semibold transition-colors hover:bg-white hover:text-azul-oscuro"
          >
            Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
}
