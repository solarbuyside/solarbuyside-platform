# 📁 Estrutura do Projeto - Landing Page Professional

## Overview

```
solar-buy-side-v2/
├── public/                    # Arquivos estáticos
│   └── vite.svg              # Logo do Vite (remover)
│
├── src/
│   ├── components/           # Componentes React
│   │   ├── Header.tsx        # 📌 Cabeçalho com navegação
│   │   ├── Hero.tsx          # 🎯 Seção principal de destaque
│   │   ├── Features.tsx      # ⭐ 4 Features em grid
│   │   ├── Pricing.tsx       # 💰 3 Planos de preço
│   │   ├── CTA.tsx           # 📢 Call-to-Action
│   │   ├── Footer.tsx        # 🔗 Rodapé com links
│   │   └── index.ts          # Exports centralizados
│   │
│   ├── pages/                # Páginas (para expansão futura)
│   │   └── (vazio)
│   │
│   ├── assets/               # Imagens e mídia
│   │   └── react.svg         # Remover depois
│   │
│   ├── hooks/                # Custom React Hooks
│   │   └── (vazio - para expansão)
│   │
│   ├── utils/                # Funções utilitárias
│   │   └── (vazio - para expansão)
│   │
│   ├── App.tsx               # Componente principal
│   ├── App.css               # Estilos globais do App
│   ├── index.css             # Estilos globais + Tailwind
│   └── main.tsx              # Entry point
│
├── .gitignore               # Git ignore rules
├── index.html               # HTML principal
├── package.json             # Dependências
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
│
├── README.md                # Documentação principal
├── SETUP.md                 # Guia de setup
└── PROJECT_STRUCTURE.md     # Este arquivo
```

## 📊 Componentes Detalhados

### 1️⃣ Header.tsx
**Localização**: `src/components/Header.tsx`

**Responsabilidades**:
- Logo e branding
- Navegação desktop (escondida em mobile)
- Mobile hamburger menu
- Links: Features, Pricing, About, Contact
- Botão "Get Started"

**Props**: Nenhuma no momento (customizar internamente)

**Tailwind Classes Usadas**:
- `fixed`, `top-0`, `z-50` - Sticky header
- `flex`, `items-center` - Layout
- `hidden md:flex` - Responsive nav
- `hover:text-blue-600` - Interatividade

---

### 2️⃣ Hero.tsx
**Localização**: `src/components/Hero.tsx`

**Responsabilidades**:
- Seção principal "above the fold"
- Título atrativo com gradient
- Descrição
- CTA buttons (Primary + Outline)
- Social proof (trusted companies)

**Tailwind Classes Usadas**:
- `pt-32 md:pt-40` - Padding top responsivo
- `bg-gradient-to-b` - Gradient background
- `text-transparent bg-clip-text` - Gradient text
- `flex-col sm:flex-row` - Responsive buttons

---

### 3️⃣ Features.tsx
**Localização**: `src/components/Features.tsx`

**Responsabilidades**:
- Grid de 4 features (1 col mobile, 2 tablet, 4 desktop)
- Icons (do Lucide React)
- Título e descrição de cada feature
- Hover effects

**Features Inclusos**:
1. ⚡ Lightning Fast
2. 🛡️ Secure & Reliable
3. 📊 Analytics & Insights
4. ⚙️ Easy Customization

