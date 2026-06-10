import type { SectionContent } from './ContentContext'

// Bump this version whenever ContentData defaults change.
// It invalidates stale localStorage caches so users see updated text.
export const CONTENT_VERSION = 21

// ContentData is the source of truth. Backend CMS only contributes keys
// missing from these defaults — never overrides. Edit here to change copy.
export const initialContent: SectionContent[] = [
    {
        "id": "manual-strategic",
        "name": "Manual Estratégico",
        "texts": {
            "badge": "A ferramenta estratégica",
            "title": "Manual Solar Buy-Side",
            "subtitle": "A ferramenta estratégica que todo vendedor do setor solar precisa ter.",
            "ctaButton": "Quero vender com estratégia",
            "focusHeader": "Principais focos e habilidades",
            "description1": "O Manual de Compra Solar Buy-Side é uma leitura essencial para profissionais do setor de vendas (Sell-Side) que desejam se destacar em um mercado ultracompetitivo.",
            "description2": "Ao proporcionar uma imersão na jornada de compra sob a ótica do comprador, este manual oferece uma compreensão estratégica dos critérios, motivações e desafios enfrentados pelo lado comprador (Buy-Side).",
            "description3": "Ao incorporar o conceito Buy-Side, vendedores lapidam sua abordagem comercial, entregam valor real, saem da briga por preço e elevam sua credibilidade no relacionamento com os clientes.",
            "section2Title": "",
            "sellCard1Desc": "Compreende o que realmente pesa na decisão, não apenas o que ele diz na reunião.",
            "sellCard2Desc": "Conduz a conversa como conselheiro técnico, não como tirador de pedido. O cliente percebe a diferença logo na primeira reunião.",
            "sellCard3Desc": "Demonstra, de forma fundamentada, como o valor técnico da solução se converte em benefício econômico.",
            "focusCard1Desc": "Estruture propostas objetivas e transparentes que facilitam a decisão do cliente.",
            "focusCard2Desc": "Constrói autoridade e conexões reais, que fecham negócio sem desconto.",
            "focusCard3Desc": "Argumente com precisão e preserve sua comissão sem perder vendas.",
            "sellCard1Title": "Dores reais do cliente",
            "sellCard2Title": "Postura consultiva",
            "sellCard3Title": "Valor técnico e econômico",
            "sellSideHeader": "O que o vendedor desenvolve",
            "focusCard1Title": "Apresentações persuasivas",
            "focusCard2Title": "Autoridade na mesa",
            "focusCard3Title": "Menos desconto, mais margem",
            "section2Subtitle": ""
        },
        "images": {
            "manual": "/assets/manual.jpg.png"
        }
    },
    {
        "id": "hero",
        "name": "Hero",
        "texts": {
            "badge": "Inteligência de Mercado 2026",
            "title1": "Transforme-se no",
            "title2": "Vendedor Ideal.",
            "subtitle": "O método Buy-Side ensina você a pensar como o cliente e conduzir decisões de compra, não disputas de preço.",
            "ctaButton": "Quero meu acesso agora",
            "subtitle1": "Aprenda como o seu cliente pensa e fuja da guerra de preços com o",
            "subtitle2": "Manual Solar Buy-Side.",
            "bonusBadge": "Bônus Exclusivo",
            "bonusTitle": "O Código do Vendedor Consultivo",
            "ctaSubtext": "Acesso imediato ao Manual Solar Buy-Side.",
            "scrollHint": "Veja o panorama 2026",
            "manualTitle": "Manual Solar Buy-Side",
            "titlePrefix": "Saia da Disputa de Preço e Passe a",
            "titleSuffix": "em Sistema Solar",
            "bonusSubtitle": "Para quem quer conduzir decisões, não concessões.",
            "manualSubtitle": "Construído a partir da observação real de como compradores decidem, na prática.",
            "titleHighlight": "Vender Decisões"
        },
        "images": {
            "heroImage": "/assets/img-hero-solar.png"
        }
    },
    {
        "id": "context",
        "name": "Contexto",
        "texts": {
            "badge": "O que muda em 2026",
            "title": "Panorama",
            "check1": "Visão do Cliente",
            "check2": "Gatilhos de Compra",
            "check3": "Confiabilidade",
            "subtitle": "Pode parecer exagero, mas em breve cada vez mais compradores de sistema fotovoltaico estarão informados.",
            "card1Desc": "Compararão propostas com precisão técnica superior à média do mercado.",
            "card2Desc": "Fornecedores e tecnologias passarão por um crivo muito mais rigoroso.",
            "card3Desc": "A confiabilidade da sua empresa será o fator decisivo antes de qualquer preço.",
            "ctaButton": "Garantir meu acesso agora",
            "alertTitle": "Quem não entender essa nova jornada vai perder vendas.",
            "card1Title": "Saberão analisar",
            "card2Title": "Analisarão fundo",
            "card3Title": "Avaliarão risco",
            "ctaSubtext": "Download Imediato • PDF Interativo",
            "solutionDesc": "O Manual de Compra Solar Buy-Side mapeia os novos gatilhos de decisão do cliente moderno, garantindo que você esteja do lado certo da venda.",
            "alertSubtitle": "O cenário está evoluindo. Você está pronto?",
            "solutionBadge": "A Solução Definitiva",
            "solutionTitle": "Ainda há tempo para reverter essa situação.",
            "titleHighlight": "2026"
        },
        "images": {}
    },
    {
        "id": "video",
        "name": "Vídeo",
        "texts": {},
        "images": {}
    },
    {
        "id": "audience",
        "name": "Audiencia",
        "texts": {},
        "images": {}
    },
    {
        "id": "testimonials",
        "name": "Depoimentos",
        "texts": {},
        "images": {
            "testimonialImage": "/assets/cms/cms-01-7bfdc9eed5.png"
        }
    },
    {
        "id": "story-bridge",
        "name": "Story Bridge",
        "texts": {},
        "images": {}
    },
    {
        "id": "seller-code",
        "name": "Código do Vendedor",
        "texts": {
            "badge": "Oferta Especial",
            "title": "O Segredo por trás dos resultados:",
            "subtitle": "O sucesso do Rodrigo não foi por acaso. Além de aplicar o Manual Solar Buy-Side, ele incorporou a estratégia que inverte o jogo: pensar como um comprador para conduzir a venda.",
            "item1Desc": "Aprenda a medir e provar a segurança da sua proposta de forma estruturada e profissional.",
            "item2Desc": "Refine seus materiais de vendas com base no que compradores realmente avaliam (e o que eles descartam).",
            "item3Desc": "Saiba exatamente como agir com clientes focados apenas em preço e recupere sua margem de lucro.",
            "item4Desc": "Prepare-se para fechar contratos com clientes técnicos e criteriosos que costumam ignorar vendedores comuns.",
            "listTitle": "O que você leva do Código:",
            "bonusBadge": "Oferta Especial",
            "bonusTitle": "BÔNUS EXCLUSIVO",
            "ebookTitle": "E-book: O Código do Vendedor Consultivo",
            "item1Title": "Índice de Confiabilidade",
            "item2Title": "Ajuste de Precisão com Checklist",
            "item3Title": "Estratégia Anti-Leilão",
            "item4Title": "Postura Consultiva de Elite",
            "listHeader": "O que você leva do Código:",
            "bonusSubtitle": "O método de imersão no Manual Solar Buy-Side para quem não aceita mais perder vendas por preço.",
            "ebookSubtitle": "O método de imersão no Manual Solar Buy-Side para quem não aceita mais perder vendas por preço.",
            "badgeHighlight": "",
            "titleHighlight": "O Código do Vendedor Consultivo"
        },
        "images": {
            "book": "/assets/mockup-codigo-vendedor.png",
            "bookImage": "/assets/mockup-codigo-vendedor.png"
        }
    },
    {
        "id": "pricing",
        "name": "Oferta",
        "texts": {
            "badge": "Condição de pré-venda • antes do lançamento oficial",
            "title": "",
            "benefit1": "Liberação imediata no seu e-mail",
            "benefit2": "Pagamento criptografado",
            "benefit3": "Garantia incondicional de 7 dias",
            "card1Tag": "MANUAL PRINCIPAL",
            "card2Tag": "DIFERENCIAL ESTRATÉGICO",
            "card3Tag": "BÔNUS ESPECIAL",
            "subtitle": "",
            "card1Desc": "Acesso vitalício: 130 páginas e 160 tópicos com o Método em 4 Fases, do primeiro contato à assinatura do contrato.",
            "card2Desc": "26 páginas sobre postura consultiva, estratégia anti-leilão e fechamento técnico. Para vender decisão, não desconto.",
            "card3Desc": "Licença de Uso Coletiva: até 10 cópias para o mesmo CNPJ. O time comercial inteiro alinhado pagando uma vez só.",
            "ctaButton": "Garantir meu acesso agora",
            "planBadge": "Plano de Acesso",
            "planTitle": "Oferta Especial",
            "priceFrom": "De R$ 997,00 por apenas:",
            "bonusBadge": "DIFERENCIAL ESTRATÉGICO",
            "bonusTitle": "Código do Vendedor Consultivo",
            "card1Title": "Manual Solar Buy-Side",
            "card2Title": "Código do Vendedor Consultivo (26 páginas)",
            "card3Title": "Turbina sua Equipe de Venda",
            "priceCents": ",23",
            "priceValue": "92",
            "timerLabel": "Sua oferta expira em:",
            "titleFirst": "O comprador já está estudando.<br/><span class=\"cms-gradient-blue\">Chegue preparado primeiro.</span>",
            "feature1Tag": "VITALÍCIO",
            "feature2Tag": "TÉCNICO",
            "feature3Tag": "ESTRATÉGIA",
            "feature4Tag": "EXCLUSIVO",
            "titleSecond": "Você viu o método inteiro.<br/><span class=\"cms-gradient-blue\">Agora é decisão.</span>",
            "feature1Desc": "Acesso imediato ao manual completo.",
            "feature2Desc": "Conteúdo denso e interativo. Sem enrolação.",
            "feature3Desc": "A jornada de compra completa decifrada.",
            "feature4Desc": "Documentação exclusiva para pronta aplicação.",
            "priceUpfront": "Ou R$ 897,00 à vista no PIX",
            "sectionTitle": "VEJA TUDO QUE VOCÊ RECEBE:",
            "bonusSubtitle": "Você vendendo decisão, não preço\n\n",
            "feature1Title": "Manual Solar Buy-Side",
            "feature2Title": "130 Páginas + 160 Tópicos",
            "feature3Title": "Método em 4 Fases",
            "feature4Title": "Anexos Técnicos",
            "featuresTitle": "VEJA TUDO QUE VOCÊ RECEBE:",
            "priceOriginal": "De R$ 997,00 por apenas:",
            "subtitleFirst": "Manual + Código do Vendedor + Plataforma de Avaliação: o mesmo material que orienta compradores, agora do seu lado da mesa.",
            "finalCtaButton": "Começar agora com garantia de 7 dias",
            "subtitleSecond": "Preço de pré-venda, acesso imediato e 7 dias de garantia incondicional para você avaliar por dentro.",
            "titleHighlight": "",
            "priceInstallments": "12x de"
        },
        "images": {
            "pix": "/assets/Pix.png",
            "visa": "/assets/Visa.png",
            "boleto": "/assets/Boleto.png",
            "guarantee": "/assets/Garantia.png",
            "card1Image": "/assets/livro-de-frente.png",
            "card2Image": "/assets/segunda-img-sem-fundo.png",
            "card3Image": "/assets/img-coletiva-frente.png",
            "mastercard": "/assets/Mastercard.png",
            "securePurchase": "/assets/Compra segura.png"
        }
    },
    {
        "id": "buyer-wave",
        "name": "Buyer Wave",
        "texts": {
            "ctaButton": "Quero esse conhecimento do meu lado",
            "testimonial1Name": "Ricardo",
            "testimonial1Role": "Empresário",
            "testimonial2Name": "Guilherme",
            "testimonial2Role": "Particular",
            "testimonial3Name": "Jorge Luiz",
            "testimonial3Role": "Empresário",
            "testimonial4Name": "Rogério",
            "testimonial4Role": "Particular",
            "testimonial5Name": "Lucineide",
            "testimonial5Role": "Particular",
            "testimonial6Name": "Edivaldo",
            "testimonial6Role": "Produtor Rural",
            "testimonial1Quote": "No mundo dos negócios, errar na escolha de um fornecedor pode gerar um prejuízo enorme. O manual foi indispensável para evitar armadilhas, ensinando-me a identificar empresas despreparadas e equipamentos duvidosos. Aprendi a buscar parceiros que garantem suporte técnico e manutenção contínua. Graças ao Solar Buy-Side, fechei negócio com a melhor empresa: meu investimento de R$ 195 mil foi muito bem aplicado.",
            "testimonial2Quote": "Resido na região de São Paulo, em uma residência de grande porte, com elevado consumo elétrico e exposta a apagões frequentes, que podem durar horas ou dias. Para reduzir a fatura e garantir conforto energético, optei pela instalação de um sistema solar híbrido com baterias. Para embasar um investimento de alta complexidade técnica e valor, utilizei com sucesso o Manual de Compra Solar Buy-Side, que orientou todo o processo de avaliação e decisão.",
            "testimonial3Quote": "Viver no Rio é aquilo: você tem que estar sempre ligado pra não cair em furada. Quando precisei cortar os custos fixos da minha metalúrgica, confesso que travei, porque de energia solar eu não entendia nada. O manual foi o divisor de águas; me deu o mapa da mina pra estudar as propostas e descartar de cara quem estava só no gogó. Investi R$ 188 mil com total segurança e o alívio já chegou no bolso.",
            "testimonial4Quote": "Eu nunca tinha tido contato com energia solar e temia tomar a decisão errada, mas o conteúdo claro e estruturado mudou tudo. As 4 fases da jornada de compra foram essenciais e o índice interativo, com mais de 160 tópicos, sanou todas as minhas dúvidas instantaneamente. No fim, escolhi a empresa certa e o sistema ideal pelo preço justo, conduzindo a negociação com total autoridade e segurança.",
            "testimonial5Quote": "Morando sozinha, a variedade de empresas e tecnologias me deixava insegura. O manual foi o guia fundamental: seguindo cada etapa, aprendi a avaliar propostas e descartar o que era bom demais para ser verdade. Com total convicção, instalei meu sistema de R$ 28 mil. O passo a passo foi arretado! No final, fui até elogiada pelos vendedores; eles nunca tinham encontrado uma mulher com tanto conhecimento técnico.",
            "testimonial6Quote": "Sou produtor rural em Sinop/MT e decidi instalar energia solar devido ao alto consumo na irrigação e maquinários. Com a expansão da lavoura, a conta de luz pesava muito. O Manual Solar Buy-Side foi essencial nesse processo: me ensinou a comparar propostas tecnicamente e evitar erros caros que eu nem conhecia. O conteúdo me deu a segurança necessária para realizar um investimento de R$ 248 mil.",
            "testimonial1Location": "São Paulo, SP",
            "testimonial2Location": "Santana de Parnaíba, SP",
            "testimonial3Location": "Rio de Janeiro, RJ",
            "testimonial4Location": "Campinas, SP",
            "testimonial5Location": "Recife, PE",
            "testimonial6Location": "Sinop, MT",
            "testimonial1Highlight": "Mais que um guia, o Manual é o seguro que todo empresário precisa para investir com risco controlado.",
            "testimonial2Highlight": "Para quem busca segurança e ganho de tempo, recomendo com total confiança.",
            "testimonial3Highlight": "O Manual valeu demais! Recomendo mesmo!",
            "testimonial4Highlight": "Sem exagero: o Manual Solar Buy-Side valeu cada página.",
            "testimonial5Highlight": "O Solar Buy-Side me deu a segurança para decidir sem arrependimentos.",
            "testimonial6Highlight": "Realmente é uma ferramenta indispensável para quem busca eficiência no campo e proteção do capital.",
            "testimonial1ReviewTitle": "Errar na escolha de um fornecedor pode gerar prejuízo enorme.",
            "testimonial2ReviewTitle": "Decisão segura em investimento complexo.",
            "testimonial3ReviewTitle": "O manual foi o divisor de águas.",
            "testimonial4ReviewTitle": "O manual valeu cada página.",
            "testimonial5ReviewTitle": "Esse Manual foi realmente um passo a passo arretado!",
            "testimonial6ReviewTitle": "O Manual me deu segurança para investir R$ 248 mil.",
            "testimonial1ObjectPosition": "50% 50%",
            "testimonial2ObjectPosition": "50% 50%",
            "testimonial3ObjectPosition": "50% 100%",
            "testimonial4ObjectPosition": "50% 100%",
            "testimonial5ObjectPosition": "50% 100%",
            "testimonial6ObjectPosition": "50% 100%"
        },
        "images": {
            "testimonial1Avatar": "/assets/cms/cms-02-4bd1ab7655.png",
            "testimonial2Avatar": "/assets/empresariomanualk.png",
            "testimonial3Avatar": "/assets/jorge of_cleanup.png",
            "testimonial4Avatar": "/assets/Rogerio_cleanup.png",
            "testimonial5Avatar": "/assets/cms/cms-03-03aada3113.png",
            "testimonial6Avatar": "/assets/Edivaldo.png"
        }
    },
    {
        "id": "authority",
        "name": "Autoridade",
        "texts": {},
        "images": {}
    },
    {
        "id": "lead-magnet",
        "name": "Lead Magnet",
        "texts": {
            "badge": "Conteúdo Exclusivo",
            "title": "Ainda com",
            "feature1": "Veja o processo de compra pelos olhos do cliente",
            "feature2": "Aprenda a conduzir o comprador até a decisão certa",
            "feature3": "Blindagem contra o leilão reverso de preços",
            "feature4": "Método exclusivo Buy-Side para o mercado solar brasileiro",
            "subtitle": "Garanta agora seu teaser grátuito do Código do Vendedor Consultivo e comece a vender decisão, não preço! ",
            "ctaButton": "Baixar Teaser Gratuito",
            "ctaSubtext": "PDF Interativo • 5 páginas • Acesso imediato",
            "modalTitle": "Baixe seu E-book",
            "successTitle": "Cadastro recebido!",
            "modalSubtitle": "Preencha seus dados para receber o E-book Manual Solar Buy-Side",
            "successMessage": "Esta funcionalidade está em produção. Assim que estiver disponível, você receberá o teaser do Código do Vendedor Consultivo no e-mail cadastrado.",
            "titleHighlight": "dúvidas?"
        },
        "images": {
            "ebook": "/assets/cms/cms-04-a9dde877b6.jpg"
        }
    },
    {
        "id": "newsletter",
        "name": "Newsletter",
        "texts": {},
        "images": {}
    },
    {
        "id": "faq",
        "name": "FAQ",
        "texts": {},
        "images": {}
    },
    {
        "id": "contact",
        "name": "Contato",
        "texts": {},
        "images": {}
    },
    {
        "id": "privacy-policy",
        "name": "Política de Privacidade",
        "texts": {},
        "images": {}
    },
    {
        "id": "terms-of-use",
        "name": "Termos de Uso",
        "texts": {},
        "images": {}
    },
    {
        "id": "antipiracy",
        "name": "Medidas Antipirataria",
        "texts": {},
        "images": {}
    }
]
