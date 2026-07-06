import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const styles: Record<Variant, string> = {
  primary: "bg-black text-white hover:bg-gray-800",
  secondary: "border border-gray-300 hover:bg-gray-100",
  danger: "text-red-600 hover:bg-red-50",
};

// Botón reutilizable con variantes y estado disabled consistente.
export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`rounded px-4 py-2 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    />
  );
}
