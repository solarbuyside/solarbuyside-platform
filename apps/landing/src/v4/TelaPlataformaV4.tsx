import React, { useCallback, useEffect, useState } from 'react'
import { BookOpen, Check, LayoutGrid, Search, Sparkles, Trophy, X, ZoomIn } from 'lucide-react'
import { Img } from './atoms'

/* O MOCKUP DA PLATAFORMA — duas cenas, não um print.

   Gabriel, 09/08: "é uma plataforma, ela é mexível, bota um mockup mais real,
   da versão da plataforma na tela do MANUAL, pra ler alguma página, e aí muda
   pra avaliação, mostrando as propostas".

   Então a tela conta uma história em dois tempos, que é a história do produto:

     CENA 1 — MANUAL. O Manual aberto dentro da Plataforma, rolando devagar
     como quem lê. A página para no sumário e um grifo cai em cima de uma linha
     específica: "AVALIE SEIS PROPOSTAS E SELECIONE AS DUAS MELHORES".

     CENA 2 — AVALIAÇÃO. A Plataforma fazendo exatamente aquilo: seis propostas
     pontuadas, as notas subindo de zero, duas eleitas finalistas.

   O grifo não é enfeite: é a emenda entre as duas cenas. O Manual MANDA fazer,
   a Plataforma FAZ. É o argumento do kit inteiro em catorze segundos, sem que
   o visitante precise ler uma linha de copy.

   POR QUE NÃO GIF (nem Remotion, nem vídeo)
   Um GIF desta tela passaria de 1 MB, borraria em tela larga, não teria texto
   selecionável nem indexável, e continuaria passivo. Isto custa alguns kB de
   markup, fica nítido em qualquer densidade, respeita `prefers-reduced-motion`
   e, principalmente, o visitante MEXE: troca de aba, passa o mouse nas
   colunas, escolhe as próprias finalistas. Renderizar vídeo para simular uma
   interface interativa é o caminho mais caro para o resultado pior.

   RESSALVA DE CONTEÚDO: a página usada é `manual-indice-p10`, que é SUMÁRIO. O
   Gabriel pediu "uma página, pode ser a 30", e página de miolo não existe
   exportada hoje. O sumário até serve ao argumento (mostra o tamanho do método
   e contém exatamente a linha do grifo), mas se ele quiser miolo é exportar o
   PNG e trocar `PAGINA_MANUAL` — e junto o `GRIFO_TOPO`, que é onde a linha
   grifada mora dentro da página. */

const PAGINA_MANUAL = '/assets/manual-indice-p10.png'

/* Em % da ALTURA DA PÁGINA: a linha "AVALIE SEIS PROPOSTAS E SELECIONE AS DUAS
   MELHORES" está a 396px de uma página de 736px. */
const GRIFO_TOPO = 53.9

type Proposta = {
  nome: string
  investimento: number
  empresas: number
  tecnologia: number
}

/* Os seis fornecedores de exemplo da captura antiga, com os índices de
   Empresas que ela trazia. As notas de Tecnologia vinham todas 100/100 — um
   caso degenerado que lê como coluna quebrada — e foram abertas.

   O total é a MÉDIA dos dois índices, que é a conta da Plataforma: dá para
   conferir linha a linha. E a tabela conta uma coisa sozinha: a proposta mais
   barata (Tap Solar, R$ 14.500) é a quarta colocada. É a tese da página
   inteira acontecendo em números. */
const PROPOSTAS: Proposta[] = [
  { nome: 'Renova', investimento: 17690, empresas: 73, tecnologia: 92 },
  { nome: 'Soli Solar', investimento: 16342, empresas: 83, tecnologia: 96 },
  { nome: 'Energia SGE', investimento: 15900, empresas: 19.4, tecnologia: 64 },
  { nome: 'Tap Solar', investimento: 14500, empresas: 38, tecnologia: 71 },
  { nome: 'Fotovolta Express', investimento: 17326.75, empresas: 60, tecnologia: 88 },
  { nome: 'Self Solar', investimento: 16500, empresas: 33, tecnologia: 58 },
]

const indice = (p: Proposta) => (p.empresas + p.tecnologia) / 2

/** As duas melhores: a Plataforma pede exatamente duas finalistas. */
const MELHORES = [...PROPOSTAS]
  .sort((a, b) => indice(b) - indice(a))
  .slice(0, 2)
  .map((p) => p.nome)

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const num = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

type Cena = 'manual' | 'avaliacao'

/* A cena do Manual é mais curta: ela só precisa mostrar o grifo chegando. A da
   Avaliação tem uma tabela inteira para ser lida. */
