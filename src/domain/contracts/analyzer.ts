/**
 * Analisador de contratos solares baseado em REGRAS (sem IA). Varre o texto do
 * contrato em busca de cláusulas/termos perigosos e de ausências críticas,
 * produzindo apontamentos com severidade. É lógica pura e determinística —
 * fácil de testar e de evoluir (uma IA pode ser plugada depois por cima).
 */

export type FindingSeverity = "danger" | "warning" | "info";

export type Finding = {
  severity: FindingSeverity;
  title: string;
  detail: string;
  /** Trecho do contrato que disparou o apontamento (quando aplicável). */
  excerpt?: string;
};

export type ContractVerdict = "reproved" | "attention" | "approved";

export type ContractAnalysis = {
  verdict: ContractVerdict;
  score: number; // 0-100 (quanto maior, melhor)
  findings: Finding[];
  summary: { danger: number; warning: number; info: number };
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // remove acentos para casar melhor
}

/** Pega um trecho ao redor da primeira ocorrência de um termo, para contexto. */
function excerptAround(rawText: string, normText: string, normTerm: string) {
  const idx = normText.indexOf(normTerm);
  if (idx < 0) return undefined;
  const start = Math.max(0, idx - 40);
  const end = Math.min(rawText.length, idx + normTerm.length + 60);
  return (start > 0 ? "…" : "") + rawText.slice(start, end).trim() + (end < rawText.length ? "…" : "");
}

type DangerRule = {
  terms: string[]; // já normalizados (sem acento, minúsculo)
  severity: FindingSeverity;
  title: string;
  detail: string;
};

