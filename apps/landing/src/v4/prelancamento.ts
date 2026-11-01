import { useContent } from '../contexts/ContentContext'
import { criarTxt } from './cms'

/* MODO PRÉ-LANÇAMENTO (Francis, 29/10/2026: "Alteração da Landing Page para o
   período pré-lançamento").

   Nos ~15 dias antes da live de lançamento a LP para de vender e passa a
   divulgar a live. Depois da live, a página de vendas volta inteira.

   Ele pediu "uma cópia da LP original" para o período. Fazer a cópia de
   verdade seria manter duas páginas que divergem a cada edição, e na noite da
   live alguém teria que trocar uma pela outra às pressas. Em vez disso há UM
   interruptor, a configuração global `modoPagina` (admin > "Modo da página"):

   - "prelancamento": os blocos comerciais saem e o bloco da live entra no
     lugar do card de preço;
   - qualquer outro valor, inclusive ausente: a página de vendas, exatamente
     como está.

   O conteúdo de vendas não é tocado: os textos do período moram numa seção
   própria do banco (`lancamento`), não por cima dos de vendas. Voltar é trocar
   o modo e Publicar, sem redigitar nada. É a "cópia" que ele pediu, sem o
   custo de manter duas.

   O modo chega pelo mesmo caminho das outras configurações globais e é
   embutido no HTML pelo prerender (window.__SBS_CONTENT__.settings). Por isso
   o primeiro render do visitante já sai no modo certo, sem piscar a página de
   vendas antes. */

export type ModoPagina = 'vendas' | 'prelancamento'

/** Seção do banco com os textos do período (landing_sections.section_id). */
export const SECAO_LIVE = 'lancamento'
/** Âncora do bloco da live. Todos os CTAs de conversão apontam para cá no período. */
export const ID_LIVE = 'lancamento'

export function lerModo(valor: string | undefined | null): ModoPagina {
  return valor?.trim().toLowerCase() === 'prelancamento' ? 'prelancamento' : 'vendas'
}

/**
 * Estado do período para quem desenha CTA ou esconde bloco.
 *
 * `ancora` é para onde todo botão de conversão aponta: `#oferta` em vendas,
 * `#lancamento` no período. `live` lê os textos da seção `lancamento`, onde
 * moram também os rótulos que os botões ganham no período.
 */
export function usePreLancamento() {
  const { globalSettings, getSection } = useContent()
  const preLancamento = lerModo(globalSettings.modoPagina) === 'prelancamento'
  return {
    preLancamento,
    ancora: preLancamento ? `#${ID_LIVE}` : '#oferta',
    live: criarTxt(getSection(SECAO_LIVE)),
  }
}

// As contas da contagem moram num módulo puro (sem React), testável à parte.
export { faseDaLive, iniciais, lerDataHoraBrasilia, lerDuracao, tempoRestante } from './live-tempo'
export type { FaseLive, Restante } from './live-tempo'
