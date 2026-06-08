import React, { useState } from 'react'
import { Mail, CheckCircle2 } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { trackNewsletterSubscribe } from '../utils/analytics'

export const NewsletterSection: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('newsletter')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    // Optimistic UI: show success immediately, backend runs async.
    // Render free tier cold-starts; awaiting blocks UX for 30-60s on first hit.
    const submittedEmail = email
    setSubmitted(true)
    setEmail('')
    trackNewsletterSubscribe()
    setTimeout(() => setSubmitted(false), 5000)

    // Fire-and-forget. keepalive lets the request finish even if the user
    // closes the tab or navigates away before the backend responds (Render
    // free tier can cold-start for ~30-60s). Without it the browser cancels
    // the in-flight request and the lead is silently lost.
    fetch(`/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: submittedEmail }),
      keepalive: true,
    }).catch((err) => console.error('[newsletter] background submit failed:', err))
  }

  return (
    <section className="bg-white lp-section-tight px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-[#FDFBF9] via-[#FFFFFF] to-[#FAF8F5] rounded-[2.5rem] p-8 md:p-12 shadow-lg relative overflow-hidden border border-orange-100/30">
          {/* Efeito de fundo */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGOTczMTYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0YzMuMzEzIDAgNi00LjAyNSA2LThzLTIuNjg3LTgtNi04LTYgNC4wMjUtNiA4IDIuNjg3IDggNiA4em0tMTggMGMzLjMxMyAwIDYtNC4wMjUgNi04cy0yLjY4Ny04LTYtOC02IDQuMDI1LTYgOCAyLjY4NyA4IDYgOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-25"></div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F97316]/5 rounded-2xl mb-4 border border-[#F97316]/15">
                <Mail className="w-8 h-8 text-[#F97316]" />
              </div>
              <h2 className="lp-title font-bold text-[#1D1D1F] mb-4">
                {section?.texts.title || (
                  <>
                    Fique por dentro das <span className="text-[#F97316]">novidades</span>
                  </>
                )}
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                {section?.texts.subtitle || 'Cadastre seu e-mail para receber lançamentos exclusivos, atualizações e conteúdos sobre o mercado solar.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={section?.texts.placeholder || 'seu@email.com'}
                  required
                  disabled={submitted}
                  className="flex-1 px-6 py-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]/50 disabled:opacity-50 transition-all"
                />
                <button
                  type="submit"
                  disabled={submitted}
                  className={`px-8 py-4 rounded-xl font-bold transition-all shadow-md ${
                    submitted
                      ? 'bg-green-500 text-white cursor-default'
                      : 'bg-[#F97316] text-white hover:bg-[#FF8C3A] active:scale-95 shadow-[#F97316]/10'
                  }`}
                >
                  {submitted ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      {section?.texts.successButton || 'Cadastrado!'}
                    </span>
                  ) : (
                    section?.texts.ctaButton || 'Cadastrar'
                  )}
                </button>
              </div>
              {submitted && (
                <p className="text-center text-slate-800 text-sm mt-4 font-medium">
                  {section?.texts.successMessage || 'E-mail cadastrado com sucesso! Fique atento às novidades.'}
                </p>
              )}
            </form>

            <p className="text-center text-slate-400 text-xs mt-6">
              {section?.texts.privacyNote || '🔒 Seus dados estão seguros conosco. Não compartilhamos com terceiros.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
