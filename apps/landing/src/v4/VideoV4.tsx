import React, { useEffect, useState } from 'react'
import { Map as MapIcon, Play, Search, ShieldAlert } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Cta, CtaArrow, GrainOverlay, Reveal } from './atoms'

/* ATO II — "SCREENING ROOM": sala de cinema (#050608). Lista-índice editorial
   dos 3 riscos com números fantasma que "acendem" no hover + player Wistia. */

export const VideoV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('video')
  const [showPlayer, setShowPlayer] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const WistiaPlayer = 'wistia-player' as React.ElementType

  useEffect(() => {
    if (!showPlayer) return
    const existingPlayer = document.querySelector("script[src='https://fast.wistia.com/player.js']")
    const existingEmbed = document.querySelector("script[src='https://fast.wistia.com/embed/u0jf5yyoda.js']")
    if (!existingPlayer) {
      const script = document.createElement('script')
      script.src = 'https://fast.wistia.com/player.js'
      script.async = true
      document.body.appendChild(script)
    }
    if (!existingEmbed) {
      const script = document.createElement('script')
      script.src = 'https://fast.wistia.com/embed/u0jf5yyoda.js'
      script.async = true
      script.type = 'module'
      document.body.appendChild(script)
    }
    setTimeout(() => setPlayerReady(true), 800)
  }, [showPlayer])

  const cards = [
    {
      id: '01',
      icon: <ShieldAlert size={18} />,
      title: section?.texts.card1Title || 'Os 3 grandes RISCOS',
      desc:
        section?.texts.card1Desc ||
        'Risco integrador (engenharia e suporte), técnico (equipamentos e garantias) e financeiro (payback e custo proprietário).',
      tag: section?.texts.card1Tag || 'Proteção',
    },
    {
      id: '02',
      icon: <Search size={18} />,
      title: section?.texts.card2Title || 'Comprador Informado',
      desc: section?.texts.card2Desc || 'Como identificar promessas exageradas e indício de risco em propostas comerciais.',
      tag: section?.texts.card2Tag || 'Análise',
    },
    {
      id: '03',
      icon: <MapIcon size={18} />,
      title: section?.texts.card3Title || 'Jornada Planejada',
      desc: section?.texts.card3Desc || 'As 4 fases da decisão de compra e os momentos exatos nos quais o vendedor perde a venda.',
      tag: section?.texts.card3Tag || 'Estratégia',
    },
  ]

  return (
    <section className="relative overflow-hidden bg-[#050608] text-white antialiased">
      {/* Vinheta de transição vindo do ato I (#07090d) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#07090d] to-transparent" aria-hidden />
      {/* Luz baixa da sala de projeção */}
      <div
        className="pointer-events-none absolute left-1/2 top-[62%] h-[480px] w-[720px] -translate-x-1/2 blur-[140px]"
        style={{ background: 'radial-gradient(closest-side, rgba(249,115,22,0.1), transparent 70%)' }}
        aria-hidden
      />
      <GrainOverlay />

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        {/* Título + número fantasma do ato */}
        <Reveal as="header" className="relative">
          <span
            className="v4-stroke pointer-events-none absolute -top-10 right-0 hidden select-none font-['Sora'] text-[9rem] font-extrabold leading-none md:block"
            aria-hidden
          >
            02
          </span>
          <h2 className="relative max-w-4xl font-['Sora'] text-[clamp(2.2rem,4.5vw,3.6rem)] font-extrabold leading-[1.12] tracking-tight">
            <CMSText
              value={
                section?.texts.title?.trim()
                  ? section.texts.title
                  : 'Descubra o que o <span class="cms-orange">Manual</span> ensina aos compradores e entenda as <span class="cms-orange">novas regras do jogo.</span>'
              }
            />
          </h2>
        </Reveal>

        {/* Índice editorial dos 3 riscos */}
        <div className="mt-16">
          {cards.map((card, idx) => (
            <Reveal
              key={card.id}
              delay={idx * 90}
              className="group grid items-start gap-8 border-t border-white/[0.08] py-10 transition-colors duration-500 hover:border-white/[0.16] md:grid-cols-[150px_1fr]"
            >
              <span className="relative inline-block w-fit leading-none">
                <span className="v4-stroke font-['Sora'] text-7xl font-extrabold md:text-8xl">{card.id}</span>
                <span
                  className="absolute inset-0 font-['Sora'] text-7xl font-extrabold text-orange-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:text-8xl"
                  aria-hidden
                >
                  {card.id}
                </span>
              </span>

              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-orange-500" aria-hidden>
                    {card.icon}
                  </span>
                  <span className="v4-mono rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-orange-400">
                    {card.tag}
                  </span>
                </div>
                <h3 className="mt-3 font-['Sora'] text-2xl font-bold tracking-tight text-white md:text-3xl">{card.title}</h3>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed text-slate-400">{card.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Alerta central */}
        <Reveal className="mt-24 text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-1.5 text-red-400">
            <span className="v4-dot relative h-2 w-2 rounded-full bg-red-500 text-red-500" aria-hidden />
            <span className="v4-mono text-[10px] font-bold uppercase tracking-[0.25em]">
              {section?.texts.alertBadge || 'Atenção Crítica'}
            </span>
          </div>
          <h3 className="mx-auto mt-6 max-w-3xl font-['Sora'] text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
            {section?.texts.alertTitle || 'Veja o porquê de muitos vendedores ficarem fora do jogo.'}
          </h3>
          <p className="v4-serif mx-auto mt-3 max-w-2xl text-xl text-slate-400 md:text-2xl">
            {section?.texts.alertSubtitle || 'Não permita que isso aconteça com você.'}
          </p>
        </Reveal>

        {/* Player */}
        <Reveal delay={120} className="mt-12">
          <div className="group relative">
            <div
              className="relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-black shadow-[0_60px_120px_-40px_rgba(0,0,0,0.95)]"
              onClick={() => setShowPlayer(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') setShowPlayer(true)
              }}
            >
              {!showPlayer ? (
                <>
                  <div className="absolute inset-0 bg-[url('/assets/manualdecompra1.png')] bg-cover bg-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25 transition-colors duration-500 group-hover:via-black/20" />

                  {/* Play: anel tracejado girando + disco */}
                  <div className="relative z-10 flex h-24 w-24 items-center justify-center">
                    <span className="v4-spin-slow absolute inset-0 rounded-full border border-dashed border-white/30" aria-hidden />
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl transition-colors duration-300 group-hover:bg-orange-500">
                      <Play className="ml-1 h-6 w-6 fill-slate-900 text-slate-900 transition-colors duration-300 group-hover:fill-white group-hover:text-white" />
                    </span>
                  </div>

                  {/* Barra inferior */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 md:bottom-9 md:left-10 md:right-10">
                    <div className="min-w-0">
                      <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400">
                        {section?.texts.videoBadge || 'Conteúdo Exclusivo'}
                      </p>
                      <p className="mt-1.5 font-['Sora'] text-xl font-bold tracking-tight text-white md:text-2xl">
                        {section?.texts.videoTitle || 'A Nova Realidade Solar'}
                      </p>
                    </div>
                    <div className="v4-mono shrink-0 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white backdrop-blur-md">
                      {section?.texts.videoDuration || '03:54'}
                    </div>
                  </div>

                  {/* Linha decorativa de "progresso" */}
                  <div className="absolute bottom-0 left-0 h-[3px] w-1/4 bg-gradient-to-r from-orange-500 to-amber-400" aria-hidden />
                </>
              ) : (
                <div className="absolute inset-0 bg-black">
                  <style>{`
                    wistia-player {
                      opacity: ${playerReady ? '1' : '0'} !important;
                      transition: opacity 1s ease-in-out !important;
                    }
                    wistia-player::part(poster) { display: none !important; opacity: 0 !important; }
                    wistia-player::part(thumbnail) { display: none !important; opacity: 0 !important; }
                    wistia-player[media-id="u0jf5yyoda"]::before {
                      content: '';
                      position: absolute;
                      inset: 0;
                      background: black;
                      z-index: 9999;
                      opacity: ${playerReady ? '0' : '1'};
                      transition: opacity 1s ease-in-out;
                      pointer-events: none;
                    }
                  `}</style>
                  <WistiaPlayer
                    media-id="u0jf5yyoda"
                    aspect="1.7777777777777777"
                    autoPlay="true"
                    preload="metadata"
                    playButton="false"
                    controlsVisibleOnLoad="true"
                    silentAutoPlay="false"
                    posterUrl=""
                  ></WistiaPlayer>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={160} className="mt-12 flex justify-center">
          <Cta size="lg" href="#oferta">
            {section?.texts.ctaButton || 'Quero sair na frente e vender mais'}
            <CtaArrow size={20} />
          </Cta>
        </Reveal>
      </div>
    </section>
  )
}
