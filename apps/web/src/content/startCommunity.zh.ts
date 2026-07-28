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

// Chinese mirror of content/startCommunity.ts. Same step ids, same
// paragraph counts, and BYTE-IDENTICAL code blocks (commands don't
// translate) — startCommunity.parity.test.ts enforces all three.
export const START_COMMUNITY_ZH: StartCommunityGuide = {
  "intro": [
    "你的社区正运行着 Understoria。你也可以再开一个——为你的街区、你干活的地方、住在城市另一头的家人——只靠你所在社区自己的服务器就够了。不需要 GitHub 账号，不需要应用商店，不强求 Docker，也不用得到任何人的许可。",
    "这行得通，是因为 Understoria 是自由软件（AGPL 许可证），而每台服务器都提供它自己的源代码——就是它正在运行的那份代码。这不是什么客气话：许可证要求这样，应用也把这件事做进了自身，所以永远不会有哪一家公司、哪一个托管方或仓库，成为这套软件唯一的栖身之地。每个社区都是一颗种子。",
    "这份指南写给这样的人：能耐心照着终端指令一步一步来，但从没部署过服务器。要是“终端”“命令”这些词你还是头一回听说，就挨着一位做过的成员一起做——这门本事本来就该这么传下去。"
  ],
  "steps": [
    {
      "id": "what-you-need",
      "title": "1. 需要准备什么",
      "paragraphs": [
        "一台带终端的电脑（下面的命令适用于 Linux 或 Mac；树莓派也行）。在自己机器上试用这个应用，大约要15分钟。给成员们部署一台真正的服务器则是一个完整的下午，还需要一个域名和一台小服务器——下载包里自带的指南把这些都讲全了。"
      ]
    },
    {
      "id": "get-the-software",
      "title": "2. 拿到软件",
      "paragraphs": [
        "省事的做法：就在这个页面所在的社区——或任何一个你够得着的 Understoria 社区——打开菜单（右上角）→ 社区基础设施 → 那张叫“软件本身”的卡片。两个文件都要下载：源代码压缩包和校验和。把它们放进同一个文件夹。",
        "终端的做法（把地址换成你社区的）：",
        "有些服务器还提供“完整历史打包”。它更大；不过要是你装了 git，它就是更好的选择：能拿到完整的开发历史，以后还能正常拉取更新。要是选了它，就用 git 而不是 tar 来解开："
      ],
      "code": [
        "mkdir understoria-download && cd understoria-download\ncurl -fsSO https://YOUR-COMMUNITY.example/source/understoria-source.tar.gz\ncurl -fsSO https://YOUR-COMMUNITY.example/source/SHA256SUMS",
        "curl -fsSO https://YOUR-COMMUNITY.example/source/understoria.bundle\ngit clone understoria.bundle understoria"
      ]
    },
    {
      "id": "verify",
      "title": "3. 校验你下载的东西",
      "paragraphs": [
        "校验和是从文件的每一个字节算出来的指纹。哪怕路上只变了一个字节——网络不稳、下载断了半截——指纹都会完全变样。动手构建之前先核对。你要看到的是“OK”。出现别的：删掉，重新下载。",
        "对这一步能证明什么，心里要有数：校验和与文件来自同一台服务器，所以它证明的是下载完好无损——证明不了没人改过那台服务器上的代码。这份信任你本来每天都在交给你的运行者（你手里这份正在运行的应用就是对方提供的）。想要独立的印证，就从第二个社区取同一版本的校验和来比一比——要骗过这一招，得两位运行者串通才行。",
        "然后解包。压缩包会直接解进当前文件夹，所以先建一个："
      ],
      "code": [
        "# Linux:\nsha256sum -c SHA256SUMS\n# Mac:\nshasum -a 256 -c SHA256SUMS",
        "mkdir understoria\ntar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "try-it",
      "title": "4. 先试一试，再做决定",
      "paragraphs": [
        "整个应用都能在你自己的机器上跑起来，从头到尾走一遍真实的交换。你刚解开的文件夹里装着这个项目的全部指南，就在它的 docs 文件夹——用任意文本编辑器打开 docs/quickstart.md，从第一步照着做。凡是让你克隆仓库的地方，跳过去：你已经坐在源代码文件夹里了。",
        "就算主意已定，这一步也值得走。你会亲手注册加入、贴出一条需求、确认一次交换——等你的第一位真成员卡住时，你已经见过对方屏幕上的样子了。"
      ]
    },
    {
      "id": "deploy",
      "title": "5. 为你的社区部署",
      "paragraphs": [
        "完整的服务器指南在同一个 docs 文件夹里，写的正是眼下这一步。按你想怎么运行来挑：docs/deploy-linode.md（在一台5美元上下的小服务器上跑 Docker——走的人最多的一条路，安装脚本替你做了大半）或 docs/deploy-alternatives.md（Podman，或者完全不用容器的纯 Linux——正适合接手捐来的硬件）。",
        "读的时候只需做一个转换，因为两份指南开头都从公共仓库克隆：凡是让你把代码克隆到服务器某个文件夹的地方，改成把你校验过的压缩包复制过去、就地解开。其余一切——系统密钥、设置文件、发起人密钥、备份、“正式开放之前”的检查清单——照做就行，一个字都不用改。",
        "以后不用 git 也能更新：从任何一台跑着新版本的服务器下载新的压缩包，用同样的方法校验，解进一个干净的新文件夹，把你的设置文件搬过去，重新部署。这个过程动不到社区的数据——它从来就不住在源代码文件夹里。"
      ],
      "code": [
        "scp understoria-source.tar.gz SHA256SUMS root@YOUR-SERVER:/opt/\nssh root@YOUR-SERVER\ncd /opt && sha256sum -c SHA256SUMS && mkdir understoria \\\n  && tar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "seed",
      "title": "6. 现在你也是一颗种子了",
      "paragraphs": [
        "你的服务器一跑起来，就会以同样的方式提供它自己的源代码——不用你做什么，出自同一次构建。你的成员能校验自己正在用的是什么，下一个街区也能从你这里起步，就像你刚刚从你的社区起步一样。没有哪个单独的点——不是 GitHub，不是项目的作者们，也不是任何一位运行者——能把这套软件一下子从所有人手里拿走。",
        "两个习惯能让这条链一直结实：隔段时间就重新部署（服务器提供的是它正在运行的源代码，跑得新，播出去的种子就新）；再认识第二个社区的服务器——上面那招“两台服务器比一比”，只有社区之间叫得出彼此，才用得上。"
      ]
    }
  ],
  "closing": [
    "这一页没答到的问题，都住在下载包的 docs 文件夹里——docs/bootstrap-from-a-node.md 是这份指南的更详尽版本，docs/operator-guide.md 则是给守着服务器的人看的日常手册。"
  ]
};
