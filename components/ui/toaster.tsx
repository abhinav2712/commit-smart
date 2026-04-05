"use client";

import * as React from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "default" | "destructive";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastState = ToastInput & {
  id: string;
};

const listeners = new Set<() => void>();
let store: ToastState[] = [];
const EMPTY_TOASTS: ToastState[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

function addToast(input: ToastInput) {
  const id = crypto.randomUUID();
  const toast: ToastState = { id, variant: "default", ...input };

  store = [toast, ...store].slice(0, 4);
  notify();

  window.setTimeout(() => dismiss(id), 3200);
}

function dismiss(id: string) {
  store = store.filter((toast) => toast.id !== id);
  notify();
}

export function toast(input: ToastInput) {
  if (typeof window === "undefined") return;
  addToast(input);
}

export function useToasts() {
  return React.useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => store,
    () => EMPTY_TOASTS,
  );
}

export function Toaster() {
  const toasts = useToasts();

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      <div className="flex w-full max-w-sm flex-col gap-3">
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastState;
  onDismiss: () => void;
}) {
  const variant = toast.variant ?? "default";
  const Icon = variant === "destructive" ? XCircle : CheckCircle2;

  return (
    <div
      className={cn(
        "pointer-events-auto rounded-2xl border p-4 shadow-2xl backdrop-blur-xl",
        variant === "destructive"
          ? "border-rose-500/30 bg-rose-950/85 text-rose-50"
          : "border-white/10 bg-slate-950/90 text-slate-50",
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", variant === "destructive" ? "text-rose-300" : "text-emerald-300")} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.description ? (
            <p className="mt-1 text-sm text-slate-300">{toast.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
