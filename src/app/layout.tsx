import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { obtenerMapaContenido, colorDe } from "@/lib/contenido";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Instituto LUCIDEN",
  description: "Instituto educativo LUCIDEN — cursos, inscripciones e información institucional.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const mapa = await obtenerMapaContenido();

  const azulOscuro = colorDe(mapa, "color_azul_oscuro");
  const azulMedio = colorDe(mapa, "color_azul_medio");
  const azulBrillante = colorDe(mapa, "color_azul_brillante");
  const tamanoBase = mapa["tipografia"]?.["tamano_base"] || "16";
  const fuentePersonalizada = mapa["tipografia"]?.["fuente_personalizada_url"];

  const variablesEstilo = {
    "--color-azul-oscuro": azulOscuro,
    "--color-azul-medio": azulMedio,
    "--color-azul-brillante": azulBrillante,
    fontSize: `${tamanoBase}px`,
  } as React.CSSProperties;

  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
      style={variablesEstilo}
    >
      {fuentePersonalizada && (
        <head>
          <style
            dangerouslySetInnerHTML={{
              __html: `@font-face { font-family: 'FuentePersonalizada'; src: url('${fuentePersonalizada}'); font-display: swap; }`,
            }}
          />
        </head>
      )}
      <body
        className="min-h-full flex flex-col bg-white text-[#171717]"
        style={fuentePersonalizada ? { fontFamily: "'FuentePersonalizada', var(--font-inter), sans-serif" } : undefined}
      >
        {children}
      </body>
    </html>
  );
}
