/**
 * Avisa Bing/Yandex (e quem mais fala IndexNow) que as URLs mudaram.
 *
 * Por que existe: o prerender subiu em 28/07 e, desde então, pipelines de
 * leitura remota (ChatGPT, claude.ai) devolvem o shell VAZIO da home — mesmo
 * documento que curl, Googlebot, r.jina.ai e o WebFetch do Claude Code leem
 * inteiro. Já foi descartado bloqueio por User-Agent (bytes idênticos em cinco
 * UAs), </script sem escape e quebra de parser (validador W3C percorre o
 * documento todo). O que restou: buscar a MESMA página numa URL nova devolve o
 * conteúdo — ou seja, é estado preso por URL, do lado de quem lê.
 *
 * O IndexNow não conserta o cache dessas ferramentas diretamente; ele encurta
 * o caminho de quem se apoia em índice de busca para decidir o que reservir.
 * É protocolo padrão, custa um GET e não tem efeito colateral no site.
 *
 * Uso: node scripts/indexnow.mjs
 */
const CHAVE = '0b7d1a46e2ccf392e04569e00568e86e'
const HOST = 'solarbuyside.com.br'
const URLS = [
  `https://${HOST}/`,
  `https://${HOST}/politica-de-privacidade`,
  `https://${HOST}/termos-de-uso`,
  `https://${HOST}/medidas-antipiratarias`,
]

const corpo = {
  host: HOST,
  key: CHAVE,
  keyLocation: `https://${HOST}/${CHAVE}.txt`,
  urlList: URLS,
}

for (const endpoint of ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow']) {
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(corpo),
    })
    // 200 = aceito, 202 = aceito e a chave será validada depois.
    console.log(`[indexnow] ${endpoint} -> ${r.status} ${r.statusText}`)
  } catch (e) {
    console.log(`[indexnow] ${endpoint} -> falhou: ${e.message}`)
  }
}
