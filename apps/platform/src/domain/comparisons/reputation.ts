import { z } from "zod";

/**
 * Reputação (Reclame Aqui) da distribuidora e dos fabricantes de módulo/inversor.
 *
 * Substitui a antiga nota de 0 a 10 por categorias qualitativas (slide 12). Cada
 * categoria mapeia para uma pontuação 0-10 usada na Pontuação Técnica. Apenas
 * "sem reputação definida" não pontua (retorna null) — "reputação suspensa" e
 * "em análise" valem 0 (penalizam), conforme a verificação do Francis 2026-06-12.
 */

export const reputationRatingSchema = z.enum([
  "ra_1000",
  "otimo",
  "bom",
  "regular",
  "ruim",
  "nao_recomendado",
  "suspensa",
  "em_analise",
  "sem_reputacao",
]);

export type ReputationRating = z.infer<typeof reputationRatingSchema>;

/** Opções na ordem exibida (melhor → pior → sem dado), com rótulo legível. */
export const REPUTATION_OPTIONS: { value: ReputationRating; label: string }[] = [
  { value: "ra_1000", label: "RA 1000" },
  { value: "otimo", label: "Ótimo" },
  { value: "bom", label: "Bom" },
  { value: "regular", label: "Regular" },
  { value: "ruim", label: "Ruim" },
  { value: "nao_recomendado", label: "Não recomendado" },
  { value: "suspensa", label: "Reputação suspensa" },
  { value: "em_analise", label: "Em análise" },
  { value: "sem_reputacao", label: "Sem reputação definida" },
];

/** Rótulo legível a partir do valor armazenado. */
export const REPUTATION_LABEL: Record<string, string> = Object.fromEntries(
  REPUTATION_OPTIONS.map((o) => [o.value, o.label]),
);

/**
 * Converte a categoria de reputação em nota 0-10 para o ranking (escala do PPTX
 * slides 6/10 + verificação Francis 2026-06-12): RA 1000=10, Ótimo=8, Bom=6,
 * Regular=4, Ruim=2, e Não recomendado / Reputação suspensa / Em análise = 0.
 *
 * Só "Sem reputação definida" (e ausência de dado) retorna null — aparece como
 * "—" (slide 7) e fica fora do numerador E do denominador, sem penalizar nem
 * inflar o índice, que renormaliza sobre os critérios efetivamente pontuados.
 */
export function reputationToScore(value: unknown): number | null {
  switch (value) {
    case "ra_1000":
      return 10;
    case "otimo":
      return 8;
    case "bom":
      return 6;
    case "regular":
      return 4;
    case "ruim":
      return 2;
    case "nao_recomendado":
    case "suspensa":
    case "em_analise":
      // Sem confiança consolidada / reputação ruim → 0 (penaliza). Francis,
      // verificação 2026-06-12: suspensa e em análise pontuam 0, não "—".
      return 0;
    default:
      // "sem_reputacao" e null/undefined → sem nota (—).
      return null;
  }
}
