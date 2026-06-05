import {
  companyScoreDefinitions,
  financialScoreDefinitions,
  scoreDefinitions,
  technicalScoreDefinitions,
} from "./score-definitions";

export type EvaluationStepId =
  | "company_form"
  | "technical_form"
  | "financial_form"
  | "company_scoring"
  | "technical_scoring"
  | "final_decision";

export type EvaluationFieldKind =
  | "text"
  | "number"
  | "currency"
  | "percentage"
  | "choice"
  | "tri_state"
  | "score";

export type EvaluationFieldDefinition = {
  key: string;
  label: string;
  kind: EvaluationFieldKind;
  sourceSheet: string;
  sourceRow: number;
  section: string;
};

export type EvaluationStepDefinition = {
  id: EvaluationStepId;
  title: string;
  sourceSheet: string;
  sequence: number;
  purpose: string;
  fields: readonly EvaluationFieldDefinition[];
};

export const companyFormFields = [
  {
    key: "company.solarSinceYear",
    label: "Atuação no ramo solar desde (ano)",
    kind: "number",
    sourceSheet: "Form. Empresa",
    sourceRow: 11,
    section: "A empresa",
  },
  {
    key: "company.companyFoundedYear",
    label: "Ano de abertura da empresa",
    kind: "number",
    sourceSheet: "Form. Empresa",
    sourceRow: 12,
    section: "A empresa",
  },
  {
    key: "company.hasElectricalEngineeringCrea",
    label: "Registro CREA engenharia elétrica (sim/não)",
    kind: "tri_state",
    sourceSheet: "Form. Empresa",
    sourceRow: 13,
    section: "A empresa",
  },
  {
    key: "company.engineerGraduationYear",
    label: "Colação de grau do engenheiro responsável (ano)",
    kind: "number",
    sourceSheet: "Form. Empresa",
    sourceRow: 14,
    section: "A empresa",
  },
  {
    key: "company.installedSystemsRange",
    label: "Quantidade de SFV instalado (aproximadamente)",
    kind: "choice",
    sourceSheet: "Form. Empresa",
    sourceRow: 15,
    section: "A empresa",
  },
  {
    key: "company.ownInstallationTeam",
    label: "Instalações são realizadas por funcionário próprio (sim/não)",
    kind: "choice",
    sourceSheet: "Form. Empresa",
    sourceRow: 16,
    section: "A empresa",
  },
  {
    key: "company.installationDeadlineDays",
    label: "Prazo máximo de instalação do sistema solar (dias)",
    kind: "number",
    sourceSheet: "Form. Empresa",
    sourceRow: 18,
    section: "Comprometimento da empresa",
  },
  {
    key: "company.projectExecutionWarrantyYears",
    label: "Garantia contra defeito de projeto e execução (anos)",
    kind: "number",
    sourceSheet: "Form. Empresa",
    sourceRow: 19,
    section: "Comprometimento da empresa",
  },
  {
    key: "company.hasMaintenanceSupport",
    label: "Existência de serviço de manutenção e assistência (sim/não)",
    kind: "tri_state",
    sourceSheet: "Form. Empresa",
    sourceRow: 21,
    section: "Assistência técnica e manutenção",
  },
  {
    key: "company.supportDeadlineDays",
    label: "Prazo de assistência técnica (dias)",
    kind: "number",
    sourceSheet: "Form. Empresa",
    sourceRow: 22,
    section: "Assistência técnica e manutenção",
  },
  {
    key: "company.deliveredTechnicalDocs",
    label: "Entregue memorial descritivo e diagrama unifilar (sim/não)",
    kind: "tri_state",
    sourceSheet: "Form. Empresa",
    sourceRow: 24,
    section: "Entrega de documentos técnicos",
  },
  {
    key: "company.sellerTrustScore",
    label: "Sentiu competência e confiança com o vendedor (pontua de 1 a 10)",
    kind: "score",
    sourceSheet: "Form. Empresa",
    sourceRow: 26,
    section: "Avaliação do vendedor e da empresa pelo comprador",
  },
  {
    key: "company.reclameAquiScore",
    label: "Reclame Aqui: nota média dos últimos 12 meses",
    kind: "score",
    sourceSheet: "Form. Empresa",
    sourceRow: 27,
    section: "Avaliação do vendedor e da empresa pelo comprador",
  },
] as const satisfies readonly EvaluationFieldDefinition[];

