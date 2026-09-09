import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Rol } from "@/types/database";

const RUTAS_POR_ROL: Record<string, Rol> = {
  "/admin-db": "admin_db",
  "/admin-contenido": "admin_contenido",
};

const RUTAS_AUTENTICADAS = ["/cliente"];
const RUTAS_SOLO_INVITADOS = ["/login", "/registro"];

function panelDeInicio(rol: Rol | undefined) {
  if (rol === "admin_db") return "/admin-db";
  if (rol === "admin_contenido") return "/admin-contenido";
  return "/cliente";
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  let rol: Rol | undefined;
  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .single();
    rol = perfil?.rol;
  }

  const rolRequerido = Object.entries(RUTAS_POR_ROL).find(([ruta]) =>
    pathname.startsWith(ruta)
  )?.[1];

  if (rolRequerido) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (rol !== rolRequerido) {
      return NextResponse.redirect(new URL(panelDeInicio(rol), request.url));
    }
  }

  if (RUTAS_AUTENTICADAS.some((ruta) => pathname.startsWith(ruta)) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (RUTAS_SOLO_INVITADOS.some((ruta) => pathname.startsWith(ruta)) && user) {
    return NextResponse.redirect(new URL(panelDeInicio(rol), request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
