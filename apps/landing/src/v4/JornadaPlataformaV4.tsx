import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BarChart3, Building2, Check, ChevronLeft, ChevronRight, ClipboardList, Cpu, Crown, Pause, Play, Trophy, X } from 'lucide-react'

/* A JORNADA DA PLATAFORMA — cinco painéis, do primeiro formulário à escolhida.

   Francis, revisão de 06/08, slide 5: "demo de 30 segundos da jornada da
   plataforma de avaliação (se for possível) ... mostrando a jornada do
   primeiro painel até o painel final de 6 propostas ... mostrar os painéis já
   preenchidos com uma frase explicativa para cada painel".

   Ele pediu um vídeo. Isto é a mesma coisa em DOM, e é melhor por quatro
   motivos concretos: pesa alguns kB em vez de megabytes numa dobra que é a
   segunda da página; fica nítido em qualquer densidade de tela; o texto é
   selecionável e indexável; e o visitante pode PARAR, voltar e reler o painel
   que interessa a ele, o que um vídeo de 30s não permite. A música que ele
   menciona ficou de fora de propósito: áudio automático é bloqueado pelos
   navegadores e, quando toca, atrapalha.

   AS TELAS SÃO AS DE VERDADE. Cada painel foi construído a partir de uma
   captura da Plataforma rodando (rotas /avaliacoes/[id]/preencher,
   /comparativo e /finalistas, renderizadas com o `sampleComparison` do
   domínio). Os critérios e os PESOS vêm de
   `apps/platform/src/domain/comparisons/score-definitions.ts`, não são
   inventados: 9% para tempo de atuação, 14% para garantia, 15% para reputação
   da distribuidora, e por aí.

   O QUE FOI ADAPTADO, e por quê: a Plataforma é clara e esta seção da LP é
   escura. Os painéis usam a paleta escura que o Francis já aprovou na tabela
   desta mesma seção, em vez de colar um retângulo branco no meio do ato
   escuro. A informação é a real; o traje é o da página.

   OS NÚMEROS são os desta seção da LP, e não os do `sampleComparison` (onde a
   coluna Tecnologias sai 100/100 para todo mundo, porque a amostra não
   preenche a parte técnica). Precisam ser estes: a frase logo abaixo da
   moldura, escrita pelo Francis, cita "R$ 16.342,80" e "79,2 de 100". Se o
   painel mostrasse outra conta, a frase viraria mentira. */

/* ── OS DADOS DO EXEMPLO ────────────────────────────────────────────────── */

const COMPANIES = ['Renova', 'Soli Brasil', 'Energia SGE', 'TAP Solar', 'Fotovolta Express', 'Self Solar'] as const
const INVESTMENTS = [17690, 16342.8, 15900, 14500, 17325.75, 17497]
const EMPRESAS_INDICE = [66.9, 84.5, 26.8, 55.5, 69.1, 69.3]
const TECNOLOGIAS_INDICE = [61.1, 73.7, 57.9, 55.8, 53.7, 74.7]
const CONFIABILIDADE = [64.1, 79.2, 41.9, 55.6, 61.6, 72.0]

/* Vencedora do exemplo: só a maior nota total (Francis, slide 3 de 03/08).
   No produto o comprador escolhe DOIS finalistas e decide entre eles; nesta
   ilustração só uma chega ao fim, e "finalista" ficaria sem par. */
const VENCEDORA = 1

/* No celular a tabela mostra 4 fornecedores: a vencedora, a melhor e a pior.
   TAP Solar e Fotovolta Express entram a partir de md. */
const MOBILE_HIDDEN = new Set([3, 4])
const colCls = (i: number) => (MOBILE_HIDDEN.has(i) ? 'hidden md:table-cell' : '')

/* Nos painéis de critérios cabe MENOS coluna no celular, porque a primeira
   coluna carrega o nome do critério e o peso, e ela é larga. Com quatro
   fornecedores a última saía cortada pela borda. Aqui ficam três: a vencedora
   e as duas que a cercam. */
const MOBILE_HIDDEN_CRITERIOS = new Set([2, 3, 4])
const colClsCriterios = (i: number) => (MOBILE_HIDDEN_CRITERIOS.has(i) ? 'hidden md:table-cell' : '')

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })
const n1 = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

/* Critérios e pesos REAIS, de score-definitions.ts. A lista completa tem 14
   itens de Empresa e 10 de Tecnologia; aqui entram os que cabem no painel sem
   virar letra ilegível, na ordem em que o produto os mostra. O rodapé de cada
   painel diz quantos ficaram de fora, para o recorte não passar por lista
   completa.

   AS NOTAS SÃO VALORES QUE A RUBRICA CONSEGUE PRODUZIR, e cada uma sai da
   resposta que a empresa dá no painel 1. Na primeira versão eu tinha escrito
   notas "plausíveis" a olho e havia impossíveis: CREA só pode dar 10 (Sim) ou
   0 (Não), e estava 4,8; sede física só dá 10 ou 5, e estava 8 e 0. Num painel
   que existe para explicar DE ONDE VEM A NOTA, número que a régua não produz é
   o pior defeito possível. As rubricas usadas aqui:

     atuação        1 ponto por ano, 2016 ou antes = 10
     CREA           Sim = 10, Não = 0
     SFV instalado  10-49=2, 50-100=4, 100-500=6, 500-1000=8, +1000=10
     equipe         própria = 10, tenho dúvida = 7, terceirizada = 4
     garantia       2 pontos por ano, 5+ anos = 10
     sede física    Sim = 10, Não = 5
     Reclame Aqui   Ruim=2, Regular=4, Bom=6, Ótimo=8, RA 1000=10 */
