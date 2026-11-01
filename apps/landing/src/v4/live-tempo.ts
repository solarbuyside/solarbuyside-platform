/* Contas do bloco da live (pré-lançamento). Módulo PURO: sem React, sem
   imports, para poder ser testado isolado. Quem usa importa de
   ./prelancamento. */

/* ── Data da live ────────────────────────────────────────────────────────

   O campo do admin é texto livre para quem não é técnico. Aceita o formato
   brasileiro ("01/12/2026 20:00", "1/12/2026 às 20h") e o ISO
   ("2026-12-01T20:00"). O horário é SEMPRE o de Brasília: UTC-3 fixo, porque o
   Brasil não tem horário de verão desde 2019. Ler no fuso do navegador faria
   um visitante de Manaus ou de Lisboa ver uma contagem errada. */

const BRASILIA_UTC = -3

export function lerDataHoraBrasilia(valor: string | undefined | null): number | null {
  const v = (valor ?? '').trim()
  if (!v) return null

  let partes: number[] | null = null
  const br = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s*(?:,|às|as|a)?\s*(\d{1,2})(?:\s*[:h]\s*(\d{2})?)?)?/i)
  if (br) {
    partes = [Number(br[3]), Number(br[2]), Number(br[1]), Number(br[4] ?? 0), Number(br[5] ?? 0)]
  } else {
    const iso = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2}))?/)
    if (iso) partes = [Number(iso[1]), Number(iso[2]), Number(iso[3]), Number(iso[4] ?? 0), Number(iso[5] ?? 0)]
  }
  if (!partes) return null

  const [ano, mes, dia, hora, minuto] = partes
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || hora > 23 || minuto > 59) return null
  // Date.UTC normaliza o estouro (20h + 3 = 23h; 22h + 3 = 1h do dia seguinte).
  return Date.UTC(ano, mes - 1, dia, hora - BRASILIA_UTC, minuto)
}

export type FaseLive = 'antes' | 'aoVivo' | 'depois'

/** Antes do início, durante (início + duração) e depois. */
export function faseDaLive(agora: number, inicio: number, duracaoMin: number): FaseLive {
  if (agora < inicio) return 'antes'
  if (agora < inicio + duracaoMin * 60_000) return 'aoVivo'
  return 'depois'
}

export type Restante = { dias: number; horas: number; minutos: number; segundos: number }

export function tempoRestante(ms: number): Restante {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    dias: Math.floor(total / 86_400),
    horas: Math.floor((total % 86_400) / 3600),
    minutos: Math.floor((total % 3600) / 60),
    segundos: total % 60,
  }
}

/** Duração estimada em minutos, do campo do admin. Inválido ou vazio = 150. */
export function lerDuracao(valor: string | undefined | null): number {
  const n = Number(String(valor ?? '').replace(/\D/g, ''))
  return n > 0 && n < 24 * 60 ? n : 150
}

/** Iniciais para o avatar sem foto: primeira letra do primeiro e do último nome. */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return ''
  const primeira = partes[0][0] ?? ''
  const ultima = partes.length > 1 ? (partes[partes.length - 1][0] ?? '') : ''
  return `${primeira}${ultima}`.toUpperCase()
}
