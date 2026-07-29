import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ContentProvider } from './contexts/ContentContext'

// AuthProvider removido do caminho público: a LP não autentica nada (o login
// admin vive só na plataforma). Mantê-lo aqui levava /api/auth/login e a
// lógica de token para o bundle público sem necessidade.
// A /1 é a cópia-salvaguarda da LP completa: conteúdo congelado num snapshot
// estático, fora do Supabase e fora do localStorage. O admin edita só a LP
// oficial; sem isso, editar a oficial mudava a /1 junto (mesmas linhas no banco).
const isFrozenRoute = window.location.pathname.replace(/\/$/, '') === '/1'

// Carga pré-renderizada (prerender.mjs preenche o #root no build): o hero já
// está pintado antes de o JS rodar. Re-rodar a animação de entrada esconderia
// o texto já visível e re-mostraria depois — o paint do LCP ia parar no FIM
// da animação (medido: +1,2s de render delay no Lighthouse desktop). html.pre
// pula SÓ a entrada do hero (ver v4.css); os reveals por scroll continuam.
const root = document.getElementById('root')!
if (root.hasChildNodes()) {
  document.documentElement.classList.add('pre')
}

createRoot(root).render(
  <StrictMode>
    <ContentProvider frozen={isFrozenRoute}>
      <App />
    </ContentProvider>
  </StrictMode>,
)