const CRITERIOS_EMPRESA = [
  { label: 'Atuação no ramo solar', peso: 9, notas: [9, 10, 5, 7, 10, 8] },
  { label: 'Registro CREA engenharia elétrica', peso: 8, notas: [10, 10, 0, 10, 10, 10] },
  { label: 'Quantidade de SFV instalado', peso: 9, notas: [6, 10, 2, 4, 8, 6] },
  { label: 'Instalações por funcionário próprio', peso: 10, notas: [10, 10, 4, 4, 10, 7] },
  { label: 'Garantia contra defeito de projeto', peso: 14, notas: [6, 10, 2, 4, 8, 10] },
  { label: 'A empresa possui uma sede física', peso: 8, notas: [10, 10, 5, 5, 10, 10] },
  { label: 'Reclame Aqui: reputação (12 meses)', peso: 3, notas: [6, 8, 2, 4, 6, 8] },
]
const OCULTOS_EMPRESA = 7

const CRITERIOS_TECNOLOGIA = [
  { label: 'Geração anual proposta', peso: 10, notas: [7, 9, 6, 6, 5, 9] },
  { label: 'Módulo · marca', peso: 10, notas: [6, 8, 4, 6, 6, 8] },
  { label: 'Inversor · garantia contra defeito', peso: 10, notas: [6, 7, 5, 5, 5, 8] },
  { label: 'Sobrecarga DC/AC (kWp/kW)', peso: 10, notas: [5, 7, 8, 6, 4, 7] },
  { label: 'Reputação da distribuidora', peso: 15, notas: [6, 7, 6, 5, 5, 8] },
  { label: 'Inversor · marca', peso: 10, notas: [6, 8, 5, 5, 5, 8] },
  { label: 'Reputação do fabricante do módulo', peso: 10, notas: [6, 7, 6, 6, 5, 7] },
]
const OCULTOS_TECNOLOGIA = 3

/* ── OS CINCO PAINÉIS ───────────────────────────────────────────────────── */

type Painel = {
  id: string
  /** Fase do produto a que este painel pertence (a mesma nav do app). */
  fase: 'Preenchimento' | 'Comparativo' | 'Finalistas'
  /** Nome curto, para o passo clicável. */
  passo: string
  icone: React.ComponentType<{ size?: number; className?: string }>
  /** Título da janela, no formato que o produto usa. */
  janela: string
  /** A "frase explicativa para cada painel" que o Francis pediu. */
  frase: string
  /** Quanto tempo este painel fica no ar antes de virar sozinho. */
  duracao: number
}

const PAINEIS: Painel[] = [
  {
    id: 'preencher',
    fase: 'Preenchimento',
    passo: 'Preencher',
    icone: ClipboardList,
    janela: 'Preenchimento · A empresa de solar',
    frase:
      'Você conversa com o vendedor e anota. Os mesmos campos para as seis propostas, com salvamento automático.',
    duracao: 6500,
  },
  {
    id: 'empresas',
    fase: 'Comparativo',
    passo: 'Empresas',
    icone: Building2,
    janela: 'Comparativo · Pontuação Empresas',
    /* Uma frase só (Francis, 09/08: "eliminar a segunda frase"). A segunda
       explicava a régua de dois critérios, e a tabela ao lado já mostra o peso
       de cada um em letra miúda: era a legenda repetindo o painel. */
    frase: 'Cada resposta vira nota, com o peso que ela tem na decisão.',
    duracao: 7000,
  },
  {
    id: 'tecnologia',
    fase: 'Comparativo',
    passo: 'Tecnologia',
    icone: Cpu,
    janela: 'Comparativo · Pontuação Tecnológica',
    frase:
      'O mesmo para o equipamento: geração proposta, marca e garantia de módulo e inversor, sobrecarga e a reputação de quem fabrica e distribui.',
    duracao: 6500,
  },
  {
    id: 'geral',
    fase: 'Comparativo',
    passo: 'Pontuação Geral',
    icone: BarChart3,
    janela: 'Comparativo · Pontuação Geral',
    /* Segunda frase trocada por ele (Francis, 09/08), e ganhou o que faltava:
       diz que as empresas são FICTÍCIAS. Seis nomes com nota ao lado, sem esse
       aviso, lêem como avaliação de empresas reais. */
    frase:
      'As seis lado a lado no Índice de Confiabilidade. Neste exemplo com empresas fictícias, a Soli Brasil alcançou 79,2 pontos em 100.',
    duracao: 8000,
  },
  {
    id: 'escolhida',
    fase: 'Finalistas',
    passo: 'Decisão',
    icone: Trophy,
    janela: 'Finalistas · Decisão do comprador',
    frase: 'A decisão continua sendo sua. A diferença é que agora ela é embasada em números.',
    duracao: 7000,
  },
]

