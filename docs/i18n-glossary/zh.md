# Chinese (zh) translation glossary — Simplified

Reference for every bulk-translation and review pass over `zh.json` and
the Chinese content modules. Decisions here get applied ~2,900 times —
when in doubt, pick the word a Chinese-speaking neighbor would say
across a kitchen table, not the word a bank, a platform, or a notice on
a wall would print.

**Locale code is `zh`** (language-only): content is Simplified Chinese
(简体), and the bare code matches browser detection for `zh`, `zh-CN`,
and `zh-SG`. A Traditional variant (`zh-Hant`) is a possible future
locale — it would fork more than the script (「」 quotes, different
device/software vocabulary), so nothing here should be auto-converted;
it gets its own glossary when its wave comes.

## Global register decisions

1. **你, never 您.** The app is neighbors talking, not customer
   service. 您 is the register of banks, airlines, and support
   scripts — it puts a counter between people. Every string addresses
   the member as 你, matching Spanish "tú" and French "tu". Chinese is
   pro-drop: most sentences don't need the pronoun at all ("会在这里
   找到它" — even warmer than spelling out 你).
2. **Warm, plain, community Chinese** over corporate service-speak and
   officialese. Banned outright: 您, 请您, 亲 (e-commerce customer
   cooing), 亲爱的用户, 尊敬的会员, 温馨提示 (the classic notice-board
   officialese), 敬请, 烦请, 进行 + verb padding (进行确认 → 确认),
   予以, 相关 as filler, and 服务 for help between members (帮忙 is
   help; 服务 is what a company sells). Say 搭把手, not 提供帮助服务.
   Plain 请 is allowed sparingly; most requests read better without it.
3. **No-shame framing.** Never debt/obligation vocabulary: no 欠
   ("你欠3小时" is forbidden), no 债 / 负债 / 欠款 / 应还 / 还清.
   Asking for help is never gated and never framed as owing (see
   *owed help* below).
4. **Pronouns and gender.** Chinese barely genders — use that. Drop
   the pronoun (pro-drop), or say 对方, 这位成员, 那位邻居, or repeat
   the name. **Never "TA"** (read-aloud speaks it as "T-A") and
   **never 他/她 slashes** (same problem). Generic 他 is acceptable
   only when restructuring truly fails; it rarely does.
5. **Punctuation is full-width in prose**: ，。！？：；、（）
   throughout Chinese sentences, including the enumeration comma 、
   for lists ("需求、提供、项目"). Half-width punctuation survives
   ONLY inside technical literals: URLs, file paths
   (`docs/operator-powers.md`), file extensions (.ics), codes, and
   `{{placeholders}}` themselves. Quotes: full-width curly “ ” (not
   「」 — that's the zh-Hant convention, reserved for a future
   Traditional locale). Ellipsis: the single-char … as en/es/fr/pt use
   — a deliberate UI convention over the GB/T prose norm （……）; one
   grep-able character, right width for tight strings ("正在担保…").
   Em dash: en's " — " asides usually restructure better as ，or ：or
   （）; when a true dash is wanted, use full-width —— with no
   surrounding spaces.
