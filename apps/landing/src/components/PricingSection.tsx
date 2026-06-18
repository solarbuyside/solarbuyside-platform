import React from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Lock as LockIcon,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { trackBuyClick } from '../utils/analytics'
import { CMSText } from './CMSText'

type PricingSectionProps = {
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

export const PricingSection: React.FC<PricingSectionProps> = ({ id }) => {
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
      title: section?.texts.card3Title || 'Turbine sua Equipe de Venda',
      desc:
        section?.texts.card3Desc ||
        'Licença de Uso Coletiva: até 10 cópias por CNPJ. Distribua para todo o time comercial com máxima economia.',
      image: section?.images.card3Image || '/assets/img-coletiva-frente.png',
      imageAlt: 'Licença de Uso Coletiva',
      variant: 'bonus',
    },
  ]

  return (
    <section id={id} className="relative overflow-hidden bg-[#010413] text-white font-sans selection:bg-orange-500/30">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[180px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-[10px] font-black tracking-[0.2em] uppercase">
            <Sparkles size={14} className="animate-pulse" />
            {section?.texts.badge || 'Pré-venda profissional por tempo limitado'}
          </div>

          <h2 className="text-4xl md:text-[42px] font-black tracking-tighter leading-tight">
            <CMSText value={
              section?.texts.title?.trim()
                ? section.texts.title
                : isFirstSection
                  ? (section?.texts.titleFirst?.trim() || 'O comprador já está estudando.<br/><span class="cms-gradient-blue">Chegue preparado primeiro.</span>')
                  : (section?.texts.titleSecond?.trim() || 'Você viu o método inteiro.<br/><span class="cms-gradient-blue">Agora é decisão.</span>')
            } />
          </h2>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            {section?.texts.subtitle?.trim()
              ? section.texts.subtitle
              : isFirstSection
                ? (section?.texts.subtitleFirst || 'Manual + Código do Vendedor + Plataforma de Avaliação: o mesmo material que orienta compradores, agora do seu lado da mesa.')
                : (section?.texts.subtitleSecond || 'Preço de pré-venda, acesso imediato e 7 dias de garantia incondicional para você avaliar por dentro.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3 italic">
              <span className="w-8 h-1 bg-blue-500 rounded-full"></span>
              {featuresTitle}
            </h3>

            <div className="flex flex-col gap-3 flex-1">
              {productCards.map((card, idx) => {
                const isBonus = card.variant === 'bonus'
                return (
                  <div
                    key={card.title}
                    className={[
                      'relative flex items-stretch gap-5 p-5 rounded-[20px] transition-all duration-300 group',
                      isBonus
                        ? 'bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30 hover:from-orange-500/15 hover:to-orange-600/10'
                        : 'bg-white/[0.03] border border-white/10 hover:bg-white/[0.06]',
                    ].join(' ')}
                  >
                    {isBonus && (
                      <div className="absolute -top-3 left-5">
                        <span className="px-3 py-1 bg-orange-500 text-white text-[9px] font-black tracking-[0.25em] uppercase rounded-full shadow-lg shadow-orange-500/30">
                          Bônus Especial
                        </span>
                      </div>
                    )}

                    <div className="shrink-0 w-[110px] sm:w-[130px] flex items-center justify-center">
                      <img
                        src={card.image}
                        alt={card.imageAlt}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        className="w-full h-auto object-contain max-h-[170px] drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
                      />
                    </div>

                    <div className="flex flex-col justify-center space-y-1.5 min-w-0">
                      <span
                        className={[
                          'text-[10px] font-black tracking-[0.2em]',
                          isBonus ? 'text-orange-400' : 'text-slate-300',
                        ].join(' ')}
                      >
                        {card.tag}
                      </span>
                      <h4 className="font-bold text-base sm:text-lg leading-tight text-white">
                        {card.title}
                      </h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-8 lg:self-start">
            <div className="relative">
              <div className="absolute -inset-4 bg-orange-600/20 blur-[60px] rounded-full opacity-50"></div>

              <div className="relative bg-white text-slate-950 rounded-[32px] p-7 shadow-2xl overflow-hidden">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="inline-flex items-center text-[11px] font-black tracking-[0.3em] uppercase text-orange-600">
                      {section?.texts.planBadge || 'Plano de Acesso'}
                    </span>
                    <h3 className="text-[22px] font-black text-slate-900 mt-1.5">{section?.texts.planTitle || 'Oferta Especial'}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-slate-500" />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="space-y-1">
                    <p className="text-slate-400 text-[15px] font-bold line-through">{section?.texts.priceFrom || 'De R$ 997,00 por apenas:'}</p>
                    <div className="flex flex-col">
                      <div className="flex items-start">
                        <span className="text-lg font-bold mt-1.5 mr-1">{section?.texts.priceInstallments || '12x de'}</span>
                        <div className="flex items-start">
                          <span className="text-xl font-black mt-1.5">R$</span>
                          <span className="text-[80px] font-black tracking-tighter leading-none">{section?.texts.priceValue || '61'}</span>
                          <span className="text-xl font-black mt-1.5">{section?.texts.priceCents || ',38'}</span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-[15px] font-medium mt-1.5">
                        {section?.texts.priceUpfront || 'Ou R$ 597,00 à vista no PIX'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href={globalSettings.purchaseLink || '#oferta'}
                    target={globalSettings.purchaseLink ? '_blank' : undefined}
                    rel={globalSettings.purchaseLink ? 'noopener noreferrer' : undefined}
                    onClick={trackBuyClick}
                    className="relative w-full group overflow-hidden bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-600/30 transition-all duration-300 active:scale-[0.98] flex items-center justify-center min-h-[44px]"
                  >
                    <div className="relative z-10 flex items-center gap-3">
                      <span className="text-[17px] uppercase tracking-tight text-center leading-tight">
                        {id === 'oferta-final' ? (section?.texts.finalCtaButton || 'DESBLOQUEAR CONTEÚDO COMPLETO') : (section?.texts.ctaButton || 'ACESSAR O MANUAL AGORA')}
                      </span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </a>

                  <div className="flex flex-col gap-2 pt-3">
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-[11px] uppercase tracking-tight">
                      <CheckCircle2 size={17} className="text-green-600 shrink-0" />
                      {section?.texts.benefit1 || 'Liberação imediata no seu e-mail'}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-[11px] uppercase tracking-tight">
                      <ShieldCheck size={17} className="text-blue-600 shrink-0" />
                      {section?.texts.benefit2 || 'Checkout 100% criptografado'}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-[11px] uppercase tracking-tight">
                      <LockIcon size={17} className="text-blue-600 shrink-0" />
                      {section?.texts.benefit3 || 'Acesso Imediato'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-center gap-6">
                    <img
                      src={section?.images.guarantee || '/assets/Garantia.png'}
                      alt="7 dias de garantia"
                      className="w-full max-w-[70px] h-auto"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-3.5">
                    <img src={section?.images.visa || '/assets/Visa.png'} alt="Visa" className="h-6 w-auto object-contain" />
                    <img src={section?.images.mastercard || '/assets/Mastercard.png'} alt="Mastercard" className="h-6 w-auto object-contain" />
                    <img src={section?.images.pix || '/assets/Pix.png'} alt="PIX" className="h-6 w-auto object-contain" />
                    <img src={section?.images.boleto || '/assets/Boleto.png'} alt="Boleto" className="h-6 w-auto object-contain" />
                  </div>

                  <div className="pt-1 flex justify-center">
                    <img
                      src={section?.images.securePurchase || '/assets/Compra segura.png'}
                      alt="Compra Segura"
                      className="max-w-[240px] h-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
