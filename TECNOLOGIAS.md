# Solar Buy-Side — Tecnologias & Boas Práticas

> Documento de entrega (handoff técnico) — visão completa das tecnologias que sustentam a **Landing Page** e a **Plataforma de Avaliação de Propostas Solar Buy-Side**, em linguagem acessível.
> Última atualização: 08/06/2026.

---

## 1. Visão geral

O produto é composto por **dois aplicativos** e um conjunto de **serviços gerenciados** (na nuvem), integrados entre si:

```
┌──────────────────────────┐        ┌──────────────────────────────┐
│  LANDING PAGE (vitrine)  │        │  PLATAFORMA (área logada)    │
│  solarbuyside.com.br     │        │  plataforma.solarbuyside...  │
│  Vite + React            │        │  Next.js + React             │
└────────────┬─────────────┘        └───────────────┬──────────────┘
             │                                       │
             │            ┌──────────────────────────┴───────┐
             ▼            ▼                                   ▼
      ┌────────────┐  ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
      │  Supabase  │  │    Brevo     │   │   Greenn     │  │   Vercel     │
      │ Banco+Auth │  │   E-mails    │   │  Checkout    │  │ Hospedagem   │
      └────────────┘  └──────────────┘   └──────────────┘  └──────────────┘
```

- **Landing Page**: site público de apresentação e venda. Conteúdo (textos, depoimentos, legais) é editável pelo administrador, sem precisar de programador.
- **Plataforma**: área logada onde o cliente compara propostas de fornecedores solares, lê o Manual e consulta o histórico.
- **Serviços gerenciados**: banco de dados, autenticação, e-mails, checkout de pagamento e hospedagem rodam em provedores especializados (alta disponibilidade, backups e segurança inclusos).

Ambos os apps vivem no **mesmo repositório** (monorepo) e fazem **deploy automático** a cada atualização.

---

## 2. Frontend (a parte visível ao usuário)

| Tecnologia | Para que serve | Site oficial |
|---|---|---|
| **Next.js 16** | Framework principal da Plataforma. Páginas rápidas, renderização no servidor e rotas de API no mesmo projeto. | https://nextjs.org |
| **Vite 7** | Ferramenta de build da Landing Page — site estático ultraleve e veloz. | https://vite.dev |
| **React 19** | Biblioteca de interface (componentes) usada nos dois apps. | https://react.dev |
| **TypeScript** | JavaScript com tipagem — menos bugs, código mais seguro e fácil de manter. | https://www.typescriptlang.org |
| **Tailwind CSS** | Sistema de estilos visuais (cores, espaçamentos, responsividade) consistente. | https://tailwindcss.com |
| **Lucide Icons** | Conjunto de ícones usados na interface. | https://lucide.dev |
| **Recharts** | Gráficos da Plataforma (métricas e comparativos). | https://recharts.org |
| **PDF.js** | Leitor de PDF embutido (Manual Solar Buy-Side), página a página, dentro do navegador. | https://mozilla.github.io/pdf.js/ |

---

## 3. Backend (a lógica que roda nos bastidores)

| Tecnologia | Para que serve | Site oficial |
|---|---|---|
| **Next.js — Server Actions & Route Handlers** | Backend da Plataforma: login, regras de negócio, recebimento do webhook de pagamento, geração de e-mails — tudo no servidor, com segurança. | https://nextjs.org |
| **Funções Serverless (Vercel)** | Pequenos serviços da Landing Page (captura de leads/newsletter). Escalam sozinhos, sem servidor para gerenciar. | https://vercel.com/docs/functions |
| **Node.js** | Ambiente de execução do código no servidor. | https://nodejs.org |
| **Zod** | Validação de dados (formulários, webhooks) — garante que só dados corretos entram no sistema. | https://zod.dev |
| **ExcelJS** | Importação das planilhas de propostas (.xlsx) dos fornecedores. | https://github.com/exceljs/exceljs |

---

## 4. Banco de dados & Autenticação

| Tecnologia | Para que serve | Site oficial |
|---|---|---|
| **Supabase** | Plataforma que reúne banco de dados, autenticação e APIs. Coração dos dados do produto. | https://supabase.com |
| **PostgreSQL** | Banco de dados relacional (gerenciado pelo Supabase) — robusto, confiável e padrão de mercado. | https://www.postgresql.org |
| **Supabase Auth** | Login, senhas, recuperação de senha e sessões dos usuários. | https://supabase.com/auth |

**Destaques de segurança do banco:**
- **RLS (Row Level Security)**: cada usuário só enxerga os próprios dados — regra aplicada no próprio banco, não só na tela.
- **Migrations versionadas**: toda mudança de estrutura do banco fica registrada e rastreável.
- **Conteúdo no banco** (não "chumbado" no código): textos da Landing, depoimentos e documentos legais são editáveis pelo admin.

---

## 5. E-mails, Pagamento e Domínio

