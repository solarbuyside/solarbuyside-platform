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

  // A barra mais cara ocupa 100%; as demais, proporcional. Piso de 8% para a
  // última linha não virar um traço invisível.
  const maior = Math.max(...linhas.map((l) => numero(l.valor)), 1)
  const capa = section?.images.teamImage || '/assets/coletiva-norm.png'

  // Respiro próprio no topo: a seção acima (apoiadores) tem o MESMO fundo
  // claro, então sem padding os dois viram um bloco só e o título nasce colado
  // na última fileira de logos.
  return (
    <section className="bg-[#f7f8fa] px-6 pb-24 pt-16 text-slate-700 md:pb-28 md:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.55fr_1fr] lg:gap-16">
          <div>
            <Reveal>
              <h2 className="max-w-2xl font-['Sora'] text-[clamp(1.7rem,3.4vw,2.6rem)] font-extrabold leading-[1.12] tracking-tight text-slate-900">
                <CMSText value={titulo} />
              </h2>
            </Reveal>

            {temConteudo(lead) && (
              <Reveal delay={90}>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
                  <CMSText value={lead} />
                </p>
              </Reveal>
            )}

            <Reveal delay={150}>
              {/* Corpo e espacejamento menores no celular: a 390px os dois
                  rótulos se encostavam e viravam uma frase só. */}
              <div className="v4-mono mt-10 flex items-baseline justify-between gap-3 border-b border-slate-200 pb-3 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:text-[10px] sm:tracking-[0.18em]">
                <span>{colEquipe}</span>
                <span className="shrink-0 text-right">{colValor}</span>
              </div>
            </Reveal>

            <ul className="mt-1">
              {linhas.map((linha, i) => {
                const largura = Math.max(8, (numero(linha.valor) / maior) * 100)
                const ultima = i === linhas.length - 1
                return (
                  <Reveal key={linha.equipe} delay={190 + i * 45}>
                    <li className="relative border-b border-slate-200/70 py-3">
                      {/* A régua: fica ATRÁS do texto, bem apagada. É o que
                          mostra a queda do custo sem precisar de gráfico. */}
                      <span
                        className="pointer-events-none absolute inset-y-1 left-0 rounded-r-md bg-gradient-to-r from-orange-500/[0.14] to-orange-500/[0.03]"
                        style={{ width: `${largura}%` }}
                        aria-hidden
                      />
                      <span className="relative flex items-baseline justify-between gap-4">
                        <span
                          className={`text-[15px] md:text-base ${ultima ? 'font-bold text-slate-900' : 'text-slate-700'}`}
                        >
                          {linha.equipe}
                        </span>
                        <span
                          className={`v4-mono shrink-0 font-bold tabular-nums ${
                            ultima ? 'text-lg text-orange-600 md:text-xl' : 'text-[15px] text-slate-800 md:text-base'
                          }`}
                        >
                          {linha.valor}
                        </span>
                      </span>
                    </li>
                  </Reveal>
                )
              })}
            </ul>
          </div>

          {/* Capa da Licença Coletiva. Sticky no desktop: acompanha a régua
              inteira, que é longa (10 linhas). No mobile vem antes da lista,
              porque depois dela ninguém rola de volta para ver a capa. */}
          <Reveal delay={120} className="order-first lg:order-none">
            <div className="lg:sticky lg:top-28">
              <div className="flex justify-center lg:justify-end">
                <Img
                  src={capa}
                  alt="Licença de Uso Coletiva Solar Buy-Side"
                  loading="lazy"
                  className="h-[240px] w-auto max-w-none drop-shadow-[0_28px_38px_rgba(15,23,42,0.28)] md:h-[300px]"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
