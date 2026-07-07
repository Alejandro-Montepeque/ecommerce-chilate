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
      <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-base font-extrabold text-white shadow-soft">
        C
      </span>
      {showName && (
        <span className="text-xl font-extrabold tracking-tight text-zinc-900">
          Chilate
        </span>
      )}
    </span>
  );
}