// Cláusulas/termos que indicam risco em contratos de energia solar. Cada regra
// é um "aprendizado" — muitos baseados em abusos clássicos à luz do CDC.
const DANGER_RULES: DangerRule[] = [
  {
    terms: ["sem garantia", "nao oferece garantia", "isento de garantia", "exime-se de qualquer garantia", "sem qualquer garantia"],
    severity: "danger",
    title: "Exclusão de garantia",
    detail:
      "O contrato afasta ou limita garantias. Elas devem estar por escrito — e a garantia legal do CDC não pode ser simplesmente excluída.",
  },
  {
    terms: [
      "garantia sera automaticamente cancelada",
      "automaticamente cancelada",
      "anula a garantia",
      "faca qualquer reclamacao",
      "unica responsavel por avaliar se o defeito",
      "decisao irrecorrivel",
    ],
    severity: "danger",
    title: "Garantia que se anula sozinha / arbitrária",
    detail:
      "A garantia é cancelada por motivos abusivos (reclamar, atrasar, usar terceiro) ou a empresa decide sozinha o que cobre. Isso esvazia a garantia (CDC art. 51).",
  },
  {
    terms: [
      "renuncia expressamente ao direito de arrependimento",
      "renuncia ao direito de arrependimento",
      "direito de arrependimento",
      "nenhum valor pago sera devolvido em qualquer hipotese",
      "art. 49",
      "artigo 49",
    ],
    severity: "danger",
    title: "Renúncia ao direito de arrependimento (art. 49 CDC)",
    detail:
      "Em vendas fora do estabelecimento (casa, telefone, internet) o CDC garante 7 dias para desistir com devolução total. Esse direito é irrenunciável.",
  },
  {
    terms: [
      "multa de 90",
      "multa de 80",
      "multa de 70",
      "multa de 60",
      "multa de 50",
      "multa equivalente a 90",
      "multa de 100",
      "retencao integral dos valores",
      "retencao integral",
    ],
    severity: "danger",
    title: "Multa rescisória abusiva / retenção de valores",
    detail:
      "Multa de rescisão muito alta ou retenção integral do que foi pago é abusiva. Multas costumam ser limitadas a um percentual razoável.",
  },
  {
    terms: ["arbitrados unilateralmente", "a criterio exclusivo da contratada", "seu exclusivo criterio", "exclusivo criterio"],
    severity: "danger",
    title: "Decisões/valores a critério exclusivo da empresa",
    detail:
      "Cláusulas que dão poder unilateral à fornecedora (definir custos, multas, mudanças sozinha) são abusivas (CDC art. 51, IV e X).",
  },
  {
    terms: [
      "reajuste a qualquer tempo",
      "reajustar o preco",
      "preco sujeito a alteracao",
      "valores podem ser alterados",
      "reajuste sem aviso",
      "inclusive apos a assinatura",
      "reposicionamento de mercado",
    ],
    severity: "danger",
    title: "Reajuste unilateral de preço",
    detail:
      "Permite mudar o preço a qualquer tempo, até depois de assinado. O valor combinado deve ser fixo; reajuste unilateral pós-assinatura é abusivo.",
  },
  {
    terms: ["cancelados retroativamente", "desconto cancelado", "descontos prometidos serao cancelados"],
    severity: "warning",
    title: "Desconto cancelado retroativamente",
    detail:
      "Perder o desconto retroativo por um dia de atraso é desproporcional. Penalidades devem ser proporcionais.",
  },
  {
    terms: [
      "prazo a combinar",
      "prazo indeterminado",
      "sem prazo definido",
      "nao havendo data limite",
      "sem data limite",
      "sem responsabilidade por atraso",
      "quando possivel",
    ],
    severity: "danger",
    title: "Sem prazo de entrega / sem responsabilidade por atraso",
    detail:
      "Sem data limite de instalação nem consequência por atraso. Exija prazo máximo em dias e penalidade/devolução por descumprimento.",
  },
  {
    terms: ["quitar as parcelas mesmo antes", "obrigado a pagar mesmo antes", "mesmo antes de o sistema entrar em funcionamento"],
    severity: "warning",
    title: "Pagar antes de o sistema funcionar",
    detail:
      "Você é obrigado a pagar mesmo sem o sistema funcionar. O pagamento deve seguir marcos (entrega, instalação, funcionamento).",
  },
  {
    terms: ["pagamento integral antecipado", "100% antecipado", "pagamento total na assinatura", "quitacao antecipada total"],
    severity: "warning",
    title: "Pagamento 100% antecipado",
    detail:
      "Pagar tudo antes da entrega aumenta seu risco. O ideal é parcelar: entrada, entrega de equipamentos e conclusão.",
  },
  {
    terms: ["exclusivamente da contratada", "manutencao exclusiva", "desativar remotamente", "desativacao remota"],
    severity: "danger",
    title: "Manutenção exclusiva obrigatória / desligamento remoto",
    detail:
      "Obrigar a contratar manutenção só com a empresa (sob pena de perder garantia) ou desligar seu sistema remotamente é venda casada e abuso (CDC art. 39, I).",
  },
  {
    terms: [
      "cede a contratada todos os creditos",
      "cede os creditos de energia",
      "cessao dos creditos",
      "creditos de energia injetados na rede durante",
      "economia eventualmente obtida pertence a contratada",
      "participacao em performance",
    ],
    severity: "danger",
    title: "Cessão dos créditos de energia",
    detail:
      "O contrato transfere para a empresa os créditos de energia que você gera (a sua economia!). Isso descaracteriza o negócio — você investe e a economia vai para a empresa.",
  },
  {
    terms: [
      "nota promissoria em branco",
      "aval em branco",
      "confissao de divida",
      "titulo executivo extrajudicial",
      "inscricao imediata de seu nome em spc",
      "spc/serasa sem notificacao",
      "sem notificacao previa",
      "protesto a criterio da contratada",
      "ainda que a divida esteja em discussao",
    ],
    severity: "danger",
    title: "Confissão de dívida / promissória em branco / negativação",
    detail:
      "Promissória em branco, confissão de dívida e negativação no SPC/Serasa sem aviso (mesmo com a dívida discutida) é gravíssimo — te deixa refém de cobranças indevidas.",
  },
  {
    terms: [
      "nao divulgar qualquer informacao negativa",
      "vedado registrar reclamacao",
      "proibido reclamar",
      "multa de r$ 50.000",
      "antes de decorridos 180 dias",
      "por publicacao",
    ],
    severity: "danger",
    title: "Proibição de reclamar (Procon, Reclame Aqui, Justiça)",
    detail:
      "Impedir você de reclamar em órgãos de defesa ou na Justiça, ou multar por falar mal, é flagrantemente abusivo e inconstitucional (acesso à justiça).",
  },
  {
    terms: [
      "nao se responsabiliza",
      "isenta-se de responsabilidade",
      "sem responsabilidade pela instalacao",
      "responsabilidade e transferida ao contratante",
      "transferida ao contratante",
      "ainda que decorrentes de instalacao inadequada",
    ],
    severity: "danger",
    title: "Transferência total de responsabilidade",
    detail:
      "A empresa tenta se isentar de danos (telhado, incêndio, choque, queda de geração) mesmo causados por ela. O fornecedor responde por defeitos do serviço (CDC art. 14).",
  },
  {
    terms: [
      "renovam-se automaticamente",
      "renovacao automatica",
      "cobranca recorrente",
      "sem necessidade de novo aceite",
      "carta com firma reconhecida",
      "antecedencia minima de 12 meses",
    ],
    severity: "danger",
    title: "Renovação/cobrança automáticas + cancelamento difícil",
    detail:
      "Renovação automática com cobrança recorrente e cancelamento burocrático (carta com firma, 12 meses de aviso) é obstáculo abusivo para você sair (CDC art. 51).",
  },
  {
    terms: [
      "foro da comarca",
      "foro distante",
      "renunciando o contratante ao foro de seu domicilio",
      "renuncia ao foro",
      "localizado a mais de",
    ],
    severity: "warning",
    title: "Foro distante / renúncia ao foro do domicílio",
    detail:
      "Foro longe do seu domicílio (e renúncia ao seu) dificulta a defesa. No CDC, o consumidor pode processar no próprio domicílio.",
  },
  {
    terms: [
      "carater meramente publicitario",
      "nao integra este contrato",
      "mencao verbal",
      "nao gerando qualquer obrigacao",
      "publicidade nao vincula",
    ],
    severity: "warning",
    title: "Publicidade não vincula / promessas verbais sem valor",
    detail:
      "O contrato diz que promessas do vendedor ('economia de 95%', 'conta zerada') não valem. Pelo CDC, a publicidade VINCULA o fornecedor (art. 30). Exija por escrito.",
  },
  {
    terms: [
      "alterar marca, modelo, potencia",
      "reservando-se o direito de alterar",
      "alterar marca",
      "sem anuencia do contratante",
      "sem aviso previo",
    ],
    severity: "warning",
    title: "Alteração unilateral do equipamento",
    detail:
      "A empresa pode trocar marca, modelo e potência sem avisar. Você pode receber algo inferior. Os equipamentos devem estar especificados e fixos.",
  },
  {
    terms: ["irrevogavel, irretratavel e incondicional", "irrevogavel e irretratavel"],
    severity: "info",
    title: "Aceite 'irrevogável e incondicional'",
    detail:
      "Esses termos costumam acompanhar cláusulas que tiram seus direitos. Leia o restante com atenção redobrada.",
  },
];

