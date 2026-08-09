import React from 'react'
import { Trophy, X } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Cta, CtaArrow, GrainOverlay, Kicker, Reveal, SolarCells } from './atoms'
import { scrollToId } from './scroll'
import { criarTxt, temConteudo } from './cms'

/* PLATAFORMA DE AVALIAÇÃO — bloco reescrito conforme os slides do Francis
   (2026-06): copy virada pro vendedor ("sua proposta tem nota; teste antes que
   o mercado teste") + um EXEMPLO REAL da tela de Pontuação Geral embutido na LP.
   Estrutura da tabela (decisão do Francis):
   - índices por grupo + Índice de Confiabilidade, todos /100;
   - SEM as sub-linhas decimais "nota /10";
   - SEM a linha de Viabilidade (removida em 06/08, slide 5): ela existia só
     para mostrar "/" em todas as colunas, dizendo que é informativa e não
     pontua. Seis células vazias explicando uma ausência custavam mais atenção
     do que informavam;
   - Decisão do comprador: só a maior nota total sai como VENCEDORA e as
     demais como descartadas (Francis, 03/08);
   - Escala de risco abaixo da tabela, em tamanho menor e na régua /100;
   - mobile: 4 colunas (a vencedora + melhor e pior índice).
   Estilo segue o padrão das seções escuras: destaque de título em
   v4-serif laranja e lead em slate (sem o lead âmbar, que é exclusivo do
   spotlight do Manual). */

const COMPANIES = ['Renova', 'Soli Brasil', 'Energia SGE', 'TAP Solar', 'Fotovolta Express', 'Self Solar'] as const
const INVESTMENTS = [17690, 16342.8, 15900, 14500, 17325.75, 17497]
const EMPRESAS_INDICE = [66.9, 84.5, 26.8, 55.5, 69.1, 69.3]
const TECNOLOGIAS_INDICE = [61.1, 73.7, 57.9, 55.8, 53.7, 74.7]
const CONFIABILIDADE = [64.1, 79.2, 41.9, 55.6, 61.6, 72.0]
/* Vencedora do exemplo: só a maior nota total (Índice de Confiabilidade) —
   Soli Brasil (1), 79.2. As demais são descartadas.

   "Vencedora", não "Finalista" (Francis, slide 3 de 03/08): no produto o
   comprador escolhe DOIS finalistas e depois decide entre eles, mas neste
   exemplo só uma empresa chega ao fim, e "finalista" ficava sem par. A troca
   vale só para a ilustração da LP; o domínio da plataforma continua com dois
   finalistas. */
const WINNERS = new Set([1])

/* No mobile a tabela mostra só 4 fornecedores (a vencedora + a melhor e a
   pior pontuação); TAP Solar e Fotovolta Express aparecem a partir de md. */
const MOBILE_HIDDEN = new Set([3, 4])
const colCls = (i: number) => (MOBILE_HIDDEN.has(i) ? 'hidden md:table-cell' : '')

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })

/* Escala na MESMA régua da tabela (/100) — a versão /10 da plataforma não faz
   sentido aqui porque as sub-linhas "nota /10" foram removidas do exemplo.

   As faixas eram 0–40 / 50–60 / 70–80 / 90–100 e deixavam buracos: uma nota
   61,6 (Fotovolta Express, na própria tabela acima) não caía em faixa
   nenhuma. Agora cobrem 0 a 100 sem buraco e sem sobreposição (Francis,
   slide 3 de 03/08). A mesma correção foi feita na régua /10 do comparativo
   da plataforma. */
const RISK = [
  { range: '0–40', label: 'Risco Crítico', cls: 'bg-red-500' },
  { range: '41–60', label: 'Risco Moderado', cls: 'bg-amber-500' },
  { range: '61–80', label: 'Risco Baixo', cls: 'bg-emerald-500' },
  { range: '81–100', label: 'Risco Mínimo', cls: 'bg-blue-500' },
] as const

/* Moldura de janela (mesma da experiência do produto) */
const Window: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className = '',
}) => (
  <div
    className={`relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0e18]/90 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl ${className}`}
  >
    <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
      <span className="flex gap-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      </span>
      <span className="v4-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">{title}</span>
    </div>
    {children}
  </div>
)

