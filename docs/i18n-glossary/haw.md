# Hawaiian (ʻŌlelo Hawaiʻi / haw) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in `chr.md` and
`docs/i18n-partnership-cherokee.md` (including its track-wide
policy section): Hawaiian speakers translate, we supply all
tooling, and nothing ships before their review —
`docs/i18n-partnership-hawaiian.md` for specifics. Round three's
third language, the Māori track's Polynesian sibling — and its
sibling in history too: ʻAha Pūnana Leo's language nests, modeled
on kōhanga reo, took a language with a few hundred child speakers
in the early 1980s and built a K-through-doctorate
Hawaiian-medium education pipeline. If the track has a proof that
revitalization works, this is it.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Hawaiian is a first-class CLDR/ICU locale** — the Cherokee
   tier: native resolution with `one`/`other` plural rules
   (`one` = exactly 1), native date and number formats — a
   September date renders **«Poʻalua, 15 Kepakemapa»** free at
   every call site — and `DisplayNames` supplies the endonym
   **ʻŌlelo Hawaiʻi**. The wiring, when partners want it, is the
   easiest on the track alongside Māori's.
2. **Orthography is settled and rendering-trivial**: thirteen
   letters, the **ʻokina** (correctly **U+02BB MODIFIER LETTER
   TURNED COMMA** — CLDR's own data uses it; not an apostrophe,
   not U+02BC, and the gates enforce the single codepoint
   corpus-wide so curly-quote autocorrect can never corrupt it)
   and **kahakō** macrons (ā ē ī ō ū — precomposed, NFC-stable,
   verified). No casing hazard; the standing no-`text-transform`
   rule applies.
3. **Plural grammar matches the CLDR rules cheaply**: number
   rides determiners (nā / ka, ke) as in Māori, so the
   `one`/`other` forms are natural and the `_one` form may
   hard-code singular grammar (CLDR `one` = exactly 1 here —
   verified select(0)=other).
4. **LTR; fallback chain haw → en. Speech**: platform te reo-
   style voices are uneven; the read-aloud surface's honest
   voice-availability disclosure applies.
5. **Registry sketch (dark, later)**:
   `{ code: "haw", endonym: "ʻŌlelo Hawaiʻi", dir: "ltr", speakLang: "haw" }`.

## Decisions that belong to partners (open)

- **Terminology authority**: Hawaiian has an active,
  institutional lexicon committee tradition (new-word coinage
  for modern life is an ongoing, organized practice in the
  Hawaiian-medium education world). Whether app vocabulary goes
  through those channels, reuses established school coinages, or
  is decided by the working translators is theirs to resolve.
- **Register level**: Hawaiian-medium education has developed
  registers for exactly this kind of institutional-but-warm
  text; the app follows the translators' judgment.

## Grammar notes for the string work (high-confidence only)

- **Analytic, VSO, particle-rich** like Māori: templates
  restructure freely (placeholders survive verbatim); determiners
  carry number.
- **The pronoun system is a register instrument**: dual and
  plural, **inclusive vs exclusive "we"** (kāua/kākou vs
  māua/mākou) — the corporate-we ban states itself again:
  member-inclusive warmth is kākou (and "kākou" is beloved
  civic shorthand for we-together-inclusively), an app-voice
  "we" would be nakedly exclusive.
- **A/o possession classes** (as in Māori): which class "my
  hours", "my community", "my key" take is a real one-time
  decision speakers make.
- No grammatical gender — they/them neutrality costs nothing.

## Register concepts — the questions we ask, with why we ask them

- **Kuleana is the claim system's word-shaped hole.** The
  Hawaiian concept of responsibility-and-right — the thing that
  is yours to carry — is the closest existing concept on any
  track to the app's "claim / In my care" family. Flagged **to
  confirm, never to assume** (kuleana also has land-law history
  and real weight); if speakers want it, the feature was
  practically named for it.
- **Kōkua (help), laulima (many hands working together),
  mālama (care/steward), lokahi (unity)** — civic-use vocabulary
  alive in everyday and institutional Hawaiʻi, flagged as
  discussion anchors for the help, work-day, care, and
  governance surfaces. **ʻOhana** for community is the famous
  candidate with the famous caveat: heavily commercialized by
  outsiders; whether the app may use it sincerely is exactly a
  speakers' call.
- **Ceremonial and kapu-adjacent register we do not propose** —
  the standing rule.
- **Hours are never debt** — the standing fence, with the local
  history: plantation scrip and store credit, the contract-labor
  ledger. Laulima's register is the counterweight.
- **The counting register**: the overthrow, annexation, and the
  1896 schooling ban that nearly ended the language within three
  generations stand behind the standing fences — while Hawaiian
  language and identity are living civic vocabulary today
  (Hawaiian is a co-official state language). Partners hold the
  map.
- **Safety strings ship at full force** — the standing
  line-by-line fidelity review.

## Term table

Structure only; concept column pre-filled, ʻŌlelo Hawaiʻi column
open.

| Concept (what the term must do) | ʻŌlelo Hawaiʻi | Notes / decisions |
|---|---|---|
| claim / "In my care" — yours to carry | kuleana? | THE anchor — to confirm, never assume |
| help — between equals | *(open)* | kōkua — discussion anchor |
| work day — many hands | *(open)* | laulima — discussion anchor |
| care / stewardship surfaces | *(open)* | mālama — discussion anchor |
| community | *(open)* | the ʻohana question — speakers' call |
| the app's "we" | kākou, never mākou? | the inclusive/exclusive gift — to confirm |
| hours / the balance — never money, never owed | *(open)* | plantation-ledger register refused |
| dashboard / post / confirm / vouch / guardians | *(open)* | per the sibling scaffolds' fences |
| flag — before the community, never report-to-authority | *(open)* | |
| operator — never a boss | *(open)* | |
| panic / hard purge — full force | *(open)* | |
| invite — guest warmth; never recruitment | *(open)* | |

## What ships, and when

Nothing, until partners say so — the standing posture. Wiring,
when wanted, is the track's easiest: full CLDR support, settled
orthography on the existing Latin stack, one ʻokina-codepoint
gate. There is no deadline; the infrastructure waits for the
language.


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
