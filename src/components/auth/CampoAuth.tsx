"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { IconoOjo, IconoOjoCerrado } from "@/components/ui/Iconos";

export function CampoAuth({
  icono,
  ...props
}: { icono: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative my-4">
      <input
        className="w-full rounded-lg bg-gray-100 px-4 py-3 pr-11 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-azul-medio/40"
        {...props}
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500">
        {icono}
      </span>
    </div>
  );
}

export function CampoContrasenaAuth(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative my-4">
      <input
        type={visible ? "text" : "password"}
        className="w-full rounded-lg bg-gray-100 px-4 py-3 pr-11 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-azul-medio/40"
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-azul-medio"
      >
        {visible ? <IconoOjoCerrado /> : <IconoOjo />}
      </button>
    </div>
  );
}
