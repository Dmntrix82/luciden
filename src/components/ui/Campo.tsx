"use client";

import { useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { IconoOjo, IconoOjoCerrado } from "@/components/ui/Iconos";

const clasesInput =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-azul-medio focus:outline-none focus:ring-2 focus:ring-azul-medio/30 disabled:bg-gray-100";

interface CampoBaseProps {
  etiqueta: string;
  nombre: string;
  error?: string;
  requerido?: boolean;
}

export function Campo({
  etiqueta,
  nombre,
  error,
  requerido,
  ...props
}: CampoBaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={nombre} className="text-sm font-medium text-gray-700">
        {etiqueta}
        {requerido && <span className="text-red-600"> *</span>}
      </label>
      <input id={nombre} name={nombre} required={requerido} className={clasesInput} {...props} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function CampoContrasena({
  etiqueta,
  nombre,
  error,
  requerido,
  ...props
}: CampoBaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={nombre} className="text-sm font-medium text-gray-700">
        {etiqueta}
        {requerido && <span className="text-red-600"> *</span>}
      </label>
      <div className="relative">
        <input
          id={nombre}
          name={nombre}
          type={visible ? "text" : "password"}
          required={requerido}
          className={`${clasesInput} pr-10`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-azul-medio"
        >
          {visible ? <IconoOjoCerrado className="h-4 w-4" /> : <IconoOjo className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface OpcionSelect {
  valor: string;
  etiqueta: string;
}

export function CampoSelect({
  etiqueta,
  nombre,
  error,
  requerido,
  opciones,
  ...props
}: CampoBaseProps &
  SelectHTMLAttributes<HTMLSelectElement> & { opciones: OpcionSelect[] }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={nombre} className="text-sm font-medium text-gray-700">
        {etiqueta}
        {requerido && <span className="text-red-600"> *</span>}
      </label>
      <select id={nombre} name={nombre} required={requerido} className={clasesInput} {...props}>
        <option value="">Selecciona una opción</option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function CampoTextarea({
  etiqueta,
  nombre,
  error,
  requerido,
  ...props
}: CampoBaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={nombre} className="text-sm font-medium text-gray-700">
        {etiqueta}
        {requerido && <span className="text-red-600"> *</span>}
      </label>
      <textarea id={nombre} name={nombre} required={requerido} className={clasesInput} rows={4} {...props} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
