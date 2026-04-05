import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost";
  size?: "default" | "sm";
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl border text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        variant === "default" &&
          "border-sky-300/20 bg-sky-400 text-slate-950 shadow-lg shadow-sky-950/20 hover:bg-sky-300",
        variant === "secondary" &&
          "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
        variant === "ghost" && "border-transparent bg-transparent text-slate-200 hover:bg-white/5",
        size === "default" && "h-11 px-4 py-2",
        size === "sm" && "h-9 px-3",
        className,
      )}
      {...props}
    />
  );
}
