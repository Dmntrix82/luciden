"use client";

import { useActionState } from "react";
import { registrarPago } from "@/lib/actions/pagos";
import { Campo } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";
import type { Pago } from "@/types/database";

const estadoInicial: EstadoFormulario = {};

export function FormularioPago({ estudianteId, pagos }: { estudianteId: string; pagos: Pago[] }) {
  const [estado, accionFormulario, enProgreso] = useActionState(
    registrarPago.bind(null, estudianteId),
    estadoInicial
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-azul-oscuro">Pagos registrados</h2>

      {pagos.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">Todavía no hay pagos registrados.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {pagos.map((pago) => (
            <li key={pago.id} className="flex justify-between border-b border-gray-100 py-1 last:border-0">
              <span className="text-gray-600">
                {pago.fecha_pago} {pago.mes_correspondiente ? `(${pago.mes_correspondiente})` : ""}
              </span>
              <span className="font-medium text-azul-medio">Bs. {Number(pago.monto).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}

      <form action={accionFormulario} className="mt-4 flex flex-wrap items-end gap-3">
        {estado.error && <Mensaje tipo="error" texto={estado.error} />}
        {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}
        <Campo etiqueta="Monto (Bs.)" nombre="monto" type="number" min="0" step="0.01" requerido />
        <Campo etiqueta="Fecha de pago" nombre="fecha_pago" type="date" requerido defaultValue={new Date().toISOString().slice(0, 10)} />
        <Campo etiqueta="Mes correspondiente" nombre="mes_correspondiente" placeholder="Ej. Septiembre 2026" />
        <Boton type="submit" disabled={enProgreso}>
          {enProgreso ? "Guardando..." : "Registrar pago"}
        </Boton>
      </form>
    </div>
  );
}
