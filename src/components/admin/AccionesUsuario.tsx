"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { cambiarRolUsuario, desactivarPersonal, reactivarPersonal } from "@/lib/actions/usuarios";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";
import type { Rol } from "@/types/database";

const RUTA_COMPLETAR: Record<string, string> = {
  docente: "/admin-db/usuarios/completar-docente",
  secretaria: "/admin-db/usuarios/completar-secretaria",
};

export function SelectorRol({ perfilId, rolActual }: { perfilId: string; rolActual: Rol }) {
  const router = useRouter();
  const [enProgreso, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function manejarCambio(nuevoRol: Rol) {
    if (nuevoRol === rolActual) return;
    setError(null);
    iniciarTransicion(async () => {
      const resultado = await cambiarRolUsuario(perfilId, nuevoRol);
      if (resultado.error) {
        setError(resultado.error);
        return;
      }
      const ruta = RUTA_COMPLETAR[nuevoRol];
      if (ruta) {
        router.push(`${ruta}/${perfilId}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        defaultValue={rolActual}
        disabled={enProgreso}
        onChange={(e) => manejarCambio(e.target.value as Rol)}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-azul-medio focus:outline-none"
      >
        <option value="cliente">Cliente</option>
        <option value="docente">Docente</option>
        <option value="secretaria">Secretaria</option>
        <option value="admin_db">Admin BD</option>
        <option value="admin_contenido">Admin Contenido</option>
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function BotonDesactivar({ perfilId }: { perfilId: string }) {
  const router = useRouter();
  const [enProgreso, iniciarTransicion] = useTransition();

  function manejarClic() {
    const confirmado = window.confirm("¿Desactivar esta cuenta? No podrá iniciar sesión hasta reactivarla.");
    if (!confirmado) return;
    iniciarTransicion(async () => {
      const resultado = await desactivarPersonal(perfilId);
      if (resultado?.error) window.alert(resultado.error);
      router.refresh();
    });
  }

  return (
    <Boton variante="peligro" type="button" className="px-3 py-1.5 text-xs" onClick={manejarClic} disabled={enProgreso}>
      Desactivar
    </Boton>
  );
}

const estadoInicial: EstadoFormulario = {};

export function FormularioReactivar({ perfilId, tipo }: { perfilId: string; tipo: "docente" | "secretaria" }) {
  const [abierto, setAbierto] = useState(false);
  const [estado, accionFormulario, enProgreso] = useActionState(reactivarPersonal, estadoInicial);

  if (!abierto) {
    return (
      <Boton variante="secundario" type="button" className="px-3 py-1.5 text-xs" onClick={() => setAbierto(true)}>
        Reactivar
      </Boton>
    );
  }

  return (
    <form action={accionFormulario} className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gris-claro p-3">
      <input type="hidden" name="perfil_id" value={perfilId} />
      <input type="hidden" name="tipo" value={tipo} />
      {estado.error && <Mensaje tipo="error" texto={estado.error} />}
      {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}
      <p className="text-xs text-gray-600">Nuevo periodo de contrato:</p>
      <div className="flex flex-wrap gap-2">
        <Campo etiqueta="Desde" nombre="fecha_inicio" type="date" requerido />
        <Campo etiqueta="Hasta" nombre="fecha_final" type="date" />
      </div>
      <div className="flex gap-2">
        <Boton type="submit" className="px-3 py-1.5 text-xs" disabled={enProgreso}>
          {enProgreso ? "Guardando..." : "Confirmar reactivación"}
        </Boton>
        <Boton variante="fantasma" type="button" className="px-3 py-1.5 text-xs" onClick={() => setAbierto(false)}>
          Cancelar
        </Boton>
      </div>
    </form>
  );
}
