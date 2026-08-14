# Plano de revisão e implementação do Admin da LP oficial

> Data da auditoria: 2026-08-14  
> Escopo exclusivo: `https://solarbuyside.com.br/` (raiz `/`) e o Admin canônico
> `https://plataforma.solarbuyside.com.br/admin/landing`.  
> Não inclui a cópia congelada `/1` nem versões antigas `/v1`–`/v4`.

## Situação da implementação nesta rodada

Implementado no working tree: correção de campos tocados por seção/tipo,
semântica de texto e imagem vazios na V4 oficial, seis textos dos índices,
páginas repetíveis dos dois índices, textos do menu e CTA do cabeçalho, preview
do rascunho em memória com origem restrita, redirect do `/admin`, comparação
estável de JSON e bloqueio de upload SVG. Builds e 225 testes passaram; o fluxo
do preview também foi validado em Chromium com Playwright.

Em 2026-08-14, os fallbacks visíveis que ainda estavam ausentes no Supabase
foram materializados em produção por
`apps/platform/scripts/backfill-admin-defaults-1408.mjs`: 59 chaves em seis
seções e os globais `logo`/`favicon`. O processo preservou todas as chaves
existentes, inclusive vazias, gravou publicado e rascunho com o mesmo valor e
gerou snapshot anterior em `/tmp`. Um segundo dry-run retornou zero alterações.

Mantido deliberadamente para uma próxima rodada, por exigir modelagem ou
confirmação operacional adicional: dados internos da simulação da Plataforma,
busca/filtros no editor, ação separada “Restaurar padrão”, validação allowlist
de chaves nas Server Actions, histórico/rollback, remoção física do frontend
legado e do backend Render. O legado está inativo e a rota pública agora aponta
para o Admin canônico, mas os arquivos não foram apagados sem confirmar os
deploys antigos que ainda possam referenciá-los.

## Objetivo

Garantir que todo texto e toda imagem editorial visível na LP oficial possa ser
localizado, alterado, ocultado, restaurado e publicado pelo Admin, sem depender
de mudança no código. O editor deve seguir a mesma ordem da página, mostrar o
rascunho antes da publicação e impedir que valores padrão do código reapareçam
quando o cliente apaga um campo.

## Resultado da auditoria atual

### Problemas críticos confirmados

1. **Os dois índices não estão modelados no Admin.** A LP lê
   `indexKicker`, `indexTitle`, `indexLead`, `codeIndexKicker`,
   `codeIndexTitle` e `codeIndexLead`, mas essas chaves não constam no manifesto
   de `manual-strategic`. Como também ainda não existem no banco, o fallback
   “Outros campos” não consegue mostrá-las.

2. **As páginas dos índices são fixas no código.** O Manual usa as páginas
   08–14 e o Código usa 03–04, com caminhos, ordem e rótulos definidos em
   `ManualStrategicV4.tsx`. Não há upload, remoção ou reordenação pelo Admin.

3. **Apagar texto nem sempre vence o padrão do código.** Há tratamentos de
   legado usando `!valor`, `startsWith()` ou fallback conjunto. Casos atuais:
   subtítulo do Hero, título da Plataforma quando as duas partes ficam vazias,
   CTA da Plataforma e CTA do Manual. Nesses pontos, `""` pode fazer uma frase
   hardcoded reaparecer.

4. **“Remover imagem” não remove a imagem da LP.** O Admin grava `""`, mas os
   componentes usam `imagemDoCms || imagemPadrao`. Assim, capa, foto, pôster ou
   logo padrão volta para a página após a remoção.

5. **O rastreamento de campos tocados mistura seções.** `editor.tsx` usa um
   único `Set<string>` com nomes como `title`. Depois de editar `title` numa
   seção, salvar outra seção pode considerar o `title` dela como tocado e
   gravar um vazio que o cliente nunca pediu.

6. **O preview não é preview do rascunho.** O iframe abre a LP publicada. Ele
   rola até a seção escolhida, mas não recebe as alterações ainda não
   publicadas. Isso faz o cliente salvar e continuar vendo o texto antigo.

7. **Existe um Admin legado duplicado no repositório.** Os arquivos em
   `apps/landing/src/components/admin`, `AuthContext.tsx` e as mutações antigas
   de `ContentContext.tsx` apontam para o backend aposentado da Render. Não são
   importados pela LP atual, porém mantêm duas implementações e duas fontes de
   verdade aparentes.

8. **A rota pública `/admin` leva ao lugar errado.** Hoje
   `solarbuyside.com.br/admin` responde com a SPA e depois volta para `/`. Deve
   redirecionar no servidor para o Admin canônico da plataforma.

9. **Há conteúdo visível ainda fixo.** Menu superior, CTA “Garantir Acesso”,
   textos e dados internos da demonstração animada da Plataforma e alguns
   rótulos auxiliares não estão no modelo editorial.

### Pontos que já estão corretos e devem ser preservados

