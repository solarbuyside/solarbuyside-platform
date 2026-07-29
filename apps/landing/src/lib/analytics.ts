/**
 * Camada fina sobre o gtag do GA4.
 *
 * Por que existe: os componentes não devem saber que a ferramenta é GA4. Se um
 * dia entrar GTM ou Meta Pixel ao lado, muda só este arquivo.
 *
 * No-op silencioso quando o gtag não existe — é o caso do prerender (o snippet
 * no index.html não carrega fora do domínio de produção) e o de um bloqueador
 * de anúncios no navegador do visitante. Evento de analytics nunca pode
 * derrubar uma interação da página.
 */
type Params = Record<string, string | number | boolean | undefined>

type ComGtag = Window & { gtag?: (...args: unknown[]) => void }

export function track(evento: string, params: Params = {}): void {
  if (typeof window === 'undefined') return
  const gtag = (window as ComGtag).gtag
  if (typeof gtag !== 'function') return
  try {
    gtag('event', evento, params)
  } catch {
    /* analytics nunca quebra a página */
  }
}

/** Id da seção que contém o elemento clicado ("hero", "oferta", "faq"…).
    A LP inteira é uma página só, então sem isso todo clique de CTA viraria um
    número único, sem dizer de qual dobra veio. */
export function secaoDe(el: Element | null): string {
  const comId = el?.closest<HTMLElement>('[id]')
  return comId?.id || 'sem-secao'
}

/** Texto visível de um elemento, normalizado para virar rótulo de evento. */
export function rotuloDe(el: Element | null): string {
  return (el?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80)
}
