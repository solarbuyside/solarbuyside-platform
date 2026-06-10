import React from 'react'
import { ArrowRight, CheckCircle2, Lock as LockIcon, ShieldCheck, Sparkles } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { trackBuyClick } from '../utils/analytics'
import { CMSText } from '../components/CMSText'
import { GrainOverlay, Reveal } from './atoms'

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
        'Acesso vitalício: 130 páginas e 160 tópicos com o Método em 4 Fases, do primeiro contato à assinatura do contrato.',
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
        '26 páginas sobre postura consultiva, estratégia anti-leilão e fechamento técnico. Para vender decisão, não desconto.',
      image: section?.images.card2Image || section?.images.codeImage || '/assets/foto-o-codigo-do-vendedor.png',
      imageAlt: 'Capa do Código do Vendedor Consultivo',
      variant: 'default',
    },
    {
      tag: section?.texts.card3Tag || 'BÔNUS ESPECIAL',
      title: section?.texts.card3Title || 'Turbina sua Equipe de Venda',
      desc:
        section?.texts.card3Desc ||
        'Licença de Uso Coletiva: até 10 cópias para o mesmo CNPJ. O time comercial inteiro alinhado pagando uma vez só.',
      image: section?.images.card3Image || '/assets/img-coletiva-frente.png',
      imageAlt: 'Licença de Uso Coletiva',
      variant: 'bonus',
    },
  ]

  return (
    <section
      id={id}
      className="relative z-10 -mt-20 overflow-hidden rounded-t-[3rem] bg-[#0a0705] pb-28 pt-24 text-white md:rounded-t-[4.5rem] md:pt-32"
    >
      {/* Spotlight do palco */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute left-1/2 top-0 h-[60vh] w-[80vw] -translate-x-1/2"
          style={{
            background: 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(251,191,36,0.10), transparent 70%)',
          }}
        />
        <GrainOverlay />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Cabeçalho central */}
        <div className="text-center">
          <Reveal>
            <div className="v4-mono inline-flex items-center gap-2.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">
              <Sparkles size={13} className="animate-pulse" />
              {section?.texts.badge || 'Condição de pré-venda • antes do lançamento oficial'}
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h2 className="mx-auto mt-7 max-w-4xl font-['Sora'] text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[1.08] tracking-tight">
              <CMSText
                value={
                  section?.texts.title?.trim()
                    ? section.texts.title
                    : isFirstSection
                      ? section?.texts.titleFirst?.trim() ||
                        'O comprador já está estudando.<br/><span class="cms-gradient-blue">Chegue preparado primeiro.</span>'
                      : section?.texts.titleSecond?.trim() ||
                        'Você viu o método inteiro.<br/><span class="cms-gradient-blue">Agora é decisão.</span>'
                }
              />
            </h2>
          </Reveal>

          <Reveal delay={170}>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-400">
              {section?.texts.subtitle?.trim()
                ? section.texts.subtitle
                : isFirstSection
                  ? section?.texts.subtitleFirst ||
                    'Manual + Código do Vendedor + Plataforma de Avaliação: o mesmo material que orienta compradores, agora do seu lado da mesa.'
                  : section?.texts.subtitleSecond ||
                    'Preço de pré-venda, acesso imediato e 7 dias de garantia incondicional para você avaliar por dentro.'}
            </p>
          </Reveal>
        </div>

        {/* Kicker dos entregáveis */}
        <Reveal className="mt-20">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" aria-hidden />
            <span className="v4-mono text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
              {featuresTitle}
            </span>
            <div className="h-px flex-1 bg-white/10" aria-hidden />
          </div>
        </Reveal>

        {/* Entregáveis — sem cards, capas no palco */}
        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {productCards.map((card, idx) => {
            const isBonus = card.variant === 'bonus'
            return (
              <Reveal key={card.title} delay={idx * 110} className="group relative flex flex-col items-center text-center">
                {idx > 0 && (
                  <span
                    className="absolute -left-8 top-24 hidden text-3xl font-light text-orange-500/40 md:block"
                    aria-hidden
                  >
                    +
                  </span>
                )}

                {isBonus && (
                  <span className="v4-mono absolute -top-4 z-10 rotate-[-3deg] rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_8px_20px_-6px_rgba(249,115,22,0.7)]">
                    Bônus Especial
                  </span>
                )}

                <div className="relative flex w-full flex-col items-center">
                  <img
                    src={card.image}
                    alt={card.imageAlt}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    className="h-[230px] w-auto object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)] transition duration-700 ease-out group-hover:-translate-y-3 group-hover:scale-[1.04]"
                  />
                  <div
                    className="mt-2 h-8 w-3/4 rounded-[100%] bg-orange-500/15 blur-xl transition duration-700 group-hover:scale-110"
                    aria-hidden
                  />
                </div>

                <span
                  className={`v4-mono mt-6 text-[9px] font-bold uppercase tracking-[0.25em] ${
                    isBonus ? 'text-orange-400' : 'text-slate-500'
                  }`}
                >
                  {card.tag}
                </span>
                <h4 className="mt-2 font-['Sora'] text-lg font-bold text-white">{card.title}</h4>
                <p className="mt-2 max-w-[300px] text-sm leading-relaxed text-slate-400">{card.desc}</p>
              </Reveal>
            )
          })}
        </div>

        {/* Preço — center stage */}
        <Reveal delay={120} className="mx-auto mt-24 max-w-2xl">
          <div className="v4-conic-frame rounded-[2.5rem] p-px">
            <div className="v4-conic-inner rounded-[calc(2.5rem-1px)] bg-[#0d0a08] p-10 text-center md:p-14">
              <span className="v4-mono text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400">
                {section?.texts.planBadge || 'Plano de Acesso'}
              </span>
              <h3 className="mt-2 font-['Sora'] text-2xl font-extrabold tracking-tight text-white">
                {section?.texts.planTitle || 'Oferta Especial'}
              </h3>

              <p className="mt-6 font-bold text-slate-500 line-through">
                {section?.texts.priceFrom || 'De R$ 997,00 por apenas:'}
              </p>
              <div className="flex items-start justify-center">
                <span className="mr-2 mt-3 text-xl font-bold text-slate-300">
                  {section?.texts.priceInstallments || '12x de'}
                </span>
                <span className="mt-3 text-2xl font-extrabold">R$</span>
                <span className="font-['Sora'] text-[clamp(6rem,14vw,9rem)] font-extrabold leading-none tracking-tighter text-white">
                  {section?.texts.priceValue || '61'}
                </span>
                <span className="mt-3 text-2xl font-extrabold">{section?.texts.priceCents || ',38'}</span>
              </div>
              <p className="mt-2 text-slate-400">{section?.texts.priceUpfront || 'Ou R$ 597,00 à vista no PIX'}</p>

              <a
                href={globalSettings.purchaseLink || '#oferta'}
                target={globalSettings.purchaseLink ? '_blank' : undefined}
                rel={globalSettings.purchaseLink ? 'noopener noreferrer' : undefined}
                onClick={trackBuyClick}
                className="v4-cta-shine group relative mt-8 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-b from-orange-500 to-orange-600 py-6 text-lg font-extrabold uppercase tracking-tight text-white shadow-[0_18px_40px_-12px_rgba(249,115,22,0.65),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_52px_-12px_rgba(249,115,22,0.8),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-[0.98] md:text-xl"
              >
                <span className="relative z-10 leading-tight">
                  {id === 'oferta-final'
                    ? section?.texts.finalCtaButton || 'Começar agora com garantia de 7 dias'
                    : section?.texts.ctaButton || 'Garantir meu acesso agora'}
                </span>
                <ArrowRight size={20} className="relative z-10 shrink-0 transition-transform group-hover:translate-x-1" />
              </a>

              <div className="v4-mono mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                  {section?.texts.benefit1 || 'Liberação imediata no seu e-mail'}
                </span>
                <span className="flex items-center gap-2">
                  <LockIcon size={15} className="shrink-0 text-emerald-500" />
                  {section?.texts.benefit2 || 'Pagamento criptografado'}
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} className="shrink-0 text-emerald-500" />
                  {section?.texts.benefit3 || 'Garantia incondicional de 7 dias'}
                </span>
              </div>

              <div className="mt-8 border-t border-white/[0.08] pt-8">
                <div className="mx-auto max-w-sm space-y-4 rounded-2xl bg-white p-5">
                  <div className="flex items-center justify-center">
                    <img
                      src={section?.images.guarantee || '/assets/Garantia.png'}
                      alt="7 dias de garantia"
                      className="h-auto w-full max-w-[70px]"
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
          </div>
        </Reveal>
      </div>
    </section>
  )
}
