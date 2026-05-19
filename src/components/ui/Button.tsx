import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.97]";

  const variants = {
    primary:
      "bg-brand-500 text-white rounded-apple-xs px-6 py-3 hover:bg-brand-600 shadow-apple",
    ghost: "text-brand-500 hover:text-brand-600 bg-transparent",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
