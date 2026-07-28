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
import type { StartCommunityGuide } from "./startCommunity";

// Portuguese mirror of content/startCommunity.ts. Same step ids, same
// paragraph counts, and BYTE-IDENTICAL code blocks (commands don't
// translate) — startCommunity.parity.test.ts enforces all three.
export const START_COMMUNITY_PT: StartCommunityGuide = {
  "intro": [
    "A sua comunidade roda o Understoria. Você pode começar uma para o seu bairro, o seu trabalho, a sua família do outro lado da cidade — usando só o servidor da sua própria comunidade. Sem conta no GitHub, sem loja de aplicativos, sem Docker obrigatório, sem pedir permissão a ninguém.",
    "Isso funciona porque o Understoria é software livre (licença AGPL) e cada servidor oferece o próprio código-fonte — o código exato que está rodando. Não é uma cortesia: a licença exige, e o aplicativo já traz isso embutido, para que nenhuma empresa, hospedagem ou repositório possa jamais ser o único lugar onde o software vive. Cada comunidade é uma semente.",
    "Para quem é isto: alguém que consegue seguir instruções de terminal com cuidado, mas que nunca colocou um servidor no ar. Se as palavras “terminal” e “comando” são novidade para você, faça isso ao lado de um membro que já fez — é assim que esse conhecimento deve viajar, de qualquer maneira."
  ],
  "steps": [
    {
      "id": "what-you-need",
      "title": "1. O que você vai precisar",
      "paragraphs": [
        "Um computador com terminal (os comandos abaixo são para Linux ou para um Mac; um Raspberry Pi serve). Uns 15 minutos para experimentar o aplicativo na sua própria máquina. Colocar no ar um servidor de verdade para os membros é uma tarde mais longa e precisa de um nome de domínio e de um servidor pequeno — os guias que vêm dentro do download cobrem tudo isso."
      ]
    },
    {
      "id": "get-the-software",
      "title": "2. Consiga o software",
      "paragraphs": [
        "O jeito fácil: na comunidade desta mesma página — ou em qualquer comunidade Understoria ao seu alcance — abra o Menu (no canto superior direito) → Infraestrutura da comunidade → o cartão chamado “O próprio software”. Baixe os DOIS arquivos: o arquivo com o código-fonte e as somas de verificação. Coloque os dois na mesma pasta.",
        "O jeito pelo terminal (troque o endereço pelo da sua comunidade):",
        "Alguns servidores também oferecem um “pacote com o histórico completo”. Ele é maior e, se você tiver o git instalado, é o melhor download: você leva todo o histórico de desenvolvimento e, mais tarde, as atualizações chegam do jeito normal. Se pegar o pacote, desempacote com o git em vez do tar:"
      ],
      "code": [
        "mkdir understoria-download && cd understoria-download\ncurl -fsSO https://YOUR-COMMUNITY.example/source/understoria-source.tar.gz\ncurl -fsSO https://YOUR-COMMUNITY.example/source/SHA256SUMS",
        "curl -fsSO https://YOUR-COMMUNITY.example/source/understoria.bundle\ngit clone understoria.bundle understoria"
      ]
    },
    {
      "id": "verify",
      "title": "3. Verifique o que você baixou",
      "paragraphs": [
        "Uma soma de verificação é uma impressão digital calculada a partir dos bytes exatos do arquivo. Se um único byte mudar no caminho até você — uma conexão instável, um download interrompido — a impressão muda por completo. Confira antes de compilar qualquer coisa. Você quer ver “OK”. Qualquer outra coisa: apague e baixe de novo.",
        "Olhe com honestidade para o que isso prova: a soma de verificação veio do mesmo servidor que o arquivo, então ela prova que o download chegou intacto — não pode provar que ninguém alterou o código naquele servidor. Essa confiança você já dá todos os dias a quem opera o seu servidor (é essa pessoa que serve o aplicativo que você está usando agora). Para uma confirmação independente, busque as somas de verificação de uma segunda comunidade para a mesma versão e compare — duas operadoras teriam que se combinar para enganar essa conferência.",
        "Depois, desempacote. O arquivo se extrai na pasta atual, então crie uma antes:"
      ],
      "code": [
        "# Linux:\nsha256sum -c SHA256SUMS\n# Mac:\nshasum -a 256 -c SHA256SUMS",
        "mkdir understoria\ntar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "try-it",
      "title": "4. Experimente antes de assumir qualquer compromisso",
      "paragraphs": [
        "Você pode rodar o aplicativo inteiro na sua própria máquina e percorrer uma troca de verdade do começo ao fim. A pasta que você acabou de desempacotar traz todos os guias do projeto, na pasta docs — abra docs/quickstart.md em qualquer editor de texto e siga a partir do primeiro passo. Onde o guia mandar clonar o repositório, pule essa parte: você já está dentro da pasta do código-fonte.",
        "Vale a pena mesmo que você não tenha dúvida. Você vai fazer o próprio cadastro, publicar uma necessidade e confirmar uma troca — assim, quando o primeiro membro de verdade travar em algum ponto, você já vai ter visto a tela dessa pessoa antes."
      ]
    },
    {
      "id": "deploy",
      "title": "5. Coloque no ar para a sua comunidade",
      "paragraphs": [
        "Os guias completos de servidor estão na mesma pasta docs, escritos exatamente para este momento. Escolha pelo jeito que você quer rodar: docs/deploy-linode.md (Docker num servidor pequeno na faixa dos cinco dólares — o caminho mais usado, quase todo automatizado por um script de instalação) ou docs/deploy-alternatives.md (Podman, ou Linux puro sem contêiner nenhum — o formato certo para hardware doado).",
        "Uma tradução para fazer enquanto você lê, já que os dois guias começam clonando do repositório público: onde um guia mandar clonar para uma pasta no servidor, copie para lá o seu arquivo verificado e extraia, em vez de clonar. Todo o resto — a chave do sistema, o arquivo de configurações, as chaves fundadoras, as cópias de segurança, a lista de “antes de abrir ao público” — vale sem mudanças.",
        "Para atualizar depois, sem git: baixe o arquivo mais novo de qualquer servidor que rode a versão mais nova, verifique do mesmo jeito, extraia numa pasta nova, leve junto o seu arquivo de configurações e coloque no ar de novo. Os dados da sua comunidade ficam a salvo nesse processo — eles nunca vivem na pasta do código-fonte."
      ],
      "code": [
        "scp understoria-source.tar.gz SHA256SUMS root@YOUR-SERVER:/opt/\nssh root@YOUR-SERVER\ncd /opt && sha256sum -c SHA256SUMS && mkdir understoria \\\n  && tar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "seed",
      "title": "6. Agora você também é uma semente",
      "paragraphs": [
        "No momento em que o seu servidor estiver no ar, ele passa a oferecer o PRÓPRIO código-fonte do mesmo jeito — automaticamente, a partir da mesma compilação. Seus membros podem verificar o que estão rodando, e o próximo bairro pode começar a partir de você, do jeito que você acabou de começar a partir da sua comunidade. Nenhum ponto único — nem o GitHub, nem quem criou o projeto, nem um operador sozinho — pode tirar o software de todo mundo de uma vez.",
        "Dois hábitos mantêm a corrente forte: coloque uma versão recente no ar de vez em quando (o seu servidor oferece o código do que está rodando, então rodar algo recente é semear algo recente) e conheça o servidor de uma segunda comunidade — a conferência de comparar dois servidores, ali de cima, só funciona se as comunidades souberem nomear umas às outras."
      ]
    }
  ],
  "closing": [
    "As perguntas que esta página não responde vivem na pasta docs do download — docs/bootstrap-from-a-node.md é este mesmo passo a passo com mais detalhe, e docs/operator-guide.md é o manual do dia a dia para quem mantém o servidor no ar."
  ]
};
