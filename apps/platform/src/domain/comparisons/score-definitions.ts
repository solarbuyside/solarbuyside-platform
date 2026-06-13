import type { ScoreDefinition } from "./types";

/**
 * Critérios pontuados e seus PESOS (%) — PPTX 2026-06-09 (slides 6, 8, 10, 11).
 *
 * Modelo de ponderação (slide 11): cada critério tem um peso em %. A soma dos
 * pesos de cada grupo é 100. A nota ponderada de um critério = (nota/10) × peso;
 * o motor (scoring.ts) usa `weight` como multiplicador e o "Índice de
 * Confiabilidade Solar Buy-Side" do grupo = soma das notas ponderadas (0–100).
 *
 * As rubricas 0–10 abaixo transcrevem as escalas dos slides 6/8/10. Onde o slide
 * estava embaralhado ou incompleto, a rubrica/auto-scoring usa uma interpretação
 * monotônica sensata e o ponto fica SINALIZADO (ver auto-scoring.ts).
 */

export const companyScoreDefinitions = [
  {
    key: "company.solar_since_year",
    category: "company",
    section: "A empresa de solar",
    label: "Atuação no ramo solar",
    defaultEnabled: true,
    maxScore: 10,
    weight: 10,
    sourceSheet: "Avaliacao Empresas",
    sourceRow: 7,
    rubric: "Peso 10% · 1 ponto por ano de atuação (2016 ou antes = 10).",
  },
  {
    key: "company.founded_year",
    category: "company",
    section: "A empresa de solar",
    label: "Ano de abertura da empresa",
    defaultEnabled: true,
    maxScore: 10,
    weight: 4,
    sourceSheet: "Avaliacao Empresas",
    sourceRow: 8,
    rubric: "Peso 4% · 1 ponto por ano de existência (15+ anos = 10).",
  },
  {
    key: "company.crea_registration",
    category: "company",
    section: "A empresa de solar",
    label: "Registro CREA engenharia elétrica",
    defaultEnabled: true,
    maxScore: 10,
    weight: 9,
    sourceSheet: "Avaliacao Empresas",
    sourceRow: 9,
    rubric: "Peso 9% · Sim = 10, Não = 0.",
  },
  {
    key: "company.engineer_graduation_year",
    category: "company",
    section: "A empresa de solar",
    label: "Ano de colação de grau do engenheiro",
    defaultEnabled: true,
    maxScore: 10,
    weight: 9,
    sourceSheet: "Avaliacao Empresas",
    sourceRow: 10,
    rubric: "Peso 9% · 1 ponto por ano de formado (2016 ou antes = 10).",
  },
  {
    key: "company.installed_systems",
    category: "company",
    section: "A empresa de solar",
    label: "Quantidade de SFV instalado",
    defaultEnabled: true,
    maxScore: 10,
    weight: 10,
    sourceSheet: "Avaliacao Empresas",
    sourceRow: 11,
    rubric: "Peso 10% · 10-49=2, 50-100=4, 100-500=6, 500-1000=8, +1000=10.",
  },
  {
    key: "company.own_installation_team",
    category: "company",
    section: "A empresa de solar",
    label: "Instalações são feitas por funcionário próprio",
    defaultEnabled: true,
    maxScore: 10,
    weight: 10,
    sourceSheet: "Avaliacao Empresas",
    sourceRow: 12,
    rubric: "Peso 10% · Sim = 10, 'Sim mas duvido' = 7, Não = 4.",
  },
  {
    key: "company.installation_deadline",
    category: "company",
    section: "Comprometimento da empresa",
    label: "Prazo de instalação do sistema solar",
    defaultEnabled: true,
    maxScore: 10,
    weight: 5,
    sourceSheet: "Avaliacao Empresas",
    sourceRow: 14,
    rubric: "Peso 5% · Escala Francis 2026-06-12 (dias→nota): 45=10, 50=9, 55=8, 60=7, 65=6, 70=5, 75=4, 80=3, 40=2, 35=1, 30=0.",
  },
  {
    key: "company.execution_warranty",
    category: "company",
    section: "Comprometimento da empresa",
    label: "Garantia contra defeito de projeto e execução",
    defaultEnabled: true,
    maxScore: 10,
    weight: 15,
    sourceSheet: "Avaliacao Empresas",
    sourceRow: 15,
    rubric: "Peso 15% · 2 pontos por ano (5+ anos = 10).",
  },
  {
    key: "company.maintenance_support",
    category: "company",
    section: "Assistência técnica e manutenção",
    label: "Apresentou prova de manutenção e assistência",
    defaultEnabled: true,
    maxScore: 10,
    weight: 10,
    sourceSheet: "Avaliacao Empresas",
    sourceRow: 17,
    rubric: "Peso 10% · Sim = 10, 'Sim mas duvido' = 5, Não = 0.",
  },
  {
    key: "company.support_deadline",
    category: "company",
    section: "Assistência técnica e manutenção",
    label: "Prazo de assistência técnica",
    defaultEnabled: true,
    maxScore: 10,
    weight: 5,
    sourceSheet: "Avaliacao Empresas",
    sourceRow: 18,
    rubric: "Peso 5% · 1 dia = 10, cada dia a mais -1 (11+ dias = 0).",
  },
  {
    key: "company.technical_docs_delivered",
    category: "company",
    section: "Final da instalação",
    label: "Memorial descritivo e diagrama unifilar",
    defaultEnabled: true,
    maxScore: 10,
    weight: 5,
    sourceSheet: "Avaliacao Empresas",
    sourceRow: 20,
    rubric: "Peso 5% · Sim = 10, 'Sim mas duvido' = 5, Não = 0.",
  },
  {
    key: "company.seller_trust",
    category: "company",
    section: "Avaliacao do vendedor",
    label: "Competência e confiança com o vendedor",
    defaultEnabled: true,
    maxScore: 10,
    weight: 5,
    sourceSheet: "Avaliacao Empresas",
    sourceRow: 22,
    rubric: "Peso 5% · Subjetivo: 1 a 10 segundo a percepção do comprador.",
  },
  {
    key: "company.reclame_aqui",
    category: "company",
    section: "Avaliacao do vendedor",
    label: "Reclame Aqui: indicador de reputação dos últimos 12 meses",
    defaultEnabled: true,
    maxScore: 10,
    weight: 3,
    sourceSheet: "Avaliacao Empresas",
    sourceRow: 23,
    rubric: "Peso 3% · Ruim=2, Regular=4, Bom=6, Ótimo=8, RA 1000=10 (não recomendado/suspensa/em análise=0; sem reputação=—).",
  },
] satisfies ScoreDefinition[];

