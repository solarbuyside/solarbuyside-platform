# Plano de Alterações — 04.06 (prints + docs legais)

> Baseado nos 7 prints enviados + 3 documentos legais em `ajustes/`
> (Termos de Uso, Política de Privacidade, Medidas Antipiratarias).

---

## §A — Tela de CADASTRO (print 1: "Crie sua conta")

Arquivo: `src/app/(auth)/cadastro/page.tsx` (+ `auth-fields.tsx`, `actions.ts`).

1. **Adicionar campo "Repetir senha"** abaixo de "Senha".
   - Novo `PasswordField` `name="confirmPassword"`, label "Repetir senha".
   - Validação no `signUpAction`: se `password !== confirmPassword`, retorna erro
     "As senhas não conferem." (sem criar a conta).
2. **Aviso legal abaixo do botão "Criar conta":**
   - Texto: *"Ao criar sua conta, você concorda com nossos **Termos de Uso** e
     **Política de Privacidade**."* — com **links** para as páginas legais (§E).
   - Estilo discreto (text-xs, slate-400), links em primary.

## §B — E-mails da plataforma (print 2: Brevo/HostGator)

⚠️ **Depende da integração Brevo (épico §0 do plano anterior, ainda não viva).**
Quando os e-mails forem implementados (cadastro/confirmação via Brevo):
1. **Remetente:** no lugar de "me"/contato@buyside.com.br exibir **"Solar Buy-Side"**
   (configurar `sender name` no Brevo).
2. **Assunto/corpo:** trocar "Confirm your email address" por
   **"Bem-vindo à Plataforma Solar Buy-Side: confirme seu endereço de e-mail"**
   (template em português).
- **Ação agora:** deixar previsto no módulo `src/lib/access/access-policy.ts`
  (sender name + assunto PT) como constantes/TODO. Não dá pra testar sem Brevo.
- **Status:** documentar; implementação real fica para quando a conta Brevo
  estiver conectada.

## §C — Sidebar: eliminar "GUIAS" (prints 3 e 7)

Arquivos: `app-shell.tsx` (nav desktop + mobile, mapa de labels), rota `dicas`.
- O cliente agora quer **eliminar** a aba "Guias" (antes era só esvaziar).
  "Com o manual essa funcionalidade não é mais necessária."
- **Ação:** remover "Guias" da navegação (desktop + mobile) e do breadcrumb.
  Manter a rota `/dicas` existente? → **remover da nav**; a pasta pode ficar,
  mas sem ponto de acesso. (Confirmar se quer deletar a pasta `dicas/`.)
- Sidebar final: **Manual (destaque) · Dashboard · Avaliações · Histórico**.

## §D — Textos de UI (prints 4 e 5)

1. **Print 4** — hint da fase "Preenchimento":
   - `phase-nav.tsx:14`: "Coletar dados dos fornecedores" →
     **"Coletar dados das empresas de solar"**.
2. **Print 5** — card de comentário do finalista (o "Melhor pontuação no
   conjunto…"):
   - `finalists-view.tsx:208-214`: **remover** o bloco `{primary && (...)}`
     inteiro ("Eliminar essa funcionalidade de comentar").
   - Verificar import órfão (`Sparkles`).

## §E — Documentos legais no dropdown do PERFIL (print 7 + pedido principal)

**Onde:** o cliente pediu para ficar **na dropdown do perfil** (canto superior
direito, ao clicar no nome → menu). Arquivo: `app-shell.tsx` `UserMenu` (~l.557).

Os 3 documentos (em `ajustes/*.docx`, já extraídos para `.txt`):
1. **Termos de Uso**
2. **Política de Privacidade**
3. **Medidas Antipirataria**

### Arquitetura (boas práticas)
- Criar **uma rota de conteúdo legal** reutilizável:
  `src/app/(app)/legal/[doc]/page.tsx` (ou 3 rotas: `/termos`, `/privacidade`,
  `/medidas-antipirataria`). Preferência: **3 rotas nomeadas** (URLs limpas e
  estáveis, boas para SEO/links em e-mail).
- O conteúdo dos docs vai para **um módulo de dados** em
  `src/lib/legal/` (texto estruturado em TS/MD), renderizado por um componente
  de leitura tipográfica (prose). Assim o mesmo conteúdo serve a:
  - dropdown do perfil (links),
  - aviso do cadastro (§A),
  - rodapé/e-mails futuros.
- **No `UserMenu`:** adicionar um grupo "Legal" com 3 links (Termos de Uso,
  Política de Privacidade, Medidas Antipirataria), com ícones (FileText,
  Shield, Lock), separados por um divisor antes do "Sair".
- As páginas legais devem ser acessíveis **logado** (dentro do app-shell) e,
  idealmente, também **deslogado** (para o link do cadastro funcionar antes do
  login). → Colocar as rotas fora do `(app)` ou duplicar acesso. **Decisão:**
  criar em rota pública `src/app/legal/...` (sem auth) e linká-las tanto do
  cadastro quanto do UserMenu. (Confirma esse caminho?)

### Conteúdo
- Extraí os 3 docs para `ajustes/*.txt`. Vou convertê-los em conteúdo
  estruturado (títulos de seção + parágrafos) preservando o texto jurídico
  **na íntegra** (não resumir). A Política já tem CNPJ, endereço, seções LGPD.

## §F — Print 6: sugestão de posição dos 3 botões na sidebar

O cliente sugeriu colocar os 3 links legais **no rodapé da sidebar** (acima do
perfil), MAS deixou claro: *"talvez você encontrará um lugar mais apropriado"*.
- **Decisão recomendada:** seguir o pedido principal (§E) — **dropdown do
  perfil** é o lugar mais limpo e padrão de mercado para Termos/Privacidade.
  Não poluir a sidebar. (O print 6 e o pedido de texto convergem para isso.)

---

## Ordem de execução sugerida
1. §D (textos — baixo risco): hint da fase + remover card de comentário.
2. §C (eliminar Guias da nav).
3. §E (rotas legais + conteúdo + links no UserMenu) — maior esforço.
4. §A (cadastro: repetir senha + aviso legal com links).
5. §B (constantes Brevo no access-policy — sem integração viva).
6. Build + lint + testes + commit + push.

## Pontos a confirmar com você
1. **§C Guias:** só remover da navegação, ou **deletar a pasta** `dicas/`?
2. **§E rotas:** criar como **rotas públicas** `/termos`, `/privacidade`,
   `/medidas-antipirataria` (acessíveis logado e deslogado)? (recomendado)
3. **§E posição:** confirmo que os 3 ficam **só no dropdown do perfil**
   (não na sidebar nem no rodapé)? O print 6 era sugestão alternativa.
4. **§B Brevo:** ok deixar só as constantes/TODO agora (sem integração)?
