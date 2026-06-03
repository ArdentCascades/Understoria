# Understoria — Trusted Node Allowlist (post-pilot design)

> **Status:** design note, deferred to post-pilot. Pairs with the
> informed-consent gate shipped in `apps/web/src/lib/mirrorConsent.ts`.
> This spec is deliberately short and honest about what it does not yet
> solve. Read alongside `threat-model.md` §7 (the "Configurable node URL
> can leak counterparty public keys" entry).

---

## 1. Problem

A member configures the mirror URL for their own device in
Profile → Community node. Every finalized exchange they take part in is
then POSTed to that URL — including the counterparty's public key,
signature, category, hours, and timestamp. Across many exchanges this is
the community's trust graph: who helps whom, how often, in what.

Because the URL is member-configured and member-trusted, a member can be
socially engineered into sending that graph to a hostile server
("paste this URL into Profile → Community node and turn it on"). The
counterparty has no veto over where the record they co-signed is sent.

## 2. Why a naive allowlist fails

The obvious fix — "only allow mirroring to nodes on a community-blessed
list" — fails if the list is served by the node being checked. A list
fetched from the target node is **self-attesting**: a malicious target
simply answers "yes, I'm on the list." Asking the destination whether it
is trusted is asking the suspect whether they are guilty.

A real allowlist therefore needs an **independent trust anchor** — a
source of the blessed set that the hostile node cannot speak for. This
is the crux of the whole design, and the reason a robust allowlist is
deferred rather than rushed: without the trust anchor it is theatre.

## 3. What ships pre-pilot instead

An **informed-consent gate** (`apps/web/src/lib/mirrorConsent.ts`).
Before mirroring is enabled, or retargeted to a different URL while on,
the PWA shows a caution confirmation that names exactly what is sent
(counterparty public key, signature, category, hours, time) and the
trust-graph-mapping risk.

Its honest limit: **consent is not prevention.** A determined or deceived
member can still read the warning and confirm. The gate defeats silent
and accidental misconfiguration — and slows the social-engineering script
by forcing an informed pause — but it does not stop a fully committed
victim. It buys safety for the common case while the trust-anchored
allowlist is designed properly.

## 4. Design options for the trusted list (post-pilot)

Each option differs in where the independent trust anchor lives.

- **(i) Home-node-served.** The member's established home community node
  — known from the invite/onboarding relationship — serves the blessed
  peer list. Trade-off: aligns with how trust already flows in
  Understoria (you joined through someone), but it pushes the question
  back one level: how is the *home-node URL itself* trusted? Most likely
  it is carried in the signed invite token the member redeemed at
  onboarding, so it inherits the invite's signature chain rather than
  being typed in by hand.

- **(ii) Deployment-pinned.** The operator bakes the allowed set into the
  PWA build, or a separately signed config the build loads. Trade-off:
  dead simple and robust against a lying target, but rigid — changing the
  list means a redeploy — and not portable across communities that share
  one build.

- **(iii) Governance-artifact.** A signed community proposal (Agent 13,
  the existing Decisions surface) ratifies the allowlist, distributed as
  a signed governance record. Trade-off: ties the list to the community's
  real decision process and produces an auditable, revocable artifact,
  at the cost of more moving parts and a dependency on governance
  federation actually distributing the signed record to every member.

## 5. Dependencies & recommendation

This work belongs post-pilot, alongside **Agent 3** (federation trust
infrastructure — the trust anchor and signed-invite plumbing) and
**Agent 15** (per-peer federation agreements, which already model
node-to-node trust boundaries). The allowlist should not ship before
those: it has no sound trust anchor without them.

Recommendation: the **home-node-served list carried via the signed
invite token** (option i) is the most aligned with Understoria's
existing trust flow — members already arrive through a signed invite, so
the trust anchor is one the community can actually speak for — pending
the Agent 3 and Agent 15 work it depends on. A community would ratify
the blessed set through the process in `GOVERNANCE.md`, and the
governance-artifact distribution (option iii) is the natural way to make
that ratification a signed, auditable record.
