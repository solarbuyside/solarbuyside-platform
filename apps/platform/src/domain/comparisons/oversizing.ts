/**
 * Sobrecarga do inversor = razão Potência do sistema (kWp) / Potência do
 * inversor (kW). É ESSA razão (ex.: 1,28; 0,80) que pontua (ver auto-scoring.ts)
 * e que deve aparecer na célula — NÃO a sobrecarga em % = (razão−1)×100.
 * (Verificação Francis 2026-06-12: o subtítulo é "Sobrecarga calculada (kWp/kW)"
 * e o valor é a razão, ex.: 6,43/8 = 0,80.)
 */

/** Razão = kWp / kW, ou null quando faltam dados / inversor 0. */
export function oversizingRatio(systemKwp: number | null, inverterKw: number | null): number | null {
  if (systemKwp == null || inverterKw == null || inverterKw <= 0) return null;
  return systemKwp / inverterKw;
}

/** Razão armazenada (arredondada a 3 casas, como o auto-cálculo persiste). */
export function oversizingStoredValue(ratio: number | null): number | null {
  return ratio == null ? null : Math.round(ratio * 1000) / 1000;
}

/** Texto exibido na célula: a razão com 2 casas, vírgula pt-BR (ex.: "0,80"). */
export function oversizingRatioLabel(ratio: number | null): string {
  if (ratio == null) return "—";
  return (Math.round(ratio * 100) / 100).toFixed(2).replace(".", ",");
}
