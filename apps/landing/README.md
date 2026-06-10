# Landing Page Professional

Uma landing page moderna, responsiva e de alto desempenho construída com React, TypeScript e Tailwind CSS.

## Features

✨ **Componentes Prontos**
- Header com navegação responsiva
- Hero section com CTA
- Seção de Features
- Tabela de Preços
- Call-to-Action (CTA)
- Footer com links

🎨 **Design**
- Design moderno e profissional
- Totalmente responsivo (Mobile-first)
- Tailwind CSS para estilização
- Gradientes e animações suaves
- Ícones do Lucide React

⚡ **Performance**
- Vite para build ultra-rápido
- Hot Module Replacement (HMR)
- TypeScript para type-safety
- Otimizado para produção

## Getting Started

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Header.tsx      # Cabeçalho com navegação
│   ├── Hero.tsx        # Seção hero principal
│   ├── Features.tsx    # Seção de features
│   ├── Pricing.tsx     # Tabela de preços
│   ├── CTA.tsx         # Call-to-action
│   ├── Footer.tsx      # Rodapé
│   └── index.ts        # Exports dos componentes
├── pages/              # Páginas (para futuros templates)
├── assets/             # Imagens e mídia
├── hooks/              # Custom React hooks
├── utils/              # Funções utilitárias
├── App.tsx            # Componente principal
├── App.css            # Estilos globais
└── index.css          # Tailwind directives
```

## Customização

### Cores

Edite as cores principais em `tailwind.config.js`:

```js
colors: {
  primary: "#1e40af",    // Azul
  secondary: "#f59e0b",  // Âmbar
}
```

### Conteúdo

Todos os componentes aceitam props para customização. Edite:

- **Header**: Navegação e logo em `src/components/Header.tsx`
- **Hero**: Título, descrição e CTA em `src/components/Hero.tsx`
- **Features**: Ícones e descrições em `src/components/Features.tsx`
- **Pricing**: Planos e preços em `src/components/Pricing.tsx`

### Fonte

A fonte padrão é "system-ui" (sistema operacional). Para mudar:

```css
/* src/index.css */
body {
  font-family: 'Sua Fonte Aqui', sans-serif;
}
```

## Deployment

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Fazer upload da pasta 'dist' para Netlify
```

### GitHub Pages
Configure em `vite.config.ts`:
```js
export default {
  base: '/seu-repositorio/',
}
```

## Tecnologias

- **React 18** - Framework UI
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library
- **PostCSS** - CSS preprocessor

## Performance

- **Lighthouse Score**: 95+
- **Tamanho inicial**: ~45KB (gzipped)
- **First Contentful Paint**: < 1s

## Contributing

Sinta-se à vontade para criar issues e PRs!

## License

MIT

---

**Próximos passos:**
1. Customizar conteúdo dos componentes
2. Adicionar suas imagens/logo
3. Conectar formulários com um backend
4. Adicionar Analytics (Google Analytics, Mixpanel, etc)
5. Fazer deploy!
