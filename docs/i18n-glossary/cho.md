# Choctaw (Chahta anumpa / cho) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in full in
`chr.md` and `docs/i18n-partnership-cherokee.md` and applied to
every sibling scaffold (`nv.md`, `lkt.md`, `cr.md`, `iu.md`):
Choctaw speakers translate, we supply all tooling, and nothing
ships before their review. This file carries the verified Stage-0
findings and the register questions, posed for partners — round
two of the partnership track begins here, with the Muskogean
family's entry.

Roughly nine thousand speakers across the Choctaw Nation of
Oklahoma (whose School of Choctaw Language runs standing online
and community classes), the Mississippi Band of Choctaw Indians —
where first-language transmission is among the strongest of any
tribe in the United States — and the Jena Band in Louisiana.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Choctaw is not in CLDR/ICU** (`cho` falls back to the
   default locale — verified). The proven no-ICU pattern applies
   (ht/nv): fallback-safe plural pairs, no free localized dates,
   honestly disclosed. Grammar softens the plural cost the way
   Navajo's does — number frequently lives in the verb (including
   suppletive singular/plural verb stems), and the noun often
   goes unmarked — but as everywhere, stem choice is a speaker's
   judgment.
2. **Latin script, multiple orthographies — the first-order
   partner decision.** Choctaw has been written since the
   nineteenth century (among the earliest Native literacy
   traditions in the U.S., with its own newspapers and a
   translated hymnody in continuous use), and today at least
   three conventions are live: the traditional
   missionary-era/Byington spelling, the Choctaw Nation's modern
   School of Choctaw Language orthography, and Mississippi Band
   conventions. All are substantially ASCII (the vowel written
   `v` — as in *Chahta anumpa*, *vlla* — is a plain letter);
   nasalization marking differs by convention, so the one
   wiring-time check is glyph coverage for whatever nasal
   diacritics the chosen convention uses. The registry entry's
   endonym spelling follows the same decision.
3. **No casing hazard; LTR; fallback chain cho → en.** No
   `text-transform` anywhere (the standing rule), no rendering
   spike expected.
4. **Speech**: no `cho` voice on today's platforms; the
   read-aloud surface discloses that honestly.
5. **Registry sketch (dark, later)**:
   `{ code: "cho", endonym: "Chahta anumpa" (spelling per the orthography decision), dir: "ltr", speakLang: "cho" }`.

## Decisions that belong to partners (open)

- **Which convention writes the interface** (finding 2) — and
  whether one translation serves both Oklahoma and Mississippi or
  the conventions differ enough to matter; the Cree scaffold's
  continuum posture applies gently (the registry could carry more
  than one entry if that is ever wanted, though one seems
  likelier here).
- **Terminology authority and coinages**: the School of Choctaw
  Language and the Mississippi program both produce curriculum;
  whose conventions anchor new tech vocabulary, and who signs
  off.

## Grammar notes for the string work (high-confidence only)

- **Muskogean, verb-final, verb-centered**: active-stative
  agreement and verb-grade morphology mean templates restructure
  freely — our contract allows it (placeholders survive verbatim;
  the sentence around them is free).
- **Number often lives in the verb** (suppletive sg/pl stems for
  some common verbs) — see finding 1; a speaker's craft call.
- **No grammatical gender** — the app's they/them neutrality
  costs nothing.

## Register concepts — the questions we ask, with why we ask them

- **The Choctaw gift to Ireland is this app's whole register in
  one story.** In 1847 — sixteen years after surviving their own
  removal, the first Trail of Tears — Choctaw people collected
  famine relief and sent it to Ireland; the kinship was renewed
  in the other direction in living memory. Help flowing level,
  from people who had least, because that is what neighbors do:
  if the glossary work here ever needs its north star, it has
  one, and it is already Choctaw. Which words carry it is the
  partners' craft.
- **Hours are never debt** (the core fence, every language). The
  local resemblance risks partners will recognize: trader and
  agency credit, allotment-era ledgers, sharecropping-country
  debt around the Mississippi communities. What is the plain
  register of neighbors keeping track of shared work?
- **No admins, no bosses**: agency and bureau vocabulary refused;
  the operator has narrow visible powers. Choctaw civic
  vocabulary is old and rich (the Nation had written constitutions
  before removal) — which register fits an app that insists it
  has no chiefs is exactly a speakers' call.
- **The counting register**: the Dawes Rolls sit as heavily in
  Choctaw history as anywhere — and tribal enrollment (CDIB,
  citizenship) is living civic vocabulary today. Sign-up language
  walks the same line every sibling scaffold names; partners hold
  the map.
- **The code talkers were Choctaw first.** The original code
  talkers of the First World War were Choctaw soldiers — the
  proof, a generation before Navajo's more famous one, that the
  language can say anything a new technology needs said. If
  partners want the app's tech vocabulary to stand in that
  tradition, nothing would honor it more.
- **Ceremonial vocabulary we do not propose** — the standing
  hózhǫ́ rule from the sibling scaffolds applies unchanged.
- **Safety strings ship at full force**: compelled-biometrics,
  panic, guardians/recovery — line-by-line en→target fidelity
  review, nothing softened.

## Term table

Structure only; concept column pre-filled from seventeen shipped
glossaries, Chahta column open.

| Concept (what the term must do) | Chahta anumpa | Notes / decisions |
|---|---|---|
| dashboard — the community's living overview; never "control panel" | *(open)* | |
| hours / the balance — never money, never a ledger you owe | *(open)* | |
| post (need / offer) — neighbor speech, not classifieds | *(open)* | |
| claim / "In my care" — warmth not workflow | *(open)* | |
| confirm (exchange) — reserved word in every language | *(open)* | |
| vouch — standing behind someone; never co-signing | *(open)* | |
| guardians (key shards) — never legal guardianship vocabulary | *(open)* | |
| work day — communal labor | *(open)* | |
| flag — bring before the community; never report-to-authority | *(open)* | |
| dispute / operator / panic — per the sibling scaffolds' fences | *(open)* | |
| recovery kit / passphrase / passkey — loan-word tiers | *(open)* | code-talker coinage tradition |
| invite — guest warmth; never recruitment | *(open)* | enrollment-collision caution |

## What ships, and when

Nothing, until partners say so — the standing posture. Wiring is
one small PR on the ht/nv no-ICU rails plus the orthography's
glyph check. There is no deadline; the infrastructure waits for
the language.


## New since this draft (2026-09-22) — read before the strings pass

Two things changed after this glossary was drafted; both are work
for the human review this document waits on, recorded here so the
launch cannot miss them:

1. **The app gained opt-in notifications** (docs/notifications.md):
   ~40 new strings (`push.*`, `provenance.editingOriginal`) since
   this draft's inventory. The register rule that matters: the
   feature needs a word for *push notification* that is DISTINCT
   from whatever this glossary chose for a board *post* — Persian
   and Burmese had both spent their everyday "notification" word on
   the post and needed a second term (fa آگاه‌سازی, my သတိပေးချက်).
   Check this glossary's post/announce decisions for the same
   collision before translating the notifications strings.
2. **The field-test ledger** in docs/provenance-translation.md
   ("Field-test ledger (2026-09-22)") lists every class of
   untranslated surface live testing found. A launch in this
   language walks that ledger by hand, in this language, over an
   instance created in a different language.
