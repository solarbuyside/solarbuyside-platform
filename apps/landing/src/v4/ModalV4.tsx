import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/* CASCA DOS MODAIS DE CAPTURA da LP.

   Nasceu dentro do CredenciamentoModalV4 (Belenergy, 05/09). Saiu de lá quando
   o pré-lançamento pediu um segundo formulário igual (inscrição na live,
   Francis 29/10): o que é DIÁLOGO mora aqui, o que é conteúdo fica em cada
   modal.

   Diálogo de verdade, pelas mesmas razões do LightboxV4: portal para o <body>
   (um ancestral com `transform` quebraria o `position: fixed`), Esc fecha,
   rolagem do fundo travada, foco entra ao abrir e volta para o botão que
   abriu, `role="dialog"` + `aria-modal`. Como há FORMULÁRIO, o foco vai para o
   primeiro campo, não para a caixa, e o clique no fundo só fecha quando quem
   chama permitir (fechar por engano com o formulário preenchido custa o
   lead). */

type DialogoProps = {
  aberto: boolean
  /** Fecha e, se for o caso, limpa o estado de quem chamou. */
  aoFechar: () => void
  /** id do título visível, para o `aria-labelledby`. */
  tituloId: string
  /** O clique no fundo fecha? Quem chama decide (ex.: só com o formulário vazio). */
  fecharNoFundo: boolean
  /** Campo que recebe o foco ao abrir. Sem ele, a própria caixa. */
  focoInicial?: React.RefObject<HTMLElement | null>
  children: React.ReactNode
}

export const DialogoV4: React.FC<DialogoProps> = ({ aberto, aoFechar, tituloId, fecharNoFundo, focoInicial, children }) => {
  const caixa = useRef<HTMLDivElement | null>(null)
  const origem = useRef<Element | null>(null)

  /* Esc fecha. No `document` porque o foco pode estar em qualquer campo. */
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        aoFechar()
      }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto, aoFechar])

  /* Trava a rolagem do fundo e compensa a barra que some, senão a página dá um
     salto lateral ao abrir e outro ao fechar. */
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

  /* Foco no primeiro campo e devolução para quem abriu. `preventScroll` porque
     a LP tem `scroll-behavior: smooth` e um focus mal colocado arrastaria a
     página numa animação visível. */
  useEffect(() => {
    if (!aberto) return
    const anterior = document.activeElement
    origem.current = anterior === document.body ? null : anterior
    const alvo = focoInicial?.current ?? caixa.current
    alvo?.focus({ preventScroll: true })
    return () => {
      const volta = origem.current
      if (volta instanceof HTMLElement) volta.focus({ preventScroll: true })
    }
  }, [aberto, focoInicial])

  if (!aberto || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={caixa}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return
        if (fecharNoFundo) aoFechar()
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm sm:p-6"
    >
      <div className="relative my-auto w-full max-w-md">
        <div className="v4-conic-frame rounded-[1.75rem] p-px">
          <div className="v4-conic-inner rounded-[calc(1.75rem-1px)] bg-[#0d0a08] p-7 sm:p-9">
            <button
              type="button"
              onClick={aoFechar}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 transition-colors hover:border-white/25 hover:bg-white/15 hover:text-white"
            >
              <X size={18} aria-hidden />
            </button>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
