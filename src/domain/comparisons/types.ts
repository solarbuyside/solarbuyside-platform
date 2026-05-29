import { z } from "zod";

export const comparisonStatusSchema = z.enum(["draft", "ready_for_review", "completed"]);
export const scoreCategorySchema = z.enum(["company", "technical"]);
export const triStateAnswerSchema = z.enum(["yes", "no", "unknown"]);
export const viabilityConfidenceSchema = z.enum(["high", "medium", "low", "unknown"]);

export type ComparisonStatus = z.infer<typeof comparisonStatusSchema>;
export type ScoreCategory = z.infer<typeof scoreCategorySchema>;
export type TriStateAnswer = z.infer<typeof triStateAnswerSchema>;
export type ViabilityConfidence = z.infer<typeof viabilityConfidenceSchema>;

export const companyEvaluationSchema = z.object({
  solarSinceYear: z.number().int().min(1900).max(2100).nullable().optional(),
  companyFoundedYear: z.number().int().min(1900).max(2100).nullable().optional(),
  hasElectricalEngineeringCrea: triStateAnswerSchema.nullable().optional(),
  engineerGraduationYear: z.number().int().min(1900).max(2100).nullable().optional(),
  installedSystemsRange: z
    .enum(["lt_10", "10_49", "50_100", "gt_100", "unknown"])
    .nullable()
    .optional(),
  ownInstallationTeam: z
    .enum(["yes", "no", "outsourced_known", "unknown"])
    .nullable()
    .optional(),
  installationDeadlineDays: z.number().min(0).nullable().optional(),
  projectExecutionWarrantyYears: z.number().min(0).nullable().optional(),
  hasMaintenanceSupport: triStateAnswerSchema.nullable().optional(),
  supportDeadlineDays: z.number().min(0).nullable().optional(),
  deliveredTechnicalDocs: triStateAnswerSchema.nullable().optional(),
  sellerTrustScore: z.number().min(0).max(10).nullable().optional(),
  reclameAquiScore: z.number().min(0).max(10).nullable().optional(),
});

export const technicalEvaluationSchema = z.object({
  systemPowerKwp: z.number().min(0).nullable().optional(),
  monthlyGenerationKwh: z.number().min(0).nullable().optional(),
  annualGenerationKwh: z.number().min(0).nullable().optional(),
  moduleBrand: z.string().nullable().optional(),
  moduleModel: z.string().nullable().optional(),
  modulePowerW: z.number().min(0).nullable().optional(),
  moduleWeightKg: z.number().min(0).nullable().optional(),
  moduleEfficiencyPct: z.number().min(0).nullable().optional(),
  moduleLifetimeEfficiencyPct: z.number().min(0).nullable().optional(),
  moduleDefectWarrantyYears: z.number().min(0).nullable().optional(),
  moduleEfficiencyWarrantyYears: z.number().min(0).nullable().optional(),
  moduleCount: z.number().int().min(0).nullable().optional(),
  inverterBrand: z.string().nullable().optional(),
  inverterModel: z.string().nullable().optional(),
  inverterPowerKw: z.number().min(0).nullable().optional(),
  inverterDefectWarrantyYears: z.number().min(0).nullable().optional(),
  inverterCount: z.number().int().min(0).nullable().optional(),
  inverterOversizingRatio: z.number().min(0).nullable().optional(),
  distributorReputation: z.string().nullable().optional(),
  moduleMakerReputation: z.string().nullable().optional(),
  inverterMakerReputation: z.string().nullable().optional(),
  inverterReliability: triStateAnswerSchema.nullable().optional(),
  moduleReliability: triStateAnswerSchema.nullable().optional(),
  distributorReliability: triStateAnswerSchema.nullable().optional(),
});

