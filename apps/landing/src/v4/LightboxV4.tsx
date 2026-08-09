import React, { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Img } from './atoms'

/* LIGHTBOX — a imagem grande, no centro, com o resto da página apagado.

   Gabriel, 09/08: "se eu clicar em alguma PÁGINA tem que acontecer alguma
   coisa, um zoom, escurecer o fundo, a imagem no centro da tela, podendo ir
   pra direita/esquerda clicando em setas nas laterais".

   Nasceu para as 7 páginas do índice do Manual, que são a prova do "130
   páginas e 160 tópicos" e vinham em miniaturas de 180px — tamanho em que
   ninguém lê um sumário. Ficou genérico (recebe uma lista de itens) porque a
   LP tem outras tiras de imagem que vão querer o mesmo gesto.

   PORTAL PARA O <body>, e não uma <div> dentro da seção. `position: fixed`
   deixa de se ancorar no viewport quando qualquer ancestral tem `transform`,
   `filter` ou `contain` — e as seções desta LP são cheias de camadas
   transformadas. Dentro da árvore da seção o lightbox funcionaria hoje e
   quebraria no dia em que alguém animasse o contêiner. Pelo portal, não há
   ancestral nenhum.

   Também não renderiza nada quando está fechado, o que importa numa LP
   pré-renderizada: o HTML congelado não ganha um diálogo escondido.

   O QUE UM DIÁLOGO PRECISA TER, e que um `<div>` com `onClick` não tem:
     - Esc fecha, setas do teclado navegam;
     - a rolagem do fundo trava (senão o dedo no celular rola a página atrás
       da imagem, que é o defeito clássico deste componente);
     - o foco entra ao abrir e VOLTA para a miniatura que abriu, senão quem
       navega por teclado é despejado no topo da página ao fechar;
     - `role="dialog"` + `aria-modal`, para o leitor de tela anunciar que o
       resto da página saiu de cena. */

export type ItemLightbox = {
  src: string
  alt: string
  /** Rótulo curto mostrado no rodapé, tipo "p. 10". */
  rotulo?: string
}

type Props = {
  itens: ItemLightbox[]
  /** Índice aberto, ou `null` com o lightbox fechado. */
  indice: number | null
  aoFechar: () => void
  aoTrocar: (i: number) => void
}

