/**
 * Manifesto de campos da landing — "content model" legível por humanos.
 *
 * Mapeia as chaves de máquina do banco (`alertTitle`, `card1Item2`...) para
 * rótulos PT, grupos, ordem visual e tipo de input. É o que torna o editor
 * usável por um cliente não-técnico (ver docs/PLANO-EDITOR-LP.md, Fase 1).
 *
 * `type: "rich"` SÓ pode ser usado em campos que a landing renderiza via o
 * componente <CMSText> (HTML inline sanitizado). Caso contrário a LP mostraria
 * a tag literal.
 */

export type FieldType = "text" | "multiline" | "rich" | "url" | "image";

export type FieldDef = {
  key: string;
  label: string;
  help?: string;
  /** Limite sugerido de caracteres (não quebra layout). */
  maxLength?: number;
  type: FieldType;
  /** Valor efetivo da LP quando a chave ainda não existe no banco. */
  defaultValue?: string;
};

/**
 * Campo COMPOSTO: uma única caixa rich-text no editor que representa uma frase
 * cujo render na landing está fatiado em vários campos (ex.: titlePrefix +
 * titleHighlight + titleSuffix). O editor compõe a frase pra exibir e DESMONTA
 * de volta nas chaves originais ao salvar — a landing não muda (abordagem A).
 */
export type CompositePart = { key: string; role: "text" | "highlight" };
export type CompositeFieldDef = {
  kind: "composite";
  /** id sintético (não vai pro banco) — usado como chave React e label. */
  key: string;
  label: string;
  help?: string;
  /** Partes na ordem em que a landing renderiza a frase. */
  parts: CompositePart[];
  /** Classe cms-* usada na caixa pra aproximar visualmente o destaque. */
  hlClass: string;
};

export type AnyField = FieldDef | CompositeFieldDef;

export const isComposite = (f: AnyField): f is CompositeFieldDef =>
  (f as CompositeFieldDef).kind === "composite";

export type GroupDef = {
  label: string;
  fields: AnyField[];
  /** Recado exibido acima dos campos do grupo. Não é campo, não vai pro banco. */
  note?: string;
  /**
   * section_id para onde o recado manda ir. Vira um botão dentro do aviso, que
   * troca a seção selecionada no editor.
   *
   * Existe porque recado passivo não resolveu: a frase mora numa seção do
   * banco e aparece em OUTRA na tela, e mandar o cliente "procurar em Oferta /
   * Preço" é pedir que ele refaça o caminho que já não encontrou. Grupo com
   * `noteJumpTo` e `fields: []` é um atalho puro — ver o Kit no topo (Hero).
   */
  noteJumpTo?: string;
};

export type SectionSchema = {
  /** Nome humano da seção (substitui o section_id cru). */
  label: string;
  /** Ordem na landing (de cima pra baixo). */
  order: number;
  groups: GroupDef[];
  /** Chaves legadas/duplicadas a ocultar do editor (não viram "Outros campos"). */
  hiddenKeys?: string[];
  /**
   * Seção ARQUIVADA: não é renderizada em nenhuma página.
   *
   * Ela saiu da LP oficial ("/") nas remoções do Francis em 2026-07-22 e
   * sobrevivia na /1. Só que a /1 virou salvaguarda de verdade — conteúdo
   * congelado em `apps/landing/src/v4-full/content-snapshot.json`, fora do
   * banco. Logo, editar estas seções aqui não muda mais nada em lugar nenhum.
   *
   * Continuam no manifesto (e no banco) de propósito: se um dia a seção voltar
   * para a LP, o conteúdo está lá. O editor as separa numa gaveta "Arquivadas",
   * fechada por padrão, com aviso explícito.
   */
  onlyOnV1?: boolean;
};

// Atalhos de tipo para deixar o manifesto enxuto.
const t = (key: string, label: string, extra?: Partial<FieldDef>): FieldDef => ({ key, label, type: "text", ...extra });
const ml = (key: string, label: string, extra?: Partial<FieldDef>): FieldDef => ({ key, label, type: "multiline", ...extra });
const rich = (key: string, label: string, extra?: Partial<FieldDef>): FieldDef => ({ key, label, type: "rich", ...extra });
const img = (key: string, label: string, extra?: Partial<FieldDef>): FieldDef => ({ key, label, type: "image", ...extra });
// Composto: tx() = parte de texto, hl() = parte destacada.
const tx = (key: string): CompositePart => ({ key, role: "text" });
const hl = (key: string): CompositePart => ({ key, role: "highlight" });
const comp = (
  key: string,
  label: string,
  parts: CompositePart[],
  hlClass = "cms-orange",
  help?: string,
): CompositeFieldDef => ({ kind: "composite", key, label, parts, hlClass, help });

/** Máximo de logos de apoiadores (espelha MAX_LOGOS em ApoiadoresV4.tsx). */
export const MAX_LOGOS = 30;
/** Chaves geradas dos logos — ocultas do editor genérico (têm editor próprio). */
const LOGO_KEYS = Array.from({ length: MAX_LOGOS }, (_, i) => i + 1).flatMap((i) => [
  `logo${i}Src`,
  `logo${i}Url`,
  `logo${i}Name`,
  `logo${i}Desc`,
  `logo${i}Cat`,
  `logo${i}Hidden`,
  `logo${i}BandOff`,
]);

