/**
 * Curso "Fundamentos da Energia Solar" — conteúdo real, em PT-BR, escrito para
 * o comprador que vai usar a plataforma. Cada lição tem blocos de conteúdo
 * (parágrafos, listas, destaques) renderizados pelo leitor de aula.
 * É a fonte de verdade do curso; o progresso vive em `course_progress`.
 */

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "tip"; text: string };

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  blocks: ContentBlock[];
};

export type CourseModule = {
  id: string;
  title: string;
  description: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  lessons: Lesson[];
};

export const COURSE: CourseModule[] = [
  {
    id: "fundamentos",
    title: "Fundamentos da energia solar",
    description: "Como funciona um sistema fotovoltaico, seus componentes e o básico de geração.",
    level: "Iniciante",
    lessons: [
      {
        id: "fundamentos-1",
        title: "O que é energia solar fotovoltaica",
        minutes: 8,
        blocks: [
          {
            type: "p",
            text: "Energia solar fotovoltaica é a conversão direta da luz do sol em eletricidade. Diferente do aquecimento solar (que esquenta água), o sistema fotovoltaico gera energia elétrica que alimenta sua casa ou empresa e pode abater a conta de luz.",
          },
          {
            type: "h",
            text: "Como a geração acontece",
          },
          {
            type: "p",
            text: "Os módulos (placas) captam a radiação solar e produzem corrente contínua (CC). O inversor transforma essa corrente em corrente alternada (CA), que é o tipo de energia usada pelos seus equipamentos e pela rede elétrica.",
          },
          {
            type: "list",
            items: [
              "Sol incide sobre os módulos → gera corrente contínua",
              "Inversor converte para corrente alternada",
              "Energia abastece o consumo local",
              "O excedente é injetado na rede e vira crédito",
            ],
          },
          {
            type: "tip",
            text: "No Brasil, o sistema de compensação permite que a energia gerada a mais durante o dia vire crédito para usar à noite ou em meses de menor geração.",
          },
        ],
      },
      {
        id: "fundamentos-2",
        title: "Módulos, inversores e estruturas",
        minutes: 12,
        blocks: [
          { type: "h", text: "Os três componentes principais" },
          {
            type: "p",
            text: "Entender o papel de cada parte ajuda você a avaliar propostas com mais segurança e a perceber quando um orçamento corta custos em algo importante.",
          },
          {
            type: "list",
            items: [
              "Módulos fotovoltaicos: captam a luz. Marca, potência (W), eficiência e garantias variam muito entre fabricantes.",
              "Inversor: o cérebro do sistema. Converte a energia e monitora a geração. Sua qualidade afeta diretamente a confiabilidade.",
              "Estrutura de fixação: prende os módulos ao telhado. Precisa ser adequada ao tipo de telha e resistente à corrosão.",
            ],
          },
          {
            type: "tip",
            text: "Um inversor barato e desconhecido é um dos pontos onde mais se 'economiza' em propostas ruins — e onde mais aparecem problemas anos depois.",
          },
        ],
      },
      {
        id: "fundamentos-3",
        title: "Geração, consumo e compensação",
        minutes: 10,
        blocks: [
          {
            type: "p",
            text: "O objetivo de dimensionar bem um sistema é cobrir o seu consumo. Por isso a proposta deve partir do seu histórico de consumo (kWh/mês) na conta de luz.",
          },
          { type: "h", text: "O que olhar" },
          {
            type: "list",
            items: [
              "Geração mensal estimada: idealmente cobre 100% do seu consumo médio.",
              "Geração anual: confirma a cobertura ao longo das estações (verão gera mais que inverno).",
              "Fator de simultaneidade: o quanto você consome no mesmo momento em que gera.",
            ],
          },
          {
            type: "tip",
            text: "Desconfie de propostas que prometem geração muito acima da necessidade sem justificar — pode inflar o preço sem benefício real.",
          },
        ],
      },
    ],
  },
  {
    id: "empresa",
    title: "Avaliando a empresa instaladora",
    description: "O que separa uma empresa confiável: CREA, experiência, garantias e suporte.",
    level: "Iniciante",
    lessons: [
      {
        id: "empresa-1",
        title: "Registro CREA e responsável técnico",
        minutes: 7,
        blocks: [
          {
            type: "p",
            text: "Instalações fotovoltaicas exigem responsabilidade técnica de um engenheiro eletricista com registro no CREA. Isso protege você: garante que o projeto segue normas e que há um responsável legal pela obra.",
          },
          {
            type: "tip",
            text: "Peça o número do CREA e o nome do engenheiro responsável. A ausência disso é um sinal de alerta sério.",
          },
        ],
      },
      {
        id: "empresa-2",
        title: "Tempo de mercado e histórico",
        minutes: 9,
        blocks: [
          {
            type: "p",
            text: "Uma empresa com anos de atuação e muitos sistemas instalados tende a oferecer mais segurança no pós-venda. Garantias só valem se a empresa existir para honrá-las.",
          },
          {
            type: "list",
            items: [
              "Há quantos anos atua no ramo solar especificamente",
              "Quantos sistemas já instalou (histórico de execução)",
              "Se a instalação é feita por equipe própria ou terceirizada",
            ],
          },
        ],
      },
      {
        id: "empresa-3",
        title: "Garantias e assistência técnica",
        minutes: 11,
        blocks: [
          {
            type: "p",
            text: "Existem garantias diferentes, e é comum confundi-las. Saber distinguir evita surpresas.",
          },
          {
            type: "list",
            items: [
              "Garantia de projeto e execução: cobre falhas da instalação (idealmente 5 anos ou mais).",
              "Garantia de defeito do módulo: do fabricante, costuma ser 12+ anos.",
              "Garantia de eficiência do módulo: 25 a 30 anos de performance mínima.",
              "Garantia do inversor: 5 a 10+ anos, extensível em alguns casos.",
              "Prazo de assistência técnica: quanto tempo a empresa leva para atender um chamado.",
            ],
          },
          {
            type: "tip",
            text: "Uma assistência que leva semanas para responder pode significar meses sem geração — e prejuízo na conta de luz.",
          },
        ],
      },
    ],
  },
  {
    id: "tecnica",
    title: "Lendo a proposta técnica",
    description: "Potência, módulos, inversor, sobrecarga e eficiência sem cair em pegadinhas.",
    level: "Intermediário",
    lessons: [
      {
        id: "tecnica-1",
        title: "Potência, módulos e tiers de fabricante",
        minutes: 14,
        blocks: [
          {
            type: "p",
            text: "A potência do sistema (kWp) deve ser compatível com seu consumo. Já a qualidade dos módulos é classificada em 'tiers' (níveis) — fabricantes Tier 1 têm maior solidez financeira e confiabilidade.",
          },
          {
            type: "list",
            items: [
              "Potência do módulo (W): quanto maior, menos placas no telhado.",
              "Eficiência (%): quanto da luz vira energia — acima de 21% é ótimo.",
              "Marca/modelo: prefira modelos atuais de fabricantes reconhecidos.",
            ],
          },
        ],
      },
      {
        id: "tecnica-2",
        title: "Sobrecarga do inversor: a faixa ideal",
        minutes: 10,
        blocks: [
          {
            type: "p",
            text: "É comum (e saudável) instalar mais potência de módulos do que a potência do inversor — isso se chama sobrecarga (oversizing). A faixa ideal costuma ficar entre 1,25 e 1,35.",
          },
          {
            type: "tip",
            text: "Sobrecarga muito baixa desperdiça potencial; muito alta pode 'cortar' geração nos picos. Pergunte qual a relação kWp/kW da proposta.",
          },
        ],
      },
    ],
  },
  {
    id: "financeiro",
    title: "Viabilidade financeira",
    description: "Payback, ROI, inflação de energia e por que o menor preço engana.",
    level: "Intermediário",
    lessons: [
      {
        id: "financeiro-1",
        title: "Payback e retorno do capital",
        minutes: 13,
        blocks: [
          {
            type: "p",
            text: "Payback é o tempo até o sistema 'se pagar' com a economia gerada. Um payback saudável no Brasil costuma ficar entre 3 e 5 anos, mas depende da tarifa e do consumo.",
          },
          {
            type: "list",
            items: [
              "Economia mensal e anual no primeiro ano",
              "Economia acumulada em 25 anos",
              "Rentabilidade do capital (% ao ano) e ROI (multiplicação do investimento)",
            ],
          },
          {
            type: "tip",
            text: "A viabilidade financeira é informativa: ela depende de premissas que podem ser otimistas demais. Use-a como comparativo, não como único critério de decisão.",
          },
        ],
      },
      {
        id: "financeiro-2",
        title: "Por que o menor preço engana",
        minutes: 9,
        blocks: [
          {
            type: "p",
            text: "O orçamento mais barato pode usar equipamentos de menor qualidade, garantias mais curtas ou uma empresa frágil. O barato pode custar caro quando você precisa de assistência ou troca de peça.",
          },
          {
            type: "tip",
            text: "Compare preço junto com empresa e tecnologia — é exatamente isso que a plataforma te ajuda a fazer com a pontuação por critérios.",
          },
        ],
      },
    ],
  },
  {
    id: "decisao",
    title: "Decidindo entre finalistas",
    description: "Equilibrando empresa, tecnologia e preço para a melhor escolha.",
    level: "Avançado",
    lessons: [
      {
        id: "decisao-1",
        title: "Montando a matriz de comparação",
        minutes: 12,
        blocks: [
          {
            type: "p",
            text: "Com os dados das propostas preenchidos, a plataforma pontua cada fornecedor por critérios objetivos. Você ajusta pesos conforme o que importa para o seu caso e chega a uma nota geral comparável.",
          },
          {
            type: "list",
            items: [
              "Pontue empresa e tecnologia (a viabilidade financeira fica informativa)",
              "Ajuste pesos: dê mais peso ao que é prioridade para você",
              "Escolha exatamente dois finalistas para a negociação final",
            ],
          },
        ],
      },
      {
        id: "decisao-2",
        title: "Negociando com os dois finalistas",
        minutes: 14,
        blocks: [
          {
            type: "p",
            text: "Ter dois finalistas fortes te dá poder de negociação. Use os pontos fortes de um para negociar melhores condições com o outro — prazo, garantia estendida, ou desconto.",
          },
          {
            type: "tip",
            text: "Leve para a mesa os 'pontos de atenção' que a plataforma destacou: eles são argumentos concretos de negociação.",
          },
        ],
      },
    ],
  },
];

export const ALL_LESSONS = COURSE.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id })));
export const TOTAL_LESSONS = ALL_LESSONS.length;

export function findLesson(lessonId: string) {
  for (const mod of COURSE) {
    const idx = mod.lessons.findIndex((l) => l.id === lessonId);
    if (idx >= 0) {
      const lesson = mod.lessons[idx];
      const flatIndex = ALL_LESSONS.findIndex((l) => l.id === lessonId);
      const next = ALL_LESSONS[flatIndex + 1] ?? null;
      return { module: mod, lesson, next };
    }
  }
  return null;
}
