import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Kicker, Reveal, SolarCells } from './atoms'
import { VideoSubtitleV4, VideoV4 } from './VideoV4'
import { ParaQuemV4 } from './TransformacaoV4'
import { criarTxt, temConteudo } from './cms'

export const ContextV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('context')
  const txt = criarTxt(section)

  /* Título do fecho, em campo próprio desde 09/08. Enquanto o banco não tiver
     `closingTitle`, o padrão abaixo cobre — e o parágrafo continua rodando sem
     ele se alguém apagar o campo. */
  const tituloFecho = txt('closingTitle', 'Uma janela de 90 dias para sair na frente')

  // Slide 4: "No ADM, inserir este texto". Sem travessão (regra da LP) e com
  // ponto final, que faltava no original dele.
  const fechoPanorama = txt(
    'closing',
    'Antes disso, abrimos uma janela exclusiva de 90 dias para vender e capacitar integradoras e vendedores em primeira mão. É a sua chance de dominar o método <span class="cms-semibold">Solar Buy-Side</span>, alinhar uma venda verdadeiramente consultiva e preparar sua equipe antes que o novo padrão chegue aos consumidores.',
  )

  const cards = [
    {
      title: txt('card1Title', 'Saberão analisar'),
      desc: txt('card1Desc', 'Compararão propostas com precisão técnica superior à média do mercado.'),
    },
    {
      title: txt('card2Title', 'Analisarão fundo'),
      desc: txt('card2Desc', 'Fornecedores e tecnologias passarão por um crivo muito mais rigoroso.'),
    },
    {
      title: txt('card3Title', 'Avaliarão risco'),
      desc: txt('card3Desc', 'A confiabilidade da sua empresa será o fator decisivo antes de qualquer preço.'),
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
            <Kicker tone="dark">{txt('badge', 'O que muda em 2026')}</Kicker>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-5 font-['Sora'] text-[clamp(2.4rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              {/* Espaço DENTRO da expressão (um text node só): {x}{' '} vira dois
                  nós adjacentes, o innerHTML serializado funde num só e a
                  hidratação do main.tsx acusa mismatch (#418). */}
              {`${txt('title', 'Panorama')} `}
              <span className="v4-serif text-orange-400">{txt('titleHighlight', '2026')}</span>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-400 md:text-2xl">
              {txt('subtitle', 'Pode parecer exagero, mas em breve cada vez mais compradores de sistema fotovoltaico estarão informados.')}
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
                {/* v4-nojust: a descrição de cada item do Panorama é a coluna
                    secundária de uma grade de duas, e fica entre 333px (tablet)
                    e 506px (desktop largo). Estreita demais para justificar em
                    qualquer uma dessas larguras. Ver a escotilha no v4.css. */}
                <p className="v4-nojust text-base leading-relaxed text-slate-400 md:text-lg">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Fecho do Panorama (Francis, slide 4): a janela de 90 dias antes do
            lançamento para o consumidor final. Entra DEPOIS das três previsões
            porque é a consequência delas ("antes disso" = antes de o novo
            padrão chegar ao comprador). Aceita marcação do CMS.

            O TÍTULO GANHOU CAMPO PRÓPRIO (Francis, 09/08: "transformar a frase
            em subtítulo do bloco Panorama com um espaço do texto abaixo").
            Antes ele estava DENTRO do parágrafo, como um <span> em negrito
            seguido de <br>: parecia um subtítulo, mas era a primeira linha de
            um texto corrido, com o mesmo corpo e sem respiro. Agora é um <h3>
            de verdade, com tamanho, cor e espaço próprios — e um campo
            separado no admin, para ele editar o título sem mexer no parágrafo.

            Os dois dividem o mesmo filete laranja à esquerda, senão o título
            se desprenderia do bloco que ele nomeia. */}
        {(temConteudo(tituloFecho) || temConteudo(fechoPanorama)) && (
          <Reveal delay={120}>
            <div className="mt-10 max-w-3xl border-l-2 border-orange-500/40 pl-5">
              {temConteudo(tituloFecho) && (
                <h3 className="font-['Sora'] text-xl font-bold leading-snug tracking-tight text-white md:text-2xl">
                  <CMSText value={tituloFecho} />
                </h3>
              )}
              {temConteudo(fechoPanorama) && (
                <p
                  className={`text-lg leading-relaxed text-slate-300 md:text-xl ${
                    temConteudo(tituloFecho) ? 'mt-4' : ''
                  }`}
                >
                  <CMSText value={fechoPanorama} />
                </p>
              )}
            </div>
          </Reveal>
        )}

        {/* Vídeo (Gabriel, 26/07): entra aqui, logo depois do 3º tópico do
            Panorama e antes da faixa "Quem não entender essa nova jornada".
            O id fica nele para o menu "Vídeo" do cabeçalho continuar rolando
            para o lugar certo. */}
        <div id="video-section">
          <VideoV4 />
        </div>

        {/* A faixa "Quem não entender essa nova jornada" e o painel "Ainda há
            tempo para reverter" foram substituídos pelo bloco das duas frases
            (Gabriel, 26/07). Ele fecha o ato do vídeo. Ver VideoSubtitleV4. */}
        <VideoSubtitleV4 />

        {/* "Para quem o Método foi desenvolvido" (V5, slides 5 e 8: "Para quem
            é transferido abaixo do VÍDEO" / "Inserir PARA QUEM aqui"). No
            print do Francis ele aparece depois do painel das duas frases, não
            colado no player — é assim que está aqui.

            O componente mora em TransformacaoV4.tsx porque continua lendo a
            seção `transformacao` do banco: o Francis edita o texto onde sempre
            editou, e nada precisou ser migrado. */}
        <ParaQuemV4 />
      </div>
    </section>
  )
}
