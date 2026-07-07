import { forwardRef, type SelectHTMLAttributes } from "react";

// Select reutilizable con el mismo estilo que Input (reenvía ref para RHF).
export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = "", ...props }, ref) {
  return (
    <select
      ref={ref}
      {...props}
      className={`w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25 ${className}`}
    />
  );
});
