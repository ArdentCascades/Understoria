# Hmong (Hmoob / hmn) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in `chr.md` and
`docs/i18n-partnership-cherokee.md` (all three track-wide
policies included): Hmong speakers translate, we supply all
tooling, and nothing ships before their review —
`docs/i18n-partnership-hmong.md` for specifics. Round five's
third language, the Hmong-Mien family's entry — and the track's
clearest institutional rhyme: the Hmong diaspora's **Mutual
Assistance Associations** have been organized, named mutual aid
for fifty years. This app's function is not a concept to explain
to Hmong communities; it is a thing their institutions already
do, and are called.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **CLDR coverage is fragmentary and dialect-shaped**: White
   Hmong (`mww`) and the macrolanguage (`hmn`) are absent (fall
   back — the proven no-ICU pattern); Green Hmong (`hnj`) has
   plural rules only, single-category `["other"]`. Practically:
   whichever variety engages rides the no-ICU pattern with
   cheap plural pairs — Hmong does not inflect nouns for
   number (classifiers and context carry it), so identical
   fallback-safe pairs cost nothing, the ht/zh situation.
2. **The script decision is community history, handled with
   care.** The **RPA (Romanized Popular Alphabet)** is the
   diaspora's working orthography — pure ASCII, with the famous
   device of word-final consonant letters marking tone (Hmoob,
   zoo, peb): no diacritics, no rendering risk at all, but one
   gate note — spell-checking and truncation must never treat a
   final tone letter as droppable. **Pahawh Hmong** (Shong Lue
   Yang's script) and **Nyiakeng Puachue** carry deep
   community and religious meaning; both are in Unicode; whether
   either belongs on an interface — and for which community —
   is exactly the kind of judgment the access-by-choice policy
   anticipates: RPA-first per diaspora practice, the sacred
   scripts only ever at a community's own initiative.
3. **Variety**: White and Green Hmong (Hmong Daw / Moob Leeg)
   are the diaspora's two main written varieties; which anchors
   the translation — or whether both, per-tag — is set by who
   engages.
4. **LTR; fallback hmn → en** (the US diaspora context; Lao/
   Thai/French questions arise only if non-US communities
   engage — and any homeland-context engagement raises the
   threat-model-first policy before anything else).
5. **Speech**: no voice on today's platforms; honest disclosure
   applies. (Hmong is a tone language written without
   diacritics — the read-aloud surface's honesty matters
   doubly.)
6. **Registry sketch (dark, later)**:
   `{ code: "mww" or "hnj" per partners, endonym: "Hmoob" / "Moob", dir: "ltr", speakLang: matching }`.

## Decisions that belong to partners (open)

- **Variety and endonym spelling** (Hmoob vs Moob — the
  white/green split is visible in the word itself), and the
  script posture above.
- **Terminology authority**: Hmong studies programs, the
  cultural centers, and two generations of interpreter/
  translator practice in US institutions; whose conventions
  anchor coinages is theirs.

## Grammar notes (high-confidence only)

- **Analytic, classifier-rich, serial-verb**: templates
  restructure freely (placeholders survive verbatim);
  classifiers do the counting work (`{{count}}` sits next to
  the right classifier, a translator's choice).
- **The reciprocal marker sib** builds mutual verbs
  productively — *sib pab*, helping each other — see the
  register notes; the grammar itself has a dedicated way to say
  what this app does.
- No grammatical gender — they/them neutrality costs nothing.

## Register concepts — the questions we ask

- **Kev sib pab — mutual help — is the anchor to confirm**: the
  reciprocal grammar (sib) plus help (pab) names the app's
  function as directly as any phrase on this track, and it is
  ordinary, warm, living speech. Whether it belongs on the
  masthead surfaces is the speakers' call; that it exists is
  the reason this scaffold was easy to believe in.
- **The clan (xeem) system is the community structure and is
  treated with respect, not borrowed**: kinship obligation
  networks are how Hmong mutual aid historically moves; whether
  any clan vocabulary belongs in an app for mixed communities
  is a speakers' judgment — the scaffold poses it and stops.
- **The refugee-camp and resettlement ledgers are the refused
  registers**: sponsorship paperwork, aid-agency caseworker
  vocabulary, the welfare office's file — the NGO fence every
  glossary holds, with this diaspora's specific history. The
  MAAs themselves are the counter-register: neighbors organizing
  neighbors, in Hmong, for fifty years.
- **The counting register**: no rosters, no lists — with the
  Secret War's history of names and sides behind it; the
  standing fences need no explaining.
- **Ceremonial and spiritual vocabulary under the standing
  do-not-propose rule** (and Pahawh's history sits partly in
  that domain — finding 2). Safety strings at full force.

## Term table

Structure as in every sibling scaffold; Hmoob column open — kev
sib pab flagged as the anchor to confirm, everything else per
the standing fences; the classifier choices for hour/task/post
recorded as the once-made decision row.

## What ships, and when

Nothing, until partners say so. Wiring rides the no-ICU rails
with zero rendering risk (RPA is ASCII) and the tone-letter
truncation gate. No deadline; the infrastructure waits for the
language.
