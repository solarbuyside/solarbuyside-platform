import React, { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Img, WordReveal } from './atoms'
import { trackBuyClick } from '../utils/analytics'
import { criarTxt, temConteudo } from './cms'

/* HERO "SOLAR DAWN" — sem foto stock, sem card 3D. Um horizonte solar
   gráfico: disco gigante com aresta incandescente, raios cônicos lentos,
   campo azul à esquerda (comprador) e âmbar à direita (vendedor).
   Headline massiva com reveal palavra-a-palavra; destaque em serif itálica.
   O manual + bônus viram um "ticket de acesso" com picote central. */

/* As quatro peças do kit, embaixo da subfrase do Hero (Francis, slide 1).

   A ARTE vem da MESMA seção que alimenta a oferta lá embaixo (`pricing`), para
   não existirem duas capas do mesmo produto. Os TEXTOS são próprios do Hero
   (`heroKitNTitle` / `heroKitNDesc`): aqui cabe uma linha e na oferta cabe um
   parágrafo, e em 06/08 o Francis pediu o Manual com um nome no Hero ("Manual
   de Compra de Sistema Solar", slide 2) sem tocar no nome que a oferta usa
   (slide 21, onde ele deixou "Manual Solar Buy-Side" intacto). Os títulos da
   oferta seguem valendo como padrão, então quem não editar o Hero continua
   vendo a mesma coisa nos dois lugares.

   Sem cartões e sem molduras: as capas flutuam sobre o horizonte do Hero, com
   um "+" entre elas, como no slide. Cartão aqui brigaria com o chip do produto
   e com o botão, e o Hero já vai ficar cheio.

   SEM a linha de etiquetas (MANUAL PRINCIPAL · DIFERENCIAL ESTRATÉGICO · …):
   removida em 06/08 (slide 2, "eliminar a linha"). Ela repetia em caixa alta o
   que o título logo abaixo já dizia, e roubava a altura que subiu o CTA. As
   etiquetas continuam na seção de oferta, onde classificam os quatro itens. */
