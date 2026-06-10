import { reputationToScore } from "./reputation";
import { scoreDefinitions } from "./score-definitions";
import type {
  CompanyEvaluation,
  ComparisonInput,
  CompetitorProposal,
  ScoreCategory,
  ScoreEntry,
  TechnicalEvaluation,
  TriStateAnswer,
} from "./types";

/**
 * Auto-scoring: converte os dados da entrevista em nota 0-10 por critério,
 * usando as rubricas do PPTX 2026-06-09 (slides 6, 8, 10). Esta é a forma
 * executável daquelas escalas.
 *
 * Um critério retorna `null` quando não há dado suficiente para pontuá-lo (ex.:
 * campo não preenchido, ou reputação "sem definição"), para a UI mostrar "—" em
 * vez de um 0 enganoso — e o motor renormaliza o índice sobre o que foi pontuado.
 *
 * SINALIZAÇÕES (slides com possível erro/lacuna; implementado de forma sensata e
 * monotônica — confirmar com o Francis):
 * - Empresa "Prazo de instalação": o slide 6 traz uma escala embaralhada (30
 *   dias = 0, 45 = 10). Implementado o sensato: mais rápido = melhor.
 * - Garantias de módulo/inversor: o slide define só alguns anos (10/12/15 etc.);
 *   valores abaixo do menor recebem a nota mínima.
 * - Sobrecarga: o slide não define 10 em nenhuma faixa; a faixa ideal
 *   (1,30–1,40) recebe 10 aqui.
 * - Grupos de marca: TW Solar (módulo) e Canadian/APSystems/Deye (inversor)
 *   aparecem em dois grupos no slide; usamos o grupo de maior pontuação.
 */

const currentYear = new Date().getFullYear();

/** Sim=10 / "Sim mas duvido" (unknown)=mid / Não=low — tri-state da planilha. */
function triScore(answer: TriStateAnswer | null | undefined, yes: number, mid: number, no: number) {
  if (!answer) return null;
  if (answer === "yes") return yes;
  if (answer === "unknown") return mid;
  return no;
}

// --- Company criteria (slide 6) ---------------------------------------------

function scoreCompany(key: string, c: CompanyEvaluation): number | null {
  switch (key) {
    case "company.solar_since_year": {
      // 1 ponto por ano de atuação (2016 ou antes = 10; ano corrente = 0).
      if (c.solarSinceYear == null) return null;
      return Math.min(10, Math.max(0, currentYear - c.solarSinceYear));
    }
    case "company.founded_year": {
      // 1 ponto por ano de existência (15+ anos = 10).
      if (c.companyFoundedYear == null) return null;
      return Math.min(10, Math.max(0, currentYear - c.companyFoundedYear));
    }
    case "company.crea_registration":
      return triScore(c.hasElectricalEngineeringCrea, 10, 5, 0);
    case "company.engineer_graduation_year": {
      // 1 ponto por ano de formado (2016 ou antes = 10).
      if (c.engineerGraduationYear == null) return null;
      return Math.min(10, Math.max(0, currentYear - c.engineerGraduationYear));
    }
    case "company.installed_systems": {
      // 10-49=2, 50-100=4, 100-500=6, 500-1000=8, +1000=10 (slide 6).
      if (!c.installedSystemsRange || c.installedSystemsRange === "unknown") return null;
      const map: Record<string, number> = {
        gt_1000: 10,
        gt_500: 8,
        gt_100: 6,
        "50_100": 4,
        "10_49": 2,
        lt_10: 0,
      };
      return map[c.installedSystemsRange] ?? null;
    }
    case "company.own_installation_team": {
      // Sim=10, "Sim mas duvido"=7, Não=4 (slide 6). O modelo guarda
      // own/outsourced/unknown; mapeamos own→Sim, unknown→"sim mas duvido",
      // outsourced→Não.
      if (!c.ownInstallationTeam) return null;
      const map: Record<string, number> = { own: 10, unknown: 7, outsourced: 4 };
      return map[c.ownInstallationTeam] ?? null;
    }
    case "company.installation_deadline": {
      // SINALIZADO: slide embaralhado. Implementado monotônico: mais rápido,
      // melhor (<=45 dias = 10; cada faixa de ~10 dias cai ~3 pontos).
      if (c.installationDeadlineDays == null) return null;
      const d = c.installationDeadlineDays;
      if (d <= 45) return 10;
      if (d <= 55) return 7;
      if (d <= 70) return 4;
      return 1;
    }
    case "company.execution_warranty": {
      // 1 ano=2, 2=4, 3=6, 4=8, 5+=10 (slide 6): 2 pontos por ano.
      if (c.projectExecutionWarrantyYears == null) return null;
      return Math.min(10, Math.max(0, Math.round(c.projectExecutionWarrantyYears * 2)));
    }
    case "company.maintenance_support":
      return triScore(c.hasMaintenanceSupport, 10, 5, 0);
    case "company.support_deadline": {
      // 1 dia=10, cada dia a mais -1 (11+ dias = 0) — slide 6.
      if (c.supportDeadlineDays == null) return null;
      return Math.min(10, Math.max(0, 11 - c.supportDeadlineDays));
    }
    case "company.technical_docs_delivered":
      return triScore(c.deliveredTechnicalDocs, 10, 5, 0);
    case "company.seller_trust":
      // Subjetivo: usa o 0-10 informado pelo comprador.
      return c.sellerTrustScore ?? null;
    case "company.reclame_aqui":
      // Categoria de reputação → nota 0-10 (escala do slide 6).
      return reputationToScore(c.reclameAquiScore);
    default:
      return null;
  }
}