export const LANDING_SCHEMA: Record<string, SectionSchema> = {
  hero: {
    label: "Topo (Hero)",
    order: 0,
    groups: [
      {
        label: "Cabeçalho e navegação",
        fields: [
          t("navPlatform", "Menu — Plataforma", { defaultValue: "Plataforma" }),
          t("navMentor", "Menu — Mentor", { defaultValue: "Mentor" }),
          t("navPanorama", "Menu — Panorama", { defaultValue: "Panorama" }),
          t("navVideo", "Menu — Vídeo", { defaultValue: "Vídeo" }),
          t("navAudience", "Menu — Para Quem", { defaultValue: "Para Quem" }),
          t("navFaq", "Menu — FAQ", { defaultValue: "FAQ" }),
          t("headerCta", "Botão do cabeçalho", { defaultValue: "Garantir Acesso" }),
        ],
      },
      {
        label: "Título principal",
        fields: [
          comp(
            "title",
            "Título",
            [tx("titlePrefix"), hl("titleHighlight"), tx("titleSuffix")],
            "cms-gradient-orange",
            "Frase inteira numa caixa. Selecione o trecho e clique em Destaque (o miolo da frase é o destacado).",
          ),
          ml("subtitle", "Subtítulo", {
            help: 'Única frase abaixo do título. Revisão 25/07: "O Movimento Solar Buy-Side promove uma nova forma de vender: pela perspectiva do comprador".',
          }),
        ],
      },
      {
        label: "Selo do produto",
        fields: [t("manualTitle", "Selo acima do título")],
      },
      {
        label: "Kit no topo (4 capas + frase + botão)",
        note: "O botão laranja do topo (“Quero o Kit Completo Agora”), os títulos das quatro capas e as frases curtas abaixo delas NÃO se editam aqui: pertencem à seção “Oferta / Preço” no banco, mesmo aparecendo no topo da página. Use o botão abaixo. As CAPAS são as mesmas dos cards da oferta: trocar lá troca aqui.",
        noteJumpTo: "pricing",
        fields: [],
      },
    ],
    // Chaves que existem no banco mas a LP não usa — não vale expor no editor.
    // ctaSubtext e scrollHint saíram do Hero em 2026-07-23 (Francis, slide 1:
    // "eliminar essas duas frases de letras miúdas"); scrollHint sobrevive só
    // como aria-label do botão de rolagem, sem texto visível.
    //
    // Revisão 25/07: o Hero perdeu o botão (ctaButton) e o "ticket" com as
    // capas do Manual e do Código (manualSubtitle, bonusTitle, bonusSubtitle,
    // heroImage). Agora o topo é só título + subfrase, e o primeiro botão da
    // página é o CTA 1, na seção de Autores.
    hiddenKeys: [
      "bonusBadge",
      "ctaSubtext",
      "scrollHint",
      "ctaButton",
      "manualSubtitle",
      "bonusTitle",
      "bonusSubtitle",
      "heroImage",
    ],
  },

  context: {
    label: "Contexto / Panorama",
    order: 4,
    groups: [
      {
        label: "Topo",
        fields: [
          t("badge", "Selo superior", { maxLength: 40 }),
          comp(
            "title",
            "Título",
            [tx("title"), hl("titleHighlight")],
            "cms-orange",
            "Frase inteira numa caixa. Destaque a palavra final (ex.: o ano).",
          ),
          ml("subtitle", "Subtítulo"),
        ],
      },
      {
        label: "Cards (3 colunas)",
        fields: [
          t("card1Title", "Card 1 — título"),
          ml("card1Desc", "Card 1 — descrição"),
          t("card2Title", "Card 2 — título"),
          ml("card2Desc", "Card 2 — descrição"),
          t("card3Title", "Card 3 — título"),
          ml("card3Desc", "Card 3 — descrição"),
        ],
      },
      {
        label: "Fecho (abaixo dos 3 cards)",
        /* O TÍTULO GANHOU CAMPO PRÓPRIO em 09/08 (Francis: "transformar a
           frase em subtítulo do bloco Panorama"). Ele estava embutido no
           começo do parágrafo, em negrito, e por isso não dava para mexer no
           título sem editar o texto inteiro. */
        fields: [
          t("closingTitle", "Subtítulo do fecho", {
            maxLength: 70,
            help: "Sai em destaque, acima do parágrafo. Apagar o campo tira só o subtítulo; o parágrafo continua.",
          }),
          rich("closing", "Parágrafo de fecho", {
            help: "Fica logo abaixo do subtítulo, com um filete laranja à esquerda. Apagar o campo tira o parágrafo da página.",
          }),
        ],
      },
    ],
    // A faixa "Quem não entender essa nova jornada" e o painel "Ainda há tempo
    // para reverter" foram removidos em 2026-07-26: no lugar deles entrou o
    // bloco das duas frases, que é editado na seção "Vídeo" (outroLine1/2).
    hiddenKeys: [
      "alertTitle",
      "alertSubtitle",
      "solutionBadge",
      "solutionTitle",
      "solutionDesc",
      "check1",
      "check2",
      "check3",
      "ctaButton",
      "ctaSubtext",
    ],
  },

  video: {
    label: "Vídeo",
    order: 5,
    groups: [
      {
        label: "Faixa de alerta",
        fields: [
          t("alertBadge", "Alerta — selo", { maxLength: 40 }),
          t("alertTitle", "Alerta — título"),
          t("alertSubtitle", "Alerta — subtítulo"),
        ],
      },
      {
        // Francis, 06/08, slide 10: "acrescentar abaixo do título". É o roteiro
        // do vídeo em três marcadores, para quem não vai dar play sair sabendo
        // o argumento.
        label: "Marcadores abaixo do título",
        note: "Aparecem entre o subtítulo do alerta e o player, em três colunas. Item vazio some da lista; esvaziar todos tira a lista da página.",
        fields: [
          rich("bullet1", "Marcador 1", { defaultValue: "Os 3 riscos: integrador, tecnológico e financeiro" }),
          rich("bullet2", "Marcador 2", { defaultValue: "A solução: o Manual de Compra de Sistema Solar Buy-Side" }),
          rich("bullet3", "Marcador 3", { defaultValue: "O resultado: o comprador leigo vira comprador informado" }),
          rich("bullet4", "Marcador 4", { help: "Deixe vazio para não exibir." }),
          rich("bullet5", "Marcador 5", { help: "Deixe vazio para não exibir." }),
        ],
      },
      {
        label: "Player",
        fields: [
          t("videoBadge", "Vídeo — selo", { maxLength: 40 }),
          t("videoTitle", "Vídeo — título"),
          t("videoDuration", "Duração", { maxLength: 20 }),
          img("videoPoster", "Capa do vídeo", {
            help: "Imagem que aparece antes de o vídeo começar.",
            defaultValue: "/assets/capa-video-solar.jpeg",
          }),
        ],
      },
      {
        // Francis, slide 6: "após a seção VÍDEO, inserir este texto como
        // sub-título". Duas frases em contraste, uma por campo.
        label: "Frase de fechamento",
        fields: [
          ml("outroLine1", "Linha 1 (diagnóstico)"),
          ml("outroLine2", "Linha 2 (a virada)"),
        ],
      },
    ],
    // ctaButton: o botão do fim do vídeo saiu na revisão de 25/07. A página
    // passou a ter 6 CTAs numerados e nenhum deles fica aqui.
    //
    // title + card1/2/3: o cabeçalho "Descubra o que o Manual ensina..." e os
    // três cards (Os 3 grandes RISCOS / Comprador Informado / Jornada
    // Planejada) foram removidos em 2026-07-26. Sobrou o alerta + o player,
    // que agora vivem dentro do Panorama 2026.
    hiddenKeys: [
      "ctaButton",
      "title",
      "card1Title",
      "card1Desc",
      "card1Tag",
      "card2Title",
      "card2Desc",
      "card2Tag",
      "card3Title",
      "card3Desc",
      "card3Tag",
    ],
  },

  apoiadores: {
    label: "Apoiadores",
    // Revisão 06/08 (slide 7): a seção subiu do fim da LP para a 4ª dobra, logo
    // depois de "Para que servem". A faixa que rolava no topo foi eliminada
    // (slide 3), então agora existe UM lugar só e o rótulo pode ser simples.
    order: 2,
    groups: [
      {
        label: "Topo da seção",
        fields: [
          t("title", "Título"),
          ml("subtitle", "Subtítulo"),
          t("hoverHint", "Dica de interação", {
            help: "Chip cinza ao lado do primeiro rótulo de categoria, avisando que os logos abrem um card. Apagar o campo tira a dica.",
            maxLength: 60,
            defaultValue: "Passe o mouse ou toque nos logos",
          }),
        ],
      },
      {
        // "Como o método funciona em 3 passos?" é uma dobra PRÓPRIA na página,
        // mas as chaves dela moram na seção dos Apoiadores no banco (nasceu
        // como o texto abaixo do carrossel de logos, slide 2 de 03/08). O
        // título e o selo caíam em "Outros campos", com rótulo humanizado do
        // nome cru da chave — editáveis, mas ninguém adivinha que
        // "Purpose Title" é o título daquela dobra. As três respostas têm
        // editor próprio, na aba "Propósito".
        label: "Bloco “Como o método funciona em 3 passos”",
        note: "Esta é a dobra numerada 01/02/03 que vem logo depois dos logos. Só o SELO e o TÍTULO se editam aqui; os três passos ficam na aba “Propósito”, na lista da esquerda. Apagar o título esconde a dobra inteira da página.",
        fields: [
          t("purposeKicker", "Selo acima do título", { maxLength: 40 }),
          t("purposeTitle", "Título da dobra", { maxLength: 90 }),
        ],
      },
      {
        label: "Ressalva legal (abaixo dos logos)",
        note: "Este texto vivia embaixo do carrossel do topo, que foi eliminado. Ele desceu para o pé da seção para não sumir da página junto com a faixa.",
        fields: [
          ml("disclaimer", "Ressalva", {
            help: "Ex.: “Elas não vendem os materiais nem participam da sua receita.” Apagar o campo tira a linha da página.",
          }),
        ],
      },
    ],
    // Os logos têm editor próprio ("Todos os logos"), com upload de imagem,
    // categoria e texto do card por item — não faz sentido expô-los como
    // dezenas de campos soltos aqui.
    //
    // bandTitle/bandSubtitle e logoNBandPos: chaves da faixa do topo, que não
    // existe mais. `bandSubtitle` continua sendo LIDA pela LP como fallback do
    // campo "Ressalva" acima, para o texto já gravado não sumir do ar; editar
    // passa a ser pelo campo novo.
    hiddenKeys: [
      ...LOGO_KEYS,
      "bandTitle",
      "bandSubtitle",
      ...Array.from({ length: MAX_LOGOS }, (_, i) => `logo${i + 1}BandPos`),
    ],
  },

  audience: {
    label: "Público (para quem é)",
    order: 6,
    // ELIMINADA da LP na revisão de 06/08 (slide 11: "eliminar o bloco
    // inteiro"). O que sobrou dela são três linhas no fim da Transformação
    // ("Para quem o Método Solar Buy-Side foi desenvolvido"), editáveis lá.
    // Fica arquivada, e não apagada, porque o texto dos três perfis é bom e ele
    // pode querer de volta.
    onlyOnV1: true,
    groups: [
      {
        label: "Topo",
        fields: [
          t("title", "Título"),
          ml("subtitle", "Subtítulo"),
        ],
      },
      {
        label: "Perfil 1",
        fields: [
          t("profile1Title", "Perfil 1 — título"),
          ml("profile1Desc", "Perfil 1 — descrição"),
          t("profile1Bullet1", "Perfil 1 — item 1"),
          t("profile1Bullet2", "Perfil 1 — item 2"),
          t("profile1Tag", "Perfil 1 — etiqueta", { maxLength: 30 }),
        ],
      },
      {
        label: "Perfil 2",
        fields: [
          t("profile2Title", "Perfil 2 — título"),
          ml("profile2Desc", "Perfil 2 — descrição"),
          t("profile2Bullet1", "Perfil 2 — item 1"),
          t("profile2Bullet2", "Perfil 2 — item 2"),
          t("profile2Tag", "Perfil 2 — etiqueta", { maxLength: 30 }),
        ],
      },
      {
        label: "Perfil 3",
        fields: [
          t("profile3Title", "Perfil 3 — título"),
          ml("profile3Desc", "Perfil 3 — descrição"),
          t("profile3Bullet1", "Perfil 3 — item 1"),
          t("profile3Bullet2", "Perfil 3 — item 2"),
          t("profile3Tag", "Perfil 3 — etiqueta", { maxLength: 30 }),
        ],
      },
      {
        // Estava como "Título de rodapé da seção" dentro do grupo "Topo" — o
        // Francis não achou o campo (2026-07-23). É a caixa destacada que
        // fecha a seção, então virou grupo próprio, no fim, com nome claro.
        // Revisão 25/07 (slide 10): o texto desta caixa foi substituído e
        // virou um bloco de cinco partes, terminando na ponte para a seção do
        // Manual. bottomTitle continua sendo a primeira linha.
        label: "Frase de fechamento",
        fields: [
          ml("bottomTitle", "Linha 1 (título)", {
            help: "Caixa em destaque no fim da seção, logo abaixo dos perfis.",
          }),
          ml("bottomHighlight", "Linha 2 (destaque em laranja)"),
          ml("bottomText", "Parágrafo"),
          ml("bottomEmphasis", "Frase em negrito"),
          ml("bottomOutro", "Ponte para a próxima seção", {
            help: "Aparece depois de um fio, com a seta para baixo.",
          }),
        ],
      },
    ],
  },

  "manual-strategic": {
    label: "Manual estratégico",
    order: 6,
    groups: [
      {
        // Francis, slide 11: "criar este título da seção MANUAL ESTRATÉGICO".
        // Abre as duas ferramentas do kit: o Manual e o Código.
        label: "Título da seção",
        fields: [
          t("kitTitle", "Título"),
          ml("kitSubtitle", "Subtítulo"),
        ],
      },
      {
        label: "Bloco 1",
        fields: [
          t("badge", "Selo", { maxLength: 40 }),
          t("title", "Título"),
          ml("subtitle", "Subtítulo"),
          ml("description1", "Parágrafo 1"),
          ml("description2", "Parágrafo 2"),
          ml("description3", "Parágrafo 3"),
          t("ctaButton", "Botão (CTA)", { maxLength: 40 }),
          // A LP lê `manualImage`. O campo apontava para `manual`, chave que
          // ninguém lê: trocar a capa pelo admin não surtia efeito nenhum.
          img("manualImage", "Imagem do manual (capa)", {
            help: "Capa que aparece ao lado do texto do Manual.",
            defaultValue: "/assets/Capa-manual-buy-side-definitiva.png",
          }),
        ],
      },
      {
        label: "Índice do Manual",
        fields: [
          t("indexKicker", "Selo", { defaultValue: "O índice completo" }),
          ml("indexTitle", "Título", {
            defaultValue: "As 7 páginas de índice do Manual",
          }),
          ml("indexLead", "Texto de apoio", {
            defaultValue: "São 160 tópicos organizados em 4 fases, do primeiro cálculo de consumo à assinatura do contrato. É este roteiro que o seu próximo cliente vai usar para avaliar a sua proposta.",
          }),
        ],
      },
      {
        // Francis, 29/07: pediu no Manual a mesma lista numerada que o Código
        // já tem, "abaixo dos 3 parágrafos", com um subtítulo próprio. Grupo
        // separado (e não mais campos dentro de "Bloco 1") para ele achar:
        // grupo longo é justamente onde ele já perdeu campo antes.
        label: "Manual — lista numerada (abaixo dos 3 parágrafos)",
        fields: [
          t("manualListTitle", "Lista — título", {
            help: 'Rótulo em laranja acima da lista. Deixe vazio para não exibir o rótulo.',
          }),
          ml("manualItem1", "Lista — item 1"),
          ml("manualItem2", "Lista — item 2"),
          ml("manualItem3", "Lista — item 3"),
          ml("manualItem4", "Lista — item 4"),
          ml("manualItem5", "Lista — item 5"),
          ml("manualItem6", "Lista — item 6", { help: "Deixe vazio para não exibir." }),
        ],
      },
      {
        // Bloco "Código do Vendedor" que aparece DENTRO do Manual na LP
        // oficial. Não confundir com a seção "Código do vendedor (bônus)",
        // que hoje só existe na /1.
        label: "Código do Vendedor (dentro do Manual)",
        fields: [
          t("codeBadge", "Selo", { maxLength: 40 }),
          t("codeTitle", "Título"),
          rich("codeSubtitle", "Subtítulo", {
            help: "Frase de destaque abaixo do título. Deixe vazio para não exibir.",
          }),
          t("codeListTitle", "Lista — título", { help: 'Ex.: "O que você leva com o Código:"' }),
          ml("codeItem1", "Lista — item 1"),
          ml("codeItem2", "Lista — item 2"),
          ml("codeItem3", "Lista — item 3"),
          ml("codeItem4", "Lista — item 4"),
          ml("codeItem5", "Lista — item 5", { help: "Deixe vazio para não exibir." }),
          ml("codeItem6", "Lista — item 6", { help: "Deixe vazio para não exibir." }),
          img("codeImage", "Imagem do Código (capa)", {
            help: "Capa que aparece ao lado do bloco do Código do Vendedor.",
            defaultValue: "/assets/codigo-oficial-norm.png",
          }),
        ],
      },
      {
        label: "Índice do Código",
        fields: [
          t("codeIndexKicker", "Selo", { defaultValue: "O índice completo" }),
          ml("codeIndexTitle", "Título", {
            defaultValue: "Tudo o que o Código cobre, tópico a tópico",
          }),
          ml("codeIndexLead", "Texto de apoio", {
            defaultValue: "Da imersão no olhar do comprador à rodada final de negociação: 4 fases, um roteiro de treinamento em 3 etapas, o mapa do essencial e o checklist Buy-Side.",
          }),
        ],
      },
    ],
    // `manual`: chave antiga da capa, substituída por `manualImage` (a que a LP
    // realmente lê). Continua no banco, mas não é mais oferecida no editor.
    //
    // codeDesc1-4 e codeTop*/codeBottom*: os parágrafos do Código viraram lista
    // no subitem "Parágrafos do Código". codeDesc* seguem no banco como
    // fallback da landing até o primeiro salvamento por lá.
    //
    // section2*, sellSideHeader/sellCard*, focusHeader/focusCard*: o "Bloco 2"
    // ("Veja o que muda quando você passa a vender pelo Método Solar Buy-Side",
    // com as colunas NA SUA FORMA DE VENDER / NO SEU FATURAMENTO) foi eliminado
    // da LP na revisão de 06/08, slide 14. Os 17 campos saíram do editor para
    // ninguém gastar tempo escrevendo texto que não aparece em lugar nenhum.
    // Continuam no banco caso ele peça o bloco de volta.
    hiddenKeys: [
      "manual",
      "codeDesc1",
      "codeDesc2",
      "codeDesc3",
      "codeDesc4",
      "section2Title",
      "section2Subtitle",
      "sellSideHeader",
      "focusHeader",
      ...Array.from({ length: 3 }, (_, i) => i + 1).flatMap((i) => [
        `sellCard${i}Title`,
        `sellCard${i}Desc`,
        `focusCard${i}Title`,
        `focusCard${i}Desc`,
      ]),
      ...Array.from({ length: 8 }, (_, i) => i + 1).flatMap((i) => [
        `codeTop${i}`,
        `codeBottom${i}`,
      ]),
      ...Array.from({ length: 12 }, (_, i) => i + 1).flatMap((i) => [
        `manualIndexPage${i}Src`,
        `manualIndexPage${i}Label`,
        `manualIndexPage${i}Alt`,
        `codeIndexPage${i}Src`,
        `codeIndexPage${i}Label`,
        `codeIndexPage${i}Alt`,
      ]),
    ],
  },

  plataforma: {
    label: "Plataforma de avaliação",
    // Revisão 06/08 (slides 4-5): subiu para a 2ª dobra, emendando direto no
    // CTA do Hero.
    order: 1,
    groups: [
      {
        label: "Topo",
        fields: [
          t("badge", "Selo", { maxLength: 40 }),
          /* AS CORES INVERTERAM DE NOVO em 09/08 ("gostaria inverter as
             cores: branco 'Sua Proposta Tem Nota', laranja 'A do Seu
             Concorrente Também'"). Em 06/08 ele tinha pedido o contrário.

             Como o DESTAQUE agora é o FIM da frase, `hl()` passou para a
             segunda parte. Ela é a última da lista, então o que for digitado
             depois do trecho destacado continua caindo dentro dele, sem texto
             órfão — o `decomposeComposite` já trata, e esta ordem casa com a
             frase. */
          comp(
            "title",
            "Título",
            [tx("title"), hl("titleHighlight")],
            "cms-orange",
            "Frase inteira numa caixa. Destaque o FIM da frase (a virada, que sai em laranja); o começo sai em branco.",
          ),
          ml("lead", "Texto de apoio"),
        ],
      },
      {
        label: "Legenda da tabela de exemplo",
        note: "Fica logo abaixo da tabela de pontuação e da escala de risco, com um filete laranja à esquerda. É ela que explica por que a proposta vencedora venceu.",
        fields: [
          rich("tableCaption", "Legenda", {
            help: "Selecione trechos e clique em Laranja ou Negrito para destacar os números. Apagar o campo tira a legenda da página.",
          }),
        ],
      },
      {
        label: "Botão",
        fields: [t("ctaButton", "Botão (CTA 5)", { maxLength: 60 })],
      },
    ],
    // accessNote: a nota "Acesso por 6 meses..." saiu de baixo do botão em
    // 2026-07-26.
    //
    // bullet1..3: a lista "O que isso significa na prática" foi eliminada na
    // V5, slide 4 ("Eliminar os 3 bullets"). A LP não lê mais essas chaves;
    // deixá-las no editor seria oferecer três caixas que não mudam nada na
    // página. Continuam gravadas no banco caso ele peça a lista de volta.
    hiddenKeys: ["accessNote", "bullet1", "bullet2", "bullet3"],
  },

  // Depoimento do Lucas (Francis, slide 7). Mesmo modelo do Rodrigo, sem o
  // selo girando e com foto retangular. Entra logo depois do vídeo.
  "testimonial-lucas": {
    label: "Depoimento do Lucas",
    order: 9,
    groups: [
      {
        label: "Cabeçalho",
        fields: [
          t("kicker", "Rótulo acima do título"),
          ml("title", "Citação em destaque"),
        ],
      },
      {
        label: "Autor",
        fields: [
          t("authorName", "Nome do autor"),
          t("authorRole", "Cargo / perfil do autor"),
          img("testimonialImage", "Foto do autor"),
        ],
      },
      {
        label: "Citações",
        fields: [
          ml("quote1", "Parágrafo 1"),
          ml("quote2", "Parágrafo 2"),
          ml("quote3", "Parágrafo 3"),
        ],
      },
      {
        label: "Caixa + botão",
        fields: [
          t("ctaTitle", "Caixa — rótulo", { maxLength: 30 }),
          ml("ctaText", "Caixa — frase"),
          t("ctaButton", "Botão (CTA 2)", { maxLength: 48 }),
        ],
      },
    ],
  },

  // Transformação (Francis, slide 8). Textos dele, visual redesenhado.
  transformacao: {
    label: "Transformação",
    order: 7,
    groups: [
      {
        label: "Topo",
        fields: [
          t("kicker", "Rótulo", { maxLength: 30 }),
          t("title1", "Título — parte 1"),
          t("title2", "Título — parte 2 (cinza)"),
          t("title3", "Título — parte 3 (laranja)"),
          ml("bullet1", "Afirmação 1"),
          ml("bullet2", "Afirmação 2"),
          ml("bullet3", "Afirmação 3"),
        ],
      },
      {
        label: "Comparação hoje x depois",
        fields: [
          t("tableTitle", "Título da comparação"),
          t("hojeLabel", "Rótulo da coluna 1", { maxLength: 20 }),
          t("depoisLabel", "Rótulo da coluna 2", { maxLength: 20 }),
          t("row1Hoje", "Linha 1 — hoje"),
          t("row1Depois", "Linha 1 — depois"),
          t("row2Hoje", "Linha 2 — hoje"),
          t("row2Depois", "Linha 2 — depois"),
          t("row3Hoje", "Linha 3 — hoje"),
          t("row3Depois", "Linha 3 — depois"),
          t("row4Hoje", "Linha 4 — hoje"),
          t("row4Depois", "Linha 4 — depois"),
          t("row5Hoje", "Linha 5 — hoje"),
          t("row5Depois", "Linha 5 — depois"),
          t("row6Hoje", "Linha 6 — hoje"),
          t("row6Depois", "Linha 6 — depois"),
          // 7ª linha acrescentada em 06/08 (slide 15). Da 8ª em diante são
          // reserva: linha com um dos dois lados vazio não aparece na página.
          t("row7Hoje", "Linha 7 — hoje", { defaultValue: "Sem diferencial na reunião" }),
          t("row7Depois", "Linha 7 — depois", { defaultValue: "Autoridade desde o início" }),
          t("row8Hoje", "Linha 8 — hoje", { help: "Preencha os DOIS lados para a linha aparecer." }),
          t("row8Depois", "Linha 8 — depois"),
          t("row9Hoje", "Linha 9 — hoje", { help: "Preencha os DOIS lados para a linha aparecer." }),
          t("row9Depois", "Linha 9 — depois"),
          t("row10Hoje", "Linha 10 — hoje", { help: "Preencha os DOIS lados para a linha aparecer." }),
          t("row10Depois", "Linha 10 — depois"),
        ],
      },
      {
        /* Francis, 06/08, slide 15: "acrescentar com mesmo tamanho de fonte do
           que VEJA SUA TRANSFORMAÇÃO". É o que sobrou da seção "Para quem o
           Método foi desenvolvido", eliminada no slide 11. Também é o destino
           do item "Para Quem" no menu do topo. */
        label: "Para quem o Método foi desenvolvido",
        note: "Fecha a seção, abaixo da comparação. Apagar o título tira o bloco inteiro; perfil vazio some da lista.",
        fields: [
          rich("audienceTitle", "Título do bloco", { defaultValue: "Para quem o Método Solar Buy-Side foi desenvolvido" }),
          t("audience1", "Perfil 1", { defaultValue: "Empresas de integração solar" }),
          t("audience2", "Perfil 2", { defaultValue: "Empresas iniciantes" }),
          t("audience3", "Perfil 3", { defaultValue: "Representantes comerciais" }),
          t("audience4", "Perfil 4", { help: "Deixe vazio para não exibir." }),
          t("audience5", "Perfil 5", { help: "Deixe vazio para não exibir." }),
          t("audience6", "Perfil 6", { help: "Deixe vazio para não exibir." }),
        ],
      },
    ],
  },

  // Nova seção (Francis, 27/07): projeção de resultados do método, entre o
  // Manual estratégico e o depoimento do Rodrigo. Tabela de três colunas em
  // que a Buy-Side fica destacada; linhas 5 e 6 são reserva (vazias = ocultas).
  retorno: {
    label: "Retorno do método (projeção)",
    order: 8,
    groups: [
      {
        label: "Topo",
        fields: [
          t("kicker", "Rótulo", { maxLength: 30 }),
          rich("title", "Título", {
            help: "Selecione palavras e clique em Laranja para destacar.",
          }),
          rich("intro", "Parágrafo de abertura", {
            help: "Selecione o trecho dos números e use Negrito para destacar.",
          }),
        ],
      },
      {
        // O "de 20% → para 25 a 30%" gigante entre o parágrafo e a tabela.
        label: "Número em destaque",
        fields: [
          t("statLabel", "Rótulo acima do número", { maxLength: 40 }),
          t("statFrom", "Número da esquerda (hoje)", { maxLength: 12 }),
          t("statFromTag", "Etiqueta da esquerda", { maxLength: 30 }),
          t("statTo", "Número da direita (com o método)", { maxLength: 16 }),
          t("statToTag", "Etiqueta da direita", { maxLength: 30 }),
        ],
      },
      {
        label: "Tabela de impacto",
        fields: [
          t("tableTitle", "Título da tabela"),
          t("colScenario", "Coluna 1 — rótulo", { maxLength: 30 }),
          t("colTrad", "Coluna 2 — rótulo", { maxLength: 30 }),
          t("colBuy", "Coluna 3 — rótulo", { maxLength: 30 }),
          t("colBuyTag", "Coluna 3 — etiqueta", {
            maxLength: 20,
            help: "Selo pequeno ao lado do rótulo (ex.: estimativa). Deixe vazio para não exibir.",
          }),
          t("row1Label", "Linha 1 — cenário"),
          t("row1Trad", "Linha 1 — tradicional", { maxLength: 40 }),
          t("row1Buy", "Linha 1 — Buy-Side", { maxLength: 40 }),
          t("row2Label", "Linha 2 — cenário"),
          t("row2Trad", "Linha 2 — tradicional", { maxLength: 40 }),
          t("row2Buy", "Linha 2 — Buy-Side", { maxLength: 40 }),
          t("row3Label", "Linha 3 — cenário"),
          t("row3Trad", "Linha 3 — tradicional", { maxLength: 40 }),
          t("row3Buy", "Linha 3 — Buy-Side", { maxLength: 40 }),
          t("row4Label", "Linha 4 — cenário"),
          t("row4Trad", "Linha 4 — tradicional", { maxLength: 40 }),
          t("row4Buy", "Linha 4 — Buy-Side", { maxLength: 40 }),
          t("row5Label", "Linha 5 — cenário", { help: "Deixe vazio para não exibir a linha." }),
          t("row5Trad", "Linha 5 — tradicional", { maxLength: 40 }),
          t("row5Buy", "Linha 5 — Buy-Side", { maxLength: 40 }),
          t("row6Label", "Linha 6 — cenário", { help: "Deixe vazio para não exibir a linha." }),
          t("row6Trad", "Linha 6 — tradicional", { maxLength: 40 }),
          t("row6Buy", "Linha 6 — Buy-Side", { maxLength: 40 }),
        ],
      },
      {
        label: "Fechamento",
        fields: [
          rich("outro", "Frase de fechamento", {
            help: "Caixa destacada abaixo da tabela. Selecione o começo e clique em Laranja para destacar.",
          }),
        ],
      },
    ],
  },

  testimonials: {
    label: "Depoimento do Rodrigo",
    // Revisão 25/07: trocou de lugar com a Plataforma (slide 14).
    order: 10,
    groups: [
      {
        label: "Cabeçalho",
        fields: [
          t("title", "Título"),
          ml("subtitle", "Subtítulo"),
          t("intro", "Introdução", { maxLength: 60 }),
        ],
      },
      {
        label: "Autor + número",
        fields: [
          t("authorName", "Nome do autor"),
          t("authorRole", "Cargo / perfil do autor"),
          img("testimonialImage", "Foto do autor"),
          t("statLabel", "Indicador — rótulo", { maxLength: 30 }),
          t("statValue", "Indicador — valor", { maxLength: 20 }),
          t("statSubtext", "Indicador — complemento", { maxLength: 40 }),
        ],
      },
      {
        label: "Citações",
        fields: [
          ml("quote1", "Citação 1"),
          ml("quote2", "Citação 2"),
        ],
      },
      {
        label: "Chamada (CTA)",
        fields: [
          t("ctaTitle", "CTA — título"),
          ml("ctaText", "CTA — texto"),
          t("ctaButton", "Botão (CTA)", { maxLength: 40 }),
        ],
      },
    ],
  },

  "story-bridge": {
    label: "Ponte / Narrativa",
    order: 90,
    onlyOnV1: true,
    groups: [
      {
        label: "Topo",
        fields: [
          t("title", "Título"),
          ml("subtitle", "Subtítulo"),
          img("manualImage", "Imagem do manual"),
          img("testimonialImage", "Foto do depoimento"),
        ],
      },
      {
        label: "Destaques (4)",
        fields: [
          t("feature1Title", "Destaque 1 — título"),
          ml("feature1Desc", "Destaque 1 — descrição"),
          t("feature2Title", "Destaque 2 — título"),
          ml("feature2Desc", "Destaque 2 — descrição"),
          t("feature3Title", "Destaque 3 — título"),
          ml("feature3Desc", "Destaque 3 — descrição"),
          t("feature4Title", "Destaque 4 — título"),
          ml("feature4Desc", "Destaque 4 — descrição"),
        ],
      },
    ],
  },

  "seller-code": {
    label: "Código do vendedor (bônus)",
    order: 91,
    onlyOnV1: true,
    groups: [
      {
        label: "Topo",
        fields: [
          t("badge", "Selo", { maxLength: 40 }),
          t("badgeHighlight", "Selo — destaque", { maxLength: 30 }),
          comp(
            "title",
            "Título",
            [tx("title"), hl("titleHighlight")],
            "cms-orange",
            "Frase inteira numa caixa. Destaque o trecho final.",
          ),
          ml("subtitle", "Subtítulo"),
          img("bookImage", "Imagem do livro/ebook"),
        ],
      },
      {
        label: "Itens (4)",
        fields: [
          t("listTitle", "Título da lista"),
          t("item1Title", "Item 1 — título"),
          ml("item1Desc", "Item 1 — descrição"),
          t("item2Title", "Item 2 — título"),
          ml("item2Desc", "Item 2 — descrição"),
          t("item3Title", "Item 3 — título"),
          ml("item3Desc", "Item 3 — descrição"),
          t("item4Title", "Item 4 — título"),
          ml("item4Desc", "Item 4 — descrição"),
        ],
      },
      {
        label: "Bônus",
        fields: [
          t("bonusTitle", "Bônus — título"),
          ml("bonusSubtitle", "Bônus — subtítulo"),
        ],
      },
    ],
    hiddenKeys: ["listHeader", "book"],
  },

  authority: {
    label: "Autoridade (autores)",
    // Revisão 25/07 (slide 3): a seção subiu para logo depois da faixa de
    // logos, e passou a levar o primeiro botão da página.
    order: 3,
    groups: [
      {
        label: "Topo",
        fields: [
          t("badge", "Selo", { maxLength: 40 }),
          rich("title", "Título", {
            help: "Selecione o trecho que deve ficar laranja e clique em Destaque.",
          }),
        ],
      },
      {
        label: "Botão",
        fields: [
          t("ctaButton", "Botão (CTA 1)", {
            maxLength: 48,
            help: "Primeiro botão da página: o topo (Hero) deixou de ter CTA nesta revisão.",
          }),
        ],
      },
      {
        label: "Pessoa 1",
        fields: [
          t("person1Name", "Pessoa 1 — nome"),
          ml("person1Desc", "Pessoa 1 — descrição"),
          t("person1Badge", "Pessoa 1 — selo", { maxLength: 30 }),
          t("person1Tag", "Pessoa 1 — etiqueta", { maxLength: 30 }),
          t("person1Experience", "Pessoa 1 — experiência (nº)", { maxLength: 12 }),
          t("person1ExperienceLabel", "Pessoa 1 — experiência (rótulo)", { maxLength: 30 }),
          img("francis", "Pessoa 1 — foto (Francis)"),
        ],
      },
      {
        label: "Pessoa 2",
        fields: [
          t("person2Name", "Pessoa 2 — nome"),
          ml("person2Desc", "Pessoa 2 — descrição"),
          t("person2Badge", "Pessoa 2 — selo", { maxLength: 30 }),
          t("person2Tag", "Pessoa 2 — etiqueta", { maxLength: 30 }),
          t("person2Experience", "Pessoa 2 — experiência (nº)", { maxLength: 12 }),
          t("person2ExperienceLabel", "Pessoa 2 — experiência (rótulo)", { maxLength: 30 }),
          img("ovidio", "Pessoa 2 — foto (Ovídio)"),
        ],
      },
    ],
    // titleHighlight: o título virou UM campo rich-text; a chave antiga segue
    // no banco como fallback da landing até ele salvar no formato novo.
    // story*: a história tem editor próprio ("História").
    hiddenKeys: ["titleHighlight", ...Array.from({ length: 8 }, (_, i) => `story${i + 1}`)],
  },

  /* "Compra simples. Acesso imediato. Suporte garantido." (Francis, 06/08,
     slide 19: "novo bloco"). Fica entre o depoimento do Rodrigo e o bloco
     "Capacite seu time", ou seja, imediatamente antes do preço: são as três
     dúvidas que travam a mão de quem já decidiu comprar. */
  "compra-simples": {
    label: "Compra simples (antes da oferta)",
    order: 11,
    groups: [
      {
        label: "Topo",
        note: "Apagar o título tira a dobra inteira da página.",
        fields: [
          rich("title", "Título"),
          t("subtitle", "Linha de abertura"),
        ],
      },
      {
        label: "Tópico 1 — acesso aos materiais",
        fields: [
          t("item1Title", "Rótulo", { maxLength: 40 }),
          rich("item1Text", "Texto", { help: "Selecione trechos e clique em Negrito para destacar." }),
        ],
      },
      {
        label: "Tópico 2 — prazo de entrega",
        fields: [
          t("item2Title", "Rótulo", { maxLength: 40 }),
          rich("item2Text", "Texto", { help: "Selecione trechos e clique em Negrito para destacar." }),
        ],
      },
      {
        label: "Tópico 3 — suporte",
        fields: [
          t("item3Title", "Rótulo", { maxLength: 40 }),
          rich("item3Text", "Texto", { help: "Selecione trechos e clique em Negrito para destacar." }),
        ],
      },
    ],
  },

  pricing: {
    label: "Oferta / Preço",
    order: 12,
    groups: [
      {
        label: "Kit do topo (Hero)",
        note: "Estes campos aparecem no TOPO da página, abaixo do título, não aqui na oferta. As CAPAS são as mesmas dos cards da oferta (trocar lá troca aqui); os títulos e as frases são próprios do topo, porque lá cabe uma linha e aqui cabe um parágrafo. Título vazio = usa o mesmo nome do card da oferta.",
        fields: [
          t("heroKit1Title", "Título da capa 1 (Manual)", { maxLength: 48, defaultValue: "Manual de Compra de Sistema Solar" }),
          t("heroKit1Desc", "Frase da capa 1 (Manual)", { maxLength: 60 }),
          t("heroKit2Title", "Título da capa 2 (Código)", { maxLength: 48, defaultValue: "Código do Vendedor Consultivo" }),
          t("heroKit2Desc", "Frase da capa 2 (Código)", { maxLength: 60 }),
          t("heroKit3Title", "Título da capa 3 (Plataforma)", { maxLength: 48, defaultValue: "Plataforma de Avaliação de Proposta Comercial" }),
          t("heroKit3Desc", "Frase da capa 3 (Plataforma)", { maxLength: 60 }),
          t("heroKit4Title", "Título da capa 4 (Licença Coletiva)", { maxLength: 48 }),
          t("heroKit4Desc", "Frase da capa 4 (Licença Coletiva)", { maxLength: 60 }),
          rich("heroKitNote", "Linha de resumo abaixo das capas"),
          t("heroKitCta", "Botão do topo", { maxLength: 40 }),
        ],
      },
      {
        label: "Bloco “Capacite seu time” (antes da oferta)",
        note: "Bloco da Licença de Uso Coletiva, entre os depoimentos e a oferta. Os valores por pessoa NÃO são calculados: se o preço à vista mudar, atualize esta tabela na mão.",
        fields: [
          rich("teamTitle", "Título"),
          rich("teamLead", "Texto de apoio"),
          t("teamColTeam", "Cabeçalho da coluna 1", { maxLength: 40 }),
          t("teamColValue", "Cabeçalho da coluna 2", { maxLength: 40 }),
          // Francis, 06/08, slide 20: "acrescentar e destacar essa frase abaixo
          // da tabela".
          rich("teamNote", "Frase destacada abaixo da tabela", {
            help: "Caixa laranja no fim do bloco. Ex.: “E tem mais economia: Integradoras Credenciadas Belenergy garantem 15% OFF.” Deixe VAZIO para esconder.",
            defaultValue: "E tem mais economia: Integradoras Credenciadas <span class=\"cms-bold\">Belenergy</span> garantem 15% OFF.",
          }),
          img("teamImage", "Imagem à direita", { defaultValue: "/assets/coletiva-norm.png" }),
        ],
      },
      {
        label: "Cabeçalho",
        fields: [
          t("badge", "Selo", { maxLength: 40 }),
          rich("title", "Título principal", {
            help: "Selecione palavras e use Laranja/Azul/Gradiente para destacar.",
          }),
          rich("titleFirst", "Título (variante A)", {
            help: "O efeito de cor/gradiente já vem aplicado. Edite o texto e use os botões para destacar.",
          }),
          rich("titleSecond", "Título (variante B)", {
            help: "O efeito de cor/gradiente já vem aplicado. Edite o texto e use os botões para destacar.",
          }),
          ml("subtitle", "Subtítulo"),
          t("subtitleFirst", "Subtítulo (variante A)"),
          t("subtitleSecond", "Subtítulo (variante B)"),
        ],
      },
      {
        label: "Entregáveis (cards)",
        fields: [
          t("featuresTitle", "Título da lista"),
          t("card1Title", "Card 1 — título"),
          ml("card1Desc", "Card 1 — descrição"),
          t("card1Tag", "Card 1 — etiqueta", { maxLength: 30 }),
          img("card1Image", "Card 1 — imagem"),
          t("card2Title", "Card 2 — título"),
          ml("card2Desc", "Card 2 — descrição"),
          t("card2Tag", "Card 2 — etiqueta", { maxLength: 30 }),
          img("card2Image", "Card 2 — imagem"),
          t("card3Title", "Card 3 — título"),
          ml("card3Desc", "Card 3 — descrição"),
          t("card3Tag", "Card 3 — etiqueta", { maxLength: 30 }),
          img("card3Image", "Card 3 — imagem"),
          // Francis, slide 17: "acrescentar a frase e a destacar". Fica na
          // caixa laranja logo abaixo das capas. Apagar esconde a caixa.
          rich("paybackNote", "Frase destacada abaixo das capas", {
            help: "Deixe VAZIO para esconder a caixa. Selecione o fecho e clique em Laranja para destacar.",
          }),
        ],
      },
      {
        // Card bônus "Plataforma de Avaliação" — a LP já lia estas chaves, mas
        // elas não estavam no manifesto nem no banco: era um card de produto
        // inteiro impossível de editar. (O antigo grupo "Bônus" tinha só
        // bonusBadge, que a LP nunca leu — virou hiddenKeys.)
        label: "Card bônus — Plataforma",
        fields: [
          t("cardPlatformTag", "Etiqueta", { maxLength: 30 }),
          t("cardPlatformTitle", "Título"),
          ml("cardPlatformDesc", "Descrição"),
          img("cardPlatformImage", "Imagem", { defaultValue: "/assets/capa-plataforma-tablet.png" }),
        ],
      },
      {
        label: "Plano e preço",
        fields: [
          t("planBadge", "Plano — selo", { maxLength: 40 }),
          t("planTitle", "Plano — título"),
          t("priceFrom", "Preço — 'de'", { maxLength: 20 }),
          t("priceInstallments", "Preço — parcelas", { maxLength: 20 }),
          t("priceValue", "Preço — valor", { maxLength: 12 }),
          t("priceCents", "Preço — centavos", { maxLength: 6 }),
          t("priceUpfront", "Preço — à vista", { maxLength: 40 }),
          t("ctaButton", "Botão (CTA)", { maxLength: 40 }),
          t("finalCtaButton", "Botão final (CTA)", { maxLength: 40 }),
          t("benefit1", "Garantia 1", { maxLength: 40 }),
          t("benefit2", "Garantia 2", { maxLength: 40 }),
          t("benefit3", "Garantia 3", { maxLength: 40 }),
          t("secureNote", "Nota abaixo dos selos de pagamento", { maxLength: 60 }),
        ],
      },
      {
        // Campanha promocional entre o preço e o botão de compra. Apagar o
        // título tira o bloco inteiro da LP — é assim que a campanha se
        // liga/desliga sem precisar de deploy.
        label: "Promoção (parceiro)",
        fields: [
          rich("promoTitle", "Título", {
            help: "Deixe VAZIO para esconder o bloco da promoção na LP.",
          }),
          ml("promoSubtitle", "Subtítulo"),
          // Terceira linha da promo (Francis, slide 18): o reembolso da
          // diferença para quem ainda não tem cupom.
          rich("promoNote", "Linha de reembolso", {
            help: "Terceira linha do bloco. Selecione o valor e clique em Laranja para destacar.",
          }),
          img("promoLogo", "Logo do parceiro", {
            help: "Aparece grande, no fim da primeira linha.",
          }),
        ],
      },
      {
        /* Botão do formulário de credenciamento do parceiro (Francis, 06/08,
           slide 22). Ele já existiu e saiu em 26/07 por não levar a lugar
           nenhum; volta com URL de verdade e com interruptor, porque foi isso
           que ele pediu: "no ADM pôr um interruptor on/off para o CTA do link
           Belenergy". */
        label: "Promoção — botão do formulário",
        note: "Botão em traço dentro da caixa da promoção, abaixo da linha de reembolso. Três formas de desligar: escrever 0 no interruptor, apagar o rótulo, ou apagar o link.",
        fields: [
          t("promoCtaEnabled", "Interruptor (1 = ligado, 0 = desligado)", {
            help: "Deixe 1 ou vazio para MOSTRAR o botão. Escreva 0 para esconder sem perder o rótulo nem o link.",
            maxLength: 1,
          }),
          t("promoCtaLabel", "Rótulo do botão", {
            help: "Ex.: “Formulário para cadastro (Clique aqui)”. Apagar também esconde o botão.",
            maxLength: 60,
          }),
          t("promoCtaUrl", "Link do formulário", {
            type: "url",
            help: "Abre em nova aba. Ex.: https://belenergy.com.br/seja-um-integrador-credenciado/",
          }),
        ],
      },
    ],
    // feature1Desc/bonusBadge existem no banco mas a LP não usa (bonusBadge
    // nunca foi lido; feature1Desc é resquício do fallback card1Desc).
    // promoUrl: URL do botão antigo da promo (2026-07-26). O botão voltou em
    // 06/08 com chaves próprias (promoCtaLabel/promoCtaUrl/promoCtaEnabled),
    // que TÊM campo no grupo acima. `promoUrl` continua sendo lido pela LP como
    // FALLBACK de `promoCtaUrl` — é a mesma URL da Belenergy e já está gravada,
    // então o link nasce funcionando. Fica oculto para não haver duas caixas
    // para o mesmo endereço.
    // Selos de pagamento (guarantee/visa/mastercard/pix/boleto/securePurchase):
    // herança da LP v1. Nenhum componente do v4 lê — eram 6 campos de upload
    // que não mudavam nada na página. Auditoria de 2026-07-27.
    // feature1Title/bonusTitle/bonusSubtitle/manualImage/codeImage: a LP só usa
    // como FALLBACK de card1Title/card2Title/card1Image/card2Image, que já têm
    // campo próprio aqui. Expor os dois daria duas caixas para o mesmo texto.
    hiddenKeys: [
      "feature1Desc",
      "feature1Title",
      "bonusTitle",
      "bonusSubtitle",
      "manualImage",
      "codeImage",
      "bonusBadge",
      "promoUrl",
      "guarantee",
      "visa",
      "mastercard",
      "pix",
      "boleto",
      "securePurchase",
    ],
  },

  "buyer-wave": {
    label: "Onda do comprador",
    order: 92,
    onlyOnV1: true,
    groups: [
      {
        label: "Topo",
        fields: [
          t("badge", "Selo", { maxLength: 40 }),
          rich("title", "Título", {
            help: "Selecione palavras e clique em Laranja para destacar.",
          }),
          ml("subtitle", "Subtítulo"),
        ],
      },
      {
        label: "Card 1",
        fields: [
          t("card1Title", "Card 1 — título"),
          t("card1Item1", "Card 1 — item 1"),
          t("card1Item2", "Card 1 — item 2"),
          t("card1Item3", "Card 1 — item 3"),
        ],
      },
      {
        label: "Card 2",
        fields: [
          t("card2Title", "Card 2 — título"),
          t("card2Item1", "Card 2 — item 1"),
          t("card2Item2", "Card 2 — item 2"),
          t("card2Item3", "Card 2 — item 3"),
        ],
      },
      {
        label: "Depoimentos (cabeçalho)",
        fields: [
          t("testimonialsTitle", "Depoimentos — título"),
          t("testimonialsSubtitle", "Depoimentos — subtítulo"),
          t("ctaButton", "Botão (CTA)", { maxLength: 40 }),
        ],
      },
    ],
  },

  "lead-magnet": {
    label: "Isca (ebook)",
    order: 93,
    onlyOnV1: true,
    groups: [
      {
        label: "Conteúdo",
        fields: [
          t("badge", "Selo", { maxLength: 40 }),
          comp(
            "title",
            "Título",
            [tx("title"), hl("titleHighlight")],
            "cms-orange",
            "Frase inteira numa caixa. Destaque o trecho final (ex.: “dúvidas?”).",
          ),
          ml("subtitle", "Subtítulo"),
          t("feature1", "Item 1"),
          t("feature2", "Item 2"),
          t("feature3", "Item 3"),
          t("feature4", "Item 4"),
          t("ctaButton", "Botão (CTA)", { maxLength: 40 }),
          t("ctaSubtext", "Texto abaixo do botão", { maxLength: 60 }),
          img("ebook", "Imagem do ebook"),
        ],
      },
      {
        label: "Formulário (modal)",
        fields: [
          t("modalTitle", "Modal — título"),
          ml("modalSubtitle", "Modal — subtítulo"),
          t("successTitle", "Sucesso — título"),
          ml("successMessage", "Sucesso — mensagem"),
        ],
      },
    ],
  },

  faq: {
    label: "Perguntas frequentes",
    order: 13,
    groups: [
      {
        label: "Topo da seção",
        fields: [
          t("sectionTitle", "Selo acima do título", { maxLength: 40 }),
          t("title", "Título"),
          t("ctaButton", "Botão (CTA)", { maxLength: 40 }),
        ],
      },
    ],
    // As perguntas viraram lista com adicionar/remover/reordenar, no subitem
    // "Perguntas e respostas" — expor faq1Question…faq20Answer aqui daria 40
    // campos soltos e ainda assim sem como criar a pergunta 8.
    hiddenKeys: Array.from({ length: 20 }, (_, i) => i + 1).flatMap((i) => [
      `faq${i}Question`,
      `faq${i}Answer`,
    ]),
  },

  newsletter: {
    label: "Newsletter",
    order: 94,
    onlyOnV1: true,
    groups: [
      {
        label: "Campos",
        fields: [
          t("title", "Título"),
          ml("subtitle", "Subtítulo"),
          t("placeholder", "Placeholder do e-mail", { maxLength: 40 }),
          t("ctaButton", "Botão (CTA)", { maxLength: 40 }),
          t("successButton", "Botão (sucesso)", { maxLength: 40 }),
          ml("successMessage", "Mensagem de sucesso"),
          t("privacyNote", "Nota de privacidade", { maxLength: 120 }),
        ],
      },
    ],
  },

  contact: {
    label: "Contato / Rodapé",
    order: 14,
    groups: [
      {
        label: "Cabeçalho",
        fields: [
          rich("title", "Título", {
            help: "Selecione uma palavra e clique em Laranja para destacar.",
          }),
          ml("subtitle", "Subtítulo"),
        ],
      },
      {
        label: "Dados da empresa",
        fields: [
          t("companyLabel", "Rótulo da coluna", { maxLength: 20 }),
          rich("companyName", "Nome da empresa", {
            help: "Selecione uma palavra e clique em Laranja para destacar.",
          }),
          t("cnpjLabel", "Rótulo do CNPJ", { maxLength: 20 }),
          t("cnpjValue", "CNPJ", { maxLength: 30 }),
          t("addressLabel", "Rótulo do endereço", { maxLength: 20 }),
          t("addressLine1", "Endereço — linha 1"),
          t("addressLine2", "Endereço — linha 2"),
          t("addressLine3", "Endereço — linha 3"),
          t("emailLabel", "Rótulo do e-mail", { maxLength: 20 }),
          t("emailAddress", "E-mail"),
          t("emailNote", "Observação abaixo do e-mail", { maxLength: 60 }),
        ],
      },
    ],
  },
};

