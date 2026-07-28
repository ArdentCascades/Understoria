# Hindi (hi) translation glossary

Reference for every bulk-translation and review pass over `hi.json` and
the Hindi content modules. Decisions here get applied ~2,900 times —
when in doubt, pick the word a Hindi-speaking neighbor would say across
a kitchen table, not the word a government form, a bank SMS, or a news
anchor would use.

**Locale code is `hi`** (language-only): browsers send `hi` and
`hi-IN`, and i18next's language-only fallback resolves both. The
register is contemporary spoken Hindustani written in Devanagari — the
Hindi of WhatsApp and Google's hi-IN products, not shuddh-Hindi
officialese. **Urdu (`ur`) is a separate future locale**, not a
transliteration target: it shares the spoken base but forks the script
(Nastaliq, RTL — gated on the RTL phase) and plenty of vocabulary, so
nothing here should ever be auto-converted; it gets its own glossary
when its wave comes.

## Global register decisions

1. **आप, uniformly — and never तू or तुम.** Hindi has a three-step
   gradient (तू / तुम / आप), so this is NOT the tú/tu/你 call the
   sibling locales made. आप is not the cold counter-register that
   French "vous" or Chinese 您 are — it is the normal warm address a
   community organizer uses across a kitchen table with a neighbor
   they've just met, an elder, anyone they respect. तुम to an unknown
   adult reads presumptuous or top-down (an NGO worker talking down),
   and तू is intimate-or-insulting. The warmth must come from word
   choice (rule 2), not from downgrading the pronoun. **The choice is
   uniform across all ~2,900 strings** — a single stray तुम verb form
   (करो, बताओ, तुम्हारा) reads as a different person suddenly talking.
   This also matches every major hi-IN product (WhatsApp, Google,
   Paytm), so it's what members' thumbs already expect.
2. **Warm, plain Hindustani** over Sanskritized bureaucratic Hindi.
   Banned outright: कृपया as reflexive padding (most requests read
   better without it — plain कृपया survives only where en itself says
   "please"), प्रयोग करें / उपयोग करें padding (इस्तेमाल करें, or just
   the verb), प्रदान करें (say दें), प्रयास करें (कोशिश करें), हेतु,
   अतः, यथाशीघ्र, सूचित किया जाता है, संपन्न हुआ, प्रिय उपयोगकर्ता,
   आदरणीय सदस्य, श्री/श्रीमती titles, "-जी" honorifics — and सेवा for
   help between members (मदद is help; सेवा is what a company's
   support line sells). Say "हाथ बँटाएँ", not "सहायता प्रदान करें".
   Equally banned: e-commerce coupon-speak (ऑफ़र for offers, रिवॉर्ड,
   कैशबैक flavor) — this app sells nothing.
3. **No-shame framing.** Never debt vocabulary for exchanges: no
   क़र्ज़, ऋण, उधार, बकाया, देनदारी, कर्ज़दार, चुकाना ("आप पर 3 घंटे
   चढ़े हैं" is forbidden). Note the split: **बाकी** (remaining,
   pending — fine: "पुष्टि बाकी") vs **बकाया** (arrears — banned).
   Debt words may appear ONLY where en itself explicitly rejects debt
   framing ("this is not a loan" → "यह कोई क़र्ज़ नहीं है").
4. **Gender — the strategy, in order.** Hindi verbs and adjectives
   inflect for gender and the member's gender is unknown, so: (a)
   prefer constructions that never gender the member — imperatives and
   subjunctives (करें, देखें, चुनें are genderless), ने-perfectives
   where the verb agrees with the OBJECT ("आपने हामी भरी" is correct
   for everyone — भरी agrees with हामी), and dative आपको framings
   ("आपको यह यहाँ मिलेगा"); (b) where subject agreement is truly
   unavoidable (सकते हैं, करेंगे, आए), use the masculine-plural
   honorific as the unmarked generic — the universal hi-IN product
   convention (WhatsApp: "आप ग्रुप बना सकते हैं"); (c) **never slashed
   or bracketed forms** (करेंगे/करेंगी, गया(गयी)) — they garble
   read-aloud (`lib/speak.ts`) and screen readers. Third persons: वे +
   plural honorific verbs (respectful AND lighter on gender), "यह
   सदस्य", "आपके पड़ोसी", or repeat the name.
