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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider frozen={isFrozenRoute}>
      <App />
    </ContentProvider>
  </StrictMode>,
)
