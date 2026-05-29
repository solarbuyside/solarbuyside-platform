"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Zap,
  Wallet,
  Check,
  Loader2,
  CircleAlert,
  Info,
  ExternalLink,
  Users,
} from "lucide-react";

import {
  companyFormFields,
  technicalFormFields,
  financialFormFields,
  type EvaluationFieldDefinition,
} from "@/domain/comparisons/workflow";
import type {
  CompanyEvaluation,
  ComparisonInput,
  CompetitorProposal,
  FinancialEvaluation,
  TechnicalEvaluation,
} from "@/domain/comparisons/types";
import { cn } from "@/lib/utils";
import {
  saveCompanyEvaluationAction,
  saveFinancialEvaluationAction,
  saveTechnicalEvaluationAction,
} from "./actions";
import { ShareButton } from "./share-button";

type SectionId = "company" | "technical" | "financial";

const SECTIONS: Array<{
  id: SectionId;
  short: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "company",
    short: "Empresa",
    title: "A empresa de solar",
    subtitle: "Converse com o vendedor e anote sobre a empresa, garantias e assistência.",
    icon: Building2,
  },
  {
    id: "technical",
    short: "Técnico",
    title: "Proposta técnica",
    subtitle: "Anote os dados do sistema, módulos, inversor e geração.",
    icon: Zap,
  },
  {
    id: "financial",
    short: "Financeiro",
    title: "Viabilidade financeira",
    subtitle: "Investimento, pagamentos e retorno — usados como comparativo, não na nota.",
    icon: Wallet,
  },
];

type SaveState = "idle" | "saving" | "saved" | "error";

function fieldProp(key: string) {
  return key.split(".")[1] ?? key;
}

const SECTION_FIELDS = {
  company: companyFormFields,
  technical: technicalFormFields,
  financial: financialFormFields,
} as const;

/** How many fields in a section are filled for a given competitor (0..total). */
function sectionProgress(competitor: CompetitorProposal, sectionId: SectionId) {
  const fields = SECTION_FIELDS[sectionId];
  const source =
    sectionId === "company"
      ? competitor.company
      : sectionId === "technical"
        ? competitor.technical
        : competitor.financial;
  const record = source as Record<string, unknown>;
  let filled = 0;
  for (const field of fields) {
    const v = record[fieldProp(field.key)];
    if (v !== null && v !== undefined && v !== "") filled += 1;
  }
  return { filled, total: fields.length };
}

/** Overall fill ratio across the three sections for one competitor (0..1). */
function competitorProgress(competitor: CompetitorProposal) {
  let filled = 0;
  let total = 0;
  for (const id of ["company", "technical", "financial"] as SectionId[]) {
    const p = sectionProgress(competitor, id);
    filled += p.filled;
    total += p.total;
  }
  return total === 0 ? 0 : filled / total;
}

