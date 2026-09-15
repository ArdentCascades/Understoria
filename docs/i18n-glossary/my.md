# Burmese (မြန်မာ / my) translation glossary — the fleet contract

Binding for every fragment agent of the my fleet, and the record
of the Stage-0 decisions. Deviations fail assembly. Burmese is
the eighteenth language: the fleet path (AI-assisted, gated,
honestly labeled `reviewStatus: "new"` until native review), on
the rails seventeen languages proved — with the my-specific
decisions below settled up front, the way fa settled ZWNJ and
the calendar and bn settled digits.

Why Burmese now: since 2021, Myanmar's communities have run vast
informal mutual-aid networks under exactly the surveillance
pressure this app's safety surfaces were built for, and the
diaspora in Thailand, Malaysia, and beyond organizes the same
way. The register work below takes that seriously everywhere.

## Stage-0 findings (verified 2026-09-15, node/ICU)

1. **Plurals**: CLDR my has a single category (`other` for 0, 1,
   everything). my.json follows the zh/bo/id precedent:
   `_one`/`_other` pairs both exist with identical strings,
   every count-driven form interpolating `{{count}}`.
2. **Digits — the bn decision, taken again**: CLDR my's default
   numbering is Myanmar digits (`mymr`: ၁,၂၃၄). But bare
   `{{count}}` interpolation inserts runtime Western digits into
   the surrounding text, so Burmese-digit strings would mix
   systems mid-sentence — the exact bug bn's pin prevents — and
   modern Burmese digital text widely uses Western digits. So:
   **strings use Western digits 0-9; the registry pins
   `intlNumbering: "latn"`**; Myanmar digits ၀-၉ are banned in
   my.json by gate. Dates keep the Gregorian calendar (CLDR my's
   default) with CLDR's Burmese month names.
3. **Line-breaking needs NO invisible characters.** Burmese
   writes without word spaces; verified directly that ICU's
   dictionary segmentation handles it
   (Intl.Segmenter('my') splits ကျွန်တော်တို့အချင်းချင်းကူညီကြသည် into
   ကျွန်တော်|တို့|အချင်းချင်း|ကူညီ|ကြ|သည်) — the same ICU browsers
   use for wrapping. Therefore ZWSP stays banned along with every
   other invisible (some legacy Burmese web text uses U+200B as a
   break hint; we do not). Wiring includes a visual wrap QA on
   the narrowest surfaces.
4. **Unicode only — Zawgyi is banned by gate.** Myanmar's
   encoding split (the Zawgyi font-encoding that reuses Myanmar-
   block codepoints with different semantics) officially ended
   with the 2019 national migration, and this app is
   Unicode-native from birth: the fleet gates scan for
   Zawgyi-indicative sequences (non-canonical medial/vowel
   ordering, the classic U+1031-before-cluster and misplaced
   U+103A patterns) and reject them; text is NFC; the canonical
   Unicode ordering (kinzi, medials, vowels) is required.
5. **Rendering (for the wiring PR, bo precedent)**: stacked
   consonants and below-base medials need a font stack and a
   line-height floor — `:lang(my)` with "Noto Sans Myanmar" /
   "Myanmar Text" (Windows) / "Myanmar MN" (macOS) / Padauk
   before Inter, and a 1.6 floor on the tight leading utilities,
   exactly the Tibetan block's shape in index.css.
6. **Registry entry (at wiring)**:
   `{ code: "my", endonym: "မြန်မာ", dir: "ltr", speakLang: "my", reviewStatus: "new", content: "ui-only", intlNumbering: "latn" }`
   — endonym per CLDR DisplayNames; fallback my → en.

## Global register decisions

1. **Warm, polite, and ungendered — the pronoun architecture.**
   Burmese politeness particles differ by the SPEAKER's gender
   (male ခင်ဗျာ/ဗျ, female ရှင်), and even "I/we" is gendered
   (ကျွန်တော် male / ကျွန်မ female). An app has no gender, so:
   **no speaker-gendered particle ever appears** — politeness is
   carried by **ပါ** (which is genderless and warm) and by
   phrasing; and the corporate-"we" ban every glossary enforces
   is here grammatically FORCED — the app cannot say
   ကျွန်တော်တို့/ကျွန်မတို့ without lying about having a gender.
   App voice is subjectless (natural Burmese) or a named actor
   (အက်ပ်က, ဆာဗာက, အသင်းက).
