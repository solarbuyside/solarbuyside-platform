import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { LayoutDashboard, FileText, BookOpen, Settings } from 'lucide-react'
import './v4.css'
import { Stamp } from './atoms'

/* /design-system — referência pública da identidade visual Solar Buy-Side.

   Dois sistemas, uma chave no topo:
   - SITE (apps/landing): escuro, Sora/Manrope/Fraunces/JetBrains Mono.
     Fonte da verdade: src/v4/v4.css + design-landing.md.
   - SISTEMA (apps/platform): claro, Outfit, navy na lateral, shadcn.
     Fonte da verdade: apps/platform/src/app/globals.css + design.md.
   Único ponto comum: o laranja #F97316.

   Os valores abaixo são escritos à mão a partir desses arquivos (e da contagem
   de uso no código, para separar primária de apoio). Mudou token lá, atualize
   aqui.

   Rota em chunk próprio (App.tsx), pré-renderizada com noindex
   (scripts/prerender.mjs). Os botões de exemplo são réplicas visuais, não o
   <Cta>: ele dispara cta_click no analytics e poluiria o funil. */

type Marca = 'site' | 'sistema'
type Cor = { nome: string; hex: string; uso: string }
type Grupo = { titulo: string; nota?: string; cores: Cor[] }
type Familia = { nome: string; funcao: string; pesos: string; amostra: string; link: string }
type Estilo = { estilo: string; cls: string; fonte: string; tamanho: string; peso: string; altura: string; espaco: string }

/* ── Tema da própria página ─────────────────────────────────────────── */

const TEMAS = {
  site: {
    page: 'bg-[#07090d] text-slate-300',
    header: 'border-white/[0.08] bg-[#07090d]/85',
    line: 'border-white/[0.08]',
    lineSoft: 'border-white/[0.06]',
    panel: 'border-white/[0.08] bg-white/[0.02]',
    hover: 'hover:border-white/[0.16]',
    h: 'text-white',
    body: 'text-slate-300',
    muted: 'text-slate-400',
    subtle: 'text-slate-500',
    value: 'text-slate-200',
    link: 'text-orange-400 hover:text-orange-300',
    titulo: "font-['Sora'] tracking-[-0.025em]",
    chip: 'border-white/[0.1] text-slate-300',
    toggle: 'border-white/[0.1] bg-white/[0.04]',
    toggleOn: 'bg-white text-[#07090d]',
    toggleOff: 'text-slate-400 hover:text-white',
  },
  sistema: {
    page: "bg-[#f8fafc] text-slate-700 font-['Outfit']",
    header: 'border-slate-200 bg-white/85',
    line: 'border-slate-200',
    lineSoft: 'border-slate-100',
    panel: 'border-slate-200 bg-white shadow-sm',
    hover: 'hover:border-slate-300',
    h: 'text-slate-900',
    body: 'text-slate-700',
    muted: 'text-slate-500',
    subtle: 'text-slate-400',
    value: 'text-slate-800',
    link: 'text-orange-600 hover:text-orange-700',
    titulo: "!font-['Outfit'] tracking-tight", // !: .v4-root h1-h4 força Sora
    chip: 'border-slate-200 bg-white text-slate-700',
    toggle: 'border-slate-200 bg-slate-100',
    toggleOn: 'bg-white text-slate-900 shadow-sm',
    toggleOff: 'text-slate-500 hover:text-slate-900',
  },
}
type Tema = (typeof TEMAS)['site']
const TemaCtx = createContext<Tema>(TEMAS.site)
const useTema = () => useContext(TemaCtx)

/* ── SITE ───────────────────────────────────────────────────────────── */

const SITE_GRADIENTE = 'linear-gradient(100deg, #fb923c 0%, #f97316 35%, #fcd34d 60%, #f97316 85%, #fb923c 100%)'

const SITE_CORES: Grupo[] = [
  {
    titulo: 'Primária',
    nota: 'Cor de ação e de marca.',
    cores: [
      { nome: 'Laranja', hex: '#F97316', uso: 'Botões, destaques e links.' },
      { nome: 'Laranja escuro', hex: '#EA580C', uso: 'Base do botão principal.' },
      { nome: 'Laranja claro', hex: '#FB923C', uso: 'Rótulos sobre fundo escuro.' },
    ],
  },
  {
    titulo: 'Acento e apoio',
    nota: 'Uso pontual.',
    cores: [
      { nome: 'Azul', hex: '#3B82F6', uso: 'Exclusivo do lado comprador.' },
      { nome: 'Âmbar', hex: '#FBBF24', uso: 'Detalhes e avaliações.' },
    ],
  },
  {
    titulo: 'Fundos',
    nota: 'Não usar preto puro.',
    cores: [
      { nome: 'Night', hex: '#07090D', uso: 'Fundo padrão.' },
      { nome: 'Night Deep', hex: '#050608', uso: 'Seção de vídeo.' },
      { nome: 'Ember', hex: '#0B0807', uso: 'Seção de oferta.' },
    ],
  },
  {
    titulo: 'Texto sobre fundo escuro',
    cores: [
      { nome: 'Branco', hex: '#FFFFFF', uso: 'Títulos.' },
      { nome: 'Slate 300', hex: '#CBD5E1', uso: 'Texto corrido.' },
      { nome: 'Slate 400', hex: '#94A3B8', uso: 'Texto de apoio.' },
      { nome: 'Slate 500', hex: '#64748B', uso: 'Legendas e rodapé.' },
    ],
  },
  {
    titulo: 'Superfícies claras',
    nota: 'Seções pontuais, não um tema claro.',
    cores: [
      { nome: 'Paper', hex: '#F2ECE1', uso: 'Fundo da seção editorial.' },
      { nome: 'Ink', hex: '#181410', uso: 'Texto sobre Paper.' },
      { nome: 'Ink Soft', hex: '#4F463C', uso: 'Texto de apoio sobre Paper.' },
      { nome: 'Mist', hex: '#F7F8FA', uso: 'Fundo dos depoimentos.' },
    ],
  },
]