export const technicalFormFields = [
  {
    key: "technical.annualConsumptionKwh",
    label: "Consumo anual a compensar (kWh/ano)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 9,
    section: "Consumo de energia",
  },
  {
    key: "technical.systemPowerKwp",
    label: "Potência do sistema (kWp)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 11,
    section: "Sistema solar fotovoltaico",
  },
  {
    key: "technical.annualGenerationKwh",
    label: "Geração anual (kWh)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 14,
    section: "Estimativa de geração de energia",
  },
  {
    key: "technical.moduleBrand",
    label: "Módulo fotovoltaico - marca",
    kind: "text",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 16,
    section: "Módulo fotovoltaico",
  },
  {
    key: "technical.moduleModel",
    label: "Módulo fotovoltaico - modelo",
    kind: "text",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 17,
    section: "Módulo fotovoltaico",
  },
  {
    key: "technical.modulePowerW",
    label: "Potência do módulo (watts)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 18,
    section: "Módulo fotovoltaico",
  },
  {
    key: "technical.moduleEfficiencyPct",
    label: "Eficiência de conversão de radiação (%)",
    kind: "percentage",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 20,
    section: "Módulo fotovoltaico",
  },
  {
    key: "technical.moduleLifetimeEfficiencyPct",
    label: "Eficiência aos 25 ou 30 anos",
    kind: "percentage",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 21,
    section: "Módulo fotovoltaico",
  },
  {
    key: "technical.moduleDefectWarrantyYears",
    label: "Garantia contra defeito do módulo (anos)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 22,
    section: "Módulo fotovoltaico",
  },
  {
    key: "technical.moduleEfficiencyWarrantyYears",
    label: "Garantia de eficiência do módulo (anos)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 23,
    section: "Módulo fotovoltaico",
  },
  {
    key: "technical.moduleCount",
    label: "Número de módulos",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 24,
    section: "Módulo fotovoltaico",
  },
  {
    key: "technical.inverterBrand",
    label: "Inversor de corrente - marca",
    kind: "text",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 26,
    section: "Inversor de corrente",
  },
  {
    key: "technical.inverterModel",
    label: "Inversor de corrente - modelo",
    kind: "text",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 27,
    section: "Inversor de corrente",
  },
  {
    key: "technical.inverterPowerKw",
    label: "Potência do inversor (kW)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 28,
    section: "Inversor de corrente",
  },
  {
    key: "technical.inverterDefectWarrantyYears",
    label: "Garantia contra defeito do inversor (anos)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 29,
    section: "Inversor de corrente",
  },
  {
    key: "technical.inverterCount",
    label: "Número de inversores",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 30,
    section: "Inversor de corrente",
  },
  {
    key: "technical.inverterOversizingRatio",
    label: "Sobrecarga calculada (kWp / kW) em %",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 32,
    section: "Sobrecarga do inversor",
  },
  {
    key: "technical.distributorName",
    label: "Reclame Aqui - distribuidora de sistema solar fotovoltaico",
    kind: "text",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 34,
    section: "Reclame Aqui",
  },
  {
    key: "technical.distributorScore",
    label: "Indicadores de reputação",
    kind: "choice",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 34,
    section: "Reclame Aqui",
  },
  {
    key: "technical.moduleMakerName",
    label: "Reclame Aqui - fabricante de módulo fotovoltaico",
    kind: "text",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 35,
    section: "Reclame Aqui",
  },
  {
    key: "technical.moduleMakerScore",
    label: "Indicadores de reputação",
    kind: "choice",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 35,
    section: "Reclame Aqui",
  },
  {
    key: "technical.inverterMakerName",
    label: "Fabricante de inversor de corrente (String, Microinversor ou Híbrido)",
    kind: "text",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 36,
    section: "Reclame Aqui",
  },
  {
    key: "technical.inverterMakerScore",
    label: "Indicadores de reputação",
    kind: "choice",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 36,
    section: "Reclame Aqui",
  },
  {
    key: "technical.inverterReliability",
    label: "Confiabilidade do inversor de corrente",
    kind: "tri_state",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 38,
    section: "Confiabilidade dos fabricantes e distribuidoras",
  },
  {
    key: "technical.moduleReliability",
    label: "Confiabilidade do módulo fotovoltaico",
    kind: "tri_state",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 39,
    section: "Confiabilidade dos fabricantes e distribuidoras",
  },
  {
    key: "technical.distributorReliability",
    label: "Confiabilidade da distribuidora de equipamento",
    kind: "tri_state",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 40,
    section: "Confiabilidade dos fabricantes e distribuidoras",
  },
] as const satisfies readonly EvaluationFieldDefinition[];

