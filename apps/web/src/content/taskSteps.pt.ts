/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// Portuguese suggested starter steps (i18n Phase 2b). Loaded lazily
// via content/bundles/pt.ts — never import this statically from
// app code.
export const TASK_STEPS_PT: Record<string, readonly (readonly string[])[]> = {
  "community-fridge": [
    [
      "Anote três lojas, igrejas ou clínicas por perto com uma parede externa coberta",
      "Visite a favorita e peça dez minutos com a pessoa dona ou responsável",
      "Conversem sem rodeios sobre a conta de luz, as bagunças e para quem ligar se quebrar",
      "Verifique se a tomada é externa, tipo GFCI, e se continua ligada de noite",
      "Resuma o acordo num e-mail curto e consiga o sim por escrito"
    ],
    [
      "Publique agora mesmo um pedido de geladeira funcionando num grupo local",
      "Combine com alguém de caminhonete e um carrinho de carga para o dia de buscar",
      "Ligue a geladeira doada e deixe rodar um dia inteiro antes de construir qualquer coisa",
      "Desenhe um abrigo simples que deixe um palmo de folga atrás para ventilar",
      "Monte o abrigo, fixe a geladeira para não tombar e ligue tudo no espaço anfitrião"
    ],
    [
      "Rascunhe o cartaz no bloco de notas: pegue o que precisar, deixe o que puder, e os nãos",
      "Reescreva cada não com a razão de segurança ao lado, soando a cuidado, não a bronca",
      "Peça a duas pessoas vizinhas para traduzir o cartaz para os idiomas da sua rua",
      "Imprima, plastifique e cole na altura dos olhos",
      "Prenda dentro uma caneta e etiquetas em branco para datar os itens"
    ],
    [
      "Mande mensagem a três possíveis voluntários pedindo um turno semanal de 15 minutos",
      "Monte uma agenda compartilhada com dois nomes por turno, não um",
      "Deixe um balde com material de limpeza junto à geladeira",
      "Cole por dentro da porta um registro de limpeza com datas",
      "Preencha os últimos turnos vazios antes de abrir, mesmo que precise insistir"
    ],
    [
      "Liste as padarias, mercados e restaurantes a uma caminhada de distância",
      "Visite um num horário calmo e pergunte pelo que sobra no fim do dia",
      "Se a responsabilidade legal preocupar, conte das proteções para quem doa",
      "Combinem um horário fixo de coleta semanal e coloque na sua agenda",
      "Anote quais fontes realmente cumprem a cada semana"
    ],
    [
      "Mande uma mensagem no grupo perguntando quem topa dividir o contato de problemas",
      "Crie um número compartilhado gratuito tipo Google Voice, nunca o telefone de uma pessoa só",
      "Combinem em quanto tempo alguém responde e quem cobre as férias",
      "Escreva o número numa etiqueta à prova d'água e cole na geladeira"
    ]
  ],
  "community-garden": [
    [
      "Tire uma foto do terreno que você tem em mente na próxima vez que passar",
      "Procure o dono nos registros da prefeitura, ou bata na porta e pergunte",
      "Peça uma licença escrita de um ano, mesmo que seja um bilhete curto assinado",
      "Deixe no acordo quem paga a água e com quanto aviso podem retomar o terreno",
      "Bata nas portas ao lado do lote e pergunte o que achariam de uma horta"
    ],
    [
      "Procure a análise de solo do serviço de extensão local e peça o kit",
      "Colha amostras de vários pontos, principalmente perto de muros velhos e cercas",
      "Envie o kit semanas antes do mutirão, porque o resultado demora",
      "Enquanto espera, desenhe no papel os canteiros, os caminhos e o canto de ferramentas",
      "Se aparecer chumbo, planeje canteiros elevados com terra limpa comprada"
    ],
    [
      "Publique num grupo local um pedido de madeira sem tratamento, composto e cobertura morta",
      "Recuse dormentes e madeira tratada velha; use cedro, bloco ou fardos de palha",
      "Marque a data do mutirão de construção e convide as pessoas",
      "Deixe materiais e ferramentas no local desde a véspera",
      "Levante os canteiros com o grupo e instale a mangueira ou os barris de chuva"
    ],
    [
      "Escreva ao grupo para marcar uma conversa de 30 minutos sobre como compartilhar",
      "Na reunião, ponham as três opções no papel: canteiros, comunitária ou mistura",
      "Decidam também o que acontece com um canteiro se alguém sumir no meio da temporada",
      "Anotem a decisão e como os acordos são tomados, e compartilhem com todo o grupo"
    ],
    [
      "Procure agora mesmo a data da última geada local e anote",
      "Escolha cinco culturas fáceis para a sua região: folhas, feijão, abóbora, tomate, ervas",
      "Trace uma ordem de plantio com duas semanas entre levas para escalonar as colheitas",
      "Plante a primeira leva depois da geada e etiquete cada fileira"
    ],
    [
      "Crie uma agenda compartilhada e coloque seu próprio nome no primeiro turno",
      "Preencha primeiro julho e agosto: é aí que as escalas caem",
      "Peça a cada pessoa constante um turno curto por semana, não mais",
      "Acrescente o lembrete de regar de madrugada, não ao meio-dia",
      "Ligue cada turno a um lembrete no telefone"
    ],
    [
      "Coloque o primeiro dia de colheita na agenda compartilhada",
      "Pergunte à geladeira comunitária ou a uma banquinha se recebem excedente no mesmo dia",
      "Crie um lembrete duas vezes por semana para colher vagem, pepino e abobrinha",
      "Separe um envelope etiquetado com sementes guardadas para o próximo ano"
    ]
  ],
  "tool-lending-library": [
    [
      "Mande mensagem a uma amizade com garagem ou galpão perguntando se cederia o espaço",
      "Visite o lugar e confira se é seco, tem fechadura e dá para chegar sem escadas",
      "Pergunte ao anfitrião como uma caixa de devolução resolveria fora do horário",
      "Combine com o anfitrião de 2 a 4 horas fixas por semana e anote"
    ],
    [
      "Publique no chat do bairro uma mensagem com as cinco ferramentas que vocês mais querem",
      "Prepare três caixas rotuladas: fica, consertar e descartar",
      "Ligue e teste cada ferramenta elétrica sob carga; descarte a que travar",
      "Confira cabos descascados e proteções de lâmina antes de guardar qualquer ferramenta"
    ],
    [
      "Abra uma planilha em branco e digite cinco colunas: número, item, estado, custo, foto",
      "Numere dez ferramentas com fita ou caneta e fotografe cada uma ao lado do número",
      "Pesquise o custo de reposição de cada ferramenta e registre na linha dela",
      "Marque cada ferramenta com o nome da biblioteca para ninguém duvidar de quem é"
    ],
    [
      "Procure na internet as regras de outra biblioteca de ferramentas como ponto de partida",
      "Rascunhe em dez linhas o prazo, o limite de itens e uma política gentil de atrasos",
      "Acrescente ao cadastro uma linha curta de uso por conta e risco de quem pega",
      "Anote as duas ou três ferramentas caras que pedem caução ou orientação de segurança",
      "Peça a alguém que pretenda pegar emprestado para ler o rascunho e marcar o confuso"
    ],
    [
      "Ache uma prancheta e prenda uma caneta nela: esse é o balcão de empréstimo",
      "Faça uma folha de saída (nome, telefone, número, datas) e imprima dez cópias",
      "Mande mensagem na hora a cada pessoa nova para confirmar que o número funciona",
      "Fotografe o estado de cada ferramenta antes de ela sair pela porta"
    ],
    [
      "Escreva às suas duas pessoas voluntárias para marcar uma hora de treino esta semana",
      "Escreva uma folha de consulta: passos do empréstimo, catálogo e segurança básica",
      "Ensaiem recusar com gentileza uma doação quebrada e anotar danos sem acusar",
      "Mostre onde ficam o kit de primeiros socorros e os óculos de proteção",
      "Observe cada pessoa fazer um empréstimo de teste do começo ao fim"
    ],
    [
      "Cole no balcão uma folha em branco para anotar cada pedido que não puder atender",
      "Agende agora mesmo uma data mensal para afiar e lubrificar",
      "Revise as devoluções da semana e separe o que estiver danificado na caixa de conserto",
      "Repasse a lista de desejos todo mês e escolha a próxima ferramenta a somar"
    ]
  ],
  "neighborhood-care-network": [
    [
      "Mande mensagem a uma pessoa-ponte — pastor, zelador, alguém da clínica — e pergunte quem pode estar isolado",
      "Comece uma lista em papel na sua casa; nada de planilhas compartilhadas nem grupos",
      "Peça a dois vizinhos de confiança que apresentem você em vez de bater portas a frio",
      "Visite em pessoa uma administração de prédio ou grupo de fé e deixe seu número",
      "Formule cada convite como oferta — uma ligação semanal? — nunca apontando ninguém"
    ],
    [
      "Escreva a três amizades confiáveis: conseguem se comprometer com um contato semanal?",
      "Rascunhe uma chamada curta que diga o compromisso sem rodeios",
      "Peça duas referências a quem for fazer visitas em casa",
      "Separe uma hora e ligue de verdade para cada referência — não só as arquive",
      "Deixe a regra clara desde o início: ninguém cuida sozinho do dinheiro nem das chaves de um vizinho"
    ],
    [
      "Abra sua lista e anote o idioma, a rua e as preferências de cada pessoa voluntária",
      "Ligue para cada vizinho e pergunte o que gostaria de verdade: ligação, carona ou conversa",
      "Forme o primeiro par por proximidade e idioma, e anote suas razões",
      "Diga às duas pessoas que é um teste que qualquer uma pode encerrar sem explicações"
    ],
    [
      "Escreva ao primeiro par e pergunte que dia e horário servem para ambos",
      "Fixe cada contato no mesmo dia e horário para uma falta saltar aos olhos",
      "Redija um roteiro de três linhas e envie a cada pessoa voluntária",
      "Guarde os horários de todos os pares num só lugar que a coordenação consulte"
    ],
    [
      "Pergunte hoje a um vizinho quem ele gostaria que fosse chamado se um dia não atendesse",
      "Registre o contato de crise de cada vizinho — e se prefere evitar a polícia",
      "Escreva uma página: sem resposta → tentar de novo, ligar para o contato, quando acionar mais ajuda",
      "Imprima cópias para cada pessoa voluntária em vez de deixar o plano num telefone só"
    ],
    [
      "Escreva a alguém do voluntariado e pergunte que necessidades se repetiram na última visita",
      "Comece uma lista corrente de necessidades: caronas, remédios, tirar a neve",
      "Ligue cada necessidade a uma pessoa voluntária ou projeto irmão e confirme a entrega",
      "Encaminhe o que for clínico — remédios, curativos, erguer alguém — a profissionais, com carinho"
    ],
    [
      "Mande a todo o voluntariado duas datas possíveis para uma conversa de desabafo",
      "Reserve um lugar confortável e coloque a conversa na agenda de todo mundo",
      "Fale em particular com cada pessoa voluntária antes do encontro em grupo",
      "Reveze já quem parecer sobrecarregado, antes que precise desistir"
    ]
  ],
  "emergency-preparedness": [
    [
      "Abra os mapas oficiais de enchente e incêndio da sua região e capture seus quarteirões",
      "Caminhe pela sua rua e anote prédios com uma saída só e andares altos sem elevador",
      "Bata nas portas e pergunte quem depende de energia para oxigênio ou remédios refrigerados",
      "Marque tudo num mapa de papel: riscos numa cor, pessoas para checar em outra"
    ],
    [
      "Escreva primeiro a linha da sua própria casa: nome, telefone, endereço, necessidades",
      "Bata em dez portas com uma folha na mão e peça contatos com consentimento",
      "Peça a uma pessoa constante por quarteirão que capitaneie uns dez lares",
      "Imprima a lista, marque quem precisa de batida na porta e guarde cópias em duas casas"
    ],
    [
      "Mande mensagem a dois vizinhos para escolher um ponto de encontro acessível a pé",
      "Escolham os sinais sem cobertura: batidas na porta, um canal de rádio e hora fixa",
      "Leve os rádios até as pontas da vizinhança e teste na distância real",
      "Imprima o plano de uma página e entregue de porta em porta"
    ],
    [
      "Comece o kit agora mesmo: ponha uma lanterna e pilhas extras numa caixa rotulada",
      "Liste o que falta — água, primeiros socorros, rádio de manivela, cobertores — e dividam as compras",
      "Guarde a caixa onde duas ou três pessoas alcancem sem depender de uma chave só",
      "Cole uma data de rodízio na tampa e coloque no calendário do grupo"
    ],
    [
      "Anote de memória três lugares candidatos: um salão, uma igreja, uma praça com sombra",
      "Visite cada um e pergunte pela chave às 2 da manhã, o combustível e o acesso de cadeira de rodas",
      "Consiga cada sim por escrito com o nome e o telefone do anfitrião",
      "Acrescente os lugares confirmados ao plano impresso"
    ],
    [
      "Peça por mensagem ao anfitrião do ponto seguro uma noite no mês que vem",
      "Prepare três estações práticas: mochilas, registros de gás e água e a corrente de contatos",
      "Convide em pessoa os vizinhos que mais precisam praticar",
      "Durante o simulado, cronometre a corrente de contatos e anote onde ela quebra"
    ],
    [
      "Liste os papéis numa folha: checagens médicas, abrir o ponto seguro, coordenar",
      "Ligue para cada pessoa e consiga um sim de viva voz para o papel específico dela",
      "Nomeie uma reserva para cada papel, começando pelas checagens das pessoas vulneráveis",
      "Agende duas revisões por ano e grampeie a folha de papéis na lista de contatos"
    ]
  ],
  "free-store": [
    [
      "Escreva a dois lugares com espaço — um salão paroquial, um centro comunitário — e pergunte por uma data",
      "Visite a melhor opção e confira se é térreo e dá para encostar um carro",
      "Decidam em equipe: troca de um dia, evento recorrente ou loja fixa",
      "Reserve a mesma data recorrente antes de sair do prédio"
    ],
    [
      "Copie a lista de sim e não de uma loja gratuita ou de segunda mão como rascunho",
      "Acrescente cadeirinhas de carro usadas, capacetes e colchões ao lado do \"não\"",
      "Peça à equipe um ok rápido para a lista final",
      "Faça duas cópias em letra grande: uma para a porta de doações, outra para dentro"
    ],
    [
      "Anote numa folha os nomes das suas estações: recepção, triagem, exposição",
      "Pergunte ao anfitrião que mesas e caixas empresta, e rotule uma como \"seguir adiante\"",
      "Desenhe o fluxo do salão para as doações serem conferidas na porta, não nas mesas",
      "Consiga duas pessoas para a triagem da primeira hora, quando a pilha é maior"
    ],
    [
      "Peça no grupo cabides sobrando e uma arara de roupas",
      "Pendure as roupas por tamanho e prenda um cartão de tamanho em cada seção da arara",
      "Agrupe os artigos de casa por tipo em mesas separadas",
      "Exponha menos do que tem e deixe uma caixa de reposição embaixo de cada mesa"
    ],
    [
      "Mande ao grupo a data e três papéis: receber gente, separar doações e arrumar o salão",
      "Oriente quem recebe: nunca perguntar por que alguém veio nem quanto leva",
      "Publique a lista de turnos para cada pessoa saber sua hora e sua estação",
      "Percorra o salão no meio do evento e mande reforço aonde parecer revirado"
    ],
    [
      "Ligue para uma organização parceira ou recicladora têxtil e pergunte o que aceita de verdade",
      "Confirme o horário dela para o dia seguinte ao seu evento",
      "Deixe combinada uma pessoa com porta-malas grande antes de abrir",
      "Retire tudo no mesmo dia para o anfitrião receber o espaço de volta vazio"
    ]
  ],
  "skill-share": [
    [
      "Anote as duas perguntas no bloco de notas: o que você poderia ensinar, o que quer aprender",
      "Troque \"você é especialista em quê?\" por \"para que sempre pedem sua ajuda?\"",
      "Pergunte hoje às três primeiras pessoas — em pessoa, por mensagem, o que for mais rápido",
      "Passe cada resposta para um formulário ou planilha simples no caminho",
      "Circule as coincidências — esse é o seu primeiro programa"
    ],
    [
      "Escreva a uma pessoa que poderia ensinar e convide para um café esta semana",
      "Diga que uma sessão é uma conversa com as mãos ocupadas, não uma palestra",
      "Planejem juntos os primeiros cinco minutos, minuto a minuto",
      "Listem os materiais necessários e quem leva cada um",
      "Ofereça alguém para coapresentar a quem estreia e ainda parece nervoso"
    ],
    [
      "Liste três espaços gratuitos para perguntar: biblioteca, centro comunitário, uma sala",
      "Escreva a cada um perguntando por noites e fins de semana livres",
      "Percorra o espaço e confira se serve às sessões — aula de cozinha precisa de pia",
      "Pergunte exatamente quem abre e quem fecha, e anote",
      "Reserve o mesmo horário recorrente para aparecer virar costume"
    ],
    [
      "Abra uma planilha e liste cada sessão confirmada: data, tema, quem ensina, o que levar",
      "Publique a agenda onde as pessoas já olham, não num lugar novo",
      "Mantenha a inscrição de porta aberta ou de um toque, nada mais pesado",
      "Crie um lembrete semanal para confirmar em pessoa quem ensina na próxima"
    ],
    [
      "Anote três pessoas que você esperava ver e ainda não vieram",
      "Pergunte a cada uma diretamente o que tornaria possível vir",
      "Resolva a barreira concreta que mais ouvir: horário, crianças, idioma ou ônibus",
      "Teste uma sessão em outro horário ou com cuidado das crianças e compare o público"
    ]
  ],
  "bulk-buying-coop": [
    [
      "Escreva a três vizinhos: que tal juntar um pedido no atacado para baratear o mercado?",
      "Anote cada lar interessado e os itens básicos que ele mais compra",
      "Recrute um quinto a mais de lares do que precisa — alguns pulam a cada ciclo",
      "Marque uma reunião de mesa de cozinha para combinar o ciclo de compra"
    ],
    [
      "Pesquise atacadistas de alimentos perto de você e anote três telefones",
      "Ligue para o primeiro e peça o catálogo e o pedido mínimo",
      "Pergunte a cada um pela política de faltas e se o preço trava no pedido ou na entrega",
      "Pergunte a um clube de compras próximo que fornecedor usa e por quê",
      "Compare os três em mínimos, entrega e itens básicos numa tabela rápida"
    ],
    [
      "Abra uma planilha com as colunas: item, preço unitário, lar, quantidade",
      "Compartilhe o link no grupo com a data de fechamento na mensagem",
      "Peça pelo nome a uma pessoa para coordenar este ciclo",
      "No fechamento, copie a planilha e trave as edições antes de somar o pedido"
    ],
    [
      "Abra um livro-caixa compartilhado e ponha as datas deste ciclo no título",
      "Avise o grupo: o pagamento chega antes de o pedido sair, sem exceção",
      "Calcule cada item por unidade até o centavo e arredonde para cima, não para baixo",
      "Registre cada pagamento no livro-caixa no momento em que chegar"
    ],
    [
      "Escreva a alguém com garagem ou entrada para perguntar sobre o dia da entrega",
      "Ligue para o fornecedor e pergunte como o caminhão descarrega: plataforma, palete ou calçada?",
      "Combine três pessoas para a descarga, com data e hora marcadas",
      "Prepare o espaço na véspera: chão livre, mesas dobráveis e passagem para o carrinho"
    ],
    [
      "Imprima a lista de pedido de cada lar antes de alguém chegar",
      "Monte uma estação por item a granel com balança, concha e sacolas",
      "Zere a balança com cada recipiente e pese direto na sacola do lar",
      "Peça a uma segunda pessoa para conferir cada lista antes da retirada"
    ],
    [
      "Crie uma nota chamada 'lista do ciclo' e anote as três primeiras coisas que você fez",
      "Pergunte na retirada quem coordena o próximo ciclo e anote o nome",
      "Passe a lista e o acesso à planilha numa conversa só",
      "Somem cinco minutos a cada retirada para revisar preços e cumprimento do fornecedor"
    ]
  ],
  "repair-cafe": [
    [
      "Mande mensagem para a vizinha que costura e o amigo que mexe com eletrônicos",
      "Faça uma lista de lacunas: quais categorias de conserto ainda estão sem ninguém",
      "Consiga duas pessoas de eletrônica ou eletrodomésticos, não uma — a fila delas é a maior",
      "Pergunte a cada sim que ferramentas traria e que datas servem"
    ],
    [
      "Desenhe a sala no papel e marque cada tomada e janela",
      "Dê a cada estação uma mesa, uma luminária e as ferramentas que quem conserta pediu",
      "Coloque solda e baterias perto da ventilação, longe do público",
      "Teste cada filtro de linha em casa antes de ligar na rede do local",
      "Cole uma etiqueta grande em cada estação para as pessoas se acharem sozinhas"
    ],
    [
      "Mande para quem conserta duas datas possíveis e veja qual junta mais sims",
      "Escolha um dia fixo do mês — o primeiro sábado, por exemplo — e não uma data variável",
      "Reserve o local para as próximas três sessões num pedido só"
    ],
    [
      "Peça a alguém acolhedor para receber as pessoas na primeira sessão",
      "Prepare uma ficha de meia página: nome, objeto e o que ele tem",
      "Acrescente uma linha de triagem: provável conserto, difícil, ou precisa de peça",
      "Escreva na ficha “cada pessoa acompanha seu conserto” e diga isso na porta"
    ],
    [
      "Coloque um kit de primeiros socorros na bolsa que vai para o local",
      "Faça uma placa de entrada: consertos são tentados, nunca garantidos",
      "Escreva os nãos firmes: nada de aparelho de tomada aberto nem bateria estufada",
      "Diga a quem conserta que um não por dúvida é a decisão certa, e dê respaldo"
    ],
    [
      "Peça a cada pessoa que conserta as três coisas que sempre acabam",
      "Faça uma compra só: linha, fusíveis, cola, parafusos, câmaras e remendos",
      "Coloque uma caixa comum e uma folha de contagem em cada estação",
      "Confira as contagens depois de cada sessão e reponha antes da próxima"
    ]
  ],
  "rides-transportation": [
    [
      "Mande mensagem para duas pessoas que dirigem e pergunte se topam uma carona por mês",
      "Sente com cada sim e veja a habilitação e o comprovante do seguro originais",
      "Fotografe os dois documentos para o arquivo — “tenho seguro” não é registro",
      "Faça verificação de referências antes de alguém levar uma pessoa vulnerável",
      "Anote o veículo de cada pessoa, os assentos e se cabe uma cadeira de rodas"
    ],
    [
      "Escreva para a seguradora de uma pessoa perguntando se cobre dirigir como voluntária",
      "Consiga a resposta de cada seguradora por escrito antes da primeira carona",
      "Peça a um serviço de assistência jurídica que revise um termo simples",
      "Arquive cada confirmação escrita junto com as fotos da habilitação da pessoa"
    ],
    [
      "Escolha o único canal dos pedidos e anote o número ou o link",
      "Rascunhe as perguntas de entrada: horário de saída, locais e contato",
      "Pergunte sempre, desde o início, pela volta e por cadeiras de rodas ou andadores",
      "Defina uma antecedência — 48 horas, por exemplo — e publique onde o canal circula",
      "Rode um pedido de teste pelo fluxo inteiro antes de estrear"
    ],
    [
      "Peça a mais uma pessoa para revezar com você as semanas de coordenação",
      "Combine cada pedido com alguém que dirige e deixe uma reserva para cancelamentos",
      "Confirme com quem dirige e quem viaja na véspera, de viva voz ou por escrito",
      "Distribua os pedidos pela lista inteira, não só entre os dois de confiança"
    ],
    [
      "Liste as viagens que entram: médicas, mercado, tarefas essenciais",
      "Desenhe a área de atendimento num mapa e escolha ruas de limite reais",
      "Escreva igualmente claro os nãos: sem emergências, sem última hora, sem sair do mapa",
      "Combinem normas de espera e de carregar sacolas para todo mundo responder igual"
    ],
    [
      "Pergunte a quem dirige quanto custa a gasolina numa viagem típica",
      "Escolham um modelo: fundo comum pequeno, contribuições opcionais ou nada",
      "Deixem o dinheiro fora do carro — qualquer contribuição acontece em outro lugar, discreta",
      "Escreva a política numa frase e compartilhe com quem dirige e quem viaja"
    ],
    [
      "Crie já o registro de caronas: data, quem dirigiu, quem viajou, destino, feito",
      "Escreva as normas: não entrar sozinho nas casas, nada de dinheiro fora do combinado",
      "Acompanhe a primeira carona de cada motorista com alguém conhecido ou outra pessoa",
      "Fale com as pessoas vulneráveis depois de cada carona e anote o que destoar"
    ]
  ],
  "tenant-union": [
    [
      "Anote cinco inquilinas ou inquilinos em quem a vizinhança já confia",
      "Pergunte a si quem sabe guardar segredo — risque quem gerar dúvida",
      "Convide cada um para um café a sós, não para uma reunião em grupo",
      "Na conversa, pergunte o que gostaria que o sindicato conquistasse primeiro",
      "Feche propondo um ritmo de reuniões e um papel para cada pessoa"
    ],
    [
      "Imprima ou desenhe um mapa do quarteirão e marque os prédios com queixas",
      "Escolha um prédio e bata em dez portas com alguém junto nesta semana",
      "Pergunte o que está quebrado, o que dá medo e a quem a vizinhança recorre",
      "Peça permissão antes de anotar a história de qualquer pessoa",
      "Codifique as unidades nas suas notas e guarde a chave dos nomes separada"
    ],
    [
      "Procure a página oficial de direitos de quem aluga na sua cidade e guarde o link",
      "Liste os números que importam: prazos de aviso, tempos de conserto, regras de caução",
      "Escreva a lei e a data da conferência ao lado de cada informação",
      "Escreva a um serviço de assistência jurídica pedindo que confira seu rascunho",
      "Carimbe cada página com “informação, não orientação jurídica”"
    ],
    [
      "Crie agora o grupo de mensagens ou a lista da corrente telefônica com o comitê",
      "Decidam quem responde primeiro e quem é a reserva, com nomes",
      "Combinem uma promessa de resposta que dê para cumprir — duas horas, por exemplo",
      "Façam um simulado: mande um alerta de teste e cronometre as respostas",
      "Corrija o que o simulado revelou antes de divulgar o número"
    ],
    [
      "Escreva ao contato de assistência jurídica pedindo alguém que apresente e duas datas",
      "Reserve uma sala de fácil acesso para quem mora ali e marque a data",
      "Imprima guias para levar para casa nos idiomas dos seus prédios",
      "Prepare o fechamento: o prazo da Justiça e o número para ligar, ditos duas vezes",
      "Convide pelas lideranças de cada prédio, não só com panfletos"
    ],
    [
      "Abra uma página em branco com o título “Se chegar uma notificação de despejo”",
      "Coloque primeiro, em negrito, o prazo para responder à Justiça",
      "Liste os passos em ordem: documente tudo, ligue para a assistência jurídica, avise o sindicato",
      "Acrescente “nunca falte a uma audiência” como linha própria",
      "Peça ao contato jurídico para ler antes de qualquer outra pessoa"
    ],
    [
      "Comece uma lista de advogadas de inquilinos, serviços jurídicos e orientação de moradia",
      "Ligue para cada um e peça um contato com nome, horários de atendimento e capacidade real",
      "Anote quem atende emergências e quem tem lista de espera",
      "Deixe a folha de contatos onde todo o comitê possa pegar",
      "Crie um lembrete para conferir a folha de novo a cada três meses"
    ]
  ],
  "childcare-collective": [
    [
      "Mande mensagem para duas famílias de confiança: que tal trocar cuidado em vez de pagar?",
      "Marque uma noite numa sala de estar, com lanche e data firme",
      "Na reunião, peça a cada família para dizer em voz alta suas regras de disciplina e telas",
      "Feche a reunião com uma decisão: cooperativa de créditos ou cuidado em grupo com horário",
      "Escreva o modelo num parágrafo e envie para todo mundo naquela mesma noite"
    ],
    [
      "Escreva a regra de nunca a sós no alto de uma folha em branco antes da reunião",
      "Liste o que pedirão a cada pessoa cuidadora: referências e verificações cabíveis",
      "Combinem a proporção de adultos por criança segundo a idade e anotem os números",
      "Digam juntos, em voz alta: a regra pesa mais com as famílias mais próximas",
      "Peça a cada família fundadora para assinar ou responder “de acordo” à lista final"
    ],
    [
      "Mande mensagem para a família com a sala mais provável e peça para visitá-la juntos",
      "Fique de joelhos e percorra o cômodo na altura de uma criança, anotando cada perigo",
      "Compre ou peça emprestado protetores de tomada, travas de armário e cintas de móveis",
      "Tranque remédios e produtos de limpeza num armário alto e teste a trava",
      "Percorra a área externa e anote portões, vãos e riscos com água"
    ],
    [
      "Abra um calendário compartilhado no telefone e adicione um primeiro turno de teste",
      "Faça uma planilha de créditos com uma linha por família: horas dadas, horas recebidas",
      "Compartilhe a planilha para cada família ver todos os saldos desde o primeiro dia",
      "Registre quem recebe em casa a cada turno, para a carga se manter visivelmente justa"
    ],
    [
      "Abra um documento com quatro títulos: alergias, remédios, contatos, quem busca",
      "Preencha uma linha por título e envie o formulário com prazo de uma semana",
      "Coloque as fichas preenchidas numa pasta chamativa que quem cuida pegue em segundos",
      "Escreva já a regra da criança doente — febre, vômito, manchas na pele — antes que uma manhã difícil a teste",
      "Escreva os passos de emergência em três linhas e cole dentro da pasta"
    ],
    [
      "Mande mensagem ao grupo para achar uma data em que todas as pessoas cuidadoras possam",
      "Procure um curso próximo de primeiros socorros pediátricos e RCP e compartilhe o link",
      "Repassem supervisão, sono seguro e alergias com os formulários reais na mão",
      "Ensaiem a emergência em voz alta: quem liga, quem fica com as crianças, onde estão as fichas"
    ],
    [
      "Escreva para duas ou três famílias e marque um piloto de duas horas numa data concreta",
      "Mantenha o piloto pequeno: poucas crianças, dois adultos e todas as regras valendo",
      "Depois, pergunte às crianças como foi, não só às famílias",
      "Conversem com honestidade sobre os quase-acidentes e listem o que arrumar",
      "Marque a data da próxima sessão só depois de os ajustes estarem combinados"
    ]
  ],
  "community-composting": [
    [
      "Mande mensagem para quem coordena a horta comunitária perguntando por um canto livre",
      "Fique de pé em cada ponto candidato e ache a torneira e a janela vizinha mais próximas",
      "Bata nas portas mais próximas e fale de cheiro e ratos antes de a dúvida crescer",
      "Consiga a permissão por escrito e confira as regras locais de compostagem"
    ],
    [
      "Escreva para alguém que já manteve uma pilha quente e pergunte o que escolheria aqui",
      "Estime os restos semanais em baldes: casas vezes mais ou menos um baldinho cada",
      "Confira a regra do metro cúbico: sem esse volume a pilha fica fria e não anda",
      "Ajuste o método a quanto revirar vocês dão conta e anote a escolha"
    ],
    [
      "Pergunte no grupo quem tem paletes sobrando, um forcado ou um termômetro de composto",
      "Estoque material marrom já — folhas em sacos ou papelão aberto — antes do primeiro resto",
      "Construa ou compre a estrutura e monte no ponto combinado",
      "Faça uma única compra do que faltar: termômetro, forcado, balde de entrega"
    ],
    [
      "Escreva para cinco casas prováveis perguntando que dia de entrega serve para elas",
      "Distribua baldinhos de pia com o calendário de entrega colado em cada tampa",
      "Avise que nada de sacos compostáveis — sobrevivem à pilha virando fiapos de plástico",
      "Publique os horários de entrega no balde e no grupo de mensagens"
    ],
    [
      "Rascunhe no papel a lista do sim e do não: frutas e café sim; carne, laticínios e óleos não",
      "Ache ou desenhe uma imagem para cada item — um osso de frango riscado vale mais que um texto",
      "Imprima à prova d'água e cole na própria tampa do balde, não num poste ao lado",
      "Peça a duas pessoas que falam os outros idiomas do bairro para conferir o texto"
    ],
    [
      "Peça a três pessoas confiáveis, pelo nome, um turno de revirada por mês",
      "Façam uma sessão prática: revirem a pilha juntos e ensine o teste da esponja torcida",
      "Coloque um nome em cada semana do calendário — “o grupo” é o mesmo que ninguém",
      "Pendure um registro plastificado no local: data, temperatura, umidade, quem revirou"
    ],
    [
      "Avise a horta comunitária que um lote está quase pronto e pergunte quanto usariam",
      "Deixe o lote curar umas semanas a mais e peneire os pedaços antes de prometer data",
      "Anuncie um dia de retirada para quem contribuiu: cada um traz seus baldes ou sacos",
      "Guarde uma foto da pilha pronta para a próxima rodada de convites"
    ]
  ],
  "free-little-library": [
    [
      "Procure no seu grupo de doações ou no marketplace um armário ou caixa de jornal de graça",
      "Desenhe a caixa no papel: teto inclinado, porta transparente e aba sob a porta contra chuva",
      "Junte os materiais e construa, vedando a base e cada emenda",
      "Jogue água de mangueira por um minuto e conserte por onde entrar"
    ],
    [
      "Mande mensagem para a pessoa do quintal ou muro que você tem em mente e pergunte se topa",
      "Fique no ponto e confira se cadeira de rodas ou carrinho ainda passam na calçada",
      "Pergunte por licenças ou regras do condomínio se não for terreno particular",
      "Instale o poste ou suporte e sacuda a caixa com força para confirmar que está firme"
    ],
    [
      "Publique uma mensagem no grupo pedindo livros em bom estado, principalmente infantis",
      "Deixe uma caixa identificada na sua porta ou no ponto anfitrião e dê uma semana",
      "Tire tudo que estiver manchado, mofado ou defasado antes de chegar à prateleira",
      "Organize uma mistura até a metade, com os infantis bem à frente"
    ],
    [
      "Escreva “Leve um livro, deixe um livro — tudo de graça” num rascunho de papel",
      "Acrescente uma linha dando boas-vindas a todas as idades e idiomas",
      "Leia em voz alta e corte tudo que soar como obrigação",
      "Faça a placa final e fixe do lado de dentro da porta, onde a chuva não alcança"
    ],
    [
      "Mande mensagem para quem mora mais perto da caixa e peça cinco minutos por semana",
      "Encontre a pessoa na caixa uma vez e façam juntos uma arrumação rápida",
      "Combine o que sai na hora: qualquer coisa mofada e títulos adultos ao alcance de crianças",
      "Peça a uma segunda pessoa para ser suplente nas férias e semanas de doença"
    ]
  ],
  "community-first-aid-training": [
    [
      "Procure o telefone da Cruz Vermelha da sua região e guarde nos contatos",
      "Ligue perguntando por uma turma e se abrem mão da taxa para grupos comunitários",
      "Pergunte o limite de estudantes por boneco e o que precisam do espaço anfitrião",
      "Contate um grupo de redução de danos ou a secretaria de saúde sobre treino de overdose",
      "Anote num lugar só as datas que cada instrutor oferece"
    ],
    [
      "Mande mensagem perguntando se quem instrui traz os próprios bonecos de RCP",
      "Escreva para a secretaria de saúde perguntando por distribuição gratuita de naloxona",
      "Cote kits básicos de primeiros socorros com dois fornecedores e escolha um",
      "No dia em que a naloxona chegar, anote a validade e guarde em lugar fechado, em temperatura ambiente"
    ],
    [
      "Liste três salas para sondar: biblioteca, centro comunitário, clínica",
      "Visite uma e confira chão livre para ajoelhar, uma pia e uma entrada acessível",
      "Pergunte se dá para reservar o mesmo dia da semana todo mês",
      "Cruze as datas da sala com as de quem instrui e reserve as duas primeiras sessões"
    ],
    [
      "Escreva para duas pessoas que provavelmente iriam e peça que cada uma traga mais uma",
      "Peça a comércios próximos e grupos de apoio a famílias para divulgarem a inscrição",
      "Monte um formulário gratuito de inscrição com dois horários para quem trabalha por turnos",
      "Ofereça cuidado de crianças e comida, e diga isso já no convite",
      "Aceite algumas inscrições a mais e planeje uma mensagem de confirmação na véspera"
    ],
    [
      "Mande mensagem a quem instrui dois dias antes para confirmar horário e número de gente",
      "Chegue uma hora antes para preparar o chão, a folha de presença e a água",
      "Abra dizendo que a prática é nos bonecos e que dá para sair na parte de overdose",
      "Confira que cada participante pratique com as mãos, não só assista",
      "Entregue os cartões de referência na saída"
    ],
    [
      "Conte seus kits e doses de naloxona e anote o número",
      "Entregue um kit a cada pessoa na saída, anotando quem levou naloxona e a validade",
      "Coloque a primeira reciclagem no calendário dentro do ano, antes de o grupo se dispersar",
      "Crie um lembrete um mês antes da primeira validade da naloxona para pedir a reposição"
    ]
  ],
  "time-bank": [
    [
      "Escreva uma lista de dez a quinze pessoas da vizinhança com quem daria para sentar",
      "Mande mensagem hoje para as três primeiras marcando conversas curtas a dois",
      "Em cada conversa, peça uma oferta e insista também em um pedido",
      "Registre cada oferta e pedido numa planilha única enquanto conversa",
      "Continue convidando até a planilha mostrar variedade — caronas, consertos, aulas, cozinha"
    ],
    [
      "Pergunte a quem vai coordenar que ferramenta já usa toda semana",
      "Teste registrar três trocas inventadas numa planilha comum",
      "Experimente um aplicativo de banco de tempo só se a planilha não der conta",
      "Confirme que dá para exportar o registro completo antes de fechar com qualquer opção",
      "Escolha a opção mais simples que passou no teste e anote como ela funciona"
    ],
    [
      "Marque a reunião de regras no calendário e convide os membros fundadores",
      "Escreva a primeira regra no topo: uma hora vale um crédito, sem exceções",
      "Combinem como se pede, se confirma e se registra uma troca",
      "Decidam já o que acontece se alguém sair com saldo negativo ou ficar muito abaixo de zero",
      "Mantenham tudo numa página e leiam em voz alta antes de fechar"
    ],
    [
      "Escolha uma data e mande aos membros um convite curto para a orientação",
      "Prepare dez minutos: a filosofia e depois uma troca registrada ao vivo",
      "Carregue alguns créditos iniciais no saldo de cada membro novo",
      "Antes de alguém sair, peça que agende uma troca real ali mesmo",
      "Depois de uma semana, procure quem ainda não teve a primeira troca"
    ],
    [
      "Abra a planilha de membros e junte todas as ofertas numa lista só",
      "Acrescente colunas de quando e onde cada pessoa está disponível",
      "Escreva para quem estiver sem dias disponíveis ou raio de deslocamento anotados",
      "Publique o diretório onde os membros já olham",
      "Coloque um lembrete mensal no calendário para limpar entradas paradas"
    ],
    [
      "Abra o registro e ache hoje uma necessidade aberta que case com uma oferta",
      "Mande mensagem para os dois membros propondo a troca e se oferecendo para apresentar",
      "Procure quem ganhou e nunca gastou, e escreva para cada pessoa pelo nome",
      "Dê um toque, com uma sugestão concreta, em alguém que entrou e ainda não trocou",
      "Anote quais combinações deram certo para facilitar o mês seguinte"
    ],
    [
      "Rascunhe três normas de segurança: referências, primeiro encontro em público, recusa fácil",
      "Acrescente um jeito de recusar qualquer combinação sem dar explicações",
      "Nomeie uma pessoa — não um formulário — para ouvir as preocupações",
      "Leve as normas à próxima reunião e ajustem em voz alta",
      "Publique as normas finais onde as pessoas se inscrevem"
    ]
  ],
  "solidarity-fund": [
    [
      "Anote as três ou cinco pessoas a quem você confiaria dinheiro em comum",
      "Escreva para cada uma pedindo uma hora de conversa sobre o fundo",
      "Conversem com franqueza sobre pagamentos, transparência e o que fazer quando o dinheiro não der",
      "Combinem que qualquer pessoa sai da decisão quando um amigo ou parente pedir",
      "Mantenham a equipe em número ímpar para os votos não empatarem"
    ],
    [
      "Escreva para uma organização sem fins lucrativos ou contadora pedindo uma conversa curta",
      "Pergunte sobre o lado legal e fiscal antes de abrir qualquer coisa",
      "Abram uma conta dedicada ou usem um patrocinador fiscal — nunca uma conta pessoal",
      "Deixem a regra por escrito: duas assinaturas em cada pagamento",
      "Comece o livro-caixa com colunas de data, valor, finalidade e quem aprovou"
    ],
    [
      "Marque nesta semana uma reunião da equipe para definir critérios",
      "Rascunhe quem pode pedir, os valores típicos e de quanto em quanto tempo",
      "Fixem um teto por pedido e um total mensal que não vão passar",
      "Cortem toda exigência de comprovação da qual der para abrir mão",
      "Escrevam os critérios finais numa página que toda a equipe aprove"
    ],
    [
      "Abra um formulário em branco e ponha só três campos: nome, contato e o que precisa",
      "Acrescente uma pergunta: como você prefere receber o dinheiro",
      "Apague tudo o que cheire a comprovante — sem número de documento, sem carta do dono do imóvel",
      "Habilite também pedidos por telefone e em pessoa, não só pelo formulário",
      "Peça a alguém de fora para testar e dizer onde parece invasivo"
    ],
    [
      "Escreva para cinco membros perguntando se doariam um valor pequeno por mês",
      "Configure a opção de doação recorrente antes de planejar qualquer campanha grande",
      "Escreva a frase para quem doa: o dinheiro vai direto a vizinhos em crise",
      "Anuncie o fundo onde os membros já conversam e peça para compartilharem",
      "Registre cada compromisso no livro-caixa para a equipe prever o próximo mês"
    ],
    [
      "Mande para a equipe uma proposta de prazo — por exemplo, decidir em 48 horas",
      "Definam um valor pequeno que duas pessoas aprovem no mesmo dia, sem reunião",
      "Listem os meios mais rápidos: dinheiro vivo, transferência ou pagar a conta direto",
      "Escrevam numa página os passos: quem lê, quem assina, quem paga",
      "Registrem cada decisão numa linha: data, valor e as duas pessoas que aprovaram"
    ],
    [
      "Abra o livro-caixa e anote os três números do mês: entradas, saídas, vizinhos apoiados",
      "Rascunhe um resumo de três linhas só com números — sem anedotas, nunca",
      "Releia conferindo que nada possa identificar quem recebeu",
      "Publique onde doadores e membros já olham",
      "Repita na mesma data todo mês para as pessoas aprenderem a esperar por ele"
    ]
  ],
  "diaper-hygiene-bank": [
    [
      "Escreva para alguém de uma clínica, igreja ou banco de alimentos e pergunte se sobra um armário",
      "Visite os dois lugares mais promissores e confira umidade, pragas e uma porta que tranca",
      "Fique onde as famílias pegariam os pacotes e confira que não dá para ver da sala de espera",
      "Consiga por escrito qual armário ou prateleira é de vocês e quem guarda a chave"
    ],
    [
      "Pesquise “banco de fraldas” junto com a sua região e anote o contato mais próximo",
      "Escreva para a rede ou um atacadista perguntando o preço de caixa dos tamanhos 4, 5 e 6",
      "Liste três possíveis sedes de campanha — escola, academia, trabalho — e escreva para uma hoje",
      "Comece uma folha simples: fonte, o que doa e o quanto tem sido constante"
    ],
    [
      "Pegue um marcador e rotule uma prateleira ou caixa por tamanho antes de mexer nas caixas",
      "Divida cada caixa em pacotes prontos para entregar enquanto guarda, não depois na porta",
      "Conte o que há em cada prateleira e anote os totais por tamanho numa folha",
      "Circule os dois tamanhos mais em falta e passe os números a quem cuida do abastecimento"
    ],
    [
      "Ligue para um banco de fraldas próximo e pergunte que cota mensal por criança definiram",
      "Rascunhe uma frase: quantas por criança, com que frequência, e nunca pedir comprovante",
      "Leia para duas pessoas voluntárias e para uma mãe ou pai e ajuste o que soar a prova",
      "Publique o número honesto onde as famílias vejam, para ninguém precisar perguntar"
    ],
    [
      "Pergunte por mensagem à sede que dia e horário fixos funcionam todo mês",
      "Escreva para três possíveis voluntárias com a data fixa e peça um sim de sempre",
      "Repasse com a equipe a única regra: entregar o pacote sem fazer perguntas",
      "Crie um lembrete para confirmar quem ajuda dois dias antes de cada entrega"
    ]
  ],
  "community-bike-workshop": [
    [
      "Escreva para três pessoas que possam emprestar garagem, porão ou um canto sem uso",
      "Percorra cada opção e meça a parede para pendurar bicicletas na vertical",
      "Confira as fechaduras e pergunte como o espaço fica trancado à noite",
      "Antes do sim, acerte com quem cede o espaço a guarda, os horários de acesso e o seguro"
    ],
    [
      "Pergunte no grupo quem tem ferramentas de bicicleta paradas numa gaveta",
      "Pergunte numa loja de bicicletas se doariam ferramentas usadas ou vendem um cavalete",
      "Liste o que falta no kit — espátulas, chaves de cone, alicate de cabos — e cote o preço",
      "Pendure um painel perfurado e trace o contorno de cada ferramenta para ver qual falta"
    ],
    [
      "Anote no telefone o não firme: nada de bicicleta de supermercado enferrujada",
      "Redija uma chamada curta com esse não logo no início, mais dia e endereço de entrega",
      "Publique em dois canais do bairro",
      "Faça a triagem de cada bicicleta na chegada: dá conserto, para peças ou pronta para rodar",
      "Desmonte logo as de peças e organize as peças por tipo para achá-las fácil"
    ],
    [
      "Escreva para as duas pessoas que melhor consertam bicicletas e peça um turno a cada uma",
      "Peça a cada uma que guie você num remendo de pneu sem encostar na roda",
      "Escolha quem deixa a pessoa nova penar: essa paciência é o trabalho inteiro",
      "Ponha o nome de cada mecânica ou mecânico num turno concreto do calendário"
    ],
    [
      "Faça uma enquete no grupo sobre os dois horários semanais que servem a mais gente",
      "Escreva os horários na porta e publique toda semana nos mesmos canais",
      "Desenhe o combinado do ganhe-sua-bicicleta num cartão: sessões, habilidades, bicicleta",
      "Faça um cartão furável por aprendiz para qualquer pessoa da mecânica ler o progresso"
    ],
    [
      "Ponha numa bolsa um kit de primeiros socorros e dois óculos de proteção para a oficina",
      "Escreva as regras num cartaz: óculos, cabelo preso, perguntar antes da furadeira",
      "Faça um cartão de saída com linha assinada para freios, pneus e direção de cada bicicleta",
      "Peça que essa revisão final seja assinada por alguém que não montou a bicicleta"
    ]
  ],
  "newcomer-translation-network": [
    [
      "Escreva para duas pessoas bilíngues que você conhece e pergunte se ajudariam a interpretar",
      "Anote os três idiomas que você mais escuta nas escolas e lojas da região",
      "Peça a uma professora de ESL ou líder de congregação que espalhe o convite",
      "Peça a cada pessoa que passe uma frase médica nos dois sentidos antes de somá-la",
      "Registre cada sim com idioma, dialeto e disponibilidade num só lugar"
    ],
    [
      "Abra uma nota e liste os cinco serviços que você já conhece pelo nome",
      "Ligue hoje para uma clínica e pergunte que idiomas atendem de verdade",
      "Anote em cada entrada se pedem documento ou situação migratória",
      "Pergunte a uma organização de migrantes que lugares recomenda e quais evitar",
      "Reúna endereços, horários e um contato de cada lugar num diretório único"
    ],
    [
      "Escreva para uma pessoa voluntária e pergunte se atenderia os pedidos num mês de teste",
      "Prepare uma única linha telefônica ou formulário onde caia todo pedido",
      "Limite a ficha a primeiro nome, idioma, necessidade e um número de retorno",
      "Conecte cada pedido por idioma e necessidade, e confirme com os dois lados",
      "Peça a um amigo um pedido de teste e acompanhe o fluxo inteiro"
    ],
    [
      "Anote as cinco perguntas que as pessoas recém-chegadas mais fazem a você",
      "Rascunhe uma página em linguagem simples do tema principal, com mais imagens que texto",
      "Peça a alguém nativo de cada comunidade que leia o rascunho em voz alta antes de imprimir",
      "Imprima um primeiro lote pequeno, distribua e corrija o que confundir"
    ],
    [
      "Pergunte a uma pessoa recém-chegada com consulta marcada se quer companhia",
      "Conecte por idioma e confirme hora e ponto de encontro com os dois lados",
      "Prepare quem acompanha: interpretar em primeira pessoa, sem acrescentar nem aconselhar",
      "Converse com os dois lados depois e anote o que fazer diferente na próxima"
    ],
    [
      "Escreva uma linha no alto da ficha: nunca se pergunta a situação migratória",
      "Risque do formulário cada campo sem o qual daria para trabalhar igual",
      "Decida quanto tempo os registros vivem e agende o dia de apagá-los",
      "Escreva sua resposta a um pedido de registros: o que guarda e o que nunca recolhe",
      "Repasse as regras com cada pessoa voluntária antes do primeiro pedido"
    ]
  ],
  "community-meal": [
    [
      "Anote três salões com cozinha: uma igreja, um centro comunitário, uma escola",
      "Ligue ou escreva para um deles pedindo uma visita",
      "Na visita, confira pia separada para as mãos, água quente e espaço de geladeira",
      "Confirme que o salão está livre nos dias que vocês planejam",
      "Consiga o sim por escrito, nem que seja um e-mail curto"
    ],
    [
      "Procure o telefone da vigilância sanitária local e anote",
      "Ligue e pergunte especificamente pelas isenções para refeições beneficentes",
      "Inscreva-se já no curso de manipulação de alimentos — ele lota semanas antes",
      "Escreva as regras de temperatura e armazenamento onde toda a equipe veja"
    ],
    [
      "Escreva para um mercado ou restaurante conhecido e pergunte se doariam",
      "Visite mais dois fornecedores em pessoa num horário tranquilo",
      "Combine com cada doador um dia e uma quantidade concretos, não “o que sobrar”",
      "Pergunte à horta comunitária ou ao grupo de coleta que excedente podem mandar",
      "Mantenha uma lista de quem dá o quê e quando, e atualize depois de cada refeição"
    ],
    [
      "Confira sua lista de fontes e anote o que a doação da semana inclui de verdade",
      "Escolha um prato principal naturalmente vegetariano, sem castanhas nem frutos do mar",
      "Escale a receita no papel e liste as quantidades a comprar ou pedir",
      "Escreva os rótulos de alérgenos de cada prato antes do dia de cozinhar"
    ],
    [
      "Escreva para cinco pessoas e peça a cada uma um papel: preparar, cozinhar, servir ou limpar",
      "Acrescente a cada turno duas pessoas além do que ele precisa a rigor",
      "Nomeie quem lidera a primeira refeição e uma segunda pessoa para se formar desde já",
      "Compartilhe a escala e confirme com todo mundo dois dias antes da refeição"
    ],
    [
      "Pergunte a três pessoas que viriam comer que dia e horário funcionam",
      "Escolha um dia e horário que deem para sustentar por um ano, não os mais ambiciosos",
      "Faça um panfleto simples e acolhedor: dia, hora, lugar, grátis, todo mundo bem-vindo",
      "Deixe panfletos em abrigos, lavanderias e mercadinhos de esquina",
      "Peça a quem recebe e às parcerias que espalhem de boca em boca"
    ],
    [
      "Escreva para a equipe na véspera para confirmar turnos e horários de chegada",
      "Pendure na cozinha o plano do dia: quem prepara, cozinha, serve e limpa",
      "Sirva à mesa onde der, em vez de formar fila",
      "Passe as sobras para recipientes rasos e para a geladeira em até duas horas",
      "Deixe a cozinha pronta para inspeção e anote o que estiver acabando"
    ]
  ],
  "seed-library": [
    [
      "Procure o e-mail ou telefone da biblioteca e anote o nome de quem a dirige",
      "Envie uma mensagem perguntando se receberiam um pequeno armário de sementes",
      "Visite e escolha um canto longe de janelas, paredes externas e aquecimento",
      "Leve uma caixa de envelopes pequenos e um marcador para deixar junto ao armário"
    ],
    [
      "Escreva para alguém experiente na horta e pergunte que variedades vão bem por aí",
      "Escreva para um viveiro próximo e uma horta comunitária pedindo sobras de temporada",
      "Publique um único pedido de sementes onde os membros já olham",
      "Separe as doações na chegada, tirando semente tratada colorida e híbridos"
    ],
    [
      "Pegue a caixa de doações e separe os envelopes em hortaliças, ervas e flores",
      "Escreva bem grande o nome da planta e o ano em cada envelope",
      "Marque com uma cor as variedades fáceis, para quem começa se servir sozinho",
      "Arrume cada seção com a semente mais velha na frente",
      "Acrescente uma nota curta de cultivo às variedades mais exigentes"
    ],
    [
      "Abra uma folha e escreva as três regras: pegue de graça, cultive, devolva se puder",
      "Acrescente um limite de uns dois envelopes por variedade por pessoa",
      "Apresente a devolução como um presente bem-vindo, nunca uma obrigação",
      "Imprima a folha e cole por dentro da porta do armário"
    ],
    [
      "Escolha um dia desta semana para visitar o armário e anote na agenda",
      "Retire todos os envelopes com mais de dois anos",
      "Teste os lotes duvidosos: dez sementes numa toalha de papel úmida por uma semana",
      "Retire qualquer lote em que brotem menos de seis",
      "Anote as três variedades mais vazias e escreva a quem doa pedindo reposição"
    ]
  ],
  "digital-literacy": [
    [
      "Publique um pedido de notebooks e tablets parados num grupo em que você já está",
      "Na retirada, veja quem doa sair da conta iCloud ou Google antes de o aparelho ir embora",
      "Separe uma caixa de “funciona” e outra de “peças” e classifique cada aparelho na chegada",
      "Apague, atualize e teste um aparelho de ponta a ponta antes de seguir com o resto"
    ],
    [
      "Abra uma planilha em branco e crie cinco colunas: quem, aparelho, série, estado, prazo",
      "Numere cada dispositivo e o carregador como um conjunto só, com etiquetas iguais",
      "Escreva em duas frases a duração do empréstimo e uma política de atraso sem bronca",
      "Faça um empréstimo de mentira com alguém da equipe para achar o que falta na ficha"
    ],
    [
      "Procure a página de empréstimo de pontos de acesso da sua biblioteca e anote o que há",
      "Ligue para duas operadoras ou um programa de baixo custo e pergunte o limite real de dados",
      "Imprima meia página com os pontos de WiFi grátis perto de onde as pessoas moram",
      "Teste um ponto de acesso com uma videochamada de dez minutos antes de emprestá-lo"
    ],
    [
      "Escreva para duas amizades pacientes e pergunte se sentariam com alguém uma vez por mês",
      "Anote três regras num cartão: quem aprende comanda, sem jargão, mãos longe do mouse",
      "Faça a simulação: cada pessoa guia uma tarefa inteira sem tocar no aparelho",
      "Junte cada nova pessoa que ensina a alguém real e acompanhe a primeira sessão"
    ],
    [
      "Escreva para uma futura aluna e pergunte a única coisa que ela mais quer fazer na internet",
      "Escolha os quatro temas principais e dê a cada um a própria página — uma habilidade por página",
      "Capture as telas exatas que vão aparecer e cole bem grandes em cada página",
      "Entregue um rascunho a alguém que aprende e observe onde o dedo hesita"
    ],
    [
      "Peça por mensagem ao espaço anfitrião dois horários semanais: um de dia, um à noite",
      "Limite as inscrições a seis por aula para ninguém esperar calado no fundo",
      "Consiga uma segunda pessoa para circular na ajuda livre e pegar os casos espinhosos",
      "Ponha a agenda em panfletos de papel nos lugares aonde essas pessoas já vão"
    ],
    [
      "Procure os passos de restauração de fábrica dos seus dois modelos mais comuns",
      "Cole uma lista na mesa de devolução: guardar primeiro as fotos, depois apagar tudo",
      "Escreva num parágrafo o plano para perdas e danos que mantenha a porta aberta",
      "Acrescente cinco minutos de conversa sobre senhas e privacidade a cada entrega"
    ]
  ],
  "weatherization-brigade": [
    [
      "Escreva para as três pessoas mais habilidosas que você conhece e peça um mutirão por mês",
      "Publique o convite nos murais da loja de material de construção e da madeireira",
      "Pergunte a cada pessoa que serviços ela já fez de verdade, não quais saberia fazer",
      "Junte cada pessoa nova a alguém experiente num primeiro serviço tranquilo"
    ],
    [
      "Convide suas duas lideranças mais experientes para uma conversa de uma hora sobre o alcance",
      "Listem os serviços que vocês pegam: calafetagem, vedação, barras de apoio, arrumações menores",
      "Escrevam a lista de parar e encaminhar: eletricidade, gás, telhado, estrutura",
      "Somem a tinta com chumbo e o isolamento velho para casas anteriores a 1978",
      "Imprimam as duas listas numa página para cada integrante da equipe"
    ],
    [
      "Escolha o número de telefone que vai receber os pedidos e confirme com a equipe",
      "Faça um formulário em papel e deixe cópias no banco de alimentos e no centro de idosos",
      "Rascunhe uma lista de visita de uma página: alcance, materiais e limites de segurança",
      "Agende as avaliações em duplas — duas pessoas percorrem cada casa",
      "Fotografe tudo na visita e diga que confirmará o plano depois, não na porta"
    ],
    [
      "Pegue a lista de materiais da última avaliação e some as quantidades",
      "Peça à loja de material de construção um desconto ou doação para a brigada",
      "Compre selantes de baixo odor e baixo COV para casas habitadas",
      "Rotule uma caixa de ferramentas compartilhada e liste o conteúdo na tampa"
    ],
    [
      "Escreva para a seguradora ou uma organização local sobre cobertura de consertos voluntários",
      "Consiga por escrito que a apólice cobre o conserto domiciliar voluntário",
      "Rascunhe um termo simples e imprima cópias para quem mora e para quem vai ajudar",
      "Confira o kit de primeiros socorros e fixe a regra da escada: alguém segura, nunca o último degrau"
    ],
    [
      "Escolha um sábado e combine dois ou três serviços já avaliados com as equipes",
      "Ligue para cada casa na semana anterior para acertar o plano e a hora de chegada",
      "Ligue de novo na manhã do dia, para ninguém se assustar com a equipe",
      "Leve água, sacos de lixo e material de limpeza, para a visita não custar nada à casa",
      "Percorra o trabalho pronto com quem mora antes de a equipe ir embora"
    ]
  ],
  "pet-food-bank": [
    [
      "Mande uma mensagem a quem coordena a despensa sobre dividir espaço e dia de entrega",
      "Percorra o espaço e confira se é seco, sem pragas e com chave",
      "Pesquise preços de recipientes vedados e uma prateleira ou palete para erguer a ração do chão",
      "Confirme o ponto de entrega e os horários com quem cede o espaço"
    ],
    [
      "Ligue para uma loja de animais e pergunte o que fazem com sacos rasgados ou danificados",
      "Mande um pedido curto de doação a mais duas lojas e a uma clínica veterinária",
      "Marque um dia de coleta mensal com todo mundo que disser sim",
      "Comece um registro simples do que entra por semana para enxergar as lacunas"
    ],
    [
      "Pegue um marcador e etiquete três recipientes: cachorro, gato, outros",
      "Confira a validade de cada saco e retire o que estiver vencido",
      "Separe as rações veterinárias e de prescrição em um recipiente próprio e etiquetado",
      "Conte cada recipiente e deixe os totais à vista da equipe"
    ],
    [
      "Escreva para uma pessoa amiga com animais e pergunte quanta ração ela gasta por mês",
      "Defina porções por número e porte dos animais, não um saco igual para todos",
      "Fixe uma frequência com que as pessoas possam contar — mesma quantidade, mesmo calendário",
      "Escreva a política em um parágrafo, sem exigência de comprovação de necessidade"
    ],
    [
      "Mande mensagem a duas pessoas voluntárias perguntando que dia fixo elas podem cobrir",
      "Fixe o mesmo dia e horário todo mês para que as pessoas possam contar com você",
      "Antes de cada sessão, confira se tem ração de cachorro e de gato na mesa",
      "Combine com a equipe: nenhum comentário sobre as escolhas de ninguém — só entregar a ração"
    ]
  ],
  "youth-mentorship": [
    [
      "Escreva para a escola, a biblioteca e o centro comunitário perguntando por uma sala",
      "Visite a melhor opção e confira saídas, banheiros e espaço para se mexer",
      "Peça por escrito a mesma sala para o período inteiro, não mês a mês",
      "Defina o horário semanal e compartilhe com as famílias antes de abrir"
    ],
    [
      "Baixe como modelo uma política de proteção infantil de um programa estabelecido",
      "Escreva o requisito de verificação de antecedentes: ninguém começa sem passar",
      "Detalhe a regra de dois adultos para banheiros, caronas e reforço individual",
      "Procure a lei local de notificação obrigatória e anote os passos a seguir",
      "Peça que cada adulto assine a política antes da primeira sessão"
    ],
    [
      "Peça a dois grupos comunitários de confiança que indiquem um adulto confiável cada",
      "Em cada entrevista, pergunte direto: consegue vir toda semana, o período todo?",
      "Inicie a verificação de antecedentes no dia em que a pessoa disser sim",
      "Faça uma formação sobre limites, segurança e ajudar sem fazer a lição pelos outros"
    ],
    [
      "Pergunte a três crianças o que elas realmente gostariam de fazer depois da aula",
      "Desenhe o ritmo fixo numa folha: lanche, depois lições, depois atividade",
      "Planeje as duas primeiras semanas com as ideias que as crianças citaram",
      "Deixe um espaço por semana que a própria juventude programa"
    ],
    [
      "Anote no telefone o que o formulário precisa: autorização, alergias, contatos, quem busca",
      "Redija o formulário de inscrição de uma página a partir dessa lista",
      "Entregue às famílias em pessoa e ajude a preencher na hora quem precisar",
      "Deixe as alergias graves à vista da equipe na hora do lanche, não numa pasta",
      "Confirme quem pode buscar cada criança e guarde os formulários trancados"
    ],
    [
      "Mande mensagem a um mercado ou padaria perguntando por uma doação semanal de lanche",
      "Monte a lista de compras sem amendoim e castanhas por padrão",
      "Etiquete qualquer doação cujos ingredientes você não puder garantir",
      "Publique no chat da comunidade um pedido de livros, material de arte e jogos"
    ],
    [
      "Ponha um alarme no telefone para chegar antes da primeira criança",
      "Deixe a folha de presença e o lanche prontos antes de abrir as portas",
      "Conte as crianças na chegada e antes de alguém sair; anote quem buscou quem",
      "Diga uma coisa boa e concreta aos responsáveis na hora da saída",
      "Anote duas linhas ao fechar: o que funcionou e que criança precisa de atenção"
    ]
  ],
  "gleaning-network": [
    [
      "Anote de memória cinco fontes próximas: sítios, pomares, barracas, árvores carregadas",
      "Visite ou ligue para as duas mais prováveis e pergunte que excedente fica sem colher",
      "Pergunte a cada produtor o que NÃO tocar e por onde a equipe pode estacionar e andar",
      "Anote cada sim com cultura, época aproximada e um telefone de contato"
    ],
    [
      "Pergunte no chat do grupo quem conseguiria largar tudo numa manhã de dia útil",
      "Peça a cada sim a disponibilidade real, não as boas intenções",
      "Mantenha a lista de sins firmes com telefone — três confiáveis valem mais que dez talvez",
      "Faça um chamado de teste e veja quem responde de verdade dentro de uma hora"
    ],
    [
      "Mande mensagem a duas amizades com caminhonete ou porta-malas grande sobre dias úteis",
      "Peça a uma igreja, restaurante ou mercadinho um canto fresco para guardar por um dia",
      "Junte mais caixas do que parece necessário — uma árvore pode dar centenas de quilos",
      "Escreva o plano num cartão: quem dirige, onde a comida espera, quem leva adiante"
    ],
    [
      "Crie agora o chat de chamado e adicione a equipe confirmada",
      "Escreva um aviso modelo: cultura, endereço, janela de horário, o que levar",
      "Combinem que só valem os sins por escrito — uma resposta, não um joinha",
      "Mande um aviso de teste e cronometre quanto três pessoas levam para confirmar"
    ],
    [
      "Procure a lei do tipo “Bom Samaritano” sobre doação de alimentos na sua região",
      "Peça emprestado um modelo de termo de responsabilidade a uma rede de resgate estabelecida",
      "Escreva com os produtores a lista do proibido: nada do chão para folhas, nada podre",
      "Imprima os termos e as regras de manuseio para a pasta do dia de resgate"
    ],
    [
      "Mande mensagem a uma geladeira, despensa ou refeitório e pergunte o que conseguem escoar",
      "Pergunte a cada destino a capacidade e o horário de entrega, e anote os dois",
      "Combine colheitas grandes com destinos grandes — uma despensa pequena não absorve 90 quilos",
      "Confirme em cada destino uma pessoa com nome que atenda no dia da colheita"
    ],
    [
      "Coloque hoje uma balança de banheiro ou de gancho no kit do dia de resgate",
      "Percorra o lugar com o produtor primeiro e marque o que fica fora dos limites",
      "Pese a colheita no campo antes de dividir — depois é impossível reconstruir",
      "Entregue em poucas horas e mande a cada produtor os quilos com um agradecimento"
    ]
  ],
  "community-mediation": [
    [
      "Procure o centro de mediação comunitária mais próximo e anote o contato",
      "Ligue e pergunte sobre opções de formação ou de parceria",
      "Escreva uma lista curta de pessoas serenas e justas a quem você confiaria uma disputa",
      "Convide cada uma em pessoa; procure quem fica neutro mesmo discordando por dentro",
      "Reserve as datas da formação e confirme quem está comprometido"
    ],
    [
      "Anote duas opções de ponto único de contato: um e-mail compartilhado ou um número de recados",
      "Configure a opção escolhida e mande uma mensagem de teste para você",
      "Redija cinco perguntas de acolhimento, uma que revele medo ou desequilíbrio de poder",
      "Escreva no alto da ficha de acolhimento: “cada lado em separado, nunca juntos”",
      "Decida quem atende os pedidos e em quanto tempo responde"
    ],
    [
      "Escreva para a biblioteca perguntando por uma sala de reunião tranquila",
      "Visite e confira se há duas saídas e nenhum canto para alguém ficar rondando",
      "Confirme que fica em terreno de ninguém — nem a igreja nem o prédio de um dos lados",
      "Deixe uma segunda opção reservada para a agenda nunca forçar uma sala ruim"
    ],
    [
      "Escreva uma frase nas suas notas: o que aceitamos e o que encaminhamos",
      "Liste as disputas que vocês aceitam: barulho, espaços compartilhados, conflitos menores",
      "Nomeie o que vocês não tocam: qualquer situação com violência, abuso ou perigo",
      "Monte já a lista de encaminhamentos: violência doméstica, apoio jurídico, linha de crise",
      "Compartilhe o alcance escrito com toda a equipe de mediação e acolhimento"
    ],
    [
      "Rascunhe as regras básicas como cinco linhas simples no aplicativo de notas",
      "Combine com a equipe o que fazer se alguém revelar uma ameaça ou abuso infantil em sessão",
      "Redija a promessa de confidencialidade com esse limite, para nunca prometer demais",
      "Dê a ela o formato de uma folha única que as partes leem antes de começar"
    ],
    [
      "Mande mensagem a um síndico conhecido: já existe mediação de vizinhança gratuita",
      "Liste onde as disputas aparecem — condomínios, síndicos, setor de habitação — e visite",
      "Faça um cartaz pequeno que diga gratuito, voluntário e confidencial",
      "Peça às organizações parceiras que passem seu contato aos dois lados de um conflito"
    ],
    [
      "Abra uma nota com três contagens: aceitos, encaminhados, resolvidos — nunca nomes",
      "Atualize logo depois de cada caso fechado",
      "Converse com a equipe depois de cada caso difícil, não só uma vez por mês",
      "Alterne os casos para ninguém carregar os pesados um atrás do outro",
      "Marque uma conversa mensal fixa com cada pessoa mediadora, mesmo quando tudo parece bem"
    ]
  ],
  "reentry-support": [
    [
      "Anote cinco serviços que você já conhece: documentos, abrigo, setor de benefícios",
      "Ligue para cada um e confirme que segue ativo e aceita pessoas com antecedentes",
      "Anote um contato com nome em cada lugar, não só o número da recepção",
      "Pergunte a uma organização de reinserção quais empregadores de segunda chance cumprem",
      "Acrescente uma data de “verificado pela última vez” a cada linha do diretório"
    ],
    [
      "Escreva para duas pessoas constantes e sem julgamentos a quem confiaria uma história difícil",
      "Em cada conversa, repare em quem chega para salvar — você quer companhia, não salvadores",
      "Peça a uma organização de reinserção uma formação informada pelo trauma para a equipe",
      "Repasse a confidencialidade com cada voluntário antes do primeiro encontro"
    ],
    [
      "Escreva sua pergunta de abertura num cartão: “Do que você mais precisa agora?”",
      "Limite a ficha a uma página — nome, três necessidades principais e melhor contato",
      "Ensaie a conversa uma vez com uma pessoa voluntária no outro papel",
      "Combinem que os antecedentes só entram na conversa se a própria pessoa tocar no assunto"
    ],
    [
      "Ligue para uma organização parceira e pergunte se recebem correspondência para quem vocês apoiam",
      "Escreva a ordem no papel: endereço, certidão de nascimento, identidade, depois benefícios",
      "Reúna numa pasta os formulários reais da sua região e o valor de cada taxa",
      "Acompanhe cada pessoa no primeiro pedido em vez de só entregar o papel"
    ],
    [
      "Mande mensagem a um empregador de segunda chance para confirmar se ainda contrata neste mês",
      "Ajude a montar um currículo de uma página que abra com habilidades e trabalho recente",
      "Ensaiem juntos, em voz alta, a pergunta dos antecedentes antes de qualquer entrevista",
      "Faça cada apresentação ser calorosa — uma ligação para alguém com nome, não um link de vaga",
      "Converse depois de cada entrevista ou visita e registre como foi"
    ],
    [
      "Pergunte a uma pessoa que já viveu a reinserção se toparia dar mentoria",
      "Forme dupla de cada mentor com uma pessoa só, não com uma carteira de casos",
      "Marque um encontro mensal em que os próprios mentores recebem apoio",
      "Combinem o que cada mentor cuida e quando passa o assunto a voluntários ou profissionais"
    ],
    [
      "Abra um documento e escreva a primeira regra: nada se compartilha sem o sim da pessoa",
      "Liste exatamente quem pode ver os antecedentes e feche o acesso para o resto",
      "Decidam o que vocês simplesmente não escrevem em lugar nenhum",
      "Encaminhe toda dúvida legal ao contato jurídico com nome, nunca ao chat do grupo",
      "Leia as regras em voz alta com as pessoas voluntárias antes de começar"
    ]
  ],
  "community-wood-bank": [
    [
      "Ligue para um serviço de poda local e pergunte para onde a madeira deles vai hoje",
      "Anote outras pistas: limpeza pós-tempestade, a prefeitura, terrenos com árvores caídas",
      "Visite a melhor pista e olhe a madeira — espécie, tamanho, o quanto está verde",
      "Consiga permissão por escrito dizendo o que pode levar e por onde passa a divisa"
    ],
    [
      "Anote três quintais possíveis: o terreno de uma igreja, um canto de sítio, a área de um membro",
      "Peça a cada dono uma visita ainda esta semana",
      "Meça espaço para dois anos de lenha — a pilha seca deste inverno e a do próximo secando",
      "Na visita, confira acesso de caminhonete, tolerância dos vizinhos ao barulho e drenagem",
      "Consiga um sim por escrito cobrindo barulho de serra, horários e tempo de empilhamento"
    ],
    [
      "Escreva a lista: rachador, duas motosserras e proteção completa por operador",
      "Publique um único pedido de empréstimo ou doação para membros e grupos rurais locais",
      "Orce perneiras e proteção de olhos e ouvidos para cada operador — nada de dividir",
      "Peça a alguém que entende de serras inspecionar cada ferramenta doada antes de aceitar",
      "Monte um kit de primeiros socorros e deixe tudo junto num ponto etiquetado do local"
    ],
    [
      "Mande mensagem a membros e vizinhos perguntando quem tem experiência real com motosserra",
      "Nomeie uma pessoa experiente como responsável de segurança, com a palavra final",
      "Pergunte ao serviço de extensão rural ou a um serrador por um curso básico de motosserra",
      "Divida a equipe: operadores treinados nas serras, o resto empilha e carrega",
      "Escreva a conversa de segurança de cinco minutos para antes de cada mutirão"
    ],
    [
      "Pergunte no chat do grupo que número de telefone pode receber os pedidos de lenha",
      "Na hora do pedido, pergunte onde a lenha vai ficar e se há caminho livre e seco",
      "Liste os membros com caminhonete e combine com cada um um dia de entrega",
      "Ligue para o serviço de assistência para aquecimento e peça que repassem seu número",
      "Empilhe você a primeira entrega para medir quanto tempo uma casa leva"
    ],
    [
      "Escreva para duas famílias que usam lenha e pergunte quanto queimam num mês frio",
      "Rascunhe porções em termos reais — cordas ou semanas de calor, não “uma carga”",
      "Escreva quem vem primeiro: idosos, saúde delicada, casas com crianças, sem outro aquecimento",
      "Peça pouco — sem comprovantes nem papelada, só nome, endereço e tipo de fogão",
      "Agende uma conferida no meio do inverno para as famílias que ficaram sem"
    ],
    [
      "Conte para trás a partir de novembro e marque o prazo de primavera para o corte",
      "Ponha os dois primeiros mutirões no calendário e convide a equipe treinada",
      "Comece um registro simples por pilha: data da rachação, tipo de lenha, data em que fica pronta",
      "Marque as pilhas como seca ou verde para ninguém entregar lenha úmida na correria",
      "Crie um lembrete mensal para atualizar o registro e agendar o próximo mutirão"
    ]
  ],
  "community-wifi-mesh": [
    [
      "Imprima ou desenhe um mapa dos quarteirões que vocês querem cobrir",
      "Percorra os quarteirões com o mapa, marcando árvores, muros de tijolo e prédios altos",
      "Bata nas portas e pergunte quem está sem serviço e para que usaria",
      "Marque com estrela os telhados e janelas altas com visada limpa e donos dispostos",
      "Fotografe o mapa marcado e compartilhe com o grupo"
    ],
    [
      "Anote três candidatos com linha sobrando: um comércio, a biblioteca, um provedor parceiro",
      "Escreva ou visite um hoje e pergunte sem rodeios sobre dividir a banda com a vizinhança",
      "Leia você os termos de serviço do plano procurando qualquer proibição de recompartilhar",
      "Consiga o sim da redistribuição por escrito antes de gastar um dólar em equipamento"
    ],
    [
      "Mande mensagem às duas pessoas mais à vontade com redes que você conhece e peça uma hora",
      "Publique um único chamado em grupos locais de tecnologia, maker ou radioamadores",
      "Mire em dois admins com trabalhos e endereços diferentes, mais alguém querendo aprender",
      "Faça um pontapé curto em que cada admin entra por conta própria num roteador de teste"
    ],
    [
      "Publique um pedido de roteadores parados em grupos e chats locais",
      "Liste os nós e antenas que o mapa pede e orce o que as doações não cobrirem",
      "Defina uma senha forte de admin em cada roteador e guarde num gerenciador compartilhado",
      "Configure cada nó numa mesa e etiquete com o local previsto",
      "Teste dois nós em malha ao longo da sua própria rua antes de qualquer telhado"
    ],
    [
      "Mande mensagem aos três pontos mais simpáticos do seu mapa pedindo uma visita",
      "Visite cada um com um nó na mão e confira tomada, ponto de fixação e linhas de visada",
      "Rascunhe um acordo de uma página: acesso ao telhado, dólares de luz, responsabilidade por danos",
      "Assine com cada anfitrião e ofereça cobrir os poucos dólares de luz por mês"
    ],
    [
      "Abra uma página em branco e escreva a regra um: para que a rede serve",
      "Acrescente a promessa de não registrar e uma linha de que rede aberta não é privada",
      "Desligue os registros nas configurações de cada roteador e peça a outro admin conferir",
      "Acrescente uma linha indicando HTTPS e VPN para a segurança de cada pessoa",
      "Publique a página nos locais anfitriões e como página de boas-vindas da rede"
    ],
    [
      "Crie um lembrete mensal no telefone para conferir todos os nós",
      "Etiquete cada nó com o lugar e uma data de conferida",
      "Mantenha um roteador reserva configurado e carregado para a troca levar minutos",
      "Escreva a documentação enquanto monta e peça ao segundo admin segui-la uma vez sem você",
      "Mantenha uma lista de espera de anfitriões e some um nó a cada período estável da rede"
    ]
  ],
  "mental-health-peer-support": [
    [
      "Mande mensagem a duas pessoas acolhedoras e firmes perguntando se topariam facilitar",
      "Procure uma formação próxima em apoio entre pares ou escuta ativa e anote as datas",
      "Pergunte a cada pessoa como lidaria com uma sala em silêncio após um relato difícil",
      "Deixe de fora, com carinho, quem ainda está em carne viva da própria crise — por ora",
      "Reserve a formação e confirme que as duas pessoas podem ir a todos os encontros"
    ],
    [
      "Ponha um cronômetro de 20 minutos e rascunhe o que o círculo não faz",
      "Escreva os limites como proibições: não diagnosticar, não consertar, não substituir terapia",
      "Acrescente três linhas simples sobre o que ele é: escuta, companhia, vivência compartilhada",
      "Leia o rascunho em voz alta para alguém que facilita e corte onde a pessoa tropeçar"
    ],
    [
      "Procure a linha de crise local e a clínica sem agendamento mais próxima; guarde os dois números",
      "Ligue você para cada número, confirme que funciona e anote os horários",
      "Escreva os passos em sessão: pausar o grupo, falar à parte, encaminhar com acolhimento",
      "Imprima uma cópia para quem facilita — na noite em que for preciso, o WiFi pode falhar"
    ],
    [
      "Anote três salas possíveis: a biblioteca, um espaço de fé, um centro comunitário",
      "Visite a melhor e confira se a porta fecha e se não há paredes de vidro",
      "Pergunte a quem recebe vocês quem mais usa o prédio naquele horário",
      "Garanta a mesma sala, no mesmo horário, toda semana — a constância convida a voltar"
    ],
    [
      "Anote as cinco regras que você já sabe que precisa, começando pela confidencialidade",
      "Acrescente o direito de passar a vez e nada de conselhos sem alguém pedir",
      "Peça às duas pessoas facilitadoras que reescrevam o rascunho em palavras mais simples",
      "Imprima grande o bastante para ler em voz alta no começo de cada encontro"
    ],
    [
      "Pergunte por mensagem a quem facilita: que noite de semana consegue segurar seis meses",
      "Pule a sexta à noite e a saída do trabalho — escolha um horário mais gentil",
      "Escreva um convite sem estigma: gratuito, entre pares, sem precisar de diagnóstico",
      "Envie para clínicas, grupos de fé e o mural da comunidade",
      "Decida desde já o teto de umas oito pessoas e o que fazer se chegar mais gente"
    ],
    [
      "Coloque agora no calendário uma conversa mensal com quem facilita",
      "Façam o encontro num lugar que não seja a sala do círculo — um café funciona",
      "Pergunte a cada pessoa facilitadora que momentos dos encontros ficaram com ela",
      "Monte um rodízio para ninguém conduzir três encontros seguidos",
      "Repare em quem nunca falta e nunca descansa — ofereça a essa pessoa a primeira pausa"
    ]
  ],
  "community-cleanup": [
    [
      "Hoje, no caminho de casa, tire uma foto do ponto mais abandonado que você passar",
      "Ande mais dois quarteirões e fotografe cada esquina que precisa de trabalho",
      "Pergunte a duas pessoas vizinhas qual terreno mais incomoda e de quem ele é",
      "Volte aos seus pontos principais em outro horário — manhã e noite contam histórias diferentes",
      "Ordene a lista por impacto e por quão viável é cada local em um dia"
    ],
    [
      "Procure o dono do terreno no cadastro da prefeitura ou pergunte a quem mora há anos ali",
      "Ligue ou escreva ao dono pedindo permissão por escrito, já com a data em mente",
      "Ligue para a prefeitura pedindo uma coleta e anote o número de protocolo que derem",
      "Se a prefeitura não puder, cote uma caçamba e confirme entrega e retirada por escrito"
    ],
    [
      "Pergunte no grupo quem já tem luvas, pegadores e coletes refletivos",
      "Compre um coletor rígido para perfurocortantes e dois pares de luvas reforçadas",
      "Confira sacos e luvas contra a lista de inscritos e complete o que faltar numa ida só",
      "Embale tudo em caixas etiquetadas na véspera, com o coletor rígido por cima"
    ],
    [
      "Publique agora a data, o ponto de encontro e o horário em dois canais do bairro",
      "Mantenha uma lista de inscrições e convoque um terço a mais do que achar necessário",
      "Peça a três pessoas confiáveis para liderar equipes e confirme cada uma pelo nome",
      "Divida o local em zonas num esboço e atribua uma a cada líder antes do dia"
    ],
    [
      "Escreva hoje o cartão de boas-vindas: zonas, líderes, água, nunca pegar agulhas com a mão",
      "Chegue cedo e tire as fotos do antes de um ponto aonde você possa voltar",
      "Leia o cartão para todo mundo e mande cada equipe para sua zona com quem lidera",
      "Percorra as zonas no meio da manhã repondo sacos, água e ânimo",
      "Tire as fotos do depois dos mesmos pontos, compartilhe o par e marque a próxima data"
    ]
  ],
  "free-tax-prep": [
    [
      "Procure as datas da certificação VITA deste ano e onde o treinamento acontece",
      "Pergunte a três possíveis preparadores se conseguem se comprometer com todo o treinamento",
      "Inscreva todo mundo antes de o outono acabar — a certificação leva semanas, não dias",
      "Marque uma sessão de estudo em grupo antes da prova de certificação"
    ],
    [
      "Ache o e-mail da coordenação regional de declaração gratuita e mande duas linhas de apresentação",
      "Marque uma conversa e pergunte o que um posto novo precisa: software, regras, revisão",
      "Anote os prazos deles antes de prometer a alguém uma data de abertura",
      "Devolva a papelada que eles pedem para registrar vocês como posto"
    ],
    [
      "Mande mensagem para dois lugares com salas e wi-fi — uma biblioteca, um centro comunitário",
      "Faça um teste de velocidade no telefone em cada um; o software trava com upload fraco",
      "Conte tomadas e mesas, e veja se as cadeiras ficam afastadas para dar privacidade",
      "Reserve o espaço para a temporada inteira, não semana a semana"
    ],
    [
      "Peça ao programa parceiro a lista padrão de documentos obrigatórios",
      "Escolha um jeito de agendar que funcione por telefone, não só pela internet",
      "Inclua a lista de documentos em cada confirmação e lembrete",
      "Faça você uma marcação de teste e corrija o que confundir"
    ],
    [
      "Escreva uma linha — “Declaração grátis; você pode ter dinheiro a receber” — e teste com alguém",
      "Imprima panfletos com datas, local e a lista de documentos no verso",
      "Entregue panfletos onde os trabalhadores já vão: lavanderias, mercadinhos, pontos de ônibus",
      "Direcione a divulgação a quem acha que ganha pouco demais para declarar"
    ],
    [
      "Liste cada lugar onde os dados podem morar: laptops, pen drives, a pilha de papéis",
      "Escreva a regra de guarda: nada vai para casa, e uma data marcada para triturar",
      "Configure bloqueio de tela e logins separados em cada laptop do posto",
      "Consiga uma caixa com chave para os papéis e uma trituradora para o dia da destruição"
    ],
    [
      "Anote três indicações locais: triagem de benefícios, conta bancária segura, orçamento",
      "Ligue para cada uma para confirmar se estão recebendo gente e como encaminhar alguém",
      "Faça um cartãozinho para levar, oferecido depois da declaração pronta — nunca na mesa",
      "Combine com a equipe a única frase para oferecê-lo, sem discurso de venda"
    ]
  ],
  "community-market": [
    [
      "Liste três fontes possíveis: um produtor local, um mercado, uma horta comunitária",
      "Visite cada uma e pergunte que excedente têm de verdade e em que ritmo",
      "Registre por escrito o dia e o volume aproximado de cada fornecedor, nada de “quando sobrar”",
      "Acrescente uma fonte reserva para uma semana ruim não esvaziar a banca"
    ],
    [
      "Anote dois ou três pontos possíveis por onde a vizinhança já passa a pé",
      "Visite cada um no horário real da banca e conte quem passa",
      "Verifique se há sombra e uma fonte de água por perto",
      "Peça permissão a quem cuida do lugar e garanta a resposta por mensagem ou e-mail",
      "Reúna mesas, um toldo e uma placa simples"
    ],
    [
      "Mande mensagem ao grupo de base marcando uma conversa de 20 minutos para decidir",
      "Conversem sobre gratuito, pague o que puder ou mistura, e o que é nunca recusar ninguém",
      "Se for pague o que puder, combinem uma única caixa sem identificação nem preço sugerido",
      "Escrevam a decisão numa frase que qualquer pessoa possa repetir na mesa"
    ],
    [
      "Mande uma mensagem ao grupo perguntando que caixas térmicas, mesas e gelo já têm",
      "Garanta caixas térmicas e gelo para tudo que for folha ou cortado",
      "Planeje sombra sobre os alimentos: um toldo ou o lado sombreado do terreno",
      "Combine com a equipe o critério de descarte: na dúvida, para a compostagem"
    ],
    [
      "Mande mensagem a três pessoas confiáveis e pergunte que papel toparia cada uma",
      "Preencha primeiro os turnos ingratos: a busca da manhã cedo e a desmontagem",
      "Nomeie um suplente para cada papel, para uma ausência não cancelar a feira",
      "Deixe a escala onde todo mundo veja e confirme dois dias antes de cada banca"
    ],
    [
      "Mande à equipe duas opções de dia e horário e peça uma votação rápida",
      "Faça um panfleto simples com dia, horário, lugar e “grátis, todo mundo é bem-vindo”",
      "Cole onde a vizinhança já passa: lavanderia, ponto de ônibus, mercadinho",
      "Conte pessoalmente aos vizinhos e vizinhas que você conheceu explorando a área",
      "Deixe a banca como evento recorrente no calendário compartilhado, mesmo em semanas fracas"
    ],
    [
      "Antes do dia da banca, combine com uma geladeira comunitária ou banco de alimentos as sobras",
      "Chegue cedo para montar mesas, sombra e caixas térmicas",
      "Receba as pessoas com acolhimento e dispense formulários, perguntas e qualquer triagem",
      "No fechamento, leve o excedente direto ao ponto de entrega combinado",
      "Anote o que acabou e o que sobrou, para o plano da próxima semana"
    ]
  ],
  "welcome-wagon": [
    [
      "Mande mensagem a duas ou três pessoas interessadas para marcar uma conversa esta semana",
      "Escolham juntos o foco: moradores novos, famílias com bebê, ou ambos",
      "Combinem que o primeiro contato é um bilhete ou uma ligação — nunca bater sem avisar",
      "Escreva a oferta em uma linha, à qual dê para dizer sim ou não"
    ],
    [
      "Comece uma lista no telefone: clínica, transporte, escolas, ajuda com comida, seu programa",
      "Ligue ou confira cada item para confirmar horários e endereços atualizados",
      "Escreva a data e um contato de “avise aqui se algo mudar” na primeira página",
      "Peça a alguém bilíngue do bairro para traduzir aos idiomas falados por perto"
    ],
    [
      "Publique um único pedido no chat do bairro por básicos de despensa e artigos de casa",
      "Escolha um lugar e uma data para montar as cinco primeiras cestas",
      "Prefira itens não perecíveis e sem perfume, a menos que conheça a casa",
      "Coloque em cada cesta o kit de informações e um olá escrito à mão"
    ],
    [
      "Mande mensagem às duas pessoas mais acolhedoras que você conhece e convide-as a receber",
      "Reúnam-se por uma hora e ensaiem juntos uma visita à porta",
      "Pratiquem a versão curta: entregar a cesta, dizer um contato e ir embora",
      "Combinem o sinal de “prefere ficar em paz” e respeitem-no"
    ],
    [
      "Liste quem encontra primeiro as pessoas novas: proprietários, escolas, clínicas, parteiras",
      "Visite ou ligue para cada lugar e explique o programa de boas-vindas em dois minutos",
      "Peça que consigam o consentimento da pessoa antes de passar qualquer nome",
      "Faça um formulário simples de adesão e deixe cópias no balcão de cada parceiro"
    ]
  ],
  "library-of-things": [
    [
      "Digite dez itens candidatos no aplicativo de notas: mesas, barraca, lavadora, furadeira",
      "Acrescente uma linha em branco e a pergunta: o que você teria usado no último ano?",
      "Publique a pesquisa no mural e entregue cópias em papel a cinco vizinhos",
      "Some as respostas depois de uma semana e classifique os dez itens mais pedidos"
    ],
    [
      "Mande mensagem à biblioteca pública ou ao centro comunitário perguntando por uma sala",
      "Meça os dois itens mais volumosos da lista — são eles que dimensionam o espaço",
      "Visite a melhor opção com uma trena e meça também a largura da porta",
      "Combine horários de retirada e devolução que o anfitrião sustente, e anote-os"
    ],
    [
      "Publique uma lista de procurados com os dez itens da pesquisa — nada de aceitar tudo",
      "Marque um único dia de entrega e peça aos doadores que tragam cabos, bolsas e peças",
      "Ligue na tomada e teste cada aparelho elétrico antes de ele ganhar prateleira",
      "Confira itens motorizados e infantis na lista de recalls do CPSC",
      "Encaixote as recusas para descarte no mesmo dia, para não acumular"
    ],
    [
      "Numere vinte etiquetas de fita crepe e cole a primeira num item",
      "Fotografe cada item bem ao lado do seu número, com luz decente",
      "Registre número, nome, estado e foto — uma linha de planilha por item",
      "Dê aos acessórios — bolsas, cabos, peças — linhas numeradas próprias"
    ],
    [
      "Liste os cinco itens mais pedidos e estime a velocidade de giro de cada um",
      "Defina prazos por item: um fim de semana para o projetor, uma semana para a lavadora",
      "Escreva uma política de atraso compreensiva — um lembrete amigável, nunca uma taxa",
      "Anote em uma linha quais itens pedem cuidado ou limpeza extras na devolução",
      "Peça a alguém da equipe bibliotecária que leia as regras e corte o que confundir"
    ],
    [
      "Trace uma ficha de saída com quatro colunas: nome, contato, item, data de devolução",
      "Acrescente o passo que todo mundo pula: foto do estado na saída e outra na devolução",
      "Conduza as duas pessoas bibliotecárias por um empréstimo de treino, do começo ao fim",
      "Veja cada uma fazer um empréstimo sozinha antes do dia de abertura"
    ],
    [
      "Cole uma folha de “pedidos que não conseguimos atender” ao lado da ficha de saída",
      "Limpe e inspecione cada devolução no dia em que chega, não em lotes",
      "Fixe uma hora mensal de conserto e deixe o consertável onde você o veja",
      "Compre ou vá atrás do item mais pedido dessa lista — não do seu palpite"
    ]
  ],
  "laundry-shower-access": [
    [
      "Liste três anfitriões possíveis: uma lavanderia, uma academia, um espaço religioso",
      "Ligue para o mais receptivo e peça uma visita de quinze minutos esta semana",
      "Percorra o caminho da espera até a porta do chuveiro — é privado de verdade?",
      "Diga ao anfitrião com clareza quem vai chegar e que limpeza a sua equipe cobre",
      "Confirme os dias e as condições combinados por mensagem ou e-mail depois da visita"
    ],
    [
      "Escreva a lista de necessidades: sabão de roupa, toalhas, sabonete, shampoo, chinelos",
      "Peça tamanho de viagem e sem perfume já no anúncio de doações",
      "Ligue para uma igreja ou loja perguntando se cobrem o primeiro mês",
      "Monte kits de banho com o que chegar — uma sacola por pessoa, pronta para entregar"
    ],
    [
      "Mande mensagem ao anfitrião confirmando quantas máquinas e chuveiros terão por sessão",
      "Faça uma ficha de inscrição em papel que peça só o primeiro nome — ou nada",
      "Decida a regra de vez — ordem de chegada, quem retorna, ou mistura — e deixe à vista",
      "Rode uma sessão inteira no papel antes de tentar algo mais elaborado"
    ],
    [
      "Pergunte ao anfitrião que produtos de limpeza ele exige entre os usos",
      "Cronometre uma limpeza completa de cabine: desinfetar, passar pano, toalha limpa",
      "Inclua esses minutos em cada horário, para ninguém receber uma cabine suja",
      "Escreva a rotina como lista de verificação e cole dentro do armário de suprimentos",
      "Combine com o anfitrião quem repõe os suprimentos e quem cuida do encanamento"
    ],
    [
      "Mande mensagem a três pessoas pacientes e inabaláveis que você poria numa recepção",
      "Acompanhe cada nova pessoa voluntária por uma sessão inteira antes de ficar sozinha",
      "Ensaiem juntos os momentos delicados: alguém alterado, um horário que se alonga",
      "Combinem quem é chamado primeiro — para ninguém ligar em pânico para o anfitrião",
      "Deixe o tom claro: recebemos como um hotel, não como uma clínica"
    ],
    [
      "Pergunte por mensagem ao voluntariado que horários semanais mantêm por seis meses",
      "Monte a agenda pelo que é sustentável, não pelo que impressiona",
      "Imprima cartões simples com horário e lugar — sem falar em papelada",
      "Entregue os cartões a equipes de abordagem, abrigos e vizinhos em situação de rua",
      "Mantenha o horário fixo — uma semana mudada ensina que a porta pode estar fechada"
    ]
  ],
  "voter-registration": [
    [
      "Procure agora mesmo o telefone e o e-mail do seu cartório eleitoral",
      "Ligue e pergunte o que uma campanha de registro pode e não pode fazer na sua região",
      "Anote o prazo exato de entrega e quem pode entregar os formulários legalmente",
      "Pergunte se as pessoas voluntárias precisam de treinamento ou cadastro prévio",
      "Escreva a um grupo apartidário estabelecido pedindo materiais e conselhos"
    ],
    [
      "Mande hoje ao voluntariado duas opções de horário para um treinamento de uma hora",
      "Escreva num cartão a resposta pronta para “em quem devo votar?” para cada pessoa",
      "Repassem juntos um formulário real de registro, campo por campo",
      "Ensaiem uma pergunta política insistente até a resposta neutra sair com naturalidade"
    ],
    [
      "Abra a página oficial do cartório eleitoral e guarde nos favoritos",
      "Imprima prazos, regras de documento e informações de votação direto dessa página",
      "Escreva a data de hoje em cada impressão para as cópias velhas ficarem óbvias",
      "Pegue formulários de registro em branco no próprio cartório eleitoral"
    ],
    [
      "Liste cinco pontos onde a vizinhança já se reúne — feira, transporte, campus",
      "Mande mensagem a quem administra cada ponto pedindo permissão para montar uma mesa",
      "Consiga o sim por escrito, mesmo que seja só um e-mail, antes de agendar um turno",
      "Associe cada ponto confirmado a uma data e um horário no calendário"
    ],
    [
      "Escreva no telefone a lista do kit: formulários, canetas, pranchetas, folhas datadas",
      "Arrume o kit na véspera e deixe ao lado da porta",
      "Nomeie uma pessoa para segurar a pasta lacrada dos formulários o turno inteiro",
      "Releia cada formulário com a pessoa antes de ela sair da mesa",
      "Entregue a pasta ao cartório eleitoral no mesmo dia, bem dentro do prazo"
    ],
    [
      "Procure o link oficial que localiza o local de votação e guarde no telefone",
      "Rascunhe um cartão de bolso: data da eleição, esse link e o prazo do voto pelo correio",
      "Imprima uma pilha e deixe no kit da mesa ao lado dos formulários",
      "Entregue um a cada pessoa registrada e pergunte se vai precisar de carona para votar"
    ]
  ],
  "health-navigation": [
    [
      "Pesquise “clínica gratuita perto de mim” e cole os três primeiros resultados num documento",
      "Ligue para cada uma pedindo a linha direta de acolhimento e as regras de elegibilidade",
      "Acrescente colunas de idiomas, preço ajustado à renda e a data em que verificou cada uma",
      "Crie um lembrete recorrente para reconferir cada entrada antes de ela envelhecer"
    ],
    [
      "Mande mensagem a três pessoas pacientes e organizadas perguntando se topariam navegar",
      "Escreva o limite em uma linha: logística e papelada sim, conselho médico nunca",
      "Ensaie as palavras exatas: “não sou da área médica — vou conectar você à enfermagem”",
      "Simule com cada nova pessoa navegadora uma ligação de alguém assustado"
    ],
    [
      "Pergunte no chat da equipe quem empresta um número de telefone para este mês",
      "Configure a caixa postal com uma saudação calorosa nos idiomas que vocês atendem",
      "Acrescente uma opção presencial: horário fixo numa biblioteca ou centro comunitário",
      "Decida o que nunca será anotado — diagnósticos, situação migratória — antes de começar"
    ],
    [
      "Veja hoje se o período de inscrição aberta está valendo na sua região",
      "Imprima a lista de documentos: comprovante de renda, tamanho da família, identidade",
      "Reúna os documentos com cada pessoa antes de abrir o pedido dela",
      "Encontre alguém certificado em inscrições para acompanhar o seu primeiro caso"
    ],
    [
      "Guarde agora mesmo o contato do programa de caronas no seu telefone",
      "Pergunte sobre transporte na mesma ligação em que marcar a consulta",
      "Programe um lembrete na véspera para cada consulta que marcar",
      "Procure dois programas de desconto em medicamentos e deixe-os num cartão"
    ],
    [
      "Escreva a regra número um num bilhete: coletar o mínimo, nada sai sem consentimento",
      "Liste o que o acolhimento precisa de verdade e corte todo o resto",
      "Escolha um único lugar trancado — físico ou criptografado — onde as anotações moram",
      "Revise as regras com cada pessoa navegadora antes da primeira ligação dela"
    ],
    [
      "Escreva a uma clínica pedindo quinze minutos com a coordenação de acolhimento",
      "Visite e pergunte quais encaminhamentos ajudam de verdade e quais sobrecarregam",
      "Dê a eles um contato com nome do seu lado para passagens calorosas",
      "Marque uma conversa trimestral para saber de novos serviços de baixo custo"
    ]
  ],
  "toy-library": [
    [
      "Mande uma mensagem ao centro comunitário ou à biblioteca perguntando por uma estante livre",
      "Visite o lugar com um carrinho de bebê e cheque a entrada: sem escadas e com onde deixá-lo",
      "Pergunte a três famílias na saída quais duas horas semanais realmente servem",
      "Confirme que a estante fica na altura das crianças e pendure ali os horários"
    ],
    [
      "Guarde no seu telefone a página de recalls da CPSC",
      "Coloque uma caixa identificada para doações junto ao espaço de armazenamento",
      "Confira cada brinquedo doado na lista de recalls antes de qualquer coisa",
      "Passe as peças pequenas por um tubo de papel higiênico; se couberem, tire da faixa de menos de três anos",
      "Lave e seque cada aprovado, e descarte o que estiver rachado ou incompleto"
    ],
    [
      "Peça no chat da comunidade sacos com fecho e um marcador permanente",
      "Fotografe cada brinquedo ao lado do seu número e registre com a faixa etária",
      "Conte as peças de cada conjunto ao ensacar e escreva o total na etiqueta",
      "Guarde os sacos com a etiqueta à vista para conferir a contagem na devolução"
    ],
    [
      "Procure na internet as regras de outra brinquedoteca como ponto de partida",
      "Rascunhe em palavras simples o prazo e quantos brinquedos por família",
      "Escreva a política de peças perdidas numa frase gentil: sem multas, só avise a gente",
      "Peça a duas famílias que leiam e marquem o que soar como bronca"
    ],
    [
      "Imprima cinco folhas de registro: nome, contato, número do brinquedo e data de devolução",
      "Acompanhe cada pessoa voluntária num empréstimo e numa devolução de treino",
      "Inclua a contagem de peças e uma limpada rápida no próprio passo de devolução",
      "Pendure a rotina de limpeza e as regras onde fica quem atende"
    ]
  ],
  "food-preservation": [
    [
      "Mande mensagem a um salão paroquial ou centro comunitário perguntando se emprestam a cozinha",
      "Visite e confira se o fogão aguenta uma panela cheia e alcança fervura forte",
      "Cheque bancadas, pias e um canto onde os vidros quentes esfriem sem esbarrões",
      "Reserve datas pelos picos da colheita, não por quando o salão estiver livre"
    ],
    [
      "Baixe o guia vigente do USDA ou o do serviço de extensão da sua região",
      "Confira o ano de publicação e anote na capa",
      "Ligue para o serviço de extensão e peça que treinem suas lideranças ou revisem o plano",
      "Combinem entre lideranças: só receitas testadas, sem aumentar quantidades, sem exceções"
    ],
    [
      "Publique num grupo local um pedido de panelas, vidros e anéis para conservas",
      "Agende o teste do manômetro de cada panela no serviço de extensão — costuma ser grátis",
      "Passe o dedo pela borda de cada vidro doado e descarte os lascados",
      "Compre tampas novas para todos os vidros previstos e anote que utensílios ainda faltam"
    ],
    [
      "Mande mensagem a quem cultiva ou respiga e pergunte o que está quase no ponto",
      "Rabisque um calendário rápido de colheita: qual alimento chega farto em quais semanas",
      "Combine com cada fonte uma quantidade concreta para uma data de sessão concreta",
      "Marque a coleta um ou dois dias depois da colheita, para nada ficar parado e passar do ponto"
    ],
    [
      "Pergunte por mensagem quem já fez conservas antes e quem está começando",
      "Escolha uma receita testada que sirva ao alimento e às mãos menos experientes",
      "Combine o alimento com seu método seguro: banho-maria para o ácido, pressão para o pouco ácido",
      "Desenhe as estações no papel: lavar, preparar, encher, processar, esfriar",
      "Defina uma pessoa com nome para cada estação antes de alguém chegar"
    ],
    [
      "Imprima a receita testada e os tempos de processamento e cole na altura dos olhos",
      "Abra com cinco minutos de segurança: por que tempos e métodos não se negociam",
      "Nomeie uma pessoa cronometrista para anotar a entrada e a saída de cada leva",
      "Coloque cada iniciante ao lado de alguém com experiência em cada estação",
      "Circule pela cozinha narrando o que você faz, para a habilidade se espalhar de verdade"
    ],
    [
      "Pegue um marcador e etiquete o primeiro vidro frio: conteúdo, método e data",
      "Aperte o centro de cada tampa e separe os vidros que não vedaram — geladeira, não prateleira",
      "Conte os vidros por pessoa e separe a parte da geladeira comunitária ou da despensa",
      "Anote três linhas a quente: o que funcionou, o que travou e o que mudar"
    ]
  ],
  "free-haircut": [
    [
      "Escreva para uma cabeleireira ou barbeiro que você conheça e peça dez minutos para apresentar a ideia",
      "A cada sim, pergunte quantos cortes faz de verdade por jornada — costuma ser seis a oito",
      "Peça a cada pessoa recrutada que traga mais um colega",
      "Reúna números de licença e datas disponíveis numa lista só"
    ],
    [
      "Mande mensagem a um abrigo, centro de dia ou igreja perguntando se cedem o espaço por uma tarde",
      "Percorra a sala e confira água, boa luz e pisos que dê para varrer",
      "Conte as tomadas aterradas ao alcance do fio onde ficaria cada cadeira",
      "Confirme a data e quem abre numa única mensagem que você possa reler depois"
    ],
    [
      "Pergunte por mensagem a seus profissionais que equipamento trazem, para comprar só o que falta",
      "Compre dois jogos de pentes e lâminas por estação: um desinfeta enquanto o outro corta",
      "Peça a uma loja de beleza a doação de capas, pentes e tiras descartáveis de pescoço",
      "Monte sacolas para levar: aparelho de barbear, sabonete, desodorante e um pente em cada uma"
    ],
    [
      "Ligue para o conselho de cosmetologia ou barbearia e pergunte as regras para eventos gratuitos",
      "Compre o desinfetante registrado que indicarem e anote o tempo de molho exigido",
      "Monte uma estação de molho por cadeira: bacia identificada, timer e o tempo impresso",
      "Escreva a rotina entre clientes num cartão e cole em cada estação"
    ],
    [
      "Mande mensagem a cada profissional e ao espaço anfitrião dois dias antes para confirmar",
      "Coloque uma cadeira onde a sala não possa ver, para quem preferir privacidade",
      "Dê a cada pessoa um espelho e comece com “como você quer?” antes de qualquer tesourada",
      "Mantenha os telefones guardados — fotos só se a própria pessoa pedir",
      "Feche repondo as sacolas para levar e marcando a próxima data com o espaço anfitrião"
    ]
  ],
  "mutual-aid-moving-crew": [
    [
      "Escreva para quatro amizades fortes e pergunte a disponibilidade no fim de semana",
      "Pergunte por aí quem tem caminhonete, van ou reboque para emprestar",
      "Comece uma lista: nome, telefone, força, veículo, dias livres de costume",
      "Marque um núcleo pequeno e de confiança para mudanças delicadas; nunca de lista aberta"
    ],
    [
      "Publique um único pedido no mural: carrinhos, cintas, mantas de mudança, caixas firmes",
      "Priorize um carrinho de quatro rodas para móveis; compre um se ninguém doar",
      "Marque cada peça com o nome do programa para que de fato volte",
      "Escolha uma garagem ou armário como casa do equipamento e avise a equipe onde fica"
    ],
    [
      "Digite cinco perguntas de triagem nas suas notas: cômodos, escadas, distância, data",
      "Acrescente as duas que todo mundo esquece: está tudo encaixotado, e onde dá para estacionar?",
      "Decida como os pedidos chegam até você; aqui um telefone ganha de um formulário",
      "Teste a triagem com uma amizade fingindo pedir uma mudança"
    ],
    [
      "Procure um bom vídeo de levantamento seguro e envie para a equipe toda",
      "Escreva primeiro a regra de peso: nada acima de 23 quilos com menos de duas pessoas",
      "Redija um termo de responsabilidade de uma página e colha as assinaturas antes da primeira mudança",
      "Peça a cada motorista que confirme se o seguro cobre transporte voluntário"
    ],
    [
      "Abra a lista e marque quem está livre para a próxima data pedida",
      "Ligue para a pessoa na véspera e confirme que está tudo encaixotado de verdade, não “quase”",
      "Tenha dois nomes de reserva por mudança; mudança não se adia fácil",
      "Compartilhe endereços um a um pelo telefone de quem coordena, jamais em chat de grupo"
    ],
    [
      "Anote os trabalhos que você já sabe que são demais: pianos, produtos perigosos, acumulação",
      "Descubra quem atende cada um na sua região: empresas de mudança, fretes, serviços do condado",
      "Acompanhe cada limite com esse encaminhamento, para que um não entregue uma próxima ligação",
      "Passe a limpo em meia página e compartilhe com a equipe toda"
    ],
    [
      "Mande mensagem à equipe na noite anterior: hora, ponto de encontro, que roupa usar",
      "Carregue primeiro os móveis mais pesados e deixe o carrinho fazer a força",
      "Percorra o lugar antigo com a pessoa uma última vez antes de partir",
      "Pergunte alguns dias depois: já se instalou, a loja grátis ajudaria?",
      "Anote o que foi bem e o que doeu enquanto a mudança está fresca"
    ]
  ],
  "disability-support-network": [
    [
      "Escreva para dois vizinhos com deficiência que você conhece e pergunte se cofundariam isto com você",
      "Deixe que escolham formato, lugar e ritmo da primeira reunião antes de definir qualquer coisa",
      "Acrescente ao orçamento uma linha para custos de acesso e o tempo de quem lidera",
      "Combinem em voz alta a regra: pessoas aliadas apoiam, membros com deficiência decidem"
    ],
    [
      "Pergunte a três membros como preferem o contato: ligação, mensagem, e-mail ou em pessoa",
      "Abra um canal por preferência e nomeie alguém para cuidar de cada um",
      "Peça a quem usa leitor de tela que teste sua inscrição e seu panfleto antes de qualquer envio",
      "Reescreva o primeiro anúncio em linguagem simples e envie por todas as vias de uma vez"
    ],
    [
      "Pergunte a um membro qual tarefa ou barreira mais pesou neste mês",
      "Rascunhe cinco perguntas curtas e faça por telefone, mensagem e em pessoa",
      "Liste cada recurso local citado, um por linha, com um contato para cada",
      "Ligue para cada lugar listado e pergunte pelo elevador, pelo banheiro e pela entrada",
      "Marque as três maiores lacunas entre o que os membros precisam e o que existe"
    ],
    [
      "Escreva para três membros e pergunte uma coisa que poderiam oferecer e uma de que precisariam",
      "Faça uma folha de duas colunas — ofertas e necessidades — e esboce os pares óbvios",
      "Acrescente uma opção de pausa sem explicações, para alguém se afastar por uma semana",
      "Faça você a primeira combinação e depois pergunte às duas pessoas como foi"
    ],
    [
      "Publique num grupo local um pedido de andadores, bengalas e cadeiras de banho sem uso",
      "Escreva primeiro a lista do que não se empresta: nada que toque de perto boca ou pele",
      "Higienize cada equipamento e marque com um número, o número de série e o nome do programa",
      "Monte uma folha de saída simples: número do item, quem levou, contato e data"
    ],
    [
      "Guarde no seu telefone o número da consultoria de benefícios mais próxima",
      "Pergunte a dois membros para qual órgão ou formulário gostariam de companhia",
      "Combine para cada pedido alguém que acompanhe, tome notas e peça tudo por escrito",
      "Quando surgirem regras de dinheiro ou benefícios, encaminhe à consultoria em vez de chutar"
    ],
    [
      "Anote os acertos e as falhas de acesso do último evento em que você esteve",
      "Monte a lista com membros com deficiência: entrada, assentos, banheiros, som, materiais",
      "Acrescente uma pergunta de necessidades de acesso a cada formulário de confirmação",
      "Passe um evento próximo pela lista e corrija o que falhar antes da data"
    ]
  ],
  "books-to-prisoners": [
    [
      "Procure no telefone a página da política de correspondência de uma unidade próxima",
      "Ligue ou escreva ao setor de correspondência pedindo a política de livros por escrito",
      "Guarde a política num arquivo com data e anote quando verificar de novo",
      "Repita com a segunda unidade e anote quais regras mudam",
      "Escreva num cartão as regras inegociáveis: só novos, nada de capa dura"
    ],
    [
      "Escreva a uma amizade pedindo dicionários ou romances de bolso para doar",
      "Consiga um canto com mesa para empacotar numa igreja, biblioteca ou garagem",
      "Publique um chamado de doação listando só o que as unidades aceitam: brochuras em bom estado",
      "Ponha uma caixa de descarte na entrada para capa dura e livros rabiscados",
      "Organize o que sobrar em seções: dicionários, ficção, educação, reingresso"
    ],
    [
      "Pegue um caderno ou abra uma planilha com colunas: nome, número, ala, pedido",
      "Registre as cartas que já tem, copiando nome e número exatamente como escritos",
      "Acrescente a data do pedido e uma coluna de enviado, para nada ficar sem resposta",
      "Escolha uma caixa ou pasta onde toda carta recebida caia antes do registro"
    ],
    [
      "Escreva a duas amizades que amam livros e convide para uma noite de empacotamento",
      "Imprima as regras da unidade numa lista de uma página e cole sobre a mesa",
      "Acompanhe cada pessoa nova enquanto ela empacota o primeiro pacote",
      "Diga a norma em voz alta: uma segunda pessoa confere cada caixa antes de fechar"
    ],
    [
      "Pesquise quanto custa enviar um pacote de livros pelo Media Mail, a tarifa econômica",
      "Peça no chat do grupo doações de postagem com um valor concreto por pacote",
      "Marque um dia fixo de remessa no calendário e convide duas pessoas para ajudar",
      "Escreva um cartão de regra: nada de cartas pessoais dentro de envios Media Mail"
    ],
    [
      "Pergunte a uma pessoa voluntária se ela topa estrear o programa de cartas",
      "Escreva as duas regras num cartão: só o endereço do programa, só o primeiro nome",
      "Redija uma resposta gentil e firme para pedidos de dinheiro ou romance e compartilhe",
      "Forme a primeira dupla e marque uma conversa depois da primeira troca de cartas"
    ]
  ],
  "community-music": [
    [
      "Publique um pedido de instrumentos tocáveis num chat de grupo ou grupo local",
      "Escreva a uma loja de música perguntando por consertos com desconto para o programa",
      "Toque ou abra cada estojo antes de aceitar — recuse pianos grátis e rachaduras grandes",
      "Recolha os que disserem sim e etiquete cada instrumento com o conserto que precisa",
      "Deixe os consertáveis na loja e anote a data prometida"
    ],
    [
      "Abra uma folha com colunas: número, tipo, estado, quem está com ele, data de saída",
      "Ponha uma etiqueta numerada em cada instrumento",
      "Fotografe o estado de cada instrumento e guarde as fotos por número",
      "Escreva uma nota de saída de três linhas: cuidados, prazo, sem cobrança por danos",
      "Teste o sistema registrando um empréstimo em seu próprio nome"
    ],
    [
      "Escreva aos dois músicos que você já conhece e pergunte se ensinariam iniciantes",
      "Peça à igreja, à banda da escola e ao centro de convivência nomes de gente paciente",
      "Encontre cada sim por dez minutos para saber o que ensinariam e quando",
      "Comece já a verificação de antecedentes de quem vai dar aula para crianças",
      "Anote nomes, instrumentos e horários disponíveis numa única lista compartilhada"
    ],
    [
      "Liste três salas próximas que aguentem barulho: centro comunitário, escola, salão religioso",
      "Ligue ou visite cada uma e pergunte em especial por noites e tardes de fim de semana",
      "Onde o sim for mais simpático, pergunte por um armário com chave para os instrumentos",
      "Percorra a sala uma vez no horário previsto para checar barulho e vizinhança",
      "Consiga o combinado por escrito, com seus dias e horários exatos nomeados"
    ],
    [
      "Mande a quem ensina uma única mensagem pedindo seus dois melhores horários semanais",
      "Monte o calendário do primeiro mês com aulas e uma jam marcada como só para iniciantes",
      "Prepare a inscrição: uma folha de papel no espaço e um número de telefone para mensagens",
      "Confirme o calendário com o espaço anfitrião antes de anunciar qualquer coisa",
      "Publique os horários onde as famílias já olham e fixe no chat do grupo"
    ],
    [
      "Anote três regras de cuidado para o tipo de instrumento que você conhece melhor",
      "Acrescente em destaque a linha-chave: se algo quebrar, traga de volta — não conserte em casa",
      "Peça a alguém que ensina que revise a folha em busca de erros ou faltas",
      "Imprima cópias e ponha uma em cada estojo antes de ele sair",
      "Diga a linha do instrumento quebrado em voz alta a cada empréstimo"
    ]
  ],
  "school-supply-program": [
    [
      "Procure o telefone da secretaria da escola mais próxima e guarde no seu aparelho",
      "Ligue ou escreva pedindo para falar com a orientadora ou a pessoa de ligação com as famílias",
      "Peça as listas exatas de material por ano escolar, marcas incluídas",
      "Pergunte quantas famílias precisariam de mochila, um número realista",
      "Passe as listas e a contagem para um único documento e compartilhe com o projeto"
    ],
    [
      "Abra as listas de material e circule os cinco básicos mais necessários",
      "Cote esses básicos por caixa em duas lojas de atacado",
      "Faça um pedido em atacado de lápis, papel e cola antes de a campanha começar",
      "Peça a dois comércios ou igrejas que recebam uma caixa de doação para os extras",
      "Crie um lembrete semanal para esvaziar as caixas e anotar o que ainda falta"
    ],
    [
      "Imprima uma cópia da lista de material de cada ano escolar",
      "Escreva a três pessoas voluntárias com data e hora para uma sessão de montagem",
      "Monte uma mesa por ano escolar com a lista colada à vista de quem monta",
      "Montem em linha, conferindo cada mochila com a lista do seu ano",
      "Deixe todas as mochilas abertas para as crianças trocarem itens na retirada"
    ],
    [
      "Escreva a duas pessoas que possam ter um cômodo ou garagem seca e com chave sobrando",
      "Visite a melhor opção e confira se é seca, tranca bem e tem prateleiras ou estrados",
      "Coloque as caixas sobre prateleiras ou estrados, nunca direto no chão",
      "Escolha um ponto de entrega numa linha de ônibus que as famílias já usam e confirme a data"
    ],
    [
      "Procure o primeiro dia do ano letivo e marque a entrega uma ou duas semanas antes",
      "Peça à pessoa de ligação da escola que espalhe a data pelos canais das famílias",
      "Escreva à sua lista de voluntários perguntando quem topa um turno de duas horas",
      "Arrume as mochilas por cor para cada criança escolher a sua",
      "Faça uma vistoria na véspera: sem formulários na porta, só uma mesa e boas-vindas"
    ]
  ],
  "legal-aid-clinic": [
    [
      "Procure o escritório de assistência jurídica e o programa pro bono da ordem; guarde os números",
      "Ligue para cada um e pergunte do que precisariam de você para enviar advogados",
      "Escreva à clínica de direito mais próxima perguntando por estudantes supervisionados",
      "Pergunte a cada advogada ou advogado se o seguro profissional cobre o voluntariado",
      "Registre a clínica no programa da ordem se for isso que libera a cobertura gratuita"
    ],
    [
      "Mande uma pergunta aos advogados parceiros: quais três assuntos vocês vão atender?",
      "Liste o que fica de fora e para onde cada um desses casos deve ir",
      "Consiga um contato com nome e um tempo de espera honesto em cada organização",
      "Escreva o alcance em palavras que uma vizinha consiga repetir de volta"
    ],
    [
      "Mande mensagem a um espaço parceiro perguntando por uma sala com porta de verdade",
      "Fique na sala de espera enquanto alguém fala lá dentro — se ouvir, continue procurando",
      "Monte uma lista de documentos por tipo de caso: contrato, avisos, holerites, documento",
      "Organize a acolhida para cada sessão começar com os papéis já em ordem"
    ],
    [
      "Rascunhe a ficha de horários no papel: nomes e horários, nada mais",
      "Decida quem marca os atendimentos e onde mora essa lista única",
      "Deixe o conteúdo do caso fora de toda planilha compartilhada — os detalhes ficam na sala",
      "Faça lembretes que digam hora e lugar, nunca o assunto jurídico"
    ],
    [
      "Pergunte a uma organização parceira: quais dúvidas de direitos mais aparecem?",
      "Rascunhe um guia de uma página sobre o tema principal, em linguagem simples",
      "Peça a um advogado que revise cada material e coloque data em todos",
      "Reserve uma sala e alguém para conduzir a primeira oficina",
      "Diga em voz alta e por escrito: isto é informação geral, não orientação jurídica"
    ],
    [
      "Mande aos advogados duas datas possíveis de clínica e pergunte qual se sustenta",
      "Fixe a data recorrente e coloque no calendário da comunidade",
      "Reserve o intérprete antes de anunciar em qualquer idioma — nunca uma criança da família",
      "Distribua panfletos pelas organizações parceiras, não em publicações abertas",
      "Confirme cada advogado na semana anterior — clínica sem advogado quebra a confiança"
    ],
    [
      "Comece uma lista-mestra de clientes que só a coordenação consegue abrir",
      "Escreva a regra: todo novo agendamento é checado antes contra essa lista",
      "Faça a checagem de conflitos na hora de marcar, não quando a pessoa senta",
      "Rascunhe um compromisso de confidencialidade de duas linhas para cada pessoa assinar",
      "Repasse as duas regras com a equipe inteira antes de abrir a primeira clínica"
    ]
  ],
  "resource-hub-dispatch": [
    [
      "Anote o único número ou link de formulário que será a porta de entrada",
      "Prepare telefone, formulário e acolhida presencial com as mesmas perguntas curtas",
      "Defina uma pessoa e um horário de verificação por canal antes de publicar",
      "Envie um pedido de teste por cada canal e cronometre quanto demora para ser visto"
    ],
    [
      "Comece uma planilha com colunas: nome, habilidades, disponibilidade, contato, limites",
      "Escreva a cinco pessoas voluntárias perguntando disponibilidade e contato preferido",
      "Adicione quem organiza cada projeto e o que o projeto pode oferecer de verdade",
      "Agende uma reconfirmação trimestral — uma lista de sins antigos é quase ficção"
    ],
    [
      "Acompanhe no papel um pedido recente: quem viu, quem agiu, quem fechou",
      "Escreva as regras de encaminhamento: que necessidade vai a que projeto ou pessoa",
      "Dê a cada pedido uma pessoa dona, com nome, que o leve até um fechamento real",
      "Fixe uma meta de resposta, com um “não conseguimos atender” no mesmo dia como piso",
      "Acompanhe o estado de cada pedido num lugar que a equipe toda veja"
    ],
    [
      "Comece a lista pelos projetos de vocês — esses você escreve de memória",
      "Ligue para cada serviço externo como se fosse quem busca ajuda e anote o horário real",
      "Registre os requisitos — quem eles aceitam e o que pedem na porta",
      "Coloque data em cada entrada e reserve um momento mensal para reverificar as antigas"
    ],
    [
      "Escreva a três pessoas organizadas propondo um turno de atendimento por semana",
      "Escreva o guia do turno para alguém novo conseguir tocar só com a folha",
      "Acompanhe cada pessoa nova no primeiro turno e depois passe o bastão",
      "Monte a rotação para ninguém cobrir mais de dois turnos seguidos"
    ],
    [
      "Leia o formulário de acolhida e risque cada campo sem o qual dá para trabalhar",
      "Escreva a regra de apagar: ao fechar um pedido, guarde a contagem, descarte os detalhes",
      "Liste quem pode ver pedidos abertos e feche o acesso para o resto",
      "Adicione um passo final: confirme que a necessidade foi mesmo atendida antes de fechar"
    ],
    [
      "Adicione agora mesmo uma etiqueta ou coluna “sem atender” ao seu registro de pedidos",
      "Escolha um conjunto fixo de categorias para os registros somarem em vez de se espalhar",
      "Anote cada falha na hora em que acontece, não de memória no fim do mês",
      "Some as falhas todo mês e leve a maior lacuna à próxima reunião de planejamento"
    ]
  ],
  "harm-reduction-supplies": [
    [
      "Procure a organização de redução de danos ou o treinamento de naloxona mais próximo",
      "Escreva ou ligue: apresente a equipe e pergunte quando é o próximo treinamento gratuito",
      "Garanta vaga no treinamento para cada pessoa que vai distribuir — sem exceções",
      "Pergunte sobre distribuir sob o guarda-chuva legal e a ordem permanente deles"
    ],
    [
      "Escreva à organização parceira ou a uma clínica jurídica: o que é legal carregar aqui?",
      "Pergunte especificamente por tiras de teste e seringas, não só pela naloxona",
      "Anote a lei exata ou o nome da fonte, com a data em que você verificou",
      "Transforme isso num cartão de uma página que cada pessoa voluntária leve consigo"
    ],
    [
      "Procure o programa estadual de naloxona ou a ordem permanente de farmácia",
      "Faça o pedido, mais o que a sua lista legal permitir: tiras, curativos, higiene",
      "Confira as validades no dia em que a caixa chegar e anote onde você vá ver",
      "Guarde tudo longe do calor e do frio — nada de porta-malas nem galpão"
    ],
    [
      "Peça à organização parceira um folheto de exemplo para copiar",
      "Rascunhe o seu: reconhecer overdose, aplicar naloxona, chamar emergência, nunca sozinho",
      "Mande traduzir para os idiomas que a vizinhança fala de verdade",
      "Ligue para cada número do folheto antes de imprimir centenas de cópias",
      "Monte uma linha de montagem, uma pessoa por etapa: saco, folheto, insumos, lacre"
    ],
    [
      "Peça a um bar ou mercadinho que você já conhece para aceitar uma caixa sem perguntas",
      "Percorra a rota com a organização parceira e deixe que apresentem vocês por lá",
      "Fixe dias e horários para as rondas e mantenha idênticos toda semana",
      "Dê a cada caixa anfitriã um contato com nome que a reponha"
    ],
    [
      "Comece uma folha de contagem: insumo, quantidade, data — conte insumos, nunca pessoas",
      "Registre cada validade da naloxona com um lembrete um mês antes",
      "Percorra os pontos fixos todo mês e reponha antes de as caixas ficarem vazias",
      "Agende uma reciclagem sempre que entrarem novas pessoas voluntárias"
    ]
  ],
  "court-support": [
    [
      "Procure o número da defensoria pública e o grupo local de observação de audiências",
      "Mande um e-mail curto oferecendo mãos a mais e perguntando como preferem contato",
      "Pergunte a cada grupo o que ajudaria de verdade — e escute, não venda seu plano",
      "Visite o fórum uma vez com alguém da observação de audiências para ver como trabalham",
      "Anote nome, papel e canal preferido de cada contato numa lista única"
    ],
    [
      "Abra uma nota e escreva a regra principal: nunca damos orientação jurídica",
      "Acrescente o roteiro exato: “não posso orientar sobre isso — pergunte à sua advogada”",
      "Liste a conduta na sala: chegar cedo, roupa discreta, telefones desligados, sem gestos",
      "Some a regra do corredor: nada do caso onde um promotor possa ouvir",
      "Envie o rascunho ao contato na defensoria para uma revisão rápida"
    ],
    [
      "Pergunte no chat do grupo qual número de telefone vai receber os pedidos de apoio",
      "Monte um calendário compartilhado com data, sala e o que cada pessoa precisa",
      "Guarde o link da pauta do tribunal e pratique procurar um processo",
      "Crie um lembrete fixo: verificar cada data na pauta na tarde anterior",
      "Pergunte à pessoa, não à papelada, se ela também precisa de carona ou de cuidado"
    ],
    [
      "Mande às pessoas voluntárias duas opções de manhã tranquila para conhecer o fórum",
      "Explique a revista: a fila de 30 minutos, canivetes proibidos, regras de telefone",
      "Mostre a sala de audiência: onde sentar e como esperar três horas com calma",
      "Ensaiem em duplas o roteiro de não orientar até sair sozinho",
      "Junte cada pessoa nova com alguém experiente na primeira audiência"
    ],
    [
      "Escreva ao grupo: quem pode dirigir de manhã em dia útil e quem pode cuidar de crianças?",
      "Monte uma lista com as manhãs de cada motorista e a disponibilidade de cada dupla",
      "Defina motorista titular e reserva para cada audiência — nunca só um",
      "Confirme o motorista titular e a dupla de cuidado na noite anterior, sempre",
      "Verifique quais salas permitem crianças para o plano de cuidado fechar com o prédio"
    ],
    [
      "Responda à advogada pedindo por escrito conteúdo, destinatário e prazo",
      "Liste a vizinhança que conhece bem a pessoa e escreva para cada uma com o pedido",
      "Envie a quem vai escrever a orientação da defesa e uma boa carta de exemplo",
      "Reúna cada carta e segure para a revisão da advogada antes de enviar qualquer coisa",
      "Anote quem prometeu carta e dê um toque três dias antes do prazo"
    ]
  ],
  "cooling-warming-center": [
    [
      "Liste três candidatos com ar e aquecimento de verdade: biblioteca, igreja, sindicato",
      "Ligue hoje para um e peça vinte minutos com quem fica com as chaves",
      "Percorra a sala conferindo banheiros, entrada sem degraus e tomadas",
      "Faça já as perguntas incômodas: horários, chaves, seguro, pernoite",
      "Consiga o sim por escrito e combine testar o ar ou o aquecimento num dia extremo"
    ],
    [
      "Procure os limites de índice de calor e sensação térmica do serviço meteorológico",
      "Proponha números exatos ao grupo — um valor da previsão, não “quando estiver feio”",
      "Nomeie uma pessoa com autoridade para acionar o centro, mais uma reserva",
      "Monte o chat de grupo ou a corrente telefônica e faça um aviso de teste hoje",
      "Escreva o gatilho e o nome de quem decide onde a equipe toda veja"
    ],
    [
      "Faça a lista: água, eletrólitos, cobertores, camas, ventiladores, carregadores, kit",
      "Publique um pedido aos membros pelo que der para doar e cote o resto",
      "Faça uma única rodada de compras e leve tudo ao espaço",
      "Monte caixas etiquetadas para uma pessoa nova achar qualquer coisa em segundos",
      "Cole uma lista do conteúdo por dentro da porta do armário"
    ],
    [
      "Escreva aos membros: quem toparia um turno de quatro horas num tempo extremo?",
      "Agende um treinamento de duas horas no espaço e convide cada sim",
      "Treine os sinais de insolação e hipotermia até saírem de cor",
      "Diga com clareza: liguem cedo para a emergência, e ninguém será questionado por ligar",
      "Ensaiem em duplas uma recepção sem papelada e um roteiro de desescalada"
    ],
    [
      "Rascunhe a grade de turnos de um dia de ativação: abertura, blocos do dia, fechamento",
      "Preencha cada turno com dois nomes — nunca uma pessoa anfitriã sozinha",
      "Peça a mais três pessoas para ficarem de reserva para quando o tempo derrubar alguém",
      "Compartilhe a escala no chat e confirme que cada pessoa viu o próprio turno",
      "Faça um ensaio de ativação para ver em quanto tempo a grade realmente enche"
    ],
    [
      "Liste aonde a vizinhança em risco já vai: clínicas, prédios de idosos, mercadinhos",
      "Rascunhe um panfleto em linguagem simples com os gatilhos, o endereço e os horários",
      "Peça aos membros para traduzi-lo para os outros idiomas do bairro",
      "Entregue maços a entregadores de marmita, síndicos e agentes de rua",
      "Termine as rondas semanas antes de a estação virar — não na primeira onda de calor"
    ],
    [
      "Escreva à sua dupla de turno para confirmar e ver quem fica com as chaves",
      "Chegue uma hora antes, ligue o ar ou o aquecimento e deixe água na porta",
      "Mantenha uma contagem solta de visitas — um número, não documentos",
      "Acorde com delicadeza quem estiver dormindo para ver como está; um cochilo engana",
      "Ao fechar, limpe, reponha as caixas e anote o que faltou"
    ]
  ],
  "community-oral-history": [
    [
      "Abra uma nota em branco e liste o que você vai gravar e onde pode parar",
      "Rascunhe uma página: o que se grava, opções de compartilhar, direito de pausar ou retirar",
      "Separe o compartilhar em opções: com nome ou sem, só a família, público na internet",
      "Acrescente seu telefone para a pessoa poder mudar de ideia depois",
      "Peça a alguém que traduza para os idiomas das suas pessoas narradoras"
    ],
    [
      "Abra o aplicativo de notas de voz do telefone e confira o espaço livre",
      "Grave um teste de 30 segundos na sala que vai usar e escute à procura de zumbido ou eco",
      "Escreva oito perguntas abertas como “me conta como era a rua quando você chegou”",
      "Ensaie dez minutos de entrevista com alguém próximo e corte as perguntas sem graça"
    ],
    [
      "Escreva a uma pessoa mais velha que confia em você e peça uma hora na cozinha dela",
      "Carregue o telefone, libere espaço e ponha o termo e as perguntas numa bolsa",
      "Leiam juntos o termo de consentimento antes de apertar gravar",
      "Se a história ficar crua, pause e pergunte de novo se aquela parte pode ficar",
      "Antes de sair, marque a próxima sessão ou pergunte quem ela apresentaria a você"
    ],
    [
      "Renomeie agora a gravação desta semana: data, nome de quem narrou, acordo de compartilhar",
      "Copie para um segundo lugar de verdade diferente — nuvem e telefone, não um computador só",
      "Entregue a cópia a quem narrou, num pen drive ou pelo aplicativo que a pessoa usar",
      "Releia o termo de consentimento antes de publicar qualquer coisa e honre qualquer mudança"
    ]
  ],
  "community-solar-coop": [
    [
      "Escreva a cinco vizinhos que reclamam da conta de luz e peça dez minutos a cada um",
      "Monte um formulário que peça um nível real de compromisso, não só um e-mail",
      "Faça uma noite de conversa na cozinha e conte quem aparece de verdade",
      "Separe as respostas em comprometidos, curiosos e não — planeje só com os primeiros"
    ],
    [
      "Busque o nome do seu estado mais “regras de energia solar comunitária” e guarde a página",
      "Ligue para uma cooperativa solar vizinha e pergunte qual modelo as regras permitiram",
      "Faça uma folha resumo: compensação, assinaturas, propriedade cooperativa — vale aqui ou não",
      "Marque cada regra que você não entender para uma advogada explicar depois"
    ],
    [
      "Anote três telhados grandes e ensolarados por perto: escolas, igrejas, galpões",
      "Verifique se um programa de energia solar comunitária aceita o grupo como assinantes",
      "Percorra seu lugar favorito com a pessoa dona e anote a idade do telhado e o espaço",
      "Ponha construir contra entrar numa página só e leve aos membros"
    ],
    [
      "Peça à associação de cooperativas do seu estado nomes de advogados do ramo de energia",
      "Marque uma consulta com alguém que já formou uma cooperativa de energia",
      "Desenhe o fluxo do dinheiro numa página: quem põe, quem é dono, quem recebe créditos",
      "Compare estruturas — cooperativa, sociedade, assinatura — com os profissionais",
      "Não assine nada até a advogada e o contador terem lido cada contrato"
    ],
    [
      "Pergunte a dois donos de placas por perto qual instalador usaram e se o chamariam de novo",
      "Peça pelo menos três orçamentos por escrito com as mesmas especificações",
      "Pergunte a cada candidato quem faz a manutenção no quinto ano e o que a garantia cobre",
      "Deixe os termos de garantia e manutenção por escrito no contrato"
    ],
    [
      "Abra uma planilha com uma linha por membro: quanto pôs, créditos de volta, data",
      "Escreva as regras de crédito em palavras simples que se leiam num minuto",
      "Escolha uma única ferramenta para pagamentos e extratos e fique com ela",
      "Percorra com um membro o primeiro extrato e conserte o que confundiu"
    ],
    [
      "Peça a três membros que levem uma conta de luz recente à próxima reunião",
      "Leiam juntos uma conta, linha por linha",
      "Compartilhe cinco consertos baratos: lâmpadas LED, filtros de linha, termostato, vedação",
      "Confiram as contas de novo num mês para os membros verem a diferença no papel"
    ]
  ],
  "worker-coop-incubator": [
    [
      "Marque nesta semana três conversas de 20 minutos com membros interessados",
      "Pergunte a cada um: o que você sabe fazer, o que quer construir, que horas tem",
      "Registre cada resposta numa planilha compartilhada e destaque as habilidades repetidas",
      "Circule qualquer agrupamento de três ou mais habilidades iguais — ali há um empreendimento"
    ],
    [
      "Pergunte aos membros que habilidades mais querem: currículos, ofícios, digital, finanças",
      "Consulte o programa de troca de saberes sobre quem pode ensinar as duas mais pedidas",
      "Traga uma pessoa especialista de fora para o tema que ninguém local domina",
      "Marque a primeira sessão e não deixe passar de duas horas",
      "Recolha impressões na saída e ajuste a sessão seguinte"
    ],
    [
      "Convide alguém de uma cooperativa de trabalho real para conversar com o grupo",
      "Faça uma comparação de uma página: cooperativa contra negócio comum — ganhos, decisões, dono",
      "Mostre com números como uma cooperativa real vota e divide os ganhos",
      "Deixe tempo para as perguntas difíceis: salários, conflitos, saídas"
    ],
    [
      "Procure a assessoria de cooperativas da sua região e marque uma conversa de apresentação",
      "Ajude o grupo a rascunhar um plano de negócio de uma página antes de qualquer papelada",
      "Consiga nomes de advogado e contador que já formaram cooperativas",
      "Revisem as opções de estrutura com os profissionais presentes",
      "Segure a constituição até o plano e as assessorias estarem alinhados"
    ],
    [
      "Abra um documento compartilhado com cada microcrédito, edital e fundo que conhecer",
      "Pergunte à assessoria de cooperativas quais financiadores estão faltando",
      "Anote o prazo, o valor e os requisitos de cada fundo",
      "Sente com um empreendimento e terminem juntos a primeira candidatura"
    ],
    [
      "Anote três cooperativistas ou donos de negócio experientes a quem você poderia pedir",
      "Convide cada um para acompanhar um empreendimento com um encontro mensal",
      "Junte mentores e empreendimentos por ofício, não só por disponibilidade",
      "Ponha o primeiro encontro no calendário antes de o empreendimento lançar"
    ],
    [
      "Convide todos os empreendimentos para um almoço ou encontro à noite",
      "Peça a cada empreendimento que compartilhe um problema e uma vitória",
      "Crie um chat de grupo para indicações e perguntas rápidas",
      "Listem o que os empreendimentos podem comprar uns dos outros e fixem no chat"
    ]
  ],
  "elder-meal-delivery": [
    [
      "Ligue para um centro de convivência ou uma enfermeira paroquial e pergunte quem precisaria de refeições e visitas",
      "Liste as clínicas, grupos de fé e farmácias que veem pessoas idosas isoladas",
      "Rascunhe um texto curto e voluntário: uma refeição e uma visita, de graça, sem condições",
      "Ligue ou visite cada pessoa indicada e pergunte — nunca presuma",
      "Comece uma lista de sins com endereço e melhor horário de contato"
    ],
    [
      "Escreva para cinco pessoas confiáveis que você deixaria entrar na casa da sua própria avó",
      "Deixe a regra por escrito: referências mais checagem básica, sem exceções",
      "Aplique a regra a cada voluntário antes da primeira entrega",
      "Dê a cada pessoa idosa uma visita fixa em vez de um rodízio"
    ],
    [
      "Pergunte à equipe de refeições comunitárias o que consegue produzir sem falta a cada semana",
      "Garanta dois cozinheiros reserva ou um restaurante disposto a doar porções",
      "Combinem número de porções, horário de retirada e embalagens fáceis de requentar",
      "Etiquete cada pote com conteúdo e data antes de sair da cozinha"
    ],
    [
      "Marque no mapa os endereços da sua lista e agrupe em rotas curtas",
      "Fixe dias e horários aproximados, os mesmos toda semana",
      "Reserve em cada parada dez minutos sem pressa para conversar",
      "Faça um trajeto de teste de cada rota antes da primeira entrega real"
    ],
    [
      "Crie um formulário simples: dieta, alergias, contato de emergência",
      "Preencha com cada pessoa idosa ou a família, em pessoa ou por telefone",
      "Guarde os formulários trancados ou protegidos por senha",
      "Dê a quem dirige só o necessário na porta: alergias e um número de contato"
    ],
    [
      "Escreva a primeira linha: o que um voluntário faz diante de uma porta sem resposta",
      "Liste para quem ligar e em que ordem: telefone da pessoa, família, emergência",
      "Acrescente como anotar o que aconteceu depois de qualquer incidente",
      "Imprima o protocolo num cartão de bolso para cada voluntário",
      "Repasse tudo em voz alta com a equipe antes que seja preciso"
    ],
    [
      "Escreva para cada voluntário após a primeira semana: como foi, o que pareceu estranho",
      "Faça a cada pessoa idosa uma pergunta aberta: o que tornaria isso melhor",
      "Alterne ou pause as rotas de quem parecer sobrecarregado",
      "Compartilhe uma pequena vitória com toda a equipe a cada mês"
    ]
  ],
  "disaster-relief-hub": [
    [
      "Anote três prédios com área de carga: escolas, igrejas, sedes de sindicatos",
      "Faça a cada dono a pergunta direta: daria para entrar às 6 da manhã depois de uma enchente?",
      "Consiga um sim por escrito e um acordo de chaves para o favorito e um reserva",
      "Percorra os dois locais e anote energia, água e onde os caminhões estacionariam"
    ],
    [
      "Liste de onde sairiam água, comida e higiene: fornecedor, parceiro ou campanha",
      "Ligue para um atacadista e pergunte sobre pedidos grandes de emergência em cima da hora",
      "Combine com as organizações parceiras quem consegue o quê",
      "Decida como vão saber as necessidades reais após um evento: corrente de ligações ou ficha"
    ],
    [
      "Escolha já suas categorias de triagem: água, comida, higiene, limpeza, roupas",
      "Desenhe o fluxo no papel: caminhão chega, descarregar, separar, guardar, contar",
      "Faça uma folha de contagem de uma página para entradas e saídas",
      "Imprima placas por categoria e guarde com fita adesiva no local"
    ],
    [
      "Escreva a regra no alto da página: sem pedir documento, sem prova de necessidade",
      "Deixe por escrito quem é atendido primeiro quando os suprimentos escassearem",
      "Trace rotas de entrega para quem não consegue chegar ao centro",
      "Desenhe a fila num sentido só: entra por uma porta e sai por outra"
    ],
    [
      "Escreva para dez possíveis voluntários e pergunte: você conseguiria chegar em poucas horas?",
      "Redija cartões de função: recepção, triagem, distribuição, entrega, segurança",
      "Faça um dia de prática de duas horas com caixas de verdade",
      "Anote quem fez o quê bem e defina as funções de antemão para o evento real"
    ],
    [
      "Mande um e-mail ao órgão local de gestão de emergências e apresente o centro",
      "Liste os outros grupos de ajuda por perto e o que cada um cobre",
      "Reúnam-se uma vez e combinem quem preenche cada lacuna",
      "Troquem contatos fora de horário e guardem uma cópia em papel"
    ],
    [
      "Imprima a lista de voluntários e os contatos-chave — suponha que não haverá internet",
      "Escolha um plano sem conexão: rádios, um quadro de recados ou mensageiros a pé",
      "Escreva as regras duras de segurança: ninguém entra em estruturas inseguras, nunca",
      "Conecte-se à árvore de contatos da rede de preparação e teste uma vez"
    ]
  ],
  "recovery-peer-support": [
    [
      "Anote um ou dois vizinhos com experiência sólida e vivida de recuperação",
      "Pergunte a cada um em particular se toparia facilitar — sem pressão, sem anúncios",
      "Procure a formação reconhecida de apoio entre pares mais próxima e a próxima data",
      "Inscreva cada futuro facilitador antes do primeiro encontro",
      "Diga a frase em voz alta desde o primeiro dia: pares, não profissionais de saúde"
    ],
    [
      "Abra um documento com duas colunas: o que fazemos e o que nunca fazemos",
      "Ponha conselhos de desintoxicação e medicação no topo da coluna do nunca",
      "Peça que cada facilitador leia e assine",
      "Mostre o escopo a um profissional local de tratamento para uma revisão rápida"
    ],
    [
      "Liste os programas de tratamento, as clínicas e as linhas de crise locais",
      "Visite ou ligue para cada um e apresente a rede em pessoa",
      "Pergunte a cada um: para quem exatamente ligamos, e podemos usar seu nome?",
      "Escreva um plano de resposta a overdose e afixe onde acontecem os encontros",
      "Imprima a lista de contatos e confira todo mês"
    ],
    [
      "Liste salas com entrada discreta: biblioteca, salão comunitário, espaço de fé",
      "Visite as duas favoritas e verifique privacidade e barulho",
      "Confirme que a sala é livre de substâncias e está livre nas suas noites de encontro",
      "Reserve um horário fixo para que a sala seja sempre a mesma"
    ],
    [
      "Rascunhe as regras: o que se diz aqui fica aqui, sem empurrar conselhos, direito de passar",
      "Leia para os facilitadores e corte o que soar a sermão",
      "Imprima tudo num único cartão para a sala de encontros",
      "Planeje ler em voz alta no começo de absolutamente cada encontro"
    ],
    [
      "Escolha dois horários de encontro: um à noite, outro de dia ou no fim de semana",
      "Rascunhe um panfleto em palavras simples: de graça, aberto, sem requisitos",
      "Corte qualquer frase que insinue vergonha ou diagnóstico",
      "Afixe onde as pessoas já vão: clínicas, lavanderias, cafés",
      "Peça aos programas parceiros que entreguem em mãos"
    ],
    [
      "Marque no calendário uma conversa mensal a sós com cada facilitador",
      "Monte um rodízio de condução para ninguém carregar todos os encontros",
      "Pergunte a cada facilitador onde recebe o próprio apoio",
      "Diga antes que alguém precise: afastar-se é sempre permitido"
    ]
  ],
  "community-fitness": [
    [
      "Escreva cinco perguntas rápidas sobre que movimento as pessoas curtem e o que parece possível",
      "Faça as perguntas esta semana na lavanderia, no prédio das pessoas idosas e no portão da escola",
      "Publique as mesmas perguntas num grupo de mensagens do bairro",
      "Conte as respostas e marque as duas atividades mais pedidas"
    ],
    [
      "Liste três pessoas calorosas e confiáveis que poderiam guiar uma caminhada ou um alongamento",
      "Escreva a cada uma com um pedido concreto: uma sessão por semana, sem precisar ser especialista",
      "Para o fisicamente exigente, pergunte pela qualificação antes de aceitar",
      "Dê a cada nova pessoa guia um reserva que cubra uma semana perdida"
    ],
    [
      "Liste parques, salões e quadras de escola por perto, acessíveis sem carro",
      "Ligue ou visite cada um para perguntar custo, horários e reserva",
      "Percorra os dois melhores conferindo chão plano, assentos, sombra e banheiros",
      "Anote onde as pessoas poderiam se abrigar se o tempo virar",
      "Reserve sua primeira opção por um mês de teste"
    ],
    [
      "Escreva numa página o plano da primeira atividade, partindo da versão mais fácil",
      "Acrescente uma variação a cada movimento: opção na cadeira, circuito mais curto",
      "Corte do plano e dos panfletos qualquer menção a peso ou aparência",
      "Mostre o plano a uma pessoa idosa e a uma iniciante e ajuste"
    ],
    [
      "Compre ou peça emprestado um kit de primeiros socorros e confira o que tem dentro",
      "Inclua um aquecimento de cinco minutos no começo de cada plano de sessão",
      "Acrescente pausas para água na agenda e um lembrete de trazer garrafa",
      "Oriente quem guia a notar o excesso de esforço e a normalizar o descanso",
      "Rascunhe uma linha sugerindo a quem está começando conversar antes com um médico"
    ],
    [
      "Escolha um dia e um horário semanais que você consiga manter por três meses",
      "Faça um panfleto simples dizendo: todas as idades, tamanhos e capacidades são bem-vindos",
      "Afixe na lavanderia, na biblioteca, no prédio das pessoas idosas e nas clínicas",
      "Compartilhe nos grupos de mensagens e peça a cada integrante que repasse uma vez",
      "Crie um lembrete para avisar qualquer cancelamento cedo, nunca em silêncio"
    ],
    [
      "Comece cada sessão com uma rodada rápida de nomes",
      "Peça a uma pessoa assídua que receba quem chega pela primeira vez",
      "Reserve cinco minutos de conversa dentro da agenda",
      "Celebre a constância em aparecer, nunca o peso nem o desempenho"
    ]
  ],
  "urban-orchard": [
    [
      "Anote lugares possíveis: fundos de terras, áreas de parques, congregações com chão livre",
      "Escreva ou ligue para o dono mais promissor e peça uma reunião",
      "Peça de frente dez anos ou mais de acesso e confirme que há água no terreno",
      "Ponha os termos num acordo escrito antes de comprar uma única árvore"
    ],
    [
      "Pesquise sua zona climática e liste as frutíferas que prosperam nela",
      "Pergunte à vizinhança que frutas colheria e comeria de verdade",
      "Desenhe o terreno em camadas: árvores altas, arbustos e cobertura do solo",
      "Confira os pares de polinização de cada variedade da sua lista",
      "Dê espaço para o tamanho adulto da árvore, não o da mudinha"
    ],
    [
      "Localize os viveiros mais próximos e anote a temporada de raiz nua",
      "Cote sua lista de plantas em raiz nua contra vaso",
      "Pergunte por descontos para coletivos, editais e programas de doação",
      "Faça o pedido cedo — as boas variedades esgotam"
    ],
    [
      "Marque cada ponto de plantio do desenho com bandeirinhas ou estacas",
      "Marque um mutirão para capinar e espalhar a cobertura morta",
      "Teste a fonte de água e estenda mangueiras ou tambores",
      "Deixe composto, ferramentas e tutores ao lado de cada ponto"
    ],
    [
      "Escolha uma data na estação de plantio e convide todo mundo",
      "Escreva um guia de uma página: profundidade certa, bacia de rega, anel de cobertura",
      "Destaque alguém com experiência para circular e conferir cada árvore",
      "Garanta água, lanches e música — que seja uma festa",
      "Feche o dia com uma rega funda em cada árvore"
    ],
    [
      "Anote os trabalhos do ano inteiro: rega, poda, cobertura morta e vistoria de pragas",
      "Peça a três pessoas um compromisso anual com nome, não um interesse vago",
      "Monte um rodízio de rega de verão para as árvores jovens",
      "Marque desde já uma data de poda na primavera"
    ],
    [
      "Rascunhe normas simples de colheita: quem colhe, quando e quanto",
      "Leve o rascunho a uma reunião comunitária antes da primeira safra",
      "Garanta destino para o excedente: geladeiras, despensas, refeições compartilhadas",
      "Afixe as normas combinadas numa placa no pomar"
    ]
  ],
  "new-parent-support": [
    [
      "Anote as pessoas que você conhece que cozinham, dirigem ou já criaram um bebê",
      "Escreva a cada uma com um papel concreto: refeições, compras ou apoio entre pares",
      "Peça a duas ou três mães ou pais experientes que sejam seus primeiros pares de apoio",
      "Anote num único lugar a disponibilidade e os limites de cada voluntário"
    ],
    [
      "Escolha uma ferramenta gratuita de corrente de refeições ou um calendário compartilhado e teste",
      "Faça uma ficha curta de dietas e alergias, perguntada uma vez só",
      "Escreva as regras de entrega: na porta por padrão, etiquetada e fácil de requentar",
      "Teste o circuito inteiro com uma família voluntária"
    ],
    [
      "Rascunhe uma lista de ofertas: compras, roupa, louça, cuidado dos irmãos",
      "Combine cada oferta com os voluntários que se inscreveram nela",
      "Fixe a regra: perguntar a cada visita o que é preciso e seguir a lista da família",
      "Agende as duas primeiras semanas de ajuda para a primeira família"
    ],
    [
      "Abra uma planilha simples: nome, serviço, telefone, horário",
      "Acrescente apoio à amamentação, saúde mental pós-parto e clínicas pediátricas",
      "Some fontes locais de itens de bebê, incluindo o banco de fraldas",
      "Ligue uma vez para cada número para confirmar que funciona",
      "Marque no calendário uma revisão do diretório a cada três meses"
    ],
    [
      "Escolha um espaço pequeno e confortável e um horário constante",
      "Peça a uma mãe ou um pai experiente que sustente a primeira roda",
      "Treine os pares nos sinais de depressão e ansiedade pós-parto",
      "Combinem a regra: incentivar o atendimento profissional, nunca diagnosticar nem esperar",
      "Convide em pessoa três ou quatro famílias para a primeira sessão"
    ],
    [
      "Escreva seus passos de verificação: referências no mínimo para quem entra nas casas",
      "Rascunhe os limites: a família dá as condições e as visitas são curtas salvo convite",
      "Acrescente a regra: nunca visitas sem avisar",
      "Repasse as práticas com cada voluntário antes da primeira visita"
    ],
    [
      "Liste os projetos irmãos: banco de fraldas, coletivo de cuidado, comitê de boas-vindas",
      "Encontre alguém de cada um para combinar como fluem os encaminhamentos",
      "Crie uma ficha única de entrada para cada família contar a história uma vez só",
      "Dê a cada família um único ponto de contato"
    ]
  ],
  "foster-kinship-support": [
    [
      "Ligue para o órgão local de acolhimento ou o programa de parentes cuidadores e peça uma reunião",
      "Peça a escolas e grupos de fé que repassem sua oferta às famílias cuidadoras",
      "Escreva a primeira mensagem como uma oferta, nunca como uma triagem",
      "Pergunte às primeiras famílias o que precisaram na primeira semana e no primeiro ano"
    ],
    [
      "Faça a lista por idades: roupas, camas, cadeirinhas e básicos de recém-nascido a adolescente",
      "Organize uma campanha dirigida nomeando os tamanhos e itens que faltam",
      "Confira cada cadeirinha e berço contra prazos de validade e listas de recall",
      "Separe e etiquete tudo por idade e tamanho conforme chega",
      "Encontre um lugar seco que alguém alcance em cima da hora"
    ],
    [
      "Rascunhe a lista da mochila: roupa para uns dias, itens de higiene e um objeto de conforto",
      "Monte as primeiras mochilas separadas por idade e tamanho",
      "Convoque dois motoristas de prontidão que consigam entregar em poucas horas",
      "Defina um único telefone ou e-mail para os chamados de novo acolhimento",
      "Faça um teste cronometrado do chamado até a porta"
    ],
    [
      "Pergunte ao órgão quem pode dar cuidado de respiro e sob que regras",
      "Convoque e verifique voluntários de respiro conforme essas regras exatas",
      "Crie uma folha de reservas que as famílias usem sem precisar implorar",
      "Comece com blocos curtos e regulares — uma noite previsível vale mais que um fim de semana raro"
    ],
    [
      "Escolha um horário fixo e um espaço privado e confortável",
      "Peça a uma cuidadora ou um cuidador experiente para conduzir o grupo junto",
      "Convide por meio do órgão e das escolas — nunca compartilhe listas de famílias",
      "Organize cuidado de crianças durante os encontros para que consigam mesmo vir",
      "Abra cada encontro lembrando a confidencialidade"
    ],
    [
      "Abra uma planilha de serviços, benefícios e apoios com atenção ao trauma",
      "Acrescente os benefícios de parentes cuidadores que ninguém conta às famílias",
      "Ligue para cada entrada para confirmar que segue valendo antes de listar",
      "Ofereça sentar com as famílias enquanto preenchem os pedidos"
    ],
    [
      "Peça ao órgão, por escrito, as regras de verificação e de notificação obrigatória",
      "Escreva sua política de uma página: verificação, deveres de notificação e confidencialidade",
      "Fixe a regra de privacidade: sem fotos, sem histórias, sem detalhes sem permissão",
      "Repasse a política com cada voluntário antes de qualquer contato com as famílias",
      "Marque no calendário uma revisão anual da política"
    ]
  ],
  "weather-survival-outreach": [
    [
      "Escreva duas listas de kit: uma para a estação fria, outra para o calor",
      "Imprima cartões com os abrigos e os números de crise para cada kit",
      "Promova uma sessão de montagem e prepare os primeiros vinte kits",
      "Guarde num lugar seco que os voluntários alcancem rápido"
    ],
    [
      "Cote cobertores, meias, água e eletrólitos no atacado com dois ou três fornecedores",
      "Peça doações a lojas e congregações antes de a estação começar",
      "Faça uma campanha focada nomeando os itens exatos",
      "Separe estoque suficiente para reabastecer no meio da temporada"
    ],
    [
      "Contate quem já faz abordagem de rua nessas rotas e peça para acompanhar",
      "Participe de uma ou duas rondas antes de mapear por conta própria",
      "Anote as localizações sem rigidez — as pessoas se movem, ainda mais com tempo ruim",
      "Crie o hábito de atualizar o mapa depois de cada ronda"
    ],
    [
      "Rascunhe o roteiro do treinamento: abordagem respeitosa, trabalho em duplas, emergências",
      "Peça a alguém experiente na rua que conduza junto o primeiro treinamento",
      "Agende a sessão antes de a estação começar",
      "Mantenha a lista de quem está treinado — ninguém distribui sem estar"
    ],
    [
      "Defina os números da previsão que disparam uma ronda e deixe por escrito",
      "Trace rotas que cheguem primeiro às pessoas mais expostas",
      "Atribua duplas a cada rota, com um reserva para cada uma",
      "Escolha quem acompanha a previsão e manda o aviso de saída"
    ],
    [
      "Liste os centros de apoio contra o frio e o calor, as vagas de abrigo e o centro de recursos",
      "Ligue para cada um para confirmar horários e regras antes de imprimir qualquer coisa",
      "Imprima cartões pequenos para os voluntários entregarem nas rondas",
      "Fixe uma reconfirmação semanal — encaminhar a uma porta fechada queima a confiança"
    ],
    [
      "Imprima um cartão de bolso com os sinais de alerta de hipotermia e insolação",
      "Ensaie a regra no treinamento: chamar a emergência de imediato, nunca esperar para ver",
      "Pratiquem o que fazer enquanto a ajuda vem: sombra e água, ou cobertores e barreira de vento",
      "Peça que cada voluntário guarde no telefone os números locais de emergência e crise"
    ]
  ]
};
