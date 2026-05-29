import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";

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
      </div>

      <AdminDashboard overview={overview} />
    </div>
  );
}
