import { forwardRef, type InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

// Campo reutilizable con etiqueta y foco de marca.
export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, className = "", ...props },
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
        className={`w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${className}`}
      />
    </label>
  );
});
