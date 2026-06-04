"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Users, FileSpreadsheet, CheckCircle2, Building2, History, BarChart3 } from "lucide-react";

import type { AdminOverview } from "@/lib/admin/overview";
import { cn, formatDateBR, formatDateTimeBR } from "@/lib/utils";
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

type Tab = "usuarios" | "avaliacoes" | "historico";

const STATUS_LABEL: Record<string, { label: string; variant: "secondary" | "orange" | "emerald" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  ready_for_review: { label: "Em revisão", variant: "orange" },
  completed: { label: "Concluída", variant: "emerald" },
};

const EVENT_LABEL: Record<string, string> = {
  "comparison.created": "Avaliação criada",
  "competitor.shared_response_submitted": "Fornecedor respondeu formulário",
};

export function AdminDashboard({ overview }: { overview: AdminOverview }) {
  const [tab, setTab] = React.useState<Tab>("usuarios");

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Usuários" value={overview.totals.users} accent />
        <StatCard icon={FileSpreadsheet} label="Avaliações" value={overview.totals.comparisons} />
        <StatCard icon={CheckCircle2} label="Concluídas" value={overview.totals.completed} />
        <StatCard icon={Building2} label="Fornecedores" value={overview.totals.competitors} />
      </div>

      {/* Usage chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Uso nos últimos 14 dias
          </h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={overview.usage} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="gComparisons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={28} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  boxShadow: "0 4px 20px rgba(2,7,25,0.08)",
                }}
                labelStyle={{ fontWeight: 700, color: "#0f172a" }}
              />
              <Area
                type="monotone"
                dataKey="comparisons"
                name="Avaliações"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#gComparisons)"
              />
              <Area
                type="monotone"
                dataKey="users"
                name="Novos usuários"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#gUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Avaliações
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Novos usuários
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1.5 border-b border-slate-200 pb-px">
          <TabButton active={tab === "usuarios"} onClick={() => setTab("usuarios")} icon={Users}>
            Usuários
          </TabButton>
          <TabButton active={tab === "avaliacoes"} onClick={() => setTab("avaliacoes")} icon={FileSpreadsheet}>
            Avaliações
          </TabButton>
          <TabButton active={tab === "historico"} onClick={() => setTab("historico")} icon={History}>
            Histórico
          </TabButton>
        </div>

        <div className="pt-5">
          {tab === "usuarios" && <UsersTable overview={overview} />}
          {tab === "avaliacoes" && <ComparisonsTable overview={overview} />}
          {tab === "historico" && <EventsTable overview={overview} />}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all",
        active
          ? "border-primary font-semibold text-primary"
          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800",
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-sm",
        accent ? "border-primary/30 bg-primary/[0.04]" : "border-slate-200 bg-white",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function UsersTable({ overview }: { overview: AdminOverview }) {
  return (
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
                  {formatDateBR(u.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ComparisonsTable({ overview }: { overview: AdminOverview }) {
  return (
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
              const status = STATUS_LABEL[c.status] ?? { label: c.status, variant: "secondary" as const };
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
                    {formatDateBR(c.updatedAt)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function EventsTable({ overview }: { overview: AdminOverview }) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Evento</TableHead>
            <TableHead>Avaliação</TableHead>
            <TableHead>Por</TableHead>
            <TableHead>Quando</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {overview.events.length === 0 ? (
            <TableRow>
              <TableCell className="text-slate-400">Nenhum evento registrado.</TableCell>
            </TableRow>
          ) : (
            overview.events.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-semibold text-slate-900">
                  {EVENT_LABEL[e.eventType] ?? e.eventType}
                </TableCell>
                <TableCell className="text-slate-600">{e.comparisonTitle ?? "—"}</TableCell>
                <TableCell className="text-slate-600">{e.ownerEmail ?? "—"}</TableCell>
                <TableCell className="text-xs text-slate-500">
                  {formatDateTimeBR(e.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
