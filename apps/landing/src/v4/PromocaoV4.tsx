import React, { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { trackBuyClick } from '../utils/analytics'
import { temConteudo, type Txt } from './cms'
import { relogioHMS } from './promocao-tempo'
import { SemQuebraNoHifen } from './SemQuebraV4'

/* MIOLO DO CARD DE PREÇO DURANTE A PROMOÇÃO DE LANÇAMENTO (Francis, 03/11,
   slide 2: "deixar o bloco oferta com visual apurado para que o lead possa
   ver de forma direta as informações essenciais").

   Troca só o miolo do card: a moldura (v4-conic-frame), os benefícios, o selo
   de garantia e as formas de pagamento continuam os do card de vendas, que é
   quem desenha este componente por dentro. Assim a oferta lê como o mesmo
   palco com outra condição, não como um bloco colado de fora.

   Ordem do slide, de cima para baixo: selo do período, produto, preço "de"
   riscado, preço "por", economia, relógio, botão, recado. A arte dele usa um
   vermelho-salmão no preço riscado; aqui o risco é laranja sobre cinza, a
   língua da LP para "valor que ficou para trás", e o verde da economia é o
   esmeralda que a LP já usa nos ícones de benefício.

   Só monta no navegador do visitante (ver promocao.ts): nada daqui sai no HTML
   pré-renderizado, então o relógio pode nascer já com a hora certa, sem o
   cuidado de hidratação que a contagem da live precisa. */

const pad2 = (n: number) => `${n < 10 ? '0' : ''}${n}`

/* Valor e desconto não se separam na quebra de linha: no celular saía
   "economiza R$" / "199,25" e "COM 25%" / "OFF". Espaço não separável entre
   "R$" e o número, e entre "25%" e "OFF". */
const colar = (s: string) => s.replace(/R\$ /g, 'R$\u00a0').replace(/(\d+%) OFF/gi, '$1\u00a0OFF')

/** Relógio de 1s até `fim`. Para sozinho no zero. */
function useRestante(fim: number): number {
  const [restante, setRestante] = useState(() => Math.max(0, fim - Date.now()))
  useEffect(() => {
    const tick = () => setRestante(Math.max(0, fim - Date.now()))
    tick()
    const intervalo = window.setInterval(tick, 1000)
    return () => window.clearInterval(intervalo)
  }, [fim])
  return restante
}

const Relogio: React.FC<{ fim: number }> = ({ fim }) => {
  const { horas, minutos, segundos } = relogioHMS(useRestante(fim))
  const casas = [
    { valor: pad2(horas), rotulo: 'Horas' },
    { valor: pad2(minutos), rotulo: 'Min' },
    { valor: pad2(segundos), rotulo: 'Seg' },
  ]
  return (
    // role="timer" + aria-live off: leitor de tela lê quando a pessoa chega,
    // sem anunciar cada segundo.
    <div role="timer" aria-live="off" className="mt-4 flex items-start justify-center gap-1.5 sm:gap-3">
      {casas.map((c, i) => (
        <React.Fragment key={c.rotulo}>
          {i > 0 && (
            <span className="mt-3.5 font-['Sora'] text-2xl font-extrabold leading-none text-orange-500 sm:mt-5 sm:text-4xl" aria-hidden>
              :
            </span>
          )}
          <span className="flex flex-col items-center">
            <span className="flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-2xl border border-orange-500/45 bg-orange-500/[0.07] font-['Sora'] text-3xl font-extrabold tabular-nums tracking-tight text-white sm:h-20 sm:w-24 sm:text-5xl">
              {c.valor}
            </span>
            <span className="v4-mono mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{c.rotulo}</span>
          </span>
        </React.Fragment>
      ))}
    </div>
  )
}

/** "R$ 597,75" → prefixo menor, como no card de vendas. Sem "R$", sai inteiro. */
const Preco: React.FC<{ valor: string }> = ({ valor }) => {
  const m = valor.match(/^R\$\s*(.+)$/)
  if (!m) return <>{valor}</>
  return (
    <>
      <span className="mr-2 align-top text-[0.45em] leading-none">R$</span>
      {m[1]}
    </>
  )
}

export const OfertaPromocaoV4: React.FC<{ txt: Txt; fim: number; link: string }> = ({ txt, fim, link }) => {
  const badge = txt('badge', 'Promoção de lançamento · Só 48 horas')
  const precoDe = txt('priceFrom', 'R$ 797,00')
  const precoPor = txt('priceTo', 'R$ 597,75')
  const economia = colar(txt('savings', '25% OFF · Você economiza R$ 199,25'))
  const notaPreco = colar(txt('priceNote', 'à vista no PIX · ou 12x de R$ 61,46'))
  const notaRelogio = colar(txt('timerNote', 'Quando chegar a zero, a condição sai do ar e o valor volta para R$ 797,00.'))
  const notaCta = colar(txt('ctaNote', 'Aproveite já: quem decide hoje paga R$ 199,25 a menos.'))
  const externo = Boolean(link)

  return (
    <>
      {temConteudo(badge) && (
        <span className="v4-mono inline-block max-w-full rounded-full bg-orange-500 px-4 py-2 text-[10px] font-extrabold uppercase leading-relaxed tracking-[0.12em] text-[#1a0d04] shadow-[0_10px_30px_-10px_rgba(249,115,22,0.8)] sm:text-[11px] sm:tracking-[0.18em]">
          {/* "Promoção de lançamento · Só 48 horas": no celular cada metade
              ganha a própria linha e o ponto some, em vez de abrir a 2ª. */}
          {badge.split(/\s+·\s+/).map((parte, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="hidden sm:inline">{' · '}</span>}
              <span className="block sm:inline">{parte}</span>
            </React.Fragment>
          ))}
        </span>
      )}

      <p className="v4-mono mt-6 text-[11px] font-bold uppercase tracking-[0.25em] text-orange-400">
        {txt('kicker', 'Seu acesso direto')}
      </p>
      <h3 className="mx-auto mt-2 max-w-md font-['Sora'] text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl">
        <SemQuebraNoHifen texto={txt('title', 'Método Solar Buy-Side Completo')} />
      </h3>
      {temConteudo(txt('subtitle', 'Oferta especial da Buy-Side Soluções')) && (
        <p className="mt-2 text-base text-slate-300 md:text-lg">{txt('subtitle', 'Oferta especial da Buy-Side Soluções')}</p>
      )}

      {/* Preço: "de" riscado → "por" gigante → economia. */}
      <div className="mt-8 rounded-[1.75rem] border border-white/[0.08] bg-white/[0.03] px-4 py-8 sm:px-5 md:px-8">
        {temConteudo(precoDe) && (
          <>
            <p className="v4-mono text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300/90">
              {txt('priceFromLabel', 'Valor real do método')}
            </p>
            <p className="mt-2 font-['Sora'] text-3xl font-extrabold tracking-tight text-slate-400 line-through decoration-orange-500 decoration-[3px] md:text-4xl">
              {precoDe}
            </p>
          </>
        )}
        <p className="mt-4 text-base font-semibold text-slate-300">{txt('priceToLabel', 'Hoje, por apenas')}</p>
        <p className="mt-1 whitespace-nowrap font-['Sora'] text-[clamp(3rem,11vw,5.5rem)] font-extrabold leading-none tracking-tighter text-white">
          <Preco valor={precoPor} />
        </p>
        {temConteudo(notaPreco) && <p className="mt-3 text-base text-slate-300">{notaPreco}</p>}
        {temConteudo(economia) && (
          <p className="mt-5 inline-block rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-extrabold text-emerald-300 [text-wrap:balance] md:text-base">
            {economia}
          </p>
        )}
      </div>

      {/* Relógio: mesma hora de Brasília que encerra o cupom na Greenn. */}
      <div className="mt-6 rounded-[1.75rem] border border-dashed border-orange-500/40 px-3 py-7 sm:px-5 md:px-8">
        <p className="v4-mono text-[11px] font-bold uppercase tracking-[0.22em] text-orange-400">
          {txt('timerKicker', 'O relógio está correndo')}
        </p>
        <Relogio fim={fim} />
        {temConteudo(notaRelogio) && (
          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-slate-300 md:text-base">{notaRelogio}</p>
        )}
      </div>

      <a
        href={link || '#oferta'}
        target={externo ? '_blank' : undefined}
        rel={externo ? 'noopener noreferrer' : undefined}
        onClick={trackBuyClick}
        className="v4-cta-shine group relative mt-8 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 px-5 py-6 text-lg font-extrabold uppercase tracking-tight text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_52px_-12px_rgba(249,115,22,0.8),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-[0.98] md:text-xl"
      >
        <span className="relative z-10 leading-tight [text-wrap:balance]">{colar(txt('ctaLabel', 'Quero o método completo com 25% OFF'))}</span>
        <ArrowRight size={20} className="relative z-10 shrink-0 transition-transform group-hover:translate-x-1" />
      </a>
      {temConteudo(notaCta) && <p className="mt-4 text-sm text-slate-300 md:text-base">{notaCta}</p>}
    </>
  )
}