/** Conjunto de classes de destaque permitidas no rich-text (espelha a landing). */
export const ALLOWED_CMS_CLASSES = [
  "cms-orange",
  "cms-blue",
  "cms-gradient-blue",
  "cms-gradient-orange",
  "cms-bold",
] as const;

/**
 * Sanitiza o HTML do rich-text: só permite <br>, </span> e <span class="...">
 * com classes do allowlist. Espelha apps/landing/.../CMSText.tsx — a landing
 * re-sanitiza ao renderizar, isto é defesa em profundidade no lado do editor.
 */
export function sanitizeCmsHtml(html: string): string {
  /* Pilha de <span>: `true` = a abertura foi mantida, `false` = foi descartada.
     Sem ela, o `</span>` era devolvido SEMPRE (inclusive quando a abertura
     tinha sido jogada fora por classe não permitida ou por vir colada do
     Word), e sobrava um `</span>` órfão gravado no banco. Órfão desses
     desequilibra a contagem de spans do decomposeComposite e faz um pedaço da
     frase se perder no salvamento seguinte. */
  const abertos: boolean[] = [];

  return html.replace(/<[^>]+>/g, (tag) => {
    if (/^<br\s*\/?>$/i.test(tag)) return "<br>";

    if (/^<\/span>$/i.test(tag)) {
      // Sem abertura correspondente, o fechamento não tem o que fechar.
      const manteve = abertos.pop();
      return manteve ? tag : "";
    }

    const spanMatch = tag.match(/^<span\s+class="([^"<>]*)"\s*>$/i);
    if (spanMatch) {
      const classes = spanMatch[1]
        .trim()
        .split(/\s+/)
        .filter((c) => (ALLOWED_CMS_CLASSES as readonly string[]).includes(c));
      if (classes.length > 0) {
        abertos.push(true);
        return `<span class="${classes.join(" ")}">`;
      }
    }
    // Qualquer outra abertura de <span> (sem class, com style do Word, …) é
    // descartada, e o fechamento dela também precisa ser.
    if (/^<span[\s>]/i.test(tag)) abertos.push(false);
    return "";
  });
}

