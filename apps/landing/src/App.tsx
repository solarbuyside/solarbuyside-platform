import './App.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { LegalPage } from './components/LegalPage'
import { Footer } from './components/Footer'
import { antipiracySections, privacySections, termsSections } from './legal/legalContent'
import AppV4 from './v4/AppV4'
import AppV4Full from './v4-full/AppV4'

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
      <>
        <AppV4Full />
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
        <main>
          <LegalPage title={legalPage.title} sections={legalPage.sections} slug={legalPage.slug} />
        </main>
        <Footer />
      </div>
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
