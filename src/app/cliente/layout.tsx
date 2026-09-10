import Link from "next/link";
import { cerrarSesion } from "@/lib/actions/auth";
import { Boton } from "@/components/ui/Boton";
import { Logo } from "@/components/ui/Logo";

export default function LayoutCliente({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gris-claro">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/">
            <Logo tamano="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/mi-perfil">
              <Boton variante="fantasma">Mi perfil</Boton>
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