const HeroKitV4: React.FC = () => {
  const { getSection, globalSettings } = useContent()
  const section = getSection('pricing')
  const txt = criarTxt(section)

  /* Os títulos sobrevivem só no `alt` das capas: leitor de tela e buscador
     continuam sabendo o nome de cada peça, o olho não precisa mais ler.

     As chaves `heroKit1Desc`..`heroKit4Desc` (as frases curtas que ficavam sob
     cada capa) DEIXARAM de ser lidas aqui. Elas continuam no banco e no editor
     do admin de propósito, porque esta versão do Hero está em avaliação; se
     ficar, o passo seguinte é tirar os quatro campos do field-schema, senão o
     cliente digita neles e não vê nada acontecer, que é a reclamação que o
     Francis já trouxe outras vezes. */
  const pecas = [
    {
      title: txt('heroKit1Title', 'Manual de Compra de Sistema Solar'),
      image: section?.images.card1Image || '/assets/manual-norm.png',
    },
    {
      title: txt('heroKit2Title', txt('card2Title', 'Código do Vendedor Consultivo')),
      image: section?.images.card2Image || '/assets/codigo-norm.png',
    },
    {
      title: txt('heroKit3Title', txt('cardPlatformTitle', 'Plataforma de Avaliação de Proposta Comercial')),
      image: section?.images.cardPlatformImage || '/assets/capa-plataforma-tablet.png',
    },
    /* A LICENÇA DE USO COLETIVA VOLTOU (Gabriel, 09/08, mandando a capa).
       Ela tinha saído da dobra mais cedo no mesmo dia, porque o rótulo
       prometia "2 Ebooks + Plataforma", que são três coisas, e apareciam
       quatro capas: o visitante contava os objetos, batia com o texto e
       sobrava uma.

       Agora a conta fecha ao contrário. O rótulo passou a nomear a Licença
       ("+ Licença de uso até 10 vendedores"), então eram quatro nomes para
       três objetos, e faltava justamente esta. Com ela de volta são quatro e
       quatro — que é o caminho que o comentário anterior deixou escrito, e
       também o que o Francis tinha pedido no slide 2 de 06/08. */
    {
      title: txt('heroKit4Title', txt('card3Title', 'Licença de Uso Coletiva')),
      image: section?.images.card3Image || '/assets/coletiva-norm.png',
    },
  ]

  /* A linha que nomeia o kit. Encurtada em 06/08 (slide 2: "Kit Completo: 2
     Ebooks + Plataforma"): a frase antiga tinha duas linhas e era a maior
     parte da distância entre as capas e o CTA. O texto anterior é tratado como
     legado para o banco não devolver a versão longa ao ar.

     A LICENÇA DE USO VOLTOU AO RÓTULO em 09/08 ("+ Licença de uso até 10
     vendedores"). Em 06/08 a quarta capa saiu da dobra porque o rótulo
     prometia três coisas e apareciam quatro objetos; o comentário de então
     registrou que, se a Licença voltasse, o caminho certo era o RÓTULO passar
     a nomeá-la. É exatamente o que o Francis pediu agora: a licença é nomeada
     e continua sem capa, porque ela não é um livro. A conta bate: três capas,
     e a quarta linha do kit é um direito de uso. */
  const notaCms = txt('heroKitNote', '')
  const nota = !notaCms || notaCms.startsWith('Kit Completo para integradoras')
    ? 'Kit Completo: 2 Ebooks + Plataforma + Licença de uso até 10 vendedores'
    : notaCms
  const cta = txt('heroKitCta', 'Quero o Kit Completo Agora')

  /* ORDEM: a linha que nomeia o kit, as capas, e o BOTÃO POR ÚLTIMO.

     O botão vinha primeiro desde 03/08, pelo argumento de que o catálogo não
     podia ficar entre a promessa e a ação. O Francis reabriu a questão em
     09/08 ("o CTA abaixo dos produtos não seria mais lógico?") e a razão dele
     é melhor: com o botão em cima, ele pede a compra antes de mostrar o que
     está sendo comprado. Embaixo, ele fecha o argumento — o visitante lê a
     promessa, vê as três peças e encontra a ação no ponto em que ela faz
     sentido. A distância que isso cria é de meia dobra, não de meia página.
   */
  return (
    <div className="v4-hero-kit v4-rise mt-10 w-full md:mt-12" style={{ ['--d' as string]: '760ms' }}>
      {/* Esta linha passou a NOMEAR o conjunto, no lugar dos oito fragmentos
          de texto que ficavam sob as capas. Ela já resumia a grade toda em
          cinco palavras, o que era a prova de que a grade não estava sendo
          lida. Em mono e caixa alta: vira rótulo do que vem abaixo, não mais
          um parágrafo disputando leitura com a subfrase.

          `max-w-4xl` e entreletra um pouco menor desde 09/08: com a Licença de
          Uso no fim, a frase passou a rachar em duas linhas dentro dos 42rem
          antigos, e um rótulo de duas linhas deixa de ser rótulo. */}
      {temConteudo(nota) && (
        <p className="v4-mono mx-auto max-w-4xl text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 md:text-xs">
          <CMSText value={nota} />
        </p>
      )}

      {/* AS CAPAS SEM TEXTO. Cada uma tinha um título e uma frase embaixo, e
          as duas diziam quase a mesma coisa ("Manual de Compra de Sistema
          Solar" / "Método de Compra de Sistema Solar"). Eram 48 das ~85
          palavras da dobra, gastas num catálogo que a seção de oferta já faz
          lá embaixo com as MESMAS capas e mais detalhe.

          Capa em Hero é âncora visual, não item de leitura: a 124px de altura
          ninguém lê a lombada. Sem o texto elas ficam maiores e o nome de cada
          peça sobrevive no `alt`, para leitor de tela e para o Google. */}
      {/* max-w própria, menor que a do Hero: soltas nos 1152px do container as
          quatro capas viravam quatro objetos isolados em tela larga. Juntas,
          lêem como UM kit, que é o que a linha acima acabou de anunciar. */}
      {/* CAPAS ASSENTADAS NO HORIZONTE.
          Antes elas eram atravessadas pela aresta incandescente: a linha
          passava pelo terço inferior e a base ficava no escuro, o que lia
          como colisão de z-index e não como intenção. Agora a base encosta na
          linha (ver o pb da seção, que é calibrado para isso) e cada capa
          ganha a ELIPSE DE CONTATO que a seção do Manual já usava no pedestal
          de luz. Sem o contato, objeto sobre horizonte flutua.

          Maiores também: 124px num canvas de 1900px liam como selinho, e
          selinho diz "isto é secundário" justamente sobre o produto. Sem o
          texto competindo, elas aguentam 180px sem poluir. */}
      <div className="mx-auto mt-6 grid max-w-4xl grid-cols-2 items-end gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-y-0 md:mt-8 md:gap-x-8">
        {pecas.map((peca, i) => (
          <div key={peca.title} className="group relative flex items-end justify-center">
            {/* O "+" entre as peças. Alinhado pelo meio da capa, não da
                célula: as capas têm alturas visuais diferentes e o sinal
                dançava de uma para outra. */}
            {i > 0 && (
              <span
                className="absolute -left-5 bottom-[38%] text-2xl font-light text-orange-500/40 md:-left-7"
                aria-hidden
              >
                +
              </span>
            )}
            <div className="relative">
              <Img
                src={peca.image}
                alt={peca.title}
                // A primeira dobra: estas imagens competem com o <h1>, que é
                // o LCP. Todas lazy, como as capas da oferta.
                loading="lazy"
                className="relative z-10 h-[126px] w-auto max-w-none drop-shadow-[0_22px_30px_rgba(0,0,0,0.7)] transition duration-500 group-hover:-translate-y-1.5 sm:h-[150px] md:h-[180px]"
              />
              {/* Elipse de contato: a sombra que prende a capa no chão. */}
              <span
                className="absolute -bottom-1.5 left-1/2 h-3 w-[78%] -translate-x-1/2 rounded-[100%] bg-orange-400/25 blur-md transition-opacity duration-500 group-hover:opacity-70"
                aria-hidden
              />
            </div>
          </div>
        ))}
      </div>

      {/* O BOTÃO, agora no fim (Francis, 09/08). `mt-10` e não o `mt-9` que a
          linha do kit usava: ele fecha o bloco, e fechar pede mais respiro do
          que separar duas partes do meio. */}
      {temConteudo(cta) && (
        <a
          href={globalSettings.purchaseLink || '#oferta'}
          target={globalSettings.purchaseLink ? '_blank' : undefined}
          rel={globalSettings.purchaseLink ? 'noopener noreferrer' : undefined}
          onClick={trackBuyClick}
          className="v4-cta-shine group relative mx-auto mt-10 inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 px-9 py-4 text-base font-extrabold tracking-tight text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] md:mt-12 md:px-10 md:py-5 md:text-lg"
        >
          <span className="relative z-10">{cta}</span>
          <ArrowRight size={19} className="relative z-10 shrink-0 transition-transform group-hover:translate-x-1" />
        </a>
      )}
    </div>
  )
}

