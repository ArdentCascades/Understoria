# Santali (ᱥᱟᱱᱛᱟᱲᱤ / sat) — partnership scaffold, not yet a glossary

**Deliberately unfinished**, on the model argued in `chr.md` and
`docs/i18n-partnership-cherokee.md` (all three track-wide
policies included): Santali speakers translate, we supply all
tooling, and nothing ships before their review —
`docs/i18n-partnership-santali.md` for specifics. Round five's
first language, the Munda (Austroasiatic) family's entry, and
the track's first from South Asia: some seven million speakers
across Jharkhand, West Bengal, Odisha, Assam, Bangladesh, and
Nepal; Eighth-Schedule constitutional status in India since
2003; and a script with a story the track's Cherokee and Adlam
siblings will recognize — **Ol Chiki**, created by Pandit
Raghunath Murmu, carried today by an active digital community
(a Santali Wikipedia runs in it).

## Stage-0 technical findings (verified 2026-09-15, node/ICU)

1. **Santali is a first-class CLDR/ICU locale — with a
   grammatical DUAL**: native resolution, plural categories
   `["one","two","other"]` (Munda grammar has real dual number —
   the Inuktitut/Sámi parallel, and our computed gates already
   sanction natural dual forms), native date and number formats,
   and `DisplayNames` supplies the endonym **ᱥᱟᱱᱛᱟᱲᱤ**.
2. **The digit question returns — inverted.** CLDR's default
   numbering for `sat` is **Ol Chiki digits** (᱑᱒᱓᱔), and dates
   render fully in-script: «ᱥᱮᱯᱴᱮᱢᱵᱟᱨ ᱑᱕, ᱵᱟᱞᱮ». For Bengali
   and Persian we pinned Western digits because the translated
   text used them; for Santali, Ol Chiki digits are part of the
   script's own identity and CLDR treats them as the default —
   so **no pin is assumed**: whether the interface uses Ol Chiki
   or Western digits is a partner decision the registry can
   honor either way (`intlNumbering` exists if they choose
   latn).
3. **Script realities**: Ol Chiki (U+1C50–1C7F) is alphabetic
   (not an abugida), LTR, unicameral — no casing hazard; NFC
   trivial. Font coverage needs the standing `:lang(sat)` stack
   check (Noto Sans Ol Chiki; Windows Nirmala UI covers it) —
   Inter has none. **The multi-script reality is a partner
   decision**: Santali has also been written in Eastern Nagari
   (common in Bangladesh), Devanagari, and Latin; Ol Chiki
   carries the community-identity momentum and official
   trajectory in India, but which script serves which engaging
   community — and whether Bangladesh's Santals would want an
   Eastern-Nagari sibling entry — is theirs to say.
4. **LTR; fallback chain sat → en**, with the honest question
   recorded: many Santali readers are stronger in Hindi or
   Bengali — we ship both (`hi`, `bn`), so a `sat → hi → en` or
   `sat → bn → en` chain is *available on proven rails* (the ht
   precedent) and regionally divisive — Jharkhand leans Hindi,
   West Bengal/Bangladesh lean Bengali. Partners decide; the
   default is en-direct until they do.
5. **Speech**: no `sat` voice on today's platforms; the
   read-aloud surface discloses honestly.
6. **Registry sketch (dark, later)**:
   `{ code: "sat", endonym: "ᱥᱟᱱᱛᱟᱲᱤ", dir: "ltr", speakLang: "sat" }`
   — digits and fallback per the decisions above.

## Decisions that belong to partners (open)

- **Script and digits** (findings 2–3); **fallback chain**
  (finding 4).
- **Terminology authority**: Santali literature has a Sahitya
  Akademi presence, university departments, and active writers'
  organizations; whose conventions anchor tech coinages is
  theirs to resolve.

## Grammar notes (high-confidence only)

- **The dual is real grammar** (finding 1) — two-party strings
  gain precision; the gates permit dropping `{{count}}` where
  inflection carries it.
- Munda morphology is agglutinative and verb-rich; templates
  restructure freely (placeholders survive verbatim).
- No grammatical gender in the Indo-European sense — the
  animate/inanimate distinction matters instead; the standing
  once-made-decision row (what an *hour*, a *task*, the *app*
  count as) applies.

## Register concepts — the questions we ask

- **The debt fence has an 1855 pedigree here.** The Santal Hul —
  the great rebellion led by Sidhu and Kanhu — rose in
  substantial part against the moneylender's ledger and bonded
  labor. The refused register (the mahajan's book, the bond, the
  advance against next season) is not an analogy in Santali
  country; it is the history the community already names. What
  the plain register of neighbors keeping shared count is, is
  precisely the speakers' craft — we bring no lexical guesses.
- **Village-institution vocabulary carries real weight** (the
  majhi and the traditional council): whether any of it belongs
  near an app's "operator" and governance surfaces, or is
  exactly what the no-admins register must avoid, is a
  speakers' judgment we pose and do not answer.
- **The counting register**: colonial settlement records,
  tea-garden labor registers, and today's certificate and
  enrollment vocabulary as living civic reality — the standing
  line; partners hold the map.
- **Ceremonial vocabulary under the standing do-not-propose
  rule.** Safety strings at full force with line-by-line
  fidelity review.

## Term table

Structure as in every sibling scaffold; ᱥᱟᱱᱛᱟᱲᱤ column entirely
open — deliberately: our Santali is thin and the scaffold says
so rather than guessing.

## What ships, and when

Nothing, until partners say so. Wiring, when wanted, rides
first-class CLDR (dual included) plus the Ol Chiki font stack
and the partners' digit/fallback decisions. No deadline; the
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