- O Admin canônico revalida a sessão em cada Server Action e na rota de upload.
- Rascunho e publicado são separados no Supabase.
- O botão Publicar dispara o deploy da landing.
- Rich text usa allowlist de classes antes de renderizar HTML.
- O campo `retorno.outro` já edita a frase “E tem mais”.
- FAQ, parágrafos do Código, tabela de equipe, depoimentos e logos já possuem
  editores repetíveis.
- O banco auditado não possui rascunhos pendentes neste momento.

## Contrato editorial proposto

Texto e imagem precisam compartilhar a mesma semântica de três estados:

| Estado | Persistência | Resultado na LP |
|---|---|---|
| Usar padrão | chave ausente | usa o fallback versionado |
| Personalizado | string não vazia | usa exatamente o valor do Admin |
| Oculto | string vazia | não renderiza o elemento |

O Admin deve mostrar ações diferentes para **Ocultar** e **Restaurar padrão**.
Remover uma imagem significa ocultá-la; restaurar a imagem padrão remove a chave
do JSON. Um campo vazio nunca pode ser interpretado como “usar o padrão”.

Tratamentos de copy antiga devem ser feitos uma vez em migration/backfill, não
durante cada render. Depois do backfill, comparações com textos antigos e
`startsWith()` saem dos componentes.

## Arquitetura alvo

### 1. Um único Admin

- Manter somente `apps/platform/src/app/(app)/admin/landing` como editor.
- Criar redirect de servidor em `apps/landing/vercel.json`:
  `/admin` e `/admin/:path*` →
  `https://plataforma.solarbuyside.com.br/admin/landing`.
- Remover o frontend administrativo legado da landing e as APIs/métodos de
  edição mortos do `ContentContext`.
- Avaliar separadamente a remoção do diretório `apps/landing/backend` após
  confirmar que nenhum deploy da Vercel ou serviço externo ainda o referencia.

### 2. Contrato verificável entre LP e Admin

- Completar `LANDING_SCHEMA` para todas as seções vivas da raiz.
- Criar teste/validador que extraia as chaves lidas por `criarTxt`, imagens e
  padrões repetíveis da V4 e falhe quando uma chave viva não estiver:
  - no manifesto do Admin;
  - explicitamente marcada como estrutural/não editorial; ou
  - coberta por um editor repetível.
- O mesmo teste deve falhar quando o Admin expuser campo morto como se estivesse
  na página oficial.
- Adicionar uma checagem de ordem: `AppV4.SECTION_IDS`, `LANDING_SCHEMA.order`,
  âncoras do preview e funil devem permanecer alinhados.

### 3. Leitores únicos para texto e imagem

- Manter `criarTxt` com a regra chave ausente/presente, removendo bypasses nos
  componentes.
- Criar `criarImagem` com a mesma regra e renderização condicional.
- Migrar todas as imagens da V4 oficial para esse leitor.
- Corrigir `touched` para usar identidade completa
  `sectionId + tipo + key`, limpando o estado após salvar a seção.
- Trocar `sameMap` por comparação estável também no servidor.

### 4. Preview real do rascunho

- Abrir a LP em modo de preview explícito.
- O Admin envia o rascunho atual ao iframe por `postMessage`.
- A landing aceita mensagens somente da origem canônica da plataforma e de
  localhost em desenvolvimento; não usar `"*"`.
- O preview mescla o conteúdo apenas em memória, sem escrever no Supabase ou no
  `localStorage` público.
- Mudanças de texto, rich text, imagem, lista e ocultação devem aparecer no
  iframe antes de Salvar/Publicar.

### 5. Organização orientada à LP

A navegação do editor deve seguir a ordem real da raiz:

1. Cabeçalho e navegação
2. Hero
3. Plataforma de avaliação
4. Para que servem
5. Apoiadores
6. Mentores
7. Panorama
8. Vídeo
9. Manual
10. Índice do Manual
11. Código do Vendedor
12. Índice do Código
13. Transformação
14. Retorno
15. Depoimento Lucas
16. Depoimento Rodrigo
17. Compra simples
18. Capacite seu time
19. Oferta e preço
20. FAQ
21. Contato e rodapé

Se duas partes compartilham a mesma linha do banco, isso fica invisível para o
cliente. “Para que servem” e “Capacite seu time” devem aparecer na posição
correta, mesmo que o adaptador interno ainda grave em `apoiadores` e `pricing`.

Adicionar busca por frase/rótulo para o cliente localizar um texto colando um
trecho da LP. Cada campo deve informar “onde aparece” e oferecer “ver no
preview”.

## Fases de implementação

### Fase 0 — Proteção e fotografia do estado

- Exportar snapshot somente leitura de `landing_sections` e `landing_globals`.
- Registrar contagem e hash das chaves publicadas e de rascunho.
- Criar testes de caracterização para a copy e as imagens atuais da raiz.
- Confirmar que o deploy ativo usa apenas o Admin da plataforma.

**Aceite:** é possível comparar antes/depois e restaurar o conteúdo atual sem
depender do git.

### Fase 1 — Corrigir semântica de edição

