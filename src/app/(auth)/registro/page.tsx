import type { Metadata } from "next";
import { TarjetaAutenticacion } from "@/components/auth/TarjetaAutenticacion";

export const metadata: Metadata = { title: "Crear cuenta — Instituto LUCIDEN" };

export default function PaginaRegistro() {
  return <TarjetaAutenticacion modoInicial="registro" />;
}
