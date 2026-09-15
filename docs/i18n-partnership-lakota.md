# The Lakota partnership — the track's third language

## The model (shared with Cherokee and Navajo)

This document extends the partnership track
(`docs/i18n-partnership-cherokee.md`, argued in full there;
`docs/i18n-partnership-navajo.md`) to Lakota — the Siouan
family's entry in the one-language-per-family plan. In brief:

**Lakota speakers translate, we supply all tooling, and nothing
ships before their review.** The AI-fleet pipeline behind the
seventeen shipped languages would not be honest here, and language
authority rests with speakers — a principle the Lakota communities
have recently and publicly enforced themselves (the 2022 Standing
Rock dispute over outside claims to language materials), which
makes the posture of this track not a courtesy but the only
defensible way to show up.

The offer is the same, stated plainly rather than assumed: the
whole technical burden on us; no deadline, any pace; credit and
review authority theirs, including the words the Settings language
card uses and unshipping on request; compensation discussed
honestly in the first conversation (honoraria within the project's
means, or the work living inside a program's own funded mandate);
licensing discussed before work starts (the app is AGPL;
different terms or grant-backs for culturally significant content
are negotiable — and given the history above, we put the
materials-ownership question on the table FIRST, in writing:
the translation's contents are the community's, and we will sign
whatever makes that durable).

## Why Lakota, and what the spike found

- Roughly two thousand first-language speakers remain, most
  elders — the urgency is not abstract. Against that, the
  revitalization infrastructure is real: tribal colleges with
  Lakota studies departments, immersion childcare and language
  nests, and a generation of curriculum writers who have already
  faced the questions an interface raises (including the
  gendered-speech question — see the scaffold).
- **The technical ground (verified against our runtime,
  `docs/i18n-glossary/lkt.md`)**: Lakota is a *partial* CLDR/ICU
  locale — native plural rules (single category, matching the
  grammar, deterministic on every device) and **Lakota month and
  weekday names free at every date call site**; number formatting
  falls back harmlessly to Western digits. The orthography's
  special characters are all precomposed and NFC-stable — no
  combining-mark risk — with one wiring-time font check recorded.
  CLDR even supplies a candidate endonym (Lakȟólʼiyapi) and
  glottal-stop convention (U+02BC), both recorded as defaults for
  partners to confirm or override, since **the orthography
  decision itself is genuinely open and carries community weight**
  (the scaffold explains why, plainly).
- **The register ground is unusually rich**: the giveaway
  tradition articulates the exact economics this app runs on —
  wealth measured by what you give — and the Očhéthi Šakówiŋ
  camps of 2016–17 were lived mutual-aid logistics at scale
  within the last decade. If any translation on this track has a
  community answer to "what do we call this?", it may be Lakota's:
  *what did people call it at camp?*

## Who to contact

Community and tribal-college programs — the communities' own
institutions. The person sending this does not live on Lakota
land; the note below is written accordingly.

- **Sitting Bull College** (Fort Yates, Standing Rock) — Lakota/
  Dakota language programs and the language nest.
- **Oglala Lakota College** (Pine Ridge) — Lakota studies.
- **Sinte Gleska University** (Rosebud) — the Lakota studies
  department that developed its own orthographic and teaching
  tradition.
- **Red Cloud Indian School / Maȟpíya Lúta** (Pine Ridge) — its
  Lakota language program.
- **Thunder Valley CDC** (Pine Ridge) — a community-development
  organization with Lakota immersion programming; of everyone on
  this list, the mission overlap with a mutual-aid platform is
  the most direct, and they may be the right first conversation
  for that reason.

If multiple programs engage — or the Cherokee and Navajo tracks
have by then — each should know of the others; lessons flow both
ways and the scaffolds cross-reference.

## Draft outreach note (personalize before sending)

> Subject: An invitation — a mutual-aid app's interface in Lakota,
> on your terms
>
> Háu / Háŋ — my name is [name]. I help maintain Understoria, a
> free, open-source mutual-aid platform: neighbors exchange help
> hour-for-hour, communities run their own servers, there are no
> ads, no tracking, and no company behind it. It speaks seventeen
> languages today, and we have begun a different kind of
> translation track for Indigenous languages — we've extended the
> same invitation to Cherokee and Navajo language programs.
>
> I'm writing to ask whether an interface in Lakota is something
> your program would find worthwhile — and to be clear that the
> offer is the opposite of the usual one. We are not asking
> permission to machine-translate the language, and we won't do
> that; we're also aware of how outside organizations have
> mishandled ownership of Lakota language work, and we'd put the
> ownership question on the table first, in writing, on your
> terms. The technical groundwork is done (the orthography — in
> whichever convention you use — renders correctly end-to-end,
> and we've documented the decisions that proved hard in seventeen
> other languages, including how an interface should handle
> speech-style questions your curriculum writers know far better
> than we do). The ask is whether Lakota speakers — your staff,
> your students, whoever you'd choose — would want to do the
> actual translation, at whatever pace works, with review
> authority over every word, credit however you want it, and
> compensation discussed honestly up front. Nothing ships until
> you say it's right; there is no deadline on our side.
>
> If interface localization has any place in your language work —
> or if it doesn't, but you'd point me somewhere better — I'd be
> glad for a short conversation. Philámayaye for reading this,
> and for the work you do.
>
> [name, contact, link to the project]

## Status

- 2026-09-15 — Track opened alongside Cherokee's and Navajo's;
  Stage-0 spike verified (see lkt.md); scaffold and this document
  written. **Next step is human: the outreach note above, sent by
  a person, not an agent.** No code ships until partners exist
  and choose to.
