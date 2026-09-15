# Persian / Farsi (fa) translation glossary — DRAFT pending native review

Reference for every bulk-translation and review pass over `fa.json` and
the Persian content modules. Decisions here get applied ~2,900 times —
when in doubt, pick the word a Persian-speaking neighbor would say over
چای across a kitchen table (or سرِ کوچه), not the word a bank SMS, an
NGO grant report, a state broadcaster, or a courtroom would use.

**Locale code is `fa`** (language-only): browsers send `fa`, `fa-IR`,
`fa-AF`; i18next's language-only fallback resolves them all. One `fa`
serves Iran, Afghanistan's Dari readers, and the diaspora — so the
base is standard written Persian, the register Tehran and Kabul both
read as their own: never Tehran-colloquial-only, never Kabul-only, and
every string must land the same in Mashhad, Herat, and Los Angeles
(rule 12). **Farsi is the app's third right-to-left language**, riding
the RTL rails Arabic proved and Urdu confirmed (docs/rtl-plan.md R1–R3
plus both fleets): translators never write directional markup, and
`languages.test.ts`'s `rtlShipped` list consciously grows from
`["ar","ur"]` to `["ar","ur","fa"]` at wiring. What fa adds that no
prior locale had: **ZWNJ is admitted** — read rule 8 before typing a
word. And this glossary's sharpest edge is rule 6: this audience is
precisely who the opsec guide, the compelled-biometrics honesty, and
the panic features were built for; the informer/state register those
rules ban is lived vocabulary, not theory.

## Global register decisions

1. **Address: شما, uniformly — with plural verb agreement.** This is
   the আপনি call bn made, not the kamu one: تو to an adult stranger
   is a negotiated intimacy («راحت باش، تو بگو» is a permission
   people actually grant), and an app never earns it. شما is not
   coldness — it is how an organizer talks to a neighbor they just
   met, and what Google fa, Telegram fa, and Divar already say. Hard
   rule: **every imperative and second-person verb takes the شما
   form — بنویسید، بفرستید، انتخاب کنید — never بنویس/بفرست (تو).**
   A relief the siblings fought for: **Persian verbs and pronouns
   carry no gender** — او covers everyone; slashed forms are never
   needed or permitted.
2. **Ta'arof is banned as a register.** The ceremony of
   self-lowering and ritual insistence — قربان شما، مخلصیم، قابلی
   ندارد، خواهش می‌کنم as reflex padding, the تعارف loop — is warmth
   between people who can read each other's eyes; in an app it is
   noise at best and manipulation at worst, and the app must mean
   exactly what it says, especially in security flows. Warmth comes
   from plain, direct, kind sentences — never from ceremony. Banned
   alongside it: خواهشمند است، مستدعی است، به استحضار می‌رساند،
   احتراماً، اینجانب، مذکور/فوق‌الذکر chains, فرمودن/عرض کردن
   scaffolding. **لطفاً is decided honestly**: a real everyday word,
   it stays AVAILABLE — sparingly, where en itself genuinely pleads
   — but never as reflex padding on every imperative (the bank-SMS
   register; the polite شما imperative already carries the courtesy:
   «دوباره امتحان کنید.», not «لطفاً مجدداً تلاش فرمایید.»).
