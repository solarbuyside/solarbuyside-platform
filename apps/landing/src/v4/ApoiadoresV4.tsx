import React from 'react'
import { ArrowUpRight, Hand } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'
import { Img, Reveal } from './atoms'
import { criarTxt, temConteudo } from './cms'

/* APOIADORES INSTITUCIONAIS (Francis, revisão 22-23/07/2026).

   Seção completa, com os logos agrupados por categoria e um card de descrição
   que abre no hover (desktop) ou no toque (mobile).

   POSIÇÃO: 4ª dobra, logo depois de "Para que servem o Manual, o Código e a
   Plataforma?" (Francis, revisão de 06/08, slide 7). Ela vivia no fim da LP e
   subiu porque "o carrossel não explica a participação das marcas e este bloco
   deveria estar bem no início para transferir a maior credibilidade dessas
   marcas desde os primeiros instantes do lead na página".

   A FAIXA CONTÍNUA de logos que rolava logo abaixo do Hero (ApoiadoresBandV4)
   foi REMOVIDA na mesma revisão (slide 3: "eliminar o carrossel e seu título
   acima"). Este bloco a substitui: os mesmos logos, agora explicados. As
   chaves de CMS dela (bandTitle, bandSubtitle, logoNBandOff, logoNBandPos)
   ficaram órfãs no banco.

   PALETA: branco-gelo NEUTRO (#f7f8fa), não o bege/creme que a LP usava — o
   creme puxava para entardecer e brigava com a ideia de painel solar. Claro
   (e não escuro) porque boa parte dos logos é texto escuro sobre branco
   (Huawei, LONGi, SolarView, Unipower) e sumiria no fundo escuro.

   Os logos vêm do CMS: images.logoNSrc + texts.logoNName/logoNDesc/logoNCat.
   Um logo só entra na lista se tiver imagem — assim o cliente adiciona e
   remove pelo admin sem tocar no código. */

export type Apoiador = {
  src: string
  name: string
  desc: string
  cat: string
  url: string
}

const MAX_LOGOS = 30

/**
 * Lê a lista de logos do CMS (logo1…logoN).
 *
 * `logoNHidden = "1"` → guardado, fora do ar (marca sem autorização de uso,
 * por exemplo). Nem entra nesta lista.
 *
 * `logoNBandOff` e `logoNBandPos` deixaram de ser lidos quando a faixa do topo
 * saiu (06/08): a seção tem um lugar só, e a ordem dela é a ordem da lista.
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
    })
  }
  // Ordem das categorias = ordem de aparição na lista (o admin controla).
  const categorias: string[] = []
  for (const l of logos) if (l.cat && !categorias.includes(l.cat)) categorias.push(l.cat)
  return { logos, categorias }
}

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
        <Img src={logo.src} alt={logo.name} loading="lazy" className="max-h-10 w-auto object-contain" />
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
                <Img src={logo.src} alt="" aria-hidden className="max-h-full w-auto object-contain" />
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
  const txt = criarTxt(section)
  const { logos, categorias } = useApoiadores()
  if (logos.length === 0) return null

  const title = txt('title', 'Apoiadores Institucionais Solar Buy-Side')
  // Subtítulo do slide 16. As duas redações anteriores ("Empresas nacionais e
  // internacionais..." e "Players nacionais e internacionais...") são tratadas
  // como legado para o banco não sobrescrever o texto certo.
  const subtitleCms = txt('subtitle', '')
  const subtitle =
    /^(Empresas nacionais|Players nacionais)/.test(subtitleCms)
      ? 'Empresas referência no mercado solar apoiam o Movimento Solar Buy-Side e contribuem para um novo padrão de profissionalismo, transparência e geração de valor no setor.'
      : subtitleCms

  /* Dica de interação (Francis, 06/08, slide 7: "quando o lead chega neste
     bloco, que um card abra com a mensagem: Passe o mouse ou toque nos
     logos"). Não é um card sobreposto: um card que abre sozinho tapa
     justamente os logos que ele manda tocar, e no mobile viraria um pop-up
     para fechar. É um chip fixo ao lado do primeiro rótulo de categoria, no
     caminho do olho antes da primeira fileira. Some se o campo for apagado. */
  const dica = txt('hoverHint', 'Passe o mouse ou toque nos logos')

  /* Ressalva legal que vivia embaixo do carrossel do topo. O carrossel saiu
     (slide 3) e o texto NÃO: ele diz que os apoiadores não vendem o material
     nem participam da receita, e some da LP junto com a faixa se ninguém o
     trouxer. `bandSubtitle` é lido como legado para o texto que o Francis já
     gravou no admin continuar no ar sem ele precisar redigitar. */
  const disclaimer = txt(
    'disclaimer',
    txt('bandSubtitle', 'Elas não vendem os materiais nem participam da sua receita. O conteúdo é de responsabilidade exclusiva da Buy-Side Soluções.'),
  )

  return (
    /* 4ª dobra, subindo por cima do ato escuro com o arco arredondado — o
       mesmo movimento que os depoimentos e a oferta já fazem. Antes de 06/08
       esta seção ficava no fim da LP, entre dois blocos claros, e o topo era
       um degradê de creme para branco-gelo; aqui em cima ela nasce sobre o
       "Para que servem", que é escuro, então o degradê saiu e entrou o arco.

       O pb generoso é o espaço que a seção de Mentores ocupa ao subir por
       cima desta com o próprio arco, escuro. */
    <section className="relative z-10 -mt-20 rounded-t-[3rem] bg-[#f7f8fa] px-6 pb-36 pt-24 text-slate-700 md:rounded-t-[4.5rem] md:pb-44 md:pt-32">
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
              {/* A dica acompanha o PRIMEIRO rótulo de categoria: é onde o
                  olho pousa antes de encontrar o primeiro logo. */}
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-slate-200 pb-2.5">
                <h3 className="v4-mono text-[10px] font-bold uppercase tracking-[0.28em] text-orange-600">{cat}</h3>
                {ci === 0 && temConteudo(dica) && (
                  <p className="v4-mono inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    <Hand size={12} aria-hidden />
                    {dica}
                  </p>
                )}
              </div>
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

        {temConteudo(disclaimer) && (
          <Reveal delay={160}>
            <p className="mt-14 max-w-3xl border-t border-slate-200 pt-6 text-[13px] leading-relaxed text-slate-500">
              {disclaimer}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  )
}
