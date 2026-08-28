# Tibetan (bo) translation glossary — DRAFT pending native review

Reference for every bulk-translation and review pass over `bo.json`
and the Tibetan content modules. Decisions here get applied ~2,900
times — when in doubt, pick the word a Tibetan-speaking neighbor
would say across a kitchen table, not the word an official document,
a bank notice, or a bureaucratic circular would use.

**Why this language, now.** Tibetan was moved ahead of Urdu in the
Wave 3 queue in response to the 2026 flood disaster: communities
standing up nodes in the affected region need the app in the
language of the home. Chinese (`zh`) already ships with the full
authored corpus and covers the emergency meanwhile; Tibetan is the
language this app would otherwise never be offered in.

**Draft status — read this first.** This glossary is a first draft
written without a native reviewer in the loop. Tibetan is a
lower-resource language than any the app has shipped, and the
translation that follows it will need native-speaker review MORE
than any before it (`reviewStatus: "new"` discloses this in
Settings, as everywhere). Rows marked **⚠ review** are considered
choices that a native reviewer should confirm or replace; the **ban
rows are load-bearing regardless** — they mark registers this app
must never speak in, and any replacement term must still avoid them.

**Locale code is `bo`** (language-only): browsers send `bo`,
`bo-CN`, `bo-IN`; i18next's language-only fallback resolves them
all. One `bo` serves readers of the written standard across Ü-Tsang,
Kham and Amdo, and the worldwide diaspora — spoken dialects diverge
widely, but the written language (ཡིག་སྐད་) is shared, and that is
what this file targets. **Tibetan is left-to-right**: none of the
RTL machinery applies. It has its own typography section instead —
see "Script, typography and rendering" before writing any string,
and rule 9 before anything with a `{{count}}`.

## Global register decisions

1. **Warm plain written Tibetan — the shared written standard,
   never officialese.** The base is standard written Tibetan as
   read across all three regions and the diaspora: short sentences,
   everyday vocabulary, the register of a good explainer written
   for neighbors. Banned outright: bureaucratic circular register
   (the piled-up nominalizations of official documents), legal-code
   phrasing, and — this matters for `bo` specifically — **calques
   of Chinese administrative officialese**, which mark text as
   government prose to every reader. The test for every string:
   would a neighbor write this word in a note left on your door?
2. **Address: ཁྱེད་རང་, with plain-register buttons.** The member
   is always ཁྱེད་རང་ (the standard polite "you" — never bare ཁྱོད་,
   which reads curt in writing, and never elaborate honorific
   stacking, which reads as court etiquette). Verbs addressing the
   member in prose may take a light honorific (…གནང་རོགས། for a
   genuine request), used sparingly — warmth, not ceremony.
   **Buttons and menu items take the bare verb or verbal noun**
   (ཉར་ཚགས། གཏོང་། — see the typography section for the shad),
   matching the Russian-infinitive / Arabic-masdar convention:
   short, register-neutral, gender-free by construction. Tibetan
   verbs do not inflect for gender — one of several ways this
   locale is structurally simpler than Arabic was.
3. **Who is speaking.** (a) Buttons: bare verb (rule 2). (b) When
   the APP speaks, prefer agentless constructions — Tibetan does
   this naturally (ཉར་ཚགས་བྱས་ཟིན། "saved") — or name the real
   actor: the app (མཉེན་ཆས་), the server, the community.
   (c) **Corporate "we" is banned as the app's voice** — ང་ཚོ་ with
   no company behind it is a lie. It survives only where en itself
   unmistakably speaks as the people who made the software. A "we"
   that includes the member is the whole community (ཚོགས་སྡེ་ཡོངས་).
