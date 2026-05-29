import { notFound } from "next/navigation";
import { Users, FileSpreadsheet, CheckCircle2, Building2, ShieldCheck } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getAdminOverview } from "@/lib/admin/overview";
import { Badge } from "@/components/ui/badge";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const STATUS_LABEL: Record<string, { label: string; variant: "secondary" | "orange" | "emerald" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  ready_for_review: { label: "Em revisão", variant: "orange" },
  completed: { label: "Concluída", variant: "emerald" },
};

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
          Visão geral de usuários, avaliações e resultados da plataforma.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Usuários" value={overview.totals.users} />
        <StatCard icon={FileSpreadsheet} label="Avaliações" value={overview.totals.comparisons} />
        <StatCard icon={CheckCircle2} label="Concluídas" value={overview.totals.completed} />
        <StatCard icon={Building2} label="Fornecedores" value={overview.totals.competitors} />
      </div>

      {/* Users */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Usuários</h3>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="text-center">Avaliações</TableHead>
                <TableHead className="text-center">Concluídas</TableHead>
                <TableHead>Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.users.length === 0 ? (
                <TableRow>
                  <TableCell className="text-slate-400">Nenhum usuário ainda.</TableCell>
                </TableRow>
              ) : (
                overview.users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold text-slate-900">{u.fullName ?? "—"}</TableCell>
                    <TableCell className="text-slate-600">{u.email ?? "—"}</TableCell>
                    <TableCell className="text-center text-slate-700">{u.comparisonCount}</TableCell>
                    <TableCell className="text-center text-slate-700">{u.completedCount}</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

      {/* Comparisons */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Avaliações</h3>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Dono</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Fornecedores</TableHead>
                <TableHead className="text-center">Finalistas</TableHead>
                <TableHead>Atualizada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.comparisons.length === 0 ? (
                <TableRow>
                  <TableCell className="text-slate-400">Nenhuma avaliação ainda.</TableCell>
                </TableRow>
              ) : (
                overview.comparisons.map((c) => {
                  const status = STATUS_LABEL[c.status] ?? {
                    label: c.status,
                    variant: "secondary" as const,
                  };
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold text-slate-900">{c.title}</TableCell>
                      <TableCell className="text-slate-600">{c.ownerEmail ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="text-[10px]">
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-slate-700">{c.competitorCount}</TableCell>
                      <TableCell className="text-center text-slate-700">{c.finalistCount}</TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(c.updatedAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