| Tecnologia | Para que serve | Site oficial |
|---|---|---|
| **Brevo** | Envio de e-mails: acesso pós-compra, código de verificação (2FA), recuperação de senha e captação de leads. Usa SMTP autenticado com DKIM. | https://www.brevo.com |
| **Greenn** | Checkout e processamento de pagamento. Avisa a Plataforma por **webhook** quando uma compra é paga ou reembolsada. | https://greenn.com.br |
| **Titan Email** | Caixa de e-mail profissional do domínio (ex.: contato@solarbuyside.com.br). | https://titan.email |
| **Registro.br** | Registro do domínio `solarbuyside.com.br`. | https://registro.br |

**Como o acesso funciona:** o cliente compra na Greenn → a Greenn avisa a Plataforma → a conta é criada automaticamente com validade de **6 meses** → o Brevo envia o e-mail de acesso. Em caso de reembolso, o acesso é bloqueado automaticamente.

---

## 6. Hospedagem, Infraestrutura e Observabilidade

| Tecnologia | Para que serve | Site oficial |
|---|---|---|
| **Vercel** | Hospedagem dos dois apps, com CDN global, HTTPS automático e **deploy a cada atualização** do código. | https://vercel.com |
| **Vercel Web Analytics** | Métricas de tráfego (visitas, origens) sem cookies invasivos. | https://vercel.com/docs/analytics |
| **Vercel Speed Insights** | Monitoramento de velocidade real percebida pelos usuários. | https://vercel.com/docs/speed-insights |
| **Git + GitHub** | Controle de versão de todo o código — histórico completo e backup. | https://github.com |

---

## 7. Qualidade de código e ferramentas de desenvolvimento

| Tecnologia | Para que serve | Site oficial |
|---|---|---|
| **TypeScript** | Tipagem estática — pega erros antes de chegarem ao usuário. | https://www.typescriptlang.org |
| **ESLint** | Análise automática do código (padrões e prevenção de erros). | https://eslint.org |
| **Vitest** | Testes automatizados das regras de negócio (cálculo de comparativos). | https://vitest.dev |
| **Sharp / Imagemin** | Otimização de imagens da Landing (carregamento mais rápido). | https://sharp.pixelplumbing.com |
| **clsx / tailwind-merge** | Utilitários para organização dos estilos. | https://github.com/dcastil/tailwind-merge |

---

## 8. Boas práticas que seguimos

### 🔒 Segurança
- **Segredos fora do código**: chaves e senhas vivem só em variáveis de ambiente — **nunca** são versionadas no GitHub.
- **2FA por e-mail no login**: a cada acesso, um código de 6 dígitos é enviado por e-mail (proteção contra compartilhamento de conta).
- **RLS no banco**: isolamento de dados por usuário garantido na camada mais profunda.
- **Validação de webhook**: o aviso de pagamento da Greenn é autenticado por token com comparação *constant-time* (resistente a ataques de tempo).
- **Sanitização anti-XSS**: o conteúdo rico (negrito dos documentos legais) é limpo antes de exibir, evitando injeção de código.
- **HTTPS + HSTS** em todo o tráfego; e-mails com **SPF/DKIM** configurados (melhor entregabilidade e antifraude).

### ⚡ Performance
- **Renderização no servidor** (Next.js) e **divisão de código** — só carrega o necessário.
- **Cache de longa duração** para arquivos grandes (ex.: o Manual em PDF) + **leitura por partes (Range)** e **pré-carregamento inteligente** das páginas vizinhas.
- **Imagens otimizadas** e entrega via **CDN global** (Vercel), com monitoramento de velocidade.

### 🧱 Confiabilidade e dados
- **Banco gerenciado** (Supabase/Postgres) com backups e alta disponibilidade.
- **Mudanças de banco versionadas** (migrations) e rastreáveis.
- **Histórico de auditoria** das ações do usuário registrado no banco.

### 🧑‍💻 Qualidade e manutenção
- **TypeScript estrito** + **ESLint** + **testes automatizados** (Vitest) das regras críticas.
- **Monorepo organizado** com deploy automático e documentação interna de estado do projeto.
- **Conteúdo editável pelo admin** (textos, depoimentos, documentos legais) — sem depender de programador para mudanças do dia a dia.

### ♿ Experiência e acessibilidade
- Interface **100% em português**, **responsiva** (funciona bem no celular e no desktop).
- **Design system consistente** (cores, tipografia e componentes padronizados).
- Avisos claros ao usuário (ex.: contagem regressiva de expiração do acesso, estados de carregamento e erro).

---

## 9. Glossário rápido (para leigos)

- **Frontend**: a parte que o usuário vê e clica (telas, botões).
- **Backend**: a lógica que roda nos bastidores (login, cálculos, e-mails).
- **Banco de dados**: onde as informações ficam guardadas de forma organizada.
- **Webhook**: um "aviso automático" que um sistema envia a outro quando algo acontece (ex.: pagamento aprovado).
- **Deploy**: publicar uma nova versão do site/plataforma no ar.
- **CDN**: rede de servidores espalhados pelo mundo que entrega o site mais rápido a cada usuário.
- **2FA**: verificação em duas etapas (senha + código) para mais segurança.

---

*Documento preparado para entrega ao cliente. Para detalhes operacionais internos (acessos, migrations, deploy), consulte o `STATUS.md` do repositório.*
