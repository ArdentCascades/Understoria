# Filipino (fil) translation glossary

Reference for every bulk-translation and review pass over `fil.json`
and the Filipino content modules. Decisions here get applied ~2,900
times — when in doubt, pick the word a Filipino-speaking neighbor would
say across a kitchen table, not the word a bank SMS, a barangay-hall
circular, or a GCash promo push would use.

**Locale code is `fil`** — what modern browsers, iOS, Android, and CLDR
all use for Filipino. Legacy detections still arrive as `tl` / `tl-PH`
(old Accept-Language configs, older Androids); those are aliased to
`fil` at the language detector — i18next-browser-languagedetector's
`convertDetectedLanguage` maps any `tl`-rooted tag to `fil` before
resolution. There is no separate `tl` file, ever: one `fil` serves
Metro Manila, the provinces, and the diaspora. The base is contemporary
conversational Filipino as written in the big fil surfaces (Messenger
and Facebook fil, texts between friends) — Taglish where Taglish is the
honest register (rule 6), never purist coinage, never call-center
formality. Regional languages (Cebuano, Ilocano…) are separate possible
future locales, never mixed in here.

## Global register decisions

1. **The member is ka / ikaw / mo / iyo — and there is no po.**
   Filipino respect runs on po/opo and the kayo/ninyo deference
   plural, calibrated by age and standing — which the app can never
   know, and guessing wrong is worse both ways: po to a teenager reads
   like a salesclerk, and once used it can never be dropped. The
   platforms Filipinos live in have settled it: Messenger, Facebook,
   and Google fil address one member as ka/mo without po ("Ang profile
   mo"), and that reads friendly-normal to every age. Where po DOES
   appear in apps is exactly the register we ban — the GCash support
   reply, the hotline IVR ("Maraming salamat po sa pagtawag") —
   service-counter distance wearing a smile. So: ka/mo uniformly,
   lowercase; warmth comes from lang, naman, muna, ha, sige, tara and
   word choice, never from deference machinery. Banned as address: po,
   opo, ho, kayo/ninyo/inyo as singular deference (kept ONLY for a
   genuine plural audience — grammar, not politeness). Plural
   audience: "mga kaibigan" or "lahat", never "mga user".
2. **First person — who is speaking.** (a) The MEMBER (buttons, "my"
   labels): ko / akin ("Idagdag sa kalendaryo ko"). (b) The APP:
   prefer no subject — Filipino drops it naturally ("Na-save na.",
   "Ipapadala kapag may internet na ulit.") — or name the real actor:
   ang app, ang node, ang komunidad ("Babasahin ito ng app para sa
   iyo"). (c) "We" including the member is **tayo / natin / atin** —
   the inclusive we is a gift: it grammatically cannot exclude the
   reader ("Ipagdiwang natin"). (d) **Kami / namin / amin is banned as
   the app's voice** — the exclusive we is the telco-apology register
   ("Kami po ay humihingi ng paumanhin…"), a company talking at a
   customer, and there is no company behind this app. It survives only
   where en itself unmistakably speaks as the people who made the
   software (the translation-honesty note). Third persons: siya, sila,
   "ang miyembrong ito", or repeat the name.
3. **Utang na loob — the central trap.** Filipino has a word for a
   debt that is not money: utang na loob, the debt of the inner self,
   owed to whoever helped you, never fully repayable, collectible at
   the giver's convenience. It is the engine of the padrino system —
   help flows downhill from patron to beholden, and asking is shameful
   because every request mints new debt. A timebank translated in
   utang vocabulary would rebuild that hierarchy string by string. The
   fence is absolute: hours are **oras**, and oras move between
   neighbors — they are never owed. Banned file-wide: utang, utang na
   loob, umutang, pautang, pagkakautang, bayad / bayaran / kabayaran
   (payment), singil (billing), hulog / hulugan (installments),
   **tubo** (interest — banning it also frees the root metaphor, see
   term table), kolekta, "makabawi ka rin" / makaganti (repayment-of-
   favor framing), and **balanse** (bank-statement word; the seed
   balance is binhi). Debt words appear ONLY where en itself
   explicitly rejects debt framing — and there the line names the real
   trap precisely in order to refuse it: "asking is not debt" → "Ang
   paghingi ng tulong ay hindi utang — at lalong hindi utang na loob."
   That is the one sentence where utang na loob belongs. Owed help is
   "naghihintay ng kumpirmasyon mo". Mind hiya, utang na loob's twin:
   never frame asking around shame, even to negate it ("huwag kang
   mahiya" still invokes it) — render never-gated asking positively:
   "Humingi ka lang." Plain salamat is fine — gratitude is not the
   problem; its weaponization into obligation is.
4. **Bayanihan and the communal lexicon — decided one by one.**
   **Bayanihan** — neighbors shouldering the house on bamboo poles —
   is THE Filipino communal-effort word, and it has been worn hard:
   the Bayanihan Act, Oplan Bayanihan (a counterinsurgency program!),
   every bank and telco CSR campaign. Yet it still lands the moment it
   names something concrete — actual neighbors, actual lifting. So:
   USE it for the work-day feature ("Bayanihan — {{project}}") and in
   prose about actual gathered collective work; DON'T sprinkle it over
   the app or the timebank mechanism — mutual aid generally is
   **tulungan** (tulong / magtulungan carry the whole app). The
   neighbors: **kapwa / pakikipagkapwa** — the ethical core (the self
   shared with others), too abstract for labels, welcome in teaching
   prose; **damayan** — allowed in prose, best in the lived pairing
   "tulungan at damayan"; **pakikiramay — banned** (narrowed to
   condolences — funeral register); **abuloy — banned** (funeral
   money); **ambagan / ambag — banned** for help and hours (the money
   pot passed at a salu-salo; taking part is makibahagi); **palusong**
   — the old going-down-to-the-fields communal labor, archaic but
   beautiful: welcome as resonance in authored content, never UI;
   **barangay vocabulary — banned** as community words (the barangay
   is a government unit — kapitan, tanod, clearance windows; the
   community is komunidad, and kapitbahay keeps its warmth free of
   the LGU).
5. **Warm everyday Filipino over officialese, NGO-speak, and
   commerce-speak.** Banned outright: **Mangyaring** (the memo-
   circular "please") and **pakiusap** as padding — most requests read
   better bare, softened with lang or naman; paki- is genuine everyday
   courtesy, available SPARINGLY ("Pakisuri ulit"), never reflexively.
   **Serbisyo banned for help between members** — serbisyo is what a
   company sells; help is tulong (mirror id layanan / sw huduma).
   **Kliyente, customer, user / gumagamit banned** — members are
   miyembro, neighbors kapitbahay (and **kasapi is not used**: bylaws-
   and-samahan register; miyembro is what the neighbor says — Facebook
   fil's own rendering for group members). NGO vocabulary:
   **benepisyaryo**, stakeholder-isms, "programang pangkabuhayan"
   livelihood flavor, pondo / funding — banned; **proyekto is kept**:
   the school-and-kitchen everyday word, and the donor stench lives in
   the words AROUND it, all banned, so proyekto stays clean (the call
   sw made for mradi). E-commerce and GCash-speak: promo, diskwento,
   cashback, puntos, **voucher** (doubly poisonous: coupon-speak AND a
   false friend of "vouch"), raffle, "kunin ang reward" — banned; this
   app sells nothing. **Magparehistro / rehistro banned** (the
   LTO/COMELEC counter) — joining is "sumali", a shift is "isulat ang
   pangalan mo". And **padala never touches oras**: magpadala ng pera
   is remittance — messages are ipadala, but hours "lumilipat" or
   "naitala", never "ipinadala".
6. **Taglish policy — three tiers, honestly.** Filipino app registers
   are Taglish because Filipino speech is; purist coinage is its own
   dishonesty. (a) Proper nouns, codes, technical literals verbatim:
   Understoria, node, passkey, QR code (that word order — what
   Filipinos say), Wi-Fi, PIN, URL, email, file paths, env vars, .ics.
   (b) Established English loans that ARE the everyday words stay
   English: app, server, device, **password** (kontrasenyas is a
   coinage nobody says), profile, online/offline, fingerprint,
   internet — plus loan VERBS with ONE affixation convention: hyphen
   between affix and English stem always, **i-** for do-it-to-this
   imperatives (i-scan, i-tap, i-save, i-block), **mag-** for
   actor-focus (mag-download, mag-back up), **na-/ma-** for
   done-states (na-save); never respell (no iskan), never mix i-/mag-
   for one verb across comparable strings — the table fixes the common
   ones. Spanish-era words are native vocabulary, not loans:
   kalendaryo, mensahe, miyembro, kumpirmahin, imbitasyon, proyekto,
   turno. (c) Where a natural everyday Filipino word exists, it wins
   over both the kept loan and the formal coinage: tulong not
   "support", oras, buksan, burahin, kapitbahay, binhi, silungan. The
   test is always "which word would the neighbor text you".
7. **One spelling per word, KWF-modern orthography.** puwede (not
   pwede), mayroon (not meron — prefer "may" constructions where
   lighter), kailan, ganoon; din/rin and daw/raw follow the standard
   alternation (r-forms after vowels), consistently. **Ng / nang
   discipline is a stated rule for validators to eyeball**: ng links
   and possesses; nang marks manner, degree, when-clauses — "burahin
   nang tuluyan". Hyphens only where KWF puts them: affix + English
   stem (i-scan), glottal-break compounds (pag-aari, pag-aalaga),
   doubled words (araw-araw); no decorative hyphens. Text is NFC (no
   stray combining marks), no directional control characters.
8. **Punctuation and numbers.** Sentences end in a period, questions
   in ?, exclamations in ! — sparingly. Quotes: curly “ ” (sibling
   convention — never a straight-curly mix). Ellipsis: single-char …
   ("Ipinapadala…"). Em dash: " — " spaced, as en/es. Headings,
   buttons, chips: no terminal punctuation. Digits ASCII; formatted
   numbers flow through `Intl`. The clock trap is mild in Filipino
   (clock time is alas-tres, not "3 oras"), but the currency still
   always carries context ("3 oras ng tulong"); clock times render
   only via `Intl`.
9. **Length is the layout risk.** Filipino runs ~20–40% longer than
   en: mga adds a word to every bare plural, and affix chains are LONG
   unbreakable words (pinagkakatiwalaan). The tight surfaces are
   known: the bottom nav and the 3-up board pill row at 375px. The nav
   set is decided short up front — **Paskilan, Kalendaryo, Pintig,
   Mensahe, Inaalagaan ko, Profile** — and the pill row is **Kailangan
   / Alok / Proyekto** (category pills take the bare form, no mga,
   like en's bare plurals). Dashboard joins the sibling pulse family
   (Denyut, Mdundo, Пульс, نبض) as **Pintig** — pintig ng puso is the
   living heartbeat idiom. In chips prefer verb forms over
   nominalizations (Inaalagaan, not Pag-aalaga). Overflows wrap, never
   truncate mid-word. Casing follows en per key: sentence case, no
   Title Case.
10. **"Understoria" is never translated** or respelled. Same for file
    names, env vars, and `docs/…` paths quoted in strings.
    Interpolation placeholders `{{count}}`, `{{name}}`, `{{hours}}`…
    stay byte-for-byte identical (the parity test enforces this),
    with normal spaces around them.
11. **Plurals — read this twice; the fil CLDR rule is strange.**
    Filipino CLDR has `_one`/`_other`, but "one" is NOT "exactly 1":
    it selects for every count whose last digit is not 4, 6, or 9 —
    `_one` fires for 0, 1, 2, 3, 5, 7, 8, 10, 11… and `_other` only
    for 4, 6, 9, 14, 16, 19, 24… The consequence is hard: **never
    write "isang …" or any hard-coded singular into a `_one` string**
    — `_one` will render for 3 and for 25. Since Filipino nouns don't
    inflect for number, fill BOTH keys with the same {{count}}-
    carrying text ("{{count}} miyembro" works for 1, 3, and 40). Never
    delete a `_one` key; the parity test will fail the file. After a
    numeral the noun is bare — "{{count}} miyembro", NEVER "{{count}}
    mga miyembro"; mga only on uncounted plurals ("mga kapitbahay").

## Term table

| English | Filipino | Notes / DON'T use |
|---|---|---|
| vouch for (verb) | managot para kay/sa (the panagot family) | Argued hard. Kitchen reality: "Ako ang nananagot diyan — kilala ko ang taong iyan" is lived speech for answering for someone with your own name, exactly a signed vouch. The worn edges are fenced: bail is **piyansa** (banned), loan cosigning is **garante / co-maker** (banned — pure debt), and the held-accountable threat sense ("mananagot ka!") plus the shotgun-marriage idiom ("panagutan mo siya!") both attach to wrongdoing objects — so this app ALWAYS uses the answering-FOR construction, managot PARA kay/sa + person, never bare panagutan + person. Button: "Managot para sa miyembrong ito". RESERVED: the panagot root only ever means vouching; "ensure" is siguraduhin/tiyakin. DON'T: isponsor (godparent/visa/money patronage), garantiya (collateral), i-vouch, irekomenda (too weak), i-verify (ID checks). |
| a vouch (the signed act) | panagot | "ang pinirmahang panagot mo", "kailangan ng panagot mula sa dalawang pinagkakatiwalaang miyembro". |
| vouches (count on trust chips) | {{count}} ang nanagot | One vouch = one distinct person, so count people: "Pinagkakatiwalaan ({{count}} ang nanagot)", "May {{have}}/{{need}} ka nang nanagot". Vouched by: "Nanagot para sa iyo si {{name}}". Fully vouched chip: "Buong tiwala". Both plural keys identical (rule 11). |
| trust / trusted member | tiwala / pinagkakatiwalaang miyembro | Chip: "Pinagkakatiwalaan" (long — wrap, never truncate; rule 9). Web of trust: **lambat ng tiwala** — a woven fishing net, truer than any chain. DON'T: verified / na-verify (officialese), kredibilidad (HR-speak). |
| seed balance | panimulang binhi | es keeps the metaphor ("semilla inicial") and so do we: "ang oras mo ay eksaktong kasinlaki pa rin ng panimulang binhi mo". Chip: "Binhi: {{hours}}"; seed credits = binhing oras. Plain in teaching prose: "lahat ay nagsisimula sa 5 oras". DON'T: balanse (bank statement — rule 3), puhunan (capital), bonus (promo poison). |
| hours (the currency) | oras | "Ang isang oras ng anumang tulong ay isang oras pa rin." Always oras with tulong context (rule 8). Credit moves → "lumipat ang oras" / "naitala ang oras". DON'T: kredito (installment loans — rule 3), puntos/points (loyalty), coins, **ipadala for hours** (remittance echo — rule 5). |
| node | node (kept English) | Keep the teaching gloss: "node (ang server na pinapatakbo ng komunidad mo)". Kept verbatim — tier (a), rule 6 — Filipino tech speech itself keeps "node", and no calque exists a neighbor would recognize. RESERVED: node means the server and nothing else; server alone only where en itself says just "server". Peer nodes: **mga kaibigang node** — the trusted-friend word, exactly federated friendship (id "node sahabat"). DON'T: nodo, himpilan (a station/HQ), partner node (business). |
| federation | mga magkakaibigang komunidad | Prefer the rephrasing in prose: "Across the federation" → "sa mga magkakaibigang komunidad". DON'T: pederasyon (sports bodies/politics), alyansa (political-military). |
| exchange | palitan ng tulong | "Kumpirmado na ang palitan". DON'T: transaksyon (bank/e-wallet), bentahan (selling), barter (haggling flavor). |
| the commons (section) | pag-aari nating lahat | The inclusive natin does the framing work: "Pag-aari ito nating lahat sa komunidad." Section label: "Pag-aari ng lahat"; one item: "isang gamit ng lahat". DON'T: ari-arian (assets/estate), pampublikong pag-aari (state property), commons kept English. |
| tended (commons status) | Inaalagaan | Chip: "Inaalagaan"; prose: "inaalagaan ng komunidad". Alaga is caring for a person or a plant — exactly the app's care framing. DON'T: minementena (IT/building maintenance), pinamamahalaan (managed — administrative). |
| retired (commons status) | Nagpapahinga | Deliberate non-literal, mirrors id "sedang beristirahat": "hayaang magpahinga muna ang gamit na ito" honors the no-shame lifecycle (it can come back). DON'T: retirado (pension), tinanggal (removed — shame), hindi na ginagamit (finality). |
| In my care (nav) | Inaalagaan ko | Keeps the alaga verb and stays nav-sized; prose: "makikita mo ito sa 'Inaalagaan ko'". Wrap if it overflows (rule 9). DON'T: Mga gawain ko (flattens care to tasks), Trabaho ko (a job), Responsibilidad ko (burden). |
| Grow another root (add-a-server flow) | Magpausbong ng bagong ugat | Usbong (a sprout) is botanically pure — chosen because the obvious verb is a trap: **tubo/magpatubo means loan interest** ("nagpapatubo ng pera"), already banned under rule 3, a happy convergence. Prose: "para mag-ugat ang komunidad sa higit sa isang lupa". DON'T: magpatubo (interest), Magdagdag ng server (flattens the metaphor to IT). |
| timebank | bangko ng oras | The transparent calque, as id "bank waktu". Keep the SURROUNDING prose non-bank: "sa bangko ng oras, ang paghingi ng tulong ay walang kapalit na hinihingi". DON'T: impok na oras (savings passbook — more bank, not less), kooperatiba ng oras (a real legal form — misleading). |
| mutual aid | tulungan | The word every Filipino grew up inside: "oras ng tulungan", "nagtutulungan ang magkakapitbahay"; prose may pair it as "tulungan at damayan" (rule 4). DON'T: kawanggawa (charity — downhill), limos (alms), abuloy (funeral money), ambagan (money pot — rule 4), bayanihan as the general frame (reserved — rule 4). |
| board | Paskilan | Nav: "Paskilan" — built on ipaskil, THE lived verb for sticking notices up ("Bawal magpaskil dito" is on every wall). First-use gloss: "ang paskilan ng komunidad — kung saan nakapaskil ang mga kailangan at alok". DON'T: bulletin board (too long for nav; fine once in a gloss), pisara (a chalkboard), "Home"/feed flavor. |
| post (noun / verb) | paskil / ipaskil | "Ipaskil ang kailangan mo", "isang paskil sa paskilan". "I-post" acceptable in technical contexts (sync explanations) — the FB-lived word. DON'T: anunsyo (official notice), patalastas (advertisement), ibalita (news). |
| dashboard | Pintig | The community's heartbeat, joining the sibling pulse family (Denyut, Mdundo, Пульс, نبض): "Pintig ng komunidad" — the page IS the community's vitals, and pintig ng puso is idiom, not jargon. DON'T: dashboard kept English (car/BI), Buod (report summary), Home. |
| needs (tab) / asks | Kailangan / humingi ng tulong | Pill: "Kailangan"; asking in prose is "humingi ng tulong" — everyday and unashamed: "Humingi ka lang" (rule 3 — no hiya framing, even negated). DON'T: pangangailangan as a label (long officialese), demand flavor, kakulangan (lack — shame-laden). |
| offers (tab) | Alok | Pill: "Alok"; an offer: "alok na tulong" ("inalok niya akong tulungan" is kitchen speech). DON'T: promo (banned — rule 5), serbisyo (rule 5), oferta/deal, "offer" kept English. |
| claim (a post/task) | kunin | "Kunin ang gawaing ito"; claimed state gets the lived care idiom: "Si {{name}} na ang bahala dito". DON'T: **i-claim** (GCash "claim your reward" — promo poison AND redemption flavor), angkinin (appropriating), i-reserba (booking). |
| project | proyekto | Kept — the everyday word (rule 5 argues it); the donor stench lives in the banned words around it. Pill: "Proyekto". DON'T: programa (a government scheme), "livelihood project" NGO flavor. |
| task | gawain | "isang maliit na gawain". DON'T: trabaho (a job — wage flavor), misyon (gamified), tungkulin (duty — burden register). |
| template | halimbawa | "Magsimula mula sa isang halimbawa" — transparent and warm, as id "contoh". DON'T: template kept English, padron (sewing patterns/parish registers), pormularyo (bureaucratic forms). |
| work day | bayanihan | THE word, used concretely (rule 4): "Bayanihan — {{project}}", "Magtakda ng bayanihan"; prose: "araw ng bayanihan". DON'T: work day kept English, araw ng trabaho (HR working day), "team building" flavor. |
| shift | turno | The everyday Spanish-era turn word: "Sumali sa turno sa umaga", "Nasa turnong ito ka". DON'T: shift kept English (factory register), duty (hospital register). |
| sign-up (for a shift) | isulat ang pangalan mo | The paper sign-up-sheet idiom: "Isulat ang pangalan mo sa turnong ito", "Burahin ang pangalan mo". Keep this family for shifts ONLY (see RSVP). DON'T: magparehistro (rule 5), mag-sign up (funnel verb). |
| RSVP | sagot kung dadalo (always carries dadalo/pagdalo) | Heading: "Ipaalam sa lahat: dadalo ka ba?"; "Sagot mo: {{status}}". Bare kumpirmasyon is RESERVED for exchange confirmations; bare sagot is message replies — so RSVP always carries dadalo. DON'T: keep "RSVP", kumpirmasyon ng pagdalo (wedding-card officialese), isulat ang pangalan (collides with shifts). |
| rota (care rota) | salitan sa pag-aalaga | Magsalitan is the by-turns kitchen word: "nagsasalitan ang magkakapitbahay sa pag-aalaga". A rota slot: "ikaw na ang susunod sa salitan". DON'T: duty roster, iskedyul ng bantay (guard-duty flavor), turno (reserved for shifts). |
| proposal | mungkahi | Page: "Mga mungkahi"; "mungkahi mula sa komunidad" — imungkahi is everyday suggesting. DON'T: **panukala** (panukalang-batas — a legislative bill), proposal kept English (also the marriage proposal), resolusyon (board-meeting minutes). |
| affirm (a proposal) | sang-ayon | Button "Sang-ayon"; count: "{{count}} ang sang-ayon" — "Sang-ayon ako" is the lived consensus phrase, hands raised together, not admin approval. Blocking a proposal: pigilan muna ("Pigilan muna") — keeps i-block reserved for contacts. DON'T: aprubahan (approval from above), bumoto (parliamentary voting), i-like. |
| block (a contact) | i-block | The universal app word (Messenger fil uses it): "I-block ang contact na ito", "I-unblock". RESERVED for contacts; a proposal is pigilan muna (previous row). DON'T: harangan (a roadblock), ipagbawal (an official ban). |
| flag (an exchange/comment) | markahan | "May hindi tama — markahan", "Markahan para pag-usapan ng komunidad". DON'T: **i-report** (report-to-the-authorities — "ire-report kita sa barangay" is a lived threat; there is no authority here), **isumbong** (tattling/denunciation), ireklamo (customer complaint). |
| dispute | hindi pagkakasundo | Page: "Hindi pagkakasundo" — the everyday falling-out phrase, no courtroom in it; status: "Pinag-uusapan ng komunidad" (chip: "Pinag-uusapan") — pag-usapan natin is the lived deliberation idiom. DON'T: kaso (a court case), demanda ("idedemanda kita" — lawsuit), reklamo (complaint desk), gulo (trouble/shame). |
| member | miyembro | The everyday word — Facebook fil's own rendering for group members. DON'T: user / gumagamit, kliyente/customer (poison), kasapi (bylaws register — rule 5), mamamayan (citizen — state address), ka-barangay (LGU flavor — rule 4). |
| neighbor | kapitbahay | "kapitbahay mo"; collective warmth: "magkakapitbahay", "buong kapitbahayan". DON'T: residente (building-admin register), ka-barangay (rule 4), kababayan (countryman — too wide). |
| community | komunidad | The standard warm word. DON'T: barangay (a government unit — rule 4), pamayanan (textbook-literary), samahan (a formal org), lipunan (society-at-large), grupo (chat group). |
| invite (noun + verb) | imbitasyon / imbitahan | "Imbitahan ang kakilala mo", "ang nag-imbita sa iyo" — the birthday-party word, warm and lived. One family only. DON'T: i-invite (keep the grep to one family), paanyaya (formal-wedding register as the default). |
| guardian (shard holder) | tagapag-ingat | RESERVED WORD: tagapag-ingat only ever means a recovery-shard holder — ingatan is what you say handing over something precious ("Ingatan mo ito, ha"). Gloss on first use: "bawat isa may hawak na kapiraso ng susi ng iyong pagbabalik". The school-form trap is DOUBLE in the Philippines: forms say "guardian" in English AND "tagapag-alaga" in Filipino — so BOTH are banned here (tagapag-alaga would also collide with the alaga care family). DON'T: guardian kept English, tagapag-alaga, katiwala (a property overseer/caretaker-employee), admin. |
| recovery kit | kit ng pagbabalik | Gloss on first use: "kit ng pagbabalik (backup na nagbabalik ng account mo)". The warm recovery verb is ibalik/bumalik: "ibalik ang account mo". A shard: kapiraso ng susi. DON'T: first-aid-kit flavor, factory reset confusion, backup file (flattens the promise). |
| password / passphrase | password / passphrase (both kept English) | Password is the lived word (kontrasenyas is a coinage nobody says), so the long-form sibling stays English too, distinct and greppable; gloss on first use: "passphrase (mahabang password na binubuo ng ilang salita)". A native coinage — "pangungusap na pambukas" was weighed — would be a phrase no Filipino has ever seen guarding the most dangerous flow in the app; honesty wins. DON'T: kontrasenyas, hudyat (a signal/watchword), pangungusap na pambukas. |
| passkey | passkey (kept English) | Gloss on first use, matching en's member-facing promise: "passkey — buksan gamit ang fingerprint, mukha, o PIN ng device mo". Same reasoning as the siblings: any coinage would blur into password/passphrase in a security flow. DON'T: susi ng account, "digital key" flavor. |
| ledger | talaan ng buong komunidad | The shared record book: "nakatala sa talaan ng buong komunidad". Device-local (en's parenthetical): "sariling talaan ng device na ito". DON'T: ledger kept English (accounting/blockchain), **listahan ng utang** (never — rule 3), logs. |
| milestone | bagong narating | "May bagong narating ang komunidad" — a place reached together, the journey framing. DON'T: milestone kept English, muhon (a land-survey boundary stone — property-dispute flavor), target/quota (KPI). |
| skills | mga kakayahan | Field: "Mga kakayahan mo"; headings prefer "ano-ano ang kaya mong gawin" — the kitchen framing. DON'T: skills kept English, kasanayan (TESDA vocational-training register), talento (talent show), kwalipikasyon (HR). |
| panic (the emergency wipe) | sa oras ng panganib | "Pindutan ng panganib"; gloss on first use: "kapag nasa panganib ka na: burahin agad ang lahat sa device na ito". Panganib is the plain danger word; keeps **Emergency** (kept English — the utterly lived word: "in case of emergency") RESERVED for the Emergency section. DON'T: panic kept English ("nag-panic" is the clinical state, not a feature), SOS mode, emergency (reserved). |
| soft purge / hard purge | burahin nang bahagya (itago ang pagkakakilanlan) / burahin nang tuluyan (burahin ang lahat) | One bura family, kitchen-plain (burahin ang pisara), honest about the difference: bahagya strips identifying text and keeps the signed talaan; tuluyan wipes keys and rotates identity. Note the nang (rule 7). DON'T: purge kept English, i-delete mixed into the family (one family only), linisin (janitorial), factory reset confusion. |
| seed vault | kamalig ng binhi | Kamalig is the village rice granary — held for the lean season; the resonance is exact: "Ang device na ito ay kamalig ng binhi — iniingatan ang buong kasaysayan ng komunidad." DON'T: bodega (commercial warehouse), vault (bank), backup server (flattens the metaphor). |
| storm hub | silungan | Sumilong is lived typhoon-country vocabulary — ducking under a roof THROUGH the downpour ("Silong muna!"): gloss "silungan — may kuryente at Wi-Fi kapag patay na ang lahat ng iba". DON'T: **sentro ng bagyo** (the storm's own center — the trap every sibling dodged), evacuation center / "evac" (displacement officialese), hub kept English. |
| One small thing | Isang maliit na bagay lang | Button: "Ipakita ang isang maliit na bagay lang" — lang is the disarming particle. DON'T inflate to "isang maliit na gawain" here. |
| helper (person in an exchange) | ang tumulong | "Naitala ang oras para sa tumulong"; field: "Tumulong" — simply the one who helped. The trap is double: **katulong is banned absolutely** (domestic servant — the id pembantu trap exactly) and **"helper" kept English is banned** (the OFW domestic-helper register). DON'T: katulong, helper, boluntaryo/volunteer (institution register — neighbors here just help), assistant. |
| Ways to plug in | Mga paraan para makibahagi | Makibahagi is the taking-part word built on the paki- of shared doing; mirrors es "Formas de participar". DON'T: "maging volunteer", "sumali sa amin" (recruiting page AND banned kami), partisipasyon (seminar-speak). |
| celebrate / celebration | ipagdiwang / pagdiriwang | Category: "Pagdiriwang"; "Ipagdiwang natin" — fiesta culture keeps this word warm and alive. DON'T: i-celebrate, seremonya (officialdom), okasyon (event-planner flavor). |
| gleaning (template corpus) | pamumulot ng natirang ani | The Gleaning Network template: "samahan sa pamumulot ng natirang ani" — the phrase ALWAYS carries ani, because bare pamumulot slides toward waste-picking shame register. DON'T: pangangalakal (junk-trade), bare mamulot without ani. |
| organizer / operator | ang nag-aayos / ang nagpapatakbo ng node | "ang nag-aayos ng proyektong ito" — sorted, no title attached; "kung sino ang nagpapatakbo ng server para sa komunidad — malinaw ang kaya niya, malinaw ang hindi" (compact label: "operator ng node"). DON'T: admin / administrator (contradicts the no-admins framing), komite, tagapamahala (management register). |
| founder / co-founder | tagapagtatag / kasamang tagapagtatag | "ang tagapagtatag ng komunidad na ito". DON'T: may-ari (owner), presidente, "founder" kept English. |
| display name | pangalang pantawag | The name people call you by: "Ang pangalang gusto mong itawag sa iyo (hindi kailangang totoong pangalan — ikaw ang pipili)". DON'T: username, buong pangalan (the ID-card field), palayaw (childhood pet name — too diminutive for the field). |
| owed help | naghihintay ng kumpirmasyon mo | Badge: "Naghihintay ng kumpirmasyon"; "{{hours}} oras ang naghihintay ng kumpirmasyon mo". Deliberately NOT utang — the app refuses debt framing (rule 3). |

## Known hard strings

- **In my care** → "Inaalagaan ko" — alaga keeps the tending-a-person
  warmth, and the bare ko keeps the nav pill short and personal.
- **Grow another root** → "Magpausbong ng bagong ugat" — usbong keeps
  the metaphor botanically pure; the obvious verb (magpatubo) means
  charging loan interest, banned by rule 3 anyway.
- **tended** → "Inaalagaan" — the verb for a plant or a sick neighbor,
  exactly the relationship the commons asks for.
- **seed balance** → "panimulang binhi" / "binhing oras" — binhi
  carries planting hope, not banking; balanse never appears.
- **Dashboard** → "Pintig" ("Pintig ng komunidad") — the sibling pulse
  family as the Filipino heartbeat; pintig ng puso is idiom.
- **storm hub** → "silungan" — the lived shelter-from-the-rain word,
  refuge THROUGH the storm, never sentro ng bagyo (its center).
- **vouch** → the panagot family, always managot PARA kay/sa —
  answering for someone with your own name, kept clean because piyansa
  (bail), garante/co-maker, and every money word are banned file-wide.
- **guardians** → "mga tagapag-ingat" — the keeper-of-something-
  precious word; BOTH halves of the Philippine school form ("guardian"
  AND tagapag-alaga) are banned, dodging legal guardianship and the
  alaga collision at once.
- **panic button** → "Pindutan ng panganib" — panganib is the plain
  danger word; Emergency (the lived English word) stays reserved for
  the Emergency section.
- **hard purge** → "Burahin nang tuluyan (burahin ang lahat)" — the
  bura family is kitchen-plain (burahin ang pisara), and
  bahagya/tuluyan states the difference honestly.

## Quick self-check for translators

- Would a neighbor text you this string? If not, redo it.
- `grep` for po/opo/ho and kayo/ninyo-as-deference — zero hits; the
  member is ka/mo, warmth from lang/naman/muna/ha (rule 1). kami,
  namin, amin — zero hits outside the translation-honesty note;
  inclusive "we" is tayo/natin (rule 2).
- `grep` for utang, pautang, bayad, singil, hulugan, tubo, balanse,
  kredito — zero hits outside the explicit debt-rejection lines
  (which may name utang na loob once, precisely to refuse it); owed
  help is "naghihintay ng kumpirmasyon" (rule 3). No hiya framing
  around asking, even negated.
- `grep` for Mangyaring, pakiusap, serbisyo, kliyente, user,
  gumagamit, benepisyaryo, magparehistro — zero hits; help is tulong,
  members are miyembro, joining is sumali (rule 5). promo, diskwento,
  cashback, puntos, voucher, i-claim — zero hits; voucher doubly so
  (vouch false friend).
- `grep` for bayanihan — hits only on the work-day feature and
  concrete collective-work prose (rule 4). pakikiramay, abuloy,
  ambagan, barangay-as-community — zero hits; kapwa and palusong live
  only in teaching/authored prose.
- panagot-root only ever means vouching, always managot PARA kay/sa;
  piyansa, garante, co-maker, isponsor — zero hits; "ensure" is
  siguraduhin/tiyakin. katulong and "helper" — zero hits (the one who
  helped is "ang tumulong"). tagapag-alaga and "guardian" — zero hits
  (shard holders are mga tagapag-ingat). i-report and isumbong — zero
  hits (flagging is markahan). sentro ng bagyo — zero hits (the
  refuge is silungan).
- English loans: one affixation per verb, hyphen before English stems
  (i-scan, na-save, mag-download), no respellings; node / passkey /
  passphrase / password / QR code kept verbatim with first-use
  glosses (rule 6).
- One spelling per word: puwede, mayroon, ganoon; din/rin daw/raw
  alternation consistent; ng vs nang eyeballed everywhere ("burahin
  nang tuluyan") (rule 7). Text is NFC; no directional controls.
- `{{…}}` placeholders identical to en; every `_one` key present and
  carrying {{count}} — NEVER a hard-coded "isang …" in `_one`,
  because fil CLDR selects "one" for 2, 3, 5, 7… (rule 11); no mga
  after a numeral.
- Buttons and chips carry no terminal punctuation; quotes are curly
  “ ”; ellipsis is the single-char …; em dash spaced (rule 8); nav
  and pill labels stay short and wrap rather than truncate (rule 9).
- If a string reads like a barangay-hall circular, a telco apology, or
  a GCash promo, it's the wrong register — rewrite it the way you'd
  text your kapitbahay (rule 5).
- "Understoria" untouched.
