import React, { useState } from 'react'
import {
  ArrowUpRight,
  ChevronDown,
  HelpCircle,
} from 'lucide-react'
import { useContent } from '../contexts/ContentContext'

const WhatsAppIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12 2a9.96 9.96 0 0 0-8.53 15.16L2 22l4.97-1.41A9.96 9.96 0 1 0 12 2Zm0 18.2c-1.55 0-3.07-.41-4.41-1.18l-.32-.19-2.95.84.83-2.88-.21-.33A8.17 8.17 0 1 1 12 20.2Zm4.78-6.08c-.26-.13-1.53-.75-1.77-.84-.24-.09-.42-.13-.6.13-.18.26-.69.84-.85 1.02-.16.18-.31.2-.57.07-.26-.13-1.1-.4-2.1-1.28-.78-.7-1.31-1.56-1.46-1.82-.15-.26-.02-.4.11-.53.12-.12.26-.31.39-.47.13-.16.18-.26.26-.44.09-.18.04-.33-.02-.47-.07-.13-.6-1.44-.82-1.97-.22-.54-.45-.46-.6-.47h-.51c-.18 0-.47.07-.71.33-.24.26-.94.92-.94 2.25s.96 2.61 1.1 2.79c.13.18 1.88 2.88 4.55 4.03.64.27 1.13.43 1.52.55.64.2 1.23.17 1.69.1.52-.08 1.53-.63 1.75-1.23.22-.6.22-1.12.16-1.23-.07-.11-.24-.18-.5-.31Z" />
  </svg>
)

export const FAQSection: React.FC = () => {
  const { getSection, globalSettings } = useContent()
  const section = getSection('faq')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Criar array de FAQs a partir do CMS
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

  // Função para criar link do WhatsApp
  const getWhatsAppLink = () => {
    const number = globalSettings.whatsappNumber || ''
    return `https://wa.me/${number}?text=Tenho dúvidas sobre o Manual Solar Buy-Side`
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <section id="faq" className="font-sans bg-[#fbfbfd] text-[#1d1d1f]">
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-5xl font-black tracking-tighter leading-none">
                {section?.texts.title || 'Ficou com dúvidas?'}
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] text-white font-bold rounded-2xl hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/20 active:scale-95 group"
              >
                <WhatsAppIcon size={20} />
                <span>{section?.texts.ctaButton || 'Fale com a equipe Buy-Side'}</span>
                <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="text-orange-600" size={24} />
              <h3 className="text-2xl font-black tracking-tight">{section?.texts.sectionTitle || 'Perguntas Frequentes'}</h3>
            </div>

            {faqData.map((item, index) => {
              const hasAnswer = Boolean(item.answer && item.answer.trim())
              const isOpen = hasAnswer && openFaq === index
              return (
                <div
                  key={item.question}
                  className={`group border rounded-2xl transition-all duration-300 ${
                    isOpen ? 'bg-white border-orange-200 shadow-sm' : 'bg-transparent border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <button
                    onClick={() => hasAnswer && toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left"
                    type="button"
                    aria-expanded={isOpen}
                    disabled={!hasAnswer}
                  >
                    <span
                      className={`text-lg font-bold transition-colors ${
                        isOpen ? 'text-orange-600' : 'text-[#1d1d1f]'
                      }`}
                    >
                      {item.question}
                    </span>
                    {hasAnswer && (
                      <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-orange-600' : ''
                        }`}
                      />
                    )}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[5000px]' : 'max-h-0'}`}>
                    <div className="p-5 pt-0 text-[#6e6e73] leading-relaxed whitespace-pre-line text-justify max-h-[600px] overflow-y-auto">
                      {item.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
