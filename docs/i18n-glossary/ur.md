# Urdu (ur) translation glossary — DRAFT pending native review

Reference for every bulk-translation and review pass over `ur.json`
and the Urdu content modules. Decisions here get applied ~2,900 times
— when in doubt, pick the word an Urdu-speaking neighbor would say
across a kitchen table (or a چارپائی in the گلی), not the word a
government گزٹ, a bank SMS, or a courtroom would use.

**Draft status — read this first.** This glossary is a first draft
written without a native reviewer in the loop (`reviewStatus: "new"`
discloses this in Settings, as everywhere). Rows marked **⚠ review**
are considered choices a native reviewer should confirm or replace;
the **ban rows are load-bearing regardless** — they mark registers
this app must never speak in, and any replacement term must still
avoid them.

**Locale code is `ur`** (language-only): browsers send `ur`, `ur-PK`,
`ur-IN`; i18next's language-only fallback resolves them all. One `ur`
serves Pakistan, Urdu speakers across India, and the worldwide
diaspora. **Urdu is the app's second right-to-left language** — the
RTL rails are proven and shipping under Arabic (docs/rtl-plan.md
R1–R3 plus the `ar` fleet), so translators never write directional
markup; the Arabic glossary's rule 13 applies to `ur` verbatim. What
Urdu adds that Arabic did not exercise is the **Nastaliq script
style** — see "Script, typography and rendering" below (findings
from the R5 rendering spike) before writing any string.

## Global register decisions

1. **Warm plain Urdu — the spoken-adjacent written middle.** The
   register of a good Urdu explainer or a note to a neighbor: short
   sentences, everyday words, the natural Hindustani core — never
   the ornate high-literary register and never officialese. Banned
   outright: گزارش / التماس / استدعا (petition-to-authority),
   مطلع کیا جاتا ہے, قابلِ ذکر ہے, ہذا / مذکورہ بالا chains, and
   براہِ کرم as reflex padding (a polite آپ imperative already
   carries the courtesy). Where an everyday word and an ornate
   borrowing both exist, the everyday word wins: مدد not اعانت,
   پڑوسی over ہمسایہ (both fine; پڑوسی warmer). The test for every
   string: would a neighbor text this word?
2. **Address: آپ, always.** Never تم or تو in app strings. The
   workhorse is the polite imperative — کریں، لکھیں، چنیں —
   gender-free by construction, the exact parallel of the Russian
   infinitive / Arabic masdar / Tibetan bare-verb button rule:
   (a) **Buttons take the polite imperative**: «محفوظ کریں»،
   «بھیجیں»، «شریک کریں».
   (b) **Avoid gendered verb agreement with the member.** Urdu
   inflects verbs for gender (کرتا/کرتی), but the grammar offers
   three outs, in order of preference: imperatives (gender-free);
   the ergative perfective, which agrees with the OBJECT, not the
   member («آپ نے تصدیق کی» reads correctly for everyone); and
   nominal sentences. Where present-tense agreement is truly
   unavoidable, آپ with the polite plural (کرتے ہیں) is the
   standing Urdu product convention — accept it rather than invent
   forms.
   (c) **Never slashed forms** (کرتا/کرتی) — they garble read-aloud
   (`lib/speak.ts`) and screen readers.
3. **Who is speaking.** (a) Buttons: imperative (rule 2a). (b) When
   the APP speaks, prefer agentless perfectives and nominal
   sentences: «محفوظ ہو گیا»، «نیٹ ورک واپس آنے پر بھیج دیا جائے
   گا» — or name the real actor: ایپ، سرور، برادری. (c) **Corporate
   «ہم» is banned as the app's voice** — a "we" with no company
   behind it is a lie; it survives only where en itself unmistakably
   speaks as the people who made the software. A "we" that includes
   the member is «ہم سب» / «پوری برادری».
