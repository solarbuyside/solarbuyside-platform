import React from 'react'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Img, WordReveal } from './atoms'
import { useApoiadores } from './ApoiadoresV4'
import { scrollToId } from './scroll'
import { trackBuyClick } from '../utils/analytics'
import { criarTxt, temConteudo } from './cms'

/* VARIANTES DO HERO, para comparar direções lado a lado (ver heroVariante.ts).
   A variante A ("Amanhecer") vive em HeroV4.tsx e é a que está no ar; estas
   duas são autocontidas de propósito. Elas repetem a leitura do CMS em vez de
   compartilhar um hook com a A: assim mexer aqui não pode quebrar a página de
   produção, e quando uma direção for escolhida as outras duas somem com o
   arquivo inteiro, sem deixar abstração órfã para trás.

   O QUE AS LPs DE REFERÊNCIA FAZEM E A PRIMEIRA VERSÃO DESTAS DUAS NÃO FAZIA
   (Gabriel, 09/08, com quatro referências):

   1. O PRODUTO É ENORME E SANGRA PELA BORDA. Em todas as quatro a imagem
      atravessa o limite da tela em vez de ficar contida numa caixa. Objeto
      cortado pela borda lê como "grande demais para caber"; objeto centrado
      com margem dos dois lados lê como miniatura de catálogo.
   2. O TEXTO É CURTÍSSIMO: headline, uma linha de apoio, botões. Nenhuma
      delas explica o produto na primeira dobra.
   3. DOIS BOTÕES, não um: o primário de compra e um secundário de baixo
      compromisso, para quem ainda não decidiu e hoje só tem a opção de sair.
   4. PROVA logo abaixo dos botões, em letra pequena. */

/* ── peças comuns às duas ──────────────────────────────────────────────── */

function useTextosHero() {
  const { getSection } = useContent()
  const t = criarTxt(getSection('hero'))
  const subCms = t('subtitle', t('subtitle1', ''))

  return {
    titlePrefix: t('titlePrefix', t('title1', 'Saia da Disputa de Preço e')),
    titleHighlight: t('titleHighlight', t('title2', 'Passe a Vender Decisões')),
    titleSuffix: t('titleSuffix', 'em Sistema Solar'),
    // Mesma regra de legado da variante A: o texto antigo do banco cai no novo.
    subtitle:
      !subCms || subCms.startsWith('O método Buy-Side')
        ? 'O Movimento Solar Buy-Side promove uma nova forma de vender: pela perspectiva do <span class="cms-semibold">comprador</span>'
        : subCms,
    selo: t('manualTitle', 'Manual Solar Buy-Side'),
  }
}

function useKit() {
  const { getSection, globalSettings } = useContent()
  const pricing = getSection('pricing')
  const t = criarTxt(pricing)

  return {
    pecas: [
      {
        title: t('heroKit1Title', 'Manual de Compra de Sistema Solar'),
        image: pricing?.images.card1Image || '/assets/manual-norm.png',
      },
      {
        title: t('heroKit2Title', t('card2Title', 'Código do Vendedor Consultivo')),
        image: pricing?.images.card2Image || '/assets/codigo-norm.png',
      },
      {
        title: t('heroKit3Title', t('cardPlatformTitle', 'Plataforma de Avaliação de Proposta Comercial')),
        image: pricing?.images.cardPlatformImage || '/assets/capa-plataforma-tablet.png',
      },
    ],
    cta: t('heroKitCta', 'Quero o Kit Completo Agora'),
    link: globalSettings.purchaseLink || '#oferta',
    externo: Boolean(globalSettings.purchaseLink),
  }
}

const BotaoPrimario: React.FC<{ texto: string; link: string; externo: boolean }> = ({ texto, link, externo }) => (
  <a
    href={link}
    target={externo ? '_blank' : undefined}
    rel={externo ? 'noopener noreferrer' : undefined}
    onClick={trackBuyClick}
    className="v4-cta-shine group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-8 py-4 text-[15px] font-extrabold tracking-tight text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] md:text-base"
  >
    <span className="relative z-10">{texto}</span>
    <ArrowRight size={18} className="relative z-10 shrink-0 transition-transform group-hover:translate-x-1" />
  </a>
)

