import React, { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { WordReveal } from './atoms'
import { trackBuyClick } from '../utils/analytics'
import { criarTxt, temConteudo } from './cms'
/* O leque é da variante B e vive lá porque é lá que ele nasceu e onde está o
   grosso do raciocínio dele. Importar em vez de duplicar mantém as duas
   dobras com o MESMO controle: o que se ajusta no leque vale para o desktop e
   para o celular ao mesmo tempo. */
import { KitLequeV4 } from './HeroVariantesV4'
import { useKit, useRodizio } from './kit'

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
  const { getSection } = useContent()
  const txt = criarTxt(getSection('pricing'))

  /* AS QUATRO CAPAS VIRARAM O MESMO LEQUE DO DESKTOP (Gabriel, 11/08: "pega
     esses quatro livros e organiza pra ficarem igual da versão do desktop").

     Eram uma grade — 2×2 no celular, quatro colunas acima de sm. Quatro
     objetos de tamanhos e proporções diferentes lado a lado, cada um com sua
     elipse de contato, não liam como kit: liam como quatro coisas soltas
     ocupando duas fileiras. E custavam caro em altura justo na dobra onde o
     pé já tinha sido encurtado para o bloco seguinte aparecer na rolagem.

     O leque resolve os dois: uma peça por vez, com nome e frase embaixo (que
     a grade tinha perdido junto com o texto), e a pilha inteira na altura de
     UMA capa. As peças vêm de `useKit`, o mesmo hook da variante B, então o
     `alvo` de cada uma vem junto e clicar na capa da frente leva para a seção
     que a explica. */
  const { pecas, cta, link, externo } = useKit()
  const { ativo, escolher } = useRodizio(pecas.length)

  /* AS FRASES CURTAS VOLTARAM A TER LEITOR. `heroKit1Desc`..`heroKit4Desc`
     tinham deixado de ser lidas quando as capas ficaram sem texto na grade;
     o leque as mostra de novo, sob o nome da peça da frente, uma por vez —
     que era a objeção original ao texto na grade (oito fragmentos disputando
     leitura com a subfrase), e não existe com uma peça de cada vez. */

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

      {/* O LEQUE, no lugar da grade.

          ALTURA FIXA porque é assim que o leque se dimensiona: o palco é
          `flex-1` e as capas têm altura em % DELE (é o que impede a capa de
          crescer com a largura da tela e transbordar). Sem uma altura aqui, o
          `flex-1` não tem de que tirar percentual e o palco colapsa.

          O número é a altura da pilha MAIS a legenda (~100px: nome, frase,
          setas e marcadores). Em 340px sobram ~240px de palco e a capa da
          frente fica em ~178px — maior que os 126px que a grade dava no
          celular, e ainda assim o bloco inteiro é mais baixo, porque a grade
          gastava duas fileiras de capa. É o espaço vertical que sobra para o
          CTA e para o bloco seguinte entrar antes na rolagem.

          `max-w-2xl` e centrado: solto na largura do Hero, o leque abriria
          demais no desktop (esta variante também é vista inteira com
          `?hero=a`) e as capas de trás se afastariam da da frente até deixar
          de parecer uma pilha. */}
      <div className="mx-auto mt-6 h-[340px] w-full max-w-2xl sm:h-[400px] md:mt-8 md:h-[440px]">
        <KitLequeV4 pecas={pecas} ativo={ativo} aoTrocar={escolher} compacto />
      </div>

      {/* O BOTÃO, agora no fim (Francis, 09/08). `mt-10` e não o `mt-9` que a
          linha do kit usava: ele fecha o bloco, e fechar pede mais respiro do
          que separar duas partes do meio. */}
      {temConteudo(cta) && (
        <a
          href={link}
          target={externo ? '_blank' : undefined}
          rel={externo ? 'noopener noreferrer' : undefined}
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
  const subtitle = subtitleCms.startsWith('O método Buy-Side')
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
            className="absolute left-1/2 top-[87%] h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 md:top-[73%]"
            style={{
              background:
                'radial-gradient(circle at 50% 62%, rgba(253,186,116,0.32) 0%, rgba(249,115,22,0.16) 22%, transparent 52%)',
            }}
          />
        </div>
        {/* raios cônicos girando muito devagar */}
        <div className="v4-rays absolute left-1/2 top-[93%] h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.10] md:top-[79%]" />
        {/* o disco solar: silhueta gigante com aresta incandescente */}
        <div
          className="absolute left-1/2 top-[93%] h-[260vmax] w-[260vmax] -translate-x-1/2 rounded-full bg-[#07090d] md:top-[79%]"
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
          (Gabriel, 09/08) sem que o botão passasse a ser cortado pela luz.

          NO CELULAR O PÉ ENCOLHEU (Francis, 09/08: "reduzir o espaço para que,
          ao rolar na tela, logo após o CTA o título do bloco Plataforma
          apareça"). Eram 32vh de pé, ~270px num aparelho de 844: o visitante
          passava o CTA e via quase uma tela inteira de céu vazio antes da
          próxima seção.

          Reduzir o pé sozinho NÃO funcionaria, e é a armadilha que o parágrafo
          acima descreve: a aresta do sol é posicionada em % da altura da SEÇÃO,
          então encurtar a seção sobe a aresta e ela passa a cortar o botão. Por
          isso o disco, os raios e o brilho descem juntos no celular (79%→93% e
          73%→87%), mantendo a mesma folga entre o CTA e a luz. No desktop nada
          muda. */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center v4-hero-conteudo px-6 pb-[9vh] pt-28 text-center md:pb-[30vh] md:pt-32">
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
