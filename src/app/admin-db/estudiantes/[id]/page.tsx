import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { FormularioEstudiante } from "@/components/admin/FormularioEstudiante";
import { BotonEliminarEstudiante } from "@/components/admin/BotonEliminarEstudiante";
import { actualizarEstudiante } from "@/lib/actions/estudiantes";

export const metadata: Metadata = { title: "Editar estudiante — Admin DB" };

export default async function PaginaEditarEstudiante({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await crearClienteServidor();

  const [{ data: estudiante }, { data: cursos }, { data: telefonos }] = await Promise.all([
    supabase.from("estudiantes").select("*").eq("id", id).single(),
    supabase.from("cursos").select("*").order("nombre"),
    supabase.from("estudiante_telefonos").select("numero").eq("estudiante_id", id),
  ]);

  if (!estudiante) notFound();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-azul-oscuro">
          Editar estudiante — {estudiante.nombres} {estudiante.apellido_paterno}
        </h1>
        <BotonEliminarEstudiante
          id={estudiante.id}
          nombreCompleto={`${estudiante.nombres} ${estudiante.apellido_paterno}`}
        />
      </div>
      <FormularioEstudiante
        accion={actualizarEstudiante.bind(null, id)}
        valoresIniciales={estudiante}
        cursos={cursos ?? []}
        telefonosIniciales={(telefonos ?? []).map((t) => t.numero)}
        textoBoton="Guardar cambios"
      />
    </div>
  );
}
