# Korean (한국어 / ko) translation glossary — the fleet contract

Binding for every fragment agent of the ko fleet, and the record
of the Stage-0 decisions. Deviations fail assembly. Korean is the
nineteenth language: the fleet path (AI-assisted, gated, honestly
labeled `reviewStatus: "new"` until native review), on the rails
eighteen languages proved — with the ko-specific decisions below
settled up front, the way my settled Zawgyi and bn settled digits.

Why Korean now: Korea has its own living mutual-aid vocabulary —
품앗이 reciprocal labor, 두레 communal work — and its own municipal
timebank experiments (시간은행 is an established term, not a
coinage we need to invent); diaspora communities across the US,
Japan, and Central Asia organize the same way. The register work
below stands the app beside that tradition rather than beside the
membership-service register most Korean software defaults to.

## Stage-0 findings (verified 2026-09-27, node/ICU)

1. **Plurals**: CLDR ko has a single category (`other` for 0, 1,
   everything). ko.json follows the zh/bo/id/my precedent:
   `_one`/`_other` pairs both exist with identical strings, every
   count-driven form interpolating `{{count}}`. Korean counters
   (개, 명, 번, 시간) attach to the number as usual and never
   pluralize.
2. **Digits — no pin needed.** CLDR ko's default numbering is
   already `latn` (verified: 1,234,567), so the bn/fa/my
   `intlNumbering` pin does not apply. Sino-Korean vs native
   numeral WORDS (하나/둘 vs 일/이) never appear as digits-in-words:
   strings interpolate `{{count}}` and let the counter carry the
   grammar (…{{count}}시간, …{{count}}명).
3. **Line-breaking is the ko-specific typography decision.**
   Browsers break Hangul between ANY two syllables by default
   (CJK rules), splitting words mid-word — legible but ragged and,
   on narrow chips, genuinely confusing (예: "커뮤니\n티").
   Korean web typography's standard fix is `word-break: keep-all`
   (+ `overflow-wrap: break-word` so an unbroken long token can
   still not overflow) — the wiring PR ships exactly that under
   `:lang(ko)`, plus the font stack ("Noto Sans KR",
   "Apple SD Gothic Neo", "Malgun Gothic" before Inter). Hangul
   needs no line-height floor (no stacked clusters); the default
   leading stands.
4. **NFC is load-bearing for Hangul.** macOS file APIs decompose
   Hangul to NFD (ᄒᆞᆫ...); a copy-paste from a Mac filename can
   smuggle decomposed jamo that render identically and fail every
   byte-exact gate. The assembly gates require NFC and reject any
   U+1100-11FF/U+A960-A97F/U+D7B0-D7FF conjoining jamo outside
   precomposed syllables. Standard invisibles ban applies
   (U+200B-200F, U+202A-202E, U+2066-2069); Korean needs none of
   them.
5. **Spacing (띄어쓰기) is orthography, not style.** Korean writes
   word spaces and gets meaning from them; the gates can't check
   grammar, so the self-check makes spacing a named review item
   and the reconciliation pass reads for it.
6. **Registry entry (at wiring)**:
   `{ code: "ko", endonym: "한국어", dir: "ltr", speakLang: "ko", reviewStatus: "new", content: "ui-only" }`
   — endonym per CLDR DisplayNames; fallback ko → en; no
   intlNumbering pin (finding 2).

## Global register decisions

1. **해요체 throughout — the warm neighborly register.** Korean's
   politeness system is the register decision: the app speaks
   해요체 (-아요/-어요/-해요) — polite, warm, spoken-modern — the
   register of Korea's neighborly community apps, never 합쇼체
   (-합니다: corporate/broadcast stiffness) and never 반말 (bare
   intimate forms). Instructional sentences use -세요 requests
   (저장하려면 누르세요); descriptive prose uses -어요/-예요.
   Literary written style (-다 endings) is banned in UI prose —
   it reads as a terms-of-service.
2. **"You" is pro-drop; 당신 is banned.** Korean drops subjects
   naturally and most strings need no pronoun at all. Where a
   possessive is unavoidable, use the app convention **내 ~**
   ("내 프로젝트", "내 시간") — first person because the SCREEN is
   the member's own view, the established Korean software idiom.
   당신 (confrontational outside song lyrics), 그대 (poetic),
   자네/너 (rank-marked) never appear. ~님 attaches to member
   display names as the equal honorific (rule 8).
