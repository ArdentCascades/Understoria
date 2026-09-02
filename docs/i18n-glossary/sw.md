# Swahili (sw) translation glossary

Reference for every bulk-translation and review pass over `sw.json` and
the Swahili content modules. Decisions here get applied ~2,900 times —
when in doubt, pick the word a Swahili-speaking neighbor would say
across a kitchen table, not the word a bank SMS, a government tangazo,
or an NGO workshop banner would use.

**Locale code is `sw`** (language-only): browsers send `sw`, `sw-TZ`,
`sw-KE`, and i18next's language-only fallback resolves them all. One
`sw` must serve Tanzania, Kenya, eastern DRC, Uganda, and the diaspora:
the base is East African standard Swahili — the shared written middle
every region reads — never Sheng, never Nairobi- or Dar-only slang,
never Congo regionalisms. Historical note, kept so nobody trips over
old diffs: until this language shipped, the test suite used `"sw"` as
its unknown-locale probe precisely because Swahili wasn't registered;
those probes moved to `"xx"` (see `languages.test.ts`).

## Global register decisions

1. **The member is wewe / the u- subject forms, uniformly.** Swahili
   has no T-V split: respect lives in titles (mzee, bibi, mwalimu)
   and tone, never in pronoun choice — and the app must not guess
   titles (guessing wrong is far ruder than plain wewe). The big sw
   products settled the convention: WhatsApp sw and M-Pesa's sw
   surfaces address one person with singular u- forms ("Umepokea…",
   "Andika ujumbe wako"), and that reads normal to every age. So:
   u-/-ako throughout ("wasifu wako", "saa zako"), bare wewe only for
   emphasis. Plural m- forms (mko, mnaweza, -enu) are grammar, not
   politeness — used ONLY where en genuinely addresses several people
   at once, never as deference to one. Warmth comes from the karibu/
   pole/asante words and the softening particles (tu, basi). Bare
   imperatives are normal sw UI ("Tuma", "Hifadhi") — don't pad them.
