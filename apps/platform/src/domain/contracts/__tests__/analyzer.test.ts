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

  it("reprova o contrato-gabarito cheio de cláusulas abusivas (CDC)", () => {
    const ABUSIVE = `
      As partes declaram aceitar de forma irrevogável, irretratável e incondicional.
      A CONTRATADA reserva-se o direito de alterar marca, modelo, potência e quantidade de
      módulos a seu exclusivo critério, sem aviso prévio. Qualquer menção verbal a economia
      tem caráter meramente publicitário e não integra este contrato.
      A CONTRATADA poderá reajustar o preço final inclusive após a assinatura.
      O CONTRATANTE renuncia expressamente ao direito de arrependimento previsto no art. 49 do CDC.
      Em caso de rescisão, multa de 90% do valor, com retenção integral dos valores pagos.
      A instalação ocorrerá em prazo a combinar, não havendo data limite de entrega.
      A garantia será automaticamente cancelada caso o contratante faça qualquer reclamação.
      O CONTRATANTE obriga-se a contratar exclusivamente da CONTRATADA, que poderá desativar
      remotamente o sistema. O CONTRATANTE cede à CONTRATADA todos os créditos de energia.
      Autoriza a emissão de nota promissória em branco e a inscrição imediata de seu nome em SPC.
      Fica vedado registrar reclamação no Procon, sob pena de multa de R$ 50.000,00 por publicação.
      Toda e qualquer responsabilidade é transferida ao CONTRATANTE.
      Este contrato renova-se automaticamente, com cobrança recorrente, sem necessidade de novo aceite.
      Fica eleito o foro da comarca da sede da CONTRATADA, renunciando o contratante ao foro de seu domicílio.
    `;
    const r = analyzeContract(ABUSIVE);
    expect(r.verdict).toBe("reproved");
    expect(r.summary.danger).toBeGreaterThanOrEqual(10);
    expect(r.score).toBe(0);

    const titles = r.findings.map((f) => f.title).join(" | ");
    expect(titles).toMatch(/arrependimento/i);
    expect(titles).toMatch(/cr[eé]ditos de energia/i);
    expect(titles).toMatch(/promiss[oó]ria|negativa/i);
    expect(titles).toMatch(/reclamar/i);
    expect(titles).toMatch(/renova/i);
  });
});
