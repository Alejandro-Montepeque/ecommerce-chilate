import { forwardRef, type SelectHTMLAttributes } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

// Select reutilizable con el mismo estilo que Input (etiqueta + error; reenvía
// ref para react-hook-form).
export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, className = "", ...props },
  ref,
) {
  return (
    <label className="block text-sm">
      {label && (
        <span className="mb-1 block font-medium text-zinc-600">{label}</span>
      )}
      <select
        ref={ref}
        {...props}
        className={`w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25 ${className}`}
      />
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
});
