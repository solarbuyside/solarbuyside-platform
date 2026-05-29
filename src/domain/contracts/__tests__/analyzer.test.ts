import { describe, expect, it } from "vitest";

import { analyzeContract } from "../analyzer";

const COMPLETE = `
Contrato de fornecimento e instalação de sistema fotovoltaico.
A CONTRATADA oferece garantia de 12 anos para os módulos e 5 anos para a instalação.
O prazo de instalação é de 30 dias após a aprovação do projeto.
O engenheiro responsável técnico (CREA) emitirá a ART. Equipamentos com selo INMETRO.
Inclui assistência técnica e manutenção com atendimento em até 5 dias.
Pagamento: 30% de entrada, 40% na entrega dos equipamentos, 30% na conclusão.
`;

describe("analyzeContract", () => {
  it("aponta texto curto demais", () => {
    const r = analyzeContract("contrato");
    expect(r.verdict).toBe("attention");
    expect(r.findings[0].title).toMatch(/curto/i);
  });

  it("aprova um contrato completo e equilibrado", () => {
    const r = analyzeContract(COMPLETE);
    expect(r.verdict).toBe("approved");
    expect(r.summary.danger).toBe(0);
    expect(r.score).toBeGreaterThan(80);
  });

  it("reprova quando há cláusula de exclusão de garantia", () => {
    const r = analyzeContract(
      COMPLETE.replace("oferece garantia de 12 anos para os módulos e 5 anos para a instalação", "não oferece garantia"),
    );
    expect(r.verdict).toBe("reproved");
    expect(r.summary.danger).toBeGreaterThan(0);
  });

  it("detecta multa abusiva e pagamento antecipado", () => {
    const r = analyzeContract(
      COMPLETE + " Em caso de rescisão, multa de 50% do valor. Exige-se pagamento integral antecipado.",
    );
    const titles = r.findings.map((f) => f.title).join(" | ");
    expect(titles).toMatch(/multa/i);
    expect(titles).toMatch(/antecipado/i);
  });

  it("aponta ausência de prazo e responsável técnico", () => {
    const r = analyzeContract(
      "Este contrato cobre o fornecimento de placas solares com garantia de fábrica. Assistência inclusa. INMETRO ok.",
    );
    const titles = r.findings.map((f) => f.title).join(" | ");
    expect(titles).toMatch(/Prazo/i);
    expect(titles).toMatch(/CREA|t[eé]cnico/i);
  });
});
