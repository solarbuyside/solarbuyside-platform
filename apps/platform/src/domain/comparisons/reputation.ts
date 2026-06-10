import { z } from "zod";

/**
 * Reputação (Reclame Aqui) da distribuidora e dos fabricantes de módulo/inversor.
 *
 * Substitui a antiga nota de 0 a 10 por categorias qualitativas (slide 12). Cada
 * categoria mapeia para uma pontuação 0-10 usada na Pontuação Técnica. As duas
 * categorias sem reputação consolidada ("em análise" / "sem reputação definida")
 * não pontuam (retornam null), para não penalizar nem inflar o ranking.
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
 * Converte a categoria de reputação em nota 0-10 para o ranking.
 * "em_analise" e "sem_reputacao" retornam null (não pontuam).
 */
export function reputationToScore(value: unknown): number | null {
  switch (value) {
    case "ra_1000":
      return 10;
    case "otimo":
      return 9;
    case "bom":
      return 7;
    case "regular":
      return 5;
    case "ruim":
      return 3;
    case "nao_recomendado":
      return 1;
    case "suspensa":
      return 1;
    default:
      // em_analise, sem_reputacao, null/undefined → sem nota
      return null;
  }
}
