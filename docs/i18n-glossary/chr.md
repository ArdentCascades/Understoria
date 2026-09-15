# Cherokee (ᏣᎳᎩ / chr) — partnership scaffold, not yet a glossary

**This file is deliberately unfinished.** Every shipped glossary in
this directory records decisions an AI-assisted fleet made and a
native-speaker review will check afterward. Cherokee inverts that
order: the decisions in the "open" sections below belong to Cherokee
speakers, and nothing ships until they have made them —
`docs/i18n-partnership-cherokee.md` describes the model. What this
file contains today is (a) the Stage-0 technical findings, verified
against the actual runtime, so partners never have to solve a
rendering or plural problem twice, and (b) the concept documentation
for every hard decision the seventeen shipped languages taught us —
so a Cherokee collaborator starts from our hardest-won lessons, not
from a blank page.

Cherokee is the first language of this track — one language from
each Indigenous language family of North America, partnership-first —
and it was chosen first for a reason: the Cherokee Nation's language
technology program has already localized major software (the first
Native American language on the iPhone in 2010, Gmail in 2012, a
Windows interface pack in 2013, a Wikipedia edition), which means
both that experienced Cherokee software translators exist and that
the technical ground below is unusually solid.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

These are facts about the runtime, checked directly — not
assumptions.

1. **Cherokee is a first-class CLDR/ICU locale.** `chr` resolves
   natively — `Intl.PluralRules("chr").resolvedOptions().locale`
   returns `"chr"`, not a fallback (contrast Haitian Creole, which
   ICU does not know). This is the Cherokee Nation's own
   CLDR-contribution legacy paying off.
2. **Plurals are `one`/`other`, and `one` is exactly n=1** (0
   selects `other`; so do 2, 5, 21…). This is the same shape as
   English and Spanish — the simplest case our gates handle. No
   identical-pairs workaround (ht), no `_one`-covers-zero rule
   (fa/bn/hi). The computed plural gates in `plurals.test.ts` will
   derive this automatically when a `chr.json` exists.
3. **Digits and calendar need no pin.** `Intl.NumberFormat("chr")`
   already defaults to Western digits (`latn`, `1,234`) and the
   Gregorian calendar — no `intlNumbering` field needed in the
   registry entry (contrast bn/fa).
4. **CLDR carries Cherokee month and weekday names in syllabary.**
   `toLocaleDateString`-style surfaces render in Cherokee for free:
   a September date formats as «ᏔᎵᏁᎢᎦ, ᏚᎵᏍᏗ 15, 2026». Every
   `intlLocale()` call site simply works.
5. **The registry endonym is ᏣᎳᎩ** —
   `Intl.DisplayNames(["chr"],{type:"language"}).of("chr")` returns
   exactly that, so the Settings list, CLDR, and the community's own
   usage agree.
6. **Casing hazard, confirmed and fenced.** The syllabary has been
   bicameral since Unicode 8.0: the traditional characters live at
   U+13A0–U+13F5 and `String.toLowerCase()` really does remap them
   into the U+AB70 lowercase supplement (ᏣᎳᎩ → ꮳꮃꭹ), where font
   support is far spottier. Verified: the app uses **no
   `text-transform` anywhere** (grepped), so nothing corrupts today.
   THE RULE GOING FORWARD: never introduce `text-transform` (or
   JS-side case-mapping of member-visible text) on any surface a
   `chr` locale can reach — Cherokee text ships in the traditional
   range and stays there. JS lowercasing inside *search
   normalization* is safe (both haystack and needle map
   consistently) but should not surface.
7. **Fonts: the app's font (Inter) has no Cherokee coverage — a
   `:lang(chr)` stack is required at ship time.** OS coverage is
   good on every platform members use: macOS/iOS ship *Plantagenet
   Cherokee* (Cherokee has shipped on iPhone since 2010), Windows
   ships *Gadugi* (a font literally named for the Cherokee
   communal-work tradition — see the term notes below) and
   Plantagenet, Android/ChromeOS cover it via *Noto Sans Cherokee*.
   Proposed stack, to be added in `index.css` when chr wires up
   (following the bo/ur spike precedent):
   `:lang(chr) { font-family: "Plantagenet Cherokee", Gadugi, "Noto Sans Cherokee", sans-serif; }`
   The syllabary has no tall stacking marks — no line-height floor
   needed (contrast bo/bn/ur). LTR; no RTL work.
