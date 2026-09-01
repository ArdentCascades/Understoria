# Indonesian (id) translation glossary

Reference for every bulk-translation and review pass over `id.json` and
the Indonesian content modules. Decisions here get applied ~2,900
times — when in doubt, pick the word an Indonesian-speaking neighbor
would say across a kitchen table, not the word a bank SMS, a kelurahan
circular, or a marketplace push-notification would use.

**Locale code is `id`** (language-only): browsers send `id` and
`id-ID`, and i18next's language-only fallback resolves both. The
register is contemporary conversational Indonesian as written in the
big id products (WhatsApp chat itself, Gojek, Tokopedia's friendly
surfaces) — bahasa Indonesia sehari-hari, not bahasa surat dinas and
not marketplace promo-speak. One `id` serves Sabang to Merauke plus
the diaspora; regional languages (Javanese, Sundanese…) are separate
possible future locales, never mixed in here.

## Global register decisions

1. **The member is kamu, uniformly — never Anda.** Anda was coined in
   1957 precisely to give commerce and officialdom a neutral pronoun;
   it is the register of bank SMS, call centers, and terms-of-service
   — nobody says Anda across a kitchen table. The apps that feel like
   companies (banks, airlines, WhatsApp's own settings) say Anda; the
   apps that feel like people (Gojek, Tokopedia, Twitter/IG id) say
   kamu, and that convention is now so established that written kamu
   from an app reads friendly-standard to every age, not presumptuous
   — the presumption problem lives in SPOKEN address, where real
   Indonesians reach for Pak/Bu/Mas/Mbak/Kak, kinship terms the app
   can never guess (guessing wrong is far ruder than kamu). So: kamu,
   lowercase mid-sentence (capitalized Kamu/Mu is letter-writing
   formality), with the clitics -mu ("profilmu", "jam bantumu") and
   kau- never used. Banned as address: Anda, lu/lo/elu (Jakarta
   slang), kau/engkau (literary or regional), dikau. Plural audience:
   "semuanya" or "teman-teman", never "para pengguna".
2. **First person — who is speaking.** (a) When the MEMBER speaks
   (buttons, "my" labels): aku / -ku ("Tambahkan ke kalenderku",
   "Tunjukkan satu hal kecil saja") — aku pairs naturally with kamu;
   saya next to kamu reads stiff and asymmetric. (b) When the APP
   speaks, prefer no subject at all — Indonesian passive and
   subjectless sentences are the native idiom ("Tersimpan.", "Akan
   terkirim saat kembali online.") — or name the real actor:
   aplikasi, node, komunitas ("Aplikasi akan membacakannya untukmu").
   (c) "We" that includes the member is **kita** — Indonesian's
   inclusive we is a gift: it grammatically cannot exclude the reader
   ("kita rayakan bersama"). (d) **Kami is banned as the app's
   voice** — the exclusive we is exactly the corporate "we" of every
   customer-service apology ("Kami mohon maaf atas ketidaknyamanan
   ini"), and there is no company behind this app. It survives only
   where en itself unmistakably speaks as the people who made the
   software (the translation-honesty note), nowhere else. Third
   persons: dia, mereka, "anggota ini", or repeat the name.
3. **Warm everyday Indonesian** over officialese and service-speak.
   Banned outright: mohon / dimohon / harap / diharapkan as request
   padding (most requests read better bare; where en itself says
   "please", soften with "ya" or "yuk", or use silakan sparingly —
   silakan is genuine hospitality, but reflexive silakan-on-
   everything is hotel-lobby speak; and it is spelled silakan, never
   silahkan), "dengan hormat", "yang terhormat", "terlampir",
   "demikian disampaikan", "atas perhatiannya", "terima kasih telah
   menghubungi", melakukan + noun padding (melakukan konfirmasi →
   konfirmasi), dipergunakan (pakai or gunakan), "pihak" as filler,
   "layanan" for help between members (bantuan is help; layanan is
   what a company sells — say "bantu-membantu", never "menyediakan
   layanan bantuan"). Equally banned: marketplace promo-speak —
   promo, diskon, cashback, **voucher** (doubly poisonous here: it is
   coupon-speak AND a false friend of "vouch"), poin, gratis ongkir
   flavor, "jangan lewatkan". This app sells nothing.
4. **No-debt framing.** Never debt vocabulary for exchanges: no utang
   / hutang, berutang, pinjaman, cicilan, tagihan, pelunasan, nunggak
   ("kamu berutang 3 jam" is forbidden) — and no obligation-of-
   gratitude framing (utang budi as something to repay). Debt words
   may appear ONLY where en itself explicitly rejects debt framing
   ("this is not a loan" → "ini bukan utang, bukan pinjaman" — spelled
   utang, the standard form). **Kredit is banned too**: in Indonesia
   kredit means installment loans (kredit motor, kartu kredit), the
   worst possible frame — en's "credit" is always rendered as jam
   (hours). Owed help is "menunggu konfirmasi" (see term table).
5. **Gotong royong — use it, but spend it carefully.** It is THE
   Indonesian word for communal work and it belongs in this app —
   but decades of ministry billboards and New Order civics classes
   have worn it thin as a slogan, so it stays alive only when it
   names something concrete. USE: the work-day feature ("gotong
   royong — {{project}}") and prose about actual collective work
   days. DON'T: sprinkle it as decoration over the whole app or the
   timebank mechanism (mutual aid generally is tolong-menolong).
   The neighboring institutions, decided one by one: **kerja bakti —
   banned** (RT/RW-mandated Sunday labor with fines-for-skipping
   compulsion; the same corvée reasoning that made bo ban its corvée
   word); **arisan — banned for the credit mechanics** (a rotating
   money pot — it drags loan-and-payout framing straight into rule
   4; permitted only in authored content naming an actual arisan);
   **jimpitan** — regional and coin-collection flavored, avoid in
   UI, welcome as resonance in content prose; **ronda** — reserved
   for actual watch-rounds content (patrol-like templates), never
   the care rota (that is giliran); **lumbung** — reserved for the
   seed vault (lumbung benih), don't spend it on the commons.
6. **Loanword policy — three tiers, following id app convention.**
   (a) Proper nouns, codes, and technical literals stay verbatim:
   Understoria, QR (as "kode QR"), Wi-Fi, URL, email, file paths,
   env vars, .ics — plus **node** and **passkey** (see term table
   for why each stays English). (b) Established Indonesian forms win
   over kept English: aplikasi, akun, server, perangkat, kata sandi,
   frasa sandi, profil, sinkron, cadangan / mencadangkan, unduh /
   unggah, kalender, kamera, blokir, kit. Browser stays browser
   (peramban is a ministry coinage nobody says). (c) Where a natural
   everyday word exists, it wins over both the loan and the formal
   coinage: bantu not "support", pakai over pergunakan, contoh not
   templat, "tulis namamu" not registrasi. The test is always "which
   word would the neighbor actually say" — not maximal Indonesian,
   not maximal English.
7. **One spelling per word, modern standard.** utang (not hutang),
   silakan (not silahkan), praktik, risiko, napas, ubah, antre —
   never two spellings of one word in the same file. Deliberate
   deviation: **terpercaya** (the form everyone actually writes)
   over KBBI's tepercaya, applied consistently. Text is NFC (trivial
   for Latin — but no stray combining marks) and carries no
   directional control characters.
8. **Punctuation and numbers.** Sentences end in a period, questions
   in ?, exclamations in ! — used sparingly; enthusiasm comes from
   word choice, not !!. Quotes: curly “ ” (the convention of the
   es/pt/vi siblings — pick it and keep it; never a straight-curly
   mix in one file). Ellipsis: the single-char … ("Mengirim…"). Em
   dash: " — " with plain spaces, as en/es. Headings, buttons, and
   chips take no terminal punctuation, as in en. Digits are ASCII;
   formatted numbers flow through `Intl` (id: 1.000 thousands,
   decimal comma) — never hand-formatted inside strings. "5 jam" can
   read as five o'clock: give the currency context ("5 jam bantuan",
   "Jam bantuan: 5"); clock times render via `Intl`.
9. **Length is the layout risk.** Indonesian runs ~15–30% longer than
   English, and its peN--an nominalizations are LONG unbreakable
   words (pemberitahuan, penyelenggaraan). The tight surfaces are
   known: the bottom nav labels and the 3-up board pill row at
   375px. The nav set is decided short up front — Papan, Kalender,
   Denyut, Pesan, Profil, Yang kurawat — and the pill row is
   Kebutuhan / Tawaran / Proyek. In chips, prefer verb forms over
   nominalizations (Dirawat, not Perawatan). Overflows wrap, never
   truncate mid-word. Casing follows en per key: sentence case
   everywhere, no Title Case.
10. **"Understoria" is never translated** or respelled. Same for file
    names, env vars, and `docs/…` paths quoted in strings.
11. **Interpolation placeholders verbatim**: `{{count}}`, `{{name}}`,
    `{{hours}}`… byte-for-byte identical (parity test enforces this).
    Normal spaces around them, as Indonesian is spaced.
12. **Plurals — read this twice.** Indonesian CLDR collapses to
    `_other` only: nouns don't inflect for number, so the plural gate
    demands nothing beyond `_other`. **BUT** the en file has
    `_one`/`_other` key PAIRS and the parity gate requires ALL keys —
    so fill **BOTH** forms for every plural family, usually with
    identical text ("{{count}} penjamin" works for 1 and for 40).
    Never delete a `_one` key; the parity test will fail the file.
    Never reduplicate a counted noun ("{{count}} anggota", NEVER
    "{{count}} anggota-anggota"); bare reduplication only for
    uncounted collectives ("teman-teman").

## Term table

| English | Indonesian | Notes / DON'T use |
|---|---|---|
| vouch for (verb) | menjamin | Kitchen Indonesian: "Saya yang jamin dia orangnya baik." Button: "Jamin anggota ini". RESERVED: menjamin/jaminan only ever mean vouching-for-a-person in this app; the "ensure/guarantee" sense is always memastikan, so the grep stays clean. DON'T: **anything near voucher** (coupon poison + false friend), merekomendasikan (too weak), memverifikasi (ID checks), menanggung (debt/liability flavor). |
| a vouch (the signed act) | jaminan | "jaminanmu yang sudah ditandatangani", "butuh jaminan dari dua anggota terpercaya". Keep collateral words (agunan, tanggungan) out of the same breath — rule 4 already bans the loan frame it could attach to. |
| vouches (count on trust chips) | {{count}} penjamin | One vouch = one distinct person, so count people: "Dipercaya ({{count}} penjamin)", "Kamu sudah punya {{have}}/{{need}} penjamin". |
| vouched by | {{name}} sudah menjamin kamu | Or "dijamin oleh {{name}}" where the passive reads better. |
| fully vouched | dipercaya penuh oleh komunitas | Chip: "Dipercaya penuh". Mirror es "de plena confianza". DON'T: terverifikasi (verification officialese). |
| trust / trusted member | percaya / anggota terpercaya | Chip: "Terpercaya". Web of trust: jaring kepercayaan — a woven net, truer than any chain. DON'T: tepercaya (rule 7 deviation — one form file-wide), kredibel (HR-speak), terverifikasi. |
| seed balance | benih awal | es keeps the metaphor ("semilla inicial") and so do we: "jam bantuanmu masih persis sebesar benih awalmu". Chip: "Benih: {{hours}}"; seed credits = jam benih. Plain in teaching prose: "semua orang mulai dengan 5 jam". DON'T: modal (capital), saldo awal (e-wallet balance), bonus (promo poison). |
| hours (the currency) | jam | "Satu jam bantuan apa pun tetap satu jam." Always jam for the currency; credit moves → "jam berpindah". Mind the o'clock ambiguity (rule 8). DON'T: **kredit** (installment loans — rule 4), poin (loyalty points), koin (crypto/game), saldo (e-wallet). |
| node | node (kept English) | Keep the teaching gloss: "node (server bersama yang dijalankan komunitasmu)". Kept verbatim — tier (a), rule 6 — because Indonesian tech speech itself keeps "node", while the calque **simpul** means a knot in a rope in everyday Indonesian and its family (menyimpulkan, kesimpulan = to conclude) makes every grep noisy. RESERVED: node means the server and nothing else. Server alone only where en itself says just "server". DON'T: simpul, titik jaringan. |
| community node | node komunitasmu | Peer/friend nodes: **node sahabat** — sahabat is the trusted-friend word, exactly federated friendship (es "nodos aliados"). DON'T: node mitra (business partner), node peer (jargon). |
| federation | komunitas-komunitas yang bersahabat | Prefer the rephrasing in prose: "Across the federation" → "di antara komunitas-komunitas yang bersahabat". DON'T: federasi (sports-body/institutional), aliansi (political-military), jaringan nasional flavor. |
| exchange | pertukaran | "pertukaran bantuan"; confirmed: "Pertukaran sudah dikonfirmasi". DON'T: transaksi (bank/e-commerce), jual beli, barter (goods-haggling flavor). |
| the commons (section) | milik bersama | THE kitchen phrase for a thing held in common: "Ini milik bersama seluruh komunitas." Section: "Milik bersama"; a single one: "satu barang milik bersama". DON'T: aset bersama (finance), fasilitas umum / fasum (public-works register), barang publik (econ jargon), lumbung (reserved for the seed vault, rule 5), commons kept in English. |
| tended (commons status) | dirawat | Chip: "Dirawat"; prose: "dirawat oleh komunitas". Merawat is caring for a person or a plant — exactly the app's care framing. DON'T: dipelihara (livestock/building upkeep), dikelola (managed — administrative), maintenance. |
| retired (commons status) | sedang beristirahat | Deliberate non-literal, mirrors fr "au repos" / zh 歇息中: "biarkan barang ini beristirahat dulu" honors the no-shame lifecycle (it can come back). DON'T: pensiun (pension office), dinonaktifkan (IT — final), dibuang (discarded — shame). Distinct from "diarsipkan" (archived). |
| In my care (nav) | Yang kurawat | Keeps the care verb and fits the nav pill; the -ku clitic is personal without a heavy pronoun. Prose: "akan muncul di 'Yang kurawat'." If it still overflows, wrap — don't truncate (rule 9). DON'T: Tugasku (flattens care to tasks), Pekerjaanku (jobs), Tanggunganku (dependents/burden). |
| Grow another root (add-a-server flow) | Tumbuhkan akar baru | Button: "Tumbuhkan akar baru"; prose: "menumbuhkan satu akar lagi", and the berakar idiom is welcome ("supaya komunitas berakar di lebih dari satu tempat"). Mirrors es "Hacer crecer otra raíz". DON'T: Tambah server, Pasang node baru (both flatten the metaphor to IT). |
| timebank | bank waktu | The transparent calque id articles on timebanking already use. Keep the SURROUNDING prose non-bank: "di bank waktu, minta tolong tidak pernah pakai syarat". DON'T: tabungan waktu (savings passbook — more bank, not less), koperasi waktu (a real legal form — misleading). |
| mutual aid | tolong-menolong | The reduplication every Indonesian grew up saying: "jam tolong-menolong"; also "saling membantu" in prose. Gotong royong is reserved for concrete collective work (rule 5). DON'T: amal (alms — hierarchical charity), donasi, bakti sosial / baksos (institutional charity events), santunan (charity payout). |
| board | Papan | Nav: "Papan"; first-use gloss: "papan komunitas — tempat menempel kebutuhan dan tawaran" (the corkboard every sekolah, masjid, and pos RT has). DON'T: papan pengumuman as the running name (pengumuman is official-notice flavored — fine once in the gloss), forum, beranda (FB home feed), linimasa. |
| dashboard | Denyut | The community's pulse — "denyut komunitas" is natural Indonesian, and the page IS the community's vitals (resilience, milestones, momentum). `dashboard.title` → "Denyut komunitas". DON'T: dasbor / dashboard (car/BI jargon), beranda (home), ringkasan (report-speak). |
| needs | Kebutuhan | Tab/chip: "Kebutuhan"; prose: "yang sedang dibutuhkan tetangga". Asking is "minta tolong" — the kitchen phrase, never shameful. DON'T: permintaan (orders/demand — marketplace), tuntutan (protest demands), kekurangan (lack — shame-laden). |
| offers | Tawaran | Tab: "Tawaran"; an offer: "tawaran bantuan". Plain tawaran is neutral; the poison is its promo cousins. DON'T: **penawaran** (commerce), promo (banned outright, rule 3), layanan (rule 3), jasa (services-for-hire). |
| post (noun) | kiriman | The established id word (Facebook id renders "post" as kiriman): "sebuah kiriman di papan". DON'T: postingan (internet-casual), iklan (advertisement), pengumuman (official notice), pesan (collides with messages). |
| post (verb) | menempel di papan | Sticks the notice up: "Tempelkan kebutuhanmu di papan". "Memposting" acceptable in technical contexts (sync explanations). DON'T: menerbitkan (publishing), mengumumkan (proclamation). |
| claim (a post/task) | ambil | "Ambil tugas ini", "{{name}} sudah mengambilnya" — taking it into your care; the nav framing ("Yang kurawat") does the warmth. DON'T: **klaim** (insurance claims and "klaim voucher" — double poison), rebut (grabbing), booking (gig-economy). |
| project | proyek | The everyday word. DON'T: program (government scheme), kegiatan as the default (an activity, not a goal). |
| task | tugas | "satu tugas kecil". DON'T: misi (gamified missions), pekerjaan (a job), to-do kept English. |
| template | contoh | "Mulai dari contoh yang ada", "contoh proyek". Transparent and warm. DON'T: templat (KBBI-stiff), formulir (bureaucratic forms), template kept in English. |
| work day | gotong royong | THE word, used concretely (rule 5): "Gotong royong — {{project}}", "Jadwalkan gotong royong"; prose: "hari gotong royong". DON'T: **kerja bakti** (banned — RT/RW compulsion, rule 5), hari kerja (HR working day), work day kept in English. |
| shift | sesi | "Ikut sesi pagi", "Kamu di sesi ini". DON'T: shift / sif (factory register), jadwal jaga (on-duty roster), giliran (reserved for the rota family, below). |
| sign-up (for a shift) | tulis nama | The paper sign-up-sheet idiom: "Tulis namamu di sesi ini", "Hapus namamu". Keep this family for shifts ONLY (see RSVP). DON'T: daftar / registrasi (the registration counter and every marketplace funnel's verb). |
| RSVP | jawaban kehadiran (always the full compound) | Heading: "Kabari semua: kamu datang atau tidak"; "Jawabanmu: {{status}}", "Ubah jawaban kehadiranmu". Bare konfirmasi is RESERVED for exchange confirmations; bare balasan is message replies — both real collisions, so RSVP always carries kehadiran. DON'T: keep "RSVP", konfirmasi kehadiran (wedding-card officialese), tulis nama (collides with shifts). |
| rota (care rota) | rawat bergiliran | Giliran is the by-turns kitchen word: "warga bergiliran merawatnya". A rota slot: giliran ("giliran berikutnya terbuka lagi"). DON'T: jadwal piket (school/office chore-duty — compulsion flavor), ronda (reserved for watch-rounds content, rule 5), roster. |
| proposal | usulan | Page: "Usulan"; "usulan dari komunitas". Keep surrounding prose warm so it never reads like meeting minutes. DON'T: **proposal** (in Indonesia a proposal is a funding-request document — total collision), mosi (parliamentary), rancangan peraturan flavor. |
| affirm (a proposal) | sepakat | Button "Sepakat"; count: "{{count}} orang sepakat" — the musyawarah-mufakat consensus word, hands shaken, not admin approval. Blocking a proposal: tahan ("Tahan dulu") — keeps blokir reserved for contacts. DON'T: menyetujui (approval from above — "disetujui atasan"), voting, suka (like). |
| block (a contact) | blokir | The universal app word (WhatsApp id uses it): "Blokir kontak ini", "Buka blokir". RESERVED for contacts; a proposal is tahan (previous row). DON'T: cekal (immigration ban-list), banned kept English. |
| flag (an exchange/comment) | tandai | "Ada yang tidak beres — tandai", "Tandai untuk ditinjau komunitas". DON'T: **laporkan** (report-to-the-authorities — surveillance register; there is no authority here), aduan (formal complaint). |
| dispute | beda pendapat | Page: "Beda pendapat"; status framing: "Komunitas sedang memusyawarahkannya" (short chip: "Dalam musyawarah") — musyawarah is the lived communal-deliberation word, exactly what happens on that page. DON'T: sengketa (land-court legalese), perkara (a court case), perselisihan (heavy), komplain (customer service). |
| removal (of a member) | mengeluarkan dari komunitas | "Mengeluarkan seorang anggota dari komunitas" — honest, not shame-laden. DON'T: memecat (fired), mengusir (chasing out), memblokir (collides with contacts), blacklist / banned. |
| removal ceremony | upacara mengeluarkan anggota | Keep the ceremony — it is deliberate in en; upacara adat shows the word still carries lived communal ritual, not just the school flag-raising. DON'T: prosedur (paperwork — flattens it), proses, sidang (a hearing/trial). |
| reinstatement | kembali / disambut kembali | "{{name}} kembali ke komunitas"; verb: "komunitas menyambut {{name}} kembali" — the door reopening. DON'T: rehabilitasi (clinical/legal), pemulihan status (officialese; pemulihan is RESERVED for account recovery). |
| member | anggota | The workhorse — and koperasi resonance is the good kind. DON'T: pengguna / user, **member** kept English (paid-gym flavor in id — the zh-会员 trap), pelanggan (customer — poison), warga as the default (keep warga for collective color: "warga sekitar"). |
| neighbor | tetangga | "tetanggamu"; collective warmth: "tetangga sekitar", "satu kampung" in looser prose. DON'T: penduduk (census register), warga kompleks (housing-estate admin flavor). |
| community | komunitas | The standard warm word. DON'T: masyarakat (society-at-large), paguyuban (Javanese-marked), RT/RW (administrative units), grup (chat group). |
| invite (noun + verb) | undangan / mengundang | "Undang orang yang kamu kenal", "orang yang mengundangmu" — undangan is wedding-warm, not bureaucratic. DON'T: invite kept English, surat undangan resmi flavor. |
| guardian (shard holder) | pemegang amanah | RESERVED WORD: pemegang amanah only ever means a recovery-shard holder — amanah is the entrusted-thing word, held with care because someone trusted you. "Pilih anggota yang kamu percaya sebagai pemegang amanah"; gloss on first use: "masing-masing memegang sepotong kunci kepulanganmu". DON'T: **wali** (LEGAL guardianship of minors and marriage — the school-form trap, same as fr "tuteur"), penjaga (a watchman), pengawas (supervisor), admin. |
| recovery kit | kit pemulihan | Gloss on first use: "kit pemulihan (cadangan yang mengembalikan akunmu)". The warm recovery verb is "mengembalikan / kembali": "mengembalikan akunmu". DON'T: kotak P3K flavor (first aid), reset pabrik confusion, berkas cadangan (flattens the promise). |
| passphrase | frasa sandi | The established Google/Mozilla id rendering, built on kata sandi; gloss on first use: "frasa sandi (kata sandi panjang dari beberapa kata)". DON'T: kata kunci (means keyword — SEO collision), sandi lewat. |
| passkey | passkey (kept English) | Gloss on first use, matching en's member-facing promise: "passkey — buka dengan sidik jari, wajah, atau PIN perangkatmu". Kept because the id coinage "kunci sandi" is one consonant from kata sandi / frasa sandi — a fatal three-way confusion in a security flow. DON'T: kunci sandi, kunci akses. |
| ledger | catatan bersama komunitas | The shared record book: "tercatat di catatan bersama komunitas". Device-local (en's parenthetical): "buku catatan perangkat ini (catatannya sendiri)". DON'T: buku besar (accounting/blockchain ledger), **buku utang** (never), log sistem. |
| milestone | tonggak | "Mencapai tonggak baru" — tonggak sejarah is the living idiom. DON'T: target (quota), pencapaian as the noun (collides with achievements), milestone kept English. |
| helper (person in an exchange) | penolong | "Penolong menerima jamnya"; field: "Penolong". **Pembantu is banned absolutely** — it means domestic servant. **Relawan is banned** — campaign/disaster volunteering-as-institution; helping here is tetangga saling menolong. DON'T: pembantu, relawan / sukarelawan, asisten (subordinate). |
| skills | keahlian | Field: "Keahlianmu"; headings prefer the phrase "apa saja yang kamu bisa" — the kitchen framing. DON'T: skill / skills, keterampilan (vocational-training register — balai latihan kerja), kompetensi (HR). |
| panic (the emergency wipe) | pilihan saat genting | "Tombol genting"; gloss on first use: "saat bahaya sudah di depan mata: hapus semuanya di perangkat ini seketika". Genting is the dire-moment word; keeps **darurat** RESERVED for the Emergency section ("keadaan darurat"). DON'T: panik (the clinical state, not a feature), mode SOS, darurat (reserved). |
| soft purge / hard purge | hapus sebagian (samarkan identitas) / hapus total (musnahkan semuanya) | One hapus family, honest about the difference: sebagian strips identifying text and keeps the signed ledger; total wipes keys and rotates identity. DON'T: purge kept English, pembersihan (janitorial), format ulang (factory-reset confusion). |
| read aloud (feature) | bacakan | What a family member does for someone who can't read the screen — the -kan benefactive IS the promise: toggle "Bacakan", "Aplikasi akan membacakannya untukmu". DON'T: text-to-speech (spec, not promise), baca layar (screen-reader collision), suara otomatis. |
| seed vault | lumbung benih | Lumbung is the village granary — held in common, kept for the lean season; the resonance is exact and RESERVED here (rule 5): "Perangkat ini adalah lumbung benih — menyimpan utuh sejarah komunitas." DON'T: brankas (bank vault), gudang (warehouse), server cadangan (flattens the metaphor). |
| storm hub | tempat berteduh | Berteduh is lived vocabulary in rain country — ducking under a roof THROUGH the downpour: "tempat berteduh — ada listrik dan Wi-Fi saat semua yang lain padam". DON'T: **pusat badai** (the storm's own center — the trap fr/pt/zh/hi/vi all dodged), **posko** (posko bencana — command-post officialese), tempat pengungsian (refugee register), hub. |
| One small thing | Satu hal kecil saja | Button: "Tunjukkan satu hal kecil saja" — saja is the disarming particle. DON'T inflate to "satu tugas kecil". |
| Ways to plug in | Cara turun tangan | Turun tangan = to step in with your own hands; mirrors es "Formas de participar". DON'T: berkontribusi (open-source flavor), "bergabunglah dengan kami" (recruiting page AND banned kami), partisipasi (seminar-speak). |
| celebrate / celebration | merayakan / perayaan | Category: "Perayaan"; "kita rayakan bersama". DON'T: selebrasi (sports-anglicism), acara seremonial. |
| gleaning (template corpus) | memungut sisa panen | The Gleaning Network template: "jaringan pemungut sisa panen". DON'T: **memulung** (waste-picking — pemulung carries shame register), mengais (scavenging — desperation flavor). |
| organizer | penggerak | The community-organizer word: "penggerak kegiatan ini", "yang menggerakkan proyek ini". DON'T: admin, panitia (a committee), penyelenggara (corporate events), pengurus (org officialdom — pengurus RT). |
| operator (appears near node) | yang menjalankan node | Prose rendering: "siapa pun yang menjalankan server untuk komunitas — wewenangnya jelas, batasnya jelas". Compact label where a bare noun is unavoidable: "operator node". DON'T: admin / administrator (contradicts the no-admins framing), pengelola (management register), teknisi (a technician). |
| founder / co-founder | pendiri / pendiri bersama | "pendiri komunitas ini"; ceremony: "upacara pendirian bersama". DON'T: pemilik (owner), ketua (chairman), owner. |
| display name | nama panggilan | Exactly the id concept — the name people call you by: "Nama panggilanmu (tidak harus nama asli — bebas pilih)". DON'T: nama pengguna (username), nama tampilan (IT-literal), nama lengkap (the KTP field). |
| owed help | menunggu konfirmasimu | Badge: "Menunggu konfirmasi"; "{{hours}} jam menunggu konfirmasimu". Deliberately NOT utang / tagihan — the app refuses debt framing (rule 4). |

## Known hard strings

- **In my care** → "Yang kurawat" — merawat keeps the tending-a-person
  warmth, and the -ku clitic keeps the nav pill short and personal.
- **Grow another root** → "Tumbuhkan akar baru" — keeps the botanical
  metaphor alive instead of flattening it to server administration.
- **tended** → "Dirawat" — the verb you use for a plant or a sick
  neighbor, which is exactly the relationship the commons asks for.
- **seed balance / seed credit** → "benih awal" / "jam benih" — keeps
  the metaphor es established, and benih carries planting hope, not
  banking.
- **Dashboard** → "Denyut" ("Denyut komunitas") — the page shows the
  community's vitals, and "denyut komunitas" is idiom, not jargon.
- **storm hub** → "tempat berteduh" — the lived shelter-from-the-rain
  word, refuge THROUGH the storm, never the storm's own center.
- **vouch** → the menjamin family — kitchen speech ("saya yang jamin
  dia"), with the ensure-sense banished to memastikan and anything
  resembling "voucher" banned outright.

## Quick self-check for translators

- Would a neighbor say this out loud across a kitchen table? If not,
  redo it.
- `grep` for Anda — zero hits; the member is kamu (rule 1). Same for
  ` lu `, ` lo `, engkau, dikau; silahkan (misspelling — it is
  silakan, and sparing).
- `grep` for kami — zero hits outside the translation-honesty note;
  the app drops the subject or names its actor, and inclusive "we"
  is kita (rule 2).
- `grep` for mohon, harap, "dengan hormat", "atas perhatian",
  melakukan konfirmasi-style padding — zero hits (rule 3). layanan
  and jasa likewise; help between members is bantuan.
- `grep` for utang, hutang, pinjaman, cicilan, tagihan, kredit —
  zero hits outside explicit debt-rejection lines; owed help is
  "menunggu konfirmasi" (rule 4).
- `grep` for promo, diskon, cashback, voucher, poin — zero hits
  (rule 3); voucher doubly so (vouch false friend).
- `grep` for pengguna, pelanggan, "member" — zero hits; members are
  anggota. Same for pembantu and relawan (helpers are penolong),
  wali (shard holders are pemegang amanah), klaim (claiming is
  ambil), laporkan (flagging is tandai), and kerja bakti (work days
  are gotong royong — rule 5).
- menjamin/jaminan only ever mean vouching; "ensure" is memastikan.
  simpul — zero hits; the server is always node with its first-use
  gloss. pusat badai and posko — zero hits; the refuge is tempat
  berteduh.
- One spelling per word: utang, silakan, praktik, risiko,
  terpercaya — never a mixed pair in one file (rule 7). No
  directional control characters; text is NFC.
- `{{…}}` placeholders identical to en; every `_one` key present and
  filled (usually identical to `_other`) — never deleted (rule 12);
  no reduplicated noun after a counted `{{count}}`.
- Buttons and chips carry no terminal punctuation; quotes are curly
  “ ”; ellipsis is the single-char … (rule 8); nav and pill labels
  stay short and wrap rather than truncate (rule 9).
- If a string reads like a kelurahan circular or a marketplace push
  notification, it's the wrong register — rewrite it the way you'd
  say it to your neighbor (rule 3).
- "Understoria" untouched.