/**
 * TECNOLOGIA — apenas 10 critérios pontuam (PPTX slides 8/10: as linhas
 * marcadas "/" viraram INFORMATIVAS e saíram da pontuação; a seção de
 * Confiabilidade dos fabricantes foi eliminada por inteiro).
 *
 * PESOS DE TECNOLOGIA fecham 100% (Francis 2026-06-10; RA dos fabricantes
 * corrigido em 2026-06-12): Marca módulo 10, Marca inversor 10, Geração anual
 * 10, Sobrecarga DC/AC 10, Garantia eficiência módulo 10, Garantia defeito
 * módulo 10, Garantia defeito inversor 10, Reclame Aqui distribuidora 15, RA
 * fabricante módulo 10, RA fabricante inversor 5.
 */
export const technicalScoreDefinitions = [
  {
    key: "technical.annual_generation",
    category: "technical",
    section: "Estimativa de geração",
    label: "Geração anual proposta",
    defaultEnabled: true,
    maxScore: 10,
    weight: 10,
    sourceSheet: "Avaliacao Tecnologica",
    sourceRow: 10,
    rubric: "Peso 10% · (geração − consumo)/consumo: −5%=0, 0%=5, +5%=10.",
  },
  {
    key: "technical.module_brand",
    category: "technical",
    section: "Módulo fotovoltaico",
    label: "Módulo - marca",
    defaultEnabled: true,
    maxScore: 10,
    weight: 10,
    sourceSheet: "Avaliacao Tecnologica",
    sourceRow: 12,
    rubric: "Peso 10% · Grupo de marca: 5, 6, 8 ou 10 (não listada = 5).",
  },
  {
    key: "technical.module_defect_warranty",
    category: "technical",
    section: "Módulo fotovoltaico",
    label: "Módulo - garantia contra defeito",
    defaultEnabled: true,
    maxScore: 10,
    weight: 10,
    sourceSheet: "Avaliacao Tecnologica",
    sourceRow: 18,
    rubric: "Peso 10% · 10 anos=4, 12 anos=7, 15 anos=10.",
  },
  {
    key: "technical.module_efficiency_warranty",
    category: "technical",
    section: "Módulo fotovoltaico",
    label: "Módulo - garantia de eficiência",
    defaultEnabled: true,
    maxScore: 10,
    weight: 10,
    sourceSheet: "Avaliacao Tecnologica",
    sourceRow: 19,
    rubric: "Peso 10% · 25 anos=6, 30 anos=10.",
  },
  {
    key: "technical.inverter_brand",
    category: "technical",
    section: "Inversor de corrente",
    label: "Inversor - marca",
    defaultEnabled: true,
    maxScore: 10,
    weight: 10,
    sourceSheet: "Avaliacao Tecnologica",
    sourceRow: 21,
    rubric: "Peso 10% · Grupo de marca: 6, 7, 8 ou 9 (não listada = 6).",
  },
  {
    key: "technical.inverter_defect_warranty",
    category: "technical",
    section: "Inversor de corrente",
    label: "Inversor - garantia contra defeito",
    defaultEnabled: true,
    maxScore: 10,
    weight: 10,
    sourceSheet: "Avaliacao Tecnologica",
    sourceRow: 24,
    rubric: "Peso 10% · <5 anos=0, 5-7=5, 8-10=6, 11-14=8, 15-20=9.",
  },
  {
    key: "technical.inverter_oversizing",
    category: "technical",
    section: "Sobrecarga do inversor",
    label: "Sobrecarga DC/AC (kWp/kW)",
    defaultEnabled: true,
    maxScore: 10,
    weight: 10,
    sourceSheet: "Avaliacao Tecnologica",
    sourceRow: 26,
    rubric: "Peso 10% · Pico em 1,30-1,34=9 (1,25-1,29 e 1,35-1,39=8); sobe até o pico e desce; ≤1,0 e ≥1,60=0.",
  },
  {
    key: "technical.reputation_distributor",
    category: "technical",
    section: "Reclame Aqui",
    label: "Reputação da distribuidora",
    defaultEnabled: true,
    maxScore: 10,
    weight: 15,
    sourceSheet: "Avaliacao Tecnologica",
    sourceRow: 29,
    rubric: "Peso 15% · Ruim=2, Regular=4, Bom=6, Ótimo=8, RA 1000=10 (não recomendado/suspensa/em análise=0; sem reputação=—).",
  },
  {
    key: "technical.reputation_module_maker",
    category: "technical",
    section: "Reclame Aqui",
    label: "Reputação do fabricante do módulo",
    defaultEnabled: true,
    maxScore: 10,
    weight: 10,
    sourceSheet: "Avaliacao Tecnologica",
    sourceRow: 30,
    rubric: "Peso 10% · Ruim=2, Regular=4, Bom=6, Ótimo=8, RA 1000=10 (não recomendado/suspensa/em análise=0; sem reputação=—).",
  },
  {
    key: "technical.reputation_inverter_maker",
    category: "technical",
    section: "Reclame Aqui",
    label: "Reputação do fabricante do inversor",
    defaultEnabled: true,
    maxScore: 10,
    weight: 5,
    sourceSheet: "Avaliacao Tecnologica",
    sourceRow: 31,
    rubric: "Peso 5% · Ruim=2, Regular=4, Bom=6, Ótimo=8, RA 1000=10 (não recomendado/suspensa/em análise=0; sem reputação=—).",
  },
] satisfies ScoreDefinition[];

/**
 * Viabilidade Econômico-Financeira: INFORMATIVA, sem pontuação (PPTX 2026-06-09,
 * slides 4-5). Os números financeiros das propostas são facilmente manipuláveis
 * (geração/reajuste/simultaneidade inflados), então não entram no ranking. A aba
 * "Análise de Viabilidade Financeira" exibe os dados lado a lado, sem nota nem
 * linha de total. Mantido como lista vazia para o resto do código continuar
 * referenciando o grupo financeiro sem ramificações.
 */
export const financialScoreDefinitions: ScoreDefinition[] = [];

export const scoreDefinitions = [
  ...companyScoreDefinitions,
  ...technicalScoreDefinitions,
  ...financialScoreDefinitions,
] satisfies ScoreDefinition[];
