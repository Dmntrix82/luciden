"use client";

import { useActionState } from "react";
import Image from "next/image";
import { subirImagenCurso } from "@/lib/actions/cursos";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";

const estadoInicial: EstadoFormulario = {};

export function FormularioImagenCurso({ cursoId, imagenUrl }: { cursoId: string; imagenUrl: string | null }) {
  const [estado, accionFormulario, enProgreso] = useActionState(subirImagenCurso, estadoInicial);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-azul-oscuro">Imagen / afiche del curso</h2>
      <p className="mt-1 text-xs text-gray-500">
        Tamaño recomendado: 800 × 450 px (proporción 16:9), menos de 300 KB.
      </p>
      <div className="relative mt-3 h-40 w-full overflow-hidden rounded-md bg-gris-claro">
        {imagenUrl ? (
          <Image src={imagenUrl} alt="Afiche del curso" fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">Sin imagen</div>
        )}
      </div>
      <form action={accionFormulario} className="mt-4 flex flex-col gap-3">
        <input type="hidden" name="id" value={cursoId} />
        {estado.error && <Mensaje tipo="error" texto={estado.error} />}
        {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}
        <input type="file" name="archivo" accept="image/png,image/jpeg,image/webp,image/gif" required className="text-sm" />
        <div>
          <Boton type="submit" variante="secundario" disabled={enProgreso}>
            {enProgreso ? "Subiendo..." : "Subir imagen"}
          </Boton>
        </div>
      </form>
    </div>
  );
}
