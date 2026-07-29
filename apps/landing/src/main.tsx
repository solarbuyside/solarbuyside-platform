import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ContentProvider } from './contexts/ContentContext'

// AuthProvider removido do caminho público: a LP não autentica nada (o login
// admin vive só na plataforma). Mantê-lo aqui levava /api/auth/login e a
// lógica de token para o bundle público sem necessidade.
// A /1 é a cópia-salvaguarda da LP completa: conteúdo congelado num snapshot
// estático, fora do Supabase e fora do localStorage. O admin edita só a LP
// oficial; sem isso, editar a oficial mudava a /1 junto (mesmas linhas no banco).
const pathname = window.location.pathname.replace(/\/$/, '') || '/'
const isFrozenRoute = pathname === '/1'

// html.js: liga as regras de reveal (que escondem até o observer revelar).
// Sem JS — crawler lendo o HTML pré-renderizado — o v4.css mantém tudo
// visível via html:not(.js).
document.documentElement.classList.add('js')

// Carga pré-renderizada (prerender.mjs preenche o #root no build): o hero já
// está pintado antes de o JS rodar. html.pre pula a animação de entrada do
// hero (ver v4.css) — re-rodá-la esconderia o texto já visível e empurraria
// o LCP para o fim da animação.
const root = document.getElementById('root')!
const temPrerender = root.hasChildNodes()
if (temPrerender) {
  document.documentElement.classList.add('pre')
}

const app = (
  <StrictMode>
    <ContentProvider frozen={isFrozenRoute}>
      <App />
    </ContentProvider>
  </StrictMode>
)

// HIDRATAR em vez de recriar: o DOM pré-renderizado veio do próprio React
// (prerender captura o render real), então o cliente pode adotá-lo sem
// descartar e repintar — o LCP passa a valer o paint estático, não o remount.
// Só na RAIZ, e só quando o conteúdo do build está embutido
// (window.__SBS_CONTENT__ garante primeiro render idêntico ao capturado).
// A /1 e as legais são chunks lazy (Suspense sem marcador de SSR) e seguem
// no createRoot. Mismatch não quebra: o React 19 recupera re-renderizando no
// cliente — exatamente o comportamento antigo.
type W = Window & { __SBS_CONTENT__?: unknown }
const podeHidratar = temPrerender && pathname === '/' && Boolean((window as W).__SBS_CONTENT__)
if (podeHidratar) {
  hydrateRoot(root, app, {
    // Mismatch não é fatal (o React remenda o subtree), mas é sinal de deriva
    // entre a captura do build e o primeiro render — fica visível no console
    // para não passar batido numa regressão futura.
    onRecoverableError: (err, info) => {
      console.warn('[hydrate] mismatch recuperado:', err, info?.componentStack ?? '')
    },
  })
} else {
  createRoot(root).render(app)
}
