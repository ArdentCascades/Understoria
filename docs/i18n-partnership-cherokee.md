# The Cherokee partnership — a review-before-ship translation track

## Why this track exists, and why it is different

Understoria ships seventeen languages. All seventeen were
AI-assisted translations of large world languages, validated by
scripted gates and honestly labeled in Settings as awaiting
native-speaker review. That model worked because those languages
have enormous written corpora — the translations are genuinely
strong, and the review is a polish pass.

Cherokee — and every Indigenous language of North America — is
different, and pretending otherwise would be the disrespect. These
are low-resource languages by exactly the historical processes that
make translating them matter: removal, allotment, boarding schools
that punished children for speaking them. Machine translation into
Cherokee would carry an error rate no scripted gate could catch,
because the validator would be as weak as the translator. And the
language-sovereignty principle that Indigenous communities have
articulated clearly — authority over the language rests with its
speakers — applies to us as much as to anyone.

So this track inverts the pipeline:

| The seventeen shipped languages | The Cherokee track |
|---|---|
| AI fleet translates, gates validate | Cherokee speakers translate |
| Ships marked "awaiting native review" | Ships only **after** speaker review |
| Glossary records decisions made | Glossary scaffold poses decisions as questions (`docs/i18n-glossary/chr.md`) |
| We supply language + tooling | We supply tooling only; partners supply language |

## Languages this track will never scaffold unbidden

This section is track-wide policy, recorded here because this
document is the model's canonical home; every sibling partnership
document inherits it.

Some nations hold their languages as spoken, not written, **by
choice** — several Pueblo communities among them, and others
elsewhere. That choice is language sovereignty exercised, not a
gap waiting for tooling, and the respectful form of this track
toward such communities is silence until invited: no scaffold,
no Stage-0 probe published, no outreach note drafted, no entry
in any candidate list. Their languages do not appear in this
repository unless and until they open that door themselves —
and "no", including a permanent no, is a designed outcome of
this track, not a failure of it.

Two corollaries:

- **Candidate lists in these documents name only languages whose
  communities have public, community-led writing and teaching
  traditions.** Before adding any language to a future round,
  the first check is whether writing it down is something its
  community does and wants — and when in doubt, the answer is to
  ask nothing publicly and build nothing.
- If a community that keeps its language oral ever wants
  something from this project — which might not be a written
  interface at all (the app's spoken-interface work exists) —
  that conversation starts on their initiative and their terms,
  and nothing about it is designed in advance here.

**Threat-model-first is the third rule, and it protects people,
not only choices.** For some communities, state surveillance
makes the language itself treated as suspect — installing a
minority-language app can be incriminating, and a translation
could endanger the very members it means to serve. For any such
language, the first conversation is a **threat-model
conversation** — held with community organizations and diaspora
security researchers before any glossary, scaffold, or probe —
and its designed outcomes include "not yet," "diaspora-only,"
and "never." The app's own operational-security honesty (the
compelled-biometrics door sentence, the threat-model document)
applies to the project itself here. **We deliberately do not
name these languages anywhere in this repository**: the category
is recognized; its membership is not enumerated, because a list
of surveilled communities is itself the kind of list this app
refuses to keep.

**Access-by-choice generalizes the same rule.** Some communities
write their languages but restrict who may learn or use them:
reclamation projects that reserve the language for their own
citizens (the Wôpanâak Language Reclamation Project states this
plainly), languages with registers held under cultural
protocols (Australian ICIP protocols, avoidance registers,
knowledge that is gendered or initiatory), and others. The
track treats restricted-access languages exactly like
oral-by-choice ones — nothing scaffolded, probed, or listed
unbidden — and if such a community ever invites contact, their
access rules are terms we accept as given, never terms we
negotiate. A language is not "open source" because it is
written down; it is the community's, on the community's terms,
in every case.

## Why Cherokee first

One language per Indigenous language family is the goal (Iroquoian
first, then candidates like Diné bizaad, Lakota, Cree, Inuktitut).
Cherokee opens the track because the ground is uniquely ready:

- **The Cherokee Nation has done software localization before** —
  the first Native American language on the iPhone (2010), Gmail in
  Cherokee (2012), a Windows interface pack (2013), a Wikipedia
  edition. Experienced Cherokee software translators exist; the
  question is invitation, not possibility.
- **The technical ground is solid** because of that same history:
  Cherokee is a first-class Unicode/CLDR/ICU locale — native plural
  rules, syllabary month names, fonts shipped on every major OS.
  The Stage-0 findings in `docs/i18n-glossary/chr.md` verify all of
  it against our actual runtime.