5. **Numerals are ASCII digits (0–9), never Devanagari (१२३).**
   "5 घंटे", never "५ घंटे". This matches hi-IN platform convention
   (Android, WhatsApp, Google), `Intl.NumberFormat("hi")`'s default,
   and what every phone keyboard produces. Digits take normal spaces
   from Devanagari words, as Hindi is natively spaced.
6. **Punctuation: the danda (।) ends Devanagari sentences.** It is the
   living convention of contemporary Hindi apps and print, not an
   archaism — a Latin period after a Devanagari sentence is the thing
   that looks foreign. No space before the danda; it hugs the word.
   The Latin period survives only in technical literals — URLs, file
   paths (`docs/operator-powers.md`), extensions (.ics), decimals —
   and after a sentence that ENDS in Latin-script material. Questions
   use ?, exclamations use ! (standard in Hindi). Headings, buttons,
   and chips take no terminal punctuation, as in en. Ellipsis: the
   single-char … ("हामी भरी जा रही है…"). Em dash: " — " with plain
   spaces, as en/es. Quotes: curly " " (Hindi has no native quote
   marks; this is the modern convention). Latin-script product names
   verbatim, never re-punctuated.
7. **One spelling per word, nukta included.** Write standard modern
   forms with the nukta consistently: ज़रूरत, फ़ोन, ख़तरा, तरीक़ा,
   जवाब — never a nukta'd and nukta-less spelling of the same word in
   one file. Chandrabindu where standard (बाँटना, आँधी, पाँच). Hindi
   runs ~15–25% longer than English and Devanagari is TALLER (matras
   above and below the line): the layout smoke must check tight pills
   and the bottom nav for matra clipping, and overflows wrap — never
   truncate mid-word.
8. **Loanword policy — three tiers, following hi-IN app convention.**
   (a) Proper nouns, codes, and technical literals stay in Latin
   script verbatim: Understoria, QR (as "QR कोड" — the
   WhatsApp/Google convention), URLs, file paths, env vars. (b)
   Established tech loanwords are transliterated into Devanagari: ऐप,
   सर्वर, कोड, बटन, फ़ोन, डिवाइस, कैलेंडर, ब्राउज़र, कैमरा, प्रोफ़ाइल,
   पासवर्ड, पासफ़्रेज़, क्रेडिट, ब्लॉक, किट, टाइम बैंक, प्रोजेक्ट.
   Never the shuddh coinages (संगणक, अनुप्रयोग, कूटशब्द,
   पुनर्प्राप्ति — all banned). (c) Where a natural everyday Hindi
   word exists, it wins over the loan: मदद not हेल्प, बोर्ड पर लगाना
   not अपलोड, साँचा not टेम्पलेट. The test is always "which word would
   the neighbor actually say" — not maximal Hindi, not maximal
   English.
9. **"Understoria" is never translated** or transliterated into
   Devanagari. Same for file names, env vars, and `docs/…` paths
   quoted in strings.
10. **Interpolation placeholders verbatim**: `{{count}}`, `{{name}}`,
    `{{hours}}`… byte-for-byte identical (parity test enforces this).
