# Anishinaabemowin (Ojibwe / oj) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in `chr.md` and
`docs/i18n-partnership-cherokee.md` (including its track-wide
policy section): Anishinaabe speakers translate, we supply all
tooling, and nothing ships before their review —
`docs/i18n-partnership-anishinaabemowin.md` for specifics. Round
three's second language, Cree's Algonquian sibling — and like
Cree, a continuum, so this scaffold inherits `cr.md`'s posture:
the honest first question is *which* Anishinaabemowin, and the
plan holds room for more than one answer.

Roughly twenty-five thousand speakers across Southwestern Ojibwe
(Minnesota/Wisconsin), Central and Northwestern Ojibwe,
Saulteaux, Odawa, Eastern Ojibwe, and Oji-Cree — with a
revitalization movement of unusual energy: immersion schools
whose very names state this app's premise (Waadookodaading — "a
place where people help each other"), and the Ojibwe People's
Dictionary as living, elder-recorded digital infrastructure.

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **The entire continuum is absent from CLDR/ICU** (`oj`,
   `ojb`, `ojs`, `ciw`, `otw` all fall back — verified). The
   proven no-ICU pattern applies to every variety: fallback-safe
   plural pairs, no free localized dates, honestly disclosed.
   Ojibwe marks plural on nouns (animate *-g*, inanimate *-n*),
   so as with Cree the fallback-safe strategy has a real cost
   that is a translator's craft call — the numeral typically
   carries the number.
2. **Two writing systems, mapped to the continuum** (the Cree
   parallel exactly): the **Fiero double-vowel Roman
   orthography** (dominant in the U.S. and much of the south —
   entirely ASCII: double vowels for length, apostrophe for the
   glottal) and **syllabics** (Oji-Cree `ojs` and some northern
   communities — the UCAS stack from the Cree scaffold applies
   unchanged). Which system, per engaging community; per-tag
   registry entries as with Cree, with `oj` detection aliasing
   to whichever ships first.
3. **Animate/inanimate gender, obviation, and inverse marking**
   run through the grammar as in Cree — the same once-made
   corpus-wide decisions (which gender an *hour*, a *task*, the
   *app* takes) and the same free-restructuring requirement for
   templates.
4. **No casing hazard in either script; LTR; fallback → en**
   (Canadian communities may weigh fr — theirs to say).
5. **Speech**: no voice on today's platforms; the read-aloud
   surface discloses honestly.
6. **Registry sketch (dark, later, per-variety)** — e.g.
   Southwestern: `{ code: "ciw" or "ojb" per partners, endonym: "Anishinaabemowin", dir: "ltr", speakLang: matching }`.

## Decisions that belong to partners (open)

- **Which Anishinaabemowin, and how many** — determined by who
  engages; the registry is per-tag.
- **Which writing system** for the engaging community, and its
  conventions (Fiero details vary at the edges; syllabics
  finals per community).
- **Terminology authority**: the Ojibwe People's Dictionary,
  immersion-school curricula, and university programs all carry
  conventions; whose anchor tech coinages, and who signs off.

## Register concepts — the questions we ask, with why we ask them

- **Wiidookodaadiwin — helping one another — is already the
  name.** The concept is central enough that an immersion school
  is named "the place where we help each other"
  (Waadookodaading). It is this scaffold's flagged anchor — the
  wîcihitowin/gadugi parallel, and here the closest yet to the
  app's literal function — **to confirm, never to assume**, in
  the engaging community's variety and spelling.
- **Mino-bimaadiziwin** — living well, the good life — is
  civic-use values vocabulary (the buen vivir / IQ-principles
  parallel), named as a discussion anchor, not a proposal. The
  Seven Grandfather Teachings are likewise present in education
  contexts; whether any belong near an interface is entirely a
  speakers' judgment, and the ceremonial register beyond them
  falls under the standing do-not-propose rule.
- **Hours are never debt** — the standing fence with the
  region's specific history: HBC and trader credit as in the
  Cree scaffold, and **treaty annuities** — including the
  Robinson treaties' annuity claims resolved in living memory —
  as the local counting-and-payment register the timebank must
  never echo. **Manoomin** (wild rice) stewardship is the
  region's lived commons practice; the seed-library and
  food-sharing playbooks have neighbors here.
- **The counting register**: annuity paylists, residential and
  boarding school rolls on both sides of the border, against
  band membership and enrollment as living civic vocabulary —
  the standing line; partners hold the map.
- **Safety strings ship at full force** — the standing
  line-by-line fidelity review.

## Term table

Structure only; concept column pre-filled, Anishinaabemowin
column open (variety-labeled when filled).

| Concept (what the term must do) | Anishinaabemowin (variety) | Notes / decisions |
|---|---|---|
| mutual help / the practice itself | wiidookodaadiwin? | THE anchor — to confirm, in the engaging variety |
| hours / the balance — never money, never owed | *(open)* | annuity/trader-credit register refused |
| dashboard / post / claim / confirm / vouch / guardians | *(open)* | per the sibling scaffolds' fences |
| work day — communal labor | *(open)* | |
| animacy assignments — hour, task, post, node | *(open)* | once-made, corpus-wide (the Cree row) |
| flag — before the community, never report-to-authority | *(open)* | |
| operator — never a boss, never band-office register | *(open)* | |
| panic / hard purge — full force | *(open)* | |
| invite — guest warmth; never recruitment | *(open)* | |

## What ships, and when

Nothing, until partners say so — the standing posture. Wiring is
one small PR per engaging variety on the no-ICU rails (Fiero =
plain ASCII; syllabics = the UCAS stack). There is no deadline;
the infrastructure waits for the language — in as many of its
varieties as its communities want.
