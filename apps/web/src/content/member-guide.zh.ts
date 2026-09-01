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

// Chinese member guide (loaded lazily via content/bundles/zh.ts —
// never import this statically from app code). Ids and the
// section/paragraph structure mirror member-guide.ts exactly;
// guides.parity.test.ts enforces it. Register follows
// docs/i18n-glossary/zh.md: 你 never 您, warm kitchen-table
// Chinese, no debt vocabulary.
import type { GuideSection } from "./member-guide";

export const MEMBER_GUIDE_ZH: readonly GuideSection[] = [
  {
    id: "what-it-is",
    title: "Understoria 是什么",
    body: [
      "Understoria 是一个时间银行：让社区交换帮助的一种方式，每一小时" +
        "都平等记录。修一小时水槽，等于在谁熬过难挨的一天之后，陪着听" +
        "一小时。",
      "它不是用来找零工的应用。它是给一个已经存在的社区——工作场所、" +
        "街区、志同道合的小团体——用的软件：大家本来就彼此信任，只想要" +
        "一个轻巧的办法，让互相的帮忙看得见。",
    ],
  },
  {
    id: "credits",
    title: "时数是怎么回事",
    body: [
      "每位新成员一进来就有5小时的起始时数。还没帮过任何人，也可以先" +
        "开口求助。求助不等于背上人情——正是有人开口，这张网才活了" +
        "起来。",
      "帮了谁之后，你们两个人都确认这次交换。你的时数按付出的小时数" +
        "往上走，对方的往下走。不经手一分钱，也没有人在记分。",
      "你的时数由每一次交换的签名记录算出来。觉得哪里不对，可以自己" +
        "逐条核对。",
    ],
  },
  {
    id: "identity",
    title: "你的身份",
    body: [
      "你的身份是一对加密密钥。没有邮箱，没有电话号码，也没有账户" +
        "密码。昵称随你起——名字只是标签，不是证件。",
      "设备上的密钥可以用指纹、面容或设备 PIN 码锁住（也就是通行" +
        "密钥——引导流程里就会问你要不要，而且完全不需要联网），也可以" +
        "用一条自己输入的口令来锁；两样都要也行，口令就当备用的那扇" +
        "门。关于这把锁的任何信息都不会发给 Apple、Google 或任何" +
        "服务器——验证就发生在你自己的设备上。",
      "口令忘了，或者带着指纹锁的手机丢了——没有人能替你找回。这就是" +
        "那笔交换：没有任何中央机构能读你的数据，也就没有任何中央机构" +
        "能救回它。能把你带回来的，是日子还安稳时做下的备份：第二台已" +
        "关联的设备、你选定的守护人，或是一份恢复包——每一样在设置里都" +
        "只要一分钟左右。",
      "如果哪天需要立刻抹除一切——轻度抹除（匿名化）或彻底抹除（重新" +
        "开始）——危急按钮就在个人资料 → 紧急情况里。",
    ],
  },
  {
    id: "trust",
    title: "信任与加入",
    body: [
      "新成员需要两位现有成员的担保，才能获得社区完全信任。有人用了" +
        "你的邀请加入，就自动算作你的一份担保。",
      "还没获得完全信任的成员，也照样可以贴出启事、认领帮助——求助" +
        "永远不设门槛——只是大家会看到一枚显示信任状态的小标签，这样" +
        "认识了、觉得合适，就可以亲手补上一份担保。",
    ],
  },
  {
    id: "governance",
    title: "决定与分歧",
    body: [
      "社区里的决定是大家一起做的，不是管理员做的——这个应用特意不设" +
        "管理员和版主角色。事关全社区的选择走公开的提议：谁都可以从" +
        "个人资料 → 社区提议发起一条，人人都看得到，提议在关闭之前会" +
        "敞开一段商议期。",
      "关于某一次具体交换的分歧走同一套机制：从个人资料 → 社区争议" +
        "发起一场争议，它会变成一条社区共同商议的提议，关闭时结果自动" +
        "生效。",
      "应用不替你们决定的事——规矩、开会的节奏、彼此怎么说话——都发生" +
        "在社区本来就在用的渠道上。应用负责记下决定；它不代替那场" +
        "谈话。",
    ],
  },
  {
    id: "where-from-here",
    title: "接下来去哪儿",
    body: [
      "打开公告栏，看看邻居们此刻在提供什么、需要什么。",
      "打开总览，看看社区过得怎么样——一共交换了多少小时、帮助正流向" +
        "哪里、庆祝过什么。",
      "打开个人资料，更新你的技能和空闲时间、邀请一位新人，或者读一" +
        "读设备上那几份更长的指南。",
    ],
  },
] as const;
