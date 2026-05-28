import { companyScoreDefinitions, scoreDefinitions, technicalScoreDefinitions } from "./score-definitions";

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
    label: "Atuacao no ramo solar desde (ano)",
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
    label: "Registro CREA engenharia eletrica (sim/nao)",
    kind: "tri_state",
    sourceSheet: "Form. Empresa",
    sourceRow: 13,
    section: "A empresa",
  },
  {
    key: "company.engineerGraduationYear",
    label: "Colacao de grau do engenheiro responsavel (ano)",
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
    label: "Instalacoes sao realizadas por funcionario proprio (sim/nao)",
    kind: "choice",
    sourceSheet: "Form. Empresa",
    sourceRow: 16,
    section: "A empresa",
  },
  {
    key: "company.installationDeadlineDays",
    label: "Prazo maximo de instalacao do sistema solar",
    kind: "number",
    sourceSheet: "Form. Empresa",
    sourceRow: 18,
    section: "Comprometimento da empresa",
  },
  {
    key: "company.projectExecutionWarrantyYears",
    label: "Garantia contra defeito de projeto e execucao (anos)",
    kind: "number",
    sourceSheet: "Form. Empresa",
    sourceRow: 19,
    section: "Comprometimento da empresa",
  },
  {
    key: "company.hasMaintenanceSupport",
    label: "Existencia de servico de manutencao e assistencia (sim/nao)",
    kind: "tri_state",
    sourceSheet: "Form. Empresa",
    sourceRow: 21,
    section: "Assistencia tecnica e manutencao",
  },
  {
    key: "company.supportDeadlineDays",
    label: "Prazo de assistencia tecnica (dias)",
    kind: "number",
    sourceSheet: "Form. Empresa",
    sourceRow: 22,
    section: "Assistencia tecnica e manutencao",
  },
  {
    key: "company.deliveredTechnicalDocs",
    label: "Entregue memorial descritivo e diagrama unifilar (sim/nao)",
    kind: "tri_state",
    sourceSheet: "Form. Empresa",
    sourceRow: 24,
    section: "Entrega de documentos tecnicos",
  },
  {
    key: "company.sellerTrustScore",
    label: "Sentiu empatia e confianca com o vendedor",
    kind: "score",
    sourceSheet: "Form. Empresa",
    sourceRow: 26,
    section: "Avaliacao do vendedor pelo comprador",
  },
  {
    key: "company.reclameAquiScore",
    label: "Reclame Aqui: nota media dos ultimos 12 meses",
    kind: "score",
    sourceSheet: "Form. Empresa",
    sourceRow: 27,
    section: "Avaliacao do vendedor pelo comprador",
  },
] as const satisfies readonly EvaluationFieldDefinition[];

