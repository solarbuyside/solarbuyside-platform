import { describe, expect, it } from "vitest";
import { formatarBrasilia, lerDataHoraBrasilia, statusPromocao } from "../promocao";

const T0 = Date.UTC(2026, 11, 2, 0, 0); // 01/12/2026 21:00 em Brasília
const H = 3_600_000;
const base = { startsAt: "01/12/2026 21:00", durationHours: "48", checkoutUrl: "https://greenn.com.br/x" };

describe("promoção de lançamento", () => {
  it("lê a data no horário de Brasília (igual à landing)", () => {
    expect(lerDataHoraBrasilia("01/12/2026 21:00")).toBe(T0);
    expect(lerDataHoraBrasilia("2026-12-01T21:00")).toBe(T0);
    expect(lerDataHoraBrasilia("1/12/2026 às 21h")).toBe(T0);
    expect(lerDataHoraBrasilia("amanhã")).toBeNull();
  });

  it("fases pela janela início + duração", () => {
    expect(statusPromocao(base, T0 - 1).fase).toBe("agendada");
    expect(statusPromocao(base, T0).fase).toBe("ativa");
    expect(statusPromocao(base, T0 + 48 * H - 1).fase).toBe("ativa");
    expect(statusPromocao(base, T0 + 48 * H).fase).toBe("encerrada");
  });

  it("sem data = desligada; data ilegível também, com motivo", () => {
    expect(statusPromocao({ ...base, startsAt: "" }, T0)).toEqual({ fase: "desligada", motivo: "semData" });
    expect(statusPromocao({ ...base, startsAt: "dia da live" }, T0)).toEqual({ fase: "desligada", motivo: "dataInvalida" });
  });

  it("acusa o link do checkout ausente", () => {
    const s = statusPromocao({ ...base, checkoutUrl: " " }, T0);
    expect(s.fase === "ativa" && s.semLink).toBe(true);
  });

  it("formata no horário de Brasília", () => {
    expect(formatarBrasilia(T0)).toBe("ter., 01/12 às 21:00");
    expect(formatarBrasilia(T0 + 48 * H)).toBe("qui., 03/12 às 21:00");
  });
});