const SITE_BORDAS = [
  { nome: 'Borda', valor: 'rgba(255, 255, 255, 0.08)', uso: 'Padrão sobre fundo escuro.', fundo: '#07090d' },
  { nome: 'Borda ativa', valor: 'rgba(255, 255, 255, 0.16)', uso: 'Hover e foco.', fundo: '#07090d' },
  { nome: 'Borda clara', valor: 'rgba(24, 20, 16, 0.14)', uso: 'Sobre Paper.', fundo: '#f2ece1' },
]

const SITE_FAMILIAS: Familia[] = [
  { nome: 'Sora', funcao: 'Títulos', pesos: '700, 800', amostra: "font-['Sora'] font-extrabold", link: 'https://fonts.google.com/specimen/Sora' },
  { nome: 'Manrope', funcao: 'Texto e interface', pesos: '400, 500, 600, 700', amostra: "font-['Manrope'] font-medium", link: 'https://fonts.google.com/specimen/Manrope' },
  { nome: 'Fraunces', funcao: 'Ênfase em títulos', pesos: '480 itálico', amostra: 'v4-serif', link: 'https://fonts.google.com/specimen/Fraunces' },
  { nome: 'JetBrains Mono', funcao: 'Rótulos e números', pesos: '700', amostra: 'v4-mono font-bold', link: 'https://fonts.google.com/specimen/JetBrains+Mono' },
]

/* Valores reais dos componentes da LP (HeroV4, seções, .v4-kicker). */
const SITE_ESCALA: Estilo[] = [
  { estilo: 'Display', cls: "font-['Sora'] text-[2.2rem] font-extrabold leading-[1.06] tracking-[-0.03em] text-white", fonte: 'Sora', tamanho: '42 a 78 px', peso: '800', altura: '1.06', espaco: '-3%' },
  { estilo: 'Título 1', cls: "font-['Sora'] text-[1.75rem] font-extrabold leading-[1.08] tracking-[-0.025em] text-white", fonte: 'Sora', tamanho: '32 a 58 px', peso: '800', altura: '1.08', espaco: '-2,5%' },
  { estilo: 'Título 2', cls: "font-['Sora'] text-[1.375rem] font-bold tracking-[-0.025em] text-white", fonte: 'Sora', tamanho: '20 a 24 px', peso: '700', altura: '1.3', espaco: '-2,5%' },
  { estilo: 'Ênfase', cls: 'v4-serif text-[1.75rem] leading-[1.08] text-orange-400', fonte: 'Fraunces', tamanho: 'Igual ao título', peso: '480 itálico', altura: '1.08', espaco: '-1,5%' },
  { estilo: 'Texto grande', cls: 'text-lg text-slate-300', fonte: 'Manrope', tamanho: '18 px', peso: '400', altura: '1.625', espaco: '0' },
  { estilo: 'Texto', cls: 'text-base text-slate-300', fonte: 'Manrope', tamanho: '16 px', peso: '400', altura: '1.625', espaco: '0' },
  { estilo: 'Rótulo', cls: 'v4-mono text-[0.72rem] font-bold uppercase tracking-[0.24em] text-orange-400', fonte: 'JetBrains Mono', tamanho: '11,5 px', peso: '700', altura: '1.5', espaco: '24%' },
]

const SITE_TOKENS = `:root {
  /* Primária */
  --sbs-orange: #f97316;
  --sbs-orange-dark: #ea580c;
  --sbs-orange-light: #fb923c;

  /* Acento e apoio */
  --sbs-blue: #3b82f6;
  --sbs-amber: #fbbf24;

  /* Fundos */
  --sbs-night: #07090d;
  --sbs-night-deep: #050608;
  --sbs-ember: #0b0807;

  /* Texto sobre fundo escuro */
  --sbs-text: #ffffff;
  --sbs-text-body: #cbd5e1;
  --sbs-text-muted: #94a3b8;
  --sbs-text-subtle: #64748b;

  /* Superfícies claras */
  --sbs-paper: #f2ece1;
  --sbs-ink: #181410;
  --sbs-ink-soft: #4f463c;
  --sbs-mist: #f7f8fa;

  /* Bordas */
  --sbs-border: rgba(255, 255, 255, 0.08);
  --sbs-border-active: rgba(255, 255, 255, 0.16);
  --sbs-border-light: rgba(24, 20, 16, 0.14);

  /* Gradiente */
  --sbs-gradient: ${SITE_GRADIENTE};

  /* Tipografia (Google Fonts) */
  --sbs-font-heading: 'Sora', sans-serif;
  --sbs-font-body: 'Manrope', sans-serif;
  --sbs-font-accent: 'Fraunces', serif;
  --sbs-font-label: 'JetBrains Mono', monospace;
}`

/* ── SISTEMA ────────────────────────────────────────────────────────── */

const SIS_LATERAL = 'linear-gradient(160deg, #020719 0%, #061233 55%, #0a1e4d 100%)'

