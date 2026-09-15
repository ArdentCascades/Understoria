# Chickasaw (Chikashshanompa' / cic) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in `chr.md` and
`docs/i18n-partnership-cherokee.md` (including both track-wide
policies): Chickasaw speakers translate, we supply all tooling,
and nothing ships before their review —
`docs/i18n-partnership-chickasaw.md` for specifics. Round four's
first language: Choctaw's close Muskogean sibling, with very few
first-language speakers remaining — and one of the best-resourced
revitalization programs anywhere: the Chickasaw Nation's language
revitalization effort spans a Master-Apprentice program, Rosetta
Stone Chickasaw, children's language clubs, and its own media
operation. Where Choctaw brings breadth of daily use, Chickasaw
brings institutional depth; the two scaffolds cross-reference and
the two nations' programs should know of each other's invitations.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Chickasaw is not in CLDR/ICU** (`cic` falls back —
   verified). The proven no-ICU pattern applies; as with Choctaw,
   Muskogean verb-grade morphology and verb-borne number soften
   the fallback-safe plural cost, with stem choice a speaker's
   judgment.
2. **Latin script, two live conventions**: the Humes dictionary
   tradition and the Munro–Willmond linguistic orthography (used
   in the modern dictionary and much curriculum; apostrophe for
   the glottal stop — the standing codepoint question, we lean
   U+02BC; underdots in some materials get one glyph check).
   Which convention writes the interface is the first-order
   partner decision, exactly as in the cho scaffold.
3. **No casing hazard; LTR; fallback cic → en. Speech**: no
   voice; honest disclosure applies.
4. **Registry sketch (dark, later)**:
   `{ code: "cic", endonym: "Chikashshanompa'" (spelling per convention), dir: "ltr", speakLang: "cic" }`.

## Decisions that belong to partners (open)

- **Which orthographic convention** (finding 2), and the
  glottal/underdot codepoints.
- **Terminology authority**: the revitalization program's
  curriculum and dictionary conventions vs working translators'
  judgment — theirs to resolve.

## Register concepts — the questions we ask

The standing fences apply with the same Southeast history as the
Choctaw scaffold (removal, Dawes, living CDIB vocabulary), and
the same north star is shared family history — the Choctaw 1847
gift is a trail the two nations walked together. The
Master-Apprentice structure suggests a working shape partners
may like: apprentice translators drafting under master speakers'
review is exactly this track's model, already running inside
their program. Ceremonial vocabulary under the standing
do-not-propose rule; safety strings at full force with
line-by-line fidelity review.

## Term table

Structure as in every sibling scaffold (`cho.md`); Chikashshanompa'
column open, conventions per the partners' decision.

## What ships, and when

Nothing, until partners say so. Wiring is one small PR on the
no-ICU rails plus the convention's glyph check. No deadline; the
infrastructure waits for the language.
