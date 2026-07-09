import { forwardRef, type TextareaHTMLAttributes } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

// Área de texto con el mismo estilo que Input (etiqueta + error opcional).
export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  function Textarea({ label, error, className = "", rows = 3, ...props }, ref) {
    return (
      <label className="block text-sm">
        {label && (
          <span className="mb-1 block font-medium text-zinc-600">{label}</span>
        )}
        <textarea
          ref={ref}
          rows={rows}
          {...props}
          className={`w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25 ${className}`}
        />
        {error && (
          <span className="mt-1 block text-xs text-red-600">{error}</span>
        )}
      </label>
    );
  },
);
