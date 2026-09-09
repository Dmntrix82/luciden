import type { Metadata } from "next";
import { FormularioReenviarVerificacion } from "@/components/auth/FormularioReenviarVerificacion";

export const metadata: Metadata = { title: "Verifica tu correo — Instituto LUCIDEN" };

export default async function PaginaVerificarCorreo({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "" } = await searchParams;

  return (
    <div className="flex flex-col gap-4 text-center">
      <h1 className="text-xl font-semibold text-azul-oscuro">Revisa tu correo</h1>
      <p className="text-gray-700">
        Te enviamos un enlace de verificación{email ? <> a <strong>{email}</strong></> : ""}. Ábrelo
        para confirmar tu cuenta y poder iniciar sesión.
      </p>
      <p className="text-sm text-gray-500">
        Si no lo encuentras, revisa tu carpeta de spam o solicita un nuevo envío.
      </p>
      <FormularioReenviarVerificacion email={email} />
    </div>
  );
}
