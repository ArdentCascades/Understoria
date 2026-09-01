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

// Chinese study prompts (loaded lazily via content/bundles/zh.ts —
// never import this statically from app code). Ids and themes are
// stable machine keys, byte-identical to study-prompts.ts;
// guides.parity.test.ts enforces it. Register follows
// docs/i18n-glossary/zh.md; author and movement names (Dean Spade,
// McAlevey, Freeman, Mauss, Hyde, Haudenosaunee, Zapatistas,
// mandar obedeciendo) keep their original forms.
import type { StudyPrompt } from "./study-prompts";

export const STUDY_PROMPTS_ZH: readonly StudyPrompt[] = [
  {
    id: "platform-1",
    theme: "platform",
    body:
      "在还没有软件的年代，时间银行和互助网络是怎么运转的？软件来了" +
      "之后，它们失去了什么，又得到了什么？在这笔得失之间，" +
      "Understoria 应该站在哪里？",
  },
  {
    id: "platform-2",
    theme: "platform",
    body:
      "Understoria 的设计原则是一小时等于一小时。这条原则护着的是" +
      "哪些劳动？它会招来什么批评？在你的社区里，有没有它反而碍事的" +
      "时候？",
  },
  {
    id: "platform-3",
    theme: "platform",
    body:
      "如果明天把这个应用拿走，我们还剩下什么？那个答案才是真正的" +
      "地基；应用只是脚手架。",
  },
  {
    id: "mutual-aid-1",
    theme: "mutual_aid",
    body:
      "Dean Spade 用“由谁来决定”来区分互助和慈善。此刻在你的社区" +
      "里，决定是谁在做？谁没份做？",
  },
  {
    id: "mutual-aid-2",
    theme: "mutual_aid",
    body:
      "互助项目常常被 NGO 吸收，或者被改造成单向提供服务的项目。是" +
      "什么在护着你的社区，不被这股力量拽过去？",
  },
  {
    id: "mutual-aid-3",
    theme: "mutual_aid",
    body: "你的社区里，谁明明需要帮助却没有开口？为什么？",
  },
  {
    id: "organizing-1",
    theme: "organizing",
    body:
      "McAlevey 区分动员（让已有的支持者到场）和组织（把还不是支持" +
      "者的人争取过来）。你们的互助网络是一个动员型的项目、一个组织" +
      "型的项目，还是两者都是？",
  },
  {
    id: "organizing-2",
    theme: "organizing",
    body:
      "互助工作和工会工作在历史上一直互相滋养。在你们的处境里，连接" +
      "点在哪里？有什么本来可能、却还没人去试的事？",
  },
  {
    id: "power-1",
    theme: "power",
    body:
      "Freeman 指出，假装没有结构并不会让你真的没有结构；它只是让" +
      "结构变得不成文、更难被质疑。你的社区里存在哪些不成文的结构？" +
      "它们运转得还好吗？",
  },
  {
    id: "power-2",
    theme: "power",
    body:
      "如果 Understoria 的软件决定出自一家公司而不是一家合作社，它" +
      "的功能会有什么不同？写下三条。",
  },
  {
    id: "traditions-1",
    theme: "traditions",
    body:
      "Mauss 和 Hyde 把礼物描述成带着一份责任的东西——要接住，也要" +
      "转手再给出去——而市场恰恰把这份责任抹掉了。在你的社区里，哪里" +
      "还留着礼物的逻辑，哪里已经换成了一手来一手往的交易式框架？这" +
      "重要吗？",
  },
  {
    id: "traditions-2",
    theme: "traditions",
    body:
      "Haudenosaunee 的原则，是把每个决定放到好几代人的尺度上来" +
      "衡量——这对一个围着每周指标打转的项目来说，结构上就很难。挑一" +
      "件你的社区最近做的决定：放到五代或七代人的眼光里重新看，它会" +
      "是什么样子？",
  },
  {
    id: "traditions-3",
    theme: "traditions",
    body:
      "Zapatistas 的 mandar obedeciendo——服从着去领导——不是一句" +
      "比喻，而是一项结构性的承诺，直接关系到协调的角色由谁来担、担" +
      "多久。你的社区里，谁握着不成文的协调权？要把它放到 mandar " +
      "obedeciendo 之下正式确立，代价会是什么？",
  },
] as const;
