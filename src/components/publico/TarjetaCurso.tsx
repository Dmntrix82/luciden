import Image from "next/image";
import type { Curso } from "@/types/database";
import { formatearFecha } from "@/lib/fecha";

export function TarjetaCurso({ curso }: { curso: Curso }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="relative h-40 w-full bg-gris-claro">
        {curso.imagen_url ? (
          <Image
            src={curso.imagen_url}
            alt={curso.nombre}
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
        <h3 className="font-semibold text-azul-oscuro">{curso.nombre}</h3>
        {curso.informacion && <p className="text-sm text-gray-600">{curso.informacion}</p>}
        <div className="mt-auto flex flex-col gap-1 pt-2 text-sm text-gray-500">
          {curso.horario && <span>Horario: {curso.horario}</span>}
          {curso.fecha_inicio_clases && (
            <span>Inicio: {formatearFecha(curso.fecha_inicio_clases)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
