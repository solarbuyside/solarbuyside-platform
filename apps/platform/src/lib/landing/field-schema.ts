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
          ml("subtitle", "Subtítulo"),
        ],
      },
      {
        label: "Bloco do manual",
        fields: [
          t("manualTitle", "Manual — título"),
          ml("manualSubtitle", "Manual — subtítulo"),
        ],
      },
      {
        label: "Bônus",
        fields: [
          t("bonusBadge", "Bônus — selo", { maxLength: 40 }),
          t("bonusTitle", "Bônus — título"),
          ml("bonusSubtitle", "Bônus — subtítulo"),
        ],
      },
      {
        label: "Botão e imagem",
        fields: [
          t("ctaButton", "Botão (CTA)", { maxLength: 40 }),
          t("ctaSubtext", "Texto abaixo do botão", { maxLength: 60 }),
          t("scrollHint", "Dica de rolagem", { maxLength: 40 }),
          img("heroImage", "Imagem do topo"),
        ],
      },
    ],
  },

  context: {
    label: "Contexto / Panorama",
    order: 1,
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
        label: "Faixa de alerta",
        fields: [
          t("alertTitle", "Alerta — título"),
          t("alertSubtitle", "Alerta — subtítulo"),
        ],
      },
      {
        label: "Solução + botão",
        fields: [
          t("solutionBadge", "Solução — selo", { maxLength: 40 }),
          t("solutionTitle", "Solução — título"),
          ml("solutionDesc", "Solução — descrição"),
          t("check1", "Selo 1", { maxLength: 30 }),
          t("check2", "Selo 2", { maxLength: 30 }),
          t("check3", "Selo 3", { maxLength: 30 }),
          t("ctaButton", "Botão (CTA)", { maxLength: 40 }),
          t("ctaSubtext", "Texto abaixo do botão", { maxLength: 60 }),
        ],
      },
    ],
  },

  video: {
    label: "Vídeo",
    order: 2,
    groups: [
      {
        label: "Título",
        fields: [
          rich("title", "Título da seção", {
            help: "Selecione uma palavra e clique em Laranja para destacar.",
          }),
        ],
      },
      {
        label: "Cards (3)",
        fields: [
          t("card1Title", "Card 1 — título"),
          ml("card1Desc", "Card 1 — descrição"),
          t("card1Tag", "Card 1 — etiqueta", { maxLength: 30 }),
          t("card2Title", "Card 2 — título"),
          ml("card2Desc", "Card 2 — descrição"),
          t("card2Tag", "Card 2 — etiqueta", { maxLength: 30 }),
          t("card3Title", "Card 3 — título"),
          ml("card3Desc", "Card 3 — descrição"),
          t("card3Tag", "Card 3 — etiqueta", { maxLength: 30 }),
        ],
      },
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
          t("ctaButton", "Botão (CTA)", { maxLength: 40 }),
        ],
      },
    ],
  },

  audience: {
    label: "Público (para quem é)",
    order: 3,
    groups: [
      {
        label: "Topo",
        fields: [
          t("title", "Título"),
          ml("subtitle", "Subtítulo"),
          t("bottomTitle", "Título de rodapé da seção"),
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
    ],
  },

  "manual-strategic": {
    label: "Manual estratégico",
    order: 4,
    groups: [
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

  testimonials: {
    label: "Depoimento (destaque)",
    order: 5,
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
    order: 6,
    groups: [
      {
        label: "Topo",
        fields: [
          t("title", "Título"),
          ml("subtitle", "Subtítulo"),
          img("manualImage", "Imagem do manual"),
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
    order: 7,
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
    order: 10,
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
    order: 8,
    groups: [
      {
        label: "Cabeçalho",
        fields: [
          t("badge", "Selo", { maxLength: 40 }),
          rich("title", "Título principal", {
            help: "Selecione palavras e use Laranja/Azul/Gradiente para destacar.",
          }),
          t("titleFirst", "Título (variante A)"),
          t("titleSecond", "Título (variante B)"),
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
        ],
      },
      {
        label: "Bônus",
        fields: [t("bonusBadge", "Bônus — selo", { maxLength: 40 })],
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
    hiddenKeys: ["feature1Desc"],
  },

  "buyer-wave": {
    label: "Onda do comprador",
    order: 9,
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
    order: 11,
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
          ml("subtitle", "Subtítulo"),
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
    order: 13,
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
          t("title", "Título"),
          ml("subtitle", "Subtítulo"),
        ],
      },
      {
        label: "Dados da empresa",
        fields: [
          t("companyName", "Nome da empresa"),
          t("cnpjLabel", "Rótulo do CNPJ", { maxLength: 20 }),
          t("cnpjValue", "CNPJ", { maxLength: 30 }),
          t("addressLine1", "Endereço — linha 1"),
          t("addressLine2", "Endereço — linha 2"),
          t("addressLine3", "Endereço — linha 3"),
          t("emailLabel", "Rótulo do e-mail", { maxLength: 20 }),
          t("emailAddress", "E-mail"),
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
): { label: string; order: number; groups: GroupDef[]; mapped: boolean } {
  const schema = LANDING_SCHEMA[sectionId];
  const known = new Set<string>();
  const groups: GroupDef[] = [];

  if (schema) {
    for (const g of schema.groups) {
      const fields = g.fields.filter((f) => {
        if (isComposite(f)) {
          // mostra se ao menos uma parte existe; marca todas as partes como conhecidas
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
    groups,
    mapped: Boolean(schema),
  };
}
