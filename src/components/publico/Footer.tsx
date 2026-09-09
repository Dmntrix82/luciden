import type { MapaContenido } from "@/lib/contenido";
import { textoDe } from "@/lib/contenido";
import { Logo } from "@/components/ui/Logo";

export function Footer({ mapa }: { mapa: MapaContenido }) {
  const direccion = textoDe(mapa, "contacto", "direccion");
  const telefono = textoDe(mapa, "contacto", "telefono");
  const email = textoDe(mapa, "contacto", "email");
  const horario = textoDe(mapa, "contacto", "horario");
  const hayContacto = direccion || telefono || email || horario;

  return (
    <footer id="contacto" className="mt-auto border-t border-gray-200 bg-azul-oscuro text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:justify-between">
        <Logo tamano="md" conSlogan claro />
        <div>
          <h2 className="text-lg font-semibold">Contacto</h2>
          {hayContacto ? (
            <ul className="mt-3 space-y-1 text-sm text-white/80">
              {direccion && <li>{direccion}</li>}
              {telefono && <li>Tel: {telefono}</li>}
              {email && <li>{email}</li>}
              {horario && <li>{horario}</li>}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-white/70">
              Información de contacto próximamente.
            </p>
          )}
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Instituto LUCIDEN. Todos los derechos reservados.
      </p>
    </footer>
  );
}
