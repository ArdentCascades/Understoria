# Inuktitut (ᐃᓄᒃᑎᑐᑦ / iu) — partnership scaffold, not yet a glossary

**This file is deliberately unfinished**, on the model of its four
siblings (`chr.md`, `nv.md`, `lkt.md`, `cr.md`;
`docs/i18n-partnership-inuktitut.md` for the partnership model):
the decisions in the open sections belong to Inuit speakers, and
nothing ships until they have made them. Today it contains (a)
Stage-0 technical findings verified against the actual runtime,
and (b) the concept documentation behind every hard decision
seventeen shipped languages taught us, posed as questions.

Inuktitut closes the first round of the partnership track — one
language per Indigenous language family of North America — as the
Inuit-Yupik-Unangan family's entry, and it arrives with something
no other language on the track has: **official-language status**
(in Nunavut, alongside Inuinnaqtun, under laws that require public
services in Inuktut; also official in the NWT) and therefore a
**statutory language authority** — Nunavut's Inuit Uqausinginnik
Taiguusiliuqtiit — whose entire mandate is the terminology
decisions this scaffold poses as questions. On this track we
usually ask who could decide; for Inuktitut, an institution
already exists whose job it is.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Inuktitut has native CLDR plural rules — with a grammatical
   DUAL.** `Intl.PluralRules("iu")` resolves natively with
   categories `["one","two","other"]` (select: 1→one, 2→two,
   0/3+→other) — the first dual on this track, and our gates
   already know what to do with it: `one` and `two` are
   single-integer categories, so the **Arabic precedent applies**
   — a `_two` (or `_one`) form may omit `{{count}}` because the
   dual inflection IS the number and cannot lie. The computed
   plural/parity gates derive and sanction this automatically;
   translators simply write natural dual forms.
2. **But it is a plurals-only locale** — the inverse of Lakota's
   partial profile: `Intl.DateTimeFormat("iu")` and
   `NumberFormat` fall back to the default locale (dates render
   English month names; digits Western — harmless), and
   `DisplayNames` has no native endonym, so the registry endonym
   comes from the community: **ᐃᓄᒃᑎᑐᑦ** (syllabics) or its Roman
   form — which is itself the script decision below.
3. **Inuinnaqtun (`ikt`) is not in CLDR at all** (falls back) —
   relevant because Nunavut's official Inuit language is legally
   "Inuktut", covering both. If partners want Inuinnaqtun as its
   own registry entry, it rides the proven no-ICU pattern
   (ht/nv); the dual-capable `iu` rules do NOT apply to it
   automatically.
4. **The script decision is a first for this track: BCP-47
   script subtags are live options.** Inuktitut is written in
   syllabics (ᖃᓂᐅᔮᖅᐸᐃᑦ — Nunavut and Nunavik predominantly) and
   in Roman orthographies (western dialects and Nunatsiavut) —
   and since 2019 there is also **Inuktut Qaliujaaqpait**, the
   unified Roman orthography adopted by Inuit Tapiriit Kanatami
   to write all dialects, whose adoption is a live, ongoing
   transition led by Inuit organizations. Microsoft shipped
   Inuktitut in BOTH scripts (`iu-Cans`, `iu-Latn`), and ICU
   resolves both subtags to the `iu` plural rules (verified). The
   registry can ship `iu` with the partners' chosen primary
   script, and a second script entry later if wanted — which
   script an interface speaks, and whether the unified
   orthography or a regional one, is the partners' decision, made
   with their institutions.
5. **Rendering, both scripts verified safe**: syllabics are
   atomic codepoints (the Inuktitut series lives in the UCAS
   block with extensions — ᖅ U+1585 and kin), NFC-stable,
   unicameral — no Cherokee-style casing hazard; font plan is
   the Cree scaffold's UCAS stack (Euphemia / Gadugi / Noto Sans
   Canadian Aboriginal — Inuktitut series included), needed
   because the app's font (Inter) has no UCAS coverage. Roman
   orthographies are plain Latin (the unified orthography adds a
   small set of extended letters — such as ł — that need one
   glyph-coverage check at wiring, recorded here). The
   no-`text-transform` rule stands regardless.
