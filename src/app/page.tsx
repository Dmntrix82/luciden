import Image from "next/image";
import { Navbar } from "@/components/publico/Navbar";
import { Footer } from "@/components/publico/Footer";
import { TarjetaCurso } from "@/components/publico/TarjetaCurso";
import { obtenerMapaContenido, textoDe, imagenDe, cursosDe } from "@/lib/contenido";

export default async function PaginaInicio() {
  const mapa = await obtenerMapaContenido();

  const tituloHero = textoDe(mapa, "hero", "titulo");
  const subtituloHero = textoDe(mapa, "hero", "subtitulo");
  const imagenHero = imagenDe(mapa, "hero", "imagen_fondo");
  const tituloNosotros = textoDe(mapa, "nosotros", "titulo");
  const textoNosotros = textoDe(mapa, "nosotros", "texto");
  const cursos = cursosDe(mapa);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section
          className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-azul-oscuro text-white"
          style={
            imagenHero
              ? { backgroundImage: `url(${imagenHero})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {imagenHero && <div className="absolute inset-0 bg-azul-oscuro/70" />}
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center">
            <Image
              src="/logo-luciden.png"
              alt="Instituto LUCIDEN"
              width={110}
              height={110}
              className="mx-auto mb-6 rounded-full"
              unoptimized
              priority
            />
            <h1 className="text-4xl font-bold sm:text-5xl">{tituloHero}</h1>
            <p className="mt-4 text-lg text-white/90">{subtituloHero}</p>
          </div>
        </section>

        <section id="cursos" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold text-azul-oscuro">Cursos disponibles</h2>
          {cursos.length === 0 ? (
            <p className="mt-4 text-gray-500">
              Todavía no hay cursos publicados. Vuelve pronto.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cursos.map((curso, indice) => (
                <TarjetaCurso key={indice} curso={curso} />
              ))}
            </div>
          )}
        </section>

        <section id="nosotros" className="bg-gris-claro py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 sm:flex-row">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-azul-oscuro">{tituloNosotros}</h2>
              <p className="mt-4 text-gray-700">{textoNosotros}</p>
            </div>
            {imagenDe(mapa, "general", "logo") && (
              <div className="relative h-40 w-40 shrink-0">
                <Image
                  src={imagenDe(mapa, "general", "logo")!}
                  alt="Logo del Instituto LUCIDEN"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer mapa={mapa} />
    </>
  );
}
