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

// Chinese opsec guide (loaded lazily via content/bundles/zh.ts —
// never import this statically from app code). Ids and the
// section/paragraph structure mirror opsec-guide.ts exactly;
// guides.parity.test.ts enforces it. Register follows
// docs/i18n-glossary/zh.md; product names (FileVault, BitLocker,
// LUKS, Face ID, Touch ID, NLG, LDAN) stay untranslated.
import type { GuideSection } from "./member-guide";

export const OPSEC_GUIDE_ZH: readonly GuideSection[] = [
  {
    id: "device",
    title: "在你的设备上",
    body: [
      "给手机上一道六位 PIN 码或一条够强的口令。打开全盘加密（现在的" +
        "手机都默认开着；笔记本电脑用 FileVault、BitLocker 或 LUKS）。" +
        "系统保持更新——现实里的攻击，大多利用的是早已修补过的漏洞。",
    ],
  },
  {
    id: "accounts",
    title: "关于你的身份",
    body: [
      "Understoria 不会问你要邮箱或电话号码。要是有人自称来自 " +
        "Understoria 向你要这些，那就是钓鱼。",
      "你的身份是这台设备上的一把加密密钥。可以导出一份备份——放在" +
        "安全、不联网的地方。抽屉里的一张打印纸，常常比云端更稳妥。",
      "手机丢了或被偷了，护住密钥的就是你给它上的那道锁（指纹、面容" +
        "或 PIN 组成的通行密钥，或一条口令）——引导流程一上来就请你设" +
        "一道，正是为了这一刻。这里没有中央吊销机制，也没有谁能替你扳" +
        "一下开关：把发生的事告诉社区，让大家知道别再信任那个身份，" +
        "然后用一把新密钥重新开始（还留着旧密钥的每台设备上，都走" +
        "个人资料 → 紧急情况 → 彻底抹除）。",
    ],
  },
  {
    id: "communication",
    title: "关于你的通信",
    body: [
      "别在雇主的设备或网络上谈组织的事。工作笔记本和公司 WiFi 会留" +
        "下记录，有时还在监控。",
      "别把平台上的内容截图发到圈子外面。东西一旦离开 Understoria，" +
        "就不再受保护了。",
      "敏感的话当面说。散步十分钟，胜过在消息里聊两个小时。",
    ],
  },
  {
    id: "social",
    title: "关于你的社交痕迹",
    body: [
      "让你在 Understoria 的昵称和工作身份分开。化名是一项功能，不是" +
        "心里有鬼。",
      "别用真实姓名在公开的社交媒体上发组织工作的内容。哪怕只是" +
        "“泛泛打气”的内容，发得多了，也会连成一条有心的观察者拼得出" +
        "来的轨迹。",
    ],
  },
  {
    id: "wrong",
    title: "感觉不对劲的时候",
    body: [
      "不认识的人想加进来，放慢脚步。请对方找人担保。",
      "要是某位现有成员开始打听奇怪的问题——成员名单、谁帮过谁——记在" +
        "心里。找另一位成员聊聊。渗透是真实发生过的事。",
      "要是供应商、雇主或警察要你交出成员或活动的信息：你可以不给。" +
        "别一个人扛——回答任何问题之前，先和你信任的成员商量。",
    ],
  },
  {
    id: "rights",
    title: "了解你的权利",
    body: [
      "没有律师在场，你可以不回答警察的问题。你可以不同意搜查设备——" +
        "他们通常需要搜查令。你可以不指认其他成员。你有权保持沉默。",
      "指纹和面容不是话语。在许多地方，法院把生物识别解锁当成一把" +
        "实体钥匙——警察可以把你的手指按到手机上，或把手机举到你脸" +
        "前——而你脑子里记着的东西，比如一条口令，则被当作可以拒绝提供" +
        "的证词。各个国家、各家法院的做法不一样，去问当地的法律组织；" +
        "但只要有被拘留的可能，就当作生物识别可以被强制，而口令不能。",
      "趁用不上的时候，先学会手机的硬锁定手势。iPhone 上，同时按住" +
        "侧边按钮和任意一个音量键两秒（直到出现关机画面）——从这一刻" +
        "起，Face ID 和 Touch ID 都会失效，输入密码才能解锁。Android " +
        "上，按住电源键，点“锁定”（没有这个选项的话，先到设置 → 显示" +
        " → 锁定屏幕里打开）。练到成为肌肉记忆为止。",
      "在 Understoria 里也是同一个道理：如果被强制解锁在你的威胁清单" +
        "上，就用口令而不是指纹来保护密钥——或者在游行、过境，或任何" +
        "可能被拘留的时刻之前，先把指纹解锁去掉（个人资料 → 设置 → " +
        "安全），事后再加回来。只有亲手输入的口令，才把“你可以拒绝”" +
        "这层保护从头带到尾。也别忘了危急按钮（个人资料 → 紧急情况 → " +
        "彻底抹除）——它就是为锁定还不够的时刻准备的。",
      "当地的法律组织（美国的 NLG、英国的 LDAN）能提供按你所在辖区" +
        "写的“了解你的权利”卡片。在钱包里放一张。",
    ],
  },
];