4. **No-shame framing — the debt ban.** Never debt vocabulary for
   exchanges: no བུ་ལོན་ (debt/loan), no repayment framing
   (འཇལ་), no interest, no arrears. "Credit"/"credited" is always
   hours counted (ཆུ་ཚོད་བརྩིས་); owed help is waiting for your
   confirmation, never owed anything. Debt words may appear ONLY
   where en itself explicitly rejects debt framing ("this is not a
   loan" — འདི་བུ་ལོན་མིན།).
5. **Charity and hierarchy — banned as framing.** Help between
   members flows between equals: རོགས་པ་ / རོགས་རམ་ (help), never
   charity flowing downhill. Banned: སྦྱིན་པ་ (alms-giving — a
   religious merit act, precisely the hierarchy this app refuses as
   its frame), relief-NGO register (ཛ་དྲག་རོགས་སྐྱོབ་), and
   volunteer-sector framing (helpers are རོགས་པ་བྱེད་མཁན་ —
   neighbors who helped — not volunteers-as-institution). The app's
   voice is warm but confessionally neutral: everyday politeness
   like ཐུགས་རྗེ་ཆེ། is universal and welcome; liturgical formulas,
   prayers and merit vocabulary are not the software's voice —
   members write however they speak, app strings stay neutral.
6. **Politically- and security-marked vocabulary — the standing
   ban list.** This locale serves members for whom these words are
   not abstractions, on either side of a hard border. Banned:
   **ཨུ་ལག་** anywhere near work days (corvée — the historical
   forced-labor word; the exact parallel of Arabic's سخرة ban);
   **སྒྲིག་འཛུགས་** for the community or any group (the
   "organization" of political organizations — loaded in both
   directions; the community is ཚོགས་སྡེ་, full stop);
   **འཐབ་རྩོད་** (struggle) and **ལས་འགུལ་** (campaign/movement)
   for any app concept — political-campaign register; projects are
   ལས་གཞི་; **informer/report-to-authority framing** for flagging —
   ཞུ་གཏུག་ (petitioning authority) and any tip-off register are
   never the flag verb (see the flag row: flagging is showing a
   thing to the community, together); police/state-security
   register generally — safety strings speak of members being safe
   (བདེ་འཇགས་), never of security enforcement. When in doubt,
   prefer the household word over any word you have mostly seen in
   news or government prose.
7. **Loanword policy — three tiers.** (a) Proper nouns, codes and
   technical literals stay in Latin verbatim: Understoria, QR (QR
   ཨང་རྟགས་), Wi-Fi, VPN, URL, email addresses, file paths,
   `.ics`. (b) Established Tibetan tech words win over coinages:
   མཉེན་ཆས་ (app/software), ཁ་བྱང་ (address), གསང་ཨང་ /
   གསང་ཚིག་ (password/passphrase — see the term table), དྲ་རྒྱ་
   (network/internet), པར་ (photo), ཡིག་ཆ་ (file/document). (c)
   Where a natural everyday Tibetan word exists it wins over both
   a loan and a stiff literary coinage. The test is always "which
   word would the neighbor actually write in a note."
8. **Digits are Western (0–9) in hand-written strings.** Tibetan
   digits (༡༢༣) are beautiful but interpolated values ({{count}},
   {{hours}}) arrive as Western digits from the runtime, and mixing
   ༣ and 3 in one sentence is worse than either convention. Numbers
   that flow through `Intl` must be checked at the call site during
   the fleet (`Intl.NumberFormat("bo")` digit behavior varies by
   engine — pin Latin digits if it produces Tibetan ones). Clock
   times and dates render via `Intl`, never hand-formatted.
9. **Plurals — ONE form. The simplest system the app ships.**
   CLDR Tibetan has a single category: `other` covers every number
   (verified against `Intl.PluralRules("bo")`: 0 through 1000, all
   `other` — Chinese is the shipped precedent for everything this
   implies). Every English `_one`/`_other` pair becomes ONE bo
   key, and **it must carry `{{count}}` verbatim** — with only one
   category there is no single-integer exemption; the
   counts-never-lie gate requires the number in every counted
   phrase. Tibetan grammar helps: nouns do not inflect for number,
   so ཆུ་ཚོད་ {{count}} reads correctly for any count.
10. **"Understoria" is never translated** or transcribed into
    Tibetan script. Same for file names, env vars and `docs/…`
    paths quoted in strings.

## Script, typography and rendering

Findings from the R4+ rendering spike (probe page at the app's real
Tailwind metrics, Noto Serif Tibetan, Chromium):

- **Line-breaking needs nothing from translators.** Tibetan writes
  no spaces between words; the browser breaks lines after the
  tsheg (་), and the spike verified clean 3-line wrapping in a
  narrow container with zero markup. **Never insert spaces, ZWSP
  (U+200B) or any invisible character to force a break** — the
  same ban, for the same reasons, as Arabic's rule 13: invisible
  characters break greps, diffs and read-aloud.
- **Vertical metrics are the one real risk.** Tibetan stacks grow
  tall (བསྒྲུབས་) and deep; at the app's default line heights the
  font's ascent/descent exceed the CSS line box by roughly half a
  line at `text-sm`. Single-line UI, buttons (h-8/h-10), truncate
  and line-clamp all rendered clean in the spike — but at
  `line-height: 1` two Tibetan lines visibly collide. The app's
  three `leading-none` uses are all decorative emoji (safe), but
  the fleet PR must carry a small CSS guard so no future tight
  multi-line text clips: `:lang(bo) { line-height-floor via a
  utility override — e.g. .leading-tight/.leading-snug/.leading-none
  resolve to ≥1.6 under :lang(bo) }`.
- **Font stack.** The shared stack (Inter → system-ui…) has no
  Tibetan coverage; Tibetan falls through to system fonts. That
  works on iOS/macOS (Kailasa) and Android (Noto Serif Tibetan),
  but the fleet PR should add an explicit `:lang(bo)` font-family
  ("Noto Serif Tibetan", Kailasa, "Noto Sans Tibetan", "Microsoft
  Himalaya", then the shared stack) so desktop Linux and older
  browsers resolve something Tibetan-capable deliberately.
- **The shad (།).** Sentences in prose end with a shad. Buttons
  and short labels also carry it — Tibetan text without a final
  shad reads unfinished (this deliberately differs from the
  no-terminal-punctuation rule of other locales; it is Tibetan
  orthography, not decoration). Standard orthographic exceptions
  apply: no shad directly after a syllable ending in ཀ or ག (the
  letter's own shape absorbs it — write གཏོང་། but ཕྱག་དེབ་ཀ with
  no shad). One convention file-wide; the self-check greps for
  double-shad (༎), which stays out of UI strings entirely.
- **NFC normalization** applies to bo files as to all locales, and
  the no-directional-controls ban (U+200E/F, U+2066–2069) holds —
  irrelevant to LTR Tibetan in theory, absolute in the gate anyway.

## Term table

Rows marked **⚠ review** are draft choices awaiting a native
reviewer; ban columns hold regardless.

| English | Tibetan | Notes / DON'T use |
|---|---|---|
| mutual aid | ཕན་ཚུན་རོགས་རེས་ | Mutual help between equals — plain, warm, transparent. DON'T: སྦྱིན་པ་ (alms — rule 5), relief-NGO register, ཨུ་ལག་ adjacency of any kind (rule 6). |
| help (the everyday act) | རོགས་པ་ / རོགས་རམ་ | The household words. Helpers are རོགས་པ་བྱེད་མཁན་ — neighbors who helped, never volunteers-as-institution (rule 5). |
| timebank | དུས་ཚོད་དངུལ་ཁང་ | ⚠ review. Transparent compound (time + bank); keep the SURROUNDING prose non-bank, as every locale does: in the timebank, asking for help is never gated. DON'T: anything that adds accounting register on top. |
| hours (the currency) | ཆུ་ཚོད་ | «ཆུ་ཚོད་གཅིག་ནི་རྟག་ཏུ་ཆུ་ཚོད་གཅིག་རེད།» — one hour is always one hour. "Credited" → བརྩིས་ (counted). The member's balance is ཁྱེད་རང་གི་ཆུ་ཚོད་ — your hours, never an account balance. DON'T: བུ་ལོན་ anywhere near it (rule 4), point/coin vocabulary. |
| seed balance | ས་བོན་ཆུ་ཚོད་ | ⚠ review. Keep the seed metaphor as es/hi/vi/ru/ar do: your starting hours are seeds (ས་བོན་). DON'T: capital/opening-balance register, gift/reward promo register. |
| member | ཚོགས་མི་ | The plain membership word. DON'T: བེད་སྤྱོད་མཁན་ (user — technical), customer words. |
| neighbor | ཁྱིམ་མཚེས་ | The standard warm word; the neighborhood is Tibetan's natural mutual-aid unit too. |
| community | ཚོགས་སྡེ་ | ⚠ review (the choice matters; the ban is firm). DON'T: **སྒྲིག་འཛུགས་** (political organization — rule 6, absolute), government-unit vocabulary (village committee register). |
| vouch (verb) | ཁག་ཐེག་བྱེད་ | ⚠ review. Taking personal responsibility for knowing someone: ངས་ཁོང་ལ་ཁག་ཐེག་བྱེད། DON'T: legal-surety/collateral register, official-guarantor paperwork words. |
| trusted member | ཡིད་ཆེས་ཡོད་པའི་ཚོགས་མི་ | Chip: ཡིད་ཆེས་ཆོག (can be trusted). Web of trust: ཡིད་ཆེས་ཀྱི་དྲ་བ་. DON'T: certified/accredited officialese. |
| node (the server) | ཚོགས་སྡེའི་ཞབས་ཞུ་བ་ | ⚠ review. "The community's server", glossed on first use as the shared machine the community runs itself. DON'T: bare CS jargon with no gloss; any word implying an authority runs it. |
| exchange | བརྗེ་རེས་ | Help exchanged both ways — the res suffix carries the taking-turns warmth. DON'T: transaction/deal register (ཚོང་ trade words). |
| the commons (section) | སྤྱི་ནོར་ | The classical common-wealth word — jointly held things, exact and alive. DON'T: state-property register, plain inventory words. |
| In my care (nav) | ངའི་ལྟ་སྐྱོང་འོག་ | ⚠ review. The care framing (ལྟ་སྐྱོང་ — looking after), not a task list. DON'T: duty/assignment register (ལས་འགན་ as the frame). |
| board | བརྡ་ཐོའི་པང་ལེབ་ | ⚠ review. The notice-plank every village and courtyard has; nav short form བརྡ་པང་. A post is a notice (བརྡ་ཐོ་) hung on it. DON'T: social-media feed/wall calques, announcement officialese (གསལ་བསྒྲགས་ as the everyday post word). |
| dashboard | ཚོགས་སྡེའི་སྙིང་འཕར་ | ⚠ review. The community's heartbeat, mirroring ru «Пульс» and ar «النبض». DON'T: control-panel vocabulary (contradicts no-admins). |
| project | ལས་གཞི་ | The everyday project word. DON'T: **ལས་འགུལ་** (campaign/movement — rule 6), scheme/plan officialese. |
| task | ལས་ཀ་ | Small and everyday: ལས་ཀ་ཆུང་ཆུང་གཅིག. DON'T: ལས་འགན་ (duty assigned by authority), homework register. |
| work day | མཉམ་ལས་ཉིན་མོ་ | ⚠ review — a native reviewer may know a warmer pan-Tibetan village word for neighbors converging on one task; regional terms exist and one may deserve the ar-glossary treatment (a single warm nod in teaching prose). DON'T: **ཨུ་ལག་** (corvée — rule 6, absolute, the entire reason this row has a ban column), HR working-day register. |
| shift | ལས་རེས་ | ⚠ review. The taking-turns work slot (རེས་ carries the rotation). Sign-up keeps the paper-sheet warmth: write your name in. DON'T: factory-shift register. |
| proposal | གྲོས་འཆར་ | The deliberation word — matches the consensus register (གྲོས་ discussion). Affirm = supporting it (རྒྱབ་སྐྱོར་). DON'T: decision-handed-down words, petition register (ཞུ་གཏུག་ — rule 6). |
| flag (exchange/comment) | ཚོགས་སྡེར་བསྟན་ | Show it to the community to look at together — no informer register, ever: འདི་འགྲིག་མེད་ན་ཚོགས་སྡེར་བསྟན་ནས་མཉམ་དུ་ལྟ། DON'T: report-to-authority framing of any kind (rule 6). |
| dispute | མི་མཐུན་པ་ | Honest and no-shame: the community talks it through together. DON'T: lawsuit/court register (ཁྲིམས་ words), conflict-escalation vocabulary. |
| removal (of a member) | ཚོགས་སྡེ་ནས་ཕྱིར་འབུད་ | ⚠ review — heavy and honest without shame theater; the ceremony keeps its dignity (a farewell the community stands for). DON'T: deleting-a-person-like-a-file words, exile vocabulary. |
| guardian (shard holder) | གཉེར་པ་ | RESERVED WORD: the entrusted steward (the monastery-steward lineage of the word is exactly the trusted-keeper warmth) — each keeps one piece of your return key. DON'T: **སྲུང་མ་** (protector DEITY — an immediate dharma-protector reading; fatal collision), owner/lord words (བདག་པོ་), legal guardianship of minors. |
| recovery kit | ཕྱིར་ལོག་ཡོ་བྱད་ | ⚠ review. The coming-back kit — the promise is return (ཕྱིར་ལོག་), not backup. RESERVED: this family only ever means account recovery. DON'T: flattening it to a backup copy. |
| passphrase | གསང་ཚིག་ | Built on the known password word (གསང་ཨང་ / གསང་གྲངས་); glossed on first use as a long password of several words. DON'T: crypto-wallet seed-phrase register (and its collision with OUR seed metaphor). |
| panic (emergency wipe) | ཉེན་ཁ་སྒོ་ཐོག་ | ⚠ review. "Danger at the door" — glossed: if danger is at the door, erase everything on this device now (བསུབ་). DON'T: state-of-emergency register, security-sweep flavor, any liturgical apotropaic framing. |
| storm hub | འོད་ཁྱིམ་ | ⚠ review. The lit home in the dark street (the ru «огонёк» / ar «البيت المضيء» lineage): the house that still has power and internet when both are gone, where neighbors head. Requires its first-use gloss. DON'T: **སྐྱབས་** compounds (refuge — the refuge-formula reading is immediate, plus displacement shading), storm's-own-center calques, HQ words. |
| milestone | ས་ཚིགས་ | ⚠ review. The journey stage word — a station passed on the road. DON'T: checkpoint vocabulary (rule 6 spirit — a real checkpoint in members' lives), KPI register. |
| invite | མགྲོན་བརྡ་ | ⚠ review. The guest-invitation word family — being invited by someone who knows you. DON'T: recruitment register (rule 6 spirit). |
| organizer | གོ་སྒྲིག་བྱེད་མཁན་ | ⚠ review. The person who got it moving — kept human in prose (whoever started it). DON'T: boss/official/leader words (འགོ་ཁྲིད་ — leadership register). |
| display name | མངོན་པའི་མིང་ | Your shown name — call yourself what you like; your real name is never required. DON'T: username jargon, nom-de-guerre flavor. |
| read aloud (feature) | སྐད་ཀྱིས་ཀློག་ | What a family member does for someone who cannot read the screen — the promise, not the TTS spec. |
| owed help | ཁྱེད་ཀྱི་གཏན་འཁེལ་སྒུག་ | Waiting for your confirmation — deliberately NOT debt (rule 4). |

## Translator self-check (before any PR)

- Read every changed string aloud as the neighbor across the
  kitchen table (rules 1–3); no bureaucratic or Chinese-calque
  officialese survived.
- `grep` for བུ་ལོན་ — zero hits outside explicit debt-rejection
  lines (rule 4).
- `grep` for སྦྱིན་པ་ — zero hits as the help framing (rule 5).
- `grep` for ཨུ་ལག་, སྒྲིག་འཛུགས་, འཐབ་རྩོད་, ལས་འགུལ་, ཞུ་གཏུག་,
  སྲུང་མ་ (as guardian) — zero hits (rule 6). Member safety is
  བདེ་འཇགས་, never security enforcement.
- No ZWSP (U+200B), no directional controls (U+200E/F,
  U+2066–2069), no double-shad (༎) in UI strings; files
  NFC-normalized.
- Every counted phrase carries `{{count}}` — one plural form, no
  exemptions (rule 9); digits Western (rule 8).
- Shad orthography consistent file-wide: sentence-final ། present
  including buttons, dropped after ཀ/ག finals (typography
  section).
- གཉེར་པ་ only ever means a shard holder; the recovery family only
  ever account recovery; གྲོས་འཆར་ only ever a governance proposal.
- "Understoria" untouched — never transcribed into Tibetan script.
- **This file's ⚠ rows re-checked against the native review** once
  one exists — the review updates this glossary first, then the
  strings.
