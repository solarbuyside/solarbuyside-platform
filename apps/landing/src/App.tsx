import { lazy, Suspense } from 'react'
import './App.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import AppV4 from './v4/AppV4'

// Rotas secundárias em chunks próprios: a cópia congelada da /1 (componentes +
// v4.css + snapshot de conteúdo) e as páginas legais embarcavam no bundle de
// TODO visitante da raiz — eram boa parte do "JavaScript/CSS não usado" do
// Lighthouse mobile. O custo é um vazio breve nessas rotas entre o mount do
// React e o chunk chegar (o HTML pré-renderizado cobre até o mount).
const AppV4Full = lazy(() => import('./v4-full/AppV4'))
const LegalRoute = lazy(() => import('./LegalRoute'))

const LEGAL_PATHS = ['/politica-de-privacidade', '/termos-de-uso', '/medidas-antipiratarias']

// LP OFICIAL = o redesign V4 "Solar Dawn" (src/v4/AppV4.tsx), renderizado na
// raiz "/".
//
// /1 = cópia CONGELADA da LP atual completa (src/v4-full/, snapshot 2026-07-22).
// A raiz "/" vai perder algumas seções; /1 preserva a versão íntegra. As duas
// pastas são independentes de propósito — editar/remover em v4/ não afeta /1.
//
// Só existem duas páginas: a oficial e a /1. As rotas antigas (/v1, /v2, /v3,
// /v4, /2, /3, /4) agora recebem redirect 308 para a raiz no vercel.json —
// antes elas serviam a LP oficial em URLs paralelas, o que é conteúdo
// duplicado. O src/AppV1.tsx segue no repositório para consulta, mas não é
// mais importado: fora do bundle.

function App() {
  const pathname = window.location.pathname.replace(/\/$/, '') || '/'

  // O admin vive só na plataforma (Next + Supabase + 2FA). Aqui, /admin é
  // tratado como rota inexistente: redireciona para a home da própria LP, sem
  // revelar a URL do painel. Não dar pista do cofre para quem só chuta o
  // domínio público (solarbuyside.com.br/admin) é redução de superfície.
  if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/users') {
    if (typeof window !== 'undefined') {
      window.location.replace('/')
    }
    return null
  }

  // /1 = snapshot congelado da LP atual completa (antes de remover seções na raiz).
  if (pathname === '/1') {
    return (
      <Suspense fallback={null}>
        <AppV4Full />
        <Analytics />
        <SpeedInsights />
      </Suspense>
    )
  }

  if (LEGAL_PATHS.includes(pathname)) {
    return (
      <Suspense fallback={null}>
        <LegalRoute pathname={pathname} />
      </Suspense>
    )
  }

  // Rota desconhecida (/5, /teste, …): os redirects do vercel.json cobrem só
  // caminhos exatos, e o rewrite da SPA entregava a LP oficial em qualquer URL
  // — conteúdo duplicado para o Google. Mesma lógica do /admin acima.
  if (pathname !== '/') {
    if (typeof window !== 'undefined') {
      window.location.replace('/')
    }
    return null
  }

  // LP oficial = V4 "Solar Dawn" na raiz.
  return (
    <>
      <AppV4 />
      <Analytics />
      <SpeedInsights />
    </>
  )
}

export default App