4. **No-shame framing — the debt ban.** Never debt vocabulary for
   exchanges: no قرض، مقروض، ادھار، واجب الادا، بقایا، وصولی — and
   no **کھاتہ** (the shop-credit book; ادھار کھاتہ is exactly the
   register this rule exists to keep out — see the ledger row).
   «آپ پر برادری کے 3 گھنٹے ہیں» is forbidden — پر in the owing
   sense is the trap. "Credited" is «شمار ہو گئے»; hours are گھنٹے,
   never کریڈٹ-as-loan. Debt words appear ONLY where en itself
   explicitly rejects debt framing («یہ قرض نہیں ہے»). Owed help is
   «آپ کی تصدیق کے انتظار میں».
5. **Charity and hierarchy — banned as framing.** Help between
   members is مدد between equals, never charity flowing downhill:
   no خیرات، صدقہ، زکوٰۃ، عطیہ، فلاحی کام (welfare-NGO register),
   no امدادی سرگرمیاں (relief-work register), and no رضاکار for
   helpers (the volunteering sector — helpers are مددگار, neighbors
   who helped). The app's voice is confessionally neutral: members
   write however they speak, but app strings never carry formulaic
   religious phrases — the software serves Urdu speakers of every
   faith and none.
6. **Politically- and security-marked vocabulary — the standing ban
   list.** This locale serves members for whom these words are not
   abstractions. Banned: **تنظیم** for the community or any group
   (the militant-organization word of news Urdu — the community is
   برادری, full stop); bare **جماعت** (party/sect collision);
   **آپریشن / کارروائی** for exchanges or actions (security-
   operation register — an exchange is تبادلہ); informer vocabulary
   anywhere (**مخبر، مخبری** — never, least of all near flagging);
   **چیک پوسٹ / ناکہ** for milestones (real checkpoints in members'
   lives — a milestone is پڑاؤ); **پناہ گاہ / بنکر** for the storm
   hub (displacement and air-raid register); **ایمرجنسی نافذ /
   ہنگامی حالت** framing (state-of-emergency register — the panic
   feature has its own warm name, see the table); **بھرتی** for
   inviting or onboarding (military recruitment); **بیگار** anywhere
   near work days (the exact Urdu word for forced/corvée labor —
   the parallel of Arabic's سخرة and Tibetan's ཨུ་ལག་ bans); and
   **سفارش** for vouching (the nepotism register — see the vouch
   row). Prefer حفاظت (personal safety) over سیکیورٹی wherever en
   says "safety" about members.
7. **Gender — third persons.** Prefer constructions that don't
   force agreement: nominal framings, repeating the name, the
   ergative perfective (rule 2b), or وہ with the unmarked polite
   plural («وہ اسے سنبھالتے ہیں»). رکن، پڑوسی، مددگار as unmarked
   generics cover everyone; never invent marked feminine forms and
   never slashed forms.
8. **Loanword policy — three tiers.** (a) Proper nouns, codes and
   technical literals stay in Latin verbatim: Understoria, QR
   («QR کوڈ»), Wi-Fi, VPN, URL, email addresses, file paths,
   `.ics`. (b) Established Urdu tech words — many of them English
   loans in Urdu script that ARE the everyday word — win over stiff
   coinages: ایپ (app), سرور (server), اکاؤنٹ، پروفائل، پاس ورڈ
   (but see the passphrase row), براؤزر، بٹن، کیمرہ، کیلنڈر، آلہ
   (device; ڈیوائس acceptable where آلہ reads stiff), پیغام
   (message — prefer over میسج). (c) Where a natural everyday Urdu
   word exists it wins over the loan: مدد not ہیلپ, ہنر not اسکلز,
   سانچہ not ٹیمپلیٹ. The test is always "which word would the
   neighbor actually text" — not maximal Urdu, not maximal English.
9. **Digits are Western (0–9) in hand-written strings.** Pakistani
   digital Urdu overwhelmingly writes Western digits; interpolated
   values ({{count}}, {{hours}}) arrive Western from the runtime;
   mixing ۳ and 3 in one sentence is worse than either convention.
   `Intl.NumberFormat("ur")` yields Western digits (the ur-PK
   default), but check call sites during the fleet anyway — and
   clock times and dates render via `Intl`, never hand-formatted.
