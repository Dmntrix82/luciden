"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface EnlacePanel {
  href: string;
  etiqueta: string;
  exacto?: boolean;
}

export function PanelNav({ enlaces }: { enlaces: EnlacePanel[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-b border-gray-200 bg-white px-4">
      {enlaces.map((enlace) => {
        const activo = enlace.exacto
          ? pathname === enlace.href
          : pathname === enlace.href || pathname?.startsWith(`${enlace.href}/`);
        return (
          <Link
            key={enlace.href}
            href={enlace.href}
            className={`border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              activo
                ? "border-azul-medio text-azul-medio"
                : "border-transparent text-gray-600 hover:text-azul-medio"
            }`}
          >
            {enlace.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
