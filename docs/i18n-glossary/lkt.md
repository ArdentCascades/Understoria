# Lakota (Lakȟólʼiyapi / lkt) — partnership scaffold, not yet a glossary

**This file is deliberately unfinished**, on the model of its
Cherokee and Navajo siblings (`chr.md`, `nv.md`;
`docs/i18n-partnership-lakota.md` for the partnership model): the
decisions in the open sections belong to Lakota speakers, and
nothing ships until they have made them. Today it contains (a)
Stage-0 technical findings verified against the actual runtime,
and (b) the concept documentation behind every hard decision
seventeen shipped languages taught us, posed as questions.

Lakota is the third language of the partnership track — one
language from each Indigenous language family of North America —
and the Siouan family's entry. Roughly two thousand first-language
speakers remain across the Lakota reservations; the revitalization
work at the tribal colleges and immersion programs is intense; and
the question of who holds authority over the language has been
answered *by the community itself, publicly and recently* (see the
sovereignty note below) in exactly the terms this track is built
on: the language belongs to its speakers.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Lakota is a PARTIAL CLDR/ICU locale** — a profile between
   Cherokee's (full) and Navajo's (absent):
   - `Intl.PluralRules("lkt")` resolves **natively** with plural
     categories `["other"]` only — a single-category language like
     Chinese, Tibetan, and Indonesian. This matches the grammar
     (number is typically marked by verb enclitics such as the
     animate plural *=pi*, not on nouns), and it means the shipped
     precedent applies mechanically: `lkt.json` carries
     `_one`/`_other` pairs with identical strings, deterministic on
     every device (unlike Navajo's fallback nondeterminism).
   - `Intl.DateTimeFormat("lkt")` resolves natively and **CLDR
     carries Lakota month and weekday names**: a September date
     renders «Aŋpétunuŋpa, Čhaŋwápeǧi Wí 15, 2026» for free at
     every `Intl` date call site.
   - `Intl.NumberFormat("lkt")` falls back to the default locale —
     harmless (Western digits, standard grouping, exactly what the
     text needs); no `intlNumbering` pin.
   - `Intl.DisplayNames` answers the endonym question:
     **Lakȟólʼiyapi**, and does so using **U+02BC MODIFIER LETTER
     APOSTROPHE** for the glottal stop — a ready-made convention
     the orthography decision below can adopt or override.
2. **Orthography codepoints are all precomposed and NFC-stable**
   (verified): ȟ U+021F, ǧ U+01E7, ŋ U+014B, plus š ž č and the
   acute-accented vowels — no combining-sequence rendering risk
   (contrast Navajo's ą́). One wiring-time check remains: confirm
   the app's font (Inter) actually covers ȟ/ǧ/ŋ at every weight
   with the probe string «Lakȟólʼiyapi čhaŋté ǧí šá ŋ», and add a
   `:lang(lkt)` fallback stack only if it doesn't.
3. **No casing hazard** (Latin; diacritics survive case-mapping);
   the no-`text-transform` rule from the chr scaffold stands for
   everyone regardless.
4. **LTR; fallback chain lkt → en.**
5. **Speech**: no `lkt` speech-synthesis voice exists on today's
   platforms; the read-aloud surface already discloses that
   honestly rather than reading in the wrong language.
6. **Registry sketch for the (dark, later) wiring PR**:
   `{ code: "lkt", endonym: "Lakȟólʼiyapi", dir: "ltr", speakLang: "lkt" }`
   — noting that **even the endonym's spelling is
   orthography-dependent** and is confirmed with partners before
   anything ships (CLDR's form is recorded above as a default, not
   a decision).

## The sovereignty note, named plainly

In 2022 the Standing Rock Sioux Tribe banished the leadership of a
non-Native-founded language organization in a public dispute over
who owns Lakota language materials — recordings of elders,
dictionaries, curricula — and the copyrights claimed over them.
Whatever else that history means, it settles how any outside
project must behave: **language authority rests with the
communities, full stop.** Two practical consequences for this
track:

- **The orthography decision is genuinely open and carries
  weight.** The "Standard Lakota Orthography" used in some
  dictionaries (and reflected in CLDR's data above) is associated
  with that dispute; other traditions exist, including the
  orthography developed at Sinte Gleska University and
  community-specific conventions. We render examples in this file
  in the forms CLDR happens to carry, as placeholders only — the
  working orthography is the partners' first decision, and every
  gate we build enforces *their* choice consistently, whatever it
  is.
- **Our contact list (see the partnership document) is tribal
  colleges and community programs** — institutions of the
  communities themselves.

## Decisions that belong to partners (open)

- **Which orthography** (above) — and with it the endonym spelling
  and the glottal-stop codepoint (CLDR's U+02BC is a sound
  default: it is a letter, immune to smart-quote corruption).
- **THE headline register question: whose speech does an app
  speak?** Lakota famously marks the speaker's gender
  grammatically — assertion and command enclitics differ for male
  and female speakers. An app is neither, and this decision shapes
  every button and every prompt. Options partners may weigh, all
  with precedent in Lakota teaching practice: the plain/neutral
  written style that omits final enclitics (common in formal
  writing); a consistent convention chosen deliberately; or
  per-surface judgment. Curriculum writers at the tribal colleges
  have faced exactly this; the app follows their practice, not our
  guess. (For our part: the string architecture can support
  whatever convention they choose, including restructuring any
  sentence to avoid a forced choice.)
- **Terminology authority and coinages** (server, passkey, QR
  code): whether to reuse coinages from existing Lakota curricula
  and media, or coin fresh, and who signs off.

## Grammar notes for the string work (high-confidence only)

- **Verb-final (SOV), verb-centered**: sentence order and
  information packaging differ fundamentally from English;
  placeholder-bearing templates will need free restructuring —
  our contract allows it (placeholders survive verbatim; the
  sentence around them is free).
- **Number lives in the verb** (the animate plural enclitic *=pi*
  and related machinery), not on nouns — which is why CLDR's
  single plural category is right, and why "1 hour / 2 hours"
  surfaces will read naturally with one string form. Where a count
  matters, the numeral carries it.
- **Gendered speech enclitics** — see the register question above;
  grammatically real, decision partners'.
- **No grammatical gender on referents** — the app's they/them
  neutrality costs nothing.

## Register concepts — the questions we ask, with why we ask them

- **The giveaway measures wealth by what you give.** Lakota
  tradition carries one of the continent's clearest articulations
  of the register this whole app needs: generosity as a core
  virtue, honor accruing to the one who gives away. The
  hours/balance language can stand inside that register — *which
  words* place it there is entirely the partners' craft. (We name
  the concept in English on purpose; the words are theirs.)
- **Thiyóšpaye** — the extended-family kinship circle, the
  community-of-obligation concept adjacent to everything this app
  does. Flagged as a discussion anchor with an honest caveat:
  social-service systems have institutionalized the word in
  child-welfare contexts, and whether it belongs in an app's
  community vocabulary — or has been bureaucratized past wanting
  it there — is exactly a speakers' judgment.
- **Mitákuye Oyásʼiŋ we do not propose.** Its weight is
  ceremonial. It is named here only so no future contributor
  "helpfully" reaches for it — the hózhǫ́ rule from the Navajo
  scaffold, applied identically.
- **Hours are never debt** (the core fence). The Lakota-specific
  resemblance risks partners will recognize: the agency ration
  line and annuity roll, the trader's ledger and store credit —
  distribution-with-strings vocabulary the timebank must never
  echo. What is the plain register of neighbors keeping track of
  shared work?
- **The counting and enrollment register**: rolls, censuses, and
  agency counting carry their history here as everywhere on this
  track — while enrollment is simultaneously *living citizenship
  vocabulary* today. Sign-up language walks that line; partners
  hold the map.
- **The surveillance register is not historical here — it is
  recent memory.** The Standing Rock water-protector camps of
  2016–17 were surveilled by private security and infiltrated;
  the community also insisted, correctly, on its own naming:
  *water protectors*, not what the state called them. Flagging a
  post must read as bringing something before the community, never
  reporting someone; and the app's naming discipline (people are
  what the community calls them) has a living precedent partners
  may want to draw on.
- **And the camps cut the other way, too**: Očhéthi Šakówiŋ camp
  ran kitchens, supply lines, medic tents, and volunteer
  coordination for thousands — lived mutual-aid infrastructure at
  scale, within the last decade, organized by exactly the
  communities this translation would serve. If any register
  question needs grounding, "what did people call this at camp?"
  may be the best answer available anywhere on this track.
- **Safety strings ship at full force**: compelled-biometrics,
  panic, guardians/recovery — line-by-line en→target fidelity
  review, nothing softened. Given the surveillance history above,
  these surfaces deserve — and will get — the most careful
  review in the file.
- **Sovereignty resonance, offered not imposed**: each community
  its own node, federating as equals, no central server.

## Term table

Structure only; concept column pre-filled from seventeen shipped
glossaries, Lakȟólʼiyapi column open. Thiyóšpaye appears once,
flagged, as described above.

| Concept (what the term must do) | Lakȟólʼiyapi | Notes / decisions |
|---|---|---|
| dashboard — the community's living overview; never "control panel" | *(open)* | |
| hours / the balance — never money, never a ledger you owe | *(open)* | ration/annuity register refused |
| post (need / offer) — neighbor speech, not classifieds | *(open)* | |
| claim / "In my care" — taking a task on, warmth not workflow | *(open)* | |
| confirm (exchange) — reserved for exchange confirmation in every language | *(open)* | |
| vouch — standing behind someone; never co-signing | *(open)* | |
| guardians (key shards) — trusted holders; never legal guardianship | *(open)* | |
| work day — communal labor | *(open)* | giveaway-register adjacency |
| community / kinship circle | *(open)* | thiyóšpaye — flagged anchor, with the caveat above |
| flag — bring before the community; never report-to-authority | *(open)* | water-protector naming precedent |
| dispute — disagreement between neighbors; never a case | *(open)* | |
| operator — keeps the server running; never a boss | *(open)* | |
| panic / hard purge — full force, plain words | *(open)* | |
| recovery kit / passphrase / passkey — loan-word tier decisions | *(open)* | coinage-authority question |
| invite — guest warmth; never recruitment | *(open)* | enrollment-collision caution |
| imperative style on buttons — whose speech? | *(open)* | THE enclitic decision, made once, enforced everywhere |

## What ships, and when

Nothing, until partners say so — identical posture to chr.md and
nv.md. The wiring is one small PR on proven rails (registry entry,
loader, `locale-lkt` chunk, single-plural-category rows on the
zh/bo pattern — deterministic, unlike nv — the finding-2 font
check, and CLDR's free Lakota dates). There is no deadline; the
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
