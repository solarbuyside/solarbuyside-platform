import React, { useEffect, useState } from 'react'
import { AlertCircle, ArrowRight, Map as MapIcon, Monitor, Play, Search, ShieldAlert } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from './CMSText'

export const VideoSection: React.FC = () => {
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

    // Marca como pronto após delay maior para garantir que o vídeo está carregado
    setTimeout(() => setPlayerReady(true), 800)
  }, [showPlayer])

  return (
    <section
      id="video-section"
      className="relative overflow-hidden bg-[#0B1120] text-white font-sans selection:bg-orange-100 selection:text-orange-900 antialiased"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-blue-900/20 rounded-full blur-[120px]"></div>
      </div>
      <div className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl md:text-[40px] font-black tracking-tight mb-4 leading-tight">
            <CMSText value={
              section?.texts.title?.trim()
                ? section.texts.title
                : 'Descubra o que o <span class="cms-orange">Manual</span> ensina aos compradores e entenda as <span class="cms-orange">novas regras do jogo.</span>'
            } />
          </h2>
        </div>

        <div className="space-y-4 mb-10">
          {[
            {
              id: '01',
              icon: <ShieldAlert className="w-6 h-6" />,
              title: section?.texts.card1Title || 'Os 3 grandes RISCOS',
              desc: section?.texts.card1Desc || 'Risco integrador (engenharia e suporte), técnico (equipamentos e garantias) e financeiro (payback e custo proprietário).',
              tag: section?.texts.card1Tag || 'Proteção',
            },
            {
              id: '02',
              icon: <Search className="w-6 h-6" />,
              title: section?.texts.card2Title || 'Comprador Informado',
              desc: section?.texts.card2Desc || 'Como identificar promessas exageradas e indício de risco em propostas comerciais.',
              tag: section?.texts.card2Tag || 'Análise',
            },
            {
              id: '03',
              icon: <MapIcon className="w-6 h-6" />,
              title: section?.texts.card3Title || 'Jornada Planejada',
              desc: section?.texts.card3Desc || 'As 4 fases da decisão de compra e os momentos exatos nos quais o vendedor perde a venda.',
              tag: section?.texts.card3Tag || 'Estratégia',
            },
          ].map((card) => (
            <div
              key={card.id}
              className="group flex flex-col md:flex-row gap-5 p-5 md:p-6 rounded-3xl bg-[#0F1C36] border border-white/10 transition-all duration-500 hover:bg-[#122242] hover:shadow-2xl hover:shadow-black/40"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-white/10 shadow-sm flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                  {card.icon}
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">{card.id}</span>
                  <div className="h-px w-6 bg-white/15"></div>
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{card.tag}</span>
                </div>
                <h4 className="text-2xl font-black text-white mb-2 tracking-tight">{card.title}</h4>
                <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-2xl">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mb-6">
          <div className="inline-flex items-center gap-2 mb-4 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">{section?.texts.alertBadge || 'Atenção Crítica'}</span>
          </div>
          <h3 className="text-2xl md:text-4xl font-black tracking-tighter text-white leading-[1.1]">
            {section?.texts.alertTitle || 'Veja o porquê de muitos vendedores ficarem fora do jogo.'} <br />
            <span className="text-slate-400 text-lg md:text-2xl font-medium">
              {section?.texts.alertSubtitle || 'Não permita que isso aconteça com você.'}
            </span>
          </h3>
        </div>

        <div className="relative group">
          <div className="absolute -inset-2 bg-orange-500/10 rounded-[28px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          <div
            className="relative aspect-video rounded-3xl bg-slate-900 overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center group cursor-pointer"
            onClick={() => setShowPlayer(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                setShowPlayer(true)
              }
            }}
          >
            {!showPlayer ? (
              <>
                <div className="absolute inset-0 bg-[url('/assets/capa-video-solar.jpeg')] bg-cover bg-center opacity-90 transition-transform duration-700 group-hover:scale-105"></div>

                <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/30 transition-colors"></div>

                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    <div className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                      <Play className="w-6 h-6 text-slate-900 fill-slate-900 group-hover:text-white group-hover:fill-white ml-1 transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-1">
                        {section?.texts.videoBadge || 'Conteúdo Exclusivo'}
                      </p>
                      <p className="text-2xl font-black text-white tracking-tight">{section?.texts.videoTitle || 'A Nova Realidade Solar'}</p>
                    </div>
                  </div>
                  <div className="px-5 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
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
                  wistia-player::part(poster) {
                    display: none !important;
                    opacity: 0 !important;
                  }
                  wistia-player::part(thumbnail) {
                    display: none !important;
                    opacity: 0 !important;
                  }
                  wistia-player[media-id="u0jf5yyoda"]::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
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

        <div className="flex justify-center mt-6">
          <a
            href="#oferta"
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xl font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[44px]"
          >
            {section?.texts.ctaButton || 'Quero sair na frente e vender mais'}
            <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  )
}
