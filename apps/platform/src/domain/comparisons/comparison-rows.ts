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
 * + a NOTA (0-10). Este módulo casa, por um MAPA EXPLÍCITO campo→critério, as
 * perguntas do formulário com as definições de pontuação. (Antes o casamento
 * era posicional; com a Tecnologia esparsa do PPTX — 10 notas entre ~25 campos,
 * o resto informativo — o mapa explícito é mais robusto.)
 */

/**
 * Campo do formulário (camelCase) → critério de pontuação (snake_case). Campos
 * fora do mapa são INFORMATIVOS (sem nota canônica). PPTX 2026-06-09.
 */
const FIELD_TO_SCORE: Record<string, string> = {
  // Empresa (13 critérios — slide 11).
  "company.solarSinceYear": "company.solar_since_year",
  "company.companyFoundedYear": "company.founded_year",
  "company.hasElectricalEngineeringCrea": "company.crea_registration",
  "company.engineerGraduationYear": "company.engineer_graduation_year",
  "company.installedSystemsRange": "company.installed_systems",
  "company.ownInstallationTeam": "company.own_installation_team",
  "company.installationDeadlineDays": "company.installation_deadline",
  "company.projectExecutionWarrantyYears": "company.execution_warranty",
  "company.hasMaintenanceSupport": "company.maintenance_support",
  "company.supportDeadlineDays": "company.support_deadline",
  "company.deliveredTechnicalDocs": "company.technical_docs_delivered",
  "company.sellerTrustScore": "company.seller_trust",
  "company.reclameAquiScore": "company.reclame_aqui",
  // Tecnologia (10 critérios — slide 11; o resto é informativo "/").
  "technical.annualGenerationKwh": "technical.annual_generation",
  "technical.moduleBrand": "technical.module_brand",
  "technical.moduleDefectWarrantyYears": "technical.module_defect_warranty",
  "technical.moduleEfficiencyWarrantyYears": "technical.module_efficiency_warranty",
  "technical.inverterBrand": "technical.inverter_brand",
  "technical.inverterDefectWarrantyYears": "technical.inverter_defect_warranty",
  "technical.inverterOversizingRatio": "technical.inverter_oversizing",
  "technical.distributorScore": "technical.reputation_distributor",
  "technical.moduleMakerScore": "technical.reputation_module_maker",
  "technical.inverterMakerScore": "technical.reputation_inverter_maker",
};

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
 * Casa cada campo do formulário com seu critério de pontuação via FIELD_TO_SCORE.
 * Campos fora do mapa são INFORMATIVOS: recebem um scoreKey sintético (= fieldKey)
 * DESLIGADO por padrão, então o comprador ainda pode ligá-los para pontuar
 * ad-hoc, mas eles não alteram o ranking até serem ligados.
 */
function buildRows(
  fields: readonly EvaluationFieldDefinition[],
  defs: readonly ScoreDefinition[],
): ComparisonRow[] {
  const defByKey = new Map(defs.map((d) => [d.key, d]));
  return fields.map((field) => {
    const prop = fieldProp(field.key);
    const scoreKey = FIELD_TO_SCORE[field.key];
    const def = scoreKey ? defByKey.get(scoreKey) : undefined;
    return {
      fieldKey: field.key,
      prop,
      label: field.label,
      section: field.section,
      kind: field.kind,
      scoreKey: def ? def.key : field.key,
      rubric: def?.rubric ?? null,
      defaultEnabled: def?.defaultEnabled ?? false,
    };
  });
}

export const companyComparisonRows = buildRows(companyFormFields, companyScoreDefinitions);
export const technicalComparisonRows = buildRows(technicalFormFields, technicalScoreDefinitions);

/**
 * Linhas da Análise de Viabilidade Financeira — INFORMATIVA, sem nota nem total
 * (PPTX 2026-06-09, slides 4-5). Só os dados lado a lado.
 */
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

/**
 * Overrides de label POR CAMPO: quando o mesmo valor enum significa coisas
 * diferentes em campos distintos. Ex.: `unknown` é "Não sei" em quase todos,
 * mas em "instalações por funcionário próprio" o rótulo é "Tenho dúvida"
 * (espelha o formulário de preenchimento). Sem isso, o comparativo cairia no
 * label genérico ("Não sei"). A chave é o `prop` camelCase (= row.prop).
 */
const FIELD_VALUE_LABEL: Record<string, Record<string, string>> = {
  ownInstallationTeam: {
    own: "Equipe própria",
    unknown: "Tenho dúvida",
    outsourced: "Equipe terceirizada",
  },
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Formata a resposta do fornecedor para o texto exibido na célula. `prop`
 * (camelCase do campo) é opcional e só usado para overrides por campo
 * (FIELD_VALUE_LABEL), p/ desambiguar valores enum compartilhados.
 */
export function formatAnswer(
  value: unknown,
  kind: EvaluationFieldDefinition["kind"],
  prop?: string,
): string {
  if (value === null || value === undefined || value === "") return "—";
  const override = prop ? FIELD_VALUE_LABEL[prop]?.[String(value)] : undefined;
  if (override) return override;
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
