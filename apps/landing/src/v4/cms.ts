/**
 * Leitura de texto do CMS com a regra do campo apagado.
 *
 * O padrão antigo espalhado pela v4 era `section?.texts.x || 'default'`. O `||`
 * trata string vazia como ausente, então APAGAR o campo no admin fazia o texto
 * hardcoded do código voltar para a página. Foi a reclamação do Francis em
 * 30/07 (cards do Manual, corrigido pontualmente no commit 83b9448) e de novo
 * em 03/08 em três lugares diferentes: o "De R$ 997,00 por apenas:" que ele
 * apagou e continuou no ar, o título da Plataforma que não atualizava e o
 * espaço vazio embaixo do logo da Belenergy.
 *
 * A regra correta, em uma frase: o default do código só vale quando a chave
 * NÃO EXISTE no banco. Chave presente e em branco é o cliente dizendo "tira
 * isto do ar".
 *
 * "Em branco" aqui é mais largo que `.trim()`: o editor rich-text grava `"\n"`
 * ao esvaziar um campo, e grava `"<br>"` ou `"&nbsp;"` quando o cursor passou
 * por ele. Os três precisam contar como vazio, senão o campo volta como uma
 * linha em branco no layout — que foi exatamente o "espaço vazio abaixo da
 * logotipo" do slide 19.
 */

/** Espaços que não são o 0x20: NBSP, espaço de figura, NNBSP e BOM.
    Montado em código: o caractere literal no fonte é
    invisível na revisão de código (e o eslint reclama dele). */
const ESPACOS_INVISIVEIS = new RegExp(`[${String.fromCharCode(0xa0, 0x2007, 0x202f, 0xfeff)}]`, 'g')

/** Texto do CMS que, depois de tirar marcação e entidades, não sobra nada. */
export function semConteudo(valor: string | undefined | null): boolean {
  if (!valor) return true
  return (
    valor
      .replace(/<[^>]*>/g, '')
      // &nbsp; nomeado e numérico: o editor grava os dois.
      .replace(/&nbsp;|&#160;|&#xa0;/gi, ' ')
      .replace(ESPACOS_INVISIVEIS, ' ')
      .trim() === ''
  )
}

/** O inverso, para usar direto em `{temConteudo(x) && <p>…</p>}`. */
export const temConteudo = (valor: string | undefined | null): boolean => !semConteudo(valor)

type Secao = { texts: Record<string, string> } | undefined

/**
 * Fábrica do leitor de textos de uma seção.
 *
 * ```ts
 * const txt = criarTxt(getSection('pricing'))
 * txt('priceFrom', 'De R$ 997,00 por apenas:')  // '' se o Francis apagou
 * ```
 *
 * O valor volta sempre trimado: o editor deixa espaço à direita com
 * frequência (o `card3Desc` chegou a ter 300 espaços gravados) e isso
 * atrapalha comparações e o `white-space` do layout.
 */
export function criarTxt(section: Secao) {
  return (chave: string, padrao = ''): string => {
    const bruto = section?.texts?.[chave]
    if (bruto === undefined) return padrao
    return semConteudo(bruto) ? '' : bruto.trim()
  }
}

export type Txt = ReturnType<typeof criarTxt>
