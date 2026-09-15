# Quechua (Runasimi / qu) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in `chr.md` and
`docs/i18n-partnership-cherokee.md`: Quechua speakers translate,
we supply all tooling, and nothing ships before their review —
`docs/i18n-partnership-quechua.md` for this track's specifics.
Round two's second language, and the partnership track's first
step beyond North America: the Quechuan family, seven-to-ten
million speakers across Peru, Bolivia, Ecuador, and their
diasporas — a language marginalized rather than small, and the
one language on this track whose culture already **names the
app's core concepts**: *ayni* (reciprocity), *mink'a/minga*
(communal work), *ayllu* (the community of mutual obligation).

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Quechua is a partial CLDR/ICU locale, in the inverse of
   Inuktitut's profile**: `Intl.NumberFormat("qu")` and
   `DateTimeFormat("qu")` resolve natively (a September date
   renders «Martes, 15 Setiembre» — Spanish-derived names, which
   itself reflects CLDR's Peruvian sources), and `DisplayNames`
   supplies the endonym **Runasimi** — but `PluralRules("qu")`
   falls back to the default locale. So plural handling follows
   the fallback-safe pattern (ht/nv), softened by the grammar:
   the Quechua plural (*-kuna*) is famously optional after
   numerals — a numeral typically carries the number and the
   noun stays unmarked — so identical fallback-safe pairs cost
   little; a speaker's call, as everywhere.
2. **The variety question is Cree-shaped, and CLDR has already
   leaned**: Quechua is a family (Quechua I/II) with limited
   mutual intelligibility across branches. `quz` (Cusco) aliases
   toward `qu` for formats; `qug` (Ecuadorian Kichwa — which has
   its own **unified standard, Kichwa**) is absent entirely. The
   registry can carry `qu` as Southern Quechua first and `qug`
   as a sibling later, or whatever shape the engaging
   communities prefer — per-tag, like Cree.
3. **The orthography question is real and institutional**: Peru's
   official trivocalic standard (a/i/u) versus pentavocalic
   traditions is a long-running, live dispute with official
   bodies on both sides. The interface follows the partners'
   convention; our gates enforce whichever is chosen,
   consistently. All candidate orthographies are plain Latin
   (with apostrophes for ejectives in Cusco-Collao — the
   glottal-codepoint decision from the sibling scaffolds
   applies: we lean U+02BC, partners decide).
4. **Fallback chain: qu → es → en** — the second non-uniform
   chain the app would ship (after ht → fr → en), and the
   stronger case: Andean members overwhelmingly read Spanish,
   and **our complete Spanish corpus doubles as a bridge for
   translators** — every string and playbook exists in polished
   Spanish alongside English, a working aid no other track has.
5. **No rendering spike**: plain Latin, NFC-stable, no casing
   hazard; LTR. **Speech**: no `qu` voice on today's platforms;
   the read-aloud surface discloses honestly.
6. **Registry sketch (dark, later)**:
   `{ code: "qu", endonym: "Runasimi", dir: "ltr", speakLang: "qu" }`
   with the es-first fallback and room for `qug`.
7. **Machine translation exists** (Quechua entered the major MT
   systems in recent years) — the Inuktitut scaffold's honest
   note applies verbatim: it changes nothing; register is craft,
   and authority rests with speakers.

## Decisions that belong to partners (open)

- **Which Quechua, and how many** (finding 2) — Southern
  Quechua's Cusco-Collao standard, Ayacucho, Bolivian norms, or
  Ecuadorian Kichwa as its own entry; determined by who engages.
- **Which orthography** (finding 3) — tri- vs pentavocalic, and
  the ejective/glottal conventions; an institutional decision
  with official bodies in the region already seized of it.
- **Terminology authority**: Peru's intercultural bilingual
  education apparatus, the Cusco academy, and university
  programs all produce normalized vocabulary; whose conventions
  anchor tech coinages, and who signs off.

## Grammar notes for the string work (high-confidence only)

- **Agglutinative and suffixing**, evidential-marking, SOV:
  templates restructure freely (placeholders survive verbatim);
  evidentials are a register gift — Quechua grammatically marks
  witnessed vs reported information, and an app that refuses to
  pretend certainty (our honesty strings) may find those
  distinctions doing real work. Speakers' craft.
- **Plural -kuna optional after numerals** (finding 1) — the
  fallback-safe plural pattern costs little here.
- **Inclusive vs exclusive "we" exists** (ñuqanchik vs ñuqayku) —
  as in Cherokee, the corporate-we ban may be *easier* to state
  in Quechua than in English: member-inclusive warmth is the
  inclusive form; an app-voice "we" would be nakedly exclusive.
- No grammatical gender — they/them neutrality costs nothing.

## Register concepts — the questions we ask, with why we ask them

- **Ayni is the app.** Reciprocal labor between households —
  help given, help returned, no money, the relationship itself
  the ledger. **Mink'a/minga** is the communal work day. **Ayllu**
  is the community of mutual obligation. This is the only track
  where the term table's hardest rows may already be solved by
  the culture — flagged as anchors **to confirm, never to
  assume** (whether these words belong on buttons, and in which
  regional forms, is the speakers' judgment), but the questions
  we ask everywhere else ("what is the plain register of
  neighbors keeping track of shared work?") have, here,
  thousand-year-old answers.
- **Mita is the anti-pattern with a name.** The colonial forced
  labor draft — *mita* — stands opposite *mink'a*: compelled
  versus chosen communal work. No shipped glossary has had the
  refusal built into the lexicon itself; the fence writes
  itself, and partners will police the boundary instinctively.
- **Hours are never debt**: the local resemblance risks are
  *enganche* (debt-bondage labor recruitment) and hacienda-store
  credit — the peonage ledger. Ayni's register is the exact
  opposite; keeping the app on ayni's side of that line is the
  whole game.
- **Sumak kawsay / suma qamaña** (buen vivir) are constitutional
  civic concepts in Ecuador and Bolivia — the IQ-principles
  parallel from the Inuktitut scaffold: public-life vocabulary,
  not ceremony, but still the partners' call whether an app may
  stand near them.
- **The counting register**: hacienda rolls, tribute censuses,
  and the long state history of counting Andean people — against
  today's living civic identity vocabulary. Same line as every
  sibling scaffold; partners hold the map.
- **Ceremonial vocabulary we do not propose** — the standing
  rule; despacho and ritual registers are not an interface's to
  borrow.
- **Safety strings ship at full force** — and the region's
  history of internal conflict (names on lists having cost
  lives within living memory) gives the no-rosters,
  bring-before-the-community fences particular weight partners
  will not need explained.

## Term table

Structure only; concept column pre-filled, Runasimi column open.

| Concept (what the term must do) | Runasimi | Notes / decisions |
|---|---|---|
| reciprocity / the exchange itself | ayni? | THE anchor — to confirm, never assume |
| work day — communal labor | mink'a / minga? | flagged anchor; regional forms open |
| community / the circle of obligation | ayllu? | flagged anchor; modern range to weigh |
| hours / the balance — never money, never owed | *(open)* | enganche/peonage register refused |
| dashboard / post / claim / confirm / vouch / guardians | *(open)* | per the sibling scaffolds' fences |
| flag — before the community, never report-to-authority | *(open)* | |
| operator — never a boss, never a patrón | *(open)* | |
| panic / hard purge — full force | *(open)* | |
| recovery kit / passphrase / passkey — loan-word tiers | *(open)* | es loans vs coinages — partners' call |
| invite — guest warmth; never recruitment | *(open)* | |

## What ships, and when

Nothing, until partners say so — the standing posture. Wiring is
one small PR: fallback-safe plural rows, the es-first fallback
chain (ht precedent), native qu date/number formats free, room
for qug. There is no deadline; the infrastructure waits for the
language.
