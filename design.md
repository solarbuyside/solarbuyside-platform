# Solar Buy-Side Platform — Design System & UI Guide

Este documento define a identidade visual, os tokens de design, a paleta de cores e os padrões de componentes para a plataforma **Solar Buy-Side**. Ele serve como a **única fonte de verdade (Single Source of Truth)** para a interface do usuário, garantindo consistência visual e uma experiência de uso extremamente premium, moderna e fluida.

---

## 🌌 1. Conceito de Design & Atmosfera

A interface deve evocar **confiança, modernidade e alta tecnologia**. 
* **Fundo Predominante (Main Content):** Um branco-gelo/cinza claro e limpo (`#f8fafc`), que traz uma atmosfera de claridade corporativa, excelente leitura para tabelas densas e estética de painel executivo moderno.
* **Barra Lateral (Sidebar):** Um azul escuro profundo (`#020719`), que ancora o design trazendo sobriedade de nível empresarial e excelente contraste.
* **Cor de Destaque:** Laranja solar (`#f97316`), utilizado cirurgicamente em pontos de conversão, estados ativos e elementos interativos importantes (ícones, botões de ação principal, status ativos).
* **Profundidade e Textura:** Uso sutil de sombras suaves, contornos limpos e efeito de **glassmorphism** (transparências com desfoque de fundo) nas barras de navegação para criar profundidade espacial.

---

## 🎨 2. Paleta de Cores (Tokens CSS / shadcn/ui)

Para integrarmos perfeitamente com a estrutura do **shadcn/ui**, mapeamos as cores utilizando variáveis CSS no modelo HSL no modo claro corporativo, exceto para a barra lateral que permanece em azul profundo escuro.

```css
:root {
  /* Fundo e Superfícies (Modo Claro) */
  --background: 210 40% 98%;      /* #f8fafc - Branco gelo/cinza bem claro */
  --foreground: 222.2 84% 4.9%;   /* Slate escuro para textos */

  /* Cartões e Popovers */
  --card: 0 0% 100%;              /* Branco para cartões */
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  /* Cores de Destaque / Marca */
  --primary: 24 95% 53%;          /* #f97316 - Laranja Solar */
  --primary-foreground: 0 0% 100%;/* Branco Puro */

  /* Cores Secundárias e Neutras */
  --secondary: 210 40% 96.1%;     /* Cinza azulado claro para botões secundários */
  --secondary-foreground: 222.2 47.4% 11.2%;

  /* Elementos Muted (Desabilitados/Legendas) */
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%; /* Cinza médio */

  /* Cores de Destaque (Accent) */
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  /* Destrutivo (Erros / Alertas críticos) */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  /* Bordas e Inputs */
  --border: 214.3 31.8% 91.4%;    /* Bordas claras discretas */
  --input: 214.3 31.8% 91.4%;
  --ring: 24 95% 53%;             /* Ring em Laranja Solar */

  /* Raios de Borda (Border Radius) */
  --radius: 0.75rem;              /* Cantos modernos ligeiramente arredondados */
}
```

### 💫 Fundo das Páginas e Estrutura Geral
O fundo das páginas de conteúdo principal adota um cinza-gelo claro para contraste e legibilidade ideais das tabelas e propostas solares:
```css
background-color: #f8fafc;
```

---

## ✍️ 3. Tipografia

Usaremos a fonte **Outfit** ou **Inter** (via Google Fonts) para um visual limpo, geométrico e legível.

* **Títulos Principais (H1/H2):** `font-semibold` ou `font-bold`, tracking ligeiramente apertado (`tracking-tight`), cor chumbo escuro (`#0f172a` / `text-slate-900`).
* **Subtítulos/Muted:** `text-sm font-medium text-slate-500`.
* **Corpo do Texto:** `text-base font-normal text-slate-700`.

---

## 📐 4. Padrões de Componentes

### 🗂️ A. Sidebar Lateral (Navegação Premium)
A sidebar é a âncora da navegação. Ela deve ser fixa, com efeito de vidro reflexivo e borda direita sutil.
* **Fundo:** `#050d24` com opacidade ou `rgba(5, 13, 36, 0.98)` com `backdrop-filter: blur(12px)`.
* **Borda Direita:** `1px solid rgba(255, 255, 255, 0.08)`.
* **Itens de Menu:**
  * **Estado Padrão:** Texto cinza-azulado (`text-slate-400`), ícone combinando. Transição suave no hover.
  * **Hover:** Fundo `rgba(255, 255, 255, 0.03)` com texto branco (`text-white`).
  * **Estado Ativo (Active):** Texto branco (`text-white`), ícone em laranja solar (`#f97316`) e uma pequena barra vertical laranja na extrema esquerda do item ativo (`w-1 h-6 rounded-r-md bg-orange-500`).

