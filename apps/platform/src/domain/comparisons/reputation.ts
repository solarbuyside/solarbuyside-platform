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
 * Converte a categoria de reputação em nota 0-10 para o ranking (escala do PPTX
 * slides 6/10): Não recomendado=0, Ruim=2, Regular=4, Bom=6, Ótimo=8, RA 1000=10.
 *
 * "Reputação suspensa", "Em análise" e "Sem reputação definida" retornam null —
 * não pontuam e aparecem como "—" (slide 7): a empresa/distribuidora/fabricante
 * não recebe nota nenhuma, sem penalizar nem inflar o ranking.
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
      return 0;
    default:
      // suspensa, em_analise, sem_reputacao, null/undefined → sem nota (—)
      return null;
  }
}
