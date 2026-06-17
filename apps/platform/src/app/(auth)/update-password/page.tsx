import { updatePasswordAction } from "../actions";
import { AuthShell, AuthAlert } from "../_components/auth-shell";
import { PasswordField } from "../_components/auth-fields";
import { SubmitButton } from "../_components/submit-button";
import { needsPasswordSetup } from "@/lib/auth/current-user";

type UpdatePasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function UpdatePasswordPage({ searchParams }: UpdatePasswordPageProps) {
  const params = await searchParams;
  // 1º acesso (conta criada pela compra, ainda sem senha própria) vs redefinição.
  const firstAccess = await needsPasswordSetup();

  return (
    <AuthShell>
      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {firstAccess ? "Crie sua senha de acesso" : "Defina sua nova senha"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {firstAccess
            ? "Bem-vindo! Crie uma senha para ativar seu acesso à plataforma."
            : "Crie uma senha nova para continuar usando a plataforma."}
        </p>
      </div>

      <AuthAlert error={params.error} />

      <form action={updatePasswordAction} className="grid gap-4">
        <PasswordField
          label={firstAccess ? "Senha" : "Nova senha"}
          name="password"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          minLength={8}
          required
        />
        <PasswordField
          label="Confirmar senha"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repita a senha"
          minLength={8}
          required
        />
        <SubmitButton pendingLabel={firstAccess ? "Criando…" : "Atualizando…"}>
          {firstAccess ? "Criar senha e acessar" : "Atualizar senha"}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
