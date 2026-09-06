/* UTM no link de saída para a Belenergy.
 *
 * O Francis perguntou (04/09) se a Belenergy consegue identificar quais
 * cadastros vieram da nossa página. Do lado deles, a resposta é ler estes
 * parâmetros: nada mais precisa ser integrado. Do nosso lado, o clique já é
 * contado em `landing_events`.
 *
 * Fica em módulo separado do componente por causa do fast refresh, que só
 * funciona em arquivos que exportam apenas componentes.
 */

export function comUtm(url: string): string {
  try {
    const u = new URL(url)
    // Não sobrescreve o que já estiver na URL: se o admin cadastrar um link
    // com campanha própria, ela vale.
    if (!u.searchParams.has('utm_source')) u.searchParams.set('utm_source', 'solarbuyside')
    if (!u.searchParams.has('utm_medium')) u.searchParams.set('utm_medium', 'landing_page')
    if (!u.searchParams.has('utm_campaign')) u.searchParams.set('utm_campaign', 'credenciamento_15off')
    return u.toString()
  } catch {
    // URL relativa ou malformada no admin: melhor mandar como está do que
    // perder o destino inteiro por causa do rastreamento.
    return url
  }
}
