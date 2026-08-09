import React from 'react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Img, WordReveal } from './atoms'
import { useApoiadores } from './ApoiadoresV4'
import { trackBuyClick } from '../utils/analytics'
import { criarTxt, temConteudo } from './cms'

/* VARIANTES DO HERO, para comparar direções lado a lado (ver heroVariante.ts).
   A variante A ("Amanhecer") vive em HeroV4.tsx e é a que está no ar; estas
   duas são autocontidas de propósito. Elas repetem a leitura do CMS em vez de
   compartilhar um hook com a A: assim mexer aqui não pode quebrar a página de
   produção, e quando uma direção for escolhida as outras duas somem com o
   arquivo inteiro, sem deixar abstração órfã para trás. */

/* ── peças comuns às duas ──────────────────────────────────────────────── */

function useTextosHero() {
  const { getSection } = useContent()
  const hero = getSection('hero')
  const t = criarTxt(hero)

  const titlePrefix = t('titlePrefix', t('title1', 'Saia da Disputa de Preço e'))
  const titleHighlight = t('titleHighlight', t('title2', 'Passe a Vender Decisões'))
  const titleSuffix = t('titleSuffix', 'em Sistema Solar')

  // Mesma regra de legado da variante A: o texto antigo do banco cai no novo.
  const subCms = t('subtitle', t('subtitle1', ''))
  const subtitle =
    !subCms || subCms.startsWith('O método Buy-Side')
      ? 'O Movimento Solar Buy-Side promove uma nova forma de vender: pela perspectiva do <span class="cms-semibold">comprador</span>'
      : subCms

  return { titlePrefix, titleHighlight, titleSuffix, subtitle, selo: t('manualTitle', 'Manual Solar Buy-Side') }
}

function useKit() {
  const { getSection, globalSettings } = useContent()
  const pricing = getSection('pricing')
  const t = criarTxt(pricing)

  const pecas = [
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
  ]

  const notaCms = t('heroKitNote', '')
  const nota = !notaCms || notaCms.startsWith('Kit Completo para integradoras')
    ? 'Kit Completo: 2 Ebooks + Plataforma'
    : notaCms

  return {
    pecas,
    nota,
    cta: t('heroKitCta', 'Quero o Kit Completo Agora'),
    link: globalSettings.purchaseLink || '#oferta',
    externo: Boolean(globalSettings.purchaseLink),
  }
}

const BotaoKit: React.FC<{ texto: string; link: string; externo: boolean; className?: string }> = ({
  texto,
  link,
  externo,
  className = '',
}) => (
  <a
    href={link}
    target={externo ? '_blank' : undefined}
    rel={externo ? 'noopener noreferrer' : undefined}
    onClick={trackBuyClick}
    className={`v4-cta-shine group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 px-9 py-4 text-base font-extrabold tracking-tight text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] md:px-10 md:py-5 md:text-lg ${className}`}
  >
    <span className="relative z-10">{texto}</span>
    <ArrowRight size={19} className="relative z-10 shrink-0 transition-transform group-hover:translate-x-1" />
  </a>
)

/* ══════════════════════════════════════════════════════════════════════════
   VARIANTE B — "EDITORIAL"

   A dobra da variante A é uma coluna centrada: tudo empilha no eixo vertical e
   a tela de 1920px fica com metade da largura vazia dos dois lados. Aqui o
   Hero passa a usar a HORIZONTALIDADE: texto à esquerda, produto à direita.

   O que isso compra, além de ocupar a tela:
   - a headline ganha ~55% da largura em vez de disputar o centro, então cabe
     em linhas mais longas e o bloco fica mais baixo (a variante A precisa de
     três linhas curtas e ~200px de altura só de título);
   - texto alinhado à esquerda tem ponto de partida fixo para o olho, que é
     mais fácil de ler que centrado em bloco de mais de duas linhas;
   - sobra lugar para a PROVA (os logos dos apoiadores) na base do texto, sem
     custar uma dobra. Hoje essa credibilidade só aparece na 4ª dobra.

   O produto vira uma pilha em leque, com profundidade, em vez de três capas
   enfileiradas: uma pilha lê como "um kit", três em fila leem como "três
   coisas". ══════════════════════════════════════════════════════════════ */