export const financialEvaluationSchema = z.object({
  monthlyBillWithoutSolar: z.number().min(0).nullable().optional(),
  monthlyBillWithSolar: z.number().min(0).nullable().optional(),
  monthlySavingsFirstYear: z.number().min(0).nullable().optional(),
  annualSavingsFirstYear: z.number().min(0).nullable().optional(),
  accumulatedSavings25Years: z.number().min(0).nullable().optional(),
  totalInvestment: z.number().min(0).nullable().optional(),
  paymentDown: z.number().min(0).nullable().optional(),
  paymentEquipmentDelivery: z.number().min(0).nullable().optional(),
  paymentInstallationFinal: z.number().min(0).nullable().optional(),
  simplePaybackMonths: z.number().min(0).nullable().optional(),
  annualReturnPct: z.number().nullable().optional(),
  roiMultiplier: z.number().min(0).nullable().optional(),
  energyInflationPct: z.number().nullable().optional(),
  simultaneityFactorPct: z.number().nullable().optional(),
  viabilityConfidence: viabilityConfidenceSchema.nullable().optional(),
});

export const competitorProposalSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int().min(1).max(6),
  companyName: z.string().min(1),
  sellerName: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  company: companyEvaluationSchema.default({}),
  technical: technicalEvaluationSchema.default({}),
  financial: financialEvaluationSchema.default({}),
});

export const scoreDefinitionSchema = z.object({
  key: z.string().min(1),
  category: scoreCategorySchema,
  section: z.string().min(1),
  label: z.string().min(1),
  defaultEnabled: z.boolean(),
  maxScore: z.number().positive().default(10),
  sourceSheet: z.string().min(1),
  sourceRow: z.number().int().positive(),
  rubric: z.string().optional(),
});

export const scoreEntrySchema = z.object({
  competitorId: z.string().uuid(),
  criterionKey: z.string().min(1),
  score: z.number().min(0).max(10).nullable(),
  notes: z.string().nullable().optional(),
});

export const scoreSettingSchema = z.object({
  criterionKey: z.string().min(1),
  enabled: z.boolean(),
  weight: z.number().positive().default(1),
});

export const comparisonInputSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid().optional(),
  title: z.string().min(1),
  status: comparisonStatusSchema.default("draft"),
  competitors: z.array(competitorProposalSchema).max(6),
  scoreEntries: z.array(scoreEntrySchema).default([]),
  scoreSettings: z.array(scoreSettingSchema).default([]),
  selectedFinalistIds: z.array(z.string().uuid()).max(2).default([]),
  // Display-only metadata. Postgres returns timestamps like
  // "2026-05-28 23:17:50.62+00" (space + offset), which is not strict ISO,
  // so we accept any non-empty string rather than z.string().datetime().
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CompanyEvaluation = z.infer<typeof companyEvaluationSchema>;
export type TechnicalEvaluation = z.infer<typeof technicalEvaluationSchema>;
export type FinancialEvaluation = z.infer<typeof financialEvaluationSchema>;
export type CompetitorProposal = z.infer<typeof competitorProposalSchema>;
export type ScoreDefinition = z.infer<typeof scoreDefinitionSchema>;
export type ScoreEntry = z.infer<typeof scoreEntrySchema>;
export type ScoreSetting = z.infer<typeof scoreSettingSchema>;
export type ComparisonInput = z.infer<typeof comparisonInputSchema>;

export type ScoreSummary = {
  points: number;
  maxPoints: number;
  grade10: number;
  enabledCriteria: number;
};

export type CompetitorResult = {
  competitorId: string;
  companyName: string;
  position: number;
  rank: number;
  investment: number | null;
  companyScore: ScoreSummary;
  technicalScore: ScoreSummary;
  totalScore: ScoreSummary;
  pricePerPoint: number | null;
  riskFlags: string[];
};

export type ComparisonInsight = {
  severity: "info" | "warning" | "success";
  title: string;
  description: string;
};

export type ComparisonResult = {
  comparisonId: string;
  generatedAt: string;
  competitors: CompetitorResult[];
  recommendedFinalistIds: string[];
  selectedFinalistIds: string[];
  insights: ComparisonInsight[];
};
