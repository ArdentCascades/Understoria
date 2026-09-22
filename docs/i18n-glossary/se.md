# Northern Sámi (davvisámegiella / se) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in `chr.md` and
`docs/i18n-partnership-cherokee.md` (both track-wide policies
included): Sámi speakers translate, we supply all tooling, and
nothing ships before their review —
`docs/i18n-partnership-sami.md` for specifics. Round four's
fourth language and the Uralic family's entry — and the language
with the best minority-language technology infrastructure in the
world: the Giellatekno/Divvun tools at the Arctic University of
Norway (analyzers, spellcheckers, keyboards, built with and for
Sámi institutions) mean this track arrives, for once, as the
junior partner in language technology. Our tooling
interoperates with theirs, never duplicates it.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Northern Sámi is a first-class CLDR/ICU locale — with a
   grammatical DUAL**: native resolution, plural categories
   `["one","two","other"]` (select(2)="two" — the Inuktitut
   parallel, matching Sámi's dual pronouns moai/doai/soai), and
   native date/number formats — a September date renders
   **«čakčamánnu 15, maŋŋebárga»** free at every call site, and
   `DisplayNames` supplies the endonym **davvisámegiella**. Our
   computed gates already sanction natural dual forms (the
   Arabic single-integer precedent).
2. **Orthography settled and rendering-safe**: Latin with á č đ
   ŋ š ŧ ž — all precomposed, NFC-stable (verified). No casing
   hazard; wiring is the Hawaiian-tier easiest.
3. **The sibling-languages posture**: Lule Sámi (`smj`), South
   Sámi (`sma`), and the smaller Sámi languages are their own
   communities' languages — per-tag registry room as with
   Cree, on their initiative through the shared institutions.
4. **LTR; fallback chain se → en**, with a real alternative:
   Sámi speakers read Norwegian/Swedish/Finnish per country —
   whether a country-specific chain (se → nb/sv/fi → en) serves
   better than en-direct is a partners' call; we ship none of
   those intermediate languages today, so en-direct is the
   honest default and the question is recorded.
5. **Speech**: Divvun has worked on Sámi speech technology; the
   read-aloud surface's honest voice-availability disclosure
   applies, and interop with their work is the right long game.
6. **Registry sketch (dark, later)**:
   `{ code: "se", endonym: "davvisámegiella", dir: "ltr", speakLang: "se" }`.

## Decisions that belong to partners (open)

- **Terminology authority**: the Nordic joint terminology body
  (Sámi Giellagáldu, under the Sámi parliaments) exists for
  exactly these questions — the statutory-authority profile the
  Inuktitut and Māori tracks proved. Whether app vocabulary runs
  through it, through Divvun/Giellatekno conventions, or through
  working translators is theirs to resolve.
- **Which Sámi first** is answered by who engages (Northern is
  the largest; the scaffold's code follows the community).

## Grammar notes (high-confidence only)

- **The dual is real grammar** (finding 1): two-party strings —
  an exchange between two members, two paired devices — will be
  more precise than English; the gates permit dropping
  `{{count}}` where the inflection carries it.
- Rich case system, consonant gradation: templates restructure
  freely (placeholders survive verbatim); gradation makes
  naive string-concatenation wrong, which our
  restructure-freely contract already handles.
- No grammatical gender — they/them neutrality costs nothing.

## Register concepts — the questions we ask

- **Siida — the traditional herding community: shared work,
  shared range, mutual obligation — is the community-concept
  anchor to confirm**: whether the word belongs on an app (it is
  also a live legal term in reindeer-husbandry law) is exactly
  the speakers' judgment. **Verdde** — the standing
  guest-friendship exchange relationship between households —
  is the reciprocity anchor: help moving along known
  relationships, neither purchase nor charity.
- **Hours are never debt**: the refused registers are the
  trading-post ledger of the north and the state's subsidy
  bureaucracy; verdde's register is the counterweight.
- **The counting register**: Norwegianization, the boarding
  schools, race-biology-era registration of Sámi people, and
  the long bureaucratic management of reindeer livelihoods
  stand behind the standing fences — while Sámi parliament
  electoral rolls are living civic vocabulary today. Partners
  hold the map. The Alta conflict is the surveillance fence's
  local memory.
- **The joik and ceremonial register we do not propose** — the
  standing rule.
- **Safety strings at full force** — the standing line-by-line
  fidelity review.
- **Data sovereignty resonance**: Sámi institutions have been
  explicit about data governance in their domains; the app's
  keys-the-member-holds architecture can be described in that
  register truthfully, as with Māori.

## Term table

Structure as in every sibling scaffold; davvisámegiella column
open — siida and verdde flagged as anchors to confirm, the
app's dual-capable strings noted as an opportunity, everything
else per the standing fences.

## What ships, and when

Nothing, until partners say so. Wiring, when wanted, is
Hawaiian-tier easy: full CLDR with the dual our gates already
compute, settled orthography on the existing Latin stack. No
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
