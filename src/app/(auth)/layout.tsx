import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function LayoutAuth({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gris-claro px-4 py-6 sm:py-10">
      <Link href="/" className="mb-3 sm:mb-6">
        <Logo tamano="lg" conSlogan />
      </Link>
      {children}
    </div>
  );
}
