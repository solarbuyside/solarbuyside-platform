import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyBRL(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

// Timezone fixo (BRT) para a formatação de datas dar o MESMO resultado no
// servidor (Vercel = UTC) e no cliente — evita erro de hidratação (React #418).
const BR_TZ = "America/Sao_Paulo";

/** Data curta (dd/mm/aaaa) com timezone fixo. */
export function formatDateBR(iso: string | number | Date) {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: BR_TZ });
}

/** Data + hora com timezone fixo. */
export function formatDateTimeBR(iso: string | number | Date) {
  return new Date(iso).toLocaleString("pt-BR", { timeZone: BR_TZ });
}
