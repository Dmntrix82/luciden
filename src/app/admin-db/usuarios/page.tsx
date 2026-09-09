import type { Metadata } from "next";
import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { esEditorActivo } from "@/lib/personal-estado";
import { Boton } from "@/components/ui/Boton";
import { SelectorRol, BotonDesactivar, FormularioReactivar } from "@/components/admin/AccionesUsuario";
import type { Perfil } from "@/types/database";

export const metadata: Metadata = { title: "Usuarios — Admin DB" };

function Tarjeta({ perfil, children }: { perfil: Perfil; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-gray-900">{perfil.nombre_completo ?? "(sin nombre)"}</p>
          <p className="text-xs text-gray-500">
            @{perfil.nombre_usuario ?? "—"} · {perfil.activo ? "Activo" : "Desactivado"}
          </p>
        </div>
        <SelectorRol perfilId={perfil.id} rolActual={perfil.rol} />
      </div>
      {children}
    </div>
  );
}

export default async function PaginaUsuarios() {
  const supabase = await crearClienteServidor();

  const [{ data: perfiles }, { data: docentes }, { data: secretarias }] = await Promise.all([
    supabase.from("perfiles").select("*").order("created_at", { ascending: false }),
    supabase.from("docentes").select("*"),
    supabase.from("secretarias").select("*"),
  ]);

  const docentePorPerfil = new Map((docentes ?? []).filter((d) => d.perfil_id).map((d) => [d.perfil_id!, d]));
  const secretariaPorId = new Map((secretarias ?? []).map((s) => [s.id, s]));

  const clientes = (perfiles ?? []).filter((p) => p.rol === "cliente");
  const docentesLista = (perfiles ?? []).filter((p) => p.rol === "docente");
  const secretariasLista = (perfiles ?? []).filter((p) => p.rol === "secretaria");
  const administradores = (perfiles ?? []).filter((p) => p.rol === "admin_db" || p.rol === "admin_contenido");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-azul-oscuro">Usuarios y roles</h1>
        <Link href="/admin-db/usuarios/nueva-secretaria">
          <Boton>+ Nueva secretaria</Boton>
        </Link>
      </div>
      <p className="text-sm text-gray-500">
        Esto lista las <span className="font-medium">cuentas de acceso al sitio</span> (quien se
        registró). No confundir con la lista de estudiantes matriculados en Estudiantes.
      </p>

      <section>
        <h2 className="mb-3 font-semibold text-azul-oscuro">Docentes ({docentesLista.length})</h2>
        <div className="flex flex-col gap-3">
          {docentesLista.map((perfil) => {
            const docente = docentePorPerfil.get(perfil.id);
            return (
              <Tarjeta key={perfil.id} perfil={perfil}>
                {docente && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-sm">
                    <span className="text-gray-600">
                      Contrato: {docente.fecha_inicio ?? "—"} → {docente.fecha_final ?? "sin vencimiento"} ·{" "}
                      <span className={esEditorActivo(docente.fecha_final) ? "text-green-700" : "text-gray-500"}>
                        {esEditorActivo(docente.fecha_final) ? "Editor" : "Lector (vencido)"}
                      </span>
                    </span>
                    {perfil.activo ? (
                      <BotonDesactivar perfilId={perfil.id} />
                    ) : (
                      <FormularioReactivar perfilId={perfil.id} tipo="docente" />
                    )}
                  </div>
                )}
                {!docente && (
                  <p className="mt-2 text-sm text-yellow-700">
                    Falta completar sus datos —{" "}
                    <Link href={`/admin-db/usuarios/completar-docente/${perfil.id}`} className="underline">
                      completar ahora
                    </Link>
                  </p>
                )}
              </Tarjeta>
            );
          })}
          {docentesLista.length === 0 && <p className="text-sm text-gray-500">No hay docentes.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-azul-oscuro">Secretaría ({secretariasLista.length})</h2>
        <div className="flex flex-col gap-3">
          {secretariasLista.map((perfil) => {
            const secretaria = secretariaPorId.get(perfil.id);
            return (
              <Tarjeta key={perfil.id} perfil={perfil}>
                {secretaria && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-sm">
                    <span className="text-gray-600">
                      Contrato: {secretaria.fecha_inicio ?? "—"} → {secretaria.fecha_final ?? "sin vencimiento"} ·{" "}
                      <span className={esEditorActivo(secretaria.fecha_final) ? "text-green-700" : "text-gray-500"}>
                        {esEditorActivo(secretaria.fecha_final) ? "Editor" : "Lector (vencido)"}
                      </span>
                    </span>
                    {perfil.activo ? (
                      <BotonDesactivar perfilId={perfil.id} />
                    ) : (
                      <FormularioReactivar perfilId={perfil.id} tipo="secretaria" />
                    )}
                  </div>
                )}
                {!secretaria && (
                  <p className="mt-2 text-sm text-yellow-700">
                    Falta completar sus datos —{" "}
                    <Link href={`/admin-db/usuarios/completar-secretaria/${perfil.id}`} className="underline">
                      completar ahora
                    </Link>
                  </p>
                )}
              </Tarjeta>
            );
          })}
          {secretariasLista.length === 0 && <p className="text-sm text-gray-500">No hay secretarias.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-azul-oscuro">Estudiantes registrados en el sitio ({clientes.length})</h2>
        <div className="flex flex-col gap-3">
          {clientes.map((perfil) => (
            <Tarjeta key={perfil.id} perfil={perfil} />
          ))}
          {clientes.length === 0 && <p className="text-sm text-gray-500">Nadie se ha registrado todavía.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-azul-oscuro">Administradores ({administradores.length})</h2>
        <div className="flex flex-col gap-3">
          {administradores.map((perfil) => (
            <Tarjeta key={perfil.id} perfil={perfil} />
          ))}
        </div>
      </section>
    </div>
  );
}
