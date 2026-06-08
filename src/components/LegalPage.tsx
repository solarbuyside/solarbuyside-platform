import React from 'react'
import { ChevronLeft } from 'lucide-react'

type LegalSection = {
  heading?: string
  paragraphs: React.ReactNode[]
  list?: React.ReactNode[]
}

type LegalPageProps = {
  title: string
  sections: LegalSection[]
}

export const LegalPage: React.FC<LegalPageProps> = ({ title, sections }) => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0B1120] via-[#0A1730] to-[#020617] text-slate-200">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-orange-500 transition-colors"
        >
          <ChevronLeft size={18} />
          Voltar
        </a>

        <h1 className="mt-6 text-[44px] sm:text-[50px] md:text-[50px] font-black text-orange-500 leading-[1.05]">
          {title}
        </h1>

        <div className="mt-10 space-y-10">
          {sections.map((section, index) => (
            <section key={`${title}-${index}`} className="space-y-4">
              {section.heading && (
                <h2 className="text-2xl md:text-3xl font-bold text-white">{section.heading}</h2>
              )}
              {section.paragraphs.map((paragraph, pIndex) => (
                <p key={`${title}-${index}-${pIndex}`} className="text-slate-300 leading-relaxed text-base md:text-lg text-justify">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="list-disc list-inside space-y-2 text-slate-300 text-base md:text-lg text-justify">
                  {section.list.map((item, itemIndex) => (
                    <li key={`${title}-${index}-list-${itemIndex}`}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
