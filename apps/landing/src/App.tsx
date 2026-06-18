import './App.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { LegalPage } from './components/LegalPage'
import { Footer } from './components/Footer'
import { antipiracySections, privacySections, termsSections } from './legal/legalContent'
import AppV1 from './AppV1'
import AppV4 from './v4/AppV4'

// LP OFICIAL = o redesign V4 "Solar Dawn" (src/v4/AppV4.tsx), renderizado na
// raiz "/". A versão antiga "v1" (src/AppV1.tsx) fica acessível em /v1 para
// referência/rollback. (/v4 continua válido — cai no mesmo default da raiz.)

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

  // LP antiga (v1) preservada em /v1 para referência/rollback.
  if (pathname === '/v1') {
    return (
      <>
        <AppV1 />
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

  // LP oficial = V4 "Solar Dawn" (raiz e qualquer rota não especial, ex.: /v4).
  return (
    <>
      <AppV4 />
      <Analytics />
      <SpeedInsights />
    </>
  )
}

export default App
