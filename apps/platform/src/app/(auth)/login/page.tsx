import Link from "next/link";

import { signInAction } from "../actions";
import { AuthShell, AuthAlert } from "../_components/auth-shell";
import { TextField, PasswordField } from "../_components/auth-fields";
import { SubmitButton } from "../_components/submit-button";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthShell>
      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bem-vindo de volta</h2>
        <p className="mt-1 text-sm text-slate-500">Acesse seu painel de comparações.</p>
      </div>

      <AuthAlert error={params.error} message={params.message} />

      <form action={signInAction} className="grid gap-4">
        <input type="hidden" name="next" value={params.next ?? "/dashboard"} />

        <TextField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          required
        />

        <div className="grid gap-1.5">
          <PasswordField
            label="Senha"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
          <Link
            href="/reset-password"
            className="justify-self-end text-xs font-semibold text-primary hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>

        <SubmitButton pendingLabel="Entrando…">Entrar</SubmitButton>
      </form>

      <div className="mt-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">ou</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        É seu primeiro acesso?{" "}
        <Link href="/primeiro-acesso" className="font-bold text-primary hover:underline">
          Criar senha de acesso
        </Link>
      </p>
    </AuthShell>
  );
}
