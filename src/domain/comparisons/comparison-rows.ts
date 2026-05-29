import {
  companyFormFields,
  technicalFormFields,
  financialFormFields,
  type EvaluationFieldDefinition,
} from "./workflow";
import {
  companyScoreDefinitions,
  technicalScoreDefinitions,
} from "./score-definitions";
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
      rows.push({
        fieldKey: field.key,
        prop,
        label: field.label,
        section: field.section,
        kind: field.kind,
        scoreKey: null,
        rubric: null,
        defaultEnabled: true,
      });
    }
  }

  return rows;
}

// Campos do formulário que NÃO têm linha de pontuação (apenas informativos).
const INFORMATIONAL_PROPS = new Set<string>(["moduleCount", "inverterCount"]);

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

// --- Formatação das respostas para exibição na tabela ----------------------

const TRI_STATE_LABEL: Record<string, string> = { yes: "Sim", no: "Não", unknown: "Não sei" };
const CHOICE_LABEL: Record<string, string> = {
  lt_10: "< 10",
  "10_49": "10 a 49",
  "50_100": "50 a 100",
  gt_100: "+ de 100",
  outsourced_known: "Terceirizado conhecido",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
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
