import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { CMSText } from '../components/CMSText'
import { Img, Reveal } from './atoms'
import { criarTxt, temConteudo } from './cms'

/* "CAPACITE TODO O SEU TIME COMERCIAL POR UM INVESTIMENTO SURPREENDENTEMENTE
   BAIXO" (Francis, slide 17 da revisão de 03/08: "novo bloco").

   O argumento é aritmético: o kit custa o mesmo R$ 797, mas a Licença de Uso
   Coletiva vale para até 10 vendedores, então o custo POR PESSOA despenca de
   R$ 399 (integrador + 1) para R$ 72 (integrador + 10).

   Os valores vêm do CMS, NÃO são calculados a partir do preço. O Francis
   arredondou à mão e nem sempre para o mesmo lado (79,70 virou 80; 265,67
   virou 265): calcular aqui produziria números que ele não aprovou. O help do
   admin avisa que eles precisam acompanhar o preço à vista se ele mudar.

   Forma: a lista é uma RÉGUA. Cada linha tem uma barra proporcional ao valor,
   então a queda de 399 para 72 aparece antes de o olho ler qualquer número. A
   capa da Licença fica à direita, colada (sticky) enquanto a régua rola.

   Fundo claro: este bloco fica entre a seção de apoiadores (#f7f8fa) e a
   oferta, que sobe por cima com o topo arredondado escuro. Escurecer aqui
   quebraria essa emenda, que já existia. */

const LINHAS_PADRAO: Array<[string, string]> = [
  ['Integrador + 1 vendedor', 'R$ 399'],
  ['Integrador + 2 vendedores', 'R$ 265'],
  ['Integrador + 3 vendedores', 'R$ 199'],
  ['Integrador + 4 vendedores', 'R$ 159'],
  ['Integrador + 5 vendedores', 'R$ 133'],
  ['Integrador + 6 vendedores', 'R$ 114'],
  ['Integrador + 7 vendedores', 'R$ 99'],
  ['Integrador + 8 vendedores', 'R$ 88'],
  ['Integrador + 9 vendedores', 'R$ 80'],
  ['Integrador + 10 vendedores', 'R$ 72'],
]

const MAX_LINHAS = 12