10. **Punctuation — Urdu conventions, consistently.** Full stop is
    «۔» (U+06D4), comma «،», question mark «؟» — never their Latin
    twins inside an Urdu sentence. Quotes are guillemets «…»,
    matching ar. Ellipsis is the single char …. Headings, buttons
    and chips take no terminal punctuation, as in en (Urdu, unlike
    Tibetan, has no orthographic requirement for one). No
    tatweel/kashida padding — Nastaliq shaping has no use for it.
11. **Plurals — TWO forms, with count-agreement care.** CLDR Urdu
    is `one`/`other`, the same shape as English: every en
    `_one`/`_other` pair maps to exactly two ur keys, **both
    carrying `{{count}}` verbatim** (the hi precedent). Urdu's own
    seams to watch: ایک + singular in the one-form («ایک گھنٹہ»),
    the direct plural after bare numbers («3 گھنٹے»), and the
    oblique plural before postpositions («3 گھنٹوں میں»). Write
    each form as a whole sentence and read it aloud at 1, 2 and 5.
12. **Right-to-left mechanics** — identical to Arabic's rule 13:
    the layout mirrors by itself (CSS logical properties + `dir`
    from the registry); translators NEVER add directional markup.
    **Directional control characters (U+200E/F, U+2066–2069) are
    banned in strings**, and so is ZWNJ (U+200C) — Nastaliq shaping
    does not need it, and the repo gate bans invisibles across
    every locale. The spike verified (see below) that Latin brand
    names, Western digits, file paths and parentheses all render
    correctly inside Urdu sentences under the plain Unicode bidi
    algorithm; if a string genuinely scrambles, reorder words —
    move the Latin run to the end or give it Urdu words on both
    sides.
13. **"Understoria" is never translated** or transcribed (never
    انڈرسٹوریا). Same for file names, env vars and `docs/…` paths
    quoted in strings.

## Script, typography and rendering

Findings from the R5 rendering spike (probe page at the app's real
Tailwind metrics, Noto Nastaliq Urdu, Chromium — the same method as
the Tibetan spike):

- **Nastaliq's line box is 2.5× the font size — the tallest script
  the app ships.** The font declares ascent 1.93em + descent 0.57em
  (27px + 8px at `text-sm`'s 14px), and ordinary words — not
  stress cases — carry real glyph ink to ~2em above the baseline
  (کے in برادری کے گھنٹے measured 28px of ink ascent at 14px).
  Tailwind's `text-sm` line box is 20px; Nastaliq wants 35px.
- **Multi-line collisions are real, worse than Tibetan.** At
  `leading-none` two Urdu lines visibly overlap; `leading-tight`
  and `leading-snug` still interleave ink. Clean separation starts
  around line-height 1.8 and is comfortable at 2.0 — so the fleet
  PR must carry a `:lang(ur)` guard **stronger than Tibetan's 1.6
  floor: floor multi-line line-height at 2.0** (the tight utilities
  `.leading-none/.leading-tight/.leading-snug` and the default
  prose line heights all resolve to ≥2.0 under `:lang(ur)`).
- **Single-line containers clip.** An h-8 (32px) button with 14px
  Nastaliq text measurably clips ~1px of the tallest ligature ink
  under `overflow: hidden`; h-10 is safe. The fleet must audit
  single-line `overflow-hidden` containers (buttons, chips,
  truncated rows) — prefer letting ink overflow visibly (the
  default) or give `:lang(ur)` a slightly larger single-line box.
  `truncate`/ellipsis itself behaves correctly in RTL (ellipsis at
  the logical end) — safe to keep.
- **Font stack.** The shared stack has no Nastaliq coverage. The
  fleet adds an explicit `:lang(ur)` font-family: "Noto Nastaliq
  Urdu" (Android's Urdu system font, iOS-bundled, and the Google
  webfont), "Urdu Typesetting" (Windows), "Jameel Noori Nastaleeq"
  (widely installed in Pakistan), then Naskh-capable Arabic
  fallbacks ("Noto Naskh Arabic", "Geeza Pro") before the shared
  stack — Urdu in Naskh is legible and universally understood;
  Urdu in tofu is not. Do NOT bundle a Nastaliq webfont in the
  app: the arabic-range subset alone is ~160 KB and the system
  fonts cover the platforms members actually hold.
