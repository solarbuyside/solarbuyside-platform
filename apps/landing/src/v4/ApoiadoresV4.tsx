import React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Marquee, Reveal, SolarCells } from './atoms'

/* APOIADORES INSTITUCIONAIS (Francis, revisão 22-23/07/2026).

   Dois blocos, alimentados pela MESMA lista de logos (seção CMS "apoiadores"):

   1) ApoiadoresBandV4 — faixa contínua de logos, logo abaixo do Hero (slide 1).
      Substitui a antiga faixa "Manual de Compra ✦ Código do Vendedor"
      (confirmado por ele em 23/07).

   PALETA: branco-gelo NEUTRO (#f7f8fa), não o bege/creme que a LP usava — o
   creme puxava para entardecer e brigava com a ideia de painel solar. Claro
   (e não escuro) porque boa parte dos logos é texto escuro sobre branco
   (Huawei, LONGi, SolarView, Unipower) e sumiria no fundo escuro.

   2) ApoiadoresV4 — seção completa, com os logos agrupados por categoria e um
      card de descrição que abre no hover (desktop) ou no toque (mobile).

   Os logos vêm do CMS: images.logoNSrc + texts.logoNName/logoNDesc/logoNCat.
   Um logo só entra na lista se tiver imagem — assim o cliente adiciona e
   remove pelo admin sem tocar no código. */

export type Apoiador = {
  src: string
  name: string
  desc: string
  cat: string
  url: string
  /** Fora da faixa do topo, mas ainda na seção. Ver logoNBandOff. */
  bandOff: boolean
  /** Posição na faixa. A faixa tem ordem PRÓPRIA — ver ApoiadoresBandV4. */
  bandPos: number
}

const MAX_LOGOS = 30

/**
 * Lê a lista de logos do CMS (logo1…logoN).
 *
 * Dois níveis de visibilidade, controlados no admin:
 *  - `logoNHidden = "1"`  → guardado, fora dos DOIS lugares (marca sem
 *    autorização de uso, por exemplo). Nem entra nesta lista.
 *  - `logoNBandOff = "1"` → aparece na seção de apoiadores mas NÃO na faixa
 *    que rola no topo. Ausente significa "vai na faixa", que é o que sempre
 *    valeu — nenhum conteúdo existente muda de comportamento.
 */