2. **"You" is သင် — sparingly — and pro-drop does the rest.**
   Burmese drops pronouns readily; most strings need no "you" at
   all. Where one is unavoidable, use သင် (the established
   neutral software register). Never မင်း (too intimate), never
   ခင်ဗျား/ရှင် as pronouns (speaker-gendered register).
3. **Buttons and labels**: polite verb + ပါ (သိမ်းပါ, ပို့ပါ);
   no terminal ။ on buttons, chips, headings, or nav labels.
4. **THE DEBT FENCE.** Hours are never debt. Banned: **အကြွေး /
   ကြွေး** (debt), **ချေး** in the money-lending sense (ချေးငွေ
   loan), **အတိုး** (interest), **ဆပ်** (repay) anywhere near
   hours, **ပေါင် / အပေါင်** (pawn — the pawnshop ledger is
   Myanmar's nearest resemblance-risk institution), စာရင်းရှင်း
   (settle accounts). The balance is hours moving in the
   community's shared record — never owed. The ONE sanctioned
   formula, verbatim where en refuses the frame (FAQ balance
   answer, member guide):
   **«အကူအညီတောင်းတာ အကြွေးမဟုတ်ပါ — ဘာမှချေးထားတာမရှိသလို ဘာမှပြန်ဆပ်စရာလည်းမလိုပါ။»**
   The seed-library gift line: **«လက်ဆောင်ပါ — ပြန်ဆပ်စရာမဟုတ်ပါ။»**
   Each occurrence FLAGGED; legal-sense debt in the legal-aid
   template may be literal, FLAGGED.
5. **THE MERIT-AND-ALMS FENCE — Burmese's own novel rule.**
   Myanmar's dana culture is deep and beloved, and precisely for
   that reason the timebank must never dress itself in it:
   exchanging hours is reciprocity between equals, not
   merit-making, not alms, not philanthropy. Banned: **အလှူ /
   လှူ** (alms, donate), **ကုသိုလ်** (merit), **ပရဟိတ**
   (philanthropy/parahita — the charity-sector register),
   **သဒ္ဓါ** (faith-offering), ကူညီထောက်ပံ့ (aid-support
   officialese). Mutual aid is **အပြန်အလှန်ကူညီခြင်း** and
   **အချင်းချင်းကူညီ** — each-other help. ONE cultural
   carve-out for the corpus only: **စတုဒိသာ** (the free-food
   offering tradition) may be *referenced as the lived practice
   it is* in community-meal content, never used as the app's own
   frame; FLAG each occurrence. (The funeral-aid societies —
   နာရေးကူညီမှုအသင်း — are the country's most beloved mutual-aid
   institutions and the register this app wants to stand beside;
   see the community term below.)
6. **THE SURVEILLANCE FENCE — the heaviest rule.** The
   informer's and the ward office's vocabulary never appears:
   **ဒလန်** (informer — never, not even in denials),
   **သတင်းပေး / သတင်းပို့** (inform on), **တိုင်ကြား** (complain
   to authority), **ထောက်လှမ်း** (surveil; the ‑ရေး apparatus
   compounds with it), **စစ်ဆေး** (interrogate/inspect — see
   rule 7 for the software collision), **ဖမ်း / ဖမ်းဆီး**
   (arrest), **ဧည့်စာရင်း** (the overnight-guest registration
   list — see the sanctioned refusal below), **စာရင်းသွင်း**
   (enroll/register — officialese with the roster root; joining
   is **ပါဝင်**, opening an account **အကောင့်ဖွင့်**),
   အုပ်ချုပ်ရေး vocabulary (rule 8). Flagging a post is
   **«အသင်းရှေ့ တင်ပြ»** — bringing it before the community —
   never reporting. Blocking a contact is the lived loanword
   **ဘလော့** (ဘလော့လုပ်ပါ / ဘလော့ဖြုတ်ပါ) — ပိတ်ဆို့ is what
   authorities do to roads and money. Police and prison (ရဲ,
   ထောင်) appear only as literal referents in safety content.
   **ONE sanctioned naming-in-refusal**, principles/guide
   content only: the app may say plainly
   **«ဒီမှာ ဧည့်စာရင်းမရှိပါ»** — there is no guest list here —
   because in Myanmar that sentence says everything this
   architecture means; FLAG its single use.
7. **The verify/interrogate collision, resolved**: Burmese
   software convention uses စစ်ဆေး for "verify/check", but the
   word is the inspection-and-interrogation register and rule 6
   bans it. Use **စစ်ကြည့်** or **သေချာအောင်ကြည့်** for
   check/verify; **အတည်ပြု** is RESERVED for exchange
   confirmation only (the every-glossary rule): confirming an
   exchange is အတည်ပြု; approving a device is **ခွင့်ပြု**; a
   fingerprint match is **ကိုက်ညီ**.
8. **NO ADMINS.** Banned: **အုပ်ချုပ်** and its compounds (the
   ward-administrator's verb — အုပ်ချုပ်ရေးမှူး is exactly what
   this app does not have), **အာဏာ** (authority/power),
   **အက်ဒမင်** (admin) and **မန်နေဂျာ** outside sanctioned
   negation, ဌာန (department), ရုံး (office) for app concepts.
   The operator is **ဆာဗာထိန်းသူ** — the one who keeps the
   server — with powers named and bounded. The sanctioned
   negation: **«ဒီမှာ အုပ်ချုပ်သူမရှိပါ။»** (there is no one
   ruling here) — the no-admins denial, FLAGGED where used.
9. **Community is အသင်း; members are အသင်းသား/အသင်းဝင်.** The
   a-thin — the association register of the funeral-aid
   societies — is exactly the right resonance: organized,
   voluntary, neighbor-run. **အသိုက်အဝန်း** (the circle of
   belonging) is welcome in prose; **ရပ်ရွာ** for neighborhood
   flavor. Banned: **အသုံးပြုသူ** (user), **ဖောက်သည်**
   (customer), **လူ့အဖွဲ့အစည်း** (society-officialese),
   **အဖွဲ့အစည်း** (organization), ကွန်မြူနတီ (avoidable loan),
   ပရိသတ် (audience).
10. **Digits and dates**: Western digits 0-9 in all strings
    (rule per Stage-0 finding 2); Myanmar digits ၀-၉ banned by
    gate; the number formatter and every Intl call site pin
    latn via `intlLocale("my")`.
11. **Punctuation**: ။ ends sentences, ၊ separates clauses; no
    terminal ။ on buttons/labels/headings; questions end in the
    interrogative particles (…လား။ / …လဲ။) — **no ASCII "?" in
    Burmese sentences**; curly “ ” for quotes with ‘ ’ nested;
    single-char …; spaced em dash. Latin product names (Tor
    Browser, Signal, FileVault, QR) stay Latin; **Understoria
    is never transliterated**.
12. **Script hygiene** (gates): Unicode Myanmar only, canonical
    ordering, NFC; Zawgyi-indicative sequences rejected
    (Stage-0 finding 4); no invisibles at all — U+200B-200F,
    U+202A-202E, U+2066-2069 all banned (finding 3: ICU breaks
    lines without help); no ZWSP even as a break hint.
13. **Loan-word tiers** (the fa rule 7 pattern): password =
    **စကားဝှက်**; passphrase = **စကားဝှက်စာကြောင်း** (glossed on
    first use); passkey = **passkey** in Latin (the platform
    term, like the OS labels); recovery kit = **ပြန်လည်ရယူရေး
    အထုပ်**? — no: see term table («ပြန်ဝင်ရေးအထုပ်», the
    coming-back bundle). OS-controlled labels stay platform
    English (the ur/fa precedent).
14. **Dialect breadth**: standard formal-colloquial written
    Burmese (the register of quality journalism and modern
    apps), avoiding both literary-archaic particles (၏, ၍, သည်
    chains where colloquial serves) and slang; the app talks
    like a careful, warm neighbor writing a notice, not a
    gazette. (Non-Burman Myanmar languages — Shan, Karen, Mon,
    Rohingya and others — are NOT covered by this file; they are
    their own communities' languages, several under the
    partnership track's standing policies, one of them squarely
    under threat-model-first.)

## Term table

⚠ marks rows the fleet must treat as provisional and the native
review adjudicates first — more of them than fa carried, honestly.

| Concept | မြန်မာ | Notes |
|---|---|---|
| community | အသင်း | rule 9; prose may use အသိုက်အဝန်း, ရပ်ရွာ |
| member | အသင်းသား / အသင်းဝင် | never အသုံးပြုသူ |
| hours / balance | နာရီ / «သင့်နာရီများ» | rule 4 fence; never owed |
| dashboard | ⚠ «အသက်» (gloss: အသင်းရဲ့အသက် — the community's breath) | ht's Souf precedent; review confirms or renames |
| board (posts) | ⚠ «သင်ပုန်း» (the slate) | never ကြော်ငြာ (advert) |
| post (need/offer) | အသိပေး / «လိုအပ်ချက်» / «ကူညီမယ်» | pills: လိုအပ်ချက်များ / ကူညီမယ့်သူများ ⚠ |
| claim / "In my care" | တာဝန်ယူ / «ကျွန်ုပ်တာဝန်» ⚠ | ကျွန်ုပ် is the one acceptable neutral I-form, sparingly |
| confirm (exchange ONLY) | အတည်ပြု | rule 7 reservation |
| check / verify (non-exchange) | စစ်ကြည့် | rule 7; never စစ်ဆေး |
| vouch | ⚠ «နောက်ကနေရပ်တည်ပေး» (stand behind) | never ခံဝန် (surety/bond) or အာမခံ (guarantee/insure) |
| guardians (key shards) | ⚠ «သော့စောင့်» (key keepers) | never အုပ်ထိန်းသူ (legal guardian) |
| key shard | သော့အစိတ်အပိုင်း | |
| recovery kit | «ပြန်ဝင်ရေးအထုပ်» ⚠ | the coming-back bundle |
| work day | «အလုပ်အားလုံးနေ့» ⚠ | NOT လုပ်အားပေး — that word carries the junta's forced-"voluntary"-labor history alongside its genuine sense; banned |
| shifts / sign-up sheet | တာဝန်ချိန် / «အမည်ရေးထိုး» ⚠ | never စာရင်းသွင်း (rule 6) |
| RSVP family | «လာမယ် / မလာနိုင်ဘူး / မသေချာဘူး» | plain speech |
| event / gathering | ပွဲ / တွေ့ဆုံပွဲ | never အစည်းအဝေး-officialese for social events |
| flag | «အသင်းရှေ့ တင်ပြ» | rule 6; never တိုင် / report |
| dispute | အငြင်းပွား ⚠ / «သဘောကွဲလွဲမှု» | neighborly disagreement, never case/proceeding (အမှု banned) |
| block / unblock | ဘလော့လုပ် / ဘလော့ဖြုတ် | rule 6 |
| operator | ဆာဗာထိန်းသူ | rule 8 |
| removal / return | «အသင်းကထွက်ခိုင်း» ⚠ / «ပြန်လာ» | honest weight, no expulsion officialese (ထုတ်ပယ် borderline — review) |
| invite | ဖိတ် / ဖိတ်စာ | guest warmth; never recruitment (စည်းရုံး banned — the organizing-slash-mobilizing word carries party-machine register) |
| template | ပုံစံ | |
| milestone | မှတ်တိုင် | the road-marker word |
| seed family | မျိုးစေ့ («မျိုးစေ့နာရီ», seed vault «မျိုးစေ့ကျီ» ⚠) | granary word for vault |
| panic | ⚠ «အရေးပေါ်ဖျက်» family — see hard strings | အရေးပေါ် (emergency) allowed HERE only, as the lived word; ⚠ review |
| hard purge / soft purge | «အကုန်ဖျက်» / «တစ်ဝက်ဖျက်» ⚠ | plain words, full force |
| storm hub | ⚠ «မီးလင်းအိမ်» (the lit house) | the fa «خانهٔ روشن» image; review confirms it lands in Burmese |
| password / passphrase / passkey | စကားဝှက် / စကားဝှက်စာကြောင်း / passkey | rule 13 |
| device linking | ချိတ်ဆက် family («ဖုန်းချိတ်ပါ», «ချိတ်ဆက်ကုဒ်») | plain connect words |
| node / server | ဆာဗာ | the honest loan |
| federation | ⚠ «အသင်းချင်းချိတ်ဆက်ခြင်း» | communities linking as equals |
| ledger (community record) | «အသင်းမှတ်တမ်း» | never စာရင်း compounds that echo rosters |
| read aloud | အသံထွက်ဖတ်ပြ | |
| gift | လက်ဆောင် | rule 4 gift line |
| skills | တတ်တဲ့အရာများ | plain "things you can do" |
| tagline | see hard strings | |

### Errata from the UI fleet reconciliation

Recorded after the six-chunk fleet was reconciled into one voice;
the native-review cycle should confirm these alongside the table
above.

- **timebank = «အချိန်ဘဏ်»** — a coinage (lit. "time bank") the
  fleet adopted where the en names the mechanism itself; the table
  shipped without a row. Reviewer decides whether the compound
  reads naturally or needs a phrase.
- **The tagline's inner quotes are curly** («…"ငါတို့"…»,
  U+201C/U+201D), not the ASCII quotes the Known-hard-strings
  section below shows — rule 12 (curly quotes everywhere) wins
  over the hard string's literal form. The line below should be
  read with curly quotes; my.json carries them.
- **task = လုပ်စရာ fleet-wide** (the table's choice, enforced over
  a chunk's အလုပ် drift — အလုပ် stays reserved for work/job
  senses).
- **post (noun) = အသိပေးချက်**; the verb "notify" stays အသိပေး.
  The table's bare အသိပေး row is the verb.
- **reinstatement = «ပြန်ကြိုဆို»** (lit. "welcome back") — a new
  coinage for a removed member's return, chosen against any
  bureaucratic re-admission register. ⚠ speaker review requested.
- **co-founder nomination = «အမည်တင်သွင်းမှု»** (verb
  အမည်တင်သွင်း) — keeps "nomination" distinct from proposals
  (အဆိုပြုချက်) and avoids the banned စာရင်းသွင်း root. ⚠
- **guardian release code = «လွှတ်ပေးကုဒ်»** — suggested
  term-table addition.
- Disputes settled on သဘောကွဲလွဲမှု; proposals on အဆိုပြုချက်;
  co-founder on ပူးတွဲတည်ထောင်သူ; exchange on ဖလှယ်မှု —
  fleet-wide, per the softer-register rules.

## Known hard strings

- **The tagline** — "The unit of progress is 'we', not 'I'." —
  the gendered-pronoun trap dissolves in quotation: the
  informal neutral pronouns are quotable as words.
  **«တိုးတက်မှုရဲ့ယူနစ်က "ငါတို့"ပါ — "ငါ" မဟုတ်ပါ။»**
- **Compelled biometrics** — full force, the fa fidelity-table
  process: fingerprints and faces can be taken by force
  (အတင်းအကျပ် ယူနိုင်), a passphrase in your head cannot —
  «သင့်ခေါင်းထဲက စကားဝှက်ကိုတော့ မပြောဘဲနေနိုင်ပါတယ်»; police
  named literally (ရဲ) exactly here; nothing softened, no
  reassurance en does not make. The fleet builds the line-by-line
  en→my table for review.
- **The guest-list refusal** (rule 6's sanctioned single use):
  «ဒီမှာ ဧည့်စာရင်းမရှိပါ။» — placed once, in the principles.
- **The no-admins negation**: «ဒီမှာ အုပ်ချုပ်သူမရှိပါ။»
- **{{hours}} pre-formatted convention** (the ht erratum,
  standing): keys receiving formatSignedHours output append no
  unit word; only bare-number keys carry နာရီ.

## Quick self-check for translators (script it)

- Key/order parity with the en chunk at every depth;
  interpolation multisets byte-identical; `_one`/`_other` pairs
  identical with `{{count}}` in both.
- Zero: gendered particles (ခင်ဗျာ, ဗျ, ရှင် as particle,
  ကျွန်တော်, ကျွန်မ), မင်း; the debt list (rule 4); the
  merit/alms list (rule 5); the surveillance list (rule 6, incl.
  စစ်ဆေး outside nothing — it is simply banned — and
  စာရင်းသွင်း); အုပ်ချုပ် outside the sanctioned negation; the
  people/community bans (rule 9); Myanmar digits [၀-၉]; ASCII
  "?" in Burmese sentences; terminal ။ on labels; straight
  quotes and ASCII "...".
- Zero invisibles (U+200B-200F, U+202A-202E, U+2066-2069);
  NFC; canonical Myanmar ordering; Zawgyi-heuristic scan clean.
- အတည်ပြု only for exchange confirmation; ဘလော့ only for
  contacts; ပါဝင်/အကောင့်ဖွင့် for joining; benign-residue notes
  to record per chunk (compound words containing banned
  substrings need word-boundary care — Burmese has no spaces, so
  the gates match on syllable boundaries and each hit is
  adjudicated by hand, the csw/fa precedent tightened).
- **This file's choices are a first draft pending native
  review** — the ⚠ rows first; the ban rows are load-bearing
  regardless, and any replacement term must still avoid them.
