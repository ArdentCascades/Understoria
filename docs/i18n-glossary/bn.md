# Bengali (bn) translation glossary — DRAFT pending native review

Reference for every bulk-translation and review pass over `bn.json` and
the Bengali content modules. Decisions here get applied ~2,900 times —
when in doubt, pick the word a Bengali-speaking neighbor would say
across a kitchen table (or across the রোয়াক at আড্ডা hour), not the
word a bank SMS, a microcredit-সমিতি leaflet, or a সরকারি circular
would use.

**Locale code is `bn`** (language-only): browsers send `bn`, `bn-BD`,
`bn-IN`, and i18next's language-only fallback resolves them all. One
`bn` serves Bangladesh, West Bengal and Tripura, the Barak valley, and
the diaspora: the base is the shared written standard — প্রমিত চলিত
বাংলা, the register both Dhaka and Kolkata read as their own — never
one city's colloquialisms, never dialect spellings. Assamese (অসমীয়া)
is a separate language, never mixed in here. Bengali closes the
demand-driven wave (id, sw, fil shipped before it); its plural and
digit decisions follow the Indic sibling `hi` where the grammar
matches, and fork deliberately where Bengali differs.

## Global register decisions

1. **The member is আপনি, uniformly — and every imperative ends in
   -ুন.** Bengali has the তুই / তুমি / আপনি gradient, and this is NOT
   the kamu/ka call id and fil made. Bengali তুমি runs wider than
   Hindi तुम — friends, family, even God — but to an adult stranger
   it is a negotiated intimacy ("তুমি করে বলি?" is a permission
   people actually ask), and an app never earns it. আপনি is not
   counter-register coldness: it is how an organizer talks to a
   neighbor they just met, and what every major bn product (Google
   bn, Facebook bn, bKash) already says — warm-normal to every age on
   both sides of the border. The verb consequence is a hard rule:
   **all imperatives take the আপনি ending — করুন, দেখুন, লিখুন,
   পাঠান, নিন — never করো/দেখো/লেখো (তুমি), never তুই forms.** One
   stray তুমি verb reads as a different person suddenly talking.
   Warmth comes from word choice and particles (তো, না হয়, একটু,
   চলুন), never from downgrading the pronoun. One relief hi and ur
   fought for: **Bengali verbs carry no gender at all** — slashed
   forms are never needed or permitted.
2. **First person — who is speaking.** (a) The MEMBER (buttons, "my"
   labels): আমার ("আমার ক্যালেন্ডারে যোগ করুন"). (b) The APP: prefer
   no subject — Bengali drops it naturally ("সেভ হয়ে গেছে।",
   "ইন্টারনেট ফিরলে পাঠানো হবে।") — or name the real actor: অ্যাপ,
   নোড, কমিউনিটি ("অ্যাপ পড়ে শোনাবে"). (c) **Corporate আমরা is
   banned as the app's voice** — "আমরা দুঃখিত" is the telco apology
   and there is no company behind this app; it survives only where en
   itself unmistakably speaks as the people who made the software
   (the translation-honesty note). A "we" that includes the member is
   "আমরা সবাই" / "সবাই মিলে" — Bengali আমরা is ambiguous, so মিলে
   does the inclusive work ("সবাই মিলে উদযাপন করি"). Third persons:
   তিনি + honorific verbs (করেছেন — respectful and genderless), "এই
   সদস্য", or repeat the name.
3. **Warm চলিত বাংলা — and সাধু ভাষা is banned absolutely.** No
   করিয়া, হইবে, ইহা, উহা, তাহার — the সাধু register is dead
   formality, and mixing the two (গুরুচণ্ডালী) is an error by
   definition. Banned officialese: অনুগ্রহ করে / দয়া করে as reflex
   padding (the bank-SMS opener; a polite -ুন imperative already
   carries the courtesy — where en says "please", restructure),
   "জানানো যাচ্ছে যে", অত্র / উক্ত chains, প্রদান করুন (say দিন).
   **সেবা is banned for help between members** (সেবা is what a
   company or an NGO sells — গ্রাহক সেবা; help here is সাহায্য).
   Banned NGO-speak: উপকারভোগী / সুবিধাভোগী, কর্মসূচি, বাস্তবায়ন,
   লক্ষ্যমাত্রা, উন্নয়ন flavor. Banned people-words: ইউজার /
   ব্যবহারকারী, গ্রাহক (customer — also telecom "subscriber"),
   **মেম্বার** (in rural Bangladesh the elected union-parishad
   official — a real collision; members are সদস্য). Banned
   telco-promo register: অফার, ক্যাশব্যাক, পয়েন্ট, বোনাস, রিওয়ার্ড,
   "মিস করবেন না" — this app sells nothing.
4. **Hours, not debt — and in Bengali the debt register has names and
   faces.** This locale serves the world capital of microcredit:
   debt vocabulary here is not abstract but the weekly কিস্তি
   collector at the door, the মহাজন, the দাদন that binds a fisherman
   to his buyer. The fence is absolute. Hours are **ঘণ্টা** — "যে কোনো
   সাহায্যের এক ঘণ্টা মানে এক ঘণ্টাই।" en's "credit(s)" is ALWAYS
   rendered as ঘণ্টা (the id credit→jam precedent): "You start with
   credit" → "শুরুতেই আপনার হাতে ঘণ্টা", "credit flowed" → "ঘণ্টা
   দুজনের খাতায় উঠে গেছে". The member's balance is "আপনার ঘণ্টা" —
   **ব্যালেন্স is banned** (the mobile-recharge word). Banned
   file-wide: ঋণ, দেনা, ধার, কর্জ, বকেয়া, ক্রেডিট, কিস্তি, সুদ,
   মহাজন, দাদন, জামানত, পাওনা / পরিশোধ / শোধ করা (repayment), and
   **বাকিতে / বাকির খাতা** (shop credit). Plain বাকি (= remaining) is
   allowed for counts and steps but NEVER near hours or exchanges
   ("আপনার ৩ ঘণ্টা বাকি" is forbidden). Debt words appear ONLY where
   en itself explicitly rejects debt framing — the member guide's
   "Asking is not debt" line, faq's "asking for help isn't debt", the
   seed-library tip's "a gift, not a debt" — and there the ONE
   sanctioned formula is: **"সাহায্য চাওয়া কোনো ঋণ নয় — ধারও নয়,
   দেনাও নয়।"** (the gift line: "উপহার — ধার নয়"). Owed help is
   "আপনার নিশ্চিত করার অপেক্ষায়" (term table). Never frame asking
   around shame, even to negate it ("লজ্জা করবেন না" still invokes
   লজ্জা) — render never-gated asking positively: "চেয়ে ফেলুন —
   চাওয়াটাই স্বাভাবিক।"
