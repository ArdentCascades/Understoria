# Fulfulde/Pulaar in Adlam (𞤆𞤵𞤤𞤢𞤪 / ff-Adlm) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in `chr.md` and
`docs/i18n-partnership-cherokee.md` (all three track-wide
policies included): Fulɓe speakers translate, we supply all
tooling, and nothing ships before their review —
`docs/i18n-partnership-adlam.md` for specifics. Round five's
second language, the track's first from Africa, and the
Atlantic (Niger-Congo) family's entry: the Fula language
continuum spans the Sahel from Senegal to beyond Cameroon, tens
of millions of speakers — and **Adlam**, the alphabet Ibrahima
and Abdoulaye Barry invented in 1989 as teenagers so their
language could be written as itself, is one of the great
community-script stories on earth: Unicode since 2016, shipped
on major platforms, carried by a grassroots literacy movement.
This scaffold follows that movement's script; the Latin and
Ajami (Arabic-script) traditions are real and the script
question ultimately belongs to whoever engages.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Adlam-script Fulah is a first-class CLDR/ICU locale**:
   `ff-Adlm` resolves natively with `one`/`other` plural rules,
   **Adlam-digit number formats** (𞥑⹁𞥒𞥓𞥔 — its own digit block
   and its own separator), fully in-script dates
   («𞤃𞤢𞤱𞤦𞤢𞥄𞤪𞤫 𞥑𞥕 𞤅𞤭𞤤𞤼𞤮»), and the endonym **𞤆𞤵𞤤𞤢𞤪** from
   `DisplayNames`. `ff-Latn` is likewise supported (Latin with
   ɓ ɗ ŋ ƴ — hooked letters, precomposed).
2. **Adlam is RTL — the app's rails are proven three languages
   deep** (ar, ur, fa): mirrored layout from `<html dir>`,
   arrow conventions, the whole R1–R3 program. Adlam would be
   the app's fourth RTL language and its first RTL alphabet
   outside the Arabic script family.
3. **Adlam is BICAMERAL** (real capitals, U+1E900–1E921) with
   well-defined case mapping — no Cherokee-style remap hazard;
   the standing no-`text-transform` rule applies regardless.
   Font stack needed at wiring (`:lang(ff)` in Adlam: Windows
   Ebrima, Android/Noto Sans Adlam; Inter has none). Adlam also
   uses combining marks (the lengthening sign) — one positioning
   check recorded.
4. **Digits are the partners' call, with the Santali framing**:
   Adlam digits are part of the script's identity and CLDR's
   default; no latn pin is assumed.
5. **The variety question is Cree-shaped**: Fula is a
   macrolanguage (Pulaar `fuc`, Pular `fuf`, Maasina, Nigerian
   Fulfulde and more). CLDR's `ff` data serves the continuum;
   which variety's usage anchors the translation is set by who
   engages, with per-tag registry room.
6. **Fallback chain**: regionally split (French-literate west,
   English-literate east, Arabic-literate throughout) — `ff →
   fr → en` is available on the ht rails and likely right for
   Guinea/Senegal partners; recorded as their decision, en-direct
   default until made.
7. **Registry sketch (dark, later)**:
   `{ code: "ff", endonym: "𞤆𞤵𞤤𞤢𞤪", dir: "rtl", speakLang: "ff" }`
   (script per partners; a `ff-Latn` sibling entry possible —
   the iu-Cans/iu-Latn discussion applies).

## Decisions that belong to partners (open)

- **Script** (Adlam-first per the movement's momentum, but
  theirs to confirm), **variety**, **digits**, **fallback** —
  findings 1–6.
- **Terminology authority**: the Adlam movement's own
  organizations (Winden Jangen Adlam and the teaching networks)
  have coined modern vocabulary for a decade; their conventions
  are the natural anchor, theirs to confirm.

## Grammar notes (high-confidence only)

- **Noun-class system** (Fula's famous ~20+ classes with
  concord and initial-consonant alternation): which class an
  *hour*, a *task*, a *post* belongs to shapes agreement
  everywhere — the once-made corpus-wide decision, richer here
  than anywhere on the track. Templates restructure freely.
- Plural morphology is real (class-paired singular/plural);
  the CLDR one/other rules fit.

## Register concepts — the questions we ask

- **Pulaaku — the Fulɓe ethical code (dignity, restraint,
  patience, care for one's own) — is named with care, not
  proposed**: it is identity-deep, and whether an app may stand
  anywhere near it is entirely a speakers' judgment.
- **The herding economy's own solidarity institutions** — such
  as the cattle-entrustment customs by which a family in need
  is lent an animal and keeps its calves — are the reciprocity
  register's local ground; the right words are the partners',
  we bring the question only.
- **Hours are never debt**, with two local registers to hold
  apart: the merchant's ledger and colonial advance on one
  side; and on the other, the Islamic finance vocabulary this
  track has met before — the fa glossary's absolute fence
  around قرض‌الحسنه has a direct analog here (qard hasan,
  riba-avoidance vocabulary), and the same rule applies: the
  timebank must resemble neither the moneylender nor the
  benevolent-loan fund. Partners will know the words on both
  sides.
- **The counting register**: colonial censuses and cattle-tax
  rolls, and today's ID regimes across six states of a
  borderless herding world — the standing line, with a
  federation resonance (communities that move, nodes that
  federate) offered never imposed.
- **Ceremonial and religious register under the standing
  do-not-propose rule.** Safety strings at full force —
  and where any engaging community's situation raises the
  threat-model-first policy, that conversation precedes
  everything.

## Term table

Structure as in every sibling scaffold; 𞤆𞤵𞤤𞤢𞤪 column entirely
open — our Fulfulde is thin and the scaffold says so; the
noun-class assignment row is the once-made decision to record
first.

## What ships, and when

Nothing, until partners say so. Wiring rides first-class CLDR
on proven RTL rails plus the Adlam font stack. No deadline; the
infrastructure waits for the language.
