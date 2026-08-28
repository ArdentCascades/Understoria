# Arabic (ar) translation glossary

Reference for every bulk-translation and review pass over `ar.json` and
the Arabic content modules. Decisions here get applied ~2,900 times —
when in doubt, pick the word an Arabic-speaking neighbor would say
across a kitchen table, not the word a government circular (تعميم), a
bank SMS, or a ministry form would use.

**Locale code is `ar`** (language-only): browsers send `ar`, `ar-EG`,
`ar-SA`, `ar-MA`…, and i18next's language-only fallback resolves them
all. One `ar` serves the Levant, the Gulf, Egypt and Sudan, the
Maghreb, and the worldwide diaspora. No single dialect covers that
audience, so the register is the pan-Arab written middle — see rule 1.
**Urdu (`ur`) is a separate future locale** with its own glossary, not
a conversion target. **Arabic is the app's first right-to-left
language**: the layout side is already done (docs/rtl-plan.md R1–R3,
verified before this file was written, deliberately) — translators
never write directional markup; see rule 13 before touching any string
with Latin fragments in it, and rule 12 before anything with a
`{{count}}`.

## Global register decisions

1. **Warm plain فصحى — the pan-Arab middle register, never the
   official one.** Dialects would be warmer but fragment the audience
   (Egyptian, Levantine, Gulf and Maghrebi members all read one file),
   so the base is Modern Standard Arabic — but the *simple, spoken-
   adjacent* MSA of a good pan-Arab explainer (اللغة البيضاء), not
   news-bulletin or ministry Arabic. Short sentences; nominal
   sentences welcome; everyday words. Banned outright: يُرجى التكرم،
   نحيطكم علماً، تجدر الإشارة إلى، وذلك من خلال، حيث أنه، القيام بـ +
   masdar padding (القيام بالتحقق → التحقق), اللازمة/المعنية as
   filler, and مستخدم عزيزي / عزيزي العضو openers. A dialect word is
   admitted exactly once per concept as a warm nod in teaching prose
   where this file says so (see the work-day row) — never as the term.
2. **Address: singular أنت, written so the script stays
   gender-neutral.** Arabic inflects the second person for gender, but
   the unvocalized script hides most of it — and the translation
   leans on that deliberately, in order:
   (a) **Prefer suffix-pronoun constructions**, which read correctly
   for every member: لك، لديك، عليك، منك، يمكنك، اسمك، ساعاتك
   (the written form covers كَ and كِ alike).
   (b) **Buttons take the masdar**, the standing Arabic UI convention
   (Google, Apple, Telegram all do this): «حفظ»، «إرسال»، «مشاركة»،
   «تولّي المهمة» — gender-free by construction, and the exact
   parallel of the Russian infinitive rule.
   (c) Where an instruction genuinely needs a verb aimed at the
   member, the bare unvocalized form (اكتب، اختر، تحقق) is the
   standing product convention — accept it rather than invent forms.
   (d) **Never slashed or bracketed gender forms** (اكتب/ي،
   المستخدم(ة)) — they garble read-aloud (`lib/speak.ts`) and screen
   readers, and the parenthesis reads as an afterthought aimed at
   half the membership.
3. **Who is speaking.** (a) Buttons: masdar (rule 2b). (b) When the
   APP speaks, prefer no first person — Arabic nominal sentences do
   this naturally («تم الحفظ» is banned officialese though — say
   «حُفظ» or «محفوظ»; «سيصل عندما تعود الشبكة») — or name the real
   actor: التطبيق، الخادم، المجتمع. (c) **Corporate «نحن» is banned
   as the app's voice** — a "we" with no company behind it is a lie.
   It survives only where en itself unmistakably speaks as the people
   who made the software (the translation-honesty note). A "we" that
   includes the member is «كلنا» / «المجتمع كله».
