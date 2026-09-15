# Māori (te reo Māori / mi) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in `chr.md` and
`docs/i18n-partnership-cherokee.md`: Māori speakers translate, we
supply all tooling, and nothing ships before their review —
`docs/i18n-partnership-maori.md` for this track's specifics.
Round two's third language, and a special case on the track: te
reo Māori is here as much for what its community can teach this
model as for the translation. Māori organizations invented the
language-nest model the world's revitalization movements adopted,
and Te Hiku Media pioneered community-controlled language AI and
data-sovereignty licensing — the clearest articulation anywhere
of the principle this whole track is built on.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Māori is a partial CLDR/ICU locale, formats-strong**:
   `NumberFormat("mi")` and `DateTimeFormat("mi")` resolve
   natively with te reo month and weekday names — a September
   date renders «Tūrei, 15 Hepetema» free at every date call
   site — and `DisplayNames` supplies the endonym **Māori**.
   `PluralRules("mi")` falls back to the default locale, so
   plural handling follows the fallback-safe pattern (ht/nv),
   softened decisively by the grammar: **te reo does not mark
   number on the noun** — determiners carry it (te/ngā) — so
   fallback-safe pairs are close to free; a speaker's judgment,
   as everywhere.
2. **Orthography is settled and rendering-trivial**: standardized
   Latin with macron long vowels (ā ē ī ō ū — precomposed,
   NFC-stable, verified) and the wh/ng digraphs. No orthography
   dispute, no glyph risk, no casing hazard; the standing
   no-`text-transform` rule applies regardless. The one
   convention note: macrons are the Māori Language Commission's
   standard (older texts used double vowels); the interface
   follows the Commission.
3. **LTR; fallback chain mi → en.** **Speech**: platform voices
   for te reo exist in some ecosystems and not others; the
   read-aloud surface's honest voice-availability disclosure
   (built for exactly this) applies.
4. **Registry sketch (dark, later)**:
   `{ code: "mi", endonym: "Māori", dir: "ltr", speakLang: "mi" }`
   — with the display question for partners of whether the
   Settings list shows "Māori" or "te reo Māori".
5. **Institutional ground is the strongest on the track**: te
   reo is an official language of Aotearoa New Zealand with a
   statutory language commission (Te Taura Whiri i te Reo Māori)
   and a revitalization strategy entity (Te Mātāwai); kōhanga
   reo and kura kaupapa Māori form a full-immersion education
   pipeline; and translation/localization of civic software into
   te reo has real precedent. **Machine translation exists** in
   the major systems — the standing honest note applies: it
   changes nothing; register is craft, and authority rests with
   speakers. More than that, here the community has already
   ruled on the question: Te Hiku's Kaitiakitanga License
   asserts community guardianship over language data — this
   track's review-before-ship posture is, in effect, their
   principle applied to our pipeline.

## Decisions that belong to partners (open)

- **Terminology authority**: Te Taura Whiri maintains official
  terminology; whether app vocabulary goes through Commission
  conventions, existing localization glossaries, or the working
  translators' judgment is a governance question the partners
  resolve.
- **Register level**: te reo has well-developed formal and
  informal registers and active debate about neologism style
  (transliterations vs descriptive coinages — *rorohiko*,
  "brain-lightning", for computer, is the famous descriptive
  example). Which style the app's tech vocabulary uses is the
  partners' call; the descriptive tradition seems made for an
  app that names things by what they do, but that is an
  observation, not a decision.
- **Dialect coloring**: iwi dialect differences are real
  (kōrero conventions, some lexicon); whether the translation
  stays Commission-neutral or carries a region's voice is
  theirs.

## Grammar notes for the string work (high-confidence only)

- **VSO, particle-rich, analytic**: te reo builds meaning with
  particles and phrase order rather than inflection — templates
  restructure freely (placeholders survive verbatim), and the
  determiner system (te/ngā, singular/plural) does the plural
  work the fallback pattern needs.