2. **First person — who is speaking.** (a) When the MEMBER speaks
   (buttons, "my" labels): ni-/-angu ("Ongeza kwenye kalenda yangu",
   "Nionyeshe kitu kimoja kidogo tu"). (b) When the APP speaks, prefer
   no subject at all — Swahili's class-agreement passives and statives
   are the native idiom ("Imehifadhiwa.", "Itatumwa mtandao ukirudi.")
   — or name the real actor: programu, node, jumuiya ("Programu
   itakusomea kwa sauti"). (c) **The corporate sisi/tu- voice is
   banned**: "tunakuomba", "tunasikitika kwa usumbufu", "tumepokea
   ombi lako" are the NGO circular and the telco apology, and there is
   no company behind this app. It survives only where en itself
   unmistakably speaks as the people who made the software (the
   translation-honesty note). (d) "We" that includes the member is
   the inclusive framing — sisi sote, wote pamoja ("tusherehekee
   pamoja") — used only where en genuinely means everyone. Third
   persons: yeye, mwanajumuiya huyu, or repeat the name.
3. **Warm everyday Swahili over officialese and service-speak.**
   Banned outright: **tafadhali** as reflexive padding (it is the
   opener of every bank SMS and ministry tangazo; most requests read
   better bare, softened with tu or basi — where en itself says
   "please", restructure rather than reach for tafadhali);
   "unaombwa" / "unatakiwa" (you are required — directive register);
   "kwa heshima na taadhima"; **huduma** for help between members
   (huduma is what a company sells — huduma kwa wateja; help here is
   msaada, and helping each other is kusaidiana — mirror the id
   layanan / vi dịch vụ bans); **mteja** (customer — the M-Pesa
   register; nobody here is a customer); **mtumiaji** (user — members
   are mwanajumuiya, or jirani); "ombi la ruhusa" bureaucratese
   (permission flows say plainly what's needed: "Programu inahitaji
   kamera ili kusoma msimbo QR"). NGO-project vocabulary: **wafadhili
   / ufadhili / mfadhili** (donors, sponsorship — mutual aid has no
   funders), **wadau** (stakeholders), **warsha** (workshop),
   **tathmini ya mahitaji** flavor, and **kujitolea in ALL its
   forms** — decided after real hesitation: the verb can mean
   selfless stepping-up, but East African usage has been captured by
   the volunteer-as-institution frame (kazi ya kujitolea, wajitoleaji
   wa NGO), which implies normal help is paid work; stepping forward
   is **kujitokeza** ("waliojitokeza"). Msamaria-mwema charity
   register banned too (hisani, sadaka — help here flows between
   equals, never downhill). **Mradi is kept** for "project": it is
   the everyday word (mradi wa maji wa kijiji), and the donor stench
   lives in the words AROUND it — all banned — so mradi stays clean.
4. **No-debt, no-money framing.** Credits are HOURS — saa, always.
   Banned for exchanges: **deni** (debt), kudai (to demand a debt —
   also why "claim" is never kudai), **mkopo** (loan), **riba**
   (interest), **malipo / kulipa** (payment/paying), bei (price),
   gharama (cost) as framing for help, ada (fees), and pesa-framing
   generally ("saa ni kama pesa" is exactly the wrong sentence).
   **Muamala is banned** (transaction — the M-Pesa word), **salio**
   too (balance — the airtime word; the seed balance is mbegu, rule
   below). Debt words may appear ONLY where en itself explicitly
   rejects debt framing ("asking is not debt" → "kuomba msaada si
   deni, si mkopo"). Owed help is "inasubiri uthibitisho wako" (see
   term table). Credited → "saa zimehamia" / "saa zimeandikwa".
5. **Harambee and the communal-labor lexicon — decided one by one.**
   **Harambee** is THE East African pulling-together word, and that
   is exactly why it cannot be a feature name here: in Kenya a
   harambee IS a fundraiser — the contribution envelope, the
   politician's podium, cash counted aloud. A no-money timebank
   wearing that word invites members to reach for their wallets, the
   one thing this app never asks. So: harambee appears ONLY in
   teaching prose, as a nod to the pulling-together spirit itself
   ("roho ile ile ya kuvuta pamoja — bila mchango wa pesa"), never as
   a feature name and never near hours or exchanges. The neighbors:
   **ujamaa — banned** (Nyerere-era state policy and villagization
   history — too political to borrow); **mchango — banned** for help
   and hours (a mchango is the money contribution passed at a
   harambee or msiba; taking part is kushiriki, supporting is kuunga
   mkono); **kibarua — banned** for tasks (day-wage labor — a task is
   kazi, done in care, not for hire); **ushirika — caution** (a
   registered cooperative/SACCO legal form, like id's koperasi —
   never the community noun; the verb kushirikiana is free and warm);
   **kusaidiana** is the plain mutual-help reciprocal and carries the
   whole app; **zamu** is the everyday turn word and takes the rota
   family ("zamu yako imefika"); **mgao — banned** (mgao wa umeme
   power-rationing scarcity register; a key shard is kipande).
6. **Loanword policy — three tiers, following sw app convention.**
   (a) Proper nouns, codes, and technical literals stay verbatim:
   Understoria, QR (as "msimbo QR" — decided over "QR-kodi"), Wi-Fi,
   URL, PIN, email addresses, file paths, env vars, .ics — plus
   **node** and **passkey** (see term table for why each stays
   English). (b) Established Swahili tech forms win over kept
   English: programu, akaunti, simu, kifaa, seva, barua pepe,
   kalenda, kamera, kivinjari, wasifu, mipangilio, **nenosiri**
   (password — the Google/Microsoft sw standard; **nywila is
   rejected**, a coinage neighbors don't know), sahihi (signature),
   kitufe (button). (c) Where a natural everyday word exists, it wins
   over both the loan and the committee coinage: msaada not
   "support", mfano not kiolezo (template), "andika jina lako" not
   usajili. The test is always "which word would the neighbor
   actually say" — not maximal Swahili, not maximal English.
7. **One standard form per word, East African written standard.** No
   Sheng (poa, sawa tu fine in speech — but no manze, fiti, noma), no
   single-country slang as the term, one spelling per word file-wide
   (jumuiya not jumuia; thibitisha not dhibitisha — and dhibiti
   (control) is a different verb, never confused with thibitisha
   (confirm)). Text is NFC (trivial for Latin — no stray combining
   marks) and carries no directional control characters.
8. **Noun-class discipline — coined terms carry their class
   everywhere.** Every coined compound in the table below states its
   noun class, and agreements follow it in every string, without
   exception: mwanajumuiya is 1/2 (huyu/hawa, wa-), jumuiya and node
   are 9/10 (hii/hizi, i-/zi-), mbegu 9/10, ghala 5/6, kimbilio 7/8,
   mdundo 3/4, ubao 11/10. Commons items agree as kitu (7/8):
   "Kinatunzwa", "Kinapumzika". A term that shifts class between
   strings reads as two different translators — the parity review
   greps for the stated concords.
9. **Punctuation and numbers.** Sentences end in a period, questions
   in ?, exclamations in ! — sparingly; enthusiasm comes from word
   choice. Quotes: curly “ ” (the sibling convention — never a
   straight-curly mix). Ellipsis: the single-char … ("Inatuma…"). Em
   dash: " — " with plain spaces, as en/es. Headings, buttons, and
   chips take no terminal punctuation. Digits are ASCII; formatted
   numbers flow through `Intl` — never hand-formatted. **The saa trap
   is double**: "saa 3" reads as clock time, and East African clock
   convention offsets it (saa tatu = 9 o'clock) — so the currency
   ALWAYS carries context ("saa 3 za msaada", "Saa za msaada: 3") and
   clock times render only via `Intl`, never hand-written.
10. **Length is the layout risk.** Swahili verb complexes and ku-
    infinitives run long ("tutakachokifanya", "kuthibitishwa"), and
    sw overall runs ~15–25% longer than en. The tight surfaces are
    known: the bottom nav labels and the 3-up board pill row at
    375px. The nav set is decided short up front — **Ubao, Kalenda,
    Mdundo, Ujumbe, Wasifu, Ninavyotunza** — and the pill row is
    **Mahitaji / Msaada upo / Miradi**. In chips prefer short
    agreement forms over nominalizations (Inatunzwa, not Utunzaji).
    Overflows wrap, never truncate mid-word. Casing follows en per
    key: sentence case, no Title Case.
11. **"Understoria" is never translated** or respelled. Same for file
    names, env vars, and `docs/…` paths quoted in strings.
    Interpolation placeholders `{{count}}`, `{{name}}`, `{{hours}}`…
    stay byte-for-byte identical (the parity test enforces this),
    with normal spaces around them.
12. **Plurals — sw has real `_one`/`_other` differences.** Swahili
    CLDR uses `_one` and `_other`, and unlike id/vi the two forms
    genuinely DIFFER: noun-class concord changes with number
    ("mdhamini mmoja" / "wadhamini {{count}}", "mwanajumuiya mmoja" /
    "wanajumuiya {{count}}"). Fill both keys with the correctly
    agreeing form — never copy `_other` into `_one` for class-1/2 and
    3/4 and 5/6 and 7/8 and 11/10 nouns (9/10 nouns like saa and node
    keep one shape, but their concords still shift: "saa moja
    imehamia" / "saa {{count}} zimehamia"). Never delete a `_one`
    key; the parity test will fail the file.

## Term table

| English | Swahili | Notes / DON'T use |
|---|---|---|
| vouch for (verb) | kumdhamini (cl. verb; person object) | Argued hard. Kitchen reality: the mdhamini is the person who signs the school form, the chama introduction, the job reference — "mimi ndiye namdhamini" is lived speech for answering for someone with your name. The worn edges are fenced off by bans elsewhere: bail lives in **dhamana** (banned absolutely), fee-sponsorship in **ufadhili/mfadhili** (banned, rule 3), so the dhamini-root has nothing money-shaped left to attach to. RESERVED: dhamini only ever means vouching-for-a-person; "ensure" is always hakikisha. Button: "Mdhamini mwanajumuiya huyu". DON'T: dhamana (bail/collateral), kuthibitisha (reserved for confirm — total collision), kumjua (too weak for a signed act), kushuhudia (courtroom/church testimony). |
| a vouch (the signed act) | udhamini wako uliotiwa sahihi (cl. 11/14) | "inahitaji udhamini wa wanajumuiya wawili wanaoaminika". The scholarship sense (udhamini wa masomo) cannot surface — fee vocabulary is banned file-wide. DON'T: cheti (a certificate), ushahidi (testimony). |
| vouches (count on trust chips) | {{count}} wadhamini (cl. 1/2) | One vouch = one distinct person, so count people: "Anaaminika ({{count}} wadhamini)", "Una wadhamini {{have}}/{{need}}". `_one`: "mdhamini mmoja" (rule 12). |
| vouched by | {{name}} amekudhamini | Or "umedhaminiwa na {{name}}" where the passive reads better. |
| trust / trusted member | kuaminika / mwanajumuiya anayeaminika | Chip: "Anaaminika". Web of trust: **mtandao wa kuaminiana** — the reciprocal -ana is the whole idea in one suffix. DON'T: kuthibitishwa (verification officialese), kutambulika (recognized-by-authority). |
| seed balance | mbegu ya mwanzo (cl. 9/10) | Keep the metaphor as es/id/vi do: "saa zako bado ni sawa kabisa na mbegu yako ya mwanzo". Chip: "Mbegu: {{hours}}"; seed credits = saa za mbegu. Plain in teaching prose: "kila mtu anaanza na saa 5 za msaada". DON'T: salio (airtime balance — rule 4), mtaji (capital), bonasi (promo poison), akiba (savings). |
| hours (the currency) | saa (cl. 9/10) | "Saa moja ya msaada wowote ni saa moja." Always saa with the msaada context (rule 9 — the clock trap is double in EA). Credit moves → "saa zimehamia". DON'T: krediti (loans), pointi (loyalty points), salio, sarafu (coins/crypto). |
| node | node (kept English; cl. 9/10 — node yako, node zimeunganishwa) | Keep the teaching gloss: "node (seva ya pamoja inayoendeshwa na jumuiya yako)". Kept verbatim — tier (a), rule 6, sibling precedent (id, vi) — because no natural sw word exists: **nodi** is an unrooted borrowing whose only sw sightings are medical translations (nodi za limfu — lymph nodes), and the calque **fundo** means a knot in a rope. RESERVED: node means the server and nothing else; seva alone only where en itself says just "server". DON'T: nodi, fundo, kituo (a station — kituo cha polisi register). |
| community node / peer nodes | node ya jumuiya yako / node rafiki | Rafiki is the trusted-friend word — exactly federated friendship (es "nodos aliados", id "node sahabat"). DON'T: node washirika (business partners), node za P2P (jargon). |
| federation | jumuiya rafiki zilizoshikana | Prefer the rephrasing in prose: "Across the federation" → "kati ya jumuiya rafiki zote". DON'T: **shirikisho** (federal-state politics), **muungano** (the live TZ–Zanzibar constitutional question — absolutely not), umoja wa kimataifa flavor. |
| exchange | mabadilishano (cl. 6) | "mabadilishano ya msaada"; confirmed: "Mabadilishano yamethibitishwa". Built on kubadilishana — the reciprocal, both directions in one verb. DON'T: muamala (M-Pesa — rule 4), biashara (commerce), soko flavor. |
| the commons (section) | mali ya wote (cl. 9) | The kitchen phrase for a thing held in common: "Hii ni mali ya wote katika jumuiya." Section: "Mali ya wote"; one item: "kitu cha wote" (cl. 7/8). DON'T: mali ya umma (state-property officialese), rasilimali (NGO-workshop resources), commons kept English. |
| tended (commons status) | Kinatunzwa (agrees as kitu, cl. 7) | Prose: "kinatunzwa na jumuiya". Kutunza is caring for a child, a garden, a sick neighbor — exactly the app's care framing. DON'T: kinahudumiwa (huduma family — rule 3), kinasimamiwa (supervised/managed), matengenezo (repairs/maintenance). |
| retired (commons status) | Kinapumzika (cl. 7) | Deliberate non-literal, mirrors id "sedang beristirahat": "kiache kitu hiki kipumzike kwanza" honors the no-shame lifecycle (it can come back). DON'T: kimestaafu (civil-service pension), kimetupwa (discarded — shame), kimefungwa (shut down — final). |
| In my care (nav) | Ninavyotunza | The relative construction keeps the care verb and stays one word for the nav pill; prose: "utakiona chini ya 'Ninavyotunza'". If it overflows, wrap — never truncate (rule 10). DON'T: Kazi zangu (flattens care to tasks), Majukumu yangu (duties — burden), Wajibu wangu. |
| Grow another root (add-a-server flow) | Otesha mzizi mwingine (mzizi cl. 3/4) | Button: "Otesha mzizi mwingine"; prose: "ili jumuiya iote mizizi zaidi ya mmoja". Mirrors es "Hacer crecer otra raíz". DON'T: Ongeza seva, Sakinisha node mpya (both flatten the metaphor to IT). |
| timebank | benki ya muda | The transparent calque, as id "bank waktu". Keep the SURROUNDING prose non-bank: "kwenye benki ya muda, kuomba msaada hakuhitaji chochote". DON'T: akiba ya muda (savings passbook — more bank, not less), SACCO ya muda (a real legal form — misleading). |
| mutual aid | kusaidiana | The reciprocal every Swahili speaker grew up inside: "saa za kusaidiana", "majirani wanasaidiana". Note the singular/plural trap: **msaada** (help) is warm; **misaada** (aid, plural) is donor-relief register — never misaada. DON'T: misaada, hisani (charity), sadaka (alms), ufadhili (rule 3), harambee as the frame (rule 5). |
| board | Ubao (cl. 11/10) | Nav: "Ubao"; first-use gloss: "ubao wa jumuiya — pa kubandika mahitaji na msaada" (the corkboard every shule, msikiti, kanisa and duka has — and kufuta ubao is what you do to it, a happy resonance with rule 9's wipe family). DON'T: ubao wa matangazo as the running name (tangazo is official-notice flavored — fine once in the gloss), jukwaa (political platform/stage), ukumbi (a hall/forum). |
| dashboard | Mdundo (cl. 3/4) | The community's beat, following the sibling pulse pattern (Denyut, Пульс, نبض) with an East African drum: "Mdundo wa jumuiya" — the page IS the community's rhythm (resilience, milestones, momentum). Decided over the literal pulse word because bare **mapigo** reads as blows/beatings (mapigo makali) without "ya moyo" attached — a nav label can't carry the disambiguation. DON'T: mapigo bare, dashibodi (car/BI jargon), muhtasari (report summary). |
| needs (tab) / asks | Mahitaji (cl. 6) / kuomba msaada | Tab/chip: "Mahitaji"; asking in prose is "kuomba msaada" — everyday and unashamed ("naomba msaada" is kitchen speech): "Bandika unachoomba". But **maombi as a label is banned** — it reads as prayers (church register) or formal applications. DON'T: maombi, madai (demands — debt adjacency, rule 4), upungufu (lack — shame-laden). |
| offers (tab) | Msaada upo | "Help is here" — decided over any noun because Swahili's natural offer is a verb ("ninaweza kutoa…"), and the honest nouns are all poisoned: **ofa is banned absolutely** (Safaricom promo-speak — the telco offer), huduma banned (rule 3). Prose: "msaada unaotolewa", "unaweza kutoa nini". DON'T: ofa, huduma, toleo (an edition/version), punguzo (discount). |
| post (verb) | bandika ubaoni | Sticks the paper notice up: "Bandika hitaji lako ubaoni". DON'T: chapisha (publishing), tangaza (proclamation/advertising). |
| claim (a post/task) | chukua | "Chukua kazi hii", "{{name}} amechukua" — taking it into your care; the nav framing (Ninavyotunza) does the warmth. DON'T: **kudai** (claiming a debt — double poison, rule 4), nyakua (grabbing), buku/kubuku booking flavor. |
| project | mradi (cl. 3/4, miradi) | Kept — the everyday word (rule 3 argues it); the donor stench lives in the banned words around it. Pill: "Miradi". DON'T: programu ya maendeleo (development-program register), mpango (a scheme). |
| task | kazi | "kazi ndogo moja". DON'T: **kibarua** (day-wage labor — rule 5), jukumu (duty — burden register), zoezi (a drill/exercise). |
| work day | siku ya kazi ya pamoja | Feature title: "Kazi ya pamoja — {{project}}"; "Panga siku ya kazi ya pamoja". Plain, warm, no country's baggage. Teaching prose MAY nod once to harambee's pulling-together spirit under rule 5's fence — never as the name, never near money. DON'T: harambee as the feature name (rule 5 — the cash-collection frame), siku ya kazi (an HR working day), kibarua. |
| shift | zamu (cl. 9/10) | THE everyday turn word: "Andika jina lako kwenye zamu hii", "Uko kwenye zamu hii". DON'T: shifti (factory register), doria (patrol duty). |
| sign-up (for a shift) | andika jina lako | The paper sign-up-sheet idiom: "Andika jina lako", "Futa jina lako". Keep this family for shifts ONLY. DON'T: jisajili / usajili (SIM-registration officialese — the "usajili wa laini" counter). |
| rota (care rota) | kutunza kwa zamu | "majirani wanapokezana zamu" — kupokezana is the handing-over-in-turns reciprocal. A rota slot: "zamu yako imefika" (warm and idiomatic). DON'T: ratiba ya ulinzi (guard roster), orodha ya wajibu (duty list). |
| proposal | pendekezo (cl. 5/6, mapendekezo) | Page: "Mapendekezo"; "pendekezo la jumuiya" — kupendekeza is everyday suggesting. DON'T: hoja (parliamentary motion), mswada (a bill), **azimio** (Azimio la Arusha — political-history collision). |
| affirm (a proposal) | unga mkono | Button "Unga mkono"; count: "{{count}} wameunga mkono" — joining your hand to it, the lived consensus idiom, not admin approval. Blocking a proposal: simamisha ("Simamisha kwanza") — keeps zuia reserved for contacts. DON'T: idhinisha (authorization from above), piga kura (parliamentary voting), kubali (ToS click-through). |
| block (a contact) | zuia | The established app word: "Zuia mawasiliano", "Ondoa kizuizi". RESERVED for contacts; a proposal is simamisha (previous row). DON'T: fungia (locking someone up), piga marufuku (an official ban). |
| flag (an exchange/comment) | tia alama | "Kuna kitu si sawa — tia alama ipitiwe na jumuiya pamoja". DON'T: **ripoti** (report-to-the-authorities — kuripoti polisi; there is no authority here), shtaki (accuse/sue), lalamika (customer complaint). |
| dispute | kutoelewana | Page: "Kutoelewana" — the everyday falling-out word, no courtroom in it; status: "Jumuiya inajadiliana pamoja" (short chip: "Linajadiliwa"). Teaching prose may echo the baraza spirit ("kama barazani") — but baraza itself stays out of labels (Baraza la Mawaziri officialese). DON'T: mgogoro (land-dispute/crisis register), kesi (a court case), mzozo (heavy conflict). |
| member | mwanajumuiya (cl. 1/2, wanajumuiya) | Coined on the mwana- pattern and RESERVED — carried consistently everywhere (rule 8). DON'T: mtumiaji (user — banned, rule 3), mteja (customer — banned, rule 3), **mwanachama** (chama = party/club/savings-group card — wrong register), memba (Sheng). |
| neighbor | jirani (cl. 5/6, majirani) | "majirani zako"; collective warmth: **ujirani mwema** — the lived good-neighborliness phrase. DON'T: wakazi (residents — census register), wananchi (citizens — state address). |
| community | jumuiya (cl. 9/10) | The organized-community word, warm at kitchen scale ("jumuiya yako", "jumuiya nzima"). Jamii is society-at-large only. DON'T: **chama** (political party / savings club), umma (the public/ummah), shirika (a corporation), taasisi (an institution). |
| invite (noun + verb) | mwaliko / alika (cl. 3/4) | "Alika mtu unayemjua", "aliyekualika" — and karibu culture does the welcoming ("Karibu sana"). DON'T: ombi la kujiunga (application bureaucratese), kadi ya mwaliko rasmi flavor. |
| guardian (shard holder) | mshika amana (cl. 1/2, washika amana) | RESERVED WORD: mshika amana only ever means a recovery-shard holder — amana is the entrusted-thing word ("nimemwachia amana"), held with care because someone trusted you; the bank-deposit sense has nothing to attach to here (money vocabulary is banned file-wide). Gloss on first use: "kila mmoja anashika kipande cha ufunguo wa kurudi kwako". DON'T: **mlezi** (LEGAL guardianship of children — the school-form trap, same as fr "tuteur"), mlinzi (a watchman), msimamizi (supervisor — no-admins framing). |
| recovery kit | kit ya kurejesha (cl. 9) | Gloss on first use: "kit ya kurejesha (nakala inayorudisha akaunti yako)". The warm recovery verb is kurudi/kurejesha: "rudisha akaunti yako". A shard: **kipande** (cl. 7/8 — never mgao, rule 5). DON'T: vifaa vya huduma ya kwanza flavor (first aid), faili la ziada (flattens the promise). |
| passphrase | maneno ya siri (cl. 6) | Built beside the established nenosiri: gloss on first use "maneno ya siri (nenosiri refu la maneno kadhaa)" — the one-word/multi-word split keeps the two greppable. DON'T: nywila (rejected coinage, rule 6), neno la siri singular (blurs into nenosiri), namba ya siri (a PIN). |
| passkey | passkey (kept English) | Gloss on first use, matching en's member-facing promise: "passkey — fungua kwa alama ya kidole, uso, au PIN ya kifaa chako". Kept because any sw coinage would sit fatally close to nenosiri / maneno ya siri in a security flow — the exact three-way confusion id dodged. DON'T: ufunguo wa siri, nenosiri maalum. |
| ledger | kumbukumbu ya pamoja ya jumuiya (cl. 9/10) | The shared remembering: "imeandikwa kwenye kumbukumbu ya pamoja ya jumuiya". DON'T: leja (accounting/blockchain), **daftari la madeni** (debt book — never), hesabu (accounts). |
| milestone | hatua (cl. 9/10) | "Jumuiya imefika hatua mpya" — the journey word. DON'T: lengo (a KPI target), kilele (the summit — finality), kiwango (a level/grade). |
| skills | ujuzi (cl. 11/14) | Field: "Ujuzi wako"; headings prefer "unaweza kufanya nini" — the kitchen framing. DON'T: **stadi** (NGO life-skills curricula — stadi za maisha), umahiri (competency HR-speak), vipaji (talent-show). |
| celebrate / celebration | sherehekea / sherehe (cl. 9/10) | Category: "Sherehe"; "tusherehekee pamoja". The everyday word, already warm. DON'T: maadhimisho (official commemorations — state-holiday register), hafla (formal function). |
| gleaning (template corpus) | kuokota masalia ya mavuno | The Gleaning Network template: "mtandao wa kuokota masalia ya mavuno" — picking up what the harvest left, dignified. DON'T: kuchakura (scavenging — desperation register), kuokota taka flavor (waste-picking shame). |
| panic (the emergency wipe) | wakati wa hatari | "Kitufe cha hatari"; gloss on first use: "hatari ikiwa mlangoni: futa kila kitu kwenye kifaa hiki papo hapo". Keeps **dharura** RESERVED for the Emergency section ("Dharura"). DON'T: taharuki (news-panic register), SOS mode, dharura (reserved). |
| soft purge / hard purge | futa kiasi (ficha utambulisho) / futa kabisa (ondoa kila kitu) | One futa family, honest about the difference — and kufuta ubao (wiping the board clean) keeps it kitchen-plain: kiasi strips identifying text and keeps the signed record; kabisa wipes keys and rotates identity. DON'T: purge kept English, safisha (janitorial cleaning), rejesha mipangilio ya kiwandani (factory-reset confusion). |
| seed vault | ghala la mbegu (cl. 5/6) | Ghala is the village grain store — held for the lean season; the resonance is exact: "Kifaa hiki ni ghala la mbegu — linahifadhi historia yote ya jumuiya." DON'T: sefu (bank safe), stoo (a storeroom), seva ya ziada (flattens the metaphor). |
| storm hub | kimbilio (cl. 7/8) | The place you run TO when weather turns — lived vocabulary, refuge through the storm, never the storm's own center: gloss "kimbilio — mahali penye umeme na Wi-Fi wakati kila mahali pengine kumezimika". DON'T: **kituo cha dhoruba** (the storm's own center — the trap every sibling dodged), kambi (a camp — displacement register), kituo cha dharura (ministry officialese). |
| One small thing | Kitu kimoja kidogo tu | Button: "Nionyeshe kitu kimoja kidogo tu" — tu is the disarming particle. DON'T inflate to "kazi ndogo moja" here. |
| helper (person in an exchange) | aliyesaidia | "Saa zimeandikwa kwa aliyesaidia"; field: "Aliyesaidia" — simply the one who helped. DON'T: **mjitolea / wa kujitolea** (volunteer-as-institution — rule 3), mhudumu (a waiter — huduma family), msaidizi (an aide-to-a-boss — msaidizi wa mkurugenzi), mfanyakazi (an employee). |
| display name | jina la kuitwa | The name people call you by: "Jina unalopenda kuitwa (si lazima jina rasmi — chagua unavyotaka)". DON'T: jina la mtumiaji (username — and mtumiaji is banned), jina la utani (a teasing nickname), jina kamili (the ID-card field). |
| owed help | inasubiri uthibitisho wako | Badge: "Inasubiri uthibitisho"; "saa {{hours}} zinasubiri uthibitisho wako". Deliberately NOT deni / madai — the app refuses debt framing (rule 4). |

## Known hard strings

- **In my care** → "Ninavyotunza" — the relative form keeps kutunza's
  tending-a-person warmth in a single nav-sized word.
- **Grow another root** → "Otesha mzizi mwingine" — the causative
  keeps the botanical metaphor alive instead of flattening it to IT.
- **tended** → "Kinatunzwa" — the verb for a garden or a sick
  neighbor, agreeing as kitu — exactly what the commons asks for.
- **seed balance** → "mbegu ya mwanzo" / "saa za mbegu" — mbegu
  carries planting hope, not banking; salio never appears.
- **Dashboard** → "Mdundo" ("Mdundo wa jumuiya") — the sibling pulse
  pattern rendered as the community's drumbeat, because bare mapigo
  without "ya moyo" reads as blows.
- **storm hub** → "kimbilio" — the run-to-shelter word, refuge THROUGH
  the storm, never kituo cha dhoruba (the storm's own center).
- **vouch** → the dhamini family — the lived answering-for-someone
  act (school forms, chama introductions), kept clean because dhamana
  (bail), ufadhili, and every money word around it are banned
  file-wide; "ensure" is always hakikisha.
- **panic button** → "Kitufe cha hatari" — hatari is the plain danger
  word; dharura stays reserved for the Emergency section.
- **hard purge** → "Futa kabisa (ondoa kila kitu)" — the futa family
  is kitchen-plain (kufuta ubao), and kabisa/kiasi states the
  difference honestly without IT euphemism.

## Quick self-check for translators

- Would a neighbor say this out loud across a kitchen table? If not,
  redo it.
- `grep` for tafadhali, unaombwa, unatakiwa — zero hits; requests are
  bare, softened with tu/basi (rule 3).
- `grep` for the tu-/sisi corporate voice (tunakuomba, tunasikitika,
  tumepokea) — zero hits outside the translation-honesty note; the
  app drops the subject or names its actor (rule 2).
- `grep` for huduma, mteja, mtumiaji, ofa — zero hits; help is
  msaada/kusaidiana, members are wanajumuiya (rule 3).
- `grep` for deni, mkopo, riba, malipo, kulipa, muamala, salio, kudai
  — zero hits outside explicit debt-rejection lines; owed help is
  "inasubiri uthibitisho" (rule 4).
- `grep` for wafadhili, ufadhili, mfadhili, wadau, warsha, kujitolea,
  mjitolea, hisani, sadaka, misaada — zero hits; stepping forward is
  kujitokeza, helpers are "aliyesaidia" (rule 3).
- `grep` for harambee — hits only in teaching prose under rule 5's
  fence, never as a feature name, never near saa or exchanges. Same
  for ujamaa, mchango, kibarua, ushirika, mgao — zero hits (rule 5; a
  shard is kipande, taking part is kushiriki).
- dhamini-root only ever means vouching; dhamana — zero hits;
  "ensure" is hakikisha. mlezi — zero hits (shard holders are washika
  amana). nodi and fundo — zero hits; the server is always node with
  its first-use gloss. kituo cha dhoruba — zero hits; the refuge is
  kimbilio. shirikisho, muungano, azimio, chama-as-community — zero
  hits (live-politics collisions).
- Noun classes: every coined term carries its stated class and
  concords everywhere (rule 8) — mwanajumuiya 1/2, node 9/10, mshika
  amana 1/2, kimbilio 7/8; commons chips agree as kitu (Kinatunzwa).
- `{{…}}` placeholders identical to en; every `_one` key present and
  CORRECTLY agreeing (sw plural concord really changes — rule 12).
- Saa always carries msaada context — "saa 3" bare is a clock time,
  and an East African clock at that (rule 9); numbers flow through
  `Intl`.
- Buttons and chips carry no terminal punctuation; quotes are curly
  “ ”; ellipsis is the single-char …; em dash spaced (rule 9); nav
  and pill labels stay short and wrap rather than truncate (rule 10).
  Text is NFC; no directional control characters; no Sheng; one
  standard form per word (rule 7).
- If a string reads like a bank SMS, a government tangazo, or an NGO
  banner, it's the wrong register — rewrite it the way you'd say it
  to your jirani (rule 3).
- "Understoria" untouched.
