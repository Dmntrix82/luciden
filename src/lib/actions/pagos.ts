"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { EstadoFormulario } from "@/lib/actions/auth";

export async function registrarPago(
  estudianteId: string,
  _prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const monto = Number(formData.get("monto"));
  const fechaPago = String(formData.get("fecha_pago") ?? "");
  const mesCorrespondiente = String(formData.get("mes_correspondiente") ?? "").trim() || null;
  const observaciones = String(formData.get("observaciones") ?? "").trim() || null;

  if (!Number.isFinite(monto) || monto <= 0) return { error: "El monto debe ser mayor a 0." };
  if (!fechaPago) return { error: "Indica la fecha del pago." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("pagos").insert({
    estudiante_id: estudianteId,
    monto,
    fecha_pago: fechaPago,
    mes_correspondiente: mesCorrespondiente,
    observaciones,
  });

  if (error) return { error: "No se pudo registrar el pago." };

  revalidatePath(`/admin-db/estudiantes/${estudianteId}`);
  revalidatePath("/admin-db/reportes");
  return { exito: "Pago registrado correctamente." };
}
