import {
  companyFormFields,
  technicalFormFields,
  financialFormFields,
  type EvaluationFieldDefinition,
} from "./workflow";
import {
  companyScoreDefinitions,
  technicalScoreDefinitions,
  financialScoreDefinitions,
} from "./score-definitions";
import { REPUTATION_LABEL } from "./reputation";
import type {
  CompanyEvaluation,
  TechnicalEvaluation,
  FinancialEvaluation,
  ScoreDefinition,
} from "./types";

/**
 * As tabelas comparativas (Avaliação Empresas / Tecnológica) replicam a
 * planilha: cada linha é uma PERGUNTA do formulário + a RESPOSTA do fornecedor
 * + a NOTA (0-10). Este módulo casa, por seção+ordem, os campos do formulário
 * (perguntas/respostas) com as definições de pontuação (notas), já que as duas
 * listas seguem a mesma sequência da planilha.
 */

export type ComparisonRow = {
  /** Chave da pergunta no formulário (ex: company.solarSinceYear). */
  fieldKey: string;
  /** Propriedade da resposta na avaliação (ex: solarSinceYear). */
  prop: string;
  label: string;
  section: string;
  kind: EvaluationFieldDefinition["kind"];
  /** Critério de pontuação correspondente (quando há nota para a linha). */
  scoreKey: string | null;
  rubric: string | null;
  defaultEnabled: boolean;
};

function fieldProp(key: string) {
  return key.split(".")[1] ?? key;
}

/**
 * Casa campos de formulário com definições de score na ordem em que aparecem.
 * Campos sem score correspondente (ex: contagem de módulos) ficam com
 * scoreKey null e não entram no cálculo — só aparecem como dado informativo.
 */
function buildRows(
  fields: readonly EvaluationFieldDefinition[],
  defs: readonly ScoreDefinition[],
): ComparisonRow[] {
  // Os score definitions têm `section` própria; casamos por proximidade de
  // ordem dentro da lista, consumindo um def por campo que tenha nota.
  const defQueue = [...defs];
  const rows: ComparisonRow[] = [];

  for (const field of fields) {
    // Heurística: o próximo def da fila corresponde ao campo atual, exceto
    // campos puramente informativos (sem rubrica) como contagens.
    const prop = fieldProp(field.key);
    const informationalOnly = INFORMATIONAL_PROPS.has(prop);
    const def = !informationalOnly ? defQueue[0] : undefined;

    if (def && !informationalOnly) {
      defQueue.shift();
      rows.push({
        fieldKey: field.key,
        prop,
        label: field.label,
        section: field.section,
        kind: field.kind,
        scoreKey: def.key,
        rubric: def.rubric ?? null,
        defaultEnabled: def.defaultEnabled,
      });
    } else {
      // Linha informativa: sem critério canônico, mas o comprador ainda pode
      // querer pontuar manualmente. Damos um scoreKey sintético (= fieldKey) e
      // deixamos DESLIGADO por padrão — assim a matemática do ranking não muda
      // até o usuário ligar a linha. O motor de pontuação soma os ad-hoc ligados.
      rows.push({
        fieldKey: field.key,
        prop,
        label: field.label,
        section: field.section,
        kind: field.kind,
        scoreKey: field.key,
        rubric: null,
        defaultEnabled: false,
      });
    }
  }

  return rows;
}

// Campos do formulário que NÃO têm linha de pontuação (apenas informativos).
// Os nomes do Reclame Aqui (slide 12) são informativos; a NOTA correspondente
// é que pontua, casando com os critérios reputation_* na sequência.
const INFORMATIONAL_PROPS = new Set<string>([
  "annualConsumptionKwh",
  "moduleCount",
  "inverterCount",
  "distributorName",
  "moduleMakerName",
  "inverterMakerName",
]);

export const companyComparisonRows = buildRows(companyFormFields, companyScoreDefinitions);
export const technicalComparisonRows = buildRows(technicalFormFields, technicalScoreDefinitions);

/** Linhas do comparativo financeiro (informativo, sem nota). */
export const financialComparisonRows = financialFormFields.map((field) => ({
  fieldKey: field.key,
  prop: fieldProp(field.key),
  label: field.label,
  section: field.section,
  kind: field.kind,
}));

// Slide 19: a Viabilidade passa a ser pontuada (1 a 10). Mapeamento explícito
// dos campos do formulário financeiro para os critérios de pontuação. Campos
// fora deste mapa são informativos (scoreKey null) e não entram na nota.
const FINANCIAL_PROP_TO_SCORE: Record<string, string> = {
  simplePaybackMonths: "financial.simple_payback",
  annualReturnPct: "financial.annual_return",
  roiMultiplier: "financial.roi",
  viabilityConfidence: "financial.viability_confidence",
};

export const financialScoreRows: ComparisonRow[] = financialFormFields.map((field) => {
  const prop = fieldProp(field.key);
  const realScoreKey = FINANCIAL_PROP_TO_SCORE[prop];
  const def = realScoreKey
    ? financialScoreDefinitions.find((d) => d.key === realScoreKey)
    : undefined;
  // Campos sem critério canônico viram pontuáveis manualmente (scoreKey
  // sintético = fieldKey), DESLIGADOS por padrão — não alteram o ranking até
  // o usuário ligar a linha.
  return {
    fieldKey: field.key,
    prop,
    label: field.label,
    section: field.section,
    kind: field.kind,
    scoreKey: def?.key ?? field.key,
    rubric: def?.rubric ?? null,
    defaultEnabled: def?.defaultEnabled ?? false,
  };
});

// --- Formatação das respostas para exibição na tabela ----------------------

const TRI_STATE_LABEL: Record<string, string> = { yes: "Sim", no: "Não", unknown: "Não sei" };
const CHOICE_LABEL: Record<string, string> = {
  lt_10: "< 10",
  "10_49": "10 a 49",
  "50_100": "50 a 100",
  gt_100: "+ de 100",
  gt_500: "+ de 500",
  gt_1000: "+ de 1.000",
  own: "Equipe própria",
  outsourced: "Equipe terceirizada",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
  // Categorias de reputação (Reclame Aqui).
  ...REPUTATION_LABEL,
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Formata a resposta do fornecedor para o texto exibido na célula. */
export function formatAnswer(
  value: unknown,
  kind: EvaluationFieldDefinition["kind"],
): string {
  if (value === null || value === undefined || value === "") return "—";
  if (kind === "tri_state") return TRI_STATE_LABEL[String(value)] ?? String(value);
  if (kind === "choice") return CHOICE_LABEL[String(value)] ?? TRI_STATE_LABEL[String(value)] ?? String(value);
  if (kind === "currency" && typeof value === "number") return BRL.format(value);
  if (kind === "percentage" && typeof value === "number") return `${value}%`;
  return String(value);
}

export type EvaluationLike = CompanyEvaluation | TechnicalEvaluation | FinancialEvaluation;

export function answerFor(evaluation: EvaluationLike, prop: string): unknown {
  return (evaluation as Record<string, unknown>)[prop] ?? null;
}