6. **LTR; fallback chain iu → en**, with the same regional
   question East Cree raised: Nunavik (Quebec) members may be
   likelier to read French — the ht-style `→ fr → en` chain
   exists if partners want it for their region.
7. **Speech**: no `iu` speech-synthesis voice on today's
   platforms; the read-aloud surface already discloses that
   honestly.
8. **Registry sketch (dark, later)**:
   `{ code: "iu", endonym: "ᐃᓄᒃᑎᑐᑦ", dir: "ltr", speakLang: "iu" }`
   (endonym per the script decision), with `ike` detection
   aliasing to `iu` and room for `ikt` as its own entry.
9. **Localization precedent is deep here.** Windows and Office
   shipped in Inuktitut through Government of Nunavut
   collaboration in the 2000s; Microsoft Translator added
   Inuktitut (both scripts, later Inuinnaqtun) trained with the
   Government of Nunavut. An honest note on that last fact:
   machine translation *exists* for Inuktitut, unusually for this
   track — and it changes nothing about our model. The register
   decisions this app lives on (below) are craft, not coverage,
   and the review-before-ship posture stands exactly as it does
   for the four sibling tracks.

## Decisions that belong to partners (open)

- **Which script — and whose orthography** (finding 4): syllabics
  or Roman as the interface's primary; unified Inuktut
  Qaliujaaqpait or a regional convention if Roman. This is a
  decision Inuit organizations are actively leading nationally;
  the app follows their lead, whatever and whenever it is.
- **Which variety, and how many**: Inuktitut first, with
  Inuinnaqtun as a possible sibling entry; dialect conventions
  within Inuktitut (Nunavut / Nunavik / Nunatsiavut) are the
  partners' to weigh — the continuum lesson from the Cree
  scaffold applies gently here too.
- **Terminology authority**: uniquely on this track, a statutory
  body exists (Inuit Uqausinginnik Taiguusiliuqtiit) alongside
  the organizations below; whether app terminology goes through
  it, reuses the Microsoft-era localization glossaries, or is
  coined by the working translators is a governance question the
  partners resolve, not us.

## Grammar notes for the string work (high-confidence only)

- **Extreme polysynthesis**: Inuktitut builds sentence-long words
  by recursive suffixing; templates with `{{placeholders}}` will
  need the freest restructuring of any language on this track —
  our contract allows it (placeholders survive verbatim; the
  sentence around them is free), and where a placeholder cannot
  sit inside a word, the sentence is rebuilt around it.
- **The dual is real grammar** (finding 1): nouns and verbs
  inflect singular/dual/plural. Two people confirming an
  exchange, two devices paired — the dual will make some strings
  MORE precise than English, and the gates sanction dropping
  `{{count}}` where the inflection carries it.
- **Ergativity**: Inuktitut aligns arguments ergatively; the
  who-does-what shape of transitive strings (member confirms
  exchange, app notifies member) differs structurally from
  English — a translator's ordinary business, noted so nobody
  "simplifies" a restructured sentence back toward English shape
  in review.
- **No grammatical gender** — the app's they/them neutrality
  costs nothing.

## Register concepts — the questions we ask, with why we ask them

- **Ikajuqtigiinniq and Piliriqatigiinniq** — working together
  for a common cause / common purpose — are articulated,
  civic-use principles of Inuit Qaujimajatuqangit, the Inuit
  knowledge-and-values framework that Nunavut's own public
  institutions cite by name. They are this scaffold's flagged
  anchors — the wîcihitowin/gadugi/k'é parallel — and their
  status differs from the ceremonial-weight cases: these are
  ALREADY public-life vocabulary. Still **to confirm, never to
  assume** — whether IQ principles belong on an app's buttons,
  and which, is an Inuit judgment, and the statutory language
  authority exists to make exactly such calls.
- **Aajiiqatigiinniq** — consensus decision-making — maps
  startlingly well onto the app's governance surfaces (proposals,
  the no-voting-scores register, «deciding together»). Named as a
  discussion anchor for that family of strings.
