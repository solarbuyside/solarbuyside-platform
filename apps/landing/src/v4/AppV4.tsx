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

   ORDEM DAS SEÇÕES = ordem dos slides do PPTX "V5 REVISÃO 15.08.2026" do
   Francis. Ele monta a revisão como um deck: um slide por dobra, na sequência
   em que quer ver a página. Nesta rodada os slides 2, 6, 7 e 9 a 15 vêm SEM
   anotação nenhuma — são screenshots puros, e a mensagem deles é justamente a
   posição em que aparecem.

   O que mudou de lugar em relação à revisão de 06/08 (ele reordenou os cinco
   primeiros blocos depois de cruzar as auditorias de Claude e ChatGPT):
   - os Apoiadores subiram da 4ª para a 2ª dobra, colados no Hero;
   - "Como o método funciona em 3 passos" passou na frente da Plataforma
     (slide 3 antes do 4) — o método antes da ferramenta que o executa;
   - a Transformação subiu de 8ª para 5ª (slide 5), logo depois da Plataforma;
   - Mentores e Panorama desceram uma casa cada, empurrados pela Transformação.

   Da seção Retorno (slide 11) para baixo nada mudou.

   O "PARA QUEM" MUDOU DE DONO. Ele era o fecho da Transformação e agora fica
   logo abaixo do player de vídeo (slides 5 e 8: "Para quem é transferido
   abaixo do VÍDEO" / "Inserir PARA QUEM aqui"). As chaves seguem gravadas na
   seção `transformacao` do banco — só o render mudou de lugar, para o Francis
   não perder o texto nem o ponto de edição no admin.

   RITMO CLARO/ESCURO. Apoiadores é a única seção clara desta metade da página,
   e subir para a 2ª posição move as fronteiras dos cinco atos sem quebrá-los:

     ESCURO  Hero
     CLARO   Apoiadores                                     (sobe com arco)
     ESCURO  3 passos · Plataforma · Transformação ·
             Mentores · Panorama+Vídeo+Para quem ·
             Manual+Código · Retorno                        (sobe com arco)
     CLARO   Lucas · Rodrigo · Compra simples · Equipe       (sobe com arco)
     ESCURO  Oferta · FAQ · Contato                          (sobe com arco)

   Continuam cinco atos e nenhuma ilha de cor solta. O arco que abria o ato
   escuro TROCOU DE DONO junto com a ordem: era dos Mentores (AuthorityV4) e
   passou para "Como o método funciona" (PropositoV4), que é quem agora vem
   logo depois do bloco claro. Mexer na ordem aqui sem mover o arco lá deixa
   um degrau de cor no meio da página. */

/* Ids observados pelo IntersectionObserver do funil. É lista MANUAL: seção
   sem entrada aqui nunca aparece no relatório de conversão do admin.
   Espelhada em apps/platform/src/lib/landing/funnel.ts, que dá os rótulos. */
const SECTION_IDS = [
  'hero',
  'apoiadores',
  'proposito',
  'plataforma',
  'transformacao',
  'authority',
  'contexto',
  'video-section',
  'para-quem',
  'manual-strategic',
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

      {/* `v4-just` = texto justificado no desktop (V5, slide 16). Fica nos
          wrappers, e não numa regra global, porque justify só serve para
          COLUNA DE LEITURA: as seções de fora — Hero, Compra simples, Oferta,
          Contato, rodapé — são cartão estreito, rótulo e endereço, onde
          justificar só abre rio de espaço. Ver o bloco no v4.css. */}

      {/* ─────────────────── ATO 2 · CLARO ──────────────────── */}
      {/* Colado no Hero (V5, slide 2). O argumento do Francis para ter subido
          os Apoiadores continua valendo, agora levado ao limite: "transferir a
          credibilidade dessas marcas desde os primeiros instantes do lead na
          página". Antes ele era a 4ª dobra; agora é a primeira coisa depois do
          topo. */}
      <div id="apoiadores" className="v4-just">
        <ApoiadoresV4 />
      </div>

      {/* ─────────────────── ATO 3 · ESCURO ─────────────────── */}
      {/* "Como o método funciona em 3 passos" (slide 3) abre o ato escuro e
          carrega o arco. O MÉTODO vem antes da FERRAMENTA que o executa: os
          três passos nomeiam Manual, Código e Plataforma, e a dobra seguinte
          mostra a Plataforma funcionando. Na ordem antiga a ferramenta chegava
          primeiro e os passos explicavam algo já visto. */}
      <div id="proposito" className="v4-just">
        <PropositoV4 />
      </div>
      <div id="plataforma" className="v4-just">
        <PlatformV4 />
      </div>
      {/* A Transformação subiu para logo depois da Plataforma (slide 5). Ela
          perdeu o "Para quem" do fim, que agora vive abaixo do vídeo. */}
      <div id="transformacao" className="v4-just">
        <TransformacaoV4 />
      </div>
      {/* Dois ids na mesma seção: `authority` é o do funil e o do preview do
          admin; `autor` fica no <section> e é o alvo do menu "Mentor". */}
      <div id="authority" className="v4-just">
        <AuthorityV4 />
      </div>
      {/* O vídeo vive DENTRO do Panorama e leva o id `video-section`; logo
          abaixo dele, ainda dentro desta seção, vem o "Para quem" (id
          `para-quem`, alvo do menu). */}
      <div id="contexto" className="v4-just">
        <ContextV4 />
      </div>
      <div id="manual-strategic" className="v4-just">
        <ManualStrategicV4 />
      </div>
      {/* Retorno fecha o ato escuro com pb-44: o arco claro do Lucas o
          sobrepõe. */}
      <div id="retorno" className="v4-just">
        <RetornoV4 />
      </div>

      {/* ─────────────────── ATO 4 · CLARO ──────────────────── */}
      <div id="depoimento-lucas" className="v4-just">
        <TestimonialLucasV4 />
      </div>
      <div id="depoimentos" className="v4-just">
        <TestimonialsV4 />
      </div>
      {/* "Compra simples. Acesso imediato. Suporte garantido." (slide 19):
          tira as três dúvidas de pré-compra imediatamente antes do preço. */}
      <div id="compra-simples">
        <CompraSimplesV4 />
      </div>
      {/* "Capacite todo o seu time comercial": justifica o preço antes de o
          preço aparecer. */}
      <div id="equipe" className="v4-just">
        <EquipeV4 />
      </div>

      {/* ─────────────────── ATO 5 · ESCURO ─────────────────── */}
      {/* O id vem por prop: envolver num <div id="oferta"> criaria id
          duplicado, e este é o alvo mais referenciado da LP. */}
      <PricingV4 id="oferta" />
      <div id="faq" className="v4-just">
        <FAQV4 />
      </div>
      <ContactV4 />
      </main>
      <FooterV4 />
    </div>
  )
}
