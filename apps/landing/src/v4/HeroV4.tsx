import React, { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Img, WordReveal } from './atoms'
import { scrollToId } from './scroll'
import { trackBuyClick } from '../utils/analytics'
import { criarTxt, temConteudo } from './cms'

/* HERO "SOLAR DAWN" — sem foto stock, sem card 3D. Um horizonte solar
   gráfico: disco gigante com aresta incandescente, raios cônicos lentos,
   campo azul à esquerda (comprador) e âmbar à direita (vendedor).
   Headline massiva com reveal palavra-a-palavra; destaque em serif itálica.
   O manual + bônus viram um "ticket de acesso" com picote central. */

/* As quatro peças do kit, embaixo da subfrase do Hero (Francis, slide 1).

   A ARTE vem da MESMA seção que alimenta a oferta lá embaixo (`pricing`), para
   não existirem duas capas do mesmo produto. Os TEXTOS são próprios do Hero
   (`heroKitNTitle` / `heroKitNDesc`): aqui cabe uma linha e na oferta cabe um
   parágrafo, e em 06/08 o Francis pediu o Manual com um nome no Hero ("Manual
   de Compra de Sistema Solar", slide 2) sem tocar no nome que a oferta usa
   (slide 21, onde ele deixou "Manual Solar Buy-Side" intacto). Os títulos da
   oferta seguem valendo como padrão, então quem não editar o Hero continua
   vendo a mesma coisa nos dois lugares.

   Sem cartões e sem molduras: as capas flutuam sobre o horizonte do Hero, com
   um "+" entre elas, como no slide. Cartão aqui brigaria com o chip do produto
   e com o botão, e o Hero já vai ficar cheio.

   SEM a linha de etiquetas (MANUAL PRINCIPAL · DIFERENCIAL ESTRATÉGICO · …):
   removida em 06/08 (slide 2, "eliminar a linha"). Ela repetia em caixa alta o
   que o título logo abaixo já dizia, e roubava a altura que subiu o CTA. As
   etiquetas continuam na seção de oferta, onde classificam os quatro itens. */
const HeroKitV4: React.FC = () => {
  const { getSection, globalSettings } = useContent()
  const section = getSection('pricing')
  const txt = criarTxt(section)

  /* As três frases que o Francis reescreveu em 06/08 (slide 2) já existiam no
     banco com o texto de 03/08. Chave presente vence o padrão do código, então
     sem tratar o valor antigo como LEGADO a revisão dele não apareceria na
     página até alguém redigitar campo a campo no admin. É o mesmo mecanismo
     usado no resto da LP; a comparação é exata para não capturar uma frase
     futura dele que comece igual. */
  const comLegado = (chave: string, antigos: string[], novo: string) => {
    const atual = txt(chave, novo)
    return antigos.includes(atual.trim()) ? novo : atual
  }

  const pecas = [
    {
      title: txt('heroKit1Title', 'Manual de Compra de Sistema Solar'),
      desc: comLegado('heroKit1Desc', ['130 páginas e 160 tópicos'], 'Método de Compra de Sistema Solar'),
      image: section?.images.card1Image || '/assets/manual-norm.png',
    },
    {
      title: txt('heroKit2Title', txt('card2Title', 'Código do Vendedor Consultivo')),
      desc: comLegado('heroKit2Desc', ['Método de venda consultiva'], 'Método de Venda Consultivo Buy-Side'),
      image: section?.images.card2Image || '/assets/codigo-norm.png',
    },
    {
      title: txt('heroKit3Title', txt('cardPlatformTitle', 'Plataforma de Avaliação de Proposta Comercial')),
      desc: comLegado(
        'heroKit3Desc',
        ['Teste a sua proposta antes de enviar', 'Teste sua proposta antes de enviar'],
        'Teste sua proposta antes que seu cliente a teste.',
      ),
      image: section?.images.cardPlatformImage || '/assets/capa-plataforma-tablet.png',
    },
    {
      title: txt('heroKit4Title', txt('card3Title', 'Turbine sua Equipe de Venda')),
      desc: txt('heroKit4Desc', 'Licença de uso para até 10 vendedores'),
      image: section?.images.card3Image || '/assets/coletiva-norm.png',
    },
  ]

  /* A linha de resumo entre as capas e o botão. Encurtada em 06/08 (slide 2:
     "Kit Completo: 2 Ebooks + Plataforma"): a frase antiga tinha duas linhas e
     era a maior parte da distância entre as capas e o CTA. O texto anterior é
     tratado como legado para o banco não devolver a versão longa ao ar. */
  const notaCms = txt('heroKitNote', '')
  const nota = !notaCms || notaCms.startsWith('Kit Completo para integradoras')
    ? 'Kit Completo: 2 Ebooks + Plataforma'
    : notaCms
  const cta = txt('heroKitCta', 'Quero o Kit Completo Agora')

  /* Respiros menores em toda a pilha (Francis, slide 2: "tentar subir o CTA").
     Somados à linha de etiquetas que saiu e à nota que encurtou, o botão sobe
     cerca de 90px sem que nada precise encolher de tamanho. */
  return (
    <div className="v4-rise mt-11 w-full md:mt-12" style={{ ['--d' as string]: '760ms' }}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-2">
        {pecas.map((peca, i) => (
          <div key={peca.title} className="group relative flex flex-col items-center text-center">
            {/* O "+" entre as peças, só no desktop: no mobile a grade é 2x2 e
                o sinal cairia no meio do nada. */}
            {i > 0 && (
              <span className="absolute -left-3 top-[38px] hidden text-2xl font-light text-orange-500/40 md:block" aria-hidden>
                +
              </span>
            )}
            <Img
              src={peca.image}
              alt={peca.title}
              // A primeira dobra: estas quatro imagens competem com o <h1>,
              // que é o LCP. Todas lazy, como as capas da oferta.
              loading="lazy"
              className="h-[86px] w-auto max-w-none drop-shadow-[0_18px_26px_rgba(0,0,0,0.6)] transition duration-500 group-hover:-translate-y-1.5 md:h-[104px]"
            />
            {/* Altura mínima de duas linhas: "Plataforma de Avaliação de Proposta
                Comercial" quebra em duas e, sem isto, a frase daquela peça
                descia sozinha e as quatro deixavam de alinhar. */}
            <p className="mt-3.5 min-h-[2.6em] text-[13px] font-bold leading-snug text-white md:text-sm">
              {peca.title}
            </p>
            {temConteudo(peca.desc) && (
              <p className="mt-1 max-w-[190px] text-[12px] leading-snug text-slate-400">{peca.desc}</p>
            )}
          </div>
        ))}
      </div>

      {temConteudo(nota) && (
        <p className="mx-auto mt-8 max-w-2xl text-balance text-[15px] leading-relaxed text-slate-300 md:text-base">
          <CMSText value={nota} />
        </p>
      )}

      {temConteudo(cta) && (
        <a
          href={globalSettings.purchaseLink || '#oferta'}
          target={globalSettings.purchaseLink ? '_blank' : undefined}
          rel={globalSettings.purchaseLink ? 'noopener noreferrer' : undefined}
          onClick={trackBuyClick}
          className="v4-cta-shine group relative mx-auto mt-6 inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 px-8 py-4 text-base font-extrabold tracking-tight text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] md:text-lg"
        >
          <span className="relative z-10">{cta}</span>
          <ArrowRight size={19} className="relative z-10 shrink-0 transition-transform group-hover:translate-x-1" />
        </a>
      )}
    </div>
  )
}

