# Cree (nêhiyawêwin / ᓀᐦᐃᔭᐍᐏᐣ and its relatives / cr) — partnership scaffold, not yet a glossary

**This file is deliberately unfinished**, on the model of its
Cherokee, Navajo, and Lakota siblings (`chr.md`, `nv.md`,
`lkt.md`; `docs/i18n-partnership-cree.md` for the partnership
model): the decisions in the open sections belong to Cree
speakers, and nothing ships until they have made them. Today it
contains (a) Stage-0 technical findings verified against the
actual runtime, and (b) the concept documentation behind every
hard decision seventeen shipped languages taught us, posed as
questions.

Cree is the fourth language of the partnership track — one
language per Indigenous language family of North America — and
the Algonquian family's entry, with the largest Indigenous
language community in Canada (on the order of ninety thousand
speakers across its dialects). It is also the track's first
language where the honest first question is not "which words" but
**"which Cree"** — this file is organized around that.

## The first-order decision: which Cree, and how many

Cree is a dialect continuum, not one standard: Plains Cree
(`crk`, nêhiyawêwin, the y-dialect — Alberta/Saskatchewan), Woods
Cree (`cwd`, the th-dialect), Swampy Cree (`csw`, the n-dialect,
ᓀᐦᐃᓇᐍᐏᐣ), Moose Cree (`crm`), and East Cree (`crj`/`crl`, Eeyou
Istchee in Quebec), each with its own communities, institutions,
and conventions. Related neighbors (Atikamekw, Naskapi, Michif)
sit outside this scaffold's scope but inside the family's story.

Consequences we commit to up front:

- **One translation cannot honestly serve the whole continuum.**
  The registry is per-tag already, so this track can produce ONE
  dialect's translation first (whichever community engages), or
  SEVERAL over time as separate registry entries (`crk`, `crj`,
  `csw`…) — the fil/tl detection-aliasing precedent covers
  browsers that send the bare macrolanguage tag `cr`.
- **The endonym is dialect-dependent AND orthography-dependent**
  (nêhiyawêwin / ᓀᐦᐃᔭᐍᐏᐣ / ᓀᐦᐃᓇᐍᐏᐣ / īyiyū ayimūn…): the registry
  entry's own name is a partner decision, twice over.
- Everything below is written per-dialect where it differs, and
  the examples use whatever forms our sources happen to carry, as
  placeholders only.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **The dialects have DIFFERENT ICU profiles — the choice of
   Cree chooses the technical path.** Verified directly:
   - **Swampy Cree (`csw`) is a first-class CLDR/ICU locale** —
     native resolution, `one`/`other` plural rules, **syllabics
     month and weekday names free at every date call site**
     («2026 ᓄᒌᑐᐏᐲᓯᒼ 15, ᓃᓱᑮᓯᑳᐤ»), Western digits, and the
     endonym ᓀᐦᐃᓇᐍᐏᐣ from `Intl.DisplayNames`. One gate-relevant
     grammar fact: **csw's `one` category covers 0 AND 1** (like
     fa/bn/hi), so every `_one` string interpolates `{{count}}` —
     our computed plural gates enforce this automatically.
   - **Plains (`crk`), Woods (`cwd`), Moose (`crm`), and both
     East Crees (`crj`/`crl`) are NOT in CLDR** — they silently
     fall back to the default locale, the Navajo situation: the
     Haitian Creole no-ICU precedent applies (fallback-safe
     plural pairs, no free localized dates, honestly disclosed).
     Cree nouns DO mark plural (animate *-ak*, inanimate *-a*),
     so unlike Lakota the fallback-safe requirement has a real
     cost; the shipped mitigation is letting the numeral carry
     number and phrasing forms valid at any count — a
     translator's craft call, made by speakers.
2. **Two writing systems, both alive — the second-order partner
   decision.** Canadian Aboriginal Syllabics (the ᓀᐦᐃᔭᐍᐏᐣ
   block, U+1400–167F + extensions) and Standard Roman
   Orthography (SRO; Latin with circumflex or macron long vowels
   — â ê î ô west, other conventions elsewhere). Communities
   differ: East Cree is strongly syllabic; Plains Cree uses both,
   with SRO prominent in education. Verified: syllabics are
   atomic codepoints (no combining marks, NFC trivially stable —
   no bicameral hazard, contrast Cherokee); SRO's accented
   vowels are precomposed and NFC-stable. Whichever system (or
   both — the registry cannot ship both scripts under one tag, so
   "both" means a decision about which is primary) is the
   partners' call.
