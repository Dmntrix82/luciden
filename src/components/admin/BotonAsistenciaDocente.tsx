"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { marcarLlegadaDocente } from "@/lib/actions/asistencias";
import { Boton } from "@/components/ui/Boton";

export function BotonAsistenciaDocente({ docenteId, yaMarcado }: { docenteId: string; yaMarcado: boolean }) {
  const router = useRouter();
  const [enProgreso, iniciarTransicion] = useTransition();

  function manejarClic() {
    iniciarTransicion(async () => {
      const resultado = await marcarLlegadaDocente(docenteId);
      if (resultado.error) window.alert(resultado.error);
      router.refresh();
    });
  }

  if (yaMarcado) {
    return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Marcado hoy</span>;
  }

  return (
    <Boton variante="secundario" type="button" className="px-3 py-1.5 text-xs" onClick={manejarClic} disabled={enProgreso}>
      {enProgreso ? "Marcando..." : "Marcar asistencia"}
    </Boton>
  );
}