const SIS_CORES: Grupo[] = [
  {
    titulo: 'Primária',
    nota: 'Mesmo laranja do site.',
    cores: [
      { nome: 'Laranja', hex: '#F97316', uso: 'Botão principal, item ativo, foco.' },
      { nome: 'Laranja escuro', hex: '#EA580C', uso: 'Texto de etiqueta laranja.' },
    ],
  },
  {
    titulo: 'Navy',
    nota: 'Estrutura: lateral e cabeçalhos.',
    cores: [
      { nome: 'Navy 950', hex: '#020719', uso: 'Lateral, topo.' },
      { nome: 'Navy 900', hex: '#061233', uso: 'Lateral, meio.' },
      { nome: 'Navy 800', hex: '#0A1E4D', uso: 'Lateral, base.' },
      { nome: 'Navy tabela', hex: '#09143C', uso: 'Cabeçalho de tabela.' },
      { nome: 'Navy mobile', hex: '#050D24', uso: 'Barras no celular.' },
    ],
  },
  {
    titulo: 'Neutros',
    cores: [
      { nome: 'Fundo', hex: '#F8FAFC', uso: 'Fundo das páginas.' },
      { nome: 'Superfície', hex: '#FFFFFF', uso: 'Cartões e modais.' },
      { nome: 'Secundário', hex: '#F1F5F9', uso: 'Botão secundário, zebra.' },
      { nome: 'Borda', hex: '#E2E8F0', uso: 'Bordas e campos.' },
    ],
  },
  {
    titulo: 'Texto',
    cores: [
      { nome: 'Título', hex: '#0F172A', uso: 'Títulos.' },
      { nome: 'Corpo', hex: '#334155', uso: 'Texto corrido.' },
      { nome: 'Apoio', hex: '#64748B', uso: 'Subtítulos e legendas.' },
    ],
  },
  {
    titulo: 'Status',
    cores: [
      { nome: 'Sucesso', hex: '#059669', uso: 'Aprovado, concluído.' },
      { nome: 'Atenção', hex: '#D97706', uso: 'Pendência, alerta.' },
      { nome: 'Erro', hex: '#EF4444', uso: 'Erro, ação destrutiva.' },
    ],
  },
]

const SIS_FAMILIAS: Familia[] = [
  { nome: 'Outfit', funcao: 'Família única: títulos, texto e interface', pesos: '400, 500, 600, 700', amostra: "font-['Outfit'] font-semibold", link: 'https://fonts.google.com/specimen/Outfit' },
]

/* Valores reais das páginas da plataforma (dashboard, avaliações, ui/). */
const SIS_ESCALA: Estilo[] = [
  { estilo: 'Título de página', cls: "font-['Outfit'] text-3xl font-bold tracking-tight text-slate-900", fonte: 'Outfit', tamanho: '30 px', peso: '700', altura: '1.2', espaco: '-2,5%' },
  { estilo: 'Título de cartão', cls: "font-['Outfit'] text-2xl font-semibold tracking-tight text-slate-900", fonte: 'Outfit', tamanho: '24 px', peso: '600', altura: '1', espaco: '-2,5%' },
  { estilo: 'Título de bloco', cls: "font-['Outfit'] text-xl font-bold tracking-tight text-slate-900", fonte: 'Outfit', tamanho: '20 px', peso: '700', altura: '1.4', espaco: '-2,5%' },
  { estilo: 'Texto', cls: "font-['Outfit'] text-base text-slate-700", fonte: 'Outfit', tamanho: '16 px', peso: '400', altura: '1.5', espaco: '0' },
  { estilo: 'Subtítulo', cls: "font-['Outfit'] text-sm font-medium text-slate-500", fonte: 'Outfit', tamanho: '14 px', peso: '500', altura: '1.43', espaco: '0' },
  { estilo: 'Cabeçalho de tabela', cls: "font-['Outfit'] text-xs font-semibold uppercase tracking-wider text-slate-900", fonte: 'Outfit', tamanho: '12 px', peso: '600', altura: '1.33', espaco: '5%' },
]

const SIS_TOKENS = `:root {
  /* Primária */
  --primary: 24 95% 53%;            /* #f97316 */
  --primary-foreground: 0 0% 100%;  /* #ffffff */
  --ring: 24 95% 53%;               /* #f97316 */

  /* Neutros */
  --background: 210 40% 98%;        /* #f8fafc */
  --foreground: 222.2 84% 4.9%;     /* #020817 */
  --card: 0 0% 100%;                /* #ffffff */
  --secondary: 210 40% 96.1%;       /* #f1f5f9 */
  --muted: 210 40% 96.1%;           /* #f1f5f9 */
  --muted-foreground: 215.4 16.3% 46.9%; /* #64748b */
  --border: 214.3 31.8% 91.4%;      /* #e2e8f0 */
  --input: 214.3 31.8% 91.4%;       /* #e2e8f0 */

  /* Status */
  --destructive: 0 84.2% 60.2%;     /* #ef4444 */

  /* Navy */
  --navy-950: #020719;
  --navy-900: #061233;
  --navy-800: #0a1e4d;
  --navy-table: #09143c;
  --navy-mobile: #050d24;
  --sidebar: ${SIS_LATERAL};

  /* Forma e tipografia */
  --radius: 0.75rem;                /* 12px */
  --font-sans: 'Outfit', sans-serif;
}`

const SECOES = [
  { id: 'cores', label: 'Cores' },
  { id: 'tipografia', label: 'Tipografia' },
  { id: 'componentes', label: 'Componentes' },
  { id: 'logotipo', label: 'Logotipo' },
  { id: 'tokens', label: 'Tokens' },
]

