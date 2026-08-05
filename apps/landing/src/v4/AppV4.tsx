import { useEffect } from 'react'
import './v4.css'
import { trackPageView, observeSection } from '../utils/analytics'
import { FloatingCTAV4, HeaderV4 } from './HeaderV4'
import { HeroV4 } from './HeroV4'
import { ContextV4 } from './ContextV4'
import { ApoiadoresBandV4, ApoiadoresV4 } from './ApoiadoresV4'
import { PropositoV4 } from './PropositoV4'
import { AudienceV4 } from './AudienceV4'
import { ManualStrategicV4 } from './ManualStrategicV4'
import { PlatformV4 } from './PlatformV4'
import { RetornoV4 } from './RetornoV4'
import { TestimonialLucasV4, TestimonialsV4 } from './SocialProofV4'
import { TransformacaoV4 } from './TransformacaoV4'
import { PricingV4 } from './PricingV4'
import { EquipeV4 } from './EquipeV4'
import { AuthorityV4 } from './AuthorityV4'
import { ContactV4, FAQV4, FooterV4 } from './ClosingV4'

/* V4 "SOLAR DAWN" — mesma copy e mesma ordem narrativa da LP oficial (v1),
   experiência redesenhada em 4 atos. Em PREVIEW na rota /v4; a produção (/)
   continua na v1. (Foi oficial por uma janela em 2026-06-11; revertido.) */

/* Ordem das seções = ordem dos slides da revisão do Francis de 03/08/2026
   ("V1 REVISÃO A"). Dois movimentos em relação à revisão de 25/07: a
   Plataforma subiu da 11ª para a 3ª posição (slide 3) e a de Autores desceu
   da 3ª para depois do vídeo (slide 6). */
const SECTION_IDS = [
  'hero',
  'plataforma',
  'contexto',
  'video-section',
  'authority',
  'depoimento-lucas',
  'transformacao',
  'audiencia',
  'manual-strategic',
  'retorno',
  'depoimentos',
  'apoiadores',
  'oferta',
  'faq',
  'contact',
] as const

export default function AppV4() {
  useEffect(() => {
    trackPageView()

    const cleanupFunctions: (() => void)[] = []
    SECTION_IDS.forEach((sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        cleanupFunctions.push(observeSection(element, sectionId))
      }
    })

    // Preview do admin (plataforma) abre a LP num iframe e manda
    // scrollToSection para navegar até a seção selecionada no editor.
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'scrollToSection' && event.data.hash) {
        const element = document.getElementById(event.data.hash)
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        }
      }
    }
    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [])

  return (
    // overflow-x-clip (não -hidden): corta vazamento horizontal sem virar
    // scroll-container, preservando position:sticky (livro, manual)
    <div className="v4-root overflow-x-clip bg-[#07090d] text-slate-400 antialiased selection:bg-orange-500/80 selection:text-white">
      <HeaderV4 />
      <FloatingCTAV4 />
      {/* <main>: landmark principal para leitor de tela (auditoria de Práticas
          do Lighthouse). Header/CTAs/rodapé ficam fora, como manda a semântica. */}
      <main>
      <div id="hero">
        <HeroV4 />
      </div>
      {/* Faixa de logos logo abaixo do Hero, como no slide 1 do Francis. Ela
          substitui a antiga faixa "Manual ✦ Código" (resposta dele em 23/07). */}
      <ApoiadoresBandV4 />
      {/* "Para que servem o Manual, o Código e a Plataforma?" logo abaixo do
          carrossel de logos (Francis, slide 2). Ele responde a pergunta que a
          faixa acabou de levantar, e emenda na seção da Plataforma. */}
      <PropositoV4 />
      {/* Plataforma subiu da 11ª para a 3ª posição (slide 3 da revisão de
          03/08). A ferramenta passa a ser o primeiro argumento depois da prova
          social dos logos, antes de qualquer texto de contexto. */}
      <div id="plataforma">
        <PlatformV4 />
      </div>
      {/* O vídeo e o bloco das duas frases que o fecha vivem DENTRO do
          Panorama, então não aparecem mais aqui. Ver ContextV4. */}
      <div id="contexto">
        <ContextV4 />
      </div>
      {/* Autores desceu da 3ª para depois do vídeo (slides 5 e 6): a revisão de
          03/08 inverteu o que a de 25/07 tinha feito. O primeiro CTA da página
          continua sendo o desta seção. */}
      <div id="authority">
        <AuthorityV4 />
      </div>
      <div id="depoimento-lucas">
        <TestimonialLucasV4 />
      </div>
      <div id="transformacao">
        <TransformacaoV4 />
      </div>
      <div id="audiencia">
        <AudienceV4 />
      </div>
      <div id="manual-strategic">
        <ManualStrategicV4 />
      </div>
      {/* Retorno do método (Francis, 27/07): a projeção de resultados fecha o
          ato escuro; o arco "paper" do Rodrigo agora sobrepõe ELA. */}
      <div id="retorno">
        <RetornoV4 />
      </div>
      <div id="depoimentos">
        <TestimonialsV4 />
      </div>
      {/* Apoiadores segue depois do depoimento do Rodrigo (slide 16). Os dois
          são claros, então o ato "paper" fica inteiro num bloco só. */}
      <div id="apoiadores">
        <ApoiadoresV4 />
      </div>
      {/* "Capacite todo o seu time comercial" (Francis, slide 17): entra
          DEPOIS dos apoiadores e ANTES da oferta, que é a posição dele no
          deck. Justifica o preço antes de o preço aparecer. Claro como a
          seção acima, para a oferta continuar subindo por cima com o topo
          arredondado escuro. */}
      <EquipeV4 />
      <PricingV4 id="oferta" />
      <div id="faq">
        <FAQV4 />
      </div>
      <ContactV4 />
      </main>
      <FooterV4 />
    </div>
  )
}