- **Bidi needs nothing from translators.** The spike rendered
  Latin fragments (Understoria, QR, docs/quickstart.md), Western
  digits and parenthesized clauses inside Urdu sentences with zero
  control characters and zero scrambling. The pseudo-locale's
  punctuation jumps do not reproduce with real Urdu text — do not
  "fix" what the preview shows (the same finding as ar).
- **NFC normalization** applies to ur files as to all locales.
  Watch the two Urdu-specific letters that have Arabic lookalikes:
  ہ (U+06C1, not ه U+0647), ی (U+06CC, not ي U+064A), ک (U+06A9,
  not ك U+0643), ے (U+06D2) — one spelling per word file-wide,
  because read-aloud and every self-check grep depend on it.

## Term table

Rows marked **⚠ review** are draft choices awaiting a native
reviewer; ban columns hold regardless.

| English | Urdu | Notes / DON'T use |
|---|---|---|
| mutual aid | باہمی امداد | The established compound (Kropotkin circulates as «باہمی امداد»); in warm prose also «ایک دوسرے کی مدد». DON'T: خیرات/صدقہ (charity — rule 5), امدادی کارروائیاں (relief-NGO + rule 6 double), تعاون alone (flattens to cooperation). |
| help (the everyday act) | مدد | The household word; helpers are مددگار — neighbors who helped, never volunteers-as-institution (rule 5). |
| timebank | ٹائم بینک | ⚠ review. The honest everyday rendering (بینکِ وقت reads literary). Keep the SURROUNDING prose non-bank, as every locale does. DON'T: adding accounting register on top. |
| hours (the currency) | گھنٹے | «کسی بھی مدد کا ایک گھنٹہ ایک گھنٹہ ہے». "Credited" → «شمار ہو گئے». The member's balance is «آپ کے گھنٹے», never an account balance. Forms per rule 11: ایک گھنٹہ / {{count}} گھنٹے / گھنٹوں before postpositions. DON'T: کریڈٹ (loan shading, rule 4), پوائنٹس (loyalty points). |
| seed balance | شروعات کے بیج | ⚠ review. Keep the seed metaphor as es/hi/vi/ru/ar do: «ہر رکن پانچ گھنٹوں سے شروع کرتا ہے — یہ آپ کے بیج ہیں». DON'T: ابتدائی بیلنس (bank), انعام/بونس (promo register — poison here). |
| member | رکن | The plain membership word; اراکین as plural. DON'T: صارف (user), گاہک (customer), ممبر (loan — رکن is established and warmer). |
| neighbor | پڑوسی | «آپ کے پڑوسی»; the collective is «محلے والے» — the محلہ is Urdu's natural mutual-aid unit; lean into it in teaching prose. DON'T: رہائشی (municipal register), شہری (state address). |
| community | برادری | THE word — warm, everyday, exactly the mutual-aid unit. DON'T: **تنظیم** (rule 6, absolute), جماعت bare, معاشرہ (society-abstract), کمیونٹی (برادری is strictly warmer). |
| vouch (verb) | تائید | ⚠ review. Personal endorsement of a person you know: «میں {{name}} کی تائید کرتا ہوں» → prefer the ergative «آپ نے {{name}} کی تائید کی» (gender-free, rule 2b); button «تائید کریں». RESERVED: تائید only ever means vouching for a person (a proposal is حمایت — next row). DON'T: **ضمانت/ضامن** (bail/surety — court register), **سفارش** (nepotism register — rule 6), گواہی (court testimony), تصدیق (reserved for confirm). |
| affirm (a proposal) | حمایت | «حمایت کریں»؛ «{{count}} اراکین نے حمایت کی». Blocking a proposal is «روکنا» — keeps بلاک reserved for contacts. DON'T: منظوری (approval from authority), ووٹنگ (parliamentary register). |
| trust / trusted member | بھروسہ / بھروسے کا رکن | Chip: «بھروسہ حاصل». Web of trust: «بھروسے کا جال». DON'T: تصدیق شدہ (verified-badge register), مستند (accredited). |
| node (the server) | برادری کا سرور | The teaching gloss IS the term, ar pattern: «برادری کا سرور (ایک سانجھا آلہ جو آپ کی برادری خود چلاتی ہے)»; bare سرور once context is set. DON'T: نوڈ (opaque), مرکزی سرور (contradicts federation), any word implying an authority runs it. |
| federation | جُڑی ہوئی برادریاں | ⚠ review. Prefer the rephrasing in prose: "across the federation" → «دوست برادریوں کے درمیان». DON'T: فیڈریشن/وفاق (live constitutional vocabulary), اتحاد (alliance register), **تنظیم** (rule 6). |
| exchange | تبادلہ | «مدد کا تبادلہ»؛ «تبادلہ مکمل ہوا». DON'T: لین دین (money-dealings register), سودا (a deal), **کارروائی** (rule 6). |
| the commons (section) | سانجھی چیزیں | ⚠ review. سانجھا carries the shared-between-us warmth (سانجھ is the common hearth); section heading «سانجھی چیزیں», prose «یہ پوری برادری کی سانجھی ملکیت ہے». DON'T: سرکاری املاک (state property), مشترکہ اثاثے (asset-register officialese). |
| In my care (nav) | میرے ذمے | ⚠ review. Aligned with the claim family (next row): what I've taken on. NOT نگرانی (surveillance shading — نگرانی رکھنا is watching someone). DON'T: میرے ٹاسک (task-manager), میری ذمہ داریاں (burden-heavy). |
| claim (a post/task) | ذمے لینا | Taking it into one's care: button «یہ کام ذمے لیں», prose «{{name}} نے ذمے لیا ہے» (ergative — gender-free). ذمہ here is responsibility, never the واجب الادا owing sense (rule 4 watches this line). DON'T: دعویٰ (legal claim — the exact trap), بکنگ, قبضہ (seizure). |
| board | بورڈ | Nav: «بورڈ»; first-use gloss «برادری کے اعلانات کا تختہ» — the cork board every گلی knows. A post is an اعلان hung on it. DON'T: وال/فیڈ (social-media calques), فورم. |
| post (noun) | اعلان | The notice on the notice board — the metaphor closes itself. DON'T: پوسٹ (Facebook register), **اشتہار** (a paid advertisement — real collision). |
| post (verb) | اعلان لگائیں | What one does with a paper notice — hang it: «اپنا اعلان بورڈ پر لگائیں». Neutral بھیجیں in technical contexts. DON'T: شائع کریں (publish/press register), اپ لوڈ. |
| dashboard | برادری کی نبض | Nav: «نبض» — the community's heartbeat, mirrors ru «Пульс» and ar «النبض». DON'T: ڈیش بورڈ, کنٹرول پینل (contradicts no-admins). |
| project | منصوبہ | The everyday word. DON'T: **اسکیم** (the government-scheme register of Pakistani news — real collision), پروجیکٹ (منصوبہ is established). |
| task | کام | Small and everyday: «ایک چھوٹا کام»; the plural rhythm «چھوٹے چھوٹے کام» is exactly the register. DON'T: ٹاسک, فریضہ (religious duty), ڈیوٹی (rostered-duty register). |
| template | سانچہ | «سانچے سے شروع کریں», «سانچے». The mould word — warm and established. DON'T: ٹیمپلیٹ, فارم (a paper form — the government-window word). |
| work day | مل کر کام کا دن | ⚠ review — a native reviewer may prefer a warmer name; the Punjabi وَنگار (the communal work party) is exactly this concept and MAY appear once in teaching prose as a warm nod, the way hi honors श्रमदान — never as the term (it is regional, not pan-Urdu). DON'T: **بیگار** (forced labor — rule 6, absolute; the entire reason this row has a ban column), ورکشاپ (NGO register), ورکنگ ڈے (HR). |
| shift | باری | The everyday turn-taking word: «اپنی باری لکھوائیں», «آپ کی باری ہے» — warm and idiomatic. DON'T: شفٹ (factory floor), ڈیوٹی (police/rostered register). |
| sign-up (for a shift) | نام لکھوانا | The paper sign-up-sheet phrase: «باری میں نام لکھوائیں», «نام کٹوائیں». RESERVED for shifts (RSVP is its own row). DON'T: رجسٹریشن (officialese), درخواست دیں (application to authority). |
| RSVP | آنے کا بتائیں | Heading: «کیا آپ آئیں گے؟»؛ «آپ کا جواب: {{status}}». Always the coming/attending clause — bare جواب alone is message replies, نام لکھوانا is shifts. DON'T: keep "RSVP" (opaque), حاضری کی تصدیق (badge-desk register; and تصدیق is reserved). |
| proposal | تجویز | Page: «تجاویز»؛ «برادری کے لیے تجویز». RESERVED: bare تجویز only ever means a governance proposal (an offer of help is «مدد کی پیشکش»). DON'T: قرارداد (assembly-resolution register), درخواست (application to authority). |
| block (a contact) | بلاک | The universal app word (WhatsApp Urdu convention): «رابطہ بلاک کریں», «بلاک ہٹائیں». RESERVED for contacts; a proposal is روکنا. DON'T: پابندی (state-ban register), بلیک لسٹ (heavier shame register). |
| flag (an exchange/comment) | برادری کے سامنے رکھنا | The community-review framing with no informer register: «کچھ ٹھیک نہیں لگتا؟ برادری کے سامنے رکھیں — سب مل کر دیکھیں گے», chip «مل کر جائزہ جاری». DON'T: **رپورٹ کرنا** (report-to-authority — exactly the register this app refuses), شکایت (complaint to authority), **مخبری** (informing — rule 6, never). |
| dispute | اختلاف | Page: «اختلافات» — honest and no-shame; status «برادری مل کر سلجھا رہی ہے». DON'T: تنازعہ (legal/territorial register), مقدمہ (court case), جھگڑا (a fight — shame register). |
| removal (of a member) | برادری سے اخراج | ⚠ review — heavy and honest without shame theater. The ceremony keeps its dignity: «الوداع» («{{name}} کا الوداع — برادری وقار کے ساتھ کھڑی ہے»). DON'T: نکالنا bare (expulsion-shame), برطرفی (firing), بے دخلی (eviction), **رخصتی** (the wedding-departure word — total collision). |
| reinstatement | واپسی | «{{name}} کی واپسی» — the door reopening; «برادری نے واپسی پر خوش آمدید کہا». بحالی is RESERVED for account recovery (below), so member return never uses it. DON'T: بحالی (that reservation), دوبارہ داخلہ (readmission paperwork). |
| guardian (shard holder) | امین | RESERVED WORD: امین only ever means a recovery-shard holder — the entrusted-keeper word, warm in Urdu exactly as in Arabic: «اپنی چابی کے امین چنیں»؛ gloss on first use: «امین — ہر ایک آپ کی واپسی کی چابی کا ایک ٹکڑا سنبھالتا ہے». DON'T: **سرپرست** (legal guardianship of minors — the courtroom trap), ولی (religious/legal guardian), محافظ (a guard — security register), **ضامن** (bail). |
| recovery kit | واپسی کی پوٹلی | ⚠ review. The cloth bundle one keeps safe for the journey home — the promise is return, not backup: «واپسی کی پوٹلی بنا رکھیں». The plain verb family stays بحالی: «اکاؤنٹ کی بحالی» — RESERVED: بحالی only ever means account recovery. DON'T: بیک اپ (flattens the promise), ریکوری کٹ (opaque). |
| passphrase | پاس جملہ | Built on the universally-known پاس ورڈ; gloss on first use: «پاس جملہ (کئی لفظوں کا لمبا پاس ورڈ)». DON'T: خفیہ کوڈ (bank-PIN register), سیڈ فریز (crypto-wallet register — and a fatal collision with OUR seed metaphor). |
| ledger | برادری کا سانجھا رجسٹر | The shared record book — رجسٹر is the neutral school-and-shop register book: «برادری کے سانجھے رجسٹر میں درج ہو گیا». The device-local record is «اس آلے کا اپنا رجسٹر». DON'T: **کھاتہ / بہی کھاتہ** (the shop-credit debt book — rule 4, absolute), لیجر (accounting officialese). |
| milestone | پڑاؤ | The journey halt — the caravan word: «ایک اور پڑاؤ آ گیا». DON'T: **چیک پوسٹ / ناکہ** (rule 6 — real checkpoints), سنگِ میل (acceptable literary fallback, but پڑاؤ is warmer), ہدف مکمل (KPI register). |
| invite (noun + verb) | دعوت / بلانا | «کسی جاننے والے کو بلائیں», «آپ کو کس نے بلایا». Button: «دعوت دیں». DON'T: **بھرتی** (rule 6), ریفرل (growth-hacking register). |
| organizer | منتظم؟ NO — شروع کرنے والا | ⚠ review. منتظم reads as an administrator (contradicts no-admins); keep it human: «جس نے شروع کیا», «{{name}} نے یہ منصوبہ شروع کیا». DON'T: منتظم/ایڈمن (boss register), قائد (leader/commander), کوآرڈینیٹر (NGO register). |
| operator (appears near node) | سرور چلانے والا | The caretaker phrase — transparent and unbossy: «جو اپنی برادری کے لیے سرور چلاتا ہے — واضح اختیارات، واضح حدیں». DON'T: سسٹم ایڈمن (contradicts no-admins), آپریٹر (telecom collision), مالک (owner). |
| helper (person in an exchange) | مددگار | «گھنٹے مددگار کے شمار ہوئے»؛ prose «جس نے مدد کی». DON'T: **رضاکار** (rule 5), ورکر (laborer), سروس فراہم کرنے والا (service provider — poison). |
| skills | ہنر | «آپ کے ہنر»؛ prose «جو کام آپ کو آتے ہیں» — warmer than مہارتیں. DON'T: قابلیت (CV qualifications), اسکلز. |
| panic (the emergency wipe) | سر پر خطرہ | ⚠ review. Heading «سر پر خطرہ»؛ gloss on first use: «اگر خطرہ سر پر ہو — اس آلے سے سب کچھ فوراً مٹا دیں». Wipe = «سب کچھ مٹانا»؛ urgent things elsewhere are «فوری», never ایمرجنسی. DON'T: **ایمرجنسی/ہنگامی حالت** (rule 6 register), گھبراہٹ کا بٹن (clinical panic). |
| seed vault | بیجوں کا گودام | The granary word keeps our metaphor warm: «یہ آلہ بیجوں کا گودام ہے — برادری کی پوری تاریخ سنبھالے رکھتا ہے». DON'T: تجوری (bank safe), **بنکر** (rule 6), بیک اپ سرور (flattens the metaphor). |
| storm hub | روشن گھر | The lit house in the dark street (the ru «огонёк» / ar «البيت المضيء» lineage): «جب سب کی بجلی اور انٹرنیٹ چلے جائیں — ایک گھر جہاں دونوں موجود ہوں، جہاں پڑوسی آ سکیں: روشن گھر». Requires its first-use gloss. DON'T: **پناہ گاہ** (rule 6 — displacement register), طوفان کا مرکز (the storm's own eye — the fr/pt/zh/hi/vi trap), مرکز (HQ flavor). |
| One small thing | ایک چھوٹا سا کام | چھوٹا سا is the disarming softener — exactly the register. Don't inflate. |
| Ways to plug in | ہاتھ بٹانے کے طریقے | ہاتھ بٹانا is Urdu's own pitch-in idiom — warm and everyday. DON'T: شمولیت کے مواقع (officialese), رضاکارانہ مواقع (rule 5 — doubly banned). |
| display name | ظاہری نام | «آپ کا ظاہری نام (اصلی نام ضروری نہیں — جو چاہیں کہلائیں)». DON'T: یوزر نیم, **عرف** (the police-record alias — عرف عام in FIRs), لقب (honorific). |
| read aloud (feature) | آواز میں پڑھ کر سنانا | What a family member does for someone who cannot read the screen — the promise, not the TTS spec: «ایپ آواز میں پڑھ کر سناتی ہے». DON'T: ٹیکسٹ ٹو اسپیچ. |
| owed help | آپ کی تصدیق کے انتظار میں | Badge: «تصدیق کے انتظار میں». Deliberately NOT واجب الادا / بقایا — the app refuses debt framing (rule 4). |

