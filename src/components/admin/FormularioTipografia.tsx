"use client";

import { useActionState } from "react";
import { guardarTamanoBase, subirFuentePersonalizada } from "@/lib/actions/contenido";
import { Campo } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";

const estadoInicial: EstadoFormulario = {};

export function FormularioTamano({ tamanoActual }: { tamanoActual: string }) {
  const [estado, accionFormulario, enProgreso] = useActionState(guardarTamanoBase, estadoInicial);

  return (
    <form action={accionFormulario} className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-azul-oscuro">Tamaño de fuente base</h2>
      {estado.error && <Mensaje tipo="error" texto={estado.error} />}
      {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}
      <div className="mt-4 max-w-xs">
        <Campo
          etiqueta="Tamaño en píxeles (12 a 24)"
          nombre="tamano_base"
          type="number"
          min="12"
          max="24"
          defaultValue={tamanoActual}
          requerido
        />
      </div>
      <div className="mt-4">
        <Boton type="submit" disabled={enProgreso}>
          {enProgreso ? "Guardando..." : "Guardar tamaño"}
        </Boton>
      </div>
    </form>
  );
}

export function FormularioFuente({ fuenteActualUrl }: { fuenteActualUrl?: string }) {
  const [estado, accionFormulario, enProgreso] = useActionState(
    subirFuentePersonalizada,
    estadoInicial
  );

  return (
    <form action={accionFormulario} className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-azul-oscuro">Fuente personalizada</h2>
      <p className="mt-1 text-sm text-gray-500">
        Sube un archivo .ttf o .woff para usarlo como tipografía del sitio.
      </p>
      {fuenteActualUrl && (
        <p className="mt-2 text-sm text-green-700">Ya hay una fuente personalizada activa.</p>
      )}
      {estado.error && <Mensaje tipo="error" texto={estado.error} />}
      {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}
      <div className="mt-4 flex flex-col gap-3">
        <input
          type="file"
          name="archivo"
          accept=".ttf,.woff,.woff2"
          className="text-sm"
          required
        />
        <div>
          <Boton type="submit" variante="secundario" disabled={enProgreso}>
            {enProgreso ? "Subiendo..." : "Subir fuente"}
          </Boton>
        </div>
      </div>
    </form>
  );
}
