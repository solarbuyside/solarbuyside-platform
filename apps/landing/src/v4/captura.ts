/* Peças dos formulários de captura da LP (credenciamento Belenergy e inscrição
   na live). Moram fora do ModalV4.tsx porque arquivo de componente que também
   exporta funções e constantes quebra o fast refresh do Vite. */

/* ── Campos ─────────────────────────────────────────────────────────── */

export const ROTULO_CAMPO = 'v4-mono mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400'
export const CAMPO =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-slate-500 transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30'

/* Celular brasileiro enquanto se digita: (11) 98765-4321. Formatar no input
   evita o campo virar um amontoado de dígitos que ninguém confere antes de
   enviar, e o backend recebe só os dígitos de qualquer jeito. */
export function formatarCelular(bruto: string): string {
  const d = bruto.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export type CamposContato = { nome: string; email: string; celular: string }
export const CAMPOS_VAZIOS: CamposContato = { nome: '', email: '', celular: '' }

/** Origens aceitas pelo /api/ebook/lead (a lista fechada mora lá também). */
export type OrigemLead = 'belenergy-credenciamento' | 'live-lancamento'

/**
 * Grava o lead na base do teaser (`ebook_leads`), marcado com a origem.
 *
 * `keepalive`: quem preenche costuma sair da página logo depois (Belenergy,
 * grupo do WhatsApp), e sem isso o navegador cancelaria a requisição em voo.
 * O sucesso é otimista pelo mesmo motivo: ninguém espera a rede para receber o
 * próximo passo.
 */
export function enviarLead(campos: CamposContato, origem: OrigemLead): void {
  const nomeLimpo = campos.nome.trim()
  const payload = {
    // O endpoint guarda nome e sobrenome separados; o formulário pede "nome
    // completo" num campo só (pedido do Francis). Parte-se no primeiro espaço:
    // o que sobra vai para sobrenome, e quem não tem sobrenome manda vazio em
    // vez de travar o cadastro por causa de um campo que ele não pediu.
    nome: nomeLimpo.split(/\s+/)[0] || nomeLimpo,
    sobrenome: nomeLimpo.split(/\s+/).slice(1).join(' '),
    email: campos.email.trim(),
    celular: campos.celular.replace(/\D/g, ''),
    origem,
  }
  fetch('/api/ebook/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch((err) => console.error(`[${origem}] envio falhou:`, err))
}
