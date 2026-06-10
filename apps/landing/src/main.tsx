import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ContentProvider } from './contexts/ContentContext'

// AuthProvider removido do caminho público: a LP não autentica nada (o login
// admin vive só na plataforma). Mantê-lo aqui levava /api/auth/login e a
// lógica de token para o bundle público sem necessidade.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider>
      <App />
    </ContentProvider>
  </StrictMode>,
)