11. **Plurals:** Hindi CLDR needs `_one` and `_other`, and Hindi
    `_one` covers **BOTH 0 and 1** (like fr/pt): "0 घंटा" must read
    correctly. Mind Hindi's own number agreement inside the string —
    direct plural घंटे, oblique plural घंटों ("{{count}} घंटों की
    मदद"), and postpositions force the oblique. Never delete a `_one`
    key; the parity test will fail the file.

## Term table

| English | Hindi | Notes / DON'T use |
|---|---|---|
| vouch for (verb) | हामी भरना | What a neighbor says: "मैं इनके लिए हामी भरता हूँ"। Button: "{{name}} के लिए हामी भरें" (genderless imperative). DON'T: ज़मानत देना (bail/surety — courtroom), सिफ़ारिश करना (sifarish — string-pulling connotation), समर्थन (political endorsement), प्रमाणित करना (certification). |
| a vouch (the signed act) | हामी (fem.) | "आपकी भरी हुई हामी", "दो सदस्यों की हामी के साथ"। ने-perfective is naturally genderless: "आपने हामी भरी"। |
| vouches (count on trust chips) | {{count}} सदस्यों की हामी | One vouch = one distinct person, so count people: "भरोसेमंद ({{count}} सदस्यों की हामी)", "आपके पास {{have}}/{{need}} हामी हैं"। |
| vouched by | {{name}} ने आपके लिए हामी भरी | Object agreement keeps it genderless for everyone. |
| fully vouched | समुदाय का पूरा भरोसा | Mirror es "de plena confianza": "जब समुदाय आप पर पूरा भरोसा जता चुका हो"। DON'T: पूर्ण सत्यापित (verification officialese). |
| trust / trusted member | भरोसा / भरोसेमंद सदस्य | Chip: "भरोसेमंद"। Web of trust: भरोसे का ताना-बाना (the weave — warmer and truer than any "chain"). DON'T: विश्वास as the workhorse (heavier register; भरोसा is the kitchen-table word), सत्यापित (verified). |
| seed balance | शुरुआती बीज | es keeps the metaphor ("semilla inicial") and so do we: "आपका बैलेंस ठीक आपके शुरुआती बीज पर है"। Chip: "बीज: {{hours}}"; seed credits = बीज घंटे। Plain in teaching prose: "हर कोई 5 घंटों से शुरू करता है"। DON'T: पूंजी (capital), जमा राशि (bank deposit), बोनस (promo — poison here). |
| hours (the currency) | घंटे | "किसी भी मदद का एक घंटा एक घंटे के ही बराबर है"। Credit = क्रेडिट; credit moves → "क्रेडिट आगे बढ़ता है"। Oblique: घंटों (rule 11). DON'T: अंक/पॉइंट (loyalty points), सिक्के (coins/crypto), मानदेय (honorarium officialese). |
| node | नोड | Keep the teaching gloss: "नोड (वह साझा सर्वर जो आपका समुदाय मिलकर चलाता है)"। RESERVED WORD: नोड means the server and nothing else. DON'T: leave "node" in Latin script; गाँठ (a knot); सर्वर alone only where en itself says just "server". |
| community node | आपके समुदाय का नोड | Peer nodes: साथी नोड (es "nodos aliados"; साथी carries the companionship). |
| federation | आपस में जुड़े समुदाय | Prefer the rephrasing in prose: "Across the federation" → "जुड़े हुए समुदायों में"। Where a bare noun is unavoidable: फ़ेडरेशन (transliterated). DON'T: **संघ — banned outright** (in Indian discourse "संघ" IS the RSS; the collision is total), महासंघ (sports-body officialese), परिसंघ. |
| exchange | अदला-बदली | "मदद की अदला-बदली"; confirmed: "अदला-बदली की पुष्टि हो गई"। DON'T: लेन-देन (dealings/commerce ledger flavor), सौदा (a deal), ट्रांज़ैक्शन, आदान-प्रदान (seminar officialese). |
| the commons (section) | साझी अमानत | अमानत is the warm Hindustani word for a thing held in trust — exactly what a tended commons is: "यह समुदाय की साझी अमानत है"। A single one: "एक साझी अमानत"; section: "साझी अमानतें"। DON'T: सार्वजनिक संपत्ति (state property), साझा संसाधन (NGO-workshop jargon), धरोहर (heritage-monument register), कॉमन्स. |
| tended (commons status) | देखभाल में | Chip: "देखभाल में"; prose: "समुदाय की देखभाल में"। Matches the app's care framing. DON'T: रखरखाव (building/IT maintenance), प्रबंधित (managed — administrative). |
| retired (commons status) | आराम में | Deliberate non-literal, mirrors fr "au repos" / zh 歇息中: "इस अमानत को आराम दें" honors the no-shame lifecycle (it can come back). DON'T: सेवानिवृत्त (pension-office register), बंद (shut down — final), हटाया गया (collides with member removal). Distinct from "संग्रहीत नहीं — आर्काइव" (archived = आर्काइव में). |
| In my care (nav) | मेरी देखभाल में | Keeps the care framing; prose: "यह आपको 'मेरी देखभाल में' के नीचे मिलेगा"। If the nav pill overflows, wrap — don't truncate (rule 7). DON'T: मेरे काम (flattens care to tasks), मेरी ज़िम्मेदारियाँ (burden-heavy). |
| Grow another root (add-a-server flow) | एक और जड़ जमाएँ | जड़ जमाना is the natural taking-root idiom; mirrors es "Hacer crecer otra raíz". DON'T: सर्वर जोड़ें, नया नोड लगाएँ (both flatten the metaphor to IT). |
| timebank | टाइम बैंक | The transliteration Indian timebank pilots themselves use; both halves are everyday spoken Hindi. Keep the SURROUNDING prose non-bank: "टाइम बैंक में मदद माँगने पर कोई रोक नहीं"। DON'T: समय बैंक (reads like a scheme name), समय कोष (treasury officialese). |
| mutual aid | आपसी मदद | The kitchen-table phrase: "आपसी मदद के घंटे"। DON'T: पारस्परिक सहायता (the officialese calque), परोपकार (charity — hierarchical), दान (donation), सेवा (rule 2). |
| board | बोर्ड | Nav: "बोर्ड"; first-use gloss: "समुदाय का नोटिस बोर्ड" — the physical corkboard every colony, society, and mohalla has. DON'T: सूचना पट्ट / पटल (wall-notice officialese), फ़ोरम, मंच (a stage — political-rally flavor). |
| dashboard | एक नज़र में | "At a glance" — warm, and dodges a बोर्ड collision. DON'T: डैशबोर्ड (car/BI jargon), होम (home), अवलोकन (report-speak). |
| needs | ज़रूरतें | Tab/chip: "ज़रूरतें"। DON'T: आवश्यकताएँ (form-filling officialese), माँगें (demands — protest register), अभाव (lack — shame-laden). |
| offers | पेशकशें | Tab: "पेशकशें"; prose: "मदद की पेशकश"। DON'T: **ऑफ़र** (in India this means discount deals — poison here), प्रस्ताव (reserved for governance proposals), सेवाएँ (rule 2). |
| projects | प्रोजेक्ट | The everyday word. DON'T: परियोजना (government-scheme register). |
| task | काम | "एक छोटा-सा काम"। DON'T: कार्य (officialese), टास्क (corporate-app anglicism). |
| post (noun) | पोस्ट | What Hindi speakers actually call it; the board metaphor lives in the verb instead (next row). "एक पोस्ट"। DON'T: विज्ञापन (advertisement), सूचना (notice officialese), संदेश (collides with messages). |
| post (verb) | बोर्ड पर लगाना | Sticks the notice up: "अपनी ज़रूरत बोर्ड पर लगाएँ"। पोस्ट करना acceptable in technical contexts (sync explanations). DON'T: प्रकाशित करें (publishing officialese), डालें (dump-flavor colloquial). |
| claim (a post/task) | ज़िम्मा लेना | "इस काम का ज़िम्मा लें", "{{name}} ने ज़िम्मा लिया" — taking something into your care; matches the nav framing. DON'T: **दावा करना** (legal claim — the classic trap), क्लेम (insurance), हथियाना (grabbing), बुक करना (gig-economy). |
| template | साँचा | The mould word — "साँचे से शुरू करें", plural साँचे। Transparent and warm. DON'T: टेम्पलेट (fine in speech, but साँचा is better Hindi and fits), प्रारूप (form-format officialese). |
| work day | श्रमदान | THE Indian word for a community giving a day of collective labor — exactly this feature (pt reserved "mutirão" the same way). "श्रमदान — {{project}}", "श्रमदान तय करें"। DON'T: कार्य दिवस (HR calendar's "working day"), वर्क डे. |
| shift | पारी | The turn/innings word — everyday and warm: "एक पारी में नाम लिखवाएँ", "आप इस पारी में हैं"। DON'T: शिफ़्ट (factory register), ड्यूटी (duty-roster), बारी (reserved for the rota — next rows). |
| sign-up (for a shift) | नाम लिखवाना | The community sign-up-sheet idiom: "अपना नाम लिखवाएँ", "नाम हटाएँ"। Keep this family for shifts ONLY (see RSVP). DON'T: पंजीकरण (registration officialese), रजिस्टर करें. |
| RSVP | आने का जवाब | Heading: "बताएँ कि आप आ रहे हैं या नहीं"; "आपका जवाब: {{status}}", "जवाब बदलें"। The compound "आने का जवाब" keeps bare जवाब free for message replies in the conversation UI — a real collision. DON'T: keep "RSVP", नाम लिखवाना (collides with shifts), उपस्थिति दर्ज करें (attendance-register officialese). |
| rota (care rota) | देखभाल की बारियाँ | बारी-बारी (by turns) is the rota concept in pure kitchen Hindi: "बारी-बारी देखभाल चलती रहती है"। A rota slot: "बारी" ("अगली बारी फिर खुल जाती है")। DON'T: रोस्टर (HR), ड्यूटी चार्ट (chowkidar-register), कार्यसूची. |
| proposal | प्रस्ताव | "समुदाय का प्रस्ताव", page "प्रस्ताव"। The one standard word; keep the surrounding prose warm so it never reads parliamentary. DON'T: प्रस्तावना (a preamble), सुझाव (too weak — just a suggestion). |
| affirm (a proposal) | साथ देना | Button "साथ दें"; count: "{{count}} लोगों का साथ"। Standing with it — consensus register, not admin. Block on proposals stays रोकना ("रोकें"). DON'T: मंज़ूरी देना (approval from authority), समर्थन (party-politics flavor), वोट करें, लाइक. |
| block (a contact) | ब्लॉक करना | The universal app word (WhatsApp hi uses it): "संपर्क ब्लॉक करें", "अनब्लॉक करें"। RESERVED for contacts; blocking a proposal is रोकना (previous row). DON'T: अवरुद्ध करना (shuddh), प्रतिबंधित (legal ban). |
| removal (of a member) | हटाना | "किसी सदस्य को समुदाय से हटाना" — honest, not shame-laden. DON'T: निष्कासन (expulsion officialese), **बहिष्कार** (boycott/ostracism — carries caste-excommunication weight; absolutely not), निकालना (fired-from-a-job), बैन. |
| removal ceremony | हटाने की रस्म | रस्म is the lived community-ritual word; keep the ritual — it is deliberate in en. DON'T: समारोह (a function/event), अनुष्ठान (religious rite), प्रक्रिया (procedure — flattens it). |
| reinstatement | वापसी | "{{name}} की वापसी" — the door reopening, warm and plain. Verb: "वापस अपनाना" ("समुदाय ने उन्हें वापस अपनाया")। DON'T: बहाली (suspended-government-servant register), पुनः प्रवेश (readmission officialese). |
| member | सदस्य | Naturally common-gender ("यह सदस्य" covers everyone) — the workhorse for dodging gendered forms (rule 4). DON'T: उपयोगकर्ता / यूज़र (user), मेंबर (say it, don't write it), ग्राहक (customer — poison). |
| neighbor | पड़ोसी | "आपके पड़ोसी" (plural honorific keeps it gender-light). Collective warmth: मोहल्ला, आस-पड़ोस ("मोहल्ले भर की मदद")। DON'T: निवासी (resident — society-notice register), पड़ोसन as the default (marked feminine, filmi flavor). |
| community | समुदाय | The standard word, warmed by context. DON'T: **बिरादरी** (caste/kinship connotations — never), समाज (society-at-large), कम्युनिटी. |
| invite (noun + verb) | न्योता / न्योता देना | The warm neighborly invitation (a wedding, a meal) — "किसी जान-पहचान वाले को न्योता दें", "जिसने आपको न्योता दिया"। DON'T: निमंत्रण / आमंत्रण (wedding-card formalese), इनवाइट. |
| guardian (shard holder) | रखवाला | RESERVED WORD: रखवाला only ever means a recovery-shard holder. "अपने भरोसेमंद सदस्यों को रखवाला बनाएँ"; gloss on first use: "रखवाले — जो आपकी वापसी की चाबी का एक-एक टुकड़ा सँभालते हैं"। Plural रखवाले keeps it gender-light. DON'T: संरक्षक (patron/legal guardian), अभिभावक (parent-guardian of minors — the school-form trap, same as fr "tuteur"), गार्जियन. |
| recovery kit | रिकवरी किट | Loanword tier (b): both halves are everyday app Hindi. The recovery verb is वापस पाना: "अपना खाता वापस पाएँ"। DON'T: पुनर्प्राप्ति किट (shuddh horror), प्राथमिक उपचार flavor (first-aid), बैकअप फ़ाइल (flattens the promise). |
| passphrase | पासफ़्रेज़ | Transliterate like पासवर्ड — the established convention; gloss on first use: "पासफ़्रेज़ (कई शब्दों वाला लंबा पासवर्ड)"। DON'T: कूटशब्द / गुप्त वाक्यांश (officialese), सांकेतिक शब्द. |
| ledger | बही | The traditional shared account-book — instantly familiar and warm: "समुदाय की साझा बही"। The device-local record book (en's parenthetical) is glossed "इस डिवाइस की बही (इसका अपना हिसाब-किताब)" — हिसाब-किताब is neutral bookkeeping, not debt (rule 3 still bans बकाया)। DON'T: लेजर, खाता-बही (bank passbook flavor), लेखा (audit officialese), अभिलेख (archive-record shuddh). |
| dispute | विवाद | Page: "विवाद"; status framing: "समुदाय मिलकर सुलझा रहा है" (short chip: "सुलझ रहा है")। DON'T: शिकायत (customer-service complaint), मुक़दमा (court case), झगड़ा (a brawl), रिपोर्ट करना (surveillance register — absolutely not). |
| milestone | पड़ाव | A halt on a journey: "पड़ाव पूरा हुआ"। "मील का पत्थर" is fine in longer prose. DON'T: माइलस्टोन, चरण (just a stage), लक्ष्य (a target). |
| helper (person in an exchange) | मददगार | "मदद करने वाले को क्रेडिट मिला"; fields: "मददगार"। **स्वयंसेवक is banned** — volunteerism officialese, and in India it is also what RSS members are called; helping here is मदद, never volunteering-as-institution. DON'T: सहायक (an assistant — subordinate), वालंटियर. |
| skills | हुनर | The warm craft word: "आपके हुनर", "काम आने वाले हुनर"। DON'T: कौशल (Skill-India scheme register), स्किल्स, योग्यता (qualification). |
| panic (the emergency wipe) | ख़तरे के विकल्प | "ख़तरे का बटन"; gloss on first use: "ख़तरा सिर पर हो तो इसी डिवाइस पर सब कुछ फ़ौरन मिटाने के लिए"। Wipe = मिटाना ("सब कुछ मिटाएँ")। DON'T: घबराहट (the clinical state, not a feature), पैनिक, **आपातकाल** (in Hindi this IS the 1975–77 Emergency; the Emergency section itself should use "आपात स्थिति", so panic can't lean on it either way). |
| read aloud (feature) | पढ़कर सुनाना | What a family member does for someone who can't read the screen — exactly the promise: toggle "पढ़कर सुनाना", "ऐप पढ़कर सुनाएगा"। DON'T: वाचन (recital), टेक्स्ट-टू-स्पीच / वाक् संश्लेषण (tech spec, not the promise), बोलकर पढ़ें (reads as an instruction to the member). |
| seed vault | बीज भंडार | भंडार is the village granary/storehouse — the Svalbard resonance lands: "यह डिवाइस एक बीज भंडार है — समुदाय का पूरा इतिहास सँभाले हुए।" DON'T: तिजोरी (bank safe), सीड वॉल्ट, बैकअप सर्वर (flattens the metaphor). |
| storm hub | तूफ़ान में ठिकाना | ठिकाना is the warm "place to go"; the में construction says refuge IN the storm, dodging the storm's-own-center trap fr/pt/zh all dodged. "बिजली और WiFi वाला ठिकाना, जब बाक़ी सब ठप हो"। DON'T: तूफ़ान केंद्र (meteorological center), आपदा राहत केंद्र (disaster-relief officialese), हब, शरण स्थल (refugee register). |
| One small thing | एक छोटा-सा काम | Button: "मुझे एक छोटा-सा काम दिखाएँ"। छोटा-सा is the disarming diminutive — DON'T inflate to "एक छोटा कार्य"। |
| Ways to plug in | जुड़ने के तरीक़े | Mirrors es "Formas de participar". DON'T: योगदान करें (open-source flavor), भाग लेने हेतु (hetu officialese), हमसे जुड़ें (recruiting-page). |
| organizer | आयोजक | Prose keeps it human and gender-light: "जो इसे चला रहे हैं", "जिसने यह जुटाया"। DON'T: एडमिन, प्रबंधक (manager), संयोजक (committee-convener officialese). |
| operator (appears near node) | चलाने वाला | Transparent: "जो समुदाय के लिए सर्वर चलाता है, वही उसका चलाने वाला है — तयशुदा अधिकार, तयशुदा हदें"। Plural/honorific चलाने वाले when gender is unknown. DON'T: प्रशासक / एडमिन (contradicts the no-admins framing), संचालक (proprietor register), ऑपरेटर (mobile-network flavor). |
| display name | दिखने वाला नाम | "आपका दिखने वाला नाम (असली नाम ज़रूरी नहीं — जो चाहें रखें)"। DON'T: उपयोगकर्ता नाम (username), **उपनाम** (means SURNAME in Hindi — classic trap), निकनेम. |
| owed help | पुष्टि की राह देखती मदद | Badge: "पुष्टि बाकी"; "{{hours}} घंटे आपकी पुष्टि की राह देख रहे हैं"। Deliberately NOT क़र्ज़ / उधार / बकाया — the app refuses debt framing (register rule 3; बाकी ≠ बकाया). |

