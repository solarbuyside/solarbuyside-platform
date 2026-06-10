import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { ContentProvider } from './contexts/ContentContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ContentProvider>
        <App />
      </ContentProvider>
    </AuthProvider>
  </StrictMode>,
)
