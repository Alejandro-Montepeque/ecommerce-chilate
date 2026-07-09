import type { ReactNode } from "react";

// Estado vacío / de error con recuadro punteado (listados de la tienda).
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500">
      {children}
    </div>
  );
}
