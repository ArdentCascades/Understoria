# Haitian Creole (ht) translation glossary — DRAFT pending native review

Reference for every bulk-translation and review pass over `ht.json` and
the Haitian Creole content modules. Decisions here get applied ~2,900
times — when in doubt, pick the word a Kreyòl-speaking neighbor would
say across a kitchen table (or across the lakou at dusk), not the word
a bank SMS, an NGO leaflet, or a French-flavored circular would use.

**Locale code is `ht`** (language-only): browsers send `ht` and
`ht-HT`, and i18next's language-only fallback resolves both. One `ht`
serves Haiti and the whole diaspora — the US, Canada, the Dominican
Republic, the Bahamas — so every string must read the same in Okap,
Jakmèl, and Brooklyn. The base is standard written Kreyòl in the
official orthography (rule 7), never one region's variants. French is
a separate shipped locale (`fr`), and its register is this file's
explicit counter-example (rule 3): Kreyòl that reads like relexified
French officialese is wrong by definition. Haitian Creole opens a new
wave after the demand-driven wave (id, sw, fil, bn) closed.

## Global register decisions

1. **The member is ou / w — and that is the whole system.** Kreyòl
   has no tu/vous split: ou addresses the market woman and the
   senator alike, so the address question that cost hi, bn, and fil
   a page of argument is settled by the grammar itself. The short
   form w appears where Kreyòl puts it — after a vowel sound ("n ap
   ede w", "si w vle") — and warmth comes from particles and word
   choice: non, wi, annou, ti ("Eseye ankò non."). Never manufacture
   distance to sound "respectful": honorific padding is French, not
   Kreyòl.
2. **The nou trap — read this twice.** Kreyòl nou means BOTH "we/our"
   AND "you-plural/your". Three rules keep it safe: (a) **Corporate
   we is banned as the app's voice** — the app never says nou as
   itself ("nou regrèt" is the telco apology and there is no company
   behind this app); prefer no subject or name the real actor:
   aplikasyon an, node la, kominote a ("Li anrejistre.", "Aplikasyon
   an ap li l fò pou ou."). It survives only where en itself
   unmistakably speaks as the people who made the software (the
   translation-honesty note). (b) A "we" that includes the member is
   **annou + verb** for let's-do-it ("Annou fete!") and **nou tout**
   for we-all statements — the tout does the inclusive work bare nou
   can't. (c) Genuine plural you may be nou — grammar, not deference
   — but prefer a rephrase ("tout moun", "nou toude" for exactly-two)
   so a bare ambiguous nou never leads a sentence.
3. **Warm Kreyòl — never relexified French officialese.** fr shipped
   long ago and Haitian members may read it; ht must never sound like
   it wearing Kreyòl spelling. Where fr.md chose a formal rendering,
   ht deliberately does not mirror it: fr "se porter garant" → ht
   reponn pou (never "pote garanti"); fr "solde de départ" → ht
   semans (never "sòl" — rule 5 makes that relexification
   radioactive); fr "kit de récupération" → "kit pou tounen" (never
   "rekiperasyon"). Banned officialese: efektye, pwosede, "swit a",
   telco-apology padding, any calque of "veuillez". **Tanpri is
   decided honestly, not imported from a sibling ban**: tanpri is
   real kitchen Kreyòl and stays AVAILABLE — sparingly, where en
   itself genuinely pleads — but never as reflex padding on every
   imperative (the bare imperative softened with non/wi/ti is
   already courteous: "Tcheke l ankò non."), and **"tanpri souple"
   stacked is banned** (begging register). Banned people-words:
   itilizatè (user), kliyan, abòne — members are manm. Banned promo
   register: pwomosyon, bonis, pwen (loyalty points), kachbak, "pa
   rate sa" — this app sells nothing.
4. **Hours, not debt — and in Kreyòl the debt register has faces.**
   The boutik credit book, the ponya lender's interest, the kanè
   that records what you owe — lived debt, exactly what this app
   refuses to rebuild. Hours are **èdtan** (one word, one spelling):
   "Yon èdtan èd se yon èdtan, kèlkeswa travay la." en's "credit(s)"
   is ALWAYS rendered as èdtan (the id credit→jam precedent): "You
   start with credit" → "Ou kòmanse ak èdtan nan men ou". The
   member's balance is "èdtan ou yo" — **balans is banned** (the
   phone-recharge word: "tcheke balans ou"). Banned file-wide: dèt,
   prete, prè, kredi, ranbouse, remèt (pay-back sense — never near
   èdtan), vèsman, enterè, ponya, garanti (loan sense), kosiyen,
   kanè, kès, mikwokredi. Debt words appear ONLY where en itself
   explicitly rejects debt framing — the member guide's "Asking is
   not debt", faq's negative-balance answer, the seed-library tip —
   and there the ONE sanctioned formula is: **"Mande èd se pa yon
   dèt — ou pa prete anyen nan men pèsonn."** (the gift line: **"Se
   yon kado — se pa yon prè."**). Owed help is "ap tann ou konfime".
   Never frame asking around shame, even to negate it ("ou pa bezwen
   wont" still invokes wont) — render never-gated asking positively:
   "Mande — se konsa vwazen viv."
5. **Sòl is banned for the community and the timebank — absolutely.**
   The sòl (sabotay in the north) is Haiti's rotating credit club:
   everyone pays money in on a schedule, each takes the pot in turn,
   and missing your hand is a real debt to real neighbors. It is
   beloved, it is mutual — and it is the ONE institution this
   timebank must never resemble, exactly bn's সমিতি and id's arisan:
   hours are not paid in, there is no pot, no turn, and asking
   creates no obligation. If a member reads this app as a sòl of
   hours, every no-debt promise in it becomes unreadable. So: sòl
   and sabotay never describe the community, the timebank, hours, or
   the seed. A doubled trap: French "solde" (fr.md's balance word)
   relexifies to this exact syllable — and sòld is the wages word —
   so the balance family stays with èdtan and semans, always.
6. **The communal lexicon — decided one by one.** **Konbit** — the
   gathered work-team, mutual aid's most famous Haitian institution —
   takes the work-day feature, exactly the Bayanihan/শ্রমদান slot:
   "Konbit — {{project}}", "Òganize yon konbit". Use it there and in
   prose about actual gathered collective labor — hands, hoes, a
   meal after — and NEVER sprinkle it over the app or the timebank
   mechanism: konbit has been worn by campaign slogans and NGO
   branding, and it stays honest only while it names something
   concrete. Mutual aid generally is **youn ede lòt** — the lived
   reciprocal — chosen over "antre-èd" / "èd mityèl" (French calques
   of entraide/aide mutuelle no neighbor says). Lakou-culture warmth
   is welcome in teaching prose: lakou, vwazinaj, tèt ansanm, and
   the proverb that IS this app — "Men anpil, chay pa lou."
   **Lacharite is banned** ("mande lacharite" is begging — help here
   flows level, never downhill). **The NGO register is banned with
   prejudice**: Haiti is the most NGO-saturated country on earth,
   and this app must sound like neighbors, not a pwogram — banned:
   benefisyè, pwogram (projects are pwojè; the words around them
   stay clean), sansibilizasyon, patnè, bayè (donors), finansman,
   ONG-anything. Banned aid-industry words: **èd imanitè** (help is
   plain èd), sekou (rescue/relief register), asistans, distribisyon
   (the aid line), ratyon. **Volontè is banned** (the NGO t-shirt;
   neighbors here just help — moun ki ede a).
7. **Orthography: the official IPN Kreyòl orthography, strictly.**
   The 1979 spelling is law here — one sound, one symbol: no French
   etymological spellings, ever (kominote never "communauté"-shaped).
   Aksan grav marks the open vowels è and ò (èdtan, fò, pòt) and àn
   where a stays oral before n (pàn); no other accents exist. **No
   apostrophes**: the short forms m, w, l, n, y are written as
   free-standing words — "m ap", "n a wè", "ede l", "kle w" — never
   m', w', l' (the Akademi Kreyòl convention; the apostrophe is a
   French habit). One spelling per word, decided here: èdtan (never
   "è d tan"), youn (never yonn), kounye a, kominote, kalandriye,
   pwojè, envitasyon, semans, konfyans, and "p ap" / "m ap" / "n ap"
   spaced. Sentence case as en — never simulate emphasis with caps.
8. **Loanword policy — three tiers.** (a) Proper nouns, codes,
   technical literals verbatim in Latin: Understoria, QR (as "kòd
   QR"), Wi-Fi, PIN, URL, email addresses, file paths, env vars,
   .ics — plus **node**, **passkey**, and **passphrase** (term
   table: members' phones run in French or English, never in Kreyòl,
   so these must match the platform sheet mid-flow). (b) Established
   loans in Kreyòl spelling ARE the everyday words: aplikasyon,
   sèvè, kont, pwofil, modpas, imèl, kalandriye, kamera, navigatè,
   aparèy, mesaj, telechaje, eskane, bloke, konekte — never
   half-French hybrids; tap/press is **peze** ("Peze bouton an").
   (c) Where a living Kreyòl word exists, it wins over both the loan
   and any coinage: èd not "sipò", modèl not "tanplat", kaye not
   "rejis", efase not "delete". The test is always "which word would
   the neighbor text you".
9. **Punctuation and numbers.** Sentences end in a period, questions
   in ?, exclamations in ! — sparingly. **None of French's spaced
   punctuation**: no space before : ; ! ?, no guillemets — quotes
   are curly “ ” with nested ‘ ’, ellipsis the single-char …, em
   dash " — " spaced, as en/es. Headings, buttons, and chips take no
   terminal punctuation. Digits are Western ASCII; formatted numbers
   and dates flow through `Intl` (rendering section — no pin
   needed); clock times only via `Intl`, durations always with
   context ("3 èdtan èd").
10. **Length is a mild layout risk.** Kreyòl runs ~10–25% longer
    than en (analytic constructions add small words), but the words
    themselves are short and wrap well. The tight surfaces are
    known: the bottom nav and the 3-up board pill row at 375px. The
    nav set is decided short up front — **Tablo, Kalandriye, Souf,
    Mesaj, Sa m ap okipe, Pwofil** — and the pill row is **Bezwen /
    Gen èd / Pwojè**. Overflows wrap, never truncate mid-word.
11. **"Understoria" is never translated** or respelled; same for
    file names, env vars, and `docs/…` paths quoted in strings.
    Interpolation placeholders `{{count}}`, `{{name}}`, `{{hours}}`…
    stay byte-for-byte identical (the parity test enforces this).
12. **Plurals — identical pairs, both interpolating.** The rendering
    section records the measured fact: plural-category selection for
    ht is NONDETERMINISTIC across members' devices, so ht ships
    `_one`/`_other` pairs with IDENTICAL strings, every form
    carrying `{{count}}` and reading correctly at ANY count. This is
    also simply correct Kreyòl: nouns don't inflect for number —
    plural is the optional postposed yo, and yo marks DEFINITE
    plurals only, so after a numeral the noun stays bare ("{{count}}
    manm", never "{{count}} manm yo"). **No hard-coded "1", "yon",
    or "youn" in any plural key**; never delete a `_one` key (the
    parity test will fail the file), and the single-integer-category
    relaxation does NOT apply — both keys complete, identical,
    count-safe.
13. **US references generalize; Haitian color stays neutral.** As
    every sibling did: US-specific institutions become their plain
    function. Haitian local color is welcome in authored teaching
    prose where natural and neutral — lakou, mache, lekòl, a tap-tap
    in a transport example — never Port-au-Prince specifics as if
    universal; every image must still land in Montreal or Santo
    Domingo.

## Script, typography and rendering

Findings measured for this glossary (the ht Intl spike, run today —
recorded here the way bn.md records its digit wrinkle):

- **ICU/CLDR has NO ht data — plural selection is nondeterministic.**
  `Intl.PluralRules("ht")` does not error: it silently resolves to
  the BROWSER'S DEFAULT locale. On an English-configured device ht
  gets en rules (one = exactly 1); on a French-configured one, fr
  rules (one covers 0 AND 1); other defaults, other rules. The same
  key can select different categories on two members' phones.
  BINDING CONSEQUENCE (rule 12): ht ships `_one`/`_other` pairs with
  IDENTICAL strings, every form interpolating `{{count}}` and
  reading correctly at any count — which costs Kreyòl nothing, since
  Kreyòl nouns don't inflect for number anyway. No wiring fix exists
  or is needed; the strings absorb the nondeterminism.
- **`Intl.NumberFormat("ht")` / `DateTimeFormat` fall back the same
  way** — to the browser default's conventions. Digits come out latn
  everywhere regardless, so no numbering-system pin is needed
  (unlike bn's `-u-nu-latn`); date order simply follows the member's
  device convention — honest and harmless; no wiring action.
- **Latin script — no rendering spike, no CSS.** The shared Inter
  stack covers Kreyòl fully, including è (U+00E8) and ò (U+00F2). No
  `:lang(ht)` font block, no line-height floor, no webfont.
- **Unicode hygiene — NFC.** è and ò are the precomposed code points
  (NFC), never e/o + combining grave (U+0300); normalize before any
  grep. No directional controls, ZWSP, ZWNJ, or ZWJ anywhere in
  locale files (the repo's i18n gates reject them).

## Term table

| English | Kreyòl | Notes / DON'T use |
|---|---|---|
| vouch for (verb) | reponn pou | Argued hard. Kitchen reality: "Mwen konnen l — m ap reponn pou li" is lived speech for putting your own word behind a person. The construction ALWAYS carries pou + person; bare reponn stays free for message replies (a real collision, fenced both ways). Button: "Reponn pou manm sa a". DON'T: **garanti / bay garanti** (loan cosigning — rule 4), **kosiyen** (the diaspora loan-office word), kore (general backing — too weak/loose), rekòmande (CV register), vouche (not a word). |
| a vouch (the signed act) | pawòl ou bay (siyen) | "Pawòl ou bay la siyen ak kle ou", "li pran pawòl de manm konfyans". Pawòl is the weight-bearing word ("pawòl granmoun"). |
| vouches (count on trust chips) | {{count}} moun reponn pou li | One vouch = one distinct person, so count people: "Moun konfyans ({{count}} moun reponn pou li)", "{{have}}/{{need}} moun reponn pou ou". Both plural keys identical, both with {{count}} (rule 12). |
| trust / trusted member | konfyans / moun konfyans | Chip: "Moun konfyans" — "se moun konfyans mwen" is exactly the lived phrase. New member chip: "Fèk vini" (just arrived — warm, no probation flavor). Web of trust: "rezo konfyans lan"; prose may say the bonds are makonnen (braided together). DON'T: verifye (ID-check officialese), fyab (spec-sheet word), sètifye. |
| seed balance | semans kòmansman | es keeps the metaphor ("semilla inicial") and so do we — Haiti plants: "èdtan ou yo egal semans kòmansman ou toujou". Chip: "Semans: {{hours}}"; seed credits = èdtan semans. Plain in teaching prose: "tout moun kòmanse ak 5 èdtan". DON'T: **sòl / sòld** (rule 5 — the credit club and the wages word), balans (recharge register), kapital, depo (bank). |
| hours (the currency) | èdtan | "Yon èdtan nan nenpòt èd vo yon èdtan." Always with èd context (rule 9). Credit moves → "èdtan yo pase" / "èdtan yo ekri nan kaye a" — plain motion, no banking verb. DON'T: **kredi** (boutik credit — rule 4), pwen (loyalty), lè (clock time — "3 è" is three o'clock, never a duration). |
| balance (the member's) | èdtan ou yo | "Your balance is hours of help" → "Èdtan ou yo — se èd yo konte, se pa lajan." DON'T: balans (rule 4 — "tcheke balans ou" is the phone-credit reflex), kont as the figure (kont = the account itself, reserved). |
| node | node (kept Latin) | Tier (a), rule 8 — no living Kreyòl word exists, the French nœud can't be respelled without collapse, and tech speech keeps "node". Teaching gloss on first use: "node (sèvè pataje kominote a ap fè mache pou tèt li)". RESERVED: node means the server and nothing else; sèvè alone only where en itself says just "server". DON'T: ne (the respelled nœud — unreadable), sant (a center — HQ flavor). |
| community node / peer nodes | node kominote a / node zanmi yo | Zanmi is the trusted-friend word — exactly federated friendship (id "node sahabat", bn "বন্ধু নোড"). DON'T: node patnè (rule 6 — NGO partner), node asosye (business). |
| federation | kominote zanmi yo | Prefer the rephrasing in prose: "Across the federation" → "nan tout kominote zanmi yo". DON'T: federasyon (sports/politics), alyans (political-military), konfederasyon. |
| exchange | echanj | "Echanj lan konfime", "yon echanj èd". DON'T: tranzaksyon (bank), komès (commerce), boukante/boukantay (swap-of-goods, haggling flavor — the barter trap fil dodged), afè (business dealings). |
| the commons (section) | byen tout moun | Kitchen-plain held-in-common: "Sa se pou tout kominote a — byen tout moun." Section: "Byen tout moun"; one item: "yon byen tout moun". DON'T: **komin** (Haiti's municipal unit — total collision), pwopriyete (deeds and land papers), byen leta (state property), resous (NGO assets). |
| tended (commons status) | Nan bon men | The lived in-good-hands idiom: chip "Nan bon men"; prose: "kominote a ap pran swen l". DON'T: antretyen (building/IT maintenance), jere (managed — administrative), okipe bare as a chip (reads as an imperative). |
| retired (commons status) | Ap poze | Deliberate non-literal, mirrors id "sedang beristirahat" / bn "বিশ্রামে": "kite l poze yon ti tan" — poze is the living rest-easy word, no finality, it can come back. DON'T: retrete (pensioner), elimine / jete (scrapped — shame), fèmen (shut — final). |
| In my care (nav) | Sa m ap okipe | Okipe is tending a person ("m ap okipe manman m") — care, not tasks; prose: "w ap jwenn li nan ‘Sa m ap okipe’". Wraps if needed (rule 10). DON'T: Travay mwen (flattens care to jobs), Responsablite m (burden-officialese), Nan men m (too vague for nav). |
| Grow another root (add-a-server flow) | Fè yon lòt rasin pouse | Pouse is the living sprout-and-grow verb ("plant lan ap pouse"); prose: "pou kominote a pran rasin plizyè kote". Mirrors es "Hacer crecer otra raíz". DON'T: Ajoute yon sèvè, Enstale yon lòt nòd (both flatten the metaphor to IT). |
| timebank | bank tan | The transparent calque, as fr "banque de temps" / id "bank waktu" — both halves everyday Kreyòl. Keep the SURROUNDING prose non-bank: "nan yon bank tan, mande èd pa janm fèmen". DON'T: kès tan (rule 4 — the cash box), labank flavor in prose, sòl tan (never — rule 5). |
| mutual aid | youn ede lòt | The lived reciprocal (rule 6): "èdtan youn ede lòt", "vwazen yo la youn pou lòt"; teaching prose carries "Men anpil, chay pa lou." DON'T: antre-èd / èd mityèl (French calques), lacharite (rule 6 — begging shame), **èd imanitè / asistans / sekou** (aid-industry register — rule 6), solidarite as reflex filler (keep it rare and real). |
| board | Tablo | Nav: "Tablo"; first-use gloss: "tablo afichaj kominote a — kote bezwen ak èd yo afiche" (the corkboard every lekòl and mache wall has). DON'T: babiyar, fowòm, mi (FB wall calque), paj akèy. |
| post (noun / verb) | afich / afiche | The paper-notice family: "Afiche bezwen ou sou tablo a", "yon afich sou tablo a". "Poste" acceptable in technical sync prose only. DON'T: piblikasyon (press register), anons (advertisement), avi (official notice). |
| dashboard | Souf | The community's vitals, joining the sibling pulse family (Denyut, Mdundo, Pintig, Пульс, نبض, স্পন্দন) through BREATH rather than beat — argued: the literal heartbeat, "batman kè", leads with a caped superhero at nav-label size for every diaspora reader (exactly the comic failure the family forbids), and the pulse loan "pou" collides fatally with pou (for) and pou (louse). Kreyòl's own vital-sign idiom is breath — pran souf, gen souf, souf lavi — so nav "Souf", title "Souf kominote a": while the community has souf, it is alive. The sw precedent (Mdundo forking from mapigo on collision) sanctions the fork. DON'T: batman kè (comic at label size), pou (double collision), dashbòd, rezime (report-speak). |
| needs (tab) / asks | Bezwen / mande èd | Pill: "Bezwen" — the everyday word ("sa w bezwen?"); asking in prose is "mande èd", unashamed: "Mande — se konsa vwazen viv." (rule 4 — no wont framing, even negated). DON'T: demand (market economics), reklamasyon (complaint desk), mank (lack — shame-laden). |
| offers (tab) | Gen èd | "There's help here" — the sw "Msaada upo" move: pill "Gen èd"; prose "sa moun ka bay", "di sa ou ka fè pou lòt moun". DON'T: òf (a commercial bid), pwomosyon (rule 3), sèvis (what a company sells — help between members is èd), ofrann (church offering — confessional register). |
| claim (a post/task) | pran | "Pran travay sa a"; claimed state gets the lived care idiom: "Se {{name}} k ap okipe l". DON'T: reklame (legal claim/complaint — the exact trap), rezève (booking), pran posesyon (land-papers register), aksepte (approval flavor). |
| project | pwojè | The everyday school-and-lakou word; the NGO stench lives in the words AROUND it, all banned (rule 6), so pwojè stays clean — the call fil made for proyekto. Pill: "Pwojè". DON'T: **pwogram** (the NGO/government scheme — rule 6), inisyativ (grant-speak). |
| task | travay | "yon ti travay" — ti keeps it human-sized. DON'T: **tach** (in Kreyòl a tach is a stain — fatal collision), misyon (gamified), djòb (wage flavor), devwa (homework/duty — burden register). |
| template | modèl | "Pran modèl sou li" is the lived idiom itself: "Kòmanse ak yon modèl", "modèl yo se yon kòmansman, se pa yon lòd". DON'T: tanplat (not a word), fòm / fòmilè (the government-window word), egzanp (weaker than the feature). |
| work day | konbit | THE word, used concretely (rule 6): "Konbit — {{project}}", "Òganize yon konbit pou pwojè a". DON'T: jounen travay (HR working day), jounen volontè (rule 6), konbit sprinkled on anything that isn't gathered hands. |
| shift | tou | The everyday turn word ("se tou pa m"): "Tou maten an", "Ou nan tou sa a". RESERVED: tou as a noun only ever means a shift (the adverb tou "also" is grammar and stays free); the rota is "fè tou pa yo". DON'T: chif (not a word), faksyon (guard duty), orè as the slot itself (orè is the schedule). |
| sign-up (for a shift) | mete non w | The paper sign-up-sheet idiom: "Mete non w pou tou sa a", "Retire non w". Keep this family for shifts ONLY (see RSVP). DON'T: enskri / enskripsyon (the government-counter register), anrejistre for joining (anrejistre is reserved for saving), siyen (reserved for cryptographic signing). |
| rota (care rota) | youn apre lòt | "Vwazen yo ap okipe l youn apre lòt, chak moun fè tou pa yo." A rota slot: "kounye a se tou pa ou". DON'T: woulman (factory rotation), lis gad (guard-duty flavor). |
| RSVP | di si w ap vini | Heading: "Fè yo konnen si w ap vini"; statuses "M ap vini / Petèt / M p ap vini"; "Sa ou di: {{status}}". The family ALWAYS carries vini — bare reponn stays free for messages, reponn pou is vouching (both fenced). DON'T: keep "RSVP" (opaque), konfime prezans (wedding-card officialese), mete non w (collides with shifts). |
| proposal | pwopozisyon | Page: "Pwopozisyon"; "yon pwopozisyon pou kominote a". RESERVED: bare pwopozisyon only ever means a governance proposal (an offer of help is never pwopozisyon — see offers). DON'T: rezolisyon (assembly minutes), pwojè lwa (legislature). |
| affirm (a proposal) | dakò | Button "Mwen dakò"; count: "{{count}} moun dakò" — dakò is the lived hands-raised consensus word, not admin approval. Holding a proposal: "Kenbe l yon ti tan" — keeps bloke reserved for contacts. DON'T: apwouve (approval from above), vote wi (parliamentary), like. |
| block (a contact) | bloke | The universal app word (WhatsApp Kreyòl speech uses it): "Bloke kontak sa a", "Debloke". RESERVED for contacts; a proposal is kenbe (previous row). DON'T: entèdi (an official ban), bare (a roadblock). |
| flag (an exchange/comment) | mete sa devan kominote a | The community-review framing with no informer register: "Gen yon bagay ki pa mache? Mete sa devan kominote a — tout moun ap gade l ansanm"; chip: "Kominote a ap gade l". DON'T: **denonse** (the informer word — it carries the Duvalier-era weight of neighbors reported to the Makout; never), **rapòte** (report-to-authority — there is no authority here), plent (formal complaint), akize (accusation). |
| dispute | dezakò | Page: "Dezakò" — the everyday falling-out word, no courtroom in it; status: "Kominote a ap gade sa ansanm". DON'T: pwosè (a court case), litij (legal register), kont (a quarrel — AND the reserved account word; doubly out), diskisyon (an argument — heat without process). |
| removal / reinstatement | retire nan kominote a / tounen | Heavy and honest, no shame theater: "retire yon manm nan kominote a"; return: "{{name}} tounen — kominote a resevwa l ankò". DON'T: mete deyò (throwing out — eviction register), chase (chasing off), ekskominye (church register), bani (forum-mod register). |
| member | manm | The everyday word — manm fanmi, manm legliz, manm gwoup la. DON'T: itilizatè (user — rule 3), kliyan, abòne (telco subscriber), sitwayen (state address). |
| neighbor | vwazen / vwazinaj | "vwazen ou yo"; collective warmth: "tout vwazinaj la" — and lakou in teaching prose ("moun lakou a"). DON'T: rezidan (building-admin register), popilasyon (census/NGO register). |
| community | kominote | The everyday warm word. DON'T: **komin** (the municipality — total collision), **gwoupman** (the NGO-organized peasant unit — gwoupman peyizan; rule 6), asosyasyon (a formal org), sosyete (society-at-large — and the secret-society shadow), gwoup (chat group). |
| invite (noun + verb) | envitasyon / envite | The party word, warm and lived: "Envite yon moun ou konnen", "moun ki te envite w la". One family, greppable. DON'T: konvoke (a summons), referans (growth-hacking), invit-anything half-French. |
| guardian (shard holder) | moun k ap sere kle w | RESERVED PHRASE: sere is the safekeeping verb ("sere l pou mwen" is lived speech for entrusting something precious), and the family only ever means recovery-shard holders. Title: "Moun k ap sere kle w yo"; gloss on first use: "chak moun sere yon moso nan kle ou — ase nan yo ansanm ka fè ou tounen". The school-form trap is live in the diaspora: Kreyòl forms say "paran oswa gadyen" — so **gadyen is banned** (legal guardian AND the goalkeeper). DON'T: gadyen, responsab (officialese), gadò (herding/babysitting flavor), gad (a guard). |
| recovery kit | kit pou tounen | The promise is return, not backup: "kit pou tounen an (yon kopi ki ka fè kont ou tounen si ou pèdi tout aparèy ou yo)". The warm recovery verb family is tounen / fè tounen: "Fè kont ou tounen". A shard: "yon moso nan kle ou". DON'T: kit rekiperasyon (French officialese — rule 3), twous premye swen flavor (first aid), backup file bare (flattens the promise). |
| password / passphrase | modpas / passphrase (kept Latin) | Modpas is the established everyday word. Passphrase stays Latin, tier (a): it guards the most dangerous flow in the app and must match what members have actually seen; gloss on first use: "passphrase (yon modpas long ki fèt ak plizyè mo)". DON'T: mo sekrè (coinage), modpas as a synonym for PIN (a PIN is a PIN). |
| passkey | passkey (kept Latin) | Members' phones run in French or English — never Kreyòl — so the OS sheet mid-flow will say "passkey" or "clé d'accès"; the term must match the platform reality (the fil/bn argument, adapted). Gloss on first use: "passkey — telefòn ou ka rele l ‘clé d'accès’; ouvri ak anprent, figi, oswa PIN aparèy la". DON'T: kle aksè (a coinage that matches NEITHER platform string), kle sekrè (blurs into key vocabulary in a security flow). |
| ledger | kaye tout kominote a | The shared school copybook, kitchen-plain and warm: "li ekri nan kaye tout kominote a". Device-local (en's parenthetical): "kaye pa aparèy sa a". DON'T: **kanè** (rule 4 — the passbook and the shop-credit book, the register this app exists to refuse), liv kont (account book), rejis (the registry office), lejè. |
| milestone | yon gwo pa | "Kominote a fè yon gwo pa" — a step taken together, the journey framing. DON'T: bòn (the land-survey boundary stone — property-dispute flavor, fil's muhon exactly), objektif (KPI), etap bare (just a step). |
| skills | sa ou konn fè | Headings keep the kitchen framing: "Ki sa ou konn fè?"; compact field label: "Sa ou konn fè". Konn fè is lived competence. DON'T: konpetans (CV register), kalifikasyon (HR), fòmasyon flavor (training-institute — NGO-adjacent), metye as the field (a metye is one trade; skills are wider). |
| helper (person in an exchange) | moun ki ede a | "Èdtan yo ale jwenn moun ki ede a"; compact field: "Moun ki ede". The traps are real: **bòn is banned** (domestic servant — the id pembantu trap exactly), moun kay likewise (household-servant register — and the restavèk shadow behind it makes any servant word radioactive here), **volontè banned** (rule 6). DON'T: bòn, moun kay, volontè, asistan (aide-to-a-boss). |
| panic (the emergency wipe) | bouton danje | Danje is the plain word ("danje sou ou"): gloss on first use: "si danje rive sou ou: efase tout bagay sou aparèy sa a kounye a". The Emergency section itself is "Ijans" — RESERVED for that section. DON'T: panik (the clinical state), SOS mòd, ijans for the button (reserved). |
| soft purge / hard purge | efase yon pati (kache idantite w) / efase nèt (efase tout bagay) | One efase family, kitchen-plain (efase tablo a), honest about the difference: yon pati strips identifying text and keeps the signed kaye; nèt wipes keys and rotates identity — nèt is the perfect total word ("efase l nèt"). DON'T: purge kept English, delete mixed into the family (one family only), reyinisyalizasyon (factory-reset officialese). |
| read aloud (feature) | Li fò pou ou | What a family member does for someone who can't read the screen — exactly the promise: toggle "Li fò pou ou", prose "aplikasyon an ap li chak bouton fò pou ou, ak vwa ki nan telefòn ou an". DON'T: tèks-an-pawòl (spec, not promise), sentèz vokal (French tech officialese). |
| seed vault | rezèv semans | Fè rezèv is exactly the lived before-the-storm stocking-up idiom, and fr's "réserve de semences" confirms the family: "Aparèy sa a se yon rezèv semans — li sere tout istwa kominote a." DON'T: kòfrefò (bank vault), depo (commercial warehouse), backup sèvè (flattens the metaphor). |
| storm hub | kote pou pare lapli | Pare lapli is the lived shelter-through-the-downpour idiom — the very phrase lexicalized inside parapli, the umbrella — so teaching prose may say "tankou yon parapli pou kominote a": gloss "kote pou pare lapli — gen kouran ak Wi-Fi lè tout lòt bagay nan fènwa". Refuge THROUGH the storm, the ঝড়ের দিনের ঠাঁই move. DON'T: **abri** (the tarp-and-camp displacement register of 2010 — Haiti's আশ্রয়কেন্দ্র exactly), **kan** (the tent camps — never), sant ebèjman (evacuation officialese), refij (a syllable from refijye — migration trauma), **je siklòn / sant siklòn** (the storm's own eye — the trap every sibling dodged). |
| One small thing | Yon ti bagay | Button: "Montre m yon ti bagay" — ti is Kreyòl's built-in disarming diminutive. The why-copy: "chwazi konsa konsa nan sa ki louvri — pa gen klasman, pa gen dosye sou ou". Don't inflate. |
| Ways to plug in | Fason pou mete men | Mete men is Kreyòl's own pitch-in idiom ("annou mete men"); prose may carry "Men anpil, chay pa lou." DON'T: patisipasyon (seminar-speak), kontribye (open-source flavor), "vin jwenn nou" (recruiting page AND a corporate nou — rule 2). |
| celebrate / gathering (social) | fete / Fèt · chita pale | Category "Fèt"; "Annou fete!" — fèt culture keeps it warm. The social category ("get-togethers and good company") leans on **chita pale** — the lived sitting-and-talking institution: "vin chita pale ak nou". DON'T: seremoni (officialdom), aktivite (NGO calendar), gala. |
| gleaning (template corpus) | ranmase rekòt ki rete | Always carries rekòt/jaden — "ranmase sa ki rete nan jaden apre rekòt la"; bare ranmase slides toward waste-picking ("ranmase fatra") shame register. DON'T: ranmase bare, fatra flavor anywhere near it. |
| organizer / operator | moun k ap òganize a / moun k ap fè sèvè a mache | The organizer stays a person, not a title: "moun k ap òganize pwojè a"; the operator: "moun k ap fè sèvè a mache pou kominote a — pouvwa l klè, limit li klè" (compact label: "operatè node la"). DON'T: **admin / administratè** (contradicts the no-admins framing), **chèf** (never — "pa gen chèf isit la"), komite (Haitian committee-politics flavor), direktè. |
| founder / co-founder | manm fondatè / ko-fondatè | "manm fondatè kominote a". DON'T: mèt (owner/master — mèt kay register), prezidan (club officialdom). |
| display name | non ou vle yo rele w la | Label: "Non ou (pa bezwen non tout bon — yon non jwèt ka fè l)" — everyone in Haiti has a ti non or non jwèt; the field welcomes that. DON'T: non itilizatè (username), non konplè (the ID-card field), ti non as the LABEL (reads as asking for the childhood pet name specifically). |
| owed help | ap tann ou konfime | Badge: "Ap tann konfimasyon"; "{{hours}} èdtan ap tann ou konfime". Deliberately NOT dèt/dwe — the app refuses debt framing (rule 4), and dwe never touches èdtan. |

## Known hard strings

- **In my care** (`nav.myWork`, `myWork.title`) → "Sa m ap okipe" —
  okipe keeps the tending-a-person warmth in the nav pill.
- **Grow another root** (`growRoot.title`, `dashboard.resilience.cta`)
  → "Fè yon lòt rasin pouse" — pouse keeps the metaphor botanically
  alive instead of flattening it to server administration.
- **Dashboard** (`nav.dashboard`, `dashboard.title`) → "Souf" / "Souf
  kominote a" — ht joins the sibling pulse family through breath,
  because the literal heartbeat ("batman kè") is a superhero at
  label size and the pulse loan collides with pou (term table).
- **The unit of progress is us, not me** (`dashboard.tagline`) →
  "Pwogrè a pa mezire ak ‘mwen’ — li mezire ak ‘nou tout’." — nou
  tout does the inclusive work bare nou can't (rule 2; curly singles
  per rule 9).
- **You start with credit** (`welcome.screens.credit.title`, body) →
  "Ou kòmanse ak èdtan nan men ou" — credit becomes hours everywhere
  (rule 4); the body keeps "Tout moun kòmanse ak 5 èdtan."
- **One hour of help = one hour of credit** (`postForm.fieldHoursHint`,
  `hints.balance.message`, `direct.form.hoursHint`) → "Yon èdtan èd
  se yon èdtan, kèlkeswa travay la." — the equation never grows a
  money word.
- **Credits have flowed between you** (`toast.exchangeConfirmedComplete`,
  `postDetail.actionsCompleted`) → "Konfime. Èdtan yo ekri nan kaye
  a pou nou toude." — plain book-entry motion, and nou toude is the
  genuine plural you rule 2 permits.
- **{{hours}} waiting on your confirmation**
  (`profile.balance.awaitingYouLine`) → "{{hours}} ap tann ou
  konfime" — the owed-help family, never dwe or dèt. (Erratum from
  the fleet's code check: this key and `pendingLine` receive a
  PRE-FORMATTED value — formatSignedHours() emits "+2h" — so the
  string appends no unit; only keys receiving bare numbers carry
  "èdtan".)
- **A new understoria** (`dashboard.categoryBreakdown.emptyTitle`) —
  the brand pun can't transliterate; render the understory image:
  "Yon bagay nèf ap pouse" — and "Understoria" itself never appears
  respelled (rule 11).
- **Tended commons** (`projects.statusTended`, `projects.momentum.tended`)
  → chip "Nan bon men" — the in-good-hands idiom.
- **storm hub** (`infra.drills.stormHub.title`, `print.kit.setup.body`)
  → "kote pou pare lapli" (drill: "Egzèsis kote pou pare lapli a") —
  refuge THROUGH the storm; never abri, never kan, never je siklòn.
- **Resilience tiers** (`dashboard.resilience.tier.*`) — Seedling /
  Taking root / Sturdy / Deep-rooted → "Ti plant / L ap pran rasin /
  Byen chita / Rasin fon" — one botanical family with the growRoot
  strings; byen chita is the lived steadiness idiom.
- **vouch** (`member.vouchButton`, `trust.trustedWithCount*`) → the
  "reponn pou" family — answering for someone with your own word,
  kept clean because garanti, kosiyen, and every money word around
  it are banned file-wide.
- **guardians** (`guardians.title`, `guardians.intro`) → "Moun k ap
  sere kle w yo" — sere is the safekeeping verb; gadyen (the school
  form AND the goalkeeper) is banned twice over.

## Open question for the wiring step — the fallback chain

Every locale so far falls back uniformly to en. For ht there is a
real case for **ht → fr → en** instead: Haitian members are far
likelier to read French than English (school French; many devices
already fr-configured), so a transiently missing key surfaces as
readable fr rather than opaque en — and fr is a mature, complete
locale. Against: fr's register is exactly what this glossary bans, so
a fallback string is a REGISTER break, not just another language; the
US/Bahamas diaspora may read en more easily; and parity gates keep ht
complete, so the chain rarely fires. On balance this file recommends
**ht → fr → en** — when the chain does fire, comprehension beats
register purity — but it is a product call, not a translation one:
**the user decides at wiring time.**

## Quick self-check for translators

- Would a neighbor text you this string? If it reads like a bank SMS,
  an NGO leaflet, or French officialese in Kreyòl spelling, redo it
  (rules 3, 6).
- `grep` for nou as the app's own voice — zero hits outside the
  translation-honesty note; inclusive we is annou / nou tout, and
  genuine plural you is rephrased or nou toude (rule 2).
- `grep` for dèt, prete, prè, kredi, ranbouse, vèsman, enterè, ponya,
  kanè, kès, balans, mikwokredi — zero hits outside the explicit
  debt-rejection lines, where the ONE sanctioned formula is "Mande èd
  se pa yon dèt — ou pa prete anyen nan men pèsonn." and the gift
  line is "Se yon kado — se pa yon prè." (rule 4). Owed help is "ap
  tann ou konfime"; dwe never touches èdtan. No wont framing around
  asking, even negated.
- `grep` for sòl, sabotay, sòld — zero hits, anywhere, ever (rule 5).
- `grep` for benefisyè, pwogram, sansibilizasyon, patnè, bayè,
  finansman, ONG, èd imanitè, asistans, sekou, distribisyon, volontè,
  lacharite — zero hits (rule 6). konbit hits only on the work-day
  feature and concrete collective-labor prose.
- `grep` for itilizatè, kliyan, abòne, pwomosyon, bonis, kachbak —
  zero hits; members are manm (rule 3). tanpri only where en itself
  pleads; "tanpri souple" — zero hits.
- Reserved words hold: node only ever the server; kont only ever the
  account; pwopozisyon only ever governance; bloke only ever
  contacts (a proposal is kenbe); tou-the-noun and mete non w only
  ever shifts (RSVP carries vini); reponn pou only ever vouching
  (bare reponn is replies); sere-kle phrases only ever shard holders
  (gadyen — zero hits); Ijans only ever the Emergency section. abri,
  kan, refij, je siklòn, sant siklòn — zero hits (the refuge is
  "kote pou pare lapli"). denonse and rapòte — zero hits (flagging
  is "mete sa devan kominote a"). bòn, moun kay, tach, komin,
  gwoupman — zero hits.
- Orthography: IPN one-sound-one-symbol, no French spellings; no
  apostrophes — m, w, l, n, y free-standing ("m ap", "kle w"); one
  spelling per word (èdtan, youn, kounye a); è/ò precomposed NFC,
  never combining marks; no invisible characters (rule 7 + rendering
  section).
- `{{…}}` placeholders identical to en; every `_one` key present,
  IDENTICAL to its `_other`, both carrying `{{count}}` and reading
  correctly at any count — plural selection for ht is device-
  dependent (rendering section; rule 12). No noun after a numeral
  takes yo; no hard-coded "1"/"yon"/"youn" in plural keys.
- Quotes curly “ ” (nested ‘ ’); ellipsis the single-char …; em dash
  spaced; NO space before : ; ! ? (that is fr's rule, not ht's);
  buttons and chips no terminal punctuation; digits Western (rules
  8–9); nav and pill labels wrap rather than truncate (rule 10).
  "Understoria" untouched — never respelled.
- **This file's choices are a first draft pending native review** —
  the review updates this glossary first, then the strings; the ban
  rows are load-bearing regardless, and any replacement term must
  still avoid them.