5. **The communal lexicon — decided one by one.** **শ্রমদান** — the
   given day of collective labor, lived on both sides of the border
   (village road repairs, school grounds) — takes the work-day
   feature, exactly as hi did: "শ্রমদান — {{project}}"; use it there
   and in prose about actual gathered work, never sprinkled over the
   timebank mechanism. **সমিতি — banned** for the community or the
   timebank: in Bangladesh a সমিতি is the microcredit loan group,
   weekly কিস্তি and all — the one institution this app must never
   resemble (the community is কমিউনিটি). **সালিশ / শালিস — banned**
   for disputes (the village arbitration bench, with its fatwa-and-
   punishment history; disputes are মতের অমিল, talked through).
   **একঘরে করা — banned** near removal (village ostracism — shame
   machinery). **টোকাই register — banned** near gleaning
   (waste-picking shame; the gleaning template always carries ফসল).
   Welcome as resonance in authored teaching prose only: the school
   rhyme "দশে মিলে করি কাজ, হারি জিতি নাহি লাজ" — collective work
   with the no-shame clause built in — and পাড়া warmth generally
   ("পাড়া-প্রতিবেশী", "পাড়ার সবাই").
6. **Loanword policy — three tiers, following bn app convention.**
   (a) Proper nouns, codes, technical literals verbatim in Latin:
   Understoria, QR (as "QR কোড"), Wi-Fi, PIN, URL, email addresses,
   file paths, env vars, .ics. (b) Established loans in Bengali
   script ARE the everyday words and win over stiff coinages: অ্যাপ,
   সার্ভার, অ্যাকাউন্ট, প্রোফাইল, পাসওয়ার্ড, ইমেল, ক্যালেন্ডার,
   ক্যামেরা, ব্রাউজার, ডিভাইস, মেসেজ, পোস্ট, প্রজেক্ট, ব্লক, কিট,
   ডাউনলোড, নোড, পাসকি, পাসফ্রেজ. Never the pure-Bengali coinages
   nobody says (আন্তর্জাল, গণকযন্ত্র). Loan verbs take the light-verb
   pattern, one convention: স্ক্যান করুন, ট্যাপ করুন, সেভ করুন,
   ব্লক করুন — never respelled hybrids. (c) Where a natural everyday
   Bengali word exists, it wins over both the loan and the coinage:
   সাহায্য not হেল্প, ছাঁচ not টেমপ্লেট, বোতাম not বাটন, খাতা not
   লেজার, মুছে ফেলা not ডিলিট. The test is always "which word would
   the neighbor text you" — not maximal Bengali, not maximal English.
7. **One spelling per word — Bangla Academy modern orthography.**
   ই-কার in non-tatsama words: জরুরি, সরকারি, বাড়ি, দাবি (never
   জরুরী, সরকারী). **কী vs কি discipline**: কী for "what" (কী দরকার?),
   কি as the yes/no particle (আসবেন কি?). **কোনো vs কোন**: কোনো =
   any (কোনো সমস্যা নেই), কোন = which. একটা/একটি — pick one per
   register (this file uses একটা in warm UI prose, একটি only where
   the sentence is formal by design) and never mix within a string
   family. No hasanta decoration; conjuncts spelled the standard way.
