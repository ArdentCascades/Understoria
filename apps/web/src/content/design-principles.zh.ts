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

// Chinese translation of design-principles.ts. Same shape, same ids —
// only the prose changes. Register follows docs/i18n-glossary/zh.md:
// 你 never 您, 互助 for mutual aid, 时间银行 for timebank, 起始时数
// for seed credits, 接续/接在……后 for the follows framing, and no
// debt vocabulary. Proper nouns (Couchsurfing, WhatsApp, Strava,
// 蒙德拉贡) keep their established forms.
import type { DesignPrinciple } from "./design-principles";

export const DESIGN_PRINCIPLES_ZH: readonly DesignPrinciple[] = [
  {
    id: "equal-time",
    title: "时数一律平等",
    statement: "一小时帮忙永远等于一小时时数，不论做的是什么。",
    example:
      "早年尝试市场定价的时间银行发现，情感支持和带孩子——最常由女性和残障成员承担的工作——总是被估得最低。时数平等，就是从结构上把这件事修正。",
  },
  {
    id: "no-leaderboards",
    title: "没有排行榜，没有个人分数",
    statement: "进展按整个社区来记。衡量的单位是我们，不是我。",
    example:
      "Couchsurfing 加上声誉分之后，房东开始刷分，而最脆弱的客人——拿不出高评分回报的人——被整个系统拒之门外。",
  },
  {
    id: "no-notifications",
    title: "没有推送通知",
    statement:
      "你打开应用时，我们把需要你留意的事摆在眼前。不震动，没有计数从一个屏幕追到另一个屏幕，不上演紧迫感。",
    example:
      "COVID 疫情期间组织互助的人普遍讲到：靠通知驱动的工具，最先耗尽的是投入最深的成员——恰恰是社区最经不起失去的人。撑起这条原则的是这份经历，不是什么正式研究。",
  },
  {
    id: "solidarity-not-shame",
    title: "讲团结，不羞辱",
    statement:
      "从不把一件事说成停滞、逾期或失败。每个人的余力会变；系统跟着调整，不怪任何人。",
    example:
      "零工平台用「你落后了」的提示来榨取更多劳动。受影响最深的，正是已经身处难关的人——互助存在的意义恰恰是接住他们。",
  },
  {
    id: "community-authority",
    title: "社区自己就是权威",
    statement: "没有管理员角色。治理决定走社区提议，不走个人权力。",
    example:
      "蒙德拉贡合作社用六十多年证明：工人自治在公平和长久两方面都胜过经理治理。「管理员」这个角色是一种设计选择，不是必需品。",
  },
  {
    id: "asking-never-gated",
    title: "求助永远不设门槛",
    statement: "每位新成员都带着起始时数开始。可以先接受，再付出。",
    example:
      "要求先攒够才能用的时间银行看到，最脆弱的成员——老人、新来的人、正在难关里的人——从来不开口求助。起始时数就是从结构上把这件事修正。",
  },
  {
    id: "privacy-precondition",
    title: "隐私是前提",
    statement:
      "不要邮箱，不要手机号，日志降到最少。你的身份是存在你设备上的一把加密密钥。",
    example:
      "用过电子签到表的工人中心，成员名单被法院调取过，也被泄露给过雇主。要组织起来，受保护的必须是「谁是成员」本身，而不只是聊了什么。",
  },
  {
    id: "deliberation-over-speed",
    title: "宁可慢，也要商量",
    statement: "提议在可配置的期限内保持开放。共识需要时间，不只是凑够人数。",
    example:
      "合作社里的快速在线投票，一次次让夜班工人、照护者和网络不便的成员没能发声。默认 3 天的商议窗口让每个人都有真正掂量的机会（社区可以调整，最短 1 天）。",
  },
  {
    id: "no-post-editing",
    title: "为什么是重新发布，而不是编辑",
    statement:
      "帖子一旦与社区见面，就不能被悄悄修改或抹掉——大家看到过什么，这份记录对每个人都保持可信。",
    example:
      "允许悄悄编辑的平台会造出抵赖空间——「我从没说过」变得无从对证。原帖保持原样，改动走重新发布的流程，灵活和负责就都留住了。",
  },
  {
    id: "no-read-receipts",
    title: "消息没有已读回执",
    statement:
      "我们不告诉发送者消息何时被读。谁在和谁说话，是威胁模型最要保护的关系图。",
    example:
      "WhatsApp 的蓝色对勾造成了必须立刻回复的社交压力，也让施暴的伴侣得以监视回复时间。去掉已读回执，就把这个监控抓手整个拆掉了。",
  },
  {
    id: "no-activity-search",
    title: "不能按活跃度搜索成员",
    statement:
      "搜不了「谁最活跃」「谁帮得最多」。活动规律就是监控数据。",
    example:
      "Strava 公布聚合活动热力图时，意外暴露了秘密军事基地的位置。个人的活动规律暴露得更多——谁在组织、什么时候、和谁一起。",
  },
  {
    id: "follows-not-blocked",
    title: "任务是「接续」，从不「被卡」",
    statement:
      "等着另一项任务的任务，是排好了顺序，不是动弹不得。说法塑造大家对这份工作的感受。",
    example:
      "把任务标成「被阻塞」的项目管理工具，会造出互相怪罪的局面——总有人在「卡」别人。「接续」把同一种依赖讲成自然的先后，把人与人之间的火药味卸掉了。",
  },
];
