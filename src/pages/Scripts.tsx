import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion } from 'motion/react';
import { Loader2, Plus, GripVertical, CheckCircle2, Circle, Clock, LayoutList, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Script {
  id: string;
  title: string;
  format: string;
  why_it_works: string;
  hooks: string;
  scenes: string;
  caption: string;
  cta: string;
}

interface UserScript {
  id: string;
  script_id: string;
  status: 'todo' | 'doing' | 'done';
}

const COLUMNS = [
  { id: 'todo', title: 'Para Fazer', icon: Circle, color: 'text-slate-400', bg: 'bg-slate-100' },
  { id: 'doing', title: 'Em Andamento', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'done', title: 'Concluído', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' }
];

// Fallback data
const FALLBACK_SCRIPTS: Script[] = [
  {
    id: '1',
    title: "#1: QUEBRANDO UM MITO (Os Juros vs. Valorização)",
    format: "Educativo / Diálogo (Two Characters)",
    why_it_works: "Elimina a principal trava de quem está adiando a compra por causa da taxa de juros.",
    hooks: "Você ainda acredita que esperar os juros caírem é a melhor estratégia agora?\n\nO que ninguém te conta sobre a relação entre taxa Selic e preço dos imóveis.\n\nPor que você está perdendo dinheiro ao adiar sua compra para o ano que vem.",
    scenes: "Cena 1: Você interpretando o Comprador Duvidoso. \"Eu vou esperar a taxa de juros cair mais um pouco para financiar meu apartamento, assim a parcela fica menor.\"\n\nCena 2: Você interpretando o Consultor Especialista. \"Enquanto você espera a parcela cair 200 reais, o valor final do imóvel sobe 50 mil por causa da demanda e do custo de construção. A conta simplesmente não fecha.\"\n\nCena 3: Mostre você apontando para dados em um tablet ou tela. \"O segredo é imobilizar o preço do imóvel hoje e fazer a portabilidade do seu financiamento quando os juros baixarem no futuro.\"\n\nCena 4: Você olhando firme para a lente. \"Quem entende de mercado compra o ativo pelo valor de agora e refina o crédito depois. O lucro está no timing.\"",
    caption: "O mercado imobiliário não espera. A valorização real sempre supera a pequena economia que você acha que fará esperando os juros baixarem. Proteja seu patrimônio comprando no valor atual.",
    cta: "Digite MATEMÁTICA e eu te envio uma simulação comparativa entre comprar agora e esperar 12 meses."
  },
  {
    id: '2',
    title: "#2: ANTES E DEPOIS (O Poder da Região)",
    format: "Transformação / Visão de Mercado",
    why_it_works: "Prova visual de que o corretor identifica regiões com alto potencial de lucro para o comprador.",
    hooks: "Você não vai acreditar no quanto este metro quadrado valorizou nos últimos 24 meses.\n\nOlha o que aconteceu com quem investiu nesta planta há apenas um ano.\n\nDe um terreno cercado ao condomínio mais desejado: veja a evolução desse valor.",
    scenes: "Cena 1: Mostre uma foto ou vídeo antigo da rua ou do terreno (pode ser do Google Street View antigo). \"Olha como era essa região de [Bairro] há pouquíssimo tempo. Quase ninguém dava nada por esse endereço.\"\n\nCena 2: Transição rápida para você em frente ao prédio pronto e luxuoso. \"Hoje, esse é o metro quadrado que mais cresce na cidade, e quem comprou na planta já viu o patrimônio dobrar.\"\n\nCena 3: Mostre um take rápido da área de lazer atual. \"O segredo aqui não foi sorte, foi antecipação de infraestrutura urbana.\"\n\nCena 4: Você apontando para o link ou comentário. \"Eu selecionei o próximo bairro que vai passar por isso. Quer saber qual é?\"",
    caption: "O lucro no mercado imobiliário pertence aos que se antecipam. Oportunidade é ver o que todos verão apenas daqui a dois anos.",
    cta: "Comente BAIRRO para receber minha análise exclusiva das 3 regiões mais promissoras para este semestre."
  },
  {
    id: '3',
    title: "#3: TESTANDO UM HACK (A Busca Perfeita)",
    format: "Testing Hacks",
    why_it_works: "Mostra que o corretor usa métodos avançados para filtrar o que há de melhor para o cliente.",
    hooks: "Será que esse filtro de busca realmente entrega as melhores oportunidades?\n\nTestei o método dos grandes investidores para achar imóveis abaixo do preço.\n\nVi esse hack de busca na internet e decidi aplicar no inventário de [Cidade].",
    scenes: "Cena 1: Você mostrando a tela do celular ou computador com um portal imobiliário. \"Dizem que se você usar esse filtro específico, você encontra as unidades de revenda mais urgentes do mercado.\"\n\nCena 2: Você mexendo na tela e fazendo cara de analítico. \"Eu testei esse filtro em [Bairro] e a maioria dos resultados foi perda de tempo, mas uma unidade me chamou a atenção.\"\n\nCena 3: Mostre fotos rápidas de um imóvel real com preço excelente. \"Essa unidade aqui está 15 por cento abaixo da tabela porque o proprietário precisa de liquidez imediata.\"\n\nCena 4: Você olhando para a câmera. \"O hack funciona, mas você precisa de um especialista para separar o que é oportunidade do que é problema.\"",
    caption: "Portais imobiliários são cheios de anúncios defasados. O verdadeiro filtro de oportunidades está no relacionamento direto com quem domina o inventário da região.",
    cta: "Me chame no Direct se você cansou de procurar e quer receber apenas o que foi aprovado pelo meu filtro técnico."
  },
  {
    id: '4',
    title: "#4: 3 ERROS QUE VOCÊ COMETE (Ao Visitar um Imóvel)",
    format: "Lista Rápida",
    why_it_works: "Posiciona o corretor como um consultor que protege o dinheiro do cliente.",
    hooks: "Pare de visitar imóveis sem observar estes 3 pontos essenciais.\n\n3 erros comuns que fazem compradores de luxo perderem dinheiro.\n\nSe você vai visitar um apartamento hoje, assista este vídeo primeiro.",
    scenes: "Cena 1: Você entrando em um apartamento decorado. \"A maioria das pessoas entra aqui e só olha a decoração, mas o que realmente importa está em outro lugar.\"\n\nCena 2: Você apontando para a janela. \"Erro 1: Não conferir a incidência solar no horário que você mais estará em casa. Conforto térmico é valor de revenda.\"\n\nCena 3: Você apontando para o teto ou paredes. \"Erro 2: Ignorar a espessura das lajes e o isolamento acústico. Silêncio é o verdadeiro luxo hoje em dia.\"\n\nCena 4: Você olhando para a câmera. \"Erro 3: Não analisar o VGV e os próximos lançamentos ao redor. Você quer vizinhos que valorizem seu prédio, não que tirem sua vista.\"",
    caption: "Comprar um imóvel é uma decisão técnica que envolve cifras altas demais para ser baseada apenas na emoção da primeira visita.",
    cta: "Salve este checklist para sua próxima visita."
  },
  {
    id: '5',
    title: "#5: O SEGREDO POR TRÁS (Do Valor do Condomínio)",
    format: "Revelação / Insider",
    why_it_works: "Toca em uma preocupação financeira real do comprador (custo fixo).",
    hooks: "Ninguém fala sobre isso, mas esse detalhe define se o seu condomínio será caro ou barato.\n\nO segredo para identificar um prédio com gestão eficiente antes de comprar.\n\nO que o corretor comum não te conta sobre a taxa de condomínio nos lançamentos.",
    scenes: "Cena 1: Você no hall de um prédio moderno. \"Muitos compradores fogem de prédios com muita área de lazer achando que o condomínio será caro, mas a verdade é o oposto.\"\n\nCena 2: Você explicando de forma próxima. \"O segredo está no número de unidades. Quanto mais apartamentos dividindo o custo da infraestrutura, menor é o valor por família.\"\n\nCena 3: Mostre um detalhe tecnológico (portaria remota ou placas solares). \"Além disso, prédios com tecnologia de automação reduzem o custo operacional em até 30 por cento.\"\n\nCena 4: Você sorrindo. \"Eu analiso a planilha orçamentária dos prédios antes de recomendar para meus clientes. Eficiência é o novo padrão.\"",
    caption: "Taxa de condomínio não precisa ser uma surpresa desagradável. Saiba analisar os indicadores de gestão antes de assinar a escritura.",
    cta: "Envie CONDOMÍNIO no direct e eu te mostro a comparação de custos dos melhores prédios de [Região]."
  },
  {
    id: '7',
    title: "#7: UMA HISTÓRIA INESPERADA (A Perda da Unidade)",
    format: "Storytelling Curto",
    why_it_works: "Utiliza o medo da perda para acelerar leads que estão em cima do muro.",
    hooks: "Você não vai acreditar no que aconteceu com o cliente que demorou 24 horas para decidir.\n\nA história do imóvel que foi vendido enquanto o comprador pensava se valia a pena.\n\nPor que no mercado imobiliário de oportunidade, quem hesita perde dinheiro.",
    scenes: "Cena 1: Você com uma expressão séria, sentado em uma mesa com documentos. \"Semana passada um cliente me ligou decidido a comprar aquela unidade exclusiva que mostrei nos stories. O problema? Ele esperou três dias.\"\n\nCena 2: Você fazendo um sinal de \"já foi\" com a mão. \"Enquanto ele analisava detalhes que não mudavam o negócio, um investidor veio e fechou a unidade à vista no segundo dia.\"\n\nCena 3: Você olhando para a câmera. \"No mercado imobiliário de [Cidade], as verdadeiras oportunidades não ficam disponíveis por mais de 48 horas.\"\n\nCena 4: Você apontando para frente. \"Eu acabo de liberar uma unidade com o mesmo perfil. A pergunta é: você vai agir ou vai esperar a próxima história?\"",
    caption: "Oportunidades são como trens bala: eles não param para quem ainda está decidindo se quer viajar. Ter agilidade na decisão é o que separa o dono do imóvel do eterno buscador.",
    cta: "Digite AGORA para entrar na minha lista VIP e receber as ofertas antes de todo mundo."
  },
  {
    id: '8',
    title: "#8: COMPARANDO X VS Y (Garden ou Cobertura?)",
    format: "Contraste / Comparação",
    why_it_works: "Ajuda o comprador a definir seu perfil e mostra que você entende de diferentes estilos de vida.",
    hooks: "Qual você escolheria: a liberdade de um Garden ou a vista de uma Cobertura?\n\nA diferença real de valorização entre esses dois tipos de imóveis.\n\nVou te mostrar por que o apartamento Garden é a nova tendência do mercado.",
    scenes: "Cena 1: Você em um terraço de cobertura com vista. \"De um lado temos a Cobertura: status, vista definitiva e total privacidade no topo do prédio.\"\n\nCena 2: Transição para você em um apartamento Garden com quintal e gramado. \"Do outro, o Garden: a sensação de morar em uma casa, com espaço para os pets e crianças, mas com a segurança de um prédio.\"\n\nCena 3: Você comparando os dois com as mãos. \"Atualmente, os Gardens estão valorizando mais rápido pela escassez de espaço horizontal nos grandes centros.\"\n\nCena 4: Você olhando para a câmera. \"Se o seu foco é liquidez, eu tenho o veredito de qual é o melhor investimento hoje.\"",
    caption: "Estilo de vida ou estratégia financeira? A escolha entre um Garden e uma Cobertura diz muito sobre suas prioridades. Eu tenho as melhores opções de ambos no meu portfólio.",
    cta: "Comente GARDEN ou COBERTURA para eu te enviar as opções disponíveis hoje."
  },
  {
    id: '10',
    title: "#10: O TRUQUE RÁPIDO (Como Baixar a Parcela)",
    format: "Dica Prática",
    why_it_works: "Oferece um benefício financeiro imediato e tangível para o comprador.",
    hooks: "Isso vai te economizar milhares de reais no seu financiamento.\n\nUm truque que poucos compradores usam para reduzir o valor da parcela.\n\nSe eu soubesse disso antes de comprar meu primeiro imóvel, teria economizado muito.",
    scenes: "Cena 1: Você apontando para um print de simulação bancária. \"Você sabia que a maioria das pessoas aceita o seguro habitacional padrão do banco sem questionar?\"\n\nCena 2: Você explicando de forma didática. \"O truque é que você pode solicitar a cotação de seguros externos e vinculá-los ao seu financiamento. Isso pode reduzir sua parcela em até 10 por cento.\"\n\nCena 3: Mostre você fazendo uma conta rápida em uma calculadora ou tablet. \"Em um contrato de 30 anos, estamos falando de uma economia que paga um carro zero.\"\n\nCena 4: Você olhando para a câmera. \"Eu ajudo meus clientes a otimizarem cada centavo do fluxo financeiro. Isso é engenharia de vendas.\"",
    caption: "Comprar um imóvel não é só sobre o preço de venda, é sobre o custo efetivo total do negócio. Pequenos ajustes no contrato geram grandes economias a longo prazo.",
    cta: "Quer uma análise gratuita do seu potencial de financiamento? Comente ANALISE."
  },
  {
    id: '12',
    title: "#12: O QUE NINGUÉM TE AVISA (Sobre Imóveis na Planta)",
    format: "Alerta / Insider",
    why_it_works: "O comprador sente que você está sendo 100% honesto, o que gera uma confiança inabalável.",
    hooks: "Se você está pensando em comprar um imóvel na planta, precisa ouvir isso.\n\nNinguém te avisa sobre o impacto do INCC no seu saldo devedor.\n\nA verdade que as tabelas de vendas não mostram de forma clara.",
    scenes: "Cena 1: Você em frente a uma obra em andamento. \"Todo mundo fica encantado com o decorado, mas ninguém te explica como o seu saldo devedor se comporta durante a obra.\"\n\nCena 2: Você sendo direto. \"O INCC não é juros, é correção de custo de material. Se você não planejar um aporte anual, sua parcela final pode te surpreender negativamente.\"\n\nCena 3: Mostre uma planilha ou um gráfico de evolução de saldo. \"A estratégia certa é amortizar o máximo possível durante a construção para chegar no financiamento bancário com folga.\"\n\nCena 4: Você olhando para a câmera. \"Eu não vendo apenas metros quadrados, eu vendo planejamento financeiro seguro.\"",
    caption: "Comprar na planta é excelente para valorização, mas exige conhecimento técnico do contrato. Não assine nada antes de entender como o seu dinheiro será corrigido até a entrega das chaves.",
    cta: "Envie INCC no meu direct e eu te mando um vídeo explicativo de 2 minutos sobre como se proteger."
  },
  {
    id: '15',
    title: "#15: A PERGUNTA QUE NINGUÉM FAZ (Mas deveria)",
    format: "Pergunta Provocativa",
    why_it_works: "Muda o ponto de vista do comprador e o faz perceber que você é um especialista mais profundo que os outros.",
    hooks: "Você já parou para se perguntar qual é o perfil de vizinhança deste prédio?\n\nNinguém nunca te fez essa pergunta antes de te vender um apartamento.\n\nA pergunta certa não é quanto custa o imóvel, mas sim quanto ele te custará parado.",
    scenes: "Cena 1: Você parado no meio de uma sala vazia de um imóvel de alto padrão. \"Todo mundo me pergunta sobre o valor do IPTU ou do condomínio, mas quase ninguém pergunta sobre a taxa de ocupação do prédio.\"\n\nCena 2: Você explicando. \"Um prédio com muitas unidades vazias ou focadas apenas em aluguel de curta temporada tem um comportamento de valorização totalmente diferente de um prédio residencial consolidado.\"\n\nCena 3: Mostre imagens do entorno do prédio (comércios, escolas). \"Saber quem vai morar ao seu lado é o que define se o seu imóvel será um lar ou apenas um endereço.\"\n\nCena 4: Você olhando firme. \"Eu estudo a demografia de cada empreendimento que eu ofereço. Qualidade de vida se compra com dados.\"",
    caption: "O valor de um imóvel está diretamente ligado às pessoas que o cercam. Não compre apenas paredes, compre um ecossistema que valorize o seu estilo de vida.",
    cta: "Quer saber quais são os prédios mais exclusivos e familiares de [Bairro]? Me chame agora."
  },
  {
    id: '21',
    title: "#21: O TRUQUE DE 1 MINUTO (Avaliação de Vista)",
    format: "Dica Relâmpago",
    why_it_works: "É rápido, visual e útil. Mostra que o corretor se preocupa com detalhes que o cliente pode esquecer.",
    hooks: "Se você tem 1 minuto, aprenda a avaliar se a vista do seu imóvel é definitiva.\n\nUm truque de 1 minuto para você não ser surpreendido por um prédio novo na sua janela.\n\nComo usar o Plano Diretor da cidade a seu favor em apenas 60 segundos.",
    scenes: "Cena 1: Você na varanda de um apartamento mostrando a vista. \"Você amou essa vista, né? Mas como saber se daqui a dois anos não terá um paredão de concreto na sua frente?\"\n\nCena 2: Você mostrando o celular com um mapa ou aplicativo de prefeitura. \"O truque é checar o zoneamento da quadra vizinha. Se o gabarito for baixo ou se for uma área de preservação, sua vista está segura.\"\n\nCena 3: Mostre você apontando para o terreno ao lado. \"Eu sempre faço essa análise técnica para garantir que o 'azul do mar' que você compra hoje continue lá para sempre.\"\n\nCena 4: Você olhando para a câmera e dando um \"joinha\". \"Segurança patrimonial começa pela janela.\"",
    caption: "Vista definitiva não é sorte, é análise de zoneamento urbano. Não compre um visual que tem data de validade. Eu garanto a perenidade do seu investimento.",
    cta: "Salve esta dica para usar em todas as visitas que você fizer."
  },
  {
    id: '25',
    title: "#25: A MAIOR DÚVIDA DE INICIANTE (ITBI e Registro)",
    format: "Didático / Topo de Funil",
    why_it_works: "Resolve o medo do \"custo escondido\" que muitos compradores de primeira viagem têm.",
    hooks: "Afinal, quanto dinheiro extra eu preciso ter para as taxas de escritura?\n\nTodo comprador iniciante se assusta com esses valores, mas eu vou te explicar.\n\nA regra de ouro para não ser pego de surpresa no cartório.",
    scenes: "Cena 1: Você com uma expressão de \"pergunta recebida\". \"A dúvida que eu recebo toda semana é: Hebert, os 20 por cento de entrada são tudo o que eu preciso?\"\n\nCena 2: Você faz sinal de \"não\" e explica. \"Você precisa reservar entre 4 a 5 por cento do valor do imóvel para o ITBI e o Registro. Sem isso, o imóvel não é seu legalmente.\"\n\nCena 3: Mostre um exemplo rápido na tela: Imóvel de 500k = 25k de taxas. \"É um valor considerável que precisa estar no seu planejamento desde o dia um.\"\n\nCena 4: Você finaliza com autoridade. \"Algumas construtoras oferecem o ITBI grátis como bônus. Quer saber quais são os lançamentos com esse benefício hoje?\"",
    caption: "O planejamento financeiro para a compra de um imóvel vai além do valor de venda. Conhecer as taxas cartorárias evita que você trave o negócio na hora H.",
    cta: "Digite TAXAS e eu te envio uma planilha automática para você calcular seus custos de fechamento."
  },
  {
    id: '32',
    title: "#32: 1 COISA QUE MUDOU MEU JOGO (A Curadoria)",
    format: "Revelação Única / Autoridade",
    why_it_works: "Explica por que o cliente deve escolher você e não o concorrente.",
    hooks: "A única coisa que eu faço diferente e que garante o lucro dos meus clientes.\n\nSe eu pudesse te dar apenas um conselho de investimento hoje, seria este.\n\nComo eu parei de vender imóveis e comecei a construir patrimônio para as famílias.",
    scenes: "Cena 1: Você caminhando em um ambiente elegante. \"Eu mudei meu jogo quando parei de oferecer o que estava disponível e passei a oferecer o que era estrategicamente viável.\"\n\nCena 2: Você analisando uma planta no tablet. \"Hoje, eu descarto 90 por cento dos imóveis que chegam para mim. Só apresento para os meus clientes o que passa pelo meu critério de Engenharia de Vendas.\"\n\nCena 3: Mostre imagens rápidas de detalhes de acabamento e localização. \"Eu olho liquidez, zoneamento, histórico da construtora e potencial de rentabilidade.\"\n\nCena 4: Você olhando para a câmera. \"Você não precisa de um corretor que te mostre fotos. Você precisa de um consultor que proteja seu capital.\"",
    caption: "O mercado está cheio de opções, mas poucas são oportunidades reais. Minha curadoria é o que separa um bom endereço de um excelente negócio.",
    cta: "Quer ter acesso ao meu portfólio filtrado? Clique no link da bio."
  },
  {
    id: '35',
    title: "#35: O QUE NÃO FAZER (Na Hora do Financiamento)",
    format: "Evite Isso / Alerta",
    why_it_works: "O medo de ter o crédito negado é enorme; essa dica é de utilidade pública.",
    hooks: "Se você vai financiar um imóvel nos próximos meses, NÃO faça isso!\n\nO erro bobo que cancela a aprovação do seu crédito bancário na hora H.\n\nComo manter sua saúde financeira impecável para o banco te dar o 'sim'.",
    scenes: "Cena 1: Você com o dedo em riste fazendo sinal de \"pare\". \"Você está com tudo pronto para comprar seu apartamento, mas decide trocar de carro ou fazer um empréstimo novo. Pare agora!\"\n\nCena 2: Você explicando. \"O banco analisa seu comprometimento de renda até o dia da assinatura. Qualquer dívida nova reduz seu poder de compra e pode cancelar seu financiamento.\"\n\nCena 3: Mostre um ícone de \"proibido\" sobre um cartão de crédito. \"Mantenha seu perfil financeiro estável e evite compras grandes parceladas até a entrega das chaves.\"\n\nCena 4: Você olhando para a câmera. \"Dica de ouro: fale com seu corretor antes de qualquer movimento financeiro importante durante o processo de compra.\"",
    caption: "O processo de compra de um imóvel exige disciplina financeira do início ao fim. Um erro simples no seu CPF pode custar a aprovação do seu sonho.",
    cta: "Salve este alerta para não esquecer e compartilhe com quem está buscando imóvel."
  },
  {
    id: '42',
    title: "#42: O SEGREDO DO ACABAMENTO PERFEITO",
    format: "Dica Técnica / Qualidade",
    why_it_works: "Ajuda o comprador a identificar um imóvel de alto padrão real, separando-o de \"maquiagens\" de venda.",
    hooks: "Como identificar se um imóvel é realmente de alto padrão pelo acabamento.\n\nO detalhe técnico que as construtoras premium não abrem mão.\n\nVocê sabia que esse detalhe no piso muda totalmente a valorização do imóvel?",
    scenes: "Cena 1: Você agachado mostrando o encontro do piso com a parede. \"Tá vendo esse rodapé embutido? Isso não é só estética, é sinal de uma obra com alto rigor técnico.\"\n\nCena 2: Você tocando em uma esquadria de janela. \"Esquadrias de alta performance com isolamento acústico são o que separam um prédio comum de um empreendimento de luxo real.\"\n\nCena 3: Mostre o detalhe de uma bancada ou acabamento de teto. \"Se a construtora capricha no que você vê, imagine o cuidado que ela teve com a parte estrutural e hidráulica que está escondida.\"\n\nCena 4: Você olhando para a câmera. \"Eu só levo meus clientes em obras que eu assinaria embaixo. Qualidade técnica é o meu padrão.\"",
    caption: "O luxo está nos detalhes que a maioria não nota, mas que fazem toda a diferença na durabilidade e na valorização do seu patrimônio a longo prazo.",
    cta: "Comente PADRÃO para receber fotos dos 3 empreendimentos com melhor acabamento da cidade hoje."
  },
  {
    id: '48',
    title: "#48: A PERGUNTA QUE VOCÊ NÃO SABIA QUE PRECISAVA FAZER",
    format: "Insight / Inteligência",
    why_it_works: "Provoca o cliente a pensar em algo que ele ignorou, reforçando sua superioridade intelectual no mercado.",
    hooks: "Você nunca perguntou isso para um corretor, mas deveria ser a sua primeira dúvida.\n\nEssa única pergunta vai mudar como você enxerga o valor de um condomínio.\n\nA pergunta certa não é sobre o preço, é sobre a liquidez.",
    scenes: "Cena 1: Você caminhando em um condomínio com infraestrutura completa. \"A pergunta certa não é 'quanto custa o condomínio', mas sim 'qual é o histórico de valorização desse bairro nos últimos 5 anos?'.\"\n\nCena 2: Você explicando a lógica. \"Se o bairro valoriza 10 por cento ao ano e o seu financiamento custa 9, você está morando de graça e ainda ganhando patrimônio.\"\n\nCena 3: Mostre um gráfico de valorização na tela. \"É essa conta que os investidores fazem e que você também deveria fazer antes de comprar para morar.\"\n\nCena 4: Você olhando firme. \"Eu não vendo imóveis, eu vendo ativos financeiros disfarçados de lares. Quer fazer essa conta comigo?\"",
    caption: "A matemática imobiliária é o que separa um gasto de um investimento. Esteja do lado de quem faz o dinheiro trabalhar enquanto dorme (ou mora).",
    cta: "Clique no link da bio e agende sua análise de viabilidade imobiliária."
  }
];

export default function Scripts() {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<Script[]>(FALLBACK_SCRIPTS);
  const [userScripts, setUserScripts] = useState<UserScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Try to fetch from Supabase first
      const { data: scriptsData, error: scriptsError } = await supabase
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: true });

      if (!scriptsError && scriptsData && scriptsData.length > 0) {
        setScripts(scriptsData);
      } else {
        // Use fallback data if table doesn't exist or is empty
        setScripts(FALLBACK_SCRIPTS);
      }

      // Try to fetch user progress from Supabase
      const { data: userScriptsData, error: userScriptsError } = await supabase
        .from('user_scripts')
        .select('*')
        .eq('user_id', user?.id);

      if (!userScriptsError && userScriptsData) {
        setUserScripts(userScriptsData);
      } else {
        // Fallback to localStorage
        const localProgress = localStorage.getItem(`scripts_progress_${user?.id}`);
        if (localProgress) {
          setUserScripts(JSON.parse(localProgress));
        }
      }
    } catch (error) {
      console.error('Error fetching scripts:', error);
      // Ensure fallback data is set on error
      setScripts(FALLBACK_SCRIPTS);
      const localProgress = localStorage.getItem(`scripts_progress_${user?.id}`);
      if (localProgress) {
        setUserScripts(JSON.parse(localProgress));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getScriptsByStatus = (status: string) => {
    return scripts.filter(script => {
      const userScript = userScripts.find(us => us.script_id === script.id);
      if (status === 'todo') {
        return !userScript || userScript.status === 'todo';
      }
      return userScript?.status === status;
    });
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !user) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    const scriptId = draggableId;
    const newStatus = destination.droppableId as 'todo' | 'doing' | 'done';

    // Optimistic update
    const existingUserScript = userScripts.find(us => us.script_id === scriptId);
    
    let newUserScripts;
    if (existingUserScript) {
      newUserScripts = userScripts.map(us => 
        us.script_id === scriptId ? { ...us, status: newStatus } : us
      );
    } else {
      const newUserScript = {
        id: crypto.randomUUID(),
        script_id: scriptId,
        status: newStatus
      };
      newUserScripts = [...userScripts, newUserScript as UserScript];
    }
    
    setUserScripts(newUserScripts);
    
    // Save to localStorage as fallback
    localStorage.setItem(`scripts_progress_${user.id}`, JSON.stringify(newUserScripts));

    // Try to save to Supabase
    try {
      if (existingUserScript) {
        await supabase
          .from('user_scripts')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('script_id', scriptId);
      } else {
        await supabase
          .from('user_scripts')
          .insert({
            user_id: user.id,
            script_id: scriptId,
            status: newStatus
          });
      }
    } catch (e) {
      console.log('Could not save to Supabase, using localStorage fallback');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <LayoutList className="w-8 h-8 text-brand-primary" />
          Roteiros Imobiliários
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Organize suas gravações e acompanhe seu progresso.
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
          {COLUMNS.map(column => (
            <div key={column.id} className="flex-1 min-w-[300px] max-w-[400px] flex flex-col bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <column.icon className={`w-5 h-5 ${column.color}`} />
                  {column.title}
                </h3>
                <span className="bg-white text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-100">
                  {getScriptsByStatus(column.id).length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto space-y-3 p-2 rounded-xl transition-colors ${
                      snapshot.isDraggingOver ? column.bg : ''
                    }`}
                  >
                    {getScriptsByStatus(column.id).map((script, index) => (
                      <Draggable key={script.id} draggableId={script.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => setSelectedScript(script)}
                            className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all ${
                              snapshot.isDragging ? 'shadow-lg border-brand-primary/50 scale-[1.02] rotate-1' : 'border-slate-200 hover:border-brand-primary/30 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <GripVertical className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm leading-tight mb-2">
                                  {script.title}
                                </h4>
                                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-md">
                                  {script.format}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Script Details Modal */}
      {selectedScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-xl font-black text-slate-900">{selectedScript.title}</h2>
                <span className="inline-block mt-2 px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs font-black uppercase tracking-wider rounded-md">
                  {selectedScript.format}
                </span>
              </div>
              <button 
                onClick={() => setSelectedScript(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8">
              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Por que funciona</h3>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedScript.why_it_works}</p>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Ganchos (Hooks)</h3>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 whitespace-pre-wrap text-slate-800">
                  {selectedScript.hooks}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Roteiro de Cenas</h3>
                <div className="space-y-3">
                  {selectedScript.scenes.split('\n\n').map((scene, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                      <p className="text-slate-700">{scene}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Legenda</h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm">
                    {selectedScript.caption}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">CTA</h3>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-emerald-800 font-medium text-sm">
                    {selectedScript.cta}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
