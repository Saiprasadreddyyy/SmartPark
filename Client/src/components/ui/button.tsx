import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-r from-emerald-400 to-green-500 text-black hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30",

    secondary:
      "border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10",

    danger:
      "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      {...props}
      className={clsx(
        "px-6 py-3 rounded-xl font-semibold transition-all duration-300",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}