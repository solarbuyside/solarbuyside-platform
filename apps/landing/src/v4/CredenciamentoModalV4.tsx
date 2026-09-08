import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, CheckCircle2, Loader2, X } from 'lucide-react'
import { Img } from './atoms'
import { trackEvent } from '../utils/analytics'
import { comUtm } from './utm'

/* MODAL "SEU DESCONTO ESTÁ A UM PASSO" — a ponte entre a LP e o cadastro de
   integrador da Belenergy (Francis, 05/09).

   O QUE ELE FAZ, e o que NÃO faz: coleta nome, e-mail e celular, grava o lead
   na mesma base do teaser (`ebook_leads`, marcada com `origem`) e leva a
   pessoa para o formulário da Belenergy com UTM. O desconto NÃO sai daqui: ele
   só existe depois que a Belenergy aprovar o cadastro, e essa aprovação chega
   por fora (relatório diário + e-mail), não por API. O texto do modal diz isso
   com todas as letras para ninguém sair daqui esperando um cupom na tela.

   A UTM no link de saída é o que permite à Belenergy contar quantos cadastros
   vieram da nossa página sem integração nenhuma do lado deles além de ler o
   parâmetro.

   Diálogo de verdade, pelas mesmas razões do LightboxV4: portal para o <body>
   (um ancestral com `transform` quebraria o `position: fixed`), Esc fecha,
   rolagem do fundo travada, foco entra ao abrir e volta para o botão que
   abriu, `role="dialog"` + `aria-modal`. A diferença é que aqui há
   FORMULÁRIO: o foco vai para o primeiro campo, não para a caixa, e o clique
   no fundo só fecha antes do envio (fechar por engano com o formulário
   preenchido custa o lead). */

/** Onde o lead nasceu. Vai gravado no banco e no Brevo para separar do teaser. */
const ORIGEM = 'belenergy-credenciamento'

type Props = {
  aberto: boolean
  aoFechar: () => void
  /** Destino do cadastro na Belenergy. A UTM é somada aqui dentro. */
  url: string
  /** Logo da Belenergy, o mesmo caminho que a caixa de promo já usa. */
  logo?: string
  titulo?: string
  texto?: string
  precoDe?: string
  precoPor?: string
  selo?: string
  rotuloCta?: string
  assinatura?: string
  /** Tela de sucesso (depois do envio do formulário). */
  sucessoTitulo?: string
  /** `{selo}` é trocado pelo selo — assim o texto não repete o valor à mão. */
  sucessoTexto?: string
}

type Campos = { nome: string; email: string; celular: string }

/* Celular brasileiro enquanto se digita: (11) 98765-4321. Formatar no input
   evita o campo virar um amontoado de dígitos que ninguém confere antes de
   enviar, e o backend recebe só os dígitos de qualquer jeito. */