3. **No corporate-"we".** 저희 (humble corporate we) and 우리 as
   the APP's self-reference are banned — the app is not a company
   speaking. App voice is subjectless (natural Korean) or a named
   actor (앱이, 서버가, 커뮤니티가). 우리 belongs to the MEMBERS
   (우리 커뮤니티 in prose about the community itself is fine and
   warm — it is theirs, not ours).
4. **THE DEBT FENCE.** Hours are never debt. Banned: **빚 /
   부채 / 채무** (debt), **빌리다 / 빌려주다** near hours (borrow/
   lend), **이자** (interest), **갚다 / 상환** (repay), **대출**
   (loan), **정산** (settle accounts — bookkeeping register),
   **장부 / 원장** (the account-ledger words; the community record
   is 기록, rule 11). The balance is hours moving in the
   community's shared record — never owed. The ONE sanctioned
   formula, verbatim where en refuses the frame (FAQ balance
   answer, member guide):
   **«도움을 요청하는 건 빚이 아니에요 — 빌린 것도 없고, 갚을 것도
   없어요.»**
   The seed-library gift line: **«선물이에요 — 갚는 게 아니에요.»**
   Each occurrence FLAGGED; legal-sense debt in the legal-aid
   template may be literal, FLAGGED.
5. **THE RANK FENCE — Korean's own novel rule.** Korean grammar
   and workplace culture encode hierarchy relentlessly (직급
   titles, 선배/후배 seniority, honorific asymmetry). This app is
   a community of equals and the translation must be too: **no
   rank or title vocabulary ever** (회장, 간부, 임원, 직급, 상급/
   하급, 선배/후배 as roles), honorifics are SYMMETRIC (every
   member is equally ~님; the app itself receives none), and no
   string may imply an approval hierarchy where en has none.
   ONE cultural carve-out for the corpus only: **품앗이** and
   **두레** — Korea's own reciprocal-labor traditions — may be
   *referenced as the lived practice they are* in community
   content (they are exactly the register this app stands
   beside), never used as the app's own mechanism name; FLAG each
   occurrence. 계 (the rotating-credit 계모임) stays out entirely
   — its money-pool resonance walks straight into the debt fence.
6. **THE SURVEILLANCE FENCE.** The report-to-authority register
   never appears: **신고** (report to authority — THE loaded
   word; every Korean platform's "report" button, and exactly the
   register this app refuses: flagging a post is
   **«커뮤니티에 내놓기»** — laying it before the community),
   **고발 / 고소** (denounce/sue), **사찰** (state surveillance),
   **감시** (surveil — literal referent in safety content only),
   **검열** (censorship — literal referent only), **취조 / 심문**
   (interrogate), **체포** (arrest — literal referent in safety
   content only), **등록** (register/enroll — the
   resident-registration root 주민등록 is Korea's own roster
   apparatus; joining is **가입** or **참여**, never 등록),
   **명단** (the roster/list word — 블랙리스트 resonance; a list
   of people is 목록 only for neutral UI lists, and people-lists
   are named by what they are: 구성원, 참여한 사람들). Blocking a
   contact is **차단** — established personal-boundary software
   Korean, not authority register. 경찰 (police) and 구금/수감
   (detention) appear only as literal referents in safety
   content.
7. **The confirm reservation, resolved for Korean.** 확인 is
   Korean software's universal "OK/check/confirm" and cannot be
   avoided for generic checking — so the every-glossary rule
   lands as: **확정** is RESERVED for exchange confirmation only
   (the moment hours move: 교환 확정); generic check/verify is
   **확인**; approving a device is **허용** (allow); a
   fingerprint match is **일치**. 승인 (bureaucratic approval)
   is banned everywhere — it implies the hierarchy rule 5
   refuses.
