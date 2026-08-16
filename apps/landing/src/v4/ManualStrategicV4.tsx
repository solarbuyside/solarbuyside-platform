import React, { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Img, Cta, CtaArrow, GrainOverlay, Kicker, Reveal } from './atoms'
import { LightboxV4 } from './LightboxV4'
import { scrollToId } from './scroll'
import { criarTxt, temConteudo } from './cms'

/* OS DOIS ÍNDICES, do Manual e do Código.

   As páginas são renderizadas do PDF de cada livro por
   apps/platform/scripts/gerar-indice.mjs. Strings, e não números, para casar
   com o zero à esquerda do nome do arquivo.

   Por que NÃO são campos de imagem no admin: são derivadas do PDF, não uma
   escolha editorial. Quando um livro for revisado, é rodar o script de novo —
   o que também explica por que os intervalos vivem lá e são repetidos aqui:
   lá para gerar, aqui para exibir.

   O índice do Manual ocupa 7 páginas e o do Código ocupa 2. Não é desleixo:
   são livros de tamanhos diferentes, e o do Código cabe em duas. */
type Livro = {
  prefixo: string
  paginas: readonly string[]
  /** Como a página é chamada no `alt` e no lightbox. */
  nome: string
}

const LIVROS: Record<'manual' | 'codigo', Livro> = {
  manual: {
    prefixo: 'manual-indice',
    paginas: ['08', '09', '10', '11', '12', '13', '14'],
    nome: 'Manual Solar Buy-Side',
  },
  codigo: {
    prefixo: 'codigo-indice',
    paginas: ['03', '04'],
    nome: 'Código do Vendedor Consultivo',
  },
}

const paginasDoLivro = (livro: Livro, section?: { texts: Record<string, string>; images: Record<string, string> }, cmsPrefix?: string) => {
  const firstKey = cmsPrefix ? `${cmsPrefix}1Src` : ''
  if (cmsPrefix && section && firstKey in section.images) {
    return Array.from({ length: 12 }, (_, i) => i + 1)
      .map((i) => ({
        src: section.images[`${cmsPrefix}${i}Src`] ?? '',
        alt: section.texts[`${cmsPrefix}${i}Alt`] ?? `Página ${i} do ${livro.nome}: índice de conteúdo`,
        rotulo: section.texts[`${cmsPrefix}${i}Label`] ?? `p. ${i}`,
      }))
      .filter((pagina) => pagina.src.trim())
  }
  return livro.paginas.map((pagina) => ({
    src: `/assets/${livro.prefixo}-p${pagina}.png`,
    alt: `Página ${Number(pagina)} do ${livro.nome}: índice de conteúdo`,
    rotulo: `p. ${Number(pagina)}`,
  }))
}

/* ── A TIRA DE PÁGINAS DE ÍNDICE ────────────────────────────────────────────

   Nasceu no Manual (Francis, 06/08, slide 12: "criar mockup do manual com as 7
   páginas do ÍNDICE, p. 8 a 14") e virou componente quando o Código pediu a
   mesma coisa (Gabriel, 09/08). Os dois blocos eram idênticos menos por três
   textos e o prefixo dos arquivos.

   POR QUE MOSTRAR O ÍNDICE: o bloco acima promete um número ("130 páginas, 160
   tópicos"); o índice é a PROVA dele, e é a única parte de um livro que dá
   para mostrar inteira sem entregar o conteúdo.

   TIRA DE ROLAGEM, e não leque sobreposto: leque só funciona com hover, e no
   celular (metade do tráfego) não há hover. Aqui o dedo arrasta e o mouse
   arrasta, do mesmo jeito. */
