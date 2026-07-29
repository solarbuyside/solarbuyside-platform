import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { Kicker, Reveal, SolarCells } from './atoms'
import { VideoSubtitleV4, VideoV4 } from './VideoV4'

export const ContextV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('context')

  const cards = [
    {
      title: section?.texts.card1Title || 'Saberão analisar',
      desc: section?.texts.card1Desc || 'Compararão propostas com precisão técnica superior à média do mercado.',
    },
    {
      title: section?.texts.card2Title || 'Analisarão fundo',
      desc: section?.texts.card2Desc || 'Fornecedores e tecnologias passarão por um crivo muito mais rigoroso.',
    },
    {
      title: section?.texts.card3Title || 'Avaliarão risco',
      desc: section?.texts.card3Desc || 'A confiabilidade da sua empresa será o fator decisivo antes de qualquer preço.',
    },
  ]

  return (
    <section className="relative bg-[#07090d] text-white antialiased">
      <SolarCells fade="top" />
      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        {/* Cabeçalho — índice editorial com número fantasma */}
        <div className="relative">
          <span
            className="v4-stroke pointer-events-none absolute -top-10 right-0 hidden font-['Sora'] text-[7rem] font-extrabold opacity-60 md:block md:text-[10rem]"
            aria-hidden
          >
            01
          </span>
          <Reveal>
            <Kicker tone="dark">{section?.texts.badge || 'O que muda em 2026'}</Kicker>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-5 font-['Sora'] text-[clamp(2.4rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              {/* Espaço DENTRO da expressão (um text node só): {x}{' '} vira dois
                  nós adjacentes, o innerHTML serializado funde num só e a
                  hidratação do main.tsx acusa mismatch (#418). */}
              {`${section?.texts.title || 'Panorama'} `}
              <span className="v4-serif text-orange-400">{section?.texts.titleHighlight || '2026'}</span>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-400 md:text-2xl">
              {section?.texts.subtitle ||
                'Pode parecer exagero, mas em breve cada vez mais compradores de sistema fotovoltaico estarão informados.'}
            </p>
          </Reveal>
        </div>

        {/* As 3 previsões — lista-índice com hairlines */}
        <div className="mt-16">
          {cards.map((item, idx) => (
            <Reveal key={item.title} delay={idx * 90}>
              <div
                className={`group grid items-center gap-6 border-t border-white/[0.08] py-9 transition-colors duration-500 hover:bg-white/[0.015] md:grid-cols-[90px_1fr_1.1fr] ${
                  idx === cards.length - 1 ? 'border-b' : ''
                }`}
              >
                <span className="v4-mono text-sm text-slate-500 transition-colors duration-500 group-hover:text-orange-400">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="font-['Sora'] text-2xl font-bold text-white transition-transform duration-500 group-hover:translate-x-2 md:text-3xl">
                  {item.title}
                </h3>
                <p className="text-base leading-relaxed text-slate-400 md:text-lg">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Vídeo (Gabriel, 26/07): entra aqui, logo depois do 3º tópico do
            Panorama e antes da faixa "Quem não entender essa nova jornada".
            O id fica nele para o menu "Vídeo" do cabeçalho continuar rolando
            para o lugar certo. */}
        <div id="video-section">
          <VideoV4 />
        </div>

        {/* A faixa "Quem não entender essa nova jornada" e o painel "Ainda há
            tempo para reverter" foram substituídos pelo bloco das duas frases
            (Gabriel, 26/07). Ele fecha o ato do vídeo e emenda direto no
            depoimento do Lucas. Ver VideoSubtitleV4. */}
        <VideoSubtitleV4 />
      </div>
    </section>
  )
}
