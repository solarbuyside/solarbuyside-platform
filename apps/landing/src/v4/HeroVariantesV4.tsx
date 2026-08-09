import React from 'react'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Img, WordReveal } from './atoms'
import { useApoiadores } from './ApoiadoresV4'
import { scrollToId } from './scroll'
import { trackBuyClick } from '../utils/analytics'
import { criarTxt, temConteudo } from './cms'
import { TelaPlataformaV4 } from './TelaPlataformaV4'

/* VARIANTES DO HERO, para comparar direções lado a lado (ver heroVariante.ts).
   A variante A ("Amanhecer") vive em HeroV4.tsx e é a que está no ar; estas
   duas são autocontidas de propósito. Elas repetem a leitura do CMS em vez de
   compartilhar um hook com a A: assim mexer aqui não pode quebrar a página de
   produção, e quando uma direção for escolhida as outras duas somem com o
   arquivo inteiro, sem deixar abstração órfã para trás.

   O QUE AS LPs DE REFERÊNCIA FAZEM E A PRIMEIRA VERSÃO DESTAS DUAS NÃO FAZIA
   (Gabriel, 09/08, com quatro referências):

   1. O PRODUTO É ENORME E SANGRA PELA BORDA. Em todas as quatro a imagem
      atravessa o limite da tela em vez de ficar contida numa caixa. Objeto
      cortado pela borda lê como "grande demais para caber"; objeto centrado
      com margem dos dois lados lê como miniatura de catálogo.
   2. O TEXTO É CURTÍSSIMO: headline, uma linha de apoio, botões. Nenhuma
      delas explica o produto na primeira dobra.
   3. DOIS BOTÕES, não um: o primário de compra e um secundário de baixo
      compromisso, para quem ainda não decidiu e hoje só tem a opção de sair.
   4. PROVA logo abaixo dos botões, em letra pequena. */

/* ── peças comuns às duas ──────────────────────────────────────────────── */

function useTextosHero() {
  const { getSection } = useContent()
  const t = criarTxt(getSection('hero'))
  const subCms = t('subtitle', t('subtitle1', ''))

  return {
    titlePrefix: t('titlePrefix', t('title1', 'Saia da Disputa de Preço e')),
    titleHighlight: t('titleHighlight', t('title2', 'Passe a Vender Decisões')),
    titleSuffix: t('titleSuffix', 'em Sistema Solar'),
    // Mesma regra de legado da variante A: o texto antigo do banco cai no novo.
    subtitle:
      !subCms || subCms.startsWith('O método Buy-Side')
        ? 'O Movimento Solar Buy-Side promove uma nova forma de vender: pela perspectiva do <span class="cms-semibold">comprador</span>'
        : subCms,
    selo: t('manualTitle', 'Manual Solar Buy-Side'),
  }
}

function useKit() {
  const { getSection, globalSettings } = useContent()
  const pricing = getSection('pricing')
  const t = criarTxt(pricing)

  return {
    pecas: [
      {
        title: t('heroKit1Title', 'Manual de Compra de Sistema Solar'),
        image: pricing?.images.card1Image || '/assets/manual-norm.png',
      },
      {
        title: t('heroKit2Title', t('card2Title', 'Código do Vendedor Consultivo')),
        image: pricing?.images.card2Image || '/assets/codigo-norm.png',
      },
      {
        title: t('heroKit3Title', t('cardPlatformTitle', 'Plataforma de Avaliação de Proposta Comercial')),
        image: pricing?.images.cardPlatformImage || '/assets/capa-plataforma-tablet.png',
      },
    ],
    cta: t('heroKitCta', 'Quero o Kit Completo Agora'),
    link: globalSettings.purchaseLink || '#oferta',
    externo: Boolean(globalSettings.purchaseLink),
  }
}

const BotaoPrimario: React.FC<{ texto: string; link: string; externo: boolean }> = ({ texto, link, externo }) => (
  <a
    href={link}
    target={externo ? '_blank' : undefined}
    rel={externo ? 'noopener noreferrer' : undefined}
    onClick={trackBuyClick}
    className="v4-cta-shine group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-8 py-4 text-[15px] font-extrabold tracking-tight text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] md:text-base"
  >
    <span className="relative z-10">{texto}</span>
    <ArrowRight size={18} className="relative z-10 shrink-0 transition-transform group-hover:translate-x-1" />
  </a>
)

