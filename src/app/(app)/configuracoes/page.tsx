import { redirect } from "next/navigation";
import { User, Mail, ShieldCheck, LogOut } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { signOutAction } from "@/app/(auth)/actions";
import { Badge } from "@/components/ui/badge";

export default async function ConfiguracoesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h2>
        <p className="mt-1 text-sm text-slate-500">Sua conta e preferências.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-500">Perfil</h3>
          <div className="space-y-4">
            <Field icon={User} label="Nome" value={user.fullName ?? "—"} />
            <Field icon={Mail} label="E-mail" value={user.email ?? "—"} />
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                Nível de acesso
              </span>
              <Badge variant={user.isAdmin ? "orange" : "secondary"}>
                {user.isAdmin ? "Administrador" : "Comprador"}
              </Badge>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Sessão</h3>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-5 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10 active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-slate-600">
        <Icon className="h-4 w-4 text-slate-400" />
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}