export const HeroV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('hero')
  const txt = criarTxt(section)
  const glowRef = useRef<HTMLDivElement | null>(null)

  const titlePrefix = txt('titlePrefix', txt('title1', 'Saia da Disputa de Preço e Passe a'))
  const titleHighlight = txt('titleHighlight', txt('title2', 'Vender Decisões'))
  const titleSuffix = txt('titleSuffix', 'em Sistema Solar')
  // Subfrase única do Hero (Francis, slide 2). O texto antigo ("O método
  // Buy-Side ensina você a pensar como o cliente...") é tratado como legado:
  // se o banco ainda tiver ele, cai no novo. Assim a LP não depende do seed
  // para mostrar a frase certa.
  const subtitleCms = txt('subtitle', txt('subtitle1', ''))
  const subtitle = !subtitleCms || subtitleCms.startsWith('O método Buy-Side')
    ? 'O Movimento Solar Buy-Side promove uma nova forma de vender: pela perspectiva do <span class="cms-semibold">comprador</span>'
    : subtitleCms

  // Quebra no dois-pontos: a chamada em cima e "pela perspectiva do comprador"
  // inteiro na linha de baixo. Sem isso o "pela" ficava órfão na 1ª linha.
  const [subLead, subVirada] = (() => {
    const i = subtitle.indexOf(':')
    if (i === -1) return [subtitle, '']
    return [subtitle.slice(0, i + 1).trim(), subtitle.slice(i + 1).trim()]
  })()
  const manualTitle = txt('manualTitle', 'Manual Solar Buy-Side')
  const scrollHint = txt('scrollHint', 'Veja o panorama 2026')

  /* Parallax sutil do brilho solar seguindo o mouse (desligado p/ reduced motion) */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let rafId = 0
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 26
        const y = (e.clientY / window.innerHeight - 0.5) * 14
        if (glowRef.current) glowRef.current.style.transform = `translate(${x}px, ${y}px)`
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#07090d]">
      {/* ── Céu ───────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* gradiente vertical da noite */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #0c1422 0%, #090d16 45%, #07090d 100%)' }}
        />
        {/* dualidade: campo azul (comprador) à esquerda, âmbar (vendedor) à direita */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 60% at 8% 75%, rgba(59,130,246,0.13), transparent 70%), radial-gradient(55% 60% at 92% 75%, rgba(249,115,22,0.13), transparent 70%)',
          }}
        />
        {/* brilho central do amanhecer (com parallax) */}
        <div ref={glowRef} className="absolute inset-0 will-change-transform">
          <div
            className="absolute left-1/2 top-[74%] h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                'radial-gradient(circle at 50% 62%, rgba(253,186,116,0.32) 0%, rgba(249,115,22,0.16) 22%, transparent 52%)',
            }}
          />
        </div>
        {/* raios cônicos girando muito devagar */}
        <div className="v4-rays absolute left-1/2 top-[80%] h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.10]" />
        {/* o disco solar: silhueta gigante com aresta incandescente */}
        <div
          className="absolute left-1/2 top-[80%] h-[260vmax] w-[260vmax] -translate-x-1/2 rounded-full bg-[#07090d]"
          style={{
            boxShadow:
              '0 -1px 0 0 rgba(255,221,180,0.95), 0 -3px 18px 0 rgba(253,186,116,0.65), 0 -14px 70px 4px rgba(249,115,22,0.4), 0 -40px 180px 20px rgba(249,115,22,0.18)',
          }}
        />
        {/* grade de células no "chão": mesma textura (cor/escala) da seção
            seguinte e visível até a borda inferior — o panorama continua dela */}
        <div
          className="v4-cells absolute inset-x-0 bottom-0 h-[30%]"
          style={{
            maskImage: 'linear-gradient(180deg, transparent, black 55%)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent, black 55%)',
          }}
        />
        <div className="v4-noise absolute inset-0 opacity-[0.03]" />
      </div>

      {/* ── Conteúdo ──────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-28 pt-28 text-center md:pb-[22vh]">
        {/* chip do produto */}
        <div className="v4-rise mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-3 pr-5 backdrop-blur-sm" style={{ ['--d' as string]: '0ms' }}>
          <span className="h-2 w-2 rotate-45 rounded-[1px] bg-gradient-to-br from-orange-400 to-orange-600" aria-hidden />
          <span className="v4-mono text-[11px] font-bold uppercase tracking-[0.25em] text-slate-300">{manualTitle}</span>
        </div>

        {/* headline massiva */}
        {/* clamp: mobile 44px (era 40) e desktop 81.6px (era 89.6) — ajuste do
            Gabriel 27/07: headline menor no desktop, maior no celular. */}
        <h1 className="max-w-5xl text-[clamp(2.75rem,6.6vw,5.1rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">
          <WordReveal trigger="load" text={titlePrefix} baseDelay={80} step={40} />{' '}
          <WordReveal
            trigger="load"
            text={titleHighlight}
            baseDelay={340}
            step={55}
            wordClassName="v4-serif v4-grad-text pr-[0.06em]"
          />{' '}
          <WordReveal trigger="load" text={titleSuffix} baseDelay={470} step={40} wordClassName="text-white" />
        </h1>

        {/* Subfrase. Respiro grande entre ela e a headline: o Francis pediu a
            seção "limpa e com espaço entre cada frase" (slide 2). */}
        <p
          className="v4-rise mt-12 max-w-3xl text-lg leading-relaxed text-slate-200 sm:text-xl md:mt-[60px] md:text-2xl"
          style={{ ['--d' as string]: '560ms' }}
        >
          <CMSText value={subLead} />
          {subVirada && (
            <span className="mt-1.5 block">
              <CMSText value={subVirada} />
            </span>
          )}
        </p>

        {/* As quatro capas do kit voltaram ao Hero (Francis, slide 1 da revisão
            de 03/08). Elas tinham saído em 26/07, junto com o CTA; ele agora
            quer os dois de novo, e mais uma linha de resumo entre as capas e o
            botão. O Hero fica cheio de propósito: a decisão é dele, com a
            ressalva registrada.

            As capas, títulos e etiquetas são os MESMOS da seção de oferta (lê
            a seção `pricing`), então trocar a arte num lugar troca nos dois. Só
            as frases são próprias (`heroKit1Desc`...): aqui elas precisam ser
            curtas, e a seção de oferta ele marcou "SEM ALTERAÇÃO". */}
        <HeroKitV4 />
      </div>

      {/* scroll hint sobre o horizonte */}
      <button
        onClick={() => scrollToId('plataforma')}
        type="button"
        aria-label={scrollHint}
        className="group absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
      >
        {/* Texto "Veja o panorama 2026" removido (Francis, slide 1). O botão
            segue existindo só como indicador de rolagem; scrollHint continua
            no aria-label para leitor de tela. */}
        <span className="block h-10 w-px overflow-hidden bg-white/10">
          <span className="v4-drip block h-full w-full bg-gradient-to-b from-orange-400 to-transparent" />
        </span>
      </button>
    </section>
  )
}
