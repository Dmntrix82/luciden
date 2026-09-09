import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "peligro" | "fantasma";

const clasesPorVariante: Record<Variante, string> = {
  primario:
    "bg-azul-medio text-white hover:bg-azul-oscuro disabled:bg-gray-300 disabled:text-gray-500",
  secundario:
    "border border-azul-medio text-azul-medio bg-white hover:bg-azul-medio/10 disabled:border-gray-300 disabled:text-gray-400",
  peligro: "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500",
  fantasma: "text-azul-medio hover:bg-azul-medio/10 disabled:text-gray-400",
};

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

export function Boton({ variante = "primario", className = "", ...props }: BotonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed ${clasesPorVariante[variante]} ${className}`}
      {...props}
    />
  );
}
