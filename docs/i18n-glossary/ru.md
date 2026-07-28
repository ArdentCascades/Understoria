# Russian (ru) translation glossary

Reference for every bulk-translation and review pass over `ru.json` and
the Russian content modules. Decisions here get applied ~2,900 times —
when in doubt, pick the word a Russian-speaking neighbor would say
across a kitchen table, not the word a government form (справка), a
bank SMS, or a housing-office notice (ЖЭК) would use.

**Locale code is `ru`** (language-only): browsers send `ru` and
`ru-RU`, and i18next's language-only fallback resolves both. One `ru`
serves Russia, Belarus, Central Asia, the Baltics, Israel, and the
worldwide diaspora — including Russian speakers in and from Ukraine.
That audience spans every side of live borders and a live war, which is
exactly why the politically-marked vocabulary rules below are strict:
this file must read as a neighbor's Russian, not any state's Russian.
**Ukrainian (`uk`) is a separate future locale**, not a conversion
target: nothing here is ever auto-converted; it gets its own glossary
when its wave comes. Russian is in Wave 2 to exercise the hardest LTR
plural system we ship — see rule 12 before translating anything with a
`{{count}}`.

## Global register decisions

1. **вы, uniformly — always lowercase — and never ты.** This is NOT
   the tú/tu/你 call the Wave-1 locales made, and the deciding
   argument is grammatical, not social. Russian past-tense verbs agree
   in gender with a singular subject: ты forces "ты сохранил / ты
   сохранила" — a forced guess at the member's gender, thousands of
   times, with no neutral escape (the same trap rule 6 fights
   everywhere else). вы takes PLURAL agreement — "вы сохранили", "вы
   были правы" — which is gender-neutral for every member, every time.
   вы is also simply what Russian software speaks: Telegram, VK,
   Google's ru surfaces, and Яндекс all address the user as lowercase
   вы; ты is confined to youth-brand marketing and games, where it
   reads as a brand performing familiarity — the opposite of this
   app's honesty. And Russian вы is not the cold counter-register
   French vous can be: between adults who've just met it is the normal
   warm address. The warmth must come from word choice (rule 3), never
   from downgrading the pronoun. **Uniform across all ~2,900
   strings** — one stray ты verb form (сохрани, твой, тебе) reads as
   a different person suddenly talking. The true counter-register is
   **capitalized mid-sentence Вы** — the obsequious business-letter
   convention — banned outright (see rule 3).
2. **Who is speaking.** (a) Buttons are the member's intent and take
   the standard Russian UI infinitive: «Сохранить», «Взять на себя»,
   «Показать одно небольшое дело» — never an imperative aimed at the
   member on a button. (b) Instructions TO the member take the вы
   imperative: «Проверьте эмодзи», «Выберите парольную фразу».
   (c) When the APP speaks, prefer no first person at all — Russian
   drops it naturally («Сохранено.», «Отправится, когда появится
   сеть.») — or name the real actor: приложение, узел, сообщество
   («Приложение прочитает вслух»). (d) **Corporate «мы» is banned as
   the app's voice** — «мы» with no company behind it is a lie in the
   first person plural. It survives only where en itself unmistakably
   speaks as the people who made the software (the translation-honesty
   note), nowhere else. A "we" that includes the member is «мы все» /
   «всё сообщество». Third persons: see rule 6.
3. **Warm, plain Russian over officialese (канцелярит).** Banned
   outright: осуществлять / производить + noun padding (осуществить
   проверку → проверить), **данный** as "this" (данное сообщение →
   это сообщение), вышеуказанный, нижеследующий, предоставить where
   дать works, необходимо as reflexive padding (нужно, or just the
   verb), во избежание, в случае если, по причине, имеется /
   отсутствует (есть / нет), является + noun and осуществляется
   passives (say what happens, actively), уважаемый пользователь, просим Вас, **capitalized Вы in any
   position**, and пожалуйста as reflexive padding (most requests
   read better without it; plain пожалуйста survives only where en
   itself says "please"). услуги for help between members is banned —
   помощь is help; услуги are what a company sells. Equally banned:
   e-commerce coupon-speak — акция, скидка, бонус, кешбэк, промокод,
   выгодно, спецпредложение. This app sells nothing.
