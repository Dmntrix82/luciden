import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/supabase/perfil";
import { cerrarSesion } from "@/lib/actions/auth";
import { Boton } from "@/components/ui/Boton";
import { Logo } from "@/components/ui/Logo";
import type { Rol } from "@/types/database";

function panelDeInicio(rol: Rol | undefined) {
  if (rol === "admin_db") return "/admin-db";
  if (rol === "admin_contenido") return "/admin-contenido";
  if (rol === "docente") return "/docente";
  if (rol === "secretaria") return "/secretaria";
  return "/cliente";
}

export default async function LayoutMiPerfil({ children }: { children: React.ReactNode }) {
  const usuario = await obtenerUsuarioActual();
  const volverA = panelDeInicio(usuario?.perfil?.rol);

  return (
    <div className="flex min-h-screen flex-col bg-gris-claro">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href={volverA}>
            <Logo tamano="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href={volverA}>
              <Boton variante="fantasma">Volver a mi panel</Boton>
            </Link>
            <form action={cerrarSesion}>
              <Boton type="submit" variante="fantasma">
                Cerrar sesión
              </Boton>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