// Itens que DEVEM constar no contrato — a ausência é apontada.
const REQUIRED_CLAUSES: Array<{ terms: string[]; severity: FindingSeverity; title: string; detail: string }> = [
  {
    terms: ["garantia"],
    severity: "danger",
    title: "Garantia não mencionada",
    detail: "Não encontramos menção a garantia. O contrato deve detalhar garantias de equipamento, performance e instalação.",
  },
  {
    terms: ["prazo", "dias", "data de entrega", "cronograma"],
    severity: "warning",
    title: "Prazo de instalação não claro",
    detail: "Não encontramos um prazo de instalação claro. Exija data ou prazo máximo em dias.",
  },
  {
    terms: ["crea", "art", "engenheiro", "responsavel tecnico"],
    severity: "warning",
    title: "Responsável técnico (CREA/ART) ausente",
    detail: "Não há menção a engenheiro responsável, CREA ou ART. A responsabilidade técnica deve constar.",
  },
  {
    terms: ["inmetro", "certificacao", "homologacao"],
    severity: "info",
    title: "Certificação/INMETRO não citada",
    detail: "Sem menção a INMETRO/homologação. Confirme que os equipamentos são certificados e o sistema será homologado.",
  },
  {
    terms: ["assistencia", "manutencao", "pos-venda", "suporte"],
    severity: "warning",
    title: "Assistência/pós-venda não detalhada",
    detail: "Não encontramos cláusula de assistência técnica/pós-venda. Verifique prazos de atendimento.",
  },
];

export function analyzeContract(rawText: string): ContractAnalysis {
  const text = rawText ?? "";
  const norm = normalize(text);
  const findings: Finding[] = [];

  if (text.trim().length < 80) {
    return {
      verdict: "attention",
      score: 0,
      findings: [
        {
          severity: "warning",
          title: "Texto muito curto para análise",
          detail: "Cole o texto completo do contrato para uma análise útil (mínimo recomendado: algumas cláusulas).",
        },
      ],
      summary: { danger: 0, warning: 1, info: 0 },
    };
  }

  // 1) Termos/cláusulas perigosas presentes
  for (const rule of DANGER_RULES) {
    const hit = rule.terms.find((t) => norm.includes(t));
    if (hit) {
      findings.push({
        severity: rule.severity,
        title: rule.title,
        detail: rule.detail,
        excerpt: excerptAround(text, norm, hit),
      });
    }
  }

  // 2) Cláusulas obrigatórias ausentes
  for (const req of REQUIRED_CLAUSES) {
    const present = req.terms.some((t) => norm.includes(t));
    if (!present) {
      findings.push({ severity: req.severity, title: req.title, detail: req.detail });
    }
  }

  const summary = {
    danger: findings.filter((f) => f.severity === "danger").length,
    warning: findings.filter((f) => f.severity === "warning").length,
    info: findings.filter((f) => f.severity === "info").length,
  };

  // Pontuação: começa em 100 e desconta por severidade.
  const score = Math.max(0, 100 - summary.danger * 25 - summary.warning * 10 - summary.info * 3);

  const verdict: ContractVerdict =
    summary.danger > 0 ? "reproved" : summary.warning > 0 ? "attention" : "approved";

  // Reforço positivo quando aprovado sem ressalvas.
  if (findings.length === 0) {
    findings.push({
      severity: "info",
      title: "Nenhum ponto crítico encontrado",
      detail:
        "A varredura por regras não encontrou cláusulas de risco nem ausências críticas. Ainda assim, leia o contrato com atenção antes de assinar.",
    });
  }

  return { verdict, score, findings, summary };
}