const TiraIndice: React.FC<{
  livro: Livro
  kicker: string
  titulo: string
  lead: string
  paginas: ReturnType<typeof paginasDoLivro>
  aoAmpliar: (indice: number) => void
}> = ({ livro, kicker, titulo, lead, paginas, aoAmpliar }) => {
  /* Apagar o título no admin tira a tira inteira do ar. */
  if (!temConteudo(titulo)) return null

  return (
    <div className="mt-20">
      {temConteudo(kicker) && (
        <Reveal>
          <Kicker tone="dark">{kicker}</Kicker>
        </Reveal>
      )}
      <Reveal delay={80}>
        <h3 className="mt-4 max-w-3xl font-['Sora'] text-2xl font-bold leading-snug tracking-tight text-white md:text-3xl">
          <CMSText value={titulo} />
        </h3>
      </Reveal>
      {temConteudo(lead) && (
        <Reveal delay={140}>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-400">
            <CMSText value={lead} />
          </p>
        </Reveal>
      )}

      <Reveal delay={200}>
        {/* -mx-6 px-6: a tira sangra até as bordas da tela, então a última
            página não parece cortada por acaso, e o primeiro item continua
            alinhado com o texto acima. */}
        <ul className="v4-scroll-x -mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4">
          {paginas.map((pagina, i) => (
            /* MINIATURA MAIOR QUANDO O ÍNDICE É CURTO. As 7 do Manual preenchem
               a linha a 180px; as 2 do Código, no mesmo tamanho, deixavam dois
               terços da faixa vazios e liam como sobra de layout. Maiores, elas
               ocupam a largura e ainda ficam mais legíveis — o que é bem-vindo
               num índice de duas páginas, onde cabe ler os títulos das fases
               antes mesmo de ampliar. */
            <li
              key={pagina.src}
              className={`group shrink-0 snap-start ${
                paginas.length <= 3 ? 'w-[250px] md:w-[300px]' : 'w-[180px] md:w-[210px]'
              }`}
            >
              {/* A miniatura é BOTÃO (Gabriel, 09/08: "se eu clicar em alguma
                  página tem que acontecer alguma coisa"). Ela já parecia
                  clicável — sobe no hover, tem sombra de cartão — e não fazia
                  nada. Pior: a 180px ninguém lê um sumário, então a prova do
                  "160 tópicos" estava ali sem poder ser conferida. Agora abre
                  no lightbox, em ~80% da altura da tela. */}
              <button
                type="button"
                onClick={() => aoAmpliar(i)}
                aria-label={`Ampliar a ${pagina.rotulo} do índice do ${livro.nome}`}
                className="block w-full cursor-zoom-in text-left"
              >
                <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:-translate-y-1.5">
                  <Img src={pagina.src} alt={pagina.alt} loading="lazy" className="h-auto w-full" />
                  {/* A lupa só aparece no hover, e no celular nunca: lá o dedo
                      descobre tocando, e um ícone fixo em cima de cada
                      miniatura taparia justamente o texto que a tira existe
                      para mostrar. */}
                  <span
                    className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-slate-900/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex"
                    aria-hidden
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900">
                      <ZoomIn size={18} />
                    </span>
                  </span>
                </div>
                <p className="v4-mono mt-2.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-slate-300">
                  {pagina.rotulo}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  )
}

/* Lista numerada do ato escuro: rótulo mono laranja + itens 01..N com fio.
   Nasceu no bloco do Código e virou compartilhada quando o Francis pediu a
   mesma coisa no Manual (29/07) — os dois blocos usam a mesma anatomia, então
   duplicar o markup só criaria duas versões para divergirem depois. */
const NumberedList: React.FC<{ title?: string; items: string[] }> = ({ title, items }) => (
  <>
    {/* h3, não h4: o título anterior do bloco é um h2, e pular de h2 para h4
        quebra a ordem da árvore de headings (o Lighthouse acusava "ordem
        sequencial descendente"). */}
    {title?.trim() && (
      <h3 className="border-b border-white/[0.08] pb-3">
        <span className="v4-mono text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500">{title}</span>
      </h3>
    )}
    <ul>
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[48px_1fr] gap-5 border-b border-white/[0.08] py-5">
          <span className="v4-mono text-xl font-bold leading-none text-white/25" aria-hidden>
            {`0${i + 1}`}
          </span>
          <p className="leading-relaxed text-slate-300">
            <CMSText value={item} />
          </p>
        </li>
      ))}
    </ul>
  </>
)