// --- Brand groups (slide 9) -------------------------------------------------

function normalizeBrand(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Grupos de marca de MÓDULO → pontuação (5/6/8/10). Não listada = 5. */
const MODULE_BRAND_GROUPS: Array<{ score: number; brands: string[] }> = [
  { score: 10, brands: ["jinko", "longi", "phono", "znshine", "hsaae", "canadiansolar", "aiko", "twsolar"] },
  { score: 8, brands: ["trina", "qcells", "yingli"] },
  { score: 6, brands: ["jasolar", "astroenergy", "gcl", "dmegc", "tcl"] },
];

/** Grupos de marca de INVERSOR → pontuação (6/7/8/9). Não listada = 6. */
const INVERTER_BRAND_GROUPS: Array<{ score: number; brands: string[] }> = [
  { score: 9, brands: ["huawei", "sungrow"] },
  { score: 8, brands: ["fronius", "goodwe", "solaredge", "solis", "hoymiles", "enphase", "growatt", "canadian", "apsystems", "deye"] },
  { score: 7, brands: ["foxess", "sofar", "solplanet", "saj", "solaxpower", "solax"] },
  { score: 6, brands: ["tsuness", "must", "auxsol"] },
];

function classifyBrand(
  value: string | null | undefined,
  groups: Array<{ score: number; brands: string[] }>,
  fallback: number,
): number | null {
  if (!value || !value.trim()) return null;
  const brand = normalizeBrand(value);
  for (const group of groups) {
    if (group.brands.some((b) => brand.includes(b))) return group.score;
  }
  return fallback;
}

// --- Technical criteria (slides 8/10) ---------------------------------------

function scoreTechnical(key: string, t: TechnicalEvaluation): number | null {
  switch (key) {
    case "technical.annual_generation": {
      // (geração − consumo)/consumo: −5%=0, 0%=5, +5%=10 (slide 8/9).
      const consumo = t.annualConsumptionKwh;
      const ger = t.annualGenerationKwh;
      if (consumo == null || ger == null || consumo <= 0) return null;
      const diffPct = ((ger - consumo) / consumo) * 100;
      return Math.min(10, Math.max(0, Math.round(diffPct) + 5));
    }
    case "technical.module_brand":
      return classifyBrand(t.moduleBrand, MODULE_BRAND_GROUPS, 5);
    case "technical.inverter_brand":
      return classifyBrand(t.inverterBrand, INVERTER_BRAND_GROUPS, 6);
    case "technical.module_defect_warranty": {
      // 10 anos=4, 12=7, 15=10 (slide 8). Abaixo de 10 = mínimo.
      if (t.moduleDefectWarrantyYears == null) return null;
      const y = t.moduleDefectWarrantyYears;
      if (y >= 15) return 10;
      if (y >= 12) return 7;
      if (y >= 10) return 4;
      return 1;
    }
    case "technical.module_efficiency_warranty": {
      // 25 anos=6, 30=10 (slide 8). Abaixo de 25 = mínimo.
      if (t.moduleEfficiencyWarrantyYears == null) return null;
      const y = t.moduleEfficiencyWarrantyYears;
      if (y >= 30) return 10;
      if (y >= 25) return 6;
      return 2;
    }
    case "technical.inverter_defect_warranty": {
      // 4 anos=0, 6=2, 8=4, 10=6, 12=8, 15=10 (slide 10).
      if (t.inverterDefectWarrantyYears == null) return null;
      const y = t.inverterDefectWarrantyYears;
      if (y >= 15) return 10;
      if (y >= 12) return 8;
      if (y >= 10) return 6;
      if (y >= 8) return 4;
      if (y >= 6) return 2;
      return 0;
    }
    case "technical.inverter_oversizing": {
      // Faixa ideal 1,25–1,40; abaixo e acima pontuam menos (slide 10, 2 linhas).
      if (t.inverterOversizingRatio == null) return null;
      const r = t.inverterOversizingRatio;
      if (r >= 1.3 && r <= 1.4) return 10; // SINALIZADO: ideal recebe 10
      if (r >= 1.25 && r < 1.3) return 8;
      if (r >= 1.2 && r < 1.25) return 5;
      if (r >= 1.15 && r < 1.2) return 4;
      if (r >= 1.1 && r < 1.15) return 3;
      if (r >= 1.05 && r < 1.1) return 2;
      if (r >= 1.0 && r < 1.05) return 1;
      if (r < 1.0) return 0;
      // Acima da faixa ideal (sobredimensionado): decai.
      if (r <= 1.45) return 3;
      if (r <= 1.5) return 2;
      if (r <= 1.55) return 1;
      return 0;
    }
    case "technical.reputation_distributor":
      return reputationToScore(t.distributorScore);
    case "technical.reputation_module_maker":
      return reputationToScore(t.moduleMakerScore);
    case "technical.reputation_inverter_maker":
      return reputationToScore(t.inverterMakerScore);
    default:
      // Critérios técnicos informativos (slides 8/10, linhas "/"): sem nota.
      return null;
  }
}

export type AutoScore = {
  criterionKey: string;
  category: ScoreCategory;
  score: number | null;
  /** False when this criterion is left to manual judgement. */
  auto: boolean;
};

/**
 * Critérios sem fórmula automática — pontuação fica a cargo do comprador. Com as
 * rubricas do PPTX, marca/modelo e reputação passaram a ser auto-calculados;
 * resta o critério subjetivo de confiança no vendedor.
 */
const MANUAL_KEYS = new Set<string>(["company.seller_trust"]);

/**
 * Returns the auto-suggested score for a single criterion, or null when the
 * data is missing / the criterion is manual / the criterion is informative.
 */
export function autoScoreFor(
  criterionKey: string,
  category: ScoreCategory,
  competitor: Pick<CompetitorProposal, "company" | "technical"> &
    Partial<Pick<CompetitorProposal, "financial">>,
): number | null {
  // Viabilidade financeira é informativa (PPTX slides 4-5): não pontua.
  if (category === "financial") return null;
  if (category === "company") return scoreCompany(criterionKey, competitor.company);
  return scoreTechnical(criterionKey, competitor.technical);
}

export function isManualCriterion(criterionKey: string): boolean {
  return MANUAL_KEYS.has(criterionKey);
}

/**
 * Returns a copy of the comparison where every score entry that has no manual
 * value falls back to the auto-suggested score. This is what the scoring engine
 * should consume so the ranking reflects auto-scores until the buyer overrides
 * them. Manual entries (a non-null score the buyer typed) are preserved.
 */
export function applyAutoScores(comparison: ComparisonInput): ComparisonInput {
  // No modo manual, o sistema NÃO calcula nada: vale só o que a pessoa digitou.
  if (comparison.scoringMode === "manual") {
    return comparison;
  }

  const manualByKey = new Map<string, ScoreEntry>();
  for (const entry of comparison.scoreEntries) {
    manualByKey.set(`${entry.competitorId}::${entry.criterionKey}`, entry);
  }

  const resolved: ScoreEntry[] = [];
  for (const competitor of comparison.competitors) {
    for (const def of scoreDefinitions) {
      const key = `${competitor.id}::${def.key}`;
      const manual = manualByKey.get(key);
      if (manual && manual.score != null) {
        resolved.push(manual);
        continue;
      }
      const auto = autoScoreFor(def.key, def.category, competitor);
      resolved.push({
        competitorId: competitor.id,
        criterionKey: def.key,
        score: auto,
      });
    }
  }

  return { ...comparison, scoreEntries: resolved };
}
