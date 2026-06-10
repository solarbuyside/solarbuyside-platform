"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  variant = "primary",
  pendingLabel,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold outline-none transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:-translate-y-[1px] hover:bg-primary/95 hover:shadow-[0_4px_15px_rgba(249,115,22,0.3)]",
        variant === "outline" &&
          "border border-slate-300 bg-white text-slate-800 hover:border-primary/50 hover:bg-slate-50",
      )}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel ?? "Processando…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}
