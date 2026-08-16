import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Cta, CtaArrow, GrainOverlay, Kicker, Reveal, SolarCells } from './atoms'
import { scrollToId } from './scroll'
import { criarTxt, temConteudo } from './cms'
import { JornadaPlataformaV4 } from './JornadaPlataformaV4'

/* PLATAFORMA DE AVALIAÇÃO — bloco reescrito conforme os slides do Francis
   (2026-06): copy virada pro vendedor ("sua proposta tem nota; teste antes que
   o mercado teste") + um EXEMPLO REAL da tela de Pontuação Geral embutido na LP.
   Estrutura da tabela (decisão do Francis):
   - índices por grupo + Índice de Confiabilidade, todos /100;
   - SEM as sub-linhas decimais "nota /10";
   - SEM a linha de Viabilidade (removida em 06/08, slide 5): ela existia só
     para mostrar "/" em todas as colunas, dizendo que é informativa e não
     pontua. Seis células vazias explicando uma ausência custavam mais atenção
     do que informavam;
   - Decisão do comprador: só a maior nota total sai como VENCEDORA e as
     demais como descartadas (Francis, 03/08);
   - Escala de risco abaixo da tabela, em tamanho menor e na régua /100;
   - mobile: 4 colunas (a vencedora + melhor e pior índice).
   Estilo segue o padrão das seções escuras: destaque de título em
   v4-serif laranja e lead em slate (sem o lead âmbar, que é exclusivo do
   spotlight do Manual). */

/* OS DADOS E A TABELA DO EXEMPLO MUDARAM DE ARQUIVO.

   Eles viraram o painel 4 da jornada, em JornadaPlataformaV4.tsx, junto com os
   outros quatro (preenchimento, pontuacao de empresas, pontuacao tecnologica e
   a escolhida). Nada se perdeu: a tabela que ficava aqui e o penultimo quadro
   de la, com os mesmos numeros, a mesma coluna vencedora em laranja e a mesma
   regua /100 que a Escala de Risco logo abaixo usa.

   A Escala de Risco continua AQUI porque ela nao e um passo da jornada: e a
   legenda da regua, e vale para a tabela inteira. */

/* Escala na MESMA régua da tabela (/100) — a versão /10 da plataforma não faz
   sentido aqui porque as sub-linhas "nota /10" foram removidas do exemplo.

   As faixas eram 0–40 / 50–60 / 70–80 / 90–100 e deixavam buracos: uma nota
   61,6 (Fotovolta Express, na própria tabela acima) não caía em faixa
   nenhuma. Agora cobrem 0 a 100 sem buraco e sem sobreposição (Francis,
   slide 3 de 03/08). A mesma correção foi feita na régua /10 do comparativo
   da plataforma. */
const RISK = [
  { range: '0–40', label: 'Risco Crítico', cls: 'bg-red-500' },
  { range: '41–60', label: 'Risco Moderado', cls: 'bg-amber-500' },
  { range: '61–80', label: 'Risco Baixo', cls: 'bg-emerald-500' },
  { range: '81–100', label: 'Risco Mínimo', cls: 'bg-blue-500' },
] as const

/* Escala de risco — abaixo da tabela, compacta (tamanho menor, pedido do Francis) */
const RiskScale: React.FC = () => (
  <div className="mt-5">
    <p className="v4-mono mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Escala de risco</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {RISK.map((r) => (
        <div key={r.range} className={`rounded-lg ${r.cls} px-3 py-2 text-center text-white`}>
          <p className="font-['Sora'] text-sm font-extrabold leading-none">{r.range}</p>
          <p className="mt-1 text-[10px] font-semibold opacity-90">{r.label}</p>
        </div>
      ))}
    </div>
  </div>
)

