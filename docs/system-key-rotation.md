# Understoria — System Key Rotation (operator runbook)

> **Status: shipped.** The verifier side (peers select the key that
> was current at each record's signing time from your published
> history) and the publication mechanism (`NODE_SYSTEM_KEY_HISTORY`
> → `GET /api/config`) are both live. This runbook is the operator
> procedure that connects them. Design background:
> [`auto-confirm-key.md`](./auto-confirm-key.md) §4 ("Rotation");
> the member-facing announcement template is
> [`incident-templates.md`](./incident-templates.md) §1; key
> *generation* is [`deploy-linode.md`](./deploy-linode.md) §6.

---

## 1. What rotation does — and what it must not break

The node system key signs the helped side of auto-confirmed
exchanges (`autoConfirmedBy: "system:<nodeId>"`). Peers verify those
signatures against the key your node publishes in `GET /api/config`.

Rotation replaces the signing key. Two properties must both hold
afterwards:

1. **Past records stay verifiable forever.** Every exchange your old
   key signed is already in peers' ledgers and in members' balances.
   If peers can no longer verify those signatures, they reject the
   rows on every future pull — a new node onboarding into the
   federation would silently drop your community's auto-confirmed
   history.
2. **The old key stops working for NEW records.** If you rotated
   because the key may be compromised, an attacker holding it must
   not be able to sign records dated after the rotation.

Both are achieved by *publishing the retired key with its retirement
timestamp* rather than deleting it. Peers pick the key that was
current at each record's `autoConfirmedAt`: before `retiredAt` →
the old key verifies; after → only the new key does.

**The failure mode this runbook exists to prevent:** rotating the
secret in `.env` *without* adding the old public key to
`NODE_SYSTEM_KEY_HISTORY`. Your node would keep running and look
healthy, but every peer would begin rejecting all of your
pre-rotation auto-confirmed records on pull.

## 2. When to rotate

- The key may have been exposed (server compromise, backup leak, a
  contributor with `.env` access stepping back on bad terms).
- Preemptively, as scheduled key hygiene.
- After a server reinstall where you cannot rule out exposure.

When in doubt, rotate — the procedure is cheap and the audit trail
survives it by design.

## 3. Procedure

**Before you start:** save the OLD public key. If you no longer have
it, fetch it now — it is the `systemKey.current` value in
`https://<your-domain>/api/config`. You need the *public* key only;
the old secret can (and should) be destroyed.

1. **Record the rotation moment.** Pick the timestamp *now*, before
   the new key signs anything, in epoch **milliseconds**:

   ```bash
   date +%s%3N     # e.g. 1782500000000
   ```

   Records signed before this moment belong to the old key; records
   after it belong to the new one. (The server refuses to sign while
   restarting, so the boundary is clean as long as you complete the
   steps in order.)

2. **Generate the new keypair** (same as first-time setup,
   [`deploy-linode.md`](./deploy-linode.md) §6):

   ```bash
   docker compose run --rm --no-deps --entrypoint node understoria \
     /app/scripts/generate-system-key.mjs
   ```

3. **Update `.env`** — both variables together:

   ```bash
   # The NEW secret from step 2:
   NODE_SYSTEM_SECRET_KEY=<new base64 64-byte secret>

   # The OLD public key, retired at the step-1 timestamp. JSON array;
   # if you have rotated before, APPEND — never remove old entries:
   NODE_SYSTEM_KEY_HISTORY=[{"pubkey":"<old base64 public key>","retiredAt":1782500000000}]
   ```

   On a second rotation the array has two entries, and so on. Order
   does not matter (the server sorts by `retiredAt`), but every key
   that ever signed must stay listed — removing an entry un-verifies
   every record that key signed.

4. **Restart:**

   ```bash
   docker compose up -d
   ```

   The server validates `NODE_SYSTEM_KEY_HISTORY` at boot and
   **refuses to start** on malformed JSON or entries — a silently
   dropped history entry would be worse than downtime.

5. **Verify.** `https://<your-domain>/api/config` must show:
   - `systemKey.current` = the NEW public key
   - `systemKey.history` containing the OLD public key with your
     step-1 `retiredAt`
   - `nodeId` unchanged

6. **Destroy the old secret.** It has no remaining legitimate use:
   verification needs only the public key you just published, and
   any future signature it could produce would carry a
   post-`retiredAt` timestamp that peers reject.

7. **Announce.** Send the member/peer announcement from
   [`incident-templates.md`](./incident-templates.md) §1. Peers pick
   up the new config within one pull cycle (default 5 minutes) with
   no action on their side.

## 4. What peers experience

Nothing, if you followed §3. Their pull worker refreshes your
`/api/config` at the start of every cycle; the first cycle after
your restart sees the new `current` + history and:

- keeps verifying (and serving to new peers) everything your old key
  signed before `retiredAt`;
- verifies new records against the new key;
- rejects any record that claims the old key for a timestamp after
  `retiredAt` — which is precisely the compromised-key scenario the
  rotation exists to disarm.

A peer whose pull lands *during* your restart records a transient
failure and retries next cycle; its cursor does not move, so nothing
is skipped.

## 5. Edge cases

- **"I rotated weeks ago without publishing the history."** Add the
  old public key to `NODE_SYSTEM_KEY_HISTORY` now with your best
  estimate of the rotation moment as `retiredAt` — *estimate high*
  (later) rather than low: a too-early `retiredAt` un-verifies
  legitimate records signed near the boundary, while a too-late one
  only extends the window in which the old key is honored. Peers
  will re-accept the stranded records on their next full
  convergence (a fresh peer pulls everything; established peers
  whose cursors already passed the rejected rows will pick them up
  when they next bootstrap or re-sync from zero).
- **"I lost the old public key."** Check `/api/config` history on
  any long-running peer (they cache last-known-good config), your
  `.env` backups, or the announcement you sent at the previous
  rotation. Without it, pre-rotation records cannot be re-verified —
  which is why step 3 says append-only.
- **Disabling auto-confirm entirely** (empty
  `NODE_SYSTEM_SECRET_KEY`) hides `systemKey` — *and the history* —
  from `/api/config`. If your node ever system-signed records, keep
  the key configured or peers will reject those records. Disable by
  setting `AUTO_CONFIRM_MIN_HOURS=0` instead: the endpoint refuses
  to sign anything new while the published history keeps the past
  verifiable.
