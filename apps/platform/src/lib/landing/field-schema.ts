/**
 * Manifesto de campos da landing — "content model" legível por humanos.
 *
 * Mapeia as chaves de máquina do banco (`alertTitle`, `card1Item2`...) para
 * rótulos PT, grupos, ordem visual e tipo de input. É o que torna o editor
 * usável por um cliente não-técnico (ver docs/PLANO-EDITOR-LP.md, Fase 1).
 *
 * `type: "rich"` SÓ pode ser usado em campos que a landing renderiza via o
 * componente <CMSText> (HTML inline sanitizado). Caso contrário a LP mostraria
 * a tag literal. Hoje são: video.title, manual-strategic.section2Title,
 * buyer-wave.title, pricing.title.
 */

export type FieldType = "text" | "multiline" | "rich" | "url" | "image";

export type FieldDef = {
  key: string;
  label: string;
  help?: string;
  /** Limite sugerido de caracteres (não quebra layout). */
  maxLength?: number;
  type: FieldType;
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

export type GroupDef = { label: string; fields: AnyField[] };

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
]);

export const LANDING_SCHEMA: Record<string, SectionSchema> = {
  hero: {
    label: "Topo (Hero)",
    order: 0,
    groups: [
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
    order: 2,
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
    order: 3,
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
        label: "Player",
        fields: [
          t("videoBadge", "Vídeo — selo", { maxLength: 40 }),
          t("videoTitle", "Vídeo — título"),
          t("videoDuration", "Duração", { maxLength: 20 }),
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
    label: "Apoiadores institucionais",
    // Revisão 25/07 (slide 16): a seção desceu para depois da Plataforma.
    order: 10,
    groups: [
      {
        label: "Seção",
        fields: [
          t("title", "Título"),
          ml("subtitle", "Subtítulo"),
        ],
      },
      {
        label: "Faixa de logos",
        fields: [
          t("bandTitle", "Faixa — título"),
          ml("bandSubtitle", "Faixa — texto abaixo dos logos"),
        ],
      },
    ],
    // Os logos têm editor próprio ("Logos dos apoiadores"), com upload de
    // imagem, categoria e texto do card por item — não faz sentido expô-los
    // como dezenas de campos soltos aqui.
    hiddenKeys: LOGO_KEYS,
  },

  audience: {
    label: "Público (para quem é)",
    order: 6,
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
    order: 7,
    groups: [
      {
        // Francis, slide 11: "criar este título da seção MANUAL ESTRATÉGICO".
        // Abre o bloco inteiro (Manual + Código + resultados).
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
          img("manual", "Imagem do manual"),
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
          ml("codeDesc1", "Parágrafo 1"),
          ml("codeDesc2", "Parágrafo 2"),
          ml("codeDesc3", "Parágrafo 3", { help: "Deixe vazio para não exibir." }),
          ml("codeDesc4", "Parágrafo 4", { help: "Deixe vazio para não exibir." }),
          t("codeListTitle", "Lista — título", { help: 'Ex.: "O que você leva com o Código:"' }),
          ml("codeItem1", "Lista — item 1"),
          ml("codeItem2", "Lista — item 2"),
          ml("codeItem3", "Lista — item 3"),
          ml("codeItem4", "Lista — item 4"),
          ml("codeItem5", "Lista — item 5", { help: "Deixe vazio para não exibir." }),
          ml("codeItem6", "Lista — item 6", { help: "Deixe vazio para não exibir." }),
        ],
      },
      {
        label: "Bloco 2",
        fields: [
          rich("section2Title", "Bloco 2 — título", {
            help: "Selecione palavras e clique em Laranja para destacar.",
          }),
          t("section2Subtitle", "Bloco 2 — subtítulo"),
        ],
      },
      {
        label: "Coluna 'Sell-Side'",
        fields: [
          t("sellSideHeader", "Cabeçalho"),
          t("sellCard1Title", "Card 1 — título"),
          ml("sellCard1Desc", "Card 1 — descrição"),
          t("sellCard2Title", "Card 2 — título"),
          ml("sellCard2Desc", "Card 2 — descrição"),
          t("sellCard3Title", "Card 3 — título"),
          ml("sellCard3Desc", "Card 3 — descrição"),
        ],
      },
      {
        label: "Coluna 'Foco'",
        fields: [
          t("focusHeader", "Cabeçalho"),
          t("focusCard1Title", "Card 1 — título"),
          ml("focusCard1Desc", "Card 1 — descrição"),
          t("focusCard2Title", "Card 2 — título"),
          ml("focusCard2Desc", "Card 2 — descrição"),
          t("focusCard3Title", "Card 3 — título"),
          ml("focusCard3Desc", "Card 3 — descrição"),
        ],
      },
    ],
  },

  plataforma: {
    label: "Plataforma de avaliação",
    // Revisão 25/07: trocou de lugar com o depoimento do Rodrigo (slide 15).
    order: 9,
    groups: [
      {
        label: "Topo",
        fields: [
          t("badge", "Selo", { maxLength: 40 }),
          comp(
            "title",
            "Título",
            [tx("title"), hl("titleHighlight")],
            "cms-orange",
            "Frase inteira numa caixa. Destaque o trecho final (o que aparece em laranja).",
          ),
          ml("lead", "Texto de apoio"),
        ],
      },
      {
        label: "Itens (3)",
        fields: [
          t("bullet1", "Item 1"),
          t("bullet2", "Item 2"),
          t("bullet3", "Item 3"),
        ],
      },
      {
        label: "Botão",
        fields: [
          t("ctaButton", "Botão (CTA)", { maxLength: 40 }),
          t("accessNote", "Nota abaixo do botão", { maxLength: 80 }),
        ],
      },
    ],
  },

  // Depoimento do Lucas (Francis, slide 7). Mesmo modelo do Rodrigo, sem o
  // selo girando e com foto retangular. Entra logo depois do vídeo.
  "testimonial-lucas": {
    label: "Depoimento do Lucas",
    order: 4,
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
    order: 5,
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
        ],
      },
    ],
  },

  testimonials: {
    label: "Depoimento do Rodrigo",
    // Revisão 25/07: trocou de lugar com a Plataforma (slide 14).
    order: 8,
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
    order: 1,
    groups: [
      {
        label: "Topo",
        fields: [
          t("badge", "Selo", { maxLength: 40 }),
          comp(
            "title",
            "Título",
            [tx("title"), hl("titleHighlight")],
            "cms-orange",
            "Frase inteira numa caixa. Destaque o trecho final.",
          ),
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
  },

  pricing: {
    label: "Oferta / Preço",
    order: 11,
    groups: [
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
          img("cardPlatformImage", "Imagem"),
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
        label: "Selos de pagamento (imagens)",
        fields: [
          img("guarantee", "Selo de garantia"),
          img("visa", "Visa"),
          img("mastercard", "Mastercard"),
          img("pix", "Pix"),
          img("boleto", "Boleto"),
          img("securePurchase", "Compra segura"),
        ],
      },
    ],
    // feature1Desc/bonusBadge existem no banco mas a LP não usa (bonusBadge
    // nunca foi lido; feature1Desc é resquício do fallback card1Desc).
    // promoUrl/promoCtaLabel: o botão "Clique aqui" saiu do bloco da promo em
    // 2026-07-26. As chaves continuam no banco, mas a LP não lê mais.
    hiddenKeys: ["feature1Desc", "bonusBadge", "promoUrl", "promoCtaLabel"],
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
    order: 12,
    groups: [
      {
        label: "Cabeçalho",
        fields: [
          t("sectionTitle", "Selo da seção", { maxLength: 40 }),
          t("title", "Título"),
          t("ctaButton", "Botão (CTA)", { maxLength: 40 }),
        ],
      },
      {
        label: "Perguntas",
        fields: [
          t("faq1Question", "Pergunta 1"),
          ml("faq1Answer", "Resposta 1"),
          t("faq2Question", "Pergunta 2"),
          ml("faq2Answer", "Resposta 2"),
          t("faq3Question", "Pergunta 3"),
          ml("faq3Answer", "Resposta 3"),
          t("faq4Question", "Pergunta 4"),
          ml("faq4Answer", "Resposta 4"),
          t("faq5Question", "Pergunta 5"),
          ml("faq5Answer", "Resposta 5"),
          t("faq6Question", "Pergunta 6"),
          ml("faq6Answer", "Resposta 6"),
          t("faq7Question", "Pergunta 7"),
          ml("faq7Answer", "Resposta 7"),
        ],
      },
    ],
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
    order: 13,
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
  return html.replace(/<[^>]+>/g, (tag) => {
    if (/^<br\s*\/?>$/i.test(tag)) return "<br>";
    if (/^<\/span>$/i.test(tag)) return tag;
    const spanMatch = tag.match(/^<span\s+class="([^"<>]*)"\s*>$/i);
    if (spanMatch) {
      const classes = spanMatch[1]
        .trim()
        .split(/\s+/)
        .filter((c) => (ALLOWED_CMS_CLASSES as readonly string[]).includes(c));
      if (classes.length > 0) return `<span class="${classes.join(" ")}">`;
    }
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

/** Desmonta a frase (HTML do editor) de volta nas chaves originais da landing. */
export function decomposeComposite(field: CompositeFieldDef, html: string): Record<string, string> {
  const strip = (s: string) =>
    s
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

  const m = html.match(/<span[^>]*>([\s\S]*?)<\/span>/i);
  const hlText = m ? strip(m[1]) : "";
  const before = m ? html.slice(0, m.index) : html;
  const after = m ? html.slice((m.index ?? 0) + m[0].length) : "";
  const beforeText = strip(before);
  const afterText = strip(after);

  const hlIdx = field.parts.findIndex((p) => p.role === "highlight");
  const out: Record<string, string> = {};
  field.parts.forEach((p, i) => {
    if (p.role === "highlight") out[p.key] = hlText;
    else out[p.key] = i < hlIdx ? beforeText : afterText;
  });
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
    // Editor espelha o banco: mostra só os campos cujo conteúdo existe no banco.
    // (O banco é populado com o conteúdo atual da LP — ver migration de fill.)
    for (const g of schema.groups) {
      const fields = g.fields.filter((f) => {
        if (isComposite(f)) {
          const partKeys = f.parts.map((p) => p.key);
          const exists = partKeys.some((k) => textKeys.includes(k));
          if (exists) partKeys.forEach((k) => known.add(k));
          return exists;
        }
        const exists = f.type === "image" ? imageKeys.includes(f.key) : textKeys.includes(f.key);
        if (exists) known.add(f.key);
        return exists;
      });
      if (fields.length) groups.push({ label: g.label, fields });
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