export const HeroEditorialV4: React.FC = () => {
  const { titlePrefix, titleHighlight, titleSuffix, subtitle, selo } = useTextosHero()
  const { pecas, nota, cta, link, externo } = useKit()
  const { logos } = useApoiadores()
  /* Sem repetidos: a mesma marca pode estar cadastrada em duas categorias
     (a BelEnergy é distribuidora âncora E fabricante), e na seção de
     apoiadores isso é correto, porque lá o agrupamento é por categoria. Aqui
     é uma fileira só, e o logo repetido lê como bug. */
  const marcas = logos
    .filter((l) => l.src)
    .filter((l, i, todos) => todos.findIndex((o) => (o.name || o.src) === (l.name || l.src)) === i)
    .slice(0, 5)

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#07090d]">
      {/* Céu: o mesmo amanhecer, mas o sol nasce à DIREITA, atrás da pilha de
          capas, em vez de no centro. A luz passa a apontar para o produto. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #0c1422 0%, #090d16 45%, #07090d 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 70% at 78% 45%, rgba(249,115,22,0.20), transparent 68%), radial-gradient(50% 60% at 6% 30%, rgba(59,130,246,0.12), transparent 70%)',
          }}
        />
        <div className="v4-rays absolute left-[74%] top-1/2 h-[110vmax] w-[110vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.09]" />
        <div className="v4-cells absolute inset-0 opacity-40" />
        <div className="v4-noise absolute inset-0 opacity-[0.03]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-6 pb-20 pt-32 md:pb-24 md:pt-36">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* ── Coluna do texto ─────────────────────────────────────────── */}
          <div className="text-center lg:text-left">
            <div className="v4-rise inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-3 pr-5 backdrop-blur-sm" style={{ ['--d' as string]: '0ms' }}>
              <span className="h-2 w-2 rotate-45 rounded-[1px] bg-gradient-to-br from-orange-400 to-orange-600" aria-hidden />
              <span className="v4-mono text-[11px] font-bold uppercase tracking-[0.25em] text-slate-300">{selo}</span>
            </div>

            {/* Sem blocos forçados aqui: com a coluna mais estreita a frase
                quebra sozinha em linhas parecidas, e alinhada à esquerda a
                quebra irregular é a norma tipográfica, não um defeito. O
                destaque leva `whitespace-nowrap` só para o trecho em itálico
                nunca rachar no meio, que é o defeito real. */}
            <h1 className="mt-7 text-[clamp(2.3rem,4.4vw,3.7rem)] font-extrabold leading-[1.06] tracking-[-0.03em] text-white">
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

            <p
              className="v4-rise mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl lg:mx-0"
              style={{ ['--d' as string]: '560ms' }}
            >
              <CMSText value={subtitle} />
            </p>

            <div className="v4-rise mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start" style={{ ['--d' as string]: '700ms' }}>
              {temConteudo(cta) && <BotaoKit texto={cta} link={link} externo={externo} />}
              {temConteudo(nota) && (
                <p className="v4-mono max-w-[15rem] text-[11px] font-bold uppercase leading-relaxed tracking-[0.18em] text-slate-400">
                  <CMSText value={nota} />
                </p>
              )}
            </div>

            {/* PROVA na primeira dobra. Os logos que hoje só aparecem na 4ª
                dobra valem mais aqui do que qualquer linha de texto a mais. */}
            {marcas.length > 0 && (
              <div className="v4-rise mt-12 border-t border-white/[0.07] pt-6" style={{ ['--d' as string]: '840ms' }}>
                <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                  Apoiado por empresas de referência do setor
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 lg:justify-start">
                  {marcas.map((m, i) => (
                    <span
                      key={i}
                      className="flex h-9 items-center justify-center rounded-md bg-white/90 px-3 opacity-80 transition-opacity duration-300 hover:opacity-100"
                    >
                      <Img src={m.src} alt={m.name} loading="lazy" className="h-4 w-auto object-contain" />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Coluna do produto: pilha em leque ───────────────────────── */}
          <div className="v4-rise relative flex justify-center lg:justify-end" style={{ ['--d' as string]: '620ms' }}>
            <div className="pointer-events-none absolute inset-0 -m-16 rounded-full bg-orange-500/20 blur-[120px]" aria-hidden />
            <div className="relative h-[300px] w-full max-w-[440px] sm:h-[380px] md:h-[440px]">
              {pecas.map((peca, i) => {
                /* Leque: a do meio na frente e mais alta, as laterais atrás,
                   giradas e rebaixadas. Profundidade em 2D, sem perspective:
                   a v4 inteira evita 3D real (ver v4.css). */
                const pose = [
                  'left-0 bottom-1 -rotate-[11deg] z-10',
                  'left-1/2 -translate-x-1/2 bottom-10 z-20',
                  'right-0 bottom-1 rotate-[11deg] z-10',
                ][i]
                return (
                  <div key={peca.title} className={`group absolute ${pose} transition-transform duration-500 hover:-translate-y-2`}>
                    <Img
                      src={peca.image}
                      alt={peca.title}
                      loading="lazy"
                      className="h-[200px] w-auto max-w-none drop-shadow-[0_28px_44px_rgba(0,0,0,0.75)] sm:h-[250px] md:h-[300px]"
                    />
                  </div>
                )
              })}
              {/* Chão: a elipse que prende o leque, no lugar do horizonte. */}
              <span
                className="absolute -bottom-4 left-1/2 h-5 w-[85%] -translate-x-1/2 rounded-[100%] bg-orange-400/25 blur-lg"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   VARIANTE C — "DUELO"

   As duas outras variantes são layouts genéricos: servem para qualquer
   infoproduto. Esta é a única que só faz sentido PARA ESTE produto.

   A tese do Solar Buy-Side é uma inversão de ponto de vista: existe um lado
   que compra e um lado que vende, e o vendedor perde porque nunca esteve do
   outro lado da mesa. O fundo da variante A já carrega essa dualidade sem
   dizer (um campo azul à esquerda, um âmbar à direita, escondidos a 13% de
   opacidade). Aqui ela vira o layout: dois territórios, uma costura
   incandescente no meio, e a headline atravessando a costura.

   Risco assumido: é a mais autoral e a que menos parece "página de vendas".
   Ganho: é a única que o visitante não viu em outro lugar esta semana.
   ═══════════════════════════════════════════════════════════════════════ */

export const HeroDueloV4: React.FC = () => {
  const { getSection } = useContent()
  const t = criarTxt(getSection('hero'))
  const { titlePrefix, titleHighlight, titleSuffix, subtitle, selo } = useTextosHero()
  const { pecas, nota, cta, link, externo } = useKit()

  const ladoEsq = t('dueloEsquerda', 'O comprador avalia')
  const ladoDir = t('dueloDireita', 'Você mostra')
  const itensEsq = [t('dueloEsq1', 'Reputação'), t('dueloEsq2', 'Risco'), t('dueloEsq3', 'Garantia')].filter(temConteudo)
  const itensDir = [t('dueloDir1', 'Preço'), t('dueloDir2', 'Desconto'), t('dueloDir3', 'Prazo')].filter(temConteudo)

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#07090d]">
      {/* Dois territórios e a costura */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-y-0 left-0 w-1/2" style={{ background: 'radial-gradient(80% 70% at 20% 40%, rgba(59,130,246,0.20), transparent 72%)' }} />
        <div className="absolute inset-y-0 right-0 w-1/2" style={{ background: 'radial-gradient(80% 70% at 80% 40%, rgba(249,115,22,0.22), transparent 72%)' }} />
        <div className="v4-cells absolute inset-0 opacity-30" />
        {/* A costura: fio incandescente que separa e ao mesmo tempo liga. */}
        <div
          className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
          style={{
            background:
              'linear-gradient(180deg, transparent, rgba(255,221,180,0.55) 22%, rgba(249,115,22,0.9) 50%, rgba(255,221,180,0.55) 78%, transparent)',
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[60vmax] w-[26vmax] -translate-x-1/2 -translate-y-1/2 blur-[90px]"
          style={{ background: 'radial-gradient(closest-side, rgba(249,115,22,0.22), transparent)' }}
        />
        <div className="v4-noise absolute inset-0 opacity-[0.03]" />
      </div>

      {/* Rótulos dos territórios, nas bordas, na vertical. Não são conteúdo de
          leitura: são placas de território, e por isso ficam apagados. */}
      <span
        className="v4-mono pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[10px] font-bold uppercase tracking-[0.45em] text-blue-300/40 xl:block"
        aria-hidden
      >
        Lado comprador
      </span>
      <span
        className="v4-mono pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-90 text-[10px] font-bold uppercase tracking-[0.45em] text-orange-300/40 xl:block"
        aria-hidden
      >
        Lado vendedor
      </span>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-20 pt-32 text-center md:pt-36">
        <div className="v4-rise inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-3 pr-5 backdrop-blur-sm" style={{ ['--d' as string]: '0ms' }}>
          <span className="h-2 w-2 rotate-45 rounded-[1px] bg-gradient-to-br from-orange-400 to-orange-600" aria-hidden />
          <span className="v4-mono text-[11px] font-bold uppercase tracking-[0.25em] text-slate-300">{selo}</span>
        </div>

        <h1 className="mt-8 max-w-6xl text-[clamp(2.3rem,4.8vw,4rem)] font-extrabold leading-[1.06] tracking-[-0.03em] text-white">
          <span className="block">
            <WordReveal trigger="load" text={titlePrefix} baseDelay={80} step={40} />
          </span>
          <span className="block">
            <WordReveal
              trigger="load"
              text={titleHighlight}
              baseDelay={340}
              step={55}
              wordClassName="v4-serif v4-grad-text pr-[0.06em]"
            />
          </span>
          <span className="block">
            <WordReveal trigger="load" text={titleSuffix} baseDelay={470} step={40} wordClassName="text-white" />
          </span>
        </h1>

        {/* O DUELO. Duas listas curtíssimas, uma de cada lado da costura: o que
            ele olha contra o que você mostra. É o argumento inteiro da página
            em seis palavras, e o desalinhamento entre as colunas É a mensagem. */}
        <div className="v4-rise mt-12 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06]" style={{ ['--d' as string]: '620ms' }}>
          <div className="bg-blue-500/[0.07] px-5 py-6 text-left backdrop-blur-sm sm:px-8">
            <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.24em] text-blue-300/80">{ladoEsq}</p>
            <ul className="mt-3 space-y-1.5">
              {itensEsq.map((item, i) => (
                <li key={i} className="text-lg font-bold leading-snug text-slate-200 sm:text-xl">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-orange-500/[0.07] px-5 py-6 text-left backdrop-blur-sm sm:px-8">
            <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.24em] text-orange-300/80">{ladoDir}</p>
            <ul className="mt-3 space-y-1.5">
              {itensDir.map((item, i) => (
                <li key={i} className="text-lg font-bold leading-snug text-slate-500 line-through decoration-slate-600 sm:text-xl">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="v4-rise mt-8 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl" style={{ ['--d' as string]: '720ms' }}>
          <CMSText value={subtitle} />
        </p>

        <div className="v4-rise mt-9 flex flex-col items-center gap-3" style={{ ['--d' as string]: '820ms' }}>
          {temConteudo(cta) && <BotaoKit texto={cta} link={link} externo={externo} />}
          <p className="v4-mono flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <ShieldCheck size={13} className="shrink-0 text-emerald-500" aria-hidden />
            {nota}
          </p>
        </div>

        {/* As capas em fio, bem pequenas, sobre a costura: presença sem peso. */}
        <div className="v4-rise mt-10 flex items-end justify-center gap-4" style={{ ['--d' as string]: '900ms' }}>
          {pecas.map((peca) => (
            <Img
              key={peca.title}
              src={peca.image}
              alt={peca.title}
              loading="lazy"
              className="h-[74px] w-auto max-w-none opacity-80 drop-shadow-[0_14px_20px_rgba(0,0,0,0.7)] transition duration-500 hover:-translate-y-1 hover:opacity-100 sm:h-[92px]"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
