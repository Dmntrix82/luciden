import Image from "next/image";
import { SLOGAN_LUCIDEN } from "@/lib/contenido-config";

const TAMANOS = {
  sm: 32,
  md: 44,
  lg: 72,
};

export function Logo({
  tamano = "md",
  conSlogan = false,
  claro = false,
}: {
  tamano?: keyof typeof TAMANOS;
  conSlogan?: boolean;
  claro?: boolean;
}) {
  const px = TAMANOS[tamano];

  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo-luciden.png"
        alt="Instituto LUCIDEN"
        width={px}
        height={px}
        className="shrink-0 rounded-full object-contain"
        unoptimized
        priority
      />
      <div className="flex flex-col leading-tight">
        <span className={`font-bold ${claro ? "text-white" : "text-azul-oscuro"}`}>
          Instituto LUCIDEN
        </span>
        {conSlogan && (
          <span className={`text-xs ${claro ? "text-white/80" : "text-gray-500"}`}>
            {SLOGAN_LUCIDEN}
          </span>
        )}
      </div>
    </div>
  );
}
