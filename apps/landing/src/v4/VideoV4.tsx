import React, { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { GrainOverlay, Reveal } from './atoms'

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


  /* O cabeçalho "Descubra o que o Manual ensina..." e os 3 cards (Os 3 grandes
     RISCOS / Comprador Informado / Jornada Planejada) foram removidos a pedido
     do Gabriel (26/07). Sobrou o alerta + o player.

     E o bloco deixou de ser uma <section> própria: agora ele é renderizado
     DENTRO do Panorama 2026, entre o 3º tópico e a faixa "Quem não entender
     essa nova jornada vai perder vendas". Por isso não tem mais fundo, largura
     máxima nem padding próprios: quem dá isso é o ContextV4. */
  return (
    <div className="relative">
      {/* Luz baixa da sala de projeção */}
      <div
        className="pointer-events-none absolute left-1/2 top-[55%] h-[480px] w-[720px] -translate-x-1/2 blur-[140px]"
        style={{ background: 'radial-gradient(closest-side, rgba(249,115,22,0.1), transparent 70%)' }}
        aria-hidden
      />

      <div className="relative">
        {/* Alerta central */}
        <Reveal className="mt-20 text-center">
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
                  {/* Poster: capa do vídeo (imagem 16:9 da marca), sem rosto. */}
                  <div
                    className="absolute inset-0 bg-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                    style={{
                      backgroundImage: `url('${section?.images.videoPoster || '/assets/capa-video-solar.jpeg'}')`,
                      backgroundPosition: '50% 50%',
                      filter: 'saturate(0.82) contrast(1.05)',
                    }}
                  />
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
                      <p className="v4-mono text-[11px] font-bold uppercase tracking-[0.25em] text-orange-400">
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

        {/* Sem CTA aqui: a revisão de 25/07 tirou o botão do fim do vídeo e
            pôs no lugar um subtítulo. Ver VideoSubtitleV4 logo abaixo. */}
      </div>
    </div>
  )
}

/* Subtítulo que fecha o ato do vídeo (Francis, slide 6: "Após a seção VÍDEO,
   inserir este texto como sub-título").

   Substitui o antigo VideoCtaV4 ("Quero sair na frente e vender mais"): a
   revisão de 25/07 numera exatamente 6 CTAs na página e nenhum deles fica
   aqui. Depois do vídeo vem só texto, e o próximo botão é o CTA 2, no fim do
   depoimento do Lucas.

   Duas frases em contraste: a primeira é o diagnóstico (cinza), a segunda é a
   virada (branca). Fundo escuro para emendar com a sala de cinema acima. */
export const VideoSubtitleV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('video')

  const linha1 =
    section?.texts.outroLine1 || 'A maioria dos vendedores solares continua tentando convencer o cliente.'
  const linha2 =
    section?.texts.outroLine2 || 'Os vendedores Buy-Side aprendem primeiro como o comprador decide.'

  /* Painel "amanhecer": herda a moldura do bloco que ele substituiu (a faixa
     de alerta + o painel "Ainda há tempo para reverter"), para o ritmo da
     seção não quebrar. As duas frases são uma virada, então o desenho separa
     o antes do depois: a primeira fica apagada, um ornamento marca o corte, e
     a segunda vem grande, em serif, com o gradiente do amanhecer. */
  return (
    <Reveal delay={100}>
      <div className="relative mt-20 overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-[#0a0c12] px-8 py-14 md:px-14 md:py-20">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
          style={{ background: 'radial-gradient(90% 100% at 50% 100%, rgba(251,191,36,0.11), transparent 70%)' }}
          aria-hidden
        />
        <GrainOverlay />

        <div className="relative mx-auto max-w-3xl text-center">
          {/* o hábito antigo */}
          <p className="text-xl leading-relaxed text-slate-500 md:text-2xl">{linha1}</p>

          {/* o corte entre um e outro */}
          <div className="my-9 flex items-center justify-center gap-4" aria-hidden>
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-orange-500/40 md:w-24" />
            <span className="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-orange-500" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-orange-500/40 md:w-24" />
          </div>

          {/* a virada */}
          <p className="v4-serif text-[clamp(1.7rem,3.8vw,2.9rem)] leading-[1.18]">
            <span className="v4-grad-text">{linha2}</span>
          </p>
        </div>
      </div>
    </Reveal>
  )
}
