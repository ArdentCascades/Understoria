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
// Portuguese FAQ (i18n Phase 2b). Loaded lazily via
// content/bundles/pt.ts — never import this statically from app
// code. When adding or renaming an entry in faq.ts, mirror the
// change here so the parity test (faq.parity.test.ts) stays
// green.
import type { FaqSection } from "./faq";

export const FAQ_SECTIONS_PT: readonly FaqSection[] = [
  {
    "id": "posts",
    "title": "Anúncios e trocas",
    "entries": [
      {
        "id": "post-something",
        "question": "Como publico uma necessidade ou uma oferta?",
        "answer": [
          "No Mural, toque no botão verde + Publicar uma necessidade ou + Publicar uma oferta na parte de baixo da tela. Dê um título curto, descreva o que você precisa ou o que pode dar, e publique. Mais tarde você pode cancelar o anúncio na página de detalhe dele, ou republicá-lo com mudanças pelo menu do anúncio."
        ]
      },
      {
        "id": "claim-post",
        "question": "Como assumo o anúncio de outra pessoa?",
        "answer": [
          "Toque em qualquer anúncio do Mural para abrir a página de detalhe. Numa necessidade, toque em Oferecer-me para ajudar; numa oferta, toque em Assumir esta oferta. O anúncio passa para o estado “aguardando confirmação”, e quem publicou tem a chance de confirmar antes de qualquer crédito circular.",
          "Se mudar de ideia, toque em Devolver ao mural na mesma página — o anúncio fica aberto de novo para outra pessoa."
        ]
      },
      {
        "id": "confirm-exchange",
        "question": "Como funciona confirmar uma troca?",
        "answer": [
          "Depois que a ajuda realmente aconteceu, as duas pessoas tocam em Confirmar que está feito na página de detalhe do anúncio. O crédito só circula quando as duas confirmaram.",
          "A ordem não importa — uma confirma primeiro, a outra vê que o anúncio está esperando por ela e confirma quando puder."
        ]
      },
      {
        "id": "other-not-confirmed",
        "question": "A outra pessoa ainda não confirmou. O que eu faço?",
        "answer": [
          "Primeiro, fale com ela fora do aplicativo. Na maioria das vezes é um toque esquecido, não uma recusa.",
          "Se houver mesmo um desacordo sobre se a troca aconteceu ou se contou como ajuda completa, use “Algo não está certo — sinalizar” na página de detalhe do anúncio. Isso leva o caso à página de Disputas, onde a comunidade pode ajudar a resolver — não há administradores. O crédito fica pendente até a resolução.",
          "Você também não fica esperando para sempre. Se a sua comunidade tem a confirmação automática ativada, o nó comunitário entra em cena depois do período de espera combinado e completa uma confirmação que claramente só foi esquecida, para o crédito de ninguém ficar no limbo indefinidamente."
        ]
      },
      {
        "id": "cancel-post",
        "question": "Como cancelo um anúncio de que não preciso mais?",
        "answer": [
          "Abra o anúncio pelo Mural e toque em Cancelar anúncio. O anúncio sai do mural na hora, e ninguém mais pode assumi-lo. Ele não é apagado — a página dele continua existindo, marcada como cancelada, e qualquer pessoa com o link ainda pode ver o que foi pedido ou oferecido."
        ]
      }
    ]
  },
  {
    "id": "balance",
    "title": "Saldo e créditos",
    "entries": [
      {
        "id": "what-is-balance",
        "question": "O que significa o meu saldo?",
        "answer": [
          "Seu saldo é o total acumulado das horas que você deu menos as horas que recebeu. Todo mundo começa em 5 (o crédito de semente), então um membro recém-chegado está em 5, não em 0.",
          "Um saldo negativo não tem problema nenhum — pedir ajuda não é dívida. Os saldos ficam visíveis para a sua comunidade, mas não são uma pontuação, e não existe tabela de classificação."
        ]
      },
      {
        "id": "negative-balance",
        "question": "Meu saldo pode ficar negativo?",
        "answer": [
          "Pode. Receber mais do que você deu faz parte de como o apoio mútuo funciona — a rede foi feita para circular. A comunidade só vê um aviso se o limite diário de trocas estiver perto de ser atingido ou se algum padrão parecer fora do comum; fora isso, ninguém está de olho no seu número."
        ]
      }
    ]
  },
  {
    "id": "identity",
    "title": "Sua identidade e seus dispositivos",
    "entries": [
      {
        "id": "getting-around",
        "question": "Para onde foi a aba Perfil? Como me localizo no aplicativo?",
        "answer": [
          "Cinco abas ficam na parte de baixo da tela (uma barra à esquerda em telas largas): Mural, Painel, Calendário, Mensagens e Aos meus cuidados — cada tarefa que você assumiu e cada projeto que você organiza, reunidos num só lugar.",
          "Tudo o que é sobre VOCÊ foi para trás do botão Menu, no canto superior direito: seu Perfil (aparece sob o seu próprio nome), Configurações, Convidar alguém, esta página de Ajuda, Buscar e Infraestrutura da comunidade.",
          "Buscar encontra anúncios, projetos, eventos, pessoas e estas respostas de ajuda — tudo a partir do que já está no seu dispositivo. Com teclado, Ctrl+K (⌘K num Mac) abre a busca de onde você estiver."
        ]
      },
      {
        "id": "change-name",
        "question": "Como mudo meu nome visível ou meu bairro?",
        "answer": [
          "Perfil → Editar dados. Nomes são rótulos, não credenciais, então você pode mudar o seu quando quiser. Sua identidade criptográfica continua a mesma."
        ]
      },
      {
        "id": "lost-passphrase",
        "question": "O que acontece se eu perder minha frase secreta?",
        "answer": [
          "Ninguém pode redefini-la por você — é assim de propósito. O acordo é: nenhuma autoridade central pode ler seus dados, e por isso nenhuma autoridade central pode resgatá-los.",
          "Mas uma frase secreta esquecida já não precisa significar uma identidade perdida. Se você tem um segundo dispositivo vinculado, sua identidade continua nele. Se você criou um kit de recuperação (Configurações → Kit de recuperação), ele restaura sua conta com uma frase própria, separada. Se você escolheu guardiões, um número suficiente deles, juntos, pode trazer você de volta sem frase nenhuma. Veja “O que acontece se eu perder meu telefone?” abaixo para a ordem completa.",
          "Só se nada disso existir a resposta é Perfil → Emergência → Limpeza total: apagar o dispositivo e começar de novo com uma identidade nova, sem o seu histórico de créditos antigo."
        ]
      },
      {
        "id": "lost-phone",
        "question": "O que acontece se eu perder meu telefone?",
        "answer": [
          "Sua conta pode voltar — esta é a ordem honesta a tentar, da melhor opção em diante.",
          "1. Um segundo dispositivo vinculado. Se você adicionou um (Perfil → Vincular outro dispositivo), sua identidade já vive nele; continue usando esse dispositivo e vincule o telefone de reposição a partir dele.",
          "2. Um kit de recuperação. Se você criou um (Configurações → Kit de recuperação), abra o aplicativo em qualquer dispositivo novo, escolha “Perdeu seu dispositivo, mas tem um kit de recuperação…” e digite a frase de recuperação do kit. Saldo, avais, papéis e a condição de membro voltam; o histórico da comunidade sincroniza de volta a partir do servidor dela.",
          "3. Seus guardiões. Se você dividiu sua chave entre guardiões (Configurações → Guardiões), encontre-se com um número suficiente deles: o dispositivo novo mostra um código de pedido, cada guardião ou guardiã responde com um código de liberação, e, ao atingir o número necessário, sua conta volta a entrar — sem kit e sem frase secreta.",
          "4. Um convite novo. Se nada disso existir, peça que alguém convide você de novo. Você será um membro novo: seu histórico antigo continua visível para a comunidade sob o seu nome antigo, mas a chave nova começa do zero. É exatamente por isso que o aplicativo insiste num segundo dispositivo, num kit ou em guardiões ANTES da semana ruim.",
          "O que nunca volta num dispositivo novo: as mensagens diretas e os rascunhos não enviados — eles só viviam no telefone perdido, e é assim de propósito."
        ]
      },
      {
        "id": "install-app",
        "question": "Posso instalar o Understoria como um aplicativo?",
        "answer": [
          "Pode. O Understoria é um aplicativo web que você pode colocar na tela de início como qualquer outro app: você ganha um ícone, ele abre em tela cheia sem as barras do navegador, inicia mais rápido e continua funcionando sem internet.",
          "No iPhone ou iPad, abra o Understoria no Safari, toque no botão Compartilhar e escolha “Adicionar à Tela de Início”.",
          "No Android, abra o Understoria no Chrome, toque no menu (⋮) no canto de cima e escolha “Adicionar à tela inicial” ou “Instalar aplicativo”.",
          "Num navegador de computador, procure o ícone de instalar na ponta direita da barra de endereço.",
          "Num computador com Linux há também um aplicativo para computador — um arquivo único (um AppImage) que a sua comunidade pode compartilhar e que roda sem navegador nenhum. Torne-o executável (clique com o botão direito → Propriedades → permitir executar, ou chmod +x), abra-o e vincule a partir do seu telefone: Configurações → “Vincular outro dispositivo” no telefone, e depois o caminho de colar o código no computador. Ele conta como um dispositivo próprio, igual ao caso do iPhone logo abaixo, e só se atualiza quando você troca o arquivo por um mais novo.",
          "Uma coisa para saber antes de instalar: no iPhone e no iPad o aplicativo instalado ganha um armazenamento PRÓPRIO, separado, então ele começa sem sessão mesmo que a cópia do navegador tenha a sua identidade — nada se perde, você só passa a ter dois “dispositivos” separados num telefone só. O aplicativo instalado pergunta sobre isso logo na primeira tela: escolha “Já uso o Understoria no navegador deste telefone” e ele guia você, passo a passo, para trazer a sua identidade. (No Android e no computador o aplicativo instalado compartilha o armazenamento do navegador, então a sua sessão continua.)"
        ]
      },
      {
        "id": "new-device",
        "question": "Como passo para um dispositivo novo?",
        "answer": [
          "Nada para digitar. No dispositivo novo, abra o Understoria e escolha “Trazer minha identidade” — ele mostra dois emoji e espera. No dispositivo que já tem a sua identidade, vá em Perfil → Vincular outro dispositivo: o pedido aparece lá sozinho. Confira se os emoji são iguais, toque em “Vincular”, e o dispositivo novo entra por conta própria. Os dois dispositivos precisam estar na mesma rede (num telefone só, sempre estão). Está em outro lugar, ou sem servidor comunitário? “Outras formas de vincular” tem um código falado de 6 palavras e um QR que dispensa servidores por completo.",
          "Duas coisas não vêm junto: seu histórico de mensagens (as mensagens são criptografadas para as chaves de cada dispositivo, então ficam onde foram recebidas) e as configurações de cada dispositivo, como tema e tamanho do texto. Todo o resto — anúncios, projetos, eventos, membros, trocas — atravessa com o próprio vínculo, então o dispositivo novo já aparece igual ao antigo e continua sincronizando depois."
        ]
      },
      {
        "id": "link-safety",
        "question": "O que devo observar ao vincular dispositivos?",
        "answer": [
          "Três hábitos simples mantêm a vinculação segura. Primeiro: só toque em “Vincular” quando VOCÊ estiver segurando o dispositivo que está pedindo, e os dois emoji da sua tela forem iguais aos dois da tela dele. Se um pedido aparecer quando você não está vinculando nada, ignore — alguém na sua rede pode estar tentando a sorte, e nada acontece a menos que você toque.",
          "Segundo: quando o dispositivo novo entrar, olhe o nome com que ele cumprimenta você. Se não for você, alguém enfiou a própria identidade na sua transferência — nada seu foi levado, e o botão “Não sou eu” limpa o dispositivo para você começar de novo.",
          "Terceiro, a letra miúda honesta: vincular com um toque passa pelo servidor da sua própria comunidade, que só repassa dados selados que ele não consegue ler — mas, se você não confia em quem mantém esse servidor, use o método do QR em “Outras formas de vincular”. O QR vai de tela a câmera, sem servidor nenhum no meio.",
          "Uma observação prática: vincular com um toque precisa que os dois dispositivos pareçam estar na mesma rede. Uma VPN ou o iCloud Private Relay pode atrapalhar sem avisar — se o pedido nunca aparecer, pause por um minuto e peça de novo, ou use “Outras formas de vincular”."
        ]
      }
    ]
  },
  {
    "id": "community",
    "title": "Comunidade e convites",
    "entries": [
      {
        "id": "internet-outage",
        "question": "O que ainda podemos fazer quando a internet cai — como durante um furacão?",
        "answer": [
          "Mais do que você imagina, porque o aplicativo inteiro foi construído exatamente para isso. Seu dispositivo já carrega tudo: o mural, o registro de trocas, a lista de membros, a sua identidade. Você pode continuar lendo, publicando e confirmando — cada mudança entra numa fila segura e se envia sozinha assim que a conexão voltar. Nada se perde enquanto a internet está fora.",
          "Se alguém perto de você precisa de ajuda AGORA: ajude, e depois confirmem juntos, em pessoa. Na página do anúncio, escolha “Confirmar em pessoa” — um telefone mostra um código, o outro escaneia e assina. Os dois telefones guardam o registro e o levam para casa quando a internet voltar.",
          "Se a sua comunidade mantém um abrigo de tempestade — um pequeno servidor reserva que alguém deixa pronto para quedas de internet — conecte-se ao WiFi dele quando a internet cair e o aplicativo simplesmente volta a funcionar para todo mundo no abrigo: os anúncios circulam, a ajuda é confirmada, sem configurar nada. Pergunte a quem mantém o servidor da sua comunidade se existe um abrigo de tempestade; se não existir, docs/offline-resilience.md é a receita para montar um nos tempos bons.",
          "Você pode até convidar alguém novo. Seu código de convite funciona sem internet nenhuma — é assinado por você e vale por duas semanas — então mostre o código QR ou entregue o link no papel e deixe a pessoa guardar uma foto. Num abrigo de tempestade ela pode instalar o aplicativo e entrar na hora; se não, termina de entrar assim que conseguir qualquer conexão. A única coisa que não acontece sem rede nenhuma é baixar o próprio aplicativo — o convite espera com paciência até dar.",
          "Os tempos bons são a hora de pôr isso no papel: a página Infraestrutura da comunidade pode imprimir um kit para quando a internet cair — um cartaz de parede e cartões de carteira com os passos para entrar no abrigo — para as instruções sobreviverem também às baterias descarregadas."
        ]
      },
      {
        "id": "add-a-node",
        "question": "O que protege esta comunidade se alguém levar o nosso servidor embora?",
        "answer": [
          "Duas coisas, e elas são o coração do que faz o Understoria diferente dos serviços corporativos. Primeiro: o dispositivo de cada membro já carrega uma cópia completa e assinada da comunidade — o mural, o registro, os projetos, tudo. Confiscar o servidor não leva nada que já não esteja no telefone de todo mundo, e um servidor substituto pode ser preenchido de novo a partir dessas cópias.",
          "Segundo: o servidor não precisa ser uma máquina só, nem a máquina de uma pessoa só. Qualquer membro pode manter um nó comunitário — um computador portátil velho, de tampa fechada, num armário é genuinamente suficiente. Cada nó a mais significa que não existe uma única pessoa que um grupo antissindical ou contrário ao apoio mútuo possa pressionar para desmontar a comunidade. O cartão “Resiliência da comunidade” no Painel mostra quantas raízes a sua comunidade já criou.",
          "Quer adicionar um? O passo a passo vive na documentação do projeto — docs/add-a-node.md, no repositório do Understoria, mostra como reaproveitar um computador velho, e o guia de operação cobre os detalhes. É uma tarde de trabalho, e o membro que mantém o servidor atual pode ajudar você a trocar as duas configurações que ligam os nós um ao outro."
        ]
      },
      {
        "id": "start-a-community",
        "question": "Eu poderia começar uma comunidade como esta para o meu bairro?",
        "answer": [
          "Poderia — e você não precisa da permissão de ninguém, nem de conta no GitHub, nem de loja de aplicativos. O Understoria é software livre, e o próprio servidor desta comunidade oferece o código-fonte completo para download.",
          "O caminho inteiro está escrito dentro do aplicativo: abra o Menu (canto superior direito) → Infraestrutura da comunidade → o cartão “O próprio software” → “Comece uma comunidade nova a partir deste download”. Ele leva você de baixar e verificar o código até manter o seu próprio servidor, em linguagem simples."
        ]
      },
      {
        "id": "invite-someone",
        "question": "Como convido alguém?",
        "answer": [
          "Primeiro: convidar é coisa de membros de confiança. Até que dois membros de confiança tenham respondido por você (o convite pelo qual você entrou conta como o primeiro), o botão de convidar mostra o seu progresso no lugar. Isso protege a comunidade — uma corrente de desconhecidos não consegue convidar mais desconhecidos. Para chegar lá, faça o que o aplicativo existe para fazer: ajude as pessoas. Quando a vizinhança conhecer você, qualquer membro de confiança pode responder por você a partir do seu perfil.",
          "O caminho mais rápido: abra o Menu (canto superior direito) e escolha Convidar alguém — ele leva você direto ao cartão de convites. O caminho mais longo é Perfil → Convites.",
          "Toque em Gerar link de convite e você recebe um link de uso único. Compartilhe em pessoa, pelo Signal ou por qualquer canal em que você possa confirmar que o link chegou à pessoa certa. Não publique links de convite em lugares abertos.",
          "Você também pode mostrar um convite como código QR para compartilhar em pessoa. Cada convite é de uso único, expira sozinho e pode ser revogado em Perfil → Convites até ser usado. Quando alguém entra pelo seu convite, isso conta como um aval seu — seu nome respalda a chegada dessa pessoa, então convide gente que você conhece de verdade."
        ]
      },
      {
        "id": "how-vouching-works",
        "question": "Como funcionam os avais?",
        "answer": [
          "Um aval é uma declaração pública e assinada de que você conhece esta pessoa e sustenta o lugar dela na comunidade. Alguém passa a ser “de confiança” depois que dois membros diferentes responderam por essa pessoa — e convidar alguém já conta automaticamente como o seu aval, então dar um aval à mão é a forma de respaldar uma pessoa que outra pessoa trouxe.",
          "O aval é dado na página do membro: toque no nome da pessoa em qualquer lugar do aplicativo e procure a seção Aval. O botão aparece quando o seu aval realmente somaria confiança — você já é de confiança, a pessoa ainda está juntando avais e você ainda não respondeu por ela. Fora isso, a seção explica o porquê, para você nunca ficar adivinhando.",
          "Vale um momento de reflexão: seu nome respalda o dela, de forma visível e permanente — um aval não pode ser desfeito pelo aplicativo. Se depois você se arrepender, o caminho é uma conversa com a sua comunidade, não um botão. Responda por pessoas que você conhece de verdade.",
          "Receber avais também abre os poderes de confiança da comunidade: convidar gente nova, responder por outras pessoas, assinar retiradas de membros — e os links que você compartilha passam a ser tocáveis para todo mundo (até lá, as pessoas veem o endereço completo, mas não conseguem tocar nele — uma proteção contra links maliciosos, não uma marca contra você). Os limites diários generosos de publicação de quem chegou há pouco desaparecem no mesmo instante."
        ]
      },
      {
        "id": "disagree-with-member",
        "question": "E se eu discordar de outro membro?",
        "answer": [
          "Converse com a pessoa primeiro. A maioria dos desacordos não é sobre o aplicativo e não precisa do aplicativo no meio.",
          "Se for sobre uma troca específica, use “Algo não está certo — sinalizar” na página de detalhe do anúncio. Se for sobre comportamento além de uma única troca, você pode abrir uma disputa em Perfil → Disputas — as disputas passam pelo processo aberto de propostas da comunidade, porque não há administradores para decidir por você.",
          "E, se o que você precisa é só de distância de alguém, bloquear está sempre disponível — veja “E se alguém estiver me incomodando?” em Mensagens."
        ]
      },
      {
        "id": "member-removal",
        "question": "Como funciona a retirada de alguém da comunidade?",
        "answer": [
          "A retirada é a coisa mais pesada que esta comunidade pode fazer, e o aplicativo a trata assim. É o último recurso: um bloqueio pessoal já impede que o conteúdo de alguém chegue até você, uma disputa pode contestar uma troca específica, e uma conversa resolve mais do que qualquer um dos dois.",
          "Nenhuma pessoa sozinha pode retirar ninguém — nem quem organiza, nem quem mantém o servidor. São necessários vários membros (o número é definido pela sua comunidade e visível para todo mundo), cada um assinando com o próprio nome um único registro público. A proposta começa no perfil do membro; as coassinaturas acontecem em pessoa, pela página de Propostas.",
          "Uma retirada é pública dentro da comunidade — quem foi retirado, quando, por quê e exatamente quem assinou, tudo visível na página de Propostas. Retiradas secretas são o jeito de as comunidades apodrecerem.",
          "Não é um apagamento. As trocas passadas do membro retirado permanecem — elas equilibram os registros dos outros membros — e tudo o que está no dispositivo dele continua sendo dele. O que termina é o acesso: a leitura para, e a escrita nova é recusada. As pessoas que ele convidou antes da retirada continuam sendo membros; os convites não usados dele morrem junto.",
          "E a porta pode reabrir: a readmissão exige o mesmo número de assinaturas, começada a partir do próprio registro de retirada, na página de Propostas."
        ]
      },
      {
        "id": "lurking-ok",
        "question": "Posso só olhar, sem publicar nada?",
        "answer": [
          "Pode. Ler o que as outras pessoas estão oferecendo e pedindo é uma forma válida de participar. Alguns membros só observam por semanas antes de publicar a primeira necessidade; alguns nunca publicam e só respondem aos outros. As duas formas são bem-vindas."
        ]
      },
      {
        "id": "who-sees-what",
        "question": "Quem pode ver o que eu publico?",
        "answer": [
          "Todo mundo no nó da sua comunidade pode ver seus anúncios, seu nome visível, seu bairro (se você definiu um) e seu histórico de trocas. As comunidades aliadas recebem os registros assinados que você publica — anúncios, trocas confirmadas, eventos — sob a sua chave pública, não sob o seu nome visível. Como as trocas se federam, um nó aliado pode ver a atividade de trocas da sua chave e deduzir o saldo dela; o que nunca sai da sua comunidade são as confirmações de presença, as inscrições em turnos, as tarefas de projetos, os bloqueios, os rascunhos e as mensagens.",
          "As mensagens diretas são diferentes: são criptografadas de ponta a ponta entre o seu dispositivo e o da outra pessoa, então só vocês dois podem lê-las — nem o nó, nem os outros membros. Veja “Como mando mensagem para outro membro?” em Mensagens para os detalhes."
        ]
      },
      {
        "id": "beta-status",
        "question": "Quão pronto está este aplicativo? O que eu não devo colocar nele?",
        "answer": [
          "O Understoria é um software em fase beta. Boa parte do código foi escrita com ferramentas de IA e revisada por pessoas, e ele ainda não passou por uma auditoria de segurança independente.",
          "As proteções que você vê são reais e testadas — as mensagens são criptografadas de ponta a ponta, os registros são assinados, o apagamento de emergência funciona. Mas beta quer dizer que erros são possíveis, inclusive alguns que ninguém encontrou ainda.",
          "Ele foi feito para coordenar a ajuda cotidiana entre vizinhos. Não coloque nele nada que possa machucar você ou outra pessoa se vazar — documentos de identidade, detalhes médicos ou de imigração, nem nada que você só diria fora de qualquer registro. Na dúvida, diga em pessoa."
        ]
      }
    ]
  },
  {
    "id": "messages",
    "title": "Mensagens",
    "entries": [
      {
        "id": "message-someone",
        "question": "Como mando mensagem para outro membro?",
        "answer": [
          "Abra qualquer anúncio e toque no botão Mensagem para puxar conversa — a mensagem vai para quem publicou ou, se o anúncio é seu, para a pessoa que está ajudando você. As conversas começam de propósito a partir de um anúncio — isso mantém as mensagens ligadas à ajuda real, e não ao contato frio. Abra Mensagens na navegação para ver todas as suas conversas e buscar dentro delas.",
          "As mensagens são criptografadas de ponta a ponta e viajam de dispositivo a dispositivo. Só você e a pessoa para quem escreve podem lê-las — o nó da comunidade as repassa, mas não enxerga o conteúdo.",
          "De propósito, não há confirmação de leitura nem indicador de digitação. Ninguém vê quando (nem se) você leu uma mensagem, e ninguém assiste enquanto você escreve uma resposta. Leia quando ler, responda quando tiver capacidade — o aplicativo não entrega você em nenhum dos dois casos."
        ]
      },
      {
        "id": "voice-notes",
        "question": "Como funcionam as notas de voz? Meu microfone não está funcionando.",
        "answer": [
          "Numa conversa, o botão do microfone fica na caixa de mensagem enquanto ela está vazia — comece a digitar e ele vira Enviar; apague o texto e o microfone volta. Toque nele para gravar uma nota de voz de até 45 segundos, ouça antes de qualquer coisa sair e envie só quando gostar do resultado. As notas de voz vão seladas de ponta a ponta exatamente como as mensagens escritas — só você e a pessoa com quem fala podem ouvi-las.",
          "A voz em anúncios do Mural funciona diferente. Anúncios do mural são conteúdo da comunidade, então uma gravação anexada a um anúncio pode ser ouvida pela comunidade inteira — o mesmo público das palavras que você escreveria ali.",
          "Se o microfone não liga: o navegador ou o telefone pede permissão na primeira vez que você grava. Se ela foi negada — mesmo sem querer — gravar fica bloqueado até você permitir o microfone para este site nas configurações do navegador ou do telefone. Depois de permitir, volte e tente de novo."
        ]
      },
      {
        "id": "someone-bothering-me",
        "question": "E se alguém estiver me incomodando?",
        "answer": [
          "Você pode bloquear a pessoa. Abra a sua conversa com ela e escolha Bloquear contato no menu do topo, ou use a opção de bloqueio na página de membro dela.",
          "O bloqueio é imediato e privado. Você deixa de ver os anúncios, os eventos, os comentários e as mensagens dela, e vocês dois deixam de poder trocar mensagens, responder um pelo outro, assumir anúncios um do outro ou convidar um ao outro. Ela não fica sabendo — não há notificação, nem marca no perfil, nem nada que outra pessoa possa ver.",
          "Bloquear NÃO abre uma queixa. Nenhuma pessoa moderadora é avisada, nenhuma disputa se abre, e as trocas passadas ficam como estavam. Se você quer que a comunidade opine, abra uma disputa em Perfil → Disputas — o bloqueio e a disputa convivem sem problema. O bloqueio dá sossego agora; a disputa segue o processo da comunidade no ritmo dele.",
          "Você pode rever, editar ou desfazer seus bloqueios a qualquer momento em Configurações → Contatos bloqueados."
        ]
      }
    ]
  },
  {
    "id": "events",
    "title": "Eventos e calendário",
    "entries": [
      {
        "id": "community-events",
        "question": "Como funcionam os eventos da comunidade?",
        "answer": [
          "Qualquer pessoa pode criar um evento: abra o Calendário e toque no botão +. Dê uma hora, um lugar e uma descrição, e ele aparece no calendário da comunidade para todo mundo.",
          "Toque num evento para confirmar presença — Vou, Talvez ou Não vou. Sua confirmação de presença fica no nó desta comunidade: quem organiza e as outras pessoas que confirmaram podem ver o seu nome, os membros que não confirmaram veem só os números, e as comunidades aliadas nunca veem a sua resposta. Se você mudar a resposta para “Não vou”, seu nome sai da lista na hora.",
          "Alguns eventos também têm turnos — faixas de horário em que quem organiza precisa de um certo número de mãos, como uma equipe de montagem ou um revezamento para servir. Inscrever-se num turno também confirma a sua presença como “Vou” no evento. A lista do turno funciona como a lista de presença: fica no nó desta comunidade, e mudar a sua resposta para “Não vou” também tira você dos turnos.",
          "Eventos não podem ser editados depois de criados — um evento assinado continua sendo exatamente aquilo a que as pessoas disseram sim. Se os detalhes mudarem, quem organiza cancela e publica um novo. Quando um evento em que você confirmou presença é cancelado, você vê um aviso sobre isso (com o motivo de quem organiza, se houver) na próxima vez que abrir o aplicativo."
        ]
      }
    ]
  },
  {
    "id": "projects",
    "title": "Projetos e tarefas",
    "entries": [
      {
        "id": "task-follows",
        "question": "Por que uma tarefa diz “Vem depois de: …”?",
        "answer": [
          "As tarefas de um projeto podem ter uma sequência. “Vem depois de” quer dizer que esta tarefa vem naturalmente depois de outra — concretar a fundação antes de levantar as paredes. Nada está travado e ninguém está no caminho de ninguém; é só uma ordem.",
          "Você ainda pode assumir uma tarefa dessas quando quiser. A única diferença é que o aplicativo, de propósito, não vai perguntar como ela está indo enquanto a tarefa anterior não estiver pronta — não faz sentido perguntar pelo andamento quando a base em que ela se apoia ainda não existe. O sistema espera com você, não espera por você."
        ]
      }
    ]
  }
];
