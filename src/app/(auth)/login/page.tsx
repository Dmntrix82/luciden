import type { Metadata } from "next";
import { TarjetaAutenticacion } from "@/components/auth/TarjetaAutenticacion";

export const metadata: Metadata = { title: "Iniciar sesión — Instituto LUCIDEN" };

export default function PaginaLogin() {
  return <TarjetaAutenticacion modoInicial="login" />;
}