const DURACAO: Record<Cena, number> = { manual: 5200, avaliacao: 9000 }

const movimentoReduzido = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* O CICLO ENTRE AS CENAS.

   Alterna sozinho enquanto ninguém toca e PARA DE VEZ no primeiro clique: uma
   tela que continua trocando debaixo da mão de quem está usando é hostil, e
   quem clicou já entendeu que dá para trocar. */
function useCiclo(): { cena: Cena; irPara: (c: Cena) => void; auto: boolean } {
  const [cena, setCena] = useState<Cena>('manual')
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto || movimentoReduzido()) return
    const id = window.setTimeout(() => setCena((c) => (c === 'manual' ? 'avaliacao' : 'manual')), DURACAO[cena])
    return () => window.clearTimeout(id)
  }, [cena, auto])

  const irPara = useCallback((c: Cena) => {
    setAuto(false)
    setCena(c)
  }, [])

  return { cena, irPara, auto }
}

export const TelaPlataformaV4: React.FC = () => {
  const { cena, irPara, auto } = useCiclo()

  return (
    <div className="overflow-hidden rounded-t-xl bg-[#0f172a] shadow-[0_-10px_80px_-20px_rgba(249,115,22,0.35),0_40px_90px_-30px_rgba(0,0,0,0.95)] ring-1 ring-white/10">
      {/* Barra do navegador. A URL acompanha a cena: detalhe pequeno, mas é o
          que faz o mockup parecer um sistema em vez de uma ilustração. */}
      <div className="flex items-center gap-3 bg-[#0b1220] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="v4-mono mx-auto truncate rounded-md bg-black/40 px-4 py-1 text-[11px] text-slate-400">
          plataforma.solarbuyside.com.br/{cena === 'manual' ? 'manual' : 'comparativo'}
        </span>
      </div>

      {/* Barra do aplicativo. As abas são botões de verdade: é aqui que o "ela
          é mexível" deixa de ser promessa. */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-4">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <Aba icone={BookOpen} rotulo="Manual" ativa={cena === 'manual'} aoClicar={() => irPara('manual')} />
          <Aba icone={LayoutGrid} rotulo="Avaliação" ativa={cena === 'avaliacao'} aoClicar={() => irPara('avaliacao')} />
        </div>
        {/* Barrinha do ciclo automático: avisa que a tela vai trocar sozinha,
            para a troca não pegar ninguém de surpresa. Some no instante em que
            o visitante assume o controle. */}
        {auto && (
          <span className="hidden h-1 w-16 overflow-hidden rounded-full bg-slate-200 sm:block" aria-hidden>
            <span
              key={cena}
              className="v4-tela-progresso block h-full w-full origin-left rounded-full bg-orange-400"
              style={{ ['--dur' as string]: `${DURACAO[cena]}ms` }}
            />
          </span>
        )}
        <span className="ml-auto hidden items-center gap-1 text-[11px] font-semibold text-emerald-600 sm:flex">
          <Check size={12} aria-hidden /> Salvo
        </span>
      </div>

      {/* ALTURA FIXA. Sem isso a moldura pula de tamanho a cada troca, e um
          layout que salta sozinho na primeira dobra lê como página quebrada e
          não como animação.

          Cresceu ~60px (Gabriel, 09/08: "poderia ser um pouco mais alto"). Dá
          para crescer à vontade sem custo: as duas cenas ancoram o conteúdo no
          TOPO, então a altura extra sai toda no pé da moldura, que já é a parte
          cortada pela dobra de propósito. A linha do Índice de Confiabilidade
          não se mexe. */}
      <div className="relative h-[340px] overflow-hidden bg-[#f1f5f9] sm:h-[390px] lg:h-[420px]">
        <Palco visivel={cena === 'manual'}>
          <CenaManual ativa={cena === 'manual'} />
        </Palco>
        <Palco visivel={cena === 'avaliacao'}>
          <CenaAvaliacao ativa={cena === 'avaliacao'} />
        </Palco>
      </div>
    </div>
  )
}

const Aba: React.FC<{
  icone: React.ComponentType<{ size?: number; className?: string }>
  rotulo: string
  ativa: boolean
  aoClicar: () => void
}> = ({ icone: Icone, rotulo, ativa, aoClicar }) => (
  <button
    type="button"
    onClick={aoClicar}
    aria-pressed={ativa}
    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold transition-all active:scale-95 sm:px-3 sm:text-xs ${
      ativa ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
    }`}
  >
    <Icone size={13} className={ativa ? 'text-orange-500' : ''} />
    {rotulo}
  </button>
)

/* As duas cenas ficam MONTADAS o tempo todo, empilhadas, e o que muda é a
   opacidade. Desmontar reiniciaria a escolha do visitante a cada volta do
   ciclo e faria o navegador reencontrar a imagem da página. */
const Palco: React.FC<{ visivel: boolean; children: React.ReactNode }> = ({ visivel, children }) => (
  <div
    className={`absolute inset-0 transition-opacity duration-500 ${
      visivel ? 'opacity-100' : 'pointer-events-none opacity-0'
    }`}
    aria-hidden={!visivel}
  >
    {children}
  </div>
)

/* ── CENA 1: o Manual aberto ───────────────────────────────────────────── */

const CenaManual: React.FC<{ ativa: boolean }> = ({ ativa }) => (
  <div className="flex h-full flex-col">
    {/* Barra do leitor. Zoom e busca são decorativos de propósito: dizem "isto
        é um leitor" sem prometer um controle que o mockup não tem. */}
    <div className="flex items-center gap-2 border-b border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] text-slate-500 sm:px-4">
      <BookOpen size={13} className="shrink-0 text-orange-500" aria-hidden />
      <span className="truncate font-semibold text-slate-700">Manual de Compra de Sistema Solar</span>
      {/* "página 10", sem total. Estava "página 10 de 96" e o 96 era chute meu:
          o sumário desta página só vai até a 78 e ninguém aqui sabe onde o
          Manual termina. Número inventado em mockup de produto é do mesmo tipo
          do banner que saiu logo acima. */}
      <span className="hidden whitespace-nowrap text-slate-400 sm:inline">· página 10</span>
      <span className="ml-auto flex shrink-0 items-center gap-2 text-slate-400" aria-hidden>
        <ZoomIn size={13} />
        <Search size={13} />
      </span>
    </div>

    {/* SEM a faixa "Fase 3 do método: avalie seis propostas..." que existia
        aqui (Gabriel, 09/08: "esse banner nem existe"). Ele estava certo, e o
        problema é maior que o estético: era um elemento de interface INVENTADO
        dentro de um mockup que promete ser o produto. Mockup pode simplificar
        o que existe; não pode acrescentar o que não existe, senão o lead compra
        esperando uma tela que não vai encontrar.

        E a faixa era redundante: o grifo cai numa linha que a própria página do
        Manual já diz, em caixa alta, com essas palavras. Legendar em cima o que
        o documento afirma embaixo é não confiar no material. */}

    {/* O "papel" rola devagar dentro do leitor e para com o grifo à vista. */}
    <div className="relative flex-1 overflow-hidden bg-slate-300/60">
      {/* Trilha de miniaturas, como todo leitor de PDF tem. Ela não é enfeite:
          sem ela sobra meia moldura de fundo liso dos dois lados da página, e
          a cena lê como uma imagem centralizada em vez de um leitor. */}
      <div className="absolute inset-y-0 left-0 hidden w-[76px] flex-col gap-1.5 overflow-hidden border-r border-slate-400/30 bg-slate-200/70 p-2 lg:flex" aria-hidden>
        {[8, 9, 10, 11].map((n) => (
          <span
            key={n}
            className={`flex h-[52px] shrink-0 items-end justify-center rounded-sm border pb-0.5 text-[9px] font-bold ${
              n === 10
                ? 'border-orange-400 bg-white text-orange-600 ring-1 ring-orange-400/40'
                : 'border-slate-300 bg-white/70 text-slate-400'
            }`}
          >
            {n}
          </span>
        ))}
      </div>

      {/* DUAS CAMADAS, e não uma. A de fora centra na horizontal, a de dentro
          rola na vertical. Numa camada só o `transform` da animação substitui o
          `-translate-x-1/2` do Tailwind (é a mesma propriedade) e a página
          desliza para a direita no primeiro quadro. */}
      <div className="absolute left-1/2 top-3 w-[230px] -translate-x-1/2 sm:w-[320px] lg:w-[390px] lg:left-[calc(50%+38px)]">
        <div key={ativa ? 'lendo' : 'parado'} className={ativa ? 'v4-tela-folha' : ''}>
          <div className="relative shadow-[0_18px_40px_-12px_rgba(15,23,42,0.55)]">
            <Img
              src={PAGINA_MANUAL}
              alt="Página 10 do Manual de Compra de Sistema Solar, com o sumário do método"
              loading="lazy"
              className="block h-auto w-full bg-white"
            />
            {/* O GRIFO: cresce da esquerda para a direita, como marca-texto, e
                é a emenda para a cena seguinte. */}
            <span
              className={`absolute left-[6%] w-[80%] origin-left rounded-[2px] bg-orange-400/45 mix-blend-multiply ${
                ativa ? 'v4-tela-grifo' : 'scale-x-0'
              }`}
              style={{ top: `${GRIFO_TOPO}%`, height: '2.4%' }}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  </div>
)

/* ── CENA 2: a Avaliação ───────────────────────────────────────────────── */

/* As notas sobem de zero, coluna a coluna, como se a análise estivesse
   rodando: um número que já está lá é um print, um número que se forma é um
   cálculo. Reinicia toda vez que a cena entra, senão na segunda volta do ciclo
   o visitante encontra a tabela pronta e a cena perde a graça. */
function useAnalise(ativa: boolean): { p: (i: number) => number; automaticas: string[] } {
  const reduzido = movimentoReduzido()
  const [t, setT] = useState(reduzido ? 1 : 0)
  const [pronto, setPronto] = useState(reduzido)

  useEffect(() => {
    if (!ativa || reduzido) return
    let raf = 0
    let inicio = 0
    const DUR = 1100
    /* O reinício mora no PRIMEIRO QUADRO, não no corpo do efeito. Chamar
       setState direto aqui dispararia uma renderização em cascata (e o
       react-hooks/set-state-in-effect reclama, com razão); dentro do rAF é o
       mesmo efeito visual um quadro depois, que ninguém enxerga. */
    const passo = (agora: number) => {
      if (!inicio) {
        inicio = agora
        setPronto(false)
      }
      const p = Math.min(1, (agora - inicio) / DUR)
      setT(p)
      if (p < 1) raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    /* As finalistas só aparecem DEPOIS que as notas param de subir: marcar
       antes seria o resultado chegando antes da conta. */
    const id = window.setTimeout(() => setPronto(true), DUR + 400)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(id)
    }
  }, [ativa, reduzido])

  return {
    p: (i: number) => Math.max(0, Math.min(1, (t - i * 0.06) / 0.7)),
    automaticas: pronto ? MELHORES : [],
  }
}

const CenaAvaliacao: React.FC<{ ativa: boolean }> = ({ ativa }) => {
  const { p, automaticas } = useAnalise(ativa)
  /* `null` = ninguém tocou, então vale a escolha automática. No primeiro
     clique o visitante assume o controle, inclusive para desmarcar tudo. */
  const [escolha, setEscolha] = useState<string[] | null>(null)
  const [coluna, setColuna] = useState<string | null>(null)
  const finalistas = escolha ?? automaticas

  const alternar = (nome: string) => {
    const atual = escolha ?? automaticas
    setEscolha(atual.includes(nome) ? atual.filter((n) => n !== nome) : [...atual, nome])
  }

  /* SEM o título "Seção 1 — Pontuação das propostas" que o produto tem. Os
     ~24px dele eram a diferença entre a linha da Decisão do Comprador aparecer
     ou não na dobra de 900px, e a aba logo acima já diz "Avaliação". Rótulo
     repetido custando a linha mais importante da tela é troca ruim. */
  return (
    <div className="flex h-full flex-col px-3 pb-2 pt-2 sm:px-4">
      {/* `flex-none`, e não `flex-1`: a tabela tem a altura que precisa e o
          rodapé vem logo abaixo dela. Com `flex-1` ela esticava até o pé da
          moldura e empurrava o rodapé junto, de forma que crescer a altura
          afundava a confirmação de finalistas para fora da dobra. A sobra fica
          embaixo, como área livre do aplicativo, que é o que um sistema de
          verdade mostra quando a tabela é curta.

          Rola sozinha no celular: sete colunas não cabem em 390px, e encolher
          a fonte até caber deixaria ilegível justo a tela que existe para ser
          lida. */}
      <div className="max-h-full flex-none overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-left text-[12px]">
          <caption className="sr-only">
            Demonstração da Plataforma de Avaliação: seis propostas de exemplo pontuadas lado a lado pelo Índice
            de Confiabilidade Solar Buy-Side.
          </caption>
          <thead>
            <tr className="bg-[#09143c] text-white">
              <th scope="col" className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider">
                Item
              </th>
              {PROPOSTAS.map((prop) => (
                <th
                  key={prop.nome}
                  scope="col"
                  onMouseEnter={() => setColuna(prop.nome)}
                  onMouseLeave={() => setColuna(null)}
                  className={`border-l border-white/10 px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    coluna === prop.nome ? 'bg-white/10' : ''
                  }`}
                >
                  {prop.nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Linha rotulo="Investimentos" coluna={coluna} aoEntrar={setColuna}>
              {(prop) => BRL.format(prop.investimento)}
            </Linha>
            <Linha rotulo="Empresas — Índice" coluna={coluna} aoEntrar={setColuna}>
              {(prop, i) => `${num(prop.empresas * p(i))}/100`}
            </Linha>
            <Linha rotulo="Nota ponderada" coluna={coluna} aoEntrar={setColuna} discreta>
              {(prop, i) => `${num((prop.empresas * p(i)) / 10)}/10`}
            </Linha>
            <Linha rotulo="Tecnologias — Índice" coluna={coluna} aoEntrar={setColuna}>
              {(prop, i) => `${num(prop.tecnologia * p(i))}/100`}
            </Linha>
            <Linha rotulo="Nota ponderada" coluna={coluna} aoEntrar={setColuna} discreta>
              {(prop, i) => `${num((prop.tecnologia * p(i)) / 10)}/10`}
            </Linha>

            {/* A linha que decide: é ela que ordena as seis, e é o único número
                que o visitante precisa entender para entender a Plataforma. */}
            <tr className="bg-orange-50/70">
              <th scope="row" className="px-3 py-2 text-[11px] font-bold text-slate-900">
                Índice de Confiabilidade Solar Buy-Side
              </th>
              {PROPOSTAS.map((prop, i) => (
                <td
                  key={prop.nome}
                  onMouseEnter={() => setColuna(prop.nome)}
                  onMouseLeave={() => setColuna(null)}
                  className={`border-l border-orange-100 px-2 py-2 text-center text-[13px] font-extrabold tabular-nums transition-colors ${
                    finalistas.includes(prop.nome) ? 'text-emerald-600' : 'text-orange-600'
                  } ${coluna === prop.nome ? 'bg-orange-100/70' : ''}`}
                >
                  {num(indice(prop) * p(i))}/100
                </td>
              ))}
            </tr>

            <tr className="border-t-2 border-slate-200">
              <th
                scope="row"
                className="bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700"
              >
                Decisão do comprador
              </th>
              {PROPOSTAS.map((prop) => {
                const eh = finalistas.includes(prop.nome)
                return (
                  <td
                    key={prop.nome}
                    onMouseEnter={() => setColuna(prop.nome)}
                    onMouseLeave={() => setColuna(null)}
                    className={`border-l border-slate-100 px-2 py-1.5 text-center transition-colors ${
                      coluna === prop.nome ? 'bg-slate-50' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => alternar(prop.nome)}
                      aria-pressed={eh}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition-all active:scale-95 ${
                        eh
                          ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {eh ? <Trophy size={12} aria-hidden /> : <X size={12} aria-hidden />}
                      {eh ? 'Finalista' : 'Descartada'}
                      <span className="sr-only"> — {prop.nome}</span>
                    </button>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Confirma o estado, como o produto faz, e avisa que os dados são de
          exemplo: seis fornecedores nomeados com nota, sem esse aviso, lêem
          como avaliação real de empresas reais. */}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
        <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
          <Check size={12} aria-hidden />
          {finalistas.length} de 2 finalistas selecionados
        </p>
        <p className="flex items-center gap-1 text-[11px] text-slate-500">
          <Sparkles size={11} className="text-orange-500" aria-hidden />
          Dados de exemplo. Clique numa coluna para escolher as suas finalistas.
        </p>
      </div>
    </div>
  )
}

/** Uma linha da tabela. `discreta` é a nota ponderada, em itálico apagado. */
const Linha: React.FC<{
  rotulo: string
  coluna: string | null
  aoEntrar: (n: string | null) => void
  discreta?: boolean
  children: (prop: Proposta, i: number) => React.ReactNode
}> = ({ rotulo, coluna, aoEntrar, discreta = false, children }) => (
  <tr className="border-t border-slate-100">
    <th
      scope="row"
      className={`px-3 py-1.5 text-left font-normal ${
        discreta ? 'text-[11px] italic text-slate-400' : 'text-slate-700'
      }`}
    >
      {rotulo}
    </th>
    {PROPOSTAS.map((prop, i) => (
      <td
        key={prop.nome}
        onMouseEnter={() => aoEntrar(prop.nome)}
        onMouseLeave={() => aoEntrar(null)}
        className={`border-l border-slate-100 px-2 py-1.5 text-center tabular-nums transition-colors ${
          discreta ? 'text-[11px] italic text-slate-400' : 'text-slate-700'
        } ${coluna === prop.nome ? 'bg-slate-50' : ''}`}
      >
        {children(prop, i)}
      </td>
    ))}
  </tr>
)