3. **Who is speaking — and the community word, decided first.** The
   community is **«جمع»** — the lived circle-of-people word: «به
   جمعِ ما خوش آمدید» is the welcome formula Persian actually uses,
   and «تصمیم با جمع است»، «همهٔ جمع می‌بینند»، «جمعِ شما» read warm
   in Tehran and Kabul alike. Banned: **سازمان / تشکیلات / تشکل**
   (the security file's words for what it prosecutes), **گروهک**
   (the regime's word for dissident groups — never, in any
   direction), جامعه (society-abstract — the broadcaster's word),
   اجتماع (assembly — one step from تجمع, rule 6), انجمن (registered
   associations; انجمن اسلامی is a state institution), قوم/طایفه
   (ethnic/tribal), کامیونیتی (diaspora slang). Who speaks: (a)
   buttons take the شما imperative («ذخیره کنید»)؛ (b) the APP
   prefers no subject — Persian drops it naturally («ذخیره شد.»،
   «وقتی اینترنت برگردد فرستاده می‌شود.») — or names the real actor:
   اپ، سرور، جمع; (c) **corporate «ما» is banned as the app's
   voice** — «متأسفیم» is the telco apology and no company stands
   behind this software; it survives only where en itself
   unmistakably speaks as the people who made the app (the
   translation-honesty note). A "we" that includes the member is
   «همهٔ ما» / «همه با هم».
4. **Hours, not debt — and the قرض‌الحسنه trap.** Hours are
   **ساعت**: «یک ساعت کمک یعنی یک ساعت — هر کاری که باشد.» en's
   "credit(s)" is ALWAYS rendered as ساعت (the id credit→jam
   precedent): "You start with credit" → «از همان اول ساعت دارید»;
   "credits flowed" → «ساعت‌ها در دفترِ هر دو نوشته شد». The
   member's balance is «ساعت‌های شما» — **موجودی is banned** (the
   bank/recharge word). Banned file-wide: بدهی، بدهکار، قرض، وام،
   نسیه، طلب، طلبکار، بازپرداخت، قسط، بهره، سود، گرو، رهن، وثیقه،
   ضمانت/ضامن (loan surety AND bail — see the vouch row). THE
   INSTITUTIONAL TRAP, the সমিতি/sòl analog: **صندوق — above all
   صندوق قرض‌الحسنه — is banned for the community and the
   timebank.** The rotating benevolent-loan fund is beloved,
   genuinely mutual, run by families and mosques and offices across
   Iran and Afghanistan — and exactly the institution this timebank
   must never resemble: money paid in on a schedule, a pot, a turn,
   repayment owed to real neighbors. Hours are not paid in, there
   is no pot, no نوبتِ وام, and asking creates no obligation; if a
   member reads this app as a صندوق of hours, every no-debt promise
   in it becomes unreadable. So صندوق never names the community,
   the timebank, hours, or the seed (the vault is انبار, never
   گاوصندوق). Debt words appear ONLY where en itself explicitly
   rejects debt framing — the member guide's "Asking is not debt",
   the faq's negative-balance answer, the seed-library tip — and
   there the ONE sanctioned formula is: **«کمک خواستن بدهی نیست —
   نه قرضی در کار است، نه طلبی.»** (the gift line: **«هدیه است، نه
   قرض.»**). Owed help is «در انتظار تأیید شما». Never frame asking
   around shame, even to negate it («خجالت نکشید» still invokes
   خجالت) — render never-gated asking positively: «بخواهید —
   همسایگی همین است.»
5. **The communal lexicon — decided one by one.** Mutual aid is
   **«همیاری»** — the living mutual-help word («ساعت‌های همیاری»),
   warm in both countries; plain «کمک به هم» welcome in prose.
   Rejected: تعاون (cooperative-ministry register — وزارت تعاون،
   شرکت تعاونی), یاری‌گری (coinage nobody texts), معاضدت (legalese).
   **The work-day feature is «روزِ کارِ جمعی»** — plain and
   transparent — NOT **حشر**: the Afghan hashar is exactly this
   institution (the konbit/Bayanihan slot) and teaching prose MAY
   nod to it once, named as the Afghan custom it is, but it cannot
   be THE term — for Iranian readers bare حشر reads first as روزِ
   حشر, Judgment Day; a fatal collision. Neighborhood warmth is
   welcome everywhere: همسایه، در و همسایه، محله، اهل محل، کوچه و
   سرِ کوچه travel to all three audiences. **The charity-shame
   register is banned**: صدقه، خیرات، اعانه، احسان — help flows
   level, never downhill; **خیریه** never frames the app or its
   help (surviving only in authored content naming an actual
   external charity). **The NGO register is banned with prejudice**
   — donor-speak from Kabul compounds and Tehran conference halls:
   سمن، مردم‌نهاد، ذی‌نفع (beneficiary), توانمندسازی
   (empowerment-speak), کمک‌های بشردوستانه (humanitarian-aid),
   امداد/امدادگر (the relief corps — and کمیتهٔ امداد is an Iranian
   state charity), and **داوطلب is banned for helpers** (the NGO
   roster's volunteer — helpers are neighbors who helped, «کسی که
   کمک کرد»). The app's voice is confessionally neutral: app
   strings never carry formulaic religious phrases (ان‌شاءالله،
   خدا قوت) — the software serves Persian speakers of every faith
   and none.
6. **Surveillance-marked vocabulary — the standing ban list.** This
   locale serves members for whom these words are files, summonses,
   and knocks on the door. Banned: **گزارش دادن / گزارش کردن for
   flagging** (report-to-authority — exactly the register this app
   refuses; flagging is putting-before-the-community: «با جمع در
   میان بگذارید»); **خبرچینی/خبرچین** anywhere (the informer —
   never, least of all near flagging); **احضار** (the summons),
   **بازجویی** (interrogation), **حکم** (the verdict), **پرونده**
   for any person or dispute (the case file), محاکمه، دادگاه — none
   of these ever appear in removal or dispute flows: disputes are
   «اختلاف‌نظر», talked through; **تصفیه / پاکسازی** for any wipe,
   cleanup, or removal (political-purge register — wiping data is
   plain پاک کردن); **اخراج** (deportation/expulsion officialese)
   and طرد (ostracism) for removal; **ایست بازرسی** for milestones
   (a real checkpoint in members' lives); **پناهگاه** for the storm
   hub (the air-raid shelter of the war years), likewise اردوگاه
   (the camp) and قرارگاه/ستاد (military and state-crisis HQs);
   **وضعیت اضطراری** framing for the panic feature
   (state-of-emergency register — its own plain name is «خطر بیخِ
   گوش», term table) and آژیر خطر (the air-raid siren);
   **مسئولین/مقامات** as any actor (the authorities — there are
   none here). The protest word, decided honestly: where the opsec
   guide speaks of protests, the word is **«اعتراض»** — the word
   people themselves use — never تجمع (the charge sheet's word:
   تجمع غیرقانونی) and never راهپیمایی (the state's own rallies
   wear it). اعتراض itself carries legal weight in Iran; the guide
   says the risk plainly rather than euphemizing it. The
   compelled-biometrics and panic strings take the same register
   everywhere: plain, direct, no euphemism, no ta'arof. A member's
   personal safety is «امن بودن / در امان بودن» — never امنیتی,
   the adjective of the security apparatus.
7. **Loanword policy — three tiers.** (a) Proper nouns, codes,
   technical literals verbatim in Latin: Understoria, QR (as
   «کد QR»), Wi-Fi, PIN, VPN, URL, email addresses, file paths, env
   vars, .ics. (b) Established loans in Persian script ARE the
   everyday words: اپ، سرور، اکانت (over حساب — اکانت is the lived
   word online AND dodges the bank shading of حساب near hours),
   پروفایل، ایمیل، دانلود، اسکن، کد، دوربین، مرورگر، موبایل/گوشی،
   کیت، بلاک، پیامک. **رمز عبور** is the password (the lived
   written form — پسورد is speech, گذرواژه a coinage members don't
   text); passphrase is «عبارت عبور», glossed on first use:
   «عبارت عبور (رمز عبوری بلند از چند کلمه)». **Passkey is
   «پاس‌کی»** — fa OS support exists and platform sheets vary
   between Google's coinage and English, so the term leads with the
   transliteration and its gloss names what the phone may show:
   «پاس‌کی — گوشی شما شاید آن را "گذرکلید" یا "passkey" بنامد؛ با
   اثر انگشت، چهره، یا PIN دستگاه باز می‌شود» (the fil/bn/ht
   argument, adapted; پاس‌کی itself carries a ZWNJ — rule 8). Never
   the pure-Persian coinages nobody says: رایانه, تارنما. (c) A
   living Persian word wins over both loan and coinage: کمک not
   هلپ, الگو not تمپلیت, دفتر not لجر, دکمه not باتن, پیام not
   مسیج. The test is always "which word would the neighbor text
   you" — not maximal Persian, not maximal English.
8. **ZWNJ (U+200C) is ADMITTED — a first among all locales; used
   exactly where orthography requires it and nowhere else.** Correct
   Persian cannot be written without the half-space: the می‌ prefix
   (می‌کنید، نمی‌شود), the ها plural after silent he (خانه‌ها) and
   after most stems in careful writing (ساعت‌ها), compounds and
   prefixes (بی‌خطر، هم‌محله، به‌زور، پاس‌کی). Every prior locale
   banned all invisibles; fa's fleet validation admits **exactly
   U+200C** while still banning ZWSP (U+200B), ZWJ (U+200D), and
   every directional control (U+200E/F, U+2066–2069). BINDING: (a)
   ZWNJ wherever standard orthography wants it — an attached میکنم
   or a full space in می کنم is a spelling error applied 2,900
   times; (b) **never decoratively** — no ZWNJ for kerning taste,
   padding, or inside Latin/digits; (c) **no directional marks,
   ever** — RTL comes from `<html dir>`, never from embedded marks.
   If a string mixing Latin (Understoria, QR, Wi-Fi, a path) with
   Persian renders oddly, restructure the sentence — move the Latin
   run to the end, or give it Persian words on both sides — never
   insert LRM/RLM (the ur precedent: the pseudo-locale's scrambling
   does not reproduce with real Persian text; don't "fix" the
   preview).
9. **Persian letterforms, strictly — one spelling per word.**
   ی (U+06CC) and ک (U+06A9) only — never Arabic ي (U+064A) or
   ك (U+0643); گ چ پ ژ are ordinary letters, covered by system fonts
   (rendering section). ة never appears — Arabic loans take ه or ت
   as actually written (رحمت، علاقه). Hamza per standard orthography:
   مسئله، مسئول، پایین (not پائین). NFC file-wide. Orthography
   follows the Academy (فرهنگستان) conventions **where they are
   genuinely lived, everyday-written Persian** — ZWNJ compounds,
   می‌ joined, the ها plural — and everyday forms where the Academy
   coinage is not (the test is what people actually type, not
   prescription: کامپیوتر, not رایانه). One spelling per word
   file-wide — read-aloud (`lib/speak.ts`) and every self-check
   grep depend on it.
10. **Digits are Western (0–9); the registry pins Intl — and the
    calendar deliberately stays Solar Hijri.** CLDR fa defaults to
    Eastern digits (۱٬۲۳۴) — like bn, unlike ur — AND to the Solar
    Hijri calendar. Interpolated values ({{count}}, {{hours}})
    arrive Western from the runtime, so hand-written Persian digits
    would mix systems mid-sentence — worse than either convention.
    So, the bn rule applied to fa: hand-written digits are Western,
    and the wiring pins every Intl call site via `intlLocale("fa")`
    → `fa-u-nu-latn` (the mechanism `languages.test.ts` already
    exercises for bn). **The pin touches digits only: the Solar
    Hijri calendar stays.** It is the living civil calendar in BOTH
    Iran and Afghanistan — dates render 1405/6/23-style, Persian
    calendar with Western digits — and flattening members' dates to
    Gregorian would be a worse foreignness than any digit. One
    honest compromise to record: month NAMES differ (Iranian
    فروردین… vs Afghan حمل…) and Intl renders the Iranian set — a
    known Dari compromise, disclosed, not papered over. Clock times
    and dates render via `Intl` only, never hand-formatted.
11. **Plurals — TWO forms, and `_one` covers BOTH 0 and 1.** CLDR
    Persian selects "one" for i = 0..1, exactly like hi and bn: **0
    takes the `_one` form**, so every `_one` string interpolates
    `{{count}}` and reads correctly at BOTH 0 and 1 — no hard-coded
    «یک …» in a `_one` key; the single-integer-category relaxation
    does NOT apply (both keys complete, both carrying `{{count}}`
    verbatim; never delete a `_one` key — the parity test fails the
    file). Persian's own seam is a relief: **nouns stay singular
    after a numeral** — «{{count}} ساعت» — never a ها plural after
    a counted number; the ها plural (ساعت‌ها) belongs to uncounted
    prose. People may take نفر: «{{count}} نفر». Read every family
    aloud at 0, 1, 2, 5.
12. **Dari inclusivity — one file, two countries.** Prefer
    vocabulary shared across Iranian Persian and Dari (the neutral
    دانشگاه register): همسایه، محله، کمک، ساعت، دفتر، الگو، جمع all
    travel. Where usage splits, the table decides and notes it:
    «اعلان» for a board post (more natural in Kabul, perfectly
    readable in Iran — the compound تابلوی اعلانات proves it
    everywhere); «گوشی» for the phone (Iran-marked but universally
    understood; موبایل acceptable where it reads better — one form
    per string family); never تخلص for pseudonym (in Afghanistan a
    تخلص is the surname). Avoid Tehran slang (باحال، اوکی) AND
    Kabul-only terms except the fenced حشر nod (rule 5). Persian
    local color travels — چای، بازارچه، کوچه — but nothing
    regime-adjacent and nothing Tehran-specific as universal; US
    references generalize to their plain function, as every sibling
    did.
13. **Punctuation and layout.** The Persian comma «،», semicolon
    «؛», and question mark «؟» accompany Persian text — never their
    Latin twins inside a Persian sentence; the full stop is the
    ordinary «.» (Persian convention, unlike Urdu's ۔). **Quotes are
    guillemets «…»** — Persian typography's own lived convention —
    with curly “ ” for nested and word-as-word quotes. Ellipsis is
    the single char …; em dash spaced « — »; headings, buttons, and
    chips take no terminal punctuation; no tatweel/kashida, ever.
    Persian runs modestly longer than en; the tight surfaces are
    known (bottom nav, the 3-up pill row at 375px) and decided short
    up front — nav **تابلو، تقویم، نبض، پیام‌ها، به عهدهٔ من،
    پروفایل**; pill row **نیازها / کمک هست / پروژه‌ها**. Overflows
    wrap, never truncate mid-word.
14. **"Understoria" is never translated** or transcribed (never
    آندرستوریا); same for file names, env vars, and `docs/…` paths
    quoted in strings. Interpolation placeholders `{{count}}`,
    `{{name}}`, `{{hours}}`… stay byte-for-byte identical (the
    parity test enforces this), with normal spaces around them.

## Script, typography and rendering

Facts verified for this glossary (recorded the way bn.md records its
digit wrinkle — binding on the fleet and the wiring step):

- **The invisibles gate relaxes for fa alone**: the fleet validation
  admits exactly U+200C (ZWNJ) and still rejects ZWSP, ZWJ, and all
  directional controls — full rule in rule 8. Direction comes from
  `<html dir>` via the registry; no string carries a bidi mark.
- **The Intl pin**: bare `Intl.NumberFormat("fa")` yields Eastern
  digits and `DateTimeFormat("fa")` the Solar Hijri calendar; wiring
  pins `intlLocale("fa") → fa-u-nu-latn` — Western digits, Persian
  calendar intact, Iranian month names (the recorded Dari
  compromise). Full rule in rule 10.
- **Plurals**: CLDR fa is `one`/`other` with "one" covering 0 AND 1
  — both keys present, both interpolating (rule 11).
- **Naskh rendering needs no CSS spike — the ar precedent holds.**
  Persian renders in the same Naskh style Arabic shipped with;
  system Arabic-script fonts on Android, iOS/macOS, and Windows
  cover گ چ پ ژ and ZWNJ shaping correctly. No `:lang(fa)` font
  block, no line-height floor, no webfont — none of ur's Nastaliq
  measures apply (Persian UI convention is Naskh, not Nastaliq).
- **RTL is already earned.** `dir: "rtl"` rides docs/rtl-plan.md
  R1–R3 plus the shipped ar and ur fleets; the `rtlShipped`
  expectation in `languages.test.ts` grows to `["ar","ur","fa"]` at
  wiring — a conscious, one-line, test-first change.
- **Unicode hygiene — NFC.** ی/ک are the Persian code points
  (U+06CC/U+06A9), never Arabic lookalikes; آ precomposed; files
  NFC-normalized before any grep (rule 9).

## Term table

Rows marked **⚠ review** are draft choices awaiting a native
reviewer; ban columns hold regardless.

| English | فارسی | Notes / DON'T use |
|---|---|---|
| mutual aid | همیاری | «ساعت‌های همیاری»; warm prose also «کمک به هم»، «دست به دستِ هم دادن». DON'T: تعاون (cooperative-ministry — rule 5), یاری‌گری (coinage), صدقه/خیرات/اعانه (charity — rule 5), کمک‌های بشردوستانه (aid-industry). |
| community | جمع | THE word (rule 3): «جمعِ شما»، «همهٔ جمع»، «به جمع خوش آمدید». DON'T: **سازمان/تشکیلات/گروهک** (security-file register — rule 6, absolute), جامعه (society-abstract), اجتماع (تجمع-adjacent), انجمن (official association), کامیونیتی. |
| timebank | بانکِ زمان | The transparent calque — Persian timebank initiatives use it themselves. Keep the SURROUNDING prose non-bank: «در بانک زمان، کمک خواستن هیچ‌وقت بسته نیست». DON'T: **صندوق زمان** (rule 4 — the قرض‌الحسنه syllable), حساب/موجودی flavor near it. |
| hours (the currency) | ساعت | «یک ساعت کمک یعنی یک ساعت — هر کاری که باشد.» Credit moves → «ساعت‌ها در دفتر نوشته شد» — plain book-entry, no banking verb. Singular after numerals (rule 11). DON'T: **اعتبار/کردیت** (loan register — rule 4), امتیاز (loyalty points), سکه (coins/game). |
| balance (the member's) | ساعت‌های شما | "Your balance is hours of help" → «ساعت‌های شما یعنی چقدر کمک رد و بدل کرده‌اید — ساعت‌های کمک.» DON'T: **موجودی** (rule 4 — the bank/recharge word), تراز (accounting), بیلان. |
| seed balance | بذرِ شروع | Keep the metaphor as es/hi/ru/ar/bn do: «ساعت‌های اولتان بذرِ شروع شماست». Chip: «بذر: {{hours}}»; plain in teaching prose: «همه با 5 ساعت شروع می‌کنند». DON'T: موجودی اولیه (bank-opening), سرمایه (capital), جایزه/پاداش (promo poison). |
| member | عضو | The unmarked generic covers everyone; plural اعضا. DON'T: کاربر (user), مشتری (customer), مشترک (telecom subscriber), شهروند (state address). |
| neighbor | همسایه | «همسایه‌های شما»; collective warmth: «در و همسایه»، «اهل محل» — the محله is Persian's natural mutual-aid unit; کوچه/سرِ کوچه imagery travels (rule 12). DON'T: ساکنین (municipal register), اهالی منطقه (census flavor). |
| vouch for (verb) | پشتِ کسی ایستادن | Argued hard. Kitchen reality: «من می‌شناسمش — پشتش می‌ایستم» is lived speech for putting yourself behind a person. Button: «پشتِ این عضو می‌ایستم»؛ «{{name}} پشت شما ایستاده است». RESERVED for vouching only. DON'T: **ضمانت/ضامن** (rule 4 — loan surety AND the bail posted for the arrested; doubly radioactive here), **پارتی/پارتی‌بازی** (string-pulling — hi's सिफ़ारिश exactly), توصیه (HR reference), معرف (the bank-form referee), **شهادت** (court testimony — and the martyrdom register; never), گواهی (certificate). |
| a vouch (the signed act) | ⚠ review — rephrase as a clause | «با امضای خودتان پشتش ایستاده‌اید»، «دو عضوِ مورد اعتماد باید پشتش بایستند». A native reviewer may land a tighter noun; the ban column above holds regardless. |
| vouches (count on trust chips) | {{count}} نفر پشتش ایستاده‌اند | One vouch = one distinct person, so count people: «مورد اعتماد ({{count}} نفر پشتش ایستاده‌اند)»، «{{have}} از {{need}} نفر پشت شما ایستاده‌اند». Both plural keys carry {{count}} (rule 11). |
| trust / trusted member | اعتماد / عضو مورد اعتماد | Chip: «مورد اعتماد»; new-member chip: «تازه‌وارد» (warm, no probation flavor). Web of trust: «شبکهٔ اعتماد». DON'T: تأییدشده (badge register — and تأیید is reserved for confirming exchanges), معتمدِ محل (elder-notable), احراز هویت (KYC officialese). |
| node (the server) | سرورِ جمع | The teaching gloss IS the term (ar pattern): «سرورِ جمع (سرور مشترکی که جمعِ شما خودش می‌گرداند)»; bare سرور once context is set. DON'T: نود (opaque), گره (a knot — the CS calque), سرور مرکزی (contradicts federation). |
| community node / peer nodes | سرورِ جمعِ شما / سرورهای جمع‌های دوست | دوست is federated friendship (id "sahabat", bn «বন্ধু নোড»). DON'T: سرورهای شریک (business partners), نودهای همتا (P2P jargon). |
| federation | جمع‌های دوستِ به‌هم‌پیوسته | Prefer the rephrasing in prose: "across the federation" → «میان جمع‌های دوست». DON'T: فدراسیون (sports bodies), اتحادیه (unions/state), ائتلاف (political coalition). |
| exchange | تبادل | «تبادلِ کمک»، «تبادل کامل شد»; warm prose: «کمک رد و بدل شد». DON'T: معامله (a deal — bazaar/bank), دادوستد (commerce), تراکنش (bank transaction), عملیات (security-operation register). |
| the commons (section) | مالِ همه | Kitchen-plain held-in-common: «این مالِ همهٔ جمع است». Section: «مالِ همه»; one item: «از مالِ همه». DON'T: اموال عمومی (state property), دارایی‌های مشترک (asset officialese), منابع (NGO resources). |
| tended (commons status) | در مراقبتِ جمع | Chip: «در مراقبت»; prose: «جمع به آن می‌رسد» — رسیدن به is the tending-the-garden verb. DON'T: نگهداری فنی (IT maintenance), تحت نظر (surveillance — never), مدیریت‌شده (managed). |
| retired (commons status) | در استراحت | Deliberate non-literal, the sibling move: «بگذارید کمی استراحت کند» honors the no-shame lifecycle (it can come back). DON'T: بازنشسته (pension office), منسوخ (obsolete — final), حذف‌شده (deleted). |
| In my care (nav) | به عهدهٔ من | Aligned with the claim family (next row): what I've taken on — عهده is responsibility with no owing sense. DON'T: کارهای من (task-manager — flattens care), مسئولیت‌های من (burden-officialese), زیر نظر من (surveillance shading). |
| claim (a post/task) | به عهده گرفتن | Taking it into one's care: button «این کار را به عهده می‌گیرم», prose «{{name}} به عهده گرفته است». DON'T: **ادعا** (the legal claim — the exact trap), رزرو (booking), تصاحب (seizure), قبول سفارش (gig-platform). |
| Grow another root (add-a-server flow) | ریشهٔ تازه‌ای بدوانید | ریشه دواندن is the lived taking-root idiom: «جمع مثل درخت، با ریشه‌های بیشتر محکم‌تر می‌شود». Mirrors es "Hacer crecer otra raíz". DON'T: سرور اضافه کنید، نصب سرور جدید (both flatten the metaphor to IT). |
| board | تابلو | Nav: «تابلو»; first-use gloss: «تابلوی اعلاناتِ جمع» — the cork board every school, mosque courtyard, and building entrance has. DON'T: بورد, فروم, دیوار (the FB wall calque), فید. |
| post (noun / verb) | اعلان / روی تابلو زدن | The paper notice — the compound تابلوی اعلانات proves اعلان everywhere, and it is the Dari-natural word too (rule 12): «اعلانتان را روی تابلو بزنید». Neutral «فرستادن» in technical sync prose. DON'T: **آگهی** (the paid classified — the Divar register), پست (Instagram), اطلاعیه (official notice from authority), انتشار (press register). |
| dashboard | نبض | The community's heartbeat, joining the sibling pulse family (Пульс، النبض، স্পন্দন، Souf): nav «نبض», title «نبضِ جمع» — warm lived Persian (نبضِ بازار، نبضش دستم است), no jargon, no collision; ar's نبض is a separate locale and each stands alone. DON'T: داشبورد (car/BI), **پیشخوان** (the government services counter — دفاتر پیشخوان دولت; real collision), میز کار. |
| needs (tab) / asks | نیازها / کمک خواستن | Pill: «نیازها» — everyday («چه نیازی دارید؟»); asking in prose is «کمک خواستن», unashamed and positive: «بخواهید — همسایگی همین است.» (rule 4 — no خجالت framing, even negated). DON'T: تقاضا (market-demand economics), درخواست رسمی flavor, احتیاج (destitution shading — نیاز is cleaner). |
| offers (tab) | کمک هست | "Help is here" — the sw "Msaada upo" move, because the honest noun is reserved: پیشنهاد only ever means a governance proposal. Prose: «آنچه دیگران می‌توانند بدهند»، «بگویید چه کمکی از دستتان برمی‌آید». DON'T: پیشنهاد (reserved), آفر (promo loan), خدمات (what a company sells — help between members is کمک). |
| project | پروژه | The everyday word — school and building projects alike. **طرح is banned**: in Iranian news the طرح IS the state scheme (هر طرحِ دولتی) — the inverse twin of bn banning প্রকল্প. Pill: «پروژه‌ها». DON'T: طرح, برنامه (programme — NGO/state register). |
| task | کار | «یک کار کوچک» — everyday and warm. DON'T: تسک (corporate anglicism), وظیفه (duty — burden register), تکلیف (homework/assignment from authority). |
| template | الگو | The pattern word — warm, standard, both countries: «از یک الگو شروع کنید»، «الگوها». DON'T: تمپلیت, فرم (the government-window paper); قالب is acceptable Persian but one term per concept — this file's is الگو. |
| work day | روزِ کارِ جمعی | «روز کار جمعی — {{project}}»; gloss on first use: «روزی که همسایه‌ها دورِ یک کار جمع می‌شوند». Teaching prose MAY nod once to **حشر**, named as the beloved Afghan custom — exactly this concept — never as the term (rule 5: for Iranian readers bare حشر is Judgment Day). DON'T: حشر as the term, روز کاری (HR), کارگاه (workshop — NGO register), **بیگاری** (forced labor — absolute; ar's سخرة ban). |
| shift | نوبت | The everyday turn word: «نوبتِ صبح»، «شما در این نوبت هستید». The clinic-queue sense (نوبت دکتر) was checked: the same everyday turn-taking word, adjacent but unpoisoned — warmth wins. RESERVED: نوبت only ever an event shift or a rota turn. DON'T: شیفت (factory/hospital roster), کشیک (guard-duty/on-call register). |
| sign-up (for a shift) | اسم نوشتن | The paper sign-up-sheet idiom: «در نوبت صبح اسم بنویسید»، «اسمتان را بردارید». RESERVED for shifts (RSVP is its own row). DON'T: **ثبت‌نام** (the registration counter — کنکور/سرشماری officialese), نام‌نویسی (school-enrollment flavor). |
| RSVP | خبر بدهید می‌آیید یا نه | Heading: «می‌آیید؟»؛ «جوابِ شما: {{status}}»; statuses «می‌آیم / شاید / نمی‌آیم». The family ALWAYS carries آمدن — bare جواب stays free for message replies (a real collision). DON'T: keep "RSVP" (opaque), اعلام حضور (badge-desk officialese), اسم نوشتن (collides with shifts). |
| rota (care rota) | نوبتی رسیدگی کردن | «همسایه‌ها نوبتی به آن می‌رسند»؛ a rota slot: «حالا نوبتِ شماست». DON'T: جدول کشیک (duty roster), برنامهٔ نگهبانی (guard rota). |
| proposal | پیشنهاد | Page: «پیشنهادها»؛ «پیشنهادی برای جمع». RESERVED: bare پیشنهاد only ever means a governance proposal (an offer of help is never پیشنهاد — see offers). DON'T: طرح (banned), قطعنامه (UN/parliament resolution), لایحه (legislature), مصوبه (enactment). |
| affirm / block / abstain (votes) | موافقم / جلویش را می‌گیرم / نظری ندارم | «{{count}} نفر موافق‌اند»؛ blocking carries its reason: «چرا جلویش را می‌گیرید؟» — keeps بلاک reserved for contacts. DON'T: تصویب (ratification from above), رأی‌گیری register (parliamentary), وتو, ممتنع (parliament jargon). |
| block (a contact) | بلاک | The universal app word (Instagram/Telegram fa speech): «این مخاطب را بلاک کنید»، «آنبلاک». RESERVED for contacts; a proposal is «جلویش را گرفتن» (previous row). DON'T: **مسدود کردن** (the state's filter word — سایتِ مسدود؛ lived censorship register), لیست سیاه (blacklist shame). |
| flag (an exchange/comment) | با جمع در میان گذاشتن | The community-review framing with no informer register: «چیزی درست نیست؟ با جمع در میان بگذارید — همه با هم نگاه می‌کنند»; chip: «در بررسیِ جمع». DON'T: **گزارش دادن/گزارش کردن** (report-to-authority — rule 6, exactly the register this app refuses), **خبرچینی** (the informer — never), شکایت (complaint to authority), اعلام تخلف (violation-report boilerplate). |
| dispute | اختلاف‌نظر | Page: «اختلاف‌نظرها» — the everyday talked-through phrase, no courtroom in it; status: «جمع دارد با هم حلش می‌کند». DON'T: دعوا (fight/lawsuit), شکایت (complaint), **پرونده** (the case file — rule 6), منازعه (escalation), داوری (arbitration bench). |
| removal / reinstatement | کنار گذاشتن از جمع / بازگشت | Heavy and honest, no shame theater: «کنار گذاشتنِ یک عضو از جمع»؛ return: «بازگشتِ {{name}} — جمع دوباره پذیرفت». بازیابی is RESERVED for account recovery, so member return never uses it. DON'T: **اخراج** (expulsion/deportation — rule 6), طرد (ostracism), حذف (deleting a person), **تصفیه** (the purge — rule 6, never), تبعید (exile). |
| guardian (shard holder) | امانت‌دار | RESERVED WORD: امانت‌دار only ever means a recovery-shard holder — the keeper of an امانت, something handed over in trust («امانت‌دارِ کلیدتان»). Gloss on first use: «امانت‌دارها — هر کدام یک تکه از کلیدِ بازگشت شما را نگه می‌دارند». DON'T: **قیم** (legal guardianship of minors — the courtroom trap), **سرپرست** (the custody form — سرپرست خانوار), **ولی** (legal-religious guardian — and ولی فقیه makes it radioactive; never), نگهبان/محافظ (a guard — security register), **ضامن** (rule 4). |
| recovery kit | بستهٔ بازگشت | The promise is return, not backup: «بستهٔ بازگشت (فایلی یا برگه‌ای که اکانتتان را روی دستگاه نو برمی‌گرداند)». Verb family برگشتن/برگرداندن: «اکانتتان را برگردانید»; the technical noun بازیابی is RESERVED for account recovery only («بازیابی اکانت»). A shard: «تکه‌ای از کلید». DON'T: کیت ریکاوری (opaque), نسخهٔ پشتیبان bare (flattens the promise), جعبهٔ کمک‌های اولیه flavor. |
| password / passphrase | رمز عبور / عبارت عبور | رمز عبور is the lived written form (rule 7); gloss on first use: «عبارت عبور (رمز عبوری بلند از چند کلمه)». DON'T: گذرواژه (coinage members don't text), پسورد in writing, کلمهٔ رمز (bank-PIN flavor), عبارت بازیابی (crypto-wallet register — and a fatal collision with OUR seed metaphor). |
| passkey | پاس‌کی | Transliterated, with the platform-sheet gloss (rule 7): «پاس‌کی — گوشی شما شاید آن را "گذرکلید" یا "passkey" بنامد؛ با اثر انگشت، چهره، یا PIN دستگاه باز می‌شود». Mind the ZWNJ in پاس‌کی. DON'T: کلید مخفی (blurs into key vocabulary mid-security-flow), bare Latin with no gloss. |
| ledger | دفترِ مشترکِ جمع | The shared record book — دفتر is the warm notebook: «در دفتر مشترک جمع نوشته شد». Device-local: «دفترِ خودِ این دستگاه». DON'T: **دفترِ نسیه / دفتر بدهی** (the shop-credit book — rule 4, the register this app exists to refuse), دفترچه (the bank passbook / clinic booklet), دفتر کل (accounting), بلاکچین flavor. |
| milestone | گامِ بزرگ | «جمع گامِ بزرگی برداشت» — a step taken together, the ht "yon gwo pa" move. DON'T: **ایست بازرسی** (a real checkpoint — rule 6), نقطهٔ عطف (report-speak; literary fallback at most), هدف محقق شد (KPI register). |
| skills | مهارت‌ها | Headings prefer the kitchen framing: «چه کارهایی از دستتان برمی‌آید؟» — از دست برآمدن is the lived competence idiom, the neighborly phrase itself; compact field label «مهارت‌های شما». DON'T: تخصص (credentials), سوابق (the record/file word — سوءسابقه adjacency), صلاحیت (vetting register — never). |
| helper (person in an exchange) | کسی که کمک کرد | «ساعت‌ها به نامِ کسی که کمک کرد نوشته شد»؛ compact field: «کمک‌کننده». DON'T: **داوطلب** (rule 5 — the NGO volunteer), **امدادگر** (relief-corps register — rule 5), خدمتکار (servant — the pembantu trap), کارگر (laborer), ارائه‌دهندهٔ خدمات (service provider — poison). |
| panic (the emergency wipe) | خطر بیخِ گوش | The lived right-at-your-ear idiom: heading «خطر بیخِ گوش»؛ gloss on first use: «اگر خطر بیخ گوشتان است — همه‌چیزِ این دستگاه را همین حالا پاک کنید». The Emergency section is «برای وقتِ خطر»; urgent things elsewhere are «فوری». DON'T: **وضعیت اضطراری** (state-of-emergency — rule 6), **آژیر خطر** (air-raid siren — rule 6), دکمهٔ پانیک (clinical), SOS مود. |
| soft purge / hard purge | پاک کردنِ نیمه (پنهان کردن هویت) / پاک کردنِ کامل (همه‌چیز) | One پاک کردن family, kitchen-plain (تخته را پاک کردن), honest about the difference: نیمه strips identifying text and keeps the signed دفتر; کامل wipes keys and rotates identity. DON'T: **پاکسازی/تصفیه** (the purge — rule 6, never for any wipe), حذف mixed into the family (one family only), ریست فکتوری confusion. |
| read aloud (feature) | با صدای بلند خواندن | The promise, not the spec — what a family member does for someone who can't read the screen: toggle «خواندن با صدای بلند»، «اپ با صدای بلند برایتان می‌خواند». DON'T: تبدیل متن به گفتار (TTS spec), دستیار صوتی (a different product). |
| seed vault | انبارِ بذر | انبار is the granary/storeroom word — warm and exact: «این دستگاه انبارِ بذرِ جمع است — همهٔ تاریخچه را نگه می‌دارد». DON'T: **گاوصندوق** (bank safe), **صندوق** anything (rule 4), مخزن (industrial tank), سرور پشتیبان (flattens the metaphor). |
| storm hub | خانهٔ روشن | The lit house in the dark street (the ru «огонёк» / ar «البيت المضيء» / ur «روشن گھر» lineage — and Persian's own چراغِ روشن warmth): «وقتی برق و اینترنتِ همه رفته — خانه‌ای که هر دو را دارد و همسایه‌ها می‌توانند بیایند: خانهٔ روشن». Requires its first-use gloss. DON'T: **پناهگاه** (the air-raid shelter of the war years — rule 6), **اردوگاه** (the camp — displacement), **قرارگاه/ستاد** (military/state-crisis HQs — rule 6), مرکز طوفان (the storm's own eye — the trap every sibling dodged). |
| One small thing | یک کارِ کوچک | Button: «یک کار کوچک نشانم بده» — کوچک is the disarming softener. The "drawn at random, never ranked" copy: «همین‌طوری از میان کارهای باز انتخاب می‌شود — نه رتبه‌ای در کار است، نه سابقه‌ای». Don't inflate. |
| Ways to plug in | کجا آستین بالا بزنیم | آستین بالا زدن is Persian's own pitch-in idiom — physical, warm, everyday. DON'T: فرصت‌های مشارکت (officialese), فرصت‌های داوطلبی (rule 5 — doubly banned), «به ما بپیوندید» (recruiting page AND corporate ما). |
| celebrate / gathering (social) | جشن گرفتن / دورِ هم بودن | «همه با هم جشن می‌گیریم»؛ the social category ("get-togethers and good company") is «دورِ هم جمع شدن» — دورهمی is the beloved lived word, fine in prose. DON'T: مراسم (formal function), **تجمع** (rule 6 — the charge sheet's word; never for a party), گردهمایی (conference register). |
| organizer / operator | برگزارکننده / گردانندهٔ سرور | The organizer stays human: «کسی که شروعش کرد»؛ the operator: «کسی که سرور را برای جمع می‌گرداند — اختیاراتش روشن، حدودش روشن» (گرداندن is the running-the-shop verb, unbossy). DON'T: **ادمین/مدیر** (contradicts no-admins; a مدیر is a boss), **مسئول** (the official — مسئولین is the authorities; rule 6), اپراتور (telecom carrier collision), متصدی (counter clerk). |
| founder / co-founder | بنیان‌گذار / هم‌بنیان‌گذار | «بنیان‌گذارِ این جمع». Mind the ZWNJs. DON'T: مالک (owner), رئیس (a boss — «اینجا رئیس نداریم»). |
| display name | نامی که صدایتان کنند | Label: «نام شما (اسم واقعی لازم نیست — نام مستعار هم می‌شود)». Never تخلص (in Afghanistan the surname — rule 12). DON'T: نام کاربری (username), لقب (honorific), **اسم رمز** (code-name — informant-file register), نام مستعار as the LABEL alone (fine in the parenthetical; police-file flavor if it leads). |
| invite (noun + verb) | دعوت / دعوت کردن | The everyday guest word, warm: «کسی را که می‌شناسید دعوت کنید»، «چه کسی شما را دعوت کرد». One family, greppable. DON'T: **عضوگیری** (recruitment — the political-organization word), لینک معرفی (referral growth-hacking), احضار (a summons — never). |
| owed help | در انتظار تأیید شما | Badge: «در انتظار تأیید»؛ «{{hours}} در انتظار تأیید شما». Deliberately NOT طلب/بدهی/بستانکار — the app refuses debt framing (rule 4). |
| pair / link a device | پیوند دادن / کد پیوند / دستگاهِ پیوندشده | Added by the fleet reconciliation (the table shipped without a row and four coinages appeared). پیوند is the grafting/bonding word — warm, exact. وصل stays reserved for connecting to the *server*; تأیید stays reserved for exchange confirmation, so approving a device is اجازه دادن and a fingerprint match is مطابقت. DON'T: جفت کردن (mating overtone), اتصال دستگاه (telecom register). |

### Errata from the UI fleet reconciliation

Recorded after the six-chunk fleet was reconciled; the review cycle
should confirm these alongside the table above.

- **Arrows mirror fully** (ur precedent): every en `→` renders `←`
  (nav paths read `A ← B ← C`; forward links trail «←») and every
  en `←` renders `→` (back links lead «→ برگشت …»). `↑↓` stay
  literal. Back links use **برگشت** — بازگشت is reserved for a
  removed member's *reinstatement* and the recovery-kit family.
- **Dialog dismiss is «انصراف»**; لغو only cancels a thing (an
  event, a request). Paste is the lived loanword **پیست** — چسباندن
  reads as glue.
- **"Transcribe" carries two coinages on purpose**: the Settings
  section «پیاده کردن صدا» (its own en string) and the per-clip
  button «تبدیل به نوشته». Quotes now name the surface they point
  at; a native reviewer should pick one family and update both.
- **Settings → Security renders «امنیت»** — judged rule-6-safe: the
  plain noun on every phone's settings screen, not the apparatus
  adjective امنیتی (which stays banned). Reviewer may confirm.
- Spelling unified: **جست‌وجو** (not جستجو), **خوشامد** (not
  خوش‌آمد), **مهروموم** (not مهر و موم).

Recorded after the corpus fleet (the authored-content round):

- **«اسم نوشتن» extends to physical sign-up sheets.** The UI reserves
  it for shifts; the corpus fleet independently reached for it for
  paper sign-up sheets (a voter-drive clipboard, a lesson-slot sheet
  at the space) — the same gesture of writing your name on a list.
  Sanctioned as one deliberate extension; app-side enrollment stays
  fenced (school enrollment is نام‌نویسی, its literal register).
- **Addiction recovery is بهبودی** — the reserved-word fence on
  بازیابی is a UI-vocabulary rule (account recovery only); recovery
  in the recovery-peer-support sense is the ordinary بهبودی.
- **Physical lending uses the امانت verb family** (امانت گرفتن /
  امانت دادن / مبلغ امانتی for a tool deposit) — the living Persian
  borrow-a-thing words once قرض is banned. Hours NEVER borrow, and
  the noun امانت‌دار stays reserved for shard guardians.
- **خیریه survives only when naming an actual external charity**
  (rule 5's own carve-out — free-store's thrift partners, the study
  prompts' charity-model contrast); it never frames the app or its
  help.

## Known hard strings

- **In my care** (`nav.myWork`, `myWork.title`) → «به عهدهٔ من» —
  the claim family (به عهده گرفتن) carried into the nav pill; عهده
  is responsibility without the owing sense rule 4 watches for.
- **Grow another root** (`growRoot.title`, `dashboard.resilience.cta`)
  → «ریشهٔ تازه‌ای بدوانید» — ریشه دواندن keeps the metaphor
  botanically alive instead of flattening it to server admin.
- **Dashboard** (`nav.dashboard`, `dashboard.title`) → «نبض» /
  «نبضِ جمع» — fa joins the sibling pulse family; پیشخوان (the
  government counter) is the trap it dodges.
- **The unit of progress is us, not me** (`dashboard.tagline`) →
  «واحدِ پیشرفت “ما”ست، نه “من”.» — the ما/من pair does in Persian
  what us/me does in English (nested curly quotes per rule 13).
- **You start with credit** (`welcome.screens.credit.title`, body) →
  «از همان اول ساعت دارید» — credit becomes hours everywhere
  (rule 4); the body keeps «همه با 5 ساعت شروع می‌کنند» and closes
  «خواستن عادی است — همسایه‌ها همین‌طور به هم کمک می‌کنند.»
- **One hour of help = one hour of credit** (`postForm.fieldHoursHint`,
  `hints.balance.message`, `direct.form.hoursHint`) → «یک ساعت کمک
  یعنی یک ساعت — هر کاری که باشد.» — the equation never grows a
  money word.
- **Credits have flowed between you** (`toast.exchangeConfirmedComplete`,
  `postDetail.actionsCompleted`) → «تأیید شد. ساعت‌ها در دفترِ هر دو
  نوشته شد.» — plain book-entry motion, no banking verb.
- **{{hours}} waiting on your confirmation**
  (`profile.balance.awaitingYouLine`) → «{{hours}} در انتظار تأیید
  شما» — the owed-help family, never طلب. (Carry ht's erratum: this
  key and `pendingLine` receive a PRE-FORMATTED "+2h" value, so the
  string appends no unit; only keys receiving bare numbers carry
  «ساعت».) Its sibling `footerNote` — "Balances can go negative —
  asking is never gated" — is «ساعت‌ها می‌توانند منفی شوند — خواستن
  هیچ‌وقت بسته نیست.»: منفی is arithmetic, never بدهکار.
- **Show me one small thing** (`board.oneSmallThing.button`) →
  «یک کار کوچک نشانم بده»; its why-copy (`board.oneSmallThing.why`)
  keeps «همین‌طوری انتخاب می‌شود — نه رتبه‌ای، نه سابقه‌ای» (سابقه
  named plainly and denied: no dossier is kept).
- **A new understoria** (`dashboard.categoryBreakdown.emptyTitle`) —
  the brand pun can't transliterate; render the understory image:
  «چیز تازه‌ای دارد سبز می‌شود» — "Understoria" itself never
  respelled (rule 14).
- **Tended commons** (`projects.statusTended`,
  `projects.momentum.tended`) → chip «در مراقبت» — the verb family
  you use for a garden or an ailing neighbor («جمع به آن می‌رسد»).
- **storm hub** (`infra.drills.stormHub.title`, `print.kit.setup.body`)
  → «خانهٔ روشن» (drill: «تمرینِ خانهٔ روشن») — refuge THROUGH the
  storm; never پناهگاه, never اردوگاه, never مرکز طوفان.
- **Resilience tiers** (`dashboard.resilience.tier.*`) — Seedling /
  Taking root / Sturdy / Deep-rooted → «نهال / در حال ریشه دواندن /
  استوار / ریشه‌دار» — one botanical family with the growRoot
  strings; ریشه‌دار is itself a lived compliment.
- **vouch** (`member.vouchButton`, `trust.trustedWithCountOne/Other`,
  `hints.invite.message`) → the «پشتِ کسی ایستادن» family — standing
  behind someone with your own name, kept clean because ضمانت/ضامن,
  پارتی, شهادت, and every money word around it are banned file-wide.
- **guardians** (`guardians.title`, `guardians.intro`) →
  «امانت‌دارها» — the entrusted-keeper word; both halves of the
  legal-guardian register (قیم AND سرپرست) are banned, and ولی is
  banned twice over.
- **compelled biometrics** (`welcome.protect.passphraseDoorBody`) —
  full force, no euphemism, no ta'arof: «کلمه‌هایی که تایپ می‌کنید.
  اگر چند نفر اثر انگشت یا PIN این گوشی را دارند — یا اگر ممکن است
  کسی انگشتتان را به‌زور روی گوشی بگذارد — این را انتخاب کنید. در
  خیلی جاها می‌توانند انگشت را به‌زور بگیرند، اما کلمه‌های توی ذهن
  شما را نه.» The panic strings (`profile.emergency.*`) take the
  same register: «دو راه برای وقتی که خطر بیخِ گوش است. هیچ‌کدام با
  هیچ سروری تماس نمی‌گیرد — همه‌چیز روی همین دستگاه اتفاق می‌افتد.»
- **flag an exchange** (`postDetail.actionsFlag`,
  `profile.history.postFlagTitle`, `directFlagTitle`) → «چیزی درست
  نیست؟ با جمع در میان بگذارید» — putting-before-the-community; the
  body keeps «اینجا ادمینی نیست؛ این آغاز یک گفتگو است، نه مجازات».
  گزارش — zero hits (rule 6).
- **Removals and reinstatements** (`removals.title`, `removals.intro`)
  → «کنار گذاشتن و بازگشت» — the heaviest page stays in the
  community's own voice: co-signing is «امضای خودتان پای این تصمیم
  می‌رود», never a حکم, never a پرونده.

## Quick self-check for translators

- Would a neighbor text you this string over چای? If it reads like a
  bank SMS, an NGO report, a state broadcast, or a courtroom, redo
  it (rules 2, 5, 6).
- `grep` for تو forms — bare imperatives (بنویس، بفرست، برو) and تو
  as address — zero hits; the member is شما with plural verbs,
  uniformly (rule 1). No ta'arof: قربان، مخلص، خواهش می‌کنم as
  padding, تعارف — zero hits; لطفاً only where en itself pleads
  (rule 2). خواهشمند است، مستدعی است، احتراماً، اینجانب — zero hits.
- `grep` for بدهی، بدهکار، قرض، وام، نسیه، طلب، طلبکار، بازپرداخت،
  قسط، بهره، گرو، وثیقه، موجودی، اعتبار — zero hits outside the
  explicit debt-rejection lines, where the ONE sanctioned formula is
  «کمک خواستن بدهی نیست — نه قرضی در کار است، نه طلبی.» and the gift
  line is «هدیه است، نه قرض.» (rule 4). Owed help is «در انتظار
  تأیید شما». No خجالت framing around asking, even negated.
- `grep` for صندوق، قرض‌الحسنه — zero hits, anywhere, ever (rule 4 —
  the timebank is never a fund; the vault is انبار).
- `grep` for صدقه، خیرات، اعانه، احسان، خیریه، سمن، مردم‌نهاد،
  ذی‌نفع، توانمندسازی، بشردوستانه، امدادگر، داوطلب، خدمتکار — zero
  hits; helpers are «کسی که کمک کرد», help is کمک between equals
  (rule 5). حشر only as the single fenced Afghan nod in authored
  prose, if at all.
- `grep` for گزارش، خبرچین، احضار، بازجویی، حکم، پرونده، محاکمه،
  تصفیه، پاکسازی، اخراج، طرد، ایست بازرسی، پناهگاه، اردوگاه،
  قرارگاه، ستاد، وضعیت اضطراری، آژیر، مسئولین، مقامات، عضوگیری،
  تجمع، راهپیمایی، مسدود — zero hits (rule 6; the protest word is
  اعتراض, contacts are بلاک, flagging is «با جمع در میان گذاشتن»).
- `grep` for جامعه، اجتماع، انجمن، سازمان، تشکیلات، گروهک،
  کامیونیتی — zero hits; the community is جمع (rule 3). Corporate ما
  as the app's voice — zero hits outside the translation-honesty
  note; inclusive we is «همهٔ ما / همه با هم».
- `grep` for کاربر، مشتری، مشترک، شهروند — zero hits; members are
  اعضا. Same for قیم/سرپرست/ولی (shard holders are امانت‌دارها),
  ضمانت/ضامن/پارتی/شهادت near vouching (vouching is «پشتِ کسی
  ایستادن»), ادعا (claiming is «به عهده گرفتن»), طرح (projects are
  پروژه), آگهی (a post is اعلان), پیشخوان (the dashboard is نبض),
  ثبت‌نام (shift sign-up is «اسم نوشتن»), معامله/دادوستد/تراکنش
  (exchanges are تبادل).
- Reserved words hold: پیشنهاد only ever governance; نوبت and «اسم
  نوشتن» only ever shifts (RSVP carries آمدن); بلاک only ever
  contacts; بازیابی only ever account recovery (member return is
  بازگشت); امانت‌دار only ever a shard holder; تأیید only ever
  confirming; «پشتِ کسی ایستادن» only ever vouching.
- Invisibles: `grep -P '[\x{200B}\x{200D}\x{200E}\x{200F}\x{2066}-\x{2069}]'`
  — zero hits; **ZWNJ (U+200C) present exactly where orthography
  requires it** — می‌/نمی‌ always joined by ZWNJ, ها plurals and
  compounds per rule 8, never decorative. Persian letterforms only:
  ی (U+06CC), ک (U+06A9); `grep` for ي، ك، ة — zero hits. Files
  NFC-normalized; one spelling per word (مسئله، پایین) (rule 9).
- `grep` for Eastern digits `[۰-۹٠-٩]` — zero hits; digits are
  Western (rule 10), and the wiring pins `intlLocale("fa")` →
  `fa-u-nu-latn` so Intl output matches — while the Solar Hijri
  calendar stays (dates 1405/6/23-style; Iranian month names are
  the recorded Dari compromise).
- `{{…}}` placeholders identical to en; every `_one` key present and
  carrying `{{count}}`, reading correctly at BOTH 0 and 1 (fa `_one`
  covers 0 — rule 11); nouns singular after numerals ({{count}}
  ساعت), نفر for people, ها plurals only in uncounted prose.
- Persian punctuation with Persian text: «،» «؛» «؟», the ordinary
  «.», guillemets «…» with nested “ ”, the single-char …, spaced
  em dash; no terminal punctuation on buttons and chips; no kashida
  (rule 13). Nav and pill labels stay short and wrap rather than
  truncate.
- "Understoria" untouched — never آندرستوریا (rule 14).
- **This file's choices are a first draft pending native review** —
  the review updates this glossary first, then the strings; the ban
  rows are load-bearing regardless, and any replacement term must
  still avoid them. Ideally the review pairs one Iranian and one
  Afghan reader — rule 12's calls are exactly the rows they should
  read side by side.