## Quick self-check for translators

- Would a neighbor say this out loud across a kitchen table? If not,
  redo it.
- `grep` for तुम forms — `तुम`, `तुम्हार`, ` करो`, ` बताओ`, ` देखो` —
  must be zero hits; address is आप, uniformly (rule 1). तू likewise.
- `grep` for क़र्ज़, ऋण, उधार, बकाया, देनदारी — zero hits outside
  explicit debt-rejection lines; owed help is "पुष्टि बाकी".
- `grep` for slashed gender forms (`/`, `(गी)`, `(ता)`) in verb
  endings — zero hits; restructure or use the honorific plural
  (rule 4).
- `grep` for उपयोगकर्ता, यूज़र, ग्राहक — zero hits; members are
  सदस्य. Same for स्वयंसेवक (helpers are मददगार) and संघ (federation
  is "जुड़े हुए समुदाय").
- `grep` for Devanagari digits `[०-९]` — zero hits; numerals are
  ASCII (rule 5).
- Devanagari sentences end in । (no space before it); the Latin
  period only after Latin-script/technical material (rule 6).
- One spelling per word, nukta consistent: ज़रूरत, फ़ोन, ख़तरा —
  never a mixed pair in one file (rule 7).
- `{{…}}` placeholders identical to en; every `_one` string reads
  right at 0 ("0 घंटा"); oblique plurals (घंटों) after postpositions
  (rule 11).
- If a string reads like a government circular (हेतु, अतः, प्रदान,
  सूचित किया जाता है), it's the wrong register — rewrite it in
  spoken Hindustani (rule 2).
- "Understoria" untouched.