export function StepWizard({ comparison: initial }: { comparison: ComparisonInput }) {
  const [comparison, setComparison] = React.useState<ComparisonInput>(initial);
  const [sectionIndex, setSectionIndex] = React.useState(0);
  const [activeCompetitorId, setActiveCompetitorId] = React.useState(
    initial.competitors[0]?.id ?? "",
  );
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const section = SECTIONS[sectionIndex];
  const activeCompetitor =
    comparison.competitors.find((c) => c.id === activeCompetitorId) ?? comparison.competitors[0];

  const runSave = React.useCallback(async (fn: () => Promise<void>) => {
    setSaveState("saving");
    setErrorMsg(null);
    try {
      await fn();
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1500);
    } catch (err) {
      setSaveState("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }, []);

  function patchCompetitor(competitorId: string, patch: Partial<CompetitorProposal>) {
    setComparison((prev) => ({
      ...prev,
      competitors: prev.competitors.map((c) =>
        c.id === competitorId ? { ...c, ...patch } : c,
      ),
    }));
  }

  function handleCompanyChange(field: keyof CompanyEvaluation, value: unknown) {
    if (!activeCompetitor) return;
    const next = { ...activeCompetitor.company, [field]: value } as CompanyEvaluation;
    patchCompetitor(activeCompetitor.id, { company: next });
    void runSave(() => saveCompanyEvaluationAction(comparison.id, activeCompetitor.id, next));
  }

  function handleTechnicalChange(field: keyof TechnicalEvaluation, value: unknown) {
    if (!activeCompetitor) return;
    const next = { ...activeCompetitor.technical, [field]: value } as TechnicalEvaluation;
    patchCompetitor(activeCompetitor.id, { technical: next });
    void runSave(() => saveTechnicalEvaluationAction(comparison.id, activeCompetitor.id, next));
  }

  function handleFinancialChange(field: keyof FinancialEvaluation, value: unknown) {
    if (!activeCompetitor) return;
    const next = { ...activeCompetitor.financial, [field]: value } as FinancialEvaluation;
    patchCompetitor(activeCompetitor.id, { financial: next });
    void runSave(() => saveFinancialEvaluationAction(comparison.id, activeCompetitor.id, next));
  }

  const isLastSection = sectionIndex === SECTIONS.length - 1;
  const fields =
    section.id === "company"
      ? companyFormFields
      : section.id === "technical"
        ? technicalFormFields
        : financialFormFields;

  function getValue(prop: string) {
    if (!activeCompetitor) return null;
    const source =
      section.id === "company"
        ? activeCompetitor.company
        : section.id === "technical"
          ? activeCompetitor.technical
          : activeCompetitor.financial;
    return (source as Record<string, unknown>)[prop] ?? null;
  }

  function handleChange(prop: string, value: unknown) {
    if (section.id === "company") handleCompanyChange(prop as keyof CompanyEvaluation, value);
    else if (section.id === "technical") handleTechnicalChange(prop as keyof TechnicalEvaluation, value);
    else handleFinancialChange(prop as keyof FinancialEvaluation, value);
  }

  const totalCompetitors = comparison.competitors.length;
  const activeIndex = comparison.competitors.findIndex((c) => c.id === activeCompetitor?.id);

  return (
    <div className="animate-in fade-in duration-300">
      {/* Two columns: WHO (supplier context) on the left, WHAT (interview) on the right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* LEFT — supplier context panel */}
        {activeCompetitor && (
          <SupplierPanel
            competitors={comparison.competitors}
            activeId={activeCompetitor.id}
            activeIndex={activeIndex}
            total={totalCompetitors}
            onSelect={setActiveCompetitorId}
          />
        )}

        {/* RIGHT — interview */}
        <div className="space-y-5">
          {/* Section stepper (progress within the interview) */}
          {activeCompetitor && (
            <SectionStepper
              competitor={activeCompetitor}
              current={sectionIndex}
              onSelect={setSectionIndex}
            />
          )}

          {/* Section header + save + share */}
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <section.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{section.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SaveIndicator state={saveState} />
              {activeCompetitor && (
                <ShareButton
                  key={activeCompetitor.id}
                  comparisonId={comparison.id}
                  competitorId={activeCompetitor.id}
                  competitorName={activeCompetitor.companyName}
                />
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <CircleAlert className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Form */}
          {activeCompetitor && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <InterviewForm
                fields={fields}
                competitor={activeCompetitor}
                getValue={getValue}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Footer nav */}
          <div className="flex items-center justify-between">
        <button
          onClick={() => setSectionIndex((i) => Math.max(0, i - 1))}
          disabled={sectionIndex === 0}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Seção anterior
        </button>

        <Link
          href="/avaliacoes"
          className="text-xs font-semibold text-slate-400 transition-colors hover:text-slate-600"
        >
          Salvar e sair
        </Link>

        {isLastSection ? (
          <Link
            href={`/avaliacoes/${comparison.id}/comparativo`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/95 hover:shadow-[0_4px_15px_rgba(249,115,22,0.25)] active:scale-[0.98]"
          >
            Ver comparativo
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            onClick={() => setSectionIndex((i) => Math.min(SECTIONS.length - 1, i + 1))}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/95 hover:shadow-[0_4px_15px_rgba(249,115,22,0.25)] active:scale-[0.98]"
          >
            Próxima seção
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function SaveIndicator({ state }: { state: SaveState }) {
  const map = {
    idle: { icon: <Info className="h-3.5 w-3.5" />, text: "Salvamento automático", cls: "text-slate-400" },
    saving: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, text: "Salvando…", cls: "text-slate-500" },
    saved: { icon: <Check className="h-3.5 w-3.5" />, text: "Salvo", cls: "text-emerald-600" },
    error: { icon: <CircleAlert className="h-3.5 w-3.5" />, text: "Falha ao salvar", cls: "text-destructive" },
  }[state];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-xs font-medium", map.cls)}>
      {map.icon}
      {map.text}
    </span>
  );
}

/**
 * LEFT column: "who am I interviewing". The active supplier is the hero; the
 * others are a quiet switch list. Each shows a fill-progress ring so the buyer
 * sees at a glance how complete each interview is.
 */
function SupplierPanel({
  competitors,
  activeId,
  activeIndex,
  total,
  onSelect,
}: {
  competitors: CompetitorProposal[];
  activeId: string;
  activeIndex: number;
  total: number;
  onSelect: (id: string) => void;
}) {
  const active = competitors.find((c) => c.id === activeId);
  const activeRatio = active ? competitorProgress(active) : 0;

  return (
    <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
      {/* Hero: active supplier */}
      {active && (
        <div className="rounded-xl border border-primary/30 bg-primary/[0.04] p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
            Entrevistando · {activeIndex + 1} de {total}
          </span>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-white">
              {activeIndex + 1}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-slate-900">{active.companyName}</p>
              <p className="text-[11px] font-medium text-slate-500">
                {Math.round(activeRatio * 100)}% preenchido
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/15">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round(activeRatio * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Switch list */}
      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <p className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Users className="h-3.5 w-3.5" />
          Trocar de fornecedor
        </p>
        <div className="space-y-0.5">
          {competitors.map((c, i) => {
            const isActive = c.id === activeId;
            const ratio = competitorProgress(c);
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                  isActive ? "bg-primary/10" : "hover:bg-slate-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                    isActive ? "bg-primary text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-sm font-semibold",
                      isActive ? "text-primary" : "text-slate-700",
                    )}
                  >
                    {c.companyName}
                  </span>
                  <span className="mt-1 block h-1 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className={cn(
                        "block h-full rounded-full transition-all",
                        ratio >= 1 ? "bg-emerald-500" : "bg-primary/60",
                      )}
                      style={{ width: `${Math.round(ratio * 100)}%` }}
                    />
                  </span>
                </span>
                {ratio >= 1 && <Check className="h-4 w-4 shrink-0 text-emerald-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

/**
 * RIGHT column header: the three interview sections as a progress stepper
 * (Empresa → Técnico → Financeiro), with a filled-fields count per step.
 */
function SectionStepper({
  competitor,
  current,
  onSelect,
}: {
  competitor: CompetitorProposal;
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-stretch gap-2">
      {SECTIONS.map((s, i) => {
        const Icon = s.icon;
        const isActive = i === current;
        const { filled, total } = sectionProgress(competitor, s.id);
        const complete = filled === total && total > 0;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(i)}
            className={cn(
              "group flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
              isActive
                ? "border-primary bg-primary text-white shadow-[0_2px_12px_rgba(249,115,22,0.2)]"
                : "border-slate-200 bg-white hover:border-slate-300",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                isActive
                  ? "bg-white/20 text-white"
                  : complete
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-slate-100 text-slate-400",
              )}
            >
              {complete && !isActive ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <p className={cn("text-sm font-bold", isActive ? "text-white" : "text-slate-800")}>
                {s.short}
              </p>
              <p className={cn("text-[11px]", isActive ? "text-white/70" : "text-slate-400")}>
                {filled}/{total} campos
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// --- Interview form ---------------------------------------------------------

const TRI_STATE_OPTIONS = [
  { value: "", label: "—" },
  { value: "yes", label: "Sim" },
  { value: "no", label: "Não" },
  { value: "unknown", label: "Não sei" },
];

const CHOICE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  "company.installedSystemsRange": [
    { value: "", label: "—" },
    { value: "lt_10", label: "Menos de 10" },
    { value: "10_49", label: "10 a 49" },
    { value: "50_100", label: "50 a 100" },
    { value: "gt_100", label: "Mais de 100" },
    { value: "unknown", label: "Não sei" },
  ],
  "company.ownInstallationTeam": [
    { value: "", label: "—" },
    { value: "yes", label: "Equipe própria" },
    { value: "no", label: "Não" },
    { value: "outsourced_known", label: "Terceirizado conhecido" },
    { value: "unknown", label: "Não sei" },
  ],
  "financial.viabilityConfidence": [
    { value: "", label: "—" },
    { value: "high", label: "Alta" },
    { value: "medium", label: "Média" },
    { value: "low", label: "Baixa" },
    { value: "unknown", label: "Não sei" },
  ],
};

const RECLAME_AQUI_FIELDS = new Set([
  "technical.distributorReputation",
  "technical.moduleMakerReputation",
  "technical.inverterMakerReputation",
]);

export function InterviewForm({
  fields,
  competitor,
  getValue,
  onChange,
}: {
  fields: readonly EvaluationFieldDefinition[];
  competitor: CompetitorProposal;
  getValue: (prop: string) => unknown;
  onChange: (prop: string, value: unknown) => void;
}) {
  const sections = React.useMemo(() => {
    const map = new Map<string, EvaluationFieldDefinition[]>();
    for (const field of fields) {
      const list = map.get(field.section) ?? [];
      list.push(field);
      map.set(field.section, list);
    }
    return Array.from(map.entries());
  }, [fields]);

  return (
    <div className="space-y-6">
      {sections.map(([section, sectionFields], sectionIdx) => (
        <section
          key={section}
          className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-5 md:p-6"
        >
          <h4 className="mb-5 flex items-center gap-2.5 text-sm font-bold text-slate-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[11px] font-extrabold text-primary">
              {sectionIdx + 1}
            </span>
            {section}
          </h4>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            {sectionFields.map((field) => (
              <FieldRow
                key={field.key}
                field={field}
                competitorName={competitor.companyName}
                value={getValue(fieldProp(field.key))}
                onCommit={(value) => onChange(fieldProp(field.key), value)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function FieldRow({
  field,
  competitorName,
  value,
  onCommit,
}: {
  field: EvaluationFieldDefinition;
  competitorName: string;
  value: unknown;
  onCommit: (value: unknown) => void;
}) {
  const inputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/15";
  const selectClass = cn(
    inputClass,
    "cursor-pointer appearance-none bg-no-repeat pr-10",
    "[background-position:right_0.85rem_center] [background-size:1.1em]",
    "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22/%3E%3C/svg%3E')]",
  );

  let control: React.ReactNode;

  if (field.kind === "tri_state") {
    control = (
      <select
        value={(value as string) ?? ""}
        onChange={(e) => onCommit(e.target.value === "" ? null : e.target.value)}
        className={selectClass}
      >
        {TRI_STATE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (field.kind === "choice") {
    const options = CHOICE_OPTIONS[field.key] ?? TRI_STATE_OPTIONS;
    control = (
      <select
        value={(value as string) ?? ""}
        onChange={(e) => onCommit(e.target.value === "" ? null : e.target.value)}
        className={selectClass}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (field.kind === "text") {
    const isReclameAqui = RECLAME_AQUI_FIELDS.has(field.key);
    control = (
      <div className="flex gap-2">
        <input
          type="text"
          defaultValue={(value as string) ?? ""}
          onBlur={(e) => onCommit(e.target.value.trim() === "" ? null : e.target.value.trim())}
          className={inputClass}
          placeholder={isReclameAqui ? "Reputação / nota" : ""}
        />
        {isReclameAqui && (
          <a
            href={`https://www.reclameaqui.com.br/busca/?q=${encodeURIComponent(
              (value as string) || competitorName,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-all hover:border-primary/50 hover:text-primary"
            title="Buscar no Reclame Aqui"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Buscar
          </a>
        )}
      </div>
    );
  } else {
    const prefix = field.kind === "currency" ? "R$" : null;
    const suffix = field.kind === "percentage" ? "%" : null;
    control = (
      <div className="relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">{prefix}</span>
        )}
        <input
          type="number"
          inputMode="decimal"
          step="any"
          defaultValue={typeof value === "number" ? String(value) : ""}
          onBlur={(e) => {
            const raw = e.target.value;
            if (raw === "") return onCommit(null);
            const num = Number(raw);
            onCommit(Number.isNaN(num) ? null : num);
          }}
          className={cn(inputClass, prefix && "pl-9", suffix && "pr-9")}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">{suffix}</span>
        )}
      </div>
    );
  }

  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-slate-700">{field.label}</span>
      {control}
    </label>
  );
}
