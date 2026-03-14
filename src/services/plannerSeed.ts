import { supabase } from '@/lib/supabase';

export const seedPlannerData = async () => {
  const posts = [
    {
      date: '2026-03-02',
      title: 'Mulheres no mercado imobiliário: a força da decisão',
      format: 'Arte',
      media_link: '',
      script: 'Utilize fotos do seu próprio acervo ou visitas.',
      caption: 'O mercado imobiliário mudou e as mulheres são protagonistas dessa transformação. 🚀 Mais do que vender imóveis, elas trazem sensibilidade, estratégia e força na tomada de decisão. \n\nNeste mês da mulher, celebramos todas as corretoras e clientes que fazem a diferença! ✨\n\n#MulheresNoMercado #CorretoraDeImoveis #EmpoderamentoFeminino',
      completed: 0
    },
    {
      date: '2026-03-16',
      title: 'O café do corretor',
      format: 'Stories',
      media_link: '',
      script: 'Mostre sua rotina matinal preparando o café.',
      caption: 'Segunda-feira começando com foco total! ☕️ Planejando as visitas da semana para realizar sonhos imobiliários.',
      completed: 0
    },
    {
      date: '2026-03-17',
      title: 'Tour por Apartamento Decorado',
      format: 'Reels',
      media_link: '',
      script: 'Transições rápidas entre os cômodos, foco na varanda gourmet.',
      caption: 'Onde o luxo encontra o conforto. ✨ Conheça esse decorado que é puro desejo. #ImoveisDeLuxo #CorretorElite',
      completed: 0
    },
    {
      date: '2026-03-18',
      title: 'Dica: ITBI e Escritura',
      format: 'Carrossel',
      media_link: '',
      script: 'Slide 1: O que é ITBI? Slide 2: Quem paga? Slide 3: Dica bônus.',
      caption: 'Você sabe quanto custa a documentação do seu imóvel? 📝 Arraste para o lado e entenda tudo sobre ITBI e Escritura.',
      completed: 0
    },
    {
      date: '2026-03-20',
      title: 'Visita Técnica: Detalhes',
      format: 'Stories',
      media_link: '',
      script: 'Mostre a qualidade do acabamento de uma obra nova.',
      caption: 'Olho do dono! 👀 Conferindo cada detalhe desse novo empreendimento que acaba de chegar na carteira.',
      completed: 0
    },
    {
      date: '2026-03-21',
      title: 'Depoimento de Cliente',
      format: 'Feed',
      media_link: '',
      script: 'Foto do cliente recebendo as chaves ou print de elogio no WhatsApp.',
      caption: 'Não é sobre vender imóveis, é sobre realizar sonhos e construir confiança. Obrigado pela parceria! 🙏✨ #ClienteSatisfeito #RealizandoSonhos',
      completed: 0
    },
    {
      date: '2026-03-23',
      title: 'Bairros em Valorização',
      format: 'Reels',
      media_link: '',
      script: 'Aponte para textos na tela citando 3 bairros que estão crescendo na sua cidade.',
      caption: 'Onde investir em 2026? 🤔 Separei os 3 bairros com maior potencial de valorização para você ficar de olho! #InvestimentoImobiliario #DicasDeImoveis',
      completed: 0
    },
    {
      date: '2026-03-25',
      title: 'Mitos sobre Financiamento',
      format: 'Carrossel',
      media_link: '',
      script: 'Slide 1: Mitos vs Verdades. Slide 2: Precisa de entrada alta? Slide 3: Autônomo pode? Slide 4: Conclusão.',
      caption: 'Financiamento imobiliário não precisa ser um bicho de sete cabeças! 🧠 Desmistifiquei os principais pontos para você sair do aluguel.',
      completed: 0
    },
    {
      date: '2026-03-27',
      title: 'Dúvidas Frequentes (Q&A)',
      format: 'Stories',
      media_link: '',
      script: 'Abra uma caixinha de perguntas e responda as 3 mais comuns.',
      caption: 'Sextou com Q&A! 🗣️ Mande sua dúvida sobre o mercado imobiliário aqui na caixinha e eu te respondo agora.',
      completed: 0
    },
    {
      date: '2026-03-30',
      title: 'Resumo do Mês',
      format: 'Reels',
      media_link: '',
      script: 'Compilado de vídeos rápidos de visitas, contratos e cafés do mês.',
      caption: 'Março foi intenso! 🚀 Muita dedicação, muitas visitas e o melhor: muitos sonhos realizados. Vamos com tudo para Abril!',
      completed: 0
    },
    // APRIL 2026
    {
      date: '2026-04-01',
      title: 'Dia da Mentira: Mitos do mercado',
      format: 'Feed',
      media_link: '',
      script: 'Imagem de uma mesa de escritório com um contrato, e sobre ele um carimbo vermelho forte. Texto no topo em fonte sans-serif ousada: "A Maior Mentira do Mercado". Aspect ratio: 1080:1350.',
      caption: 'Hoje é o Dia da Mentira, e a maior que te contam é que "comprar imóvel é só para quem tem muito dinheiro à vista". Esqueça isso! Com o planejamento certo, o uso do FGTS e uma boa consultoria de crédito, o imóvel próprio é uma realidade muito mais próxima do que você imagina. Qual outra "mentira" imobiliária você já ouviu por aí? 🤥',
      completed: 0
    },
    {
      date: '2026-04-02',
      title: 'Preparando a casa para a Páscoa',
      format: 'Feed',
      media_link: '',
      script: 'Sala de jantar moderna e iluminada, mesa posta elegantemente com decorações sutis de Páscoa (tons pastéis, flores). Texto em fonte elegante e limpa: "A Arte de Receber Bem". Aspect ratio: 1080:1350.',
      caption: 'Domingo é dia de casa cheia! Se você é o anfitrião da Páscoa este ano, sabe que o espaço faz toda a diferença. Uma cozinha integrada à sala de jantar transforma o preparo do almoço em um momento de conexão com a família. Sua casa atual ainda comporta os encontros da sua família? 🍫🐰',
      completed: 0
    },
    {
      date: '2026-04-03',
      title: 'Imóvel: Foco Família',
      format: 'Feed',
      media_link: '',
      script: 'Moldura Canva: https://www.canva.com/design/DAHALmu8vk0/FuGsVQmxh8OPACG7QRahhw/view',
      caption: '📍 [BAIRRO] | O cenário perfeito para a próxima Páscoa da sua família.\nApresento este [TIPO DE IMÓVEL], com uma sala de jantar espetacular e [NÚMERO] quartos para receber todo mundo com conforto. Porque uma casa só vira "lar" quando está cheia de quem a gente ama.\n💰 Valor: R$ [VALOR]\n📲 Link na bio para agendar a sua visita pós-feriado.',
      completed: 0
    },
    {
      date: '2026-04-04',
      title: 'TBT de Família',
      format: 'Feed',
      media_link: '',
      script: 'Publique a foto real de uma família feliz recebendo as chaves ou no imóvel novo.',
      caption: 'O clima de Páscoa me fez lembrar do(a) [NOME DO CLIENTE/FAMÍLIA]. No ano passado, eles me procuraram porque a família ia crescer e o apartamento antigo ficou pequeno. Entregar as chaves do novo lar deles foi um dos momentos mais marcantes do meu ano. Ver a felicidade dessa família não tem preço! 👨👩👧👦🔑',
      completed: 0
    },
    {
      date: '2026-04-05',
      title: 'Feliz Páscoa',
      format: 'Feed',
      media_link: '',
      script: 'Design comemorativo sofisticado e clean. Uma porta entreaberta com uma luz suave e acolhedora saindo de dentro. Texto centralizado em fonte serifada premium: "Feliz Páscoa". Aspect ratio: 1080:1350.',
      caption: 'Que o domingo seja de renovação, união e muita alegria ao lado de quem faz a sua vida especial. Um lar se constrói com amor, e hoje é dia de celebrar esse sentimento. Feliz Páscoa a todos os nossos clientes e amigos! 🕊️✨',
      completed: 0
    },
    {
      date: '2026-04-06',
      title: 'Q2: O segundo trimestre começou',
      format: 'Feed',
      media_link: '',
      script: 'Imagem de uma agenda de couro aberta marcando "Abril" e uma xícara de café fumegante. Texto marcante no topo: "O Ano Está Voando. E a Sua Meta?". Aspect ratio: 1080:1350.',
      caption: 'Acabou o chocolate, a Páscoa passou e o segundo trimestre de 2026 já está correndo! Lembra daquela promessa de ano novo de "sair do aluguel" ou "fazer um upgrade de imóvel"? Um quarto do ano já se foi. A melhor hora para agir e garantir as melhores taxas de financiamento é agora. Vamos tomar um café esta semana? ☕📈',
      completed: 0
    },
    {
      date: '2026-04-07',
      title: 'Dica IRPF: Como declarar seu imóvel financiado',
      format: 'Feed',
      media_link: '',
      script: 'Um teclado de notebook moderno with the screen showing the program of the Income Tax blurred in the background. Top text in strong institutional font: "IRPF: Como declarar seu imóvel". Aspect ratio: 1080:1350.',
      caption: 'É época do Leão! 🦁 Se você comprou um imóvel financiado no último ano, muita atenção: você não deve declarar o valor total do imóvel! Na ficha de "Bens e Direitos", você declara apenas o que efetivamente pagou até 31/12 (entrada + parcelas). Salve este post para não errar na hora de mandar a declaração para o contador! 📄',
      completed: 0
    },
    {
      date: '2026-04-08',
      title: 'Caixa de Perguntas: Dúvidas Financeiras e IR',
      format: 'Stories',
      media_link: '',
      script: 'Crie uma imagem para fundo de Instagram Stories, design clean com elementos gráficos sutis de finanças (uma calculadora de luxo desfocada). Texto no topo: "Imposto de Renda e Imóveis: Mande sua Dúvida". Aspect ratio: 1080:1920.',
      caption: '(Apenas título e adesivo de caixinha nos Stories)',
      completed: 0
    },
    {
      date: '2026-04-09',
      title: 'Imóvel: Foco Investimento',
      format: 'Carrossel',
      media_link: '',
      script: 'Moldura Canva: https://www.canva.com/design/DAHALmu8vk0/FuGsVQmxh8OPACG7QRahhw/view',
      caption: '📍 [BAIRRO] | Rentabilidade e segurança em um só lugar.\nAproveitando o papo de finanças desta semana: imóvel ainda é a âncora mais segura para o seu patrimônio. Este projeto em [BAIRRO] oferece alto potencial de valorização e facilidade de locação. [CITAR UM DIFERENCIAL, ex: Perto da universidade / hospital].\n💰 R$ [VALOR] | Opção para investidores exigentes.\n📲 Direct para receber a lâmina completa.',
      completed: 0
    },
    {
      date: '2026-04-10',
      title: 'Dica IRPF: Restituição como parte da entrada?',
      format: 'Feed',
      media_link: '',
      script: 'Uma imagem elegante de um leão de porcelana pequeno e sofisticado sobre uma mesa com moedas empilhadas. Texto: "Faça o Leão Trabalhar Para Você". Aspect ratio: 1080:1350.',
      caption: 'Já enviou a declaração e tem restituição a receber nos próximos lotes? Uma excelente estratégia de inteligência financeira é direcionar esse valor extra para complementar a entrada do seu primeiro imóvel. Com planejamento, o "dinheiro do Leão" vira a chave da sua casa própria! 💰🔑',
      completed: 0
    },
    {
      date: '2026-04-11',
      title: 'Bastidores de Visita (Sábado de Plantão)',
      format: 'Feed',
      media_link: '',
      script: 'Publique uma foto sua na frente de um prédio espelhado ou com a chave na mão abrindo a porta para um cliente.',
      caption: 'Sábado também é dia de fechar negócios! Enquanto muitos descansam, nossa equipe está em campo abrindo as portas do futuro para os nossos clientes. Um bom corretor de imóveis não tem horário, tem propósito. 💪🏢',
      completed: 0
    },
    {
      date: '2026-04-12',
      title: 'Estilo de Vida: Outono',
      format: 'Feed',
      media_link: '',
      script: 'Sala aconchegante com tons amadeirados, luz quente de lareira e uma taça de vinho na mesa de centro. Texto centralizado e elegante: "O Conforto da Estação". Aspect ratio: 1080:1350.',
      caption: 'O outono está se instalando e os dias mais frescos pedem conforto. Você sabia que varandas fechadas com vidro e espaços com lareira ecológica são itens super procurados nesta época do ano? Ambientes que abraçam são os que vendem mais rápido. Como está o aconchego na sua casa hoje? 🍂🍷',
      completed: 0
    },
    {
      date: '2026-04-13',
      title: 'Antecipando Tiradentes: Independência',
      format: 'Feed',
      media_link: '',
      script: 'Uma chave dourada quebrando uma corrente frágil sobre um fundo de mármore claro. Texto no topo em fonte imponente: "Sua Independência do Aluguel". Aspect ratio: 1080:1350.',
      caption: 'Faltam poucos dias para o feriado de Tiradentes! A data fala sobre liberdade, e eu te pergunto: quando você vai declarar a sua independência do aluguel? Pagar por um teto que não é seu é financiar o patrimônio de outra pessoa. Vamos mudar isso em 2026? 🇧🇷🏡',
      completed: 0
    },
    {
      date: '2026-04-14',
      title: 'Checklist: O que analisar em uma visita',
      format: 'Feed',
      media_link: '',
      script: 'Prancheta minimalista de madeira clara com uma folha de papel e caneta de ponta fina. Texto claro no topo: "Checklist da Visita Perfeita". Aspect ratio: 1080:1350.',
      caption: 'Vai aproveitar o feriadão na semana que vem para visitar imóveis? Salve este checklist!\n1️⃣ Posição do Sol (Nascente é o preferido).\n2️⃣ Pressão da água nas torneiras e chuveiro.\n3️⃣ Estado das tomadas e quadro de luz.\n4️⃣ O barulho da rua com as janelas abertas e fechadas.\nSeja observador! 📝',
      completed: 0
    },
    {
      date: '2026-04-15',
      title: 'Imóvel: Foco no 1º Imóvel',
      format: 'Feed',
      media_link: '',
      script: 'Moldura Canva: https://www.canva.com/design/DAHALmu8vk0/FuGsVQmxh8OPACG7QRahhw/view',
      caption: '📍 [BAIRRO] | A oportunidade perfeita para a sua independência!\nSe o plano é sair da casa dos pais ou do aluguel, este [TIPO DE IMÓVEL] é a porta de entrada ideal. Planta funcional, condomínio com lazer enxuto (baixo custo) e documentação 100% regularizada para financiamento.\n💰 R$ [VALOR]\n📲 Link na bio! Vamos agendar uma visita antes que venda.',
      completed: 0
    },
    {
      date: '2026-04-16',
      title: 'Depoimento: Independência conquistada',
      format: 'Feed',
      media_link: '',
      script: 'Template minimalista para depoimento com aspas grandes (" ") em fundo cinza claro. Texto elegante no topo: "Um Passo Rumo à Liberdade". Aspect ratio: 1080:1350.',
      caption: '"O processo parecia assustador, mas com a assessoria certa, peguei as chaves antes do que imaginava". Palavras do nosso cliente [NOME]! Quando o cliente entende que o papel do corretor é resolver os problemas para ele, a magia acontece. Obrigado pela confiança! 🤝',
      completed: 0
    },
    {
      date: '2026-04-17',
      title: 'Convite: Mutirão de Visitas no Feriadão',
      format: 'Feed',
      media_link: '',
      script: 'Design corporativo moderno mostrando um calendário focado nos dias 18 a 21. Texto grande em destaque: "Plantão Especial de Feriado". Aspect ratio: 1080:1350.',
      caption: 'Você é do tipo que nunca tem tempo de ver imóvel durante a semana? O feriado de Tiradentes chegou na hora certa! Neste fim de semana e na terça-feira (feriado), faremos um plantão especial com agenda aberta para os melhores imóveis da nossa carteira. Mande "AGENDAR" no Direct! 📅🚨',
      completed: 0
    },
    {
      date: '2026-04-18',
      title: 'Giro do Plantão (Sábado de Feriadão)',
      format: 'Reels',
      media_link: '',
      script: 'Poste um vídeo/Reels rápido fazendo um "tour" express em um imóvel aberto.',
      caption: 'Nosso fim de semana já começou acelerado! Um giro rápido pelo imóvel de [BAIRRO] que acabei de mostrar para um cliente. E você, o que está esperando para agendar seu horário neste feriado? Ainda temos algumas janelas disponíveis. 🏃♂️💨',
      completed: 0
    },
    {
      date: '2026-04-19',
      title: 'Bairro em Destaque',
      format: 'Feed',
      media_link: '',
      script: 'Foto aérea diurna focada em um parque central rodeado por prédios modernos. Texto em fonte limpa no topo: "O Bairro da Vez". Aspect ratio: 1080:1350.',
      caption: 'Domingão é dia de explorar a cidade. Você já reparou como a região de [NOME DO BAIRRO] se transformou nos últimos 2 anos? Com a chegada de novos restaurantes, o [CITAR NOVO COMÉRCIO/PARQUE], a valorização ali está batendo recordes. Quem comprou na planta sorri à toa. E eu tenho opções incríveis lá! 🌳',
      completed: 0
    },
    {
      date: '2026-04-20',
      title: 'Emenda de Feriado: Casa Arrumada',
      format: 'Feed',
      media_link: '',
      script: 'Imagem de um quarto com decoração minimalista, extremamente arrumado, cama perfeitamente feita em tons brancos. Texto elegante: "O Poder de um Ambiente Organizado". Aspect ratio: 1080:1350.',
      caption: '"Enforcando" a segunda-feira? Aproveite a folga em casa para fazer aquele "destralhe"! Desapegar do que você não usa mais é o primeiro passo para renovar as energias do ambiente e deixar o imóvel mais atrativo caso você esteja pensando em colocá-lo à venda! Menos é mais! 🛋️✨',
      completed: 0
    },
    {
      date: '2026-04-21',
      title: 'Feriado de Tiradentes',
      format: 'Feed',
      media_link: '',
      script: 'Imagem conceitual com uma estátua minimalista ou monumento histórico desfocado ao fundo, com texto centralizado e forte: "21 de Abril: Dia de Tiradentes". Aspect ratio: 1080:1350.',
      caption: 'A liberdade geográfica, a segurança de um teto seu e a liberdade financeira de ter o dinheiro investido na pedra. O que "Independência" significa para você hoje no mercado imobiliário? Bom feriado a todos! 🇧🇷',
      completed: 0
    },
    {
      date: '2026-04-22',
      title: 'Descobrimento do Brasil',
      format: 'Feed',
      media_link: '',
      script: 'Imagem artística com uma luneta antiga vintage de latão focando em um conjunto de prédios modernos de luxo ao longe. Texto elegante: "Descubra o Seu Novo Lar". Aspect ratio: 1080:1350.',
      caption: 'Hoje, no Dia do Descobrimento do Brasil, te convido a ser o explorador do seu próprio futuro. Já pensou que o imóvel dos seus sonhos está "escondido" no mercado só esperando você descobrir? Fale comigo e deixe que eu faço a navegação por você! 🚢⚓',
      completed: 0
    },
    {
      date: '2026-04-23',
      title: 'Imóvel: Alto Padrão - A Descoberta',
      format: 'Carrossel',
      media_link: '',
      script: 'Moldura Canva: https://www.canva.com/design/DAHALmu8vk0/FuGsVQmxh8OPACG7QRahhw/view',
      caption: '📍 [BAIRRO] | A verdadeira "descoberta" da semana.\nUm imóvel que une arquitetura arrojada, localização impecável e um valor que foge do óbvio para a região. [METRAGEM]m² de puro bom gosto, pronto para morar e com marcenaria completa.\n💰 R$ [VALOR]\n📲 Deslize para ver os detalhes e me chame no direct.',
      completed: 0
    },
    {
      date: '2026-04-24',
      title: 'Dica Financeira: Taxas de juros e cenário atual',
      format: 'Feed',
      media_link: '',
      script: 'Imagem de uma mão profissional movendo uma peça de xadrez sobre um gráfico financeiro suave. Texto: "A Estratégia Certa Contra os Juros". Aspect ratio: 1080:1350.',
      caption: 'Uma das coisas que mais ouço: "Corretor, devo esperar os juros baixarem para comprar?". A resposta técnica é: você compra quando encontra o imóvel ideal! Se os juros baixarem no futuro, você faz a portabilidade do seu financiamento para outro banco com taxa menor. Não perca a oportunidade de hoje esperando o cenário de amanhã! 📉🤝',
      completed: 0
    },
    {
      date: '2026-04-25',
      title: 'Imóvel Diferente/Curiosidade',
      format: 'Feed',
      media_link: '',
      script: 'Publique fotos de referência do Pinterest de uma casa moderna espetacular ou loft industrial.',
      caption: 'Sábado de inspiração! Olha o nível desse projeto arquitetônico. A integração total do verde com o concreto, as linhas retas, a fachada ativa. O mercado imobiliário é, antes de tudo, uma vitrine de arte habitável. Qual detalhe você mais gostou? 🌿🏛️',
      completed: 0
    },
    {
      date: '2026-04-26',
      title: 'Resumo da Semana / Oportunidades vendidas',
      format: 'Feed',
      media_link: '',
      script: 'Um selo dourado with the word "VENDIDO" over the blurred photo of a deed or contract. Strong top text: "O Mercado Não Para". Aspect ratio: 1080:1350.',
      caption: 'Que semana, meus amigos! Mesmo com o feriado, fechamos negócios e tiramos do mercado [NÚMERO] unidades excelentes. O mercado não espera quem hesita. Se você quer fechar negócio ainda em abril, a última semana do mês começa amanhã. Preparado? 🚀',
      completed: 0
    },
    {
      date: '2026-04-27',
      title: 'Imóvel: Lotes/Condomínio Fechado',
      format: 'Feed',
      media_link: '',
      script: 'Moldura Canva: https://www.canva.com/design/DAHALmu8vk0/FuGsVQmxh8OPACG7QRahhw/view',
      caption: '📍 [NOME DO CONDOMÍNIO] | Construa o refúgio perfeito.\nO movimento de saída dos grandes centros para condomínios fechados continua forte em 2026. Este lote de [METRAGEM]m² é a tela em branco perfeita para a sua nova casa, com segurança 24h e clube completo.\n💰 R$ [VALOR]\n📲 Link na bio para agendar.',
      completed: 0
    },
    {
      date: '2026-04-28',
      title: '3 erros de quem compra na emoção',
      format: 'Feed',
      media_link: '',
      script: 'Sinalização de trânsito amarela de "Atenção" adaptada, com a silhueta de uma casa dentro. Texto no topo em letras modernas: "Cuidado: Emoção Cegando a Razão". Aspect ratio: 1080:1350.',
      caption: 'O imóvel ideal balança o coração, mas quem assina o cheque precisa ser a razão. Evite:\nComprometer mais de 30% da renda na parcela.\nNão checar o valor histórico do condomínio (há inadimplência no prédio?).\nEsquecer de calcular o ITBI e as taxas de cartório.\nComigo, você compra com segurança jurídica e financeira. 🛡️',
      completed: 0
    },
    {
      date: '2026-04-29',
      title: 'Imóvel Troféu do Mês',
      format: 'Feed',
      media_link: '',
      script: 'Moldura Canva: https://www.canva.com/design/DAHALmu8vk0/FuGsVQmxh8OPACG7QRahhw/view',
      caption: '🏆 IMÓVEL TROFÉU DE ABRIL 🏆\nFechando o mês apresentando a verdadeira joia da coroa. Um alto padrão espetacular em [BAIRRO]. Acabamentos de primeira linha, vista panorâmica e exclusividade total.\n💰 R$ [VALOR]\n📲 Agendamentos sigilosos via WhatsApp.',
      completed: 0
    },
    {
      date: '2026-04-30',
      title: 'Obrigado, Abril! Vem aí o mês das Mães',
      format: 'Feed',
      media_link: '',
      script: 'Arte minimalista e elegante em tons de azul escuro e dourado. No centro, texto premium: "Adeus, Abril. Olá, Maio". Aspect ratio: 1080:1350.',
      caption: 'Mais um mês incrível sendo fechado with a golden key. I thank every client who put their trust in my work in April. Tomorrow begins May, the month traditionally focused on the family and Mothers. We have prepared wonderful news for you. See you then! ❤️🔑',
      completed: 0
    }
  ];

  const importantDates = [
    { month: 2, day: '08', label: 'Dia Internacional da Mulher' },
    { month: 2, day: '15', label: 'Dia do Consumidor' },
    { month: 2, day: '20', label: 'Início do Outono' },
    { month: 2, day: '28', label: 'Hora do Planeta' },
    { month: 3, day: '05', label: 'Páscoa' },
    { month: 3, day: '21', label: 'Tiradentes' },
    { month: 3, day: '22', label: 'Descobrimento do Brasil' }
  ];

  try {
    // Get existing posts to avoid duplicates
    const { data: existingPosts } = await supabase.from('posts').select('date');
    const existingDates = new Set(existingPosts?.map(p => p.date) || []);
    const newPosts = posts.filter(p => !existingDates.has(p.date));
    
    if (newPosts.length > 0) {
      const { error: postError } = await supabase.from('posts').insert(newPosts);
      if (postError) throw postError;
      console.log(`${newPosts.length} new posts seeded successfully`);
    }

    // Get existing dates to avoid duplicates
    const { data: existingDatesData } = await supabase.from('important_dates').select('month, day, label');
    const existingDatesSet = new Set(existingDatesData?.map(d => `${d.month}-${d.day}-${d.label}`) || []);
    const newDates = importantDates.filter(d => !existingDatesSet.has(`${d.month}-${d.day}-${d.label}`));

    if (newDates.length > 0) {
      const { error: dateError } = await supabase.from('important_dates').insert(newDates);
      if (dateError) throw dateError;
      console.log(`${newDates.length} new important dates seeded successfully`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error seeding planner data:', error);
    return { success: false, error };
  }
};