/* Segundo botão, de baixo compromisso. Não é enfeite: quem chega e ainda não
   decidiu tem, hoje, só a opção de sair da página. Leva para a seção da
   Plataforma, que é o ativo que mais convence quem está em dúvida. */
const BotaoSecundario: React.FC<{ texto: string; alvo: string }> = ({ texto, alvo }) => (
  <button
    type="button"
    onClick={() => scrollToId(alvo)}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-6 py-4 text-[15px] font-bold text-slate-200 backdrop-blur-sm transition-colors duration-300 hover:border-white/25 hover:bg-white/10 hover:text-white md:text-base"
  >
    <PlayCircle size={17} className="shrink-0 text-orange-400" aria-hidden />
    {texto}
  </button>
)

/** Fileira de prova. Chip branco porque metade dos logos é escura na arte. */
const Prova: React.FC<{ rotulo: string; centro?: boolean }> = ({ rotulo, centro = false }) => {
  const { logos } = useApoiadores()
  const marcas = logos
    .filter((l) => l.src)
    /* A mesma marca pode estar cadastrada em duas categorias (a BelEnergy é
       distribuidora âncora E fabricante). Na seção de apoiadores isso é
       correto, porque lá o agrupamento é por categoria; numa fileira só, o
       logo repetido lê como bug.

       A chave é o SRC, não o nome. As duas fichas da BelEnergy apontam para o
       mesmo arquivo com nomes diferentes ("BelEnergy" e "BelEnergy Fixação e
       Carregador Elétrico"), então deduplicar por nome deixava as duas
       passarem: a fileira mostrava o mesmo logo duas vezes lado a lado e
       ainda gastava uma das cinco vagas, empurrando a Clamper para fora.
       O olho compara arquivos, não cadastros. */
    .filter((l, i, todos) => todos.findIndex((o) => o.src === l.src) === i)
    .slice(0, 5)
  if (marcas.length === 0) return null

  return (
    <div className={centro ? 'text-center' : ''}>
      <p className="v4-mono text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">{rotulo}</p>
      <div className={`mt-4 flex flex-wrap items-center gap-3 ${centro ? 'justify-center' : ''}`}>
        {marcas.map((m, i) => (
          <span
            key={i}
            className="flex h-8 items-center justify-center rounded-md bg-white/90 px-2.5 opacity-75 transition-opacity duration-300 hover:opacity-100"
          >
            <Img src={m.src} alt={m.name} loading="lazy" className="h-3.5 w-auto object-contain" />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   VARIANTE B — "EDITORIAL"

   Texto à esquerda, produto à direita SANGRANDO pela borda.

   A variante A empilha tudo num eixo só e deixa metade da largura vazia dos
   dois lados em tela grande. Aqui a horizontalidade vira o layout: a headline
   ocupa ~48% e cresce, e o kit vira um objeto único de altura inteira, cortado
   pela direita. É o gesto das referências: o produto não cabe na tela, e é
   justamente isso que o faz parecer grande.

   O leque tem três camadas com escalas e rotações diferentes, não três capas
   do mesmo tamanho lado a lado. Profundidade é o que separa "um kit" de "três
   arquivos". ═════════════════════════════════════════════════════════════ */

export const HeroEditorialV4: React.FC = () => {
  const { titlePrefix, titleHighlight, titleSuffix, subtitle, selo } = useTextosHero()
  const { pecas, cta, link, externo } = useKit()

  /* HIERARQUIA DO LEQUE (Gabriel, 09/08): o MANUAL é o produto principal e
     precisa estar no centro e na frente. Antes o centro era o Código do
     Vendedor, e o Manual ficava atrás, à esquerda, com o título tapado pela
     capa da frente: a peça que dá nome à oferta era a única ilegível dos três.

     As três também DIMINUÍRAM. Ocupando quase toda a metade direita elas se
     cobriam demais (do tablet sobrava uma tira) e a dobra lia como amontoado.
     Menores, cada uma se separa da vizinha e o leque volta a ter ar entre as
     camadas, que é o que faz a profundidade aparecer.

     A ordem de `pecas` é [manual, código, plataforma] e as poses seguem esse
     índice, então trocar a ordem lá troca quem fica no centro. */
  /* As alturas sobem juntas para o leque ficar na MESMA faixa vertical do
     texto. Encostado no pé da dobra ele desequilibrava o quadro: coluna de
     texto no meio à esquerda, bloco de capas no rodapé à direita, e uma banda
     escura vazia ocupando o quarto superior direito. */
  const POSES = [
    /* MANUAL: centro, na frente, o maior e o único reto. Reto no meio de dois
       inclinados é o que elege o principal sem precisar de rótulo. */
    'left-[52%] bottom-[13%] w-[42%] -translate-x-1/2 z-30',
    /* CÓDIGO: atrás e à esquerda, tombado para dentro. Mais estreito e mais
       inclinado que o Manual, para ler como camada de fundo: a capa da frente
       come o fim do título dele de qualquer jeito, e meia palavra legível a
       13° passa por sobreposição, a 0° passa por erro. */
    'left-[-1%] bottom-[24%] w-[31%] -rotate-[15deg] opacity-90 z-20',
    /* PLATAFORMA: atrás e à direita, e é ESTA que sangra pela tela. A -1% ela
       parava dentro do quadro em 1366px e o gesto das referências sumia justo
       na largura de notebook mais comum. A -8% sai ~40% dela em qualquer
       largura, que é o "não cabe" que se quer dizer. */
    'right-[-8%] bottom-[22%] w-[35%] rotate-[11deg] opacity-85 z-10',
  ]

  const leque = (
    <div className="relative h-full w-full">
      {/* Fonte de luz atrás do produto: é ela que faz o objeto existir no
          espaço, em vez de parecer colado sobre um fundo. */}
      <div
        className="absolute left-1/2 top-1/2 h-[58vmin] w-[58vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/25 blur-[130px]"
        aria-hidden
      />
      {/* Elipse de contato, a mesma solução do pedestal da variante A: sem ela
          três objetos com sombra própria continuam boiando, porque nada no
          quadro diz onde é o chão. */}
      <div
        className="absolute bottom-[10%] left-1/2 h-8 w-[62%] -translate-x-1/2 rounded-[100%] bg-orange-400/20 blur-2xl"
        aria-hidden
      />
      {pecas.map((peca, i) => (
        <div
          key={peca.title}
          className={`group absolute ${POSES[i]} transition-transform duration-700 hover:-translate-y-3`}
        >
          <Img
            src={peca.image}
            alt={peca.title}
            loading="lazy"
            className="h-auto w-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.85)]"
          />
        </div>
      ))}
    </div>
  )

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#07090d]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(120deg, #0b1220 0%, #090d16 42%, #0d0906 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(65% 80% at 82% 40%, rgba(249,115,22,0.22), transparent 66%), radial-gradient(45% 55% at 2% 20%, rgba(59,130,246,0.14), transparent 70%)',
          }}
        />
        <div className="v4-rays absolute left-[80%] top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]" />
        <div className="v4-cells absolute inset-0 opacity-30" />
        <div className="v4-noise absolute inset-0 opacity-[0.03]" />
      </div>

      {/* PRODUTO EM SANGRIA: camada própria, altura inteira, encostada na borda
          direita e transbordando dela. Só no desktop; no celular ele entra no
          fluxo, abaixo do texto.

          Estreitou de 52% para 47% junto com as capas, e a sangria caiu de 6%
          para 3%: quem sangra agora é só o tablet do fundo, não o leque
          inteiro. Cortar o objeto principal pela borda diria "não coube"; o
          que se quer dizer é "tem mais atrás". */}
      <div className="pointer-events-none absolute bottom-0 right-[-3%] top-24 hidden w-[47%] lg:block" aria-hidden>
        {leque}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-6 pb-16 pt-28 md:pt-32">
        <div className="w-full lg:max-w-[58%]">
          <div
            className="v4-rise inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] py-2 pl-3 pr-5 backdrop-blur-sm"
            style={{ ['--d' as string]: '0ms' }}
          >
            <span className="h-2 w-2 rotate-45 rounded-[1px] bg-gradient-to-br from-orange-400 to-orange-600" aria-hidden />
            <span className="v4-mono text-[10px] font-bold uppercase tracking-[0.25em] text-slate-300">{selo}</span>
          </div>

          {/* TRÊS LINHAS, UMA POR PARTE (Gabriel, 09/08: "deveria ter 3 linhas
              não 4"). As três partes vinham no mesmo fluxo e o navegador
              quebrava onde desse: numa coluna de 48% a primeira parte não
              cabia inteira e "Saia da Disputa de / Preço e" virava duas
              linhas, somando quatro. Em blocos a quebra é determinística e a
              frase tem a mesma silhueta em toda largura, como na variante A.

              Para as três caberem numa linha cada, a coluna abriu (48% → 58%)
              e o corpo desceu (4rem → 3.25rem no teto). A linha mais larga NÃO
              é o destaque em itálico, é o prefixo "Saia da Disputa de Preço e":
              12,7 vezes o corpo, contra 10,3 do itálico. Medido no navegador,
              porque a estimativa a olho errou e sobrava um "e" órfão na 2ª
              linha. A 3,25rem o prefixo pede 660px e a coluna entrega 714px
              (a partir de 1280px o container trava em max-w-7xl, então esses
              714px são o piso da folga, não o teto). Abaixo disso os dois
              encolhem juntos pelo vw e a proporção se mantém.

              Saiu também o `whitespace-nowrap` do destaque. Ele existia para o
              itálico não rachar, mas com blocos isso já está garantido, e no
              celular ele forçava uma linha de 23 caracteres a caber em 390px:
              "Passe a Vender Decisõ..." vazava a tela cortada. */}
          <h1 className="mt-7 text-[clamp(2.05rem,3.8vw,3.25rem)] font-extrabold leading-[1.06] tracking-[-0.035em] text-white">
            <span className="block">
              <WordReveal trigger="load" text={titlePrefix} baseDelay={80} step={40} />
            </span>
            <span className="block">
              <WordReveal
                trigger="load"
                text={titleHighlight}
                baseDelay={340}
                step={55}
                wordClassName="v4-serif v4-grad-text pr-[0.06em]"
              />
            </span>
            <span className="block">
              <WordReveal trigger="load" text={titleSuffix} baseDelay={470} step={40} wordClassName="text-white" />
            </span>
          </h1>

          <p className="v4-rise mt-6 max-w-md text-lg leading-relaxed text-slate-300" style={{ ['--d' as string]: '560ms' }}>
            <CMSText value={subtitle} />
          </p>

          <div
            className="v4-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ ['--d' as string]: '700ms' }}
          >
            {temConteudo(cta) && <BotaoPrimario texto={cta} link={link} externo={externo} />}
            <BotaoSecundario texto="Ver a Plataforma" alvo="plataforma" />
          </div>

          <div className="v4-rise mt-12" style={{ ['--d' as string]: '840ms' }}>
            <Prova rotulo="Apoiado por empresas de referência do setor" />
          </div>
        </div>
      </div>

      {/* O mesmo leque, agora no fluxo, para o celular. Sem o px-6: no desktop
          o gesto é o produto encostando na borda, e a versão de celular não
          tem motivo para ser a única com margem dos dois lados. */}
      <div className="relative z-10 h-[340px] w-full pb-8 sm:h-[420px] lg:hidden">{leque}</div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   VARIANTE C — "VITRINE"

   Direção oposta às outras duas: em vez de mostrar as CAPAS (o que você
   recebe), mostra a TELA (o que a coisa faz).

   O argumento é de conversão, não de estética. O que mais convence um
   integrador é ver a Plataforma pontuando seis propostas de verdade, e hoje
   isso só aparece na 2ª dobra. Aqui a tela real é o herói: larga, cortada pela
   base da dobra, com a luz nascendo atrás dela. Texto curtíssimo em cima,
   dois botões, prova em letra pequena.

   É o padrão das LPs de software, e é raro em infoproduto justamente porque
   quase nenhum infoproduto TEM uma tela para mostrar. Este tem.

   E A TELA É INTERATIVA (Gabriel, 09/08: "tem que ser algo muito UAU, não só
   o print"). Era `capa-plataforma-notebook.png`, uma captura estática; virou
   DOM em `TelaPlataformaV4.tsx`, com as notas subindo de zero na frente do
   visitante e as finalistas escolhíveis no clique. O argumento da C é "em vez
   das capas, o que a coisa FAZ", e uma fotografia não faz nada.

   Some junto o problema de manutenção: a captura mostrava a régua de risco
   0-4/5-6/7-8/9-10, que o produto já tinha trocado. Uma tela em HTML não
   envelhece por descuido; um PNG envelhece toda vez que o produto muda.
   `plataforma.heroShot` deixa de ter leitor aqui, mas continua alimentando a
   seção da Plataforma lá embaixo, então o campo do CMS segue com uso.
   ═══════════════════════════════════════════════════════════════════════ */

export const HeroVitrineV4: React.FC = () => {
  const { titlePrefix, titleHighlight, titleSuffix, subtitle } = useTextosHero()
  const { cta, link, externo } = useKit()

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#07090d]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #0a1020 0%, #090d16 55%, #07090d 100%)' }}
        />
        {/* Luz nascendo ATRÁS da tela, na altura em que ela começa. */}
        <div
          className="absolute left-1/2 top-[54%] h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(253,186,116,0.20) 0%, rgba(249,115,22,0.12) 26%, transparent 56%)',
          }}
        />
        <div className="v4-rays absolute left-1/2 top-[56%] h-[150vmax] w-[150vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.09]" />
        <div className="v4-cells absolute inset-0 opacity-30" />
        <div className="v4-noise absolute inset-0 opacity-[0.03]" />
      </div>

      {/* O ESPAÇAMENTO AQUI É UM ORÇAMENTO, não uma preferência.

          A moldura precisa começar cedo o bastante para a linha do Índice de
          Confiabilidade — a que ordena as seis propostas — entrar na dobra de
          900px. Numa primeira tentativa eu comprei esses pixels espremendo
          tudo, e ficou apertado (Gabriel: "os elementos da versão C estão
          muito apertados"). Espremer o bloco de texto era pagar a conta no
          lugar errado.

          O que pagou de verdade foram duas mudanças estruturais: a fileira de
          logos passou para DEPOIS da moldura (~94px) e a área das cenas ganhou
          altura fixa, o que tirou a tabela inteira da conta e deixou só o
          cabeçalho dela. Com isso o respiro do texto voltou ao normal. */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 pt-24 text-center md:pt-28">
        <div
          className="v4-rise inline-flex items-center gap-2.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-1.5"
          style={{ ['--d' as string]: '0ms' }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" aria-hidden />
          <span className="v4-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">
            Plataforma de Avaliação de Propostas
          </span>
        </div>

        {/* Blocos, como na A e na B, e pelo mesmo motivo: as três partes no
            mesmo fluxo quebravam onde desse. Saíram também os dois
            `whitespace-nowrap`, que no celular empurravam a linha do itálico
            até a borda da tela. */}
        <h1 className="mt-6 max-w-4xl text-[clamp(2.2rem,4vw,3.3rem)] font-extrabold leading-[1.06] tracking-[-0.035em] text-white">
          <span className="block">
            <WordReveal trigger="load" text={titlePrefix} baseDelay={80} step={40} />
          </span>
          <span className="block">
            <WordReveal
              trigger="load"
              text={titleHighlight}
              baseDelay={340}
              step={55}
              wordClassName="v4-serif v4-grad-text pr-[0.06em]"
            />
          </span>
          <span className="block">
            <WordReveal trigger="load" text={titleSuffix} baseDelay={470} step={40} wordClassName="text-white" />
          </span>
        </h1>

        <p className="v4-rise mt-5 max-w-xl text-lg leading-relaxed text-slate-300" style={{ ['--d' as string]: '560ms' }}>
          <CMSText value={subtitle} />
        </p>

        <div
          className="v4-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          style={{ ['--d' as string]: '700ms' }}
        >
          {temConteudo(cta) && <BotaoPrimario texto={cta} link={link} externo={externo} />}
          <BotaoSecundario texto="Ver como funciona" alvo="plataforma" />
        </div>

      </div>

      {/* A PROVA DESCEU PARA DEPOIS DA TELA, e é a única troca de ordem em
          relação às outras duas variantes. Entre os botões e a tela ela custava
          ~94px, e eram exatamente os 94px que faziam a linha do Índice cair
          fora da dobra em 900px. Trocar a fileira de logos pela linha que
          ordena as seis propostas não é escolha difícil: o logo prova que
          alguém confia, o Índice prova o que o produto FAZ.

          Fora que é a ordem das LPs de software que servem de referência: a
          parede de logos vem depois do print do produto, não antes. */}
      <div className="relative z-10 mt-9 flex w-full justify-center px-4 md:mt-10">
        <div className="v4-rise relative w-full max-w-[1180px]" style={{ ['--d' as string]: '900ms' }}>
          <div className="absolute inset-x-10 -top-8 h-28 rounded-[100%] bg-orange-500/25 blur-[70px]" aria-hidden />
          <div className="relative">
            <TelaPlataformaV4 />
          </div>
          <div className="v4-rise mt-7 pb-8" style={{ ['--d' as string]: '1000ms' }}>
            <Prova rotulo="Apoiado por empresas de referência do setor" centro />
          </div>
        </div>
      </div>
    </section>
  )
}
