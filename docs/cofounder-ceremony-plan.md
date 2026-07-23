# Co-founder ceremony + single-founder visibility — implementation plan

> **Status: SHIPPED** (operator-approved direction; pre-mortem amendments
> binding). Companion to the founder-rooted trust work in
> `docs/threat-model.md` §7.

## 0. Why

Under founder-rooted trust, promotion to "trusted" needs two distinct
TRUSTED vouchers — so a single-founder community can never promote
anyone: only the founder can ever invite or vouch. Communities should
start with two founders, and adding the second must not require editing
`NODE_FOUNDER_KEYS`. Until they do, the app must say so honestly
instead of showing progress meters that can never complete.

## 1. Binding decisions (operator + pre-mortem — do not re-litigate)

- **Ceremony**: founder taps *Add a co-founder* → captures the
  co-founder's public key by scanning their Profile full-key QR in
  person, or pasting it (never a member-roster picker — the
  "no member-list browsing surface" threat-model principle holds).
  Founder signs a **nomination**; the nominee must **accept with their
  own signature on their own device** (accept card delivered over the
  node, recipient-proof scoped); the node verifies both signatures and
  writes the nominee into `claimed_founders`; `GET /config` republishes
  the founder hashes (this already happens live — the closures query
  per request).
- **Gate**: allowed only while total founder-root count
  (env ∪ claimed, deduped) **== 1**. Root COUNT, never trusted-circle
  size — the circle can shrink (reopening attack); the root count
  cannot. Enforced **transactionally** at accession write time: two
  racers → first wins, second gets a clean `root_count_not_one`.
- **Permanence**: founding is irreversible in-app (no founder-removal
  mechanism exists; removing a root could cascade-demote). The accept
  card says this plainly.
- Nominations carry a **signed expiry** (72 h TTL; server sanity-bounds
  the window); founder side shows pending / re-send / withdraw.
- Wrong-key social engineering mitigated by a **confirm step showing
  the resolved member's name + avatar** ("You are making {{name}} a
  founder, permanently"); a key that resolves to no member dead-ends
  with "invite them first — your invites work".
- After accession: the nominee's device **immediately refetches
  /config** (post-redemption-pull immediacy pattern) so it flips out of
  single-founder state in the same interaction; other devices converge
  on their normal capture cadence.
- **Reseed**: the dual-signed accession is the recovery artifact —
  persisted client-side (Dexie `founderAccessions`, carried in the
  community snapshot) and re-POSTable during the reseed grace window
  (record-internal time bounds still enforced; live expiry waived
  in-window). Today `claimed_founders` is NOT covered by reseed — this
  plan closes that. `backup-db.sh` (VACUUM INTO) already covers it.
- Founderless nodes: no capture → no warnings, no ceremony.

## 2. Grounding facts (verified; implementers do not re-derive)

- Latest server migration is **v31** → this work is **v32**.
- `claimed_founders` inserts need **no cache-invalidation code**: both
  the trust resolver and the membership resolver memoize on count
  stamps that include the `claimed_founders` count. A test pins this
  stamp basis (it is load-bearing).
- `/config` founder hashes are computed from live closures per request
  — republication is automatic.
- Nominee delivery uses the **messages-route recipient-proof pattern**
  (x-understoria-key/-ts/-sig verified in-route, READ_AUTH-independent)
  — NOT the IP-bucketed linkRequests pattern (nominee may be on any
  network; they are a member, so proof-of-key is right). A member can
  only ever fetch a nomination addressed to a key they prove — no
  enumeration oracle.
- Profile's FullKeyPanel is text-only today; the ceremony adds a QR
  (lazy InviteQRCode; payload is a public key — no timed-hiding
  needed, noted against the QR-surveillance entry).
- New POST paths stay OUTSIDE `insertCaps.SURFACES` (self-gated far
  more strictly than membership) and must be added to the server.ts
  write-sweep exemption alongside `/claim-founder`.

## 3. Phases

**P1 — shared records** (`packages/shared`): `FounderNomination`
(nominatorKey, nomineeKey, nodeId, nominatedAt, expiresAt, signature)
and `FounderAccession` (embeds the whole nomination,
RedemptionReceipt-style; acceptedAt; nominee signature). Canonical
payloads (domain-separated, pipe-delimited), verifiers (accession
checks BOTH layers), parser, TTL constants, signature-compat fixtures.

