import React from 'react'
import { useContent } from '../contexts/ContentContext'
import { Marquee, Reveal } from './atoms'

/* APOIADORES INSTITUCIONAIS (Francis, revisão 22-23/07/2026).

   Dois blocos, alimentados pela MESMA lista de logos (seção CMS "apoiadores"):

   1) ApoiadoresBandV4 — faixa contínua de logos. Substitui a antiga faixa
      "Manual de Compra ✦ Código do Vendedor" (confirmado por ele em 23/07).
      Fundo CLARO de propósito: boa parte dos logos é texto escuro sobre branco
      (Huawei, LONGi, SolarView, Unipower…) e sumiria numa faixa escura — é
      também como ele desenhou no slide 1.

   2) ApoiadoresV4 — seção completa, com os logos agrupados por categoria e um
      card de descrição que abre no hover (desktop) ou no toque (mobile).

   Os logos vêm do CMS: images.logoNSrc + texts.logoNName/logoNDesc/logoNCat.
   Um logo só entra na lista se tiver imagem — assim o cliente adiciona e
   remove pelo admin sem tocar no código. */

export type Apoiador = { src: string; name: string; desc: string; cat: string }

const MAX_LOGOS = 30

/** Lê a lista de logos do CMS (logo1…logoN). Para no primeiro sem imagem. */
export function useApoiadores(): { logos: Apoiador[]; categorias: string[] } {
  const { getSection } = useContent()
  const section = getSection('apoiadores')
  const logos: Apoiador[] = []
  for (let i = 1; i <= MAX_LOGOS; i++) {
    const src = section?.images?.[`logo${i}Src`]
    if (!src) continue
    logos.push({
      src,
      name: section?.texts?.[`logo${i}Name`] || '',
      desc: section?.texts?.[`logo${i}Desc`] || '',
      cat: section?.texts?.[`logo${i}Cat`] || '',
    })
  }
  // Ordem das categorias = ordem de aparição na lista (o admin controla).
  const categorias: string[] = []
  for (const l of logos) if (l.cat && !categorias.includes(l.cat)) categorias.push(l.cat)
  return { logos, categorias }
}

/* ── 1) Faixa contínua ──────────────────────────────────────────────────── */
export const ApoiadoresBandV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('apoiadores')
  const { logos } = useApoiadores()
  if (logos.length === 0) return null

  const bandTitle = section?.texts.bandTitle || 'Empresas líderes que apoiam o Movimento Solar Buy-Side'
  const bandSubtitle =
    section?.texts.bandSubtitle ||
    '+15 empresas apoiadoras em 5 segmentos da cadeia fotovoltaica: Distribuição • Fabricante • Tecnologia • Serviços • Financiamento'

  return (
    <section className="border-y border-black/[0.06] bg-[#f4f5f7] py-10 text-[#181410]">
      <p className="v4-mono mb-6 px-6 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-[#181410]/55">
        {bandTitle}
      </p>

      {/* reverse: desfile da direita para a esquerda (seta do slide 1) */}
      <Marquee speed={46} reverse>
        <span className="flex items-center gap-14 whitespace-nowrap pr-14">
          {logos.map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.name}
              loading="lazy"
              className="h-9 w-auto shrink-0 object-contain md:h-11"
            />
          ))}
        </span>
      </Marquee>

      {bandSubtitle && (
        <p className="mx-auto mt-7 max-w-3xl px-6 text-center text-xs leading-relaxed text-[#4f463c] md:text-sm">
          {bandSubtitle}
        </p>
      )}
    </section>
  )
}

/* ── 2) Seção completa, por categoria, com card no hover/toque ──────────── */
const LogoCard: React.FC<{ logo: Apoiador }> = ({ logo }) => {
  const [open, setOpen] = React.useState(false)
  const temCard = logo.desc.trim().length > 0

  return (
    <div
      className="group relative flex items-center justify-center"
      onMouseEnter={() => temCard && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        // No mobile não existe hover: o toque abre/fecha o card.
        onClick={() => temCard && setOpen((v) => !v)}
        aria-expanded={temCard ? open : undefined}
        aria-label={logo.name}
        className="flex h-20 w-full items-center justify-center rounded-xl border border-black/[0.06] bg-white px-4 transition-all duration-300 hover:border-orange-500/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
      >
        <img src={logo.src} alt={logo.name} loading="lazy" className="max-h-10 w-auto object-contain" />
      </button>

      {temCard && open && (
        <div
          role="tooltip"
          className="absolute bottom-[calc(100%+10px)] left-1/2 z-30 w-60 -translate-x-1/2 rounded-xl border border-black/10 bg-white p-3.5 text-left shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
        >
          <p className="font-['Sora'] text-sm font-bold text-[#181410]">{logo.name}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#4f463c]">{logo.desc}</p>
          <span
            className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-black/10 bg-white"
            aria-hidden
          />
        </div>
      )}
    </div>
  )
}

export const ApoiadoresV4: React.FC = () => {
  const { getSection } = useContent()
  const section = getSection('apoiadores')
  const { logos, categorias } = useApoiadores()
  if (logos.length === 0) return null

  const title = section?.texts.title || 'Apoiadores Institucionais Solar Buy-Side'
  const subtitle =
    section?.texts.subtitle ||
    'Empresas nacionais e internacionais que apoiam a missão de tornar a compra e a venda de sistemas fotovoltaicos mais profissionais, transparentes e seguras.'

  return (
    <section className="bg-[#f2ece1] px-6 py-20 text-[#181410] md:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-['Sora'] text-[clamp(1.8rem,3.6vw,2.8rem)] font-extrabold leading-tight tracking-tight">
            {title}
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#4f463c]">{subtitle}</p>
        </Reveal>

        <div className="mt-12 space-y-10">
          {categorias.map((cat, ci) => (
            <Reveal key={cat} delay={120 + ci * 60}>
              <h3 className="v4-mono border-b border-[#181410]/12 pb-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-[#181410]/60">
                {cat}
              </h3>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {logos
                  .filter((l) => l.cat === cat)
                  .map((logo, i) => (
                    <LogoCard key={`${cat}-${i}`} logo={logo} />
                  ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
