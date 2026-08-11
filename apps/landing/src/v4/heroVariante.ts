import { useSyncExternalStore } from 'react'

/**
 * Seletor de VARIANTE DO HERO, para comparar direções lado a lado.
 *
 *   a — "Amanhecer" (a atual): centrada, simétrica, cinematográfica.
 *   b — "Editorial": assimétrica, texto à esquerda, produto à direita.
 *   c — "Vitrine": a tela real da Plataforma como imagem principal.
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
  { id: 'c', nome: 'Vitrine', resumo: 'A tela da Plataforma como herói' },
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
   useSyncExternalStore entender que mudou sempre e entrar em laço.

   `null` = AUTOMÁTICO, que passou a ser o padrão em 09/08 (Gabriel: "deixa a B
   como fixa no desktop e no mobile será a A"). Sem `?hero=` na URL, quem
   escolhe é a LARGURA DA TELA, e não este arquivo: o AppV4 renderiza as duas e
   deixa o CSS mostrar uma por vez.

   Por que CSS e não `matchMedia` aqui: o HTML da LP é congelado no build, numa
   largura só. Se a escolha fosse feita em JavaScript, o visitante de celular
   receberia o HTML da variante de desktop e o React teria que remendar a
   árvore inteira do Hero na hidratação — o erro #418 que este arquivo existe
   para evitar. Com media query as duas vêm no HTML e o navegador esconde a que
   não serve antes do primeiro quadro, sem JavaScript nenhum. */
const lerVariante = (): VarianteHero | null => {
  const p = new URLSearchParams(window.location.search).get('hero')
  return ehVariante(p) ? p : null
}
const varianteCongelada = (): VarianteHero | null => null

/* SELETOR SEMPRE VISÍVEL (Gabriel, 09/08, pedindo pela segunda vez: "eu pedi
   as versões A B C no header, cadê?").

   Antes ele só aparecia em MODO DE AVALIAÇÃO: com `?hero=` na URL ou em
   localhost. A intenção era boa e continua verdadeira — um seletor de layout
   visível para um lead pago é caro —, mas ela dependia de alguém saber o
   truque da URL, e o Francis precisa achar as três variantes sozinho, abrindo
   o endereço normal.

   PARA FECHAR DE NOVO quando a campanha começar, é UMA PALAVRA: `false` na
   constante abaixo. O portão antigo continua escrito e volta inteiro, sem
   mexer em mais nada. */
const SELETOR_SEMPRE_VISIVEL = true

const lerModo = (): boolean =>
  SELETOR_SEMPRE_VISIVEL || new URLSearchParams(window.location.search).has('hero') || localHost()

/* O snapshot de hidratação TEM QUE CONCORDAR com o que o HTML congelado traz.
   O prerender captura o DOM depois de hidratar, então, com o seletor sempre
   visível, ele passou a sair gravado no HTML. Se este `getServerSnapshot`
   continuasse devolvendo `false`, o React hidrataria esperando um cabeçalho
   sem o seletor, encontraria três botões a mais e quebraria a hidratação
   (#418) — o mesmo erro que este arquivo inteiro existe para evitar.

   Quando o portão voltar (constante acima em `false`), este também volta a
   `false` sozinho, porque os dois leem a mesma constante. */
const modoCongelado = (): boolean => SELETOR_SEMPRE_VISIVEL

export function useVarianteHero(): {
  /** `null` = automático: desktop vê a B, celular vê a A (quem decide é o CSS). */
  variante: VarianteHero | null
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
