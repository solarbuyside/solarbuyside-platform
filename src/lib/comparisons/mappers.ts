import type { Database } from "@/lib/supabase/database.types";
import type {
  CompanyEvaluation,
  FinancialEvaluation,
  TechnicalEvaluation,
} from "@/domain/comparisons/types";

type CompanyRow = Database["public"]["Tables"]["company_evaluations"]["Row"];
type TechnicalRow = Database["public"]["Tables"]["technical_evaluations"]["Row"];
type FinancialRow = Database["public"]["Tables"]["financial_evaluations"]["Row"];

type CompanyUpdate = Database["public"]["Tables"]["company_evaluations"]["Update"];
type TechnicalUpdate = Database["public"]["Tables"]["technical_evaluations"]["Update"];
type FinancialUpdate = Database["public"]["Tables"]["financial_evaluations"]["Update"];

/**
 * Database rows use snake_case; the pure domain (`src/domain/comparisons`) uses
 * camelCase. These mappers are the single translation point between the two.
 * Keep them aligned with `supabase/migrations` and `database.types.ts`.
 */

export function companyRowToDomain(row: CompanyRow): CompanyEvaluation {
  return {
    solarSinceYear: row.solar_since_year,
    companyFoundedYear: row.company_founded_year,
    hasElectricalEngineeringCrea: row.has_electrical_engineering_crea,
    engineerGraduationYear: row.engineer_graduation_year,
    installedSystemsRange: row.installed_systems_range,
    ownInstallationTeam: row.own_installation_team,
    installationDeadlineDays: row.installation_deadline_days,
    projectExecutionWarrantyYears: row.project_execution_warranty_years,
    hasMaintenanceSupport: row.has_maintenance_support,
    supportDeadlineDays: row.support_deadline_days,
    deliveredTechnicalDocs: row.delivered_technical_docs,
    sellerTrustScore: row.seller_trust_score,
    reclameAquiScore: row.reclame_aqui_score,
  };
}

export function companyDomainToUpdate(value: CompanyEvaluation): CompanyUpdate {
  return {
    solar_since_year: value.solarSinceYear ?? null,
    company_founded_year: value.companyFoundedYear ?? null,
    has_electrical_engineering_crea: value.hasElectricalEngineeringCrea ?? null,
    engineer_graduation_year: value.engineerGraduationYear ?? null,
    installed_systems_range: value.installedSystemsRange ?? null,
    own_installation_team: value.ownInstallationTeam ?? null,
    installation_deadline_days: value.installationDeadlineDays ?? null,
    project_execution_warranty_years: value.projectExecutionWarrantyYears ?? null,
    has_maintenance_support: value.hasMaintenanceSupport ?? null,
    support_deadline_days: value.supportDeadlineDays ?? null,
    delivered_technical_docs: value.deliveredTechnicalDocs ?? null,
    seller_trust_score: value.sellerTrustScore ?? null,
    reclame_aqui_score: value.reclameAquiScore ?? null,
  };
}

export function technicalRowToDomain(row: TechnicalRow): TechnicalEvaluation {
  return {
    systemPowerKwp: row.system_power_kwp,
    monthlyGenerationKwh: row.monthly_generation_kwh,
    annualGenerationKwh: row.annual_generation_kwh,
    moduleBrand: row.module_brand,
    moduleModel: row.module_model,
    modulePowerW: row.module_power_w,
    moduleWeightKg: row.module_weight_kg,
    moduleEfficiencyPct: row.module_efficiency_pct,
    moduleLifetimeEfficiencyPct: row.module_lifetime_efficiency_pct,
    moduleDefectWarrantyYears: row.module_defect_warranty_years,
    moduleEfficiencyWarrantyYears: row.module_efficiency_warranty_years,
    moduleCount: row.module_count,
    inverterBrand: row.inverter_brand,
    inverterModel: row.inverter_model,
    inverterPowerKw: row.inverter_power_kw,
    inverterDefectWarrantyYears: row.inverter_defect_warranty_years,
    inverterCount: row.inverter_count,
    inverterOversizingRatio: row.inverter_oversizing_ratio,
    distributorReputation: row.distributor_reputation,
    moduleMakerReputation: row.module_maker_reputation,
    inverterMakerReputation: row.inverter_maker_reputation,
    inverterReliability: row.inverter_reliability,
    moduleReliability: row.module_reliability,
    distributorReliability: row.distributor_reliability,
  };
}

