"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { CampoContrasenaAuth } from "@/components/auth/CampoAuth";
import { Mensaje } from "@/components/ui/Mensaje";

type Estado = "cargando" | "listo" | "invalido" | "hecho";

export function FormularioActualizarContrasena() {
  const [supabase] = useState(() => crearClienteNavegador());
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("cargando");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const { data: suscripcion } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "PASSWORD_RECOVERY") setEstado("listo");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setEstado((actual) => (actual === "cargando" ? "listo" : actual));
    });

    const limite = setTimeout(() => {
      setEstado((actual) => (actual === "cargando" ? "invalido" : actual));
    }, 4000);

    return () => {
      suscripcion.subscription.unsubscribe();
      clearTimeout(limite);
    };
  }, [supabase]);

  async function manejarSubmit(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setEnviando(true);
    const { error } = await supabase.auth.updateUser({ password });
    setEnviando(false);
    if (error) {
      setError("No se pudo actualizar la contraseña. Intenta nuevamente.");
      return;
    }
    setEstado("hecho");
    setTimeout(() => router.push("/login"), 2000);
  }

  if (estado === "cargando") {
    return (
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <p className="text-gray-500">Verificando el enlace...</p>
      </div>
    );
  }

  if (estado === "invalido") {
    return (
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <p className="text-gray-700">Este enlace no es válido o ya expiró.</p>
        <Link
          href="/recuperar-contrasena"
          className="mt-3 inline-block font-medium text-azul-medio hover:underline"
        >
          Solicitar uno nuevo
        </Link>
      </div>
    );
  }

  if (estado === "hecho") {
    return (
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <Mensaje tipo="exito" texto="Contraseña actualizada. Redirigiendo al inicio de sesión..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-azul-oscuro">Nueva contraseña</h1>
      <p className="mt-2 text-sm text-gray-600">Elige una nueva contraseña para tu cuenta.</p>

      <form onSubmit={manejarSubmit} className="mt-4">
        {error && (
          <div className="mb-2">
            <Mensaje tipo="error" texto={error} />
          </div>
        )}

        <CampoContrasenaAuth
          placeholder="Nueva contraseña (mínimo 8 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <button
          type="submit"
          disabled={enviando}
          className="h-12 w-full rounded-lg bg-azul-medio font-semibold text-white shadow-md transition-colors hover:bg-azul-oscuro disabled:opacity-60"
        >
          {enviando ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>
    </div>
  );
}
