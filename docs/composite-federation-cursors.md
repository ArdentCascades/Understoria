# Understoria — Composite `(timestamp, id)` Federation Cursors (design note)

> **Status:** **phase 1 shipped** (server-side). Every federation
> store's `list()` now routes through a shared `pagedRows` helper in
> `apps/server/src/db.ts` that accepts the optional `sinceId` pair
> component, and every federation GET route parses it. The legacy
> `since`-only inclusive cursor is preserved byte-for-byte (it is the
> absent-parameter path, not a fork), locked in place by
> `db.cursors.test.ts` — the §4 wedge regression suite, run against
> all 12 stores (250 rows sharing one millisecond, page cap 50,
> full convergence under the pair cursor). Phases 2 (peerPull +
> `peer_pull_state` id columns) and 3 (PWA pullers persisting
> `"<ms>:<id>"`) remain specced below and unshipped; until they land,
> pullers still track bare timestamps and the wedge remains for them —
> still unreachable through normal one-at-a-time writes. Originally
> filed at the round-3 review.

---

## §1 The problem this closes

Every federation feed pages the same way: rows ordered
`timestamp ASC, id ASC`, an **inclusive** `>= since` filter, and a
puller that persists `max(timestamp)` of each page as its next
`since`. The inclusive cursor + id/token tiebreak (adopted after the
tie-at-page-boundary fixes) is tie-safe **as long as every tie fits
inside one page**: a re-served boundary row dedups by id and is a
no-op.

The residual wedge: if **more than `limit` rows share one
timestamp** (page cap 200, hard ceiling 1000), the page fills with
the same lowest-id ties on every pull, `max(timestamp)` never
changes, and the cursor cannot move past the tie — everything at or
after it is never served. The puller's cursor records *which
millisecond* it reached but not *where inside that millisecond* it
stopped.

No normal write path can trigger this — timestamps come from
one-at-a-time human actions. Only batch tooling stamping hundreds of
rows with a single `Date.now()` (a future seed/import script, a bulk
migration) could. That is exactly why this is deferred *and* why it
must be designed before any such tooling ships.

### Affected surfaces (the full inventory)

- **Server stores** (`apps/server/src/db.ts` `list()`): exchanges,
  posts, vouches, task_comments, coorg_invitations,
  coorg_invitation_responses, coorg_invitation_revocations, events,
  event_cancellations, claims (timestamp cursors); redemptions and
  invite_revocations (`received_at` cursors, token tiebreak).
- **Node↔node pullers** (`apps/server/src/peerPull.ts`): one
  persisted high-water mark per record kind per peer in
  `peer_pull_state`.
- **PWA pullers** (`apps/web/src/lib/federationSync.ts`): one
  persisted `federationLast<Kind>Pull` settings value per kind.

## §2 Design

The cursor becomes the **position of the last row actually
consumed** — the `(timestamp, id)` pair — instead of the timestamp
alone.

- **Wire:** `GET /<kind>?since=<ms>&sinceId=<id>`. With both
  present, the predicate is strictly-after-the-pair:
  `(ts > since) OR (ts = since AND id > sinceId)`. Ordering is
  unchanged (`ts ASC, id ASC`), so the pair pins a total position in
  the feed and pagination can never re-serve or skip within a tie,
  regardless of tie size.
- **Backward compatibility is free in both directions.** `sinceId`
  absent → today's inclusive `>= since` behavior, verbatim (old
  pullers keep working against a new server). A new puller against
  an old server sends a parameter the route ignores and degrades to
  today's behavior. Rollout is therefore server-first, clients
  opportunistically after.
- **Semantics shift, named honestly:** today's cursor is inclusive
  (re-serve the boundary, dedup cleans up); the pair cursor is
  exclusive (strictly after the last-consumed row). Exclusive is
  correct once the position is exact — the boundary re-serve existed
  only because a bare timestamp could not say *which* tied row was
  last. Pullers keep their id-dedup regardless; it costs nothing.
- **Tiebreak id per store:** the `id` column where one exists;
  `token` for redemptions and invite_revocations; `post_id` for
  claims. Always a signed-payload field or the primary key — nothing
  new for a malicious node to choose that it could not already
  choose.
- **Client persistence:** the settings value
  `federationLast<Kind>Pull` becomes `"<ms>:<id>"`. Parse rule: no
  `:` → a legacy timestamp-only cursor, send `since` alone (one
  inclusive re-serve page, dedup no-ops, then the puller writes the
  pair form). No migration step needed.
- **peer_pull_state:** one nullable `last_<kind>_id` column per
  existing timestamp column (single schema migration). NULL → send
  `since` alone, same legacy rule as the client.
- **Reject-row interaction (round-3 posture, unchanged):** a row
  that fails verification or the plausibility bound still never
  advances the pair — the cursor only ever records a row that was
  verified and consumed (or a verified duplicate).

## §3 What does NOT change

- No new observation surface: both cursor components are data the
  server already serves on every row. Privacy posture unchanged.
- The timestamp plausibility bounds (client `plausibleCursorStamp`,
  server validators) stay — the pair fixes tie *position*, not
  forged *values*.
- `received_at` remains the redemptions/invite-revocations cursor
  (the §7 skew-safety deviation); it just gains the token component.
- Oldest-first ASC ordering everywhere; none of the DESC-pagination
  history is revisited.

## §4 Phased rollout

1. **Server:** every store `list()` accepts an optional
   `sinceId`; routes parse and pass it. Pure superset, no schema
   change. Regression test per store: 250 rows sharing one
   millisecond fully converge across pages (the wedge test).
2. **peerPull:** `peer_pull_state` migration adds the id columns;
   pullers persist and send the pair. The wedge test at the worker
   level.
3. **PWA:** `federationSync.ts` pullers persist `"<ms>:<id>"` and
   send the pair; legacy-value parse rule covered by tests.

Each phase is independently shippable and independently revertible;
the legacy path stays intact throughout (it is the absent-parameter
path, not a fork).

## §5 Open questions

1. **Is it worth it before batch tooling exists?** The honest
   answer: no urgency. The design is filed so that whichever lands
   first — an import tool or a quiet quarter — the change is specced
   and its review can be about the code, not the idea.
2. **Claims `postId` uniqueness.** The claims store is
   first-claim-wins per post (`post_id` primary key), so `postId` is
   a valid tiebreak today. If claims ever become multi-row per post,
   the tiebreak must move to a real row id first.
