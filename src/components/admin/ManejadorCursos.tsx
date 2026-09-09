"use client";

import { useActionState, useId, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { guardarCursos, subirImagenCurso } from "@/lib/actions/contenido";
import { CURSO_VACIO, type Curso } from "@/lib/contenido-config";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";

function CampoCurso({
  etiqueta,
  ...props
}: { etiqueta: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {etiqueta}
      </label>
      <input
        id={id}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-azul-medio focus:outline-none focus:ring-2 focus:ring-azul-medio/30"
        {...props}
      />
    </div>
  );
}

const estadoInicial: EstadoFormulario = {};

function TarjetaEdicionCurso({
  curso,
  onCambiar,
  onEliminar,
}: {
  curso: Curso;
  onCambiar: (curso: Curso) => void;
  onEliminar: () => void;
}) {
  const [subiendo, iniciarTransicion] = useTransition();
  const [errorImagen, setErrorImagen] = useState<string | null>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  function manejarSeleccionImagen(archivo: File | undefined) {
    if (!archivo) return;
    setErrorImagen(null);
    iniciarTransicion(async () => {
      const resultado = await subirImagenCurso(archivo);
      if (resultado.error || !resultado.url) {
        setErrorImagen(resultado.error ?? "No se pudo subir la imagen.");
        return;
      }
      onCambiar({ ...curso, imagen_url: resultado.url });
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row">
      <div className="flex flex-col items-center gap-2 sm:w-40">
        <div className="relative h-28 w-full overflow-hidden rounded-md bg-gris-claro">
          {curso.imagen_url ? (
            <Image src={curso.imagen_url} alt={curso.titulo} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              Sin imagen
            </div>
          )}
        </div>
        <input
          ref={inputArchivoRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => manejarSeleccionImagen(e.target.files?.[0])}
        />
        <Boton
          type="button"
          variante="secundario"
          className="w-full px-2 py-1 text-xs"
          disabled={subiendo}
          onClick={() => inputArchivoRef.current?.click()}
        >
          {subiendo ? "Subiendo..." : "Cambiar imagen"}
        </Boton>
        {errorImagen && <p className="text-xs text-red-600">{errorImagen}</p>}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
        <CampoCurso
          etiqueta="Título del curso"
          value={curso.titulo}
          onChange={(e) => onCambiar({ ...curso, titulo: e.target.value })}
          required
        />
        <CampoCurso
          etiqueta="Duración"
          value={curso.duracion}
          onChange={(e) => onCambiar({ ...curso, duracion: e.target.value })}
        />
        <CampoCurso
          etiqueta="Precio"
          value={curso.precio}
          onChange={(e) => onCambiar({ ...curso, precio: e.target.value })}
        />
        <div className="sm:col-span-2">
          <CampoCurso
            etiqueta="Descripción"
            value={curso.descripcion}
            onChange={(e) => onCambiar({ ...curso, descripcion: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Boton type="button" variante="peligro" className="px-3 py-1.5 text-xs" onClick={onEliminar}>
            Eliminar este curso
          </Boton>
        </div>
      </div>
    </div>
  );
}

export function ManejadorCursos({ cursosIniciales }: { cursosIniciales: Curso[] }) {
  const [cursos, setCursos] = useState<Curso[]>(cursosIniciales);
  const [estado, accionFormulario, enProgreso] = useActionState(guardarCursos, estadoInicial);

  function actualizarCurso(indice: number, curso: Curso) {
    setCursos((actuales) => actuales.map((c, i) => (i === indice ? curso : c)));
  }

  function eliminarCurso(indice: number) {
    setCursos((actuales) => actuales.filter((_, i) => i !== indice));
  }

  return (
    <form action={accionFormulario} className="flex flex-col gap-4">
      <input type="hidden" name="cursos" value={JSON.stringify(cursos)} />

      {estado.error && <Mensaje tipo="error" texto={estado.error} />}
      {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}

      {cursos.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
          Todavía no agregaste ningún curso.
        </p>
      )}

      {cursos.map((curso, indice) => (
        <TarjetaEdicionCurso
          key={indice}
          curso={curso}
          onCambiar={(c) => actualizarCurso(indice, c)}
          onEliminar={() => eliminarCurso(indice)}
        />
      ))}

      <div className="flex items-center justify-between">
        <Boton
          type="button"
          variante="secundario"
          onClick={() => setCursos((actuales) => [...actuales, { ...CURSO_VACIO }])}
        >
          + Agregar curso
        </Boton>
        <Boton type="submit" disabled={enProgreso}>
          {enProgreso ? "Guardando..." : "Guardar cursos"}
        </Boton>
      </div>
    </form>
  );
}