8. **Fallback chain: chr → en.** Cherokee speakers today are
   bilingual in English; there is no intermediate language (contrast
   ht → fr → en). A transiently missing key degrades readable.
9. **Language code: `chr`** (ISO 639-2/3; Cherokee has no two-letter
   639-1 code). Browsers, CLDR, and every OS localization above use
   `chr`, so detection follows the zh/fil rule: ship the tag
   platforms actually send.

## Decisions that belong to partners (open)

Recorded as questions, with what we know — never as defaults we
will quietly apply.

- **Which Cherokee.** Three federally recognized nations — the
  Cherokee Nation and the United Keetoowah Band (Oklahoma), and the
  Eastern Band of Cherokee Indians (Qualla Boundary, North
  Carolina) — and two main dialect groups (Overhill/Otali in
  Oklahoma; Kituwah/Middle in North Carolina), mutually
  intelligible with lexical and orthographic-convention
  differences. The Cherokee Nation's language department carries
  the prior software-localization experience; the Eastern Band's
  Kituwah Preservation & Education Program and New Kituwah Academy
  carry the homeland's revitalization work. Whether one translation
  serves all communities, and whose conventions it follows, is
  theirs to decide — not a majority-vote question we can compute.
- **Syllabary throughout, or syllabary + Latin transliteration
  anywhere?** Every precedent (the Nation's own Gmail/Windows
  localizations, chr.wikipedia.org) is syllabary-first, and the
  syllabary is Sequoyah's — it carries weight no Latin
  romanization does. But learners often read the d/t-system Latin
  transliteration first, and this app serves learners too (most
  members of any community will be second-language readers).
  Options partners might weigh: syllabary-only (cleanest);
  syllabary with the existing per-string read-aloud as the learner
  support; or a paired convention for a handful of high-stakes
  safety strings. Ours to build, theirs to choose.
- **Tone marking**: Cherokee has tone; standard syllabary writing
  leaves it unwritten. Follow partners' house style.
- **Terminology authority**: where the language needs a new coinage
  (passkey, server, QR code), who decides — and whether existing
  coinages from the Nation's earlier localizations should be
  reused for consistency across Cherokee-language software (we
  suspect yes, and would follow their lead).

## Grammar notes for the string work (for partners' planning, and
## our gates)

- **Cherokee is polysynthetic** (Iroquoian family): much of what
  English does with phrases happens inside the verb. Template
  strings with `{{count}}`/`{{name}}` interpolation will sometimes
  fight the grammar; our contract allows restructuring any sentence
  around its placeholders (the placeholders must survive verbatim;
  the sentence around them is free).
- **The first-person plural is a gift English doesn't have.** Every
  shipped glossary fights the "corporate we" problem — the app
  must never say "we" as an institution. Cherokee grammatically
  distinguishes **inclusive** ("you and I/we including you") from
  **exclusive** ("we, not you") first persons, and dual from
  plural. The member-inclusive warmth our glossaries reach for with
  workarounds (annou in Kreyòl, «همه با هم» in Persian) is simply
  the inclusive forms — and an app-voice "we" would be nakedly
  *exclusive*, which is exactly why it should not exist. We expect
  this rule to be easier to state in Cherokee than in any language
  we have shipped.
- **Classificatory verbs**: Cherokee verbs of giving/handing/having
  change with the nature of the thing (solid, flexible, long,
  liquid, living). The app's central verbs — give help, share
  hours, hand off a task — will need native judgment about which
  classifier an *hour of help* takes, or whether to rephrase around
  the classification. This is a beautiful problem and entirely
  theirs.
- **No grammatical gender** — the app's they/them neutrality costs
  nothing.
- The plural gates: with `one` = exactly 1 (finding 2), every
  `_one` string may naturally hard-code singular grammar, and
  `{{count}}` interpolation follows the en shape without the
  fa/bn/hi zero-covers-one caveat.

## Register concepts — the questions we ask, with why we ask them

Documentation of the concept behind every fence the seventeen
shipped glossaries enforce, posed for partner decision. The pattern
in every language so far: the mutual-aid register already exists in
the community's own tradition, and the job is refusing the imported
institutional registers around it.

