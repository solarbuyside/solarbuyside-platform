import { useEffect } from 'react'
import './v4.css'
import { trackPageView, observeSection } from '../utils/analytics'
import { FloatingCTAV4, HeaderV4 } from './HeaderV4'
import { HeroV4 } from './HeroV4'
import { HeroEditorialV4, HeroVitrineV4 } from './HeroVariantesV4'
import { useVarianteHero } from './heroVariante'
import { ContextV4 } from './ContextV4'
import { ApoiadoresV4 } from './ApoiadoresV4'
import { PropositoV4 } from './PropositoV4'
import { ManualStrategicV4 } from './ManualStrategicV4'
import { PlatformV4 } from './PlatformV4'
import { RetornoV4 } from './RetornoV4'
import { TestimonialLucasV4, TestimonialsV4 } from './SocialProofV4'
import { TransformacaoV4 } from './TransformacaoV4'
import { CompraSimplesV4 } from './CompraSimplesV4'
import { PricingV4 } from './PricingV4'
import { EquipeV4 } from './EquipeV4'
import { AuthorityV4 } from './AuthorityV4'
import { ContactV4, FAQV4, FooterV4 } from './ClosingV4'

/* V4 "SOLAR DAWN" — a LP oficial, na raiz "/".

   ORDEM DAS SEÇÕES = ordem dos slides do PPTX "V2 REVISÃO 06.08.2026" do
   Francis. Ele monta a revisão como um deck: um slide por dobra, na sequência
   em que quer ver a página. O slide 1 é o único que fala de outro assunto (o
   tamanho do CTA flutuante) e não entra na contagem.

   O que mudou de lugar em relação à revisão de 03/08:
   - a Plataforma passou na frente do "Para que servem" (slides 4-5 antes do 6);
   - os Apoiadores subiram da 13ª para a 4ª posição (slide 7): "este bloco no
     final da LP deveria estar bem no início para transferir a credibilidade
     dessas marcas desde os primeiros instantes do lead na página";
   - os Mentores subiram para antes do Panorama (slide 8 antes do 9);
   - a Transformação desceu para depois do Manual (slide 15 depois do 12-13);
   - o depoimento do Lucas desceu para depois do Retorno (slide 17 depois do 16).

   O que saiu: a faixa de logos do topo (slide 3), a seção "Para quem o Método
   foi desenvolvido" (slide 11) e o bloco "Veja o que muda" que fechava o
   Manual (slide 14).

   O que entrou: "Compra simples. Acesso imediato. Suporte garantido."
   (slide 19).

   RITMO CLARO/ESCURO. A ordem nova deixaria duas ilhas de cor (Apoiadores
   claro sozinho no meio do escuro; Retorno escuro sozinho no meio do claro).
   Resolvido em cinco atos, com as emendas feitas pelo arco arredondado que a
   LP já usava:

     ESCURO  Hero · Plataforma · Para que servem
     CLARO   Apoiadores                                    (sobe com arco)
     ESCURO  Mentores · Panorama+Vídeo · Manual+Código ·
             Transformação · Retorno                       (sobe com arco)
     CLARO   Lucas · Rodrigo · Compra simples · Equipe      (sobe com arco)
     ESCURO  Oferta · FAQ · Contato                         (sobe com arco)

   A Transformação era clara e virou escura para o 3º ato não ter buraco; o
   Retorno ficou como estava (o Francis marcou o slide 16 "SEM ALTERAÇÃO"). */

/* Ids observados pelo IntersectionObserver do funil. É lista MANUAL: seção
   sem entrada aqui nunca aparece no relatório de conversão do admin.
   Espelhada em apps/platform/src/lib/landing/funnel.ts, que dá os rótulos. */
const SECTION_IDS = [
  'hero',
  'plataforma',
  'proposito',
  'apoiadores',
  'authority',
  'contexto',
  'video-section',
  'manual-strategic',
  'transformacao',
  'retorno',
  'depoimento-lucas',
  'depoimentos',
  'compra-simples',
  'equipe',
  'oferta',
  'faq',
  'contact',
] as const

