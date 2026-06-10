/**
 * Índice detalhado e curado do Manual Solar Buy-Side.
 *
 * FONTE DE VERDADE do índice da plataforma. Transcrito do "Índice Interativo"
 * impresso no próprio manual (páginas 8–14 do PDF), e NÃO derivado dos bookmarks
 * do PDF — estes vêm bagunçados/duplicados e por isso o índice antigo (gerado por
 * heurística em flattenOutline/buildSections) não seguia a ordem dos tópicos.
 *
 * As páginas aqui são as páginas do PDF (1-based) e coincidem com a numeração
 * impressa do manual (conferido: PRELIMINARES=3, 1.0=22, 25.0=117, 26.0=122).
 *
 * Estrutura: Parte (Fase/Anexo) → Tópico (X.0, em negrito) → Subtópicos (X.Y).
 * Se o PDF for trocado e a paginação mudar, reconferir contra o índice impresso.
 */

export type ManualTocSubtopic = { n: string; title: string; page: number };
export type ManualTocTopic = {
  /** Número do tópico, ex.: "1.0". Vazio para itens preliminares sem numeração. */
  n: string;
  title: string;
  page: number;
  subtopics: ManualTocSubtopic[];
};
export type ManualTocPart = {
  /** Rótulo curto, ex.: "Fase 1", "Anexos". Ausente nas preliminares. */
  kicker?: string;
  title: string;
  /** Linha de descrição (usada nas fases). */
  subtitle?: string;
  page: number;
  topics: ManualTocTopic[];
};

const t = (n: string, title: string, page: number, subtopics: ManualTocSubtopic[] = []): ManualTocTopic => ({
  n,
  title,
  page,
  subtopics,
});
const s = (n: string, title: string, page: number): ManualTocSubtopic => ({ n, title, page });

