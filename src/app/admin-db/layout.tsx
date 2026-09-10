import Link from "next/link";
import { cerrarSesion } from "@/lib/actions/auth";
import { Boton } from "@/components/ui/Boton";
import { PanelNav } from "@/components/admin/PanelNav";
import { Logo } from "@/components/ui/Logo";

const ENLACES = [
  { href: "/admin-db", etiqueta: "Panel", exacto: true },
  { href: "/admin-db/docentes", etiqueta: "Docentes" },
  { href: "/admin-db/cursos", etiqueta: "Cursos" },
  { href: "/admin-db/estudiantes", etiqueta: "Estudiantes" },
  { href: "/admin-db/secretarias", etiqueta: "Secretaría" },
  { href: "/admin-db/usuarios", etiqueta: "Roles" },
  { href: "/admin-db/historial", etiqueta: "Historial" },
];

export default function LayoutAdminDB({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gris-claro">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/admin-db" className="flex items-center gap-3">
            <Logo tamano="sm" />
            <span className="hidden text-sm text-gray-400 sm:inline">Base de Datos</span>
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
        <div className="mx-auto max-w-6xl">
          <PanelNav enlaces={ENLACES} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
