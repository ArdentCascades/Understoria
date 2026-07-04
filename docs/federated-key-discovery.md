# Understoria — Multi-Hop System-Key Discovery (design note)

> **Status:** design note, decision pending. Written to close out the
> last open question from the code-review workstream (PRs #305–#308).
> Pairs with [`auto-confirm-key.md`](./auto-confirm-key.md) §4 (the
> strict-verification contract), [`system-key-rotation.md`](./system-key-rotation.md)
> (the published-history mechanism the resolver consumes), and
> [`federated-node-allowlist.md`](./federated-node-allowlist.md)
> (whose self-attestation analysis this note reuses). Read alongside
> the Agent 15 (federation governance) roadmap entry — the
> recommendation lands there.

---

## 1. Problem

The peer pull worker verifies every pulled exchange with
`verifyExchangeLabel`. For an auto-confirmed row
(`autoConfirmedBy: "system:<nodeId>"`), the helped-side signature must
verify against the system pubkey of the node named in the record. The
worker learns system pubkeys from **direct peers only** — the
`GET /config` of each URL in `PEER_NODE_URLS`, refreshed each pull
cycle.

That leaves one topology gap. If node A peers with B, and B peers
with C, but A does **not** peer with C:

- A pulls C's records *relayed through B* (B stores what it verified
  from C, and its GET endpoints serve everything it stores).
- C's **member-signed** rows verify fine on A: both signatures are by
  member keys carried in the record itself — self-contained,
  topology-independent.
- C's **auto-confirmed** rows do not: `system:node_c` resolves to no
  key A knows, so A rejects them — and because sibling rows in the
  same page advance A's cursor, the rejected rows are permanently
  skipped for A.

The rejection itself is the §4 contract working as designed ("a peer
that cannot verify the system signature MUST NOT label it as
authentic"). The question is not whether to weaken that — it is how a
node can *legitimately learn* the keys of nodes beyond its direct
peers, if we decide it should.

## 2. Scope honesty — how narrow this gap is

Three bounds keep this from being urgent:

1. **Only auto-confirmed rows are affected.** Member-signed exchanges
   — the overwhelming majority, and every vouch, post, task comment,
   co-organizer record, event, and cancellation — carry all
   verification material in the record and relay through any number
   of hops.
2. **Only non-mesh topologies are affected.** Pilots run
   `PEER_NODE_URLS` as a full mesh; in a full mesh every origin node
   is a direct peer and the resolver already spans them all.
3. **The failure is conservative.** Unverifiable rows are excluded,
   not corrupted. Nothing false enters any ledger; a community's own
   records are never affected on its own node.

## 3. Options

### (i) Direct-peers-only (status quo)

Ship nothing. Document that auto-confirm verification requires the
origin node to be a direct peer, i.e. federations that use
auto-confirm should run a full mesh.

- **For:** zero new machinery; matches the pilot reality; the §4
  posture stays exactly as strong as it is.
- **Against:** constrains topology growth. A federation of 10 nodes
  needs 45 peer relationships for full auto-confirm convergence, and
  a node quietly missing one edge silently drops a slice of one
  community's auto-confirmed history (the drop is logged per-row as
  a rejection, but nothing aggregates it into an operator-visible
  signal).

### (ii) Transitive config fetch — **rejected**

When a pulled row names an unknown `system:<nodeId>`, ask the serving
peer for that node's URL (or gossip a nodeId→URL table) and fetch its
`/config`.

This fails the same way the naive allowlist fails
([`federated-node-allowlist.md`](./federated-node-allowlist.md) §2):
the URL is **self-attesting through the relay**. The relaying peer
tells you where "node C" lives; a malicious relay points you at a
server it controls, which cheerfully publishes `nodeId: "node_c"`
with a key the attacker holds — and now the attacker can mint
"auto-confirmed" hours attributed to C that you verify as authentic.
The nodeId↔key binding is only as trustworthy as the party that gave
you the URL, and in the multi-hop case that party is precisely the
one you should not have to trust. Direct peering does not have this
flaw because the operator configured the URL out-of-band — the URL
*is* the trust decision.

Listed only so the next person doesn't re-derive it.

### (iii) Keys inside signed federation agreements (Agent 15)

Agent 15's model is a **per-peer federation agreement**: a signed,
revocable artifact two operators exchange when their nodes federate.
Fold the key material in: an agreement carries each side's
`nodeId`, current system pubkey, and rotation history, signed by both
operator identities. Agreements are federated records, so they relay
— A learns C's key from the B↔C agreement, verified against B's
operator identity, which A already trusts from its own A↔B agreement.

- **For:** the trust anchor is a signature chain rooted in a
  relationship the operator explicitly entered, not a URL somebody
  else supplied. Revocation and rotation ride the same artifact.
  This is the same "trust flows along the edges the community
  actually chose" shape the allowlist note recommends.
- **Against:** does not exist yet; Agent 15 is deliberately last in
  the roadmap ordering ("makes no sense without working federation
  experience"). Chains longer than one hop need a depth/audit rule
  (an agreement chain is only as strong as its weakest operator
  identity).

### (iv) Quarantine instead of skip (mitigation, composable with any of the above)

Keep rejecting unverifiable rows as authentic — but store them in a
`pending_verification` holding table instead of dropping them behind
the cursor. When a key for their `nodeId` later becomes resolvable
(new peering, agreement arrival), re-run verification and promote or
purge. Optionally surface a count to the operator ("214 records from
node_c awaiting a verifiable key") — turning today's silent per-row
rejection into an actionable signal.

- **For:** removes the *permanent* part of the loss without weakening
  §4 by a single bit; cheap; useful under every option above,
  including the status quo.
- **Against:** stores unverified bytes (bounded: same size cap as any
  pull page, and purgeable); adds one table and a re-check hook.

## 4. Recommendation

**Status quo (i) for pilots, keys-in-agreements (iii) as the Agent 15
design requirement, quarantine (iv) as the first concrete follow-up
if any pilot actually hits the gap.**

Concretely:

1. Nothing changes now. Full-mesh pilots are unaffected, and
   `PEER_NODE_URLS` docs should say plainly: *auto-confirm
   verification requires direct peering with the origin node.*
2. The Agent 15 federation-agreement schema MUST include
   `{ nodeId, systemKey: { current, history } }` per party, so key
   discovery is solved as a property of the governance artifact
   rather than as separate plumbing. This note becomes an input to
   that design.
3. If a pre-Agent-15 pilot develops a real non-mesh topology, ship
   quarantine (iv) — it is a contained change to the pull worker and
   one table, buys back convergence-on-later-peering, and none of it
   is throwaway when (iii) lands.

Option (ii) is rejected outright, for the reasons in §3.

## 5. What this means for operators today

- Run auto-confirming federations as a full mesh: every node that
  system-signs records should be in every other node's
  `PEER_NODE_URLS`.
- A rejected-rows count that stays at zero is the healthy signal; a
  persistently non-zero `rejectedCount` on exchange pulls from one
  peer is either tampering (working as intended) or a missing mesh
  edge / missing rotation history (fix the config — see
  [`system-key-rotation.md`](./system-key-rotation.md) §5 for the
  recovery paths).
