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

// Cláusulas/termos que costumam indicar risco em contratos de energia solar.
const DANGER_RULES: DangerRule[] = [
  {
    terms: ["sem garantia", "nao oferece garantia", "isento de garantia", "exime-se de qualquer garantia"],
    severity: "danger",
    title: "Possível exclusão de garantia",
    detail:
      "O contrato parece afastar ou limitar garantias. Garantias de equipamento, performance e instalação devem estar asseguradas por escrito.",
  },
  {
    terms: ["multa de 50", "multa de 40", "multa de 30", "multa equivalente a 50", "multa de 100"],
    severity: "danger",
    title: "Multa rescisória possivelmente abusiva",
    detail:
      "Há indício de multa de rescisão elevada. Multas acima de ~10-20% costumam ser questionáveis. Avalie com cuidado.",
  },
  {
    terms: ["nao se responsabiliza", "isenta-se de responsabilidade", "sem responsabilidade pela instalacao"],
    severity: "danger",
    title: "Cláusula de isenção de responsabilidade",
    detail:
      "A empresa tenta se isentar de responsabilidade pela instalação ou por danos. Isso reduz sua proteção em caso de problema.",
  },
  {
    terms: ["prazo indeterminado", "sem prazo definido", "a criterio exclusivo da contratada", "quando possivel"],
    severity: "warning",
    title: "Prazo de entrega/instalação indefinido",
    detail:
      "Não há prazo claro de instalação. Exija uma data ou prazo máximo em dias, com consequência em caso de atraso.",
  },
  {
    terms: ["reajuste a qualquer tempo", "preco sujeito a alteracao", "valores podem ser alterados", "reajuste sem aviso"],
    severity: "warning",
    title: "Preço sujeito a alteração unilateral",
    detail:
      "O contrato permite alterar o preço unilateralmente. O valor combinado deve ser fixo, salvo condições objetivas e previstas.",
  },
  {
    terms: ["pagamento integral antecipado", "100% antecipado", "pagamento total na assinatura", "quitacao antecipada total"],
    severity: "warning",
    title: "Pagamento 100% antecipado",
    detail:
      "Pagar tudo antes da entrega aumenta seu risco. O ideal é parcelar: entrada, entrega de equipamentos e conclusão da instalação.",
  },
  {
    terms: ["foro da comarca de"],
    severity: "info",
    title: "Foro de eleição",
    detail:
      "Há cláusula de foro. Verifique se o foro escolhido não é distante/inconveniente para você em caso de disputa.",
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