8. **NO ADMINS.** Banned: **관리자** (admin/manager — also every
   Korean platform's power role), **운영진** (operations staff),
   **관리 / 운영** as nouns for what anyone does to the community,
   **어드민**, **권한 부여** framings (power-granting), 본부/부서
   (HQ/department). The operator is **서버지기** — the
   server-keeper, on the native ~지기 pattern (등대지기, 문지기):
   warm, bounded, and utterly without rank. The sanctioned
   negation: **«여기엔 관리자가 없어요.»** — the no-admins denial,
   FLAGGED where used.
9. **Community is 공동체; members are 구성원.** 공동체 carries
   the belonging register; prose may use **이웃** (neighbors) and
   **마을** (village flavor) freely. Banned: **사용자** (user),
   **회원** (the gym-membership/service register — precisely the
   commercial frame this app refuses), **고객** (customer),
   **유저** (loan-user), 단체/기관 (organization/institution as
   the community's name). 커뮤니티 (the loan) is acceptable where
   공동체 stacks awkwardly in compounds — the fleet prefers 공동체
   and records each 커뮤니티 use for review.
10. **Digits and dates**: Western digits throughout (native
    default, finding 2); CLDR ko date order (2026. 9. 26.) via
    `intlLocale("ko")` — never hand-formatted dates; counters
    attach without a space after digits ({{count}}시간,
    {{count}}명 — standard orthography).
11. **Vocabulary anchors**: the community record is **기록**
    (never 장부, rule 4); timebank is **시간은행** (the
    established Korean term — no coinage needed); mutual aid is
    **서로돕기** (the plain each-other-help compound) with
    상부상조 available in prose (the four-character classic reads
    warm, not stiff, here).
12. **Punctuation**: Korean uses ASCII-shaped . , ? ! with
    Western spacing — the ASCII-"?" ban of my/bo does NOT apply.
    No terminal period on buttons, chips, headings, or nav
    labels. Curly “ ” quotes with ‘ ’ nested (Korean printed
    convention; 「」 stays out — it reads as Japanese typography
    to modern Korean web readers). Single-char …; spaced em dash
    is allowed but prefer the Korean comma rhythm. Latin product
    names (Tor Browser, Signal, FileVault, QR) stay Latin;
    **Understoria is never transliterated**.
13. **Loan-word tiers** (the fa rule 7 pattern): password =
    **비밀번호**; passphrase = **암호문구** (glossed on first
    use — longer than a 비밀번호, a phrase you can remember);
    passkey = **패스키** (the platform term as Apple/Google
    Korean UIs render it); recovery kit = see term table
    («돌아오기 꾸러미»); server/node = **서버** (the honest loan).
    OS-controlled labels stay platform Korean or English exactly
    as the OS shows them (the ur/fa precedent).
14. **Calendar and feed vocabulary** (the Stage-0 collision check
    the provenance doc's inventory note now requires): calendar =
    **달력** (native; 캘린더 banned as avoidable loan); the
    organizer-consented public feed is the **«공개 달력 링크»**
    (the public calendar link) and subscribing is **구독** — the
    established, neutral Korean subscription word. No collision:
    push notification = **알림** (the addendum's choice, verified
    free because a board post is **글**, rule below), reminders =
    **미리 알림**? No — see term table: reminder stays inside the
    알림 family with 이벤트/할 일 context carrying the kind.

## Term table

⚠ marks rows the fleet must treat as provisional and the native
review adjudicates first.

| Concept | 한국어 | Notes |
|---|---|---|
| community | 공동체 | rule 9; prose may use 이웃, 마을 |
| member | 구성원 | never 회원/사용자/유저 |
| hours / balance | 시간 / «내 시간» | rule 4 fence; never owed; balance = 잔여 banned (banking) — «지금까지의 시간» framing, ⚠ |
| dashboard | ⚠ «마당» (the shared courtyard) | ht's Souf / my's အသက် precedent — the village yard where everything happens; review confirms or renames |
| board (posts) | 게시판 | the native BBS word — warm, established, no officialese |
| post (need/offer) | 글 / «필요해요» / «도울게요» | pills: 필요한 것들 / 도울 수 있는 것들 ⚠ |
| push notification (opt-in) | 알림 | the addendum's choice, collision-verified: the post is 글, so 알림 is free. DON'T: 푸시 (bare loan), 통지 (officialese) |
| reminder (event/shift) | 알림 + context («이벤트 알림», «근무 알림» ⚠) | one family, kind carried by the compound |
| claim / "In my care" | 맡기 / «내가 맡은 일» | the caretaking verb, not 담당 (assignment-officialese, banned) |
| confirm (exchange ONLY) | 확정 | rule 7 reservation |
| check / verify (non-exchange) | 확인 | rule 7 |
| approve a device | 허용 | never 승인 |
| vouch | ⚠ «믿음 보태기» (adding one's trust) | never 보증 (surety/collateral — debt fence adjacency), never 추천 (recommendation) |
| guardians (key shards) | «열쇠지기» | the ~지기 keeper pattern; never 보호자 (legal guardian) |
| key shard | 열쇠 조각 | |
| recovery kit | «돌아오기 꾸러미» ⚠ | the coming-back bundle; 꾸러미 is the warm parcel word |
| work day | «함께 일하는 날» | NOT 노력봉사/근로봉사 (mobilized-labor register), not 봉사 at all (rule: volunteering-as-charity frame) ⚠ |
| shifts / sign-up sheet | 시간대 맡기 / «이름 올리기» ⚠ | never 등록 (rule 6), never 신청서 (application-form register) |
| RSVP family | «갈게요 / 못 가요 / 아직 몰라요» | plain speech |
| event / gathering | 모임 | never 행사 (officialese) for community gatherings; 이벤트 acceptable in compound UI labels where 모임 stacks awkwardly ⚠ |
| flag | «커뮤니티에 내놓기» | rule 6; never 신고 |
| dispute | «의견 차이» ⚠ | neighborly disagreement; never 분쟁 (legal), never 민원 (complaint-to-office) |
| block / unblock | 차단 / 차단 해제 | rule 6 note — personal boundary, not authority |
| operator | 서버지기 | rule 8 |
| removal / return | «내보내기» ⚠ / «다시 맞이하기» | honest weight, no expulsion officialese (제명/추방 banned) |
| invite | 초대 / 초대장 | guest warmth; never 모집 (recruitment) |
| template | 틀 ⚠ | native over 템플릿; review decides if 틀 reads too literal |
| milestone | 이정표 | the road-marker word |
| seed family | 씨앗 («씨앗 시간», seed vault «씨앗곳간» ⚠) | 곳간 is the granary word |
| panic | «비상 지우기» family — see hard strings | 비상 (emergency) allowed HERE only, as the lived word ⚠ |
| hard purge / soft purge | «전부 지우기» / «절반 지우기» ⚠ | plain words, full force |
| storm hub | ⚠ «등대» (the lighthouse) | fa's bright-house image in Korea's own coastal idiom; review confirms |
| password / passphrase / passkey | 비밀번호 / 암호문구 / 패스키 | rule 13 |
| device linking | 연결 family («기기 연결», «연결 코드») | plain connect words |
| node / server | 서버 | the honest loan |
| federation | ⚠ «공동체 잇기» | communities linking as equals; never 연합 (bloc/league officialese) |
| ledger (community record) | «공동체 기록» | rule 4/11; never 장부 |
| read aloud | 소리 내어 읽기 | |
| gift | 선물 | rule 4 gift line |
| skills | 잘하는 것들 | plain "things you're good at"; never 스펙 |
| exchange | 교환 | 확정 pairs with it at the confirm moment |
| proposal / vote | 제안 / 투표 | never 안건 (committee register) ⚠ |
| timebank | 시간은행 | rule 11 — the established Korean term |
| calendar / public feed / subscribe | 달력 / «공개 달력 링크» / 구독 | rule 14 |
| tagline | see hard strings | |

### Errata from the UI fleet reconciliation

Recorded after the six-chunk fleet was reconciled into one voice;
the native-review cycle should confirm these alongside the table
above.

- **organizer, resolved as two senses** (the table shipped without
  a row): an EVENT's organizer is **모임을 꾸린 사람** (creator
  framing — the record is immutable); a PROJECT's organizer role
  is the **이끔이** family (**공동 이끔이** co-organizer,
  **중심 이끔이** primary — the transferable-role words the
  fleet's project chunk chose from Korea's own co-op register,
  kept over a rank-fence hesitation because 이끔이 is precisely
  the word those communities use to avoid 리더/장 titles; ⚠
  native review adjudicates). The co-organize invitation surface
  bridges them: the activity is 함께 꾸리기, the role named on
  the page is 공동 이끔이.
- **key = 열쇠 fleet-wide** (신원 열쇠, 공개/비밀 열쇠, 열쇠
  전체 보기) — enforced over two chunks' 키 drift; 패스키 stays
  the platform loanword (rule 13).
- **playbook = 길잡이** (the table's 틀 is the form-template
  sense; a project's how-it-runs playbook is 길잡이) — enforced
  over one chunk's 본보기.
- **project history = 걸어온 길** — 발자취 stays reserved for
  achievements, which the table never named; suggested table row.
- **sign-up sheet = 이름 올리기 용지** — unifying 이름 올리기
  종이 / 이름 적기 용지 drift; extends the table's 이름 올리기.
- **coined and adopted fleet-wide**: 신원 (cryptographic
  identity), 공유지 (commons) with 돌봄/돌보는 사람들
  (stewardship), 문턱값 (threshold), 찬성/막기/기권 (consensus
  votes — 막기, never 차단, which stays contact-only),
  공동체 결정 (governance), 정원 (event capacity), 발자취
  (achievements), 소식 (project updates), 내 책상 (the desk),
  기다리는 일들 (the attention rail — push의 neutral body
  «기다리는 일이 있어요» rhymes with it by design), 등대는
  아직 미정 — storm hub strings live in content, not UI.
- **The 그대/간부 scanner residue rule**: 그대로 (as-is) and
  순간부터 (from-the-moment) contain banned substrings as benign
  compounds; the gates adjudicate them by hand, the csw/fa
  precedent — recorded so the next run knows.

## Known hard strings

- **The tagline** — "The unit of progress is 'we', not 'I'." —
  Korean quotes the pronouns as words, and 해요체 keeps it warm:
  **«앞으로 나아가는 단위는 “나”가 아니라 “우리”예요.»**
- **Compelled biometrics** — full force, the fa fidelity-table
  process: fingerprints and faces can be taken by force, a
  passphrase in your head cannot —
  «지문과 얼굴은 강제로 가져갈 수 있어요. 머릿속의 암호문구는
  말하지 않는 한 아무도 가져가지 못해요»; police named literally
  (경찰) exactly here; nothing softened, no reassurance en does
  not make. The fleet builds the line-by-line en→ko table for
  review.
- **The no-admins negation**: «여기엔 관리자가 없어요.»
- **The two organizer publicity hints**
  (`events.new.namedRemindersLabel/Hint`,
  `events.new.syndicateLabel/Hint`) — the strongest consent copy
  in the app (the provenance doc's inventory note flags them for
  native-speaker care): every clause of the en survives — what
  leaves, to whom (커뮤니티 밖 사람들과 달력 서비스 회사들까지),
  and the retraction limit (다음 새로고침 때, 이미 가져간 복사본은
  남아요) — softening nothing.
- **{{hours}} pre-formatted convention** (the ht erratum,
  standing): keys receiving formatSignedHours output append no
  unit word; only bare-number keys carry 시간. The new
  `format.hoursShort`/`minutesShort` keys are «{{count}}시간» /
  «{{count}}분» — the counter IS the unit, no space (rule 10).

## Quick self-check for translators (script it)

- Key/order parity with the en chunk at every depth;
  interpolation multisets byte-identical; `_one`/`_other` pairs
  identical with `{{count}}` in both.
- Zero: 합쇼체 (-습니다/-합니다) and bare -다 endings in UI prose;
  당신/그대/자네/너; 저희, and 우리 as the app's self-reference;
  the debt list (rule 4: 빚, 부채, 빌리, 이자, 갚, 상환, 대출,
  정산, 장부, 원장); the rank list (rule 5: 회장, 간부, 임원,
  직급, 선배, 후배); the surveillance list (rule 6: 신고, 고발,
  고소, 사찰, 취조, 심문, 등록, 명단); 관리자/운영진/어드민/승인
  (rules 7-8); 사용자/회원/고객/유저 (rule 9); 행사 for community
  gatherings; 봉사 anywhere; 신청서; 캘린더; terminal periods on
  labels; straight quotes and ASCII "..."; 「」 brackets.
- NFC everywhere; zero conjoining jamo outside precomposed
  syllables (finding 4); zero invisibles (U+200B-200F,
  U+202A-202E, U+2066-2069); 띄어쓰기 read for in reconciliation
  (finding 5).
- 확정 only for exchange confirmation; 차단 only for contacts;
  가입/참여 for joining; benign-residue notes to record per chunk
  (등록 inside 주민등록 in safety content naming the apparatus
  literally is the referent exception; 관리 inside OS-label
  quotations stays as the OS shows it — each hit adjudicated by
  hand, the csw/fa precedent).
- **This file's choices are a first draft pending native
  review** — the ⚠ rows first; the ban rows are load-bearing
  regardless, and any replacement term must still avoid them.
