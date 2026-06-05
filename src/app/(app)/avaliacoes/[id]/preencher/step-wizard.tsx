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

import { Select } from "@/components/ui/select";
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
import { REPUTATION_OPTIONS } from "@/domain/comparisons/reputation";
import { cn } from "@/lib/utils";
import {
  saveCompanyEvaluationAction,
  saveFinancialEvaluationAction,
  saveTechnicalEvaluationAction,
} from "./actions";
import { ShareButton } from "./share-button";
import { SaveToLibraryButton } from "./save-to-library-button";

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
    subtitle: "Economia, investimento, prazo de retorno e inflação como comparativo.",
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
  const rootRef = React.useRef<HTMLDivElement>(null);

  // Ao trocar de seção, rola para o topo (o conteúdo rola dentro do <main>).
  const didMount = React.useRef(false);
  React.useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    let el: HTMLElement | null = rootRef.current?.parentElement ?? null;
    while (el) {
      const oy = window.getComputedStyle(el).overflowY;
      if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) {
        el.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      el = el.parentElement;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sectionIndex]);

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

  return (
    <div ref={rootRef} className="animate-in fade-in duration-300">
      {/* Two columns: WHO (supplier context) on the left, WHAT (interview) on the right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* LEFT — supplier context panel */}
        {activeCompetitor && (
          <SupplierPanel
            competitors={comparison.competitors}
            activeId={activeCompetitor.id}
            onSelect={setActiveCompetitorId}
          />
        )}

        {/* RIGHT — interview */}
        <div className="space-y-5">
          {/* Section header: title + "step X of 3" + save + share */}
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
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap">
              <span className="shrink-0 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                Etapa {sectionIndex + 1} de {SECTIONS.length}
              </span>
              <SaveIndicator state={saveState} />
              {activeCompetitor && (
                <SaveToLibraryButton
                  key={`lib-${activeCompetitor.id}`}
                  companyName={activeCompetitor.companyName}
                  sellerName={activeCompetitor.sellerName ?? null}
                  company={activeCompetitor.company}
                  technical={activeCompetitor.technical}
                />
              )}
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
              {/* key forces uncontrolled inputs to reset when switching supplier/section */}
              <InterviewForm
                key={`${activeCompetitor.id}-${section.id}`}
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
            Próxima Seção: Pontuação Empresa
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            onClick={() => setSectionIndex((i) => Math.min(SECTIONS.length - 1, i + 1))}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/95 hover:shadow-[0_4px_15px_rgba(249,115,22,0.25)] active:scale-[0.98]"
          >
            Próxima Seção: {SECTIONS[sectionIndex + 1].title}
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
  onSelect,
}: {
  competitors: CompetitorProposal[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Avaliando agora · clique para trocar
          </p>
        </div>
        <div className="max-h-52 overflow-y-auto p-2 lg:max-h-none">
          {competitors.map((c, i) => {
            const isActive = c.id === activeId;
            const ratio = competitorProgress(c);
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors",
                  isActive ? "bg-slate-100" : "hover:bg-slate-50",
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r bg-primary" />
                )}
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    isActive ? "bg-primary text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-sm font-bold",
                      isActive ? "text-slate-900" : "text-slate-700",
                    )}
                  >
                    {c.companyName}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5">
                    <span className="block h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <span
                        className={cn(
                          "block h-full rounded-full transition-all",
                          ratio >= 1 ? "bg-emerald-500" : "bg-primary/60",
                        )}
                        style={{ width: `${Math.round(ratio * 100)}%` }}
                      />
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {Math.round(ratio * 100)}%
                    </span>
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
    { value: "gt_500", label: "Mais de 500" },
    { value: "gt_1000", label: "Mais de 1.000" },
    { value: "unknown", label: "Não sei" },
  ],
  "company.ownInstallationTeam": [
    { value: "", label: "—" },
    { value: "own", label: "Equipe própria" },
    { value: "outsourced", label: "Equipe terceirizada" },
    { value: "unknown", label: "Não sei" },
  ],
  "financial.viabilityConfidence": [
    { value: "", label: "—" },
    { value: "high", label: "Alta" },
    { value: "medium", label: "Média" },
    { value: "low", label: "Baixa" },
    { value: "unknown", label: "Não sei" },
  ],
  // Reputação (Reclame Aqui): categorias qualitativas (slide 12).
  "technical.distributorScore": [{ value: "", label: "—" }, ...REPUTATION_OPTIONS],
  "technical.moduleMakerScore": [{ value: "", label: "—" }, ...REPUTATION_OPTIONS],
  "technical.inverterMakerScore": [{ value: "", label: "—" }, ...REPUTATION_OPTIONS],
};

