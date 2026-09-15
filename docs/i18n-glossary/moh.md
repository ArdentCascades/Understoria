# Mohawk (Kanien'kéha / moh) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in `chr.md` and
`docs/i18n-partnership-cherokee.md` (including its track-wide
policy section): Kanien'kéha speakers translate, we supply all
tooling, and nothing ships before their review —
`docs/i18n-partnership-mohawk.md` for this track's specifics.
Round three's first language, and the track's second Iroquoian
one — earned on its own: the Kanien'kéha revitalization movement
(Akwesasne Freedom School since 1979, Onkwawenna Kentyohkwa's
adult immersion at Six Nations, the Kahnawà:ke cultural center's
programs) is among the most sustained and successful anywhere,
which means the people this model needs — speakers who teach —
already exist in numbers.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Mohawk is not in CLDR/ICU** (`moh` falls back — verified).
   The proven no-ICU pattern applies (ht/nv): fallback-safe
   plural pairs, no free localized dates, honestly disclosed.
2. **Orthography: Latin with two characters that matter to
   machines.** Kanien'kéha writing uses accented vowels
   (precomposed, NFC-safe), an apostrophe for the glottal stop
   (the sibling scaffolds' codepoint question — we lean U+02BC,
   partners decide), and — the genuinely novel finding — **the
   COLON as a letter**: vowel length is written word-internally
   with `:` (á:we, Kahnawà:ke, Ohén:ton). Every
   punctuation-aware scan in our gates (terminal-punctuation
   checks, quote hygiene) must treat word-internal U+003A as
   orthographic, not punctuation — a one-line gate adaptation,
   recorded here so it is never "fixed" as a typo. Whether
   partners prefer U+003A or a typographic alternative (some
   communities use the modifier colon U+A789 to dodge software
   breakage) is theirs to decide; the gates enforce one choice
   corpus-wide.
3. **Community conventions differ** (Kahnawà:ke, Six Nations,
   Akwesasne orthographic practice varies in details) — the
   which-convention decision parallels Choctaw's, made by
   whichever programs engage.
4. **No casing hazard; LTR; fallback chain moh → en**, with a
   note: Kahnawà:ke and Kanehsatà:ke sit in Quebec — whether any
   community wants the ht-style fr-first chain is theirs to say.
5. **Speech**: no `moh` voice on today's platforms; the
   read-aloud surface discloses honestly.
6. **Registry sketch (dark, later)**:
   `{ code: "moh", endonym: "Kanien'kéha" (spelling per convention), dir: "ltr", speakLang: "moh" }`.

## Decisions that belong to partners (open)

- **Which community's conventions** anchor spelling (finding 3),
  and the glottal-stop and length-mark codepoints (finding 2).
- **The grammatical-gender register decision.** Iroquoian
  pronominal prefixes mark gender (masculine, feminine-
  indefinite, neuter/zoic), and generic reference to "a member"
  must pick a form — a decision with real social weight that
  Kanien'kéha teachers have thought about far longer than we
  have. The scaffold records the question and nothing else.
- **Terminology authority and coinages**: the immersion schools
  and cultural centers produce curriculum; whose conventions
  anchor tech vocabulary, and who signs off.

## Grammar notes for the string work (high-confidence only)

- **Iroquoian, polysynthetic, pronominal-prefix rich** — like
  Cherokee, with a fuller paradigm: **inclusive and exclusive
  first persons, and dual as well as plural**. The corporate-we
  ban gains grammar again (an app-voice "we" would be nakedly
  exclusive; member-inclusive warmth is the inclusive forms),
  and the dual will make some two-party strings (an exchange has
  two people) more precise than English.
- Templates restructure freely — placeholders survive verbatim;
  the sentence around them is free.

## Register concepts — the questions we ask, with why we ask them

- **The Two Row Wampum (Kaswentha) is the federation's own
  image**: two vessels on the same river, parallel, neither
  steering the other. An app where every community runs its own
  node and no node commands another can be described in that
  register **truthfully** — whether it should be is precisely
  the judgment that belongs to Kanien'kéha speakers, offered
  never imposed.
- **The Thanksgiving Address and ceremonial register we do not
  propose** — the standing rule from every sibling scaffold,
  held firmly here where the ceremonial tradition is close to
  daily life.
- **Hours are never debt; no admins; the counting register** —
  the standing fences, with their local weight: Indian Act band
  administration vocabulary, the border that splits Akwesasne
  (one community under two states' paperwork — an app that
  federates across that line without asking anyone's permission
  to cross it has a resonance partners will hear immediately),
  and the Oka crisis within living memory behind the
  surveillance fence: the app's
  bring-it-before-the-community register, never
  report-to-authority, needs no explaining at Kanehsatà:ke.
- **Safety strings ship at full force** — the standing
  line-by-line fidelity review.

## Term table

Structure only; concept column pre-filled from the shipped
glossaries, Kanien'kéha column open.

| Concept (what the term must do) | Kanien'kéha | Notes / decisions |
|---|---|---|
| dashboard / post / claim / confirm / vouch / guardians | *(open)* | per the sibling scaffolds' fences |
| hours / the balance — never money, never owed | *(open)* | |
| work day — communal labor | *(open)* | |
| community / the app's "we" | *(open)* | inclusive forms — the grammar gift |
| generic member reference | *(open)* | the gender-prefix decision, made once |
| flag — before the community, never report-to-authority | *(open)* | |
| operator — never a boss, never band-office register | *(open)* | |
| node / federation | *(open)* | the Kaswentha question — theirs entirely |
| panic / hard purge — full force | *(open)* | |
| invite — guest warmth; never recruitment | *(open)* | |

## What ships, and when

Nothing, until partners say so — the standing posture. Wiring is
one small PR on the no-ICU rails plus the colon-as-letter gate
adaptation (finding 2). There is no deadline; the infrastructure
waits for the language.
