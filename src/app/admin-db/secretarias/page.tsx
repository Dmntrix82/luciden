import type { Metadata } from "next";
import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { esEditorActivo } from "@/lib/personal-estado";
import { Boton } from "@/components/ui/Boton";

export const metadata: Metadata = { title: "Secretaría — Admin DB" };

export default async function PaginaSecretarias() {
  const supabase = await crearClienteServidor();

  const { data: perfiles } = await supabase.from("perfiles").select("*").eq("rol", "secretaria");
  const { data: secretarias } = await supabase.from("secretarias").select("*");

  const secretariaPorId = new Map((secretarias ?? []).map((s) => [s.id, s]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-azul-oscuro">Secretaría</h1>
        <Link href="/admin-db/secretarias/nueva">
          <Boton>+ Nueva secretaria</Boton>
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {(perfiles ?? []).map((perfil) => {
          const secretaria = secretariaPorId.get(perfil.id);
          return (
            <div key={perfil.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{perfil.nombre_completo}</p>
                  <p className="text-xs text-gray-500">
                    @{perfil.nombre_usuario ?? "—"} · {perfil.activo ? "Activa" : "Desactivada"}
                  </p>
                </div>
                {secretaria ? (
                  <Link href={`/admin-db/secretarias/${perfil.id}`}>
                    <Boton variante="secundario" className="px-3 py-1.5">
                      Editar
                    </Boton>
                  </Link>
                ) : (
                  <span className="text-sm text-yellow-700">Faltan datos de contrato</span>
                )}
              </div>
              {secretaria && (
                <p className="mt-2 text-sm text-gray-600">
                  Contrato: {secretaria.fecha_inicio ?? "—"} → {secretaria.fecha_final ?? "sin vencimiento"} ·{" "}
                  <span className={esEditorActivo(secretaria.fecha_final) ? "text-green-700" : "text-gray-500"}>
                    {esEditorActivo(secretaria.fecha_final) ? "Editor" : "Lector (vencido)"}
                  </span>
                </p>
              )}
            </div>
          );
        })}
        {(perfiles ?? []).length === 0 && (
          <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
            Todavía no hay secretarias registradas.
          </p>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Para activar/desactivar o cambiar de rol, ve a{" "}
        <Link href="/admin-db/usuarios" className="underline">
          Usuarios
        </Link>
        .
      </p>
    </div>
  );
}
