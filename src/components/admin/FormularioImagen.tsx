"use client";

import { useActionState } from "react";
import Image from "next/image";
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
}: {
  seccion: string;
  clave: string;
  etiqueta: string;
  urlActual: string | null;
}) {
  const [estado, accionFormulario, enProgreso] = useActionState(subirImagen, estadoInicial);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-azul-oscuro">{etiqueta}</h2>
      <div className="relative mt-3 h-36 w-full overflow-hidden rounded-md bg-gris-claro">
        {urlActual ? (
          <Image src={urlActual} alt={etiqueta} fill className="object-contain" unoptimized />
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
          type="file"
          name="archivo"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="text-sm"
          required
        />
        <Boton type="submit" variante="secundario" disabled={enProgreso}>
          {enProgreso ? "Subiendo..." : "Subir imagen"}
        </Boton>
      </form>
    </div>
  );
}
