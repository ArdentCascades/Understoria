# The Navajo partnership — the track's second language

## The model (shared with Cherokee)

This document extends the partnership track opened in
`docs/i18n-partnership-cherokee.md` to Navajo (Diné bizaad) — the
Na-Dené/Athabaskan family's entry in the one-language-per-family
plan. The model is identical and is argued in full there; in
brief:

**Diné speakers translate, we supply all tooling, and nothing
ships before their review.** The AI-fleet pipeline that produced
the seventeen shipped languages is honest for high-resource world
languages and would not be here: for a low-resource language the
error rate would exceed what any scripted gate could catch, and
language authority rests with speakers. The pipeline inverts;
`docs/i18n-glossary/nv.md` is the scaffold — Stage-0 technical
findings verified against the runtime, and every register decision
posed as a question for partners.

The offer is likewise the same, stated plainly up front rather
than assumed in either direction: the whole technical burden on
us; no deadline, any pace, chunked however suits; credit and
review authority theirs, including the words the Settings language
card uses to describe the translation's provenance, and unshipping
on request; compensation discussed honestly in the first
conversation (honoraria within the project's means, or the work
living inside a program's own funded mandate if useful);
licensing discussed before work starts (the app is AGPL; different
terms or grant-backs for culturally significant content are
negotiable).

## Why Navajo, and how it differs from Cherokee

- **The largest speaker community of any Indigenous language north
  of Mexico** (~170,000), with major institutions and living
  localization precedent: the Navajo-dubbed *Star Wars* (2013) and
  *Finding Nemo* (2016), an active Navajo Wikipedia, and the Code
  Talkers' standing proof that Diné bizaad can be made to say
  anything a new technology needs said.
- **The technical ground is less pre-paved than Cherokee's, and we
  say so honestly.** Cherokee is a first-class CLDR/ICU locale
  because the Cherokee Nation's earlier software work put it
  there; Navajo is not in CLDR at all (verified — the runtime
  silently falls back to English rules). Our infrastructure has
  shipped that exact situation before (Haitian Creole), so it
  costs partners nothing — but it means dates don't localize for
  free and plural mechanics follow the fallback-safe pattern. The
  scaffold records all of it, plus the one real rendering check
  (the tone-nasal vowels ą́ ę́ į́ ǫ́ have no precomposed Unicode
  forms; combining-mark positioning gets a visual check before
  anything ships) and the glottal-stop codepoint decision.
- **A process difference we expect and respect**: the Navajo
  Nation has more formalized review for projects involving the
  Nation than most communities. Official channels, institutional
  timelines, and a possible formal review are the normal path
  here, not an obstacle.

## Who to contact

Unlike the Cherokee track, the person sending this does not live
on Diné land — the outreach note below is written accordingly.

- **Navajo Nation — Department of Diné Education**, and its
  culture-and-language office — the Nation's own channel, and the
  right first door for anything wearing the Nation's language.
- **Diné College** (Tsaile, AZ) — Center for Diné Studies; the
  tribal college carries deep language-teaching practice.
- **Navajo Technical University** (Crownpoint, NM) — Diné Studies
  plus an explicitly technical mission; a natural fit for
  interface localization if any institution finds it interesting.
- **Tséhootsooí Diné Bi'ólta'** (Fort Defiance/Window Rock) — the
  Diné immersion school.
- **The Navajo Language Academy** — the summer workshops where
  Diné linguists and teachers gather; a good place for the
  question "who would actually enjoy this work?"

If both this track and the Cherokee track engage, each program
should know of the other — the glossary scaffolds already
cross-reference, and lessons will flow both ways.

## Draft outreach note (personalize before sending)

> Subject: An invitation — a mutual-aid app's interface in Diné
> bizaad, on your terms
>
> Yá'át'ééh — my name is [name]. I help maintain Understoria, a
> free, open-source mutual-aid platform: neighbors exchange help
> hour-for-hour, communities run their own servers, there are no
> ads, no tracking, and no company behind it. It currently speaks
> seventeen languages, and we have begun a different kind of
> translation track for Indigenous languages of North America —
> we recently extended the same invitation to Cherokee language
> programs.
>
> I'm writing to ask whether an interface in Diné bizaad is
> something your program would find worthwhile — and to be clear
> that the offer is the opposite of the usual one. We are not
> asking permission to machine-translate the language; we won't do
> that. We've done the technical groundwork (the orthography
> renders correctly end-to-end, the grammar mechanics are
> accounted for, and we've documented the translation decisions
> that proved hard in seventeen other languages), and the ask is
> whether Diné speakers — your staff, your students, whoever you'd
> choose — would want to do the actual translation, at whatever
> pace works, with review authority over every word, credit
> however you want it, and compensation discussed honestly up
> front. Nothing ships until you say it's right, and there is no
> deadline on our side. If there is a formal process the Nation
> would want this to go through, we'll follow it.
>
> If interface localization has any place in your language work —
> or if it doesn't, but you'd point me somewhere better — I'd be
> glad for a short conversation. Ahéhee' for reading this, and for
> the work you do.
>
> [name, contact, link to the project]

## Status

- 2026-09-15 — Track opened alongside Cherokee's; Stage-0 spike
  verified (see nv.md); scaffold and this document written. **Next
  step is human: the outreach note above, sent by a person, not an
  agent.** No code ships until partners exist and choose to.