// Campos que usam escala discreta de 1 a 10 (dropdown), conforme slide 8.
const SCALE_1_10_FIELDS = new Set(["company.sellerTrustScore"]);
const SCALE_1_10_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "—" },
  ...Array.from({ length: 10 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  })),
];

// Campos de NOME do Reclame Aqui (slide 12): input de texto + botão "Buscar".
const RECLAME_AQUI_NAME_FIELDS = new Set([
  "technical.distributorName",
  "technical.moduleMakerName",
  "technical.inverterMakerName",
]);

// Placeholder específico de cada campo de nome do Reclame Aqui.
const RECLAME_AQUI_NAME_PLACEHOLDER: Record<string, string> = {
  "technical.distributorName": "Marca comercial completa da distribuidora",
  "technical.moduleMakerName": "Marca comercial completa da fabricante de módulo",
  "technical.inverterMakerName": "Marca comercial completa do fabricante de inversor",
};

// Campos de NOTA do Reclame Aqui: a busca usa o nome do campo irmão.
const RECLAME_AQUI_SCORE_TO_NAME: Record<string, string> = {
  "technical.distributorScore": "distributorName",
  "technical.moduleMakerScore": "moduleMakerName",
  "technical.inverterMakerScore": "inverterMakerName",
};

// Todos os campos do Reclame Aqui ocupam a linha inteira no grid.
const RECLAME_AQUI_FIELDS = new Set([
  ...RECLAME_AQUI_NAME_FIELDS,
  ...Object.keys(RECLAME_AQUI_SCORE_TO_NAME),
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
            {sectionFields.map((field) => {
              // Sobrecarga do inversor: campo calculado automaticamente (slide 11).
              // Armazena a razão (kWp / kW) e exibe a sobrecarga em % = (razão - 1) * 100.
              if (field.key === "technical.inverterOversizingRatio") {
                const systemKwp = Number(getValue("systemPowerKwp"));
                const inverterKw = Number(getValue("inverterPowerKw"));
                return (
                  <OverloadField
                    key={field.key}
                    field={field}
                    systemKwp={Number.isFinite(systemKwp) ? systemKwp : null}
                    inverterKw={Number.isFinite(inverterKw) ? inverterKw : null}
                    storedRatio={getValue(fieldProp(field.key))}
                    onCommit={(value) => onChange(fieldProp(field.key), value)}
                  />
                );
              }
              // ROI: calculado automaticamente = economia acumulada 25 anos / valor de venda.
              if (field.key === "financial.roiMultiplier") {
                const savings = Number(getValue("accumulatedSavings25Years"));
                const investment = Number(getValue("totalInvestment"));
                return (
                  <RoiField
                    key={field.key}
                    field={field}
                    savings={Number.isFinite(savings) ? savings : null}
                    investment={Number.isFinite(investment) ? investment : null}
                    storedRoi={getValue(fieldProp(field.key))}
                    onCommit={(value) => onChange(fieldProp(field.key), value)}
                  />
                );
              }
              // Reclame Aqui: cada campo ocupa a linha inteira (slide 12).
              const fullWidth = RECLAME_AQUI_FIELDS.has(field.key);
              return (
                <div key={field.key} className={fullWidth ? "md:col-span-2" : undefined}>
                  <FieldRow
                    field={field}
                    competitorName={competitor.companyName}
                    value={getValue(fieldProp(field.key))}
                    onCommit={(value) => onChange(fieldProp(field.key), value)}
                  />
                </div>
              );
            })}
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
  const [localError, setLocalError] = React.useState<string | null>(null);
  const inputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/15";

  let control: React.ReactNode;

  if (field.key === "company.reclameAquiScore") {
    // Indicador de reputação do Reclame Aqui (categoria) + atalho de busca.
    control = (
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            value={(value as string) ?? ""}
            options={[{ value: "", label: "—" }, ...REPUTATION_OPTIONS]}
            onValueChange={(v) => onCommit(v === "" ? null : v)}
            ariaLabel={field.label}
          />
        </div>
        <a
          href={`https://www.reclameaqui.com.br/busca/?q=${encodeURIComponent(competitorName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-all hover:border-primary/50 hover:text-primary"
          title="Buscar no Reclame Aqui"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Buscar
        </a>
      </div>
    );
  } else if (field.kind === "tri_state") {
    control = (
      <Select
        value={(value as string) ?? ""}
        options={TRI_STATE_OPTIONS}
        onValueChange={(v) => onCommit(v === "" ? null : v)}
        ariaLabel={field.label}
      />
    );
  } else if (field.kind === "choice") {
    const options = CHOICE_OPTIONS[field.key] ?? TRI_STATE_OPTIONS;
    control = (
      <Select
        value={(value as string) ?? ""}
        options={options}
        onValueChange={(v) => onCommit(v === "" ? null : v)}
        ariaLabel={field.label}
      />
    );
  } else if (field.kind === "score" && SCALE_1_10_FIELDS.has(field.key)) {
    control = (
      <Select
        value={value == null ? "" : String(value)}
        options={SCALE_1_10_OPTIONS}
        onValueChange={(v) => onCommit(v === "" ? null : Number(v))}
        ariaLabel={field.label}
      />
    );
  } else if (field.kind === "text") {
    const isReclameAquiName = RECLAME_AQUI_NAME_FIELDS.has(field.key);
    control = (
      <div className="flex gap-2">
        <input
          type="text"
          defaultValue={(value as string) ?? ""}
          onBlur={(e) => onCommit(e.target.value.trim() === "" ? null : e.target.value.trim())}
          className={inputClass}
          placeholder={isReclameAquiName ? RECLAME_AQUI_NAME_PLACEHOLDER[field.key] ?? "" : ""}
        />
        {isReclameAquiName && (
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
            Buscar no Reclame Aqui
          </a>
        )}
      </div>
    );
  } else {
    const prefix = field.kind === "currency" ? "R$" : null;
    const suffix = field.kind === "percentage" ? "%" : null;
    control = (
      <NumberInput
        field={field}
        value={value}
        prefix={prefix}
        suffix={suffix}
        placeholder={FIELD_PLACEHOLDER[field.key]}
        inputClass={inputClass}
        onCommit={onCommit}
        onError={setLocalError}
      />
    );
  }

  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-slate-700">{field.label}</span>
      {control}
      {localError && <span className="text-[11px] font-medium text-destructive">{localError}</span>}
    </label>
  );
}

/**
 * Campo de sobrecarga do inversor calculado automaticamente (slide 11).
 * - Razão = Potência do sistema (kWp) / Potência do inversor (kW).
 * - Armazena a razão (ex.: 1,28) para a pontuação automática.
 * - Exibe a sobrecarga em % = (razão - 1) * 100 (ex.: 1,28 → 28%).
 */
function OverloadField({
  field,
  systemKwp,
  inverterKw,
  storedRatio,
  onCommit,
}: {
  field: EvaluationFieldDefinition;
  systemKwp: number | null;
  inverterKw: number | null;
  storedRatio: unknown;
  onCommit: (value: unknown) => void;
}) {
  const ratio =
    systemKwp != null && inverterKw != null && inverterKw > 0
      ? systemKwp / inverterKw
      : null;

  // Mantém o valor armazenado (razão) em sincronia com o cálculo.
  React.useEffect(() => {
    const current = typeof storedRatio === "number" ? storedRatio : null;
    const next = ratio != null ? Math.round(ratio * 1000) / 1000 : null;
    if (current !== next) {
      onCommit(next);
    }
    // onCommit é estável o suficiente para o ciclo do formulário.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratio, storedRatio]);

  const overloadPct = ratio != null ? Math.round((ratio - 1) * 100) : null;

  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-slate-700">{field.label}</span>
      <div className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 shadow-sm">
        <span className={overloadPct == null ? "text-slate-400" : "font-semibold"}>
          {overloadPct == null ? "—" : `${overloadPct}%`}
        </span>
        <span className="text-[11px] text-slate-400">
          {ratio == null
            ? "Preencha potência do sistema e do inversor"
            : `${systemKwp} / ${inverterKw} = ${(Math.round(ratio * 100) / 100)
                .toString()
                .replace(".", ",")}`}
        </span>
      </div>
    </label>
  );
}

/**
 * ROI (multiplicação por X vezes) calculado automaticamente.
 * Fórmula: economia acumulada em 25 anos / valor de venda do sistema.
 * Ex.: 369.162,43 / 17.690 = 20,86 (vezes).
 */
function RoiField({
  field,
  savings,
  investment,
  storedRoi,
  onCommit,
}: {
  field: EvaluationFieldDefinition;
  savings: number | null;
  investment: number | null;
  storedRoi: unknown;
  onCommit: (value: unknown) => void;
}) {
  const roi =
    savings != null && investment != null && investment > 0 ? savings / investment : null;

  // Mantém o valor armazenado em sincronia com o cálculo.
  React.useEffect(() => {
    const current = typeof storedRoi === "number" ? storedRoi : null;
    const next = roi != null ? Math.round(roi * 100) / 100 : null;
    if (current !== next) {
      onCommit(next);
    }
    // onCommit é estável o suficiente para o ciclo do formulário.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roi, storedRoi]);

  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-slate-700">{field.label}</span>
      <div className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 shadow-sm">
        <span className={roi == null ? "text-slate-400" : "font-semibold"}>
          {roi == null ? "—" : `${fmt(Math.round(roi * 100) / 100)}x`}
        </span>
        <span className="text-[11px] text-slate-400">
          {roi == null
            ? "Preencha economia acumulada (25 anos) e valor de venda"
            : `${fmt(savings as number)} / ${fmt(investment as number)}`}
        </span>
      </div>
    </label>
  );
}

// Placeholder de exemplo por campo numérico.
const FIELD_PLACEHOLDER: Record<string, string> = {
  "technical.annualConsumptionKwh": "ex: 750 kWh",
};

const currentYear = new Date().getFullYear();
// Apenas estes campos são ANO DE CALENDÁRIO (validação de ano se aplica).
// Os demais campos com "year" na key são durações (garantias em anos) ou
// valores monetários (economias) — não podem ter a regra de "ano válido".
const CALENDAR_YEAR_FIELDS = new Set([
  "company.solarSinceYear",
  "company.companyFoundedYear",
  "company.engineerGraduationYear",
]);

function NumberInput({
  field,
  value,
  prefix,
  suffix,
  placeholder,
  inputClass,
  onCommit,
  onError,
}: {
  field: EvaluationFieldDefinition;
  value: unknown;
  prefix: string | null;
  suffix: string | null;
  placeholder?: string;
  inputClass: string;
  onCommit: (value: unknown) => void;
  onError: (msg: string | null) => void;
}) {
  const isYear = CALENDAR_YEAR_FIELDS.has(field.key);
  const [invalid, setInvalid] = React.useState(false);

  function validate(num: number): string | null {
    if (isYear) {
      if (num > currentYear) return `O ano não pode ser maior que ${currentYear}.`;
      if (num < 1900) return "Informe um ano válido (a partir de 1900).";
    } else if (num < 0) {
      return "O valor não pode ser negativo.";
    }
    return null;
  }

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">{prefix}</span>
      )}
      <input
        type="number"
        inputMode={isYear ? "numeric" : "decimal"}
        step={isYear ? 1 : "any"}
        max={isYear ? currentYear : undefined}
        min={isYear ? 1900 : 0}
        placeholder={placeholder}
        defaultValue={typeof value === "number" ? String(value) : ""}
        onChange={() => {
          if (invalid) {
            setInvalid(false);
            onError(null);
          }
        }}
        onBlur={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            setInvalid(false);
            onError(null);
            return onCommit(null);
          }
          const num = Number(raw);
          if (Number.isNaN(num)) return onCommit(null);
          const msg = validate(num);
          if (msg) {
            setInvalid(true);
            onError(msg);
            return; // do not persist invalid values
          }
          setInvalid(false);
          onError(null);
          onCommit(num);
        }}
        className={cn(
          inputClass,
          prefix && "pl-9",
          suffix && "pr-9",
          invalid && "border-destructive focus:border-destructive focus:ring-destructive/15",
        )}
      />
      {suffix && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">{suffix}</span>
      )}
    </div>
  );
}