export function useApoiadores(): { logos: Apoiador[]; categorias: string[] } {
  const { getSection } = useContent()
  const section = getSection('apoiadores')
  const logos: Apoiador[] = []
  for (let i = 1; i <= MAX_LOGOS; i++) {
    const src = section?.images?.[`logo${i}Src`]
    if (!src) continue
    if (section?.texts?.[`logo${i}Hidden`] === '1') continue
    logos.push({
      src,
      name: section?.texts?.[`logo${i}Name`] || '',
      desc: section?.texts?.[`logo${i}Desc`] || '',
      cat: section?.texts?.[`logo${i}Cat`] || '',
      // Link opcional para o site do apoiador. Vazio = o card não mostra link.
      url: section?.texts?.[`logo${i}Url`] || '',
      bandOff: section?.texts?.[`logo${i}BandOff`] === '1',
      // Sem valor gravado, cai na posição da própria lista — que é como a
      // faixa sempre se comportou, antes de ganhar ordem própria.
      bandPos: Number(section?.texts?.[`logo${i}BandPos`]) || i,
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
  const { logos: todos } = useApoiadores()
  // A faixa tem seleção E ordem próprias: o admin escolhe quais apoiadores
  // sobem para cá e em que sequência desfilam, sem mexer na seção lá embaixo —
  // onde a ordem da lista é o que define o agrupamento por categoria.
  const logos = todos.filter((l) => !l.bandOff).sort((a, b) => a.bandPos - b.bandPos)
  if (logos.length === 0) return null

  // Título da faixa (Francis, slide 2). O texto anterior ("Empresas líderes
  // que apoiam...") é tratado como legado: se o banco ainda tiver ele, cai no
  // novo, para a LP não depender do seed.
  const bandTitleCms = section?.texts.bandTitle || ''
  // Casamento EXATO com o texto legado do banco. Prefixo não serve: pegaria uma
  // frase futura do Francis que comece igual, e o que ele escrever no admin
  // ("Apoiadores > Faixa que rola no topo") tem que vencer.
  const bandTitle =
    !bandTitleCms || bandTitleCms.trim() === 'Empresas líderes que apoiam o Movimento Solar Buy-Side'
      ? 'Empresas referência no mercado solar apoiam o Movimento Solar Buy-Side'
      : bandTitleCms
  const bandSubtitle =
    section?.texts.bandSubtitle ||
    '+15 empresas apoiadoras em 5 segmentos da cadeia fotovoltaica: Distribuição • Fabricante • Tecnologia • Serviços • Financiamento'

  // A frase dos segmentos é quebrada em duas linhas no ":": a chamada em cima
  // e os cinco segmentos juntos embaixo (Gabriel, 26/07). Sem o ":" o texto
  // sai numa linha só, como antes.
  const [bandLead, bandSegmentos] = (() => {
    const i = bandSubtitle.indexOf(':')
    if (i === -1) return [bandSubtitle, '']
    return [bandSubtitle.slice(0, i + 1).trim(), bandSubtitle.slice(i + 1).trim()]
  })()

  return (
    // Sem fundo e sem bordas: o horizonte solar do Hero desce e emenda na
    // seção seguinte, e qualquer faixa de cor cortaria essa continuidade.
    <section className="relative bg-transparent py-12">
      {/* Ponte do crepúsculo: a grade do Hero atravessa esta faixa inteira e
          só começa a sumir na seção de Autores, logo abaixo. Como o v4-cells
          é background-attachment:fixed, a fase casa sem emenda. */}
      <SolarCells fade="full" />

      <p className="v4-mono relative z-10 mb-7 px-6 text-center text-[14px] font-bold uppercase tracking-[0.3em] text-orange-400">
        {bandTitle}
      </p>

      {/* Sem reverse: sentido do desfile invertido a pedido do Gabriel (26/07).

          A lista vai DUPLICADA dentro de cada trilha de propósito. A trilha
          tem `min-width: 100%`: quando a soma dos logos é menor que a largura
          da tela (monitor largo), ela estica e a sobra inteira vira um buraco
          na emenda entre uma cópia e a outra. Dobrando a lista, o conteúdo
          sempre passa da largura do viewport, o min-width nunca entra em ação
          e a emenda fica com o mesmo respiro dos demais logos. */}
      {/* speed = duração de um ciclo, então número maior = desfile mais lento.
          46s -> 58s a pedido do Gabriel (26/07). */}
      <Marquee speed={58} className="v4-marquee-tight relative z-10">
        <span className="flex items-center gap-6 whitespace-nowrap">
          {[...logos, ...logos].map((logo, i) => (
            // Chip branco por logo: vários são texto escuro (Huawei, LONGi,
            // SolarView) e sumiriam no escuro. Filtro monocromático não serve
            // porque BelEnergy/Fluke/Energy Channel já vêm com caixa sólida.
            <span
              key={i}
              className="flex h-12 shrink-0 items-center justify-center rounded-lg bg-white/95 px-5 md:h-14 md:px-6"
            >
              <img src={logo.src} alt={logo.name} loading="lazy" className="h-6 w-auto object-contain md:h-7" />
            </span>
          ))}
        </span>
      </Marquee>

      {bandSubtitle && (
        <p className="relative z-10 mx-auto mt-8 max-w-3xl px-6 text-center text-[15px] leading-relaxed text-slate-300">
          {bandLead}
          {bandSegmentos && (
            // block: os cinco segmentos ficam sempre numa linha só, embaixo.
            <span className="mt-1 block">{bandSegmentos}</span>
          )}
        </p>
      )}
    </section>
  )
}

/* ── 2) Seção completa, por categoria, com card no hover/toque ──────────── */
/* Card do apoiador (Francis, slide 16: "quando o visitante passa o mouse
   (desktop) ou toca (mobile), abrir um pequeno card").

   O card é horizontal: miniatura do logo à esquerda, categoria + nome +
   descrição à direita, e o link do site no rodapé quando existe. No desktop
   ele ancora acima do tile; no mobile vira uma barra fixa no pé da tela, que
   é onde dá para ler sem tapar o próprio logo que a pessoa tocou. */
const LogoCard: React.FC<{ logo: Apoiador }> = ({ logo }) => {
  const [open, setOpen] = React.useState(false)
  const temCard = logo.desc.trim().length > 0 || logo.url.trim().length > 0

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
        className="flex h-20 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500/60 hover:shadow-[0_12px_28px_rgba(15,23,42,0.10)]"
      >
        <img src={logo.src} alt={logo.name} loading="lazy" className="max-h-10 w-auto object-contain" />
      </button>

      {temCard && open && (
        <>
          {/* Véu só no mobile: fecha ao tocar fora e destaca a barra. */}
          <span
            className="fixed inset-0 z-40 bg-slate-900/20 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="tooltip"
            /* Sem v4-rise aqui: a animação define `transform` e atropelava o
               -translate-x-1/2, jogando o card para a direita do logo. */
            className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:absolute md:inset-x-auto md:bottom-[calc(100%+12px)] md:left-1/2 md:w-[330px] md:-translate-x-1/2 md:p-4"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-2">
                <img src={logo.src} alt="" aria-hidden className="max-h-full w-auto object-contain" />
              </span>
              <div className="min-w-0">
                {logo.cat && (
                  <p className="v4-mono text-[9px] font-bold uppercase tracking-[0.22em] text-orange-600">{logo.cat}</p>
                )}
                <p className="mt-1 font-['Sora'] text-sm font-bold leading-tight text-slate-900">{logo.name}</p>
                {logo.desc && <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{logo.desc}</p>}
              </div>
            </div>

            {logo.url && (
              <a
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="v4-mono mt-3.5 flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700 transition-colors hover:border-orange-500/60 hover:text-orange-600"
              >
                Visitar site
                <ArrowUpRight size={13} aria-hidden />
              </a>
            )}

            {/* Bico do balão só no desktop */}
            <span
              className="absolute left-1/2 top-full hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-slate-200 bg-white md:block"
              aria-hidden
            />
          </div>
        </>
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
  // Subtítulo do slide 16. As duas redações anteriores ("Empresas nacionais e
  // internacionais..." e "Players nacionais e internacionais...") são tratadas
  // como legado para o banco não sobrescrever o texto certo.
  const subtitleCms = section?.texts.subtitle || ''
  const subtitle =
    !subtitleCms || /^(Empresas nacionais|Players nacionais)/.test(subtitleCms)
      ? 'Empresas referência no mercado solar apoiam o Movimento Solar Buy-Side e contribuem para um novo padrão de profissionalismo, transparência e geração de valor no setor.'
      : subtitleCms

  return (
    // Respiro maior embaixo: com py simétrico a última fileira de logos
    // encostava na seção seguinte (Gabriel, 27/07).
    <section className="bg-[#f7f8fa] px-6 pb-28 pt-20 text-slate-700 md:pb-36 md:pt-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-['Sora'] text-[clamp(1.8rem,3.6vw,2.8rem)] font-extrabold leading-tight tracking-tight text-slate-900">
            {title}
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{subtitle}</p>
        </Reveal>

        <div className="mt-12 space-y-10">
          {categorias.map((cat, ci) => (
            <Reveal key={cat} delay={120 + ci * 60}>
              <h3 className="v4-mono border-b border-slate-200 pb-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-orange-600">
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
