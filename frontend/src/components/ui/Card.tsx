import type { ReactNode } from "react";

// Contenedor tipo tarjeta reutilizable (borde, fondo blanco, sombra suave).
// El padding/márgenes se pasan por className según el caso.
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