- **Tunnganarniq** — openness and welcome — likewise for the
  welcome/onboarding surfaces. Both: partners' call.
- **The community freezer is a living institution** across the
  North — country-food sharing as organized, ordinary mutual aid.
  The app's community-fridge template and food-sharing playbooks
  have a direct local analog; the register work can ground in
  what people already call it.
- **Hours are never debt** (the core fence). Local resemblance
  risks: the HBC fur-trade credit ledger here as elsewhere in the
  North — and the counterweight is uncommonly strong: the
  Arctic's Inuit-owned **co-op movement** is one of the largest
  Indigenous-owned business networks anywhere, and its register
  (shared ownership, patronage, community benefit) is friendly
  ground for a timebank's economics.
- **The counting register carries the E-number discs.** Within
  living memory the state issued Inuit numbered identification
  discs — names replaced by numbers on a cord — until the 1970s.
  This app's identity model is the E-disc's opposite: keys the
  member holds, a display name the member chooses ("a real name
  is not required"), no rosters, no scores. The scaffold flags
  every enrollment/registration/ID string for that resonance —
  the app must never sound like it is issuing anyone a number —
  and partners will hear instantly which words do.
- **Relocations, the qimmiit killings, residential schools, TB
  evacuations** stand behind the authority and removal registers
  as elsewhere on this track — named once, plainly, as the reason
  the no-admins and bring-before-the-community fences exist, with
  the words that keep them honest being the partners' to choose.
- **Safety strings ship at full force**: compelled-biometrics,
  panic, guardians/recovery — line-by-line en→target fidelity
  review, nothing softened.
- **Sovereignty resonance, offered not imposed**: each community
  its own node, federating as equals — in a territory Inuit
  negotiated into existence, the framing may need no
  introduction.

## Term table

Structure only; concept column pre-filled from seventeen shipped
glossaries, ᐃᓄᒃᑎᑐᑦ column open (script per the partners'
decision). The IQ-principle anchors appear once, flagged, as
described above.

| Concept (what the term must do) | ᐃᓄᒃᑎᑐᑦ | Notes / decisions |
|---|---|---|
| dashboard — the community's living overview; never "control panel" | *(open)* | |
| hours / the balance — never money, never a ledger you owe | *(open)* | HBC ledger refused; co-op register friendly |
| post (need / offer) — neighbor speech, not classifieds | *(open)* | |
| claim / "In my care" — taking a task on, warmth not workflow | *(open)* | |
| confirm (exchange) — reserved for exchange confirmation in every language | *(open)* | dual forms may shine here |
| vouch — standing behind someone; never co-signing | *(open)* | |
| guardians (key shards) — trusted holders; never legal guardianship | *(open)* | |
| work day / working together | *(open)* | Ikajuqtigiinniq / Piliriqatigiinniq — flagged anchors, to confirm |
| consensus / deciding together | *(open)* | Aajiiqatigiinniq — discussion anchor |
| welcome / onboarding warmth | *(open)* | Tunnganarniq — discussion anchor |
| flag — bring before the community; never report-to-authority | *(open)* | |
| dispute — disagreement between neighbors; never a case | *(open)* | |
| operator — keeps the server running; never a boss | *(open)* | |
| panic / hard purge — full force, plain words | *(open)* | |
| recovery kit / passphrase / passkey — loan-word tier decisions | *(open)* | Microsoft-era glossary reuse question |
| invite / identity — a name you choose, never a number you're issued | *(open)* | the E-disc resonance, held throughout |

## What ships, and when

Nothing, until partners say so — identical posture to the four
sibling scaffolds. The wiring is one small PR on proven rails:
native dual-aware plural rows (the ar single-integer sanction,
already computed by our gates), the UCAS or extended-Latin font
check per the script decision, `ike → iu` detection aliasing, an
optional fr-first fallback for Nunavik, and room for `ikt` as its
own entry on the no-ICU pattern. There is no deadline; the
infrastructure waits for the language.


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
