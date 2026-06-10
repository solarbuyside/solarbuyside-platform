import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-in-out select-none active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Variants from design.md
          variant === "default" && [
            "bg-primary text-primary-foreground hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]",
            "hover:bg-primary/90 hover:-translate-y-[1px]"
          ],
          variant === "secondary" && [
            "bg-slate-100 text-slate-800 border border-slate-200 hover:border-primary/50 hover:bg-slate-200"
          ],
          variant === "ghost" && [
            "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          ],
          variant === "destructive" && [
            "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          ],
          variant === "outline" && [
            "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground"
          ],
          // Sizes
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-11 px-5 text-base",
          size === "lg" && "h-13 px-8 text-lg",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
