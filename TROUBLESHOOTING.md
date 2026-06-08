# 🆘 Troubleshooting - Landing Page Professional

## Problemas Comuns e Soluções

### ❌ Erro: "Port 5173 is already in use"

**Problema**: Outro processo está usando a porta 5173

**Solução 1** - Usar outra porta:
```bash
npm run dev -- --port 3000
```

**Solução 2** - Matar processo na porta:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5173
kill -9 <PID>
```

---

### ❌ Erro: "Cannot find module 'lucide-react'"

**Problema**: Faltam dependências

**Solução**:
```bash
npm install
# ou
npm install lucide-react
```

---

### ❌ Erro: "Tailwind CSS classes not working"

**Problema**: Estilos não aparecem

**Solução**:
1. Reiniciar servidor:
   ```bash
   # Ctrl+C para parar
   npm run dev
   ```

2. Verificar `src/index.css` tem:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. Limpar cache:
   ```bash
   rm -rf node_modules dist .next
   npm install
   npm run dev
   ```

---

### ❌ Erro: "Build failed"

**Problema**: Build não compila

**Solução**:
```bash
# Ver erro completo
npm run build

# Limpar e tentar novamente
rm -rf dist
npm run build

# Se continuar, limpar tudo
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### ❌ Mudanças não aparecem no navegador

**Problema**: Hot reload não funcionou

**Solução**:
1. Hard refresh:
   - **Windows**: `Ctrl + Shift + R`
   - **Mac**: `Cmd + Shift + R`
   - **Safari**: `Cmd + Option + R`

2. Limpar cache do navegador:
   - Abrir DevTools: `F12`
   - Right-click no botão Reload
   - Selecionar "Empty cache and hard refresh"

3. Fechar e reabrir navegador:
   ```bash
   # Para o servidor
   Ctrl+C

   # Reinicia
   npm run dev
   ```

---

### ❌ Componentes não renderizam

**Problema**: Componentes não aparecem na página

**Solução**:
1. Verificar import em `src/App.tsx`:
   ```tsx
   import {
     Header,
     Hero,
     Features,
     Pricing,
     CTA,
     Footer,
   } from './components'
   ```

2. Verificar `src/components/index.ts` tem todos os exports:
   ```ts
   export { Header } from './Header'
   export { Hero } from './Hero'
   // ... etc
   ```

3. Verificar nomes dos arquivos (case-sensitive):
   ```
   ✓ Header.tsx
   ✓ Hero.tsx
   ✗ header.tsx (errado)
   ```

---

### ❌ TypeScript errors no build

**Problema**: "Type 'X' is not assignable to type 'Y'"

**Solução**:
1. Verificar tipos corretos:
   ```tsx
   // ✓ Correto
   const count: number = 5

   // ✗ Errado
   const count: string = 5
   ```

2. Verificar `React.FC` em componentes:
   ```tsx
   export const MyComponent: React.FC = () => {
     return <div>...</div>
   }
   ```

3. Se persistir:
   ```bash
   npx tsc --noEmit  # Ver erros específicos
   ```

---

### ❌ Imagens não aparecem

**Problema**: `<img>` não renderiza

**Solução 1** - Path absoluto:
```tsx
import myImage from '../assets/image.png'
<img src={myImage} alt="Description" />
```

**Solução 2** - Path relativo:
```tsx
<img src="/image.png" alt="Description" />
// Arquivo deve estar em public/image.png
```

**Solução 3** - URL externa:
```tsx
<img src="https://example.com/image.png" alt="Description" />
```

---

### ❌ Vite hot reload não funciona

**Problema**: Mudanças não atualizam ao vivo

**Solução**:
1. Reiniciar servidor:
   ```bash
   Ctrl+C
   npm run dev
   ```

2. Verificar arquivo tem extensão correta:
   ```
   ✓ .tsx para React components
   ✓ .ts para código puro
   ✓ .css para estilos
   ```

3. Limpar cache do navegador (ver acima)

---

### ❌ Deploy falha em Vercel

**Problema**: Build falha no deploy

**Solução**:
1. Testar build localmente:
   ```bash
   npm run build
   npm run preview
   ```

2. Se funciona localmente, verificar environment variables

3. Se não funciona localmente, ver erros de build acima

4. Limpar Vercel cache:
   - Vercel dashboard
   - Settings → Deployments
   - Clicar em "Redeploy"

---

### ❌ Netlify drag & drop falha

**Problema**: Deploy não funciona após drag & drop

