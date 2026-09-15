# Western Armenian (Արեւմտահայերէն / hyw) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in `chr.md` and
`docs/i18n-partnership-cherokee.md` (all three track-wide
policies included): Western Armenian speakers translate, we
supply all tooling, and nothing ships before their review —
`docs/i18n-partnership-western-armenian.md` for specifics.
Round five's fourth language, and a first for the track: a
**diaspora-endangered** language — UNESCO lists Western Armenian
as definitely endangered not because Armenian is dying (Eastern
Armenian thrives in Armenia) but because the *western* branch's
homeland was destroyed in the genocide of 1915, and the language
has lived a century in diaspora — Beirut, Aleppo, Istanbul,
Paris, Los Angeles, Buenos Aires — where every generation must
choose it. An organized revitalization movement (school
networks worldwide, dedicated foundation programs) is making
that choice easier; an interface is a small surface where a
language lives daily.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Western Armenian is not in CLDR/ICU as itself** (`hyw`
   falls back — verified), while Eastern Armenian (`hy`) is
   fully supported. The two differ in pronunciation, verb
   morphology, **and orthography** (Western uses classical
   Mesropian orthography; Eastern, the reformed one), so hy's
   data is *not* a drop-in. hyw rides the proven no-ICU
   pattern: fallback-safe plural pairs (Armenian plural
   marking is straightforward; low cost), no free localized
   dates, honestly disclosed — with `hy` noted as a possible
   future sibling entry on its own merits.
2. **Script: the Armenian alphabet** (Mashtots, 405 CE — the
   oldest script on this track by a millennium and a half).
   Bicameral with clean Unicode case mapping — no remap
   hazard; fully precomposed, NFC-stable; broad font coverage
   (Noto Sans Armenian everywhere; a `:lang(hyw)` stack check
   at wiring for Inter's coverage). LTR. One orthographic gate:
   **classical orthography throughout** — the gates enforce the
   Western conventions (including the classical ligature and
   punctuation habits: Armenian's own question mark ՞,
   emphasis ՛, and full stop ։ — the punctuation-adaptation
   note from the Mohawk scaffold applies in spirit: Armenian
   punctuation is in-script, not ASCII).
3. **Fallback chain: hyw → en by default, with the honest
   note** that the diaspora reads French, Arabic, Spanish, or
   Turkish by region — no single second language serves all;
   partners may choose per-community, and en-direct is the
   default until they do.
4. **Speech**: platform Armenian voices are Eastern where they
   exist at all; the read-aloud surface's honest disclosure
   applies (a Western text read in Eastern pronunciation is
   exactly the dishonesty it exists to prevent).
5. **Registry sketch (dark, later)**:
   `{ code: "hyw", endonym: "Արեւմտահայերէն", dir: "ltr", speakLang: "hyw" }`.

## Decisions that belong to partners (open)

- **Orthographic authority**: classical orthography has its
  standard-bearers (the diaspora's school networks, the
  Mekhitarist tradition, the foundation-funded programs);
  whose conventions anchor spelling and coinage is theirs.
- **Register**: Western Armenian's living registers run from
  the school's formal to the kitchen's warm; where the app sits
  is the translators' craft, with every sibling scaffold's
  warmth principle as an argument they may weigh.

## Grammar notes (high-confidence only)

- Agglutinative-leaning nominal morphology, distinctive Western
  verb system (present with կը etc.): templates restructure
  freely (placeholders survive verbatim).
- No grammatical gender — they/them neutrality costs nothing
  (Armenian is famously genderless in the third person).

## Register concepts — the questions we ask

- **The agoump — the diaspora community club — is the lived
  institution nearest this app**: the hall where the community
  organizes itself, across every continent the diaspora landed
  on. Whether its warmth belongs in the app's community
  vocabulary is the speakers' call; it is the register we mean.
- **The benevolent-union tension is named honestly**: the
  diaspora's great institutions carry "benevolent" in their
  very names, and a century of compatriotic unions,
  church-adjacent aid, and school fundraising is both the
  community's pride and — in this app's terms — the charity
  register the glossaries fence. Level, neighbor-to-neighbor
  help versus benefaction-from-above is a line Western Armenian
  can draw with precision; where exactly, partners know.
- **Hours are never debt** — the standing fence; the refused
  registers include the remittance ledger and the
  community-dues book.
- **The counting register carries 1915.** Deportation lists and
  Ottoman registries stand behind the standing fences — no
  rosters, identity the member holds, no reports to authority —
  with a weight that needs no explanation anywhere in the
  diaspora; and enrollment walks its usual line beside living
  civic life (parish rolls, school registrations, community
  censuses the diaspora keeps *for itself*, which is precisely
  the difference).
- **Liturgical register under the standing do-not-propose
  rule** (Classical Armenian/grabar is the church's; the app
  has no claim on it). Safety strings at full force with
  line-by-line fidelity review.

## Term table

Structure as in every sibling scaffold; Արեւմտահայերէն column
open — the agoump register flagged as the warmth anchor to
confirm, the benevolent/level line as the first fence to draw,
everything else per the standing fences.

## What ships, and when

Nothing, until partners say so. Wiring rides the no-ICU rails
with the Armenian punctuation gate and a font-stack check. No
deadline; the infrastructure waits for the language.
