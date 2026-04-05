"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ToggleGroupProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  type?: "single";
  className?: string;
  children: React.ReactNode;
};

const ToggleGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
} | null>(null);

export function ToggleGroup({
  value,
  onValueChange,
  className,
  children,
}: ToggleGroupProps) {
  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn("flex flex-wrap gap-1", className)}>{children}</div>
    </ToggleGroupContext.Provider>
  );
}

export function ToggleGroupItem({
  value,
  className,
  children,
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = React.useContext(ToggleGroupContext);

  if (!context) {
    throw new Error("ToggleGroupItem must be used inside ToggleGroup.");
  }

  const active = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange?.(value)}
      className={cn(
        "rounded-full px-3 py-2 text-xs font-medium transition-all",
        active ? "bg-sky-400 text-slate-950" : "bg-white/0 text-slate-300 hover:bg-white/5",
        className,
      )}
    >
      {children}
    </button>
  );
}