/* Segundo botão, de baixo compromisso. Não é enfeite: quem chega e ainda não
   decidiu tem, hoje, só a opção de sair da página. Leva para a seção da
   Plataforma, que é o ativo que mais convence quem está em dúvida. */
const BotaoSecundario: React.FC<{ texto: string; alvo: string }> = ({ texto, alvo }) => (
  <button
    type="button"
    onClick={() => scrollToId(alvo)}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-6 py-4 text-[15px] font-bold text-slate-200 backdrop-blur-sm transition-colors duration-300 hover:border-white/25 hover:bg-white/10 hover:text-white md:text-base"
  >
    <PlayCircle size={17} className="shrink-0 text-orange-400" aria-hidden />
    {texto}
  </button>
)

/** Fileira de prova. Chip branco porque metade dos logos é escura na arte. */
const Prova: React.FC<{ rotulo: string; centro?: boolean }> = ({ rotulo, centro = false }) => {
  const { logos } = useApoiadores()
  const marcas = logos
    .filter((l) => l.src)
    /* A mesma marca pode estar cadastrada em duas categorias (a BelEnergy é
       distribuidora âncora E fabricante). Na seção de apoiadores isso é
       correto, porque lá o agrupamento é por categoria; numa fileira só, o
       logo repetido lê como bug. */
    .filter((l, i, todos) => todos.findIndex((o) => (o.name || o.src) === (l.name || l.src)) === i)
    .slice(0, 5)
  if (marcas.length === 0) return null

  return (
    <div className={centro ? 'text-center' : ''}>
      <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">{rotulo}</p>
      <div className={`mt-4 flex flex-wrap items-center gap-3 ${centro ? 'justify-center' : ''}`}>
        {marcas.map((m, i) => (
          <span
            key={i}
            className="flex h-8 items-center justify-center rounded-md bg-white/90 px-2.5 opacity-75 transition-opacity duration-300 hover:opacity-100"
          >
            <Img src={m.src} alt={m.name} loading="lazy" className="h-3.5 w-auto object-contain" />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   VARIANTE B — "EDITORIAL"

   Texto à esquerda, produto à direita SANGRANDO pela borda.

   A variante A empilha tudo num eixo só e deixa metade da largura vazia dos
   dois lados em tela grande. Aqui a horizontalidade vira o layout: a headline
   ocupa ~48% e cresce, e o kit vira um objeto único de altura inteira, cortado
   pela direita. É o gesto das referências: o produto não cabe na tela, e é
   justamente isso que o faz parecer grande.

   O leque tem três camadas com escalas e rotações diferentes, não três capas
   do mesmo tamanho lado a lado. Profundidade é o que separa "um kit" de "três
   arquivos". ═════════════════════════════════════════════════════════════ */

export const HeroEditorialV4: React.FC = () => {
  const { titlePrefix, titleHighlight, titleSuffix, subtitle, selo } = useTextosHero()
  const { pecas, cta, link, externo } = useKit()

  const leque = (
    <div className="relative h-full w-full">
      {/* Fonte de luz atrás do produto: é ela que faz o objeto existir no
          espaço, em vez de parecer colado sobre um fundo. */}
      <div
        className="absolute left-1/2 top-1/2 h-[68vmin] w-[68vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/25 blur-[130px]"
        aria-hidden
      />
      {pecas.map((peca, i) => {
        const pose = [
          'left-0 bottom-[20%] w-[38%] -rotate-[14deg] opacity-85 z-10',
          'left-[30%] bottom-[10%] w-[44%] z-30',
          'right-[1%] bottom-[22%] w-[40%] rotate-[12deg] opacity-90 z-20',
        ][i]
        return (
          <div
            key={peca.title}
            className={`group absolute ${pose} transition-transform duration-700 hover:-translate-y-3`}
          >
            <Img
              src={peca.image}
              alt={peca.title}
              loading="lazy"
              className="h-auto w-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.85)]"
            />
          </div>
        )
      })}
    </div>
  )

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#07090d]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(120deg, #0b1220 0%, #090d16 42%, #0d0906 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(65% 80% at 82% 40%, rgba(249,115,22,0.22), transparent 66%), radial-gradient(45% 55% at 2% 20%, rgba(59,130,246,0.14), transparent 70%)',
          }}
        />
        <div className="v4-rays absolute left-[80%] top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]" />
        <div className="v4-cells absolute inset-0 opacity-30" />
        <div className="v4-noise absolute inset-0 opacity-[0.03]" />
      </div>

      {/* PRODUTO EM SANGRIA: camada própria, altura inteira, encostada na borda
          direita e transbordando 8% dela. Só no desktop; no celular ele entra
          no fluxo, abaixo do texto. */}
      <div className="pointer-events-none absolute bottom-0 right-[-6%] top-24 hidden w-[52%] lg:block" aria-hidden>
        {leque}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-6 pb-16 pt-28 md:pt-32">
        <div className="w-full lg:max-w-[48%]">
          <div
            className="v4-rise inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] py-2 pl-3 pr-5 backdrop-blur-sm"
            style={{ ['--d' as string]: '0ms' }}
          >
            <span className="h-2 w-2 rotate-45 rounded-[1px] bg-gradient-to-br from-orange-400 to-orange-600" aria-hidden />
            <span className="v4-mono text-[10px] font-bold uppercase tracking-[0.25em] text-slate-300">{selo}</span>
          </div>

          {/* `whitespace-nowrap` só no destaque: o trecho em itálico é a virada
              da frase e não pode rachar no meio. O resto quebra à vontade, que
              alinhado à esquerda é a norma tipográfica, não defeito. */}
          <h1 className="mt-7 text-[clamp(2.4rem,4.6vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-white">
            <WordReveal trigger="load" text={titlePrefix} baseDelay={80} step={40} />{' '}
            <span className="whitespace-nowrap">
              <WordReveal
                trigger="load"
                text={titleHighlight}
                baseDelay={340}
                step={55}
                wordClassName="v4-serif v4-grad-text pr-[0.06em]"
              />
            </span>{' '}
            <WordReveal trigger="load" text={titleSuffix} baseDelay={470} step={40} wordClassName="text-white" />
          </h1>

          <p className="v4-rise mt-6 max-w-lg text-lg leading-relaxed text-slate-300" style={{ ['--d' as string]: '560ms' }}>
            <CMSText value={subtitle} />
          </p>

          <div
            className="v4-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ ['--d' as string]: '700ms' }}
          >
            {temConteudo(cta) && <BotaoPrimario texto={cta} link={link} externo={externo} />}
            <BotaoSecundario texto="Ver a Plataforma" alvo="plataforma" />
          </div>

          <div className="v4-rise mt-12" style={{ ['--d' as string]: '840ms' }}>
            <Prova rotulo="Apoiado por empresas de referência do setor" />
          </div>
        </div>
      </div>

      {/* O mesmo leque, agora no fluxo, para o celular. */}
      <div className="relative z-10 h-[330px] w-full px-6 pb-8 sm:h-[400px] lg:hidden">{leque}</div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   VARIANTE C — "VITRINE"

   Direção oposta às outras duas: em vez de mostrar as CAPAS (o que você
   recebe), mostra a TELA (o que a coisa faz).

   O argumento é de conversão, não de estética. O que mais convence um
   integrador é ver a Plataforma pontuando seis propostas de verdade, e hoje
   isso só aparece na 2ª dobra. Aqui a tela real é o herói: larga, cortada pela
   base da dobra, com a luz nascendo atrás dela. Texto curtíssimo em cima,
   dois botões, prova em letra pequena.

   É o padrão das LPs de software, e é raro em infoproduto justamente porque
   quase nenhum infoproduto TEM uma tela para mostrar. Este tem.

   RESSALVA: `capa-plataforma-notebook.png` é uma captura ANTIGA (fala em
   "Finalista" e usa a escala 0-4/5-6/7-8/9-10, enquanto o produto hoje elege
   uma vencedora só e usa a régua /100). Se esta direção for a escolhida, a
   captura precisa ser refeita antes de ir ao ar. A imagem vem do CMS
   (`plataforma.heroShot`), então trocar é upload, não deploy.
   ═══════════════════════════════════════════════════════════════════════ */

export const HeroVitrineV4: React.FC = () => {
  const { getSection } = useContent()
  const { titlePrefix, titleHighlight, titleSuffix, subtitle } = useTextosHero()
  const { cta, link, externo } = useKit()
  const tela = getSection('plataforma')?.images.heroShot || '/assets/capa-plataforma-notebook.png'

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#07090d]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #0a1020 0%, #090d16 55%, #07090d 100%)' }}
        />
        {/* Luz nascendo ATRÁS da tela, na altura em que ela começa. */}
        <div
          className="absolute left-1/2 top-[54%] h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(253,186,116,0.20) 0%, rgba(249,115,22,0.12) 26%, transparent 56%)',
          }}
        />
        <div className="v4-rays absolute left-1/2 top-[56%] h-[150vmax] w-[150vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.09]" />
        <div className="v4-cells absolute inset-0 opacity-30" />
        <div className="v4-noise absolute inset-0 opacity-[0.03]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 pt-28 text-center md:pt-32">
        <div
          className="v4-rise inline-flex items-center gap-2.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-1.5"
          style={{ ['--d' as string]: '0ms' }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" aria-hidden />
          <span className="v4-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">
            Plataforma de Avaliação de Propostas
          </span>
        </div>

        <h1 className="mt-7 max-w-4xl text-[clamp(2.3rem,4.4vw,3.7rem)] font-extrabold leading-[1.06] tracking-[-0.035em] text-white">
          <WordReveal trigger="load" text={titlePrefix} baseDelay={80} step={40} />{' '}
          <span className="whitespace-nowrap">
            <WordReveal
              trigger="load"
              text={titleHighlight}
              baseDelay={340}
              step={55}
              wordClassName="v4-serif v4-grad-text pr-[0.06em]"
            />
          </span>{' '}
          <span className="whitespace-nowrap">
            <WordReveal trigger="load" text={titleSuffix} baseDelay={470} step={40} wordClassName="text-white" />
          </span>
        </h1>

        <p className="v4-rise mt-5 max-w-xl text-lg leading-relaxed text-slate-300" style={{ ['--d' as string]: '560ms' }}>
          <CMSText value={subtitle} />
        </p>

        <div
          className="v4-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          style={{ ['--d' as string]: '700ms' }}
        >
          {temConteudo(cta) && <BotaoPrimario texto={cta} link={link} externo={externo} />}
          <BotaoSecundario texto="Ver como funciona" alvo="plataforma" />
        </div>

        <div className="v4-rise mt-10" style={{ ['--d' as string]: '820ms' }}>
          <Prova rotulo="Apoiado por empresas de referência do setor" centro />
        </div>
      </div>

      {/* A TELA. Mais larga que o container do texto (1180px contra max-w-6xl)
          e cortada pela base da dobra: é o corte que diz "tem mais, role". */}
      <div className="relative z-10 mt-10 flex w-full justify-center px-4 md:mt-12">
        <div className="v4-rise relative w-full max-w-[1180px]" style={{ ['--d' as string]: '900ms' }}>
          <div className="absolute inset-x-10 -top-8 h-28 rounded-[100%] bg-orange-500/25 blur-[70px]" aria-hidden />
          <Img
            src={tela}
            alt="Plataforma de Avaliação Solar Buy-Side: seis propostas pontuadas lado a lado"
            loading="lazy"
            className="relative h-auto w-full rounded-t-xl shadow-[0_-10px_80px_-20px_rgba(249,115,22,0.35),0_40px_90px_-30px_rgba(0,0,0,0.95)]"
          />
        </div>
      </div>
    </section>
  )
}