4. **No-shame framing — the debt ban.** Never debt vocabulary for
   exchanges: no دَين، مديون، سداد، تسديد، استحقاق، ذمّة، تحصيل
   («عليك ٣ ساعات للمجتمع» is forbidden — عليك in the owing sense is
   exactly the trap, even though عليك as "you should" is fine).
   **قرض and ائتمان are banned everywhere**; en's "credit" is rendered
   as ساعات or حُسبت (see the hours row). Debt words may appear ONLY
   where en itself explicitly rejects debt framing ("this is not a
   loan" → «هذا ليس دَيناً ولا قرضاً»). Owed help is «بانتظار
   تأكيدك», never owed anything.
5. **Charity and hierarchy — banned as framing.** Help between
   members is مساعدة/عون between equals, never charity flowing
   downhill: no صدقة، إحسان، تبرع، أعمال خيرية، إغاثة (disaster-NGO
   register), and no تطوع/متطوع (the volunteering sector — helpers
   are مساعدون, neighbors who helped, not volunteers-as-institution).
   The app's voice is also confessionally neutral: members write
   however they speak, but app strings never carry formulaic
   religious phrases (إن شاء الله، جزاك الله خيراً) — the software
   serves Arabic speakers of every faith and none.
6. **Politically- and security-marked vocabulary — the standing ban
   list.** This locale serves members for whom these words are not
   abstractions. Banned: **تنظيم** for any group (in current news
   Arabic THE word for militant organizations — the community is
   مجتمع, full stop); bare **جماعة** as the community word (Islamist-
   group collision; جيران and مجتمع cover it); **خلية** for any
   team/group (militant cell); **عملية** for exchanges or actions
   (military/security operation — an exchange is تبادل); **عميل** for
   anything (customer AND informer/traitor — a double poison; members
   are أعضاء); **نقطة تفتيش** for checkpoints/milestones (a real
   checkpoint in too many members' lives — a milestone is محطة);
   **ملجأ/مخبأ** for the storm hub (air-raid and displacement
   register); **الطوارئ** as a feature name (state-of-emergency law
   register — قانون الطوارئ; the panic feature is «الخطر الداهم» and
   urgent things are عاجل); **تطهير** for any wipe or cleanup (the
   ethnic-cleansing collision is immediate — wiping data is محو);
   **تجنيد** for inviting/onboarding (military recruitment);
   **سخرة** anywhere near work days (forced labor); **كفالة/كفيل**
   for vouching or guardians (the kafala sponsorship system — see the
   vouch row). Prefer **أمان** (personal safety) over **أمن** (state
   security) wherever en says "safety"/"security" about members.
7. **Gender — third persons.** (a) Prefer constructions that don't
   force agreement: nominal framings («هذه المهمة مع {{name}}»،
   «ردّه: {{status}}» → restructure to «الرد: {{status}}»), or repeat
   the name; (b) «هذا العضو»، «أحد الجيران»; (c) where verb agreement
   is unavoidable, the unmarked masculine is the standing Arabic
   product convention («{{name}} يتولاها») — accept it rather than
   invent forms; (d) rule 2d applies: never slashed forms. عضو، جار،
   مساعد، أمين as unmarked generics cover everyone; marked feminine
   forms (عضوة، جارة) appear only in free text a member wrote about
   themselves.
8. **Loanword policy — three tiers.** (a) Proper nouns, codes and
   technical literals stay in Latin script verbatim: Understoria,
   QR (as «رمز QR»), Wi-Fi, VPN, URL, email addresses, file paths,
   env vars, `.ics`. (b) Established Arabic tech words win over
   coinages: تطبيق (app), خادم (server — the everyday Arabic word;
   never سيرفر), حساب (account), ملف شخصي (profile), كلمة المرور،
   عبارة المرور، متصفح، جهاز، زر، رمز، تقويم، كاميرا، مزامنة، قالب،
   مشروع، إشعار. (c) Where a natural everyday Arabic word exists it
   wins over the loan: مساعدة not هيلب, لوحة not بورد, مهارات not
   سكيلز. The test is always "which word would the neighbor actually
   write in a note" — not maximal Arabic, not maximal English.
9. **Punctuation and typography — Arabic conventions,
   consistently.** The Arabic comma «،», semicolon «؛», and question
   mark «؟» accompany Arabic text — never their Latin twins inside an
   Arabic sentence. Quotes are guillemets «…». Ellipsis is the single
   char …. Headings, buttons and chips take no terminal punctuation,
   as in en. The tatweel (ـ) is never used for emphasis or padding.
   Hamza and taa marbuta are written correctly and consistently
   (إرسال not ارسال; مهمة not مهمه) — one spelling per word file-wide,
   because read-aloud and every grep in the self-check depend on it.
10. **Digits are Western (0–9) in hand-written strings.** The Maghreb
    and much of the web write Western digits; interpolated values
    ({{count}}, {{hours}}) arrive as Western digits from the runtime;
    mixing ٣ and 3 in one sentence is worse than either convention.
    So: hand-written digits are Western, and numbers that flow through
    `Intl` must be checked at the call site during the fleet — bare
    `Intl.NumberFormat("ar")` produces Eastern digits (٣) and would
    mix; pin `ar-u-nu-latn` there or format with the page's
    conventions consistently. Clock times and dates render via `Intl`,
    never hand-formatted.
11. **"Understoria" is never translated** or transcribed (never
    أندرستوريا). Same for file names, env vars and `docs/…` paths
    quoted in strings.
12. **Plurals — SIX forms, every family; the richest system the app
    ships. Read this twice.** Arabic CLDR needs `_zero`, `_one`,
    `_two`, `_few`, `_many`, `_other`:
    - **`_zero`** — 0. Write it as the natural negative clause: «لا
      ساعات بعد», «لا رسائل جديدة» — not «0 ساعة».
    - **`_one`** — exactly 1. The singular noun carries the count:
      «ساعة واحدة», «عضو واحد».
    - **`_two`** — exactly 2. The DUAL carries the count: «ساعتان»,
      «عضوان», «مهمتان» — never «2 ساعة».
    - **`_few`** — 3–10 (and 103–110…): number + PLURAL noun:
      «{{count}} ساعات», «{{count}} أعضاء».
    - **`_many`** — 11–99 (and 111–199…): number + SINGULAR noun:
      «{{count}} ساعة», «{{count}} عضواً».
    - **`_other`** — 100, 101, 102… and fractions: number + singular:
      «{{count}} ساعة».

    **The `{{count}}` variable in `_zero`/`_one`/`_two`:** correct
    Arabic omits it — the category itself pins the exact number (zero
    is 0, one is 1, two is 2; nothing can lie). The interpolation-
    parity gate sanctions exactly this: a plural category that
    matches only a single integer may drop `{{count}}`; every other
    category must carry it verbatim. Never re-add «({{count}})» after
    a dual to satisfy a gate — the gate already understands.

    Every English `_one`/`_other` pair therefore becomes SIX ar keys.
    Write each form as a WHOLE sentence that reads correctly for its
    entire class — verbs and adjectives agree too. Memorize the
    workhorses: ساعة/ساعتان/ساعات؛ دقيقة/دقيقتان/دقائق؛ يوم/يومان/
    أيام؛ عضو/عضوان/أعضاء؛ مهمة/مهمتان/مهام؛ رسالة/رسالتان/رسائل؛
    تبادل/تبادلان/تبادلات؛ اقتراح/اقتراحان/اقتراحات. Test every
    family aloud at 0, 1, 2, 3, 11 and 100.
13. **Right-to-left mechanics — what translators do and don't do.**
    The layout mirrors by itself (docs/rtl-plan.md; CSS logical
    properties plus `dir` from the registry) — translators NEVER add
    directional markup. **Unicode directional control characters
    (U+200E LRM, U+200F RLM, U+2066–U+2069) are banned in strings**:
    they are invisible, they break greps, diffs and read-aloud, and
    almost every case that seems to need one is really a word-order
    problem. A Latin fragment (Understoria, QR, a URL, an env var)
    sits fine inside an Arabic sentence under the Unicode bidi
    algorithm; if a particular string genuinely renders scrambled,
    restructure the sentence so the Latin run isn't flanked by weak
    characters (punctuation, digits) — move it to the end, or give it
    Arabic words on both sides. Trailing Latin punctuation jumping to
    the far side happens only in the dev pseudo-locale (English text
    in RTL), never with real Arabic text — do not "fix" what the
    preview shows.

## Term table

| English | Arabic | Notes / DON'T use |
|---|---|---|
| mutual aid | التعاضد | Kropotkin's book circulates in Arabic as «التعاضد» — lean into the lineage, as ru does with взаимопомощь: «ساعات التعاضد». التعاون and التكاتف welcome in warm prose. DON'T: تكافل (Islamic-finance/insurance market register today), صدقة / إحسان (charity — hierarchical, rule 5), تطوع (volunteerism sector), إغاثة (disaster-relief NGO). |
| timebank | بنك الوقت | The established pan-Arab term — Arabic timebank initiatives use it themselves. Keep the SURROUNDING prose non-bank: «في بنك الوقت، طلبُ المساعدة لا يُشترط له شيء». DON'T: مصرف الوقت (more bank, not less), رصيد الوقت (a balance, not the institution). |
| hours (the currency) | ساعات | «ساعة من أي مساعدة تساوي ساعة». "Credit" never becomes قرض/ائتمان (rule 4): "credited" → «حُسبت», "the credit moves" → «تنتقل الساعات». The member's balance is «ساعاتك» — **رصيد is bankish; dodge it** («رصيدك» only where nothing else reads naturally, never «رصيد دائن»). Forms per rule 12: ساعة/ساعتان/ساعات. DON'T: نقاط (loyalty points), عملات (coins/crypto), أرصدة. |
| seed balance | بذور البداية | Keep the metaphor as es/hi/vi/ru do: «ساعاتك الآن هي بذور بدايتك». Chip: «البذور: {{hours}}»; plain in teaching prose: «كل عضو يبدأ بخمس ساعات». DON'T: رأس مال (capital), رصيد افتتاحي (bank-account opening), هدية / مكافأة (promo register — poison here). |
| vouch for (verb) | يزكّي | The character-vouch word Arabic actually uses (زكّاه جيرانه؛ فاز بالتزكية): «أنا أزكّيه». Button (masdar, rule 2b): «تزكية {{name}}». DON'T: **كفالة / كفيل** (the kafala sponsorship system — an exploitative-labor register this app must never speak in, rule 6), ضمان (bank guarantee), توصية (HR reference), تعريف (ID-vouching officialese). |
| a vouch (the signed act) | تزكية | «تزكيتك الموقَّعة», «يلزم تزكيتان من عضوين موثوقين» (mind the dual). DON'T: شهادة (certificate/diploma collision, plus court testimony), ضمانة. |
| vouches (count on trust chips) | {{count}} زكّوه → count people | One vouch = one distinct person, so count people: «موثوق (زكّاه {{count}} من الأعضاء)», «زكّاك {{have}} من {{need}}». Follow rule 12's classes. |
| trust / trusted member | ثقة / عضو موثوق | Chip: «موثوق». Web of trust: شبكة الثقة. DON'T: موثَّق (notarized/verified officialese), معتمد (accredited), مُصادَق عليه. |
| node | خادم المجتمع | The teaching gloss IS the term: «خادم المجتمع (جهاز مشترك يديره مجتمعك بنفسه)»; bare الخادم once context is set. خادم is the everyday Arabic word for a server. DON'T: **عقدة** (the CS calque — its first reading is a psychological complex, عقدة نفسية; fatal collision), نود, سيرفر (slang). |
| community node / peer nodes | خادم مجتمعك / خوادم صديقة | «الخوادم الصديقة» mirrors es "nodos aliados" and ru «дружественные узлы». DON'T: خوادم نظيرة (P2P jargon), خوادم شريكة (business partners). |
| federation | مجتمعات صديقة مترابطة | Prefer the rephrasing in prose: "across the federation" → «بين المجتمعات الصديقة». Where a bare noun is unavoidable: «شبكة المجتمعات». DON'T: **فدرالية / اتحاد فدرالي** (live constitutional-politics vocabulary in several member countries), اتحاد (states and football clubs), تحالف (military alliance), **تنظيم** (rule 6). |
| exchange | تبادل | «تبادل المساعدة»; confirmed: «تم تأكيد التبادل» → better «تأكّد التبادل». Forms: تبادل/تبادلان/تبادلات. DON'T: صفقة (a deal), معاملة (bank transaction), **عملية** (military/security operation — rule 6). |
| the commons (section) | المشاع | The classical word for jointly-held land and things — exact, warm, alive: section «المشاع»; prose «هذا مِلك المجتمع كله، مشاعٌ بينكم»; one item: «من المشاع». DON'T: ملكية عامة (state property), موارد المجتمع (NGO-workshop register), أملاك (estates). |
| tended (commons status) | في الرعاية | Chip: «في الرعاية»; prose: «في رعاية المجتمع». DON'T: صيانة (IT/building maintenance), تحت الإدارة (managed — administrative), قيد التشغيل (ops). |
| retired (commons status) | في راحة | Deliberate non-literal, mirrors fr "au repos" / ru «на отдыхе»: «أُرسل إلى الراحة» honors the no-shame lifecycle (it can come back). DON'T: متقاعد (pension register), مُلغى (cancelled — final), محذوف (deleted), خارج الخدمة (out-of-service sign). |
| In my care (nav) | في رعايتي | The care framing, exactly: «هذا في رعايتي». Toast: «صار في «في رعايتي»». DON'T: مهامي (task-manager — flattens care to tasks), **عهدتي** (stores-custody register — the workplace عهدة form), مسؤولياتي (burden-heavy). |
| Grow another root (add-a-server flow) | مدّ جذراً جديداً | The taking-root metaphor survives beautifully: «مُدّوا جذراً آخر فلا يبقى للمجتمع جذع واحد». DON'T: إضافة خادم, نشر خادم (both flatten the metaphor to devops). |
| board | اللوحة | Nav: «اللوحة»; first-use gloss: «لوحة إعلانات المجتمع» — the cork board every building entrance and mosque courtyard has. DON'T: منتدى (forum), **الحائط / الجدار** (the Facebook wall in Arabic — total collision), خلاصة (feed), بورد. |
| dashboard | نبض المجتمع | Nav: «النبض» — the community's heartbeat, warm and short, mirrors ru «Пульс». DON'T: **لوحة التحكم** (control panel — contradicts no-admins), لوحة القيادة (cockpit/leadership), الرئيسية (home). |
| needs | طلبات المساعدة | Tab: «الطلبات» (paired with «العروض», which disambiguates); a need in prose: «طلب مساعدة». طلب is the everyday ask-word, not a support ticket, in Arabic. DON'T: احتياجات (needs-assessment survey register), متطلبات (requirements), حاجة as the term (العَوَز destitution shading). |
| offers | عروض المساعدة | Tab: «العروض»; in prose ALWAYS the full «عرض مساعدة» — bare عروض alone is shop-sale vocabulary (تخفيضات وعروض), a real e-commerce collision the pairing with «الطلبات» avoids on the tab but prose must not. DON'T: صفقات, خدمات (services a company sells). |
| post (noun) | إعلان | The notice on the notice board — the metaphor closes itself: «إعلان على اللوحة». DON'T: منشور (social-media post/leaflet — the Facebook word), مشاركة (share — collides with the share verb), بوست. |
| post (verb) | علّق على اللوحة | What one does with a paper notice — hang it: «علّق إعلانك على اللوحة». Neutral إرسال in technical contexts. DON'T: نشر (publish/press register — and منشور adjacency), رفع (upload). |
| claim (a post/task) | تولّى | Taking it into one's care: button «تولّي هذه المهمة» (masdar), prose «{{name}} يتولاها» (present tense, rule 7). DON'T: **المطالبة** (legal claim), حجز (booking), استلام (parcel receipt), أخذ (flat). |
| project | مشروع | The everyday word. Forms: مشروع/مشروعان/مشاريع. DON'T: مبادرة (NGO-speak), مخطط (scheme/blueprint). |
| task | مهمة | «مهمة صغيرة واحدة» — everyday and warm. Forms: مهمة/مهمتان/مهام. DON'T: واجب (homework/duty), **تكليف** (assignment from authority — military service register), شغل (labor flavor). |
| template | قالب | «ابدأ من قالب», «القوالب». Established and neutral. DON'T: نموذج (a paper form — the government-window word), مخطط. |
| work day | يوم العون | «يوم العون — {{project}}», «تحديد يوم عون»; gloss on first use: «يوم يجتمع فيه الجيران على عمل واحد». Teaching prose MAY nod once to the beloved regional names — الفزعة في الخليج، التويزة في المغرب الكبير، النفير في السودان، العونة في الشام — the way hi honors श्रमदान; they are exactly this concept and carry none of субботник's shadow, but none of them can be THE term for all regions at once. DON'T: يوم عمل (an HR working day), ورشة (workshop — NGO register), **سخرة** (forced labor — rule 6). |
| shift | مناوبة | «سجّل اسمك في المناوبة», «أنت في هذه المناوبة» — the everyday pharmacy/clinic rotation word. DON'T: **نوبة** (first reading نوبة قلبية — a heart attack; fatal collision), وردية (factory floor), دوام (office hours). |
| sign-up (for a shift) | سجّل اسمك | The paper sign-up-sheet phrase: «سجّل اسمك في المناوبة», «امسح اسمك». Keep this family for shifts ONLY (see RSVP). DON'T: التسجيل (registration officialese when bare), تقديم طلب (application to authority). |
| RSVP | أخبر الجميع إن كنت ستأتي (always the full clause) | Heading: «هل ستأتي؟»; «ردّك: {{status}}», «تغيير الرد». Bare رد alone is message replies; سجّل اسمك is shifts — both real collisions, so RSVP always carries الحضور/ستأتي. DON'T: keep "RSVP" (opaque in ar), تأكيد الحضور (conference badge-desk register), التسجيل. |
| rota (care rota) | التناوب على الرعاية | The by-turns phrase: «الحي كله يتناوب على الرعاية». A rota slot: «دورك» («جاء دورك» is warm and idiomatic). DON'T: جدول المناوبات (duty-roster officialese), نظام الورديات (HR). |
| proposal | اقتراح | Page: «الاقتراحات»; «اقتراح للمجتمع». RESERVED: bare اقتراح only ever means a governance proposal (offers are always «عرض مساعدة»). Forms: اقتراح/اقتراحان/اقتراحات. DON'T: قرار (a decision handed down), عريضة (petition to authority), مذكرة (memo). |
| affirm (a proposal) | تأييد | Button «تأييد»; count: «أيّده {{count}} من الأعضاء» — standing with it, consensus register. Blocking a proposal: «إيقاف» — keeps حظر reserved for contacts. DON'T: موافقة (approval from authority), تصويت (parliamentary voting), مصادقة (ratification), إعجاب (a like). |
| block (a contact) | حظر | The universal app word (WhatsApp and Telegram Arabic use it): «حظر جهة الاتصال», «رفع الحظر». RESERVED for contacts; a proposal is إيقاف (previous row). DON'T: قائمة سوداء (blacklist — heavier shame register), طرد. |
| flag (an exchange/comment) | عرض على المجتمع | The community-review framing with no informer register: «شيء غير سليم؟ اعرضه ليراجعه المجتمع معاً», chip «قيد المراجعة معاً». DON'T: **إبلاغ / تبليغ** (report-to-the-authorities — exactly the register this app refuses), **وشاية** (informing — never), شكوى (complaint to authority), الإبلاغ عن إساءة (platform-moderation boilerplate). |
| dispute | خلاف | Page: «الخلافات» — honest and no-shame; status: «المجتمع يتفاهم معاً» (short chip: «قيد التفاهم»). DON'T: نزاع (legal dispute — court register), قضية (a court case), شكوى (complaint), صراع (conflict/struggle — escalation). |
| removal (of a member) | إخراج من المجتمع | «إخراج عضو من المجتمع» — honest, heavy, not shame-laden. DON'T: **طرد** (expulsion — the school-and-work shame word), فصل (firing/expulsion), حذف (deleting a person like a file), إقصاء (political exclusion), نفي (exile). |
| removal ceremony | الوداع | Keep the ritual — it is deliberate in en: «وداع {{name}}», prose «لحظة وداع يقفها المجتمع بكرامة». DON'T: مراسم (official/funeral protocol), طقس (liturgy flavor, and weather collision in several dialects), إجراء (paperwork — flattens it). |
| reinstatement | العودة | «عودة {{name}}» — the door reopening; verb: «رحّب المجتمع بعودة {{name}}». استعادة is RESERVED for account recovery (below), so member return never uses it. DON'T: رد الاعتبار (legal rehabilitation — court register), إعادة قبول (readmission paperwork). |
| member | عضو | The unmarked generic covers everyone (rule 7): «هذا العضو». Forms: عضو/عضوان/أعضاء. DON'T: مستخدم (user), **عميل** (customer AND informer/agent — double poison, rule 6), زبون (customer), مشترك (subscriber). |
| neighbor | جار | «جيرانك»; collective warmth: «أهل الحي» — the neighborhood is Arabic's natural mutual-aid unit. DON'T: سكان (residents — municipal register), مواطنون (citizens — state address), أفراد (individuals — clinical). |
| community | مجتمع | The standard word, warmed by context («مجتمعك», «المجتمع كله»). DON'T: **تنظيم** (militant-organization register — rule 6, absolute), **جماعة** bare (Islamist-group collision), طائفة (a sect), مؤسسة (an institution), كيان (entity — political euphemism). |
| invite (noun + verb) | دعوة / دعا | «ادعُ شخصاً تعرفه», «من دعاك». Button: «دعوة صديق» (masdar rule). DON'T: رابط إحالة (referral — growth-hacking register), استقطاب (recruitment flavor), **تجنيد** (rule 6). |
| guardian (shard holder) | أمين | RESERVED WORD: أمين only ever means a recovery-shard holder — the entrusted-keeper word (أمين المكتبة، أمين السر): «اختر أعضاء موثوقين أمناءَ لمفتاحك»; gloss on first use: «الأمناء — يحفظ كل واحد منهم قطعة من مفتاح عودتك». Forms: أمين/أمينان/أمناء. DON'T: **وصي** (LEGAL guardianship of minors — the courtroom trap, same as fr "tuteur" and ru «опекун»), **كفيل** (kafala — rule 6), حارس (a guard — security register). |
| recovery kit | عدة الاستعادة | Built on the established استعادة الحساب (the Google-ar convention); the warm verb: «استرجع حسابك» / «عُد إلى حسابك». RESERVED: استعادة only ever means account recovery. DON'T: إنعاش (resuscitation), نسخة احتياطية (flattens the promise to a backup), طقم إنقاذ. |
| passphrase | عبارة المرور | Built on the universally-known كلمة المرور; gloss on first use: «عبارة المرور (كلمة مرور طويلة من عدة كلمات)». DON'T: العبارة الاسترجاعية / عبارة البذور (crypto-wallet register — and a fatal collision with OUR seed metaphor), الرمز السري (bank-card PIN). |
| ledger | سجل المجتمع المشترك | The shared record book: «قُيّد في سجل المجتمع المشترك». The device-local record is «دفتر هذا الجهاز (قيده الخاص)» — دفتر is the warm notebook word; rule 4 still bans debt. DON'T: **دفتر الديون** (debt book — never), سجل تجاري (commercial registry), دفتر أستاذ (accounting ledger — bookkeeping officialese). |
| split your key (guardians) | قسمة المفتاح | «اقسم مفتاحك بين أعضاء موثوقين»; a shard: «قطعة من المفتاح». DON'T: تجزئة (dev jargon), شظية (shrapnel — a war word; the shard is a قطعة). |
| milestone | محطة | The journey word — «محطة قطعناها», «محطة جديدة للمجتمع». DON'T: **نقطة تفتيش** (a real checkpoint — rule 6), هدف محقق (KPI register), معلم (landmark — also "teacher" without vowels; ambiguous). |
| helper (person in an exchange) | مساعد | «حُسبت الساعات للمساعد»; prose: «من قدّم المساعدة». **متطوع is banned** (rule 5) — helping here is neighbors helping each other, never volunteering-as-institution. DON'T: منفذ (gig-platform executor), عامل (laborer), مقدم الخدمة (service provider — poison). |
| skills | مهارات | «مهاراتك», prose «ما تجيد فعله» — the everyday word. DON'T: مؤهلات (CV qualifications), كفاءات (corporate competences), خبرات as the field name (experience — inflates). |
| panic (the emergency wipe) | الخطر الداهم | Heading «الخطر الداهم»; gloss on first use: «إن كان الخطر على الباب — امحُ كل شيء من هذا الجهاز فوراً». Wipe = «محو كل شيء»; purge = «محو» («محو كامل», «محو خفيف»). The urgent-help section elsewhere is «عاجل», never الطوارئ. DON'T: **الطوارئ** (emergency-law register — rule 6), زر الهلع (clinical panic), **تطهير** (rule 6 — never for any wipe), مسح أمني (security-sweep flavor). |
| read aloud (feature) | القراءة بصوت مسموع | What a family member does for someone who can't read the screen — exactly the promise: toggle «القراءة بصوت مسموع», «يقرأ التطبيق بصوت مسموع». DON'T: تحويل النص إلى كلام (the TTS spec, not the promise), المساعد الصوتي (voice assistant — a different product), دبلجة. |
| seed vault | مخزن البذور | Svalbard reaches Arabic news as «قبو سفالبارد العالمي للبذور», but مخزن is the granary word and keeps our metaphor warm: «هذا الجهاز مخزن بذور — يحفظ تاريخ المجتمع كاملاً». DON'T: خزنة (bank safe), قبو (a cellar/bunker alone), خادم احتياطي (flattens the metaphor). |
| storm hub | البيت المضيء | The lit house in the dark street — the coming-toward-the-light warmth ru found in «огонёк», without the storm's-own-center trap: «بيت فيه كهرباء وإنترنت حين ينقطعان عن الجميع — بيت مضيء يقصده الجيران». Short: «البيت المضيء». Requires its first-use gloss. DON'T: مركز العاصفة (the storm's own eye — the fr/pt/zh/hi/vi trap), **ملجأ / مخبأ** (air-raid and displacement register — rule 6), مقر (HQ), مركز إيواء (ministry shelter officialese). |
| One small thing | شيء واحد صغير | Button: «عرض شيء واحد صغير» (masdar, rule 2b). صغير is the disarming softener — don't inflate to «مهمة صغيرة». |
| Ways to plug in | أين تمدّ يدك | Extending a hand is Arabic's own help idiom (مدّ يد العون): «أين تمدّ يدك». DON'T: طرق المشاركة (officialese), انضم إلينا (recruiting-page register), فرص التطوع (rule 5 — doubly banned). |
| organizer | منظّم | Everyday and neutral (event organizers, not تنظيم — the noun for a person carries none of rule 6's collision); prose keeps it human: «صاحب المبادرة», «من بادر إليه». DON'T: مدير (a boss), مسؤول (an official in charge), قائد (leader/commander), منسق (NGO coordinator). |
| operator (appears near node) | القائم على الخادم | The caretaker phrase — transparent and unbossy: «من يشغّل الخادم لمجتمعه هو القائم عليه — صلاحيات واضحة وحدود واضحة». DON'T: مدير النظام (sysadmin — contradicts no-admins), **المشغّل** (telecom-carrier collision — شركة الاتصالات المشغّلة), مالك (owner). |
| display name | الاسم الظاهر | «اسمك الظاهر (لا يلزم اسمك الحقيقي — سمِّ نفسك كما تحب)». DON'T: اسم المستخدم (username), اللقب (title/nickname — honorific flavor), الاسم الحركي (nom de guerre — a war word), المعرف (handle/ID — technical). |
| owed help | بانتظار تأكيدك | Badge: «بانتظار التأكيد»; «{{count}} ساعات بانتظار تأكيدك» (mind rule 12 — the noun and verb follow the class). Deliberately NOT دين / مستحق / ذمة — the app refuses debt framing (rule 4). |

## Quick self-check for translators

- Would a neighbor write this in a note across a kitchen table? If it
  reads like a ministry circular, redo it (rule 1).
- `grep` for يرجى، نحيطكم، تجدر الإشارة، القيام بـ، تم ال — zero hits
  (rules 1, 3; passive «تم الحفظ» becomes «حُفظ»).
- `grep` for دين، مديون، سداد، تسديد، استحقاق، قرض، ائتمان — zero
  hits outside explicit debt-rejection lines; owed help is «بانتظار
  تأكيدك» (rule 4).
- `grep` for صدقة، إحسان، تبرع، خيرية، تطوع، متطوع، إغاثة — zero
  hits; helpers are مساعدون, help is مساعدة between equals (rule 5).
- `grep` for تنظيم، خلية، عملية، عميل، ملجأ، مخبأ، الطوارئ، تطهير،
  تجنيد، سخرة، كفالة، كفيل، نقطة تفتيش، الاسم الحركي — zero hits
  (rule 6). أمان over أمن for member safety.
- `grep` for مستخدم، زبون، مشترك — zero hits; members are أعضاء. Same
  for وصي (shard holders are أمناء), طرد/فصل (removal is «إخراج من
  المجتمع»), إبلاغ/تبليغ/وشاية/شكوى as the flag verb (flagging is
  «عرض على المجتمع»), عقدة (the server is خادم المجتمع), نوبة (a
  shift is مناوبة), فدرالية/اتحاد (the federation is «مجتمعات
  صديقة»).
- No slashed or bracketed gender forms — `grep` for `/ي`, `(ة)` —
  zero hits; restructure per rules 2 and 7.
- No directional control characters — grep for U+200E/U+200F/U+2066–
  U+2069 — zero hits; fix rendering by reordering words (rule 13).
- **Every plural family has all SIX keys** — `_zero`, `_one`, `_two`,
  `_few`, `_many`, `_other` — each reading correctly for its whole
  class aloud at 0, 1, 2, 3, 11 and 100: «لا ساعات بعد» / «ساعة
  واحدة» / «ساعتان» / «3 ساعات» / «11 ساعة» / «100 ساعة». The dual
  never carries a pasted «({{count}})» (rule 12).
- `{{…}}` placeholders byte-identical to en (except the sanctioned
  `_zero`/`_one`/`_two` omission of `{{count}}`); digits Western;
  numbers through `Intl` with the digit convention checked (rule 10).
- Arabic punctuation with Arabic text: «،» «؛» «؟», guillemets, the
  single-char …; no terminal punctuation on buttons and chips; no
  tatweel; hamza and taa marbuta consistent file-wide (rule 9).
- خادم المجتمع only ever means the server; أمين only ever the shard
  holder; استعادة only ever account recovery; bare اقتراح only ever a
  governance proposal (offers are «عرض مساعدة»); مناوبة only ever an
  event shift; حظر only ever a contact block.
- "Understoria" untouched — never أندرستوريا.
