/* A PÁGINA ESTÁ SENDO CAPTURADA PELO BUILD?

   O HTML da LP é congelado no build por um Chromium automatizado
   (scripts/prerender.mjs), que passa alguns segundos rolando a página antes de
   copiar o DOM. Depois, o visitante HIDRATA esse DOM (hydrateRoot): o primeiro
   render dele precisa produzir exatamente o mesmo texto.

   Qualquer animação movida a RELÓGIO (rodízio do kit, painéis da jornada da
   Plataforma, notas subindo, contagem regressiva da live) quebra isso: durante
   a captura ela anda, o HTML sai num quadro do meio, e o visitante começa do
   quadro zero. O React acusa mismatch (#418) e repinta tudo, que é
   justamente o custo que a hidratação existe para evitar.

   A regra: animação de relógio não anda durante a captura. O navegador
   automatizado se anuncia em `navigator.webdriver`; visitante de verdade não.
   Animação de SCROLL (reveals) não entra aqui: o prerender já limpa as classes
   delas antes de copiar. */
export function capturaDoBuild(): boolean {
  return typeof navigator !== 'undefined' && navigator.webdriver === true
}
