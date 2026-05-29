import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { resetPasswordAction } from "../actions";
import { AuthShell, AuthAlert } from "../_components/auth-shell";
import { TextField } from "../_components/auth-fields";
import { SubmitButton } from "../_components/submit-button";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <AuthShell>
      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Recuperar senha</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enviaremos um link seguro para você criar uma nova senha.
        </p>
      </div>

      <AuthAlert error={params.error} message={params.message} />

      <form action={resetPasswordAction} className="grid gap-4">
        <TextField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          required
        />
        <SubmitButton pendingLabel="Enviando…">Enviar link de recuperação</SubmitButton>
      </form>

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao login
      </Link>
    </AuthShell>
  );
}
