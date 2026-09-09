import type { Metadata } from "next";
import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { formatearFechaHora } from "@/lib/fecha";

export const metadata: Metadata = { title: "Panel — Admin Contenido" };

export default async function PaginaAdminContenido() {
  const supabase = await crearClienteServidor();
  const { data: ultimosCambios } = await supabase
    .from("historial_cambios")
    .select("descripcion_legible, fecha_hora")
    .eq("tabla_modificada", "contenido_pagina")
    .order("fecha_hora", { ascending: false })
    .limit(8);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-azul-oscuro">Panel de gestión de contenido</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/admin-contenido/textos", titulo: "Textos", desc: "Títulos y descripciones" },
          { href: "/admin-contenido/imagenes", titulo: "Imágenes", desc: "Logo y portada" },
          { href: "/admin-contenido/tipografia", titulo: "Tipografía", desc: "Colores y fuentes" },
          { href: "/admin-contenido/cursos", titulo: "Cursos", desc: "Afiches de cursos" },
        ].map((tarjeta) => (
          <Link
            key={tarjeta.href}
            href={tarjeta.href}
            className="rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-azul-medio"
          >
            <h2 className="font-semibold text-azul-oscuro">{tarjeta.titulo}</h2>
            <p className="mt-1 text-sm text-gray-500">{tarjeta.desc}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-azul-oscuro">Actividad reciente</h2>
        {(ultimosCambios ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no hay cambios registrados.</p>
        ) : (
          <ul className="flex flex-col gap-3 text-sm">
            {(ultimosCambios ?? []).map((cambio, indice) => (
              <li key={indice} className="border-b border-gray-100 pb-3 last:border-0">
                <p className="text-gray-800">{cambio.descripcion_legible}</p>
                <p className="text-xs text-gray-400">{formatearFechaHora(cambio.fecha_hora)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
