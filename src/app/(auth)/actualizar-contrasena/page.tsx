import type { Metadata } from "next";
import { FormularioActualizarContrasena } from "@/components/auth/FormularioActualizarContrasena";

export const metadata: Metadata = { title: "Nueva contraseña — Instituto LUCIDEN" };

export default function PaginaActualizarContrasena() {
  return <FormularioActualizarContrasena />;
}
