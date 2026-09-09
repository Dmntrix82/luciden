"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/Boton";

export function BotonEliminarGenerico({
  id,
  nombre,
  accion,
}: {
  id: string;
  nombre: string;
  accion: (id: string) => Promise<{ error?: string; exito?: string } | void>;
}) {
  const router = useRouter();
  const [enProgreso, iniciarTransicion] = useTransition();

  function manejarClic() {
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    iniciarTransicion(async () => {
      const resultado = await accion(id);
      if (resultado?.error) {
        window.alert(resultado.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Boton variante="peligro" type="button" onClick={manejarClic} disabled={enProgreso}>
      {enProgreso ? "Eliminando..." : "Eliminar"}
    </Boton>
  );
}
