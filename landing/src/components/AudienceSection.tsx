import React from 'react'
import { Building2, CheckCircle2, Rocket, Users } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'

const profileIcons = [
  <Building2 className="w-6 h-6 text-blue-500" />,
  <Rocket className="w-6 h-6 text-orange-500" />,
  <Users className="w-6 h-6 text-emerald-500" />,
]

export const AudienceSection: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('audience')

  const profiles = [
    {
      title: section?.texts.profile1Title || 'Empresas de Integração Solar',
      description: section?.texts.profile1Desc || 'Para vender valor, fugir da guerra dos preços e fechar mais projetos.',
      bullets: [
        section?.texts.profile1Bullet1 || 'Vender valor',
        section?.texts.profile1Bullet2 || 'Fechar mais projetos',
      ],
      icon: profileIcons[0],
      tag: section?.texts.profile1Tag || 'ESTRUTURADOS',
    },
    {
      title: section?.texts.profile2Title || 'Empreendedores Iniciantes',
      description: section?.texts.profile2Desc || 'Para construir um negócio sólido desde o primeiro passo na integração solar.',
      bullets: [
        section?.texts.profile2Bullet1 || 'Base sólida',
        section?.texts.profile2Bullet2 || 'Autoridade desde o dia 1',
      ],
      icon: profileIcons[1],
      tag: section?.texts.profile2Tag || 'STARTUPS',
    },
    {
      title: section?.texts.profile3Title || 'Representantes Comerciais',
      description: section?.texts.profile3Desc || 'Para aumentar sua taxa de conversão reduzindo sua taxa de desconto.',
      bullets: [
        section?.texts.profile3Bullet1 || 'Menos desconto',
        section?.texts.profile3Bullet2 || 'Mais conversão',
      ],
      icon: profileIcons[2],
      tag: section?.texts.profile3Tag || 'VENDAS',
    },
  ]

  return (
    <section id="audiencia" className="bg-white text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 antialiased">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="max-w-3xl mb-8">
          <h2 className="text-3xl md:text-[40px] font-black tracking-tight text-slate-900 mb-3">
            {section?.texts.title || 'Quem REALMENTE precisa desse conhecimento?'}
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
            {section?.texts.subtitle || 'Veja para quem o Manual Solar Buy-Side é essencial:'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {profiles.map((profile) => (
            <div
              key={profile.title}
              className="group relative bg-white p-6 rounded-3xl border border-[#d2d2d7]/30 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4 flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-[#f5f5f7] group-hover:bg-white group-hover:shadow-inner transition-colors">
                    {profile.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-[#86868b] uppercase">
                    {profile.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-2 group-hover:text-orange-600 transition-colors">
                  {profile.title}
                </h3>

                <p className="text-[#86868b] font-medium mb-4 leading-relaxed">
                  {profile.description}
                </p>

                <div className="mt-auto space-y-2">
                  {profile.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-500" />
                      <span className="text-base font-semibold text-[#1d1d1f]">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-6 flex flex-col gap-4 border-l-4 border-[#F97316]">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg text-[#F97316]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg md:text-2xl font-bold text-white leading-tight">
              {section?.texts.bottomTitle || 'Não importa em qual ponto da cadeia você está, o Manual Solar Buy-Side não é apenas um guia, mas uma imersão completa na perspectiva do comprador.'}
            </h3>
          </div>
          <div className="h-px w-full bg-white/10"></div>
        </div>
      </div>
    </section>
  )
}
