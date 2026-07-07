import { useLogoUrl } from "@/features/content/content.queries";

// Logo de la marca: muestra la imagen subida desde el panel, o el recuadro
// "C" por defecto si aún no se ha configurado ninguno.
export function Logo({ showName = true }: { showName?: boolean }) {
  const logo = useLogoUrl();

  if (logo) {
    return (
      <img
        src={logo}
        alt="Chilate"
        className="h-8 w-auto max-w-[160px] object-contain"
      />
    );
  }

  return (
    <span className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
        C
      </span>
      {showName && (
        <span className="text-lg font-semibold tracking-tight text-zinc-900">
          Chilate
        </span>
      )}
    </span>
  );
}
