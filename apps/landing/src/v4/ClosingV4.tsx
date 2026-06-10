import React, { useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Download,
  HelpCircle,
  Layers,
  ListChecks,
  Mail,
  MapPin,
  Scale,
  X,
  Zap,
} from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { trackEbookDownload, trackNewsletterSubscribe } from '../utils/analytics'
import { Cta, GrainOverlay, Reveal } from './atoms'

/* ── Lead magnet (teaser gratuito) — "THE UNLOCK" ──────────────────────── */
export const LeadMagnetV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('lead-magnet')

  const features = [
    { title: section?.texts.feature1 || 'Veja o processo de compra pelos olhos do cliente', Icon: AlertTriangle },
    { title: section?.texts.feature2 || 'Aprenda a conduzir o comprador até a decisão certa', Icon: Layers },
    { title: section?.texts.feature3 || 'Blindagem contra o leilão reverso de preços', Icon: Scale },
    { title: section?.texts.feature4 || 'Método exclusivo Buy-Side para o mercado solar brasileiro', Icon: ListChecks },
  ]

  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ nome: '', sobrenome: '', email: '', celular: '' })
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#07090d] to-[#0b0907] px-6 py-24 text-white">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-white/[0.02]">
        <div className="relative z-10 grid lg:grid-cols-2">
          {/* Coluna esquerda — conteúdo */}
          <div className="p-10 md:p-14">
            <Reveal>
              <span className="v4-mono inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">
                <Zap size={13} fill="currentColor" />
                {section?.texts.badge || 'Conteúdo Exclusivo'}
              </span>
            </Reveal>

            <Reveal delay={90}>
              <h2 className="mt-6 font-['Sora'] text-[clamp(2.2rem,4.5vw,3.6rem)] font-extrabold leading-[1.06] tracking-tight text-white">
                {section?.texts.title || 'Ainda com'}{' '}
                <span className="v4-serif text-orange-400">{section?.texts.titleHighlight || 'dúvidas?'}</span>
              </h2>
            </Reveal>

            <Reveal delay={170}>
              <p className="mt-5 text-xl leading-relaxed text-slate-300">
                {section?.texts.subtitle ||
                  'Garanta agora seu teaser grátuito do Código do Vendedor Consultivo e comece a vender decisão, não preço! '}
              </p>
            </Reveal>

            {/* Imagem no mobile */}
            <Reveal className="mt-8 flex items-center justify-center lg:hidden">
              <img
                src="/assets/foto-o-codigo-do-vendedor.png"
                alt="E-book Solar Buy-Side"
                className="h-auto w-[300px] max-w-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.55)]"
                loading="lazy"
              />
            </Reveal>

            <ul className="mt-8">
              {features.map((feature, idx) => (
                <Reveal
                  key={feature.title}
                  delay={idx * 80}
                  as="li"
                  className="group flex items-center gap-4 border-b border-white/[0.06] py-4"
                >
                  <feature.Icon size={18} className="shrink-0 text-orange-500" />
                  <h3 className="font-['Sora'] text-base font-semibold text-white transition-colors group-hover:text-orange-300 md:text-lg">
                    {feature.title}
                  </h3>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={140} className="mt-8">
              <Cta size="lg" onClick={() => setShowModal(true)}>
                {section?.texts.ctaButton || 'Baixar Teaser Gratuito'}
                <Download size={20} />
              </Cta>
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 size={14} className="text-emerald-500" />
                {section?.texts.ctaSubtext || 'PDF Interativo • 5 páginas • Acesso imediato'}
              </p>
            </Reveal>
          </div>

          {/* Coluna direita — livro no desktop */}
          <div className="relative hidden min-h-[380px] items-center justify-center lg:flex">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(circle at 50% 42%, rgba(251,191,36,0.14) 0%, transparent 65%)' }}
              aria-hidden
            />
            <div className="relative">
              <img
                src="/assets/foto-o-codigo-do-vendedor.png"
                alt="E-book Solar Buy-Side"
                className="v4-float relative z-10 h-auto w-[380px] max-w-full drop-shadow-[0_44px_64px_rgba(0,0,0,0.65)]"
                loading="lazy"
              />
              {/* Elipse de luz no chão */}
              <div
                className="absolute -bottom-7 left-1/2 h-10 w-[72%] -translate-x-1/2 rounded-full bg-orange-500/20 blur-2xl"
                aria-hidden
              />
            </div>
          </div>
        </div>
        <GrainOverlay />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur">
          <div className="v4-rise relative w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0d0b09] shadow-2xl">
            <button
              onClick={() => {
                setShowModal(false)
                setSubmitted(false)
              }}
              className="absolute right-4 top-4 flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-slate-400 transition-colors hover:text-orange-400"
              type="button"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>

            <div className="p-8 sm:p-10">
              {!submitted ? (
                <>
                  <h3 className="mb-2 font-['Sora'] text-2xl font-extrabold tracking-tight text-white">
                    {section?.texts.modalTitle || 'Baixe seu E-book'}
                  </h3>
                  <p className="mb-6 text-base text-slate-400">
                    {section?.texts.modalSubtitle || 'Preencha seus dados para receber o E-book Manual Solar Buy-Side'}
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()

                      // Optimistic UI: success state shown instantly. Render free
                      // tier cold-starts on idle (~30-60s); awaiting blocks the
                      // user for that whole window. Backend save + Brevo email
                      // happen in background; failure is silent (logged only).
                      const payload = { ...formData }
                      trackEbookDownload()
                      setSubmitted(true)

                      // keepalive lets the request finish even if the user
                      // closes the modal/tab before the backend responds.
                      fetch(`/api/ebook/lead`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        keepalive: true,
                      }).catch((err) => console.error('[ebook] background submit failed:', err))
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                        className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-orange-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Sobrenome"
                        value={formData.sobrenome}
                        onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                        required
                        className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <input
                      type="email"
                      placeholder="E-mail"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-orange-500 focus:outline-none"
                    />

                    <input
                      type="tel"
                      placeholder="Celular"
                      value={formData.celular}
                      onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-orange-500 focus:outline-none"
                    />

                    <button
                      type="submit"
                      className="mt-6 min-h-[44px] w-full rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 py-4 font-bold text-white shadow-[0_14px_30px_-10px_rgba(249,115,22,0.6)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      {section?.texts.ctaButton || 'Baixar E-book Gratuito'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="mb-4 flex justify-center">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                  <h3 className="font-['Sora'] text-2xl font-extrabold tracking-tight text-white">
                    {section?.texts.successTitle || 'Cadastro recebido!'}
                  </h3>
                  <p className="text-slate-400">
                    {section?.texts.successMessage ||
                      'Esta funcionalidade está em produção. Assim que estiver disponível, você receberá o teaser do Código do Vendedor Consultivo no e-mail cadastrado.'}
                  </p>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSubmitted(false)
                    }}
                    className="mt-6 min-h-[44px] w-full rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 py-4 font-bold text-white transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                    type="button"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/* ── FAQ ───────────────────────────────────────────────────────────────── */
const WhatsAppIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2a9.96 9.96 0 0 0-8.53 15.16L2 22l4.97-1.41A9.96 9.96 0 1 0 12 2Zm0 18.2c-1.55 0-3.07-.41-4.41-1.18l-.32-.19-2.95.84.83-2.88-.21-.33A8.17 8.17 0 1 1 12 20.2Zm4.78-6.08c-.26-.13-1.53-.75-1.77-.84-.24-.09-.42-.13-.6.13-.18.26-.69.84-.85 1.02-.16.18-.31.2-.57.07-.26-.13-1.1-.4-2.1-1.28-.78-.7-1.31-1.56-1.46-1.82-.15-.26-.02-.4.11-.53.12-.12.26-.31.39-.47.13-.16.18-.26.26-.44.09-.18.04-.33-.02-.47-.07-.13-.6-1.44-.82-1.97-.22-.54-.45-.46-.6-.47h-.51c-.18 0-.47.07-.71.33-.24.26-.94.92-.94 2.25s.96 2.61 1.1 2.79c.13.18 1.88 2.88 4.55 4.03.64.27 1.13.43 1.52.55.64.2 1.23.17 1.69.1.52-.08 1.53-.63 1.75-1.23.22-.6.22-1.12.16-1.23-.07-.11-.24-.18-.5-.31Z" />
  </svg>
)

export const FAQV4: React.FC = () => {
  const { getSection, globalSettings } = useContent()
  const section = getSection('faq')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqData = [
    {
      question: section?.texts.faq1Question || 'Como acessar meu produto?',
      answer:
        section?.texts.faq1Answer ||
        'Após a confirmação do pagamento, você receberá um e-mail automático com o acesso ao Manual Solar Buy-Side em até alguns minutos. Caso não localize o e-mail na caixa de entrada, verifique também as pastas de spam e promoções. Em caso de dúvida, fale diretamente com nossa equipe pelo WhatsApp.',
    },
    {
      question: section?.texts.faq2Question || 'Como funciona o prazo de garantia e a solicitação de devolução?',
      answer:
        section?.texts.faq2Answer ||
        'Você tem até 7 dias corridos após a confirmação do pagamento para solicitar o reembolso integral, sem necessidade de justificativa, conforme prevê o Código de Defesa do Consumidor (art. 49). Esse é o nosso compromisso de garantia incondicional: se o conteúdo não for o que você esperava, basta nos avisar dentro do prazo.',
    },
    {
      question: section?.texts.faq3Question || 'Política de devolução: como proceder para o reembolso?',
      answer:
        section?.texts.faq3Answer ||
        'Para solicitar o reembolso dentro do prazo de 7 dias, entre em contato com nossa equipe pelo WhatsApp informando o e-mail utilizado na compra e o motivo (opcional). O estorno é processado em até 7 dias úteis, na mesma forma de pagamento utilizada: cartão, PIX ou boleto.',
    },
    {
      question: section?.texts.faq4Question || 'Preciso ter conhecimento técnico para aproveitar o Manual?',
      answer:
        section?.texts.faq4Answer ||
        'Não. O Manual foi escrito para orientar decisões, não para formar engenheiros. Os 160 tópicos são organizados para consulta rápida, em linguagem direta, e os anexos técnicos aprofundam quem quiser ir além. Vendedores iniciantes e compradores leigos acompanham sem dificuldade.',
    },
    {
      question: section?.texts.faq5Question || 'Em que formato recebo o material?',
      answer:
        section?.texts.faq5Answer ||
        'O Manual Solar Buy-Side e o Código do Vendedor Consultivo chegam em PDF interativo, com índice navegável. Você lê no celular, tablet ou computador, online ou offline. O link de acesso chega no e-mail cadastrado logo após a confirmação do pagamento.',
    },
    {
      question: section?.texts.faq6Question || 'Como funciona o acesso à Plataforma de Avaliação de Propostas?',
      answer:
        section?.texts.faq6Answer ||
        'A compra do Manual libera automaticamente o acesso à plataforma por 6 meses. Nela você compara propostas de fornecedores lado a lado, com pontuação por reputação, tecnologia e viabilidade e o Índice de Confiabilidade de 0 a 100.',
    },
    {
      question: section?.texts.faq7Question || 'Posso comprar para a minha equipe comercial?',
      answer:
        section?.texts.faq7Answer ||
        'Sim. A oferta inclui a Licença de Uso Coletiva: até 10 cópias para o mesmo CNPJ, pagando uma única vez. É o formato pensado para integradoras que querem padronizar a abordagem do time inteiro.',
    },
  ]

  const getWhatsAppLink = () => {
    const number = globalSettings.whatsappNumber || ''
    return `https://wa.me/${number}?text=Tenho dúvidas sobre o Manual Solar Buy-Side`
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <section className="bg-[#07090d] px-6 py-24 text-white">
      <div className="mx-auto max-w-3xl">
        <Reveal className="flex justify-center">
          <span className="v4-mono flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.3em] text-orange-400">
            <HelpCircle size={18} />
            {section?.texts.sectionTitle || 'Perguntas Frequentes'}
          </span>
        </Reveal>

        <Reveal delay={90}>
          <h2 className="mt-4 text-center font-['Sora'] text-[clamp(2.4rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-white">
            {section?.texts.title || 'Ficou com dúvidas?'}
          </h2>
        </Reveal>

        <div className="mt-12">
          {faqData.map((item, index) => {
            const hasAnswer = Boolean(item.answer && item.answer.trim())
            const isOpen = hasAnswer && openFaq === index
            return (
              <Reveal key={item.question} delay={index * 90}>
                <div className="border-b border-white/[0.08]">
                  <button
                    onClick={() => hasAnswer && toggleFaq(index)}
                    className="flex w-full items-center gap-5 py-7 text-left"
                    type="button"
                    aria-expanded={isOpen}
                    disabled={!hasAnswer}
                  >
                    <span className="v4-mono shrink-0 text-sm text-orange-500/60">0{index + 1}</span>
                    <span
                      className={`flex-1 font-['Sora'] text-lg font-bold transition-colors md:text-xl ${
                        isOpen ? 'text-orange-400' : 'text-white'
                      }`}
                    >
                      {item.question}
                    </span>
                    {hasAnswer && (
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-slate-400 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        <ChevronDown size={16} />
                      </span>
                    )}
                  </button>
                  <div className={`v4-faq-body ${isOpen ? 'open' : ''}`}>
                    <div>
                      <p className="whitespace-pre-line pb-7 leading-relaxed text-slate-400">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={120} className="mt-14 flex justify-center">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-full bg-[#25D366] px-9 py-4 font-bold text-white shadow-[0_18px_40px_-14px_rgba(37,211,102,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#20bd5a]"
          >
            <WhatsAppIcon size={20} />
            <span>{section?.texts.ctaButton || 'Fale com a equipe Buy-Side'}</span>
            <ArrowUpRight size={18} className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
          </a>
        </Reveal>
      </div>
    </section>
  )
}

/* ── Newsletter (faixa inline) ─────────────────────────────────────────── */
export const NewsletterV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('newsletter')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    // Optimistic UI: show success immediately, backend runs async.
    const submittedEmail = email
    setSubmitted(true)
    setEmail('')
    trackNewsletterSubscribe()
    setTimeout(() => setSubmitted(false), 5000)

    // Fire-and-forget; keepalive preserves the request through navigation.
    fetch(`/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: submittedEmail }),
      keepalive: true,
    }).catch((err) => console.error('[newsletter] background submit failed:', err))
  }

  return (
    <section className="border-y border-white/[0.06] bg-[#0a0907] px-6 py-16 text-white md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Reveal>
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-orange-400">
              <Mail size={18} />
            </span>
          </Reveal>

          <Reveal delay={90}>
            <h2 className="mt-5 font-['Sora'] text-2xl font-extrabold tracking-tight text-white md:text-3xl">
              {section?.texts.title || (
                <>
                  Fique por dentro das <span className="v4-serif text-orange-400">novidades</span>
                </>
              )}
            </h2>
          </Reveal>

          <Reveal delay={170}>
            <p className="mt-3 text-lg text-slate-400">
              {section?.texts.subtitle ||
                'Cadastre seu e-mail para receber lançamentos exclusivos, atualizações e conteúdos sobre o mercado solar.'}
            </p>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-stretch gap-4 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={section?.texts.placeholder || 'seu@email.com'}
                required
                disabled={submitted}
                className="flex-1 rounded-none border-0 border-b border-white/15 bg-transparent px-1 py-4 text-white placeholder-slate-500 transition-colors focus:border-orange-500 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={submitted}
                className={`rounded-full px-8 py-4 font-bold transition-all duration-300 ${
                  submitted
                    ? 'cursor-default bg-emerald-500 text-white'
                    : 'bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-[0_14px_30px_-10px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 active:scale-95'
                }`}
              >
                {submitted ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    {section?.texts.successButton || 'Cadastrado!'}
                  </span>
                ) : (
                  section?.texts.ctaButton || 'Cadastrar'
                )}
              </button>
            </div>
            {submitted && (
              <p className="mt-3 text-sm font-medium text-slate-300">
                {section?.texts.successMessage || 'E-mail cadastrado com sucesso! Fique atento às novidades.'}
              </p>
            )}
            <p className="v4-mono mt-4 text-[10px] text-slate-600">
              {section?.texts.privacyNote || '🔒 Seus dados estão seguros conosco. Não compartilhamos com terceiros.'}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  )
}

/* ── Contato ───────────────────────────────────────────────────────────── */
export const ContactV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('contact')
  const email = section?.texts.emailAddress || 'contato@buyside.com.br'

  return (
    <section id="contact" className="bg-[#07090d] px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <Reveal>
            <h2 className="font-['Sora'] text-2xl font-extrabold tracking-tight text-white md:text-3xl">
              {section?.texts.title || (
                <>
                  Dados e <span className="text-orange-500">contato</span>
                </>
              )}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-3 max-w-3xl text-slate-400">
              {section?.texts.subtitle || 'Transparência e clareza para você entrar em contato com total confiança.'}
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-12 grid overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.015] md:grid-cols-2 md:divide-x md:divide-white/[0.08]">
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange-500/30 text-orange-400">
                  <Building2 size={18} />
                </span>
                <h3 className="font-['Sora'] text-2xl font-bold tracking-tight text-white">
                  {section?.texts.companyName || (
                    <>
                      <span className="text-orange-500">Buy-Side</span> Soluções
                    </>
                  )}
                </h3>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                {section?.texts.cnpjLabel || 'CNPJ:'}{' '}
                <span className="font-semibold text-slate-200">{section?.texts.cnpjValue || '55.463.086/0001-80'}</span>
              </p>

              <div className="mt-7 flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-orange-500" />
                <div className="text-slate-400">
                  <p className="font-semibold text-slate-200">
                    {section?.texts.addressLine1 || 'Torre Norte - Av. Bento Munhoz da Rocha Neto, 632'}
                  </p>
                  <p>{section?.texts.addressLine2 || '19º Andar, Salas 1905 a 1908 - Zona 7,'}</p>
                  <p>{section?.texts.addressLine3 || 'Maringá - PR, 87030-010'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center border-t border-white/[0.08] p-8 md:border-t-0 md:p-12">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange-500/30 text-orange-400">
                  <Mail size={18} />
                </span>
                <div>
                  <p className="mb-0.5 text-sm text-slate-500">{section?.texts.emailLabel || 'E-mail:'}</p>
                  <a
                    href={`mailto:${email}`}
                    className="text-lg font-semibold text-orange-400 underline decoration-orange-500/40 underline-offset-4 transition-colors hover:text-orange-300"
                  >
                    {email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ── Footer — newsletter compacta + mega wordmark ──────────────────────── */
export const FooterV4: React.FC = () => {
  const { globalAssets, getSection } = useContent()
  const newsletter = getSection('newsletter')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    const submittedEmail = email
    setSubscribed(true)
    setEmail('')
    trackNewsletterSubscribe()
    fetch(`/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: submittedEmail }),
      keepalive: true,
    }).catch((err) => console.error('[newsletter] background submit failed:', err))
  }

  return (
    <footer className="overflow-hidden bg-[#050608] px-6 pb-0 pt-20 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Newsletter: uma linha discreta no rodapé, sem competir com o lead magnet */}
        <div id="newsletter" className="flex flex-col gap-5 border-t border-white/[0.06] pt-10 pb-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-['Sora'] text-lg font-bold text-white">
              {newsletter?.texts.title || 'Novidades do mercado solar, direto no e-mail'}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {newsletter?.texts.subtitle || 'Lançamentos, atualizações do Manual e conteúdo sobre o setor.'}
            </p>
          </div>
          <form onSubmit={handleNewsletter} className="flex w-full max-w-md items-stretch gap-3">
            <label htmlFor="footer-newsletter" className="sr-only">
              Seu e-mail
            </label>
            <input
              id="footer-newsletter"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={newsletter?.texts.placeholder || 'seu@email.com'}
              required
              disabled={subscribed}
              className="min-w-0 flex-1 border-b border-white/15 bg-transparent px-1 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-orange-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={subscribed}
              className={`shrink-0 rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 ${
                subscribed
                  ? 'cursor-default bg-emerald-500 text-white'
                  : 'border border-white/15 text-slate-200 hover:border-orange-400/60 hover:text-white'
              }`}
            >
              {subscribed ? (newsletter?.texts.successButton || 'Cadastrado!') : newsletter?.texts.ctaButton || 'Cadastrar'}
            </button>
          </form>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/[0.06] pt-10 sm:flex-row">
          <div className="flex items-center gap-3">
            <img
              src={globalAssets.logo || '/assets/LOGOSOLARBUYSIDE3.png'}
              alt="Solar Buy-Side"
              className="h-10 w-auto"
              onError={(e) => {
                e.currentTarget.src = '/assets/LOGOSOLARBUYSIDE3.png'
              }}
            />
            <div className="flex items-baseline gap-1 whitespace-nowrap leading-tight">
              <span className="text-base font-bold tracking-tight text-white">Solar</span>
              <span className="text-base font-bold tracking-tight text-orange-500">Buy-Side</span>
            </div>
          </div>

          <nav className="flex flex-col items-center gap-4 sm:flex-row sm:gap-7">
            <a
              href="/politica-de-privacidade"
              className="v4-mono text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-orange-400"
            >
              Política de Privacidade
            </a>
            <a
              href="/termos-de-uso"
              className="v4-mono text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-orange-400"
            >
              Termos de Uso
            </a>
            <a
              href="/medidas-antipiratarias"
              className="v4-mono text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-orange-400"
            >
              Medidas Antipiratarias
            </a>
          </nav>
        </div>

        {/* Wordmark gigante desvanecendo no rodapé */}
        <div
          className="mb-[-1vw] mt-14 select-none px-2 text-center leading-[0.9]"
          style={{
            WebkitMaskImage: 'linear-gradient(180deg, black 30%, transparent 96%)',
            maskImage: 'linear-gradient(180deg, black 30%, transparent 96%)',
          }}
          aria-hidden
        >
          {/* cabe inteiro: quebra para a 2ª linha quando não couber numa só */}
          <span className="block font-['Sora'] text-[clamp(2.75rem,9.5vw,8.5rem)] font-extrabold tracking-tight">
            <span className="v4-stroke">Solar </span>
            <span className="v4-grad-text">Buy-Side</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
