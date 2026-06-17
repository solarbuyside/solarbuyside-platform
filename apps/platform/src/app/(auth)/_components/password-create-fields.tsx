"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PasswordField } from "./auth-fields";
import { passwordRules } from "@/lib/auth/password-rules";

type PasswordCreateFieldsProps = {
  passwordLabel: string;
  submitLabel: string;
  pendingLabel: string;
};

function SubmitGate({
  disabled,
  pendingLabel,
  children,
}: {
  disabled: boolean;
  pendingLabel: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground outline-none transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/95 hover:shadow-[0_4px_15px_rgba(249,115,22,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

function RuleItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
          met
            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
            : "border-slate-300 bg-slate-50 text-transparent",
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span
        className={cn(
          "text-xs transition-colors",
          met ? "text-emerald-600" : "text-slate-500",
        )}
      >
        {label}
      </span>
    </li>
  );
}

export function PasswordCreateFields({
  passwordLabel,
  submitLabel,
  pendingLabel,
}: PasswordCreateFieldsProps) {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  const allRulesMet = passwordRules.every((r) => r.test(password));
  const matches = confirm.length > 0 && confirm === password;
  const confirmMismatch = confirm.length > 0 && confirm !== password;
  const valid = allRulesMet && matches;

  return (
    <div className="grid gap-4">
      <PasswordField
        label={passwordLabel}
        name="password"
        autoComplete="new-password"
        placeholder="Crie uma senha forte"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <ul className="grid gap-1.5 rounded-lg bg-slate-50 px-3.5 py-3">
        {passwordRules.map((rule) => (
          <RuleItem key={rule.id} met={rule.test(password)} label={rule.label} />
        ))}
        <RuleItem met={matches} label="As senhas coincidem" />
      </ul>

      <PasswordField
        label="Confirmar senha"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Repita a senha"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        className={cn(confirmMismatch && "border-red-300 focus:border-red-400 focus:ring-red-100")}
      />

      <SubmitGate disabled={!valid} pendingLabel={pendingLabel}>
        {submitLabel}
      </SubmitGate>
    </div>
  );
}