export const technicalFormFields = [
  {
    key: "technical.systemPowerKwp",
    label: "Potencia do sistema (kWp)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 11,
    section: "Sistema solar fotovoltaico",
  },
  {
    key: "technical.monthlyGenerationKwh",
    label: "Geracao mensal media (kWh)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 13,
    section: "Estimativa de geracao de energia",
  },
  {
    key: "technical.annualGenerationKwh",
    label: "Geracao anual (kWh)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 14,
    section: "Estimativa de geracao de energia",
  },
  {
    key: "technical.moduleBrand",
    label: "Modulo fotovoltaico - marca",
    kind: "text",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 16,
    section: "Modulo fotovoltaico",
  },
  {
    key: "technical.moduleModel",
    label: "Modulo fotovoltaico - modelo",
    kind: "text",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 17,
    section: "Modulo fotovoltaico",
  },
  {
    key: "technical.modulePowerW",
    label: "Potencia do modulo (watts)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 18,
    section: "Modulo fotovoltaico",
  },
  {
    key: "technical.moduleWeightKg",
    label: "Peso (kg)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 19,
    section: "Modulo fotovoltaico",
  },
  {
    key: "technical.moduleEfficiencyPct",
    label: "Eficiencia de conversao de radiacao (%)",
    kind: "percentage",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 20,
    section: "Modulo fotovoltaico",
  },
  {
    key: "technical.moduleLifetimeEfficiencyPct",
    label: "Eficiencia aos 25 ou 30 anos",
    kind: "percentage",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 21,
    section: "Modulo fotovoltaico",
  },
  {
    key: "technical.moduleDefectWarrantyYears",
    label: "Garantia contra defeito do modulo (anos)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 22,
    section: "Modulo fotovoltaico",
  },
  {
    key: "technical.moduleEfficiencyWarrantyYears",
    label: "Garantia de eficiencia do modulo (anos)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 23,
    section: "Modulo fotovoltaico",
  },
  {
    key: "technical.moduleCount",
    label: "Numero de modulos",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 24,
    section: "Modulo fotovoltaico",
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
    label: "Potencia do inversor (kW)",
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
    label: "Numero de inversores",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 30,
    section: "Inversor de corrente",
  },
  {
    key: "technical.inverterOversizingRatio",
    label: "Sobrecarga calculada (kWp / kW)",
    kind: "number",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 32,
    section: "Sobrecarga do inversor",
  },
  {
    key: "technical.distributorReputation",
    label: "Reclame Aqui - distribuidora de sistema solar fotovoltaico",
    kind: "text",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 34,
    section: "Reclame Aqui",
  },
  {
    key: "technical.moduleMakerReputation",
    label: "Reclame Aqui - fabricante de modulo fotovoltaico",
    kind: "text",
    sourceSheet: "Form. Tecnologico",
    sourceRow: 35,
    section: "Reclame Aqui",
  },
  {
    key: "technical.inverterMakerReputation",
    label: "Reclame Aqui - fabricante de inversor de corrente",
    kind: "text",
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
    label: "Confiabilidade do modulo fotovoltaico",
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
    section: "Valor de venda e instalacao total do sistema solar",
  },
  {
    key: "financial.paymentDown",
    label: "Entrada - no ato da compra (R$)",
    kind: "currency",
    sourceSheet: "Form. Financeiro",
    sourceRow: 19,
    section: "Condicao de pagamentos",
  },
  {
    key: "financial.paymentEquipmentDelivery",
    label: "Entrega de equipamentos (R$)",
    kind: "currency",
    sourceSheet: "Form. Financeiro",
    sourceRow: 20,
    section: "Condicao de pagamentos",
  },
  {
    key: "financial.paymentInstallationFinal",
    label: "Instalacao - servico final (R$)",
    kind: "currency",
    sourceSheet: "Form. Financeiro",
    sourceRow: 21,
    section: "Condicao de pagamentos",
  },
  {
    key: "financial.simplePaybackMonths",
    label: "Payback simples - anos e meses",
    kind: "number",
    sourceSheet: "Form. Financeiro",
    sourceRow: 23,
    section: "Prazo de retorno e rentabilidade do capital",
  },
  {
    key: "financial.annualReturnPct",
    label: "Rentabilidade do capital em 1 ano (%)",
    kind: "percentage",
    sourceSheet: "Form. Financeiro",
    sourceRow: 24,
    section: "Prazo de retorno e rentabilidade do capital",
  },
  {
    key: "financial.roiMultiplier",
    label: "ROI (multiplicacao por X vezes)",
    kind: "number",
    sourceSheet: "Form. Financeiro",
    sourceRow: 25,
    section: "Prazo de retorno e rentabilidade do capital",
  },
  {
    key: "financial.energyInflationPct",
    label: "Indice de inflacao de energia estimado 25 anos (% ao ano)",
    kind: "percentage",
    sourceSheet: "Form. Financeiro",
    sourceRow: 27,
    section: "Indice de inflacao e fator de simultaneidade",
  },
  {
    key: "financial.simultaneityFactorPct",
    label: "Fator de simultaneidade considerado (%)",
    kind: "percentage",
    sourceSheet: "Form. Financeiro",
    sourceRow: 28,
    section: "Indice de inflacao e fator de simultaneidade",
  },
  {
    key: "financial.viabilityConfidence",
    label: "Confiabilidade da viabilidade (alta/media/baixa/nao sei)",
    kind: "choice",
    sourceSheet: "Form. Financeiro",
    sourceRow: 29,
    section: "Indice de inflacao e fator de simultaneidade",
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
  enabledCompanyCriteriaCount: companyScoreDefinitions.filter((definition) => definition.defaultEnabled).length,
  enabledTechnicalCriteriaCount: technicalScoreDefinitions.filter((definition) => definition.defaultEnabled).length,
  totalCriteriaCount: scoreDefinitions.length,
  financialAffectsScore: false,
} as const;
