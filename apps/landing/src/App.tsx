import './App.css'
import { lazy, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { LegalPage } from './components/LegalPage'
import { Footer } from './components/Footer'
import { antipiracySections, privacySections, termsSections } from './legal/legalContent'
import AppV1 from './AppV1'

// LP OFICIAL = a versão "v1" (src/AppV1.tsx), renderizada na raiz "/".
// O redesign V4 "Solar Dawn" segue em PREVIEW na rota /v4 (lazy), sem afetar a
// produção. (Houve uma janela em 2026-06-11 em que a V4 foi promovida à raiz;
// revertido a pedido — V4 volta a ser preview em /v4.)
const AppV4 = lazy(() => import('./v4/AppV4'))

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

  // Preview do redesign V4 — carregado sob demanda só em /v4. A LP oficial (/)
  // não é afetada.
  if (pathname === '/v4') {
    return (
      <>
        <Suspense fallback={<div className="min-h-screen bg-[#07090d]" />}>
          <AppV4 />
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </>
    )
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

  // LP oficial (versão v1).
  return (
    <>
      <AppV1 />
      <Analytics />
      <SpeedInsights />
    </>
  )
}

export default App