export default function AppV4() {
  /* Qual Hero renderizar. Em produção, sem `?hero=`, é sempre a variante A e
     nada disto tem efeito; o seletor vive no cabeçalho. Ver heroVariante.ts. */
  const { variante } = useVarianteHero()

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
      const allowedOrigin = event.origin === 'https://plataforma.solarbuyside.com.br' ||
        event.origin === 'http://localhost:3000' || event.origin === 'http://127.0.0.1:3000'
      if (!allowedOrigin) return
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
      {/* ─────────────────── ATO 1 · ESCURO ─────────────────── */}
      {/* O HERO DEPENDE DA LARGURA DA TELA (Gabriel, 09/08: "deixa a B como
          fixa no desktop e no mobile será a A").

          Faz sentido: a B é uma composição horizontal, com o texto de um lado
          e o leque do outro, e no celular ela vira uma coluna com as capas
          empilhadas embaixo — perdendo justamente o gesto que a define. A A é
          centrada e simétrica, que é o que o celular pede.

          As DUAS são renderizadas e o CSS mostra uma. Escolher em JavaScript
          seria mais econômico em markup, e errado: o HTML desta LP é congelado
          no build, numa largura só. O visitante de celular receberia o Hero de
          desktop e o React remendaria a árvore inteira na hidratação, que é o
          erro #418. Com media query o navegador esconde a que não serve antes
          do primeiro quadro, sem JavaScript nenhum. As capas são todas
          `loading="lazy"`, então a escondida não baixa imagem.

          Com `?hero=` na URL o seletor manda, e aí a variante escolhida vale em
          qualquer largura — é assim que o Francis compara as três. */}
      <div id="hero">
        {variante === null ? (
          <>
            <div className="lg:hidden">
              <HeroV4 />
            </div>
            <div className="hidden lg:block">
              <HeroEditorialV4 />
            </div>
          </>
        ) : variante === 'b' ? (
          <HeroEditorialV4 />
        ) : variante === 'c' ? (
          <HeroVitrineV4 />
        ) : (
          <HeroV4 />
        )}
      </div>
      {/* A Plataforma emenda DIRETO no CTA do Hero (slide 4: "plataforma para
          encaixar +/- assim"). Era a faixa de logos que ocupava este lugar. */}
      <div id="plataforma">
        <PlatformV4 />
      </div>
      {/* "Para que servem o Manual, o Código e a Plataforma?" responde a
          pergunta que a seção da ferramenta acabou de levantar (slide 6). */}
      <div id="proposito">
        <PropositoV4 />
      </div>

      {/* ─────────────────── ATO 2 · CLARO ──────────────────── */}
      <div id="apoiadores">
        <ApoiadoresV4 />
      </div>

      {/* ─────────────────── ATO 3 · ESCURO ─────────────────── */}
      {/* Dois ids na mesma seção: `authority` é o do funil e o do preview do
          admin; `autor` fica no <section> e é o alvo do menu "Mentor". */}
      <div id="authority">
        <AuthorityV4 />
      </div>
      {/* O vídeo vive DENTRO do Panorama e leva o id `video-section`. */}
      <div id="contexto">
        <ContextV4 />
      </div>
      <div id="manual-strategic">
        <ManualStrategicV4 />
      </div>
      {/* A Transformação também é o destino do menu "Para Quem": o bloco que
          respondia isso saiu (slide 11) e virou as três linhas do fim dela. */}
      <div id="transformacao">
        <TransformacaoV4 />
      </div>
      {/* Retorno fecha o ato escuro com pb-44: o arco claro do Lucas o
          sobrepõe. */}
      <div id="retorno">
        <RetornoV4 />
      </div>

      {/* ─────────────────── ATO 4 · CLARO ──────────────────── */}
      <div id="depoimento-lucas">
        <TestimonialLucasV4 />
      </div>
      <div id="depoimentos">
        <TestimonialsV4 />
      </div>
      {/* "Compra simples. Acesso imediato. Suporte garantido." (slide 19):
          tira as três dúvidas de pré-compra imediatamente antes do preço. */}
      <div id="compra-simples">
        <CompraSimplesV4 />
      </div>
      {/* "Capacite todo o seu time comercial": justifica o preço antes de o
          preço aparecer. */}
      <div id="equipe">
        <EquipeV4 />
      </div>

      {/* ─────────────────── ATO 5 · ESCURO ─────────────────── */}
      {/* O id vem por prop: envolver num <div id="oferta"> criaria id
          duplicado, e este é o alvo mais referenciado da LP. */}
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