- Corrigir `touched` por seção/campo.
- Implantar os leitores de texto e imagem com três estados.
- Remover fallbacks por falsy e tratamentos runtime de copy legada.
- Corrigir o botão Remover imagem e adicionar Restaurar padrão.
- Validar no servidor tipos, tamanho, seção e chaves aceitas antes de salvar.
- Manter sanitização rich text e restringir upload a formatos seguros; SVG deve
  ser sanitizado ou removido da lista de formatos aceitos.

**Aceite:** apagar cada campo testado mantém o elemento ausente após salvar,
publicar, recarregar, hidratar e fazer novo deploy.

### Fase 2 — Cobertura integral da LP oficial

- Adicionar os seis campos de texto dos índices ao manifesto.
- Criar editores repetíveis “Páginas do índice” para Manual e Código com upload,
  remover, reordenar, número/rótulo e texto alternativo.
- Mapear textos e imagens restantes do cabeçalho, rodapé e demonstração da
  Plataforma.
- Separar conteúdo editorial da demonstração de dados. Os dados da simulação
  também ficam editáveis, mas com validação numérica e aviso de consistência.
- Fazer backfill não destrutivo: preencher somente chaves ausentes; nunca
  sobrescrever conteúdo já editado.

**Aceite:** o validador de cobertura retorna zero chaves editoriais vivas sem
campo no Admin.

### Fase 3 — Reorganizar a experiência do Admin

- Reordenar as 21 entradas conforme a raiz.
- Criar grupos próprios para os dois índices.
- Adicionar busca por texto, filtros “com rascunho”, “ocultos” e “com erro”.
- Mostrar status por campo: padrão, personalizado ou oculto.
- Adicionar contagem de caracteres real, alerta de URL/imagem quebrada e
  indicação clara do efeito de deixar vazio.
- Manter o design corporativo de `design.md` e os componentes existentes da
  plataforma.

**Aceite:** uma pessoa que só possui um print consegue encontrar o campo
correspondente sem conhecer nomes internos nem a seção do banco.

### Fase 4 — Preview de rascunho e publicação confiável

- Implementar preview em memória via origem restrita.
- Atualizar preview a cada alteração, inclusive mídia e itens repetíveis.
- Exibir separadamente: não salvo, rascunho salvo, publicado e deploy concluído.
- Não marcar como publicado quando alguma seção/global falhar.
- Adicionar histórico mínimo de publicações com rollback da versão anterior.

**Aceite:** o cliente vê exatamente o que entrará no ar antes de publicar e
consegue desfazer a última publicação.

### Fase 5 — Eliminar duplicações e fechar regressões

- Criar redirect canônico `/admin` na landing.
- Remover componentes e contexto de autenticação do Admin legado.
- Remover do bundle público as mutações e o token local do CMS antigo.
- Atualizar `STATUS.md`, `docs/PLANO-EDITOR-LP.md` e documentação operacional.
- Executar busca final por rotas, imports e endpoints administrativos antigos.

**Aceite:** existe uma única URL de edição, uma única implementação ativa e
nenhuma referência a `admin-token` no bundle da landing oficial.

## Estratégia de dados

1. Toda mudança de shape terá script `--dry-run`.
2. O script lê publicado e rascunho, gera diff por seção e só então grava.
3. Novas chaves recebem o texto atualmente visível na LP apenas quando estão
   ausentes nos dois estados.
4. Strings vazias existentes são preservadas como decisão editorial.
5. Páginas atuais dos índices são semeadas na ordem em que aparecem hoje.
6. A publicação não ocorrerá automaticamente durante a migration.

## Testes obrigatórios

### Contrato e unidade

- Toda chave editorial da V4 oficial existe no Admin.
- Toda imagem visível tem campo, editor repetível ou classificação estrutural.
- Chave ausente usa padrão; `""` oculta; valor usa override.
- Editar `title` numa seção não toca `title` de outra.
- Sanitizador da plataforma e sanitizador da landing aceitam a mesma allowlist.
- Valores de URL, WhatsApp, preço e números da simulação são validados.

### Integração

- Salvar rascunho não altera o publicado.
- Publicar copia todos os rascunhos ou informa falha sem falso sucesso.
- Upload, troca, ocultação e restauração de imagem funcionam.
- Preview recebe somente mensagens da origem permitida.
- Writer/admin autorizado edita; usuário comum recebe bloqueio.

### E2E e regressão visual

- Percorrer as 21 seções em desktop e mobile.
- Para cada tipo de campo: editar, esvaziar, restaurar padrão, salvar, publicar
  e recarregar a LP.
- Verificar índices, lightbox, links, FAQ, logos e formulários.
- Confirmar ausência de hydration mismatch e erros no console.
- Rodar build, lint, typecheck/testes dos dois apps e `git diff --check`.

## Ordem recomendada de entrega

Executar Fases 0 e 1 primeiro, pois corrigem perda/sobreposição de conteúdo.
Depois Fase 2 garante cobertura, Fase 3 resolve a dificuldade de localizar os
campos, Fase 4 torna o fluxo confiável e Fase 5 remove as duplicações sem risco
de apagar uma dependência ainda ativa.

Não publicar alterações de banco ou produção no meio das fases: cada fase deve
terminar com testes locais, revisão do diff, preview e um ponto de rollback.