- **Hours are never debt** (the core fence, every language). One
  hour of help = one hour of help; asking is not borrowing; the
  balance is not a bank account. Each language names and refuses
  its local resemblance-risk (the Haitian sòl, the Persian
  qarz-al-hasaneh). Question for partners: what are the Cherokee
  words that would accidentally make the timebank sound like
  money-lending, credit, or per-capita accounting — and what is the
  plain register of neighbors keeping track of shared work?
- **ᎦᏚᎩ / gadugi** — the Cherokee tradition of communal labor, a
  crew working together for the common good. This concept IS the
  app's "work day" feature (and the konbit row in ht.md, the
  «روزِ کارِ جمعی» row in fa.md). We flag it as the one
  term-suggestion we bring to the table rather than leave blank —
  **to confirm, never to assume**: whether gadugi belongs on an app
  button, or is bigger than that and should be referenced rather
  than claimed, is precisely the kind of judgment that belongs to
  Cherokee speakers.
- **No admins, no bosses** — the app has operators with narrow,
  visible powers and refuses authority vocabulary. Partners will
  know which words carry BIA/agency/council-bureaucracy flavor and
  which carry the plain register of someone-keeps-the-server-running.
- **The surveillance register** (rule 6 in fa.md, the Duvalier-era
  fence in ht.md): flagging a post must read as *bringing something
  before the community*, never as *reporting someone to authority*;
  block/remove language must not echo the state's. Cherokee history
  gives this fence specific weight — enrollment rolls used for
  allotment, agents, boarding-school removal of children — and also
  a live civic counter-consideration: *enrollment* is present-day
  tribal citizenship vocabulary, so the app's sign-up language
  should neither carelessly collide with it nor accidentally evoke
  the Dawes Rolls. These are exactly the calls partners are
  qualified to make and we are not.
- **The disability slogan exception**: one string corpus-wide keeps
  an authentic movement first person ("Nothing about us without
  us"); everything else avoids app-voice "we" (see the
  inclusive/exclusive note above — Cherokee may handle this more
  gracefully than English can).
- **Safety strings ship at full force**: the compelled-biometrics
  warning, the panic flow, and the guardians/recovery flows are
  reviewed line-by-line in every language; nothing softens in
  translation. The en→target fidelity table (see the fa corpus
  round) is part of the review process we bring.
- **A resonance worth offering, not imposing**: the app's
  federation model — every community runs its own node, no central
  server, peers as equals — rhymes with sovereignty. If that
  framing is useful to partners in naming node/federation concepts,
  it is there; if not, plain function words win, as everywhere.

## Term table

Deliberately empty except structure. Columns as in every sibling
glossary; the concept column is pre-filled from the shipped
languages' hardest rows so partners see what each term must do, not
just what it says.

| Concept (what the term must do) | ᏣᎳᎩ | Notes / decisions |
|---|---|---|
| dashboard — the community's living overview; ht chose "breath", fa chose "pulse"; never "control panel" | *(open)* | |
| hours / the balance — never money, never debt | *(open)* | |
| post (need / offer) — neighbor speech, not classifieds | *(open)* | |
| claim / "In my care" — taking a task on, warmth not workflow | *(open)* | |
| confirm (exchange) — reserved word, exchange confirmation only in every language | *(open)* | |
| vouch — standing behind someone; never co-signing/guaranteeing | *(open)* | |
| guardians (key shards) — trusted holders; never legal guardianship vocabulary | *(open)* | |
| work day — see gadugi above | ᎦᏚᎩ? | suggestion to confirm, not assume |
| flag — bring before the community; never report-to-authority | *(open)* | |
| dispute — disagreement between neighbors; never case/proceeding | *(open)* | |
| operator — keeps the server running; never admin/boss | *(open)* | |
| panic / hard purge — full force, plain words | *(open)* | |
| recovery kit / passphrase / passkey — loan-word tier decisions | *(open)* | |
| template / milestone / seed family | *(open)* | |
| invite — guest warmth; never recruitment | *(open)* | |

## What ships, and when

Nothing, until partners say so. The wiring is one small PR we can
stage at any point (registry entry `{ code: "chr", endonym: "ᏣᎳᎩ",
dir: "ltr", speakLang: "chr" }`, loader, `locale-chr` chunk, the
`:lang(chr)` font stack, parity/plural rows — all on proven rails),
and the parity gates mean the app ships a language complete or not
at all, with honest disclosure either way. There is no deadline;
the infrastructure waits for the language, not the reverse.