export const HeroV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('hero')
  const txt = criarTxt(section)
  const glowRef = useRef<HTMLDivElement | null>(null)

  const titlePrefix = txt('titlePrefix', txt('title1', 'Saia da Disputa de Preço e Passe a'))
  const titleHighlight = txt('titleHighlight', txt('title2', 'Vender Decisões'))
  const titleSuffix = txt('titleSuffix', 'em Sistema Solar')
  // Subfrase única do Hero (Francis, slide 2). O texto antigo ("O método
  // Buy-Side ensina você a pensar como o cliente...") é tratado como legado:
  // se o banco ainda tiver ele, cai no novo. Assim a LP não depende do seed
  // para mostrar a frase certa.
  const subtitleCms = txt('subtitle', txt('subtitle1', ''))
  const subtitle = !subtitleCms || subtitleCms.startsWith('O método Buy-Side')
    ? 'O Movimento Solar Buy-Side promove uma nova forma de vender: pela perspectiva do <span class="cms-semibold">comprador</span>'
    : subtitleCms

  // Quebra no dois-pontos: a chamada em cima e "pela perspectiva do comprador"
  // inteiro na linha de baixo. Sem isso o "pela" ficava órfão na 1ª linha.
  const [subLead, subVirada] = (() => {
    const i = subtitle.indexOf(':')
    if (i === -1) return [subtitle, '']
    return [subtitle.slice(0, i + 1).trim(), subtitle.slice(i + 1).trim()]
  })()

  /* Parallax sutil do brilho solar seguindo o mouse (desligado p/ reduced motion) */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let rafId = 0
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 26
        const y = (e.clientY / window.innerHeight - 0.5) * 14
        if (glowRef.current) glowRef.current.style.transform = `translate(${x}px, ${y}px)`
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <section className="v4-hero relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#07090d]">
      {/* ── Céu ───────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* gradiente vertical da noite */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #0c1422 0%, #090d16 45%, #07090d 100%)' }}
        />
        {/* dualidade: campo azul (comprador) à esquerda, âmbar (vendedor) à direita */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 60% at 8% 75%, rgba(59,130,246,0.13), transparent 70%), radial-gradient(55% 60% at 92% 75%, rgba(249,115,22,0.13), transparent 70%)',
          }}
        />
        {/* HORIZONTE 4 pontos mais alto (Gabriel, 09/08: "jogar o sol negro um
            pouco mais pra cima"). O disco, os raios e o brilho sobem JUNTOS,
            senão o brilho do amanhecer deixa de nascer atrás da aresta e vira
            uma mancha solta no céu. A aresta incandescente é o topo do disco,
            então mover o disco é mover a linha do horizonte. */}
        {/* brilho central do amanhecer (com parallax) */}
        <div ref={glowRef} className="absolute inset-0 will-change-transform">
          <div
            className="absolute left-1/2 top-[73%] h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                'radial-gradient(circle at 50% 62%, rgba(253,186,116,0.32) 0%, rgba(249,115,22,0.16) 22%, transparent 52%)',
            }}
          />
        </div>
        {/* raios cônicos girando muito devagar */}
        <div className="v4-rays absolute left-1/2 top-[79%] h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.10]" />
        {/* o disco solar: silhueta gigante com aresta incandescente */}
        <div
          className="absolute left-1/2 top-[79%] h-[260vmax] w-[260vmax] -translate-x-1/2 rounded-full bg-[#07090d]"
          style={{
            boxShadow:
              '0 -1px 0 0 rgba(255,221,180,0.95), 0 -3px 18px 0 rgba(253,186,116,0.65), 0 -14px 70px 4px rgba(249,115,22,0.4), 0 -40px 180px 20px rgba(249,115,22,0.18)',
          }}
        />
        {/* grade de células no "chão": mesma textura (cor/escala) da seção
            seguinte e visível até a borda inferior — o panorama continua dela.
            Cresceu de 30% para 34% junto com o horizonte: a grade tem que
            começar ABAIXO da aresta, senão aparece um naco de chão texturizado
            boiando no céu. */}
        <div
          className="v4-cells absolute inset-x-0 bottom-0 h-[34%]"
          style={{
            maskImage: 'linear-gradient(180deg, transparent, black 55%)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent, black 55%)',
          }}
        />
        <div className="v4-noise absolute inset-0 opacity-[0.03]" />
      </div>

      {/* ── Conteúdo ──────────────────────────────────────────────────── */}
      {/* pt e pb ANDAM JUNTOS, e é por isso que os dois são grandes.
          O conteúdo é centrado por justify-center e a aresta do sol é
          posicionada em % da ALTURA DA SEÇÃO. Crescer só o pt empurra o
          conteúdo para baixo, contra a aresta; crescer os dois faz a seção
          crescer, e a aresta desce mais rápido que o conteúdo (79% de um
          número maior). Cada 40px somados aos dois compram ~40px de folga do
          selo para o cabeçalho e ~23px de folga do botão para a aresta.

          Foi assim que o selo deixou de colar na barra fixa em tela de 1080px
          (Gabriel, 09/08) sem que o botão passasse a ser cortado pela luz. */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center v4-hero-conteudo px-6 pb-[32vh] pt-32 text-center md:pb-[30vh]">
        {/* O selo "MÉTODO SOLAR BUY-SIDE" saiu em 09/08 (Gabriel). Ele
            repetia, em letra miúda, a marca que o cabeçalho fixo já mostra a
            30px dali, e nessa distância os dois liam como um bloco só de
            miudezas. Sem ele a headline abre a dobra, que é o trabalho dela.

            `manualTitle` continua no banco e no editor: as variantes B e C do
            Hero ainda usam o selo, então o campo tem leitor. Ver
            HeroVariantesV4.tsx. */}

        {/* headline massiva */}
        {/* clamp: mobile 41.6px e desktop 77.6px. O teto caiu 4px (era 5.1rem =
            81.6px) a pedido do Gabriel em 09/08; o piso desceu junto para a
            frase não crescer no celular enquanto encolhe no desktop. O 27/07
            já tinha trazido o desktop de 89.6px para 81.6px. */}
        {/* UMA PARTE POR LINHA.
            As tres partes vinham no mesmo fluxo, separadas por espaco, e o
            navegador quebrava onde desse: em 1920px a linha 1 terminava em
            "Passe a" e o trecho em italico laranja comecava numa linha e
            terminava na outra. O recurso da headline e o contraste romano
            versus italico marcando "sai disto, vai para aquilo"; partido no
            meio, o olho le dois pedacos de laranja em vez de um bloco, e
            sobra uma preposicao pendurada no fim da linha.

            Em blocos a quebra e deterministica: o destaque nunca racha e
            nenhuma parte termina em palavra solta. Some tambem o {' '} entre
            os WordReveal, que era um no de texto adjacente a outro e e
            exatamente o padrao que quebra a hidratacao (#418). */}
        <h1 className="max-w-5xl text-[clamp(2.6rem,6.2vw,4.85rem)] font-extrabold leading-[1.06] tracking-[-0.03em] text-white">
          {temConteudo(titlePrefix) && (
            <span className="block">
              <WordReveal trigger="load" text={titlePrefix} baseDelay={80} step={40} />
            </span>
          )}
          {temConteudo(titleHighlight) && (
            <span className="block">
              <WordReveal
                trigger="load"
                text={titleHighlight}
                baseDelay={340}
                step={55}
                wordClassName="v4-serif v4-grad-text pr-[0.06em]"
              />
            </span>
          )}
          {temConteudo(titleSuffix) && (
            <span className="block">
              <WordReveal trigger="load" text={titleSuffix} baseDelay={470} step={40} wordClassName="text-white" />
            </span>
          )}
        </h1>

        {/* Subfrase. O respiro entre ela e a headline era 48px/60px, herdado de
            quando o Hero terminava aqui (o Francis tinha pedido a seção "limpa
            e com espaço entre cada frase", slide 2 de 25/07). Com as quatro
            capas, a linha de resumo e o botão embaixo, aquele vão virou o maior
            buraco da dobra. 32px/40px mantém a frase separada da headline sem
            partir o Hero em dois blocos soltos. */}
        <p
          className="v4-hero-sub v4-rise mt-8 max-w-3xl text-lg leading-relaxed text-slate-200 sm:text-xl md:mt-10 md:text-2xl"
          style={{ ['--d' as string]: '560ms' }}
        >
          <CMSText value={subLead} />
          {subVirada && (
            <span className="mt-1.5 block">
              <CMSText value={subVirada} />
            </span>
          )}
        </p>

        {/* As quatro capas do kit voltaram ao Hero (Francis, slide 1 da revisão
            de 03/08). Elas tinham saído em 26/07, junto com o CTA; ele agora
            quer os dois de novo, e mais uma linha de resumo entre as capas e o
            botão. O Hero fica cheio de propósito: a decisão é dele, com a
            ressalva registrada.

            As capas, títulos e etiquetas são os MESMOS da seção de oferta (lê
            a seção `pricing`), então trocar a arte num lugar troca nos dois. Só
            as frases são próprias (`heroKit1Desc`...): aqui elas precisam ser
            curtas, e a seção de oferta ele marcou "SEM ALTERAÇÃO". */}
        <HeroKitV4 />
      </div>

      {/* O indicador de rolagem (fio vertical com o pingo laranja escorrendo)
          saiu em 09/08, a pedido do Gabriel. Ele já vinha perdendo a função: o
          texto "Veja o panorama 2026" tinha saído em 25/07 e sobrara só o
          risco, que num Hero terminado por um botão laranja de 60px não dizia
          mais "role para baixo". Os ~72px que ele ocupava no pé viraram
          respiro para o resto da dobra distribuir. */}
    </section>
  )
}
