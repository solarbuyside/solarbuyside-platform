/**
 * Curso "Fundamentos da Energia Solar" — conteúdo real, em PT-BR, escrito para
 * o comprador que vai usar a plataforma. Cada lição tem blocos de conteúdo
 * (parágrafos, listas, destaques) renderizados pelo leitor de aula.
 * É a fonte de verdade do curso; o progresso vive em `course_progress`.
 */

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "tip"; text: string }
  | { type: "example"; title: string; text: string }
  | { type: "term"; term: string; text: string };

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  illustration: string;
  blocks: ContentBlock[];
};

export type CourseModule = {
  id: string;
  title: string;
  description: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  lessons: Lesson[];
};

export const COURSE: CourseModule[] = [
  {
    id: "fundamentos",
    title: "Fundamentos da energia solar",
    description: "Como funciona um sistema fotovoltaico, seus componentes e o básico de geração.",
    level: "Iniciante",
    lessons: [
      {
        id: "fundamentos-1",
        title: "O que é energia solar fotovoltaica",
        minutes: 9,
        illustration: "sun",
        blocks: [
          {
            type: "p",
            text: "Energia solar fotovoltaica é a conversão direta da luz do sol em eletricidade. Repare na palavra 'foto' (luz) + 'voltaica' (tensão elétrica): é luz virando energia elétrica. É importante não confundir com o aquecimento solar — aquele sistema de placas que esquenta a água do chuveiro. São coisas diferentes: o fotovoltaico gera eletricidade que alimenta tudo na sua casa (geladeira, ar-condicionado, chuveiro, tomadas) e abate a conta de luz.",
          },
          {
            type: "h",
            text: "Como a geração acontece, passo a passo",
          },
          {
            type: "p",
            text: "Os módulos (as placas no telhado) captam a radiação solar e produzem corrente contínua (CC) — o mesmo tipo de energia de uma pilha. Mas sua casa e a rede elétrica funcionam com corrente alternada (CA). É aí que entra o inversor: ele converte CC em CA. Sem o inversor, a energia das placas não serviria para nada na tomada.",
          },
          {
            type: "list",
            items: [
              "O sol incide sobre os módulos → eles geram corrente contínua (CC)",
              "O inversor converte CC em corrente alternada (CA)",
              "A energia abastece primeiro o consumo da sua casa naquele momento",
              "O que sobra é injetado na rede da concessionária e vira crédito",
            ],
          },
          {
            type: "term",
            term: "Sistema on-grid (conectado à rede)",
            text: "É o tipo mais comum no Brasil (mais de 99% dos casos). Seu sistema fica ligado à rede da concessionária: de dia você gera e usa, e o excedente vira crédito; à noite, você 'puxa' esse crédito de volta. Não precisa de baterias. Já o off-grid (isolado, com baterias) é usado em locais sem rede elétrica e custa bem mais caro.",
          },
          {
            type: "example",
            title: "Situação real: a casa do João",
            text: "João instalou painéis. Às 13h, com sol forte, o sistema gera 4 kWh, mas ele só está consumindo 1 kWh (geladeira e alguns aparelhos). Os 3 kWh que sobram vão para a rede e viram crédito. À noite, quando ele liga o chuveiro e o ar-condicionado e o sistema não gera nada, ele usa esses créditos acumulados. No fim do mês, a conta é calculada pela diferença.",
          },
          {
            type: "tip",
            text: "Mesmo zerando o consumo, você nunca deixa de pagar 100% da conta: sempre permanece uma taxa mínima de disponibilidade (custo de estar conectado) e a iluminação pública. Desconfie de quem promete 'conta zero'.",
          },
        ],
      },
      {
        id: "fundamentos-2",
        title: "Módulos, inversores e estruturas",
        minutes: 14,
        illustration: "panel",
        blocks: [
          { type: "h", text: "Os três componentes principais" },
          {
            type: "p",
            text: "Um sistema solar não é só 'as placas'. Entender o papel de cada parte ajuda você a avaliar propostas com segurança e a perceber quando um orçamento está cortando custos em algo que vai te custar caro depois.",
          },
          {
            type: "list",
            items: [
              "Módulos fotovoltaicos (as placas): captam a luz. Marca, potência em watts (W), eficiência e garantias variam muito entre fabricantes.",
              "Inversor: o cérebro do sistema. Converte a energia, sincroniza com a rede e monitora a geração. É o componente que mais dá defeito ao longo dos anos.",
              "Estrutura de fixação: prende os módulos ao telhado. Precisa ser adequada ao tipo de telha (cerâmica, metálica, laje) e resistente à corrosão (alumínio/inox).",
            ],
          },
          { type: "h", text: "String vs microinversor: a escolha que confunde" },
          {
            type: "p",
            text: "Existem duas formas principais de converter a energia, e é comum o vendedor citar isso sem explicar. Saber a diferença evita pagar caro à toa — ou economizar onde não devia.",
          },
          {
            type: "term",
            term: "Inversor string",
            text: "Um único inversor central recebe a energia de várias placas ligadas 'em série' (a string). É mais barato e ideal para telhados sem sombra e com todas as placas na mesma direção. Desvantagem: se uma placa é sombreada, ela puxa o desempenho do conjunto todo para baixo.",
          },
          {
            type: "term",
            term: "Microinversor",
            text: "Um pequeno inversor para cada placa (ou cada duas). Cada módulo trabalha de forma independente — sombra em uma não afeta as outras. Melhor para telhados com sombreamento (árvores, caixa d'água) ou faces voltadas para direções diferentes. Custa mais caro, mas em sistemas pequenos e complicados compensa.",
          },
          {
            type: "term",
            term: "MPPT",
            text: "Sigla para 'rastreador do ponto de máxima potência'. É a tecnologia que faz o inversor extrair o máximo de energia possível conforme a luz muda durante o dia. Quanto mais entradas MPPT, melhor o inversor lida com placas em condições diferentes.",
          },
          {
            type: "example",
            title: "Situação real: telhado com sombra",
            text: "Maria tem uma árvore que faz sombra em parte do telhado no fim da tarde. O primeiro orçamento ofereceu inversor string (mais barato). Mas, com a sombra, aquelas placas derrubariam a geração de toda a string. O segundo orçamento, com microinversores, isolou o problema: só as placas sombreadas perdem desempenho, as outras seguem gerando. Aqui, pagar mais caro fez sentido.",
          },
          {
            type: "term",
            term: "Selo INMETRO",
            text: "No Brasil, módulos e inversores precisam ser certificados pelo INMETRO. Sem essa certificação, a concessionária NÃO autoriza a conexão do sistema à rede. Equipamento sem selo INMETRO é um problema grave — pode te impedir de ligar o sistema legalmente.",
          },
          {
            type: "tip",
            text: "O inversor é onde propostas ruins mais 'economizam'. Um inversor barato e de marca desconhecida é a causa mais comum de dor de cabeça anos depois. Sempre pergunte a marca e o modelo do inversor — e confira se tem selo INMETRO.",
          },
        ],
      },
      {
        id: "fundamentos-3",
        title: "Geração, consumo e compensação",
        minutes: 11,
        illustration: "generation",
        blocks: [
          {
            type: "p",
            text: "O objetivo de dimensionar bem um sistema é cobrir o seu consumo — nem mais, nem menos. Por isso uma proposta séria SEMPRE parte do seu histórico de consumo (em kWh/mês), que está impresso na sua conta de luz. Se o vendedor não pediu suas contas dos últimos 12 meses, é um mau sinal.",
          },
          { type: "h", text: "O que olhar na geração" },
          {
            type: "list",
            items: [
              "Geração mensal estimada: idealmente cobre ~100% do seu consumo médio mensal.",
              "Geração anual: confirma a cobertura ao longo do ano — no verão gera mais, no inverno menos. O que importa é fechar a conta no acumulado.",
              "Consumo de referência: a proposta deve mostrar de qual consumo ela partiu. Confira se bate com sua realidade.",
            ],
          },
          { type: "h", text: "Fator de simultaneidade: o conceito que mudou tudo" },
          {
            type: "p",
            text: "Simultaneidade é o quanto você consome a energia NO MESMO MOMENTO em que ela é gerada. Isso ficou importante por causa de uma mudança recente na lei (você verá em detalhe no módulo financeiro): a energia que você usa na hora que gera é 'de graça'; a energia que sobra e vai para a rede para virar crédito passou a ter uma pequena taxa.",
          },
          {
            type: "example",
            title: "Situação real: simultaneidade alta x baixa",
            text: "Uma padaria que funciona o dia inteiro consome a maior parte da energia justamente quando o sol está gerando — simultaneidade alta, aproveitamento ótimo. Já uma família que passa o dia fora e só usa energia à noite gera de dia e injeta quase tudo na rede — simultaneidade baixa. Os dois economizam, mas a padaria tem retorno mais rápido.",
          },
          {
            type: "tip",
            text: "Cuidado com dois extremos: propostas que prometem geração muito ACIMA da sua necessidade (inflam o preço sem benefício) e propostas subdimensionadas que não cobrem o consumo. E lembre-se: as placas precisam de limpeza cerca de 3 vezes ao ano para manter a geração.",
          },
        ],
      },
    ],
  },
  {
    id: "empresa",
    title: "Avaliando a empresa instaladora",
    description: "O que separa uma empresa confiável: CREA, experiência, garantias e suporte.",
    level: "Iniciante",
    lessons: [
      {
        id: "empresa-1",
        title: "Registro CREA e responsável técnico",
        minutes: 8,
        illustration: "shield",
        blocks: [
          {
            type: "p",
            text: "Comprar energia solar não é comprar um produto de prateleira — é contratar uma obra elétrica no seu telhado, conectada à rede pública. Por isso, a lei exige que haja um engenheiro eletricista responsável, com registro no CREA (Conselho Regional de Engenharia e Agronomia), assumindo a responsabilidade técnica.",
          },
          { type: "h", text: "Por que isso protege você" },
          {
            type: "list",
            items: [
              "Garante que o projeto segue as normas técnicas e de segurança (NBR).",
              "Há um responsável legal pela obra — se algo der errado, existe a quem responsabilizar.",
              "É exigido para a homologação do sistema junto à concessionária (ART — Anotação de Responsabilidade Técnica).",
            ],
          },
          {
            type: "term",
            term: "ART (Anotação de Responsabilidade Técnica)",
            text: "É o documento emitido pelo engenheiro junto ao CREA que formaliza quem responde tecnicamente pela instalação. Uma empresa séria emite a ART do seu projeto. Pergunte sobre ela.",
          },
          {
            type: "example",
            title: "Sinal de alerta real",
            text: "Muitas empresas 'aventureiras' atuam sem engenheiro registrado, terceirizando instaladores sem qualificação. O sistema até pode funcionar no começo, mas você fica sem amparo técnico e legal. Reclamações comuns no Reclame Aqui envolvem exatamente isso: instalação malfeita e ninguém para responder depois.",
          },
          {
            type: "tip",
            text: "Peça o número do CREA e o nome do engenheiro responsável. Você pode até consultar o registro no site do CREA do seu estado. A ausência ou recusa em informar isso é um sinal de alerta sério.",
          },
        ],
      },
      {
        id: "empresa-2",
        title: "Tempo de mercado e histórico",
        minutes: 10,
        illustration: "company",
        blocks: [
          {
            type: "p",
            text: "Aqui está uma verdade que pega muita gente: a garantia mais importante do seu sistema dura 25 anos — mas só vale se a empresa que instalou ainda existir para honrá-la. O mercado solar cresceu rápido e surgiram muitas empresas 'aventureiras', que vendem barato e desaparecem. Avaliar a solidez da empresa é tão importante quanto avaliar o equipamento.",
          },
          { type: "h", text: "O que investigar" },
          {
            type: "list",
            items: [
              "Há quantos anos atua no ramo solar especificamente (não 'no mercado' genérico).",
              "Quantos sistemas já instalou — histórico de execução real.",
              "Se a instalação é feita por equipe própria ou terceirizada (própria dá mais controle de qualidade).",
              "CNPJ ativo, endereço físico verificável e tempo de existência da empresa.",
            ],
          },
          {
            type: "example",
            title: "Faça o que poucos fazem: peça referências",
            text: "Peça à empresa o contato de 2 ou 3 clientes que ela já atendeu na sua região. Ligue e pergunte: o prazo foi cumprido? A instalação ficou boa? Quando deu problema, atenderam rápido? Isso revela o que nenhuma proposta no papel mostra — e empresas sérias têm orgulho de dar referências.",
          },
          {
            type: "tip",
            text: "Pesquise o nome da empresa no Reclame Aqui. Não se assuste com reclamações isoladas (toda empresa tem) — olhe se ela RESPONDE e RESOLVE, e qual a nota dos últimos 12 meses. O padrão das reclamações diz muito (atraso recorrente? abandono pós-venda?).",
          },
        ],
      },
      {
        id: "empresa-3",
        title: "Garantias e assistência técnica",
        minutes: 12,
        illustration: "warranty",
        blocks: [
          {
            type: "p",
            text: "Quando o vendedor diz 'tem 25 anos de garantia', cuidado: existem VÁRIAS garantias diferentes, com prazos diferentes, e é comum misturá-las para a proposta parecer melhor. Saber distinguir cada uma evita a surpresa de descobrir, anos depois, que o que você achava coberto não era.",
          },
          { type: "h", text: "As garantias que você precisa separar" },
          {
            type: "list",
            items: [
              "Garantia de defeito do MÓDULO (de fábrica): cobre defeito físico da placa. Costuma ser 12 a 15 anos.",
              "Garantia de PERFORMANCE do módulo: garante que a placa ainda produza um mínimo (ex: ~85%) depois de 25-30 anos. É a tal 'garantia de 25 anos' — mas é de geração, não contra defeito.",
              "Garantia do INVERSOR: normalmente 5 a 10 anos (às vezes estendível). Como o inversor é o que mais falha, esse prazo importa muito.",
              "Garantia de PROJETO e EXECUÇÃO (da empresa): cobre falhas da instalação em si — fiação, fixação, infiltração. Idealmente 5 anos ou mais.",
              "Prazo de ASSISTÊNCIA técnica: em quantos dias a empresa se compromete a atender um chamado.",
            ],
          },
          {
            type: "term",
            term: "Degradação do módulo",
            text: "Toda placa perde um pouquinho de capacidade por ano (degradação). Painéis bons degradam algo como 0,4% a 0,5% ao ano. É por isso que a garantia de performance fala em 'manter X% após 25 anos' — ela está controlando essa perda natural.",
          },
          {
            type: "example",
            title: "Situação real: o custo da assistência lenta",
            text: "O inversor de um cliente parou em pleno verão. A empresa demorou 6 semanas para enviar um técnico. Nesse período, o sistema não gerou nada e ele pagou a conta de luz cheia. Uma assistência que promete atender em 3 dias x outra que leva semanas faz uma diferença real no seu bolso.",
          },
          {
            type: "tip",
            text: "Exija que TODAS as garantias estejam escritas no contrato, com prazos claros. Garantia que só existe na conversa do vendedor não vale nada. E confirme: a garantia da instalação é com a empresa local (que você aciona facilmente) ou só com o fabricante lá fora?",
          },
        ],
      },
    ],
  },
  {
    id: "tecnica",
    title: "Lendo a proposta técnica",
    description: "Potência, módulos, inversor, sobrecarga e eficiência sem cair em pegadinhas.",
    level: "Intermediário",
    lessons: [
      {
        id: "tecnica-1",
        title: "Potência, módulos e tiers de fabricante",
        minutes: 15,
        illustration: "module",
        blocks: [
          {
            type: "term",
            term: "kWp (quilowatt-pico)",
            text: "É a potência total do seu sistema em condições ideais de sol. Pense nele como o 'tamanho' do sistema. Um sistema de 4 kWp é maior (gera mais) que um de 2 kWp. A proposta dimensiona o kWp para cobrir o seu consumo.",
          },
          { type: "h", text: "Avaliando os módulos" },
          {
            type: "list",
            items: [
              "Potência do módulo (W): placas modernas têm 550W ou mais. Quanto maior a potência por placa, menos placas no telhado para o mesmo resultado.",
              "Eficiência (%): quanto da luz que bate na placa vira energia. Acima de ~21% é excelente. Mais eficiência = menos espaço no telhado.",
              "Marca e modelo: prefira modelos atuais de linha. Modelos descontinuados podem dar problema de reposição lá na frente.",
            ],
          },
          { type: "h", text: "O mito do 'Tier 1'" },
          {
            type: "p",
            text: "Você VAI ouvir o vendedor dizer 'é painel Tier 1, é o melhor'. Aqui mora um equívoco que pega quase todo leigo — e até muitos vendedores.",
          },
          {
            type: "term",
            term: "O que Tier 1 realmente significa",
            text: "A lista Tier 1 é publicada pelo banco Bloomberg (BNEF) e mede a SAÚDE FINANCEIRA e a 'bancabilidade' do fabricante — ou seja, se ele é uma empresa sólida que provavelmente existirá para honrar a garantia. O próprio Bloomberg AVISA: Tier 1 NÃO é medida de qualidade técnica do painel. Um Tier 1 não é necessariamente mais eficiente que um Tier 2.",
          },
          {
            type: "example",
            title: "Como usar isso a seu favor",
            text: "Tier 1 é um bom sinal de que o fabricante não vai sumir (importante para a garantia de 25 anos). Mas não pare aí: pergunte também sobre a eficiência real, a taxa de degradação anual e se o módulo tem certificação IEC 61215 (testes de durabilidade) e selo INMETRO. Solidez do fabricante + qualidade técnica do produto são coisas diferentes — você quer as duas.",
          },
          {
            type: "tip",
            text: "Não deixe o 'Tier 1' encerrar a conversa. Use-o como um item entre vários, junto de eficiência, garantias e degradação — que é exatamente o que a pontuação da plataforma te ajuda a comparar.",
          },
        ],
      },
      {
        id: "tecnica-2",
        title: "Sobrecarga do inversor: a faixa ideal",
        minutes: 11,
        illustration: "inverter",
        blocks: [
          {
            type: "p",
            text: "Parece contraintuitivo, mas é correto e proposital: instala-se mais potência de PLACAS (kWp) do que a potência do INVERSOR (kW). Isso se chama sobrecarga (ou oversizing). Por quê? Porque as placas quase nunca geram 100% da sua capacidade — só em condições perfeitas de sol. Dimensionar o inversor para o pico máximo seria desperdiçar dinheiro num inversor que quase nunca seria 100% usado.",
          },
          {
            type: "term",
            term: "Relação de sobrecarga (kWp / kW)",
            text: "É a potência das placas dividida pela potência do inversor. A faixa ideal costuma ficar entre 1,25 e 1,35 — ou seja, 25% a 35% mais placas que inversor. Exemplo: 5,4 kWp de placas com um inversor de 4 kW dá uma sobrecarga de 1,35.",
          },
          {
            type: "example",
            title: "Por que os extremos são ruins",
            text: "Sobrecarga muito BAIXA (ex: 1,05): você comprou um inversor caro demais para poucas placas — desperdício de dinheiro. Sobrecarga muito ALTA (ex: 1,6): em dias de pico, as placas geram mais do que o inversor consegue converter, e ele 'corta' (clipping) o excedente — você perde geração. A faixa de 1,25-1,35 equilibra os dois.",
          },
          {
            type: "tip",
            text: "Pergunte diretamente: 'qual a relação de sobrecarga (kWp/kW) desta proposta?'. Se estiver fora de 1,15-1,45, peça uma justificativa. Essa é uma pergunta que mostra ao vendedor que você entende do assunto.",
          },
        ],
      },
    ],
  },
  {
    id: "financeiro",
    title: "Viabilidade financeira",
    description: "Payback, ROI, inflação de energia e por que o menor preço engana.",
    level: "Intermediário",
    lessons: [
      {
        id: "financeiro-1",
        title: "Payback, retorno e a Lei 14.300 (Fio B)",
        minutes: 15,
        illustration: "payback",
        blocks: [
          {
            type: "term",
            term: "Payback",
            text: "É o tempo até o sistema 'se pagar' — ou seja, até a economia acumulada na conta de luz igualar o valor que você investiu. No Brasil costuma ficar entre 4 e 6 anos. Depois disso, a energia é praticamente 'de graça' pelo resto da vida do sistema (25+ anos).",
          },
          {
            type: "list",
            items: [
              "Economia mensal e anual no primeiro ano — quanto cai na conta.",
              "Economia acumulada em 25 anos — o ganho total ao longo da vida do sistema.",
              "Rentabilidade (% ao ano) e ROI — o investimento se multiplica quantas vezes.",
            ],
          },
          { type: "h", text: "A mudança que TODO comprador precisa conhecer: Lei 14.300" },
          {
            type: "p",
            text: "Até 2022, a energia que sobrava e ia para a rede virava crédito '1 para 1' (1 kWh injetado = 1 kWh de crédito). A Lei 14.300 mudou isso, criando uma cobrança gradual chamada 'Fio B'. Quem te vender energia solar sem explicar isso está escondendo informação importante.",
          },
          {
            type: "term",
            term: "Fio B",
            text: "É uma taxa sobre a energia que você INJETA na rede (o excedente que vira crédito). Ela está subindo aos poucos: por volta de 2025 fica em torno de ~45% da tarifa de distribuição e segue aumentando até estabilizar perto de 2029. Na prática: para cada 1.000 kWh injetados, você recebe um pouco menos de 1.000 kWh em crédito de volta.",
          },
          {
            type: "p",
            text: "Repare na ligação com a aula de simultaneidade: a energia que você consome NA HORA que gera não paga Fio B (não usou a rede). Só a que sobra e vai para a rede paga. Por isso, quanto maior sua simultaneidade, menos a Lei 14.300 te afeta.",
          },
          {
            type: "example",
            title: "O que isso muda na prática",
            text: "A Lei 14.300 adicionou aproximadamente 1 ano ao payback típico (de ~5 para ~6 anos, dependendo da cidade e do seu perfil de consumo). Continua sendo um ótimo investimento — o retorno em 25 anos segue altíssimo —, mas qualquer proposta feita hoje DEVE considerar o Fio B no cálculo. Uma proposta que ainda mostra payback '1 para 1' está desatualizada ou otimista demais.",
          },
          {
            type: "tip",
            text: "Pergunte: 'este payback já considera a Lei 14.300 e o Fio B?'. A viabilidade financeira é INFORMATIVA — depende de premissas (inflação de energia, simultaneidade) que podem ser otimistas. Use-a como comparativo entre propostas, não como critério único de decisão.",
          },
        ],
      },
      {
        id: "financeiro-2",
        title: "Por que o menor preço engana",
        minutes: 10,
        illustration: "price",
        blocks: [
          {
            type: "p",
            text: "É tentador escolher o orçamento mais barato — afinal, o produto 'é o mesmo', certo? Errado. Uma diferença grande de preço quase sempre tem um motivo escondido, e descobri-lo só depois sai caro.",
          },
          { type: "h", text: "O que costuma estar por trás do 'barato demais'" },
          {
            type: "list",
            items: [
              "Inversor de marca desconhecida, sem rede de assistência no Brasil.",
              "Módulos de fabricante frágil (sem Tier 1 / sem garantia honrável).",
              "Garantia de instalação curta ou inexistente — só a do fabricante, lá fora.",
              "Empresa 'aventureira', sem engenheiro (CREA) e sem histórico — que pode sumir.",
              "Projeto subdimensionado: parece barato porque é menor do que você precisa.",
            ],
          },
          {
            type: "example",
            title: "A conta que não fecha",
            text: "Uma proposta R$ 4.000 mais barata parece ótima. Mas se o inversor barato falha no 4º ano e fica 2 meses parado, e a empresa que sumiu não dá assistência, você perde geração, paga conta cheia e ainda arca com a troca. O 'desconto' inicial vira prejuízo.",
          },
          {
            type: "tip",
            text: "Isso NÃO significa escolher o mais caro. Significa comparar preço JUNTO com empresa e tecnologia — exatamente o que a pontuação por critérios da plataforma faz. O objetivo é achar o melhor conjunto, não o menor número.",
          },
        ],
      },
    ],
  },
  {
    id: "decisao",
    title: "Decidindo entre finalistas",
    description: "Equilibrando empresa, tecnologia e preço para a melhor escolha.",
    level: "Avançado",
    lessons: [
      {
        id: "decisao-1",
        title: "Montando a matriz de comparação",
        minutes: 13,
        illustration: "matrix",
        blocks: [
          {
            type: "p",
            text: "Depois de receber 3, 4 ou 5 orçamentos, vem a parte difícil: como comparar 'maçãs com maçãs' se cada proposta vem num formato diferente, destacando o que é conveniente para o vendedor? A resposta é uma matriz de comparação — colocar todos os critérios lado a lado e dar uma nota objetiva a cada um.",
          },
          { type: "h", text: "Como a plataforma resolve isso" },
          {
            type: "list",
            items: [
              "Você anota os dados de cada proposta (empresa, técnico, financeiro) na entrevista.",
              "O sistema pontua cada critério de 0 a 10 com base em regras objetivas (ex: garantia ≥12 anos = nota alta).",
              "Você ajusta os PESOS: se assistência rápida é prioridade para você, dê mais peso a ela.",
              "A viabilidade financeira entra como informação, não infla a nota (porque depende de premissas).",
            ],
          },
          {
            type: "example",
            title: "Por que pesos importam",
            text: "Para quem mora numa cidade pequena, longe de centros, a rapidez da assistência técnica pode valer mais que economizar R$ 2.000. Já para uma empresa com equipe técnica própria, o preço pode pesar mais. A matriz com pesos deixa a decisão ser SUA, e não a do vendedor mais convincente.",
          },
          {
            type: "tip",
            text: "Ao final, escolha exatamente DOIS finalistas. Dois é o número ideal: te dá poder de negociação real sem se perder em opções demais.",
          },
        ],
      },
      {
        id: "decisao-2",
        title: "Negociando com os dois finalistas",
        minutes: 14,
        illustration: "deal",
        blocks: [
          {
            type: "p",
            text: "Chegou a reta final: você tem dois finalistas fortes. Ter dois (e deixar isso claro para eles) é o que te dá poder de negociação real. Cada um sabe que tem um concorrente à altura — e isso trabalha a seu favor.",
          },
          { type: "h", text: "Como negociar bem" },
          {
            type: "list",
            items: [
              "Use os pontos fortes de um como alavanca com o outro: 'a proposta X oferece 10 anos de garantia no inversor, vocês cobrem?'.",
              "Negocie além do preço: prazo de instalação, garantia estendida, monitoramento incluso, limpeza no primeiro ano.",
              "Peça tudo por escrito no contrato — incluindo os prazos de assistência.",
            ],
          },
          {
            type: "term",
            term: "O maior sinal de alerta: pressão para fechar",
            text: "Empresas sérias sabem que energia solar é um investimento grande e te dão tempo para analisar com calma. Pressão excessiva para 'fechar hoje senão o preço sobe', desconto-relâmpago que expira em horas, ou pressa para assinar são sinais clássicos de alerta. Quem tem confiança no próprio serviço não precisa te apressar.",
          },
          {
            type: "example",
            title: "Use os pontos de atenção a seu favor",
            text: "A plataforma destaca os 'pontos de atenção' de cada finalista (garantia curta, CREA não confirmado, assistência lenta). Leve-os para a mesa: 'notei que o prazo de assistência de vocês é de 15 dias; a outra empresa oferece 5. Conseguem melhorar?'. Pontos de atenção viram argumentos concretos de negociação.",
          },
          {
            type: "tip",
            text: "Decisão final é SUA, sempre. Não existe escolha universalmente certa — existe a melhor escolha para o SEU caso, com base em empresa, tecnologia e preço equilibrados. Você agora tem as ferramentas para fazê-la com critério.",
          },
        ],
      },
    ],
  },
];

export const ALL_LESSONS = COURSE.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id })));
export const TOTAL_LESSONS = ALL_LESSONS.length;

export function findLesson(lessonId: string) {
  for (const mod of COURSE) {
    const idx = mod.lessons.findIndex((l) => l.id === lessonId);
    if (idx >= 0) {
      const lesson = mod.lessons[idx];
      const flatIndex = ALL_LESSONS.findIndex((l) => l.id === lessonId);
      const next = ALL_LESSONS[flatIndex + 1] ?? null;
      return { module: mod, lesson, next };
    }
  }
  return null;
}
