import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, MousePointerClick, Users, Percent, Eye } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getLandingFunnel } from "@/lib/landing/funnel";

export const dynamic = "force-dynamic";

const PERIODOS = [7, 30, 90] as const;

export default async function FunilLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) notFound();

  const { dias: diasParam } = await searchParams;
  const dias = PERIODOS.includes(Number(diasParam) as (typeof PERIODOS)[number])
    ? Number(diasParam)
    : 30;
  const f = await getLandingFunnel(dias);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-6">
        <Link
          href="/admin"
          className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Painel
        </Link>
        <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
          <BarChart3 className="h-7 w-7 text-primary" />
          Funil da Landing Page
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Quem chega, até onde rola e quem clica em comprar — só a LP oficial (a{" "}
          <code className="rounded bg-slate-100 px-1">/1</code> fica de fora). Os eventos passaram a
          ser gravados aqui em 28/07/2026; o histórico anterior está no backend antigo (Render).
        </p>
        <div className="mt-4 flex gap-2">
          {PERIODOS.map((p) => (
            <Link
              key={p}
              href={`/admin/landing/funil?dias=${p}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                p === dias
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary/40"
              }`}
            >
              {p} dias
            </Link>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi icon={Users} label="Sessões" value={String(f.sessoes)} />
        <Kpi icon={Eye} label="Pageviews" value={String(f.pageViews)} />
        <Kpi icon={MousePointerClick} label="Cliques em comprar" value={String(f.buyClicks)} />
        <Kpi
          icon={Percent}
          label="Sessões que clicaram"
          value={`${f.conversaoPct}%`}
          sub={`${f.sessoesComClique} de ${f.sessoes}`}
        />
      </div>

      {/* FUNIL POR SEÇÃO */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Quantas sessões chegam a cada seção
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          % sobre quem viu o Hero. Degrau grande entre seções vizinhas = ponto de abandono.
        </p>
        {f.sessoes === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            Sem eventos no período. A tabela começou a receber em 28/07/2026 — volte depois de
            algum tráfego real.
          </p>
        ) : (
          <div className="mt-5 space-y-2">
            {f.funil.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-36 shrink-0 truncate text-xs font-semibold text-slate-600">
                  {s.label}
                </span>
                <div className="h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
                  <div
                    className="flex h-full items-center rounded-md bg-primary/80 pl-2 text-[11px] font-bold text-white"
                    style={{ width: `${Math.max(s.pctDoTopo, s.sessoes > 0 ? 4 : 0)}%` }}
                  >
                    {s.sessoes > 0 ? `${s.pctDoTopo}%` : ""}
                  </div>
                </div>
                <span className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-500">
                  {s.sessoes}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* POR DIA */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Por dia</h3>
        {f.porDia.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Sem eventos no período.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-2">Dia</th>
                <th className="pb-2 text-right">Sessões</th>
                <th className="pb-2 text-right">Cliques em comprar</th>
              </tr>
            </thead>
            <tbody>
              {f.porDia.map((d) => (
                <tr key={d.dia} className="border-t border-slate-100">
                  <td className="py-2 font-medium text-slate-700">
                    {d.dia.split("-").reverse().join("/")}
                  </td>
                  <td className="py-2 text-right tabular-nums text-slate-600">{d.sessoes}</td>
                  <td className="py-2 text-right tabular-nums text-slate-600">{d.buyClicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {f.truncado ? (
        <p className="text-xs text-amber-600">
          Aviso: o período tem mais eventos que o teto de leitura ({f.totalEventos} lidos) — os
          números acima são parciais. Reduza o período.
        </p>
      ) : null}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <p className="mt-1.5 text-2xl font-extrabold text-slate-900">{value}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p> : null}
    </div>
  );
}
