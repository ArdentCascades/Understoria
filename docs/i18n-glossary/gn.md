# Guaraní (Avañe'ẽ / gn) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in `chr.md` and
`docs/i18n-partnership-cherokee.md` (both track-wide policies
included): Guaraní speakers translate, we supply all tooling,
and nothing ships before their review —
`docs/i18n-partnership-guarani.md` for specifics. Round four's
third language and the Tupian family's entry — the track's
unique case: **a co-official national language spoken by the
majority of Paraguayans**, Indigenous in origin and carried by
the whole country, yet historically stigmatized and still
under-served digitally. One scope note up front: this scaffold
addresses **Paraguayan Guaraní** (`gn`/`gug`, the national
standard); the Indigenous Guaraní peoples' own varieties (Mbyá,
Paĩ Tavyterã, Avá and others) are distinct communities whose
languages fall squarely under the track's unbidden-scaffold
policies — theirs to ask for, never ours to assume.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Guaraní is not in CLDR/ICU** (`gn` and `gug` both fall back
   — verified). The proven no-ICU pattern applies; Guaraní
   plural marking (-kuéra) is optional in many contexts, so
   fallback-safe pairs are cheap; a speaker's call.
2. **Orthography: the standardized achegety, with one real
   rendering check.** Latin plus the puso (glottal stop — the
   standing codepoint question; we lean U+02BC) and the nasal
   tilde series ã ẽ ĩ õ ũ ỹ g̃. Verified precisely: **ỹ has a
   precomposed codepoint (U+1EF9) and is safe; g̃ does NOT** —
   it is g plus combining tilde in any normalization, so the
   one wiring-time check is combining-mark positioning for g̃
   across the app's font weights (the Navajo ą́ situation, one
   letter wide).
3. **Fallback chain gn → es → en** — the Quechua/K'iche'
   precedent, with the same Spanish-corpus bridge for
   translators; in Paraguay's thoroughly bilingual reality this
   chain is uncontroversial.
4. **No casing hazard; LTR. Speech**: no voice; honest
   disclosure applies.
5. **Registry sketch (dark, later)**:
   `{ code: "gn", endonym: "Avañe'ẽ" (or Guarani, partners' call), dir: "ltr", speakLang: "gn" }`.

## Decisions that belong to partners (open)

- **THE register question: Guaraniete or Jopara.** Everyday
  Paraguayan speech mixes Guaraní and Spanish (Jopara); formal
  written Guaraní (sometimes with purist neologisms) can read
  distant from lived speech. An interface must choose where on
  that line to sit — warm-and-lived versus formal-and-pure —
  and this is precisely the judgment of the Academia de la
  Lengua Guaraní, the Ateneo tradition, and working teachers,
  not ours. Every sibling scaffold's warmth principle (the app
  talks like a neighbor) is an argument they may weigh; the
  decision is theirs.
- **Terminology and coinage style**: purist coinages vs
  naturalized Spanish loans for tech vocabulary — the same axis,
  decided once, enforced corpus-wide.

## Grammar notes (high-confidence only)

- **Inclusive vs exclusive "we" — ñande vs ore** — the
  clearest version of the track's recurring gift: the
  corporate-we ban states itself (member-inclusive warmth is
  ñande — a word of enormous cultural resonance; an app-voice
  "we" would be ore, nakedly exclusive). «Ñande» is one of the
  most beloved words in the language; whether the app may lean
  on it is the partners' call, and a happy question to have.
- Agglutinative, with nasal harmony (affix forms change with
  nasality — a spelling-consistency point our gates can check
  once partners state the rule); templates restructure freely.
- No grammatical gender — they/them neutrality costs nothing.

## Register concepts — the questions we ask

- **Jopói — mutual, unasked giving between neighbors — is the
  anchor to confirm**: Paraguayan Guaraní carries a named
  practice of reciprocal gift exchange that is very nearly this
  app's definition. **Tekoha** (the place-where-we-are-what-we-
  are; community-and-land) and **teko porã** (the good life —
  the buen vivir sibling) are discussion anchors with real
  weight — tekoha especially carries Indigenous Guaraní
  land-rights meaning, another reason the scope note above
  matters and the word is the partners' to weigh, not ours to
  take.
- **Minga** (communal work day) is lived Paraguayan practice —
  the work-day surface's likely register.
- **Hours are never debt**: the refused registers are the
  almacén credit ledger and patronal advance — and Guaraní's
  own history of being called "guarango" (crude) in schools
  stands behind the app's insistence that the language of help
  is never lesser speech.
- **Safety strings at full force** — the standing line-by-line
  fidelity review; the Stronato's informer networks (pyragué —
  the "hairy-footed" listeners — a Guaraní word the dictatorship
  made infamous) give the surveillance fence a local name
  partners will recognize instantly: nothing in this app may
  ever sound like a pyragué's report.

## Term table

Structure as in every sibling scaffold; Avañe'ẽ column open —
jopói flagged as the anchor to confirm, ñande as the
inclusive-we question, minga for the work day, all speakers'
calls.

## What ships, and when

Nothing, until partners say so. Wiring is one small PR on the
no-ICU rails with the es-first chain and the g̃ font check. No
deadline; the infrastructure waits for the language.