8. **Digits are Western (0–9), never Bengali (০–৯).** Interpolated
   values ({{count}}, {{hours}}, dates, times) arrive as Western
   digits from the runtime and cannot be re-rendered per-locale
   today, so hand-written Bengali digits would guarantee mixed-digit
   sentences — worse than either convention (the hi ASCII rule and
   the ur Western rule, applied to bn). **A warning the siblings
   didn't need**: unlike hi and ur, CLDR bn's default numbering
   system IS Bengali digits — `Intl.NumberFormat("bn")` yields
   "১২,৩৪,৫৬৭" (verified in this glossary's spike; `bn-u-nu-latn`
   yields "12,34,567") — so the wiring step must pin `-u-nu-latn` at
   every Intl call site. The lakh/crore grouping is correct for bn
   and stays. The clock trap is mild (clock time is "৩টা", duration
   "3 ঘণ্টা") but the currency still carries context ("সাহায্যের 3
   ঘণ্টা"); clock times render only via `Intl`.
9. **Punctuation: the দাঁড়ি (।) ends Bengali sentences.** It is the
   living convention of contemporary bn apps and print — a Latin
   period after a Bengali sentence is what looks foreign. No space
   before it. The Latin period survives only in technical literals —
   URLs, file paths (`docs/operator-powers.md`), extensions (.ics),
   decimals — and after a sentence that ends in Latin-script
   material. Questions use ?, exclamations use ! — sparingly. Quotes:
   curly “ ” (the sibling convention). Ellipsis: the single-char …
   ("পাঠানো হচ্ছে…"). Em dash: " — " with plain spaces, as en/es.
   Headings, buttons, and chips take no terminal punctuation.
10. **Length is the layout risk.** Bengali runs ~15–30% longer than
    en, and conjunct-heavy words are unbreakable. The tight surfaces
    are known: the bottom nav and the 3-up board pill row at 375px.
    The nav set is decided short up front — **বোর্ড, ক্যালেন্ডার,
    স্পন্দন, মেসেজ, আমার দেখাশোনায়, প্রোফাইল** — and the pill row is
    **দরকার / সাহায্য আছে / প্রজেক্ট**. In chips prefer short
    locative/verb forms over nominalizations (দেখাশোনায়, not
    রক্ষণাবেক্ষণ). Overflows wrap, never truncate mid-word. Casing
    follows en per key conceptually, but Bengali has no case — never
    simulate emphasis with spacing or punctuation.
11. **"Understoria" is never translated** or transcribed (never
    আন্ডারস্টোরিয়া). Same for file names, env vars, and `docs/…`
    paths quoted in strings. Interpolation placeholders `{{count}}`,
    `{{name}}`, `{{hours}}`… stay byte-for-byte identical (the parity
    test enforces this), with normal spaces around them.
12. **Plurals — bn `_one` covers BOTH 0 and 1.** CLDR Bengali has
    `one`/`other`, and "one" selects for i = 0..1 — **0 takes the
    `_one` form**, exactly as in hi. So every `_one` string must read
    correctly at BOTH 0 and 1: `_one` strings interpolate `{{count}}`
    and never assume "exactly one" — no hard-coded "একটা…" in a
    `_one` key. The parity gate's single-integer-category relaxation
    (a `_one` without `{{count}}`) applies only to languages with ONE
    category (id, vi, zh) — bn has two, so BOTH forms interpolate.
    Bengali's own seams: nouns don't inflect after numerals — never
    -গুলো/-রা after a counted `{{count}}`; people take spaced জন
    ("{{count}} জন সদস্য"), countable things attached -টা
    ("{{count}}টা কাজ"), measure nouns no classifier ("{{count}}
    ঘণ্টা"). Never delete a `_one` key; the parity test will fail
    the file.
13. **The joiner ban — bn's letterform rule.** The repo's i18n gates
    reject invisible characters in locale files — ZWSP (U+200B), ZWNJ
    (U+200C), directional controls — and **ZWJ (U+200D) falls under
    the same ban**. Some Bengali loanword spellings REQUIRE a ZWJ to
    render their canonical letterform — famously র‍্যা (ra + ZWJ +
    ya-phala + aa) in র‍্যালি "rally": without the joiner, র্যা
    renders as a reph over য, a different (wrong) letterform. The
    rule is therefore vocabulary-level: **choose words that render
    correctly with NO joiner.** The trap list and the approved
    substitutes live in the script section below. অ্যা-initial loans
    are safe — অ্যাপ, অ্যাকাউন্ট involve no joiner.

## Script, typography and rendering

Findings from the bn rendering spike (fontTools + uharfbuzz over
Google Fonts' `NotoSansBengali[wdth,wght].ttf`, measured at the app's
real Tailwind metrics — the same method as the Urdu spike):

- **The declared line box is 1.325em — taller than Latin, far short
  of Nastaliq.** unitsPerEm 1000; hhea/typo ascent 917 (0.917em),
  descent −408 (0.408em), lineGap 0 → a 1.325em declared box (OS/2
  winAscent 995 for clipping-region purposes).
- **Shaped ink stays INSIDE the declared box.** Conjunct- and
  matra-heavy words were shaped and measured: worst observed ascent
  ink +0.917em above baseline (the ি matra hook in কমিউনিটি; the reph
  over ী in কীর্তি at +0.914em) and worst descent ink −0.313em (the
  ন্ধু stack in বন্ধুত্ব; the ৃ mark in কৃতজ্ঞতা at −0.271em).
  Single-word ink spans reached ≈1.1–1.23em, against the theoretical
  two-line requirement of 0.917 + 0.408 = 1.325em.
- **Consequence — the line-height floor.** Tailwind's `leading-none`
  / `leading-tight` / `leading-snug` (1.0–1.375) all sit under 1.325,
  so adjacent Bengali lines can touch: a ৃ descender over the next
  line's reph. `index.css` already carries the `:lang(bn)` block
  (shipped — described here, not a TODO): the tight leading utilities
  are floored at **line-height 1.5** (`leading-normal`) wherever the
  content language is Bengali — between Tibetan's 1.6 and the Latin
  default — and the font stack is declared explicitly, since the
  shared Inter stack has no Bengali coverage: `"Noto Sans Bengali"`
  (Android/Linux, the Google webfont), `"Kohinoor Bangla"`
  (iOS/macOS), `"Bangla Sangam MN"` (older Apple), `"Nirmala UI"`
  (Windows), `Vrinda` (legacy Windows), then the shared stack. No
  webfont is bundled — system fonts cover members' real platforms.
- **Letter-spacing on section labels.** The app's uppercase section
  labels use `tracking-wide` (0.025em). Modern engines apply
  letter-spacing between grapheme clusters, so Bengali conjuncts and
  matras stay intact — acceptable as-is, but native review should
  eyeball those labels on a real device (a shaping regression here
  would be subtle).
- **Joiner traps — the concrete list (rule 13).** Spellings that need
  ZWJ, and the substitutes this file uses instead: **র‍্যান্ডম**
  (random) → এলোমেলোভাবে; **র‍্যাঙ্ক / র‍্যাঙ্কিং** (rank) → ক্রম, or
  rephrase ("কোনো ক্রম নেই"); **র‍্যালি** (rally) → মিছিল;
  **র‍্যাম** (RAM) → মেমোরি. Any other র + ্য loan gets the same
  treatment: a synonym or spelling that needs no invisible character.
- **Unicode hygiene — NFC, verified.** All bn files are
  NFC-normalized. খণ্ড-ত is the single code point ৎ U+09CE (its
  pre-Unicode-4.1 encoding ত+্+ZWJ violates NFC practice AND the
  joiner ban). য় / ড় / ঢ় are composition exclusions: **NFC's
  canonical form for them is base + nukta** (য+়), and the normalizer
  converts the precomposed U+09DF/U+09DC/U+09DD points to it —
  verified during this spike — so both keyboard encodings converge;
  never hand-mix encodings, never grep without normalizing first. No
  directional controls, ZWSP, ZWNJ, or ZWJ anywhere in locale files.

## Term table

| English | Bengali | Notes / DON'T use |
|---|---|---|
| vouch for (verb) | কারও হয়ে কথা দেওয়া | Argued hard. Kitchen reality: "আমি ওকে চিনি — ওর হয়ে কথা দিচ্ছি" is lived speech for putting your own word behind a person. The construction ALWAYS carries হয়ে (answering-FOR someone), keeping it distinct from bare কথা দেওয়া (a promise to do something). Button: "এই সদস্যের হয়ে কথা দিন". DON'T: **জামিন** (bail — courtroom), **জামিনদার** (bail surety — and one letter from জমিদার, the landlord), **সুপারিশ** (the string-pulling register, exactly hi's सिफ़ारिश ban), সাক্ষ্য দেওয়া (court testimony), গ্যারান্টি (warranty/loan cosigning), ভাউচার-anything (coupon poison + vouch false friend). |
| a vouch (the signed act) | সই করা কথা | "আপনার সই করা কথা", "দুজন বিশ্বস্ত সদস্যের কথা লাগে". সই is the everyday signature word (স্বাক্ষর is form-filling register). |
| vouches (count on trust chips) | {{count}} জন কথা দিয়েছেন | One vouch = one distinct person, so count people: "বিশ্বস্ত ({{count}} জন কথা দিয়েছেন)", "আপনার জন্য {{have}}/{{need}} জন কথা দিয়েছেন". Both plural keys carry {{count}} (rule 12). |
| vouched by | {{name}} আপনার হয়ে কথা দিয়েছেন | Honorific verb keeps it warm and genderless. |
| trust / trusted member | ভরসা / বিশ্বস্ত সদস্য | Chip: "বিশ্বস্ত" — the natural everyday word (বিশ্বস্ত বন্ধু). ভরসা is the kitchen trust noun ("ভরসা রাখুন"). Web of trust: **ভরসার বাঁধন** — the bond, chosen over the literal net because জাল also means counterfeit (জাল টাকা) — a fatal shadow in a trust context. DON'T: যাচাইকৃত (verified-badge officialese), আস্থাভাজন (formalese), জাল-anything. |
| seed balance | শুরুর বীজ | es keeps the metaphor ("semilla inicial") and so do we: "আপনার ঘণ্টা এখনো ঠিক আপনার শুরুর বীজের সমান". Chip: "বীজ: {{hours}}"; seed credits = বীজের ঘণ্টা. Plain in teaching prose: "সবাই 5 ঘণ্টা নিয়ে শুরু করে". DON'T: ব্যালেন্স (recharge register — rule 4), জমা (bank deposit), পুঁজি (capital), বোনাস (promo poison). |
| hours (the currency) | ঘণ্টা | "যে কোনো সাহায্যের এক ঘণ্টা মানে এক ঘণ্টাই।" Always with সাহায্য context (rule 8). Credit moves → "ঘণ্টা খাতায় উঠেছে" / "ঘণ্টা গেছে" — plain motion, no banking verb. DON'T: **ক্রেডিট** (loans — rule 4), পয়েন্ট (loyalty), কয়েন (game/crypto), জমা হওয়া (deposit flavor). |
| balance (the member's) | আপনার ঘণ্টা | "Your balance is hours of help" → "আপনার ঘণ্টাই আপনার হিসাব — সাহায্যের ঘণ্টা।" DON'T: ব্যালেন্স (rule 4 — the "ব্যালেন্স শেষ" recharge word), হিসাবের খাতা flavor for the personal figure. |
| node | নোড | Tier (b) loan with the teaching gloss: "নোড (আপনার কমিউনিটির নিজেদের চালানো শেয়ার করা সার্ভার)". RESERVED: নোড means the server and nothing else; সার্ভার alone only where en itself says just "server". DON'T: leave "node" in Latin, গিঁট (a knot), কেন্দ্র (a center — HQ flavor). |
| community node / peer nodes | আপনার কমিউনিটির নোড / বন্ধু নোড | বন্ধু is the trusted-friend word — exactly federated friendship (id "node sahabat", sw "node rafiki"). DON'T: পার্টনার নোড (business), সহযোগী নোড (NGO-partner flavor). |
| federation | বন্ধু কমিউনিটিগুলো | Prefer the rephrasing in prose: "Across the federation" → "বন্ধু কমিউনিটিগুলোর মাঝে". DON'T: ফেডারেশন (sports bodies), **জোট** (live electoral-alliance politics), সংঘ (club/committee officialdom), মহাজোট. |
| exchange | আদান-প্রদান | The everyday giving-and-taking reciprocal: "সাহায্যের আদান-প্রদান"; confirmed: "আদান-প্রদান নিশ্চিত হয়েছে". DON'T: **লেনদেন** (money dealings — bank register), সওদা (a purchase/deal), কারবার (business), ট্রানজ্যাকশন. |
| the commons (section) | সবার জিনিস | Kitchen-plain held-in-common: "এটা গোটা কমিউনিটির — সবার জিনিস।" Section: "সবার জিনিস"; one item: "সবার একটা জিনিস". DON'T: সরকারি সম্পত্তি (state property), সম্পদ (assets/NGO resources), কমনস kept English. |
| tended (commons status) | দেখাশোনায় | Chip: "দেখাশোনায়"; prose: "কমিউনিটির দেখাশোনায় আছে". দেখাশোনা is caring for a person, a child, a garden — exactly the app's care framing. DON'T: রক্ষণাবেক্ষণ (building/IT maintenance), পরিচালিত (managed — administrative). |
| retired (commons status) | বিশ্রামে | Deliberate non-literal, mirrors hi "आराम में" / id "sedang beristirahat": "জিনিসটাকে একটু বিশ্রাম দিন" honors the no-shame lifecycle (it can come back). DON'T: অবসরপ্রাপ্ত (pension office), বাতিল (scrapped — shame), বন্ধ (shut — final). |
| In my care (nav) | আমার দেখাশোনায় | Keeps the care verb, personal and honest; prose: "এটা পাবেন 'আমার দেখাশোনায়'-এর নিচে". Wrap if it overflows (rule 10). DON'T: আমার কাজ (flattens care to tasks), আমার দায়িত্বসমূহ (burden-officialese), আমার জিম্মায় (জিম্মা is reserved — see guardian). |
| Grow another root (add-a-server flow) | আরেকটা শিকড় গাড়ুন | শিকড় গাড়া is the lived taking-root idiom ("শিকড় গেড়ে বসা"); prose: "কমিউনিটি যেন একের বেশি জায়গায় শিকড় গাড়ে". Mirrors es "Hacer crecer otra raíz". DON'T: সার্ভার যোগ করুন, নতুন নোড বসান (both flatten the metaphor to IT). |
| timebank | টাইম ব্যাংক | The transparent transliteration, as hi "टाइम बैंक" — both halves everyday spoken Bengali. Keep the SURROUNDING prose non-bank: "টাইম ব্যাংকে সাহায্য চাওয়ায় কোনো বাধা নেই". DON'T: সময় ব্যাংক (scheme-name flavor), সময় তহবিল (treasury/fund officialese). |
| mutual aid | একে অপরকে সাহায্য | The plain reciprocal phrase: "একে অপরকে সাহায্যের ঘণ্টা", "পাড়া-প্রতিবেশী একে অপরের পাশে দাঁড়ায়". DON'T: পারস্পরিক সহায়তা (the officialese calque), দান (charity — downhill), খয়রাত (alms — shame), সদকা / যাকাত (religious alms — the app is confessionally neutral), **ত্রাণ** (flood-relief register — deeply worn in Bangladesh), সেবা (rule 3). |
| board | বোর্ড | Nav: "বোর্ড"; first-use gloss: "কমিউনিটির নোটিশ বোর্ড — যেখানে দরকার আর সাহায্য টাঙানো থাকে" (the corkboard every school, club, and বাজার wall has). DON'T: নোটিশ বোর্ড as the running name (fine once in the gloss), ফোরাম, মঞ্চ (a political stage), দেয়াল (FB wall calque). |
| post (noun / verb) | পোস্ট / বোর্ডে টাঙানো | The noun is the lived FB-bn word; the verb keeps the paper-notice metaphor — টাঙানো is what you do to a notice: "আপনার দরকারটা বোর্ডে টাঙান". "পোস্ট করা" acceptable in technical contexts (sync explanations). DON'T: বিজ্ঞাপন (advertisement), প্রকাশ করুন (publishing register), বিজ্ঞপ্তি (official notice). |
| dashboard | স্পন্দন | The community's heartbeat, rejoining the sibling pulse family (Denyut, Mdundo, Pintig, Пульс, نبض): nav "স্পন্দন", title "কমিউনিটির স্পন্দন" — হৃদস্পন্দন makes it instantly readable, and the page IS the community's vitals. Chosen over নাড়ি (also gut/umbilical — and নাড়ি দেখা is the doctor's exam) and ধুকপুক (baby-talk). DON'T: ড্যাশবোর্ড (car/BI), হোম, সারসংক্ষেপ (report-speak). |
| needs (tab) / asks | দরকার / সাহায্য চাওয়া | Pill: "দরকার" — the everyday word ("কী দরকার?"); asking in prose is "সাহায্য চাওয়া", unashamed: "চেয়ে ফেলুন" (rule 4 — no লজ্জা framing, even negated). DON'T: চাহিদা (market-demand economics), আবেদন (application to authority), অভাব (lack — shame-laden). |
| offers (tab) | সাহায্য আছে | "Help is here" — the sw "Msaada upo" move, because the honest nouns are poisoned: **অফার is banned** (telco promo — rule 3) and প্রস্তাব is RESERVED for governance. Prose: "যা কেউ দিতে চেয়েছেন", "কী দিতে পারেন, জানান". DON'T: অফার, প্রস্তাব (reserved), সেবা (rule 3), ডিল. |
| claim (a post/task) | দায়িত্ব নেওয়া | "এই কাজের দায়িত্ব নিন", "{{name}} দায়িত্ব নিয়েছেন" — taking it into your care; the nav framing (আমার দেখাশোনায়) does the warmth. DON'T: **দাবি করা** (a legal claim or a protest demand — the exact trap), ক্লেম (insurance), দখল (seizure/land-grab register), বুক করা (gig-economy). |
| project | প্রজেক্ট | The everyday loan — school projects, para projects. **প্রকল্প is banned**: in BD/WB news প্রকল্প IS the government scheme (উন্নয়ন প্রকল্প) — the inverse twin of hi keeping प्रोजेक्ट over परियोजना. Pill: "প্রজেক্ট". DON'T: প্রকল্প, কর্মসূচি (rally programme). |
| task | কাজ | "ছোট্ট একটা কাজ". DON'T: টাস্ক (corporate-app anglicism), দায়িত্ব as the noun-for-task (reserved for the claim family), কর্তব্য (duty — burden register). |
| template | ছাঁচ | The mould word — মাটির ছাঁচ, warm and transparent: "ছাঁচ থেকে শুরু করুন", plural "ছাঁচগুলো". DON'T: টেমপ্লেট (ছাঁচ is better Bengali and fits), ফরম / ফরম্যাট (the government-window word). |
| work day | শ্রমদান | THE word, used concretely (rule 5): "শ্রমদান — {{project}}", "একটা শ্রমদানের দিন ঠিক করুন". DON'T: কর্মদিবস (HR working day), ওয়ার্ক ডে, স্বেচ্ছাশ্রম (volunteer-institution flavor). |
| shift | পালা | The everyday turn word: "সকালের পালায় নাম লেখান", "আপনি এই পালায় আছেন". Bare পালা is RESERVED for shifts; the rota compound always carries দেখাশোনা (below). DON'T: শিফট (garment-factory register), ডিউটি (roster register). |
| sign-up (for a shift) | নাম লেখানো | The paper sign-up-sheet idiom: "নাম লেখান", "নাম কাটান". Keep this family for shifts ONLY (see RSVP). DON'T: রেজিস্ট্রেশন / নিবন্ধন (the SIM-registration counter), সাইন আপ. |
| rota (care rota) | পালা করে দেখাশোনা | "প্রতিবেশীরা পালা করে দেখাশোনা করেন" — পালা করে is the by-turns kitchen phrase. A rota slot: "এবার আপনার পালা". DON'T: ডিউটি রোস্টার, পাহারার তালিকা (guard-duty flavor). |
| RSVP | আসার জবাব | Heading: "আসবেন কি না, জানান"; "আপনার জবাব: {{status}}". The compound always carries আসা — bare জবাব stays free for message replies (a real collision). DON'T: keep "RSVP" (opaque), উপস্থিতি নিশ্চিতকরণ (attendance-register officialese), নাম লেখানো (collides with shifts). |
| proposal | প্রস্তাব | Page: "প্রস্তাব"; "কমিউনিটির জন্য প্রস্তাব". RESERVED: bare প্রস্তাব only ever means a governance proposal (an offer of help is never প্রস্তাব — see offers). Keep surrounding prose warm so it never reads parliamentary. DON'T: সিদ্ধান্তনামা flavor, বিল (legislature). |
| affirm (a proposal) | সায় দেওয়া | Button "সায় দিন"; count: "{{count}} জন সায় দিয়েছেন" — সায় is the lived nod of agreement, hands raised together, not admin approval. Blocking a proposal: আটকানো ("আপাতত আটকান") — keeps ব্লক reserved for contacts. DON'T: অনুমোদন (approval from above), ভোট দিন (parliamentary), লাইক. |
| block (a contact) | ব্লক | The universal app word (WhatsApp bn uses it): "এই কনট্যাক্ট ব্লক করুন", "আনব্লক করুন". RESERVED for contacts; a proposal is আটকানো (previous row). DON'T: নিষিদ্ধ (an official ban), আটকানো for contacts (reserved the other way). |
| flag (an exchange/comment) | কমিউনিটির সামনে তোলা | The community-review framing with no informer register: "কিছু ঠিক নেই? কমিউনিটির সামনে তুলুন — সবাই মিলে দেখবে"; chip: "আলোচনায়". DON'T: **রিপোর্ট করা** (report-to-the-authorities — there is no authority here), **নালিশ** (tattling to teacher/police — lived threat register), অভিযোগ (formal complaint). |
| dispute | মতের অমিল | Page: "মতের অমিল" — the everyday falling-out phrase, no courtroom in it; status: "কমিউনিটি মিলে দেখছে". DON'T: বিরোধ (legal/land-dispute register), মামলা (a court case), **সালিশ** (rule 5 — the village bench), ঝগড়া (a quarrel — shame). |
| removal / reinstatement | কমিউনিটি থেকে সরানো / ফিরে আসা | Heavy and honest, no shame theater: "একজন সদস্যকে কমিউনিটি থেকে সরানো"; return: "{{name}}-এর ফিরে আসা", "কমিউনিটি তাঁকে ফিরিয়ে নিয়েছে". DON'T: **বহিষ্কার** (expulsion officialese — school/party register), **একঘরে করা** (rule 5 — ostracism), বের করে দেওয়া (throwing out), তাড়ানো (chasing off). |
| member | সদস্য | Naturally common-gender — the workhorse. DON'T: ইউজার / ব্যবহারকারী, গ্রাহক (customer/subscriber — poison), **মেম্বার** (the union-parishad official — rule 3), নাগরিক (citizen — state address). |
| neighbor | প্রতিবেশী | "আপনার প্রতিবেশীরা"; collective warmth: **পাড়া** — "পাড়া-প্রতিবেশী", "পাড়ার সবাই" (the natural mutual-aid unit; lean into it in teaching prose). DON'T: বাসিন্দা (census register), এলাকাবাসী (loudspeaker-announcement flavor). |
| community | কমিউনিটি | The everyday loan, warm at kitchen scale — and the safe one: **সম্প্রদায় is banned** (in Bengali it reads as religious community — সাম্প্রদায়িকতা is communalism; the collision is total). DON'T: সম্প্রদায়, সমাজ (society-at-large), **সমিতি** (microcredit loan group — rule 5), গোষ্ঠী (faction flavor), গ্রুপ (chat group). |
| invite (noun + verb) | আমন্ত্রণ / আমন্ত্রণ জানানো | One family, greppable: "চেনা কাউকে আমন্ত্রণ জানান", "যিনি আপনাকে আমন্ত্রণ জানিয়েছেন". (দাওয়াত is lived and lovely in BD speech but regionally marked — content prose may use it once for warmth; UI stays আমন্ত্রণ.) DON'T: ইনভাইট, নিমন্ত্রণপত্র formality as the default, রেফারেল (growth-hacking). |
| guardian (shard holder) | জিম্মাদার | RESERVED WORD: জিম্মাদার only ever means a recovery-shard holder — the custody-keeper of something handed over in trust ("আমার জিম্মায় আছে" is lived speech). Gloss on first use: "জিম্মাদার — প্রত্যেকে আপনার ফেরার চাবির এক টুকরো আগলে রাখেন". DON'T: **অভিভাবক** (legal guardian of minors — the school-form trap), **গার্জিয়ান** (the OTHER half of the same school form — "গার্জিয়ানের সই"), পাহারাদার (a watchman), **জামিনদার** (bail surety — debt register). |
| recovery kit | ফেরার কিট | The promise is return, not backup: "ফেরার কিট (যে ব্যাকআপ আপনার অ্যাকাউন্ট ফিরিয়ে আনে)". The warm recovery verb family is ফেরা / ফিরিয়ে আনা: "অ্যাকাউন্ট ফিরিয়ে আনুন". A shard: "চাবির টুকরো". DON'T: রিকভারি কিট (opaque), ফার্স্ট এইড flavor, ব্যাকআপ ফাইল (flattens the promise). |
| password / passphrase | পাসওয়ার্ড / পাসফ্রেজ | Both transliterated, the hi convention — পাসওয়ার্ড is universal; gloss on first use: "পাসফ্রেজ (কয়েকটা শব্দ মিলিয়ে লম্বা পাসওয়ার্ড)". DON'T: গোপন শব্দ / সংকেত (coinages), পিন as a synonym (a PIN is a PIN). |
| passkey | পাসকি | Transliterated because that is what members' OS dialogs show in Bengali (Android bn renders "passkey" as পাসকি) — the term must match the platform sheet mid-flow. Gloss on first use: "পাসকি — আপনার ডিভাইসের আঙুলের ছাপ, মুখ, বা PIN দিয়ে খুলুন". DON'T: গোপন চাবি (blurs into the key vocabulary of a security flow), passkey kept Latin (the OS itself doesn't). |
| ledger | কমিউনিটির সবার খাতা | The shared record book, kitchen-plain: "কমিউনিটির সবার খাতায় লেখা হয়ে গেছে". Device-local (en's parenthetical): "এই ডিভাইসের নিজের খাতা". খাতা is safe ONLY with সবার/নিজের — **বাকির খাতা and ধারের খাতা never appear** (rule 4: the shop-credit book is the register this app exists to refuse). DON'T: লেজার (accounting/blockchain), হিসাবের খাতা bare (account-book flavor), যৌথ খাতা (joint-account banking echo). |
| milestone | মাইলফলক | The living idiom of bn prose: "কমিউনিটি নতুন এক মাইলফলক ছুঁয়েছে". DON'T: টার্গেট (quota), **লক্ষ্যমাত্রা** (government production-target register), ধাপ bare (just a step). |
| skills | যা যা পারেন / দক্ষতা | Headings prefer the kitchen framing: "আপনি কী কী পারেন"; the compact field label is "আপনার দক্ষতা". DON'T: স্কিল, যোগ্যতা (CV qualifications), প্রশিক্ষণ flavor (training-institute register). |
| helper (person in an exchange) | যিনি সাহায্য করলেন | "ঘণ্টা উঠেছে যিনি সাহায্য করলেন তাঁর খাতায়"; compact field: "সাহায্যকারী". The traps are triple: **কাজের লোক banned** (domestic servant — the id pembantu trap), **হেল্পার banned** (in Bengali a হেল্পার is the bus conductor's boy — total collision), **স্বেচ্ছাসেবক banned** (volunteer-as-institution, and party volunteer wings carry the name). DON'T: কাজের লোক, হেল্পার, স্বেচ্ছাসেবক, সহকারী (an aide-to-a-boss). |
| panic (the emergency wipe) | বিপদের বোতাম | বিপদ is the plain danger word ("বিপদে পড়া"): gloss on first use: "বিপদ মাথার ওপর এলে: এই ডিভাইসের সব কিছু এক্ষুনি মুছে ফেলুন". The Emergency section itself is "জরুরি" — and **জরুরি অবস্থা is banned** (the state-of-emergency phrase; 1975 in India, 2007 in Bangladesh — same trap as hi's आपातकाल). DON'T: প্যানিক (clinical state), জরুরি অবস্থা, SOS মোড. |
| soft purge / hard purge | আংশিক মোছা (পরিচয় লুকান) / পুরোপুরি মোছা (সব মুছে ফেলুন) | One মোছা family, kitchen-plain (বোর্ড মোছা), honest about the difference: আংশিক strips identifying text and keeps the signed খাতা; পুরোপুরি wipes keys and rotates identity. DON'T: পার্জ kept English, ডিলিট mixed into the family (one family only), ফ্যাক্টরি রিসেট confusion. |
| read aloud (feature) | পড়ে শোনানো | What a family member does for someone who can't read the screen — exactly the promise: toggle "পড়ে শোনানো", "অ্যাপ পড়ে শোনাবে". DON'T: টেক্সট-টু-স্পিচ (spec, not promise), পাঠ (recital register). |
| seed vault | বীজের গোলা | গোলা is the village grain store — "গোলা ভরা ধান" is the prosperity idiom itself; the resonance is exact: "এই ডিভাইসটা একটা বীজের গোলা — কমিউনিটির পুরো ইতিহাস আগলে রাখে।" DON'T: ভল্ট (bank), গুদাম (commercial warehouse), ব্যাকআপ সার্ভার (flattens the metaphor). |
| storm hub | ঝড়ের দিনের ঠাঁই | ঠাঁই is the warm word for a place given to you ("ঠাঁই দেওয়া"): gloss "ঝড়ের দিনের ঠাঁই — বিদ্যুৎ আর Wi-Fi থাকে, যখন আর সব অন্ধকার". DON'T: **ঝড়ের কেন্দ্র** (the storm's own eye — the trap every sibling dodged), **আশ্রয়কেন্দ্র** (the cyclone-shelter register — real displacement vocabulary in Bangladesh), ত্রাণকেন্দ্র (relief officialese). |
| One small thing | ছোট্ট একটা কাজ | Button: "ছোট্ট একটা কাজ দেখান" — ছোট্ট is the disarming diminutive. The "drawn at random, never ranked" copy uses এলোমেলোভাবে and "কোনো ক্রম নেই" (rule 13 — no র‍্যান্ডম, no র‍্যাঙ্ক). Don't inflate. |
| Ways to plug in | হাত লাগানোর উপায় | হাত লাগানো is Bengali's own pitch-in idiom — warm, physical, everyday. DON'T: যোগদানের সুযোগ (HR-officialese), অবদান রাখুন (open-source flavor), "আমাদের সাথে যোগ দিন" (recruiting page AND corporate আমরা). |
| celebrate / gathering (social) | উদযাপন / আড্ডা | Category "উদযাপন"; "সবাই মিলে উদযাপন করি". The social category ("get-togethers and good company") is **আড্ডা** — the beloved Bengali institution, exactly the referent. The gathering screen: "আসরের স্ক্রিন" (গানের আসর, গল্পের আসর — the living sitting-together word). DON'T: অনুষ্ঠান (a formal function), **জমায়েত** (rally register, and a syllable from জামায়াত — avoid entirely). |
| gleaning (template corpus) | খেতে পড়ে থাকা ফসল কুড়ানো | Always carries ফসল — bare কুড়ানো slides toward waste-picking shame (the টোকাই register, banned — rule 5). "ফসল কুড়ানোর দল". DON'T: কুড়ানো bare, আবর্জনা flavor. |
| organizer / operator | আয়োজক / যিনি নোড চালান | আয়োজক is everyday (অনুষ্ঠানের আয়োজক); the operator stays a person, not a title: "যিনি কমিউনিটির জন্য সার্ভার চালান — ক্ষমতাও স্পষ্ট, সীমাও স্পষ্ট". DON'T: অ্যাডমিন / প্রশাসক (contradicts the no-admins framing), পরিচালক (a company director), কর্তৃপক্ষ (the authorities — never). |
| founder / co-founder | প্রতিষ্ঠাতা / সহ-প্রতিষ্ঠাতা | "এই কমিউনিটির প্রতিষ্ঠাতা". DON'T: মালিক (owner), সভাপতি (club president). |
| display name | যে নামে ডাকা হবে | Label: "আপনার নাম (আসল নাম লাগবে না — ছদ্মনামও চলে)"; prose: "যে নামে কমিউনিটি আপনাকে চিনবে". DON'T: ইউজারনেম, **ডাকনাম** (the childhood pet name — members would enter খোকা/টুকু), পুরো নাম (the ID-card field), প্রদর্শিত নাম (IT-literal). |
| owed help | আপনার নিশ্চিত করার অপেক্ষায় | Badge: "নিশ্চিতের অপেক্ষায়"; "{{hours}} ঘণ্টা আপনার নিশ্চিত করার অপেক্ষায়". Deliberately NOT পাওনা / বাকি / দেনা — the app refuses debt framing (rule 4), and বাকি never touches hours. |

## Known hard strings

- **In my care** (`nav.myWork`, `myWork.title`) → "আমার দেখাশোনায়" —
  দেখাশোনা keeps the tending-a-person warmth in the nav pill.
- **Grow another root** (`growRoot.title`, `dashboard.resilience.cta`)
  → "আরেকটা শিকড় গাড়ুন" — শিকড় গাড়া keeps the metaphor botanically
  alive instead of flattening it to server administration.
- **Dashboard** (`nav.dashboard`, `dashboard.title`) → "স্পন্দন" /
  "কমিউনিটির স্পন্দন" — bn rejoins the sibling pulse family that hi
  stepped out of, because স্পন্দন carries no jargon and no collision.
- **The unit of progress is us, not me** (`dashboard.tagline`) →
  "এগোনোর হিসাব 'আমি'-তে নয়, 'আমরা'-তে।" — the আমি/আমরা pair does in
  Bengali what us/me does in English.
- **You start with credit** (`welcome.screens.credit.title`, body) →
  "শুরুতেই আপনার হাতে ঘণ্টা" — credit becomes hours everywhere (rule
  4); the body keeps "সবাই 5 ঘণ্টা নিয়ে শুরু করে".
- **One hour of help = one hour of credit** (`postForm.fieldHoursHint`,
  `hints.balance.message`, `direct.form.hoursHint`) → "এক ঘণ্টার
  সাহায্য মানে এক ঘণ্টাই" — the equation never grows a money word.
- **Credits have flowed between you** (`toast.exchangeConfirmedComplete`,
  `postDetail.actionsCompleted`) → "ঘণ্টা দুজনের খাতায় উঠে গেছে" —
  plain book-entry motion, no banking verb.
- **{{hours}} waiting on your confirmation**
  (`profile.balance.awaitingYouLine`) → "{{hours}} ঘণ্টা আপনার
  নিশ্চিত করার অপেক্ষায়" — the owed-help family, never পাওনা.
- **Show me one small thing** (`board.oneSmallThing.button`) → "ছোট্ট
  একটা কাজ দেখান"; its why-copy (`board.oneSmallThing.why`) says
  "এলোমেলোভাবে বেছে নেওয়া — কোনো ক্রম নেই" because র‍্যান্ডম and
  র‍্যাঙ্ক need a banned joiner (rule 13).
- **A new understoria** (`dashboard.categoryBreakdown.emptyTitle`) —
  the brand pun can't transliterate; render the understory image:
  "নতুন কিছু গজিয়ে উঠছে" — and "Understoria" itself never appears
  respelled (rule 11).
- **Tended commons** (`projects.statusTended`,
  `projects.momentum.tended`) → chip "দেখাশোনায়" — the verb you use
  for a plant or an ailing neighbor, exactly what the commons asks.
- **storm hub** (`infra.drills.stormHub.title`, the print kit) →
  "ঝড়ের দিনের ঠাঁই" — refuge THROUGH the storm; never ঝড়ের কেন্দ্র,
  never the cyclone-shelter word আশ্রয়কেন্দ্র.
- **Resilience tiers** (`dashboard.resilience.tier.*`) — Seedling /
  Taking root / Sturdy / Deep-rooted → "চারা / শিকড় গাড়ছে / মজবুত /
  গভীর শিকড়ে" — one botanical family with the growRoot strings.
- **vouch** (`member.vouchButton`, `trust.trustedWithCount*`,
  `hints.invite.message`) → the "হয়ে কথা দেওয়া" family — answering
  for someone with your own word, kept clean because জামিন, জামিনদার,
  সুপারিশ, and every money word around it are banned file-wide.
- **guardians** (`guardians.title`, `guardians.intro`) → "জিম্মাদার" —
  BOTH halves of the school form (অভিভাবক AND গার্জিয়ান) are banned,
  dodging legal guardianship twice over.

## Quick self-check for translators

- Would a neighbor text you this string? If it reads like a bank SMS,
  a সমিতি leaflet, or a সরকারি circular, redo it (rule 3).
- `grep` for তুমি forms — তুমি, তোমার, and the -ো imperatives (করো,
  দেখো, লেখো, বলো) — zero hits; the member is আপনি with -ুন verbs,
  uniformly (rule 1). তুই likewise. No সাধু forms (করিয়া, হইবে, ইহা).
- `grep` for ঋণ, দেনা, ধার, কর্জ, বকেয়া, কিস্তি, সুদ, মহাজন, দাদন,
  ক্রেডিট, ব্যালেন্স — zero hits outside the explicit debt-rejection
  lines, where the ONE sanctioned formula is "সাহায্য চাওয়া কোনো ঋণ
  নয় — ধারও নয়, দেনাও নয়।" (rule 4). বাকি never touches hours; owed
  help is "নিশ্চিত করার অপেক্ষায়". No লজ্জা framing around asking,
  even negated.
- `grep` for সেবা, ইউজার, ব্যবহারকারী, গ্রাহক, মেম্বার, উপকারভোগী,
  সুবিধাভোগী, অফার, ক্যাশব্যাক, পয়েন্ট, বোনাস — zero hits; help is
  সাহায্য, members are সদস্য, the offers tab is "সাহায্য আছে"
  (rule 3). অনুগ্রহ করে / দয়া করে as padding — zero hits.
- `grep` for সম্প্রদায়, সমিতি, সালিশ, শালিস, একঘরে, বহিষ্কার, ত্রাণ,
  স্বেচ্ছাসেবক, কাজের লোক, হেল্পার, নালিশ, রিপোর্ট করা — zero hits
  (rules 3–5); the community is কমিউনিটি, flagging is "কমিউনিটির
  সামনে তোলা", helpers are "যিনি সাহায্য করলেন". শ্রমদান hits only on
  the work-day feature and concrete collective-work prose.
- Reserved words hold: নোড only ever the server; প্রস্তাব only ever
  governance; জিম্মাদার only ever a shard holder (অভিভাবক and
  গার্জিয়ান — zero hits); ব্লক only ever contacts (a proposal is
  আটকানো); বাকি the plain remainder only; পালা and নাম লেখানো only
  ever shifts; দায়িত্ব নেওয়া only ever claiming (দাবি — zero hits
  near posts and tasks). প্রকল্প — zero hits (projects are প্রজেক্ট).
  ঝড়ের কেন্দ্র and আশ্রয়কেন্দ্র — zero hits (the refuge is ঝড়ের
  দিনের ঠাঁই).
- `grep -P` for invisibles `[\x{200B}\x{200C}\x{200D}\x{200E}\x{200F}]`
  — zero hits: no ZWSP, no ZWNJ, **no ZWJ** — so no র‍্যা- spellings
  anywhere (র‍্যান্ডম → এলোমেলোভাবে, র‍্যাঙ্ক → ক্রম; rule 13). Files
  NFC-normalized: ৎ is U+09CE, য়/ড়/ঢ় are their NFC (base + nukta)
  forms, one encoding file-wide (script section).
- `grep` for Bengali digits `[০-৯]` — zero hits; digits are Western
  (rule 8), and every `Intl` call site is pinned to `-u-nu-latn`
  during wiring so formatted numbers and dates match.
- `{{…}}` placeholders identical to en; every `_one` key present and
  carrying `{{count}}`, reading correctly at BOTH 0 and 1 (bn `_one`
  covers 0 — rule 12); জন spaced for people, -টা attached for things,
  no classifier on ঘণ্টা/দিন; never -গুলো/-রা after a counted number.
- Bengali sentences end in । (no space before); Latin period only
  after Latin/technical material; buttons and chips carry no terminal
  punctuation; quotes curly “ ”; ellipsis the single-char …; em dash
  spaced (rule 9). One spelling per word — জরুরি, সরকারি, কোনো —
  and the কী/কি distinction held (rule 7).
- Nav and pill labels stay short and wrap rather than truncate (rule
  10); the bn line-height floor and font stack are CSS facts, not
  translator work — but flag any label that clips a matra.
- "Understoria" untouched — never আন্ডারস্টোরিয়া.
- **This file's choices are a first draft pending native review** —
  the review updates this glossary first, then the strings; the ban
  rows are load-bearing regardless, and any replacement term must
  still avoid them.