3. **Fonts**: the app's font (Inter) has no UCAS coverage — a
   syllabics choice needs a `:lang()` stack at ship time. OS
   coverage is good: Windows ships Gadugi and Euphemia (UCAS),
   macOS/iOS ship Euphemia UCAS, Android covers it via Noto Sans
   Canadian Aboriginal. Syllabics have uniform cap-height and no
   stacking marks — no line-height floor expected (contrast bo).
   SRO needs nothing special.
4. **No casing hazard in either script** (syllabics are
   unicameral; SRO diacritics survive case-mapping); the
   no-`text-transform` rule from the chr scaffold stands
   regardless.
5. **LTR; fallback chain → en**, with a real question for the
   East Cree communities: Eeyou Istchee members may be likelier
   to read French than English — the ht → fr → en precedent
   exists if partners want `crj → fr → en`. Their call.
6. **Speech**: no Cree speech-synthesis voices on today's
   platforms; the read-aloud surface already discloses that
   honestly.
7. **Registry sketch (dark, later, per-dialect)** — e.g. Plains:
   `{ code: "crk", endonym: "nêhiyawêwin" or "ᓀᐦᐃᔭᐍᐏᐣ", dir: "ltr", speakLang: "crk" }`
   plus a `cr`/`cre` detection alias to whichever dialect ships
   first (the fil/tl precedent). Swampy would ride csw's full
   CLDR support including the covers-zero plural rule.
8. **Language technology partners exist.** Plains Cree has real
   computational infrastructure built in community partnership —
   the morphologically intelligent dictionary and analyzers
   developed by the Alberta language-technology community
   together with Maskwacîs educators — and East Cree has a
   long-running community web-dictionary project. This track's
   translation tooling can interoperate with, not duplicate,
   that work.

## Decisions that belong to partners (open)

- **Which Cree** (above) — determined in practice by which
  community engages, not by our preference; the plan holds room
  for more than one.
- **Which writing system**, and with it the endonym and every
  string in the file.
- **Orthographic house style** within the chosen system (western
  SRO circumflex vs macron conventions; syllabics finals and
  the ᐦ conventions; sandhi/spacing conventions).
- **Terminology authority and coinages** (server, passkey, QR
  code): reuse from existing curricula and dictionaries where
  possible — Cree has active terminology development — and who
  signs off.

## Grammar notes for the string work (high-confidence only)

- **Polysynthetic, verb-centered** (Algonquian): much of an
  English sentence lives inside the Cree verb; placeholder
  templates will need free restructuring — our contract allows it
  (placeholders survive verbatim; the sentence around them is
  free).
- **Animate/inanimate gender runs through everything** — nouns,
  verb agreement, demonstratives. Which gender an *hour*, a
  *task*, a *post*, or the *app itself* takes is a real
  lexical-grammatical decision speakers make once and the
  glossary then enforces corpus-wide.
- **Obviation** (the "fourth person"): two third-persons in one
  sentence rank as proximate/obviative — directly relevant to
  strings about one member acting on another's post. Speakers
  navigate this without thinking; templates must not force wrong
  rankings, which is another argument for free restructuring.
- **Direct/inverse verb forms** encode who-acts-on-whom relative
  to a person hierarchy — the app-notifies-you vs you-tell-the-app
  distinction has grammatical consequences speakers will handle.
- **Plural marking is real** (animate *-ak* / inanimate *-a*), so
  for non-CLDR dialects the fallback-safe plural strategy has a
  cost — see finding 1 — and for csw the covers-zero rule makes
  `{{count}}` in `_one` mandatory.

## Register concepts — the questions we ask, with why we ask them

- **Wîcihitowin — "helping one another."** Plains Cree carries a
  widely used word for exactly what this app is: mutual help as a
  practice and a value (community organizations across the
  prairies use it by name). It is this scaffold's flagged
  suggestion — the gadugi/k'é parallel — **to confirm, never to
  assume**, and per-dialect equivalents are the partners' to
  name.