**Solução**:
1. Garantir build foi criado:
   ```bash
   npm run build
   # Deve criar pasta 'dist/'
   ```

2. Arrastar apenas pasta `dist/` (não projeto inteiro)

3. Se continuar falhar:
   - Use conexão GitHub
   - Vercel (mais confiável)

---

### ❌ npm install muito lento

**Problema**: Instalação demora demais

**Solução**:
```bash
# Limpar cache
npm cache clean --force

# Usar yarn (mais rápido)
yarn install

# ou usar pnpm
pnpm install
```

---

### ❌ "Module not found" errors

**Problema**: Não encontra módulo importado

**Solução**:
1. Verificar path correto:
   ```tsx
   // ✓ Correto (relativo)
   import { Header } from '../components'
   import { Header } from './Header'

   // ✗ Errado
   import { Header } from 'Header'  // sem path
   ```

2. Verificar arquivo existe no path

3. Verificar extensão:
   ```tsx
   // ✓ Correto
   import foo from './file.tsx'
   import foo from './file.ts'

   // ✗ Errado (sem extensão)
   import foo from './file'
   ```

---

### ❌ ESLint errors (lint)

**Problema**: `npm run lint` mostra erros

**Solução**:
1. Se quiser ignorar:
   ```bash
   # Pular lint no build
   # Remover 'lint' de package.json scripts
   ```

2. Se quiser corrigir:
   ```bash
   # Ver erros específicos
   npm run lint

   # Tentar auto-fix
   npx eslint . --fix
   ```

---

### ❌ Performance lenta

**Problema**: Site carrega devagar

**Solução**:
1. Verificar bundle size:
   ```bash
   npm run build
   # Ver output de tamanho
   ```

2. Se > 100KB, otimizar:
   - Remover dependências não usadas
   - Code splitting
   - Lazy loading de componentes

3. Ver Lighthouse:
   - DevTools → Lighthouse
   - Run audit
   - Seguir recomendações

---

### ❌ Styles não herdam

**Problema**: Estilo pai não afeta filho

**Solução**:
1. Usar `className` em React (não `class`):
   ```tsx
   // ✓ Correto
   <div className="text-blue-600">

   // ✗ Errado
   <div class="text-blue-600">
   ```

2. Verificar seletores CSS:
   ```tsx
   // Pode ser necessário !important em conflitos
   <div className="text-red-600 !text-blue-600">
   ```

---

### ❌ Responsive design quebrado

**Problema**: Layout não funciona em mobile

**Solução**:
1. Verificar viewport meta tag em `index.html`:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   ```

2. Testar em DevTools:
   - F12 → Toggle device toolbar (Ctrl+Shift+M)
   - Testar diferentes breakpoints

3. Verificar Tailwind breakpoints:
   ```tsx
   // Correto
   <div className="w-full md:w-1/2 lg:w-1/3">
   ```

---

### ❌ Cor não muda de tailwind.config.js

**Problema**: Mudança em config não aparece

**Solução**:
1. Reiniciar servidor:
   ```bash
   Ctrl+C
   npm run dev
   ```

2. Verificar syntax em `tailwind.config.js`:
   ```js
   // ✓ Correto
   colors: {
     primary: "#1e40af",
   }

   // ✗ Errado (sem aspas)
   colors: {
     primary: 1e40af,  // ERRADO
   }
   ```

3. Usar a cor corretal em componentes:
   ```tsx
   // Se definir primary, usar assim:
   className="bg-primary"  // Não bg-blue-600
   ```

---

## 📞 Ainda com Problema?

Se não encontrou a solução acima:

1. **Google**: Busque o erro específico
2. **Stack Overflow**: Pergunte com tags `react`, `tailwindcss`, `vite`
3. **ChatGPT**: Cole o erro e descreva o problema
4. **Documentation**:
   - [React Docs](https://react.dev)
   - [Tailwind Docs](https://tailwindcss.com)
   - [Vite Docs](https://vitejs.dev)

---

## 🚀 Último Recurso: Limpar e Recomeçar

Se nada funcionar:

```bash
# Parar servidor
Ctrl+C

# Limpar tudo
rm -rf node_modules dist package-lock.json

# Reinstalar
npm install

# Testar
npm run dev

# Se ainda não funcionar, fazer build
npm run build
```

---

**Boa sorte! 🎉**

Se precisar de ajuda, consulte:
- `README.md` - Overview
- `SETUP.md` - Guia de setup
- `QUICK_START.md` - Início rápido