const DecisionTag: React.FC<{ winner: boolean }> = ({ winner }) =>
  winner ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-300">
      <Trophy size={11} aria-hidden /> Vencedora
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-slate-500">
      <X size={11} aria-hidden /> Descartada
    </span>
  )

/* Realce da coluna vencedora (Francis, 06/08, slide 5: "destacar com fundo
   laranjado"). Era `bg-orange-500/[0.04]`, praticamente invisível: no print
   que ele mandou ele precisou desenhar um retângulo vermelho à mão em volta
   das células para mostrar de qual coluna estava falando. Agora é fundo a 10%
   mais fios laterais, que é o que faz o olho ler uma COLUNA e não seis células
   soltas. Os fios ficam só nas células de dado; o cabeçalho e as duas linhas
   de fecho têm regra própria mais abaixo. */
const COL_VENCEDORA = 'bg-orange-500/[0.10] border-x border-orange-500/25'

const fin = (i: number, extra = '') =>
  `px-3 py-2.5 text-center ${colCls(i)} ${WINNERS.has(i) ? `${COL_VENCEDORA} ${extra}` : extra}`

const ScoreTableExample: React.FC = () => (
  <Window title="Plataforma · Pontuação Geral · exemplo real">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th className="sticky left-0 z-10 bg-[#0a0e18] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              Item
            </th>
            {COMPANIES.map((c, i) => (
              <th
                key={c}
                className={`min-w-[104px] px-3 py-3 text-center text-[11px] font-bold ${colCls(i)} ${
                  WINNERS.has(i)
                    ? 'rounded-t-lg border-x border-t border-orange-500/25 bg-orange-500/[0.10] text-orange-300'
                    : 'text-slate-400'
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[12px]">
          {/* Investimentos */}
          <tr className="border-b border-white/[0.05]">
            <td className="sticky left-0 z-10 bg-[#0a0e18] px-4 py-2.5 font-medium text-slate-300">Investimentos</td>
            {INVESTMENTS.map((v, i) => (
              <td key={i} className={fin(i, 'text-slate-400')}>
                {BRL.format(v)}
              </td>
            ))}
          </tr>

          {/* Empresas — Índice */}
          <tr className="border-b border-white/[0.05]">
            <td className="sticky left-0 z-10 bg-[#0a0e18] px-4 py-2.5 font-medium text-slate-300">Empresas · Índice</td>
            {EMPRESAS_INDICE.map((v, i) => (
              <td key={i} className={fin(i, 'text-slate-300')}>
                {v}
                <span className="text-slate-600">/100</span>
              </td>
            ))}
          </tr>

          {/* Tecnologias — Índice */}
          <tr className="border-b border-white/[0.05]">
            <td className="sticky left-0 z-10 bg-[#0a0e18] px-4 py-2.5 font-medium text-slate-300">Tecnologias · Índice</td>
            {TECNOLOGIAS_INDICE.map((v, i) => (
              <td key={i} className={fin(i, 'text-slate-300')}>
                {v}
                <span className="text-slate-600">/100</span>
              </td>
            ))}
          </tr>

          {/* Índice de Confiabilidade Solar Buy-Side (destaque) */}
          <tr className="border-t border-white/10 bg-orange-500/[0.06]">
            <td className="sticky left-0 z-10 bg-[#0a0e18] px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-orange-300">
              Índice de Confiabilidade
            </td>
            {CONFIABILIDADE.map((v, i) => (
              <td
                key={i}
                className={`px-3 py-3 text-center ${colCls(i)} ${
                  WINNERS.has(i) ? 'border-x border-orange-500/25 bg-orange-500/[0.16]' : ''
                }`}
              >
                <span className={`font-['Sora'] text-lg font-extrabold ${WINNERS.has(i) ? 'text-orange-400' : 'text-slate-300'}`}>
                  {v}
                </span>
                <span className="text-[9px] text-slate-500">/100</span>
              </td>
            ))}
          </tr>

          {/* Decisão do comprador */}
          <tr className="border-t border-white/[0.08]">
            <td className="sticky left-0 z-10 bg-[#0a0e18] px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Decisão do comprador
            </td>
            {COMPANIES.map((_, i) => (
              <td
                key={i}
                className={`px-3 py-3 text-center ${colCls(i)} ${
                  WINNERS.has(i) ? 'rounded-b-lg border-x border-b border-orange-500/25 bg-orange-500/[0.10]' : ''
                }`}
              >
                <DecisionTag winner={WINNERS.has(i)} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  </Window>
)

/* Escala de risco — abaixo da tabela, compacta (tamanho menor, pedido do Francis) */
const RiskScale: React.FC = () => (
  <div className="mt-5">
    <p className="v4-mono mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Escala de risco</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {RISK.map((r) => (
        <div key={r.range} className={`rounded-lg ${r.cls} px-3 py-2 text-center text-white`}>
          <p className="font-['Sora'] text-sm font-extrabold leading-none">{r.range}</p>
          <p className="mt-1 text-[10px] font-semibold opacity-90">{r.label}</p>
        </div>
      ))}
    </div>
  </div>
)

export const PlatformV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('plataforma')
  const txt = criarTxt(section)

  const badge = txt('badge', 'Bônus Exclusivo')

  /* TÍTULO EM DUAS CORES (Francis, 06/08, slide 5: "a segunda parte do título
     deve ser de cor branca").

     Até aqui era o contrário: `title` saía branco e `titleHighlight` saía
     laranja serifado. As cores trocaram de campo, não de posição: a PRIMEIRA
     parte é o gancho em laranja serifada e a SEGUNDA é a continuação em
     branco.

     LEGADO: no banco ele escreveu a frase INTEIRA em `titleHighlight` e
     deixou `title` vazio (foi o que o print dele mostrou, com o título todo
     laranja). Trocar as cores sem tratar isso deixaria o título inteiro
     branco. Então, quando só o segundo campo tem texto, a frase é partida no
     fim da primeira sentença: o gancho vai para o laranja e o resto para o
     branco. Quando ele preencher os dois campos, este ramo nunca roda. */
  const tituloCms = txt('title', '')
  const destaqueCms = txt('titleHighlight', '')
  const [tituloLaranja, tituloBranco] = (() => {
    if (temConteudo(tituloCms) || temConteudo(destaqueCms)) {
      if (temConteudo(tituloCms)) return [tituloCms, destaqueCms]
      // Só o segundo campo preenchido: parte no primeiro ponto final.
      const ponto = destaqueCms.indexOf('. ')
      if (ponto === -1) return [destaqueCms, '']
      return [destaqueCms.slice(0, ponto + 1).trim(), destaqueCms.slice(ponto + 1).trim()]
    }
    return ['Sua proposta tem nota.', 'Do seu concorrente também.']
  })()

  const lead =
    txt('lead', 'A Plataforma de Avaliação Solar Buy-Side revela as forças e fraquezas das suas ofertas, ajudando sua empresa a entregar propostas mais competitivas, confiáveis e persuasivas.')
  const legenda = txt(
    'tableCaption',
    'Seis propostas para o mesmo cliente. Venceu a de <span class="cms-bold">R$ 16.342,80</span>, nem a mais cara, nem a mais barata, porque teve o maior Índice de Confiabilidade: <span class="cms-orange">79,2 de 100</span>, com a melhor pontuação em reputação da integradora e em tecnologia proposta.',
  )
  const bullets = [
    txt('bullet1', 'Compare propostas de fornecedores lado a lado'),
    txt('bullet2', 'Pontuação por reputação, tecnologia e viabilidade'),
    txt('bullet3', 'Índice de Confiabilidade de 0 a 100 para cada fornecedor'),
  ]
  // CTA 5 (Francis, slide 15: "criar CTA 5"). O botão já existia aqui, o que
  // mudou foi a frase: agora nomeia os três itens do pacote. O texto anterior
  // é tratado como legado para a LP não depender do seed.
  const ctaCms = txt('ctaButton', '')
  const ctaButton = !ctaCms || ctaCms === 'Quero o Manual + Plataforma'
    ? 'Quero o Manual + o Código + acesso à Plataforma'
    : ctaCms

  return (
    <section className="relative overflow-hidden bg-[#07090d] text-slate-100 antialiased">
      {/* GRADE PLENA, e não `center` (Gabriel, 09/08: "a segunda seção tem que
          continuar a primeira").

          A cor nunca foi o problema: as duas seções são #07090d, o mesmo preto
          do disco solar. O que criava a linha de costura era a GRADE. O Hero
          termina com as células acesas na borda de baixo, e o `fade="center"`
          é uma máscara radial que zera a grade justamente na borda de cima
          desta seção. Grade acima, nada abaixo: o olho lê a diferença de
          textura como diferença de cor, porque as linhas a 7% de branco
          clareiam a média do preto.

          Com `full` a grade atravessa a emenda inteira. E ela casa sozinha,
          sem calibragem: `.v4-cells` usa `background-attachment: fixed`, então
          a fase das linhas é a mesma em todas as seções e os quadrados de 40px
          continuam alinhados de uma para a outra. É exatamente o caso de ponte
          para o qual o `full` existe (ver `SolarCells` em atoms.tsx). */}
      <SolarCells fade="full" />
      {/* O GRÃO, que faltava. Com a grade corrigida ainda sobrava uma linha
          visível na emenda, então em vez de continuar no olho eu medi os pixels
          dos dois lados: acima 11,21 de luminância média com desvio 0,161;
          abaixo 9,67 com desvio ZERO. Ou seja, o lado do Hero tem textura e
          este era liso — e liso encostado em granulado o olho lê como duas
          cores, mesmo os dois sendo #07090d.

          O Hero cobre a seção inteira com `v4-noise` a 3%, que soma ~1,5 nível
          de claridade e o grão. `GrainOverlay` é o mesmo recurso já usado em
          quase toda seção escura da LP (Manual, Retorno, Transformação,
          Pricing, Vídeo, fechamento); estas duas eram as que tinham ficado de
          fora. 0.03 e não o 0.028 padrão do átomo, para bater exatamente com o
          valor do Hero e o degrau fechar em zero. */}
      <GrainOverlay opacity={0.03} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32">
        {/* Header em largura própria: o texto deixa de disputar com a tabela */}
        <div className="max-w-3xl">
          <Reveal>
            <Kicker tone="dark">{badge}</Kicker>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-4 font-['Sora'] text-[clamp(2.1rem,4vw,3.4rem)] font-extrabold leading-[1.08] tracking-tight text-white">
              {/* Espaço DENTRO da expressão: dois text nodes adjacentes quebram
                  a hidratação (ver ContextV4). Sem a segunda parte, o título é
                  só o trecho laranja — nada de span vazio nem espaço solto no
                  fim da frase. */}
              {tituloBranco ? (
                <>
                  <span className="v4-serif text-orange-400">{`${tituloLaranja} `}</span>
                  {tituloBranco}
                </>
              ) : (
                <span className="v4-serif text-orange-400">{tituloLaranja}</span>
              )}
            </h2>
          </Reveal>
          <Reveal delay={170}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-400">{lead}</p>
          </Reveal>
        </div>

        {/* Exemplo real da tela de Pontuação Geral + escala de risco */}
        <div className="relative mt-12">
          <div className="pointer-events-none absolute -inset-10 rounded-full bg-orange-500/[0.07] blur-[130px]" aria-hidden />
          <Reveal className="relative">
            <ScoreTableExample />
            <RiskScale />
          </Reveal>
        </div>

        {/* A legenda da tabela (Francis, 06/08, slide 5: "frase explicativa
            para inserir"). Sem ela a tabela é um monte de número e o visitante
            precisa achar sozinho por que a segunda coluna venceu. Texto dele,
            com os travessões trocados por vírgulas: a LP não usa travessão em
            texto visível. Aceita marcação do CMS para destacar os números. */}
        {temConteudo(legenda) && (
          <Reveal delay={90}>
            <p className="mt-8 border-l-2 border-orange-500/50 pl-5 text-lg leading-relaxed text-slate-300 md:text-xl">
              <CMSText value={legenda} />
            </p>
          </Reveal>
        )}

        {/* O que isso significa na prática */}
        <Reveal delay={120} className="mt-12">
          <ul className="grid gap-x-10 gap-y-4 border-t border-white/[0.08] pt-8 sm:grid-cols-2 lg:grid-cols-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-300">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rotate-45 rounded-[2px] bg-gradient-to-br from-orange-500 to-amber-400" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Botão laranja cheio (era ghost-dark, apagado demais) e sem a nota
            "Acesso por 6 meses..." embaixo. Gabriel, 26/07. */}
        <Reveal delay={200} className="mt-12 flex justify-center">
          <Cta size="lg" onClick={() => scrollToId('oferta')}>
            {ctaButton}
            <CtaArrow size={20} />
          </Cta>
        </Reveal>
      </div>
    </section>
  )
}
