import { CAMPOS_COLOR, CAMPOS_TEXTO } from "@/lib/contenido-config";

export type MapaContenido = Record<string, Record<string, string>>;

export function textoDe(mapa: MapaContenido, seccion: string, clave: string): string {
  const valorGuardado = mapa[seccion]?.[clave];
  if (valorGuardado !== undefined && valorGuardado !== "") return valorGuardado;
  const campo = CAMPOS_TEXTO.find((c) => c.seccion === seccion && c.clave === clave);
  return campo?.porDefecto ?? "";
}

export function colorDe(mapa: MapaContenido, clave: string): string {
  const valorGuardado = mapa["paleta"]?.[clave];
  if (valorGuardado) return valorGuardado;
  return CAMPOS_COLOR.find((c) => c.clave === clave)?.porDefecto ?? "#1565c0";
}

export function imagenDe(mapa: MapaContenido, seccion: string, clave: string): string | null {
  return mapa[seccion]?.[clave] || null;
}
