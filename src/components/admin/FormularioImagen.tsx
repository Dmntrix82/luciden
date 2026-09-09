"use client";

import { useActionState, useRef, useState } from "react";
import { subirImagen } from "@/lib/actions/contenido";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";

const estadoInicial: EstadoFormulario = {};

export function FormularioImagen({
  seccion,
  clave,
  etiqueta,
  urlActual,
  recomendacion,
}: {
  seccion: string;
  clave: string;
  etiqueta: string;
  urlActual: string | null;
  recomendacion?: string;
}) {
  const [estado, accionFormulario, enProgreso] = useActionState(subirImagen, estadoInicial);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function manejarSeleccion(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    setPreviewUrl((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return URL.createObjectURL(archivo);
    });
  }

  const urlMostrada = previewUrl ?? urlActual;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-azul-oscuro">{etiqueta}</h2>
      {recomendacion && <p className="mt-1 text-xs text-gray-500">{recomendacion}</p>}
      <div className="relative mt-3 h-36 w-full overflow-hidden rounded-md bg-gris-claro">
        {urlMostrada ? (
          // eslint-disable-next-line @next/next/no-img-element -- puede ser una URL blob: de previsualización local
          <img src={urlMostrada} alt={etiqueta} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Sin imagen
          </div>
        )}
      </div>
      <form action={accionFormulario} className="mt-4 flex flex-col gap-3">
        <input type="hidden" name="seccion" value={seccion} />
        <input type="hidden" name="clave" value={clave} />
        {estado.error && <Mensaje tipo="error" texto={estado.error} />}
        {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}
        <input
          ref={inputRef}
          type="file"
          name="archivo"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          onChange={manejarSeleccion}
          required
          className="hidden"
        />
        <div className="flex gap-2">
          <Boton type="button" variante="secundario" onClick={() => inputRef.current?.click()}>
            Cargar imagen
          </Boton>
          <Boton type="submit" disabled={enProgreso || !previewUrl}>
            {enProgreso ? "Guardando..." : "Guardar cambios"}
          </Boton>
        </div>
      </form>
    </div>
  );
}
