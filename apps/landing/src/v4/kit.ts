import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { criarTxt } from './cms'

/* O KIT E O RODÍZIO DELE, fora dos arquivos de Hero.

   As duas variantes que mostram o kit (a A, do celular, e a B, do desktop)
   precisam da mesma lista de peças e do mesmo rodízio automático. Enquanto só
   a B usava, isso morava lá dentro; com as duas usando, um dos dois arquivos
   teria que importar do outro, e um arquivo de componente que também exporta
   hooks quebra o fast refresh do Vite (a página inteira recarrega a cada
   salvamento em vez de trocar o componente no lugar). Daí este módulo. */

/* As quatro peças do kit.

   Cada uma tem FRASE e ENDEREÇO, porque só a capa não estava contando nada
   (Gabriel, 09/08: "eles não sabem o que é cada um dos livros").

   A frase vem de `heroKitNDesc`, que são as legendas curtas que ficavam sob as
   capas na variante A e saíram de lá em 06/08. Elas continuaram no banco e no
   editor do admin sem ninguém lendo; aqui voltam a ter leitor, com o texto que
   o Francis já aprovou ("130 páginas e 160 tópicos", e por aí).

   O `alvo` é a seção da LP que explica aquela peça. O Código não tinha id
   próprio porque mora dentro da seção do Manual — foi preciso criar um lá (ver
   ManualStrategicV4). Sem isso ele cairia na explicação do Manual. */
export function useKit() {
  const { getSection, globalSettings } = useContent()
  const pricing = getSection('pricing')
  const t = criarTxt(pricing)

  return {
    pecas: [
      {
        title: t('heroKit1Title', 'Manual de Compra de Sistema Solar'),
        image: pricing?.images.card1Image || '/assets/manual-norm.png',
        frase: t('heroKit1Desc', '130 páginas e 160 tópicos'),
        alvo: 'manual-strategic',
      },
      {
        title: t('heroKit2Title', t('card2Title', 'Código do Vendedor Consultivo')),
        image: pricing?.images.card2Image || '/assets/codigo-norm.png',
        frase: t('heroKit2Desc', 'Método de venda consultiva'),
        alvo: 'codigo',
      },
      {
        title: t('heroKit3Title', t('cardPlatformTitle', 'Plataforma de Avaliação de Proposta Comercial')),
        image: pricing?.images.cardPlatformImage || '/assets/capa-plataforma-tablet.png',
        frase: t('heroKit3Desc', 'Teste a sua proposta antes de enviar'),
        alvo: 'plataforma',
      },
      /* A LICENÇA DE USO COLETIVA (Gabriel, 09/08: "faltou o outro livro, o de
         10 licenças; você colocou no A e não no B"). Ela leva para `#equipe`,
         que é a seção "Capacite todo o seu time comercial" — a única das
         quatro peças cuja explicação não está no bloco do Manual nem no da
         Plataforma. */
      {
        /* NÃO cai em `card3Title` como as outras caem nos títulos da oferta:
           lá ele vale "Licença de uso para até 10 vendedores", que é exatamente
           o texto da FRASE logo abaixo — o leque mostrava a mesma linha duas
           vezes (Francis, 09/08: "trocar título: Licença de uso coletivo"). */
        title: t('heroKit4Title', 'Licença de uso coletivo'),
        image: pricing?.images.card3Image || '/assets/coletiva-norm.png',
        frase: t('heroKit4Desc', 'Licença de uso para até 10 vendedores'),
        alvo: 'equipe',
      },
    ],
    cta: t('heroKitCta', 'Quero o Kit Completo Agora'),
    link: globalSettings.purchaseLink || '#oferta',
    externo: Boolean(globalSettings.purchaseLink),
  }
}

export type Peca = ReturnType<typeof useKit>['pecas'][number]

/* 2s (Francis, 09/08: "aumentar um pouco a velocidade de troca de produto, de
   3 para 2 segundos"). Eram 4,5s. Com quatro peças o ciclo inteiro caiu de 18s
   para 8s, que é mais perto do tempo que alguém passa na primeira dobra antes
   de rolar — e o ciclo só vale para quem NÃO interage; no primeiro clique ele
   para de vez. */
const RODIZIO = 2000

/** Rodízio automático que morre no primeiro toque. */
export function useRodizio(total: number): { ativo: number; escolher: (i: number) => void } {
  const [ativo, setAtivo] = React.useState(0)
  const [auto, setAuto] = React.useState(true)

  React.useEffect(() => {
    if (!auto) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setTimeout(() => setAtivo((a) => (a + 1) % total), RODIZIO)
    return () => window.clearTimeout(id)
  }, [ativo, auto, total])

  return {
    ativo,
    escolher: (i: number) => {
      setAuto(false)
      setAtivo(i)
    },
  }
}