- **The pronoun system is a register instrument**: dual and
  plural pronouns, and **inclusive vs exclusive "we"** (tāua/
  tātou vs māua/mātou) — as in Cherokee and Quechua, the
  corporate-we ban states itself: member-inclusive warmth is
  tātou; an app-voice "we" would be nakedly exclusive. The
  glossary can say "tātou, never mātou, as the app's we" and be
  making a claim English needs a paragraph for.
- **"A" and "o" possession categories** encode relationship
  quality — relevant to "my hours", "my community", "my key";
  which category each app possession takes is a real decision
  speakers make once.
- No grammatical gender — they/them neutrality costs nothing.

## Register concepts — the questions we ask, with why we ask them

- **Koha is the anchor.** The gift given at the marae — a
  contribution that is neither price nor payment, carried by
  relationship and reciprocity. It is the closest existing word
  on this track to what an Understoria "hour" is. Flagged **to
  confirm, never to assume** — whether koha's weight belongs on
  an app surface is precisely the judgment that belongs to Māori
  speakers.
- **Manaakitanga, whanaungatanga, kotahitanga, mahi tahi** —
  hospitality/care, relationship/kinship, unity, working
  together: civic-use values vocabulary (the IQ-principles
  parallel from the Inuktitut scaffold) already present in
  public life, flagged as discussion anchors for the welcome,
  community, and work-day surfaces.
- **Kaitiakitanga and the guardians row**: the app's "guardians"
  (key-shard holders) sit near *kaitiaki* — guardianship/
  stewardship — a concept with deep standing (and the name of Te
  Hiku's license). Whether that word belongs on this feature, or
  is bigger than it, is a partners' call the scaffold explicitly
  defers.
- **Tapu/noa and ceremonial register we do not propose** — the
  standing rule from every sibling scaffold.
- **Hours are never debt**: the register risk here is less a
  colonial ledger than the ordinary market — pricing the
  priceless. Koha's logic (above) is the fence's positive form;
  *utu* (reciprocity/return, with its range) is named as a
  discussion item for speakers rather than used.
- **The counting register**: raupatu (confiscation) rolls, the
  Native Land Court's individualization of title, and school
  policies that punished te reo within living memory stand
  behind the same fences as everywhere on the track — while iwi
  affiliation is living civic identity today. Partners hold the
  map.
- **Data sovereignty is the modern register**: this community
  articulated, before almost anyone, that language data is a
  taonga — a treasure under guardianship. The app's privacy
  architecture (keys the member holds, no rosters, no central
  server) can be described in that register truthfully, which is
  rare and worth doing right.
- **Safety strings ship at full force** — the standing
  line-by-line fidelity review.

## Term table

Structure only; concept column pre-filled, te reo column open.

| Concept (what the term must do) | te reo Māori | Notes / decisions |
|---|---|---|
| the hour / the contribution — never price, never owed | koha? | THE anchor — to confirm, never assume |
| welcome / care surfaces | *(open)* | manaakitanga — discussion anchor |
| community / kinship | *(open)* | whanaungatanga — discussion anchor |
| work day — working together | *(open)* | mahi tahi / kotahitanga — discussion anchors |
| guardians (key shards) | *(open)* | kaitiaki question — explicitly deferred |
| the app's "we" | tātou, never mātou | the inclusive/exclusive gift — to confirm |
| dashboard / post / claim / confirm / vouch | *(open)* | per the sibling scaffolds' fences |
| flag — before the community, never report-to-authority | *(open)* | |
| operator — never a boss | *(open)* | |
| panic / hard purge — full force | *(open)* | |
| tech vocabulary — transliteration vs descriptive coinage | *(open)* | the rorohiko tradition; Commission conventions |
| invite — guest warmth; never recruitment | *(open)* | |

## What ships, and when

Nothing, until partners say so — the standing posture. Wiring is
one small PR: fallback-safe plural rows, native mi date/number
formats free, macrons on the existing Latin stack. There is no
deadline; the infrastructure waits for the language.
