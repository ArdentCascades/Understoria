# Navajo (Diné bizaad / nv) — partnership scaffold, not yet a glossary

**This file is deliberately unfinished**, on the same model as its
Cherokee sibling (`chr.md`, and `docs/i18n-partnership-navajo.md`
for the partnership model): the decisions in the open sections
belong to Diné speakers, and nothing ships until they have made
them. What this file contains today is (a) Stage-0 technical
findings verified against the actual runtime, and (b) the concept
documentation behind every hard decision the seventeen shipped
languages taught us, posed as questions — so a Navajo collaborator
starts from our hardest-won lessons, not a blank page.

Navajo is the second language of the partnership track — one
language from each Indigenous language family of North America —
and the Na-Dené/Athabaskan family's entry. It has the largest
speaker community of any Indigenous language north of Mexico
(~170,000), living localization precedents (the Navajo dubs of
Star Wars and Finding Nemo, an active nv.wikipedia.org), and some
of the deepest scholarly documentation of any language on the
continent (Young & Morgan). None of that makes machine translation
honest here — the generative resources are still thin, the verb
system is famously intricate, and language authority rests with
speakers — which is exactly why the pipeline inverts.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Navajo is NOT in CLDR/ICU** — the mirror image of Cherokee's
   situation. `Intl.PluralRules("nv")` (and `"nav"`) silently
   resolves to the runtime's default locale (`en-US` in our probe),
   and `Intl.NumberFormat.supportedLocalesOf(["nv","nav"])` returns
   empty. Consequences, all with shipped precedent:
   - **Plural selection is nondeterministic across member devices**
     (each browser applies its own default-locale rules) — the
     Haitian Creole precedent applies: `nv.json` ships `_one`/`_other`
     pairs valid under ANY fallback, every count-driven form
     interpolating `{{count}}`. Navajo grammar makes this cheaper
     than it sounds: number typically lives in the verb stem, not a
     noun ending (see grammar notes), so the two forms can often be
     legitimately identical — but that is a translator's judgment,
     never a mechanical rule.
   - **No free localized dates**: `toLocaleDateString` under `nv`
     renders English month names (contrast chr's syllabary months).
     Same as ht; disclosed honestly, and partners may prefer it to
     an invented convention.
   - No `intlNumbering` pin needed (fallback already renders
     Western digits).
2. **Orthography: Latin, Young & Morgan conventions — one real
   rendering check needed.** The tone-and-nasal vowels **ą́ ę́ į́ ǫ́
   have no precomposed Unicode forms**: even after NFC they remain
   ogonek-vowel + combining acute (U+0301) — verified (`"ą́".normalize("NFC")`
   stays two codepoints). Rendering therefore depends on the font's
   combining-mark positioning. The app's font (Inter) has generally
   good mark support, but the wiring PR must include a visual check
   of the probe string «ą́ ę́ į́ ǫ́ ń ł '» across the app's weights
   before anything ships — and if positioning is off, a
   `:lang(nv)` font stack is the fix (Noto Sans handles these
   sequences well). ł (U+0142) is precomposed and safe. NFC-parity
   gates pass as-is (NFC of these strings is stable).
3. **The glottal stop character is a decision to record with
   partners.** Young & Morgan write it as an apostrophe. Unicode
   offers ASCII `'` (collides with quote-hygiene scanners and
   smart-quote autocorrect) or **U+02BC MODIFIER LETTER APOSTROPHE**
   (a letter, immune to quote processing — what Unicode recommends
   for glottal stops in orthographies). We lean U+02BC for
   robustness and will follow partners' house style; whichever is
   chosen, the fleet-style gates enforce ONE codepoint corpus-wide.
4. **No casing hazard** (contrast Cherokee's syllabary
   remap): Latin case-mapping preserves the diacritics (á → Á).
   The app still uses no `text-transform` anywhere, and the chr
   rule — don't introduce one — stands for everyone.
5. **LTR; fallback chain nv → en** (Diné speakers today are
   bilingual in English; no intermediate language).
6. **Speech**: `speakLang: "nv"` will find no matching
   speech-synthesis voice on today's platforms — the read-aloud
   surface already handles voice-availability honestly
   (ReadAloudSection discloses when no voice exists rather than
   reading in the wrong language), so this costs nothing but should
   be told to partners plainly.
7. **Registry sketch for the (dark, later) wiring PR**:
   `{ code: "nv", endonym: "Diné bizaad", dir: "ltr", speakLang: "nv" }`
   — code `nv` (ISO 639-1; `nav` aliases to it), endonym per
   community usage since CLDR cannot supply one.

## Decisions that belong to partners (open)

- **Terminology authority and the coinage tradition.** Navajo has a
  living tradition of extending the lexicon for new technology —
  the Code Talkers built military vocabulary from the language's
  own resources, and modern coinages for computing exist. Whether
  this app reuses established tech coinages, follows a particular
  institution's conventions, or coins fresh — and who signs off —
  is the partners' call. We bring the concept list; they bring the
  words.
- **Orthographic house style**: the glottal-stop codepoint (finding
  3), any preferences on marking conventions, and which reference
  (Young & Morgan is the scholarly standard) anchors spelling
  disputes.
- **Which institution(s) anchor the work** — see the partnership
  document's contact list. The Navajo Nation has more formalized
  review processes for projects involving the Nation than most;
  we expect and respect official channels, and the timeline is
  theirs.

## Grammar notes for the string work (high-confidence only)

- **The verb carries the sentence.** Navajo is the classic
  Athabaskan verb-template language: subject, object, aspect, and
  much else live in ordered prefixes on the verb. Template strings
  with `{{placeholders}}` will often need full restructuring — our
  contract allows it (placeholders survive verbatim; the sentence
  around them is free).
- **Number lives in verb stems, not noun endings**: many verbs
  have distinct singular/dual/plural stems, plus the distributive
  `da-`. This is why the no-CLDR plural situation (finding 1) is
  less painful than it looks — but stem choice is exactly the kind
  of judgment only a speaker can make.
- **Classificatory handling verbs**: verbs of giving, carrying,
  and handling differ by the nature of the object (solid roundish,
  slender flexible, open container, animate being…). What class an
  *hour of help* or a *task* takes — or whether to rephrase around
  the classification — is a beautiful question that belongs
  entirely to partners (the Cherokee scaffold records the same
  question; the two languages arrived at it independently).
- **The yi-/bi- animacy alternation** orders who-acts-on-whom by an
  animacy hierarchy — relevant to strings about people acting on
  things and things affecting people (notifications, automatic
  actions). The app's voice rules (below) interact with this;
  speakers will hear instantly what a machine actor may
  grammatically do.
- **A fourth person exists** (respectful/indefinite reference) —
  potentially useful for the app's neutral, no-gender voice; usage
  is partners' judgment.
- No grammatical gender — the app's they/them neutrality costs
  nothing.

## Register concepts — the questions we ask, with why we ask them

The pattern in every shipped language: the mutual-aid register
already exists in the community's own tradition; the work is
refusing the imported institutional registers around it.

- **K'é.** The Diné concept of kinship, right relations, and the
  obligations of solidarity is the closest thing this app's whole
  purpose has to a one-word name. As with Cherokee's ᎦᏚᎩ/gadugi,
  we flag it as the one suggestion we bring to the table — **to
  confirm, never to assume**: whether k'é belongs anywhere near an
  app's interface, and where, is precisely the judgment that
  belongs to Diné speakers.
- **Hózhǫ́ we do not propose.** Its weight is philosophical and
  ceremonial; an app has no claim on it. It is named here only so
  no future contributor "helpfully" reaches for it — if partners
  ever want it, that is their offer to make, not ours.
- **Hours are never debt** (the core fence, every language). The
  Navajo-specific resemblance-risk partners will recognize better
  than we can: the trading-post economy — credit at the post, pawn,
  the seasonal ledger that kept families owing. The timebank's
  balance must never sound like a pawn ticket or a post ledger.
  What is the plain register of neighbors keeping track of shared
  work, and which words would accidentally reopen the ledger?
- **No admins, no bosses.** The app has operators with narrow,
  visible powers. Navajo political vocabulary is rich and layered —
  naat'áanii (leadership by consent), the chapter-house system,
  Window Rock officialdom, and beneath it all the BIA history.
  Which register fits "the person who keeps the server running,
  with limits everyone can read" is a partners' call; our only
  constraint is the one every language holds: no word that makes a
  member into a subordinate.
- **The surveillance and counting register.** Flagging a post must
  read as *bringing something before the community*, never
  *reporting someone to an authority*. Diné history gives counting
  and enrollment vocabulary specific weight — livestock reduction
  (agents counting and seizing sheep), grazing permits, boarding
  schools, the Long Walk — and a live civic counter-consideration:
  census numbers and enrollment are present-day Navajo Nation
  citizenship vocabulary, so sign-up language should neither
  collide with it nor evoke the counting that came before. Exactly
  the calls partners are qualified to make and we are not.
- **The Code Talkers cut the other way, and it's worth saying.**
  The language's history with technology is not only extraction:
  it includes the most famous demonstration in American history
  that Diné bizaad can say anything, including things machines
  need said. If partners want the app's tech vocabulary to stand
  in that coinage tradition, nothing would honor the track more.
- **Safety strings ship at full force**: compelled-biometrics,
  panic, guardians/recovery — reviewed line-by-line with an
  en→target fidelity table (the process the fa corpus round
  proved), nothing softened, no false reassurance.
- **Sovereignty resonance, offered not imposed**: every community
  runs its own node; nodes federate as equals; no central server.
  If that framing helps name node/federation concepts, it is
  there.

## Term table

Structure only; concept column pre-filled from seventeen shipped
glossaries, Diné bizaad column open. K'é appears once, flagged, as
described above.

| Concept (what the term must do) | Diné bizaad | Notes / decisions |
|---|---|---|
| dashboard — the community's living overview; never "control panel" | *(open)* | |
| hours / the balance — never money, never a ledger you owe | *(open)* | trading-post register refused |
| post (need / offer) — neighbor speech, not classifieds | *(open)* | |
| claim / "In my care" — taking a task on, warmth not workflow | *(open)* | classificatory stem question |
| confirm (exchange) — reserved for exchange confirmation in every language | *(open)* | |
| vouch — standing behind someone; never co-signing | *(open)* | |
| guardians (key shards) — trusted holders; never legal guardianship | *(open)* | |
| work day — communal labor | *(open)* | k'é adjacency? partners' call |
| community / solidarity | *(open)* | K'é — the flagged suggestion, to confirm |
| flag — bring before the community; never report-to-authority | *(open)* | |
| dispute — disagreement between neighbors; never a case | *(open)* | |
| operator — keeps the server running; never a boss | *(open)* | naat'áanii discussion |
| panic / hard purge — full force, plain words | *(open)* | |
| recovery kit / passphrase / passkey — loan-word tier decisions | *(open)* | coinage-tradition question |
| invite — guest warmth; never recruitment | *(open)* | enrollment-collision caution |

## What ships, and when

Nothing, until partners say so — identical posture to chr.md. The
wiring is one small PR on proven rails (registry entry, loader,
`locale-nv` chunk, parity/plural rows on the ht no-CLDR pattern,
the finding-2 font check and, if needed, a `:lang(nv)` stack).
There is no deadline; the infrastructure waits for the language.


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
