"use client";

import { useActionState, useRef, useState } from "react";
import { subirFotoPerfil } from "@/lib/actions/perfil";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";

const estadoInicial: EstadoFormulario = {};

export function FormularioFotoPerfil({ fotoUrl, nombreCompleto }: { fotoUrl: string | null; nombreCompleto: string | null }) {
  const [estado, accionFormulario, enProgreso] = useActionState(subirFotoPerfil, estadoInicial);
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

  const urlMostrada = previewUrl ?? fotoUrl;
  const inicial = (nombreCompleto ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-azul-oscuro">Foto de perfil</h2>
      <div className="mt-3 flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-gris-claro">
          {urlMostrada ? (
            // eslint-disable-next-line @next/next/no-img-element -- puede ser una URL blob: de previsualización local
            <img src={urlMostrada} alt="Foto de perfil" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl font-semibold text-gray-400">
              {inicial}
            </div>
          )}
        </div>
        <form action={accionFormulario} className="flex flex-1 flex-col gap-3">
          {estado.error && <Mensaje tipo="error" texto={estado.error} />}
          {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}
          <input
            ref={inputRef}
            type="file"
            name="archivo"
            accept="image/png,image/jpeg,image/webp,image/gif"
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
    </div>
  );
}
