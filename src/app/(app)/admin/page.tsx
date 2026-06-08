import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, FileText } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getAdminOverview } from "@/lib/admin/overview";
import { AdminDashboard } from "./admin-dashboard";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    notFound();
  }

  const overview = await getAdminOverview();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-6">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Super Admin
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Painel Administrativo</h2>
        <p className="mt-1 text-sm text-slate-500">
          KPIs, uso da plataforma e gestão de usuários, avaliações e atividade.
        </p>
        <Link
          href="/admin/landing"
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 text-sm font-bold text-primary transition-all hover:bg-primary/10 active:scale-[0.98]"
        >
          <FileText className="h-4 w-4" />
          Editar conteúdo da Landing
        </Link>
      </div>

      <AdminDashboard overview={overview} />
    </div>
  );
}
