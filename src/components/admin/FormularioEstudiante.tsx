"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Campo, CampoSelect, CampoTextarea } from "@/components/ui/Campo";
import { Boton } from "@/components/ui/Boton";
import { Mensaje } from "@/components/ui/Mensaje";
import type { EstadoFormulario } from "@/lib/actions/auth";
import type { Curso, Estudiante } from "@/types/database";

type AccionFormulario = (
  prevState: EstadoFormulario,
  formData: FormData
) => Promise<EstadoFormulario>;

const estadoInicial: EstadoFormulario = {};

const OPCIONES_ESTADO_PAGO = [
  { valor: "activo", etiqueta: "Activo" },
  { valor: "pago_pendiente", etiqueta: "Pago pendiente" },
  { valor: "desactivado", etiqueta: "Desactivado" },
];

export function FormularioEstudiante({
  accion,
  valoresIniciales,
  cursos,
  telefonosIniciales = [],
  textoBoton,
}: {
  accion: AccionFormulario;
  valoresIniciales?: Estudiante;
  cursos: Curso[];
  telefonosIniciales?: string[];
  textoBoton: string;
}) {
  const [estado, accionFormulario, enProgreso] = useActionState(accion, estadoInicial);
  const [telefonos, setTelefonos] = useState<string[]>(
    telefonosIniciales.length > 0 ? telefonosIniciales : [""]
  );

  function actualizarTelefono(indice: number, valor: string) {
    setTelefonos((actuales) => actuales.map((t, i) => (i === indice ? valor : t)));
  }

  return (
    <form action={accionFormulario} className="flex flex-col gap-6">
      {estado.error && <Mensaje tipo="error" texto={estado.error} />}
      {estado.exito && <Mensaje tipo="exito" texto={estado.exito} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo
          etiqueta="Código de estudiante"
          nombre="codigo_estudiante"
          requerido
          defaultValue={valoresIniciales?.codigo_estudiante}
        />
        <Campo
          etiqueta="Cédula de identidad"
          nombre="cedula_identidad"
          requerido
          defaultValue={valoresIniciales?.cedula_identidad}
        />
        <Campo
          etiqueta="Apellido paterno"
          nombre="apellido_paterno"
          requerido
          defaultValue={valoresIniciales?.apellido_paterno}
        />
        <Campo
          etiqueta="Apellido materno"
          nombre="apellido_materno"
          requerido
          defaultValue={valoresIniciales?.apellido_materno}
        />
        <Campo
          etiqueta="Nombres"
          nombre="nombres"
          requerido
          defaultValue={valoresIniciales?.nombres}
        />
        <CampoSelect
          etiqueta="Sexo"
          nombre="sexo"
          requerido
          defaultValue={valoresIniciales?.sexo}
          opciones={[
            { valor: "Masculino", etiqueta: "Masculino" },
            { valor: "Femenino", etiqueta: "Femenino" },
          ]}
        />
        <Campo
          etiqueta="Fecha de nacimiento"
          nombre="fecha_nacimiento"
          type="date"
          requerido
          defaultValue={valoresIniciales?.fecha_nacimiento}
        />

        {cursos.length === 0 ? (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Curso <span className="text-red-600">*</span>
            </label>
            <div className="rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500">
              No se encontraron cursos disponibles.{" "}
              <Link href="/admin-db/cursos/nuevo" className="font-medium text-azul-medio hover:underline">
                Registra un curso primero
              </Link>
              .
            </div>
          </div>
        ) : (
          <CampoSelect
            etiqueta="Curso"
            nombre="curso_id"
            requerido
            defaultValue={valoresIniciales?.curso_id ?? undefined}
            opciones={cursos.map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
          />
        )}

        <CampoSelect
          etiqueta="Estado de pago"
          nombre="estado_pago"
          requerido
          defaultValue={valoresIniciales?.estado_pago ?? "activo"}
          opciones={OPCIONES_ESTADO_PAGO}
        />
        <Campo
          etiqueta="Fecha de inscripción"
          nombre="fecha_inscripcion"
          type="date"
          requerido
          defaultValue={valoresIniciales?.fecha_inscripcion}
        />
        <Campo
          etiqueta="Mensualidad (Bs.)"
          nombre="mensualidad"
          type="number"
          min="0"
          step="0.01"
          requerido
          defaultValue={valoresIniciales?.mensualidad}
        />
        <Campo
          etiqueta="Fecha de inicio"
          nombre="fecha_inicio"
          type="date"
          defaultValue={valoresIniciales?.fecha_inicio ?? undefined}
        />
        <Campo
          etiqueta="Fecha final"
          nombre="fecha_final"
          type="date"
          defaultValue={valoresIniciales?.fecha_final ?? undefined}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="abandono"
          defaultChecked={valoresIniciales?.abandono}
          className="h-4 w-4"
        />
        El estudiante abandonó el curso
      </label>

      <div>
        <label className="text-sm font-medium text-gray-700">Números de celular / referencia</label>
        <div className="mt-2 flex flex-col gap-2">
          {telefonos.map((telefono, indice) => (
            <div key={indice} className="flex gap-2">
              <input
                type="tel"
                name="telefonos"
                value={telefono}
                onChange={(e) => actualizarTelefono(indice, e.target.value)}
                placeholder="Ej. 700 00000"
                className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-azul-medio focus:outline-none focus:ring-2 focus:ring-azul-medio/30"
              />
              {telefonos.length > 1 && (
                <Boton
                  type="button"
                  variante="peligro"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setTelefonos((actuales) => actuales.filter((_, i) => i !== indice))}
                >
                  Quitar
                </Boton>
              )}
            </div>
          ))}
          <div>
            <Boton
              type="button"
              variante="secundario"
              className="px-3 py-1.5 text-xs"
              onClick={() => setTelefonos((actuales) => [...actuales, ""])}
            >
              + Agregar otro número
            </Boton>
          </div>
        </div>
      </div>

      <CampoTextarea
        etiqueta="Observaciones"
        nombre="observaciones"
        defaultValue={valoresIniciales?.observaciones ?? undefined}
      />

      <div>
        <Boton type="submit" disabled={enProgreso}>
          {enProgreso ? "Guardando..." : textoBoton}
        </Boton>
      </div>
    </form>
  );
}
