import './App.css'
import { lazy, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Footer } from './components/Footer'
import { LegalPage } from './components/LegalPage'
import { antipiracySections, privacySections, termsSections } from './legal/legalContent'
import AppV4 from './v4/AppV4'

// A LP anterior ("v1", oficial até 2026-06-11) fica preservada em /v1 — lazy
// para o bundle da página oficial (V4) não carregar as seções antigas.
const AppV1 = lazy(() => import('./AppV1'))

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

  // /v4 era o preview do redesign; desde 2026-06-11 ele É a raiz. O redirect
  // mantém vivos os links compartilhados durante a revisão.
  if (pathname === '/v4') {
    if (typeof window !== 'undefined') {
      window.location.replace('/')
    }
    return null
  }

  const legalPages = {
    '/politica-de-privacidade': {
      title: 'Política de Privacidade',
      slug: 'privacidade',
      sections: privacySections,
    },
    '/termos-de-uso': {
      title: 'Termos de Uso',
      slug: 'termos',
      sections: termsSections,
    },
    '/medidas-antipiratarias': {
      title: 'Medidas Antipiratarias',
      slug: 'antipirataria',
      sections: antipiracySections,
    },
  } as const
  const legalPage = legalPages[pathname as keyof typeof legalPages]

  if (legalPage) {
    return (
      <div className="font-sans">
        <LegalPage title={legalPage.title} sections={legalPage.sections} slug={legalPage.slug} />
        <Footer />
      </div>
    )
  }

  // LP anterior, preservada para consulta/comparação.
  if (pathname === '/v1') {
    return (
      <>
        <Suspense fallback={<div className="min-h-screen bg-[#020617]" />}>
          <AppV1 />
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </>
    )
  }

  // V4 "Solar Dawn" — LP oficial na raiz desde 2026-06-11.
  return (
    <>
      <AppV4 />
      <Analytics />
      <SpeedInsights />
    </>
  )
}

export default App
