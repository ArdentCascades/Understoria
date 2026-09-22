# K'iche' (Kʼicheʼ / quc) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in `chr.md` and
`docs/i18n-partnership-cherokee.md` (both track-wide policies
included): K'iche' speakers translate, we supply all tooling,
and nothing ships before their review —
`docs/i18n-partnership-kiche.md` for specifics. Round four's
second language and the Mayan family's entry: on the order of a
million speakers in the Guatemalan highlands — a marginalized
majority-scale language, like Quechua — with a literary
credential no language on this track can match: **the Popol Wuj
is K'iche'**. A people whose language carries one of the great
books of world literature does not need anyone's proof that it
can say anything.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **K'iche' is not in CLDR/ICU** (`quc` falls back — verified;
   though even English DisplayNames renders the name «Kʼicheʼ»
   with U+02BC, a small omen for finding 2). The proven no-ICU
   pattern applies: fallback-safe plural pairs (K'iche' plural
   marking is largely optional/analytic — low cost), no free
   localized dates, honestly disclosed.
2. **Orthography: the ALMG unified alphabet**, official since
   1987 across the Mayan languages of Guatemala — Latin plus the
   glottalized-consonant apostrophe (bʼ, kʼ, qʼ, tzʼ…). The
   standing codepoint rule lands hard here: **U+02BC
   corpus-wide**, never an ASCII or curly quote, in a language
   whose own name contains it twice. No other rendering risk; no
   casing hazard.
3. **Fallback chain quc → es → en** — the Quechua precedent
   exactly, with the same unique aid: **the app's complete
   Spanish corpus as a translators' bridge** alongside English.
4. **LTR. Speech**: no voice; honest disclosure applies.
5. **Registry sketch (dark, later)**:
   `{ code: "quc", endonym: "Kʼicheʼ", dir: "ltr", speakLang: "quc" }`
   — with room for sibling Mayan languages (Kaqchikel `cak`,
   Q'eqchi' `kek`, Mam `mam`, Yucatec `yua`…) as their own
   entries if ALMG-connected communities ever want them; the
   registry is per-tag.

## Decisions that belong to partners (open)

- **Terminology authority**: the ALMG — Guatemala's statutory
  academy for the Mayan languages — exists precisely for such
  questions (the Inuktitut parallel); whether app vocabulary
  runs through it, through university programs, or through the
  working translators is theirs to resolve.
- **Dialect breadth**: K'iche' has real internal variation;
  which communities' usage anchors the translation is set by who
  engages.

## Grammar notes (high-confidence only)

- **Mayan, ergative, verb-initial tendencies**: templates
  restructure freely (placeholders survive verbatim).
- **Possession is head-marked** and body-part/relational nouns
  do locational work — "my hours", "in my care" will restructure
  naturally; speakers' craft.
- No grammatical gender — they/them neutrality costs nothing.

## Register concepts — the questions we ask, with why we ask them

- **Communal work and the commons are lived institutions** in
  the highlands (the town-level communal labor traditions, the
  cofradía's civic-religious service ladder) — what the plain
  register of neighbors keeping shared count is, and which words
  would drag in obligation-to-institutions instead, is exactly
  the speakers' map. We deliberately bring **no lexical
  suggestion** here: our K'iche' is thin, and the honest
  scaffold says so rather than guessing.
- **The safety fences carry their heaviest weight on this
  track.** Within living memory, the genocide of the early
  1980s made lists of names instruments of death in these
  highlands, and the civil-patrol system forced neighbors into
  informer structures. The app's refusals — no rosters, no
  reports to authority, flagging as bringing-before-the-
  community, identity as keys the member holds — need no
  explaining to K'iche' communities; the words that keep those
  refusals true deserve, and will get, the most careful review
  in the file, with the compelled-biometrics and panic strings
  at absolute full force.
- **Hours are never debt**: plantation advances and the
  finca labor-contractor's ledger (the enganche system reached
  these highlands too) are the refused register.
- **Ceremonial vocabulary and the day-count tradition we do not
  propose** — the standing rule, held firmly where the calendar
  itself is sacred knowledge.

## Term table

Structure as in every sibling scaffold; Kʼicheʼ column entirely
open — deliberately, per the honesty note above.

## What ships, and when

Nothing, until partners say so. Wiring is one small PR on the
no-ICU rails with the es-first chain and the U+02BC gate. No
deadline; the infrastructure waits for the language.


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
