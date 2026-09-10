"use client";

import { createPortal } from "react-dom";
import { Boton } from "@/components/ui/Boton";

export function ModalConfirmacion({
  abierto,
  titulo = "Confirmar acción",
  mensaje,
  textoConfirmar = "Sí, continuar",
  textoCancelar = "Cancelar",
  enProgreso = false,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean;
  titulo?: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  enProgreso?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  if (!abierto || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-azul-oscuro">{titulo}</h2>
        <p className="mt-2 text-sm text-gray-600">{mensaje}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Boton variante="fantasma" type="button" onClick={onCancelar} disabled={enProgreso}>
            {textoCancelar}
          </Boton>
          <Boton variante="peligro" type="button" onClick={onConfirmar} disabled={enProgreso}>
            {enProgreso ? "Procesando..." : textoConfirmar}
          </Boton>
        </div>
      </div>
    </div>,
    document.body
  );
}