/** Monta a frase única (HTML) a partir das chaves fatiadas, p/ exibir na caixa. */
export function composeComposite(field: CompositeFieldDef, texts: Record<string, string>): string {
  return field.parts
    .map((p) => {
      const v = (texts[p.key] ?? "").trim();
      if (!v) return "";
      return p.role === "highlight" ? `<span class="${field.hlClass}">${v}</span>` : v;
    })
    .filter(Boolean)
    .join(" ");
}

/**
 * Localiza o <span> de DESTAQUE dentro do HTML da caixa.
 *
 * Duas coisas que a versão anterior errava e que faziam o campo "pirar":
 *
 * 1. Ela pegava o PRIMEIRO <span> qualquer, sem olhar a classe. O botão
 *    Negrito também cria um <span class="cms-bold">: bastava o cliente pôr
 *    negrito numa palavra ANTES do trecho colorido para o negrito ser lido
 *    como "o destaque" e o resto da frase ir para o lixo.
 * 2. Ela usava `([\s\S]*?)` até o primeiro `</span>`. Com spans ANINHADOS
 *    (destaque com um negrito dentro, que é o que o applyClass produz quando a
 *    seleção cruza a borda de outro span) o fechamento encontrado era o do
 *    span de dentro, e a frase era cortada no meio.
 *
 * Aqui a busca é pela abertura cuja lista de classes contém a classe de
 * destaque do campo, e o fechamento é achado contando profundidade.
 */
