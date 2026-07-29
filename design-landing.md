# Solar Buy-Side Landing — Design System "Solar Dawn" (V4)

Este documento é a fonte de verdade de UI/design da **landing page**
(`apps/landing/`, domínio solarbuyside.com.br). Ele existe porque o `design.md`
da raiz descreve a **plataforma** (modo claro `#f8fafc`, Outfit/Inter, sidebar
escura, shadcn) — um sistema DIFERENTE. Um agente que "corrigir" a LP para o
padrão da plataforma está introduzindo um bug, não consertando um.

Regra de ouro: para decisões de UI na **plataforma**, leia `design.md`; para a
**landing**, leia este arquivo. Os tokens executáveis vivem em
`apps/landing/src/v4/v4.css` (tudo prefixado `v4-`) — em divergência, o CSS do
repositório vence e este documento deve ser atualizado.

---

## 1. Conceito

Canvas **escuro contínuo em 4 atos** com uma inversão editorial ("paper") no
meio. Atmosfera de cinema/editorial premium, não de painel corporativo.
Nada de modo claro: o claro só aparece no ato paper, de propósito.

## 2. Paleta (tokens reais do v4.css)

```css
/* Atos escuros */
--v4-night:      #07090d;  /* carvão azulado — atos I/II (e theme-color) */
--v4-night-deep: #050608;  /* "sala de cinema" (vídeo) */
--v4-ember:      #0b0807;  /* carvão quente — ato IV (oferta) */
--v4-line:       rgba(255,255,255,0.08);   /* linhas/bordas no escuro */
--v4-line-hot:   rgba(255,255,255,0.16);

/* Ato editorial (paper) */
--v4-paper: #f2ece1;  --v4-ink: #181410;  --v4-ink-soft: #4f463c;

/* Marca */
--v4-orange: #f97316;  --v4-amber: #fbbf24;  --v4-blue: #3b82f6;
```

O laranja `#f97316` é compartilhado com a plataforma — é o único ponto de
contato entre os dois sistemas. Azul `#3b82f6` = lado Buy-Side (comprador);
laranja = lado Sell-Side (vendedor) — ver o "duelo" em `AuthorityV4.tsx`.

## 3. Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Headings (h1–h4) | **Sora** | extrabold, tracking apertado |
| Corpo | **Manrope** | herdada do `.v4-root` |
| Destaque editorial | **Fraunces** itálica (`.v4-serif`) | palavras-chave dentro de títulos |
| Etiquetas/kickers/números | **JetBrains Mono** (`.v4-mono`, `.v4-kicker`) | rótulos de seção, contadores |

Efeitos de texto próprios: `.v4-stroke` (contorno fantasma), `.v4-grad-text`
(gradiente solar animado — usar com `.v4-serif`).

## 4. Movimento

- **Reveal por bloco**: componente `Reveal` (`atoms.tsx`) — `.v4r` nasce com
  opacity 0 / translateY / blur e ganha `.in` via IntersectionObserver (uma
  vez só). Delay por `--d`.
- **Reveal palavra a palavra**: `WordReveal` — `.v4-words` + `.go`, delay por
  palavra via `--wd`. Hero usa trigger `load`; o resto, `scroll`.
- Easing global: `--v4-ease: cubic-bezier(0.16, 1, 0.3, 1)`.
- `prefers-reduced-motion: reduce` desliga tudo (já implementado no v4.css).

## 5. Padrões que não se quebram

- Todo estilo da LP é **prefixado `v4-`** ou Tailwind inline nos componentes de
  `src/v4/`. Não importar nada do design system da plataforma (shadcn etc.).
- A copy NUNCA vive nos átomos (`atoms.tsx` só dá forma); texto vem do CMS
  (Supabase `landing_sections`, banco > `ContentData` > default do componente).
- Copy da LP não usa travessão em texto visível (regra do projeto).
- Existem DOIS `v4.css`: `src/v4/` (LP oficial, raiz) e `src/v4-full/` (cópia
  congelada da rota `/1`). O Vite empacota os dois num CSS só — mexa apenas no
  de `src/v4/` e NUNCA "sincronize" o congelado.
- O HTML servido é pré-renderizado no build (`scripts/prerender.mjs`); mudanças
  de conteúdo exigem o Publicar do /admin (que dispara rebuild via Deploy Hook).
- **A raiz HIDRATA (hydrateRoot)**: o React adota o DOM pré-renderizado sem
  repintar. Consequência para quem escreve JSX na v4: NUNCA deixar duas
  expressões/strings de texto adjacentes num elemento — `{x}{' '}<span>` ou
  `0{i + 1}` viram dois text nodes que o innerHTML serializado funde num só, e
  a hidratação acusa mismatch (#418) e repinta o subtree. Funda numa expressão
  única: `` {`${x} `} `` e `` {`0${i + 1}`} ``. Mismatches aparecem no console
  como `[hydrate] mismatch recuperado` (ver main.tsx).
