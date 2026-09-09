"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarEstudiante } from "@/lib/actions/estudiantes";
import { Boton } from "@/components/ui/Boton";

export function BotonEliminarEstudiante({
  id,
  nombreCompleto,
}: {
  id: string;
  nombreCompleto: string;
}) {
  const router = useRouter();
  const [enProgreso, iniciarTransicion] = useTransition();

  function manejarClic() {
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar a ${nombreCompleto}? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    iniciarTransicion(async () => {
      const resultado = await eliminarEstudiante(id);
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
