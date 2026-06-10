import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" | "orange" | "emerald";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
        variant === "default" && "bg-primary/10 text-primary border-primary/20",
        variant === "secondary" && "border-slate-200 bg-slate-100 text-slate-600",
        variant === "success" && "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
        variant === "warning" && "bg-amber-500/10 text-amber-700 border-amber-500/20",
        variant === "destructive" && "bg-destructive/10 text-destructive border-destructive/25",
        variant === "outline" && "text-foreground border-border",
        // design.md explicit badges
        variant === "orange" && "bg-orange-500/10 text-orange-600 border-orange-500/20",
        variant === "emerald" && "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
