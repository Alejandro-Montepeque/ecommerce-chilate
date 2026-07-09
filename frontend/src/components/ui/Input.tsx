import { forwardRef, type InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Campo reutilizable con etiqueta, foco de marca y mensaje de error opcional.
export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, className = "", ...props },
  ref,
) {
  return (
    <label className="block text-sm">
      {label && (
        <span className="mb-1 block font-medium text-zinc-600">{label}</span>
      )}
      <input
        ref={ref}
        {...props}
        className={`w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25 ${className}`}
      />
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
});