**P2 — server**: migration v32 (`founder_nominations` pending-relay
rows, pruned on write; `founder_accessions` permanent artifact —
accession tx inserts into it AND `claimed_founders`). Routes
(one `cofounder.ts` module):
- `POST /founder-nomination`: body checks → `wrong_node`,
  `invalid_expiry`, `stale_nomination` (skew), `node_unclaimed`,
  `root_count_not_one`, `nominator_not_founder`,
  `nominee_not_a_member`, `nominee_already_founder`, `bad_signature`;
  201 stores INSERT-OR-REPLACE per nominee (resend = replace).
- `GET /founder-nomination/pending`: recipient-proof; returns only the
  proven key's unexpired nomination.
- `POST /founder-accession`: stateless-verifiable (embedded nomination
  is the authority; the pending row is not required — that is what
  makes reseed work). Live expiry vs reseed-window waiver;
  record-internal `nominatedAt ≤ acceptedAt ≤ expiresAt` always
  enforced. Byte-identical replay → 200 `alreadyFounder` (idempotent
  convergence). **The transaction**: recount roots (must be exactly 1
  and equal the nominator) + both inserts + pending-row delete.
- Boot + one-time lazy **single-founder warning** in trustGate/server
  (sibling of the founderless warn).

**P3 — client ceremony**: `lib/cofounder.ts` (create/submit/poll/
accept with typed error→i18n mapping; pending-state settings keys);
`/add-cofounder` page (intro with permanence → PairDeviceCapture
QR/paste → confirm with name+avatar → sign & send → pending card with
expiry/resend/withdraw → done on hash-count 2); nomination pull on the
sync loop's slow beat + foreground kick; `CofounderAcceptCard` surfaced
via AttentionSection (permanence copy, accept → POST → immediate
`refreshNodeConfig()` kick; "Not now" dismisses locally); Profile
full-key QR; Dexie `founderAccessions` + community-snapshot +
`reseed.ts` kind `/founder-accession` (409-skip).

**P4 — visibility**: `lib/singleFounder.ts` detector
(`singleFounderLocked` = capture has exactly ONE hash AND trusted
circle < 2; `isSoleFounder`); honest gate-card variants (no progress
meters) on the invite gate, MemberDetail vouch gate, and a new
`single_founder` removal-gate state; `SoleFounderCard` on Profile's
node section + Infrastructure with the *Add a co-founder* doorway and
the "your own invites still work" line; setup.sh + claim-success
"communities start with two founders" step.

**P5 — docs**: threat-model entry (roster-free capture rationale,
root-count transactional gate vs the reopening attack, name+avatar
confirm, expiry, idempotent replay, permanence + deliberate absence of
founder removal, recipient-proof scoping; known gap: reseed after
founder-key change), community-reseed amendments + runbook,
member-authenticated-reads second root path, member/operator/bootstrap
guides, CHANGELOG.

## 4. Named risks

1. Founder #1 recovering with a NEW key after disaster → stored
   accession's nominator no longer matches the sole root → 403; the
   community re-runs the ceremony. Documented, not solved.
2. Nominee clock skew → `acceptance_out_of_window`; copy points at
   date/time settings (stale_claim precedent).
3. Stale-capture split-brain: devices show single-founder cards until
   their next /config fetch; mitigated by the accept-side kick; tests
   pin that cards key off the capture's hash count.
4. Forgetting the server.ts write-sweep exemption for the new paths
   breaks the deny-by-default coverage test — called out explicitly.
5. Migration v32 must land before route registration (statements
   prepared at registration).
6. Every i18n key ships en+es together.

## 5. Test matrix (abridged — the full matrix lives with the tests)

Shared: canonical fixtures, two-layer tamper suite, parser shapes.
Server: every error row as its own test; resend-replace; recipient
proof; accession happy path proving resolver-stamp invalidation AND
two /config hashes; the race (first 201, second 409); expiry live vs
reseed-window; replay 200; env-founder nomination; reopening drill
(2 roots + shrunken circle → still 409); one-time warn.
Client: detector truth table; capture→confirm name/avatar; non-member
dead-end; own-key refusal; pending/resend; accept-card permanence
string (load-bearing) + refreshNodeConfig kick; gate-card honesty with
the digits-tripwire style (no progress meters in locked state);
Profile QR; reseed kind + snapshot round-trip.
E2E drill (governanceDrill pattern): claim → invite → nominate → poll
→ accede → 2 hashes → the deadlock actually breaks over real routes
(third member reaches trusted via founder + co-founder) → second
nomination refuses.
