import { useEffect, useState } from 'react'
import { useContent } from '../contexts/ContentContext'
import { capturaDoBuild } from './ambiente'
import { criarTxt } from './cms'
import { usePreLancamento } from './prelancamento'
import { fasePromocao, janelaPromocao, lerHoras, proximaVirada, type FasePromocao } from './promocao-tempo'

/* PROMOÇÃO DE LANÇAMENTO (Francis, 03/11/2026: "Promoção de lançamento 48
   horas").

   Nas primeiras 48 horas depois da live o card de preço vira a oferta de
   lançamento (25% OFF, contagem regressiva). Ao fim delas a página tem que
   voltar ao R$ 797,00 e aos textos de sempre "sem precisar refazer a página".

   Como no pré-lançamento, nada aqui escreve por cima dos campos de vendas: os
   textos da promoção moram numa seção própria do banco (`promocao`). E, ao
   contrário do pré-lançamento, ninguém precisa apertar botão na hora: a
   promoção liga e desliga SOZINHA pelo relógio, entre a data de início do
   admin e início + duração (horário de Brasília). Desligar antes da hora é
   apagar a data e Publicar.

   O HTML CONGELADO. A LP é pré-renderizada no build e hidratada, e o build
   não sabe a que horas a pessoa vai abrir a página. Por isso o primeiro
   render é SEMPRE o card de vendas (é ele que sai no HTML, para Google e IAs
   também), e a fase de verdade só entra no efeito, já no navegador do
   visitante. O card fica bem abaixo da dobra: a troca acontece antes de
   alguém rolar até ele. No build (`capturaDoBuild`) o relógio nem começa. */

/** Seção do banco com os textos da promoção (landing_sections.section_id). */
export const SECAO_PROMOCAO = 'promocao'

/* setTimeout estoura acima de ~24,8 dias (2^31 ms) e dispara na hora. A
   espera é cortada em 1 dia e o efeito reagenda. */
const ESPERA_MAX = 86_400_000

/**
 * Estado da promoção. `ativa` só é verdadeira no navegador de um visitante,
 * dentro da janela, com a página em modo de vendas.
 */
export function usePromocao() {
  const { getSection, globalSettings } = useContent()
  const { preLancamento } = usePreLancamento()
  const txt = criarTxt(getSection(SECAO_PROMOCAO))
  const inicioCampo = txt('startsAt')
  const horasCampo = txt('durationHours', '48')
  const janela = janelaPromocao(inicioCampo, horasCampo)
  const inicio = janela?.inicio ?? null
  const fim = janela?.fim ?? null

  const [fase, setFase] = useState<FasePromocao | null>(null)
  const [fimPrevia, setFimPrevia] = useState<number | null>(null)

  useEffect(() => {
    if (capturaDoBuild()) return
    /* PRÉVIA: `?promocao=previa` mostra o card como se a promoção estivesse
       no ar agora, com o relógio cheio. É como o Francis confere a página
       antes da live. O botão leva ao checkout da promoção se ele já existir;
       senão, ao checkout normal (a prévia não vende nada que a página
       normal não venda). */
    if (new URLSearchParams(window.location.search).get('promocao') === 'previa') {
      const t = window.setTimeout(() => {
        setFimPrevia(Date.now() + lerHoras(horasCampo) * 3_600_000)
        setFase('ativa')
      }, 0)
      return () => window.clearTimeout(t)
    }
    const j = inicio !== null && fim !== null ? { inicio, fim } : null
    let timer: number | undefined
    const atualizar = () => {
      const agora = Date.now()
      setFase(fasePromocao(agora, j))
      const espera = proximaVirada(agora, j)
      // +250 ms: acorda já do outro lado da virada, não 1 ms antes dela.
      if (espera !== null) timer = window.setTimeout(atualizar, Math.min(espera + 250, ESPERA_MAX))
    }
    atualizar()
    return () => window.clearTimeout(timer)
  }, [inicio, fim, horasCampo])

  /* Sem o link do checkout com desconto a promoção NÃO entra: a página
     anunciaria R$ 597,75 e o botão levaria ao checkout de R$ 797,00. O admin
     avisa quando o link falta (card "Promoção de lançamento"). */
  const linkPromo = txt('checkoutUrl')
  const previa = fimPrevia !== null
  const ativa = !preLancamento && fase === 'ativa' && (previa || Boolean(linkPromo))
  return {
    ativa,
    fim: fimPrevia ?? fim,
    txt,
    /** Checkout de quem clica em comprar: o da promoção enquanto ela vale, se houver um. */
    linkCompra: (ativa && linkPromo) || globalSettings.purchaseLink,
  }
}
