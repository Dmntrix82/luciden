"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/Boton";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";

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
  const [abierto, setAbierto] = useState(false);

  function confirmar() {
    iniciarTransicion(async () => {
      const resultado = await accion(id);
      setAbierto(false);
      if (resultado?.error) {
        window.alert(resultado.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <Boton variante="peligro" type="button" onClick={() => setAbierto(true)} disabled={enProgreso}>
        {enProgreso ? "Eliminando..." : "Eliminar"}
      </Boton>
      <ModalConfirmacion
        abierto={abierto}
        mensaje={`¿Seguro que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Sí, eliminar"
        enProgreso={enProgreso}
        onConfirmar={confirmar}
        onCancelar={() => setAbierto(false)}
      />
    </>
  );
}