6. **Spacing — one rule.** Chinese text hugs its neighbors: no spaces
   around `{{braces}}` and no spaces before measure words
   ("{{count}}位成员", "还差{{need}}位担保人"). The single exception:
   when the rendered value is Latin/technical text — {{file}},
   {{origin}}, a URL, or the literal word Understoria — put one
   half-width space on each side for legibility ("已保存 {{file}} —
   打开它…"). Numbers are half-width Arabic numerals, hugging their
   unit: 5小时, never ５小时 or 五小时 in UI strings.
7. **Sentence rhythm over compression — Chinese runs ~40–60% SHORTER
   than English.** Layout will almost never be the problem; coldness
   will. A faithful warm English sentence squeezed into a four-character
   notice ("暂无数据", "操作成功") reads like a wall sign, not a
   neighbor. Prefer a natural full sentence with a subject and a verb;
   use the saved space for warmth, not silence. Nav labels and chips
   may be tight (3–5 characters); prose should breathe.
8. **"Understoria" is never translated** or transliterated. Same for
   file names, env vars, and `docs/…` paths quoted in strings.
9. **Interpolation placeholders verbatim**: `{{count}}`, `{{name}}`,
   `{{hours}}`… byte-for-byte identical (parity test enforces this).
10. **Plurals — read this twice.** Chinese CLDR collapses to `_other`
    only: there is no plural agreement, and the plural gate will demand
    nothing beyond `_other`. **BUT** the en file has `_one`/`_other`
    key PAIRS, and the parity gate requires ALL keys present in every
    locale. So translators must fill in **BOTH** forms for every plural
    family — usually with **identical text**, since Chinese needs no
    agreement ("{{count}}位担保人" works for 1 and for 40). Never
    delete a `_one` key as "unnecessary" — the parity test will fail
    the file.

## Term table

| English | Chinese | Notes / DON'T use |
|---|---|---|
| vouch for (verb) | 担保 | What a neighbor says: "我为她担保". Button: "为这位成员担保". DON'T: 背书 (political/corporate endorsement), 认证 (official certification), 推荐 (too weak), 作保 (dated legalese). |
| a vouch (the signed act) | 一份担保 | "你签署的担保", "有两位成员的担保". |
| vouches (count on trust chips) | 担保人 | One vouch = one distinct person, so count people: "已获信任（{{count}}位担保人）", "你已有{{have}}/{{need}}位担保人". Measure word 位, not 个. |
| vouched by | 由{{name}}担保 / {{name}}为你作了担保 | Pick whichever reads naturally in the sentence. |
| fully vouched | 获得社区完全信任 | Mirror es "de plena confianza". DON'T: 完全担保 (bank guarantee). |
| trust / trusted member | 信任 / 已获信任的成员 | Chip: "已获信任". Web of trust: 信任网络. DON'T: 认证用户, 信任链 (blockchain flavor). |
| seed balance | 起始时数；chip 种子：{{hours}} | Plain in prose: "每个人一开始就有5小时"。Keep the seed metaphor where en foregrounds it: "种子：{{hours}}", 种子时数 (es does the same). DON'T: 启动资金 (finance), 初始资本, 赠送额度 (promo/e-commerce — poison here). |
| hours (the currency) | 小时 | "一小时的任何帮助都等于一小时"。Credit = 时数; credit moves → "时数流动". DON'T: 积分 (loyalty points), 币 (coins/crypto), 工时 (labor administration). |
| node | 节点 | Keep the teaching gloss: "节点（你的社区共同运行的那台服务器）". RESERVED WORD: 节点 means the server and nothing else — business-speak 时间节点 for deadlines/milestones is banned (see *milestone*). DON'T: leave "node" in English; 服务器 alone only where en itself says just "server". |
| community node | 社区节点 / 你社区的节点 | Peer nodes: 友邻节点 (es "nodos aliados") — 友邻 carries the warmth. |
| exchange | 交换 | Verb: 交换帮助. Confirmed: "交换已确认". DON'T: 交易 (commerce/crypto), 兑换 (currency redemption), 互换. |
| the commons (section) | 共同家当 | 家当 is warm household register — what a neighbor calls shared belongings. A single one: 一件共同家当. DON'T: 公共财产 (state property), 公物 (institutional signage — 爱护公物), 公地 (tragedy-of-the-commons jargon), 共享资产 (sharing-economy/finance). |
| tended (commons status) | 照料中 | Chip: "照料中"; "照料中的共同家当"; prose: "由社区照料". Matches the app's care framing. DON'T: 维护中 (IT maintenance), 保养中 (cars), 管理中 (administrative). |
| retired (commons status) | 歇息中 | Deliberate non-literal, mirrors fr "au repos" / pt "em repouso": "让这件家当歇一歇" honors the no-shame lifecycle (it can come back). DON'T: 退役 (military/sports), 报废 (scrapped), 停用 (IT), 淘汰 (eliminated — shame). Distinct from 已归档 (archived). |
| In my care (nav) | 我照看的 | Four characters, nav-safe, keeps the care framing. Prose: "会在“我照看的”里找到它。" DON'T: 我的任务 (flattens care to tasks), 我的工作, 待办 (todo-app register). |
| Grow another root (add-a-server flow) | 再扎一条根 | 扎根 is the natural taking-root idiom; mirrors es "Hacer crecer otra raíz". DON'T: 添加服务器, 部署新节点 (both flatten the metaphor to IT). |
| timebank | 时间银行 | The established Chinese term — verified fit: it's what mainland community timebank programs actually call themselves, and readers recognize it instantly. Keep it, and keep the SURROUNDING prose non-bank ("在时间银行里，求助永远不设门槛"). DON'T: 时间存折 (passbook — more bank, not less), 互助银行. |
| mutual aid | 互助 | "互助时数"; the set phrase 邻里互助 is exactly our register. DON'T: 慈善 (charity — hierarchical), 志愿服务 (volunteerism officialese), 公益 (philanthropy sector). |
| board | 公告栏 | Nav: "公告栏" — the physical bulletin board every residential compound has; instantly familiar. First-use gloss: "社区的公告栏". DON'T: 论坛 (forum), 看板 (kanban/signage), 布告栏 (dated — 布告 is an official proclamation), 版块. |
| dashboard | 总览 | No board/dashboard collision in Chinese (board = 公告栏), so no French-style workaround needed; 总览 is the plain overview word. DON'T: 仪表盘 / 仪表板 (car/BI jargon), 面板 (control panel), 首页 (home). |
| needs | 需求 | Tab/chip: "需求". DON'T: 求助 (distress flavor — 求 begs), 需要 (reads as a verb). |
| offers | 提供 | Tab: "提供"; prose: "提供的帮助". 分享 is RESERVED for the share action (share a link/invite) — using it here would collide. DON'T: 服务 (banned register, rule 2), 供给 (economics), 分享 (collision). |
| projects | 项目 | |
| post (noun) | 启事 | The corkboard word — 寻物启事, 招领启事 — exactly this register. "一条启事". DON'T: 帖子/帖 (forum/social media), 发布内容 (cold CMS-speak), 信息 (vague). |
| post (verb) | 贴出 | Sticks the notice on the board: "贴出一条需求". 发布 acceptable in technical contexts (sync explanations). DON'T: 发帖 (forum). |
| claim (a post/task) | 认领 | "认领这项任务", "已由{{name}}认领" — 认领 carries taking-into-your-care warmth and matches the nav framing. DON'T: 抢单 (gig-economy grab), 接单 (delivery apps), 申领 (bureaucratic). |
| shift | 时段 | "报名一个时段", "你在这个时段". DON'T: 班次 (factory/bus), 排班 (HR scheduling), 值班 (on-duty). |
| sign-up (for a shift) | 报名 | Verb and noun; "取消报名". Keep this family for shifts ONLY (see RSVP). |
| RSVP | 答复（是否参加） | Heading: "告诉大家你是否参加"; "你的答复：{{status}}", "更改答复", "撤回答复", "已答复的成员". 答复 chosen over 回复 because 回复 is message replies in the conversation UI — a real collision. DON'T: keep "RSVP", 报名 (collides with shifts), 出席登记 (bureaucratic). |
| proposal | 提议 | Page: "提议"; "社区提议". DON'T: 提案 / 议案 (parliamentary), 方案 (a plan, not a proposal to decide on). |
| affirm (a proposal) | 赞同 | Button "赞同"; count: "{{count}}个赞同". Consensus register, not admin. Block stays 阻止. DON'T: 批准 (administrative approval), 点赞 (social-media like), 同意 (terms-of-service click-through). |
| removal (of a member) | 移出 | "将一位成员移出社区" — honest, not shame-laden. DON'T: 开除 (fired), 驱逐 (expulsion), 封禁 (forum ban), 除名 (blacklist shame), 拉黑. |
| removal ceremony | 移出仪式 | The co-signing ritual; keep 仪式 — it is deliberate in en. |
| founder | 发起人 | The community-organizing word: "发起这个社区的人". Naturally genderless. DON'T: 创始人 (startup register), 群主 (chat-group owner), 站长 (webmaster). |
| co-founder | 共同发起人 | Ceremony: "共同发起仪式". |
| guardian (shard holder) | 守护人 | "由守护人找回账户", "请你信任的成员做守护人". Naturally genderless. DON'T: 监护人 (legal guardianship of minors — same trap as fr "tuteur"), 保管人 (custodial/legal), 管理员. |
| recovery kit | 恢复包 | Gloss on first use: "恢复包（用来找回账户的那份备份）". Account-recovery verb is 找回 ("找回你的账户"). DON'T: 急救包 (first aid), 恢复出厂 (factory-reset confusion), 备份文件 (flattens the promise). |
| pairing / to link a device | 关联设备 | The flow: "关联新设备". DON'T: 配对 (Bluetooth jargon — same trap as fr "appairage"), 绑定 (e-commerce account-binding, coercive tone), 同步 (different concept). |
| linked device | 已关联的设备 | |
| invite (noun) | 邀请 | Verb also 邀请 — "邀请一位你认识的人". Inviter: "邀请你的人". |
| panic (the emergency wipe) | 危急 family | "危急选项", "危急按钮"; gloss on first use: "遇到危险时立即抹除数据". Wipe = 抹除. DON'T: 恐慌 (a clinical state, not a feature), bare 紧急 (the Emergency section is already 紧急情况). |
| read aloud (feature) | 朗读 | Toggle title: "朗读"; verb 朗读. DON'T: 语音合成 / 文字转语音 (tech spec, not the promise), 语音播报 (station announcements). |
| seed vault | 种子库 | Svalbard is 斯瓦尔巴全球种子库 in Chinese — the resonance is exact. "这台设备是一座种子库——保存着社区的完整档案。" DON'T: 保险库 (bank vault), 备份服务器 (flattens the metaphor). |
| storm hub | 风雨驿站 | 驿站 is the warm community-station word (爱心驿站); 风雨 evokes the storm and the idiom 风雨同舟 — in the same boat through the storm. DON'T: 风暴中心 (the meteorological storm's center — same trap fr/pt dodged), 避难所 (disaster-refugee register), 枢纽 (transport hub). |
| One small thing | 一件小事 | Button: "给我看一件小事". A natural, disarming idiom — DON'T inflate to 一个小任务. |
| Ways to plug in | 参与的方式 | Mirrors es "Formas de participar". DON'T: 加入我们 (recruiting page), 贡献指南 (open-source flavor), 志愿服务 (officialese). |
| organizer | 组织者 | Prose: "组织这次活动的人". Naturally genderless. DON'T: 管理员, 负责人 (cadre-in-charge), 主办方 (corporate events). |
| member | 成员 | **Never 会员** — in Chinese apps 会员 means PAID membership (会员充值), the worst possible register here. Never 用户 (user). 成员, always. |
| neighbor | 邻居 | Decided: 邻居 for people ("邻居们"); 邻里 only for the collective/adjectival ("邻里互助", "邻里之间") — it names the relationship, not a person. DON'T: 街坊 (regional flavor — warm but inconsistent), 业主 (property owner — homeowners-committee register). |
| display name | 昵称 | "你的昵称（欢迎使用化名）" — 昵称 is what every Chinese app calls this field; zero formality, pseudonym-friendly by nature. DON'T: 用户名 (username), 显示名称 (IT-literal, cold), 网名. |
| owed help | 待确认的帮助 | Badge: "待确认"; "{{hours}}小时等你确认". Deliberately NOT 欠 / 欠下的帮助 / 人情债 — the app refuses debt framing (register rule 3). |
| dispute | 争议 | Page: "争议"; status: "社区共同商议中" (short chip: "商议中"). DON'T: 纠纷 (legal disputes), 投诉 (customer-service complaint), 举报 (report/denounce — surveillance register, absolutely not). |
| milestone | 里程碑 | "达成里程碑". DON'T: 节点 (reserved for the server — 时间节点 is banned outright), 阶段 (just a stage). |
| operator (appears near node) | 运行者 | "为社区运行服务器的人成为运行者……" — plain and transparent; powers-and-limits framing. DON'T: 管理员 (admin — contradicts the no-admins framing), 运营者 (commercial operations), 运维 (IT jargon), 站长. |

## Quick self-check for translators

- Would a neighbor say this out loud across a kitchen table? If not,
  redo it.
- `grep` for 您 — must be zero hits. Same for 亲, 温馨提示, 请您.
- `grep` for 欠 and 债 — zero hits; owed help is 待确认的帮助.
- `grep` for 会员 and 用户 — zero hits; members are 成员.
- `grep` for TA and 他/她 — zero hits; pro-drop or 对方 instead.
- `grep` for 时间节点 — zero hits; 节点 only ever means the server.
- Chinese sentences use full-width ，。！？：；、“” — half-width
  punctuation only inside URLs, file paths, codes, and `{{…}}`.
- No spaces around `{{braces}}` unless the value renders Latin text
  (rule 6); numbers are half-width and hug their unit (5小时).
- `{{…}}` placeholders identical to en; every `_one` key present and
  filled (usually identical to `_other`) — never deleted (rule 10).
- If a string reads like a wall notice (four-character officialese),
  it's too compressed — write the sentence (rule 7).
- "Understoria" untouched.
