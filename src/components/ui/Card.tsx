import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export default function Card({ children, onClick, className = "", style }: CardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      style={style}
      className={`bg-white rounded-apple shadow-apple p-5 w-full
        ${onClick ? "text-left hover:shadow-apple-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer" : ""}
        ${className}`}
    >
      {children}
    </Component>
  );
}