export const financialFormFields = [
  {
    key: "financial.monthlyBillWithoutSolar",
    label: "Sem energia solar (R$/mes)",
    kind: "currency",
    sourceSheet: "Form. Financeiro",
    sourceRow: 11,
    section: "Sua conta de energia",
  },
  {
    key: "financial.monthlyBillWithSolar",
    label: "Com energia solar (R$/mes)",
    kind: "currency",
    sourceSheet: "Form. Financeiro",
    sourceRow: 12,
    section: "Sua conta de energia",
  },
  {
    key: "financial.monthlySavingsFirstYear",
    label: "Economia mensal no primeiro ano (R$)",
    kind: "currency",
    sourceSheet: "Form. Financeiro",
    sourceRow: 13,
    section: "Sua conta de energia",
  },
  {
    key: "financial.annualSavingsFirstYear",
    label: "Economia no primeiro ano (R$)",
    kind: "currency",
    sourceSheet: "Form. Financeiro",
    sourceRow: 14,
    section: "Sua conta de energia",
  },
  {
    key: "financial.accumulatedSavings25Years",
    label: "Economia acumulada em 25 anos (R$)",
    kind: "currency",
    sourceSheet: "Form. Financeiro",
    sourceRow: 15,
    section: "Sua conta de energia",
  },
  {
    key: "financial.totalInvestment",
    label: "Preco total (R$)",
    kind: "currency",
    sourceSheet: "Form. Financeiro",
    sourceRow: 17,
    section: "Valor de venda e instalação total do sistema solar",
  },
  {
    key: "financial.paymentDown",
    label: "Entrada - no ato da compra (R$)",
    kind: "currency",
    sourceSheet: "Form. Financeiro",
    sourceRow: 19,
    section: "Condição de pagamentos",
  },
  {
    key: "financial.paymentEquipmentDelivery",
    label: "Entrega de equipamentos (R$)",
    kind: "currency",
    sourceSheet: "Form. Financeiro",
    sourceRow: 20,
    section: "Condição de pagamentos",
  },
  {
    key: "financial.paymentInstallationFinal",
    label: "Instalação - serviço final (R$)",
    kind: "currency",
    sourceSheet: "Form. Financeiro",
    sourceRow: 21,
    section: "Condição de pagamentos",
  },
  {
    key: "financial.simplePaybackMonths",
    label: "Payback simples (meses)",
    kind: "number",
    sourceSheet: "Form. Financeiro",
    sourceRow: 23,
    section: "Prazo de retorno e rentabilidade do capital",
  },
  {
    key: "financial.annualReturnPct",
    label: "Rentabilidade do capital por mês (%)",
    kind: "percentage",
    sourceSheet: "Form. Financeiro",
    sourceRow: 24,
    section: "Prazo de retorno e rentabilidade do capital",
  },
  {
    key: "financial.roiMultiplier",
    label: "ROI (multiplicação por X vezes)",
    kind: "number",
    sourceSheet: "Form. Financeiro",
    sourceRow: 25,
    section: "Prazo de retorno e rentabilidade do capital",
  },
  {
    key: "financial.energyInflationPct",
    label: "Índice de inflação de energia estimado 25 anos (% ao ano)",
    kind: "percentage",
    sourceSheet: "Form. Financeiro",
    sourceRow: 27,
    section: "Índice de inflação e fator de simultaneidade",
  },
  {
    key: "financial.simultaneityFactorPct",
    label: "Fator de simultaneidade considerado (%)",
    kind: "percentage",
    sourceSheet: "Form. Financeiro",
    sourceRow: 28,
    section: "Índice de inflação e fator de simultaneidade",
  },
  {
    key: "financial.viabilityConfidence",
    label: "Confiabilidade da viabilidade (alta/média/baixa/não sei)",
    kind: "choice",
    sourceSheet: "Form. Financeiro",
    sourceRow: 29,
    section: "Índice de inflação e fator de simultaneidade",
  },
] as const satisfies readonly EvaluationFieldDefinition[];