4. **No-shame framing.** Never debt vocabulary for exchanges: no
   долг, задолженность, задолжать, должен/должны for helping,
   погасить, взыскать, расплатиться («вы должны сообществу 3 часа» is
   forbidden). **кредит is banned everywhere** — in Russian it is THE
   consumer-bank-loan word, and this app refuses debt framing; en's
   "credit" is rendered as часы or зачтено (see term table). Debt
   words may appear ONLY where en itself explicitly rejects debt
   framing ("this is not a loan" → «это не долг и не кредит»). Owed
   help is «ждёт подтверждения», never owed anything.
5. **Politically-marked vocabulary — the standing ban list.** The
   audience spans borders and a war; these words carry registers this
   app must never speak in. Banned: **товарищ** in any address or
   member word (Soviet address); **донос-register words for flagging**
   — донести, доносить, донос, стучать, and жаловаться / жалоба /
   пожаловаться as the flag verb (VK's «Пожаловаться» is exactly the
   register we refuse — see the flag row); **доброволец** (in current
   Russian this is a military volunteer — helpers are помощники);
   **зачистка** for any wipe (military mopping-up); **сводка** for
   summaries (front-line reports); **рубеж** for milestones (defense
   lines); **союз** for the federation (the Union IS the USSR);
   **гарант** for guardians (the Guarantor is a constitutional
   epithet); убежище / укрытие for the storm hub (air-raid signage
   register today); ЧС / чрезвычайная ситуация (ministry-of-
   emergencies officialese — the Emergency section is «экстренное»).
   The **субботник** decision is argued in the work-day row.
6. **Gender — the strategy, in order.** The member is always вы +
   plural agreement (rule 1), which solves the second person
   completely. For THIRD persons of unknown gender: (a) prefer
   constructions that never inflect — present/future tense
   («{{name}} берёт это на себя»), nominal framings («За этим делом —
   {{name}}», «Ваш ответ: {{status}}»), or restructure so the named
   person isn't the past-tense subject; (b) «этот участник», «ваш
   сосед», or repeat the name; (c) where subject agreement is truly
   unavoidable, the unmarked masculine is the standing Russian
   product convention («участник подтвердил») — accept it rather
   than invent forms; (d) **never slashed or bracketed forms**
   (сохранил(а), подтвердил/ла) — they garble read-aloud
   (`lib/speak.ts`) and screen readers. участник, сосед, хранитель
   as unmarked generics cover everyone; the marked feminine forms
   (участница, соседка) appear only in free-text a member wrote
   about themselves.
7. **Always write ё.** Every ё is written as ё — ещё, всё, придёт,
   найдёте, надёжно, зёрнышко — never folded to е. Three reasons:
   (a) the big ru products write it in UI (Telegram's «Ещё», VK,
   Google ru); (b) **read-aloud is a first-class feature** — TTS
   pronounces все/всё, узнает/узнаёт differently, and folding ё makes
   the app mispronounce its own strings; (c) one-form discipline —
   а file where ещё and еще both occur reads as two translators and
   defeats every grep in the self-check. The layout smoke checks
   diaeresis clipping in tight pills along with the usual ru length
   (+15–25% over en): overflows wrap, never truncate mid-word.
8. **Loanword policy — three tiers, per Telegram/Google-ru
   convention.** (a) Proper nouns, codes, and technical literals stay
   in Latin script verbatim: Understoria, QR (as «QR-код», hyphenated
   — the universal ru convention), Wi-Fi, VPN, URL, email, file
   paths, env vars, .ics. (b) Established Cyrillic tech words win
   over coinages: приложение (app), сервер, аккаунт (the Google-ru
   word — **учётная запись is banned**, Windows-manual officialese),
   профиль, пароль, парольная фраза, браузер, устройство, кнопка,
   код, календарь, камера, синхронизация, шаблон, проект, баланс.
   (c) Where a natural everyday Russian word exists, it wins over the
   loan: помощь not хелп, доска not борд, умения not скиллы, веха
   not майлстоун. The test is always "which word would the neighbor
   actually say" — not maximal Russian, not maximal English.