export function technicalDomainToUpdate(value: TechnicalEvaluation): TechnicalUpdate {
  return {
    system_power_kwp: value.systemPowerKwp ?? null,
    monthly_generation_kwh: value.monthlyGenerationKwh ?? null,
    annual_generation_kwh: value.annualGenerationKwh ?? null,
    module_brand: value.moduleBrand ?? null,
    module_model: value.moduleModel ?? null,
    module_power_w: value.modulePowerW ?? null,
    module_weight_kg: value.moduleWeightKg ?? null,
    module_efficiency_pct: value.moduleEfficiencyPct ?? null,
    module_lifetime_efficiency_pct: value.moduleLifetimeEfficiencyPct ?? null,
    module_defect_warranty_years: value.moduleDefectWarrantyYears ?? null,
    module_efficiency_warranty_years: value.moduleEfficiencyWarrantyYears ?? null,
    module_count: value.moduleCount ?? null,
    inverter_brand: value.inverterBrand ?? null,
    inverter_model: value.inverterModel ?? null,
    inverter_power_kw: value.inverterPowerKw ?? null,
    inverter_defect_warranty_years: value.inverterDefectWarrantyYears ?? null,
    inverter_count: value.inverterCount ?? null,
    inverter_oversizing_ratio: value.inverterOversizingRatio ?? null,
    distributor_reputation: value.distributorReputation ?? null,
    module_maker_reputation: value.moduleMakerReputation ?? null,
    inverter_maker_reputation: value.inverterMakerReputation ?? null,
    inverter_reliability: value.inverterReliability ?? null,
    module_reliability: value.moduleReliability ?? null,
    distributor_reliability: value.distributorReliability ?? null,
  };
}

export function financialRowToDomain(row: FinancialRow): FinancialEvaluation {
  return {
    monthlyBillWithoutSolar: row.monthly_bill_without_solar,
    monthlyBillWithSolar: row.monthly_bill_with_solar,
    monthlySavingsFirstYear: row.monthly_savings_first_year,
    annualSavingsFirstYear: row.annual_savings_first_year,
    accumulatedSavings25Years: row.accumulated_savings_25_years,
    totalInvestment: row.total_investment,
    paymentDown: row.payment_down,
    paymentEquipmentDelivery: row.payment_equipment_delivery,
    paymentInstallationFinal: row.payment_installation_final,
    simplePaybackMonths: row.simple_payback_months,
    annualReturnPct: row.annual_return_pct,
    roiMultiplier: row.roi_multiplier,
    energyInflationPct: row.energy_inflation_pct,
    simultaneityFactorPct: row.simultaneity_factor_pct,
    viabilityConfidence: row.viability_confidence,
  };
}

export function financialDomainToUpdate(value: FinancialEvaluation): FinancialUpdate {
  return {
    monthly_bill_without_solar: value.monthlyBillWithoutSolar ?? null,
    monthly_bill_with_solar: value.monthlyBillWithSolar ?? null,
    monthly_savings_first_year: value.monthlySavingsFirstYear ?? null,
    annual_savings_first_year: value.annualSavingsFirstYear ?? null,
    accumulated_savings_25_years: value.accumulatedSavings25Years ?? null,
    total_investment: value.totalInvestment ?? null,
    payment_down: value.paymentDown ?? null,
    payment_equipment_delivery: value.paymentEquipmentDelivery ?? null,
    payment_installation_final: value.paymentInstallationFinal ?? null,
    simple_payback_months: value.simplePaybackMonths ?? null,
    annual_return_pct: value.annualReturnPct ?? null,
    roi_multiplier: value.roiMultiplier ?? null,
    energy_inflation_pct: value.energyInflationPct ?? null,
    simultaneity_factor_pct: value.simultaneityFactorPct ?? null,
    viability_confidence: value.viabilityConfidence ?? null,
  };
}
