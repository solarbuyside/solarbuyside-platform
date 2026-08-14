import React from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Img, WordReveal } from './atoms'
import { useApoiadores } from './ApoiadoresV4'
import { scrollToId } from './scroll'
import { trackBuyClick } from '../utils/analytics'
import { criarTxt, temConteudo } from './cms'
import { useKit, useRodizio, type Peca } from './kit'
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
      subCms.startsWith('O método Buy-Side')
        ? 'O Movimento Solar Buy-Side promove uma nova forma de vender: pela perspectiva do <span class="cms-semibold">comprador</span>'
        : subCms,
    selo: t('manualTitle', 'Manual Solar Buy-Side'),
  }
}


/* ── O LEQUE NAVEGÁVEL DA VARIANTE B ────────────────────────────────────────

   Era uma pilha decorativa: três capas empilhadas, `aria-hidden`, sem clique.
   Bonita e muda. Quem não conhece o produto via "uns livros" e seguia em
   frente.

   Agora é um controle. Uma peça fica na frente, as outras duas atrás; embaixo,
   o nome e a frase da que está na frente, com um link para a seção que
   explica ela. Troca de três formas, e as três importam:

     - CLICANDO NUMA CAPA DE TRÁS. É o gesto direto, o que as pessoas tentam
       primeiro num objeto empilhado.
     - PELAS SETAS, que são o convite visível. Sem elas nada na tela avisa que
       a pilha se mexe (foi o que o Gabriel pediu).
     - SOZINHO, a cada 4,5s, até o primeiro toque. Sem o rodízio automático,
       quem não interage continua sem saber o que são as três peças, que é
       justamente o problema que isto veio resolver. Depois do primeiro
       clique ele para de vez: pilha que se mexe sozinha debaixo da mão de
       quem está usando é hostil.

   POSIÇÃO SÓ POR `transform`. Cada pose é um translate + rotate + scale sobre
   a MESMA âncora, em vez de left/right/width diferentes por peça. É o que
   permite a transição animada: `left` e `width` também transicionam, mas
   forçam layout a cada quadro e não interpolam bem com rotação. Assim as capas
   deslizam de uma pose para a outra em GPU, e é essa passagem que faz o leque
   parecer um objeto físico sendo folheado. */

/* QUATRO POSES, uma por peça do kit. Eram três, e a quarta entrou com a
   Licença de Uso Coletiva.

   Com quatro objetos e três lugares na primeira fila, a saída é uma FILA DO
   FUNDO: a peça mais distante fica atrás da da frente, centrada, menor e um
   pouco mais alta, aparecendo só como uma lombada acima das outras. É como uma
   pilha se comporta de verdade, e é o que permite girar as quatro sem que duas
   disputem o mesmo ponto do quadro. */
const POSES = [
  /* 0 — FRENTE: maior, reta e centrada. Reta no meio de inclinadas é o que
     elege a principal sem precisar de rótulo. */
  'translateX(-50%) translateY(0) rotate(0deg) scale(1)',
  /* 1 — ATRÁS À DIREITA: é esta que sangra pela borda da tela. */
  'translateX(30%) translateY(-9%) rotate(11deg) scale(0.8)',
  /* 2 — FUNDO, ao centro: só a lombada aparece por cima da capa da frente.

     A CONTA DO -50% não é estética, é geometria. A âncora do `scale` é a BASE
     da capa (`origin-bottom`), então encolher para 60% empurra o topo dela 40%
     da altura para baixo. Um deslocamento de 26%, que era o primeiro palpite,
     devolvia menos do que a escala tinha tirado e a capa sumia inteira atrás
     da da frente. Para o topo passar ~10% acima, o deslocamento tem que cobrir
     os 40% da escala mais a folga: 50%. */
  'translateX(-50%) translateY(-50%) rotate(0deg) scale(0.6)',
  /* 3 — ATRÁS À ESQUERDA. Recuou de -118% para -112% e encolheu um fio: com
     quatro capas no quadro, a da esquerda é a que chega mais perto da coluna
     de texto, e agora ela tem uma vizinha atrás disputando o mesmo canto. */
  'translateX(-112%) translateY(-11%) rotate(-14deg) scale(0.74)',
]
const CAMADAS = ['z-40', 'z-20', 'z-10', 'z-30']


