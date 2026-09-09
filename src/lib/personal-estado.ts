export function esEditorActivo(fechaFinal: string | null): boolean {
  if (!fechaFinal) return true;
  const hoy = new Date().toISOString().slice(0, 10);
  return fechaFinal >= hoy;
}
