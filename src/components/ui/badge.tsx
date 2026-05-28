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
        variant === "default" && "border-transparent bg-primary/20 text-primary-foreground border-primary/30",
        variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground",
        variant === "success" && "border-transparent bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        variant === "warning" && "border-transparent bg-amber-500/10 text-amber-400 border-amber-500/20",
        variant === "destructive" && "border-transparent bg-destructive/10 text-destructive-foreground border-destructive/20",
        variant === "outline" && "text-foreground border-border",
        // design.md explicit badges
        variant === "orange" && "border-transparent bg-orange-500/10 text-orange-400 border-orange-500/20",
        variant === "emerald" && "border-transparent bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
