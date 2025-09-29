import React from "react";
import { cn } from "../lib/utils";

export type LogoSize = "sm" | "md" | "lg" | "xl";
export type LogoVariant = "default" | "gradient";

interface LogoProps {
  className?: string;
  size?: LogoSize;
  variant?: LogoVariant;
  title?: string;
}

const sizeMap: Record<LogoSize, string> = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-5xl",
  xl: "text-6xl",
};

export const Logo: React.FC<LogoProps> = ({
  className,
  size = "md",
  variant = "default",
  title = "OASIS",
}) => {
  const base = "font-ribeye leading-none select-none tracking-wide";
  const visual =
    variant === "gradient"
      ? [
          "bg-clip-text text-transparent",
          "bg-gradient-to-r from-indigo-300 via-indigo-400 to-sky-300",
          "drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]",
        ].join(" ")
      : ["text-white", "drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"].join(" ");

  return (
    <span className={cn(base, sizeMap[size], visual, className)} aria-label={title}>
      OASIS
    </span>
  );
};

export default Logo;