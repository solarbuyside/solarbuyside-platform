# 🚀 Setup - Landing Page Professional

Seu ambiente completo para construir uma Landing Page profissional já está pronto!

## ✅ O que foi configurado

### Stack Tecnológico
- ⚛️ **React 18** - Framework UI moderno
- 📘 **TypeScript** - Type-safe development
- ⚡ **Vite** - Build tool ultra-rápido
- 🎨 **Tailwind CSS v3** - Estilização utilitária
- 🎯 **Lucide React** - Biblioteca de ícones

### Estrutura
```
src/
├── components/          # Componentes prontos
│   ├── Header.tsx      # Navegação responsiva
│   ├── Hero.tsx        # Seção hero
│   ├── Features.tsx    # Features/Benefícios
│   ├── Pricing.tsx     # Tabela de preços
│   ├── CTA.tsx         # Call-to-Action
│   └── Footer.tsx      # Rodapé
├── pages/              # Páginas (extensível)
├── components/         # Componentes reutilizáveis
├── utils/              # Funções utilitárias
└── hooks/              # Custom hooks
```

## 🎯 Próximos Passos

### 1. **Iniciar o Servidor de Desenvolvimento**
```bash
npm run dev
```
Acesse http://localhost:5173 no seu navegador

### 2. **Customizar Conteúdo**

#### Hero Section
Edite `src/components/Hero.tsx`:
- Título principal
- Descrição
- Botões de CTA

#### Features
Edite `src/components/Features.tsx`:
- Títulos dos features
- Descrições
- Ícones (use Lucide React)

#### Pricing
Edite `src/components/Pricing.tsx`:
- Nomes dos planos
- Preços
- Features de cada plano

#### Header & Footer
- Logo
- Links de navegação
- Redes sociais

### 3. **Customizar Cores**

Edite `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: "#1e40af",    // Sua cor principal
      secondary: "#f59e0b",  // Sua cor secundária
    },
  },
}
```

### 4. **Adicionar Imagens/Mídia**

1. Coloque suas imagens em `src/assets/`
2. Importe nos componentes:
```tsx
import myImage from '../assets/my-image.png'

<img src={myImage} alt="Description" />
```

### 5. **Conectar Formulários (Opcional)**

Para o formulário de contato, você pode usar:
- **Formspree** - Sem backend (https://formspree.io)
- **EmailJS** - Client-side email (https://www.emailjs.com)
- **Seu próprio backend** - Express, Node, etc

Exemplo com Formspree:
```tsx
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <input type="email" name="email" required />
  <button type="submit">Send</button>
</form>
```

### 6. **Deploy**

#### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm run build
# Fazer upload da pasta dist
```

#### GitHub Pages
```bash
npm run build
# Push para branch gh-pages
```

## 📚 Recursos Úteis

### Tailwind CSS
- [Documentação](https://tailwindcss.com/docs)
- [Component Presets](https://www.tailwindui.com/)

### Lucide Icons
- [Icon Library](https://lucide.dev)
- [Search Icons](https://lucide.dev/)

### React
- [Official Docs](https://react.dev)
- [Hooks Reference](https://react.dev/reference/react)

## 🎨 Componentes Disponíveis

### Header
- Responsive navigation
- Mobile menu
- Sticky ao scroll

### Hero
- Gradient background
- CTA buttons
- Company logos

### Features
- 4 features em grid responsivo
- Icons customizáveis
- Hover effects

### Pricing
- 3 planos pré-configurados
- Highlighted plan
- Feature list com checkmarks

### CTA
- Bold background
- Double CTA buttons
- Trust signals

### Footer
- Multi-column layout
- Social links
- Copyright

## 💡 Dicas

1. **Mobile-First**: O design já é mobile-first, mas sempre teste no celular
2. **Lighthouse**: Faça testes de performance (http://localhost:5173)
3. **Acessibilidade**: Use labels, alt text, e semantic HTML
4. **SEO**: Adicione meta tags em public/index.html
5. **Analytics**: Configure Google Analytics ou Vercel Analytics

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
npm run lint     # Verifica código (se ESLint estiver configurado)
```

## 🆘 Troubleshooting

### Port 5173 já está em uso
```bash
npm run dev -- --port 3000
```

### Mudanças não aparecem
- Hard refresh: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
- Limpar cache do navegador

### Erro no build
```bash
npm run build 2>&1  # Ver erro completo
npm install         # Reinstalar dependências
```

---

**Pronto para começar? Execute:**
```bash
npm run dev
```

Boa sorte! 🚀