export const MANUAL_TOC: ManualTocPart[] = [
  {
    title: "Preliminares",
    page: 2,
    topics: [
      t("", "Ficha técnica", 2),
      t("", "Informações preliminares", 3),
      t("", "Apresentação", 4),
      t("", "Cláusula de propriedade e confidencialidade", 5),
      t("", "Índice interativo", 7),
      t("", "O conceito Buy-Side", 15),
      t("", "Apoiadores institucionais", 17),
    ],
  },
  {
    kicker: "Fase 1",
    title: "Conhecimento",
    subtitle:
      "Compreenda seu consumo de energia e simule a potência para seu sistema solar fotovoltaico.",
    page: 21,
    topics: [
      t("1.0", "Analise seu consumo de energia e valor pago", 22, [
        s("1.1", "Identifique sua tarifa de energia", 22),
        s("1.2", "Calcule o consumo médio mensal", 22),
        s("1.3", "Deduza do seu consumo mensal a taxa de disponibilidade", 22),
        s("1.4", "Calcule o valor médio mensal pago", 23),
        s("1.5", "Identificando os dados na sua fatura de energia", 23),
      ]),
      t("2.0", "Entenda o essencial da geração solar fotovoltaica", 24, [
        s("2.1", "Módulos fotovoltaicos (painéis solares)", 24),
        s("2.2", "Inversor solar", 24),
        s("2.3", "Estrutura metálica de suporte", 25),
        s("2.4", "Medidor bidirecional (para sistemas conectados à rede)", 26),
        s("2.5", "Dispositivos de proteção", 26),
        s("2.6", "Cabos solares", 28),
        s("2.7", "Conectores solares", 28),
        s("2.8", "Qual é a eficiência dos telhados na geração de energia solar?", 29),
        s("2.9", "Perda de eficiência dos módulos fotovoltaicos por sombreamento", 30),
        s("2.10", "Como microinversores de potência minimizam a perda de geração solar devido ao sombreamento?", 31),
      ]),
      t("3.0", "Como definir a potência do seu sistema solar fotovoltaico", 32, [
        s("3.1", "Calcule a potência do sistema necessária para seu consumo de energia", 33),
        s("3.2", "Fatores que influenciam a potência do sistema fotovoltaico", 35),
        s("3.3", "Previsão futura da demanda elétrica", 37),
        s("3.4", "Simulação de consumo de energia dos futuros equipamentos", 38),
        s("3.5", "Simulação de consumo de energia para carro elétrico", 39),
      ]),
      t("4.0", "Sistema fotovoltaico híbrido com bateria: informações indispensáveis", 41, [
        s("4.1", "3 razões para armazenar energia solar em bateria", 41),
        s("4.2", "Que equipamentos podem ser alimentados por bateria e qual a autonomia?", 41),
        s("4.3", "Exemplos de autonomia por equipamento elétrico “prioritário” com uma bateria de 9,6 kWh", 41),
        s("4.4", "Gerenciamento da bateria", 42),
        s("4.5", "Ciclos de vida da bateria", 42),
        s("4.6", "Capacidade de armazenamento", 42),
        s("4.7", "Integração com a rede elétrica", 43),
        s("4.8", "Prazo de retorno (payback) em 2025", 43),
        s("4.9", "Qualificação do instalador de sistemas híbridos", 43),
        s("4.10", "Instalação e custo de inversor híbrido sem bateria", 43),
      ]),
      t("5.0", "Etapas da contratação até a ativação do seu sistema fotovoltaico", 44),
      t("6.0", "Segurança do seu imóvel e investimento sempre em primeiro lugar", 44, [
        s("6.1", "Avaliação da capacidade estrutural do seu telhado para suportar carga adicional", 45),
        s("6.2", "Riscos de estrutura elevada para suporte de módulo fotovoltaico", 45),
        s("6.3", "Conheça a velocidade dos ventos na sua região", 46),
        s("6.4", "Inspeção e manutenção preventiva dos sistemas solares", 47),
        s("6.5", "Sistemas solares exigem manutenção", 47),
      ]),
    ],
  },
  {
    kicker: "Fase 2",
    title: "Preparação",
    subtitle:
      "Organize-se para identificar e selecionar empresas de sistema solar fotovoltaico e aprenda como solicitar propostas comerciais.",
    page: 48,
    topics: [
      t("7.0", "Conheça o risco do prestador de serviços", 49, [
        s("7.1", "Páginas dedicadas à energia fotovoltaica que mostram diversos problemas", 50),
      ]),
      t("8.0", "Etapa 1: Identificação e seleção de até 10 empresas de energia solar", 51, [
        s("8.1", "Proximidade geográfica", 51),
        s("8.2", "Análise da presença online", 51),
        s("8.3", "Tempo de atuação no mercado", 51),
        s("8.4", "Verificação da sede e suas estruturas físicas", 51),
        s("8.5", "Avaliação de indicações de empresas de energia solar", 53),
        s("8.6", "Por que aplicar o processo de verificação Solar Buy-Side para empresas indicadas", 53),
        s("8.7", "Verificação do CNPJ", 53),
      ]),
      t("9.0", "Etapa 2: Eliminação das 4 empresas menos confiáveis", 54, [
        s("9.1", "Análise de reclamações no Reclame Aqui", 55),
        s("9.2", "Consulta ao Conselho Regional de Engenharia e Arquitetura — CREA", 55),
        s("9.3", "Consulta de comentários negativos nas páginas de redes sociais das empresas", 57),
      ]),
      t("10.0", "Etapa 3: Solicitação de 6 orçamentos de sistemas fotovoltaicos", 57, [
        s("10.1", "Compartilhe sua fatura de energia", 57),
        s("10.2", "Priorize empresas que realizam visitas comerciais presenciais", 57),
        s("10.3", "Solicite análise de viabilidade econômico-financeira detalhada", 57),
        s("10.4", "Entenda como interpretar o conceito de simultaneidade", 59),
      ]),
      t("11.0", "Datasheets dos equipamentos principais do sistema solar", 60, [
        s("11.1", "Veja como identificar as informações básicas de um modelo de módulo fotovoltaico", 60),
        s("11.2", "Veja como identificar as informações básicas de datasheet de um modelo de um inversor de corrente", 61),
      ]),
      t("12.0", "Etapa 4: Questionário para avaliar a confiabilidade das empresas", 62, [
        s("12.1", "Avalie a transparência dos vendedores", 63),
      ]),
      t("13.0", "Resumo das ações realizadas até o momento", 64, [
        s("13.1", "Próxima etapa: Fase 3", 64),
      ]),
    ],
  },
  {
    kicker: "Fase 3",
    title: "Análise",
    subtitle: "Avalie seis propostas e selecione as duas melhores.",
    page: 65,
    topics: [
      t("14.0", "Leilão reverso e a ilusão do menor preço: alerta para o comprador leigo", 66, [
        s("14.1", "Preço sempre deve ser o único item a considerar", 67),
        s("14.2", "Riscos de falha e descumprimento em energia solar", 68),
        s("14.3", "Desvendando o valor agregado: indo além do preço", 69),
        s("14.4", "Visível e invisível em propostas solares", 69),
        s("14.5", "Entendendo o valor agregado", 69),
        s("14.6", "Como avaliar a confiabilidade de uma proposta?", 70),
      ]),
      t("15.0", "Etapa 1: Identificação e coleta das informações das propostas", 70, [
        s("15.1", "Exemplo da proposta fictícia Renova", 71),
        s("15.2", "Quadro 1: dados e informações a serem preenchidos sobre a empresa de solar", 74),
        s("15.3", "Quadro 2: dados e informações a serem preenchidos sobre a proposta técnica", 75),
        s("15.4", "Sobrecarga do inversor de corrente", 76),
        s("15.5", "Observações sobre a confiabilidade de fabricantes e distribuidoras de equipamentos solares", 77),
        s("15.6", "Quadro 3: dados e informações da análise de viabilidade", 78),
      ]),
      t("16.0", "Etapa 2: Compilação comparativa dos dados", 79, [
        s("16.1", "Quadro 1: Avaliação comparativa da confiabilidade das empresas", 79),
        s("16.2", "Quadro 2: Avaliação da confiabilidade das propostas técnicas e das garantias", 80),
        s("16.3", "Quadro 3: Avaliação das propostas comerciais e suas viabilidades econômicas e financeiras", 80),
      ]),
      t("17.0", "Etapa 3: Avaliação do nível de confiança das propostas", 81, [
        s("17.1", "Resultado de pontuação das propostas de energia solar", 83),
        s("17.2", "O que está incluído nos preços dos finalistas?", 83),
        s("17.3", "Considerações sobre preços e riscos ocultos", 84),
        s("17.4", "Mas não há regra fixa — você precisará de discernimento", 84),
        s("17.5", "Escolha dois finalistas", 84),
      ]),
    ],
  },
  {
    kicker: "Fase 4",
    title: "Decisão final",
    subtitle:
      "Renegocie, escolha seu prestador de serviço, verifique o contrato de compra e venda, simule financiamentos e finalize a compra.",
    page: 85,
    topics: [
      t("18.0", "Etapa 1: Renegociação com as empresas finalistas", 86, [
        s("18.1", "Comunique a seleção para a rodada final", 86),
        s("18.2", "Peça o melhor preço", 86),
        s("18.3", "Exija a proposta contratual", 86),
        s("18.4", "Sugestão de diálogo de negociação", 87),
        s("18.5", "Receba as últimas propostas", 87),
      ]),
      t("19.0", "Etapa 2: Análise do contrato de compra e venda do sistema solar", 88, [
        s("19.1", "Visita técnica pré-contrato", 88),
        s("19.2", "Pontos cruciais a serem analisados", 88),
        s("19.3", "Identificação das partes", 88),
        s("19.4", "Descrição do sistema e escopo do fornecimento", 88),
        s("19.5", "Prazos de execução dos serviços", 90),
        s("19.6", "Valor e condições de pagamento", 90),
        s("19.7", "Responsabilidades", 90),
        s("19.8", "Cláusulas de rescisão", 90),
        s("19.9", "Subcontratação", 90),
        s("19.10", "Seguro de obra ou de engenharia", 90),
        s("19.11", "Homologação com a concessionária", 90),
        s("19.12", "Certificações e conformidades com as leis e normas vigentes", 90),
        s("19.13", "Multas e penalidades", 90),
        s("19.14", "Garantia de performance", 90),
        s("19.15", "Entrega de documentos pós-homologação", 92),
        s("19.16", "Disposições legais", 92),
        s("19.17", "Contratação de profissionais para trabalho em altura", 92),
        s("19.18", "Reforço estrutural do telhado", 93),
        s("19.19", "Dicas adicionais", 93),
      ]),
      t("20.0", "Etapa 3: Escolher a melhor proposta — algumas dicas finais", 94, [
        s("20.1", "Vamos revisar", 94),
        s("20.2", "Dicas", 95),
        s("20.3", "Sentimento de confiabilidade nos vendedores e nas empresas que eles representam", 95),
      ]),
      t("21.0", "Etapa 4: Simulação de financiamento", 96, [
        s("21.1", "O setor de financiamento para sistema solar", 96),
        s("21.2", "Nosso método de avaliação de financiamento", 97),
        s("21.3", "Simule financiamento nos bancos e fintech das suas escolhas", 97),
        s("21.4", "Preencha o quadro modelo de financiamento para cada banco", 98),
        s("21.5", "Preencha o quadro modelo comparativo com até 3 bancos", 99),
        s("21.6", "Dica importante", 99),
      ]),
      t("22.0", "Linha de chegada: uma carta para você", 100),
    ],
  },
  {
    kicker: "Anexos",
    title: "Fabricantes, equipamentos e distribuidoras",
    page: 101,
    topics: [
      t("23.0", "Distinção entre fabricantes confiáveis e marcas com histórico incerto", 103, [
        s("23.1", "Critérios de uma marca confiável", 104),
        s("23.2", "Sinais de uma marca menos confiável", 104),
        s("23.3", "Conheça a cadeia dos equipamentos e as responsabilidades dos atores da cadeia solar", 104),
        s("23.4", "Por que se atentar aos prazos de garantia dos equipamentos?", 106),
      ]),
      t("24.0", "Módulos fotovoltaicos", 107, [
        s("24.1", "Dica 1: As marcas maiores exportadoras em 2024", 108),
        s("24.2", "Dica 2: As marcas mais vendidas no Brasil em 2024", 109),
        s("24.3", "Dica 3: Maiores laboratórios internacionais de testes de módulo fotovoltaico", 110),
        s("24.4", "Classificação TIER 1: não certifica qualidade, somente solidez financeira", 112),
        s("24.5", "INMETRO: não certifica durabilidade", 112),
        s("24.6", "Dica 4: 10ª edição do PV Module Reliability Scorecard do laboratório PVEL", 113),
        s("24.7", "Dica 5: Conheça os avanços tecnológicos das fotovoltaicas dos últimos anos", 115),
        s("24.8", "Dicas para comparar tecnologia de célula fotovoltaicas", 116),
      ]),
      t("25.0", "Critérios técnicos para seleção de inversores", 117, [
        s("25.1", "Inversores de corrente STRING e microinversor", 120),
        s("25.2", "Marcas de inversor de corrente mais lembradas em 2024 pelas empresas de solar no Brasil", 121),
      ]),
      t("26.0", "Inversor de corrente híbrido (conectado a bateria)", 122, [
        s("26.1", "Dica: Marcas de inversores híbridos mais citadas pelos integradores solar", 122),
      ]),
      t("27.0", "Bateria solar no-break", 123, [
        s("27.1", "Dica: Marcas de baterias mais lembradas na visão do integrador solar", 123),
      ]),
      t("28.0", "Estruturas metálicas de suporte de módulos fotovoltaicos", 124, [
        s("28.1", "Dica: Marcas de estruturas metálicas mais lembradas na visão do integrador solar", 124),
      ]),
      t("29.0", "Elementos de proteção elétrico", 125, [
        s("29.1", "Dica: Marcas de elementos de proteção elétrica mais lembradas na visão do integrador solar", 125),
      ]),
      t("30.0", "Carregadores de veículos elétricos", 126, [
        s("30.1", "Dica: Marcas de carregadores de veículos elétricos mais lembradas na visão do integrador solar", 126),
      ]),
      t("31.0", "Reclame Aqui", 127, [
        s("31.1", "Dica: Leia as reclamações das empresas de solar no site Reclame Aqui", 127),
      ]),
      t("32.0", "As distribuidoras de equipamentos solares fotovoltaicos", 130, [
        s("32.1", "Dica: As marcas de distribuição de sistemas solares mais lembradas pelas empresas de solar", 130),
        s("32.2", "Avaliações das distribuidoras de equipamentos solares fotovoltaicos", 131),
      ]),
    ],
  },
  {
    kicker: "Anexos",
    title: "Manutenção preventiva e curativa",
    page: 134,
    topics: [
      t("33.0", "Limpeza dos módulos fotovoltaicos", 135, [
        s("33.1", "Por que módulos fotovoltaicos ficam sujos", 135),
        s("33.2", "4 boas razões para manter seus módulos fotovoltaicos limpos", 135),
        s("33.3", "Quando e como limpar módulos fotovoltaicos", 136),
        s("33.4", "Recomendações de limpeza", 136),
        s("33.5", "Recomendações para uma limpeza eficiente e segura em telhado", 137),
        s("33.6", "Como contratar profissionais para trabalho em altura", 138),
      ]),
      t("34.0", "Inspeção e manutenção preventiva dos sistemas solares", 138, [
        s("34.1", "O que é uma inspeção?", 138),
        s("34.2", "O que é uma manutenção preventiva?", 138),
        s("34.3", "Contrato de manutenção durante a garantia", 138),
        s("34.4", "Contrato de manutenção fora de garantia de instalação do sistema solar", 139),
        s("34.5", "Inspeção visual", 139),
        s("34.6", "Testes elétricos", 139),
        s("34.7", "Inspeção termográfica", 140),
        s("34.8", "Verificação do desempenho", 141),
        s("34.9", "Relatório e recomendações", 141),
        s("34.10", "Dicas", 141),
      ]),
    ],
  },
  {
    kicker: "Anexos",
    title: "Monitoramento de sistema fotovoltaico",
    page: 142,
    topics: [
      t("35.0", "Por que o monitoramento solar é importante?", 143, [
        s("35.1", "Funcionamento do monitoramento de energia solar", 143),
        s("35.2", "Monitoramento profissional de sistemas fotovoltaicos", 144),
      ]),
    ],
  },
  {
    kicker: "Anexos",
    title: "Seguro para sistemas fotovoltaicos",
    page: 145,
    topics: [
      t("36.0", "Entender o seguro de sistema fotovoltaico", 146, [
        s("36.1", "Benefícios do seguro", 147),
        s("36.2", "Quem pode contratar o seguro?", 147),
        s("36.3", "Principais coberturas", 147),
        s("36.4", "Quais critérios definem o valor de um seguro para sistema solar?", 147),
      ]),
      t("37.0", "Contratação de seguro", 148, [
        s("37.1", "Quando contratar o seguro?", 148),
        s("37.2", "Avaliação antes da contratação", 148),
        s("37.3", "Como contratar o seguro?", 148),
      ]),
    ],
  },
  {
    kicker: "Anexos",
    title: "Portais e apoiadores institucionais",
    page: 149,
    topics: [
      t("38.0", "Conectando você com o mundo da energia solar", 150, [
        s("38.1", "Sites essenciais", 150),
      ]),
      t("39.0", "Agradecimentos às empresas apoiadoras", 151, [
        s("39.1", "Conheça as empresas apoiadoras do Manual Solar Buy-Side", 152),
      ]),
    ],
  },
];

/** Quantidade de tópicos numerados (X.0) — usado no selo "N tópicos". */
export const MANUAL_TOPIC_COUNT = MANUAL_TOC.reduce(
  (acc, part) => acc + part.topics.filter((tp) => tp.n).length,
  0,
);

export type ManualSearchEntry = { title: string; page: number };

/**
 * Achata o índice curado em entradas pesquisáveis (tópicos + subtópicos), com o
 * número na frente do título (ex.: "25.1 Inversores de corrente STRING..."). É a
 * base da busca instantânea por capítulo no header — cobre todo o índice detalhado.
 */
export function flattenTocForSearch(): ManualSearchEntry[] {
  const out: ManualSearchEntry[] = [];
  for (const part of MANUAL_TOC) {
    for (const topic of part.topics) {
      const label = topic.n ? `${topic.n} ${topic.title}` : topic.title;
      out.push({ title: label, page: topic.page });
      for (const sub of topic.subtopics) {
        out.push({ title: `${sub.n} ${sub.title}`, page: sub.page });
      }
    }
  }
  return out;
}
