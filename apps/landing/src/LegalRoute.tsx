import { LegalPage } from './components/LegalPage'
import { Footer } from './components/Footer'
import { antipiracySections, privacySections, termsSections } from './legal/legalContent'

/* Rota legal em chunk próprio (ver App.tsx): o conteúdo dos três documentos
   só baixa quando alguém visita uma dessas páginas. */

const PAGINAS = {
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
    title: 'Medidas Antipirataria',
    slug: 'antipirataria',
    sections: antipiracySections,
  },
} as const

export default function LegalRoute({ pathname }: { pathname: string }) {
  const page = PAGINAS[pathname as keyof typeof PAGINAS]
  if (!page) return null
  return (
    <div className="font-sans">
      <main>
        <LegalPage title={page.title} sections={page.sections} slug={page.slug} />
      </main>
      <Footer />
    </div>
  )
}