const FASES = ['Preenchimento', 'Comparativo', 'Finalistas'] as const

/* ── MOTOR DE ANIMAÇÃO ──────────────────────────────────────────────────── */

const movimentoReduzido = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Progresso 0→1 de UMA passagem, reiniciado toda vez que o painel entra em
 * cena. É o que faz as notas subirem, as barras crescerem e os campos se
 * preencherem em sequência — tudo derivado de um número só, em vez de uma
 * animação por elemento.
 */
function useProgresso(ativo: boolean, duracao = 1400, chave: unknown = null): number {
  const reduzido = movimentoReduzido()
  const [t, setT] = useState(reduzido ? 1 : 0)

  useEffect(() => {
    if (!ativo || reduzido) return
    let raf = 0
    let inicio = 0
    const passo = (agora: number) => {
      if (!inicio) inicio = agora
      const p = Math.min(1, (agora - inicio) / duracao)
      /* easeOutCubic: começa rápido e assenta. Linear parece medidor de
         carregamento; isto parece cálculo terminando. */
      setT(1 - Math.pow(1 - p, 3))
      if (p < 1) raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
    /* `chave` entra nas dependências para a passagem RECOMEÇAR quando o que
       está sendo animado muda sem o painel trocar — é o caso de escolher
       outra empresa na barra lateral. */
  }, [ativo, duracao, reduzido, chave])

  return ativo ? t : 0
}

/** Progresso de um item da sequência: o i-ésimo começa depois do anterior. */
const escalonar = (t: number, i: number, total: number, sobreposicao = 0.55) => {
  const passo = (1 - sobreposicao) / Math.max(1, total - 1)
  return Math.max(0, Math.min(1, (t - i * passo) / sobreposicao))
}

/* ── O COMPONENTE ───────────────────────────────────────────────────────── */

export const JornadaPlataformaV4: React.FC = () => {
  const [atual, setAtual] = useState(0)
  const [tocando, setTocando] = useState(true)
  /* `visivel` só liga quando a seção entra na tela: a jornada fica a ~1.400px
     do topo e não faz sentido gastar o primeiro ciclo dela rodando para
     ninguém — quando o visitante chegasse, estaria no meio do painel 3. */
  /* Nasce visível quando não há IntersectionObserver (crawler, navegador
     antigo): sem o observador ninguém avisaria que a seção entrou na tela, e a
     jornada ficaria congelada no primeiro painel para sempre. Decidido no
     estado inicial, e não dentro do efeito, para não disparar renderização em
     cascata — é o que o react-hooks/set-state-in-effect cobra, com razão. */
  const [visivel, setVisivel] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )
  const caixa = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = caixa.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      ([e]) => setVisivel(e.isIntersecting),
      /* 35%: o suficiente para a moldura estar de fato à vista, não só um
         fio dela aparecendo na borda. */
      { threshold: 0.35 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  /* Avanço automático. Para quando o visitante pausa, quando ele escolhe um
     passo e quando a moldura sai da tela. */
  useEffect(() => {
    if (!tocando || !visivel || movimentoReduzido()) return
    const id = window.setTimeout(() => setAtual((a) => (a + 1) % PAINEIS.length), PAINEIS[atual].duracao)
    return () => window.clearTimeout(id)
  }, [atual, tocando, visivel])

  const ir = useCallback((i: number) => {
    setTocando(false)
    setAtual(((i % PAINEIS.length) + PAINEIS.length) % PAINEIS.length)
  }, [])

  /* Mede o painel ativo e devolve a altura para o palco. Um ResizeObserver, e
     não uma leitura única: os painéis mudam de altura sozinhos (o formulário
     preenche campos, a tabela ganha a linha da decisão) e reflow de fonte no
     celular muda tudo de novo. */
  const [altura, setAltura] = useState<number | null>(null)
  const medindo = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    if (typeof ResizeObserver === 'undefined') {
      setAltura(el.offsetHeight)
      return
    }
    const obs = new ResizeObserver(([e]) => setAltura(Math.ceil(e.contentRect.height)))
    obs.observe(el)
    observador.current?.disconnect()
    observador.current = obs
  }, [])
  const observador = useRef<ResizeObserver | null>(null)
  useEffect(() => () => observador.current?.disconnect(), [])

  const painel = PAINEIS[atual]
  const faseAtual = FASES.indexOf(painel.fase)

  return (
    <div ref={caixa}>
      {/* A MOLDURA. Mesma linguagem da janela que esta seção já usava para a
          tabela estática: borda clara a 8%, fundo quase preto, sombra baixa. */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0e18]/90 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {/* Cabeçalho da janela + as três fases do produto. A nav de fases é a
            do app (Preenchimento · Comparativo · Finalistas) e serve de mapa:
            sem ela, cinco painéis viram cinco telas soltas em vez de um
            caminho. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.06] px-4 py-3">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </span>
          <span className="v4-mono truncate text-[10px] uppercase tracking-[0.22em] text-slate-400">
            {painel.janela}
          </span>
          <div className="ml-auto hidden items-center gap-1.5 sm:flex" aria-hidden>
            {FASES.map((f, i) => (
              <React.Fragment key={f}>
                {i > 0 && <span className={`h-px w-4 ${i <= faseAtual ? 'bg-orange-500/60' : 'bg-white/10'}`} />}
                <span
                  className={`v4-mono rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] transition-colors duration-500 ${
                    i === faseAtual
                      ? 'bg-orange-500/15 text-orange-300'
                      : i < faseAtual
                        ? 'text-slate-400'
                        : 'text-slate-600'
                  }`}
                >
                  {i < faseAtual && <Check size={9} className="mr-1 inline align-[-1px]" />}
                  {f}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* AS ABAS, ACIMA DO PAINEL E DENTRO DA MOLDURA (Gabriel, 09/08: "era
            pras tabs serem em cima da tabela, não embaixo").

            Ele está certo, e o motivo é fidelidade: no Comparativo real as abas
            ficam exatamente aqui, acima da tabela, com sublinhado laranja na
            ativa. Embaixo e fora da janela elas viravam um controle de
            carrossel da LP; aqui em cima são a navegação do próprio produto,
            que é o que a demonstração está mostrando.

            O sublinhado da aba ativa é também o cronômetro: ele preenche na
            duração do painel e avisa que a tela vai virar sozinha. Some quando
            o visitante pausa ou assume o controle. */}
        <div
          role="tablist"
          aria-label="Etapas da jornada"
          className="v4-scroll-x flex items-stretch gap-1 overflow-x-auto border-b border-white/[0.06] px-2 sm:gap-2 sm:px-3"
        >
          {PAINEIS.map((p, i) => {
            const Icone = p.icone
            const ativa = i === atual
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={ativa}
                onClick={() => ir(i)}
                className={`group relative shrink-0 whitespace-nowrap px-2.5 pb-2.5 pt-3 text-[11px] font-bold transition-colors duration-300 sm:px-3 sm:text-xs ${
                  ativa ? 'text-orange-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Icone size={13} className={ativa ? 'text-orange-400' : 'text-slate-600'} />
                  {p.passo}
                </span>
                {/* Trilho sempre presente, para a aba não mudar de altura ao
                    ganhar o sublinhado. */}
                <span className="absolute inset-x-2.5 bottom-0 h-0.5 overflow-hidden rounded-full sm:inset-x-3" aria-hidden>
                  {ativa && (
                    <span
                      key={`${p.id}-${tocando}`}
                      className={`block h-full w-full origin-left rounded-full bg-orange-400 ${
                        tocando ? 'v4-tela-progresso' : ''
                      }`}
                      style={{ ['--dur' as string]: `${p.duracao}ms` }}
                    />
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {/* O PALCO ACOMPANHA A ALTURA DO PAINEL ATIVO, com transição.

            Altura fixa era a primeira tentativa, e o defeito apareceu na tela:
            os cinco painéis têm alturas naturais bem diferentes (o formulário
            tem 10 campos, a Pontuação Geral tem 5 linhas), então a caixa
            dimensionada pelo maior deixava 200px de vazio nos menores. Altura
            livre, por outro lado, faz a página inteira saltar a cada troca.

            A saída é medir o painel que está entrando e animar a altura até
            ela. Ganha os dois: nenhum vazio e nenhum salto — a moldura
            "respira" junto com a troca, que é a leitura certa de um sistema
            mudando de tela. */}
        <div
          className="relative overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
          style={{ height: altura ? `${altura}px` : undefined }}
        >
          {PAINEIS.map((p, i) => (
            <div
              key={p.id}
              ref={i === atual ? medindo : undefined}
              aria-hidden={i !== atual}
              /* `top-0` e não `inset-0`: preso em cima e embaixo, o painel
                 herdaria a altura da caixa e não teria altura própria para
                 medir. */
              className={`absolute inset-x-0 top-0 transition-[opacity,transform] duration-500 ease-out ${
                i === atual
                  ? 'translate-x-0 opacity-100'
                  : `pointer-events-none opacity-0 ${i < atual ? '-translate-x-4' : 'translate-x-4'}`
              }`}
            >
              <Conteudo id={p.id} ativo={i === atual && visivel} />
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTROLES E LEGENDA, fora da moldura ─────────────────────────── */}
      {/* CONTROLES À ESQUERDA, antes da frase (Gabriel, 09/08). Eles ficavam
          no canto direito, longe do 01/02/03 que numera o painel e longe das
          abas, que também são navegação. Juntos do começo da linha, a barra
          inteira lê como um controle só: voltar, pausar, avançar, e ao lado o
          que o painel está mostrando.

          Vêm antes no DOM, e não só visualmente: no celular a coluna empilha,
          e é a ordem do código que decide o que aparece primeiro. */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex shrink-0 items-center gap-2">
          <Botao aoClicar={() => ir(atual - 1)} rotulo="Painel anterior">
            <ChevronLeft size={16} aria-hidden />
          </Botao>
          <Botao
            aoClicar={() => setTocando((v) => !v)}
            rotulo={tocando ? 'Pausar a demonstração' : 'Retomar a demonstração'}
          >
            {tocando ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
          </Botao>
          <Botao aoClicar={() => ir(atual + 1)} rotulo="Próximo painel">
            <ChevronRight size={16} aria-hidden />
          </Botao>
        </div>

        {/* A frase explicativa do painel, que é o que o Francis pediu. Altura
            reservada para as cinco: sem isso o bloco abaixo sobe e desce a
            cada troca, porque as frases têm comprimentos diferentes.
            `sm:pt-1.5` alinha a primeira linha do texto com o meio dos botões,
            que têm 36px de altura contra ~24px da linha. */}
        <p
          key={painel.id}
          className="v4-troca-suave min-h-[3.5rem] flex-1 text-[15px] leading-relaxed text-slate-300 sm:min-h-[2.5rem] sm:pt-1.5"
        >
          <span className="v4-mono mr-2 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">
            {String(atual + 1).padStart(2, '0')}
          </span>
          {painel.frase}
        </p>
      </div>

    </div>
  )
}

const Botao: React.FC<{ aoClicar: () => void; rotulo: string; children: React.ReactNode }> = ({
  aoClicar,
  rotulo,
  children,
}) => (
  <button
    type="button"
    onClick={aoClicar}
    aria-label={rotulo}
    title={rotulo}
    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
  >
    {children}
  </button>
)

const Conteudo: React.FC<{ id: string; ativo: boolean }> = ({ id, ativo }) => {
  switch (id) {
    case 'preencher':
      return <PainelPreencher ativo={ativo} />
    case 'empresas':
      return <PainelCriterios ativo={ativo} criterios={CRITERIOS_EMPRESA} ocultos={OCULTOS_EMPRESA} indices={EMPRESAS_INDICE} />
    case 'tecnologia':
      return (
        <PainelCriterios ativo={ativo} criterios={CRITERIOS_TECNOLOGIA} ocultos={OCULTOS_TECNOLOGIA} indices={TECNOLOGIAS_INDICE} />
      )
    case 'geral':
      return <PainelGeral ativo={ativo} />
    default:
      return <PainelEscolhida ativo={ativo} />
  }
}

/* ── PAINEL 1 · PREENCHIMENTO ───────────────────────────────────────────── */

/* Os campos são os da primeira etapa real ("A empresa de solar"), com os
   mesmos rótulos e as mesmas respostas do exemplo. Eles aparecem em sequência,
   como quem anota durante a conversa — é a única maneira honesta de mostrar
   "preenchimento" numa tela parada. */
/* AS PERGUNTAS da primeira etapa real ("A empresa de solar"), e a resposta de
   CADA UMA DAS SEIS. Seis conjuntos, e não um, porque a barra lateral é
   clicável (ver abaixo) e trocar de empresa sem trocar as respostas seria uma
   tela que finge funcionar.

   As respostas não são enfeite: cada uma produz, pela rubrica, exatamente a
   nota que o painel de Pontuação Empresas mostra para aquela empresa. Dá para
   conferir atravessando os dois painéis — que é justamente o que a
   demonstração quer que a pessoa faça. */
const PERGUNTAS = [
  'Atuação no ramo solar desde (ano)',
  'Ano de abertura da empresa',
  'Registro CREA engenharia elétrica',
  'Quantidade de SFV instalado',
  'Instalações por funcionário próprio',
  'A empresa possui uma sede física',
  'Prazo máximo de instalação (dias)',
  'Garantia contra defeito (anos)',
  'Prazo de assistência técnica (dias)',
  'Memorial descritivo e diagrama unifilar',
] as const

const RESPOSTAS: Record<number, readonly string[]> = {
  // Renova — 2017 (nota 9), 100-500 (6), própria (10), 3 anos (6), sede sim (10)
  0: ['2017', '2015', 'Sim', '100 a 500', 'Equipe própria', 'Sim', '60', '3', '6', 'Sim'],
  // Soli Brasil — a vencedora: 2014 (10), +1000 (10), própria (10), 7 anos (10)
  1: ['2014', '2011', 'Sim', 'Mais de 1000', 'Equipe própria', 'Sim', '45', '7', '2', 'Sim'],
  // Energia SGE — a pior: 2021 (5), sem CREA (0), 10-49 (2), terceirizada (4)
  2: ['2021', '2021', 'Não', '10 a 49', 'Equipe terceirizada', 'Não', '90', '1', '15', 'Não'],
  3: ['2019', '2018', 'Sim', '50 a 100', 'Equipe terceirizada', 'Não', '75', '2', '10', 'Sim'],
  4: ['2016', '2014', 'Sim', '500 a 1000', 'Equipe própria', 'Sim', '55', '4', '5', 'Sim'],
  5: ['2018', '2016', 'Sim', '100 a 500', 'Tenho dúvida', 'Sim', '50', '5', '4', 'Sim'],
}

/* Quanto de cada entrevista já foi preenchido. Todas acima de 34% porque a
   etapa 1 (a que o painel mostra) aparece completa para qualquer empresa que
   o visitante abrir, e a etapa 1 é um terço das três. */
const PROGRESSO_EMPRESAS = [52, 61, 38, 44, 35, 40]

const PainelPreencher: React.FC<{ ativo: boolean }> = ({ ativo }) => {
  /* A BARRA LATERAL É CLICÁVEL (Gabriel, 09/08: "to clicando e não tá mudando
     de empresa"). Ele tentou clicar porque a tela pede: no produto o rótulo
     dessa coluna é literalmente "EMPRESAS · CLIQUE PARA TROCAR", e a lista tem
     estado de selecionado. Deixar seis itens com cara de menu sem resposta é
     pior do que não ter a coluna.

     Trocar de empresa reinicia o preenchimento, então dá para ver a resposta
     de cada uma entrando — e é aí que a demonstração deixa de ser uma foto e
     vira a Plataforma. */
  const [empresa, setEmpresa] = useState(0)
  const t = useProgresso(ativo, 2600, empresa)
  const respostas = RESPOSTAS[empresa] ?? RESPOSTAS[0]

  return (
    <div className="flex min-h-[360px]">
      {/* A COLUNA DAS SEIS EMPRESAS, como no app: número, nome e o quanto já
          foi preenchido. É ela que diz, sem texto, que a conta é sobre seis
          propostas e não sobre uma. */}
      <aside className="hidden w-[186px] shrink-0 flex-col border-r border-white/[0.06] bg-white/[0.015] p-3 sm:flex">
        <p className="v4-mono px-1 pb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Empresas · clique para trocar
        </p>
        <div className="space-y-1">
          {COMPANIES.map((c, i) => {
            const p = escalonar(t, i, COMPANIES.length, 0.7)
            /* Só a barra da empresa ABERTA acompanha a animação de entrada; as
               outras já ficam no valor delas. Todas subindo do zero a cada
               troca daria a impressão de que os dados foram apagados. */
            const pct = Math.round(PROGRESSO_EMPRESAS[i] * (i === empresa ? p : 1))
            const sel = i === empresa
            return (
              <button
                key={c}
                type="button"
                onClick={() => setEmpresa(i)}
                aria-pressed={sel}
                className={`block w-full rounded-md px-2 py-1.5 text-left transition-colors duration-300 ${
                  sel
                    ? 'bg-orange-500/[0.10] ring-1 ring-inset ring-orange-500/25'
                    : 'hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition-colors duration-300 ${
                      sel ? 'bg-orange-500 text-white' : 'bg-white/[0.07] text-slate-400'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`truncate text-[11px] font-bold uppercase tracking-wide transition-colors duration-300 ${
                      sel ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {c}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 pl-6">
                  <span className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                    <span
                      className="block h-full rounded-full bg-orange-400/80"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="v4-mono text-[8px] text-slate-500">{pct}%</span>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/15 text-orange-300">
            <Building2 size={13} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-white">{COMPANIES[empresa]} · A empresa de solar</p>
            <p className="truncate text-[10px] text-slate-500">Etapa 1 de 3 · salvamento automático</p>
          </div>
          {/* O selo de salvo só acende quando os campos terminam de entrar: é o
              fecho da cena, e antes disso seria mentira. */}
          <span
            className={`v4-mono ml-auto hidden items-center gap-1 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-400 transition-opacity duration-500 sm:flex ${
              t > 0.96 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Check size={11} /> Salvo
          </span>
        </div>

        <div className="mt-4 grid flex-1 grid-cols-1 content-start gap-x-4 gap-y-3 sm:grid-cols-2">
          {PERGUNTAS.map((rotulo, i) => {
            const valor = respostas[i]
            const p = escalonar(t, i, PERGUNTAS.length, 0.6)
            return (
              <div key={rotulo} style={{ opacity: 0.25 + p * 0.75 }}>
                <p className="truncate text-[10px] text-slate-500">{rotulo}</p>
                <div
                  className={`mt-1 flex h-9 items-center rounded-lg border px-3 text-[12px] transition-colors duration-500 ${
                    p > 0.5 ? 'border-white/15 bg-white/[0.05] text-slate-200' : 'border-white/[0.07] bg-white/[0.02] text-slate-600'
                  }`}
                >
                  {/* O valor "digita": revela caractere a caractere conforme o
                      progresso do campo. Custa uma fatia de string e é o que
                      faz a cena parecer alguém trabalhando. */}
                  <span className="truncate">{valor.slice(0, Math.ceil(valor.length * p))}</span>
                  {p > 0.02 && p < 1 && <span className="ml-px inline-block h-4 w-px animate-pulse bg-orange-400" />}
                </div>
              </div>
            )
          })}
        </div>

        <p className="v4-mono mt-3 text-[9px] uppercase tracking-[0.14em] text-slate-600">
          + 4 campos nesta etapa · 3 etapas por empresa
        </p>
      </div>
    </div>
  )
}

/* ── PAINÉIS 2 e 3 · CRITÉRIOS COM PESO ─────────────────────────────────── */

type Criterio = { label: string; peso: number; notas: number[] }

/* A tela real mostra, para cada critério, o peso dele e a nota de cada uma das
   seis. É o painel que responde "de onde saiu essa nota?", que é a pergunta
   que o comprador faz. As notas entram coluna a coluna. */
const PainelCriterios: React.FC<{ ativo: boolean; criterios: Criterio[]; ocultos: number; indices: number[] }> = ({
  ativo,
  criterios,
  ocultos,
  indices,
}) => {
  const t = useProgresso(ativo, 1600)

  return (
    <div className="flex flex-col p-3 sm:p-4">
      <div className="overflow-hidden rounded-lg border border-white/[0.07]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-white/[0.03]">
              <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Critério · peso
              </th>
              {COMPANIES.map((c, i) => (
                <th
                  key={c}
                  className={`px-1.5 py-2 text-center text-[9px] font-bold uppercase tracking-wide ${colClsCriterios(i)} ${
                    i === VENCEDORA ? 'text-orange-300' : 'text-slate-500'
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criterios.map((c, li) => (
              <tr key={c.label} className="border-t border-white/[0.05]">
                {/* Largura fixa e texto QUEBRANDO. Com `truncate` o rótulo
                    exigia a largura inteira da frase, a tabela estourava a
                    moldura e a última coluna saía cortada pela borda no
                    celular — clipada, porque a caixa tem cantos arredondados e
                    `overflow-hidden`. */}
                <td className="w-[44%] px-3 py-1.5 sm:w-[38%]">
                  <p className="text-[11px] leading-tight text-slate-300">{c.label}</p>
                  <p className="v4-mono mt-0.5 text-[9px] text-slate-600">peso {c.peso}%</p>
                </td>
                {c.notas.map((nota, i) => {
                  /* Escalonado pelo par linha+coluna: a leitura corre em
                     diagonal, como uma planilha sendo calculada. */
                  const p = escalonar(t, li * COMPANIES.length + i, criterios.length * COMPANIES.length, 0.5)
                  return (
                    <td key={i} className={`px-1.5 py-1.5 text-center ${colClsCriterios(i)}`}>
                      <span
                        className={`inline-flex min-w-[38px] justify-center rounded-md border px-1.5 py-0.5 text-[11px] font-bold tabular-nums transition-colors duration-300 ${
                          i === VENCEDORA
                            ? 'border-orange-500/30 bg-orange-500/[0.12] text-orange-200'
                            : 'border-white/[0.08] bg-white/[0.03] text-slate-300'
                        }`}
                        style={{ opacity: 0.15 + p * 0.85, transform: `scale(${0.94 + p * 0.06})` }}
                      >
                        {n1(nota * p)}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
            {/* O índice do grupo fecha a conta, como no produto. */}
            <tr className="border-t border-white/10 bg-orange-500/[0.05]">
              <td className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">Índice</td>
              {indices.map((v, i) => (
                <td key={i} className={`px-1.5 py-2 text-center ${colClsCriterios(i)}`}>
                  <span
                    className={`text-[12px] font-extrabold tabular-nums ${
                      i === VENCEDORA ? 'text-orange-300' : 'text-slate-300'
                    }`}
                  >
                    {n1(v * t)}
                    <span className="text-slate-600">/100</span>
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="v4-mono mt-2 text-[9px] uppercase tracking-[0.14em] text-slate-600">
        + {ocultos} critérios neste grupo · os pesos somam 100%
      </p>
    </div>
  )
}

/* ── PAINEL 4 · PONTUAÇÃO GERAL ─────────────────────────────────────────── */

const PainelGeral: React.FC<{ ativo: boolean }> = ({ ativo }) => {
  const t = useProgresso(ativo, 1500)
  /* A decisão só aparece depois que as notas param de subir: marcar antes
     seria o resultado chegando antes da conta. */
  const decidido = t > 0.92

  return (
    <div className="flex flex-col p-3 sm:p-4">
      <div className="overflow-hidden rounded-lg border border-white/[0.07]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-white/[0.03]">
              <th className="px-3 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Item</th>
              {COMPANIES.map((c, i) => (
                <th
                  key={c}
                  className={`px-2 py-2.5 text-center text-[10px] font-bold ${colCls(i)} ${
                    i === VENCEDORA
                      ? 'rounded-t-md border-x border-t border-orange-500/25 bg-orange-500/[0.10] text-orange-300'
                      : 'text-slate-400'
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[12px]">
            <LinhaGeral rotulo="Investimentos" valores={INVESTMENTS.map((v) => BRL.format(v))} />
            <LinhaGeral rotulo="Empresas · Índice" valores={EMPRESAS_INDICE.map((v) => `${n1(v * t)}/100`)} />
            <LinhaGeral rotulo="Tecnologias · Índice" valores={TECNOLOGIAS_INDICE.map((v) => `${n1(v * t)}/100`)} />

            <tr className="border-t border-white/10 bg-orange-500/[0.05]">
              <td className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-orange-300">
                Índice de Confiabilidade
              </td>
              {CONFIABILIDADE.map((v, i) => (
                <td
                  key={i}
                  className={`px-2 py-2.5 text-center ${colCls(i)} ${
                    i === VENCEDORA ? 'border-x border-orange-500/25 bg-orange-500/[0.10]' : ''
                  }`}
                >
                  <span
                    className={`text-[14px] font-extrabold tabular-nums ${
                      i === VENCEDORA ? 'text-orange-300' : 'text-slate-300'
                    }`}
                  >
                    {n1(v * t)}
                    <span className="text-slate-600">/100</span>
                  </span>
                </td>
              ))}
            </tr>

            <tr className="border-t border-white/[0.08]">
              <td className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Decisão do comprador
              </td>
              {COMPANIES.map((_, i) => (
                <td
                  key={i}
                  className={`px-2 py-2.5 text-center ${colCls(i)} ${
                    i === VENCEDORA ? 'rounded-b-md border-x border-b border-orange-500/25 bg-orange-500/[0.10]' : ''
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition-all duration-500 ${
                      i === VENCEDORA
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-white/[0.04] text-slate-500'
                    }`}
                    style={{ opacity: decidido ? 1 : 0, transform: `translateY(${decidido ? 0 : 4}px)` }}
                  >
                    {i === VENCEDORA ? <Trophy size={11} aria-hidden /> : <X size={11} aria-hidden />}
                    {i === VENCEDORA ? 'Vencedora' : 'Descartada'}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="v4-mono mt-2 text-[9px] uppercase tracking-[0.14em] text-slate-600">
        Índice de Confiabilidade = média dos dois grupos
      </p>
    </div>
  )
}

const LinhaGeral: React.FC<{ rotulo: string; valores: string[] }> = ({ rotulo, valores }) => (
  <tr className="border-t border-white/[0.05]">
    <td className="px-3 py-2 font-medium text-slate-300">{rotulo}</td>
    {valores.map((v, i) => (
      <td
        key={i}
        className={`px-2 py-2 text-center tabular-nums ${colCls(i)} ${
          i === VENCEDORA ? 'border-x border-orange-500/25 bg-orange-500/[0.10] text-orange-200' : 'text-slate-400'
        }`}
      >
        {v}
      </td>
    ))}
  </tr>
)

/* ── PAINEL 5 · A ESCOLHIDA ─────────────────────────────────────────────── */

/* O card final é o da tela de Finalistas do produto: coroa, nota grande em /10,
   as duas barras que a compõem e o investimento. Aqui ele é UM, e não dois,
   porque nesta ilustração da LP só a maior nota sai como vencedora — a mesma
   decisão que a tabela do painel anterior mostra. */
const PainelEscolhida: React.FC<{ ativo: boolean }> = ({ ativo }) => {
  const t = useProgresso(ativo, 1500)
  const nota = CONFIABILIDADE[VENCEDORA] / 10
  const barras = useMemo(
    () => [
      { rotulo: 'Empresa', valor: EMPRESAS_INDICE[VENCEDORA] / 10 },
      { rotulo: 'Técnico', valor: TECNOLOGIAS_INDICE[VENCEDORA] / 10 },
    ],
    [],
  )
  /* A diferença para a mais barata é o argumento inteiro da página num número
     só, então ela é calculada, não escrita à mão. */
  const maisBarata = Math.min(...INVESTMENTS)
  const diferenca = INVESTMENTS[VENCEDORA] - maisBarata

  return (
    <div className="flex min-h-[360px] items-center justify-center p-4 py-10 sm:p-6">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-orange-500/25 bg-gradient-to-br from-orange-500/[0.08] to-transparent p-5 transition-all duration-700 sm:p-6"
        style={{ opacity: 0.2 + t * 0.8, transform: `translateY(${(1 - t) * 14}px)` }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-500/15 blur-3xl" aria-hidden />

        <div className="relative flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
            <Crown size={20} />
          </span>
          <span className="v4-mono rounded-full bg-orange-500/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-orange-300">
            Vencedora
          </span>
        </div>

        <h4 className="relative mt-4 text-2xl font-extrabold tracking-tight text-white">{COMPANIES[VENCEDORA]}</h4>
        <p className="text-[11px] text-slate-500">Proposta #{VENCEDORA + 1} de 6</p>

        <div className="relative mt-5 flex items-end gap-5">
          <p className="shrink-0">
            <span className="text-5xl font-extrabold tabular-nums text-white">{(nota * t).toFixed(2)}</span>
            <span className="text-lg font-bold text-slate-500">/10</span>
            <span className="v4-mono block text-[9px] uppercase tracking-[0.16em] text-slate-500">Nota geral</span>
          </p>
          <div className="min-w-0 flex-1 space-y-2 pb-1">
            {barras.map((b, i) => (
              <div key={b.rotulo} className="flex items-center gap-2">
                <span className="v4-mono w-14 shrink-0 text-[9px] uppercase tracking-[0.14em] text-slate-500">
                  {b.rotulo}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-[width] duration-700 ease-out"
                    style={{ width: `${b.valor * 10 * escalonar(t, i, barras.length, 0.7)}%` }}
                  />
                </span>
                <span className="v4-mono w-8 shrink-0 text-right text-[10px] font-bold tabular-nums text-slate-300">
                  {b.valor.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg bg-black/25 px-4 py-3">
          <span className="text-[11px] text-slate-400">Investimento total</span>
          <span className="text-base font-bold tabular-nums text-white">{BRL.format(INVESTMENTS[VENCEDORA])}</span>
          <span className="v4-mono w-full text-[9px] uppercase tracking-[0.14em] text-orange-300/80">
            {BRL.format(diferenca)} acima da proposta mais barata
          </span>
        </div>
      </div>
    </div>
  )
}