export const comparisonWorkflow = [
  {
    id: "company_form",
    title: "Passo 1 de 3 - Avaliacao da empresa de solar",
    sourceSheet: "Form. Empresa",
    sequence: 1,
    purpose:
      "Coletar dados da empresa, garantias, manutencao, documentacao e percepcao do vendedor.",
    fields: companyFormFields,
  },
  {
    id: "technical_form",
    title: "Passo 2 de 3 - Avaliacao da proposta tecnica",
    sourceSheet: "Form. Tecnologico",
    sequence: 2,
    purpose:
      "Coletar potencia, geracao, modulo, inversor, sobrecarga, reputacao e confiabilidade.",
    fields: technicalFormFields,
  },
  {
    id: "financial_form",
    title: "Passo 3 de 3 - Viabilidade economico-financeira",
    sourceSheet: "Form. Financeiro",
    sequence: 3,
    purpose:
      "Coletar conta de energia, investimento, pagamentos, payback, ROI e premissas de viabilidade.",
    fields: financialFormFields,
  },
  {
    id: "company_scoring",
    title: "Tabela 1 - Avaliacao das empresas",
    sourceSheet: "Avaliacao Empresas",
    sequence: 4,
    purpose: "Pontuar os 13 criterios empresariais e recalcular o denominador quando itens forem desligados.",
    fields: companyScoreDefinitions.map((definition) => ({
      key: definition.key,
      label: definition.label,
      kind: "score" as const,
      sourceSheet: definition.sourceSheet,
      sourceRow: definition.sourceRow,
      section: definition.section,
    })),
  },
  {
    id: "technical_scoring",
    title: "Tabela 2 - Avaliacao tecnologica",
    sourceSheet: "Avaliacao Tecnologica",
    sequence: 5,
    purpose:
      "Pontuar os criterios tecnicos; as tres linhas de reputacao do Reclame Aqui nascem desligadas como na planilha.",
    fields: technicalScoreDefinitions.map((definition) => ({
      key: definition.key,
      label: definition.label,
      kind: "score" as const,
      sourceSheet: definition.sourceSheet,
      sourceRow: definition.sourceRow,
      section: definition.section,
    })),
  },
  {
    id: "final_decision",
    title: "Pontuacao geral e finalistas",
    sourceSheet: "Pontuacao Geral",
    sequence: 6,
    purpose:
      "Consolidar empresa + tecnologia, manter financeiro como informativo e exigir exatamente duas finalistas escolhidas pelo comprador.",
    fields: [],
  },
] as const satisfies readonly EvaluationStepDefinition[];

export const comparisonWorkflowSummary = {
  version: "spreadsheet-2026-05-27",
  maxCompetitors: 6,
  finalistCount: 2,
  companyCriteriaCount: companyScoreDefinitions.length,
  technicalCriteriaCount: technicalScoreDefinitions.length,
  financialCriteriaCount: financialScoreDefinitions.length,
  enabledCompanyCriteriaCount: companyScoreDefinitions.filter((definition) => definition.defaultEnabled).length,
  enabledTechnicalCriteriaCount: technicalScoreDefinitions.filter((definition) => definition.defaultEnabled).length,
  enabledFinancialCriteriaCount: financialScoreDefinitions.filter((definition) => definition.defaultEnabled).length,
  totalCriteriaCount: scoreDefinitions.length,
  // Slide 19: a Viabilidade passa a somar no ranking (rubric provisório).
  financialAffectsScore: true,
} as const;