export const KitLequeV4: React.FC<{
  pecas: Peca[]
  ativo: number
  aoTrocar: (i: number) => void
  /** No celular o leque entra no fluxo e fica mais baixo. */
  compacto?: boolean
}> = ({ pecas, ativo, aoTrocar, compacto = false }) => {
  /* ARRASTAR O DEDO TROCA A PEÇA (Gabriel, 11/08). No celular o leque é o
     objeto principal da dobra, e num objeto que se folheia o primeiro gesto
     que a mão tenta é o arrasto lateral — não a seta.

     Só o eixo X conta, e só a partir de 40px: abaixo disso é tremor de dedo,
     e um arrasto mais vertical que horizontal é a pessoa ROLANDO a página por
     cima das capas, que não pode virar troca de peça. Por isso também não há
     `touch-action: none` aqui: a rolagem vertical continua sendo do navegador,
     e o gesto só é interpretado no fim (`touchend`), quando já se sabe qual
     dos dois eixos venceu. */
  const toque = React.useRef<{ x: number; y: number } | null>(null)

  const aoTocarInicio = (e: React.TouchEvent) => {
    const t = e.touches[0]
    toque.current = { x: t.clientX, y: t.clientY }
  }

  const aoTocarFim = (e: React.TouchEvent) => {
    const inicio = toque.current
    toque.current = null
    if (!inicio) return
    const t = e.changedTouches[0]
    const dx = t.clientX - inicio.x
    const dy = t.clientY - inicio.y
    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return
    /* Arrastar para a ESQUERDA traz a próxima, como folhear para frente. */
    aoTrocar((ativo + (dx < 0 ? 1 : pecas.length - 1)) % pecas.length)
  }

  return (
  /* DUAS FAIXAS EMPILHADAS, não uma camada só com tudo posicionado por cima.

     O palco das capas é `flex-1` e a legenda é `shrink-0`: a legenda reserva a
     altura dela e as capas só podem ocupar o que sobrou. Antes as três eram
     absolutas na mesma caixa, com a legenda encostada no pé — e as capas eram
     dimensionadas pela LARGURA do container (`w-[42%]`), então em tela larga e
     baixa elas cresciam para cima e para baixo até cair em cima do texto
     (Gabriel: "os livros estão tocando nas frases"). Com as faixas separadas
     esse encontro deixa de ser possível em qualquer proporção de tela. */
  <div className="flex h-full w-full flex-col">
    {/* `pointer-events-auto` no palco só no compacto: no desktop esta camada é
        larga e encosta na coluna de texto, e reativar o evento aqui faria a
        faixa vazia ao redor das capas engolir cliques do texto. No celular ela
        é o próprio bloco do leque, e precisa receber o arrasto mesmo quando o
        dedo começa fora de uma capa. */}
    <div
      className={`relative min-h-0 flex-1 ${compacto ? 'pointer-events-auto' : ''}`}
      onTouchStart={aoTocarInicio}
      onTouchEnd={aoTocarFim}
    >
      {/* Fonte de luz atrás do produto: é ela que faz o objeto existir no
          espaço, em vez de parecer colado sobre um fundo. */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[58vmin] w-[58vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/25 blur-[130px]"
        aria-hidden
      />
      {/* Elipse de contato, a mesma solução do pedestal da variante A: sem ela
          três objetos com sombra própria continuam boiando, porque nada no
          quadro diz onde é o chão. */}
      <div
        className="pointer-events-none absolute bottom-1 left-1/2 h-8 w-[62%] -translate-x-1/2 rounded-[100%] bg-orange-400/20 blur-2xl"
        aria-hidden
      />

      {pecas.map((peca, i) => {
        /* Distância até a frente: 0 = na frente, 1 = atrás à direita, 2 = atrás
           à esquerda. Trocar o ativo só muda esta conta, e as três capas
           deslizam para as poses novas. */
        const d = (i - ativo + pecas.length) % pecas.length
        const naFrente = d === 0
        return (
          <button
            key={peca.title}
            type="button"
            /* A CAPA DA FRENTE LEVA PARA A SEÇÃO DELA (Gabriel, 11/08), e é o
               que aposentou o botão "Ver o que é" que ficava sob a legenda.
               Clicar no objeto é o gesto óbvio; um botão a três linhas dali
               dizendo a mesma coisa era um segundo caminho para o mesmo lugar,
               gastando altura da dobra. As de trás continuam trocando a peça,
               que é o que o olho espera de uma capa parcialmente tapada. */
            onClick={() => (naFrente ? scrollToId(peca.alvo) : aoTrocar(i))}
            aria-label={naFrente ? `Ver a seção de ${peca.title}` : `Ver ${peca.title}`}
            /* ALTURA em % do palco, e a largura sai da proporção da imagem.
               Era o contrário (largura em % do container), e por isso a altura
               das capas dependia de quão LARGA a tela era: num monitor
               widescreen elas viravam gigantes e transbordavam. Preso à altura
               do palco, o leque cabe sempre.

               `pointer-events-auto` é obrigatório aqui: a camada que envolve o
               leque no desktop é `pointer-events-none` (para não roubar cliques
               da coluna de texto, que ela encosta), e isso é HERDADO. Botão não
               reativa evento sozinho — era esta a razão de nada no leque
               responder a clique. */
            className={`group pointer-events-auto absolute bottom-0 left-1/2 origin-bottom transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
              CAMADAS[d]
            } ${compacto ? 'h-[74%]' : 'h-[68%]'} cursor-pointer`}
            style={{ transform: POSES[d], opacity: naFrente ? 1 : 0.85 }}
          >
            <Img
              src={peca.image}
              alt={peca.title}
              loading="lazy"
              className={`h-full w-auto max-w-none drop-shadow-[0_40px_60px_rgba(0,0,0,0.85)] transition-transform duration-500 ${
                naFrente ? '' : 'group-hover:-translate-y-2'
              }`}
            />
          </button>
        )
      })}
    </div>

    {/* A LEGENDA. Ela é o motivo de tudo isto existir: é aqui que a capa deixa
        de ser "um livro" e vira uma coisa com nome, tamanho e endereço.
        `pointer-events-auto` pelo mesmo motivo das capas. */}
    <div
      className={`pointer-events-auto relative z-40 flex shrink-0 flex-col items-center gap-2 px-4 text-center ${
        compacto ? 'pt-4' : 'pt-5'
      }`}
    >
      <div className="flex items-center gap-2">
        <SetaLeque
          direcao="anterior"
          aoClicar={() => aoTrocar((ativo - 1 + pecas.length) % pecas.length)}
          rotulo={`Ver ${pecas[(ativo - 1 + pecas.length) % pecas.length].title}`}
        />

        {/* Altura travada e `key` no ativo: o texto troca por fade sem que a
            linha mude de altura, senão as setas dançam a cada troca (os três
            nomes têm comprimentos bem diferentes). */}
        <div key={ativo} className="v4-troca-suave flex h-[46px] min-w-0 flex-col justify-center">
          <p className="truncate text-[13px] font-bold leading-tight text-white sm:text-sm">{pecas[ativo].title}</p>
          {temConteudo(pecas[ativo].frase) && (
            <p className="truncate text-[11px] leading-tight text-slate-400 sm:text-xs">{pecas[ativo].frase}</p>
          )}
        </div>

        <SetaLeque
          direcao="proximo"
          aoClicar={() => aoTrocar((ativo + 1) % pecas.length)}
          rotulo={`Ver ${pecas[(ativo + 1) % pecas.length].title}`}
        />
      </div>

      {/* O LINK PARA A SEÇÃO DA PEÇA, SÓ NO DESKTOP (Gabriel, 11/08).

          Ele saiu no celular porque lá o clique na capa já leva ao mesmo
          lugar, e o gesto de tocar no objeto é o primeiro que a mão tenta —
          um botão a três linhas dali repetindo a ação custava altura na dobra
          mais apertada das duas.

          No desktop a conta é outra: quem usa mouse não tem como saber que a
          capa é clicável até passar por cima dela, e a dobra tem altura de
          sobra. O botão é o que ANUNCIA que existe uma seção explicando
          aquela peça. */}
      {!compacto && (
        <button
          type="button"
          onClick={() => scrollToId(pecas[ativo].alvo)}
          className="group pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold text-slate-300 transition-colors hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-white"
        >
          Ver o que é
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>
      )}

      {/* Marcadores de posição: dizem quantas peças existem, o que nem a seta
          nem a legenda contam. */}
      <div className="flex items-center gap-1.5" aria-hidden>
        {pecas.map((peca, i) => (
          <span
            key={peca.title}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === ativo ? 'w-5 bg-orange-400' : 'w-1 bg-white/25'
            }`}
          />
        ))}
      </div>
    </div>
  </div>
  )
}

const SetaLeque: React.FC<{ direcao: 'anterior' | 'proximo'; aoClicar: () => void; rotulo: string }> = ({
  direcao,
  aoClicar,
  rotulo,
}) => {
  const Icone = direcao === 'anterior' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-label={rotulo}
      className="pointer-events-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/12 hover:text-white active:scale-95"
    >
      <Icone size={16} aria-hidden />
    </button>
  )
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

  /* O leque começa no MANUAL (índice 0) porque é a peça que dá nome à oferta,
     e daí roda sozinho pelas outras duas. Antes o centro era fixo no Código do
     Vendedor e o Manual ficava atrás, com o título tapado pela capa da frente:
     a principal era a única ilegível das três.

     O estado mora AQUI e não dentro do leque porque existem duas instâncias na
     página, a de desktop e a de celular. Compartilhando o estado, as duas
     mostram sempre a mesma peça — o que importa no meio, entre 1024px e o
     ponto em que uma some e a outra aparece, e para quem gira o aparelho. */
  const { ativo, escolher } = useRodizio(pecas.length)

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
          que se quer dizer é "tem mais atrás".

          `pointer-events-none` fica no CONTAINER e as peças reativam o clique
          por dentro (o `<button>` volta a receber eventos por conta própria).
          A camada é larga e encosta na coluna de texto; sem isso ela engoliria
          cliques destinados ao texto numa faixa invisível. E saiu o
          `aria-hidden`: agora tem conteúdo navegável aqui dentro, e esconder
          do leitor de tela um controle focável é a pior combinação possível. */}
      <div className="pointer-events-none absolute bottom-[7%] right-[-3%] top-20 hidden w-[47%] lg:block">
        <KitLequeV4 pecas={pecas} ativo={ativo} aoTrocar={escolher} />
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
          tem motivo para ser a única com margem dos dois lados.

          Mais alto que antes (340→400) porque agora carrega a legenda, as
          setas e os marcadores embaixo das capas. */}
      <div className="relative z-10 h-[400px] w-full pb-6 sm:h-[460px] md:h-[540px] lg:hidden">
        <KitLequeV4 pecas={pecas} ativo={ativo} aoTrocar={escolher} compacto />
      </div>
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
