/* Status da promoção de lançamento para o card do /admin/landing.

   A regra que liga e desliga a promoção roda na LANDING
   (apps/landing/src/v4/promocao-tempo.ts e live-tempo.ts). Os dois apps não
   compartilham código, então a leitura da data está replicada aqui. Se mudar
   lá, mude aqui: o teste deste arquivo fixa os mesmos casos. */

const BRASILIA_UTC = -3;

/** "01/12/2026 21:00" (ou ISO) no horário de Brasília → epoch ms. Inválido = null. */
export function lerDataHoraBrasilia(valor: string | undefined | null): number | null {
  const v = (valor ?? "").trim();
  if (!v) return null;
  let partes: number[] | null = null;
  const br = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s*(?:,|às|as|a)?\s*(\d{1,2})(?:\s*[:h]\s*(\d{2})?)?)?/i);
  if (br) {
    partes = [Number(br[3]), Number(br[2]), Number(br[1]), Number(br[4] ?? 0), Number(br[5] ?? 0)];
  } else {
    const iso = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2}))?/);
    if (iso) partes = [Number(iso[1]), Number(iso[2]), Number(iso[3]), Number(iso[4] ?? 0), Number(iso[5] ?? 0)];
  }
  if (!partes) return null;
  const [ano, mes, dia, hora, minuto] = partes;
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || hora > 23 || minuto > 59) return null;
  return Date.UTC(ano, mes - 1, dia, hora - BRASILIA_UTC, minuto);
}

export function lerHoras(valor: string | undefined | null): number {
  const n = Number(String(valor ?? "").replace(",", ".").replace(/[^\d.]/g, ""));
  return n > 0 && n <= 24 * 30 ? n : 48;
}

export type StatusPromocao =
  | { fase: "desligada"; motivo: "semData" | "dataInvalida" }
  | { fase: "agendada" | "ativa" | "encerrada"; inicio: number; fim: number; semLink: boolean };

export function statusPromocao(texts: Record<string, string> | undefined, agora: number): StatusPromocao {
  const bruto = texts?.startsAt?.trim() ?? "";
  if (!bruto) return { fase: "desligada", motivo: "semData" };
  const inicio = lerDataHoraBrasilia(bruto);
  if (inicio === null) return { fase: "desligada", motivo: "dataInvalida" };
  const fim = inicio + lerHoras(texts?.durationHours) * 3_600_000;
  const semLink = !texts?.checkoutUrl?.trim();
  const fase = agora < inicio ? "agendada" : agora < fim ? "ativa" : "encerrada";
  return { fase, inicio, fim, semLink };
}

/** "ter., 01/12 às 21:00" no horário de Brasília, seja qual for o fuso de quem lê. */
export function formatarBrasilia(ms: number): string {
  const d = new Date(ms + BRASILIA_UTC * 3_600_000);
  const dias = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dias[d.getUTCDay()]}, ${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)} às ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}
