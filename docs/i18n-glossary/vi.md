# Vietnamese (vi) translation glossary

Reference for every bulk-translation and review pass over `vi.json` and
the Vietnamese content modules. Decisions here get applied ~2,900
times — when in doubt, pick the word a Vietnamese-speaking neighbor
would say across a kitchen table, not the word a bank SMS, a ward
loudspeaker announcement, or a customer-service hotline would use.

**Locale code is `vi`** (language-only): browsers send `vi` and
`vi-VN`, and i18next's language-only fallback resolves both. The
register is contemporary spoken Vietnamese as written in the big vi
products (Zalo, Google's vi surfaces, Messenger vi) — readable in Hà
Nội and Cần Thơ alike — not Sino-Vietnamese officialese and not
e-commerce coupon-speak. There is no script fork and no planned
regional sibling locale: one `vi` must serve north, center, south, and
the diaspora, which is exactly why the regional rules below exist.

## Global register decisions

1. **The member is bạn, uniformly.** Vietnamese address normally runs
   on kinship terms (anh/chị/em/cô/chú/bác) chosen by relative age and
   gender — which the app can never know, and a WRONG kinship term
   (em to an elder, bác to a twenty-year-old) is far ruder than a
   neutral one. The alternatives all fail: quý khách / quý vị is the
   counter register of banks and airlines (banned, rule 3); mình-as-
   "you" is intimate and regionally marked; picking any one kinship
   term insults everyone it doesn't fit. **Bạn is the established
   second person of every major vi app** (Zalo, Google, Facebook,
   Grab, MoMo) — and it literally means "friend", which is truer to
   this app than to any of them. The warmth kinship terms would carry
   comes instead from particles and verbs (nhé, cùng nhau, giúp một
   tay), never from guessing a pronoun. Plural audience: mọi người
   ("cho mọi người biết…"), warmer than lecture-hall "các bạn".
2. **First person — who is speaking.** (a) When the MEMBER speaks
   (buttons, "my" labels): tôi / của tôi ("Thêm vào lịch của tôi",
   "Chỉ cho tôi một việc nhỏ thôi") — the standard vi app convention.
   (b) When the APP speaks, prefer no first person at all: Vietnamese
   drops subjects naturally ("Đã lưu.", "Sẽ gửi lại khi có mạng."), or
   name the real actor — ứng dụng, node, cộng đồng ("Ứng dụng sẽ đọc
   cho bạn nghe"). (c) "We" that includes the member is chúng ta / cả
   cộng đồng. (d) **Chúng tôi is banned as the app's voice** — it is
   the corporate "we" of companies with a support desk, and there is
   no company behind this app. It survives only where en itself
   unmistakably speaks as the people who made the software (the
   translation-honesty note), nowhere else. Third persons: họ, người
   này, thành viên này, or repeat the name — never guessed anh ấy/cô
   ấy, never hắn/y/nó.
3. **Warm, plain Vietnamese** over Sino-Vietnamese officialese and
   service-speak. Banned outright: vui lòng / xin vui lòng as
   reflexive padding (most requests read better bare or with nhé;
   where en itself says "please", soften with hãy or …giúp nhé),
   quý khách / quý vị / quý thành viên, kính gửi / kính thưa, trân
   trọng thông báo, đề nghị (an order from above), sử dụng-padding
   (dùng — "dùng mẫu này", not "sử dụng biểu mẫu này"), thực hiện /
   tiến hành + verb padding (thực hiện xác nhận → xác nhận), "hệ
   thống" as the actor (name the node or the app), khách hàng, and
   dịch vụ for help between members (giúp đỡ is help; dịch vụ is what
   a company sells — say "giúp một tay", not "cung cấp dịch vụ hỗ
   trợ"). Equally banned: e-commerce coupon-speak — ưu đãi, khuyến
   mãi, tích điểm, hoàn tiền, săn deal. This app sells nothing.
4. **No-shame framing.** Never debt vocabulary for exchanges: no nợ,
   mắc nợ, thiếu nợ, trả nợ, con nợ, gán nợ ("bạn đang nợ 3 giờ" is
   forbidden) — and no obligation-of-gratitude framing either (chịu
   ơn, hàm ơn, đền ơn as a duty). Debt words may appear ONLY where en
   itself explicitly rejects debt framing ("this is not a loan" →
   "đây không phải là một khoản nợ"). Owed help is "chờ xác nhận"
   (see term table). Cảm ơn as plain thanks is of course fine.
5. **Regional policy: neutral standard Vietnamese, one form per
   concept.** Written standard vi (national media, the big apps) is
   already understood everywhere — stay inside it and avoid words
   marked as exclusively northern or southern slang. Where a real
   lexical split exists, pick the form both regions understand
   passively and use it consistently file-wide: cha mẹ (not bố mẹ/ba
   má), trái cây (not hoa quả), muỗng with thìa avoided, ô tô in
   technical prose, heo/lợn-class food terms resolved once per
   concept in the content modules. Never mix the pair in one file —
   a lợn in one template and a heo in the next reads as two different
   translators. The UI file has few of these; the recipe-heavy
   template corpus has many, so this rule binds Phase 2 hardest.
6. **Diacritics are load-bearing — full, NFC, modern.** Every string
   carries complete tone and vowel marks; ASCII-fied Vietnamese ("vui
   long", "cong dong") is data corruption, never a style. Encode NFC
   (precomposed — ế as one codepoint, not e + ◌̂ + ◌́), or grep,
   read-aloud, and fonts all misbehave. Tone placement is the modern
   style: hòa, thủy, quý — never hoà, thuỷ, qúy. Spelling picks the
   common y-forms (kỹ năng, mỹ, lý, ký) consistently. Labels take
   sentence case ("Ngày chung tay"), never English Title Case.
   Layout: vi runs ~15–30% longer than en and stacked marks are TALL
   (ệ, ỗ, ề) — the layout smoke must check pills and the bottom nav
   for clipping, and overflows wrap, never truncate.
7. **Loanword policy — three tiers, following Zalo/Google-vi
   convention.** (a) Proper nouns, codes, and technical literals stay
   verbatim: Understoria, QR (as "mã QR"), Wi-Fi, VPN, URL, email,
   file paths, env vars, .ics — and **node** (see term table: the
   Vietnamese calque nút is the word for a UI button, so the server
   keeps its English name). (b) Established Vietnamese renderings win
   over kept English: ứng dụng (app), máy chủ (server), mật khẩu
   (password), thiết bị, trình duyệt, hồ sơ (profile), tài khoản,
   đồng bộ, sao lưu. Camera stays camera (the vi word). (c) Where a
   natural everyday Vietnamese word exists, it wins over both the
   loan and the Sino-Vietnamese coinage: giúp not hỗ trợ-as-default,
   dùng not sử dụng, mẫu not template. The test is always "which word
   would the neighbor actually say" — not maximal purism, not maximal
   English.
8. **Punctuation and numbers.** Vietnamese is Latin-script: sentences
   end in a period, questions in ?, exclamations in ! — with **no
   space before any punctuation** (the French colonial habit of a
   space before ?/!/: is an error here). Quotes: curly “ ” (the
   modern app/print convention). Ellipsis: the single-char …
   ("Đang gửi…"). Em dash: " — " with plain spaces, as en/es.
   Headings, buttons, and chips take no terminal punctuation, as in
   en. Digits are ASCII; formatted numbers flow through `Intl`
   (vi: 1.000 thousands, decimal comma) — don't hand-format inside
   strings. Beware "5 giờ" alone can read as five o'clock: give the
   currency context ("5 giờ giúp đỡ", "Số giờ: 5"); clock times
   render numerically via `Intl`.
9. **"Understoria" is never translated** or respelled. Same for file
   names, env vars, and `docs/…` paths quoted in strings.
10. **Interpolation placeholders verbatim**: `{{count}}`, `{{name}}`,
    `{{hours}}`… byte-for-byte identical (parity test enforces this).
    Normal spaces around them, as Vietnamese is spaced.
11. **Plurals — read this twice.** Vietnamese CLDR collapses to
    `_other` only: nouns don't inflect, so the plural gate will demand
    nothing beyond `_other`. **BUT** the en file has `_one`/`_other`
    key PAIRS and the parity gate requires ALL keys in every locale —
    so fill **BOTH** forms for every plural family, usually with
    identical text ("{{count}} người bảo đảm" works for 1 and for
    40). Never delete a `_one` key as "unnecessary"; the parity test
    will fail the file. Counting work is done by classifiers and
    measure nouns (người for people, món for belongings, việc for
    tasks) — "{{count}} thành viên", never "các {{count}} thành
    viên" (không stack các/những onto a counted noun). Bare plurals
    without a count take những/các or none: "Việc cần giúp".

## Term table

| English | Vietnamese | Notes / DON'T use |
|---|---|---|
| vouch for (verb) | đứng ra bảo đảm (cho) | What a neighbor says: "Tôi đứng ra bảo đảm cho {{name}}". Button: "Bảo đảm cho thành viên này". RESERVED: **bảo đảm** (this word order) only ever means vouching-for-a-person; the generic "ensure" sense is banned in BOTH orders — write chắc chắn / giữ cho / restructure, and never đảm bảo at all, so the grep stays clean. DON'T: bảo lãnh (bail + diaspora family sponsorship — total collision), chứng thực (notarization), giới thiệu (too weak), xác minh (ID verification). |
| a vouch (the signed act) | lời bảo đảm | "lời bảo đảm đã ký của bạn", "cần lời bảo đảm của hai thành viên được tin cậy". |
| vouches (count on trust chips) | {{count}} người bảo đảm | One vouch = one distinct person, so count people: "Được tin cậy ({{count}} người bảo đảm)", "Bạn đã có {{have}}/{{need}} người bảo đảm". Classifier người, not vị (ceremonial). |
| vouched by | {{name}} đã đứng ra bảo đảm cho bạn | |
| fully vouched | được cộng đồng tin cậy trọn vẹn | Mirror es "de plena confianza". DON'T: xác minh đầy đủ (verification officialese). |
| trust / trusted member | tin cậy / thành viên được tin cậy | Chip: "Được tin cậy". Web of trust: mạng lưới tin cậy — lưới is a woven net, truer than any chain. DON'T: tín nhiệm (bỏ-phiếu-tín-nhiệm parliamentary register), đã xác minh (verified). |
| seed balance | hạt giống ban đầu | es keeps the metaphor ("semilla inicial") and so do we: "số giờ của bạn đang đúng bằng hạt giống ban đầu". Chip: "Hạt giống: {{hours}}"; seed credits = giờ hạt giống. Plain in teaching prose: "ai cũng bắt đầu với 5 giờ". DON'T: vốn (capital), số dư ban đầu (bank balance), tặng/khuyến mãi flavor (promo — poison here). |
| hours (the currency) | giờ | "Một giờ giúp đỡ nào cũng bằng đúng một giờ." Always giờ for the currency; tiếng survives only in casual duration prose ("mất khoảng hai tiếng"), never on chips. Credit moves → "giờ được ghi sang". Mind the o'clock ambiguity (rule 8). DON'T: điểm (loyalty points), xu (coins/crypto), tín dụng (bank credit), công (cooperative work-credit accounting). |
| node | node (kept English) | Keep the teaching gloss: "node (máy chủ chung mà cộng đồng bạn cùng vận hành)". Kept verbatim — tier (a), rule 7 — because the Vietnamese calque **nút means a UI button** in every app string; the collision is fatal. RESERVED: node means the server and nothing else; nút only ever means a button. máy chủ alone only where en itself says just "server". DON'T: nút, nút mạng, điểm nút. |
| community node | node của cộng đồng bạn | Peer/friend nodes: **node kết nghĩa** — kết nghĩa is the sworn-kinship/twinned-cities word (thành phố kết nghĩa); exactly federated friendship (es "nodos aliados"). DON'T: node ngang hàng (P2P jargon), node đối tác (business partner). |
| federation | các cộng đồng kết nghĩa | Prefer the rephrasing in prose: "Across the federation" → "trong các cộng đồng kết nghĩa với nhau". DON'T: liên bang (federal states), liên đoàn (sports/labor body), liên minh (political-military alliance). |
| exchange | trao đổi | "trao đổi giúp đỡ"; confirmed: "Trao đổi đã được xác nhận". DON'T: giao dịch (bank/crypto transaction), mua bán, đổi chác (haggling flavor). |
| the commons (section) | của chung | THE kitchen phrase for a thing held in common: "Đây là của chung của cả cộng đồng". Section: "Của chung"; a single one: "một món của chung" (classifier món — household warmth, like zh 家当). DON'T: tài sản công (state property), công sản (officialese), tài nguyên chung (NGO-workshop jargon), commons kept in English. |
| tended (commons status) | đang được chăm nom | Chip: "Đang chăm nom"; prose: "cộng đồng đang chăm nom". Chăm nom is person-warm caretaking — matches the app's care framing. DON'T: bảo trì (building/IT maintenance), duy trì (abstract upkeep), quản lý (managed — administrative). |
| retired (commons status) | đang nghỉ ngơi | Deliberate non-literal, mirrors fr "au repos" / zh 歇息中: "cho món của chung này nghỉ ngơi" honors the no-shame lifecycle (it can come back). DON'T: ngừng hoạt động (shut down — final), thanh lý (liquidated), loại bỏ (discarded — shame), nghỉ hưu (pension). Distinct from "đã lưu trữ" (archived). |
| In my care (nav) | Do tôi chăm nom | Keeps the care framing; prose: "Bạn sẽ thấy việc này trong mục 'Do tôi chăm nom'." If the nav pill overflows, wrap — don't truncate (rule 6). DON'T: Việc của tôi (flattens care to tasks), Nhiệm vụ của tôi (mission/duty). |
| Grow another root (add-a-server flow) | Mọc thêm một rễ mới | Button: "Mọc thêm rễ mới"; prose may use the taking-root idiom bén rễ: "để cộng đồng bén thêm một rễ nữa". Mirrors es "Hacer crecer otra raíz". DON'T: Thêm máy chủ, Cài node mới (both flatten the metaphor to IT). |
| timebank | ngân hàng thời gian | The established Vietnamese term — community timebank programs in Vietnam use exactly this name. Keep the SURROUNDING prose non-bank: "trong ngân hàng thời gian, nhờ giúp đỡ không bao giờ phải qua cửa nào". DON'T: quỹ thời gian (a fund), sổ tiết kiệm thời gian (passbook — more bank, not less). |
| mutual aid | tương trợ / giúp đỡ lẫn nhau | Compact term: tương trợ ("giờ tương trợ") — established and warm, unlike most Sino-Vietnamese; teaching prose: giúp đỡ lẫn nhau; the idiom tương thân tương ái is welcome in longer prose. DON'T: từ thiện (charity — hierarchical), thiện nguyện (volunteerism sector), cứu trợ (disaster relief). |
| board | bảng tin | Nav: "Bảng tin" — the neighborhood notice board, and already the feed word members' thumbs know. First-use gloss: "bảng tin của cộng đồng". DON'T: diễn đàn (forum), bảng thông báo (ward-office notices), tường (social-media wall). |
| dashboard | Toàn cảnh | The at-a-glance word; dodges any bảng collision. DON'T: bảng điều khiển (control panel/BI), trang chủ (home), báo cáo tổng quan (report-speak). |
| needs | Cần giúp | Tab/chip: "Cần giúp"; prose: "việc đang cần giúp một tay". DON'T: nhu cầu (market-survey register), yêu cầu (demands/support tickets), thiếu thốn (lack — shame-laden). |
| offers | Sẵn lòng giúp | Tab: "Sẵn lòng giúp"; an offer: "một lời ngỏ giúp đỡ". DON'T: **ưu đãi** (e-commerce deals — poison here), dịch vụ (rule 3), đề nghị (rule 3). |
| post (noun) | mẩu tin | The little notice pinned to a corkboard: "một mẩu tin trên bảng tin". Bài đăng acceptable in technical contexts (sync explanations). DON'T: bài viết (an article), quảng cáo (advertisement), thông báo (official notice), tin nhắn (collides with messages). |
| post (verb) | đăng lên bảng tin | "Đăng việc bạn cần giúp lên bảng tin"; đăng alone in technical contexts. DON'T: công bố (publishing officialese), phát hành (releasing). |
| claim (a post/task) | nhận | "Nhận việc này", "{{name}} đã nhận" — taking it into your care; matches the nav framing. DON'T: xác nhận quyền (legal claim — the Google-Maps trap), giành (grabbing), đặt chỗ (booking), chốt đơn (e-commerce order-closing). |
| project | dự án | The everyday word. DON'T: đề án (government scheme), công trình (construction works). |
| task | việc | "một việc nhỏ". DON'T: nhiệm vụ (mission/duty — military or gamified), tác vụ (IT jargon), công tác (cadre officialese). |
| template | mẫu | "Bắt đầu từ một mẫu có sẵn", plural "các mẫu". DON'T: biểu mẫu (bureaucratic forms), bản mẫu, template kept in English. |
| work day | ngày chung tay | Warm coinage on THE mutual-aid idiom chung tay (chung tay góp sức): "Ngày chung tay — {{project}}", "Lên lịch một ngày chung tay". Vietnam's own tradition is đổi công / vần công — neighbors trading labor days — and teaching prose may honor it ("như lối đổi công của ông bà mình"); but as the feature name, tổ-đổi-công-era baggage and the cooperative accounting unit ngày công rule those out. DON'T: ngày làm việc (HR working day), ngày lao động (May-Day flavor), ngày công (work-credit unit). |
| shift | ca | "Ghi tên vào một ca", "Bạn ở ca này". The plain everyday shift word. DON'T: ca trực (on-duty watch), ca kíp (factory register), phiên (reserved for the rota family, below). |
| sign-up (for a shift) | ghi tên | The paper sign-up-sheet idiom: "Ghi tên vào ca này", "Xóa tên khỏi ca". Keep this family for shifts ONLY (see RSVP). DON'T: đăng ký (registration officialese — and every e-commerce funnel's verb). |
| RSVP | xác nhận tham dự (always the full compound) | Heading: "Cho mọi người biết bạn có tham dự không"; "Câu trả lời của bạn: {{status}}", "Đổi câu trả lời". Bare xác nhận is RESERVED for exchange confirmations; bare trả lời is message replies — both real collisions, so RSVP always carries tham dự. DON'T: keep "RSVP", ghi tên (collides with shifts), đăng ký tham dự (officialese). |
| rota (care rota) | thay phiên chăm nom | Thay phiên nhau is the by-turns kitchen phrase: "cả xóm thay phiên nhau chăm nom". A rota slot: lượt ("đến lượt kế tiếp lại mở ra"). DON'T: lịch trực (duty roster), phân công (assignment officialese), roster. |
| proposal | đề xuất | Page: "Đề xuất"; "đề xuất của cộng đồng". Keep surrounding prose warm so it never reads like meeting minutes. DON'T: **đề nghị** (banned register — an order from above), kiến nghị (petition to authorities), nghị quyết (a resolution). |
| affirm (a proposal) | tán thành | Button "Tán thành"; count: "{{count}} người tán thành" — the hands-raised consensus word, not admin approval. Blocking a proposal: ngăn lại ("Ngăn lại") — keeps chặn reserved for contacts. DON'T: phê duyệt (approval by authority), biểu quyết (parliamentary voting), đồng ý (terms-of-service click-through), thích (like). |
| block (a contact) | chặn | The universal app word (Zalo uses it): "Chặn liên hệ này", "Bỏ chặn". RESERVED for contacts; a proposal is ngăn lại (previous row). DON'T: cấm (a ban), phong tỏa (freeze/lockdown). |
| removal (of a member) | đưa ra khỏi cộng đồng | "Đưa một thành viên ra khỏi cộng đồng" — honest, not shame-laden. DON'T: **khai trừ** (Party expulsion — the Đảng word; absolutely not), trục xuất (deportation), đuổi (chasing out), xóa (deleting a person), cấm cửa. |
| removal ceremony | nghi thức đưa ra khỏi cộng đồng | Keep the ritual — it is deliberate in en; nghi thức is the lived ceremony word. DON'T: thủ tục (paperwork procedure — flattens it), quy trình (a process), lễ (festive occasion). |
| reinstatement | trở lại / đón trở lại | "{{name}} trở lại cộng đồng"; verb: "cộng đồng đón {{name}} trở lại" — the door reopening, warm and plain. DON'T: phục hồi tư cách thành viên (officialese), khôi phục (RESERVED for account recovery), kết nạp lại (party admission). |
| member | thành viên | Naturally genderless — the workhorse. DON'T: người dùng (user), **hội viên** (paid club/gym membership — the zh-会员 trap), khách hàng (customer — poison), user. |
| neighbor | hàng xóm | "hàng xóm của bạn"; collective warmth: bà con lối xóm, xóm giềng ("cả xóm cùng góp tay"). DON'T: láng giềng as the default (formal — neighboring nations), cư dân (resident — building-management register). |
| community | cộng đồng | The standard word, warmed by context. DON'T: tập thể (collectivist-era unit), hội/đoàn thể (mass organizations), khu dân cư (administrative zone). |
| invite (noun + verb) | lời mời / mời | "Mời một người bạn quen biết", "người đã mời bạn". DON'T: thư mời (formal letter), giấy mời (official-summons flavor). |
| guardian (shard holder) | người gìn giữ | RESERVED WORD: người gìn giữ only ever means a recovery-shard holder — gìn giữ is keep-and-cherish. "Chọn những thành viên bạn tin cậy làm người gìn giữ"; gloss on first use: "người gìn giữ — mỗi người cầm giúp bạn một mảnh của chiếc chìa khóa trở về". DON'T: **người giám hộ** (LEGAL guardianship of minors — the school-form trap, same as fr "tuteur"), người bảo hộ (protectorate/patron), quản trị viên. |
| recovery kit | bộ khôi phục | Gloss on first use: "bộ khôi phục (bản dự phòng đưa tài khoản của bạn trở lại)". The warm recovery verb is lấy lại: "lấy lại tài khoản của bạn". DON'T: bộ sơ cứu (first aid), khôi phục cài đặt gốc flavor (factory-reset confusion), tệp sao lưu (flattens the promise). |
| passphrase | cụm mật khẩu | The Google-vi convention, built on the established mật khẩu; gloss on first use: "cụm mật khẩu (một mật khẩu dài gồm nhiều từ)". DON'T: mật ngữ, khẩu lệnh (military password), mã khóa. |
| ledger | sổ chung của cộng đồng | The shared book: "được ghi vào sổ chung của cộng đồng". The device-local record book (en's parenthetical) is glossed "cuốn sổ của thiết bị này (sổ ghi chép riêng của nó)". DON'T: sổ cái (accounting/blockchain ledger), **sổ nợ** (debt book — never), nhật ký hệ thống (logs), sổ sách (audit flavor). |
| dispute | bất đồng | Page: "Bất đồng"; status framing: "Cộng đồng đang cùng nhau tháo gỡ" (short chip: "Đang tháo gỡ"). DON'T: tranh chấp (land-court legalese), khiếu nại (customer-service complaint), **tố cáo** (denunciation — surveillance register, absolutely not), báo cáo vi phạm. |
| milestone | cột mốc | "Đạt một cột mốc". DON'T: mốc thời gian (deadline flavor), giai đoạn (just a stage), chỉ tiêu (quota). |
| helper (person in an exchange) | người giúp | "Người giúp được ghi nhận giờ"; field: "Người giúp". **Tình nguyện viên is banned** — mass-mobilization volunteering register (campaign season, đoàn-đội structures); helping here is neighbors giúp nhau, never volunteering-as-institution. DON'T: tình nguyện viên, trợ lý (an assistant — subordinate), cộng tác viên (gig-work CTV). |
| skills | sở trường | The warm what-you're-good-at word: "Sở trường của bạn", "việc hợp sở trường". Tay nghề fine in craft prose. DON'T: kỹ năng (training-course register — kỹ năng mềm), chuyên môn (professional qualification). |
| panic (the emergency wipe) | phương án nguy cấp | "Nút nguy cấp"; gloss on first use: "khi nguy hiểm cận kề: xóa sạch mọi thứ trên thiết bị này ngay lập tức". Wipe = xóa sạch. DON'T: hoảng loạn (the clinical state, not a feature), bare khẩn cấp (RESERVED for the Emergency section, "trường hợp khẩn cấp"), chế độ SOS. |
| read aloud (feature) | đọc cho nghe | What a family member does for someone who can't read the screen — exactly the promise: toggle "Đọc cho nghe", "Ứng dụng sẽ đọc cho bạn nghe". DON'T: chuyển văn bản thành giọng nói (tech spec, not the promise), đọc màn hình (screen-reader collision), phát thanh (loudspeaker broadcast). |
| seed vault | kho hạt giống | Kho is the granary word, and Svalbard is "hầm hạt giống toàn cầu" in Vietnamese news — the resonance lands: "Thiết bị này là một kho hạt giống — cất giữ trọn vẹn lịch sử của cộng đồng." DON'T: két sắt (bank safe), máy chủ dự phòng (flattens the metaphor). |
| storm hub | điểm trú bão | Trú bão is lived vocabulary in typhoon country — the place you shelter THROUGH the storm: "nơi có điện và Wi-Fi khi mọi nơi khác tê liệt". DON'T: **tâm bão** (the storm's own eye — the exact trap fr/pt/zh/hi all dodged), trung tâm cứu trợ (disaster-relief officialese), nơi sơ tán (evacuation register), hub. |
| One small thing | Một việc nhỏ thôi | Button: "Chỉ cho tôi một việc nhỏ thôi" — thôi is the disarming particle. DON'T inflate to "một nhiệm vụ nhỏ". |
| Ways to plug in | Cách góp một tay | Góp một tay = lend a hand; mirrors es "Formas de participar". DON'T: đóng góp (money-donation flavor), tham gia cùng chúng tôi (recruiting page AND banned chúng tôi), cống hiến (sacrifice-for-the-cause register). |
| organizer | người đứng ra tổ chức | Đứng ra carries the stepping-up warmth: "người đứng ra lo việc này"; short field: "người tổ chức". DON'T: quản trị viên, ban tổ chức (a committee), admin. |
| operator (appears near node) | người vận hành | "Ai chạy máy chủ cho cộng đồng thì là người vận hành — quyền hạn rõ ràng, giới hạn rõ ràng." DON'T: quản trị viên / admin (contradicts the no-admins framing), nhà điều hành (corporate executive), kỹ thuật viên (a technician). |
| founder / co-founder | người sáng lập / người đồng sáng lập | "Người sáng lập cộng đồng này". DON'T: chủ cộng đồng (owner), trưởng nhóm (group leader), chủ nhóm (chat-group owner). |
| display name | tên hiển thị | The standard vi field name: "Tên hiển thị của bạn (không cần tên thật — bạn thích tên gì cũng được)". DON'T: tên người dùng (username), biệt danh (playground nickname), tên tài khoản. |
| sign (a record) / signature | ký / chữ ký | "Ký xác nhận", "chữ ký của bạn lên hồ sơ". Public key = khóa công khai, with en's gloss kept. DON'T: ký kết (contract-signing ceremony), ấn ký. |
| owed help | đang chờ bạn xác nhận | Badge: "Chờ xác nhận"; "{{hours}} giờ đang chờ bạn xác nhận". Deliberately NOT nợ / mắc nợ — the app refuses debt framing (register rule 4). |

## Quick self-check for translators

- Would a neighbor say this out loud across a kitchen table? If not,
  redo it.
- `grep` for vui lòng, quý khách, quý vị, quý thành viên, kính gửi,
  trân trọng — zero hits (rule 3). đề nghị likewise; proposals are
  đề xuất.
- `grep` for chúng tôi — zero hits outside the translation-honesty
  note; the app names its actor or drops the subject (rule 2).
- `grep` for nợ (mắc nợ, trả nợ, sổ nợ) — zero hits outside explicit
  debt-rejection lines; owed help is "chờ xác nhận" (rule 4).
- `grep` for đảm bảo — zero hits, in that order, anywhere; vouching
  is bảo đảm cho + person, and "ensure" is restructured.
- `grep` for người dùng, khách hàng, hội viên — zero hits; members
  are thành viên. Same for tình nguyện viên (helpers are người giúp),
  người giám hộ (shard holders are người gìn giữ), and khai trừ
  (removal is đưa ra khỏi cộng đồng).
- nút only ever means a button; the server is always node (with its
  first-use gloss). tâm bão — zero hits; the refuge is điểm trú bão.
- Diacritics: no ASCII-fied Vietnamese anywhere — spot-grep bare
  forms (` giup `, ` cong dong `, ` ban ` as a word) — zero hits;
  file is NFC (grep combining marks U+0300–U+036F — zero hits);
  modern tone placement (grep `hoà`, `thuỷ`, `qúy` — zero hits).
- One form per concept file-wide where north/south splits exist
  (rule 5) — never a mixed pair (heo AND lợn) in one file.
- `{{…}}` placeholders identical to en; every `_one` key present and
  filled (usually identical to `_other`) — never deleted (rule 11);
  no các/những stacked onto a counted `{{count}}` noun.
- No space before punctuation; buttons and chips carry no terminal
  punctuation; ellipsis is the single-char … (rule 8).
- If a string reads like a ward loudspeaker or a bank SMS (kính thưa,
  trân trọng thông báo, thực hiện + verb), it's the wrong register —
  rewrite it in spoken Vietnamese (rule 3).
- "Understoria" untouched.
