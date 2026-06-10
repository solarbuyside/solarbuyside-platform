import React from 'react'
import { ArrowRight, CheckCircle2, Lock as LockIcon, ShieldCheck, Sparkles } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { trackBuyClick } from '../utils/analytics'
import { CMSText } from '../components/CMSText'
import { Reveal } from './atoms'

type PricingV4Props = {
  id?: string
}

type ProductCard = {
  tag: string
  title: string
  desc: string
  image: string
  imageAlt: string
  variant: 'default' | 'bonus'
}

export const PricingV4: React.FC<PricingV4Props> = ({ id }) => {
  const { getSection, globalSettings } = useContent()
  const section = getSection('pricing')
  const isFirstSection = id === 'oferta'
  const featuresTitle = section?.texts.featuresTitle || 'VEJA TUDO QUE VOCÊ RECEBE:'

  const productCards: ProductCard[] = [
    {
      tag: section?.texts.card1Tag || 'MANUAL PRINCIPAL',
      title: section?.texts.card1Title || section?.texts.feature1Title || 'Manual Solar Buy-Side',
      desc:
        section?.texts.card1Desc ||
        'Acesso vitalício à bíblia da estratégia solar — 130 páginas, 160 tópicos e o Método em 4 Fases para dominar a compra.',
      image: section?.images.card1Image || section?.images.manualImage || '/assets/livro-de-frente.png',
      imageAlt: 'Capa do Manual Solar Buy-Side',
      variant: 'default',
    },
    {
      tag: section?.texts.card2Tag || 'DIFERENCIAL ESTRATÉGICO',
      title: section?.texts.card2Title || section?.texts.bonusTitle || 'Código do Vendedor Consultivo',
      desc:
        section?.texts.card2Desc ||
        section?.texts.bonusSubtitle ||
        '26 páginas para vender decisão (não preço) — postura consultiva, anti-leilão e fechamento técnico.',
      image: section?.images.card2Image || section?.images.codeImage || '/assets/foto-o-codigo-do-vendedor.png',
      imageAlt: 'Capa do Código do Vendedor Consultivo',
      variant: 'default',
    },
    {
      tag: section?.texts.card3Tag || 'BÔNUS ESPECIAL',
      title: section?.texts.card3Title || 'Turbina sua Equipe de Venda',
      desc:
        section?.texts.card3Desc ||
        'Licença de Uso Coletiva: até 10 cópias por CNPJ. Distribua para todo o time comercial com máxima economia.',
      image: section?.images.card3Image || '/assets/img-coletiva-frente.png',
      imageAlt: 'Licença de Uso Coletiva',
      variant: 'bonus',
    },
  ]

  return (
    <section id={id} className="relative overflow-hidden bg-[#02050f] text-white">
      {/* Atmosfera */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
        <div className="absolute left-1/2 top-[-30%] h-[60vw] w-[60vw] -translate-x-1/2 rounded-full bg-blue-600/[0.09] blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[40vw] w-[40vw] rounded-full bg-orange-600/[0.07] blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black 25%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black 25%, transparent 100%)',
          }}
        />
        <div className="v4-noise absolute inset-0 opacity-[0.025]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:py-28">
        {/* Cabeçalho */}
        <div className="mb-14 space-y-5 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-5 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-orange-400">
              <Sparkles size={13} className="animate-pulse" />
              {section?.texts.badge || 'Pré-venda profissional por tempo limitado'}
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h2 className="mx-auto max-w-4xl text-3xl font-extrabold leading-tight tracking-tight md:text-[2.8rem] md:leading-[1.12]">
              <CMSText
                value={
                  section?.texts.title?.trim()
                    ? section.texts.title
                    : isFirstSection
                      ? section?.texts.titleFirst?.trim() ||
                        'NÃO PERCA TEMPO NEM <br/><span class="cms-gradient-blue">POSIÇÃO NO MERCADO.</span>'
                      : section?.texts.titleSecond?.trim() ||
                        'ATENÇÃO: O TEMPO ESTÁ <span class="cms-gradient-blue">CORRENDO</span><br/>E QUEM AGIR PRIMEIRO, <span class="cms-gradient-blue">VENDE MAIS.</span>'
                }
              />
            </h2>
          </Reveal>

          <Reveal delay={170}>
            <p className="mx-auto max-w-2xl text-lg font-medium text-slate-400">
              {section?.texts.subtitle?.trim()
                ? section.texts.subtitle
                : isFirstSection
                  ? section?.texts.subtitleFirst ||
                    'O mercado solar não perdoa quem fica para trás. Garanta o método que os grandes players usam para dominar o Buy-Side.'
                  : section?.texts.subtitleSecond || 'Em um mercado competitivo, sua vantagem é o conhecimento.'}
            </p>
          </Reveal>
        </div>

        <div className="grid items-stretch gap-10 lg:grid-cols-12">
          {/* Entregáveis */}
          <div className="flex flex-col lg:col-span-7">
            <Reveal>
              <h3 className="mb-6 flex items-center gap-3 text-lg font-bold tracking-tight text-slate-200">
                <span className="h-1 w-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-400" aria-hidden />
                {featuresTitle}
              </h3>
            </Reveal>

            <div className="flex flex-1 flex-col gap-4">
              {productCards.map((card, idx) => {
                const isBonus = card.variant === 'bonus'
                return (
                  <Reveal key={card.title} delay={idx * 110}>
                    <div
                      className={`v4-lift group relative flex items-stretch gap-6 rounded-3xl p-5 md:p-6 ${
                        isBonus
                          ? 'border border-orange-500/30 bg-gradient-to-br from-orange-500/[0.12] to-orange-600/[0.04] hover:border-orange-400/50'
                          : 'border border-white/[0.07] bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]'
                      }`}
                    >
                      {isBonus && (
                        <div className="absolute -top-3 left-6">
                          <span className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.22em] text-white shadow-[0_8px_20px_-6px_rgba(249,115,22,0.7)]">
                            Bônus Especial
                          </span>
                        </div>
                      )}

                      <div className="flex w-[105px] shrink-0 items-center justify-center sm:w-[125px]">
                        <img
                          src={card.image}
                          alt={card.imageAlt}
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          className="h-auto max-h-[165px] w-full object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-out group-hover:scale-[1.06] group-hover:-rotate-1"
                        />
                      </div>

                      <div className="flex min-w-0 flex-col justify-center gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold tracking-[0.2em] ${isBonus ? 'text-orange-400' : 'text-slate-400'}`}
                        >
                          {card.tag}
                        </span>
                        <h4 className="text-base font-bold leading-tight text-white sm:text-lg">{card.title}</h4>
                        <p className="text-sm leading-relaxed text-slate-400">{card.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>

          {/* Card de preço */}
          <div className="lg:col-span-5 lg:self-start lg:sticky lg:top-24">
            <Reveal delay={150}>
              <div className="relative">
                <div className="absolute -inset-3 rounded-[40px] bg-gradient-to-br from-orange-500/25 via-transparent to-blue-500/15 blur-2xl" aria-hidden />

                <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 text-slate-950 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)]">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300" aria-hidden />

                  <div className="mb-7 flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-orange-600">
                        {section?.texts.planBadge || 'Plano de Acesso'}
                      </span>
                      <h3 className="mt-1.5 text-[22px] font-extrabold tracking-tight text-slate-900">
                        {section?.texts.planTitle || 'Oferta Especial'}
                      </h3>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                      <ShieldCheck className="h-5 w-5 text-slate-500" />
                    </div>
                  </div>

                  <div className="mb-7">
                    <p className="text-[15px] font-bold text-slate-400 line-through">
                      {section?.texts.priceFrom || 'De R$ 997,00 por apenas:'}
                    </p>
                    <div className="mt-1 flex items-start">
                      <span className="mr-2 mt-2 text-lg font-bold">{section?.texts.priceInstallments || '12x de'}</span>
                      <span className="mt-2 text-xl font-extrabold">R$</span>
                      <span className="text-[84px] font-extrabold leading-none tracking-tighter">
                        {section?.texts.priceValue || '61'}
                      </span>
                      <span className="mt-2 text-xl font-extrabold">{section?.texts.priceCents || ',38'}</span>
                    </div>
                    <p className="mt-2 text-[15px] font-medium text-slate-500">
                      {section?.texts.priceUpfront || 'Ou R$ 597,00 à vista no PIX'}
                    </p>
                  </div>

                  <a
                    href={globalSettings.purchaseLink || '#oferta'}
                    target={globalSettings.purchaseLink ? '_blank' : undefined}
                    rel={globalSettings.purchaseLink ? 'noopener noreferrer' : undefined}
                    onClick={trackBuyClick}
                    className="v4-cta-shine group relative flex min-h-[44px] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 py-5 font-extrabold text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_52px_-12px_rgba(249,115,22,0.8),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-[0.98]"
                  >
                    <span className="relative z-10 text-center text-[16px] uppercase leading-tight tracking-tight">
                      {id === 'oferta-final'
                        ? section?.texts.finalCtaButton || 'DESBLOQUEAR CONTEÚDO COMPLETO'
                        : section?.texts.ctaButton || 'ACESSAR O MANUAL AGORA'}
                    </span>
                    <ArrowRight size={20} className="relative z-10 shrink-0 transition-transform group-hover:translate-x-1" />
                  </a>

                  <div className="mt-5 flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight text-slate-500">
                      <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                      {section?.texts.benefit1 || 'Liberação imediata no seu e-mail'}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight text-slate-500">
                      <ShieldCheck size={17} className="shrink-0 text-blue-600" />
                      {section?.texts.benefit2 || 'Checkout 100% criptografado'}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight text-slate-500">
                      <LockIcon size={17} className="shrink-0 text-blue-600" />
                      {section?.texts.benefit3 || 'Acesso Imediato'}
                    </div>
                  </div>

                  <div className="mt-7 space-y-4 border-t border-slate-100 pt-6">
                    <div className="flex items-center justify-center">
                      <img
                        src={section?.images.guarantee || '/assets/Garantia.png'}
                        alt="7 dias de garantia"
                        className="h-auto w-full max-w-[72px]"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <img src={section?.images.visa || '/assets/Visa.png'} alt="Visa" className="h-6 w-auto object-contain" loading="lazy" />
                      <img src={section?.images.mastercard || '/assets/Mastercard.png'} alt="Mastercard" className="h-6 w-auto object-contain" loading="lazy" />
                      <img src={section?.images.pix || '/assets/Pix.png'} alt="PIX" className="h-6 w-auto object-contain" loading="lazy" />
                      <img src={section?.images.boleto || '/assets/Boleto.png'} alt="Boleto" className="h-6 w-auto object-contain" loading="lazy" />
                    </div>
                    <div className="flex justify-center pt-1">
                      <img
                        src={section?.images.securePurchase || '/assets/Compra segura.png'}
                        alt="Compra Segura"
                        className="h-auto max-w-[240px] object-contain"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