**Tailwind Classes Usadas**:
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4` - Responsive grid
- `hover:shadow-lg` - Elevação ao hover
- `border border-gray-200` - Cards com borda

---

### 4️⃣ Pricing.tsx
**Localização**: `src/components/Pricing.tsx`

**Responsabilidades**:
- 3 planos de preço
- Pricing destacado (escala 105%)
- Feature list para cada plano
- Checkmarks com ícones

**Planos**:
1. **Starter** - $29/mês (5 landing pages)
2. **Professional** - $79/mês (50 landing pages) ⭐ Highlighted
3. **Enterprise** - $199/mês (Unlimited)

**Tailwind Classes Usadas**:
- `scale-105` - Plano destacado maior
- `bg-gradient-to-b` - Gradient nos cards
- `flex items-center gap-3` - Feature list layout

---

### 5️⃣ CTA.tsx
**Localização**: `src/components/CTA.tsx`

**Responsabilidades**:
- Seção de chamada final para ação
- Background gradient bold
- 2 botões (contraste)
- Trust signals

**Tailwind Classes Usadas**:
- `bg-gradient-to-r` - Gradient background
- `text-white` - Contrast
- `hover:bg-white hover:text-blue-600` - Inverter ao hover

---

### 6️⃣ Footer.tsx
**Localização**: `src/components/Footer.tsx`

**Responsabilidades**:
- Multi-column layout
- Links em 4 categorias
- Social media links
- Copyright
- Dark theme

**Categorias**:
- Product
- Company
- Resources
- Legal

**Tailwind Classes Usadas**:
- `bg-gray-900 text-gray-400` - Dark theme
- `grid-cols-1 md:grid-cols-5` - Responsive columns
- `border-b border-gray-800` - Separadores

---

## 🎨 Cores e Design

### Paleta de Cores

```javascript
// tailwind.config.js
colors: {
  primary: "#1e40af",    // Azul (CTA, highlights)
  secondary: "#f59e0b",  // Âmbar (secondary actions)

  gray-50: "#f9fafb",
  gray-100: "#f3f4f6",
  gray-200: "#e5e7eb",
  gray-400: "#9ca3af",
  gray-600: "#4b5563",
  gray-700: "#374151",
  gray-900: "#111827",

  white: "#ffffff",
  blue-50: "#eff6ff",
  blue-600: "#2563eb",
  blue-700: "#1d4ed8",
}
```

### Classes Reutilizáveis (Layer Components)

Definidas em `src/index.css`:

```css
@layer components {
  .btn-primary    /* Azul, hover escuro */
  .btn-secondary  /* Âmbar, hover escuro */
  .btn-outline    /* Borda azul, hover background claro */
  .section-container  /* max-width 1280px, padding, margin auto */
  .heading-lg     /* 3xl/5xl, bold, dark gray */
  .heading-md     /* 2xl/3xl, bold, dark gray */
  .text-muted     /* Cinza médio */
}
```

---

## 📱 Responsividade

Breakpoints Tailwind (mobile-first):
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

Estratégia:
1. Mobile-first defaults
2. `md:` para tablet e acima
3. `lg:` para desktop

Exemplos:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* 1 col mobile, 2 tablet, 4 desktop */}
</div>

<h1 className="text-3xl md:text-5xl">
  {/* 3xl mobile, 5xl desktop */}
</h1>
```

---

## 🚀 Como Expandir

### Adicionar Novo Componente

```tsx
// src/components/Testimonials.tsx
import React from 'react'
import { Star } from 'lucide-react'

export const Testimonials: React.FC = () => {
  return (
    <section className="section-container">
      <h2 className="heading-md mb-12">What Our Customers Say</h2>
      {/* Conteúdo */}
    </section>
  )
}
```

### Importar e Usar

```tsx
// src/components/index.ts - adicione:
export { Testimonials } from './Testimonials'

// src/App.tsx - adicione:
import { Testimonials } from './components'

<Testimonials />
```

### Adicionar Nova Página

```tsx
// src/pages/Blog.tsx
import React from 'react'

export const Blog: React.FC = () => {
  return (
    <main>
      {/* Página inteira */}
    </main>
  )
}
```

---

## 📦 Dependências

### Core
- `react@18` - UI Framework
- `react-dom@18` - DOM binding
- `typescript@5` - Type safety

### Build
- `vite@7` - Build tool
- `@vitejs/plugin-react@4` - React plugin

### Styling
- `tailwindcss@3` - Utility CSS
- `postcss@8` - CSS processor
- `autoprefixer@10` - Vendor prefixes

### Icons
- `lucide-react` - Icon library

---

## 🔧 Configurações Importantes

### tailwind.config.js
- Content paths: `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`
- Extend colors: primary (#1e40af), secondary (#f59e0b)
- Layer components: btn, section, heading

### vite.config.ts
- Já pré-configurado
- React plugin ativado
- Path aliases opcionais

### tsconfig.json
- Strict mode
- ES2020 target
- JSX react-jsx

---

## 📈 Performance

**Tamanho da Build**:
- HTML: 0.46 kB (gzipped: 0.30 kB)
- CSS: 14.12 kB (gzipped: 3.40 kB)
- JS: 206.19 kB (gzipped: 65.05 kB)
- **Total gzipped: ~68 kB**

**Otimizações**:
- Tree-shaking automático
- Code splitting
- Image optimization (use next/image se expandir)
- CSS purging (Tailwind)

---

## ✅ Checklist de Customização

- [ ] Mudar nome do projeto em `package.json`
- [ ] Remover arquivos de template (vite.svg, react.svg)
- [ ] Customizar cores em `tailwind.config.js`
- [ ] Adicionar logo em `src/assets/`
- [ ] Atualizar conteúdo de cada componente
- [ ] Adicionar imagens/screenshots
- [ ] Conectar forms se necessário
- [ ] Adicionar Google Analytics
- [ ] Testar no mobile
- [ ] Deploy

---

Pronto para começar a customizar! 🚀