/* ── Utilidades ─────────────────────────────────────────────────────── */

function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

/* Clipboard pode faltar (http, iframe): falha silenciosa, o valor segue na tela. */
function useCopiar() {
  const [copiado, setCopiado] = useState<string | null>(null)
  useEffect(() => {
    if (!copiado) return
    const t = setTimeout(() => setCopiado(null), 1600)
    return () => clearTimeout(t)
  }, [copiado])
  const copiar = async (valor: string) => {
    try {
      await navigator.clipboard.writeText(valor)
      setCopiado(valor)
    } catch {
      /* sem clipboard */
    }
  }
  return { copiado, copiar }
}

function useSecaoAtiva(chave: string) {
  const [ativa, setAtiva] = useState(SECOES[0].id)
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visivel) setAtiva(visivel.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )
    SECOES.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [chave])
  return ativa
}

/* Outfit não é carregada pela LP: só baixa quando alguém abre a aba Sistema. */
function useOutfit(ligado: boolean) {
  useEffect(() => {
    if (!ligado || document.getElementById('ds-outfit')) return
    const link = document.createElement('link')
    link.id = 'ds-outfit'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap'
    document.head.appendChild(link)
  }, [ligado])
}

/* ── Blocos ─────────────────────────────────────────────────────────── */

function Secao({ id, n, titulo, descricao, children }: { id: string; n: string; titulo: string; descricao: string; children: ReactNode }) {
  const t = useTema()
  return (
    <section id={id} className={`border-t py-16 md:py-20 ${t.line}`}>
      <p className={`v4-mono text-xs font-bold ${t.subtle}`}>{n}</p>
      <h2 className={`mt-2 text-3xl font-bold md:text-[2.5rem] ${t.titulo} ${t.h}`}>{titulo}</h2>
      <p className={`mt-3 max-w-2xl text-base leading-relaxed ![hyphens:manual] ${t.muted}`}>{descricao}</p>
      <div className="mt-12 space-y-14">{children}</div>
    </section>
  )
}

function Sub({ titulo, nota, children, className = '' }: { titulo: string; nota?: string; children: ReactNode; className?: string }) {
  const t = useTema()
  return (
    <div className={className}>
      <div className="mb-5 flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
        <h3 className={`text-base font-bold ${t.titulo} ${t.h}`}>{titulo}</h3>
        {nota ? <p className={`text-sm ![hyphens:manual] ${t.subtle}`}>{nota}</p> : null}
      </div>
      {children}
    </div>
  )
}

function Painel({ children, className = '' }: { children: ReactNode; className?: string }) {
  const t = useTema()
  return <div className={`rounded-xl border ${t.panel} ${className}`}>{children}</div>
}

