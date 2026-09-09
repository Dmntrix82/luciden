import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/supabase/perfil";
import { cerrarSesion } from "@/lib/actions/auth";
import { Boton } from "@/components/ui/Boton";
import { Logo } from "@/components/ui/Logo";

const ENLACES_PANEL: Record<string, string> = {
  admin_db: "/admin-db",
  admin_contenido: "/admin-contenido",
  docente: "/docente",
  secretaria: "/secretaria",
  cliente: "/cliente",
};

export async function Navbar() {
  const usuario = await obtenerUsuarioActual();
  const rol = usuario?.perfil?.rol ?? "cliente";

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/">
          <Logo tamano="sm" conSlogan />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/#cursos" className="hidden text-gray-700 hover:text-azul-medio sm:inline">
            Cursos
          </Link>
          <Link href="/#nosotros" className="hidden text-gray-700 hover:text-azul-medio sm:inline">
            Nosotros
          </Link>
          <Link href="/#contacto" className="hidden text-gray-700 hover:text-azul-medio sm:inline">
            Contacto
          </Link>

          {usuario ? (
            <div className="flex items-center gap-3">
              <Link
                href={ENLACES_PANEL[rol]}
                className="font-medium text-azul-medio hover:underline"
              >
                Mi panel
              </Link>
              <form action={cerrarSesion}>
                <Boton type="submit" variante="fantasma" className="px-2 py-1">
                  Salir
                </Boton>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="font-medium text-azul-medio hover:underline">
                Iniciar sesión
              </Link>
              <Link href="/registro">
                <Boton className="px-3 py-1.5">Registrarme</Boton>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
