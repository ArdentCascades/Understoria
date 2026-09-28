/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// Korean translation (i18n post-wave languages). Loaded lazily
// via content/bundles/ko.ts — never import statically from app code.
// Ids are stable and never translated; parity gates enforce structure.
import type { StartCommunityGuide } from "./startCommunity";

export const START_COMMUNITY_KO: StartCommunityGuide = {
  "intro": [
    "내 공동체는 Understoria로 굴러가요. 우리 동네를 위해, 일터를 위해, 시내 건너편의 가족을 위해 하나 시작할 수 있어요 — 공동체의 서버 하나만 가지고요. GitHub 계정도, 앱 스토어도, Docker도, 누구의 허락도 필요 없어요.",
    "이게 되는 건 Understoria가 자유 소프트웨어(AGPL 라이선스)이고, 모든 서버가 자기 소스 코드 — 지금 돌리고 있는 바로 그 코드 — 를 내어 주기 때문이에요. 호의가 아니에요. 라이선스가 그걸 요구하고, 앱이 그걸 붙박이로 품고 있어서, 어떤 한 회사도, 호스트도, 저장소도 이 소프트웨어가 사는 유일한 자리가 될 수 없어요. 모든 공동체가 씨앗이에요.",
    "누구를 위한 안내인가: 터미널 안내를 조심스럽게 따라갈 수는 있지만, 서버를 올려 본 적은 없는 사람이에요. '터미널'과 '명령어'라는 말이 낯설다면, 해 본 구성원 곁에서 함께 하세요 — 이 지식은 원래 그렇게 옮겨 다니라고 있는 거예요."
  ],
  "steps": [
    {
      "id": "what-you-need",
      "title": "1. 필요한 것",
      "paragraphs": [
        "터미널이 있는 컴퓨터 (아래 명령어는 Linux나 Mac용이에요; Raspberry Pi도 돼요). 내 기기에서 앱을 시험해 보는 데 15분쯤. 구성원들을 위한 진짜 서버를 올리는 건 더 긴 오후 하나짜리 일이고, 도메인 이름과 작은 서버가 필요해요 — 내려받은 것 안에 들어 있는 안내서들이 그 전부를 다뤄요."
      ]
    },
    {
      "id": "get-the-software",
      "title": "2. 소프트웨어 받기",
      "paragraphs": [
        "쉬운 길: 바로 이 페이지의 공동체에서 — 또는 닿을 수 있는 아무 Understoria 공동체에서든 — 메뉴(오른쪽 위) → 공동체 기반 시설 → '소프트웨어 그 자체' 카드를 여세요. 파일 두 개를 모두 내려받으세요: 소스 아카이브와 체크섬이요. 둘을 같은 폴더에 두세요.",
        "터미널 길 (주소는 내 공동체의 것으로 바꾸세요):",
        "'전체 역사 묶음(full history bundle)'을 내어 주는 서버도 있어요. 더 크지만, git이 설치되어 있다면 이쪽이 더 나은 다운로드예요: 개발 역사 전체가 딸려 오고, 나중에 보통의 방식으로 업데이트를 당겨 올 수 있거든요. 묶음을 받았다면 tar 대신 git으로 풀어요:"
      ],
      "code": [
        "mkdir understoria-download && cd understoria-download\ncurl -fsSO https://YOUR-COMMUNITY.example/source/understoria-source.tar.gz\ncurl -fsSO https://YOUR-COMMUNITY.example/source/SHA256SUMS",
        "curl -fsSO https://YOUR-COMMUNITY.example/source/understoria.bundle\ngit clone understoria.bundle understoria"
      ]
    },
    {
      "id": "verify",
      "title": "3. 내려받은 것 검증하기",
      "paragraphs": [
        "체크섬은 파일의 정확한 바이트에서 계산한 지문이에요. 오는 길에 한 바이트라도 바뀌었다면 — 불안한 연결, 중간에 끊긴 다운로드 — 지문이 완전히 달라져요. 무엇이든 빌드하기 전에 확인하세요. 'OK'가 보여야 해요. 다른 게 보이면: 지우고 다시 내려받으세요.",
        "이게 무엇을 증명하는지에는 스스로에게 솔직해지세요: 체크섬은 파일과 같은 서버에서 왔으니, 다운로드가 온전히 도착했다는 건 증명하지만 — 그 서버 위의 코드를 아무도 바꾸지 않았다는 건 증명하지 못해요. 그 정도의 믿음은 이미 매일 서버지기에게 건네고 있어요 (지금 쓰는 이 돌아가는 앱을 그 사람이 내어 주고 있으니까요). 독립적인 확인이 필요하면, 같은 버전에 대해 두 번째 공동체의 체크섬을 받아 견줘 보세요 — 그걸 속이려면 서버지기 두 사람이 짜고 움직여야 해요.",
        "그다음 풀어요. 아카이브는 현재 폴더로 풀리니, 먼저 하나 만드세요:"
      ],
      "code": [
        "# Linux:\nsha256sum -c SHA256SUMS\n# Mac:\nshasum -a 256 -c SHA256SUMS",
        "mkdir understoria\ntar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "try-it",
      "title": "4. 무엇에든 마음을 정하기 전에 먼저 돌려 보기",
      "paragraphs": [
        "앱 전체를 내 기기에서 돌리며 진짜 교환을 처음부터 끝까지 걸어 볼 수 있어요. 방금 푼 폴더의 docs 폴더에 이 프로젝트의 모든 안내서가 들어 있어요 — docs/quickstart.md를 아무 텍스트 편집기로 열고 첫 단계부터 따라가세요. 저장소를 클론하라는 대목은 건너뛰세요: 이미 소스 폴더 안에 앉아 있으니까요.",
        "확신이 서 있어도 해 볼 가치가 있어요. 스스로 첫걸음을 떼 보고, 필요한 것을 올리고, 교환을 확정하게 되니까요 — 그래야 첫 진짜 구성원이 막혔을 때, 그 사람의 화면을 이미 본 적이 있게 돼요."
      ]
    },
    {
      "id": "deploy",
      "title": "5. 공동체를 위해 올리기",
      "paragraphs": [
        "본격적인 서버 안내서들은 같은 docs 폴더에, 바로 이 순간을 위해 쓰여 있어요. 어떻게 돌리고 싶은지에 따라 고르세요: docs/deploy-linode.md (5달러급 작은 서버에 Docker — 가장 많이 다녀 길이 잘 난 길이고, 설정 스크립트가 대부분을 자동으로 해 줘요) 또는 docs/deploy-alternatives.md (Podman, 아니면 컨테이너 없이 맨 Linux — 기증받은 하드웨어에 꼭 맞는 모양이에요).",
        "읽으면서 한 가지만 바꿔 읽으세요. 두 안내서 모두 공개 저장소에서 클론하는 걸로 시작하는데: 서버의 폴더로 클론하라고 하는 자리에서는, 대신 검증한 아카이브를 거기로 복사해서 푸세요. 나머지 전부 — 시스템 키, 설정 파일, 설립자 키, 백업, '공개하기 전' 점검 목록 — 는 그대로 적용돼요.",
        "나중에 git 없이 업데이트하기: 더 새 버전을 돌리는 아무 서버에서든 더 새 아카이브를 내려받고, 같은 방법으로 검증하고, 새 폴더에 풀고, 설정 파일을 옮겨 담고, 다시 올리면 돼요. 공동체의 데이터는 이 과정 내내 안전해요 — 데이터는 애초에 소스 폴더에 살지 않거든요."
      ],
      "code": [
        "scp understoria-source.tar.gz SHA256SUMS root@YOUR-SERVER:/opt/\nssh root@YOUR-SERVER\ncd /opt && sha256sum -c SHA256SUMS && mkdir understoria \\\n  && tar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "seed",
      "title": "6. 이제 나도 씨앗이에요",
      "paragraphs": [
        "서버가 켜지는 순간, 그 서버도 같은 방식으로 자기 소스를 내어 줘요 — 저절로, 같은 빌드에서요. 구성원들은 자기가 돌리는 게 무엇인지 검증할 수 있고, 다음 동네는 내가 방금 내 공동체에서 시작했듯 나에게서 시작할 수 있어요. 어떤 단일 지점도 — GitHub도, 이 프로젝트를 만든 사람들도, 어느 한 서버지기도 — 모두에게서 한꺼번에 이 소프트웨어를 빼앗아 갈 수 없어요.",
        "습관 두 가지가 이 사슬을 튼튼하게 해요: 이따금 다시 올리기 (서버는 자기가 돌리는 것의 소스를 내어 주니, 최근 것을 돌린다는 건 최근 것을 심는다는 뜻이에요), 그리고 두 번째 공동체의 서버를 알아 두기 — 위의 두 서버 견주기 확인은 공동체들이 서로의 이름을 부를 수 있을 때에만 통하니까요."
      ]
    }
  ],
  "closing": [
    "이 페이지가 답하지 못한 질문은 내려받은 것의 docs 폴더에 살아요 — docs/bootstrap-from-a-node.md는 이 걸음을 더 자세히 적은 같은 안내이고, docs/operator-guide.md는 서버를 돌보는 서버지기를 위한 매일의 손 안내서예요."
  ]
};
