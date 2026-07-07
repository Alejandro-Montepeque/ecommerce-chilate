import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "brand";

const tones: Record<Tone, string> = {
  neutral: "bg-zinc-100 text-zinc-600",
  success: "bg-sage-100 text-sage-700",
  warning: "bg-amber-100 text-amber-800",
  brand: "bg-brand-100 text-brand-700",
};

// Etiqueta compacta para estados (stock, publicado, rol...).
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
