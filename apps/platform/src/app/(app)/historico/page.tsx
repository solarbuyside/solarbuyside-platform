import Link from "next/link";
import { Calendar, ExternalLink, FilePlus2, MessageSquareReply, Activity, History } from "lucide-react";

import { listActivityHistory, type ActivityItem } from "@/lib/comparisons/repository";
import { getCurrentUser } from "@/lib/auth/current-user";

type EventStyle = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  dot: string;
  chip: string;
  detail: (item: ActivityItem) => string;
};

const EVENTS: Record<string, EventStyle> = {
  "comparison.created": {
    label: "Avaliação criada",
    icon: FilePlus2,
    dot: "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    detail: (i) => {
      const n = Number(i.payload.competitorCount);
      const titulo = i.comparisonTitle ? ` “${i.comparisonTitle}”` : "";
      const forn = Number.isFinite(n) && n > 0 ? ` com ${n} fornecedor${n > 1 ? "es" : ""}` : "";
      return `Nova avaliação${titulo} criada${forn}.`;
    },
  },
  "competitor.shared_response_submitted": {
    label: "Fornecedor respondeu",
    icon: MessageSquareReply,
    dot: "bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
    chip: "border-blue-200 bg-blue-50 text-blue-700",
    detail: (i) =>
      `Um fornecedor respondeu o formulário compartilhado${i.comparisonTitle ? ` de “${i.comparisonTitle}”` : ""}.`,
  },
};

const FALLBACK: EventStyle = {
  label: "Atividade",
  icon: Activity,
  dot: "bg-slate-400 shadow-[0_0_0_4px_rgba(148,163,184,0.15)]",
  chip: "border-slate-200 bg-slate-50 text-slate-600",
  detail: (i) => (i.comparisonTitle ? `Atividade em “${i.comparisonTitle}”.` : "Atividade registrada."),
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(d);
  const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(d);
  return `${data} · ${hora}`;
}

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `há ${d} dia${d > 1 ? "s" : ""}`;
  const mo = Math.round(d / 30);
  return `há ${mo} ${mo > 1 ? "meses" : "mês"}`;
}

export default async function HistoricoPage() {
  const [items, user] = await Promise.all([listActivityHistory(), getCurrentUser()]);
  const executor = user?.fullName ?? user?.email ?? "Você";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 md:space-y-8">
      <div className="border-b border-slate-200 pb-5 md:pb-6">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Histórico de Atividades</h2>
        <p className="mt-1 text-sm text-slate-500">
          Registro completo de auditoria das suas decisões de compra e alterações de critérios.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <History className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Nenhuma atividade ainda</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Conforme você cria avaliações, importa planilhas e recebe respostas de fornecedores, tudo aparece aqui.
          </p>
          <Link
            href="/avaliacoes/nova"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-[0.98]"
          >
            Criar primeira avaliação
          </Link>
        </div>
      ) : (
        <div className="relative ml-3 space-y-7 border-l-2 border-slate-200/80 py-2 pl-7">
          {items.map((item) => {
            const cfg = EVENTS[item.eventType] ?? FALLBACK;
            const Icon = cfg.icon;
            return (
              <div key={item.id} className="relative">
                <span className={`absolute -left-[37px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#f8fafc] ${cfg.dot}`}>
                  <Icon className="h-2.5 w-2.5 text-white" />
                </span>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.chip}`}>
                      {cfg.label}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {fmtDate(item.createdAt)}
                    </span>
                    <span className="text-[11px] text-slate-300">·</span>
                    <span className="text-[11px] text-slate-400">{relative(item.createdAt)}</span>
                  </div>

                  <p className="mt-2.5 text-[15px] leading-relaxed text-slate-700">{cfg.detail(item)}</p>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                    <span>Executor: {executor}</span>
                    {item.comparisonTitle ? (
                      <Link
                        href={`/avaliacoes/${item.comparisonId}`}
                        className="inline-flex items-center gap-1 font-semibold text-slate-400 transition-colors hover:text-primary"
                      >
                        Ver avaliação <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