## Quick self-check for translators

- Would a neighbor text this? If it reads like a گزٹ or a courtroom,
  redo it (rule 1).
- `grep` for گزارش، التماس، استدعا، مطلع کیا جاتا ہے، براہِ کرم —
  zero hits (rule 1).
- `grep` for قرض، مقروض، ادھار، واجب الادا، بقایا، وصولی، کھاتہ —
  zero hits outside explicit debt-rejection lines; owed help is
  «تصدیق کے انتظار میں» (rule 4).
- `grep` for خیرات، صدقہ، زکوٰۃ، عطیہ، رضاکار، فلاحی — zero hits;
  helpers are مددگار, help is مدد between equals (rule 5).
- `grep` for تنظیم، آپریشن، کارروائی، مخبر، مخبری، چیک پوسٹ، ناکہ،
  پناہ گاہ، بنکر، بھرتی، بیگار، سفارش، عرف — zero hits (rule 6).
  حفاظت over سیکیورٹی for member safety.
- `grep` for تم، تو as address — zero hits; آپ everywhere, no
  slashed gender forms (rule 2).
- `grep` for صارف، گاہک، ممبر — zero hits; members are اراکین. Same
  for سرپرست/ولی (shard holders are امین), رپورٹ/شکایت as the flag
  verb (flagging is «برادری کے سامنے رکھنا»), دعویٰ (claiming is
  «ذمے لینا»), اسکیم (a project is منصوبہ), رخصتی (removal is
  «برادری سے اخراج»).
- No directional controls (U+200E/F, U+2066–2069), no ZWNJ
  (U+200C), no ZWSP (U+200B); files NFC-normalized; the Urdu
  letters ہ ی ک ے — never their Arabic lookalikes (ه ي ك) —
  consistent file-wide (typography section).
- Both plural keys present for every family, both carrying
  `{{count}}` verbatim, each reading correctly aloud at 1, 2 and 5
  — direct plural after numbers, oblique before postpositions
  (rule 11). Digits Western (rule 9).
- «۔» «،» «؟» with Urdu text; guillemets; the single-char …; no
  terminal punctuation on buttons and chips; no kashida (rule 10).
- تائید only ever means vouching for a person; حمایت only ever a
  proposal; بحالی only ever account recovery; امین only ever a
  shard holder; bare تجویز only ever governance; بلاک only ever a
  contact; باری/نام لکھوانا only ever shifts.
- "Understoria" untouched — never انڈرسٹوریا.
- **This file's ⚠ rows re-checked against the native review** once
  one exists — the review updates this glossary first, then the
  strings.
