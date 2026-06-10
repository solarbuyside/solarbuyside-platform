# ⚡ Quick Start - Landing Page Professional

## 🚀 3 Passos para Começar

### 1. Inicie o Servidor
```bash
npm run dev
```
Abra: http://localhost:5173

### 2. Edite os Componentes
Faça mudanças nos arquivos TypeScript em `src/components/`:
- Header
- Hero
- Features
- Pricing
- CTA
- Footer

As mudanças aparecem ao vivo (Hot Reload)!

### 3. Build para Produção
```bash
npm run build
```
Seu site está pronto na pasta `dist/`

---

## 📂 Arquivos para Customizar

### 🎯 Hero Section
**Arquivo**: `src/components/Hero.tsx`
```tsx
// Edite:
- Título: "Welcome to Your Amazing Landing Page"
- Descrição: "Create stunning landing pages..."
- Botões: "Get Started Free" e "Watch Demo"
```

### ⭐ Features
**Arquivo**: `src/components/Features.tsx`
```tsx
// Edite array 'features':
{
  icon: <Zap size={32} />,
  title: 'Lightning Fast',
  description: 'Optimized performance...'
}
```

### 💰 Pricing
**Arquivo**: `src/components/Pricing.tsx`
```tsx
// Edite array 'plans':
{
  name: 'Starter',
  price: 29,
  features: ['5 Landing Pages', '...']
}
```

### 📌 Header
**Arquivo**: `src/components/Header.tsx`
```tsx
// Edite:
- Logo text: "LandingPage"
- Navigation links
- "Get Started" button
```

### 🎨 Cores
**Arquivo**: `tailwind.config.js`
```js
colors: {
  primary: "#1e40af",     // Azul → sua cor
  secondary: "#f59e0b",   // Âmbar → sua cor
}
```

---

## 🎨 Adicionar Imagens

```tsx
// 1. Coloque arquivo em src/assets/
// src/assets/my-image.png

// 2. Importe no componente
import myImage from '../assets/my-image.png'

// 3. Use
<img src={myImage} alt="Description" className="w-full" />
```

---

## 🔗 Adicionar Links

```tsx
// Navegação
<a href="#features">Features</a>
<a href="#pricing">Pricing</a>

// Links externos
<a href="https://seu-site.com" target="_blank" rel="noopener noreferrer">
  Link Externo
</a>
```

---

## 📝 Adicionar Formulário

### Usando Formspree (Mais Simples)

1. Visite https://formspree.io
2. Registre seu email e crie um form
3. Copie o Form ID
4. Adicione no componente:

```tsx
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <input type="email" name="email" placeholder="Your email" required />
  <input type="text" name="message" placeholder="Your message" required />
  <button type="submit" className="btn-primary">Send</button>
</form>
```

---

## 🚀 Deploy em 1 Minuto

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag & drop pasta 'dist' em Netlify
```

---

## 🔍 Debug

### Ver erros de build
```bash
npm run build
```

### Testar em produção localmente
```bash
npm run preview
```

### Limpar cache
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Referências Rápidas

### Tailwind Classes
```
Spacing: p-4, m-4, pt-8, mb-6
Colors: bg-blue-600, text-gray-700
Text: text-sm, text-2xl, font-bold
Responsive: md:text-3xl, lg:flex
Layout: flex, grid, justify-center, items-center
```

### Lucide Icons
```
Importar: import { IconName } from 'lucide-react'
Usar: <IconName size={24} />
Cores: <IconName className="text-blue-600" />

Exemplos: <Zap />, <Shield />, <BarChart3 />
```

### React/TypeScript
```tsx
// Function Component
export const MyComponent: React.FC = () => {
  return <div>Content</div>
}

// Com props
interface Props {
  title: string
  count: number
}

export const Component: React.FC<Props> = ({ title, count }) => {
  return <h1>{title} - {count}</h1>
}
```

---

## 💡 Próximas Features

- [ ] Newsletter signup
- [ ] Blog posts
- [ ] Testimonials/Case studies
- [ ] FAQ section
- [ ] Video backgrounds
- [ ] Animations (Framer Motion)
- [ ] Dark mode
- [ ] Multi-language

---

**Pronto? Execute:**
```bash
npm run dev
```

**Boa sorte! 🎉**