- **The language is in an emergency its nations have named** — the
  Cherokee Nation declared a language state of emergency in 2019 —
  and revitalization programs are active and organized on both
  sides: the Durbin Feeling Language Center (Cherokee Nation,
  Tahlequah OK) and the Kituwah Preservation & Education Program /
  New Kituwah Academy (Eastern Band, Qualla Boundary NC). A
  free-software mutual-aid platform is a small thing next to that
  work — but interfaces in the language are one of the surfaces
  where a living language lives.

## What we offer

- **The whole technical burden.** Registry, lazy loading, font
  stacks, parity gates, plural gates, the six-chunk staging
  tooling, the review tooling — all proven across seventeen
  languages. Translators translate; nothing else lands on them.
- **The scaffold.** `docs/i18n-glossary/chr.md` documents every
  hard register decision seventeen languages taught us — the debt
  fence, the no-admins register, the surveillance-vocabulary fence,
  the safety-string fidelity process — as questions with context,
  so partners start from our lessons, not a blank page.
- **No deadline, any pace, chunked however suits.** The app ships a
  language complete-or-not with honest disclosure; the
  infrastructure waits for the language.
- **Credit and control.** Translators and their institutions
  credited as they choose, in the app and the README; the
  translation's conventions are theirs; "done" is when they say so;
  and if at any point they want it unshipped, it unships.
- **Compensation.** Translation is skilled work and revitalization
  programs are stretched. This project is non-commercial free
  software with no revenue, so what is honestly on offer is
  transparent: whatever budget the project's people can put
  together for honoraria, plus the option that the work happens
  inside a program's own funded mandate if the program finds it
  useful (interface localization has been fundable language-work
  before). This must be discussed plainly in the first
  conversation, not assumed in either direction.
- **Licensing, discussed up front.** The app is AGPL; string files
  in the repo inherit that. If partners want different terms for
  culturally significant content, or a grant-back arrangement for
  the nations' own use, that is negotiable before work starts —
  not a surprise after.

## What we ask

1. A first conversation — is this useful to you at all? (A real
   possible answer is no, and the track waits or ends.)
2. If yes: glossary co-design first (the open sections of chr.md),
   then UI strings in stages at whatever pace suits, then the
   authored content (guides, playbooks) if wanted — the UI alone is
   a complete, shippable stage.
3. Review authority throughout: nothing ships without their sign-off,
   and the Settings language card describes the translation's
   provenance in words they approve.

## Who to contact

The person sending this lives on Cherokee land, which shapes where
to start — but both major language programs should know about the
other's involvement if both engage.

- **Eastern Band of Cherokee Indians** — Kituwah Preservation &
  Education Program (KPEP) / New Kituwah Academy, Cherokee, NC.
  The homeland's revitalization program; the local nation if "on
  Cherokee land" means the Southeast.
- **Cherokee Nation** — Language Department / Durbin Feeling
  Language Center, Tahlequah, OK. Carries the prior software
  localization experience (the iPhone/Gmail/Windows work) and the
  largest speaker community.
- **United Keetoowah Band** — language program, Tahlequah, OK.

## Draft outreach note (personalize before sending)

> Subject: An invitation — a mutual-aid app's interface in ᏣᎳᎩ, on
> your terms
>
> ᎣᏏᏲ — my name is [name], and I live on Cherokee land in [place].
>
> I help maintain Understoria, a free, open-source mutual-aid
> platform: neighbors exchange help hour-for-hour, communities run
> their own servers, there are no ads, no tracking, and no company
> behind it. It currently speaks seventeen languages.
>
> I'm writing to ask whether translating it into Cherokee is
> something your program would find worthwhile — and to be clear
> about the shape of the offer, because it's the opposite of the
> usual one. We are not asking permission to machine-translate
> your language; we won't do that. We've prepared all the
> technical groundwork (the syllabary renders correctly end-to-end,
> the grammar mechanics are accounted for, and we've documented the
> translation decisions that proved hard in other languages), and
> the ask is whether Cherokee speakers — your staff, your
> apprentices, whoever you'd choose — would want to do the actual
> translation, at whatever pace works, with review authority over
> every word, credit however you want it, and compensation
> discussed honestly up front. Nothing ships until you say it's
> right, and there is no deadline on our side.
>
> If interface localization has any place in your language work —
> or if it doesn't but you'd point me somewhere better — I'd be
> glad for a short conversation. ᏩᏙ for reading this, and for the
> work you do.
>
> [name, contact, link to the project]

## Status

- 2026-09-15 — Track opened; Stage-0 spike verified (see
  chr.md); scaffold and this document written. **Next step is
  human: the outreach note above, sent by a person, not an
  agent.** No code ships until partners exist and choose to.
