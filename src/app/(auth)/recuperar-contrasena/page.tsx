import type { Metadata } from "next";
import { FormularioRecuperar } from "@/components/auth/FormularioRecuperar";

export const metadata: Metadata = { title: "Recuperar contraseña — Instituto LUCIDEN" };

export default function PaginaRecuperarContrasena() {
  return <FormularioRecuperar />;
}