export const PlatformV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('plataforma')
  const txt = criarTxt(section)

  const badge = txt('badge', 'Bônus Exclusivo')

  /* TÍTULO EM DUAS CORES — AS CORES INVERTERAM DE NOVO (Francis, 09/08:
     "gostaria inverter as cores: branco 'Sua Proposta Tem Nota', laranja 'A do
     Seu Concorrente Também'").

     Em 06/08 ele tinha pedido o contrário (slide 5: "a segunda parte do título
     deve ser de cor branca"). Mudou de ideia, e a nova versão é melhor: o
     laranja agora cai na virada da frase, que é onde está o argumento, em vez
     de no começo, que é só a constatação.

     Ele anotou "o ADM não permite", e estava certo: no banco a frase INTEIRA
     estava em `titleHighlight`, com `title` vazio. Uma parte só não tem como
     ter duas cores. Junto com esta mudança o texto foi separado nos dois
     campos, então agora ele controla as duas metades pelo editor.

     LEGADO: o ramo que parte a frase no primeiro ponto final continua, para
     instalações que ainda tenham tudo num campo só. Ele agora entrega a
     primeira sentença em BRANCO e o resto em laranja, acompanhando a
     inversão. */
  const tituloCms = txt('title', '')
  const destaqueCms = txt('titleHighlight', '')
  const [tituloBranco, tituloLaranja] = (() => {
    const titleWasConfigured = section?.texts.title !== undefined || section?.texts.titleHighlight !== undefined
    if (temConteudo(tituloCms) || temConteudo(destaqueCms)) {
      if (temConteudo(tituloCms)) return [tituloCms, destaqueCms]
      // Só o segundo campo preenchido: parte no primeiro ponto final.
      const ponto = destaqueCms.indexOf('. ')
      if (ponto === -1) return ['', destaqueCms]
      return [destaqueCms.slice(0, ponto + 1).trim(), destaqueCms.slice(ponto + 1).trim()]
    }
    return titleWasConfigured ? ['', ''] : ['Sua proposta tem nota.', 'A do seu concorrente também.']
  })()

  const lead =
    txt('lead', 'A Plataforma de Avaliação Solar Buy-Side revela as forças e fraquezas das suas ofertas, ajudando sua empresa a entregar propostas mais competitivas, confiáveis e persuasivas.')
  const legenda = txt(
    'tableCaption',
    'Seis propostas para o mesmo cliente. Venceu a de <span class="cms-bold">R$ 16.342,80</span>, nem a mais cara, nem a mais barata, porque teve o maior Índice de Confiabilidade: <span class="cms-orange">79,2 de 100</span>, com a melhor pontuação em confiabilidade da integradora e em reputação da tecnologia proposta.',
  )
  /* Os três bullets ("Compare propostas lado a lado", "Pontuação por
     reputação…", "Índice de Confiabilidade de 0 a 100") saíram na V5, slide 4:
     "Eliminar os 3 bullets".

     Faz sentido depois da própria seção ter crescido: a tabela comparativa, a
     escala de risco e a legenda do caso real já dizem as três coisas, e com
     mais evidência do que uma lista de promessas. `bullet1..3` continuam
     gravados no banco e ocultos no admin — se ele quiser de volta, é
     descomentar aqui, não redigitar. */
  // CTA 5 (Francis, slide 15: "criar CTA 5"). O botão já existia aqui, o que
  // mudou foi a frase: agora nomeia os três itens do pacote. O texto anterior
  // é tratado como legado para a LP não depender do seed.
  const ctaCms = txt('ctaButton', '')
  const ctaButton = ctaCms === 'Quero o Manual + Plataforma'
    ? 'Quero o Manual + o Código + acesso à Plataforma'
    : ctaCms

  return (
    <section className="relative overflow-hidden bg-[#07090d] text-slate-100 antialiased">
      {/* GRADE PLENA, e não `center` (Gabriel, 09/08: "a segunda seção tem que
          continuar a primeira").

          A cor nunca foi o problema: as duas seções são #07090d, o mesmo preto
          do disco solar. O que criava a linha de costura era a GRADE. O Hero
          termina com as células acesas na borda de baixo, e o `fade="center"`
          é uma máscara radial que zera a grade justamente na borda de cima
          desta seção. Grade acima, nada abaixo: o olho lê a diferença de
          textura como diferença de cor, porque as linhas a 7% de branco
          clareiam a média do preto.

          Com `full` a grade atravessa a emenda inteira. E ela casa sozinha,
          sem calibragem: `.v4-cells` usa `background-attachment: fixed`, então
          a fase das linhas é a mesma em todas as seções e os quadrados de 40px
          continuam alinhados de uma para a outra. É exatamente o caso de ponte
          para o qual o `full` existe (ver `SolarCells` em atoms.tsx). */}
      <SolarCells fade="full" />
      {/* O GRÃO, que faltava. Com a grade corrigida ainda sobrava uma linha
          visível na emenda, então em vez de continuar no olho eu medi os pixels
          dos dois lados: acima 11,21 de luminância média com desvio 0,161;
          abaixo 9,67 com desvio ZERO. Ou seja, o lado do Hero tem textura e
          este era liso — e liso encostado em granulado o olho lê como duas
          cores, mesmo os dois sendo #07090d.

          O Hero cobre a seção inteira com `v4-noise` a 3%, que soma ~1,5 nível
          de claridade e o grão. `GrainOverlay` é o mesmo recurso já usado em
          quase toda seção escura da LP (Manual, Retorno, Transformação,
          Pricing, Vídeo, fechamento); estas duas eram as que tinham ficado de
          fora. 0.03 e não o 0.028 padrão do átomo, para bater exatamente com o
          valor do Hero e o degrau fechar em zero. */}
      <GrainOverlay opacity={0.03} />

      {/* pt menor no celular (Francis, 09/08): junto com o pé encurtado do Hero,
          é o que faz o título desta seção aparecer logo depois do CTA em vez de
          depois de uma tela de céu vazio. No desktop nada muda. */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-12 md:py-32">
        {/* Header em largura própria: o texto deixa de disputar com a tabela */}
        <div className="max-w-3xl">
          <Reveal>
            <Kicker tone="dark">{badge}</Kicker>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-4 font-['Sora'] text-[clamp(2.1rem,4vw,3.4rem)] font-extrabold leading-[1.08] tracking-tight text-white">
              {/* Espaço DENTRO da expressão: dois text nodes adjacentes quebram
                  a hidratação (ver ContextV4). Sem a segunda parte, o título é
                  só o trecho laranja — nada de span vazio nem espaço solto no
                  fim da frase. */}
              {tituloBranco ? (
                <>
                  {`${tituloBranco} `}
                  <span className="v4-serif text-orange-400">{tituloLaranja}</span>
                </>
              ) : (
                <span className="v4-serif text-orange-400">{tituloLaranja}</span>
              )}
            </h2>
          </Reveal>
          <Reveal delay={170}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-400">{lead}</p>
          </Reveal>
        </div>

        {/* Exemplo real da tela de Pontuação Geral + escala de risco */}
        <div className="relative mt-12">
          <div className="pointer-events-none absolute -inset-10 rounded-full bg-orange-500/[0.07] blur-[130px]" aria-hidden />
          <Reveal className="relative">
            <JornadaPlataformaV4 />
            <RiskScale />
          </Reveal>
        </div>

        {/* A legenda da tabela (Francis, 06/08, slide 5: "frase explicativa
            para inserir"). Sem ela a tabela é um monte de número e o visitante
            precisa achar sozinho por que a segunda coluna venceu. Texto dele,
            com os travessões trocados por vírgulas: a LP não usa travessão em
            texto visível. Aceita marcação do CMS para destacar os números. */}
        {temConteudo(legenda) && (
          <Reveal delay={90}>
            <p className="mt-8 border-l-2 border-orange-500/50 pl-5 text-lg leading-relaxed text-slate-300 md:text-xl">
              <CMSText value={legenda} />
            </p>
          </Reveal>
        )}

        {/* Aqui ficava a lista "O que isso significa na prática", com os três
            bullets eliminados no slide 4 da V5. Ver o comentário na leitura de
            `bullet1..3` acima. */}

        {/* Botão laranja cheio (era ghost-dark, apagado demais) e sem a nota
            "Acesso por 6 meses..." embaixo. Gabriel, 26/07. */}
        {temConteudo(ctaButton) && <Reveal delay={200} className="mt-12 flex justify-center">
          <Cta size="lg" onClick={() => scrollToId('oferta')}>
            {ctaButton}
            <CtaArrow size={20} />
          </Cta>
        </Reveal>}
      </div>
    </section>
  )
}