- **Wâhkôhtowin and miyo-wîcêhtowin** — kinship/interrelatedness
  and good relations, concepts with living weight in Cree law and
  Treaty understanding. Named as discussion anchors, not
  proposals: whether words that carry Treaty-order meaning belong
  on an app's buttons is precisely a speakers' judgment.
- **Ceremonial vocabulary we do not propose**: the hózhǫ́ rule
  from the Navajo scaffold applies as a standing principle —
  nothing from ceremony reaches for an interface unless partners
  offer it.
- **Hours are never debt** (the core fence). The Cree-specific
  resemblance risk is two centuries deep: the **Hudson's Bay
  Company outfit-and-debt system** — advances against next
  season's furs, the post ledger, Made Beaver accounting — the
  archetype of help-that-binds. And its counterweight is also
  local: the strong northern **co-op tradition**. What is the
  plain register of neighbors keeping track of shared work, and
  which words would reopen the company ledger?
- **The pass system makes the authorization register radioactive
  here.** On prairie reserves, leaving home required an Indian
  agent's written pass. An app that "grants permissions",
  "authorizes" members, or has them "request access" in the wrong
  vocabulary lands differently in Cree than in any shipped
  language. Our no-admins architecture is the right shape — the
  operator has narrow visible powers, nobody grants anybody
  passage — and the words that keep it feeling that way are the
  partners' to choose.
- **The surveillance and counting register**: treaty annuity
  paylists, agents' ledgers, trapline registration, residential
  school rolls, the Sixties Scoop's files — counting-by-authority
  vocabulary carries all of it; meanwhile band membership and
  treaty status are living civic vocabulary today. Flagging is
  bringing-before-the-community, never reporting; sign-up walks
  the enrollment line; partners hold the map.
- **Safety strings ship at full force**: compelled-biometrics,
  panic, guardians/recovery — line-by-line en→target fidelity
  review, nothing softened.
- **Sovereignty resonance, offered not imposed**: each community
  its own node, federating as equals — a shape Eeyou Istchee's
  own governance institutions and prairie nationhood both rhyme
  with, if the framing is useful.

## Term table

Structure only; concept column pre-filled from seventeen shipped
glossaries, Cree column open — and dialect-labeled when filled.
Wîcihitowin appears once, flagged, as described above.

| Concept (what the term must do) | Cree (dialect) | Notes / decisions |
|---|---|---|
| dashboard — the community's living overview; never "control panel" | *(open)* | |
| hours / the balance — never money, never a ledger you owe | *(open)* | HBC outfit/ledger register refused |
| post (need / offer) — neighbor speech, not classifieds | *(open)* | |
| claim / "In my care" — taking a task on, warmth not workflow | *(open)* | direct/inverse forms in play |
| confirm (exchange) — reserved for exchange confirmation in every language | *(open)* | |
| vouch — standing behind someone; never co-signing | *(open)* | |
| guardians (key shards) — trusted holders; never legal guardianship | *(open)* | |
| work day — communal labor | *(open)* | |
| mutual help / the practice itself | wîcihitowin? | flagged suggestion (Plains), to confirm; per-dialect forms open |
| flag — bring before the community; never report-to-authority | *(open)* | |
| dispute — disagreement between neighbors; never a case | *(open)* | |
| operator — keeps the server running; never a boss, never an agent | *(open)* | pass-system register refused |
| panic / hard purge — full force, plain words | *(open)* | |
| recovery kit / passphrase / passkey — loan-word tier decisions | *(open)* | terminology-development reuse |
| invite — guest warmth; never recruitment | *(open)* | membership-vocabulary caution |
| animacy assignments — hour, task, post, node | *(open)* | made once, enforced corpus-wide |

## What ships, and when

Nothing, until partners say so — identical posture to the three
sibling scaffolds. The wiring is one small PR per dialect on
proven rails: csw would ride full CLDR support (with the
covers-zero plural rule our gates already compute); crk/crj/cwd
ride the ht no-ICU pattern; a syllabics choice adds the
`:lang()` font stack; East Cree may take the fr-first fallback
chain. There is no deadline; the infrastructure waits for the
language — in as many of its dialects as its communities want.