function acharDestaque(html: string, hlClass: string): { inicio: number; fim: number; miolo: string } | null {
  const abertura = /<span\s+class="([^"<>]*)"\s*>/gi;
  let m: RegExpExecArray | null;

  while ((m = abertura.exec(html)) !== null) {
    if (!m[1].trim().split(/\s+/).includes(hlClass)) continue;

    const inicioMiolo = m.index + m[0].length;
    const tags = /<span[\s>]|<\/span>/gi;
    tags.lastIndex = inicioMiolo;
    let profundidade = 1;
    let t: RegExpExecArray | null;

    while ((t = tags.exec(html)) !== null) {
      profundidade += t[0].toLowerCase() === "</span>" ? -1 : 1;
      if (profundidade === 0) {
        return { inicio: m.index, fim: t.index + t[0].length, miolo: html.slice(inicioMiolo, t.index) };
      }
    }
    // Abertura sem fechamento: o destaque vai até o fim da caixa.
    return { inicio: m.index, fim: html.length, miolo: html.slice(inicioMiolo) };
  }
  return null;
}

/** Desmonta a frase (HTML do editor) de volta nas chaves originais da landing. */
export function decomposeComposite(field: CompositeFieldDef, html: string): Record<string, string> {
  const strip = (s: string) =>
    s
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

  const achado = acharDestaque(html, field.hlClass);
  const hlText = achado ? strip(achado.miolo) : "";
  const beforeText = strip(achado ? html.slice(0, achado.inicio) : html);
  const afterText = achado ? strip(html.slice(achado.fim)) : "";

  const hlIdx = field.parts.findIndex((p) => p.role === "highlight");
  const antes = field.parts.filter((_, i) => i < hlIdx);
  const depois = field.parts.filter((_, i) => i > hlIdx);

  /* NADA PODE SUMIR. Antes, um campo de duas partes com o destaque no fim
     (que é o caso do título da Plataforma) descartava em silêncio tudo o que
     fosse digitado DEPOIS do trecho colorido: `afterText` era calculado e
     nunca atribuído, porque nenhuma parte tinha índice maior que o do
     destaque. A caixa continuava mostrando o texto (ela é uncontrolled), então
     o cliente só descobria a perda ao recarregar. Era o "além de pirar" do
     Francis, slide 5 de 06/08.

     Quando não existe uma parte do lado onde sobrou texto, o texto vai para a
     parte de texto mais próxima que existe, no lugar certo da frase. Pior caso
     ele aparece num campo vizinho, visível e corrigível; nunca é apagado. */
  const out: Record<string, string> = {};
  field.parts.forEach((p) => {
    out[p.key] = p.role === "highlight" ? hlText : "";
  });

  const juntar = (...partes: string[]) => partes.filter(Boolean).join(" ");

  if (antes.length > 0) {
    out[antes[antes.length - 1].key] = beforeText;
  } else if (depois.length > 0) {
    // Destaque na frente e sobrou texto atrás dele: prefixa a parte seguinte.
    out[depois[0].key] = beforeText;
  } else if (beforeText) {
    out[field.parts[hlIdx].key] = juntar(beforeText, out[field.parts[hlIdx].key]);
  }

  if (depois.length > 0) {
    out[depois[0].key] = juntar(out[depois[0].key], afterText);
  } else if (antes.length > 0) {
    out[antes[antes.length - 1].key] = juntar(out[antes[antes.length - 1].key], afterText);
  } else if (afterText) {
    out[field.parts[hlIdx].key] = juntar(out[field.parts[hlIdx].key], afterText);
  }

  return out;
}

