import Image from "next/image";
import type { Curso } from "@/lib/contenido-config";

export function TarjetaCurso({ curso }: { curso: Curso }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="relative h-40 w-full bg-gris-claro">
        {curso.imagen_url ? (
          <Image
            src={curso.imagen_url}
            alt={curso.titulo}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-azul-oscuro">{curso.titulo}</h3>
        {curso.descripcion && <p className="text-sm text-gray-600">{curso.descripcion}</p>}
        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          {curso.duracion && <span className="text-gray-500">{curso.duracion}</span>}
          {curso.precio && <span className="font-medium text-azul-medio">{curso.precio}</span>}
        </div>
      </div>
    </article>
  );
}
