import { useSyncExternalStore } from 'react'

/**
 * Seletor de VARIANTE DO HERO, para comparar direções lado a lado.
 *
 *   a — "Amanhecer" (a atual): centrada, simétrica, cinematográfica.
 *   b — "Editorial": assimétrica, texto à esquerda, produto à direita.
 *   c — "Duelo": a tese do produto virada em layout, comprador x vendedor.
 *
 * COMO ABRIR: `?hero=b` na URL. O seletor no cabeçalho só aparece em MODO DE
 * AVALIAÇÃO, que é uma destas duas coisas:
 *   - a URL já tem `?hero=` (alguém veio pelo link de comparação), ou
 *   - o host é local (localhost / 127.0.0.1 / IP da rede do Vite).
 *
 * Em solarbuyside.com.br o visitante vê a variante A e NENHUM controle. Um
 * seletor de layout visível para um lead pago seria a coisa mais cara desta
 * página.
 *
 * POR QUE useSyncExternalStore E NÃO useState + useEffect
 * O HTML da LP é congelado no build, com a variante A dentro. Ler a URL
 * durante o render faria o cliente montar outra árvore e quebrar a hidratação
 * (#418). Este hook resolve isso pela porta da frente: `getServerSnapshot`
 * devolve o valor que o HTML congelado tem (sempre 'a'), e `getSnapshot` só
 * vale depois da hidratação. É a mesma garantia de um efeito, sem o efeito.
 */

export type VarianteHero = 'a' | 'b' | 'c'

export const VARIANTES: { id: VarianteHero; nome: string; resumo: string }[] = [
  { id: 'a', nome: 'Amanhecer', resumo: 'Centrada e simétrica' },
  { id: 'b', nome: 'Editorial', resumo: 'Texto à esquerda, produto à direita' },
  { id: 'c', nome: 'Duelo', resumo: 'Comprador x vendedor' },
]

/** Trocar de variante não navega, então não dispara popstate: avisamos nós. */
const EVENTO = 'sbs:hero-variante'

const ehVariante = (v: string | null): v is VarianteHero => v === 'a' || v === 'b' || v === 'c'

function localHost(): boolean {
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h === '' || /^\d+\.\d+\.\d+\.\d+$/.test(h)
}

function assinar(avisar: () => void): () => void {
  window.addEventListener('popstate', avisar)
  window.addEventListener(EVENTO, avisar)
  return () => {
    window.removeEventListener('popstate', avisar)
    window.removeEventListener(EVENTO, avisar)
  }
}

/* Os snapshots devolvem PRIMITIVOS. Objeto novo a cada leitura faria o
   useSyncExternalStore entender que mudou sempre e entrar em laço. */
const lerVariante = (): VarianteHero => {
  const p = new URLSearchParams(window.location.search).get('hero')
  return ehVariante(p) ? p : 'a'
}
const varianteCongelada = (): VarianteHero => 'a'

const lerModo = (): boolean => new URLSearchParams(window.location.search).has('hero') || localHost()
const modoCongelado = (): boolean => false

export function useVarianteHero(): {
  variante: VarianteHero
  modoAvaliacao: boolean
  trocar: (v: VarianteHero) => void
} {
  const variante = useSyncExternalStore(assinar, lerVariante, varianteCongelada)
  const modoAvaliacao = useSyncExternalStore(assinar, lerModo, modoCongelado)

  const trocar = (v: VarianteHero) => {
    // Reescreve a URL sem recarregar: o link fica compartilhável (dá para
    // mandar `?hero=c` para o cliente) sem perder a posição da rolagem.
    const url = new URL(window.location.href)
    url.searchParams.set('hero', v)
    window.history.replaceState(null, '', url)
    window.dispatchEvent(new Event(EVENTO))
  }

  return { variante, modoAvaliacao, trocar }
}
