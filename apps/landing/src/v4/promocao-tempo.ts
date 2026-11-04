/* Contas da promoção de lançamento. Módulo PURO: sem React, para poder ser
   testado isolado. Quem usa importa de ./promocao. */

import { lerDataHoraBrasilia } from './live-tempo'

export type FasePromocao = 'desligada' | 'agendada' | 'ativa' | 'encerrada'

export type JanelaPromocao = { inicio: number; fim: number }

/** Duração em horas, do campo do admin. Inválido ou vazio = 48. Teto: 30 dias. */
export function lerHoras(valor: string | undefined | null): number {
  const n = Number(String(valor ?? '').replace(',', '.').replace(/[^\d.]/g, ''))
  return n > 0 && n <= 24 * 30 ? n : 48
}

/**
 * Janela da promoção a partir dos campos do admin. Sem data reconhecida não
 * há janela, e a promoção fica desligada: é assim que o Francis a desliga
 * (apaga a data e publica).
 */
export function janelaPromocao(inicio: string | undefined | null, horas: string | undefined | null): JanelaPromocao | null {
  const t0 = lerDataHoraBrasilia(inicio)
  if (t0 === null) return null
  return { inicio: t0, fim: t0 + lerHoras(horas) * 3_600_000 }
}

export function fasePromocao(agora: number, janela: JanelaPromocao | null): FasePromocao {
  if (!janela) return 'desligada'
  if (agora < janela.inicio) return 'agendada'
  if (agora < janela.fim) return 'ativa'
  return 'encerrada'
}

/**
 * Milissegundos até a próxima virada de fase (início ou fim), ou null se não
 * há mais virada. É o que o relógio da página espera, em vez de acordar a
 * cada segundo à toa.
 */
export function proximaVirada(agora: number, janela: JanelaPromocao | null): number | null {
  if (!janela) return null
  if (agora < janela.inicio) return janela.inicio - agora
  if (agora < janela.fim) return janela.fim - agora
  return null
}

/** Horas totais (podem passar de 24), minutos e segundos: o relógio do card é HH:MM:SS. */
export function relogioHMS(ms: number): { horas: number; minutos: number; segundos: number } {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    horas: Math.floor(total / 3600),
    minutos: Math.floor((total % 3600) / 60),
    segundos: total % 60,
  }
}
