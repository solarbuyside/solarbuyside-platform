import Link from "next/link";

import { signUpAction } from "../actions";
import { AuthShell, AuthAlert } from "../_components/auth-shell";
import { TextField, PasswordField } from "../_components/auth-fields";
import { SubmitButton } from "../_components/submit-button";

type CadastroPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function CadastroPage({ searchParams }: CadastroPageProps) {
  const params = await searchParams;

  return (
    <AuthShell>
      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Crie sua conta</h2>
        <p className="mt-1 text-sm text-slate-500">Comece a comparar propostas em minutos.</p>
      </div>

      <AuthAlert error={params.error} message={params.message} />

      <form action={signUpAction} className="grid gap-4">
        <TextField
          label="Nome"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Seu nome completo"
        />
        <TextField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          required
        />
        <PasswordField
          label="Senha"
          name="password"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          minLength={8}
          required
        />

        <SubmitButton pendingLabel="Criando conta…">Criar conta</SubmitButton>
      </form>

      <div className="mt-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">ou</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