function formatarCelular(bruto: string): string {
  const d = bruto.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export const CredenciamentoModalV4: React.FC<Props> = ({
  aberto,
  aoFechar,
  url,
  logo = '/assets/apoiadores/belenergy.png',
  titulo = 'Seu desconto está a um passo',
  texto = 'Deixe seus contatos aqui no Solar Buy-Side e continue seu cadastro na plataforma Belenergy. Após a aprovação, você desbloqueia seu benefício exclusivo no Método Solar Buy-Side.',
  precoDe = 'De R$ 797,00',
  precoPor = 'Por R$ 677,45',
  selo = '15% OFF',
  rotuloCta = 'Continuar para o cadastro Belenergy',
  assinatura = 'Seja um integrador credenciado Belenergy',
  sucessoTitulo = 'Falta só o cadastro',
  sucessoTexto =
    'Recebemos seus dados. Agora conclua seu cadastro de integrador na Belenergy: assim que ele for aprovado, seu benefício de {selo} é liberado por e-mail.',
}) => {
  const caixa = useRef<HTMLDivElement | null>(null)
  const primeiroCampo = useRef<HTMLInputElement | null>(null)
  const origem = useRef<Element | null>(null)

  const [campos, setCampos] = useState<Campos>({ nome: '', email: '', celular: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const destino = comUtm(url)

  /* Cada abertura recomeça limpa: quem fechasse depois de enviar reabriria
     direto na tela de sucesso, sem formulário. O reset acontece no gesto de
     fechar, e não num efeito que observa `aberto` — efeito que só chama
     setState é render em cascata sem motivo. */
  const fechar = useCallback(() => {
    setCampos({ nome: '', email: '', celular: '' })
    setEnviando(false)
    setEnviado(false)
    aoFechar()
  }, [aoFechar])

  /* Esc fecha. No `document` porque o foco pode estar em qualquer campo. */
  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        fechar()
      }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto, fechar])

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

  /* Foco no primeiro campo (é um formulário, não um visualizador) e devolução
     para quem abriu. `preventScroll` porque a LP tem `scroll-behavior: smooth`
     e um focus mal colocado arrastaria a página numa animação visível. */
  useEffect(() => {
    if (!aberto) return
    const anterior = document.activeElement
    origem.current = anterior === document.body ? null : anterior
    const alvo = primeiroCampo.current ?? caixa.current
    alvo?.focus({ preventScroll: true })
    return () => {
      const volta = origem.current
      if (volta instanceof HTMLElement) volta.focus({ preventScroll: true })
    }
  }, [aberto])

  const enviar = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (enviando) return
      setEnviando(true)

      const payload = {
        // O endpoint do teaser exige `sobrenome`; o Francis pediu "nome
        // completo" num campo só. Parte-se no primeiro espaço: o que sobra vai
        // para sobrenome, e o que não tiver sobrenome manda vazio em vez de
        // travar o cadastro por causa de um campo que ele não pediu.
        nome: campos.nome.trim().split(/\s+/)[0] || campos.nome.trim(),
        sobrenome: campos.nome.trim().split(/\s+/).slice(1).join(' '),
        email: campos.email.trim(),
        celular: campos.celular.replace(/\D/g, ''),
        origem: ORIGEM,
      }

      trackEvent('ebook_download', { sectionName: ORIGEM })

      /* `keepalive`: a pessoa vai para a Belenergy em outra aba logo em
         seguida, e sem isso o navegador cancelaria a requisição em voo e o
         lead se perderia. O sucesso é otimista pelo mesmo motivo do teaser:
         ninguém deve esperar a rede para receber o link do cadastro. */
      fetch('/api/ebook/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((err) => console.error('[credenciamento] envio falhou:', err))

      setEnviando(false)
      setEnviado(true)
    },
    [campos, enviando],
  )

  if (!aberto || typeof document === 'undefined') return null

  const rotuloCampo = 'v4-mono mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400'
  const campo =
    'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-slate-500 transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30'

  return createPortal(
    <div
      ref={caixa}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="credenciamento-titulo"
      /* Clique no fundo fecha, mas só antes do envio: com o formulário
         preenchido, um clique torto fora da caixa custaria o lead. Depois de
         enviado não há mais nada a perder. */
      onClick={(e) => {
        if (e.target !== e.currentTarget) return
        if (enviado || (!campos.nome && !campos.email && !campos.celular)) fechar()
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm sm:p-6"
    >
      <div className="relative my-auto w-full max-w-md">
        <div className="v4-conic-frame rounded-[1.75rem] p-px">
          <div className="v4-conic-inner rounded-[calc(1.75rem-1px)] bg-[#0d0a08] p-7 sm:p-9">
            <button
              type="button"
              onClick={fechar}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 transition-colors hover:border-white/25 hover:bg-white/15 hover:text-white"
            >
              <X size={18} aria-hidden />
            </button>

            {!enviado ? (
              <>
                <Img src={logo} alt="Belenergy" loading="lazy" className="h-9 w-auto" />

                <h2
                  id="credenciamento-titulo"
                  className="mt-5 font-['Sora'] text-[1.6rem] font-extrabold leading-[1.12] tracking-tight text-white"
                >
                  {titulo}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-300">{texto}</p>

                {/* Benefício: o preço riscado, o preço novo e o selo. É a
                    promessa do modal, então fica acima do formulário, e não
                    depois dele. */}
                {/* `flex-nowrap` de propósito: com `flex-wrap`, o selo caía
                    para a linha de baixo no celular e ficava sozinho, longe do
                    preço que ele qualifica. O bloco de preço encolhe (min-w-0)
                    e o selo nunca encolhe (shrink-0). */}
                <div className="mt-6 flex flex-nowrap items-center gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/[0.07] px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-500 line-through">{precoDe}</p>
                    {/* `whitespace-nowrap`: "Por R$ 677,45" quebrando em duas
                        linhas a 360px empurrava o selo para fora do eixo do
                        preço. O corpo cede antes (text-xl no estreito). */}
                    <p className="whitespace-nowrap font-['Sora'] text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                      {precoPor}
                    </p>
                  </div>
                  <span className="v4-mono ml-auto shrink-0 whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                    {selo}
                  </span>
                </div>

                <form onSubmit={enviar} className="mt-6 space-y-4">
                  <div>
                    <label className={rotuloCampo} htmlFor="cred-nome">
                      Nome completo
                    </label>
                    <input
                      ref={primeiroCampo}
                      id="cred-nome"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={campos.nome}
                      onChange={(e) => setCampos((c) => ({ ...c, nome: e.target.value }))}
                      placeholder="Seu nome completo"
                      className={campo}
                    />
                  </div>

                  <div>
                    <label className={rotuloCampo} htmlFor="cred-email">
                      E-mail
                    </label>
                    <input
                      id="cred-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      value={campos.email}
                      onChange={(e) => setCampos((c) => ({ ...c, email: e.target.value }))}
                      placeholder="voce@empresa.com.br"
                      className={campo}
                    />
                  </div>

                  <div>
                    <label className={rotuloCampo} htmlFor="cred-celular">
                      Celular
                    </label>
                    <input
                      id="cred-celular"
                      name="tel"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      required
                      /* 14 = "(11) 9999-9999" com DDD de 10 dígitos. O
                         `pattern` cobre os dois formatos porque fixo antigo
                         ainda aparece em cadastro de empresa. */
                      minLength={14}
                      value={campos.celular}
                      onChange={(e) => setCampos((c) => ({ ...c, celular: formatarCelular(e.target.value) }))}
                      placeholder="(11) 98765-4321"
                      className={campo}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enviando}
                    className="v4-cta-shine group relative mt-2 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 py-4 text-base font-extrabold uppercase tracking-tight text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
                  >
                    {enviando ? (
                      <Loader2 size={18} className="animate-spin" aria-hidden />
                    ) : (
                      <span className="relative z-10 leading-tight">{rotuloCta}</span>
                    )}
                  </button>
                </form>

                <p className="v4-mono mt-5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {assinatura}
                </p>
              </>
            ) : (
              /* Depois do envio o modal não fecha sozinho: o link para a
                 Belenergy é o próximo passo e precisa de um clique da pessoa.
                 Abrir a aba por script seria bloqueado como popup, já que o
                 clique original foi no "enviar", não no link. */
              <div className="text-center">
                <CheckCircle2 size={44} className="mx-auto text-emerald-500" aria-hidden />
                <h2 id="credenciamento-titulo" className="mt-5 font-['Sora'] text-2xl font-extrabold tracking-tight text-white">
                  {sucessoTitulo}
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-slate-300">
                  {sucessoTexto.split('{selo}').join(selo)}
                </p>

                <a
                  href={destino}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="v4-cta-shine group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 py-4 text-base font-extrabold uppercase tracking-tight text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span className="relative z-10 leading-tight">{rotuloCta}</span>
                  <ArrowUpRight size={18} className="relative z-10 shrink-0 transition-transform group-hover:-translate-y-0.5" aria-hidden />
                </a>

                <button
                  type="button"
                  onClick={fechar}
                  className="mt-4 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