### 🎛️ B. Botões (Modern Buttons)
* **Botão Primário (Ação Crítica):**
  * **Cor:** Fundo `#f97316` com texto `#FFFFFF`.
  * **Efeito:** Leve brilho/sombra laranja no hover (`shadow-[0_4px_15px_rgba(249,115,22,0.2)]`) e transição de escala micro (`active:scale-[0.98]`).
* **Botão Secundário:**
  * **Cor:** Fundo cinza claro `#f1f5f9` com borda sutil `#cbd5e1` e texto chumbo `#1e293b`.
  * **Hover:** Borda laranja sutil (`border-orange-500/50`) e texto mudando suavemente de tom.
* **Botão Ghost:**
  * Sem borda ou fundo. Hover adiciona fundo `rgba(0, 0, 0, 0.05)` para modo claro ou `rgba(255, 255, 255, 0.05)` para a sidebar escura.

### 📊 C. Planilhas & Tabelas de Propostas (Solar Vendor Sheets)
A comparação de fornecedores solares precisa de clareza cirúrgica em dados densos.

* **Estrutura:**
  * Cantos arredondados no container da tabela com `overflow-hidden`.
  * Linhas com efeito zebra sutil alternando entre `#ffffff` e `#f1f5f9` para visualização agradável em modo claro.
* **Cabeçalhos da Tabela:**
  * Fundo no azul profundo `#09143c` com texto branco, tamanho menor (`text-xs font-semibold tracking-wider uppercase`).
* **Interatividade:**
  * Hover na linha da tabela destaca com `bg-slate-100` e borda esquerda laranja se for selecionado como "finalista".
* **Badges de Categoria/Status:**
  * Badges com fundo opaco colorido e texto vibrante correspondente.
    * *Recomendado (Score Alto):* Fundo laranja translúcido (`bg-orange-500/10`) e texto laranja (`text-orange-600`).
    * *Viável Financeiramente:* Fundo verde translúcido (`bg-emerald-500/10`) e texto verde (`text-emerald-600`).

### 🗳️ D. Checkbox & Switch (Seleção de Propostas)
Estes elementos são chaves na escolha de propostas finalistas.

* **Checkbox Personalizado:**
  * **Tamanho:** Médio/Confortável (`h-5 w-5 rounded`).
  * **Estado Não Marcado:** Borda cinza escuro, fundo transparente.
  * **Estado Marcado:** Fundo laranja solar (`#f97316`), borda laranja, ícone de check em branco puro.
* **Switch (Toggle):**
  * Knob interno desliza suavemente (`transition-all`).
  * Quando desligado, fundo exibe cinza neutro (`bg-slate-200`).
  * Quando ligado, fundo acende em laranja solar (`#f97316`).

### 🖥️ E. Cabeçalho (Header)
Mantido limpo para dar espaço ao conteúdo.

* **Fundo:** Translúcido com desfoque de fundo (`backdrop-blur-md` / `#ffffff` translúcido).
* **Informações:** Título da página à esquerda, perfil do comprador e alertas rápidos à direita.
* **Pesquisa:** Input de pesquisa com fundo cinza claro (`#f1f5f9`), ícone de lupa sutil, mudando de borda para laranja solar ao focar.

---

## ⚡ 5. Micro-interações e Animações

* **Transições Globais:** Todos os estados de hover e foco devem usar `transition-all duration-200 ease-in-out`.
* **Cards de Proposta:** Ao passar o mouse por cima do card de um fornecedor, ele deve subir ligeiramente (`-translate-y-1`) e ganhar uma borda sutilmente brilhante com sombra de elevação leve.
* **Feedback de Seleção (Finalistas):** Quando o usuário seleciona uma proposta como finalista, uma animação rápida de escala no card e uma borda com glow laranja indicam a escolha de sucesso.

---

*Nota: Este design system foi otimizado para Next.js, Tailwind CSS e componentes estruturados com Radix/shadcn em modo claro corporativo com sidebar escura contrastante.*
