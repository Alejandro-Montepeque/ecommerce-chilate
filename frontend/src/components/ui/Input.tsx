import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

// Campo de formulario reutilizable con etiqueta opcional.
export function Input({ label, className = "", ...props }: Props) {
  return (
    <label className="block text-sm">
      {label && <span className="text-gray-600">{label}</span>}
      <input
        {...props}
        className={`mt-1 w-full border rounded px-3 py-2 ${className}`}
      />
    </label>
  );
}
