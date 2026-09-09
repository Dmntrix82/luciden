import type { Metadata } from "next";
import { obtenerMapaContenido, imagenDe } from "@/lib/contenido";
import { CAMPOS_IMAGEN } from "@/lib/contenido-config";
import { FormularioImagen } from "@/components/admin/FormularioImagen";

export const metadata: Metadata = { title: "Imágenes — Admin Contenido" };

export default async function PaginaImagenes() {
  const mapa = await obtenerMapaContenido();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-azul-oscuro">Imágenes del sitio</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {CAMPOS_IMAGEN.map((campo) => (
          <FormularioImagen
            key={`${campo.seccion}.${campo.clave}`}
            seccion={campo.seccion}
            clave={campo.clave}
            etiqueta={campo.etiqueta}
            urlActual={imagenDe(mapa, campo.seccion, campo.clave)}
            recomendacion={campo.recomendacion}
          />
        ))}
      </div>
    </div>
  );
}