function Specs({ itens }: { itens: [string, string][] }) {
  const t = useTema()
  return (
    <dl className={`grid grid-cols-1 gap-x-8 gap-y-2 border-t p-5 text-sm sm:grid-cols-2 ${t.line}`}>
      {itens.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4">
          <dt className={t.subtle}>{k}</dt>
          <dd className={`v4-mono text-right text-[0.78rem] ${t.value}`}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function Swatches({ cores, copiado, copiar }: { cores: Cor[]; copiado: string | null; copiar: (v: string) => void }) {
  const t = useTema()
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {cores.map((cor) => (
        <button
          key={cor.hex}
          type="button"
          onClick={() => copiar(cor.hex)}
          title="Copiar HEX"
          className={`flex flex-col overflow-hidden rounded-xl border text-left transition-colors ${t.panel} ${t.hover}`}
        >
          <div className={`h-24 w-full border-b ${t.lineSoft}`} style={{ background: cor.hex }} />
          <div className="w-full flex-1 p-3.5">
            <p className={`text-sm font-semibold ${t.h}`}>{cor.nome}</p>
            <dl className="v4-mono mt-2 space-y-0.5 text-[0.7rem] leading-relaxed">
              <div className="flex justify-between gap-2">
                <dt className={t.subtle}>HEX</dt>
                <dd className={t.value}>{copiado === cor.hex ? 'Copiado' : cor.hex}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className={t.subtle}>RGB</dt>
                <dd className={t.value}>{rgb(cor.hex)}</dd>
              </div>
            </dl>
            <p className={`mt-2.5 text-xs leading-snug ${t.muted}`}>{cor.uso}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

function Gradiente({ css, paradas, copiado, copiar }: { css: string; paradas: [string, string][]; copiado: string | null; copiar: (v: string) => void }) {
  const t = useTema()
  return (
    <Painel className="overflow-hidden">
      <div className="h-28 w-full" style={{ background: css }} />
      <div className={`grid border-t ${t.line}`} style={{ gridTemplateColumns: `repeat(${paradas.length}, minmax(0, 1fr))` }}>
        {paradas.map(([hex, pos]) => (
          <div key={pos} className={`border-r p-3 last:border-r-0 ${t.lineSoft}`}>
            <p className={`v4-mono text-[0.7rem] ${t.value}`}>{hex}</p>
            <p className={`v4-mono text-[0.68rem] ${t.subtle}`}>{pos}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => copiar(css)}
        className={`v4-mono block w-full border-t px-4 py-3 text-left text-[0.7rem] leading-relaxed transition-colors ${t.line} ${t.muted}`}
      >
        {copiado === css ? 'Copiado' : css}
      </button>
    </Painel>
  )
}

function Familias({ familias }: { familias: Familia[] }) {
  const t = useTema()
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {familias.map((f) => (
        <Painel key={f.nome} className="flex flex-col">
          <div className="flex h-36 items-center px-6">
            <span className={`text-6xl leading-none ${t.h} ${f.amostra}`}>Aa</span>
          </div>
          <div className={`flex items-end justify-between gap-4 border-t p-5 ${t.line}`}>
            <div>
              <p className={`text-base font-semibold ${t.h}`}>{f.nome}</p>
              <p className={`mt-0.5 text-sm ${t.muted}`}>{f.funcao}</p>
              <p className={`v4-mono mt-2 text-[0.7rem] ${t.subtle}`}>{`Pesos ${f.pesos}`}</p>
            </div>
            <a href={f.link} target="_blank" rel="noopener noreferrer" className={`shrink-0 text-sm font-semibold ${t.link}`}>
              Google Fonts
            </a>
          </div>
        </Painel>
      ))}
    </div>
  )
}

function Escala({ escala }: { escala: Estilo[] }) {
  const t = useTema()
  return (
    <Painel className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className={`border-b text-xs ${t.line} ${t.subtle}`}>
            {['Estilo', 'Fonte', 'Tamanho', 'Peso', 'Altura de linha', 'Espaçamento'].map((c) => (
              <th key={c} className="px-5 py-3 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {escala.map((e) => (
            <tr key={e.estilo} className={`border-b last:border-b-0 ${t.lineSoft}`}>
              <td className="px-5 py-5 align-middle">
                <span className={`block whitespace-nowrap ${e.cls}`}>{e.estilo}</span>
              </td>
              <td className={`px-5 py-5 ${t.body}`}>{e.fonte}</td>
              {[e.tamanho, e.peso, e.altura, e.espaco].map((v, i) => (
                <td key={i} className={`v4-mono px-5 py-5 text-[0.78rem] ${t.value}`}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Painel>
  )
}

function Logos({ fundos }: { fundos: { fundo: string; nome: string }[] }) {
  const t = useTema()
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {fundos.map((v) => (
          <Painel key={v.nome} className="overflow-hidden">
            <div className="flex h-48 items-center justify-center" style={{ background: v.fundo }}>
              <img src="/assets/LOGOSOLARBUYSIDE3.png" alt="" width={88} height={88} className="h-[88px] w-[88px]" />
            </div>
            <p className={`border-t px-4 py-3 text-sm ${t.line} ${t.muted}`}>{`Sobre ${v.nome}`}</p>
          </Painel>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <a
          href="/assets/LOGOSOLARBUYSIDE3.png"
          download="solar-buy-side-simbolo.png"
          className={`inline-flex items-center rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors ${t.chip} ${t.hover}`}
        >
          Baixar PNG
        </a>
        <span className={`v4-mono text-xs ${t.subtle}`}>191 × 192 px</span>
      </div>
    </>
  )
}

function Tokens({ css, arquivo, copiado, copiar }: { css: string; arquivo: string; copiado: string | null; copiar: (v: string) => void }) {
  const t = useTema()
  return (
    <Painel className="overflow-hidden">
      <div className={`flex items-center justify-between border-b px-5 py-3 ${t.line}`}>
        <span className={`v4-mono text-xs ${t.subtle}`}>{arquivo}</span>
        <button type="button" onClick={() => copiar(css)} className={`text-sm font-semibold ${t.link}`}>
          {copiado === css ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className={`v4-mono max-h-[480px] overflow-auto p-5 text-[0.78rem] leading-relaxed ${t.body}`}>{css}</pre>
    </Painel>
  )
}

/* ── Componentes de cada sistema ────────────────────────────────────── */

const BTN_SITE_PRIMARIO =
  'inline-flex items-center rounded-full bg-gradient-to-b from-orange-500 to-orange-600 px-7 py-4 text-sm font-bold tracking-tight text-white shadow-[0_14px_36px_-10px_rgba(249,115,22,0.55),inset_0_1px_0_rgba(255,255,255,0.25)] md:text-base'
const BTN_SITE_SECUNDARIO =
  'inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-7 py-4 text-sm font-bold tracking-tight text-slate-200 md:text-base'

function ComponentesSite() {
  return (
    <>
      <Sub titulo="Botões">
        <Painel>
          <div className="flex flex-wrap items-center gap-4 p-6 md:p-8">
            <span className={BTN_SITE_PRIMARIO}>Primário</span>
            <span className={BTN_SITE_SECUNDARIO}>Secundário</span>
            <span className="inline-flex items-center rounded-full border border-[#181410]/25 bg-[#f2ece1] px-7 py-4 text-sm font-bold tracking-tight text-[#181410] md:text-base">
              Sobre Paper
            </span>
          </div>
          <Specs
            itens={[
              ['Raio', 'total (pílula)'],
              ['Padding', '16 × 28 px'],
              ['Fonte', 'Manrope 700, 14 a 16 px'],
              ['Primário', '#F97316 → #EA580C'],
              ['Secundário', 'fundo 4%, borda 15%'],
              ['Tamanho grande', '20 × 40 px'],
            ]}
          />
        </Painel>
      </Sub>

      <div className="grid gap-14 md:grid-cols-2 md:gap-3">
        <Sub titulo="Rótulo de seção" className="flex flex-col">
          <Painel className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col justify-center gap-5 p-6 md:p-8">
              <span className="v4-kicker text-orange-400">Sobre fundo escuro</span>
              <div className="rounded-lg bg-[#f2ece1] px-4 py-3">
                <span className="v4-kicker text-orange-700">Sobre Paper</span>
              </div>
            </div>
            <Specs itens={[['Fonte', 'JetBrains Mono 700'], ['Tamanho', '11,5 px'], ['Espaçamento', '24%'], ['Traço', '32 × 1 px']]} />
          </Painel>
        </Sub>
        <Sub titulo="Cartão" className="flex flex-col">
          <Painel className="flex flex-1 flex-col">
            <div className="flex flex-1 items-center p-6 md:p-8">
              <div className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <span className="v4-kicker text-orange-400">Rótulo</span>
                <p className="mt-3 font-['Sora'] text-lg font-bold tracking-tight text-white">Título do cartão</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">Texto de apoio.</p>
              </div>
            </div>
            <Specs itens={[['Fundo', 'branco 3%'], ['Borda', 'branco 8%'], ['Raio', '16 a 24 px'], ['Padding', '20 a 32 px']]} />
          </Painel>
        </Sub>
      </div>

      <Sub titulo="Selo">
        <Painel>
          <div className="flex flex-wrap items-center gap-8 p-6 md:p-8">
            <Stamp text="Garantia de 7 dias" tone="orange" size={112}>
              <span className="font-['Sora'] text-2xl font-extrabold text-white">7</span>
            </Stamp>
            <div className="rounded-full bg-[#f2ece1] p-1">
              <Stamp text="Solar Buy-Side" tone="ink" size={104} />
            </div>
          </div>
          <Specs itens={[['Uso', 'garantia e certificação'], ['Texto', 'JetBrains Mono 700'], ['Rotação', 'contínua, lenta'], ['Cores', 'Laranja ou Ink']]} />
        </Painel>
      </Sub>
    </>
  )
}

function ComponentesSistema() {
  const badge = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold'
  return (
    <>
      <Sub titulo="Botões">
        <Painel>
          <div className="flex flex-wrap items-center gap-3 p-6 md:p-8">
            <span className="inline-flex h-11 items-center rounded-xl bg-[#f97316] px-5 text-base font-medium text-white">Primário</span>
            <span className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-slate-100 px-5 text-base font-medium text-slate-800">Secundário</span>
            <span className="inline-flex h-11 items-center rounded-xl border border-slate-200 px-5 text-base font-medium text-slate-900">Contorno</span>
            <span className="inline-flex h-11 items-center rounded-xl px-5 text-base font-medium text-slate-600">Fantasma</span>
            <span className="inline-flex h-11 items-center rounded-xl bg-[#ef4444] px-5 text-base font-medium text-white">Destrutivo</span>
          </div>
          <Specs
            itens={[
              ['Raio', '12 px'],
              ['Fonte', 'Outfit 500'],
              ['Pequeno', '36 px, 14 px'],
              ['Médio', '44 px, 16 px'],
              ['Grande', '52 px, 18 px'],
              ['Hover primário', 'brilho laranja 40%'],
            ]}
          />
        </Painel>
      </Sub>

      <div className="grid gap-14 md:grid-cols-2 md:gap-3">
        <Sub titulo="Etiquetas" className="flex flex-col">
          <Painel className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-wrap content-center items-center gap-2 p-6 md:p-8">
              <span className={`${badge} border-orange-500/20 bg-orange-500/10 text-orange-600`}>Padrão</span>
              <span className={`${badge} border-slate-200 bg-slate-100 text-slate-600`}>Neutra</span>
              <span className={`${badge} border-emerald-500/20 bg-emerald-500/10 text-emerald-700`}>Sucesso</span>
              <span className={`${badge} border-amber-500/20 bg-amber-500/10 text-amber-700`}>Atenção</span>
              <span className={`${badge} border-red-500/25 bg-red-500/10 text-red-500`}>Erro</span>
            </div>
            <Specs itens={[['Fundo', 'cor a 10%'], ['Borda', 'cor a 20%'], ['Fonte', 'Outfit 600, 12 px'], ['Raio', 'total']]} />
          </Painel>
        </Sub>
        <Sub titulo="Cartão" className="flex flex-col">
          <Painel className="flex flex-1 flex-col">
            <div className="flex flex-1 items-center bg-[#f8fafc] p-6 md:p-8">
              <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-2xl font-semibold leading-none tracking-tight text-slate-900">Título do cartão</p>
                <p className="mt-2 text-sm text-slate-500">Texto de apoio.</p>
              </div>
            </div>
            <Specs itens={[['Fundo', '#FFFFFF'], ['Borda', '#E2E8F0'], ['Raio', '12 px'], ['Padding', '24 px']]} />
          </Painel>
        </Sub>
      </div>

      <Sub titulo="Tabela">
        <Painel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-[#09143c]">
                <tr>
                  {['Integradora', 'Índice', 'Status'].map((c) => (
                    <th key={c} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Integradora A', '8,6', 'Aprovada', 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'],
                  ['Integradora B', '7,2', 'Em análise', 'border-amber-500/20 bg-amber-500/10 text-amber-700'],
                  ['Integradora C', '5,4', 'Reprovada', 'border-red-500/25 bg-red-500/10 text-red-500'],
                ].map(([nome, nota, status, cls], i) => (
                  <tr key={nome} className={i % 2 ? 'bg-[#f1f5f9]' : 'bg-white'}>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{nome}</td>
                    <td className="px-5 py-3.5 text-slate-700">{nota}</td>
                    <td className="px-5 py-3.5">
                      <span className={`${badge} ${cls}`}>{status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Specs itens={[['Cabeçalho', '#09143C, 12 px caixa alta'], ['Linhas', 'zebra #FFFFFF / #F1F5F9']]} />
        </Painel>
      </Sub>

      <Sub titulo="Navegação lateral">
        <Painel className="overflow-hidden">
          <div className="grid md:grid-cols-[256px_1fr]">
            <div className="relative px-4 py-6" style={{ background: SIS_LATERAL }}>
              <div className="mb-6 flex items-center gap-3 px-2">
                <img src="/assets/LOGOSOLARBUYSIDE3.png" alt="" width={32} height={32} className="h-8 w-8" />
                <span className="text-base font-bold tracking-tight text-white">Solar Buy-Side</span>
              </div>
              <ul className="space-y-1.5">
                {[
                  { Icone: LayoutDashboard, label: 'Painel', ativo: true },
                  { Icone: FileText, label: 'Avaliações' },
                  { Icone: BookOpen, label: 'Manual' },
                  { Icone: Settings, label: 'Configurações' },
                ].map(({ Icone, label, ativo }) => (
                  <li
                    key={label}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${ativo ? 'bg-white/[0.03] text-white' : 'text-slate-400'}`}
                  >
                    {ativo ? <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-md bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.6)]" /> : null}
                    <Icone className={`h-4 w-4 ${ativo ? 'text-[#f97316]' : 'text-slate-400'}`} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden items-center bg-[#f8fafc] p-8 md:flex">
              <div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">Painel</p>
                <p className="mt-1 text-sm font-medium text-slate-500">Conteúdo da página sobre o fundo #F8FAFC.</p>
              </div>
            </div>
          </div>
          <Specs
            itens={[
              ['Fundo', 'gradiente navy 160°'],
              ['Largura', '256 px, recolhida 80 px'],
              ['Item ativo', 'texto branco, ícone laranja'],
              ['Marcador', '3 × 24 px, laranja'],
            ]}
          />
        </Painel>
      </Sub>
    </>
  )
}

/* ── Página ─────────────────────────────────────────────────────────── */

export default function DesignSystemV4() {
  const [marca, setMarca] = useState<Marca>(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('v') === 'sistema' ? 'sistema' : 'site',
  )
  const t = TEMAS[marca]
  const site = marca === 'site'
  const { copiado, copiar } = useCopiar()
  const ativa = useSecaoAtiva(marca)
  useOutfit(!site)

  useEffect(() => {
    document.title = 'Design System — Solar Buy-Side'
  }, [])

  const trocar = (m: Marca) => {
    setMarca(m)
    const url = new URL(window.location.href)
    if (m === 'sistema') url.searchParams.set('v', 'sistema')
    else url.searchParams.delete('v')
    window.history.replaceState(null, '', url)
  }

  return (
    <TemaCtx.Provider value={t}>
      <div className={`v4-root min-h-screen antialiased transition-colors duration-300 ${t.page}`}>
        <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${t.header}`}>
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <a href="/" className="flex shrink-0 items-center gap-2.5">
                <img src="/assets/LOGOSOLARBUYSIDE3.png" alt="" width={28} height={28} className="h-7 w-7" />
                <span className={`hidden text-sm font-bold tracking-tight sm:inline ${t.titulo} ${t.h}`}>Solar Buy-Side</span>
              </a>
              <span className={`hidden h-4 w-px sm:block ${site ? 'bg-white/15' : 'bg-slate-300'}`} aria-hidden />
              <span className={`truncate text-sm ${t.muted}`}>Design System</span>
            </div>
            <div className={`flex rounded-lg border p-0.5 ${t.toggle}`} role="tablist" aria-label="Sistema">
              {(['site', 'sistema'] as Marca[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={marca === m}
                  onClick={() => trocar(m)}
                  className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${marca === m ? t.toggleOn : t.toggleOff}`}
                >
                  {m === 'site' ? 'Site' : 'Sistema'}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[200px_1fr] lg:gap-16">
          <aside className="hidden lg:block">
            <nav className="sticky top-14 py-14" aria-label="Seções">
              <p className={`v4-mono mb-4 text-[0.68rem] font-bold uppercase tracking-[0.2em] ${t.subtle}`}>Conteúdo</p>
              <ul className={`space-y-0.5 border-l ${t.line}`}>
                {SECOES.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`-ml-px block border-l py-1.5 pl-4 text-sm transition-colors ${
                        ativa === s.id ? `border-orange-500 font-semibold ${t.h}` : `border-transparent ${t.muted}`
                      }`}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <main className="min-w-0 pb-24">
            <div className="pb-14 pt-12 md:pb-16 md:pt-14">
              <h1 className={`text-4xl font-extrabold md:text-5xl ${t.titulo} ${t.h}`}>{site ? 'Site' : 'Sistema'}</h1>
              <p className={`mt-4 max-w-2xl text-lg leading-relaxed ![hyphens:manual] ${t.muted}`}>
                {site
                  ? 'Padrões visuais do site institucional solarbuyside.com.br.'
                  : 'Padrões visuais da plataforma Solar Buy-Side, a área logada do cliente.'}
              </p>
              <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-sm">
                {(site
                  ? [
                      ['Tema', 'Escuro'],
                      ['Tipografia', 'Sora e Manrope'],
                      ['Versão', '4.0'],
                    ]
                  : [
                      ['Tema', 'Claro'],
                      ['Tipografia', 'Outfit'],
                      ['Base', 'shadcn/ui'],
                    ]
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt className={t.subtle}>{k}</dt>
                    <dd className={`mt-0.5 font-semibold ${t.h}`}>{v}</dd>
                  </div>
                ))}
              </dl>
              <nav className="mt-8 flex flex-wrap gap-2 lg:hidden" aria-label="Seções">
                {SECOES.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className={`rounded-full border px-3.5 py-1.5 text-sm ${t.chip}`}>
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>

            <Secao id="cores" n="01" titulo="Cores" descricao="Clique em uma amostra para copiar o código HEX.">
              {(site ? SITE_CORES : SIS_CORES).map((g) => (
                <Sub key={g.titulo} titulo={g.titulo} nota={g.nota}>
                  <Swatches cores={g.cores} copiado={copiado} copiar={copiar} />
                </Sub>
              ))}
              {site ? (
                <>
                  <Sub titulo="Bordas" nota="Sempre com transparência.">
                    <div className="grid gap-3 md:grid-cols-3">
                      {SITE_BORDAS.map((b) => (
                        <button
                          key={b.nome}
                          type="button"
                          onClick={() => copiar(b.valor)}
                          title="Copiar valor"
                          className="flex flex-col overflow-hidden rounded-xl border border-white/[0.08] text-left transition-colors hover:border-white/[0.16]"
                        >
                          <div className="flex h-24 w-full items-center px-5" style={{ background: b.fundo }}>
                            <div className="h-12 w-full rounded-lg" style={{ border: `1px solid ${b.valor}` }} />
                          </div>
                          <div className="w-full flex-1 bg-white/[0.02] p-3.5">
                            <p className="text-sm font-semibold text-white">{b.nome}</p>
                            <p className="v4-mono mt-2 text-[0.7rem] text-slate-200">{copiado === b.valor ? 'Copiado' : b.valor}</p>
                            <p className="mt-2.5 text-xs text-slate-400">{b.uso}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Sub>
                  <Sub titulo="Gradiente" nota="Apenas em palavras de ênfase.">
                    <Gradiente
                      css={SITE_GRADIENTE}
                      paradas={[
                        ['#FB923C', '0%'],
                        ['#F97316', '35%'],
                        ['#FCD34D', '60%'],
                        ['#F97316', '85%'],
                        ['#FB923C', '100%'],
                      ]}
                      copiado={copiado}
                      copiar={copiar}
                    />
                  </Sub>
                </>
              ) : (
                <Sub titulo="Gradiente da lateral">
                  <Gradiente
                    css={SIS_LATERAL}
                    paradas={[
                      ['#020719', '0%'],
                      ['#061233', '55%'],
                      ['#0A1E4D', '100%'],
                    ]}
                    copiado={copiado}
                    copiar={copiar}
                  />
                </Sub>
              )}
            </Secao>

            <Secao
              id="tipografia"
              n="02"
              titulo="Tipografia"
              descricao={site ? 'Quatro famílias, todas no Google Fonts.' : 'Uma família para toda a interface, no Google Fonts.'}
            >
              <Sub titulo={site ? 'Famílias' : 'Família'}>
                <Familias familias={site ? SITE_FAMILIAS : SIS_FAMILIAS} />
              </Sub>
              <Sub titulo="Escala" nota={site ? 'Intervalos variam do celular ao desktop.' : undefined}>
                <Escala escala={site ? SITE_ESCALA : SIS_ESCALA} />
              </Sub>
              {site ? (
                <Sub titulo="Composição de título">
                  <Painel className="p-6 md:p-10">
                    <span className="v4-kicker text-orange-400">Rótulo da seção</span>
                    <p className="mt-5 max-w-2xl font-['Sora'] text-[clamp(1.8rem,3.6vw,2.75rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-white">
                      {'Título em Sora com '}
                      <span className="v4-serif v4-grad-text font-normal">ênfase</span>
                    </p>
                    <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-300 ![hyphens:manual]">Texto de apoio em Manrope, com até três linhas.</p>
                  </Painel>
                </Sub>
              ) : null}
            </Secao>

            <Secao id="componentes" n="03" titulo="Componentes" descricao="Elementos recorrentes e suas especificações.">
              {site ? <ComponentesSite /> : <ComponentesSistema />}
            </Secao>

            <Secao id="logotipo" n="04" titulo="Logotipo" descricao="Fundos de aplicação aprovados.">
              <Logos
                fundos={
                  site
                    ? [
                        { fundo: '#07090d', nome: 'Night' },
                        { fundo: '#0b0807', nome: 'Ember' },
                        { fundo: '#f2ece1', nome: 'Paper' },
                      ]
                    : [
                        { fundo: '#020719', nome: 'Navy' },
                        { fundo: '#ffffff', nome: 'Branco' },
                        { fundo: '#f8fafc', nome: 'Fundo' },
                      ]
                }
              />
            </Secao>

            <Secao id="tokens" n="05" titulo="Tokens" descricao="Variáveis CSS prontas para uso.">
              <Tokens css={site ? SITE_TOKENS : SIS_TOKENS} arquivo={site ? 'site.css' : 'sistema.css'} copiado={copiado} copiar={copiar} />
            </Secao>
          </main>
        </div>

        <footer className={`border-t ${t.line}`}>
          <div className={`mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm md:flex-row md:justify-between md:px-8 ${t.subtle}`}>
            <p>Solar Buy-Side · Design System</p>
            <a href="/">solarbuyside.com.br</a>
          </div>
        </footer>

        <p className="sr-only" aria-live="polite">{copiado ? 'Copiado' : ''}</p>
      </div>
    </TemaCtx.Provider>
  )
}