export const LightboxV4: React.FC<Props> = ({ itens, indice, aoFechar, aoTrocar }) => {
  const aberto = indice !== null && indice >= 0 && indice < itens.length
  const caixa = useRef<HTMLDivElement | null>(null)
  /* Quem abriu, para devolver o foco no fechamento. */
  const origem = useRef<Element | null>(null)
  const toqueX = useRef<number | null>(null)

  const anterior = useCallback(() => {
    if (indice === null) return
    aoTrocar((indice - 1 + itens.length) % itens.length)
  }, [indice, itens.length, aoTrocar])

  const proximo = useCallback(() => {
    if (indice === null) return
    aoTrocar((indice + 1) % itens.length)
  }, [indice, itens.length, aoTrocar])

  /* Teclado. Fica no `document` porque o alvo do evento pode ser o <body>
     enquanto o foco caminha, e não só o contêiner do diálogo. */
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        aoFechar()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        anterior()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        proximo()
      }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto, aoFechar, anterior, proximo])

  /* Trava a rolagem do fundo. O `paddingRight` compensa a largura da barra que
     some: sem isso a página inteira dá um salto lateral no instante em que o
     lightbox abre, e outro quando fecha. */
  useEffect(() => {
    if (!aberto) return
    const { body } = document
    const overflowAntes = body.style.overflow
    const padAntes = body.style.paddingRight
    const barra = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (barra > 0) body.style.paddingRight = `${barra}px`
    return () => {
      body.style.overflow = overflowAntes
      body.style.paddingRight = padAntes
    }
  }, [aberto])

  /* Foco: entra ao abrir, volta para a miniatura ao fechar.

     `preventScroll` nos dois, por precaução e não por bug observado: `focus()`
     pede "traga o elemento para a vista", e esta LP tem `scroll-behavior:
     smooth`, então um focus mal colocado arrastaria a página numa animação
     visível — e a rolagem programática acontece mesmo com o `overflow: hidden`
     do travamento, que barra o dedo e a roda, não o script. Medido: com
     `preventScroll` a página não anda um pixel ao abrir nem ao fechar. Na volta
     o risco seria focar a miniatura e arrastar junto a tira horizontal.

     `document.body` como origem não é origem nenhuma: é o que sobra quando o
     clique não focou nada. Devolver o foco para ele só tiraria do lugar quem
     navega por teclado. */
  useEffect(() => {
    if (!aberto) return
    const anteriorFoco = document.activeElement
    origem.current = anteriorFoco === document.body ? null : anteriorFoco
    caixa.current?.focus({ preventScroll: true })
    return () => {
      const alvo = origem.current
      if (alvo instanceof HTMLElement) alvo.focus({ preventScroll: true })
    }
  }, [aberto])

  if (!aberto || typeof document === 'undefined') return null
  const item = itens[indice]
  const varios = itens.length > 1

  return createPortal(
    <div
      ref={caixa}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      /* O clique no FUNDO fecha. `onClick` no contêiner com a checagem de
         `currentTarget` em vez de um irmão invisível atrás: assim a área
         clicável é exatamente o que sobrou em volta da imagem, sem precisar
         acertar camadas de z-index. */
      onClick={(e) => {
        if (e.target === e.currentTarget) aoFechar()
      }}
      onTouchStart={(e) => {
        toqueX.current = e.changedTouches[0]?.clientX ?? null
      }}
      onTouchEnd={(e) => {
        /* Arrastar para o lado troca de página: num celular é o gesto que a
           pessoa tenta antes de procurar a seta. 48px de limiar para não
           confundir com um toque torto. */
        const inicio = toqueX.current
        toqueX.current = null
        if (inicio === null || !varios) return
        const delta = (e.changedTouches[0]?.clientX ?? inicio) - inicio
        if (delta < -48) proximo()
        else if (delta > 48) anterior()
      }}
      className="v4-lightbox fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-6"
    >
      <button
        type="button"
        onClick={aoFechar}
        aria-label="Fechar"
        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 transition-colors hover:border-white/25 hover:bg-white/15 hover:text-white sm:right-5 sm:top-5"
      >
        <X size={18} aria-hidden />
      </button>

      {varios && (
        <>
          <SetaLateral lado="esquerda" aoClicar={anterior} rotulo="Página anterior" />
          <SetaLateral lado="direita" aoClicar={proximo} rotulo="Próxima página" />
        </>
      )}

      {/* `pointer-events-none` na imagem: clique nela cai no fundo e fecha, que
          é o que se espera de um visualizador. As setas e o botão de fechar
          ficam fora deste bloco, então continuam clicáveis. */}
      <figure className="pointer-events-none flex max-h-full flex-col items-center gap-3">
        <Img
          key={item.src}
          src={item.src}
          alt={item.alt}
          className="v4-lightbox-img max-h-[80vh] w-auto max-w-full rounded-lg bg-white object-contain shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]"
        />
        <figcaption className="v4-mono text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
          {item.rotulo ? `${item.rotulo} · ` : ''}
          {indice + 1} de {itens.length}
        </figcaption>
      </figure>
    </div>,
    document.body,
  )
}

/* As setas ficam nas LATERAIS DA TELA, não coladas na imagem: as páginas têm
   proporções diferentes e uma seta ancorada na borda da figura mudaria de
   lugar a cada troca. */
const SetaLateral: React.FC<{ lado: 'esquerda' | 'direita'; aoClicar: () => void; rotulo: string }> = ({
  lado,
  aoClicar,
  rotulo,
}) => {
  const Icone = lado === 'esquerda' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-label={rotulo}
      className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/15 hover:text-white active:scale-95 sm:h-12 sm:w-12 ${
        lado === 'esquerda' ? 'left-2 sm:left-5' : 'right-2 sm:right-5'
      }`}
    >
      <Icone size={22} aria-hidden />
    </button>
  )
}