/** Rótulo legível a partir de uma chave de máquina (fallback p/ chaves não mapeadas). */
export function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/([0-9]+)/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Monta os grupos a renderizar para uma seção, combinando o manifesto com o
 * estado real (chaves vindas do banco). Chaves não mapeadas caem num grupo
 * "Outros campos" com rótulo humanizado — nada some, regressão impossível.
 */
export function buildSectionGroups(
  sectionId: string,
  textKeys: string[],
  imageKeys: string[],
): { label: string; order: number; groups: GroupDef[]; mapped: boolean; onlyOnV1: boolean } {
  const schema = LANDING_SCHEMA[sectionId];
  const known = new Set<string>();
  const groups: GroupDef[] = [];

  if (schema) {
    // Todo campo do manifesto aparece, esteja ou não no banco.
    //
    // Antes o editor filtrava pelos campos já presentes no banco, e o efeito
    // era grave: chave que a LP lê mas que nunca foi gravada ficava INVISÍVEL
    // no painel, ou seja, não dava para preencher pela primeira vez. Era o caso
    // de `pricing.promoTitle` (o liga/desliga da promo), de
    // `manual-strategic.manualImage` (a capa do manual) e de `video.videoPoster`.
    //
    // O par disto está no editor: campo que continua vazio e não existia no
    // banco NÃO é gravado, senão o primeiro "Salvar" escreveria "" por cima e
    // apagaria o texto que hoje vem do ContentData da landing.
    //
    // `note`/`noteJumpTo` VIAJAM JUNTO. Ficaram de fora deste push desde que o
    // recado foi criado, então o editor tinha o box âmbar pronto para renderizar
    // e nunca recebia texto nenhum: nenhum grupo do painel jamais exibiu aviso.
    //
    // E grupo só de recado (fields: []) era descartado inteiro pelo
    // `if (g.fields.length)`. Era exatamente o caso do "Kit no topo (Hero)",
    // criado para dizer ao Francis onde fica o botão do topo — ele sumia da
    // tela, e a pergunta "não encontrei no ADM como alterar o CTA?" voltou.
    // Agora o grupo sobrevive quando tem recado; some só se não tiver nem
    // campo nem aviso, que aí é entrada morta no manifesto mesmo.
    for (const g of schema.groups) {
      for (const f of g.fields) {
        if (isComposite(f)) f.parts.forEach((p) => known.add(p.key));
        else known.add(f.key);
      }
      if (g.fields.length || g.note) {
        groups.push({ label: g.label, fields: g.fields, note: g.note, noteJumpTo: g.noteJumpTo });
      }
    }
  }

  const hidden = new Set(schema?.hiddenKeys ?? []);
  const leftoverText = textKeys
    .filter((k) => !known.has(k) && !hidden.has(k))
    .map((k) => t(k, humanizeKey(k)));
  const leftoverImg = imageKeys
    .filter((k) => !known.has(k) && !hidden.has(k))
    .map((k) => img(k, humanizeKey(k)));
  const leftover = [...leftoverText, ...leftoverImg];
  if (leftover.length) groups.push({ label: "Outros campos", fields: leftover });

  return {
    label: schema?.label ?? humanizeKey(sectionId),
    order: schema?.order ?? 999,
    onlyOnV1: Boolean(schema?.onlyOnV1),
    groups,
    mapped: Boolean(schema),
  };
}
