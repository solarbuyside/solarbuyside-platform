"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const baseInput =
  "h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function TextField({ label, id, className, ...props }: FieldProps) {
  const fieldId = id ?? props.name;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={fieldId} className="text-xs font-bold uppercase tracking-wider text-slate-600">
        {label}
        {props.required && <span className="ml-1 text-primary">*</span>}
      </label>
      <input id={fieldId} className={cn(baseInput, className)} {...props} />
    </div>
  );
}

export function PasswordField({ label, id, className, ...props }: FieldProps) {
  const [visible, setVisible] = React.useState(false);
  const fieldId = id ?? props.name;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={fieldId} className="text-xs font-bold uppercase tracking-wider text-slate-600">
        {label}
        {props.required && <span className="ml-1 text-primary">*</span>}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          className={cn(baseInput, "pr-11", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition-colors hover:text-slate-700"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
