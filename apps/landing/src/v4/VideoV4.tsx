import React, { useEffect, useState } from 'react'
import { AlertCircle, Map as MapIcon, Monitor, Play, Search, ShieldAlert } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Cta, CtaArrow, DarkBackdrop, Reveal } from './atoms'

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
      icon: <ShieldAlert className="h-6 w-6" />,
      title: section?.texts.card1Title || 'Os 3 grandes RISCOS',
      desc:
        section?.texts.card1Desc ||
        'Risco integrador (engenharia e suporte), técnico (equipamentos e garantias) e financeiro (payback e custo proprietário).',
      tag: section?.texts.card1Tag || 'Proteção',
    },
    {
      id: '02',
      icon: <Search className="h-6 w-6" />,
      title: section?.texts.card2Title || 'Comprador Informado',
      desc: section?.texts.card2Desc || 'Como identificar promessas exageradas e indício de risco em propostas comerciais.',
      tag: section?.texts.card2Tag || 'Análise',
    },
    {
      id: '03',
      icon: <MapIcon className="h-6 w-6" />,
      title: section?.texts.card3Title || 'Jornada Planejada',
      desc: section?.texts.card3Desc || 'As 4 fases da decisão de compra e os momentos exatos nos quais o vendedor perde a venda.',
      tag: section?.texts.card3Tag || 'Estratégia',
    },
  ]

  return (
    <section className="relative overflow-hidden bg-[#050a16] text-white antialiased">
      <DarkBackdrop orbs="blue" />

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-24">
        <Reveal className="mb-12 max-w-4xl">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-[2.7rem] md:leading-[1.15]">
            <CMSText
              value={
                section?.texts.title?.trim()
                  ? section.texts.title
                  : 'Descubra o que o <span class="cms-orange">Manual</span> ensina aos compradores e entenda as <span class="cms-orange">novas regras do jogo.</span>'
              }
            />
          </h2>
        </Reveal>

        {/* Cards em linha do tempo */}
        <div className="relative mb-14 space-y-4">
          <div className="absolute bottom-6 left-[27px] top-6 hidden w-px bg-gradient-to-b from-orange-500/40 via-white/10 to-transparent md:block" aria-hidden />
          {cards.map((card, idx) => (
            <Reveal key={card.id} delay={idx * 110}>
              <div className="v4-lift group relative flex flex-col gap-5 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-sm hover:border-orange-500/25 hover:bg-white/[0.05] md:flex-row md:items-start md:p-7">
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0a1122] text-orange-500 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:border-orange-500/60 group-hover:bg-orange-500 group-hover:text-white">
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <div className="mb-2.5 flex items-center gap-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-500">{card.id}</span>
                    <span className="h-px w-6 bg-white/15" aria-hidden />
                    <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">
                      {card.tag}
                    </span>
                  </div>
                  <h4 className="mb-2 text-xl font-bold tracking-tight text-white md:text-2xl">{card.title}</h4>
                  <p className="max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">{card.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Alerta + vídeo */}
        <Reveal className="mb-8 max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-1.5 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em]">
              {section?.texts.alertBadge || 'Atenção Crítica'}
            </span>
          </div>
          <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-white md:text-4xl">
            {section?.texts.alertTitle || 'Veja o porquê de muitos vendedores ficarem fora do jogo.'}
          </h3>
          <p className="mt-2 text-lg font-medium text-slate-400 md:text-2xl">
            {section?.texts.alertSubtitle || 'Não permita que isso aconteça com você.'}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="group relative">
            <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-br from-orange-500/30 via-transparent to-blue-600/25 opacity-50 blur-md transition-opacity duration-700 group-hover:opacity-90" aria-hidden />
            <div
              className="relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9)]"
              onClick={() => setShowPlayer(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') setShowPlayer(true)
              }}
            >
              {!showPlayer ? (
                <>
                  <div className="absolute inset-0 bg-[url('/assets/manualdecompra1.png')] bg-cover bg-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/30 transition-colors duration-500 group-hover:via-slate-950/25" />

                  <div className="relative z-10">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-2xl transition-transform duration-500 group-hover:scale-110">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl transition-colors duration-300 group-hover:bg-orange-500">
                        <Play className="ml-1 h-6 w-6 fill-slate-900 text-slate-900 transition-colors group-hover:fill-white group-hover:text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between md:bottom-10 md:left-10 md:right-10">
                    <div className="flex items-center gap-4">
                      <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-md sm:flex">
                        <Monitor className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.3em] text-orange-400">
                          {section?.texts.videoBadge || 'Conteúdo Exclusivo'}
                        </p>
                        <p className="text-xl font-extrabold tracking-tight text-white md:text-2xl">
                          {section?.texts.videoTitle || 'A Nova Realidade Solar'}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest text-white backdrop-blur-md">
                      {section?.texts.videoDuration || '03:54'}
                    </div>
                  </div>
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

        <Reveal delay={160} className="mt-10 flex justify-center">
          <Cta size="lg" href="#oferta">
            {section?.texts.ctaButton || 'Quero sair na frente e vender mais'}
            <CtaArrow size={20} />
          </Cta>
        </Reveal>
      </div>
    </section>
  )
}
