import { updatePasswordAction } from "../actions";
import { AuthShell, AuthAlert } from "../_components/auth-shell";
import { PasswordCreateFields } from "../_components/password-create-fields";
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
        <PasswordCreateFields
          passwordLabel={firstAccess ? "Senha" : "Nova senha"}
          submitLabel={firstAccess ? "Criar senha e acessar" : "Atualizar senha"}
          pendingLabel={firstAccess ? "Criando…" : "Atualizando…"}
        />
      </form>
    </AuthShell>
  );
}
