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
// Portuguese project templates (i18n Phase 2b). Loaded lazily via
// content/bundles/pt.ts — never import this statically from app
// code.
import type { ProjectTemplate } from "./projectTemplates";

export const PROJECT_TEMPLATES_PT: readonly ProjectTemplate[] = [
  {
    "id": "community-fridge",
    "name": "Geladeira comunitária e despensa livre",
    "purpose": "Oferecer acesso gratuito, 24 horas por dia, a alimentos e itens essenciais, sem perguntas.",
    "whoItServes": "Qualquer pessoa que precise de comida; ajuda especialmente quem trabalha em horários irregulares, vizinhos sem documentos e quem não consegue chegar a um banco de alimentos em horário comercial.",
    "whatYoullNeed": "Uma geladeira doada, um canto externo protegido com tomada, um espaço anfitrião e uma pequena escala de limpeza.",
    "setupHours": 18,
    "defaultCategory": "food",
    "firstSteps": "Comece pelo espaço anfitrião, não pela geladeira. Sente com a dona da loja, a igreja ou a clínica que você tem em mente e conversem sobre a parte nada glamorosa — a conta de luz, o que acontece quando alguém deixa bagunça, para quem ligar quando quebra — antes de conseguir qualquer aparelho. De quebra, pergunte às despensas e aos grupos de apoio mútuo que já atuam por perto quais lacunas eles veem, para a geladeira preencher uma em vez de duplicá-los.",
    "commonPitfalls": "Geladeiras comunitárias quase nunca morrem por falta de doações — morrem quando ninguém é claramente responsável pela limpeza, a geladeira fica feia e o espaço anfitrião pede em voz baixa que a levem embora. Coloque nomes na escala antes do dia de abertura, e cuide da relação com o anfitrião como aquilo que você realmente está mantendo, não só o aparelho.",
    "pairsWith": [
      "gleaning-network",
      "food-preservation",
      "community-meal"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Encontre um espaço anfitrião com tomada e movimento",
        "description": "Procure pequenos comércios, igrejas, clínicas ou centros comunitários. Pergunte se deixam colocar uma geladeira sob a cobertura e ligá-la na tomada (a luz costuma custar poucos dólares por mês — ofereça-se para cobrir). Consiga um sim por escrito, mesmo que simples.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Consiga uma geladeira e um abrigo contra o tempo",
        "description": "Publique um pedido de geladeira em bom estado nos grupos locais. Construa ou consiga um armário ou abrigo simples de madeira ao redor para protegê-la da chuva e do sol. Fixe bem para não tombar. Inclui encontrar, transportar e montar o abrigo.",
        "hours": 8,
        "skills": [
          "carpintaria",
          "dirigir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Defina as regras e etiquete tudo",
        "description": "Coloque um cartaz claro e multilíngue: pegue o que precisar, deixe o que puder, nada vencido, nem conservas caseiras, nem carne crua. Acrescente etiquetas e uma caneta para as pessoas datarem os itens.",
        "hours": 1.5,
        "skills": [
          "redação",
          "tradução"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Monte uma escala de limpeza e reposição",
        "description": "Crie uma agenda semanal compartilhada. Cada turno leva uns 15 minutos: limpar as superfícies, jogar fora o que estragou ou venceu e anotar o que está acabando. Mantenha material de limpeza no local.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organização"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Construa relações com quem doa",
        "description": "Peça a padarias, mercados, restaurantes e feiras doações regulares no fim do dia. Combine com alguém voluntário para buscar. Anote quais fontes são confiáveis.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Crie um contato para problemas",
        "description": "Deixe um telefone ou e-mail na geladeira para avisos como \"quebrou / faltou luz / uma dúvida\". Decida quem responde e em quanto tempo.",
        "hours": 0.5
      }
    ]
  },
  {
    "id": "community-garden",
    "name": "Horta comunitária / canteiro compartilhado",
    "purpose": "Cultivar juntos comida fresca e gratuita e criar um espaço de encontro.",
    "whoItServes": "Vizinhas e vizinhos sem quintal, pessoas apertadas pelo preço dos alimentos e qualquer um que queira vínculo e um motivo para ficar ao ar livre.",
    "whatYoullNeed": "Um terreno (pode ser um lote vazio ou um telhado), terra ou canteiros, acesso a água, sementes e um grupo base de 5 a 10 pessoas constantes.",
    "setupHours": 25,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Antes de mexer na terra, converse com dois grupos de pessoas: quem é dono do terreno e a vizinhança que mora bem ao lado — a bênção deles pesa tanto quanto o contrato. Depois reúna seu grupo base e tenham logo a conversa sobre como compartilhar; saber se serão canteiros individuais ou colheita comunitária muda tudo o que vocês vão construir.",
    "commonPitfalls": "Hortas não costumam morrer na primavera — morrem nas semanas mais quentes, quando a escala de rega desmorona em silêncio e os canteiros secam. O outro perigo lento é uma pessoa só tratar o espaço como a horta dela com ajudantes; coloquem no papel como as decisões são tomadas enquanto todo mundo ainda se dá bem.",
    "pairsWith": [
      "seed-library",
      "community-composting",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Garanta o terreno e a permissão",
        "description": "Identifique um lote vazio, um pátio de igreja, um terreno de escola ou um canto de praça sem uso. Encontre quem é dono (registros da prefeitura, ou simplesmente pergunte). Consiga uma licença ou contrato por escrito, mesmo um acordo de um ano assinado na confiança, e confirme o acesso à água.",
        "hours": 6,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Analise o solo e planeje os canteiros",
        "description": "Envie uma análise de solo barata a um serviço de extensão local para descartar chumbo e outros contaminantes. Se o solo estiver ruim, planeje canteiros elevados com terra limpa. Esboce onde ficarão canteiros, caminhos e um canto de ferramentas.",
        "hours": 2,
        "skills": [
          "jardinagem"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Reúna materiais e construa",
        "description": "Junte madeira ou use canteiros de fardos de palha ou tipo \"keyhole\", composto e cobertura morta. Marquem um mutirão de construção; muitas mãos levantam canteiros rápido. Instale uma mangueira ou barris de chuva.",
        "hours": 10,
        "skills": [
          "carpintaria"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Decidam como compartilhar",
        "description": "Combinem em grupo: canteiros individuais, colheita totalmente comunitária ou uma mistura. Coloquem no papel como a colheita é dividida e como as decisões são tomadas.",
        "hours": 1,
        "skills": [
          "facilitação"
        ]
      },
      {
        "name": "Plante conforme o clima e a estação",
        "description": "Escolha culturas fáceis e produtivas para a sua região (folhas, feijão, abóbora, tomate, ervas). Escalone os plantios para as colheitas não caírem todas de uma vez. Etiquete as fileiras.",
        "hours": 4,
        "recurringCadence": "cycle",
        "skills": [
          "jardinagem"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Organize uma escala de rega e capina",
        "description": "As plantas morrem mais por descuido do que por qualquer outra coisa. Monte uma agenda compartilhada simples; ligue as tarefas a lembretes fáceis. Mantenha o compromisso leve para ninguém se esgotar.",
        "hours": 1,
        "skills": [
          "organização"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Planeje a colheita e o excedente",
        "description": "Decidam os dias de colheita. Encaminhem o que sobrar para a geladeira comunitária, a vizinhança ou uma banquinha gratuita no portão. Guardem algumas sementes para o ano seguinte.",
        "hours": 1,
        "recurringCadence": "cycle",
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "tool-lending-library",
    "name": "Biblioteca de ferramentas e equipamentos",
    "purpose": "Permitir que a vizinhança pegue emprestado ferramentas e equipamentos em vez de comprar, economizando dinheiro e reduzindo desperdício.",
    "whoItServes": "Quem mora de aluguel, quem acabou de comprar casa, quem tem um hobby e qualquer pessoa que faça consertos ou projetos de vez em quando.",
    "whatYoullNeed": "Um espaço para guardar, ferramentas doadas, um sistema simples de empréstimo e um par de \"bibliotecárias\" ou \"bibliotecários\".",
    "setupHours": 20,
    "defaultCategory": "infrastructure",
    "firstSteps": "Antes de juntar uma única furadeira, converse com a pessoa que oferece o espaço sobre o que significa de verdade conviver com uma biblioteca de ferramentas — barulho, coisas se acumulando, gente desconhecida na porta durante o horário. Depois pergunte à vizinhança o que pegariam emprestado de verdade; uma lista de dez ferramentas pedidas vale mais que uma garagem cheia de doações que ninguém quer.",
    "commonPitfalls": "Bibliotecas de ferramentas morrem do silêncio depois do prazo de devolução: ninguém dá seguimento, as ferramentas viram empréstimos permanentes e as prateleiras se esvaziam. Uma rotina gentil de lembretes importa mais que uma política dura de atrasos — e aprendam a dizer não a doações, ou vocês viram o depósito de ferramentas quebradas do bairro.",
    "pairsWith": [
      "library-of-things",
      "repair-cafe",
      "weatherization-brigade"
    ],
    "learnMore": [
      "confirm-exchange"
    ],
    "tasks": [
      {
        "name": "Encontre onde guardar e um horário de atendimento",
        "description": "Serve um galpão, uma garagem, um armário num centro comunitário ou um contêiner. Escolha de 2 a 4 horas fixas por semana para as pessoas saberem quando ir.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Reúna e organize o acervo",
        "description": "Faça uma chamada de doações (as pessoas têm furadeiras e escadas duplicadas por todo lado). Limpe, teste e etiquete cada ferramenta. Descarte ou conserte o que estiver inseguro.",
        "hours": 6,
        "skills": [
          "dirigir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Catalogue tudo",
        "description": "Use uma planilha gratuita ou um aplicativo de biblioteca de empréstimos. Registre cada item, o estado dele e uma foto. Numere as ferramentas para facilitar o acompanhamento.",
        "hours": 4,
        "skills": [
          "digitação de dados"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Escreva as regras de empréstimo",
        "description": "Defina o prazo (por exemplo, uma semana), quantos itens por vez e a política de devolução e atraso. Seja flexível — aqui a base é a confiança. Anote quais ferramentas pedem uma breve orientação de segurança.",
        "hours": 1,
        "skills": [
          "redação"
        ]
      },
      {
        "name": "Monte o registro de saída",
        "description": "Uma prancheta ou um formulário simples: nome, contato, item, data de saída, data de devolução. Tire uma foto rápida do estado da ferramenta na saída para evitar disputas.",
        "hours": 2,
        "skills": [
          "digitação de dados"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Capacite quem atende",
        "description": "Mostre às pessoas voluntárias o catálogo, os passos do empréstimo e a segurança básica (óculos de proteção, uso de escadas). Tenha uma folha de consulta de uma página no balcão.",
        "hours": 2,
        "skills": [
          "ensino"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Mantenha e faça crescer a biblioteca",
        "description": "Inspecione as ferramentas devolvidas, afie e lubrifique com regularidade e acompanhe o que mais pedem para saber o que acrescentar depois.",
        "hours": 2,
        "skills": [
          "conserto de ferramentas"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "neighborhood-care-network",
    "name": "Rede de cuidado da vizinhança",
    "purpose": "Garantir que vizinhas e vizinhos em isolamento sejam visitados, ouvidos e acompanhados.",
    "whoItServes": "Pessoas idosas, vizinhos com deficiência ou doença crônica, mães e pais recentes e qualquer pessoa que more sozinha.",
    "whatYoullNeed": "Uma lista de pessoas voluntárias, uma forma de combiná-las com a vizinhança e uma rotina de contato. Quem faz o voluntariado é da vizinhança, não profissional do cuidado — verifiquem quem faz visitas em casa, nunca deixem uma pessoa voluntária cuidar sozinha do dinheiro de alguém e combinem de antemão quando chamar a família ou os serviços de emergência.",
    "setupHours": 18,
    "defaultCategory": "emotional_support",
    "firstSteps": "Comece escutando, não recrutando: converse com as vizinhas e vizinhos que você espera apoiar sobre o que eles realmente querem — uma ligação semanal, uma carona, companhia — porque uma rede construída sobre suposições parece vigilância. Ao mesmo tempo, tenha a conversa honesta com as primeiras pessoas voluntárias sobre verificação de referências e limites, para que, quando o primeiro par acontecer, as regras soem como cuidado, não como desconfiança.",
    "commonPitfalls": "Redes de cuidado raramente fracassam por falta de gente voluntária — elas esgotam as três pessoas que sempre dizem sim enquanto as outras esperam ser chamadas. Distribua os pares de propósito, mantenha as conversas de desabafo com quem faz o voluntariado mesmo quando tudo parece bem, e não deixe os contatos transformarem uma vizinha num prontuário em vez de uma pessoa.",
    "pairsWith": [
      "rides-transportation",
      "disability-support-network",
      "welcome-wagon"
    ],
    "learnMore": [
      "message-someone"
    ],
    "tasks": [
      {
        "name": "Descubra quem está por perto",
        "description": "Com discrição, identifique pessoas que possam estar isoladas, pelo boca a boca, administração de prédios, clínicas e grupos religiosos. Nunca presuma a necessidade — convide, não aponte.",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Convoque e verifique as pessoas voluntárias",
        "description": "Procure quem possa se comprometer com um contato regular. Para visitas em casa ou apoio a pessoas adultas vulneráveis, faça verificações básicas de referências e nunca deixe uma pessoa voluntária cuidar sozinha do dinheiro de alguém.",
        "hours": 5,
        "skills": [
          "divulgação",
          "entrevistas"
        ]
      },
      {
        "name": "Forme os pares com cuidado",
        "description": "Combine por idioma, proximidade e afinidade. Pergunte às duas pessoas o que desejam — uma ligação semanal, uma ida ao mercado, uma conversa na varanda — e respeite esse limite.",
        "hours": 2,
        "skills": [
          "organização"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Defina um ritmo de contato",
        "description": "Combinem a frequência e o meio (ligação, mensagem, bater na porta). Dê às pessoas voluntárias um roteiro curto para o primeiro contato, para soar caloroso, não clínico.",
        "hours": 1,
        "follows": [
          2
        ]
      },
      {
        "name": "Crie um plano para situações de crise",
        "description": "Decida de antemão o que fazer se alguém não responder ou parecer em crise: para quem ligar, quando envolver a família ou os serviços de emergência e como registrar. Mantenha por escrito e simples.",
        "hours": 2,
        "skills": [
          "redação"
        ]
      },
      {
        "name": "Coordene a ajuda prática",
        "description": "Acompanhe as necessidades recorrentes — caronas para consultas, buscar remédios, tirar a neve — e conecte-as a outras pessoas voluntárias ou projetos do seu programa.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organização"
        ]
      },
      {
        "name": "Cuide também de quem acompanha",
        "description": "Mantenha um espaço de desabafo para as pessoas voluntárias. Trabalho de cuidado desgasta; reveze as tarefas e fique de olho no esgotamento.",
        "hours": 2,
        "skills": [
          "facilitação"
        ],
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "emergency-preparedness",
    "name": "Rede de preparação para emergências e desastres",
    "purpose": "Ajudar a vizinhança a se preparar e responder a desastres (ondas de calor, tempestades, enchentes, apagões) quando a ajuda oficial demora.",
    "whoItServes": "Todo mundo, com prioridade para quem não consegue evacuar com facilidade ou depende de energia para equipamentos médicos.",
    "whatYoullNeed": "Uma lista de contatos, um ponto de encontro, suprimentos básicos e um plano de comunicação que funcione sem internet. Esta rede complementa os serviços oficiais de emergência — não os substitui. Numa situação de risco de vida, liguem sempre primeiro para os serviços de emergência.",
    "setupHours": 30,
    "defaultCategory": "organizing",
    "firstSteps": "Construa o plano em torno das pessoas para quem ele existe: bata nas portas de vizinhos que dependem de oxigênio, de remédios refrigerados ou que moram em andares altos sem elevador, e pergunte como é uma semana ruim para eles. Depois fale com quem controla o seu provável ponto seguro e com qualquer grupo de emergência que já exista (a defesa civil, os bombeiros), para a sua rede preencher as lacunas em volta da resposta oficial em vez de duplicá-la.",
    "commonPitfalls": "Essas redes não falham durante o desastre — falham nos anos calmos de antes, quando a corrente de contatos envelhece, os telefones mudam e o plano mora no computador de uma pessoa só. Imprimam tudo, atualizem a lista num ritmo fixo no calendário e treinem pelo menos uma vez; o primeiro uso real nunca deveria ser o primeiro uso.",
    "pairsWith": [
      "cooling-warming-center",
      "community-first-aid-training",
      "community-wifi-mesh"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Mapeie os riscos da sua vizinhança",
        "description": "Liste os desastres mais prováveis onde você está. Anote os pontos vulneráveis: pessoas em andares altos sem elevador, quem usa oxigênio ou remédios refrigerados, prédios com uma saída só.",
        "hours": 4
      },
      {
        "name": "Monte uma corrente de contatos",
        "description": "Reúna contatos, quarteirão por quarteirão, com consentimento. Escolha algumas pessoas \"capitãs de quarteirão\", cada uma cuidando de uns 10 lares. Guarde uma cópia em papel — telefones e internet falham nos desastres.",
        "hours": 8,
        "skills": [
          "divulgação",
          "digitação de dados"
        ]
      },
      {
        "name": "Planeje a comunicação sem internet",
        "description": "Decidam como se comunicar sem sinal de telefone: bater nas portas, um ponto de encontro, apitos ou rádios. Imprima e distribua o plano.",
        "hours": 3,
        "skills": [
          "redação"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Estoque suprimentos compartilhados",
        "description": "Monte um kit comunitário: água, primeiros socorros, lanternas, pilhas, um rádio de pilha ou manivela, cobertores e ferramentas básicas. Guarde onde algumas pessoas tenham acesso.",
        "hours": 5,
        "skills": [
          "dirigir"
        ]
      },
      {
        "name": "Identifique pontos seguros",
        "description": "Encontre lugares que possam servir de centro de resfriamento ou aquecimento, ou ponto de recarga (um salão com gerador, uma praça com sombra). Confirme o acesso com antecedência.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Façam um simulado ou uma noite informativa",
        "description": "Organize uma sessão sobre mochilas de emergência, como fechar os registros da casa e a corrente de contatos. Pratiquem uma vez para ninguém estar aprendendo durante a emergência de verdade.",
        "hours": 5,
        "skills": [
          "ensino",
          "facilitação"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Defina os papéis para \"a hora H\"",
        "description": "Defina de antemão quem checa primeiro as pessoas clinicamente vulneráveis, quem abre o ponto seguro e quem coordena. Revisem e atualizem o plano duas vezes por ano.",
        "hours": 2,
        "skills": [
          "organização"
        ],
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "free-store",
    "name": "Loja gratuita / troca de objetos",
    "purpose": "Redistribuir de graça roupas, artigos de casa e suprimentos.",
    "whoItServes": "Qualquer pessoa — gente em aperto, gente desapegando das coisas de casa e o meio ambiente.",
    "whatYoullNeed": "Um espaço (mesmo temporário), mesas ou araras, pessoas voluntárias para a triagem e uma agenda regular.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Converse primeiro com o espaço anfitrião sobre as realidades honestas — pilhas de doações, gente entrando e saindo, como o salão amanhece no dia seguinte — e depois com uma loja de segunda mão ou uma organização próxima sobre o que já chega de sobra, para saber o que falta de verdade no seu bairro. Se puder, passe uma hora numa loja gratuita que já funcione antes do seu primeiro evento; o fluxo de recepção e exposição é mais fácil de copiar do que de inventar.",
    "commonPitfalls": "Lojas gratuitas se afogam antes de passar fome: sem uma lista firme de sim e não na porta, as pessoas voluntárias passam cada hora separando doações quebradas e sujas em vez de receber gente. E decidam para onde vão as sobras antes de o primeiro evento terminar — uma pilha de coisas sem dono e sem plano de saída é o jeito clássico de perder o espaço anfitrião.",
    "pairsWith": [
      "repair-cafe",
      "library-of-things",
      "mutual-aid-moving-crew"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Escolha o formato e o espaço",
        "description": "Decidam entre uma loja gratuita fixa, um evento recorrente tipo pop-up ou uma troca de um dia só. Peçam emprestado um salão, uma loja ou um quiosque de praça. Uma data que se repete cria hábito.",
        "hours": 2
      },
      {
        "name": "Defina o que se aceita como doação",
        "description": "Aceitem só coisas limpas, funcionando e usáveis. Publique uma lista clara de \"sim\" e \"não\" (nada de eletrônicos quebrados, roupas sujas ou artigos de bebê retirados do mercado). Isso economiza um tempo enorme de triagem.",
        "hours": 0.5,
        "skills": [
          "redação"
        ]
      },
      {
        "name": "Organize a recepção e a triagem",
        "description": "Monte estações: receber, separar por categoria e preparar para expor. Tenham um plano para o que não puderem usar (doar adiante ou reciclar).",
        "hours": 2,
        "skills": [
          "organização"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Exponha para as pessoas escolherem com dignidade",
        "description": "Pendure as roupas por tamanho, agrupe os artigos de casa, mantenha tudo arrumado e acolhedor. Sem formulário, sem comprovação de necessidade — é só levar o que for usar.",
        "hours": 1.5,
        "skills": [
          "design"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Montem a equipe do evento",
        "description": "Defina quem recebe, quem separa e quem responde perguntas. Um tom amigável e sem julgamentos é o ponto todo.",
        "hours": 3,
        "skills": [
          "organização"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Cuide das sobras",
        "description": "Combinem com antecedência para onde vão os itens que ninguém levou após cada evento (uma organização parceira, reciclagem têxtil), para o espaço voltar limpo.",
        "hours": 1,
        "skills": [
          "dirigir"
        ]
      }
    ]
  },
  {
    "id": "skill-share",
    "name": "Troca de saberes e aulas gratuitas",
    "purpose": "Deixar vizinhas e vizinhos ensinarem e aprenderem uns com os outros, de graça — cozinha, consertos, idiomas, orçamento, primeiros socorros, habilidades digitais.",
    "whoItServes": "Todo mundo; especialmente quem não pode pagar aulas e as pessoas cujo conhecimento raramente é valorizado.",
    "whatYoullNeed": "Um espaço, gente disposta a ensinar e um jeito de publicar a agenda.",
    "setupHours": 9,
    "defaultCategory": "education",
    "firstSteps": "O projeto começa com as conversas de duas perguntas, não com o local: pergunte às pessoas o que poderiam ensinar e o que adorariam aprender, e preste atenção especial aos vizinhos cujo conhecimento raramente é tratado como especialidade. Sua primeira tarefa de verdade é tomar um café com aquela pessoa nervosa que poderia ensinar e garantir que a sessão dela não precisa ser uma palestra.",
    "commonPitfalls": "Trocas de saberes se apagam quando as mesmas duas pessoas seguras acabam ensinando tudo e a agenda se dobra em silêncio às noites livres de quem organiza, e não às de quem participa. Continue convidando quem nunca ensinou, pergunte quem está faltando na sala e trate uma sessão de cinco pessoas como um sucesso, porque é.",
    "pairsWith": [
      "time-bank",
      "digital-literacy",
      "repair-cafe"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Pesquise saberes e interesses",
        "description": "Faça duas perguntas a quem participa: o que você poderia ensinar? E o que adoraria aprender? Reúna as respostas num formulário simples. Onde elas se cruzam está o seu programa.",
        "hours": 1.5,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Convide e prepare quem ensina",
        "description": "Garanta às pessoas que \"ensinar\" pode ser informal. Ajude a esboçar uma sessão de uma hora e a reunir materiais. Forme dupla entre quem estreia nervoso e alguém para coapresentar.",
        "hours": 3,
        "skills": [
          "ensino",
          "facilitação"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Encontre espaço e horário",
        "description": "Use uma sala de biblioteca, um centro comunitário, uma praça ou a sala de alguém. Escolha horários recorrentes para virar rotina.",
        "hours": 1.5
      },
      {
        "name": "Monte uma agenda",
        "description": "Liste as sessões com data, tema, quem ensina e o que levar. Publique onde as pessoas já olham. Mantenha a inscrição leve ou de porta aberta.",
        "hours": 1.5,
        "recurringCadence": "month",
        "skills": [
          "organização"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Torne tudo acessível",
        "description": "Considere necessidades de idioma, cuidado das crianças, acesso físico e horários para quem trabalha. Pergunte a quem participa o que ajudaria a vir.",
        "hours": 1.5,
        "skills": [
          "acessibilidade",
          "tradução"
        ]
      }
    ]
  },
  {
    "id": "bulk-buying-coop",
    "name": "Cooperativa de compras de alimentos no atacado",
    "purpose": "Juntar pedidos para comprar comida e itens básicos no atacado, a preços mais baixos.",
    "whoItServes": "Lares apertados pelos preços do mercado, famílias grandes e bairros sem acesso fácil a comida.",
    "whatYoullNeed": "Um grupo comprometido de lares, um fornecedor atacadista, um espaço para receber e separar, e alguém para cuidar dos pedidos.",
    "setupHours": 20,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Reúna seus lares antes de ligar para qualquer fornecedor, e tenha primeiro a conversa desconfortável sobre dinheiro: com quanto cada um pode se comprometer, como o pagamento acontece antes de o pedido sair e o que significa pular um ciclo. Uma ligação para um clube de compras que já funcione — a maioria compartilha com gosto a planilha e as cicatrizes — economiza uma temporada de tentativa e erro.",
    "commonPitfalls": "Cooperativas de compra morrem de atrito com dinheiro e de cansaço de quem coordena: alguém adianta o dinheiro e se ressente, um pedido fica sem pagar, ou uma pessoa só carrega cada ciclo em silêncio até desistir, e tudo para. Recebam o pagamento antes de pedir, sem exceção, e revezem a coordenação a partir do segundo ciclo, não um dia desses.",
    "pairsWith": [
      "community-market",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Reúna seu grupo de compras",
        "description": "Recrute lares suficientes para alcançar o mínimo do fornecedor (costuma ser de 8 a 15). Combinem um ciclo de compra (semanal, quinzenal, mensal).",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Encontre um fornecedor",
        "description": "Contate atacadistas de alimentos, cooperativas de produtores, fornecedores de restaurantes ou clubes de compras. Compare pedidos mínimos, opções de entrega e preços. Confirme quais itens básicos eles têm.",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Monte o sistema de pedidos",
        "description": "Usem uma planilha compartilhada ou um formulário em que cada lar anote as quantidades até a data de fechamento. Escolham uma pessoa coordenadora para somar e fazer o pedido.",
        "hours": 3,
        "skills": [
          "digitação de dados",
          "organização"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Cuide do dinheiro com transparência",
        "description": "Combinem o pagamento desde o início (recebam antes de pedir, para ninguém adiantar dinheiro do próprio bolso). Registrem cada centavo num livro-caixa compartilhado. Somem uma pequena reserva opcional para perdas, não para lucro.",
        "hours": 2,
        "skills": [
          "contabilidade"
        ]
      },
      {
        "name": "Organize a entrega e um espaço de separação",
        "description": "Escolham um lugar para receber a entrega no atacado — uma garagem, um salão, uma entrada de casa. Marquem mãos suficientes para o dia da descarga.",
        "hours": 3,
        "skills": [
          "organização"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Dividam os pedidos com justiça",
        "description": "Montem estações de separação com balanças para grãos e verduras a granel. Imprima a lista de cada lar de antemão. Confiram duas vezes antes da retirada.",
        "hours": 3,
        "skills": [
          "organização"
        ],
        "follows": [
          2,
          4
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Revezem o trabalho",
        "description": "Coordenar, separar e retirar devem revezar, para nenhuma pessoa carregar tudo. Revisem os preços e a confiabilidade do fornecedor a cada ciclo.",
        "hours": 1,
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "repair-cafe",
    "name": "Café de conserto",
    "purpose": "Consertar coisas quebradas — roupas, eletrônicos, bicicletas, móveis — de graça, em vez de jogá-las fora.",
    "whoItServes": "Qualquer pessoa com algo quebrado e sem dinheiro ou habilidade para consertar; mantém fora do lixo o que ainda serve.",
    "whatYoullNeed": "Pessoas voluntárias habilidosas, ferramentas básicas, um espaço com mesas e tomadas, e uma data recorrente.",
    "setupHours": 14,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Recrute suas primeiras duas ou três pessoas que consertam antes de qualquer outra coisa — a vizinha que costura, o amigo que mexe com bicicletas — porque data e local não significam nada sem elas. Depois percorram juntos o espaço conversando sobre mesas, energia e luz, e se houver um café de conserto numa cidade próxima, visite uma sessão; o fluxo de recepção é a parte que vale a pena copiar.",
    "commonPitfalls": "Os cafés de conserto viram, sem querer, oficinas gratuitas de entrega: as pessoas deixam suas coisas e vão embora, quem conserta vira técnico sem pagamento, e quem entende de eletrônica se esgota primeiro. Sustente a regra de que cada pessoa acompanha o próprio conserto, e avise com clareza que algumas coisas não têm salvação — uma decepção tratada desde o início é mais fácil que uma cobrança depois.",
    "pairsWith": [
      "tool-lending-library",
      "community-bike-workshop",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Recrute quem conserta, por especialidade",
        "description": "Encontre pessoas boas de costura, eletrônica pequena, bicicletas, eletrodomésticos e marcenaria. Bastam uma ou duas por categoria para começar.",
        "hours": 4,
        "skills": [
          "conserto",
          "eletrônica",
          "costura"
        ]
      },
      {
        "name": "Monte as estações de conserto",
        "description": "Cada estação precisa de uma mesa, das ferramentas certas, boa luz e uma tomada. Agrupe consertos parecidos. Identifique as estações com clareza.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "organização"
        ]
      },
      {
        "name": "Marque uma data recorrente",
        "description": "Uma vez por mês costuma funcionar. Escolha um local fixo — biblioteca, espaço maker, salão comunitário — para as pessoas saberem aonde levar as coisas.",
        "hours": 1
      },
      {
        "name": "Crie um fluxo de recepção",
        "description": "Uma pessoa na porta registra cada visitante e objeto, e encaminha para quem conserta. Deixe claro desde o início: cada pessoa fica e ajuda no próprio conserto quando pode; é um espaço de aprender, não um balcão de entrega.",
        "hours": 2,
        "skills": [
          "redação"
        ]
      },
      {
        "name": "Cuide da segurança e das expectativas",
        "description": "Avise que alguns objetos não têm salvação e que os consertos são tentados, não garantidos. Tenham práticas seguras para itens elétricos e baterias. Mantenham um kit de primeiros socorros à mão.",
        "hours": 2
      },
      {
        "name": "Mantenha um estoque de peças e consumíveis comuns",
        "description": "Tenha à mão linha, fusíveis, cola, parafusos, câmaras de ar e remendos. Anote o que for usado para repor depois.",
        "hours": 2,
        "recurringCadence": "session",
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "rides-transportation",
    "name": "Caronas e apoio com transporte",
    "purpose": "Levar vizinhas e vizinhos a consultas médicas, ao mercado e a tarefas essenciais quando o transporte e o dinheiro são obstáculos.",
    "whoItServes": "Pessoas sem carro, vizinhas e vizinhos com deficiência, pessoas idosas e qualquer pessoa que o transporte público não alcança.",
    "whatYoullNeed": "Pessoas voluntárias ao volante, um método para pedir e organizar as caronas, e regras claras de segurança e seguro. Dirigir levando a vizinhança é uma responsabilidade séria — confirmem a habilitação e o seguro de cada pessoa que dirige, avaliem quem vai levar passageiros vulneráveis e nunca usem uma carona voluntária no lugar de uma ambulância numa emergência médica.",
    "setupHours": 18,
    "defaultCategory": "transport",
    "firstSteps": "Duas rodadas de conversa vêm antes da primeira carona: sente com cada pessoa que quer dirigir para confirmar habilitação e seguro e falar com honestidade sobre a verificação de antecedentes, e converse com quem precisa das caronas — e com os centros de convivência e as clínicas que conhecem essas pessoas — sobre destinos, horários e necessidades de mobilidade reais. A conversa sobre verificação é mais fácil como norma de fundação do que como regra imposta depois.",
    "commonPitfalls": "Redes de carona falham na coordenação, não na direção: os pedidos caem no telefone de uma pessoa só até esgotá-la, e as mesmas duas pessoas confiáveis recebem todos os pedidos enquanto outras nunca mais são chamadas depois de um único não. Revezem a coordenação, distribuam os pedidos de propósito e nunca deixem a pergunta do seguro para depois da primeira batida.",
    "pairsWith": [
      "health-navigation",
      "community-bike-workshop",
      "court-support"
    ],
    "learnMore": [
      "claim-post"
    ],
    "tasks": [
      {
        "name": "Recrute e avalie quem dirige",
        "description": "Confirme que cada pessoa tem habilitação válida, seguro e um veículo seguro. Para caronas com pessoas vulneráveis, faça verificação de referências ou de antecedentes conforme os costumes da sua região.",
        "hours": 5,
        "skills": [
          "direção"
        ]
      },
      {
        "name": "Resolva seguro e responsabilidade",
        "description": "Verifique o que o seguro pessoal de cada pessoa cobre ao dirigir como voluntária. Considere um termo simples de responsabilidade e consulte um serviço local de assistência jurídica gratuita — isso protege todo mundo.",
        "hours": 4,
        "skills": [
          "papelada"
        ]
      },
      {
        "name": "Monte um sistema de pedidos",
        "description": "Escolha um único canal para pedir caronas (linha de telefone, formulário, grupo de mensagens) com uma antecedência mínima (por exemplo, 48 horas). Registre horário de saída, locais, necessidades de mobilidade e contato.",
        "hours": 2,
        "skills": [
          "organização",
          "tecnologia"
        ]
      },
      {
        "name": "Crie uma rotina de coordenação",
        "description": "Tenha uma pessoa coordenadora (em revezamento) que combine os pedidos com quem está disponível e confirme com os dois lados na véspera. Mantenha uma lista de reservas para cancelamentos.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organização"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Definam o que é coberto",
        "description": "Decidam quais viagens entram (médicas, mercado, tarefas essenciais) e a área de atendimento. Sejam claros sobre tempos de espera e se quem dirige ajuda a carregar as sacolas.",
        "hours": 1,
        "skills": [
          "facilitação"
        ]
      },
      {
        "name": "Cuidem dos custos",
        "description": "Decidam como a gasolina é coberta — um pequeno fundo comum, contribuições opcionais de quem viaja, ou nada. Mantenham tudo transparente e nunca deixem isso virar uma barreira para quem precisa da carona.",
        "hours": 2,
        "follows": [
          4
        ]
      },
      {
        "name": "Mantenha a segurança de quem viaja e de quem dirige",
        "description": "Combinem normas: quem dirige não entra sozinho nas casas, não se mexe com dinheiro além dos custos combinados, e há uma conversa depois de caronas com pessoas vulneráveis. Registrem cada carona.",
        "hours": 2,
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "tenant-union",
    "name": "Sindicato de inquilinas e inquilinos e rede de defesa contra despejos",
    "purpose": "Organizar quem aluga para se defender de despejos, condições inseguras e aumentos abusivos de aluguel por meio da ação coletiva.",
    "whoItServes": "Inquilinas e inquilinos, especialmente em prédios com proprietários negligentes ou ausentes, e qualquer pessoa enfrentando um despejo.",
    "whatYoullNeed": "Um grupo organizador de base, informação local precisa sobre os direitos de quem aluga, um vínculo com a assistência jurídica gratuita e um sistema de contato rápido. Este projeto apoia inquilinas e inquilinos e compartilha informação jurídica pública; não substitui a orientação de profissionais. Sempre encaminhe os casos individuais à assistência jurídica qualificada antes dos prazos.",
    "setupHours": 30,
    "defaultCategory": "housing",
    "firstSteps": "Fale com as inquilinas e os inquilinos afetados antes de qualquer contato com o proprietário, sempre — bata nas portas, escute o que as pessoas de fato temem e querem, e deixe quem mora em cada prédio ditar o ritmo, porque é quem carrega o risco de retaliação, não quem organiza. Em paralelo, apresente-se cedo ao serviço de assistência jurídica local; você vai querer essa relação antes de chegar o primeiro aviso de despejo, não depois.",
    "commonPitfalls": "O jeito de um sindicato de inquilinos machucar as pessoas é andar mais rápido que elas: um confronto lançado antes de o prédio estar pronto expõe as vizinhas mais vulneráveis a retaliações que não escolheram. O fracasso mais silencioso é escorregar de compartilhar informação jurídica para dar orientação jurídica — encaminhe cada caso individual à assistência jurídica qualificada antes dos prazos, todas as vezes.",
    "pairsWith": [
      "legal-aid-clinic",
      "mutual-aid-moving-crew",
      "solidarity-fund"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Recrute um comitê organizador de base",
        "description": "Encontre de 3 a 6 inquilinas e inquilinos comprometidos para ancorar o trabalho. Procure pessoas respeitadas nos próprios prédios. Combinem papéis, um ritmo de reuniões e metas em comum.",
        "hours": 5,
        "skills": [
          "organização"
        ]
      },
      {
        "name": "Mapeie os prédios e os problemas de quem mora",
        "description": "Bata nas portas ou faça um levantamento para saber quais prédios têm problemas e quais são (consertos ignorados, cobranças ilegais, assédio). Acompanhe os padrões e encontre as lideranças naturais de cada prédio.",
        "hours": 8,
        "skills": [
          "divulgação",
          "entrevistas"
        ]
      },
      {
        "name": "Reúna informação local precisa sobre direitos",
        "description": "Compile as leis reais da sua região sobre prazos de aviso de despejo, consertos, caução e regras de aluguel. Faça parceria com um serviço de assistência jurídica para conferir tudo. Isso é informação compartilhada, não orientação jurídica — deixem isso claro para quem participa.",
        "hours": 4,
        "skills": [
          "papelada",
          "redação"
        ]
      },
      {
        "name": "Monte um sistema de contato de resposta rápida",
        "description": "Crie uma corrente telefônica ou um grupo de mensagens para quem receber um aviso de despejo ou encontrar a fechadura trocada alcançar o sindicato rápido. Decidam quem responde e em quanto tempo.",
        "hours": 3,
        "skills": [
          "organização",
          "suporte técnico"
        ]
      },
      {
        "name": "Organize uma oficina “conheça seus direitos”",
        "description": "Façam uma sessão (de preferência com o parceiro de assistência jurídica) mostrando às inquilinas e aos inquilinos seus direitos e o que fazer ao receber uma notificação. Entreguem guias impressos para levar para casa, nos idiomas necessários.",
        "hours": 4,
        "recurringCadence": "event",
        "skills": [
          "ensino",
          "facilitação"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Definam um protocolo de resposta a despejos",
        "description": "Escrevam um passo a passo simples para quando alguém enfrentar um despejo: documentar tudo, contatar a assistência jurídica dentro do prazo, organizar o apoio da vizinhança e nunca ignorar as datas de audiência.",
        "hours": 3,
        "skills": [
          "redação"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Conecte-se à assistência jurídica e ao apoio contínuo",
        "description": "Construa uma relação de encaminhamento com advogadas de inquilinos, assistência jurídica e serviços de orientação de moradia, para o sindicato passar adiante os casos que precisam de ajuda profissional. Mantenha os contatos em dia.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      }
    ]
  },
  {
    "id": "childcare-collective",
    "name": "Coletivo de cuidado de crianças e babás compartilhadas",
    "purpose": "Compartilhar cuidado de crianças de confiança entre famílias, para que mães, pais e quem cuida possam trabalhar, descansar ou resolver emergências sem pagar por isso.",
    "whoItServes": "Mães, pais e pessoas cuidadoras, especialmente quem cria sozinho, quem trabalha por turnos e famílias de renda mais baixa.",
    "whatYoullNeed": "Um grupo de famílias avaliadas, um espaço seguro (ou casas em revezamento), um sistema de agenda e regras claras de segurança. Cuidar dos filhos de outras pessoas é uma responsabilidade séria — mantenha regras firmes de supervisão, avalie quem cuida e siga as normas locais sobre cuidado infantil informal.",
    "setupHours": 28,
    "defaultCategory": "childcare",
    "suggestsWorkDays": true,
    "firstSteps": "Este projeto se constrói nas salas de estar antes de qualquer outro lugar: reúna as famílias fundadoras e conversem sobre os detalhes desconfortáveis — verificação de antecedentes, supervisão, estilos de disciplina, o que acontece quando uma criança se machuca — antes de alguém agendar uma única hora de cuidado. Confira nesse mesmo começo as normas locais sobre cuidado infantil informal, para que o modelo combinado seja um que vocês possam sustentar de verdade.",
    "commonPitfalls": "Duas coisas quebram em silêncio os coletivos de cuidado: o desequilíbrio de créditos, em que as mesmas famílias sempre recebem em casa até se ressentirem, e regras de segurança que afrouxam conforme a confiança cresce — a exceção de “só desta vez” à regra de nunca a sós é exatamente como a confiança se destrói. Deixem o saldo à vista de todos e levem as regras de segurança mais a sério justamente com as famílias que vocês mais conhecem.",
    "pairsWith": [
      "toy-library",
      "time-bank",
      "youth-mentorship"
    ],
    "learnMore": [
      "what-is-balance"
    ],
    "tasks": [
      {
        "name": "Reúna as famílias fundadoras e combinem um modelo",
        "description": "Recrute famílias que se conhecem ou que podem construir confiança entre si. Decidam o modelo: uma cooperativa de babás em revezamento, em que mães e pais ganham e gastam créditos de cuidado, ou cuidado em grupo com horário marcado.",
        "hours": 4,
        "skills": [
          "divulgação",
          "facilitação"
        ]
      },
      {
        "name": "Definam padrões de segurança e avaliação",
        "description": "Combinem a avaliação de qualquer pessoa que cuide das crianças: referências, verificação de antecedentes quando fizer sentido e uma regra firme de que nenhum adulto fica sozinho com a criança de outra família sem que ninguém saiba. Definam a proporção de adultos por criança.",
        "hours": 6,
        "skills": [
          "cuidado de crianças"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Encontre um espaço e deixe-o seguro para crianças",
        "description": "Escolham um local ou definam padrões para as casas anfitriãs. Verifiquem riscos, cubram tomadas, prendam móveis pesados, tranquem remédios e produtos de limpeza, e confirmem uma área externa segura, se houver.",
        "hours": 4,
        "skills": [
          "cuidado de crianças",
          "consertos domésticos"
        ]
      },
      {
        "name": "Criem um sistema de agenda e créditos",
        "description": "Usem um calendário compartilhado ou um aplicativo de cooperativa. No modelo de créditos, uma hora de cuidado dada vale uma hora a receber. Registrem quem recebe em casa e quando, para a carga continuar justa.",
        "hours": 3,
        "skills": [
          "organização",
          "digitação de dados"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Definam políticas de saúde, alergias e emergências",
        "description": "Reúnam informações de alergias, remédios, contatos de emergência e autorizações de retirada de cada criança. Escrevam uma política clara para criança doente e o que fazer numa emergência médica.",
        "hours": 3,
        "skills": [
          "papelada",
          "redação"
        ]
      },
      {
        "name": "Treinem o básico com quem cuida",
        "description": "Cubram supervisão, sono seguro para bebês, resposta a alergias e emergências, e as regras de segurança. Incentivem pelo menos uma pessoa adulta com certificação em primeiros socorros pediátricos e RCP por sessão.",
        "hours": 5,
        "skills": [
          "ensino",
          "primeiros socorros"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Façam uma sessão piloto e recolham impressões",
        "description": "Façam um piloto curto com poucas famílias e conversem depois. Arrumem o que não funcionou antes de crescer. Conversem com frequência, para a confiança e a segurança continuarem firmes.",
        "hours": 3,
        "skills": [
          "cuidado de crianças"
        ],
        "follows": [
          2,
          5
        ]
      }
    ]
  },
  {
    "id": "community-composting",
    "name": "Programa de compostagem comunitária",
    "purpose": "Recolher restos de comida para desviar resíduos do aterro e produzir composto gratuito para as hortas locais.",
    "whoItServes": "Casas sem onde compostar, hortas comunitárias e o meio ambiente local.",
    "whatYoullNeed": "Um local de compostagem, baldes de coleta, equipamento básico e uma pequena escala de manutenção.",
    "setupHours": 22,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Fale com quem recebe o local e com a vizinhança a distância de cheiro antes de o primeiro balde chegar — o medo de cheiro e de ratos mata os locais de compostagem, e uma conversa honesta e cedo desarma isso melhor que qualquer panfleto. Depois encontre o destino do seu composto (uma horta comunitária interessada) e pelo menos uma pessoa que já tenha mantido viva uma pilha quente; o olhar dela vai definir qual método escolher.",
    "commonPitfalls": "Projetos de compostagem morrem quando ninguém assume o revirar: a pilha para ou começa a cheirar, alguém da vizinhança reclama e o anfitrião retira a permissão — essa corrente anda mais rápido do que parece. Ajuste a quantidade de restos recolhidos ao que a escala consegue processar de verdade, e trate um lote contaminado como um problema de sinalização a corrigir, não como uma pessoa voluntária a culpar.",
    "pairsWith": [
      "community-garden",
      "community-meal"
    ],
    "tasks": [
      {
        "name": "Encontre um local de compostagem",
        "description": "Garanta um lugar com espaço e um pouco de sol — um canto de horta comunitária, um terreno vazio ou um quintal disposto. Confirme a permissão e verifique as regras locais sobre compostagem.",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Escolha um método de compostagem",
        "description": "Escolha o que cabe na sua escala: um sistema quente de três caixas, composteiras giratórias ou minhocários. Ajuste o método à quantidade de material esperada e a quanto revirar vocês dão conta.",
        "hours": 3,
        "skills": [
          "compostagem"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Consiga baldes e equipamento",
        "description": "Construa ou compre os recipientes de coleta e a estrutura de compostagem. Junte um forcado, um termômetro e material marrom (folhas, papelão) para equilibrar os restos de comida.",
        "hours": 4,
        "skills": [
          "carpintaria",
          "direção"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Monte um sistema de coleta",
        "description": "Decidam como os restos chegam: um balde de entrega com horários fixos ou uma rota voluntária de coleta. Deem a quem participa baldinhos de pia e um calendário claro de entrega.",
        "hours": 4,
        "skills": [
          "organização"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Deixem claro o que é aceito",
        "description": "Coloquem uma lista simples de sim e não (sim: frutas, legumes, café, cascas de ovo; não: carne, laticínios, óleos, fezes de animais). Uma sinalização clara evita a contaminação que estraga um lote.",
        "hours": 2,
        "skills": [
          "redação",
          "tradução"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Recrute e treine uma escala de manutenção",
        "description": "Compostagem precisa de reviradas regulares, verificação de umidade e equilíbrio entre verdes e marrons. Montem uma escala compartilhada e ensinem o básico a quem participa, para as pilhas não cheirarem nem pararem.",
        "hours": 3,
        "skills": [
          "compostagem",
          "ensino"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Distribua o composto pronto",
        "description": "Quando o composto estiver pronto, compartilhe de graça com quem contribuiu e com as hortas comunitárias. Anunciem os dias de retirada e peçam para levar sacos ou baldes.",
        "hours": 2,
        "skills": [
          "direção"
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "free-little-library",
    "name": "Pequena biblioteca livre e troca de livros",
    "purpose": "Oferecer livros de graça 24 horas por dia para incentivar a leitura e o compartilhamento, sem carteirinha nem taxas.",
    "whoItServes": "Crianças, famílias e quem lê em todas as idades, principalmente em bairros com pouco acesso a livros.",
    "whatYoullNeed": "Uma caixa de livros à prova de tempo, um acervo inicial, um ponto anfitrião e uma manutenção leve.",
    "setupHours": 7.5,
    "defaultCategory": "education",
    "firstSteps": "Comece com duas conversas curtas: uma com a pessoa cujo muro ou quintal vai receber a caixa, sobre onde colocá-la e o que acontece se ela ficar malcuidada, e outra com as famílias e a escola próximas sobre que livros levariam para casa de verdade. Garanta quem vai zelar pela caixa — a pessoa que a confere toda semana — antes de instalá-la, não depois.",
    "commonPitfalls": "As bibliotecas livres não morrem por falta de livros — morrem pelos errados: alguém despeja uma caixa de livros didáticos velhos, os bons títulos ficam soterrados, entra chuva e as pessoas param de olhar sem dizer nada. Uma visita semanal de cinco minutos de quem zela previne quase tudo; a caixa precisa mais de uma pessoa do que de doações.",
    "pairsWith": [
      "seed-library",
      "books-to-prisoners"
    ],
    "tasks": [
      {
        "name": "Construa ou consiga uma caixa de livros à prova de tempo",
        "description": "Faça ou compre uma caixa firme e à prova d'água, num poste ou numa parede. Um armário reaproveitado ou uma caixa de jornal serve. Coloque uma porta transparente e um teto inclinado para os livros ficarem secos.",
        "hours": 4,
        "skills": [
          "carpintaria"
        ]
      },
      {
        "name": "Escolha e prepare um lugar",
        "description": "Escolha um ponto com movimento de pedestres e permissão — seu próprio quintal, um centro comunitário ou a beira de um parque. Fixe bem a caixa e confirme que é permitido.",
        "hours": 1,
        "skills": [
          "divulgação"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Monte o acervo inicial",
        "description": "Reúna livros doados com uma pequena campanha. Busque variedade: livros infantis, ficção popular e não ficção prática. Comece pela metade, para haver espaço de acrescentar.",
        "hours": 1.5,
        "skills": [
          "divulgação"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Coloque uma placa e normas simples",
        "description": "Escreva “Leve um livro, deixe um livro — tudo de graça”. Mantenha o tom acolhedor e com poucas regras. Acrescente um convite a todas as idades e idiomas.",
        "hours": 0.5,
        "skills": [
          "redação"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Encontre quem vai zelar pela caixa",
        "description": "Peça a alguém que more perto para conferir a caixa toda semana: arrumar, tirar o que estiver danificado ou impróprio e reequilibrar o acervo. Cinco minutos por semana a mantêm saudável.",
        "hours": 0.5,
        "skills": [
          "divulgação"
        ]
      }
    ]
  },
  {
    "id": "community-first-aid-training",
    "name": "Treinamento comunitário de primeiros socorros e resposta a overdose",
    "purpose": "Treinar a vizinhança em primeiros socorros, RCP e reversão de overdose, para a comunidade responder nos minutos antes de os profissionais chegarem.",
    "whoItServes": "Todo mundo; com mais impacto onde os serviços de emergência demoram ou as taxas de overdose são altas.",
    "whatYoullNeed": "Instrutores certificados, materiais, um espaço e um calendário recorrente. Todo treinamento médico deve ser dado por instrutores certificados; este projeto organiza e recebe esse treinamento, não o substitui.",
    "setupHours": 17,
    "defaultCategory": "education",
    "firstSteps": "Sua primeira conversa é com quem vai de fato ensinar — a Cruz Vermelha, a secretaria de saúde ou um grupo de redução de danos. Pergunte o que precisam de quem recebe e que datas podem oferecer, e depois converse com as pessoas mais propensas a presenciar uma emergência — familiares de pessoas que usam drogas, quem trabalha nos comércios próximos — para as primeiras sessões serem montadas ao redor delas.",
    "commonPitfalls": "Este projeto se apaga quando vira um único evento grande que nunca se repete — as habilidades enferrujam e a naloxona vence sem ninguém notar. E resistam à vontade de ensinar o conteúdo médico por conta própria; o papel de vocês é receber instrutores certificados, não substituí-los.",
    "pairsWith": [
      "harm-reduction-supplies",
      "emergency-preparedness"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Faça parceria com instrutores certificados",
        "description": "Conecte-se com profissionais qualificados — a Cruz Vermelha, a secretaria de saúde local ou uma organização de redução de danos. São essas pessoas que dão o treinamento médico de verdade; seu papel é organizar e receber.",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Consiga os materiais",
        "description": "Providencie kits de primeiros socorros, bonecos de treino de RCP (muitas vezes emprestados por quem treina) e naloxona. Muitos programas de saúde pública distribuem naloxona de graça — pergunte na secretaria de saúde ou aos grupos de redução de danos.",
        "hours": 3,
        "skills": [
          "divulgação",
          "direção"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Encontre espaço e agende as sessões",
        "description": "Reserve uma sala que comporte a prática no chão — um centro comunitário, uma biblioteca ou uma clínica. Marque datas recorrentes, para as pessoas conseguirem se organizar com o trabalho.",
        "hours": 2
      },
      {
        "name": "Convide participantes",
        "description": "Divulguem bastante e deem prioridade a quem tem mais chance de presenciar emergências. Mantenham a inscrição fácil e gratuita, e ofereçam horários variados para quem trabalha por turnos.",
        "hours": 2,
        "skills": [
          "divulgação"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Faça as sessões de treinamento",
        "description": "Receba as sessões conduzidas por quem instrui, cuide da montagem e da chegada, e garanta que todo mundo pratique com as mãos. Entregue cartões de referência para levar para casa.",
        "hours": 4,
        "skills": [
          "organização"
        ],
        "follows": [
          0,
          1,
          3
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Distribua kits e marque reciclagens",
        "description": "Mande as pessoas treinadas para casa com um kit de primeiros socorros e, onde estiver disponível, naloxona. Programem reciclagens periódicas para as habilidades continuarem afiadas.",
        "hours": 2,
        "recurringCadence": "session",
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "time-bank",
    "name": "Banco de tempo",
    "purpose": "Permitir que os membros troquem serviços por tempo, em que uma hora dada vale uma hora ganha, valorizando por igual a contribuição de cada pessoa.",
    "whoItServes": "Qualquer pessoa, principalmente quem tem tempo e habilidades de sobra, mas pouco dinheiro.",
    "whatYoullNeed": "Uma lista de membros, um sistema de registro, uma pessoa coordenadora e regras combinadas.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Comece por conversas, não por software: sente com dez ou quinze vizinhas e vizinhos e pergunte a cada pessoa o que ofereceria e o que pediria. Se dessas conversas não sair variedade — caronas, aulas de reforço, consertos, cozinha — continue convidando gente antes de montar o sistema.",
    "commonPitfalls": "Bancos de tempo raramente morrem de escândalo; morrem de silêncio — as pessoas se inscrevem, ninguém faz o primeiro pedido e tudo esfria. Tenha uma pessoa coordenadora costurando trocas ativamente nos primeiros meses, e segurem a linha de uma hora vale uma hora: no momento em que se discute se a hora de quem mexe com encanamento vale mais que a de quem cuida de crianças, deixa de ser um banco de tempo.",
    "pairsWith": [
      "skill-share",
      "childcare-collective"
    ],
    "learnMore": [
      "what-is-balance",
      "negative-balance"
    ],
    "tasks": [
      {
        "name": "Recrute membros fundadores e façam um inventário de habilidades",
        "description": "Reúna um grupo inicial e pergunte a cada pessoa o que pode oferecer (caronas, aulas de reforço, consertos, cozinha, jardinagem) e o que precisa. A variedade de ofertas é o que faz funcionar.",
        "hours": 5,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Escolha um sistema de registro",
        "description": "Escolham como registrar horas: software próprio de banco de tempo, uma planilha compartilhada ou um caderno simples. Precisa registrar quem deu e quem recebeu horas.",
        "hours": 4,
        "skills": [
          "suporte técnico",
          "digitação de dados"
        ]
      },
      {
        "name": "Definam as regras",
        "description": "Combinem o princípio central (uma hora = um crédito, seja qual for a tarefa), como os membros pedem e confirmam as trocas e o que acontece quando o saldo de alguém fica muito baixo.",
        "hours": 4,
        "skills": [
          "facilitação",
          "redação"
        ]
      },
      {
        "name": "Deem as boas-vindas aos membros",
        "description": "Façam uma orientação curta para as pessoas entenderem a filosofia e o sistema. Deem a cada pessoa alguns créditos iniciais para as trocas começarem na hora.",
        "hours": 4,
        "skills": [
          "ensino"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Lance um diretório de serviços",
        "description": "Publiquem uma lista pesquisável de quem oferece o quê. Mantenham em dia, para os membros acharem ajuda sem perguntar sempre a quem coordena.",
        "hours": 4,
        "skills": [
          "digitação de dados"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Coordene e costure as trocas",
        "description": "Tenha uma pessoa coordenadora ajudando a casar necessidades com ofertas, principalmente no começo, e dando um toque em quem está quieto. Com o tempo, os membros se conectam diretamente.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organização"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Construam práticas de confiança e segurança",
        "description": "Definam normas para trocas em casas ou com membros vulneráveis (referências, não se encontrar a sós quando incomodar). Acrescentem um jeito simples de sinalizar problemas.",
        "hours": 4,
        "skills": [
          "facilitação"
        ]
      }
    ]
  },
  {
    "id": "solidarity-fund",
    "name": "Fundo solidário (apoio mútuo em dinheiro)",
    "purpose": "Juntar dinheiro para entregar ajuda direta em dinheiro, sem condições, a vizinhas e vizinhos que enfrentam uma crise.",
    "whoItServes": "Pessoas atingidas por emergências — um aluguel que ficou curto, uma conta médica, um corte de luz.",
    "whatYoullNeed": "Um sistema transparente para o dinheiro, uma pequena equipe responsável, um plano de arrecadação e critérios claros. Cuidar de dinheiro em comum traz responsabilidade de verdade — usem dupla assinatura, mantenham registros limpos, protejam a privacidade de quem recebe e busquem orientação sobre o lado legal e fiscal do fundo.",
    "setupHours": 23,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Antes de juntar o primeiro centavo, sente com as poucas pessoas a quem você confiaria dinheiro em comum e conversem com honestidade: como vai funcionar a dupla assinatura, o que se publica e o que acontece quando os pedidos passarem do fundo. Depois procure uma organização local sem fins lucrativos ou alguém de contabilidade para explicar o lado legal e fiscal antes de abrir a conta.",
    "commonPitfalls": "Dinheiro quebra a confiança mais rápido que qualquer outra coisa — um pagamento sem explicação ou um livro-caixa desleixado pode acabar com o fundo mesmo sem ninguém ter feito nada de errado. E quase sempre haverá mais pedidos do que dinheiro; se os critérios não foram combinados antes, dizer não caso a caso esgota a equipe e planta ressentimento.",
    "pairsWith": [
      "resource-hub-dispatch",
      "tenant-union",
      "free-tax-prep"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Forme uma pequena equipe responsável",
        "description": "Convoque algumas pessoas de confiança para administrar o fundo. Definam papéis com clareza e se comprometam com a transparência desde o primeiro dia — aqui a confiança é tudo.",
        "hours": 3,
        "skills": [
          "organização"
        ]
      },
      {
        "name": "Monte um sistema transparente para o dinheiro",
        "description": "Abram uma conta dedicada ou usem um patrocinador fiscal. Exijam duas pessoas aprovando cada pagamento, mantenham um livro-caixa claro e verifiquem se a estrutura tem implicações fiscais ou legais — consultem uma organização local sem fins lucrativos ou alguém de contabilidade.",
        "hours": 5,
        "skills": [
          "contabilidade",
          "papelada"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Definam critérios de pedido e de repasse",
        "description": "Decidam quem pode pedir, os valores típicos, de quanto em quanto tempo alguém pode pedir e se vale a ordem de chegada ou o peso da necessidade. Mantenham as barreiras baixas e evitem exigir comprovação de dificuldade sempre que puderem.",
        "hours": 4,
        "skills": [
          "facilitação"
        ]
      },
      {
        "name": "Crie um formulário de pedido simples e sem barreiras",
        "description": "Façam um formulário curto e privado que pergunte só o necessário. Ofereçam vários jeitos de pedir (online, por telefone, em pessoa) e protejam a privacidade de quem pede.",
        "hours": 2,
        "skills": [
          "redação"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Ponha a arrecadação de pé",
        "description": "Combinem pequenas doações recorrentes de membros com campanhas ocasionais. Sejam claros com quem doa: os fundos vão direto para vizinhos e vizinhas em necessidade.",
        "hours": 4,
        "skills": [
          "divulgação"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Monte um processo de decisão e pagamento",
        "description": "Definam um prazo de resposta, uma revisão rápida pela equipe e formas velozes de pagamento. Em uma crise, a velocidade importa. Documentem cada decisão de um jeito simples.",
        "hours": 3,
        "skills": [
          "organização"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Preste contas com transparência",
        "description": "Compartilhem resumos regulares — dinheiro que entra, dinheiro que sai, número de vizinhas e vizinhos apoiados — sem expor a identidade de quem recebeu. A transparência mantém as doações vindo.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "redação",
          "contabilidade"
        ]
      }
    ]
  },
  {
    "id": "diaper-hygiene-bank",
    "name": "Banco de fraldas e itens de higiene",
    "purpose": "Distribuir de graça fraldas, produtos menstruais e itens de higiene, que não dá para comprar com a maioria dos auxílios alimentares.",
    "whoItServes": "Famílias de baixa renda, bebês, pessoas que menstruam e vizinhas e vizinhos em situação de rua.",
    "whatYoullNeed": "Um lugar para guardar, um fluxo de doações, pontos de distribuição e pessoas voluntárias.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Fale primeiro com quem já vê as famílias — a clínica pediátrica, o banco de alimentos, a igreja — e pergunte quais tamanhos e produtos faltam de verdade e se topariam receber a distribuição. Essa única conversa poupa meses de adivinhação.",
    "commonPitfalls": "O que mais machuca é a irregularidade: uma grande campanha, prateleiras cheias e depois meses vazios bem quando as famílias já contavam com você. Cuide também do estoque real — fraldas de recém-nascido se acumulam enquanto os tamanhos grandes acabam — e nunca peça comprovação de necessidade; a dignidade faz parte do serviço.",
    "pairsWith": [
      "welcome-wagon",
      "laundry-shower-access"
    ],
    "tasks": [
      {
        "name": "Encontre um lugar para guardar e um ponto de distribuição",
        "description": "Garanta um espaço seco e seguro para guardar e um lugar para entregar os itens — um armário numa clínica, igreja ou centro comunitário. O ponto de entrega deve parecer privado e digno.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Organize o abastecimento",
        "description": "Combine compras no atacado, campanhas de doação e contatos com redes de bancos de fraldas ou atacadistas. Acompanhe quais fontes são constantes para não ficar sem estoque.",
        "hours": 3,
        "skills": [
          "divulgação",
          "dirigir"
        ]
      },
      {
        "name": "Separe e inventarie por tamanho e tipo",
        "description": "Organize as fraldas por tamanho, mais os produtos menstruais e itens de higiene. Mantenha uma contagem atualizada para saber o que pedir. Os tamanhos para bebês maiores costumam faltar.",
        "hours": 1.5,
        "skills": [
          "organização",
          "digitação de dados"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Defina uma política de distribuição justa",
        "description": "Decidam quanto cada família recebe e com que frequência, sem barreira de comprovação de necessidade. Que seja previsível, para as pessoas poderem contar com isso.",
        "hours": 1,
        "skills": [
          "facilitação"
        ]
      },
      {
        "name": "Agende a distribuição e reúna quem ajuda",
        "description": "Definam dias regulares de distribuição, convoquem pessoas voluntárias para entregar os itens e mantenham o tom acolhedor e sem julgamentos.",
        "hours": 2.5,
        "skills": [
          "organização"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-bike-workshop",
    "name": "Oficina comunitária de bicicletas",
    "purpose": "Oferecer de graça espaço, ferramentas e ajuda para consertar, montar e ganhar bicicletas, tornando o transporte acessível e barato.",
    "whoItServes": "Pessoas sem carro, a juventude, quem se desloca para o trabalho e qualquer pessoa que precise de transporte barato.",
    "whatYoullNeed": "Um espaço, ferramentas, bicicletas e peças doadas, e mecânicas e mecânicos voluntários.",
    "setupHours": 20,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Antes de caçar um espaço, converse com quem usaria a oficina e com quem ensinaria mecânica — e, se houver uma oficina comunitária de bicicletas numa cidade próxima, visite e pergunte o que fariam diferente. Com quem ceder o espaço, acerte desde o início guarda, acesso e seguro.",
    "commonPitfalls": "A oficina morre quando as pessoas voluntárias consertam as bicicletas em vez de ensinar a consertar: vira oficina gratuita, a fila cresce e a equipe de mecânica se esgota. Cuidado também para não afundar em bicicletas-sucata doadas — façam triagem sem dó — e nenhuma bicicleta sai sem revisão de freios e pneus.",
    "pairsWith": [
      "repair-cafe",
      "rides-transportation",
      "tool-lending-library"
    ],
    "tasks": [
      {
        "name": "Encontre um espaço para a oficina",
        "description": "Garanta uma garagem, um porão, um contêiner ou um espaço comunitário compartilhado com lugar para trabalhar e guardar bicicletas. Confirme o acesso e qualquer necessidade de seguro.",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Junte ferramentas e um cavalete",
        "description": "Reúna um kit básico de ferramentas de bicicleta e pelo menos um cavalete de reparo, com doações ou um pequeno orçamento. Organize as ferramentas para ser fácil achar e devolver.",
        "hours": 5,
        "skills": [
          "dirigir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Recolha bicicletas e peças doadas",
        "description": "Façam chamadas por bicicletas paradas e peças aproveitáveis. Separem em “dá conserto”, “para peças” e “pronta para rodar”. Uma reserva de peças é o que mantém a oficina andando.",
        "hours": 4,
        "skills": [
          "consertos",
          "dirigir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Convoque mecânicas e mecânicos voluntários",
        "description": "Encontre algumas pessoas que saibam consertar bicicletas e, mais importante, ensinar. A meta é ajudar as pessoas a aprender a consertar a própria bicicleta, não fazer por elas.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Defina horários e um modelo “ganhe sua bicicleta”",
        "description": "Escolham horários previsíveis. Considerem um programa “ganhe sua bicicleta”, em que alguém aprende a consertar ao longo de algumas sessões e sai com a bicicleta que arrumou.",
        "hours": 2,
        "skills": [
          "organização"
        ]
      },
      {
        "name": "Estabeleça práticas de segurança",
        "description": "Exijam proteção para os olhos, definam regras para o uso das ferramentas e tenham um kit de primeiros socorros. Façam sempre uma revisão de segurança (freios, pneus, direção) antes de qualquer bicicleta sair.",
        "hours": 2,
        "skills": [
          "redação"
        ]
      }
    ]
  },
  {
    "id": "newcomer-translation-network",
    "name": "Rede de apoio a pessoas recém-chegadas e de tradução",
    "purpose": "Ajudar pessoas migrantes e refugiadas a se virar num lugar novo — tradução, papelada, orientação e conexão comunitária.",
    "whoItServes": "Pessoas migrantes e refugiadas recém-chegadas, e vizinhos e vizinhas que não falam o idioma local.",
    "whatYoullNeed": "Pessoas voluntárias bilíngues, organizações parceiras, materiais de orientação e um sistema de pedidos. Tenham cuidado especial com a privacidade: não registrem situação migratória, encaminhem dúvidas legais a advogadas e advogados de imigração qualificados e deixem que as pessoas da comunidade digam que apoio realmente querem.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Comece conversando com as próprias comunidades recém-chegadas e com as organizações que já caminham com elas — que elas digam que apoio querem, em vez de alguém desenhar de fora. E antes de chegar o primeiro pedido, deixe pronto o encaminhamento: advogadas e advogados de imigração qualificados para receber toda dúvida legal.",
    "commonPitfalls": "O risco mais sério é gente voluntária bem-intencionada escorregar de interpretar para dar conselhos legais ou médicos sem qualificação — uma orientação migratória ruim pode custar caríssimo a alguém. E recolham o mínimo de dados: um registro descuidado sobre a situação de uma pessoa pode colocá-la em perigo real.",
    "pairsWith": [
      "welcome-wagon",
      "legal-aid-clinic",
      "health-navigation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Convoque pessoas voluntárias bilíngues e multilíngues",
        "description": "Encontre pessoas voluntárias que falem os idiomas comuns na sua região e possam ajudar com tradução, formulários e acompanhamento. Que os idiomas correspondam às necessidades locais reais.",
        "hours": 4,
        "skills": [
          "tradução",
          "divulgação"
        ]
      },
      {
        "name": "Mapeie serviços e parcerias locais",
        "description": "Monte um diretório de clínicas, escolas, assistência jurídica, aulas de ESL, recursos de alimentação e organizações que atendem pessoas migrantes. Muitas vezes quem chegou só precisa saber o que existe e como chegar lá.",
        "hours": 5,
        "skills": [
          "divulgação",
          "digitação de dados"
        ]
      },
      {
        "name": "Monte um sistema de pedidos e conexões",
        "description": "Crie um jeito simples de quem chegou pedir ajuda e ser conectado a alguém voluntário por idioma e necessidade. Ofereçam opções por telefone e em pessoa, não só pela internet.",
        "hours": 3,
        "skills": [
          "organização",
          "suporte técnico"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Crie materiais de orientação",
        "description": "Reúnam guias em linguagem simples, nos idiomas necessários, sobre transporte, escolas, saúde e direitos. Usem imagens para funcionarem em diferentes níveis de leitura.",
        "hours": 4,
        "skills": [
          "redação",
          "tradução"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Ofereça acompanhamento a consultas e atendimentos",
        "description": "Organizem para que pessoas voluntárias acompanhem as pessoas a consultas médicas, escolares ou de serviços, para interpretar e apoiar. Orientem quem acompanha a interpretar com fidelidade, não a dar conselhos sem qualificação.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "tradução"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Estabeleçam práticas de privacidade e segurança",
        "description": "Recolham só a informação mínima necessária e nunca perguntem nem registrem situação migratória. Guardem os dados com segurança e preparem as pessoas voluntárias para lidar com situações sensíveis com discrição.",
        "hours": 3,
        "skills": [
          "redação"
        ]
      }
    ]
  },
  {
    "id": "community-meal",
    "name": "Refeição comunitária / Cozinha do povo",
    "purpose": "Cozinhar e compartilhar refeições comunitárias gratuitas em dias certos, sem perguntas.",
    "whoItServes": "Qualquer pessoa com fome, isolada ou em insegurança alimentar; também cria laços pelo bairro.",
    "whatYoullNeed": "Uma cozinha, gente que cozinhe, um fluxo de ingredientes, um espaço para servir e uma equipe voluntária. Servir comida ao público traz responsabilidades reais de segurança alimentar — verifiquem as regras locais sobre alvarás e pessoas certificadas em manipulação de alimentos, e sigam sempre práticas seguras de armazenamento e temperatura.",
    "setupHours": 22,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Suas duas primeiras conversas são com quem cederia a cozinha — um salão paroquial ou centro comunitário — sobre os dias que você planeja, e com a vigilância sanitária local sobre alvarás e manipulação de alimentos; isso define todo o resto. Depois pergunte a quem viria comer que dia e horário funcionam de verdade.",
    "commonPitfalls": "Um descuido de segurança alimentar pode machucar alguém e acabar com o projeto — as regras de temperatura e armazenamento não se pulam, nem uma vez. A morte lenta é as mesmas três pessoas cozinharem toda refeição até se esgotarem, então ampliem a equipe e alternem quem lidera a cozinha desde o começo.",
    "pairsWith": [
      "gleaning-network",
      "community-garden",
      "community-fridge"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Encontrem uma cozinha e um espaço para servir",
        "description": "Consigam uma cozinha grande o bastante para cozinhar em escala — um salão paroquial, centro comunitário ou cozinha comercial — além de espaço para servir. Confirmem a disponibilidade nos dias planejados.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Resolvam a segurança alimentar e os alvarás",
        "description": "Verifiquem as regras locais para servir comida ao público. Pode ser preciso um alvará, uma pessoa certificada em manipulação de alimentos presente ou uma cozinha licenciada. Aprendam armazenamento seguro e controle de temperatura.",
        "hours": 4,
        "skills": [
          "segurança alimentar"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Construam um fluxo de abastecimento de alimentos",
        "description": "Combinem doações de mercados e restaurantes, compras no atacado e qualquer excedente de horta ou de coleta de sobras da colheita. Registrem as fontes confiáveis para planejar os cardápios com o que vão ter.",
        "hours": 3,
        "skills": [
          "divulgação",
          "dirigir"
        ]
      },
      {
        "name": "Planejem cardápios para escala, dietas e alergias",
        "description": "Desenhem refeições simples e nutritivas que rendam em volume e esticem os ingredientes. Ofereçam opções vegetarianas e rotulem com clareza os alérgenos comuns.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "cozinha"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Convoquem uma equipe de cozinha e serviço",
        "description": "Reúnam pessoas voluntárias para preparo, cozimento, serviço e limpeza. Definam quem lidera a cozinha em cada refeição e mantenham os papéis claros para o serviço fluir.",
        "hours": 3,
        "skills": [
          "cozinha",
          "organização"
        ]
      },
      {
        "name": "Definam uma agenda e espalhem a notícia",
        "description": "Escolham um dia e horário regulares para as pessoas poderem contar com isso. Divulguem com panfletos, nos abrigos e de boca em boca, com um tom acolhedor e aberto a todo mundo.",
        "hours": 2,
        "skills": [
          "design gráfico"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Façam a refeição e limpem",
        "description": "Cozinhem, sirvam com dignidade (servir à mesa é melhor que fila, quando der) e deixem a cozinha nos padrões exigidos. Embalem as sobras com segurança para redistribuir.",
        "hours": 5,
        "skills": [
          "cozinha"
        ],
        "follows": [
          3,
          4,
          5
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "seed-library",
    "name": "Biblioteca de sementes e troca de sementes",
    "purpose": "Compartilhar sementes de graça para as pessoas cultivarem comida, preservando variedades crioulas e adaptadas à região.",
    "whoItServes": "Quem cultiva em casa, quem está plantando pela primeira vez e hortas comunitárias.",
    "whatYoullNeed": "Um sistema de guarda e catálogo, sementes doadas, um lugar anfitrião e algumas pessoas cuidadoras.",
    "setupHours": 8,
    "defaultCategory": "food",
    "firstSteps": "Converse com a biblioteca ou o centro comunitário sobre receber o armário, e com jardineiras e jardineiros experientes da região sobre o que cresce de verdade por aí — o sucesso de quem começa depende de semente adequada ao clima. Um viveiro ou uma horta comunitária próxima costuma doar com gosto o estoque inicial.",
    "commonPitfalls": "Uma biblioteca de sementes morre em silêncio: semente velha que não germina, gente que conclui que não sabe plantar e não volta. Renove o estoque sem sentimentalismo e não conte com devoluções — quase ninguém guarda semente — então planeje a reposição com doações, não com retornos.",
    "pairsWith": [
      "community-garden",
      "free-little-library"
    ],
    "tasks": [
      {
        "name": "Encontrem um anfitrião e um sistema de guarda",
        "description": "Façam parceria com uma biblioteca, centro comunitário ou horta para receber um pequeno armário ou gaveteiro. Guardem as sementes em lugar fresco, seco e escuro, em envelopes etiquetados.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Consigam as sementes iniciais",
        "description": "Reúnam doações de quem cultiva, excedentes de empresas de sementes e pacotes de fim de temporada. Deem preferência a variedades fáceis e adaptadas à região, para quem começa ter sucesso.",
        "hours": 2,
        "skills": [
          "divulgação",
          "jardinagem"
        ]
      },
      {
        "name": "Organizem e etiquetem a coleção",
        "description": "Separem por tipo (hortaliça, erva, flor) e dificuldade. Etiquetem cada envelope com a planta, o ano e notas básicas de cultivo. Marquem de quais é fácil guardar semente.",
        "hours": 2,
        "skills": [
          "jardinagem",
          "digitação de dados"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Definam as regras de empréstimo e troca",
        "description": "Mantenham simples: pegue sementes de graça, cultive e, no ideal, guarde e devolva algumas no fim da temporada. Publiquem um guia de uma página de como funciona.",
        "hours": 1,
        "skills": [
          "redação"
        ]
      },
      {
        "name": "Mantenham a viabilidade e reponham o estoque",
        "description": "As sementes perdem viabilidade com o tempo. Renovem o estoque velho, façam testes de germinação nos lotes duvidosos e reponham as variedades populares.",
        "hours": 1,
        "skills": [
          "jardinagem"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "digital-literacy",
    "name": "Alfabetização digital e empréstimo de dispositivos",
    "purpose": "Emprestar dispositivos e ensinar habilidades digitais para encurtar a distância de quem não tem tecnologia nem internet confiáveis.",
    "whoItServes": "Pessoas mais velhas, vizinhos e vizinhas de baixa renda, quem procura emprego e qualquer pessoa deixada de fora dos serviços online.",
    "whatYoullNeed": "Dispositivos doados, acesso à internet, pessoas voluntárias para dar aulas e um espaço.",
    "setupHours": 27,
    "defaultCategory": "tech",
    "firstSteps": "Fale primeiro com as pessoas que você quer alcançar — na biblioteca, no centro de convivência de idosos, na fila do banco de alimentos — e pergunte o que elas de fato querem fazer: telessaúde, candidaturas de emprego, as fotos dos netos. Depois converse com a biblioteca sobre espaço e conectividade antes de juntar um único dispositivo.",
    "commonPitfalls": "Emprestar um dispositivo sem resolver o acesso à internet é emprestar um peso de papel — a conectividade é metade do projeto. Nas sessões, o erro clássico é quem ensina agarrar o mouse e falar em jargão; e nunca empreste de novo um dispositivo sem apagá-lo, porque vazar os dados de alguém quebra toda a confiança construída.",
    "pairsWith": [
      "community-wifi-mesh",
      "skill-share"
    ],
    "learnMore": [
      "install-app",
      "new-device"
    ],
    "tasks": [
      {
        "name": "Recolham e recondicionem dispositivos",
        "description": "Reúnam notebooks, tablets e telefones doados. Apaguem cada um com segurança, atualizem e deixem pronto para um uso fácil. Testem se tudo funciona antes de emprestar.",
        "hours": 8,
        "skills": [
          "suporte técnico",
          "dirigir"
        ]
      },
      {
        "name": "Montem um sistema de empréstimo",
        "description": "Criem um registro simples: quem levou o quê, em que estado e até quando. Decidam a duração do empréstimo e uma política de devolução compreensiva, construída sobre a confiança.",
        "hours": 3,
        "skills": [
          "digitação de dados"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Providenciem o acesso à internet",
        "description": "Um dispositivo serve de pouco sem conexão. Emprestem pontos de acesso móveis, façam parceria com a biblioteca ou indiquem programas de internet de baixo custo e WiFi público gratuito.",
        "hours": 3,
        "skills": [
          "suporte técnico",
          "divulgação"
        ]
      },
      {
        "name": "Convoquem e preparem quem vai ensinar",
        "description": "Encontrem pessoas voluntárias pacientes e as preparem para ensinar sem jargão. Reforcem ir no ritmo de quem aprende e nunca tomar o mouse.",
        "hours": 4,
        "skills": [
          "ensino"
        ]
      },
      {
        "name": "Desenhem um currículo para quem está começando",
        "description": "Montem aulas curtas sobre o essencial: e-mail, segurança online, candidaturas de emprego, telessaúde, formulários do governo e videochamadas. Entreguem guias impressos.",
        "hours": 4,
        "skills": [
          "ensino",
          "redação"
        ]
      },
      {
        "name": "Programem aulas e horários de ajuda livre",
        "description": "Ofereçam tanto aulas estruturadas quanto horários abertos de “ajuda com tecnologia”. Variem os horários por quem trabalha e mantenham grupos pequenos.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "organização"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Definam políticas de segurança de dados e devolução",
        "description": "Apaguem cada dispositivo entre uma pessoa e outra, ensinem hábitos seguros de senha e privacidade e expliquem como os dados pessoais são protegidos. Tenham um plano para perdas e danos.",
        "hours": 2,
        "skills": [
          "suporte técnico",
          "redação"
        ]
      }
    ]
  },
  {
    "id": "weatherization-brigade",
    "name": "Brigada de isolamento térmico e consertos domésticos",
    "purpose": "Ajudar vizinhos e vizinhas de baixa renda, pessoas idosas e com deficiência com consertos e isolamento térmico, para baixar as contas de energia e melhorar a segurança.",
    "whoItServes": "Pessoas proprietárias de baixa renda, idosas e vizinhas e vizinhos com deficiência que não conseguem fazer nem pagar o trabalho.",
    "whatYoullNeed": "Pessoas voluntárias habilidosas, materiais, ferramentas e um sistema de pedidos. Fiquem no que a competência voluntária alcança — encaminhem trabalhos elétricos, de gás, estruturais e de telhado a profissionais habilitados.",
    "setupHours": 21,
    "defaultCategory": "housing",
    "suggestsWorkDays": true,
    "firstSteps": "Reúna primeiro suas pessoas voluntárias mais experientes e combinem juntas a linha de alcance — que trabalhos vocês pegam e quais vão para profissionais habilitados — antes de aceitar um único pedido. Trate a primeira visita a cada casa como uma conversa, não uma inspeção: quem mora decide o que se toca na casa.",
    "commonPitfalls": "O perigo é o alcance crescer sozinho: o “consertinho” que se revela trabalho elétrico, de gás ou de telhado, além da competência voluntária — é aí que alguém se machuca. E não prometam mais visitas do que a equipe consegue cumprir; deixar uma pessoa idosa esperando uma ajuda com que contava dói mais que um não honesto desde o início.",
    "pairsWith": [
      "community-wood-bank",
      "tool-lending-library"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Convoquem pessoas voluntárias habilidosas",
        "description": "Encontrem gente à vontade com carpintaria básica, calafetagem, isolamento e vedação de frestas. Uma ou duas pessoas mais experientes podem guiar o resto.",
        "hours": 4,
        "skills": [
          "carpintaria",
          "consertos domésticos"
        ]
      },
      {
        "name": "Definam o alcance do trabalho",
        "description": "Definam o que vão e o que não vão fazer. Fiquem em trabalhos seguros e simples (vedação, barras de apoio, arrumações menores) e descartem tudo o que exija ofício habilitado, como trabalhos maiores de eletricidade ou gás.",
        "hours": 2,
        "skills": [
          "consertos domésticos"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Montem um sistema de pedidos e avaliação",
        "description": "Criem um jeito de a vizinhança pedir ajuda; depois façam uma visita rápida para dimensionar o serviço, listar materiais e confirmar que está dentro das habilidades e dos limites de segurança de vocês.",
        "hours": 3,
        "skills": [
          "organização"
        ]
      },
      {
        "name": "Consigam materiais e ferramentas",
        "description": "Reúnam selante, vedação de frestas, isolamento e ferragens básicas com doações, descontos ou um pequeno orçamento. Mantenham um kit de ferramentas compartilhado.",
        "hours": 4,
        "skills": [
          "dirigir"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Resolvam segurança e responsabilidade",
        "description": "Usem termos de responsabilidade simples, levem primeiros socorros, exijam equipamento de proteção adequado e nunca tentem trabalho além da competência de vocês. Busquem orientação sobre cobertura de responsabilidade civil para consertos voluntários.",
        "hours": 3,
        "skills": [
          "papelada"
        ]
      },
      {
        "name": "Agendem e façam os mutirões",
        "description": "Combinem os serviços com as equipes voluntárias, confirmem com quem mora e concluam o trabalho numa sessão concentrada. Respeitem a casa e a vontade de quem vive nela o tempo todo.",
        "hours": 5,
        "skills": [
          "organização",
          "consertos domésticos"
        ],
        "follows": [
          1,
          2,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "pet-food-bank",
    "name": "Banco de ração e apoio a animais de estimação",
    "purpose": "Oferecer ração gratuita e ajuda básica de cuidado para que ninguém precise abrir mão de um animal por causa do custo.",
    "whoItServes": "Pessoas de baixa renda com animais de estimação, pessoas idosas com renda fixa e vizinhos em situação de rua com animais.",
    "whatYoullNeed": "Armazenamento, um fluxo constante de ração, um ponto de distribuição e parcerias com veterinários.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Fale primeiro com a despensa de alimentos que já existe sobre distribuir juntos — as mesmas famílias costumam precisar das duas coisas — e com veterinárias e lojas de animais da região sobre doações e talvez uma parceria de vacinas ou descontos.",
    "commonPitfalls": "A irregularidade é o que mais estraga: uma grande campanha e depois prateleiras vazias, quando quem tem animais precisa poder contar com você. E cuidado com o tom — qualquer julgamento sobre se “gente pobre deveria ter animais” mata este projeto mais rápido do que ficar sem ração.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "community-fridge"
    ],
    "tasks": [
      {
        "name": "Encontrem armazenamento e um ponto de distribuição",
        "description": "Garantam um espaço seco e protegido de pragas, e um lugar para entregar a ração — muitas vezes junto de uma despensa de alimentos ou um centro comunitário que já existe.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Montem um fluxo de doações de ração",
        "description": "Combinem campanhas de arrecadação, doações de lojas de animais e fabricantes, e compras no atacado. Registrem o que entra para planejar as distribuições.",
        "hours": 3,
        "skills": [
          "divulgação",
          "dirigir"
        ]
      },
      {
        "name": "Separem e inventariem por animal e porte",
        "description": "Separem ração de cachorro e de gato (e de outros animais), anotem as quantidades e confiram as datas de validade. Mantenham uma contagem atualizada para orientar a reposição.",
        "hours": 1.5,
        "skills": [
          "organização",
          "digitação de dados"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Definam uma política de distribuição",
        "description": "Decidam quanto cada família recebe e com que frequência, sem barreira de comprovação de necessidade. Deixem tudo previsível para que as pessoas possam se planejar.",
        "hours": 1,
        "skills": [
          "facilitação"
        ]
      },
      {
        "name": "Programem e cuidem da distribuição",
        "description": "Definam horários regulares de distribuição, chamem voluntários e mantenham um tom sem julgamentos. Muita gente pula refeições para alimentar seus animais — recebam essas pessoas com respeito.",
        "hours": 2.5,
        "skills": [
          "organização"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "youth-mentorship",
    "name": "Mentoria juvenil e programa depois da escola",
    "purpose": "Dar a crianças e adolescentes um espaço seguro depois das aulas, com ajuda nas lições, mentoria e atividades de enriquecimento.",
    "whoItServes": "Jovens de regiões com poucos recursos e as mães e pais que trabalham e precisam de um cuidado seguro.",
    "whatYoullNeed": "Um espaço seguro, mentores com verificação, atividades e lanches. Trabalhar com jovens traz uma responsabilidade séria — verifiquem as pessoas adultas, mantenham a regra de duas pessoas adultas, sigam as leis de notificação obrigatória e cumpram as regras locais para programas juvenis.",
    "setupHours": 28,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Antes de convocar uma única pessoa mentora, converse com mães, pais e com a própria juventude sobre o que precisam, e deixe as políticas de segurança por escrito — verificação de antecedentes, regra de duas pessoas adultas, notificação obrigatória. Nenhuma pessoa adulta passa tempo com crianças antes de passar por esse filtro.",
    "commonPitfalls": "A pior falha é o atalho na segurança: uma pessoa adulta sem verificação, ou sozinha com uma criança — isso nunca se negocia. A segunda é a rotatividade de mentores; para crianças que já foram deixadas de lado, um adulto que some faz mal, então comece pequeno e cresça só até onde der para supervisionar e sustentar.",
    "pairsWith": [
      "school-supply-program",
      "childcare-collective",
      "community-music"
    ],
    "learnMore": [
      "how-vouching-works"
    ],
    "tasks": [
      {
        "name": "Garantam um espaço seguro e definam o horário",
        "description": "Encontrem um lugar adequado e acessível — uma sala na escola, biblioteca ou centro comunitário — e definam um horário fixo depois das aulas com que as famílias possam contar.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Definam padrões de proteção infantil e verificação",
        "description": "Exijam verificação de antecedentes das pessoas adultas que trabalham com jovens, apliquem a regra de duas pessoas adultas para que ninguém fique sozinho com uma criança, e definam políticas claras de conduta e notificação.",
        "hours": 6,
        "skills": [
          "cuidado de crianças",
          "redação"
        ]
      },
      {
        "name": "Convoquem e capacitem mentoras e mentores",
        "description": "Encontrem pessoas adultas confiáveis e afetuosas, e capacitem essas pessoas em limites, proteção da juventude e como apoiar sem fazer o trabalho pelas crianças. Busquem constância semana a semana.",
        "hours": 6,
        "skills": [
          "divulgação",
          "ensino"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Planejem a programação",
        "description": "Misturem ajuda nas lições com enriquecimento — leitura, arte, esportes, habilidades para a vida. Mantenham tudo envolvente e deixem a juventude ajudar a dar forma ao que é oferecido.",
        "hours": 4,
        "skills": [
          "ensino"
        ]
      },
      {
        "name": "Cuidem de inscrições, alergias e informações de emergência",
        "description": "Recolham a autorização dos responsáveis, detalhes de alergias e saúde, contatos de emergência e quem pode buscar cada criança. Guardem tudo isso com segurança.",
        "hours": 3,
        "skills": [
          "papelada",
          "digitação de dados"
        ]
      },
      {
        "name": "Consigam lanches e materiais",
        "description": "Ofereçam um lanche saudável (muitas crianças chegam com fome) e reúnam livros, materiais de arte e jogos por doações ou com um orçamento pequeno.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Conduzam as sessões e acompanhem as famílias",
        "description": "Abram o espaço, supervisionem de perto, conduzam as atividades e mantenham contato regular com os responsáveis sobre como as crianças estão.",
        "hours": 4,
        "skills": [
          "cuidado de crianças",
          "ensino"
        ],
        "follows": [
          0,
          2,
          3,
          4
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "gleaning-network",
    "name": "Rede de resgate de colheitas",
    "purpose": "Resgatar excedentes de frutas e verduras de sítios, pomares, hortas e feiras, e redistribuir tudo antes que se perca.",
    "whoItServes": "Vizinhas e vizinhos em insegurança alimentar e projetos de comida como geladeiras, despensas e refeições comunitárias.",
    "whatYoullNeed": "Pessoas voluntárias, transporte, vínculos com quem cultiva e armazenamento de curto prazo.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Comece por quem cultiva: sítios, pomares e barracas de feira. Pergunte que excedente têm e o que os preocupa em receber voluntários — responsabilidade, danos à plantação — e deixe combinado para onde a comida vai (geladeiras, despensas, refeições comunitárias) antes da primeira colheita.",
    "commonPitfalls": "A falha clássica é resgatar fruta que depois apodrece na garagem de alguém — a distribuição se combina antes de colher, não depois. As janelas de colheita são curtas, então uma equipe pequena que responde rápido vale mais que uma lista comprida de nomes; e um único resgate descuidado que danifique a plantação pode custar aquela pessoa produtora para sempre.",
    "pairsWith": [
      "community-fridge",
      "food-preservation",
      "community-meal"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Encontrem fontes de colheita",
        "description": "Procurem sítios, pomares, barracas de feira e vizinhos com árvores frutíferas carregadas. Muita gente fica feliz que o excedente seja colhido em vez de apodrecer.",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Convoquem uma equipe de resgate",
        "description": "Montem uma lista de pessoas voluntárias que consigam se mobilizar rápido quando a fruta ou verdura estiver no ponto. As janelas de colheita são curtas, então flexibilidade importa mais que quantidade.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Organizem transporte e armazenamento",
        "description": "Alinhem veículos para mover a colheita e um lugar fresco para guardá-la por pouco tempo. Coordenem para levar a comida rápido do campo até quem recebe, antes que estrague.",
        "hours": 3,
        "skills": [
          "dirigir"
        ]
      },
      {
        "name": "Montem a programação e o chamado",
        "description": "Criem um jeito rápido de avisar e confirmar as pessoas voluntárias quando surgir um resgate, já que quem cultiva costuma avisar em cima da hora. Um chat de grupo ou lista de ligações funciona.",
        "hours": 2,
        "skills": [
          "organização"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Resolvam responsabilidade e cuidado com os alimentos",
        "description": "Conheçam as proteções tipo “Bom Samaritano” para doação de alimentos na sua região, combinem regras simples de manuseio e usem um termo de responsabilidade básico para que quem cultiva receba os resgates com tranquilidade.",
        "hours": 3,
        "skills": [
          "papelada",
          "segurança dos alimentos"
        ]
      },
      {
        "name": "Construam canais de distribuição",
        "description": "Definam para onde a colheita resgatada vai — geladeiras comunitárias, despensas, programas de refeição ou direto para as famílias — para que nunca fique parada.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Façam os resgates e registrem os quilos",
        "description": "Colham com cuidado para proteger o lugar, distribuam logo e registrem quanta comida foi resgatada. Os números ajudam a convocar mais voluntários e mais produtores.",
        "hours": 4,
        "skills": [
          "jardinagem",
          "dirigir"
        ],
        "follows": [
          0,
          2,
          3,
          5
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-mediation",
    "name": "Rede comunitária de mediação e resolução de conflitos",
    "purpose": "Oferecer mediação gratuita e neutra para disputas de vizinhança, resolvendo o conflito sem tribunais nem polícia.",
    "whoItServes": "Vizinhas e vizinhos, inquilinos e proprietários, colegas de moradia e grupos comunitários em conflito.",
    "whatYoullNeed": "Pessoas mediadoras capacitadas, um espaço neutro e um caminho para pedir mediação. A mediação é para disputas entre partes dispostas — filtrem e encaminhem qualquer situação com violência, abuso ou perigo para profissionais adequados ou serviços de emergência.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Converse primeiro com um centro de mediação comunitária existente ou com quem forma mediadores — este ofício não se improvisa — e, antes do primeiro caso, deixem o filtro por escrito: que disputas vocês aceitam e para onde encaminham qualquer situação com violência ou abuso.",
    "commonPitfalls": "A falha perigosa é mediar o que não deve ser mediado: uma “disputa de vizinhança” que na verdade é abuso coloca alguém em risco, então filtrem cada pedido. E a confidencialidade é todo o capital do projeto — um único detalhe vazado e ninguém volta a confiar no serviço; cuidem também de quem media, porque este trabalho desgasta.",
    "pairsWith": [
      "legal-aid-clinic",
      "tenant-union"
    ],
    "learnMore": [
      "disagree-with-member"
    ],
    "tasks": [
      {
        "name": "Convoquem e capacitem pessoas mediadoras",
        "description": "Encontrem pessoas voluntárias serenas e equilibradas e capacitem essas pessoas, seja numa formação reconhecida de mediação, seja em parceria com um centro de mediação comunitária existente.",
        "hours": 6,
        "skills": [
          "divulgação",
          "facilitação"
        ]
      },
      {
        "name": "Montem um processo de pedido e acolhimento",
        "description": "Criem um jeito simples de as pessoas pedirem mediação. No acolhimento, escutem o básico de cada lado e confirmem que o caso é adequado para mediação.",
        "hours": 3,
        "skills": [
          "organização",
          "entrevistas"
        ]
      },
      {
        "name": "Encontrem espaços neutros de encontro",
        "description": "Garantam lugares tranquilos e neutros — uma sala de biblioteca ou centro comunitário — onde os dois lados se sintam seguros e em pé de igualdade.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Definam o alcance e os limites",
        "description": "Decidam o que vocês vão mediar (barulho, espaços compartilhados, disputas menores) e o que não. Filtrem situações com violência, abuso ou risco à segurança e encaminhem esses casos para profissionais adequados.",
        "hours": 3,
        "skills": [
          "facilitação",
          "redação"
        ]
      },
      {
        "name": "Estabeleçam a confidencialidade e as regras básicas",
        "description": "Definam regras claras: confidencialidade, participação voluntária, cada um fala na sua vez com respeito, e uma pessoa mediadora que guia mas não decide. Deixem tudo por escrito para quem participa.",
        "hours": 3,
        "skills": [
          "redação"
        ]
      },
      {
        "name": "Divulguem o serviço",
        "description": "Façam vizinhos, grupos de moradia e organizações locais saberem que existe mediação gratuita, para que as pessoas a procurem antes de os conflitos crescerem.",
        "hours": 3,
        "skills": [
          "divulgação",
          "design gráfico"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Acompanhem os resultados e cuidem de quem media",
        "description": "Anotem as taxas de resolução (sem quebrar a confidencialidade) e conversem regularmente com quem media. O trabalho desgasta, então alternem os casos e ofereçam apoio.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "digitação de dados",
          "facilitação"
        ]
      }
    ]
  },
  {
    "id": "reentry-support",
    "name": "Rede de apoio à reinserção",
    "purpose": "Ajudar pessoas que saem da prisão a conseguir documentos, moradia, trabalho e comunidade, aliviando uma transição notoriamente difícil.",
    "whoItServes": "Pessoas que já estiveram presas e suas famílias.",
    "whatYoullNeed": "Pessoas voluntárias, organizações parceiras e um diretório sólido de recursos. Tratem os antecedentes e as histórias das pessoas como privados — comecem pelo respeito, sigam os objetivos de cada pessoa e encaminhem questões legais para assistência jurídica qualificada.",
    "setupHours": 28,
    "defaultCategory": "other",
    "firstSteps": "Antes de montar qualquer coisa, sentem com pessoas que já viveram a volta para casa e com as organizações de reinserção, os serviços de liberdade condicional e os empregadores de segunda chance que já atuam na sua região — perguntem o que realmente trava as pessoas nas primeiras semanas e onde a rede de vocês se encaixa. Garantam desde já um contato de assistência jurídica ou uma pessoa advogada qualificada, para que, quando surgirem dúvidas legais, exista um lugar de verdade para onde encaminhar.",
    "commonPitfalls": "Este projeto morre quando vira porteira — voluntários decidindo quem merece ajuda — ou quando a história de alguém vaza e custa um emprego ou um apartamento. Também falha em silêncio quando o entusiasmo corre na frente da continuidade; uma promessa quebrada machuca mais quem está reconstruindo confiança do que promessa nenhuma.",
    "pairsWith": [
      "court-support",
      "books-to-prisoners"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Montem um diretório de recursos e parcerias",
        "description": "Mapeiem serviços de documentos e identidade, moradia, emprego, saúde, tratamento e benefícios. Identifiquem que empregadores e proprietários estão abertos a pessoas com antecedentes.",
        "hours": 6,
        "skills": [
          "divulgação",
          "digitação de dados"
        ]
      },
      {
        "name": "Convoquem e capacitem pessoas voluntárias",
        "description": "Encontrem pessoas voluntárias sem julgamentos e capacitem essas pessoas num apoio respeitoso e informado pelo trauma. Quem volta para casa precisa de companhia, não de porteiros.",
        "hours": 5,
        "skills": [
          "divulgação",
          "ensino"
        ]
      },
      {
        "name": "Criem uma acolhida e uma conversa de necessidades",
        "description": "Montem um jeito simples e digno de saber o que cada pessoa precisa com mais urgência — muitas vezes documentos, um lugar para ficar e renda — e priorizem a partir daí.",
        "hours": 3,
        "skills": [
          "entrevistas"
        ]
      },
      {
        "name": "Apoiem com documentos e benefícios",
        "description": "Ajudem a tirar de novo identidade e documentos, a pedir benefícios e a resolver outras burocracias difíceis sem um endereço ou acesso à internet.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "papelada"
        ]
      },
      {
        "name": "Conectem com emprego e moradia",
        "description": "Façam apresentações calorosas a empregadores de segunda chance e opções de moradia, e ajudem com candidaturas, currículos e preparação para entrevistas.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "divulgação",
          "redação"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ofereçam mentoria entre pares",
        "description": "Sempre que possível, formem duplas com mentores que já viveram a própria reinserção. Essa experiência compartilhada constrói confiança mais rápido que qualquer outra coisa.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "facilitação"
        ]
      },
      {
        "name": "Estabeleçam práticas de privacidade e limites",
        "description": "Tratem as histórias das pessoas com confidencialidade estrita, nunca pressionem ninguém a contar mais do que quer e encaminhem dúvidas legais para advogadas e advogados qualificados.",
        "hours": 3,
        "skills": [
          "redação"
        ]
      }
    ]
  },
  {
    "id": "community-wood-bank",
    "name": "Banco comunitário de lenha / Apoio para aquecimento",
    "purpose": "Arrecadar e distribuir lenha e coordenar ajuda com aquecimento para a vizinhança passar o inverno aquecida.",
    "whoItServes": "Famílias rurais e de baixa renda que se aquecem com lenha, e pessoas idosas que não conseguem juntar ou rachar a própria.",
    "whatYoullNeed": "Uma fonte de lenha, um lugar para processar e armazenar, equipamento, uma equipe treinada e um plano de entrega. Motosserras e rachadores são perigosos — deixem operar só pessoas treinadas, exijam equipamento de proteção e façam uma conversa de segurança antes de cada sessão.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Comecem conversando com as famílias que se aquecem com lenha — pessoas idosas da zona rural, famílias que o serviço de assistência para aquecimento já conhece — para saber quanto queimam e quando a lenha acaba, e depois liguem para os serviços de poda locais perguntando para onde a madeira deles vai hoje. Antes de ligar qualquer motosserra, decidam quem é dono da segurança: alguém com experiência para treinar a equipe e sem medo de dizer não a um voluntário.",
    "commonPitfalls": "Os dois jeitos de isto machucar: uma pessoa sem treino numa motosserra, e entregar lenha verde que faz fumaça, forra a chaminé de creosoto e não aquece. Cortar em outubro para dezembro significa lenha úmida — a falha de calendário é tão real quanto a de segurança.",
    "pairsWith": [
      "weatherization-brigade",
      "cooling-warming-center"
    ],
    "tasks": [
      {
        "name": "Garantam uma fonte de lenha",
        "description": "Combinem o fornecimento com serviços de poda, limpeza pós-tempestade, doações de árvores caídas ou áreas manejadas de forma sustentável. Confirmem que podem retirar e processar a madeira legalmente.",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Encontrem um lugar para processar e armazenar",
        "description": "Consigam um quintal ou terreno onde dê para cortar, rachar, empilhar e secar a lenha. Vocês precisam de espaço para manter seca a lenha desta temporada e secando a da próxima.",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Consigam equipamento e proteção",
        "description": "Obtenham ou peguem emprestado um rachador de lenha, motosserras e equipamento de proteção (perneiras, proteção para olhos e ouvidos, luvas). Mantenham as ferramentas em dia e um kit de primeiros socorros no local.",
        "hours": 4,
        "skills": [
          "dirigir",
          "conserto de ferramentas"
        ]
      },
      {
        "name": "Convoquem e treinem a equipe da lenha",
        "description": "Montem a equipe e garantam que só pessoas devidamente treinadas operem motosserras e rachadores. Façam uma conversa de segurança antes de cada mutirão.",
        "hours": 4,
        "skills": [
          "ensino",
          "divulgação"
        ]
      },
      {
        "name": "Montem um sistema de pedido e entrega",
        "description": "Criem um jeito de as famílias pedirem lenha e combinarem a entrega, já que muitas pessoas que recebem são idosas ou não têm caminhonete. Confirmem um empilhamento seguro perto da casa.",
        "hours": 3,
        "skills": [
          "organização",
          "dirigir"
        ]
      },
      {
        "name": "Definam critérios de distribuição",
        "description": "Decidam quanta lenha cada família recebe e priorizem quem corre mais risco no frio. Mantenham o processo simples e sem barreiras.",
        "hours": 2,
        "skills": [
          "facilitação"
        ]
      },
      {
        "name": "Programem os mutirões e a secagem",
        "description": "Planejem o corte e a rachação com bastante antecedência do inverno, porque a lenha verde precisa secar por meses antes de queimar com segurança. Registrem o que já está seco e pronto.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "organização"
        ],
        "follows": [
          0,
          1,
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "community-wifi-mesh",
    "name": "WiFi comunitário gratuito / Rede em malha",
    "purpose": "Oferecer acesso gratuito à internet onde ela não cabe no bolso ou não chega.",
    "whoItServes": "Famílias de baixa renda, estudantes, quem procura trabalho e qualquer pessoa sem internet confiável.",
    "whatYoullNeed": "Uma conexão de internet de base, roteadores e nós de malha, pessoas voluntárias com perfil técnico e locais anfitriões.",
    "setupHours": 32,
    "defaultCategory": "tech",
    "firstSteps": "Percorram os quarteirões que querem cobrir e batam nas portas — conversem com as famílias sem serviço sobre para que usariam de verdade, e com quem tem telhados e janelas altas que poderiam abrigar um nó. Antes de comprar equipamento, tenham a conversa da banda: encontrem o comércio, a biblioteca ou o provedor disposto a compartilhar uma linha, e confirmem por escrito que redistribuir é permitido.",
    "commonPitfalls": "Redes em malha costumam morrer de manutenção, não de construção — a pessoa técnica fundadora se muda e ninguém mais consegue entrar nos roteadores, então documentem tudo e treinem uma segunda pessoa desde o primeiro dia. A outra falha silenciosa é construir onde o sinal chega fácil em vez de onde as pessoas realmente não têm acesso.",
    "pairsWith": [
      "digital-literacy",
      "emergency-preparedness"
    ],
    "tasks": [
      {
        "name": "Mapeiem as necessidades e os vazios de cobertura",
        "description": "Identifiquem que quarteirões não têm acesso a um preço possível e até onde o sinal poderia chegar. Anotem prédios com linha de visada e anfitriões dispostos. Isso dá forma a todo o projeto.",
        "hours": 4,
        "skills": [
          "suporte técnico"
        ]
      },
      {
        "name": "Garantam uma conexão de internet de base",
        "description": "Consigam uma fonte de banda para compartilhar — uma linha comercial doada, uma parceria com um provedor ou um enlace de rede comunitária. Confirmem que os termos permitem redistribuir.",
        "hours": 5,
        "skills": [
          "divulgação",
          "suporte técnico"
        ]
      },
      {
        "name": "Convoquem pessoas voluntárias com perfil técnico",
        "description": "Procurem gente à vontade com redes, capaz de configurar roteadores e resolver problemas. Bastam umas duas para começar, mais quem estiver disposto a aprender.",
        "hours": 3,
        "skills": [
          "divulgação",
          "suporte técnico"
        ]
      },
      {
        "name": "Consigam e configurem o equipamento",
        "description": "Reúnam roteadores, nós de malha e antenas por doações ou com um orçamento pequeno. Configurem tudo para uma rede aberta ou de compartilhamento simples e testem a cobertura.",
        "hours": 10,
        "skills": [
          "suporte técnico"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Encontrem locais anfitriões para os nós",
        "description": "Coloquem os nós onde eles ampliam o alcance — telhados, janelas altas e varandas com tomada e permissão. Consigam um sim por escrito de cada anfitrião e cubram qualquer custinho de energia.",
        "hours": 5,
        "skills": [
          "divulgação"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Definam normas de uso aceitável e privacidade",
        "description": "Publiquem regras simples, evitem registrar a atividade das pessoas e deixem claro que uma rede aberta não é privada. Indiquem práticas básicas de segurança, como HTTPS e VPN.",
        "hours": 2,
        "skills": [
          "redação"
        ]
      },
      {
        "name": "Mantenham e ampliem a rede",
        "description": "Confiram os nós com regularidade, troquem equipamento que falhar e somem cobertura quando novos anfitriões entrarem. Documentem a instalação para outras pessoas poderem ajudar a manter.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "suporte técnico"
        ],
        "follows": [
          3,
          4
        ]
      }
    ]
  },
  {
    "id": "mental-health-peer-support",
    "name": "Círculo de apoio entre pares em saúde mental",
    "purpose": "Oferecer um espaço seguro, regular e conduzido por pares para as pessoas compartilharem e se apoiarem — um complemento, não um substituto, do cuidado profissional.",
    "whoItServes": "Qualquer pessoa atravessando estresse, isolamento, luto ou desafios de saúde mental que queira conexão entre pares.",
    "whatYoullNeed": "Pessoas facilitadoras capacitadas, um espaço privado e limites claros com um plano de encaminhamento em crise. O apoio entre pares complementa o cuidado profissional em saúde mental — não o substitui. Quem facilita não é terapeuta, e sempre precisa existir um plano claro para conectar quem estiver em crise a recursos profissionais ou de emergência qualificados.",
    "setupHours": 21,
    "defaultCategory": "emotional_support",
    "firstSteps": "As primeiras conversas são com as pessoas que poderiam facilitar e com serviços locais de saúde mental — uma clínica, linha de crise ou terapeuta que aceite ser o caminho de encaminhamento antes mesmo do primeiro encontro do círculo. Não abram as portas até quem facilita estar capacitado e todo mundo conseguir dizer com clareza o que o círculo é e o que não é.",
    "commonPitfalls": "A falha perigosa é a deriva: um círculo acolhedor vira aos poucos o único apoio de alguém, quem facilita começa a bancar terapeuta, e não existe plano para a noite em que alguém está em crise de verdade. A mais silenciosa é o esgotamento de quem facilita — se as pessoas que sustentam o espaço não têm apoio próprio, o círculo se apaga em um ano.",
    "pairsWith": [
      "neighborhood-care-network",
      "disability-support-network",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what",
      "lurking-ok"
    ],
    "tasks": [
      {
        "name": "Convoquem e capacitem pessoas facilitadoras",
        "description": "Encontrem pessoas acolhedoras e firmes e peçam que completem uma formação em apoio entre pares ou escuta ativa. Deixem claro que quem facilita é par que sustenta o espaço, não clínico que diagnostica ou trata.",
        "hours": 5,
        "skills": [
          "facilitação",
          "divulgação"
        ]
      },
      {
        "name": "Definam o alcance e os limites do círculo",
        "description": "Estabeleçam que isto é apoio entre pares, não terapia nem atendimento de crise. Escrevam para que o círculo serve e o que fica fora do papel dele, para as expectativas ficarem claras para todo mundo.",
        "hours": 3,
        "skills": [
          "redação"
        ]
      },
      {
        "name": "Montem um plano de encaminhamento e resposta a crises",
        "description": "Preparem passos claros para quando alguém estiver em sofrimento além do apoio entre pares: como conectar a pessoa, com delicadeza, à ajuda profissional ou a serviços de crise, e quando acionar apoio de emergência. Tenham à mão recursos locais e nacionais atualizados.",
        "hours": 3,
        "skills": [
          "redação"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Encontrem um espaço privado e seguro",
        "description": "Garantam uma sala tranquila, confortável e reservada onde as pessoas possam falar com liberdade. A constância do lugar ajuda as pessoas a se sentirem seguras para voltar.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Combinem a confidencialidade e as regras do grupo",
        "description": "Combinem confidencialidade, nada de conselhos sem pedido, nada de interromper e o direito de passar a vez. Compartilhem essas regras no começo de cada encontro.",
        "hours": 3,
        "skills": [
          "facilitação",
          "redação"
        ]
      },
      {
        "name": "Agendem e divulguem os encontros",
        "description": "Escolham um horário fixo, mantenham grupos de tamanho administrável e divulguem de um jeito que reduza o estigma. Deixem claro que é gratuito e aberto.",
        "hours": 3,
        "skills": [
          "divulgação",
          "organização"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Apoiem quem facilita e previnam o esgotamento",
        "description": "Mantenham conversas regulares para quem facilita desabafar e descomprimir. Alternem quem conduz e garantam que essas pessoas também tenham o próprio apoio.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "facilitação"
        ]
      }
    ]
  },
  {
    "id": "community-cleanup",
    "name": "Limpeza comunitária e recuperação de áreas verdes",
    "purpose": "Recolher lixo, recuperar terrenos e praças abandonados e criar áreas verdes compartilhadas.",
    "whoItServes": "O bairro inteiro — um espaço mais limpo, seguro e verde beneficia todo mundo.",
    "whatYoullNeed": "Pessoas voluntárias, materiais, permissões dos locais e um plano de descarte. Terrenos abandonados podem esconder perigos reais — nunca peguem agulhas nem produtos químicos desconhecidos com as mãos; usem ferramentas e um coletor rígido para perfurocortantes, e descartem os achados perigosos conforme as regras locais.",
    "setupHours": 10,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Percorram o bairro com quem mora mais perto dos pontos abandonados — essas pessoas sabem quais terrenos importam, de quem são e o que já foi tentado — e verifiquem se a prefeitura ou um grupo de amigos da praça já organiza limpezas às quais vocês possam se somar. Resolvam propriedade, permissão e para onde vai o lixo antes de escolher a data.",
    "commonPitfalls": "As limpezas fracassam de dois jeitos: os sacos de lixo recolhido ficam semanas na calçada porque ninguém combinou o descarte, e o terreno lindamente limpo volta a ficar tomado pelo mato quando chega o outono, porque não havia plano além do grande dia. E uma pessoa voluntária que pega uma agulha com a mão pode transformar uma boa manhã numa ida ao hospital.",
    "pairsWith": [
      "community-garden",
      "community-composting"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Identifiquem e priorizem os locais",
        "description": "Percorram a área e listem os pontos que precisam de atenção — esquinas cheias de lixo, terrenos tomados pelo mato, praças abandonadas. Priorizem por impacto e viabilidade.",
        "hours": 1.5
      },
      {
        "name": "Consigam as permissões e um plano de descarte",
        "description": "Confirmem quem é dono de cada local e peçam permissão. Combinem com antecedência a retirada de lixo e entulho — coordenem uma caçamba ou uma coleta da prefeitura para os sacos não ficarem se acumulando.",
        "hours": 2,
        "skills": [
          "divulgação",
          "papelada"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Reúnam materiais e equipamento de segurança",
        "description": "Juntem luvas, sacos, pegadores e coletes refletivos. Incluam um coletor rígido para perfurocortantes e um plano para qualquer material perigoso encontrado.",
        "hours": 1.5,
        "skills": [
          "dirigir"
        ]
      },
      {
        "name": "Convoquem e organizem as pessoas voluntárias",
        "description": "Espalhem a notícia e inscrevam as pessoas. Definam responsáveis de equipe e zonas para que o dia seja organizado, e não caótico.",
        "hours": 2,
        "skills": [
          "divulgação",
          "organização"
        ]
      },
      {
        "name": "Realizem o dia de limpeza ou recuperação",
        "description": "Façam o evento, mantenham as equipes seguras e hidratadas e celebrem juntos o resultado visível. Tirem fotos de antes e depois para motivar a próxima participação.",
        "hours": 3,
        "skills": [
          "organização",
          "fotografia"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "free-tax-prep",
    "name": "Preparação gratuita de impostos e clínica de empoderamento financeiro",
    "purpose": "Ajudar vizinhos e vizinhas de baixa renda a declarar impostos de graça e receber os créditos e restituições a que têm direito.",
    "whoItServes": "Trabalhadores de baixa renda, famílias com direito a créditos fiscais, pessoas idosas e estudantes.",
    "whatYoullNeed": "Pessoas preparadoras treinadas e certificadas, um espaço, computadores e um sistema de agendamento. As declarações devem ser preparadas por pessoas voluntárias certificadas por um programa reconhecido — esta clínica ajuda com declarações comuns, não com situações complexas que pedem um profissional de impostos.",
    "setupHours": 28,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "A primeira ligação de vocês é para um programa estabelecido de declaração gratuita como o VITA — conversem com a coordenação sobre prazos de certificação, software e o que um posto novo precisa, porque isso não se faz por conta própria. Depois conversem com os vizinhos e vizinhas que esperam atender sobre quando conseguem vir de verdade e o que os impediu de declarar antes.",
    "commonPitfalls": "Uma declaração errada pode custar a restituição de uma família ou provocar uma auditoria — por isso a linha que este projeto nunca pode cruzar é gente sem certificação preparando declarações. Os fracassos mais brandos: lançar em março, quando a certificação leva meses, e alguém fazer a viagem de ônibus só para ser mandado de volta por causa de um documento que ninguém avisou para trazer.",
    "pairsWith": [
      "legal-aid-clinic",
      "solidarity-fund"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Treinem e certifiquem as pessoas preparadoras",
        "description": "Peçam que as pessoas voluntárias completem uma certificação reconhecida de preparação gratuita de impostos (como o programa VITA do IRS) para que as declarações saiam corretas e devidamente autorizadas. Isso não é negociável.",
        "hours": 10,
        "recurringCadence": "cycle",
        "skills": [
          "contabilidade"
        ]
      },
      {
        "name": "Façam parceria com um programa reconhecido de declaração gratuita",
        "description": "Filiem-se a um programa estabelecido para ter software, suporte e credibilidade. Eles fornecem as ferramentas de envio e os controles de qualidade que não vale a pena construir por conta própria.",
        "hours": 4,
        "skills": [
          "divulgação",
          "papelada"
        ]
      },
      {
        "name": "Preparem um espaço e os equipamentos",
        "description": "Garantam um local com computadores, internet confiável e privacidade suficiente para as pessoas compartilharem informações financeiras sensíveis com tranquilidade.",
        "hours": 3,
        "skills": [
          "suporte técnico"
        ]
      },
      {
        "name": "Montem um sistema de agendamento e acolhimento",
        "description": "Criem horários marcados e uma lista clara de documentos que as pessoas precisam trazer (identidade, comprovantes de renda, declaração anterior). Isso evita viagens perdidas e esperas longas.",
        "hours": 3,
        "skills": [
          "organização",
          "digitação de dados"
        ]
      },
      {
        "name": "Divulguem para vizinhos e vizinhas elegíveis",
        "description": "Espalhem a notícia, destacando que declarar pode liberar restituições e créditos que muita gente perde. Alcancem trabalhadores, famílias e pessoas idosas que muitas vezes têm direito.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "divulgação",
          "design gráfico"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Garantam a segurança e a privacidade dos dados",
        "description": "Protejam cada dado pessoal e financeiro: dispositivos seguros, nenhuma cópia desnecessária, armazenamento trancado e uma política clara de guarda e destruição.",
        "hours": 3,
        "skills": [
          "suporte técnico"
        ]
      },
      {
        "name": "Ofereçam acompanhamento de empoderamento financeiro",
        "description": "Quando a pessoa quiser, conectem-na a ajuda com orçamento, serviços bancários seguros e triagem de benefícios. Mantenham isso opcional e encaminhem situações complexas a profissionais qualificados.",
        "hours": 2,
        "skills": [
          "contabilidade"
        ]
      }
    ]
  },
  {
    "id": "community-market",
    "name": "Mercado comunitário / Banca agrícola gratuita",
    "purpose": "Manter uma banca regular, gratuita ou no modelo pague o que puder, distribuindo alimentos frescos e itens básicos.",
    "whoItServes": "Vizinhos e vizinhas em insegurança alimentar e pessoas em áreas sem alimentos frescos acessíveis.",
    "whatYoullNeed": "Uma fonte de alimentos, uma banca ou um ponto, pessoas voluntárias e um horário regular.",
    "setupHours": 15,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Comecem pelas conversas de abastecimento — visitem produtores locais, mercados e hortas comunitárias para saber que excedente existe de verdade e em que ritmo — e conversem com vizinhos e vizinhas da área que vocês atenderiam sobre por onde já passam a pé e que comida levariam de verdade para casa. Escolham o ponto com as pessoas que vão usá-lo, não por elas.",
    "commonPitfalls": "Uma banca que aparece de forma irregular ensina as pessoas a não contar mais com ela — a constância importa mais do que a fartura. Os outros fracassos: um abastecimento que seca depois do primeiro mês de entusiasmo, e qualquer coisa na mesa (formulários, perguntas, separar as pessoas) que faça levar comida para casa parecer um pedido de benefício.",
    "pairsWith": [
      "gleaning-network",
      "bulk-buying-coop",
      "community-garden"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Garantam o abastecimento de alimentos e itens",
        "description": "Consigam alimentos por meio de coleta de excedentes (gleaning), hortas comunitárias, doações de produtores e mercados e compras no atacado. Busquem variedade e regularidade para a banca não ficar vazia.",
        "hours": 3,
        "skills": [
          "divulgação",
          "dirigir"
        ]
      },
      {
        "name": "Encontrem um ponto e montem a banca",
        "description": "Escolham um lugar visível, acessível e com permissão — a beira de uma praça, um estacionamento ou um ponto de ônibus. Organizem mesas, sombra e sinalização.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Decidam o modelo",
        "description": "Escolham totalmente gratuito, pague o que puder, ou uma mistura. Seja qual for a escolha, garantam que ninguém jamais seja mandado embora por não poder pagar.",
        "hours": 1,
        "skills": [
          "facilitação"
        ]
      },
      {
        "name": "Organizem exposição, armazenamento e higiene dos alimentos",
        "description": "Mantenham os alimentos frescos e bem apresentados, manuseiem tudo com segurança e tenham caixas térmicas ou sombra para os dias quentes. Descartem o que estiver estragado.",
        "hours": 2,
        "skills": [
          "higiene alimentar"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Convoquem e escalem as pessoas voluntárias",
        "description": "Organizem gente para buscar os alimentos, montar, atender a banca e desmontar. Definam papéis claros para cada dia de banca.",
        "hours": 2,
        "skills": [
          "organização",
          "divulgação"
        ]
      },
      {
        "name": "Divulguem e fixem um horário regular",
        "description": "Escolham um dia e um horário constantes e divulguem amplamente. A previsibilidade é o que transforma uma banca em um recurso com que se pode contar.",
        "hours": 2,
        "skills": [
          "divulgação",
          "design gráfico"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Toquem a banca e cuidem das sobras",
        "description": "Montem, distribuam com acolhimento e sem julgamento, e encaminhem qualquer alimento que sobrar para geladeiras comunitárias, bancos de alimentos ou programas de refeições, para nada se perder.",
        "hours": 3,
        "skills": [
          "organização"
        ],
        "follows": [
          0,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "welcome-wagon",
    "name": "Comitê de boas-vindas: apoio a vizinhos novos e a mães e pais recentes",
    "purpose": "Receber quem acaba de chegar e quem acaba de ter bebê com ajuda prática, informações locais e umas boas-vindas de verdade à comunidade.",
    "whoItServes": "Pessoas que acabaram de se mudar, mães e pais recentes ou à espera de bebê, e qualquer pessoa que precise de um começo acolhedor.",
    "whatYoullNeed": "Pessoas voluntárias, kits de informação, itens de boas-vindas doados e um sistema de indicações.",
    "setupHours": 10,
    "defaultCategory": "emotional_support",
    "firstSteps": "Conversem primeiro com quem encontra as pessoas recém-chegadas antes de vocês — proprietários de imóveis, secretarias de escola, clínicas, parteiras e equipes de pediatria — sobre como indicariam alguém com consentimento. Depois perguntem a algumas pessoas recém-chegadas e a mães e pais recentes o que teria ajudado de verdade no primeiro mês, e montem o kit e a cesta em torno dessas respostas.",
    "commonPitfalls": "O jeito de isso dar errado é parecer vigilância — aparecer sem convite na porta de uma pessoa desconhecida, ou passar nomes adiante sem consentimento, transforma boas-vindas em intromissão. O projeto também se apaga em silêncio quando as pessoas fundadoras se esgotam e quem chega passa meses sem ser notado.",
    "pairsWith": [
      "newcomer-translation-network",
      "diaper-hygiene-bank",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "invite-someone"
    ],
    "tasks": [
      {
        "name": "Decidam quem vocês vão receber e como",
        "description": "Definam o foco — moradores novos, mães e pais recentes, ou ambos — e a forma das boas-vindas (uma visita, uma cesta, uma ligação). Que seja sempre por escolha da pessoa, nunca invasivo.",
        "hours": 1,
        "skills": [
          "facilitação"
        ]
      },
      {
        "name": "Montem um kit de informações locais",
        "description": "Reúnam um guia claro de serviços locais, transporte, escolas, saúde e o programa de apoio mútuo de vocês. Ofereçam o guia nos idiomas falados na sua região.",
        "hours": 3,
        "skills": [
          "redação",
          "tradução"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Montem as cestas de boas-vindas",
        "description": "Juntem itens úteis — básicos de despensa, artigos de casa e, para mães e pais recentes, alguns essenciais de bebê ou uma comida caseira. Consigam tudo por doação.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "divulgação",
          "organização"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Convoquem e preparem quem dá as boas-vindas",
        "description": "Encontrem pessoas voluntárias simpáticas e orientem-nas a ser calorosas e respeitosas, a perceber se alguém quer conexão e a nunca pressionar nem se intrometer.",
        "hours": 2,
        "skills": [
          "divulgação",
          "ensino"
        ]
      },
      {
        "name": "Montem um sistema de indicação e adesão",
        "description": "Criem formas simples de alguém ser indicado ou se inscrever — por proprietários, clínicas, escolas ou um formulário. Respeitem a privacidade do começo ao fim.",
        "hours": 2,
        "skills": [
          "organização",
          "digitação de dados"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "library-of-things",
    "name": "Biblioteca de coisas",
    "purpose": "Emprestar itens de casa e de eventos que as pessoas raramente precisam ter — utensílios de cozinha, material de festa e camping, equipamento de bebê, projetores e mais.",
    "whoItServes": "Qualquer pessoa; economiza dinheiro, desafoga a casa e reduz o desperdício.",
    "whatYoullNeed": "Espaço de armazenamento, itens doados, um catálogo e um sistema de empréstimo, e duas pessoas bibliotecárias.",
    "setupHours": 21,
    "defaultCategory": "infrastructure",
    "firstSteps": "Antes de recolher um único item, perguntem aos membros o que pegariam emprestado de verdade — essa pesquisa é o alicerce do projeto — e conversem com a biblioteca pública ou um centro comunitário sobre abrigar a coleção, porque uma instituição de confiança resolve de uma vez o armazenamento e a credibilidade. Recrutem as duas pessoas bibliotecárias antes de as doações chegarem, não depois.",
    "commonPitfalls": "Bibliotecas de coisas morrem de entulho: dizer sim a toda doação enche a sala de máquinas de pão quebradas que ninguém quer, enquanto a lavadora de alta pressão que todo mundo pediu continua faltando. O outro assassino é o horário imprevisível — se as pessoas não podem contar com quando retirar e devolver, voltam em silêncio a comprar.",
    "pairsWith": [
      "tool-lending-library",
      "toy-library",
      "free-store"
    ],
    "learnMore": [
      "confirm-exchange"
    ],
    "tasks": [
      {
        "name": "Pesquisem o que a comunidade quer pegar emprestado",
        "description": "Perguntem aos membros o que usariam mas detestariam comprar — mesas dobráveis, uma poncheira, uma barraca de camping, uma lavadora de carpetes, um carrinho de bebê. As respostas definem o acervo inicial.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Encontrem espaço de armazenamento e horários de funcionamento",
        "description": "Garantam um armário, uma sala ou um contêiner para guardar os itens e fixem horários previsíveis de retirada e devolução para emprestar ser fácil.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Recolham, limpem e testem os itens",
        "description": "Juntem as doações e depois limpem, testem e verifiquem a segurança de cada item. Separem qualquer coisa quebrada, com recall ou sem condições de higiene.",
        "hours": 5,
        "skills": [
          "dirigir"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Cataloguem e fotografem o acervo",
        "description": "Registrem cada item com foto e estado numa planilha ou num aplicativo de empréstimos. Numerem os itens para ser fácil acompanhar saídas e devoluções.",
        "hours": 4,
        "skills": [
          "digitação de dados",
          "fotografia"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Escrevam regras de empréstimo e uma política de confiança",
        "description": "Definam prazo de empréstimo, limites de quantidade e uma política de devolução compreensiva. Que tudo se apoie na confiança, não em taxas, e anotem os itens que pedem cuidado ou limpeza extras.",
        "hours": 2,
        "skills": [
          "redação"
        ]
      },
      {
        "name": "Montem a rotina de empréstimo e preparem as pessoas bibliotecárias",
        "description": "Criem uma ficha simples de saída (nome, contato, item, data de devolução) com uma foto rápida do estado. Mostrem o catálogo e o processo às pessoas voluntárias.",
        "hours": 3,
        "skills": [
          "digitação de dados",
          "ensino"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Mantenham, higienizem e façam a coleção crescer",
        "description": "Limpem e inspecionem os itens devolvidos, consertem o que der e acrescentem com o tempo o que for mais pedido.",
        "hours": 2,
        "skills": [
          "conserto"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "laundry-shower-access",
    "name": "Programa de acesso a lavanderia e banho",
    "purpose": "Oferecer acesso gratuito a lavanderia e banho para as pessoas poderem se manter limpas com dignidade.",
    "whoItServes": "Vizinhos e vizinhas em situação de rua, pessoas sem instalações funcionando em casa e famílias de baixa renda.",
    "whatYoullNeed": "Acesso a máquinas e chuveiros (um espaço parceiro ou uma unidade móvel), suprimentos e pessoas voluntárias. A dignidade e a privacidade de quem chega vêm primeiro — não peçam nenhuma informação pessoal para usar o serviço, mantenham a área de banho privada e segura, e sigam as regras locais de saúde para instalações compartilhadas ou móveis.",
    "setupHours": 19,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Comecem com duas rodadas de conversa: com vizinhos e vizinhas em situação de rua e as equipes de abordagem que os conhecem, sobre que horários e lugares funcionariam de verdade — e com quem tem uma lavanderia, uma academia ou um espaço religioso, sobre receber o programa. Essa conversa com o anfitrião é delicada; sejam honestos sobre quem vai chegar e acertem expectativas de privacidade, limpeza e horários antes de a primeira pessoa chegar.",
    "commonPitfalls": "Este programa morre quando a relação com o anfitrião azeda — uma interação ruim sem protocolo por trás, e o espaço se perde — ou quando os horários mudam tanto que as pessoas cruzam a cidade para encontrar a porta fechada. E cada papel exigido na entrada afasta alguém que precisava de um banho mais do que vocês precisavam do nome dele.",
    "pairsWith": [
      "free-haircut",
      "cooling-warming-center",
      "diaper-hygiene-bank"
    ],
    "tasks": [
      {
        "name": "Garantam o acesso a lavanderia e chuveiros",
        "description": "Façam parceria com uma lavanderia, academia, espaço religioso ou centro recreativo, ou organizem uma unidade móvel. Confirmem horários confiáveis e que o espaço ofereça privacidade.",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Consigam os suprimentos",
        "description": "Reúnam sabão de lavar roupa, toalhas limpas, sabonete, shampoo e outros itens de higiene por doação ou com um orçamento pequeno. Incluam alguma roupa limpa se puderem.",
        "hours": 3,
        "skills": [
          "divulgação",
          "dirigir"
        ]
      },
      {
        "name": "Montem um sistema de inscrição e horários",
        "description": "Criem um jeito justo de reservar máquinas de roupa e horários de banho, para as esperas ficarem razoáveis e todo mundo ter a sua vez.",
        "hours": 3,
        "skills": [
          "organização",
          "digitação de dados"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Estabeleçam protocolos de higiene e segurança",
        "description": "Definam rotinas de limpeza entre um uso e outro, garantam áreas de banho privadas e seguras e protejam a dignidade e a segurança de todas as pessoas o tempo todo.",
        "hours": 3,
        "skills": [
          "redação"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Convoquem e preparem as pessoas voluntárias",
        "description": "Encontrem pessoas voluntárias para fazer a recepção, cuidar dos suprimentos e limpar entre os usos. Preparem cada uma para tratar quem chega com acolhimento e respeito.",
        "hours": 3,
        "skills": [
          "divulgação",
          "ensino"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Fixem um horário e espalhem a notícia",
        "description": "Escolham horários constantes e avisem equipes de abordagem, abrigos e vizinhos em situação de rua sobre quando e onde o serviço funciona.",
        "hours": 3,
        "skills": [
          "divulgação"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "voter-registration",
    "name": "Campanha de registro de eleitores e participação cívica",
    "purpose": "Registrar eleitores e ajudar as pessoas a participar das eleições e das decisões locais — de forma estritamente apartidária.",
    "whoItServes": "Residentes com direito a voto, principalmente quem historicamente ficou sub-representado nas urnas.",
    "whatYoullNeed": "Pessoas voluntárias treinadas, materiais de registro, regras exatas e bons pontos. Mantenham a campanha estritamente apartidária e sigam à risca todas as leis eleitorais e de registro — deem apenas informação exata e nunca façam campanha por partido ou candidatura.",
    "setupHours": 16,
    "defaultCategory": "organizing",
    "firstSteps": "Antes de alguém montar mesa, conversem com o cartório eleitoral local — eles dirão exatamente o que uma campanha pode e não pode fazer, e algumas regiões exigem treinamento ou cadastro prévio. Depois procurem a Liga de Mulheres Eleitoras ou outro grupo apartidário estabelecido; aproveitar os materiais e a experiência deles é melhor do que aprender a lei eleitoral por tentativa e erro.",
    "commonPitfalls": "Os fracassos imperdoáveis são os legais: uma pilha de formulários preenchidos esquecida no porta-malas de alguém até passar o prazo tira o voto de cada pessoa que confiou em vocês, e uma única pessoa voluntária elogiando uma candidatura pode manchar a campanha inteira. O erro mais sutil é distribuir formulários de registro sem nunca mencionar onde e como se vota de fato.",
    "pairsWith": [
      "newcomer-translation-network",
      "legal-aid-clinic"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Aprendam as regras das campanhas de registro",
        "description": "Pesquisem as leis da sua região sobre registrar eleitores: prazos, o que as pessoas voluntárias podem e não podem fazer, como os formulários devem ser tratados e as exigências de documento. Segui-las à risca é essencial.",
        "hours": 3,
        "skills": [
          "papelada"
        ]
      },
      {
        "name": "Treinem pessoas voluntárias apartidárias",
        "description": "Orientem as pessoas voluntárias a ajudar todo mundo a se registrar, sejam quais forem as opiniões, e a nunca promover partido ou candidatura. A postura apartidária protege a campanha e a confiança da comunidade.",
        "hours": 3,
        "skills": [
          "ensino"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Reúnam materiais e informação exata",
        "description": "Juntem formulários de registro e informações verificadas e atuais sobre prazos, regras de documento, locais de votação e opções pelo correio. Informação errada faz mais mal do que nenhuma.",
        "hours": 2,
        "skills": [
          "redação"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Escolham pontos e eventos de grande movimento",
        "description": "Montem mesa onde os residentes com direito a voto já se reúnem — feiras, estações de transporte, campi, eventos comunitários — com as permissões necessárias para se instalar.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Atendam a mesa de registro",
        "description": "Cuidem da mesa, ajudem as pessoas a se registrar corretamente e entreguem os formulários logo, dentro dos prazos legais. Mantenham o tom acolhedor e informativo.",
        "hours": 4,
        "skills": [
          "divulgação"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Ajudem com os próximos passos",
        "description": "Além de registrar, ajudem as pessoas a saber como, quando e onde votar, incluindo o voto pelo correio e caronas até as urnas. Só se registrar ainda não é participar.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      }
    ]
  },
  {
    "id": "health-navigation",
    "name": "Programa comunitário de navegação em saúde",
    "purpose": "Ajudar vizinhos e vizinhas a encontrar e acessar cuidados de saúde — clínicas, planos, receitas e consultas.",
    "whoItServes": "Pessoas sem plano ou com cobertura insuficiente, pessoas idosas, quem acabou de chegar e qualquer pessoa perdida no sistema de saúde.",
    "whatYoullNeed": "Pessoas navegadoras treinadas, um diretório de recursos, parcerias com serviços de saúde e um sistema de pedidos. Quem navega conecta as pessoas ao atendimento — não dá conselho médico nem diagnóstico. Encaminhem toda pergunta clínica a profissionais de saúde qualificados.",
    "setupHours": 26,
    "defaultCategory": "other",
    "firstSteps": "Comecem visitando as clínicas gratuitas e de preço ajustado à renda para onde vão encaminhar — apresentem-se, perguntem quais encaminhamentos ajudam e quais sobrecarregam, e deixem essas conversas semear o diretório. Acertem o limite antes de o primeiro pedido chegar: quem navega cuida de logística e papelada, e toda pergunta clínica vai para um profissional, então saibam exatamente para qual linha de enfermagem ou clínica vão passá-las.",
    "commonPitfalls": "O fio da navalha é uma pessoa navegadora bem-intencionada escorregando para o conselho médico — um “isso não parece grave” dito de passagem pode custar a alguém semanas de cuidado necessário. Isso também falha quando o diretório envelhece em silêncio e manda gente a clínicas fechadas ou programas encerrados; um número errado custa a última tentativa de alguém que já vinha no limite.",
    "pairsWith": [
      "rides-transportation",
      "newcomer-translation-network",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Montem um diretório de recursos de saúde",
        "description": "Compilem clínicas gratuitas e de baixo custo, serviços com preço ajustado à renda, programas de ajuda com medicamentos, opções de dentista e de visão e serviços de saúde mental. Mantenham tudo em dia.",
        "hours": 6,
        "skills": [
          "digitação de dados",
          "divulgação"
        ]
      },
      {
        "name": "Convoquem e treinem as pessoas navegadoras",
        "description": "Encontrem pessoas voluntárias e treinem-nas para conectar as pessoas ao atendimento — não para dar conselho médico. O trabalho delas é orientação e logística, com as perguntas clínicas encaminhadas a profissionais.",
        "hours": 5,
        "skills": [
          "divulgação",
          "ensino"
        ]
      },
      {
        "name": "Montem um sistema de pedido e acolhimento",
        "description": "Criem um jeito privado e sem barreiras de as pessoas pedirem ajuda e descreverem a situação, com opções por telefone e presenciais, não só pela internet.",
        "hours": 3,
        "skills": [
          "organização"
        ]
      },
      {
        "name": "Ajudem com planos e inscrições",
        "description": "Acompanhem as pessoas para entender e pedir a cobertura a que têm direito (como o Medicaid ou os planos do mercado de seguros) e para reunir os documentos necessários.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "papelada"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Ofereçam apoio com consultas e receitas",
        "description": "Ajudem a marcar consultas, criar lembretes, lidar com os custos dos remédios e conectar com o programa de caronas para chegar ao atendimento.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "organização"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Definam práticas de privacidade para informações de saúde",
        "description": "Tratem todo dado de saúde como altamente sensível: coletem o mínimo, guardem com segurança e nunca compartilhem sem consentimento. Treinem quem navega em confidencialidade.",
        "hours": 2,
        "skills": [
          "redação"
        ]
      },
      {
        "name": "Façam parceria com clínicas e serviços de saúde",
        "description": "Construam relações com clínicas e profissionais locais para encaminhar com mais fluidez e ficar sabendo de novos serviços de baixo custo assim que abrirem.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      }
    ]
  },
  {
    "id": "toy-library",
    "name": "Brinquedoteca comunitária e empréstimo de brinquedos",
    "purpose": "Emprestar brinquedos, jogos e materiais de brincar para que as famílias tenham variedade sem precisar comprar.",
    "whoItServes": "Famílias com crianças pequenas, especialmente com orçamento apertado; também reduz desperdício e bagunça.",
    "whatYoullNeed": "Espaço de armazenamento, brinquedos doados, um catálogo e registro de empréstimo, material de limpeza e pessoas para cuidar do acervo.",
    "setupHours": 10,
    "defaultCategory": "childcare",
    "firstSteps": "Conversem com as famílias que vocês esperam servir — na saída da creche, numa hora da história, num grupo de brincar — sobre quais brinquedos as crianças deixam para trás mais rápido e quais horários realmente funcionam, e depois perguntem num centro comunitário, igreja ou biblioteca por uma estante ou uma sala. Consigam uma pessoa voluntária com experiência em cuidado infantil para cuidar das checagens de segurança antes de as doações começarem a chegar.",
    "commonPitfalls": "Brinquedotecas fracassam por segurança e por peças: um único brinquedo com recall ou um risco de asfixia que passa despercebido quebra a confiança das famílias para sempre, e quebra-cabeças que voltam incompletos fazem o acervo inteiro parecer de segunda em poucos meses. Inspeção rigorosa e sacos com contagem são o jogo todo.",
    "pairsWith": [
      "library-of-things",
      "childcare-collective",
      "school-supply-program"
    ],
    "tasks": [
      {
        "name": "Consigam espaço e horários de funcionamento",
        "description": "Garantam estantes num centro comunitário, biblioteca ou espaço compartilhado, e definam horários previsíveis de retirada e devolução com que as famílias possam contar.",
        "hours": 1.5,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Coletem, limpem e chequem a segurança dos brinquedos",
        "description": "Reúnam doações, depois limpem e inspecionem cada brinquedo. Verifiquem recalls, peças quebradas e riscos de asfixia, e separem qualquer coisa insegura para crianças pequenas.",
        "hours": 3.5,
        "skills": [
          "dirigir",
          "cuidado infantil"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Cataloguem e ensaquem com todas as peças",
        "description": "Registrem cada brinquedo com foto e faixa etária, e ensaquem os conjuntos de várias peças com a contagem para nada se perder. Numerem os itens para facilitar o acompanhamento.",
        "hours": 2,
        "skills": [
          "digitação de dados",
          "fotografia"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Escrevam as regras de empréstimo",
        "description": "Definam o prazo, quantos brinquedos por vez e uma política gentil para devoluções e peças faltando. Mantenham tudo baseado na confiança e sem rigidez.",
        "hours": 1,
        "skills": [
          "redação"
        ]
      },
      {
        "name": "Montem o empréstimo e treinem quem cuida do acervo",
        "description": "Criem um registro de saída simples (nome, contato, item, data de devolução) e apresentem às pessoas voluntárias o catálogo, a rotina de limpeza e as regras.",
        "hours": 2,
        "skills": [
          "digitação de dados",
          "ensino"
        ],
        "follows": [
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "food-preservation",
    "name": "Coletivo de conservas e preservação de alimentos",
    "purpose": "Ensinar e fazer conservas em grupo para o excedente da estação durar e menos comida ser desperdiçada.",
    "whoItServes": "Quem cultiva, quem respiga e famílias que querem esticar a comida ao longo do ano.",
    "whatYoullNeed": "Uma cozinha, equipamento para conservas, lideranças com conhecimento e alimentos. A conservação caseira traz riscos reais de segurança alimentar, incluindo botulismo, quando é feita errado — sigam sempre orientações atuais e testadas de uma fonte confiável e nunca improvisem tempos nem métodos de processamento.",
    "setupHours": 18,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Encontrem primeiro o conhecimento, depois a cozinha: liguem para o serviço de extensão local ou para uma pessoa certificada em conservação de alimentos e peçam que treine suas lideranças ou revise seus planos, e conversem com quem cultiva e respiga sobre qual excedente chega e quando. Reservem a cozinha em torno do calendário da colheita, não o contrário.",
    "commonPitfalls": "O fracasso que importa é invisível: um vidro fechado com um método improvisado ou com a receita não testada da avó pode carregar botulismo e parecer perfeito na prateleira. O fracasso comum é o calendário — os tomates amadurecem no ritmo deles, e um coletivo que faz a primeira sessão em novembro não conserva nada.",
    "pairsWith": [
      "gleaning-network",
      "community-garden",
      "community-fridge"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Garantam uma cozinha adequada",
        "description": "Encontrem uma cozinha com fogões, espaço de bancada e água para o processamento e a limpeza. Um salão paroquial, centro comunitário ou cozinha comercial funciona bem.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Aprendam métodos seguros de conservação",
        "description": "Façam suas lideranças estudarem métodos testados, baseados em pesquisa, de uma fonte reconhecida (como um serviço de extensão universitária). Conservas malfeitas podem causar doenças graves, então sigam sempre receitas e tempos de processamento testados à risca.",
        "hours": 4,
        "skills": [
          "segurança alimentar",
          "cozinha"
        ]
      },
      {
        "name": "Reúnam equipamento e vidros",
        "description": "Consigam panelas para banho-maria e/ou panelas de pressão para conservas, vidros, tampas e utensílios por doação ou com um pequeno orçamento. Verifiquem se as panelas de pressão estão em condições seguras de uso.",
        "hours": 3,
        "skills": [
          "divulgação",
          "dirigir"
        ]
      },
      {
        "name": "Consigam alimentos",
        "description": "Tragam excedente da estação vindo de respiga, hortas, sítios ou compras em grande quantidade. Marquem as sessões para quando os alimentos estiverem abundantes e baratos.",
        "hours": 2,
        "recurringCadence": "cycle",
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Planejem sessões de conservas em grupo",
        "description": "Escolham receitas adequadas aos alimentos e ao nível do grupo, e organizem estações para o trabalho fluir com segurança e eficiência.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "cozinha",
          "organização"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Ensinem e conduzam as sessões com segurança",
        "description": "Guiem o grupo pelo processo, garantindo manuseio seguro, tempos corretos de processamento e vedação adequada. Façam de cada sessão uma aula, para as habilidades se espalharem.",
        "hours": 4,
        "skills": [
          "cozinha",
          "ensino"
        ],
        "follows": [
          0,
          2,
          4
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Compartilhem as conservas e registrem",
        "description": "Dividam as conservas entre participantes e projetos como a geladeira ou a despensa comunitária. Etiquetem cada vidro com conteúdo e data, e anotem o que funcionou para a próxima vez.",
        "hours": 1,
        "recurringCadence": "session",
        "skills": [
          "organização"
        ],
        "follows": [
          5
        ]
      }
    ]
  },
  {
    "id": "free-haircut",
    "name": "Dias de corte de cabelo e cuidado pessoal grátis",
    "purpose": "Oferecer cortes de cabelo e cuidado pessoal grátis para devolver dignidade, confiança e um novo começo.",
    "whoItServes": "Vizinhos e vizinhas em situação de rua, quem procura emprego, famílias de baixa renda e pessoas idosas.",
    "whatYoullNeed": "Cabeleireiras, cabeleireiros e barbeiros licenciados como voluntários, um espaço, materiais e higienização.",
    "setupHours": 10,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Comece com duas conversas: uma com uma cabeleireira ou barbeiro licenciado disposto a trazer colegas, e outra com as pessoas que você espera servir — um abrigo, um centro de dia ou um programa de emprego sabe dizer quais dias e que ambiente seriam confortáveis de verdade. Quando um profissional e um espaço anfitrião disserem sim, o resto é material e agenda.",
    "commonPitfalls": "Este projeto tropeça quando parece fila de caridade em vez de salão — cortes apressados, sem escolha de estilo, câmeras ligadas para as redes. Pergunte a cada pessoa o que ela quer, deixe as fotos de lado a menos que ela ofereça, e nunca deixe alguém sem licença cortar para esticar a capacidade; um único problema de higiene pode acabar com o programa inteiro.",
    "pairsWith": [
      "laundry-shower-access",
      "reentry-support"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Convoquem cabeleireiras e barbeiros licenciados",
        "description": "Encontrem profissionais dispostos a voluntariar suas habilidades. Profissionais licenciados garantem serviço seguro, de qualidade e com a higienização adequada.",
        "hours": 2.5,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Encontrem um espaço com condições de higiene",
        "description": "Garantam um lugar com acesso a água, boa iluminação e superfícies laváveis — um centro comunitário, um salão fora do horário ou um espaço religioso.",
        "hours": 1.5,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Consigam equipamento e materiais",
        "description": "Reúnam máquinas, tesouras, capas, pentes, espelhos e descartáveis. Incluam extras de cuidado pessoal, como aparelhos de barbear e itens de higiene para levar para casa.",
        "hours": 2,
        "skills": [
          "divulgação",
          "dirigir"
        ]
      },
      {
        "name": "Montem a higienização e a conformidade com as licenças",
        "description": "Estabeleçam a esterilização das ferramentas entre clientes e sigam as regras locais para oferecer cortes ao público. A limpeza protege todo mundo.",
        "hours": 1.5,
        "skills": [
          "papelada"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Conduzam os dias de cuidado pessoal",
        "description": "Façam o evento, mantenham um clima acolhedor e respeitoso, e tratem cada pessoa como convidada valorizada, não como quem recebe caridade.",
        "hours": 2.5,
        "skills": [
          "organização"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "mutual-aid-moving-crew",
    "name": "Equipe de mudanças de apoio mútuo",
    "purpose": "Ajudar a se mudar quem não pode pagar uma mudança — pessoas saindo de situações inseguras, enfrentando despejo ou indo para um lugar menor.",
    "whoItServes": "Vizinhos e vizinhas de baixa renda, pessoas fugindo de lares inseguros, pessoas idosas e vizinhos e vizinhas com deficiência.",
    "whatYoullNeed": "Pessoas voluntárias com veículos e força, materiais de mudança e práticas claras de segurança. Para quem está saindo de uma situação insegura, mantenham o novo endereço, as datas e os detalhes em sigilo absoluto, e sigam as decisões dessa pessoa sobre os prazos e a segurança dela.",
    "setupHours": 14,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Antes de conseguir um único caminhão, converse com quem já recebe essas ligações — defensoras de sobreviventes de violência doméstica, quem organiza inquilinos, serviços para pessoas idosas — sobre como os pedidos devem chegar até você e que sigilo vão esperar, porque algumas mudanças são de alguém saindo de um lar inseguro. Depois junte três ou quatro pessoas voluntárias com força e um veículo, e dimensionem juntas a primeira mudança pequena.",
    "commonPitfalls": "Equipes de mudança se machucam ou se esgotam rápido: um trabalho ambicioso demais com poucas mãos, alguém levantando peso do jeito errado, um endereço compartilhado num chat de grupo que nunca deveria ter saído do telefone de quem coordena. Mantenha as mudanças dentro dos limites que vocês fixaram, e trate os detalhes de cada mudança delicada como se pudessem pôr alguém em perigo — porque podem.",
    "pairsWith": [
      "tenant-union",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Convoquem uma equipe e veículos",
        "description": "Reúnam pessoas voluntárias capazes de levantar e carregar peso com segurança, além de acesso a caminhonetes ou vans. Mantenham uma lista com disponibilidade para montar uma equipe rápido.",
        "hours": 2.5,
        "skills": [
          "divulgação",
          "dirigir"
        ]
      },
      {
        "name": "Reúnam materiais de mudança",
        "description": "Consigam carrinhos de carga, cintas para móveis, mantas de mudança e caixas reutilizáveis por doação. Materiais compartilhados deixam as mudanças mais rápidas e seguras.",
        "hours": 1.5,
        "skills": [
          "dirigir"
        ]
      },
      {
        "name": "Montem um sistema de pedido e avaliação",
        "description": "Criem uma forma de pedir ajuda e de dimensionar cada mudança: quanto tem, escada ou elevador, distância e prazos. Isso permite planejar o tamanho da equipe e o equipamento.",
        "hours": 2,
        "skills": [
          "organização"
        ]
      },
      {
        "name": "Resolvam segurança e responsabilidade",
        "description": "Treinem as pessoas voluntárias em levantamento seguro, usem termos de responsabilidade simples e confiram o seguro de qualquer veículo usado. Proteger quem ajuda e quem é atendido importa.",
        "hours": 2,
        "skills": [
          "papelada"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Definam agenda e despacho",
        "description": "Encaixem os pedidos nas equipes disponíveis e confirmem com todo mundo na véspera. Mantenham uma lista de reservas, porque mudança não se adia fácil.",
        "hours": 1.5,
        "skills": [
          "organização"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Definam alcance e limites",
        "description": "Decidam o que vocês topam fazer e o que não (nada de materiais perigosos, pianos ou trabalhos além da capacidade segura da equipe). Encaminhem esses casos para outro lugar.",
        "hours": 1,
        "skills": [
          "redação"
        ]
      },
      {
        "name": "Façam as mudanças e acompanhem depois",
        "description": "Realizem a mudança com segurança e respeito, depois confirmem que a pessoa está instalada. Conectem-na a outros projetos (loja grátis, comitê de boas-vindas) conforme precisar.",
        "hours": 3.5,
        "skills": [
          "dirigir"
        ],
        "follows": [
          1,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "disability-support-network",
    "name": "Rede de apoio à deficiência e à acessibilidade",
    "purpose": "Organizar vizinhos e vizinhas com deficiência e pessoas aliadas para apoio mútuo, acessibilidade e defesa de direitos — liderada pelas próprias pessoas com deficiência.",
    "whoItServes": "Vizinhos e vizinhas com deficiência e com doenças crônicas.",
    "whatYoullNeed": "Um sistema de comunicação acessível, lideranças pares e um diretório de recursos. O apoio entre pares complementa o cuidado profissional — encaminhem questões médicas, de cuidado pessoal e jurídicas a profissionais qualificados, e tratem as informações de saúde de cada membro como privadas.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "firstSteps": "Esta rede só funciona se vizinhos e vizinhas com deficiência estiverem à mesa desde a primeiríssima conversa — não consultados depois, e sim decidindo o que ela é. Comece pedindo a duas ou três pessoas com deficiência que você conhece que a cofundem com você (ou, se você mesma vive com deficiência, que dividam a carga), e deixe que as necessidades de acesso delas definam como acontece a primeira reunião: formato, lugar e ritmo incluídos.",
    "commonPitfalls": "O fracasso clássico é gente aliada bem-intencionada construindo para as pessoas com deficiência um programa que ninguém pediu, em formatos que não dá para usar. O mais silencioso é ir virando um serviço informal de cuidados: o apoio entre pares não substitui com segurança o cuidado médico nem o pessoal, então continue encaminhando essas necessidades a profissionais qualificados e guarde as informações de saúde como o assunto privado que são.",
    "pairsWith": [
      "neighborhood-care-network",
      "rides-transportation",
      "health-navigation"
    ],
    "learnMore": [
      "lurking-ok"
    ],
    "tasks": [
      {
        "name": "Centrem a liderança nas pessoas com deficiência",
        "description": "Garantam que membros com deficiência liderem e deem forma à rede. “Nada sobre nós sem nós” é o princípio central — pessoas aliadas apoiam, não dirigem.",
        "hours": 3,
        "skills": [
          "facilitação"
        ]
      },
      {
        "name": "Montem um sistema de comunicação acessível",
        "description": "Ofereçam várias formas de participar (telefone, mensagem, on-line, presencial), usem linguagem simples e garantam que os materiais funcionem com leitores de tela e necessidades variadas.",
        "hours": 3,
        "skills": [
          "acessibilidade",
          "suporte técnico"
        ]
      },
      {
        "name": "Mapeiem necessidades e recursos",
        "description": "Descubram o que os membros precisam e cataloguem recursos locais: transporte acessível, fontes de equipamentos, serviços e ajuda com benefícios. Identifiquem as maiores lacunas.",
        "hours": 5,
        "skills": [
          "divulgação",
          "digitação de dados"
        ]
      },
      {
        "name": "Montem uma troca de apoio mútuo",
        "description": "Criem uma forma de os membros darem e receberem ajuda — tarefas na rua, companhia de apoio em consultas, contatos de acompanhamento — ajustada à capacidade e à necessidade.",
        "hours": 3,
        "skills": [
          "organização"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Criem um acervo de empréstimo de equipamentos",
        "description": "Reúnam e emprestem equipamentos de mobilidade e de assistência, higienizados entre um uso e outro. Muitos aparelhos ficam parados depois que deixam de servir ou de ser necessários.",
        "hours": 4,
        "skills": [
          "divulgação",
          "organização"
        ]
      },
      {
        "name": "Ofereçam apoio de defesa de direitos e navegação",
        "description": "Ajudem os membros a navegar benefícios, adaptações e serviços. Compartilhem informação e acompanhamento, e encaminhem questões jurídicas e médicas a profissionais qualificados.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "papelada"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Definam padrões de acessibilidade para todos os eventos do programa",
        "description": "Desenvolvam uma lista de verificação (acesso ao local, assentos, interpretação, necessidades sensoriais, materiais) para cada projeto do programa mais amplo acolher bem os membros com deficiência.",
        "hours": 3,
        "skills": [
          "acessibilidade",
          "redação"
        ]
      }
    ]
  },
  {
    "id": "books-to-prisoners",
    "name": "Livros para pessoas encarceradas e programa de cartas",
    "purpose": "Enviar livros e cartas gratuitamente a pessoas encarceladas para reduzir o isolamento e apoiar o aprendizado.",
    "whoItServes": "Pessoas encarceladas e, por meio delas, suas famílias e comunidades.",
    "whatYoullNeed": "Livros doados, pessoas voluntárias, postagem e conhecimento das regras de correspondência de cada unidade prisional. As regras de cada unidade são rígidas e diferentes — pacotes que as descumprem são recusados, então sigam-nas à risca, e que as pessoas voluntárias usem sempre o endereço do programa, nunca o de casa.",
    "setupHours": 21,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Antes de coletar um único livro, ligue para um grupo estabelecido de livros para pessoas encarceladas — a maioria compartilha de bom grado quais unidades cobre, quais regras derrubam as pessoas e onde os pedidos ficam sem resposta. Depois consiga por escrito a política de correspondência vigente da uma ou duas unidades com que vocês vão começar; o que as pessoas encarceladas realmente pedem é o que deve moldar o acervo, não o que quem doa tira das próprias estantes.",
    "commonPitfalls": "Este projeto morre de pacote recusado: um livro usado onde só aceitam novos, uma capa dura, uma regra de etiquetagem esquecida — postagem desperdiçada e o pacote tão esperado de alguém devolvido. Ele também pode machucar quem escreve de casa; toda carta sai com o endereço do programa, sem exceção, por mais calorosa que a correspondência se torne.",
    "pairsWith": [
      "reentry-support",
      "free-little-library"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Aprendam as regras de correspondência de cada unidade",
        "description": "Cada prisão tem regras rígidas e específicas — muitas exigem livros novos, enviados direto de uma editora ou loja aprovada, com limites de conteúdo e quantidade. Pesquisem com cuidado, porque correspondência fora das regras é recusada.",
        "hours": 5,
        "skills": [
          "papelada"
        ]
      },
      {
        "name": "Reúnam livros e um espaço de trabalho",
        "description": "Coletem livros doados (dentro das regras das unidades) e montem uma área de triagem e empacotamento. Mantenham variedade: dicionários, educação, ficção e recursos de reingresso costumam ser os mais pedidos.",
        "hours": 4,
        "skills": [
          "divulgação",
          "dirigir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Montem um sistema para cuidar dos pedidos",
        "description": "Criem um processo para receber e acompanhar os pedidos de pessoas encarceradas, que escrevem pedindo temas ou títulos. Combinem os pedidos com os livros disponíveis.",
        "hours": 3,
        "skills": [
          "digitação de dados",
          "organização"
        ]
      },
      {
        "name": "Convoquem e treinem pessoas voluntárias",
        "description": "Treinem as pessoas voluntárias para combinar pedidos, empacotar dentro das regras de cada unidade e escrever bilhetes atenciosos. Precisão nas regras evita postagem desperdiçada e pacotes recusados.",
        "hours": 3,
        "skills": [
          "divulgação",
          "ensino"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Cubram postagem e logística",
        "description": "A postagem é o principal custo contínuo. Arrecadem para ela, usem o envio mais barato que cumpra as regras e organizem dias regulares de remessa.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Organizem um programa de cartas",
        "description": "Formem duplas de correspondência com quem quiser, com orientações claras de segurança e privacidade (usem o endereço do programa, não os pessoais). A conexão importa tanto quanto os livros.",
        "hours": 3,
        "skills": [
          "redação"
        ]
      }
    ]
  },
  {
    "id": "community-music",
    "name": "Programa comunitário de música e instrumentos",
    "purpose": "Emprestar instrumentos e oferecer aulas e jam sessions gratuitas para a música ser acessível a todo mundo.",
    "whoItServes": "Crianças e pessoas adultas que não podem pagar instrumentos ou aulas.",
    "whatYoullNeed": "Instrumentos doados, professoras e professores voluntários, um espaço e um sistema de empréstimo.",
    "setupHours": 15,
    "defaultCategory": "education",
    "firstSteps": "Comece com quem já faz música perto de você — a violonista da igreja da esquina, o regente de banda aposentado, adolescentes que tocam — e pergunte o que gostariam de ensinar e quando. Uma conversa com uma loja de música sobre consertos com desconto, outra com um espaço que tolere barulho, e você já percorreu boa parte do caminho até a primeira jam.",
    "commonPitfalls": "O acervo de empréstimo se esvazia em silêncio quando os instrumentos saem mais rápido do que voltam em condições de tocar, então preveja tempo de conserto desde o início e mantenha a política de devolução compreensiva, mas real. E cuide para as aulas não escorregarem para quem já toca com confiança: a criança que nunca segurou um instrumento precisa da acolhida mais calorosa, não do horário mais curto.",
    "pairsWith": [
      "library-of-things",
      "skill-share",
      "youth-mentorship"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Coletem e consertem instrumentos",
        "description": "Reúnam instrumentos doados e providenciem limpeza, troca de cordas ou conserto para ficarem tocáveis. Montem uma variedade de tipos e níveis de habilidade.",
        "hours": 5,
        "skills": [
          "conserto",
          "dirigir"
        ]
      },
      {
        "name": "Montem um sistema de empréstimo de instrumentos",
        "description": "Criem um registro de saída que acompanhe quem está com o quê, com instruções de cuidado e uma política de devolução compreensiva. Numerem e registrem cada instrumento.",
        "hours": 2,
        "skills": [
          "digitação de dados"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Convoquem professoras e professores voluntários",
        "description": "Encontrem quem faz música e topa ensinar iniciantes com paciência. Não precisam ser profissionais — entusiasmo e habilidade básica levam longe.",
        "hours": 3,
        "skills": [
          "divulgação",
          "música"
        ]
      },
      {
        "name": "Encontrem um espaço para aulas e jams",
        "description": "Garantam uma sala onde barulho não seja problema — um centro comunitário, escola ou salão religioso. Definam horários previsíveis para aulas e para tocar livremente.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Agendem aulas e jam sessions",
        "description": "Ofereçam aulas para iniciantes e jams abertas a todos os níveis. Mantenham a inscrição fácil e horários variados para quem trabalha ou estuda.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "organização"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Definam expectativas de cuidado e devolução",
        "description": "Ensinem a quem pega emprestado o cuidado básico do instrumento e o que fazer se algo quebrar. Mantenham tudo baseado na confiança e no apoio, nunca punitivo.",
        "hours": 1,
        "skills": [
          "redação"
        ],
        "follows": [
          1
        ]
      }
    ]
  },
  {
    "id": "school-supply-program",
    "name": "Programa de material escolar e mochilas",
    "purpose": "Oferecer material escolar e mochilas gratuitamente para as crianças começarem o ano prontas e confiantes.",
    "whoItServes": "Famílias de baixa renda com crianças em idade escolar.",
    "whatYoullNeed": "Doações de material ou fundos, espaço de armazenamento, um ponto de entrega e pessoas voluntárias.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Sua primeira conversa é com uma escola — uma orientadora, uma pessoa de ligação com as famílias ou quem coordena mães e pais e conhece as listas reais de material e quais famílias ficam sem em silêncio. Deixe que definam o que você coleta e como as famílias ficam sabendo; uma entrega que passa por gente em quem mães e pais já confiam chega a crianças que um panfleto nunca alcançará.",
    "commonPitfalls": "O fracasso previsível é uma montanha de pastas doadas e nenhum dos cadernos que as listas realmente pedem — juntar o que é fácil de dar em vez do que faz falta. O que dói é uma entrega com cara de comprovação de pobreza; pule a papelada de renda, deixe cada criança escolher a própria mochila, e ninguém sai se sentindo inspecionado.",
    "pairsWith": [
      "youth-mentorship",
      "toy-library"
    ],
    "tasks": [
      {
        "name": "Consigam as listas de material e meçam a necessidade",
        "description": "Façam parceria com escolas locais para conhecer as listas reais de material por ano escolar e estimar quantas famílias precisam de ajuda. Isso mantém as doações relevantes.",
        "hours": 1.5,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Façam campanhas de arrecadação e compras em atacado",
        "description": "Combinem campanhas de doação com compras em atacado dos itens mais necessários. Comprar em atacado estica o dinheiro ao máximo em básicos como cadernos e lápis.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "divulgação",
          "dirigir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Separem e montem por ano escolar",
        "description": "Organizem o material e montem mochilas conforme a lista de cada ano. Uma sessão de montagem em linha com pessoas voluntárias anda rápido.",
        "hours": 2,
        "skills": [
          "organização"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Montem o armazenamento e um ponto de entrega",
        "description": "Garantam um lugar seco para guardar e um espaço acolhedor para entregar as mochilas, muitas vezes numa escola, num centro comunitário ou junto a outro evento de volta às aulas.",
        "hours": 1.5,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Agendem a entrega e escalem quem ajuda",
        "description": "Façam a entrega antes de as aulas começarem, com pessoas voluntárias acolhedoras. Deixem as crianças escolherem a mochila sempre que der — escolher acrescenta dignidade.",
        "hours": 2,
        "skills": [
          "organização"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "legal-aid-clinic",
    "name": "Clínica de assistência jurídica e programa Conheça seus direitos",
    "purpose": "Conectar a vizinhança a ajuda jurídica gratuita e ensinar às pessoas os seus direitos.",
    "whoItServes": "Qualquer pessoa enfrentando problemas jurídicos sem recursos — questões de moradia, imigração, dívidas, família ou benefícios.",
    "whatYoullNeed": "Advogadas e advogados e estudantes de direito voluntários, um espaço, organizações parceiras de assistência jurídica e uma agenda. A orientação jurídica individual precisa vir de advogadas e advogados qualificados e habilitados (ou de estudantes de direito sob supervisão) — este programa organiza o acesso e compartilha informações gerais sobre direitos; ele não é, por si só, uma fonte de orientação jurídica.",
    "setupHours": 26,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Nada aqui começa antes de você ter advogadas e advogados: as primeiras ligações são para o escritório local de assistência jurídica, o programa pro bono da ordem dos advogados e uma clínica de faculdade de direito, perguntando do que precisariam para aparecer — e onde estão as lacunas que uma clínica de bairro poderia preencher de verdade. Deixe que essas parcerias definam com você o alcance da clínica antes de anunciar qualquer coisa à vizinhança.",
    "commonPitfalls": "O fracasso perigoso é uma pessoa voluntária bem-intencionada escorregar da informação para a orientação — um “é só assinar” dito de boa fé pode arruinar o caso de alguém, então mantenha essa linha nítida e ensaiada. O mais lento é a acolhida crescer mais rápido que as advogadas e os advogados: uma lista de espera de gente desesperada sem advogado na sala quebra a confiança mais rápido do que nunca ter aberto.",
    "pairsWith": [
      "tenant-union",
      "court-support",
      "newcomer-translation-network"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Façam parceria com advogadas, advogados e assistência jurídica",
        "description": "Convidem advogadas e advogados habilitados, ou estudantes de direito supervisionados por eles, para dar a orientação jurídica de verdade. Construam vínculos de encaminhamento com organizações de assistência jurídica já estabelecidas.",
        "hours": 6,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Definam o alcance e os caminhos de encaminhamento",
        "description": "Decidam quais questões a clínica pode atender e definam caminhos claros para encaminhar casos complexos ou especializados. Sejam transparentes sobre o que a clínica pode e não pode fazer.",
        "hours": 3,
        "skills": [
          "escrita"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Montem um espaço e uma acolhida",
        "description": "Garantam um lugar privado e confidencial e criem uma acolhida com uma lista de documentos, para que advogadas e advogados aproveitem bem o tempo curto.",
        "hours": 3,
        "skills": [
          "organização"
        ]
      },
      {
        "name": "Montem um sistema confidencial de horários",
        "description": "Criem agendamentos que protejam a privacidade. Assuntos jurídicos são delicados, então cuidem com carinho das informações das pessoas do começo ao fim.",
        "hours": 3,
        "skills": [
          "organização",
          "digitação de dados"
        ]
      },
      {
        "name": "Desenvolvam materiais e oficinas de Conheça seus direitos",
        "description": "Criem guias claros e precisos e deem oficinas sobre direitos comuns (inquilinos, trabalhadores, imigração, encontros com autoridades). Apresentem tudo como informação geral, não como orientação jurídica individual.",
        "hours": 5,
        "recurringCadence": "event",
        "skills": [
          "escrita",
          "ensino"
        ]
      },
      {
        "name": "Divulguem e agendem as clínicas",
        "description": "Marquem datas recorrentes de clínica e espalhem a notícia pelas organizações parceiras e pelo programa mais amplo de apoio mútuo. Ofereçam interpretação para quem não fala inglês.",
        "hours": 3,
        "skills": [
          "divulgação",
          "tradução"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Protejam a confidencialidade e chequem conflitos",
        "description": "Estabeleçam confidencialidade estrita e uma checagem básica de conflito de interesses, para que a mesma pessoa voluntária nunca oriente partes opostas. Treinem todo mundo nessas responsabilidades.",
        "hours": 3,
        "skills": [
          "papelada"
        ]
      }
    ]
  },
  {
    "id": "resource-hub-dispatch",
    "name": "Central de recursos e encaminhamento de apoio mútuo",
    "purpose": "Funcionar como a espinha dorsal da coordenação — um ponto único onde necessidades e ofertas de todos os projetos do programa se encontram.",
    "whoItServes": "Todo mundo no programa — membros buscando ajuda, pessoas voluntárias oferecendo e quem organiza projetos e precisa de coordenação.",
    "whatYoullNeed": "Um sistema de acolhida, uma lista de pessoas voluntárias e recursos, pessoas coordenadoras e um diretório-mestre. A central guarda informações sensíveis sobre a vida da vizinhança — coletem só o necessário, cuidem bem delas e compartilhem os detalhes apenas com quem precisa deles para ajudar.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "A central coordena projetos, então comece sentando com quem organiza cada um: que pedidos recebem, o que gostariam de poder repassar e como querem receber os encaminhamentos. Combinem juntos uma única acolhida e uma base comum de privacidade — uma central imposta aos projetos acaba sendo contornada; uma construída com eles vira a porta de entrada.",
    "commonPitfalls": "Centrais morrem de dois jeitos: a acolhida enche de pedidos que ninguém acompanha até o fim, e se espalha a notícia de que ligar não adianta nada; ou uma pessoa coordenadora heroica segura todos os fios até se esgotar, e o programa perde a memória. Acompanhe cada pedido até um fechamento de verdade, alterne os turnos desde cedo e colete menos informação do que você acha que precisa.",
    "pairsWith": [
      "emergency-preparedness",
      "rides-transportation",
      "solidarity-fund"
    ],
    "learnMore": [
      "post-something",
      "claim-post"
    ],
    "tasks": [
      {
        "name": "Montem uma acolhida única para necessidades e ofertas",
        "description": "Criem uma porta de entrada fácil — uma linha de telefone, um formulário e uma opção presencial — onde qualquer pessoa possa dizer o que precisa ou o que pode dar. Um único ponto de entrada evita que alguém fique pelo caminho.",
        "hours": 4,
        "skills": [
          "organização",
          "suporte técnico"
        ]
      },
      {
        "name": "Montem uma lista de pessoas voluntárias e recursos",
        "description": "Mantenham uma lista atualizada de pessoas voluntárias (habilidades, disponibilidade, região) e do que cada projeto pode oferecer, para casar os pedidos rápido.",
        "hours": 4,
        "skills": [
          "digitação de dados"
        ]
      },
      {
        "name": "Criem um processo para casar e encaminhar pedidos",
        "description": "Definam como um pedido chega ao projeto ou à pessoa voluntária certa e com que rapidez. Estabeleçam metas de tempo de resposta e como os pedidos são acompanhados até o fim.",
        "hours": 4,
        "skills": [
          "organização"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Mantenham um diretório-mestre de recursos",
        "description": "Cuidem de um diretório vivo de todos os projetos mais os serviços externos (abrigos, clínicas, comida, assistência jurídica), para a central conseguir levar as pessoas aonde quer que exista ajuda.",
        "hours": 5,
        "recurringCadence": "month",
        "skills": [
          "digitação de dados"
        ]
      },
      {
        "name": "Convidem e treinem pessoas coordenadoras",
        "description": "Montem uma equipe para cobrir turnos rotativos de atendimento, para a central seguir respondendo sem esgotar ninguém. Treinem todo mundo no processo e no diretório.",
        "hours": 3,
        "skills": [
          "divulgação",
          "ensino"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Definam práticas de privacidade de dados e acompanhamento",
        "description": "Decidam que informações vocês coletam, como são guardadas e protegidas, e como confirmam que uma necessidade foi mesmo atendida. Coletem o mínimo e cuidem bem dele.",
        "hours": 4,
        "skills": [
          "escrita"
        ]
      },
      {
        "name": "Registrem necessidades não atendidas e lacunas",
        "description": "Anotem os pedidos que não conseguiram atender. Lacunas recorrentes revelam onde o programa deveria começar o próximo projeto — transformando a central numa ferramenta de planejamento, não só numa mesa telefônica.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "digitação de dados"
        ]
      }
    ]
  },
  {
    "id": "harm-reduction-supplies",
    "name": "Distribuição de insumos de redução de danos",
    "purpose": "Colocar naloxona, tiras de teste e insumos de uso mais seguro nas mãos de quem pode precisar — encontrando a vizinhança onde ela está, sem julgamento.",
    "whoItServes": "Pessoas que usam drogas, suas amizades e famílias, e qualquer pessoa que possa presenciar uma overdose — o que, na maioria dos bairros, é qualquer pessoa.",
    "whatYoullNeed": "Treinamento em resposta a overdose, uma fonte de naloxona (programa estadual, farmácia ou organização parceira), insumos para os kits e uma pequena equipe de distribuição. Entregar insumos não é atendimento de saúde — toda pessoa que distribui precisa completar antes um treinamento de resposta a overdose, e a lei sobre o que você pode carregar (tiras de teste, seringas) varia muito de lugar para lugar, então confirme a sua antes de estocar qualquer coisa. Mantenha os telefones locais de crise e de tratamento impressos em cada kit.",
    "setupHours": 20,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Não compre nada ainda: o primeiro passo é uma conversa com o programa de redução de danos estabelecido mais próximo e com as pessoas que realmente usam esses insumos — elas vão dizer o que falta, o que já está coberto e como chegar sem julgamento. Faça a equipe base completar o treinamento de resposta a overdose e confirme a lei local sobre tiras e seringas antes de montar um único kit.",
    "commonPitfalls": "Isso dá errado quando vocês chegam como estranhos — distribuindo onde não têm vínculos, ou somando sermões e condições que ensinam as pessoas a evitar vocês — e quando passam na frente da lei ou do próprio treinamento, o que pode custar a uma pessoa voluntária uma acusação por porte de parafernália. Aqui, devagar e acompanhados ganha de rápido e sozinhos, todas as vezes.",
    "pairsWith": [
      "community-first-aid-training",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Façam o treinamento e encontrem uma parceria de redução de danos",
        "description": "Peçam à equipe base que complete um treinamento de resposta a overdose e uso de naloxona — muitas secretarias de saúde e organizações de redução de danos oferecem de graça. Façam parceria com um programa estabelecido; eles já resolveram problemas de suprimento, de lei e de confiança que vocês não precisam resolver de novo.",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Confira a lei local sobre insumos",
        "description": "O acesso à naloxona é protegido em quase todo lugar, mas tiras de teste e seringas ainda são classificadas como parafernália em alguns lugares. Descubra exatamente o que você pode carregar e entregar dentro da lei — a organização parceira ou uma clínica de assistência jurídica responde rápido. Deixe por escrito para as pessoas voluntárias.",
        "hours": 3,
        "skills": [
          "pesquisa"
        ]
      },
      {
        "name": "Consiga naloxona e insumos para os kits",
        "description": "Peça naloxona por um programa estadual de distribuição, uma ordem permanente de farmácia ou a organização parceira. Acrescente o que mais for legal onde você está: tiras de teste de fentanil e xilazina, material de curativo, itens de higiene.",
        "hours": 4,
        "follows": [
          1
        ]
      },
      {
        "name": "Montem kits com instruções em linguagem simples",
        "description": "Montem os kits com instruções simples e multilíngues: como reconhecer uma overdose, como aplicar a naloxona, ligar para os serviços de emergência, nunca usar sozinho. Incluam os telefones locais de crise e de tratamento em cada kit. A montagem rende rápido com uma mesa cheia de gente.",
        "hours": 3,
        "skills": [
          "tradução"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Estabeleça rondas de distribuição e pontos fixos",
        "description": "Planeje rondas regulares a pé ou de carro pelos lugares onde as pessoas realmente estão, e peça a bares, mercadinhos, bibliotecas e casas de show que mantenham uma caixa sem perguntas. A barreira baixa é o ponto todo — sem formulários, sem sermão.",
        "hours": 4,
        "skills": [
          "divulgação",
          "dirigir"
        ]
      },
      {
        "name": "Reabasteça, acompanhe e mantenha o treinamento em dia",
        "description": "Anote o que acaba e o que encalha, registre as datas de validade da naloxona e organize treinamentos de reciclagem quando entrarem novas pessoas voluntárias. Se um kit reverter uma overdose, vale registrar (com delicadeza).",
        "hours": 2,
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "court-support",
    "name": "Apoio e acompanhamento em audiências",
    "purpose": "Garantir que ninguém da vizinhança enfrente uma audiência sozinho — companhia na sala, uma carona até lá, cuidado das crianças durante a audiência e cartas de apoio quando a defesa pedir.",
    "whoItServes": "Vizinhas e vizinhos com audiências criminais, de imigração, de despejo ou de família, e suas famílias — ir ao tribunal sem companhia pode custar emprego, o cuidado das crianças e a esperança.",
    "whatYoullNeed": "Pessoas voluntárias confiáveis, um calendário de audiências e vínculos com a defensoria pública. Apoio em audiência é presença e logística, não orientação jurídica — as pessoas voluntárias nunca opinam sobre o caso e sempre seguem a orientação da advogada ou advogado da própria pessoa. Salas de audiência têm regras de conduta rígidas, então quem for precisa conhecê-las de cor.",
    "setupHours": 16,
    "defaultCategory": "other",
    "firstSteps": "Comece pelas pessoas donas dessas datas: o apoio só acontece a convite de quem enfrenta o tribunal, e em sintonia com sua advogada ou advogado. Apresentem-se primeiro à defensoria pública e aos grupos de observação de audiências ou fundos de fiança que já estão no fórum, e deixe que eles digam quais audiências precisam de companhia e como ser úteis sem nunca encostar no lado jurídico.",
    "commonPitfalls": "O dano aqui vem de agir por conta própria: uma pessoa voluntária “explicando” um acordo no corredor, detalhes do caso conversados onde um promotor pode ouvir, uma reação visível da plateia que irrita o juiz — qualquer uma pode prejudicar justamente a pessoa por quem vocês foram. O fracasso mais silencioso é a logística: uma data não confirmada ou uma carona que falha pode significar uma audiência perdida e um mandado de prisão.",
    "pairsWith": [
      "legal-aid-clinic",
      "reentry-support",
      "rides-transportation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Conectem-se com defensorias e grupos que já atuam no fórum",
        "description": "Apresentem-se à defensoria pública, à assistência jurídica de imigração e a qualquer grupo de observação de audiências ou fundo de fiança que já esteja trabalhando. Eles vão dizer onde o apoio faz mais falta e como entrar sem atrapalhar.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Escreva as regras base: apoio, não direito",
        "description": "Coloque por escrito: pessoas voluntárias nunca dão orientação jurídica, nunca comentam detalhes do caso nas áreas públicas do fórum e sempre se remetem à advogada ou advogado da própria pessoa. Acrescente a conduta na sala — chegar cedo, roupa discreta, telefones desligados, nenhuma reação da plateia.",
        "hours": 2,
        "skills": [
          "escrita"
        ]
      },
      {
        "name": "Monte uma acolhida e um calendário de audiências",
        "description": "Crie um jeito simples de pedir apoio e um calendário compartilhado com datas, salas e o que cada pessoa precisa — companhia, uma carona, cuidado das crianças, ou as três coisas. Datas de audiência mudam o tempo todo, então confirme na véspera.",
        "hours": 3,
        "skills": [
          "organização"
        ]
      },
      {
        "name": "Treine as pessoas voluntárias de acompanhamento",
        "description": "Percorra com elas uma visita ao fórum: a revista de segurança, achar a sala, onde sentar e como simplesmente ser companhia firme e calorosa numa espera estressante. Junte cada pessoa nova com alguém experiente na primeira audiência.",
        "hours": 3,
        "skills": [
          "ensino"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Coordene caronas e cuidado das crianças para as audiências",
        "description": "Garanta motoristas para as manhãs de tribunal e duplas de cuidado que fiquem com as crianças durante as audiências — muitas salas não permitem crianças, e uma audiência perdida por falta de quem cuide delas pode significar um mandado de prisão.",
        "hours": 3,
        "skills": [
          "dirigir",
          "cuidado de crianças"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Organize cartas de apoio quando a defesa pedir",
        "description": "Quando a advogada ou advogado de alguém pedir cartas de referência ou de apoio da comunidade, coordene a vizinhança para escrevê-las — seguindo à risca a orientação da defesa sobre conteúdo, tom e prazo.",
        "hours": 2,
        "skills": [
          "escrita"
        ]
      }
    ]
  },
  {
    "id": "cooling-warming-center",
    "name": "Centro emergencial contra o calor e o frio",
    "purpose": "Abrir um refúgio climático de bairro — uma sala fresca na onda de calor, uma aquecida na onda de frio — pronto antes de o tempo ficar perigoso, não depois.",
    "whoItServes": "Pessoas mais velhas, vizinhas e vizinhos em situação de rua, gente sem ar-condicionado ou aquecimento que funcione, quem trabalha ao ar livre e qualquer pessoa cuja moradia não dá conta do tempo.",
    "whatYoullNeed": "Um espaço anfitrião com climatização e banheiros, insumos e pessoas anfitriãs treinadas em turnos. Quem recebe é da vizinhança, não da área da saúde — treinem todo mundo para reconhecer a exaustão pelo calor e a hipotermia e para ligar cedo para os serviços de emergência, e resolvam a questão do seguro e da responsabilidade do espaço antes da primeira ativação, não durante.",
    "setupHours": 21,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "O espaço anfitrião é a relação da qual tudo depende, então comece por aí: sente com a bibliotecária, o pastor ou quem administra o salão e enfrentem juntos as perguntas incômodas — horários, chaves, seguro, o que acontece se alguém precisar passar a noite — antes que a primeira previsão do tempo force a resposta. Ao mesmo tempo, pergunte às equipes de abordagem de rua e ao pessoal dos prédios de pessoas idosas quem precisa do refúgio de verdade, para o lugar e os horários servirem às pessoas para quem ele existe.",
    "commonPitfalls": "Este projeto fracassa na lacuna entre o plano e o tempo: um gatilho que ninguém combinou direito, e o centro abre um dia atrasado, ou uma questão de responsabilidade deixada vaga até alguém passar mal e o espaço anfitrião desistir de vez. Deixem o limite de ativação por escrito, façam uma abertura de ensaio antes da temporada e garanta que cada pessoa anfitriã saiba ligar cedo para a emergência, não por último.",
    "pairsWith": [
      "emergency-preparedness",
      "community-wood-bank",
      "laundry-shower-access"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Encontre um espaço anfitrião com climatização",
        "description": "Pergunte em bibliotecas, espaços de fé, sedes de sindicato e centros comunitários por uma sala com ar-condicionado e aquecimento confiáveis, banheiros e entrada sem degraus. Consiga um sim por escrito cobrindo horários, quem fica com as chaves e o que acontece se precisarem à noite.",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Definam os gatilhos de ativação e um plano de aviso",
        "description": "Decidam de antemão o que exatamente abre o centro — uma temperatura prevista, um índice de calor, uma sensação térmica — para ninguém precisar decidir à meia-noite. Montem uma corrente telefônica ou um chat de grupo que deixe as pessoas anfitriãs de prontidão com um dia de antecedência.",
        "hours": 2
      },
      {
        "name": "Estoque os insumos",
        "description": "Reúna água, sachês de eletrólitos, cobertores, camas dobráveis ou cadeiras confortáveis, ventiladores, carregadores de telefone e um kit de primeiros socorros. Guarde tudo no espaço, em caixas etiquetadas, para qualquer pessoa anfitriã achar as coisas.",
        "hours": 3,
        "skills": [
          "dirigir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Convide e treine quem recebe nos turnos",
        "description": "Encontre pessoas voluntárias suficientes para duas por turno e treine: receber gente sem papelada, reconhecer exaustão pelo calor e hipotermia, quando ligar para os serviços de emergência e noções básicas de desescalada. O calor humano importa tanto quanto o termostato.",
        "hours": 4,
        "skills": [
          "ensino"
        ]
      },
      {
        "name": "Monte a escala de turnos",
        "description": "Prepare uma escala de turnos que você consiga acionar com um dia de aviso — quem abre, quem fecha e cobertura noturna, se oferecerem. Mantenha uma lista de reserva, porque as ondas de calor também derrubam as pessoas voluntárias.",
        "hours": 2,
        "skills": [
          "organização"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Espalhe a notícia antes da temporada",
        "description": "Faça panfletos multilíngues com os gatilhos e o endereço, e leve a clínicas, prédios de pessoas idosas, equipes de abordagem de rua e mercadinhos antes da primeira onda de calor ou de frio — não durante.",
        "hours": 3,
        "skills": [
          "design gráfico",
          "tradução"
        ]
      },
      {
        "name": "Abra, receba e reorganize a cada ativação",
        "description": "Mantenha o centro aberto enquanto durar o evento climático: registre as pessoas sem rigidez (uma contagem, não documentos), mantenha os insumos circulando e veja como está quem estiver dormindo. Depois, limpe, reponha e anote o que faltou.",
        "hours": 3,
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-oral-history",
    "name": "História oral da comunidade",
    "purpose": "Gravar as histórias das pessoas mais velhas e da vizinhança antes que se percam — e deixar quem conta no comando do que acontece com elas.",
    "whoItServes": "Pessoas mais velhas com histórias que ninguém pediu para ouvir, moradores de longa data vendo o bairro mudar e cada vizinha e vizinho que vier depois.",
    "whatYoullNeed": "Um telefone ou um gravador simples, um canto tranquilo, termos de consentimento e um lugar seguro para guardar os arquivos. Gravações são dados pessoais — cada participante é dono da própria história, decide onde ela é compartilhada e pode mudar de ideia depois. Nada vai a público sem o sim por escrito.",
    "setupHours": 10,
    "defaultCategory": "education",
    "firstSteps": "Comece com uma pessoa mais velha que confia em você e pergunte se ela compartilharia uma história — essa primeira gravação ensina mais que qualquer plano, e a palavra dela responde por você com quem vier depois. Antes de apertar gravar com qualquer pessoa, leiam juntos o termo de consentimento e pergunte o que ela gostaria que acontecesse com a gravação; essa conversa é o projeto.",
    "commonPitfalls": "O jeito de isso machucar alguém é uma história viajar mais longe do que quem contou combinou — um trecho publicado, um nome anexado, um detalhe que era só para você. O jeito de morrer em silêncio é com gravações se acumulando sem etiqueta no telefone de uma pessoa só, até um aparelho perdido apagar anos de vozes; etiquete e faça cópia de cada sessão na mesma semana.",
    "pairsWith": [
      "neighborhood-care-network",
      "digital-literacy"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Escreva um termo de consentimento em linguagem simples",
        "description": "Uma página, sem juridiquês: o que está sendo gravado, onde pode ser compartilhado e o direito de quem participa de pausar, pular perguntas ou retirar a gravação depois. Traduza para os idiomas que as pessoas narradoras falam de verdade.",
        "hours": 2,
        "skills": [
          "escrita",
          "tradução"
        ]
      },
      {
        "name": "Reúna o equipamento e uma lista de perguntas",
        "description": "Um telefone com um aplicativo de notas de voz basta; some um microfone de lapela barato se der. Rascunhe perguntas abertas que convidem histórias — “me conta como era a rua quando você chegou” — e pratiquem uma vez entre vocês.",
        "hours": 2
      },
      {
        "name": "Grave as sessões de histórias",
        "description": "Sente com uma pessoa narradora por vez, num lugar tranquilo e confortável. Leiam juntos o termo de consentimento primeiro, e depois sobretudo escute — as melhores entrevistas são aquelas em que você fala menos.",
        "hours": 4,
        "skills": [
          "escuta"
        ],
        "follows": [
          0,
          1
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Arquive e devolva, nos termos de cada pessoa",
        "description": "Etiquete cada gravação com a data, os nomes e o que foi combinado sobre compartilhar. Guarde duas cópias em lugar seguro, entregue a cada pessoa narradora a própria cópia e compartilhe publicamente só os trechos que cada uma aprovou.",
        "hours": 2,
        "follows": [
          2
        ]
      }
    ]
  },
  {
    "id": "community-solar-coop",
    "name": "Cooperativa comunitária de energia solar",
    "purpose": "Juntar os recursos da vizinhança em energia renovável compartilhada que baixa a conta de todo mundo — principalmente para quem aluga e para as famílias que nunca poderiam pôr placas num telhado próprio.",
    "whoItServes": "Quem mora de aluguel, famílias de baixa renda e qualquer pessoa a quem o telhado, o dono do imóvel ou o orçamento fecha a porta da energia solar própria.",
    "whatYoullNeed": "Membros comprometidos, conhecimento técnico e financeiro que dê para emprestar ou aprender, um espaço anfitrião ou um programa de energia solar comunitária existente para entrar, e organizações parceiras. Uma coisa dita sem rodeios: cooperativas de energia carregam complexidade financeira e jurídica de verdade — busquem orientação de profissionais qualificados sobre estrutura, financiamento e contratos antes de alguém assinar qualquer coisa.",
    "setupHours": 27,
    "defaultCategory": "infrastructure",
    "firstSteps": "Antes de qualquer placa ou papelada, conversem com dois grupos: a vizinhança que de fato entraria, para medir o compromisso real, e uma cooperativa solar de uma cidade ou estado vizinho que já fez isso — eles vão dizer qual modelo cabe nas regras da sua região e quais erros custaram dinheiro. Depois leiam vocês mesmos essas regras locais, porque são elas, e não o entusiasmo de vocês, que decidem o que é possível.",
    "commonPitfalls": "Cooperativas solares morrem na lacuna entre o entusiasmo e as assinaturas: um ano de reuniões sobre um modelo que as regras do seu estado nunca permitiram, ou um contrato assinado sem revisão profissional que amarra os membros a termos que ninguém entendeu. O outro assassino é o dinheiro embaçado — se os membros não conseguem ver com clareza o que puseram e o que volta, a confiança se desgasta e a cooperativa se desfaz.",
    "pairsWith": [
      "weatherization-brigade",
      "bulk-buying-coop"
    ],
    "tasks": [
      {
        "name": "Reúna membros e meça o interesse",
        "description": "Convide famílias interessadas em energia limpa mais barata e descubra o quanto estão comprometidas de verdade — entusiasmo vago e um membro inscrito são coisas diferentes. Seus números definem quais modelos são realistas, então conte com honestidade antes de planejar.",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Aprenda os modelos e as regras locais",
        "description": "Pesquise como a energia solar comunitária funciona onde você mora: leis estaduais, compensação de energia, programas de assinatura, estruturas cooperativas. As regras variam enormemente de um lugar para outro e determinam o que é possível de fato — faça isso antes de se apaixonar por um modelo.",
        "hours": 5,
        "skills": [
          "pesquisa"
        ]
      },
      {
        "name": "Encontre um lugar ou um programa para entrar",
        "description": "Procure um telhado anfitrião ou um terreno para um conjunto compartilhado, ou verifique se um programa de energia solar comunitária existente aceitaria o grupo como assinantes coletivos — entrar num programa costuma ser bem mais rápido que construir. Pese os dois caminhos com os membros antes de se comprometer.",
        "hours": 4,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Resolva o financiamento e a estrutura jurídica",
        "description": "Decidam como o projeto é financiado e governado, e constituam a cooperativa direito. Este é o passo com implicações jurídicas e financeiras reais — tragam profissionais qualificados para revisar a estrutura e cada contrato, e não assinem até que tenham revisado.",
        "hours": 5,
        "skills": [
          "papelada",
          "contabilidade"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Faça parceria com instaladores e fornecedores",
        "description": "Garanta instaladores ou fornecedores de boa reputação, compare mais de um orçamento e confirme por escrito as garantias e a manutenção de longo prazo. Uma instalação barata sem plano de manutenção sai caríssima em cinco anos.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Monte o sistema de créditos na conta e de participação",
        "description": "Definam exatamente como as economias ou créditos chegam aos membros e como funcionam a participação e os pagamentos. Deixem transparente e fácil de entender — um membro deveria conseguir ver, numa página só, o que pôs e o que volta.",
        "hours": 3,
        "skills": [
          "contabilidade",
          "digitação de dados"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Eduque os membros sobre o consumo de energia",
        "description": "Ajude os membros a ler a conta de luz e a cortar o consumo — um quilowatt economizado vale mais que um quilowatt gerado. Junte as economias do solar com dicas simples de eficiência para as famílias verem a diferença no papel.",
        "hours": 3,
        "skills": [
          "ensino"
        ]
      }
    ]
  },
  {
    "id": "worker-coop-incubator",
    "name": "Incubadora de cooperativas de trabalho e habilidades profissionais",
    "purpose": "Ajudar a vizinhança a desenvolver habilidades profissionais e lançar cooperativas de trabalho — meios de vida onde quem faz o trabalho é dono do lugar e toma as decisões.",
    "whoItServes": "Vizinhas e vizinhos sem emprego ou em subemprego, e qualquer pessoa que queira uma participação real no lugar onde trabalha.",
    "whatYoullNeed": "Mentores com experiência em negócios e cooperativas, espaço e materiais de formação, apoios de largada para indicar aos empreendimentos, e parcerias — assessorias de cooperativas, quem empresta dinheiro e conhece cooperativas, e o seu próprio programa de troca de saberes.",
    "setupHours": 27,
    "defaultCategory": "education",
    "firstSteps": "Comece com conversas, não com um currículo: sente com os membros interessados para falar do que sabem fazer e do que querem construir, e procure os agrupamentos de habilidades que poderiam mesmo virar um empreendimento. Ao mesmo tempo, encontre a assessoria de cooperativas da sua região ou uma cooperativa de trabalho existente disposta a ser mentora — as cicatrizes deles são o seu currículo, e formar cooperativa sem essa companhia é onde os grupos se machucam.",
    "commonPitfalls": "Isto fracassa de dois jeitos: como um programa de formação que nunca lança nada, porque ninguém empurrou um agrupamento de habilidades na direção de um empreendimento real — ou como um lançamento que pula as partes chatas, constituindo a cooperativa num modelo baixado da internet e descobrindo a bagunça de governança e impostos dois anos depois. Também morre em silêncio quando uma pessoa organizadora concentra cada relação com mentores e financiadores; compartilhem esses contatos desde o primeiro dia.",
    "pairsWith": [
      "skill-share",
      "solidarity-fund",
      "time-bank"
    ],
    "tasks": [
      {
        "name": "Levante as habilidades e as metas dos membros",
        "description": "Sente com os membros e aprenda o que sabem fazer e o que querem construir. Você procura agrupamentos — três pessoas que cozinham, uma turma com ofícios, cinco que limpam — porque um agrupamento de habilidades é a semente de um empreendimento cooperativo viável.",
        "hours": 4,
        "skills": [
          "entrevistas"
        ]
      },
      {
        "name": "Ofereça preparação para o trabalho e formação em habilidades",
        "description": "Organize sessões sobre currículos, entrevistas, ofícios, habilidades digitais e educação financeira. Apoie-se no seu programa de troca de saberes e traga gente especialista de fora para o que ninguém local sabe ensinar — a meta é ter membros capazes, forme-se ou não uma cooperativa ao redor deles.",
        "hours": 5,
        "skills": [
          "ensino"
        ]
      },
      {
        "name": "Ensine o modelo cooperativo",
        "description": "Guie os membros pela propriedade de quem trabalha e pela governança democrática: como os ganhos são divididos, como as decisões são tomadas e em que tudo difere de um negócio tradicional. Ninguém escolhe um modelo que nunca viu — use cooperativas reais como exemplo.",
        "hours": 4,
        "skills": [
          "ensino",
          "facilitação"
        ]
      },
      {
        "name": "Acompanhe a formação das cooperativas",
        "description": "Quando um grupo estiver pronto, ajude a escrever um plano de negócio e escolher uma estrutura jurídica. Conecte com advogados e contadores que conhecem cooperativas em vez de improvisar os passos jurídicos e contábeis — uma constituição malfeita sai cara de desfazer.",
        "hours": 5,
        "skills": [
          "papelada"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Conecte com recursos de largada",
        "description": "Monte uma lista viva de microcréditos, editais, fundos de desenvolvimento cooperativo e incubadoras, e ajude os empreendimentos a de fato se candidatar. A maior parte do dinheiro para cooperativas existe, mas está mal sinalizada — o seu mapa vale dinheiro de verdade.",
        "hours": 3,
        "skills": [
          "pesquisa"
        ]
      },
      {
        "name": "Ofereça mentoria",
        "description": "Junte cada empreendimento novo com uma pessoa cooperativista experiente ou mentora de negócios que acompanhe as etapas iniciais e frágeis. O primeiro ano é onde as cooperativas quebram; uma mentoria constante que já viu o padrão muda as chances.",
        "hours": 3
      },
      {
        "name": "Construa apoio entre os empreendimentos",
        "description": "Reúna os empreendimentos numa rede onde as cooperativas trocam lições, indicam clientes umas às outras e compram umas das outras. Cooperativas que negociam entre si sobrevivem a crises que matam as isoladas.",
        "hours": 3,
        "skills": [
          "organização"
        ]
      }
    ]
  },
  {
    "id": "elder-meal-delivery",
    "name": "Companhia e entrega de refeições para pessoas idosas",
    "purpose": "Levar refeições regulares e visitas amigas a pessoas idosas que não conseguem sair de casa — a comida importa, e os dez minutos de conversa na porta muitas vezes importam mais.",
    "whoItServes": "Vizinhas e vizinhos idosos isolados, presos em casa ou fragilizados — e as famílias que se preocupam com eles de longe.",
    "whatYoullNeed": "Voluntários confiáveis e já verificados, uma fonte de refeições, rotas planejadas e práticas simples de segurança para o momento em que uma porta não se abre.",
    "setupHours": 22,
    "defaultCategory": "food",
    "firstSteps": "Comece pela fonte de refeições e pelas cinco primeiras pessoas idosas, não por uma folha de inscrição: converse com a equipe da refeição comunitária ou com um par de cozinheiros dispostos sobre o que conseguem produzir com constância, e pergunte a quem trabalha com pessoas idosas, enfermeiras paroquiais e farmacêuticos quem está de fato ficando sem comer. Verifique seus primeiros voluntários antes da primeira entrega, não depois — a confiança que você está construindo vive ou morre conforme quem cruza aquelas portas.",
    "commonPitfalls": "O fracasso perigoso é um sinal perdido — um voluntário que dá de ombros para uma porta sem resposta porque ninguém deixou por escrito o que fazer, ou uma alergia que nunca chegou à folha de rota. O fracasso lento é a falta de constância: as pessoas idosas organizam o dia em torno da visita, e uma rota que pula semanas ensina a não contar com você. Melhor cinco pessoas atendidas toda semana, sem falta, do que vinte atendidas às vezes.",
    "pairsWith": [
      "community-meal",
      "neighborhood-care-network",
      "rides-transportation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Identifique as pessoas idosas que não saem de casa",
        "description": "Encontre-as por meio de clínicas, serviços para pessoas idosas, grupos de fé e o boca a boca. Faça isso com respeito e de forma estritamente voluntária — você está oferecendo uma refeição e companhia, não inscrevendo ninguém num sistema de vigilância.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Convoque e verifique voluntários",
        "description": "Quem entra na casa de uma pessoa idosa passa por verificação: referências e checagens básicas, sem exceção para amigos de amigos. Depois, mire na constância — pessoas idosas ficam melhor com o mesmo rosto conhecido na porta a cada semana do que com um elenco rotativo.",
        "hours": 4,
        "skills": [
          "organização"
        ]
      },
      {
        "name": "Garanta uma fonte de refeições",
        "description": "Assegure refeições de uma cozinha comunitária, de cozinheiros caseiros dispostos ou de restaurantes que doem porções. Preste atenção à nutrição e à facilidade de requentar, e etiquete cada pote com o conteúdo — uma refeição sem etiqueta é uma aposta para quem tem alergias.",
        "hours": 4,
        "skills": [
          "cozinha",
          "segurança alimentar"
        ]
      },
      {
        "name": "Planeje as rotas e o calendário de entregas",
        "description": "Agrupe as pessoas idosas em rotas eficientes e estabeleça um ritmo confiável — os mesmos dias, mais ou menos os mesmos horários. Inclua alguns minutos de conversa sem pressa em cada parada; para muita gente, essa é a verdadeira entrega.",
        "hours": 3,
        "skills": [
          "dirigir",
          "organização"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Registre informações de dieta, alergias e emergência",
        "description": "Para cada pessoa, registre necessidades alimentares, alergias, remédios que importam na hora de comer e contatos de emergência. Guarde tudo em segurança e só para quem precisa saber — quem dirige precisa da alergia, não do histórico médico inteiro.",
        "hours": 3,
        "skills": [
          "digitação de dados"
        ]
      },
      {
        "name": "Estabeleça um protocolo de verificação de bem-estar",
        "description": "Deixe por escrito exatamente o que um voluntário faz quando uma pessoa idosa não responde ou parece mal: para quem ligar primeiro, quando envolver a família ou os serviços de emergência e como anotar o que aconteceu. Decidir isso de antemão é melhor que improvisar numa soleira.",
        "hours": 3,
        "skills": [
          "escrita"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Apoie os voluntários e recolha opiniões",
        "description": "Converse com os voluntários com regularidade, alterne as rotas quando alguém precisar de uma pausa e pergunte às próprias pessoas idosas como o projeto poderia servi-las melhor. Elas vão contar coisas que os voluntários nunca veem.",
        "hours": 2
      }
    ]
  },
  {
    "id": "disaster-relief-hub",
    "name": "Centro de distribuição de ajuda em desastres",
    "purpose": "Montar um centro que consiga receber, separar e mover suprimentos rápido quando um desastre acontece — porque os primeiros dias depois de uma enchente ou de um incêndio se ganham ou se perdem na logística.",
    "whoItServes": "Moradores atingidos por enchentes, tempestades, incêndios e outros desastres — começando pelos vizinhos com menos condições de se deslocar ou de esperar.",
    "whatYoullNeed": "Um local combinado de antemão com um reserva, canais para conseguir suprimentos, uma equipe de voluntários de prontidão e coordenação com a rede de preparação para emergências — quase tudo arranjado antes de qualquer desastre, porque depois já é tarde.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "suggestsWorkDays": true,
    "firstSteps": "O centro existe no papel muito antes de existir num estacionamento, então comece pela rede de preparação para emergências — ela guarda a árvore de contatos e o panorama de riscos — e pela pergunta honesta de que prédio de fato deixaria vocês entrarem às seis da manhã depois de uma enchente. Feche primeiro o acordo do local e o reserva; todas as outras tarefas dependem de um endereço.",
    "commonPitfalls": "Centros de ajuda fracassam em duas direções: o centro que existe só como um plano que ninguém ensaiou, e o evento real queima o primeiro dia em perguntas que um simulado teria respondido — e o centro que abre as portas para uma avalanche de doações que não consegue separar, virando um depósito de roupas inúteis enquanto as pessoas precisam de água. O dano mais silencioso é a distribuição com barreiras: no momento em que alguém precisa provar que merece ajuda, você recriou o sistema que construiu isto para contornar.",
    "pairsWith": [
      "emergency-preparedness",
      "resource-hub-dispatch"
    ],
    "learnMore": [
      "internet-outage"
    ],
    "tasks": [
      {
        "name": "Identifique de antemão um local e um reserva",
        "description": "Procure um prédio ou terreno que consiga receber entregas, separar doações e abrigar uma fila de distribuição — mais um reserva caso o primeiro fique danificado ou inacessível. Confirme o acesso e as chaves com os donos agora, com o tempo calmo; um local onde você não consegue entrar não é um local.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Construa canais de abastecimento",
        "description": "Combine com antecedência de onde viriam água, comida e os itens de higiene e limpeza — fornecedores, organizações parceiras, campanhas de arrecadação. Igualmente importante: um jeito de saber o que as pessoas precisam de verdade depois de um evento, para você não ser soterrado pelas coisas erradas.",
        "hours": 4,
        "skills": [
          "divulgação",
          "organização"
        ]
      },
      {
        "name": "Monte a recepção, a triagem e o inventário",
        "description": "Desenhe como as doações são recebidas, separadas e registradas desde o momento em que um caminhão chega. Todo centro que já se afogou em doações sem triagem pulou esta etapa — defina suas categorias, etiquetas e contagens simples antes de precisar delas.",
        "hours": 4,
        "skills": [
          "organização",
          "digitação de dados"
        ]
      },
      {
        "name": "Crie um sistema de distribuição",
        "description": "Planeje como os suprimentos saem: com equidade e sem barreiras — sem pedir documento, sem prova de necessidade — e com entrega móvel para quem não consegue chegar ao centro. Priorize primeiro as pessoas mais vulneráveis, e deixe essa prioridade por escrito para que sobreviva ao caos.",
        "hours": 3,
        "skills": [
          "dirigir",
          "organização"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Convoque e treine uma equipe de voluntários de prontidão",
        "description": "Monte uma lista de pessoas que consigam se mobilizar em cima da hora e treine-as de antemão nos papéis, nas regras de segurança e no seu sistema de recepção e distribuição. Uma equipe treinada de doze rende mais que uma multidão bem-intencionada de cinquenta.",
        "hours": 4,
        "skills": [
          "ensino"
        ]
      },
      {
        "name": "Coordene com outras equipes de resposta",
        "description": "Apresente o centro aos órgãos oficiais de emergência e aos outros grupos de ajuda antes que algo aconteça. Combinem quem cobre o quê, para preencher lacunas em vez de duplicar — o apoio mútuo avança mais rápido justamente onde a resposta oficial é mais lenta.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Planeje a comunicação e a segurança",
        "description": "Prepare-se para as redes caírem: meios de contato sem internet, listas impressas e um elo com a árvore de contatos da rede de preparação. Fixem regras duras de segurança para os voluntários — ninguém entra em estruturas inseguras, nunca — e deixem tudo por escrito.",
        "hours": 3,
        "skills": [
          "escrita"
        ]
      }
    ]
  },
  {
    "id": "recovery-peer-support",
    "name": "Rede de apoio entre pares em recuperação e sobriedade",
    "purpose": "Sustentar apoio conduzido por pares para vizinhos em recuperação do uso de substâncias, ou em busca dela — um complemento do tratamento profissional, nunca um substituto.",
    "whoItServes": "Pessoas em recuperação, pessoas pensando nisso e as famílias e amizades que caminham ao lado delas.",
    "whatYoullNeed": "Facilitadores pares com experiência vivida e formação de verdade, um espaço seguro e privado, caminhos de encaminhamento e limites ditos com clareza: o apoio entre pares complementa o tratamento profissional, não o substitui; facilitadores não são profissionais de saúde e nunca devem aconselhar sobre desintoxicação ou medicação; e há sempre um plano claro para conectar qualquer pessoa em crise a ajuda profissional ou de emergência qualificada.",
    "setupHours": 22,
    "defaultCategory": "emotional_support",
    "firstSteps": "Comece pelas pessoas que vão sustentar a sala: encontre um ou dois vizinhos com experiência vivida e sólida de recuperação, inscreva-os numa formação formal de apoio entre pares e escrevam juntos o escopo — o que esta rede é e não é — antes de anunciar qualquer coisa. Depois conheça em pessoa os programas de tratamento e os serviços de crise locais, para que seu caminho de encaminhamento seja uma relação, não um número de telefone num panfleto.",
    "commonPitfalls": "Isto fica perigoso quando a linha se borra — um facilitador bem-intencionado aconselhando alguém sobre desintoxicação ou medicação, o que pode matar, ou um grupo escorregando para o tratamento amador porque o caminho de encaminhamento nunca foi real. Fracassa em silêncio pela confidencialidade quebrada — uma única história vazada esvazia a sala para sempre — e pelo esgotamento dos facilitadores, quando a pessoa que sustenta a recuperação de todos não tem apoio para a própria.",
    "pairsWith": [
      "mental-health-peer-support",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Convoque e forme facilitadores pares",
        "description": "Procure pessoas com experiência vivida de recuperação e garanta que concluam uma formação reconhecida de apoio entre pares em recuperação. Seja claro desde a primeira conversa: facilitadores são pares, não profissionais de saúde ou de clínica, e a formação é o que mantém essa linha segura.",
        "hours": 5,
        "skills": [
          "facilitação",
          "ensino"
        ]
      },
      {
        "name": "Defina o escopo e os limites",
        "description": "Deixe por escrito o que a rede faz — apoio entre pares, conexão, incentivo — e o que não faz: tratamento, desintoxicação, atendimento médico, conselhos sobre medicação. Um escopo escrito protege os membros dos maus conselhos e protege os facilitadores de carregar o que não é deles.",
        "hours": 3,
        "skills": [
          "escrita"
        ]
      },
      {
        "name": "Construa caminhos de encaminhamento e de crise",
        "description": "Crie relações de trabalho com programas de tratamento profissional, atendimento médico e serviços de crise, e escreva um plano de resposta a overdose. Quando alguém na sala precisar de mais do que os pares podem dar, a passagem deve ser uma ligação calorosa, não um panfleto.",
        "hours": 4,
        "skills": [
          "divulgação",
          "pesquisa"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Encontre um espaço seguro, privado e livre de substâncias",
        "description": "Procure uma sala confidencial, acolhedora e livre de julgamentos e de substâncias — um lugar onde as pessoas possam ser vistas entrando sem que isso anuncie nada. Funcionam bem bibliotecas, salões comunitários e espaços de fé com entrada separada.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Estabeleça a confidencialidade e as normas do grupo",
        "description": "Combinem as regras básicas: o que se diz aqui fica aqui, respeito sem empurrar conselhos e o direito de cada pessoa de falar ou de passar a vez. Reafirmem tudo em voz alta no começo de cada encontro, sem exceção — as normas só protegem enquanto estão frescas.",
        "hours": 3,
        "skills": [
          "facilitação"
        ]
      },
      {
        "name": "Agende e divulgue os encontros",
        "description": "Ofereça mais de um horário para que quem trabalha por turnos e quem cria filhos consiga vir, e divulgue em linguagem simples e sem estigma — de graça, aberto, sem requisitos. O jeito de escrever o panfleto decide quem se sente seguro para aparecer.",
        "hours": 3,
        "skills": [
          "divulgação"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Apoie os facilitadores e previna o esgotamento",
        "description": "Converse com os facilitadores com regularidade, alterne quem conduz e garanta que tenham apoio próprio — sustentar o espaço da recuperação alheia é trabalho pesado, e a própria recuperação de quem facilita vem sempre primeiro.",
        "hours": 2,
        "skills": [
          "escuta"
        ]
      }
    ]
  },
  {
    "id": "community-fitness",
    "name": "Grupos comunitários de exercício e bem-estar",
    "purpose": "Colocar vizinhas e vizinhos para se mexer juntos, de graça — grupos de caminhada, alongamento, jogos improvisados, dança — porque se sentir bem no próprio corpo não deveria custar uma mensalidade de academia.",
    "whoItServes": "Qualquer pessoa que queira se mexer, em especial vizinhos para quem a academia não cabe no bolso, pessoas idosas e gente isolada, para quem a companhia importa tanto quanto o exercício.",
    "whatYoullNeed": "Voluntários para guiar as atividades, espaços seguros e acessíveis e bem pouco equipamento. Um estilo acolhedor e sem pressão importa mais que credenciais — mas quem conduzir uma atividade fisicamente exigente precisa ter a qualificação para isso, e toda sessão precisa de água, aquecimento e um kit de primeiros socorros ao alcance.",
    "setupHours": 19,
    "defaultCategory": "other",
    "firstSteps": "Antes de agendar qualquer coisa, pergunte às pessoas que você espera que venham o que elas de fato gostariam — um grupo de caminhada, alongamento na cadeira, uma noite de dança — e o que parece possível para os corpos delas; as respostas devem escolher suas atividades, não o contrário. Depois encontre uma ou duas pessoas guias cuja acolhida pese mais que a técnica, percorram juntos os espaços candidatos e lancem uma única sessão semanal confiável antes de acrescentar mais.",
    "commonPitfalls": "Isto morre de dois jeitos: vira uma competição — os membros mais em forma ditam o ritmo, a conversa desliza para peso e aparência, e justamente as pessoas para quem isto existe param de vir em silêncio — ou fica inconstante, porque nada mata um grupo de caminhada mais rápido do que chegar duas vezes numa sessão cancelada. Pular o básico chato da segurança é o terceiro: sem aquecimento, sem água, sem kit de primeiros socorros, e uma queda feia acaba com tudo.",
    "pairsWith": [
      "disability-support-network",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Sonde interesses e níveis de atividade",
        "description": "Pergunte por aí — na lavanderia, no prédio das pessoas idosas, no portão da escola — que tipos de movimento as pessoas curtem e o que parece acessível. Deixe as respostas guiarem: um modelo cheio de esportes que ninguém pediu não ajuda ninguém.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Convoque pessoas para guiar as atividades",
        "description": "Encontre voluntários para conduzir caminhadas, alongamento, dança ou jogos improvisados. Um estilo acolhedor e sem pressão vale mais que a técnica na maioria das atividades — mas quem conduzir algo fisicamente exigente precisa ter a qualificação adequada.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Encontre espaços seguros",
        "description": "Pergunte por parques, salões comunitários e quadras de escola — de graça ou baratos, e acessíveis sem carro. Avalie cada espaço pensando em corpos e capacidades variados: chão plano, assentos, sombra, banheiros e um canto para se abrigar se o tempo virar.",
        "hours": 3
      },
      {
        "name": "Planeje uma programação inclusiva, para todos os níveis",
        "description": "Desenhe cada atividade para que as pessoas entrem no próprio ritmo e adaptem à vontade — uma opção na cadeira para o alongamento, um circuito curto dentro da caminhada longa. Mantenha o foco em se sentir bem, se mexer e se conectar, nunca em aparência ou desempenho.",
        "hours": 3
      },
      {
        "name": "Cuide da segurança e da saúde",
        "description": "Inclua aquecimento e hidratação em toda sessão, mantenha por perto um kit de primeiros socorros completo e sugira que quem está começando a se exercitar converse antes com um médico. Ensine as pessoas guias a perceber o excesso de esforço e a fazer com que diminuir o ritmo pareça normal, não vergonhoso.",
        "hours": 3,
        "skills": [
          "primeiros socorros"
        ]
      },
      {
        "name": "Defina uma agenda e espalhe a notícia",
        "description": "Escolha horários constantes em torno dos quais as pessoas possam criar um hábito, e cumpra-os. Divulgue por toda parte — panfletos, grupos de mensagens, boca a boca — e diga explicitamente que todas as idades, tamanhos e capacidades são bem-vindos, porque muita gente presume que não é.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Cultive comunidade e constância",
        "description": "Faça das sessões um momento social: nomes aprendidos, recém-chegados recebidos, alguns minutos de conversa incluídos. Celebre o simples aparecer, e não qualquer métrica — a conexão é o que faz as pessoas voltarem muito depois de a novidade passar.",
        "hours": 2,
        "skills": [
          "facilitação"
        ]
      }
    ]
  },
  {
    "id": "urban-orchard",
    "name": "Pomar urbano e floresta comestível",
    "purpose": "Plantar árvores frutíferas, árvores de nozes e plantas alimentícias perenes em terrenos compartilhados — uma floresta comestível que, uma vez estabelecida, alimenta o bairro de graça por décadas.",
    "whoItServes": "A comunidade inteira, inclusive os vizinhos que ainda nem chegaram — as árvores plantadas este ano viram uma fonte duradoura de comida fresca e gratuita para todo mundo.",
    "whatYoullNeed": "Acesso à terra de longo prazo (um acordo de boca de temporada em temporada não basta para árvores), árvores e plantas adequadas ao clima, voluntários para os mutirões de plantio e uma pequena equipe de cuidadores comprometidos por anos, não por meses. Confirmem o acesso à água antes de qualquer coisa ir para o chão.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "A conversa sobre a terra vem antes de tudo: fale com fundos comunitários de terras, a secretaria de parques, congregações de fé com chão sem uso — qualquer um que possa comprometer um lugar por uma década, não por uma temporada — e de passagem confirme a água. Em paralelo, encontre uma pessoa com experiência real em árvores frutíferas para ancorar o desenho, e pergunte aos vizinhos o que eles de fato colheriam e comeriam, porque um pomar de frutas que ninguém quer só alimenta as vespas.",
    "commonPitfalls": "Pomares raramente fracassam no dia do plantio — fracassam nos anos dois e três, quando a multidão já se foi e ninguém organizou a rega, e as árvores jovens morrem em silêncio no primeiro verão seco. Os outros assassinos são acordos de terra frágeis revogados bem quando as árvores começam a dar fruto, e brigas de colheita porque ninguém combinou as normas de partilha antes da primeira grande safra. Resolvam o rodízio de cuidado e as regras de partilha cedo, enquanto ainda é fácil.",
    "pairsWith": [
      "community-garden",
      "gleaning-network",
      "seed-library"
    ],
    "tasks": [
      {
        "name": "Garanta o acesso à terra de longo prazo",
        "description": "Consiga um acordo escrito duradouro — um arrendamento longo, um arranjo com um fundo de terras, um compromisso formal da prefeitura — porque árvores precisam de décadas, não de um acordo de boca de temporada em temporada. Confirme um acesso confiável à água no terreno antes de assinar qualquer coisa.",
        "hours": 5,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Planeje o desenho do plantio",
        "description": "Escolha espécies adequadas ao seu clima e desenhe em camadas de floresta comestível: árvores de copa, arbustos e cobertura do solo trabalhando juntos. Preveja os pares de polinização e o espaço de que as árvores adultas vão precisar, não o tamanho das mudas que você planta.",
        "hours": 4,
        "skills": [
          "jardinagem"
        ]
      },
      {
        "name": "Consiga as árvores e as plantas",
        "description": "Garanta árvores e plantas por meio de viveiros, editais, doações e vendas sazonais de raiz nua — mudas jovens e de raiz nua custam uma fração das árvores adultas em vaso e costumam pegar melhor. Encomende cedo; as boas variedades esgotam.",
        "hours": 3
      },
      {
        "name": "Prepare o terreno",
        "description": "Deixe o chão pronto antes de as árvores chegarem: melhore o solo, espalhe cobertura morta, monte a rega e marque e limpe cada ponto de plantio conforme o desenho. Um terreno preparado transforma o mutirão de plantio de um caos numa linha de montagem.",
        "hours": 4,
        "skills": [
          "jardinagem"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Organize mutirões de plantio",
        "description": "Conduza mutirões comunitários de plantio com instruções claras, para que cada árvore entre na profundidade certa, com bacia de rega e cobertura morta — plantadas erradas, as árvores falham devagar e sem ninguém ver. Faça disso uma festa; um mutirão de plantio é como o bairro começa a sentir que o pomar é dele.",
        "hours": 5,
        "skills": [
          "jardinagem"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Monte o cuidado de longo prazo",
        "description": "Organize o trabalho sem glamour que decide se o pomar vive: regar as árvores jovens nos primeiros verões, podar, repor a cobertura morta e manejar as pragas, ano após ano. Um rodízio com os nomes de cuidadores comprometidos vale mais que uma grande lista de voluntários vagos.",
        "hours": 3,
        "skills": [
          "jardinagem"
        ]
      },
      {
        "name": "Planeje a partilha da colheita",
        "description": "Combinem as normas de colheita e partilha antes da primeira grande safra, não depois da primeira briga — quem colhe, quando e quanto. Encaminhem o excedente para geladeiras comunitárias, despensas e refeições compartilhadas, para que nada apodreça no galho.",
        "hours": 2
      }
    ]
  },
  {
    "id": "new-parent-support",
    "name": "Rede de apoio no pós-parto e a novas famílias",
    "purpose": "Cercar de apoio prático mães e pais recentes ou à espera de bebê — refeições na porta, compras resolvidas, louça lavada e pares que já passaram por isso — durante a gravidez e as semanas cruas do pós-parto.",
    "whoItServes": "Mães e pais recentes ou à espera de bebê, sobretudo quem não tem família por perto — as semanas depois de um nascimento são quando o apoio mais importa e menos costuma chegar.",
    "whatYoullNeed": "Voluntários que saibam cozinhar, resolver compras e escutar; um sistema de corrente de refeições; um diretório de recursos; e mães e pais experientes como pares de apoio. Apoio entre pares não é atendimento médico nem de saúde mental — os transtornos de humor do pós-parto são comuns e sérios, então cada par de apoio precisa conhecer os sinais e saber conectar com delicadeza uma mãe ou um pai à ajuda profissional. E verifiquem quem for entrar nas casas ou ajudar com bebês antes de fazer qualquer uma das duas coisas.",
    "setupHours": 21,
    "defaultCategory": "childcare",
    "firstSteps": "Comece perguntando a mães e pais que deram à luz no último ano o que teria ajudado de verdade — as respostas (uma refeição sem visita junto, alguém para segurar o bebê enquanto tomam banho) são mais específicas do que você imagina. Apresente a rede a parteiras, doulas e clínicas pediátricas que possam oferecê-la às famílias, convoque duas ou três mães ou pais experientes como seus primeiros pares de apoio e defina sua prática de verificação antes de alguém cruzar uma porta.",
    "commonPitfalls": "O fracasso clássico é o apoio que serve a quem apoia: voluntários que chegam no próprio horário, ficam demais e dão opinião sobre criação em vez de lavar a louça — mães e pais exaustos vão parar de abrir a porta em silêncio antes de dizer isso. O mais grave é um par não ver os sinais da depressão pós-parto porque ninguém o treinou para reconhecê-la nem lhe deu as palavras para nomeá-la. E um apoio que some depois de duas semanas, bem quando acabam as marmitas e começa a parte difícil, não é apoio nenhum.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "childcare-collective",
      "welcome-wagon"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Convoque voluntários e pares de apoio",
        "description": "Reúna quem cozinha, quem resolve compras e — o mais importante — mães e pais experientes dispostos a ser pares de apoio. Quem lembra da própria terceira semana sem dormir oferece algo que nenhum folheto dá.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Monte uma corrente de refeições",
        "description": "Crie um jeito simples de coordenar refeições deixadas na porta ao longo das semanas depois do nascimento: um calendário compartilhado, necessidades alimentares e alergias recolhidas uma vez só, comida etiquetada e fácil de requentar. Deixar na porta deve ser o padrão — uma refeição nunca deve obrigar a uma visita.",
        "hours": 3,
        "skills": [
          "cozinha",
          "organização"
        ]
      },
      {
        "name": "Ofereça ajuda prática",
        "description": "Organize voluntários para a carga sem glamour: compras, roupa, louça e olhar os irmãos mais velhos para que a mãe ou o pai descanse ou chegue a uma consulta. Pergunte a cada vez o que é preciso, em vez de presumir — a ajuda útil segue a lista da família, não a do voluntário.",
        "hours": 3,
        "skills": [
          "cuidado de crianças"
        ]
      },
      {
        "name": "Monte um diretório de recursos",
        "description": "Reúna apoio local à amamentação, atendimento de saúde mental no pós-parto, clínicas pediátricas e fontes de itens de bebê — incluindo o banco de fraldas e o coletivo de cuidado de crianças, se a sua comunidade os tiver. Mantenha em dia; um diretório de telefones mortos é pior que nenhum.",
        "hours": 4,
        "skills": [
          "digitação de dados"
        ]
      },
      {
        "name": "Crie rodas de apoio entre pares",
        "description": "Comece grupos pequenos onde mães e pais recentes possam ser honestos sobre o quanto é difícil, com uma mãe ou um pai experiente sustentando o espaço. Treine os pares nos sinais da depressão e da ansiedade pós-parto e em incentivar, com delicadeza e persistência, o atendimento profissional — nunca diagnosticar, nunca esperar.",
        "hours": 3,
        "skills": [
          "facilitação"
        ]
      },
      {
        "name": "Defina práticas de segurança e de limites",
        "description": "Verifique cada voluntário que for entrar nas casas ou ajudar com bebês — referências no mínimo — e deixe os limites por escrito: a família dá as condições, as visitas são curtas salvo convite para ficar mais, e ninguém aparece sem avisar. Apoio nunca deve parecer vigilância.",
        "hours": 3
      },
      {
        "name": "Conecte com os outros projetos",
        "description": "Ligue as famílias ao banco de fraldas, ao coletivo de cuidado de crianças e ao comitê de boas-vindas, para que um único ponto de contato abra tudo. Uma mãe ou um pai recente não deveria ter que descobrir cada programa separadamente no momento mais exausto da vida.",
        "hours": 2,
        "skills": [
          "divulgação"
        ]
      }
    ]
  },
  {
    "id": "foster-kinship-support",
    "name": "Rede de apoio a famílias acolhedoras e parentes que criam",
    "purpose": "Estar por trás das famílias acolhedoras, dos parentes que criam e de outras famílias cuidadoras — roupa e uma cama quando uma criança chega da noite para o dia, respiro quando quem cuida está no limite, e pares que entendem esse trabalho.",
    "whoItServes": "Mães e pais acolhedores, avós e parentes criando crianças — parentes cuidadores muitas vezes começam com um telefonema e poucas horas de aviso — e as crianças aos seus cuidados.",
    "whatYoullNeed": "Voluntários, itens doados de todas as idades e tamanhos, ajuda de respiro e parcerias com os órgãos de acolhimento e as escolas. O trabalho com crianças acolhidas é delicado e regulado por lei: verifiquem todas as pessoas que trabalhem com crianças, sigam à risca as regras de notificação obrigatória e de confidencialidade e coordenem com os órgãos competentes, não pelas costas deles.",
    "setupHours": 24,
    "defaultCategory": "childcare",
    "firstSteps": "Comece com uma conversa no órgão local de acolhimento ou no programa de orientação a parentes cuidadores: aprenda as regras que regem este trabalho — verificação de antecedentes, notificação obrigatória, confidencialidade — antes de convocar um único voluntário, e deixe que eles digam onde estão de verdade as lacunas. Depois pergunte a algumas famílias cuidadoras o que precisaram na primeira semana e no primeiro ano; construa na direção dessas respostas, não de um depósito de coisas que ninguém pediu.",
    "commonPitfalls": "Este projeto pode fracassar com estrondo ou em silêncio. Com estrondo: um voluntário sem verificação perto das crianças, ou a história de uma família compartilhada sem permissão — qualquer um dos dois pode ferir uma criança, encerrar um acolhimento e acabar com o projeto num dia. Em silêncio: uma montanha de doações sem triagem enquanto uma cuidadora espera três semanas por uma cama infantil, ou tratar os órgãos como adversários até que parem de encaminhar famílias. Aqui, o pequeno, verificado e coordenado ganha do grande e improvisado, sempre.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "free-store",
      "childcare-collective"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Conecte-se com as famílias cuidadoras",
        "description": "Chegue às famílias cuidadoras por meio dos órgãos, das escolas e dos grupos de fé — em especial aos parentes cuidadores, que muitas vezes recebem um neto ou uma sobrinha da noite para o dia, sem preparo e com pouco apoio oficial. Faça do primeiro contato uma oferta, nunca uma triagem.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Monte uma reserva de roupas e itens",
        "description": "Recolha roupas, camas, cadeirinhas de carro e itens do dia a dia em toda a faixa de idades e tamanhos, porque quem cuida raramente sabe quem chega até que chegue. Confira com cuidado os itens de segurança — cadeirinhas e berços têm prazo de validade e listas de recall.",
        "hours": 4,
        "skills": [
          "organização"
        ]
      },
      {
        "name": "Crie um sistema de entrega rápida",
        "description": "Prepare mochilas prontas para sair — alguns dias de roupa, itens de higiene e algo de conforto, como um bichinho de pelúcia — separadas por idade e tamanho, entregáveis em poucas horas após um novo acolhimento. Uma criança que chega sem nada não deveria esperar uma semana para ter algo seu.",
        "hours": 3,
        "follows": [
          1
        ]
      },
      {
        "name": "Organize o apoio de respiro",
        "description": "Arranje cuidado seguro e devidamente verificado para que quem cuida possa descansar, manter as consultas ou só respirar — o esgotamento de quem cuida é uma das principais razões de os acolhimentos se romperem. Coordene com os órgãos quem pode dar cuidado de respiro e sob que regras.",
        "hours": 4,
        "skills": [
          "cuidado de crianças"
        ]
      },
      {
        "name": "Ofereça grupos de apoio entre pares",
        "description": "Promova encontros regulares onde famílias acolhedoras e parentes cuidadores troquem experiência e conselhos honestos com gente que entende — este trabalho isola, e a cuidadora três ruas adiante pode estar carregando o mesmo peso sozinha.",
        "hours": 3,
        "skills": [
          "facilitação"
        ]
      },
      {
        "name": "Monte um diretório de recursos",
        "description": "Reúna os serviços, benefícios e apoios com atenção ao trauma a que as famílias cuidadoras podem recorrer, e ajude-as a navegar sistemas confusos até para profissionais. Parentes cuidadores, em particular, muitas vezes têm direito a ajudas de que ninguém nunca lhes falou.",
        "hours": 3,
        "skills": [
          "digitação de dados"
        ]
      },
      {
        "name": "Defina práticas de segurança das crianças e de privacidade",
        "description": "Deixe por escrito e cumpra o inegociável: verificação para qualquer pessoa que trabalhe com crianças, o que as leis de notificação obrigatória exigem dos seus voluntários e privacidade estrita para famílias e crianças — sem fotos, sem histórias, sem detalhes compartilhados sem permissão.",
        "hours": 4,
        "skills": [
          "escrita"
        ]
      }
    ]
  },
  {
    "id": "weather-survival-outreach",
    "name": "Brigadas de sobrevivência no frio e no calor extremos",
    "purpose": "Levar suprimentos de sobrevivência a vizinhas e vizinhos em situação de rua quando o tempo vira mortal — cobertores e aquecedores de mãos numa onda de frio, água e eletrólitos numa onda de calor — carregados até onde as pessoas realmente estão.",
    "whoItServes": "Vizinhas e vizinhos em situação de rua expostos ao clima extremo — as pessoas para quem uma onda de calor ou de frio é um evento que ameaça a vida, não um incômodo.",
    "whatYoullNeed": "Suprimentos específicos para cada estação, voluntários de rua, rotas planejadas e conexões atualizadas com abrigos e serviços. O calor e o frio extremos matam: cada voluntário precisa estar treinado para reconhecer a hipotermia e a insolação e para chamar sem demora ajuda médica profissional — nunca esperar para ver.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Antes de comprar um único cobertor, converse com as equipes de abordagem de rua e as organizações que já percorrem essas rotas — elas guardam a confiança e o conhecimento de onde as pessoas realmente estão, e vão dizer o que está coberto e o que falta. Combine com elas como você vai se encaixar, defina os limites de previsão do tempo que disparam suas rondas e estoque os suprimentos da estação enquanto o tempo ainda está ameno.",
    "commonPitfalls": "O fracasso previsível é começar junto com o tempo: suprimentos buscados no meio da onda de calor chegam depois de o perigo passar, e estranhos que aparecem pela primeira vez numa crise recebem um não desconfiado de quem aprendeu a cautela do jeito difícil. Os fracassos perigosos são voluntários tentando administrar uma emergência médica por conta própria em vez de pedir ajuda de imediato, e pressionar as pessoas a se mudarem ou aceitarem um abrigo — ofereça, informe e respeite a resposta.",
    "pairsWith": [
      "cooling-warming-center",
      "harm-reduction-supplies",
      "resource-hub-dispatch"
    ],
    "tasks": [
      {
        "name": "Monte kits para cada estação",
        "description": "Prepare kits de acordo com a estação: cobertores, meias quentes, gorros, luvas e aquecedores de mãos para o frio; água, sachês de eletrólitos, protetor solar, bonés e panos refrescantes para o calor. Acrescente a cada kit um cartão com os endereços dos abrigos e os números de crise.",
        "hours": 4
      },
      {
        "name": "Consiga os suprimentos",
        "description": "Organize campanhas de doação, faça compras no atacado e peça contribuições a lojas e congregações — e faça isso antes da estação, porque procurar cobertores na primeira frente fria é chegar tarde. Estoque o bastante para reabastecer no meio da temporada.",
        "hours": 4,
        "skills": [
          "divulgação",
          "dirigir"
        ]
      },
      {
        "name": "Mapeie onde encontrar as pessoas",
        "description": "Trabalhe com as equipes de abordagem que já existem para saber onde as vizinhas e vizinhos em situação de rua realmente ficam — elas carregam uma confiança e um conhecimento construídos por anos, e chegar ao lado delas vale mais que chegar do nada. Mantenha o mapa solto e atual; as pessoas se movem, principalmente com tempo ruim.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Convoque e treine voluntários de rua",
        "description": "Treine cada voluntário antes da primeira ronda: abordagem respeitosa que aceita um não como resposta, segurança pessoal e trabalho sempre em duplas, e o reconhecimento das emergências médicas causadas pelo clima. Ninguém distribui antes de ser treinado.",
        "hours": 4,
        "skills": [
          "ensino"
        ]
      },
      {
        "name": "Monte um plano de distribuição e rotas",
        "description": "Planeje rotas e horários para os dias antes do tempo perigoso e durante ele, chegando primeiro às pessoas mais expostas — as mais longe dos serviços, dormindo ao relento e não em veículos ou abrigos. Decida de antemão que previsão dispara uma ronda.",
        "hours": 3,
        "skills": [
          "organização"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Conecte as pessoas a abrigos e serviços",
        "description": "Leve informação atual e verificada sobre os centros de apoio contra o frio e o calor, as vagas em abrigos e o centro de recursos — horários e regras mudam o tempo todo, e um encaminhamento para uma porta fechada queima a confiança. Ofereça conexões sem pressão; a relação dura mais que qualquer noite.",
        "hours": 3,
        "skills": [
          "divulgação"
        ]
      },
      {
        "name": "Prepare-se para as emergências",
        "description": "Treine cada voluntário para reconhecer a hipotermia e a insolação — confusão, fala arrastada, pele quente e seca ou fria e úmida — e para chamar os serviços de emergência de imediato, não esperar para ver. Ensaiem o que fazer enquanto a ajuda vem: sombra e água, ou cobertores e proteção do vento.",
        "hours": 3,
        "skills": [
          "primeiros socorros"
        ]
      }
    ]
  }
];