/** Só os dígitos, para dimensionar a barra. "R$ 1.399,90" -> 1399.9 */
const numero = (valor: string): number => {
  const limpo = valor.replace(/[^\d,.]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.')
  const n = Number.parseFloat(limpo)
  return Number.isFinite(n) ? n : 0
}

export const EquipeV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('pricing')
  const txt = criarTxt(section)

  const titulo = txt('teamTitle', 'Capacite todo o seu time comercial por um investimento surpreendentemente baixo')
  const lead = txt(
    'teamLead',
    'Kit Solar Buy-Side com <span class="cms-bold">Licença de Uso Coletiva</span>: até 10 vendedores treinados no mesmo método de vendas consultivas.',
  )
  const colEquipe = txt('teamColTeam', 'Composição da equipe')
  const colValor = txt('teamColValue', 'Investimento por pessoa')

  const linhas: Array<{ equipe: string; valor: string }> = []
  for (let i = 1; i <= MAX_LINHAS; i++) {
    const padrao = LINHAS_PADRAO[i - 1]
    const equipe = txt(`teamRow${i}Label`, padrao?.[0] ?? '')
    const valor = txt(`teamRow${i}Value`, padrao?.[1] ?? '')
    if (temConteudo(equipe) && temConteudo(valor)) linhas.push({ equipe, valor })
  }

  if (!temConteudo(titulo) || linhas.length === 0) return null

  // A barra mais cara ocupa a trilha inteira; as demais, proporcional. Piso de
  // 7% para a última não virar um ponto invisível.
  const maior = Math.max(...linhas.map((l) => numero(l.valor)), 1)
  const capa = section?.images.teamImage || '/assets/coletiva-norm.png'

  /* Fecho do bloco (Francis, 06/08, slide 20: "acrescentar e destacar essa
     frase abaixo da tabela"). É a ponte para a promo Belenergy que aparece
     dentro da oferta, logo adiante: a régua mostra o quanto o custo por pessoa
     cai, e esta linha diz que ainda cai mais. Some se o campo for apagado. */
  const notaBelenergy = txt(
    'teamNote',
    'E tem mais economia: Integradoras Credenciadas <span class="cms-bold">Belenergy</span> garantem 15% OFF.',
  )


  /* Respiro próprio no topo: a seção acima (apoiadores) tem o MESMO fundo
     claro, então sem padding os dois viram um bloco só e o título nasce colado
     na última fileira de logos. */
  return (
    <section className="bg-[#f7f8fa] px-6 pb-24 pt-16 text-slate-700 md:pb-28 md:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-14">
          <div>
            <Reveal>
              <h2 className="max-w-2xl font-['Sora'] text-[clamp(1.7rem,3.4vw,2.6rem)] font-extrabold leading-[1.12] tracking-tight text-slate-900">
                <CMSText value={titulo} />
              </h2>
            </Reveal>

            {temConteudo(lead) && (
              <Reveal delay={80}>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
                  <CMSText value={lead} />
                </p>
              </Reveal>
            )}

            {/* O placar de três números (R$ 399 / R$ 72 / -82%) que abria o
                bloco saiu na revisão de 06/08 (slide 20): ele resumia a tabela
                logo antes da própria tabela, e o Francis riscou o quadro
                inteiro. A régua abaixo já conta a história sozinha. */}

            {/* Corpo e espacejamento menores no celular: a 390px os dois
                rótulos se encostavam e viravam uma frase só. */}
            <Reveal delay={170}>
              <div className="v4-mono mt-10 flex items-baseline justify-between gap-3 border-b border-slate-200 pb-3 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:text-[10px] sm:tracking-[0.18em]">
                <span>{colEquipe}</span>
                <span className="shrink-0 text-right">{colValor}</span>
              </div>
            </Reveal>

            {/* Todas as linhas com o MESMO peso e a mesma cor (Francis, slide
                20: "não destacar com cor diferente"). A última era negrito
                laranja e maior, o que lia como "esta é a oferta" quando ela é
                só o extremo da régua. A barra continua encolhendo, e é ela que
                mostra a queda. */}
            <ul>
              {linhas.map((linha, i) => {
                const largura = Math.max(7, (numero(linha.valor) / maior) * 100)
                const ultima = i === linhas.length - 1
                return (
                  <Reveal key={linha.equipe} delay={200 + i * 40}>
                    {/* A barra vive numa COLUNA própria, entre o rótulo e o
                        preço, não atrás do texto: encolhendo linha a linha ela
                        vira gráfico, e não sujeira de fundo. Some no celular,
                        onde não há largura para ela dizer nada. */}
                    <li
                      className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-slate-200/70 py-2.5 md:grid-cols-[230px_minmax(0,1fr)_86px] md:gap-6 ${
                        ultima ? 'border-b-0' : ''
                      }`}
                    >
                      <span className="text-[15px] text-slate-600 md:text-base">{linha.equipe}</span>
                      <span className="hidden h-1.5 w-full rounded-full bg-slate-200/80 md:block" aria-hidden>
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400/70"
                          style={{ width: `${largura}%` }}
                        />
                      </span>
                      <span className="v4-mono shrink-0 text-right text-[15px] font-bold tabular-nums text-slate-800 md:text-base">
                        {linha.valor}
                      </span>
                    </li>
                  </Reveal>
                )
              })}
            </ul>

            {temConteudo(notaBelenergy) && (
              <Reveal delay={240}>
                <p className="mt-8 rounded-2xl border border-orange-500/30 bg-orange-500/[0.07] px-6 py-5 font-['Sora'] text-lg font-bold leading-snug text-slate-900 md:text-xl">
                  <CMSText value={notaBelenergy} />
                </p>
              </Reveal>
            )}
          </div>

          {/* Capa da Licença Coletiva, sticky, acompanhando a tabela inteira.
              Some abaixo de lg: sem a coluna própria ela ia parar em cima do
              título e empurrava a tabela para fora da primeira tela. Aqui a
              tabela é o conteúdo; a capa é ilustração. */}
          <Reveal delay={110} className="hidden lg:block">
            <div className="lg:sticky lg:top-28">
              <div className="flex justify-center lg:justify-end">
                <Img
                  src={capa}
                  alt="Licença de Uso Coletiva Solar Buy-Side"
                  loading="lazy"
                  className="h-[210px] w-auto max-w-none drop-shadow-[0_28px_38px_rgba(15,23,42,0.28)] md:h-[280px]"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
