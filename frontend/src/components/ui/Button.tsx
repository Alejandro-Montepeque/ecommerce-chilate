import type { ButtonHTMLAttributes } from "react";

type Variant =
  "primary" | "secondary" | "sage" | "ghost" | "danger" | "inverted";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white shadow-soft hover:bg-brand-700",
  secondary:
    "border border-zinc-300 bg-white text-zinc-800 hover:border-brand-300 hover:bg-brand-50/60",
  sage: "bg-sage-500 text-white shadow-soft hover:bg-sage-600",
  ghost: "text-zinc-600 hover:bg-zinc-100",
  danger: "text-red-600 hover:bg-red-50",
  inverted: "bg-white text-brand-700 shadow-soft hover:bg-brand-50",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    />
  );
}
