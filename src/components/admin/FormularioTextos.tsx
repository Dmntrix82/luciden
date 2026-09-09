"use client";

import { useActionState } from "react";
import { guardarTextos } from "@/lib/actions/contenido";
import { CAMPOS_TEXTO } from "@/lib/contenido-config";
import { Campo, CampoTextarea } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";
import { textoDe, type MapaContenido } from "@/lib/contenido-helpers";

const estadoInicial: EstadoFormulario = {};

const NOMBRES_SECCION: Record<string, string> = {
  hero: "Portada",
  nosotros: "Sobre nosotros",
  contacto: "Contacto",
};

export function FormularioTextos({ mapa }: { mapa: MapaContenido }) {
  const [estado, accionFormulario, enProgreso] = useActionState(guardarTextos, estadoInicial);

  const secciones = Array.from(new Set(CAMPOS_TEXTO.map((c) => c.seccion)));

  return (
    <form action={accionFormulario} className="flex flex-col gap-8">
      {estado.error && <Mensaje tipo="error" texto={estado.error} />}
      {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}

      {secciones.map((seccion) => (
        <fieldset key={seccion} className="rounded-lg border border-gray-200 bg-white p-6">
          <legend className="px-2 font-semibold text-azul-oscuro">
            {NOMBRES_SECCION[seccion] ?? seccion}
          </legend>
          <div className="flex flex-col gap-4">
            {CAMPOS_TEXTO.filter((c) => c.seccion === seccion).map((campo) =>
              campo.multilinea ? (
                <CampoTextarea
                  key={`${campo.seccion}.${campo.clave}`}
                  etiqueta={campo.etiqueta}
                  nombre={`${campo.seccion}.${campo.clave}`}
                  defaultValue={textoDe(mapa, campo.seccion, campo.clave)}
                />
              ) : (
                <Campo
                  key={`${campo.seccion}.${campo.clave}`}
                  etiqueta={campo.etiqueta}
                  nombre={`${campo.seccion}.${campo.clave}`}
                  defaultValue={textoDe(mapa, campo.seccion, campo.clave)}
                />
              )
            )}
          </div>
        </fieldset>
      ))}

      <div>
        <Boton type="submit" disabled={enProgreso}>
          {enProgreso ? "Guardando..." : "Guardar cambios"}
        </Boton>
      </div>
    </form>
  );
}
