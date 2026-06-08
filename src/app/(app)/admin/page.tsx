import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, FileText, Users, BarChart3 } from "lucide-react";

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
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href="/admin/landing"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-all hover:border-primary/40 hover:text-primary active:scale-[0.98]"
          >
            <FileText className="h-4 w-4" />
            Conteúdo da Landing
          </Link>
          <Link
            href="/admin/leads"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-all hover:border-primary/40 hover:text-primary active:scale-[0.98]"
          >
            <Users className="h-4 w-4" />
            Leads
          </Link>
          <a
            href="https://vercel.com/francis-solarbuyside/solarbuyside-landing/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-all hover:border-primary/40 hover:text-primary active:scale-[0.98]"
          >
            <BarChart3 className="h-4 w-4" />
            Métricas da LP (Vercel)
          </a>
        </div>
      </div>

      <AdminDashboard overview={overview} />
    </div>
  );
}