9. **Punctuation — Russian typographic conventions, consistently.**
   Quotes are «ёлочки» («Моя забота»), with „лапки“ only for a quote
   inside a quote; straight or curly English quotes never appear
   around Russian text. The em dash is Russian's beloved workhorse:
   spaced « — » as в en/es, including the null-copula dash Russian
   requires («Час помощи — это час»). Ranges take an unspaced en
   dash (2–4). Ellipsis is the single char … («Отправляется…»).
   Headings, buttons, and chips take no terminal punctuation, as in
   en. Digits are ASCII; formatted numbers flow through `Intl`
   (ru: space-grouped thousands, decimal COMMA — 1,5 часа) — never
   hand-format inside strings. Beware «5 часов» alone can read as
   five o'clock — the same collision vi has — so give the currency
   context («5 часов помощи», «Часы: 5»); clock times render
   numerically via `Intl`.
10. **"Understoria" is never translated** or transliterated
    (never Андерстория). Same for file names, env vars, and `docs/…`
    paths quoted in strings.
11. **Interpolation placeholders verbatim**: `{{count}}`, `{{name}}`,
    `{{hours}}`… byte-for-byte identical (parity test enforces this).
12. **Plurals — FOUR forms, every family. This rule is why Russian
    is in Wave 2; read it twice.** Russian CLDR needs `_one`, `_few`,
    `_many`, and `_other`, and the classes follow the LAST digits of
    the number, not its size:
    - **`_one`** — ends in 1 but not 11: 1, 21, 31, 101…
      «{{count}} час», «21 участник поручился». Nominative singular.
      NEVER write «один час» spelled out — 21 and 101 land here too.
    - **`_few`** — ends in 2–4 but not 12–14: 2, 3, 4, 22, 23, 24,
      102… «{{count}} часа», «22 участника». Genitive singular.
    - **`_many`** — ends in 0, 5–9, or 11–14: 0, 5, 11, 12, 13, 14,
      19, 100… «{{count}} часов», «11 часов», «0 часов». Genitive
      plural. Note 11–14 land here even though they end in 1–4.
    - **`_other`** — fractions: «1,5 часа», «2,5 часа». Genitive
      singular, like `_few`, for most nouns. The plural gate derives
      `_one/_few/_many` from `Intl.PluralRules` over integers; the
      parity test and i18next's fallback chain require `_other` as
      well — fill it (usually a copy of `_few`'s form), NEVER delete
      it, and never paste en's `_other` text into ru's `_other` slot
      as if it meant "plural".

    Every English `_one`/`_other` pair therefore becomes FOUR ru
    keys. Write each form as a WHOLE sentence that reads correctly
    for its entire class — verbs and adjectives agree too: «Остался
    {{count}} час» / «Осталось {{count}} часа» / «Осталось {{count}}
    часов». Memorize the workhorse declensions: час/часа/часов;
    минута/минуты/минут; обмен/обмена/обменов; изменение/изменения/
    изменений; задача/задачи/задач; and the irregular **человек**
    (1 человек, 2 человека, 5 человек — genitive plural is человек,
    not человеков). Test every family by reading it aloud at 1, 2, 5,
    11, and 21.

## Term table

| English | Russian | Notes / DON'T use |
|---|---|---|
| vouch for (verb) | поручиться за | What a neighbor says: «Я за неё ручаюсь». Button: «Поручиться за {{name}}». Imperfective ручаться in prose. DON'T: **поручительство** (bank loan surety — the -ство noun is banned; see next row), рекомендовать (HR reference), заверить (notary), подтвердить личность (ID verification), гарантировать. |
| a vouch (the signed act) | ручательство | «ваше подписанное ручательство», «нужны ручательства двух доверенных участников». Slightly bookish but transparent and honest — and it dodges the bank word. DON'T: поручительство (co-signing a loan), рекомендация, гарантия. |
| vouches (count on trust chips) | {{count}} человек поручились | One vouch = one distinct person, so count people: «Доверенный ({{count}} человек поручились)», «За вас поручились {{have}} из {{need}}». Mind человек's irregular plurals (rule 12). |
| vouched by | за вас поручился {{name}} → restructure | Prefer the genderless present/nominal: «Ручательство от {{name}}», «{{name}} ручается за вас» (rule 6). |
| fully vouched | полное доверие сообщества | Mirror es "de plena confianza": «когда сообщество вам полностью доверяет». DON'T: полностью верифицирован (verification officialese), проверенный (vetted — security-check flavor). |
| trust / trusted member | доверие / доверенный участник | Chip: «Доверенный». Web of trust: сеть доверия. DON'T: **доверенное лицо** (power-of-attorney proxy — legal), проверенный, верифицированный. |
| seed balance | начальные семена | es keeps the metaphor ("semilla inicial") and so do we: «ваш баланс — ровно ваши начальные семена». Chip: «Семена: {{hours}}»; plain in teaching prose: «каждый начинает с 5 часов». Always the PLURAL семена — the singular семя has an anatomical collision and is banned as the term. DON'T: семя (see above), стартовый капитал (capital), депозит (bank), бонус (promo — poison here). |
| hours (the currency) | часы | «Час любой помощи равен часу». Credit never becomes кредит (rule 4): "credit moves" → «часы переходят», "credited" → «зачтено». Declension per rule 12: час/часа/часов. Mind the o'clock collision (rule 9). DON'T: **кредит** (bank loan — poison), баллы (loyalty points), очки (game score), монеты (coins/crypto). |
| node | узел | Keep the teaching gloss: «узел (общий сервер, который ваше сообщество ведёт сообща)». узел IS the native Russian network word (узел сети, узел связи) — the knot sense doesn't collide in app context, unlike Vietnamese nút (a UI button). RESERVED: узел means the server and nothing else. DON'T: leave "node" in Latin script; нода (dev slang); сервер alone only where en itself says just "server". |
| community node | узел вашего сообщества | Peer/friend nodes: **дружественные узлы** — natural, warm, and exactly es "nodos aliados". DON'T: одноранговые узлы (P2P jargon), узлы-партнёры (business partners). |
| federation | дружественные сообщества, связанные друг с другом | Prefer the rephrasing in prose: "Across the federation" → «среди дружественных сообществ». Where a bare noun is unavoidable: содружество узлов. DON'T: **федерация** (in Russian this reads as the Russian Federation — the state collision is immediate), **союз** (the Union IS the USSR — rule 5), альянс (military-corporate), объединение (bureaucratic). |
| exchange | обмен | «обмен помощью»; confirmed: «Обмен подтверждён». Declension: обмен/обмена/обменов. DON'T: сделка (a deal), транзакция (bank/crypto), операция (bank operation), бартер (tax-code barter). |
| the commons (section) | общее | The substantivized neuter is THE kitchen form — «это у нас общее»: section «Общее»; prose «это общее всего сообщества»; a single one: «часть общего» («передать в общее»). DON'T: общественная собственность (state property), общественное достояние (public-domain legalese), общее хозяйство (колхоз = коллективное хозяйство — the collision is fatal), коммунальный (utilities/communal-apartment flavor), ресурсы сообщества (NGO-workshop jargon). |
| tended (commons status) | в заботе | Chip: «В заботе»; prose: «в заботе сообщества», «под крылом сообщества». Matches the app's care framing. DON'T: обслуживание / техобслуживание (IT-building maintenance), на балансе (bookkeeping!), под управлением (managed — administrative), ухожен as a chip (garden-only flavor, gendered). |
| retired (commons status) | на отдыхе | Deliberate non-literal, mirrors fr "au repos" / zh 歇息中: «отправить на отдых» honors the no-shame lifecycle (it can come back). DON'T: на покое (вечный покой — funeral adjacency), списан (written off — warehouse shame), закрыт (final), удалён. Distinct from «в архиве» (archived). |
| In my care (nav) | Моя забота | «Это моя забота» is the idiomatic "I'll take care of it" — exactly the claiming register. Toast: «Это теперь в разделе «Моя забота»». If the nav pill overflows, wrap — don't truncate (rule 7). DON'T: Мои задачи (task-manager), Мои дела (flattens care to tasks), На моём попечении (органы опеки guardianship officialese), Мои обязанности (burden-heavy). |
| Grow another root (add-a-server flow) | Пустить ещё один корень | Пустить корни is the natural taking-root idiom; button: «Пустить новый корень». Mirrors es "Hacer crecer otra raíz". DON'T: Добавить сервер, Развернуть узел (both flatten the metaphor to IT/devops). |
| timebank | банк времени | The established Russian term — the ru timebank movement itself uses it. Keep the SURROUNDING prose non-bank: «в банке времени просить о помощи можно всегда». DON'T: тайм-банк (needless anglicism), копилка времени (piggy-bank — cute but flattens), фонд времени (a fund). |
| mutual aid | взаимопомощь | **Lean in — this is Kropotkin's own word**: «Взаимопомощь как фактор эволюции» (1902) gives the Russian term a deeper native lineage than the English has. «часы взаимопомощи». взаимовыручка welcome in warm prose. DON'T: благотворительность (charity — hierarchical), волонтёрство (sector-speak), соцподдержка (state welfare), шефство (Soviet patronage). |
| board | доска | Nav: «Доска»; first-use gloss: «доска объявлений сообщества» — the corkboard every подъезд and двор has. DON'T: форум, лента (social feed), **стена** (the VK wall — total collision), борд. |
| dashboard | Пульс сообщества | Nav: «Пульс» — the community's heartbeat, warm and short; dodges any доска collision. DON'T: панель управления (control panel — contradicts no-admins), дашборд, **сводка** (front-line reports — rule 5), главная (home). |
| needs | Нужна помощь | Tab/chip: «Нужна помощь»; prose: «то, в чём нужна помощь». DON'T: **нужда** (destitution — жить в нужде is shame-laden), потребности (market-survey register), запросы (support tickets), требования (demands). |
| offers | Могу помочь | Tab: «Могу помочь» — first-person warm, pairs with «Нужна помощь»; an offer in prose: «предложение помощи» (ALWAYS the full compound — bare предложение is RESERVED for governance proposals, a real collision). DON'T: **акция** (e-commerce deal — poison), услуги (rule 3), оферта (contract law). |
| post (noun) | объявление | The notice on a доска объявлений — the metaphor closes itself: «объявление на доске». пост acceptable in technical contexts (sync explanations). DON'T: публикация (publishing officialese), заметка (a personal note), реклама (advertisement), сообщение (collides with messages). |
| post (verb) | повесить на доску | What Russians do with an объявление — they hang it: «Повесьте объявление на доску». Neutral отправить in technical contexts. DON'T: **разместить** (the classic bureaucratic verb), опубликовать (publishing), запостить (slang). |
| claim (a post/task) | взять на себя | «Взять на себя» (button, infinitive per rule 2), «{{name}} берёт это на себя» (present tense keeps it genderless — rule 6). Taking into one's care — matches the nav framing. DON'T: заявить права (legal claim), забронировать (booking), **откликнуться** (the gig-platform respond-to-vacancy verb — hh.ru register), застолбить (slang land-grab). |
| project | проект | The everyday word. DON'T: инициатива (NGO-speak), мероприятие (officialese event). |
| task | дело | «одно небольшое дело» — warm and human. задача acceptable in dense technical strings. DON'T: задание (homework/orders from above), таск (corporate slang), работа as the default (labor flavor). |
| template | шаблон | «Начните с шаблона», «шаблоны». Established and neutral. DON'T: образец (specimen), макет (layout mock-up), бланк (paper form). |
| work day | день общих дел | **The субботник call — considered and declined.** субботник is the exact concept and still lives (yard cleanups), but three things rule it out as the feature name: it is literally Saturday-bound (a Wednesday субботник jars); its Soviet mobilization history makes «добровольно-принудительно» (voluntary-mandatory) the first association for much of the audience — the precise opposite of this app's no-pressure register; and the diaspora + at-risk communities this locale serves hear the mobilization louder than the neighborliness. So: «День общих дел — {{project}}», «Назначить день общих дел». Teaching prose MAY nod once to the familiar («как субботник — только по-настоящему добровольный»), the way hi honors श्रमदान. DON'T: субботник as the term (above), воскресник, рабочий день (HR working day), **трудодень** (the kolkhoz work-credit unit — the exact vi ngày-công trap). |
| shift | смена | «Записаться на смену», «Вы в этой смене». The plain everyday word. DON'T: вахта (rotation-work/watch — industrial-military), дежурство (RESERVED for the rota family, below), наряд (military duty detail). |
| sign-up (for a shift) | записаться | The paper sign-up-sheet verb: «Запишитесь на смену», «Убрать своё имя». Keep this family for shifts ONLY (see RSVP). DON'T: зарегистрироваться (registration officialese), подать заявку (application to authority). |
| RSVP | ответить, придёте ли (always the full clause) | Heading: «Дайте знать, придёте ли вы»; «Ваш ответ: {{status}}», «Изменить ответ». Bare ответ alone is message replies; записаться is shifts — both real collisions, so RSVP always carries придёте/приду. DON'T: keep "RSVP" (opaque in ru), записаться (collides with shifts), подтвердить участие (conference officialese), регистрация. |
| rota (care rota) | забота по очереди | The by-turns kitchen phrase: «весь двор заботится по очереди». A rota slot: черёд («следующий черёд снова открывается» — «настал ваш черёд» is warm and idiomatic). DON'T: график дежурств (duty-roster officialese), расписание смен (HR), вахта. |
| proposal | предложение | Page: «Предложения»; «предложение сообщества». RESERVED: bare предложение only ever means a governance proposal (offers are always «предложение помощи», previous rows). Keep surrounding prose warm so it never reads parliamentary. DON'T: инициатива (NGO), резолюция, ходатайство (petition to authority). |
| affirm (a proposal) | поддержать | Button «Поддержать»; count: «{{count}} человек поддержали» — standing with it, consensus register. Blocking a proposal: остановить («Остановить») — keeps заблокировать reserved for contacts. DON'T: одобрить (approval from authority), утвердить (rubber stamp), проголосовать за (parliamentary), лайк. |
| block (a contact) | заблокировать | The universal app word (Telegram/VK use it): «Заблокировать контакт», «Разблокировать». RESERVED for contacts; a proposal is остановить (previous row). DON'T: забанить (mod slang), внести в чёрный список (heavier shame register). |
| flag (an exchange/comment) | вынести на разбор | The community-review framing with no informer register: «Что-то не так — вынесите на разбор», chip «На разборе», prose «сообщество разбирается вместе» (разобраться is the neutral sort-it-out verb). DON'T: **пожаловаться / жалоба** (VK's report button — complaint-to-authority register), **донести / донос / стучать** (informer vocabulary — absolutely not, rule 5), сообщить о нарушении (police report), репорт. Never the plural разборки (gang showdown slang). |
| dispute | разногласие | Page: «Разногласия» — honest and no-shame; status: «Сообщество разбирается вместе» (short chip: «Разбираемся»). DON'T: спор (a quarrel), конфликт (escalation), претензия (consumer-complaint legalese), иск / тяжба (court), инцидент (incident-report). |
| removal (of a member) | вывести из сообщества | «Вывести участника из сообщества» — honest, heavy, not shame-laden. DON'T: **исключить / исключение** (school-and-Party expulsion — исключён из партии), изгнание (banishment), удалить (deleting a person like a file), выгнать (chasing out), забанить. |
| removal ceremony | обряд расставания | Keep the ritual — it is deliberate in en; обряд is the lived folk-ritual word and расставание the honest parting. DON'T: церемония (award-show formal), процедура (paperwork — flattens it), ритуал (occult flavor in ru). |
| reinstatement | возвращение | «Возвращение {{name}}» — the door reopening; verb: «сообщество приняло {{name}} обратно». восстановление is RESERVED for account recovery (below), so member return never uses it. DON'T: восстановление в правах (rehabilitation officialese), реабилитация (post-repression legal term — loaded), повторный приём (readmission). |
| member | участник | The unmarked generic covers everyone (rule 6): «этот участник». DON'T: пользователь / юзер (user), **член** as a standalone (crude anatomical slang collision; члены сообщества only inside fixed formal phrases, and prefer участники even there), клиент (customer — poison). |
| neighbor | сосед | «ваши соседи»; collective warmth: «всем двором» — the courtyard is Russian's natural mutual-aid unit («всем двором помогали»). DON'T: жильцы (housing-office register), **граждане** (police-loudspeaker address), **товарищи** (rule 5), соседка as the default (marked feminine). |
| community | сообщество | The standard word, warmed by context. DON'T: **коллектив** (Soviet workplace unit — the vi tập-thể trap), община (religious/ethnic commune), общество (society at large), комьюнити (anglicism). |
| invite (noun + verb) | приглашение / пригласить | «Пригласите знакомого человека», «тот, кто вас пригласил». DON'T: инвайт (forum slang), заявка (application), реферальная ссылка (growth-hacking register). |
| guardian (shard holder) | хранитель | RESERVED WORD: хранитель only ever means a recovery-shard holder — the keep-and-cherish word. «Выберите доверенных участников в хранители»; gloss on first use: «хранители — каждый бережёт для вас кусочек ключа возвращения». DON'T: **опекун** (LEGAL guardianship of minors — the school-form trap, same as fr "tuteur"), попечитель (trustee bureaucracy), **гарант** (the constitutional Guarantor — rule 5), защитник (defender/lawyer). |
| recovery kit | набор для восстановления | Built on the established восстановление аккаунта (Google-ru convention); the warm verb is вернуть: «вернуть свой аккаунт». RESERVED: восстановление only ever means account recovery. DON'T: аптечка (first-aid kit), резервная копия (flattens the promise to backup), комплект реанимации. |
| passphrase | парольная фраза | Built on the universally-known пароль (the vi cụm-mật-khẩu logic); gloss on first use: «парольная фраза (длинный пароль из нескольких слов)». DON'T: **кодовое слово** (the bank-hotline security word — real collision), сид-фраза / мнемоническая фраза (crypto-wallet register), секретное слово. |
| ledger | общая книга сообщества | The shared record book: «записано в общую книгу сообщества». The device-local record (en's parenthetical) is «книга записей этого устройства (её собственный учёт)» — учёт is neutral bookkeeping; rule 4 still bans долг. летопись welcome in longer warm prose («общая летопись обменов»). DON'T: реестр (state registry), гроссбух, журнал учёта (inventory log), **долговая книга** (debt book — never), бухгалтерия. |
| split your key (guardians) | разделить ключ на части | «Разделите ключ между доверенными участниками»; a shard: «часть ключа» / warm «кусочек ключа». DON'T: шардирование (dev jargon), фрагмент (clinical). |
| milestone | веха | «Веха пройдена» — the journey word. DON'T: майлстоун, контрольная точка (checkpoint), этап (just a stage), **рубеж** (defense-line flavor — rule 5). |
| helper (person in an exchange) | помощник | «Помощнику зачтены часы»; field: «Помощник»; prose: «тот, кто помог». **волонтёр is banned** (institutional volunteering sector) and **доброволец is banned** (in current Russian a military volunteer — rule 5); helping here is neighbors помогают друг другу, never volunteering-as-institution. DON'T: исполнитель (gig-platform performer — YouDo/Профи register), ассистент. |
| skills | умения | The warm what-you-can-do word: «Ваши умения», «что вы умеете». DON'T: навыки (CV/training-course register), компетенции (corporate horror), скиллы. |
| panic (the emergency wipe) | крайний случай | Heading «Крайний случай»; gloss on first use: «если опасность у порога — мгновенно стереть всё на этом устройстве». Wipe = стереть всё; purge = очистка («полная очистка», «мягкая очистка»). DON'T: паника (the clinical state, not a feature), **тревожная кнопка** (security-firm register, and тревога is air-raid vocabulary today), **ЧС / чрезвычайная ситуация** (rule 5 — the Emergency section itself is «экстренное», so panic can't lean on it either way), **зачистка** (rule 5), SOS-режим. |
| read aloud (feature) | чтение вслух | What a family member does for someone who can't read the screen — exactly the promise: toggle «Чтение вслух», «Приложение прочитает вслух». DON'T: озвучка (dubbing/voice-over), синтез речи (tech spec, not the promise), диктор (announcer), TTS. |
| seed vault | хранилище семян | Svalbard is «Всемирное хранилище семян» in Russian news — the resonance lands: «Это устройство — хранилище семян: оно бережёт полную историю сообщества». DON'T: сейф (bank safe), зернохранилище (industrial grain elevator), резервный сервер (flattens the metaphor). |
| storm hub | огонёк в бурю | Идти на огонёк — coming to the lit window — is THE Russian warm-refuge idiom, and it dodges the storm's-own-center trap every sibling dodged: «дом, где есть свет и Wi-Fi, когда всё вокруг погасло — сюда приходят на огонёк». Short: «огонёк». Requires its first-use gloss. DON'T: центр бури (the storm's own eye — the fr/pt/zh/hi/vi trap), штаб (military HQ), **убежище / укрытие** (air-raid signage register today — rule 5), пункт обогрева (ministry-of-emergencies official term), хаб. |
| One small thing | Одно небольшое дело | Button: «Показать одно небольшое дело» (infinitive, rule 2). небольшое is the disarming softener — DON'T inflate to «небольшая задача». |
| Ways to plug in | Куда приложить руки | Приложить руки = put your hands to it; mirrors es "Formas de participar". DON'T: способы участия (officialese), присоединяйтесь к нам (recruiting page), **внести вклад** (вклад is a bank deposit — real collision). |
| organizer | организатор | Everyday and neutral; prose keeps it human: «тот, кто это затеял» (затеять — the warm instigator verb). DON'T: админ, руководитель (a boss), **ответственный за…** (the Soviet wall-chart duty formula), координатор (NGO-speak). |
| operator (appears near node) | смотритель узла | The caretaker word — станционный смотритель warmth, transparent and unbossy: «кто ведёт сервер для сообщества, тот и смотритель узла — ясные права, ясные границы». DON'T: администратор / админ (contradicts the no-admins framing), **оператор** (mobile-carrier collision — оператор связи), владелец (owner), сисадмин. |
| display name | видимое имя | «Ваше видимое имя (настоящее не обязательно — назовитесь как хотите)». DON'T: имя пользователя (username), отображаемое имя (participial officialese), ник / никнейм (playground), псевдоним (pen-name/spy flavor), логин. |
| owed help | ждёт вашего подтверждения | Badge: «Ждёт подтверждения»; «{{hours}} часов ждут вашего подтверждения» (mind rule 12 — the verb agrees per class). Deliberately NOT долг / задолженность / кредит — the app refuses debt framing (rule 4). |

## Quick self-check for translators

- Would a neighbor say this out loud across a kitchen table? If not,
  redo it.
- `grep` for ты forms — ` ты `, `тебя`, `тебе`, `твой`, `твоя`,
  `твои` — zero hits; address is вы, uniformly (rule 1). `grep` for
  mid-string `Вы`, `Вас`, `Ваш` (capitalized) — zero hits outside
  sentence starts; the obsequious capital is banned (rule 3).
- `grep` for долг, задолж, кредит — zero hits outside explicit
  debt-rejection lines; owed help is «ждёт подтверждения» (rule 4).
- `grep` for данный, вышеуказанн, осуществ, произвести, во избежание,
  просим — zero hits; if a string reads like a housing-office notice,
  rewrite it in spoken Russian (rule 3).
- `grep` for пользователь, юзер, клиент, учётная запись — zero hits;
  members are участники, the account is аккаунт. Same for волонтёр
  and доброволец (helpers are помощники), опекун (shard holders are
  хранители), товарищ, донос/донести/пожаловаться (flagging is
  «вынести на разбор»), исключить/исключение (removal is «вывести из
  сообщества»), субботник and трудодень (the feature is «день общих
  дел»), федерация and союз (the federation is «дружественные
  сообщества»).
- ё is written everywhere it belongs: `grep -w` for еще, все-where-
  всё-is-meant, придет, найдете — zero hits of the folded forms
  (rule 7); one spelling per word file-wide.
- Slashed gender forms — `grep` for `л(а)`, `л/ла`, `(ла)` in verb
  endings — zero hits; restructure to present tense or nominal
  framings instead (rule 6).
- **Every plural family has all FOUR keys** — `_one`, `_few`,
  `_many`, `_other` — and each reads correctly for its whole class:
  say it aloud at 1, 2, 5, 11, and 21 («21 час», «2 часа», «5 часов»,
  «11 часов»). `_other` is the fractional form («1,5 часа»), never a
  pasted copy of en's plural. Verbs agree per class (остался/
  осталось). человек, not человеков (rule 12).
- `{{…}}` placeholders identical to en; digits ASCII; numbers
  formatted by `Intl`, decimal comma in any hand-written example.
- Quotes are «ёлочки» (nested „лапки“); dashes are spaced « — »
  (null copula included); ellipsis is the single-char …; buttons and
  chips carry no terminal punctuation and use the infinitive
  (rules 2, 9).
- узел only ever means the server; хранитель only ever the shard
  holder; восстановление only ever account recovery; bare
  предложение only ever a governance proposal (offers are
  «предложение помощи»); смена only ever an event shift.
- "Understoria" untouched — never Андерстория.
