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
import { Reveal } from './atoms'

/* ── Lead magnet (teaser gratuito) ─────────────────────────────────────── */
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
    <section className="relative w-full overflow-hidden bg-white px-6 py-20 text-slate-900 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:38px_38px]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-24 top-[-10%] h-[460px] w-[460px] rounded-full bg-orange-100/50 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -left-24 bottom-[-10%] h-[400px] w-[400px] rounded-full bg-blue-50/60 blur-[100px]" aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-14">
          <div className="flex-[1.2] space-y-7">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-orange-700">
                <Zap size={13} fill="currentColor" />
                {section?.texts.badge || 'Conteúdo Exclusivo'}
              </span>
            </Reveal>

            <Reveal delay={90}>
              <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 md:text-5xl">
                {section?.texts.title || 'Ainda com'}{' '}
                <span className="v4-grad-text">{section?.texts.titleHighlight || 'dúvidas?'}</span>
              </h2>
            </Reveal>

            <Reveal delay={170}>
              <p className="max-w-xl text-xl font-medium leading-relaxed text-slate-500 md:text-2xl">
                {section?.texts.subtitle ||
                  'Garanta agora seu teaser grátuito do Código do Vendedor Consultivo e comece a vender decisão, não preço! '}
              </p>
            </Reveal>

            {/* Imagem no mobile */}
            <Reveal className="flex items-center justify-center lg:hidden">
              <img
                src="/assets/foto-o-codigo-do-vendedor.png"
                alt="E-book Solar Buy-Side"
                className="h-auto w-[480px] max-w-full"
                loading="lazy"
              />
            </Reveal>

            <div className="grid gap-3.5 pt-1">
              {features.map((feature, idx) => (
                <Reveal key={feature.title} delay={idx * 80}>
                  <div className="group flex cursor-default items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white text-orange-500 shadow-sm transition-all duration-300 group-hover:border-orange-200 group-hover:shadow-md">
                      <feature.Icon size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-orange-600">
                      {feature.title}
                    </h3>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={140} className="pt-2">
              <button
                className="v4-cta-shine group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-slate-900 px-10 py-4 font-bold text-white shadow-[0_24px_48px_-18px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_24px_48px_-14px_rgba(249,115,22,0.5)] active:scale-95"
                onClick={() => setShowModal(true)}
                type="button"
              >
                <span className="relative z-10 mr-3">{section?.texts.ctaButton || 'Baixar Teaser Gratuito'}</span>
                <Download size={20} className="relative z-10 transition-transform group-hover:translate-y-0.5" />
              </button>
              <p className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                <CheckCircle2 size={14} className="text-emerald-500" />
                {section?.texts.ctaSubtext || 'PDF Interativo • 5 páginas • Acesso imediato'}
              </p>
            </Reveal>
          </div>

          {/* Imagem no desktop */}
          <Reveal delay={160} className="hidden flex-1 items-center justify-center lg:flex">
            <div className="group relative">
              <div
                className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/40 blur-[100px]"
                aria-hidden
              />
              <img
                src="/assets/foto-o-codigo-do-vendedor.png"
                alt="E-book Solar Buy-Side"
                className="relative h-auto w-[520px] max-w-full transition-transform duration-700 ease-out group-hover:scale-[1.03] group-hover:-rotate-1"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="v4-rise relative w-full max-w-md rounded-3xl bg-white shadow-2xl">
            <button
              onClick={() => {
                setShowModal(false)
                setSubmitted(false)
              }}
              className="absolute right-4 top-4 flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-slate-900 transition-colors hover:text-orange-600"
              type="button"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>

            <div className="p-8 sm:p-10">
              {!submitted ? (
                <>
                  <h3 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900">
                    {section?.texts.modalTitle || 'Baixe seu E-book'}
                  </h3>
                  <p className="mb-6 text-base text-slate-500">
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
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-colors focus:border-orange-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Sobrenome"
                        value={formData.sobrenome}
                        onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                        required
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-colors focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <input
                      type="email"
                      placeholder="E-mail"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-colors focus:border-orange-500 focus:outline-none"
                    />

                    <input
                      type="tel"
                      placeholder="Celular"
                      value={formData.celular}
                      onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-colors focus:border-orange-500 focus:outline-none"
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
                  <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {section?.texts.successTitle || 'Cadastro recebido!'}
                  </h3>
                  <p className="text-slate-500">
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
        'Para solicitar o reembolso dentro do prazo de 7 dias, entre em contato com nossa equipe pelo WhatsApp informando o e-mail utilizado na compra e o motivo (opcional). O estorno é processado em até 7 dias úteis, na mesma forma de pagamento utilizada — cartão, PIX ou boleto.',
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
    <section className="bg-[#fafaf8] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="grid items-start gap-14 lg:grid-cols-2">
          <div className="space-y-7 lg:sticky lg:top-28">
            <Reveal>
              <h2 className="text-4xl font-extrabold leading-none tracking-tight md:text-5xl">
                {section?.texts.title || 'Ficou com dúvidas?'}
              </h2>
            </Reveal>

            <Reveal delay={120}>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-8 py-4 font-bold text-white shadow-[0_18px_40px_-14px_rgba(37,211,102,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#20bd5a] active:scale-95"
              >
                <WhatsAppIcon size={20} />
                <span>{section?.texts.ctaButton || 'Fale com a equipe Buy-Side'}</span>
                <ArrowUpRight size={18} className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </a>
            </Reveal>
          </div>

          <div className="space-y-3.5">
            <Reveal className="mb-5 flex items-center gap-2.5">
              <HelpCircle className="text-orange-600" size={22} />
              <h3 className="text-2xl font-extrabold tracking-tight">{section?.texts.sectionTitle || 'Perguntas Frequentes'}</h3>
            </Reveal>

            {faqData.map((item, index) => {
              const hasAnswer = Boolean(item.answer && item.answer.trim())
              const isOpen = hasAnswer && openFaq === index
              return (
                <Reveal key={item.question} delay={index * 90}>
                  <div
                    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                      isOpen
                        ? 'border-orange-200 bg-white shadow-[0_20px_44px_-26px_rgba(249,115,22,0.4)]'
                        : 'border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <button
                      onClick={() => hasAnswer && toggleFaq(index)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6"
                      type="button"
                      aria-expanded={isOpen}
                      disabled={!hasAnswer}
                    >
                      <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-orange-600' : 'text-slate-900'}`}>
                        {item.question}
                      </span>
                      {hasAnswer && (
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                            isOpen ? 'rotate-180 border-orange-200 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-400'
                          }`}
                        >
                          <ChevronDown size={16} />
                        </span>
                      )}
                    </button>
                    <div className={`v4-faq-body ${isOpen ? 'open' : ''}`}>
                      <div>
                        <p className="max-h-[600px] overflow-y-auto whitespace-pre-line p-5 pt-0 leading-relaxed text-slate-500 md:p-6 md:pt-0">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Newsletter ────────────────────────────────────────────────────────── */
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
    <section className="bg-white px-6 py-16 md:py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#060b1a] p-9 shadow-[0_50px_100px_-50px_rgba(2,6,23,0.8)] md:p-14">
            {/* Atmosfera do card */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-[90px]" />
              <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-blue-600/15 blur-[90px]" />
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
            </div>

            <div className="relative z-10">
              <div className="mb-9 text-center">
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/10">
                  <Mail className="h-7 w-7 text-orange-500" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  {section?.texts.title || (
                    <>
                      Fique por dentro das <span className="v4-grad-text">novidades</span>
                    </>
                  )}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
                  {section?.texts.subtitle ||
                    'Cadastre seu e-mail para receber lançamentos exclusivos, atualizações e conteúdos sobre o mercado solar.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mx-auto max-w-md">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={section?.texts.placeholder || 'seu@email.com'}
                    required
                    disabled={submitted}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-6 py-4 text-white placeholder-slate-500 backdrop-blur-sm transition-all focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={submitted}
                    className={`rounded-xl px-8 py-4 font-bold transition-all duration-300 ${
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
                  <p className="mt-4 text-center text-sm font-medium text-slate-300">
                    {section?.texts.successMessage || 'E-mail cadastrado com sucesso! Fique atento às novidades.'}
                  </p>
                )}
              </form>

              <p className="mt-7 text-center text-xs text-slate-500">
                {section?.texts.privacyNote || '🔒 Seus dados estão seguros conosco. Não compartilhamos com terceiros.'}
              </p>
            </div>
          </div>
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
    <section id="contact" className="relative overflow-hidden bg-white px-6 pb-20 pt-4 md:pb-24">
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              {section?.texts.title || (
                <>
                  DADOS E <span className="text-orange-500">CONTATOS</span>
                </>
              )}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-3 max-w-3xl text-base text-slate-500 md:text-lg">
              {section?.texts.subtitle || 'Transparência e clareza para você entrar em contato com total confiança.'}
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-slate-50 to-white p-8 shadow-[0_36px_80px_-50px_rgba(15,23,42,0.35)] md:p-12">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {section?.texts.companyName || (
                      <>
                        <span className="text-orange-500">Buy-Side</span> Soluções
                      </>
                    )}
                  </h3>
                </div>
                <p className="text-sm text-slate-500">
                  {section?.texts.cnpjLabel || 'CNPJ:'}{' '}
                  <span className="font-semibold text-slate-800">{section?.texts.cnpjValue || '55.463.06/0001-80'}</span>
                </p>

                <div className="mt-7 flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-orange-500" />
                  <div className="text-slate-600">
                    <p className="font-semibold text-slate-800">
                      {section?.texts.addressLine1 || 'Torre Norte - Av. Bento Munhoz da Rocha Neto, 632'}
                    </p>
                    <p>{section?.texts.addressLine2 || '19º Andar, Salas 1905 a 1908 - Zona 7,'}</p>
                    <p>{section?.texts.addressLine3 || 'Maringá - PR, 87030-010'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center border-t border-slate-100 pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="mb-0.5 text-sm text-slate-500">{section?.texts.emailLabel || 'E-mail:'}</p>
                    <a
                      href={`mailto:${email}`}
                      className="text-lg font-semibold text-orange-600 underline decoration-orange-300 underline-offset-4 transition-colors hover:text-orange-500"
                    >
                      {email}
                    </a>
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

/* ── Footer ────────────────────────────────────────────────────────────── */
export const FooterV4: React.FC = () => {
  const { globalAssets } = useContent()

  return (
    <footer className="border-t border-white/[0.06] bg-[#02050f] px-8 py-8 text-white">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 lg:flex-row">
        <div className="flex items-center gap-3">
          <img
            src={globalAssets.logo || '/assets/LOGOSOLARBUYSIDE3.png'}
            alt="Solar Buy-Side"
            className="h-12 w-auto"
            onError={(e) => {
              e.currentTarget.src = '/assets/LOGOSOLARBUYSIDE3.png'
            }}
          />
          <div className="flex items-baseline gap-1 whitespace-nowrap leading-tight">
            <span className="text-base font-bold tracking-tight text-white">Solar</span>
            <span className="text-base font-bold tracking-tight text-orange-500">Buy-Side</span>
          </div>
        </div>

        <nav className="flex flex-col items-center gap-4 text-sm font-semibold text-white/60 sm:flex-row sm:gap-7">
          <a href="/politica-de-privacidade" className="transition-colors hover:text-orange-400">
            Política de Privacidade
          </a>
          <a href="/termos-de-uso" className="transition-colors hover:text-orange-400">
            Termos de Uso
          </a>
          <a href="/medidas-antipiratarias" className="transition-colors hover:text-orange-400">
            Medidas Antipiratarias
          </a>
        </nav>
      </div>
    </footer>
  )
}