export const ManualStrategicV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('manual-strategic')
  const txt = criarTxt(section)

  const manualImage = section?.images.manualImage === undefined ? '/assets/Capa-manual-buy-side-definitiva.png' : section.images.manualImage
  const codeImage = section?.images.codeImage === undefined ? '/assets/codigo-oficial-norm.png' : section.images.codeImage
  const paginasManual = paginasDoLivro(LIVROS.manual, section, 'manualIndexPage')
  const paginasCodigo = paginasDoLivro(LIVROS.codigo, section, 'codeIndexPage')

  /* Bloco "Código do Vendedor" (dentro do Manual, na LP oficial): era texto
     fixo no código e por isso não aparecia no editor do admin — reportado pelo
     Francis em 2026-07-23. Agora vem do CMS, com 4 parágrafos; os vazios não
     renderizam. Destaque em negrito usa <span class="cms-bold"> (o CMSText
     remove <strong>). */
  /* Ordem pedida no slide 4 (Francis 2026-07-22): parágrafos 1-2, depois a
     lista "O que você leva", depois os parágrafos 3-4 de fechamento. Por isso
     os parágrafos vêm em dois grupos, não numa lista só. */
  const notEmpty = (value: string) => value.trim().length > 0

  /* Os parágrafos deixaram de ser 2 fixos de cada lado (Francis, 27/07: "é
     preciso criar um outro parágrafo para separar em 2 o primeiro"). Agora são
     listas: codeTop1..N antes da lista e codeBottom1..N depois, editáveis no
     admin com adicionar/remover.

     As chaves antigas (codeDesc1-4) continuam valendo como fallback nas duas
     primeiras posições de cada grupo — o banco ainda guarda o texto ali, e
     migrar sem isso apagaria o conteúdo publicado até o primeiro salvamento. */
  const MAX_PARAGRAFOS = 8
  const lerParagrafos = (prefixo: string, legado: (string | undefined)[]) => {
    const out: string[] = []
    for (let i = 1; i <= MAX_PARAGRAFOS; i++) {
      const novo = section?.texts[`${prefixo}${i}`]
      const valor = novo ?? legado[i - 1]
      if (valor === undefined) continue
      out.push(valor)
    }
    return out.filter(notEmpty)
  }

  const codeParagraphsTop = lerParagrafos('codeTop', [
    section?.texts.codeDesc1 ??
      'Como extensão prática do Manual de Compra Solar Buy-Side, o <span class="cms-bold">Código do Vendedor Consultivo</span> ensina você a pensar como um comprador para conduzir negociações com mais estratégia, segurança e autoridade.',
    section?.texts.codeDesc2 ??
      'Ao aplicar o método, você compreende como o cliente avalia riscos, compara propostas e toma decisões de investimento. Em vez de disputar vendas pelo menor preço, passa a construir valor, conduzir a decisão de compra e posicionar sua proposta como a escolha mais segura.',
  ])
  const codeParagraphsBottom = lerParagrafos('codeBottom', [
    section?.texts.codeDesc3 ??
      'Se o Manual Solar Buy-Side mostra como o comprador decide, o Código do Vendedor Consultivo ensina a transformar esse conhecimento em negociações mais estratégicas, vendas mais lucrativas e clientes mais confiantes.',
    section?.texts.codeDesc4 ?? 'Resultado: você deixa de competir por preço e passa a vender por valor.',
  ])

  /* Listas numeradas dos dois blocos. A do Código veio primeiro (Francis
     2026-07-23); a do Manual foi pedida em 29/07 ("do mesmo jeito do que para
     o código"), com um subtítulo próprio. Itens vazios não renderizam, então o
     cliente controla quantos aparecem sem passar por aqui.
     O teto espelha os slots oferecidos no editor (field-schema.ts). */
  const MAX_ITENS = 6
  const lerItens = (prefixo: string) => {
    const out: string[] = []
    for (let i = 1; i <= MAX_ITENS; i++) {
      const valor = section?.texts[`${prefixo}${i}`]
      if (valor === undefined) continue
      out.push(valor)
    }
    return out.filter(notEmpty)
  }

  const manualItems = lerItens('manualItem')
  const codeItems = lerItens('codeItem')

  /* Qual página está ampliada, e de qual livro. Um lightbox só serve às duas
     tiras: são o mesmo componente e nunca ficam abertas ao mesmo tempo. */
  const [ampliada, setAmpliada] = useState<{ livro: 'manual' | 'codigo'; indice: number } | null>(null)

  /* Textos das tiras de índice. Apagar o título tira a tira inteira do ar. */
  const indiceTitulo = txt('indexTitle', 'As 7 páginas de índice do Manual')
  const indiceLead = txt(
    'indexLead',
    'São 160 tópicos organizados em 4 fases, do primeiro cálculo de consumo à assinatura do contrato. É este roteiro que o seu próximo cliente vai usar para avaliar a sua proposta.',
  )

  /* O lead do Código não cita contagem de tópicos de propósito. Cada afirmação
     dele dá para conferir na própria imagem do índice, que é o que a tira
     mostra: as 4 fases, as 3 etapas do roteiro, o mapa e o checklist. Número
     redondo inventado num lugar onde a prova está do lado é o tipo de coisa
     que derruba a credibilidade do resto da página. */
  const codigoIndiceTitulo = txt('codeIndexTitle', 'Tudo o que o Código cobre, tópico a tópico')
  const codigoIndiceLead = txt(
    'codeIndexLead',
    'Da imersão no olhar do comprador à rodada final de negociação: 4 fases, um roteiro de treinamento em 3 etapas, o mapa do essencial e o checklist Buy-Side.',
  )

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#07090d] to-[#0b0907] text-slate-100 antialiased">
      <GrainOverlay />

      {/* O pb-44 do arco "paper" mudou de dono: quem fecha o ato escuro agora
          é a seção Retorno (RetornoV4), logo abaixo. */}
      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
        {/* ── Título da seção (Francis, slide 11: "criar este título da seção
            MANUAL ESTRATÉGICO"). Cobre as duas ferramentas do "kit": o Manual
            e o Código.

            A "Parte 2: resultados" ("Veja o que muda quando você passa a
            vender pelo Método Solar Buy-Side", com as colunas NA SUA FORMA DE
            VENDER / NO SEU FATURAMENTO) saiu inteira na revisão de 06/08,
            slide 14. As chaves de CMS dela (section2Title, section2Subtitle,
            sellCard1..3, focusCard1..3, sellSideHeader, focusHeader) ficaram
            órfãs no banco de propósito: apagá-las seria uma migration
            destrutiva por texto que ele pode querer de volta. ───────────── */}
        <Reveal>
          <h2 className="font-['Sora'] text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-[1.08] tracking-tight text-white">
            {txt('kitTitle', 'Kit Completo Solar Buy-Side')}
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
            {txt('kitSubtitle', 'Para conduzir decisões, você precisa dominar dois lados da conversa.')}
          </p>
        </Reveal>
        <div className="my-14 h-px w-full bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" aria-hidden />

        {/* ── Parte 1: spotlight do produto ─────────────────────────────── */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Texto */}
          <div className="relative z-10 flex flex-col lg:col-span-7">
            <Reveal>
              <Kicker tone="dark">{txt('badge', 'A ferramenta estratégica')}</Kicker>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-4 text-[clamp(2.6rem,5vw,4.2rem)] font-extrabold leading-[1.05] tracking-tight text-white">
                {txt('title', 'Manual Solar Buy-Side')}
              </h2>
            </Reveal>
            <Reveal delay={180}>
              {/* v4-nojust: chamada em itálico num `max-w-md` (448px). As
                  outras duas chamadas serif da página são de 576px e 768px e
                  justificam bem; esta é curta demais para abrir os espaços. */}
              <p className="v4-nojust v4-serif mt-5 max-w-md border-l-2 border-orange-500 pl-5 text-2xl leading-snug text-amber-200/90">
                {txt('subtitle', 'A ferramenta estratégica que todo vendedor do setor solar precisa ter.')}
              </p>
            </Reveal>

            <Reveal delay={270} className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-slate-400">
              <p>
                {txt('description1', 'O Manual de Compra Solar Buy-Side é uma leitura essencial para profissionais do setor de vendas (Sell-Side) que desejam se destacar em um mercado ultracompetitivo.')}
              </p>
              <p>
                {txt('description2', 'Ao proporcionar uma imersão na jornada de compra sob a ótica do comprador, este manual oferece uma compreensão estratégica dos critérios, motivações e desafios enfrentados pelo lado comprador (Buy-Side).')}
              </p>
              {/* Parágrafo 3: existe no CMS/admin desde sempre, mas nunca era
                  renderizado (bug reportado pelo Francis em 2026-07-23). */}
              {section?.texts.description3?.trim() && <p>{section.texts.description3}</p>}
            </Reveal>

            {/* Lista numerada do Manual (Francis, 29/07): mesma lista que o
                Código já tinha, aqui logo abaixo dos parágrafos. */}
            {manualItems.length > 0 && (
              <Reveal delay={360} className="mt-10 max-w-2xl">
                <NumberedList title={section?.texts.manualListTitle} items={manualItems} />
              </Reveal>
            )}
          </div>

          {/* Pedestal de luz: glow + capa flutuando + elipse no chão + reflexo */}
          {manualImage && <div className="lg:sticky lg:top-24 lg:col-span-5">
            <Reveal delay={180}>
              <div className="relative flex justify-center">
                <div className="absolute -inset-12 rounded-full bg-orange-500/25 blur-[120px]" aria-hidden />

                <div className="relative w-[390px] max-w-full">
                  <div className="relative">
                    <Img
                      src={manualImage}
                      alt="Manual Solar Buy-Side"
                      className="v4-float relative h-auto w-full"
                      loading="lazy"
                    />
                    {/* Elipse de luz no chão */}
                    <div
                      className="absolute -bottom-10 left-1/2 h-16 w-[70%] -translate-x-1/2 rounded-[100%] bg-orange-500/20 blur-2xl"
                      aria-hidden
                    />
                  </div>

                  {/* Reflexo espelhado */}
                  <Img
                    src={manualImage}
                    alt=""
                    aria-hidden
                    className="h-40 w-full scale-y-[-1] object-cover object-bottom opacity-[0.07]"
                    style={{
                      WebkitMaskImage: 'linear-gradient(180deg, black, transparent 70%)',
                      maskImage: 'linear-gradient(180deg, black, transparent 70%)',
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
            </Reveal>
          </div>}
        </div>

        <TiraIndice
          livro={LIVROS.manual}
          kicker={txt('indexKicker', 'O índice completo')}
          titulo={indiceTitulo}
          lead={indiceLead}
          paginas={paginasManual}
          aoAmpliar={(i) => setAmpliada({ livro: 'manual', indice: i })}
        />

        {/* ── Código do Vendedor: vem logo após o Manual (ordem do Francis) ─
            items-start (era items-center): a capa ficava centralizada na
            vertical enquanto a do Manual alinha pelo topo, com o título.

            `id="codigo"`: âncora de rolagem, nada mais — sem efeito visual. O
            Código é a única das três peças do kit que não tinha endereço
            próprio (o Manual tem `#manual-strategic`, a Plataforma tem
            `#plataforma`), porque ele mora DENTRO da seção do Manual. O leque
            do Hero da variante B leva cada capa para a sua explicação, e sem
            isto a do Código cairia no começo do bloco do Manual, ou seja, na
            explicação errada. O `scroll-margin-top: 76px` de `.v4-root [id]`
            já desconta o cabeçalho fixo. */}
        <div id="codigo" className="mt-24 grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="relative z-10 flex flex-col lg:col-span-7">
            <Reveal>
              <Kicker tone="dark">{txt('codeBadge', 'Diferencial estratégico')}</Kicker>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-4 text-[clamp(2.2rem,4.4vw,3.6rem)] font-extrabold leading-[1.06] tracking-tight text-white">
                <CMSText value={txt('codeTitle', 'Código do Vendedor Consultivo')} />
              </h2>
            </Reveal>
            {section?.texts.codeSubtitle?.trim() && (
              <Reveal delay={130}>
                <p className="v4-serif mt-5 max-w-xl border-l-2 border-orange-500 pl-5 text-2xl leading-snug text-amber-200/90">
                  <CMSText value={section.texts.codeSubtitle} />
                </p>
              </Reveal>
            )}
            <Reveal delay={180} className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-slate-400">
              {codeParagraphsTop.map((paragraph, i) => (
                <p key={i}>
                  <CMSText value={paragraph} />
                </p>
              ))}
            </Reveal>
            {codeItems.length > 0 && (
              <Reveal delay={240} className="mt-10 max-w-2xl">
                <NumberedList title={section?.texts.codeListTitle} items={codeItems} />
              </Reveal>
            )}
            {codeParagraphsBottom.length > 0 && (
              <Reveal delay={300} className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-slate-400">
                {codeParagraphsBottom.map((paragraph, i) => (
                  <p key={i}>
                    <CMSText value={paragraph} />
                  </p>
                ))}
              </Reveal>
            )}
          </div>

          {codeImage && <div className="lg:col-span-5">
            <Reveal delay={180}>
              <div className="relative flex justify-center">
                <div className="absolute -inset-10 rounded-full bg-orange-500/20 blur-[110px]" aria-hidden />
                <div className="relative w-[300px] max-w-full">
                  <Img
                    src={codeImage}
                    alt="O Código do Vendedor Consultivo"
                    className="v4-float relative h-auto w-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]"
                    loading="lazy"
                  />
                  <div
                    className="absolute -bottom-8 left-1/2 h-14 w-[70%] -translate-x-1/2 rounded-[100%] bg-orange-500/20 blur-2xl"
                    aria-hidden
                  />
                </div>
              </div>
            </Reveal>
          </div>}
        </div>

        {/* A mesma tira, agora com o índice do Código (Gabriel, 09/08: "do
            mesmo jeito que tu fez isso aqui, faça no bloco do Código do
            Vendedor Consultivo, com o índice do Código").

            Fica DEPOIS do bloco do Código e antes do CTA, no mesmo lugar
            relativo que a do Manual ocupa no bloco dele: primeiro o argumento,
            depois a prova, depois o convite. */}
        <TiraIndice
          livro={LIVROS.codigo}
          kicker={txt('codeIndexKicker', 'O índice completo')}
          titulo={codigoIndiceTitulo}
          lead={codigoIndiceLead}
          paginas={paginasCodigo}
          aoAmpliar={(i) => setAmpliada({ livro: 'codigo', indice: i })}
        />

        {/* CTA 3 — depois do Código, antes dos resultados (ordem do Francis).
            Texto novo na revisão de 25/07, slide 12. O valor antigo ("Quero
            vender com estratégia") é tratado como legado para a LP não
            depender do seed. */}
        {temConteudo(txt('ctaButton', 'Quero vender mais e com estratégia')) && <Reveal delay={120} className="mt-12">
          <Cta size="lg" onClick={() => scrollToId('oferta')}>
            {section?.texts.ctaButton === undefined || section.texts.ctaButton === 'Quero vender com estratégia'
              ? 'Quero vender mais e com estratégia'
              : section.texts.ctaButton}
            <CtaArrow size={20} />
          </Cta>
        </Reveal>}
      </div>

      {/* UM lightbox para as duas tiras: ele recebe as páginas do livro que
          está aberto. Dois componentes dariam dois travamentos de rolagem e
          dois ouvintes de teclado disputando o Esc.

          Fica FORA do <div> de conteúdo, no fim da seção, porque na prática se
          monta num portal para o <body> — a posição aqui é só onde o React o
          mantém na árvore. Não renderiza nada enquanto `ampliada` for `null`. */}
      <LightboxV4
        itens={(ampliada?.livro ?? 'manual') === 'manual' ? paginasManual : paginasCodigo}
        indice={ampliada?.indice ?? null}
        aoFechar={() => setAmpliada(null)}
        aoTrocar={(i) => setAmpliada((a) => (a ? { ...a, indice: i } : a))}
      />
    </section>
  )
}
