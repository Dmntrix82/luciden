export interface CampoTexto {
  seccion: string;
  clave: string;
  etiqueta: string;
  porDefecto: string;
  multilinea?: boolean;
}

export interface CampoImagen {
  seccion: string;
  clave: string;
  etiqueta: string;
  descripcion?: string;
}

export interface CampoColor {
  clave: string;
  etiqueta: string;
  porDefecto: string;
}

export const SECCION_PALETA = "paleta";
export const SECCION_TIPOGRAFIA = "tipografia";
export const CLAVE_FUENTE_PERSONALIZADA = "fuente_personalizada_url";
export const CLAVE_TAMANO_BASE = "tamano_base";

export const CAMPOS_TEXTO: CampoTexto[] = [
  {
    seccion: "hero",
    clave: "titulo",
    etiqueta: "Título principal",
    porDefecto: "Instituto LUCIDEN",
  },
  {
    seccion: "hero",
    clave: "subtitulo",
    etiqueta: "Subtítulo",
    porDefecto: "Educación con Excelencia",
  },
  {
    seccion: "nosotros",
    clave: "titulo",
    etiqueta: "Título de la sección \"Nosotros\"",
    porDefecto: "Sobre nosotros",
  },
  {
    seccion: "nosotros",
    clave: "texto",
    etiqueta: "Descripción del instituto",
    porDefecto:
      "En el Instituto LUCIDEN ofrecemos programas de formación técnica y profesional, con un enfoque práctico orientado a la empleabilidad.",
    multilinea: true,
  },
  { seccion: "contacto", clave: "direccion", etiqueta: "Dirección", porDefecto: "" },
  { seccion: "contacto", clave: "telefono", etiqueta: "Teléfono", porDefecto: "" },
  { seccion: "contacto", clave: "email", etiqueta: "Correo de contacto", porDefecto: "" },
  { seccion: "contacto", clave: "horario", etiqueta: "Horario de atención", porDefecto: "" },
];

export const CAMPOS_IMAGEN: CampoImagen[] = [
  { seccion: "general", clave: "logo", etiqueta: "Logo del instituto" },
  { seccion: "hero", clave: "imagen_fondo", etiqueta: "Imagen de portada" },
];

export const CAMPOS_COLOR: CampoColor[] = [
  { clave: "color_azul_oscuro", etiqueta: "Azul oscuro", porDefecto: "#041b73" },
  { clave: "color_azul_medio", etiqueta: "Azul medio", porDefecto: "#0236a2" },
  { clave: "color_azul_brillante", etiqueta: "Azul brillante", porDefecto: "#0250ce" },
  { clave: "color_blanco", etiqueta: "Blanco", porDefecto: "#fbfcfc" },
];

export const SLOGAN_LUCIDEN = "Educación con Excelencia";
