# Offline resilience — when the internet itself goes down

Status: **design accepted; §4 storm-hub runbook SHIPPED (ops
pattern, no app changes); §5 in-person exchange SHIPPED
(`lib/inPersonExchange.ts` + the "Confirm in person" flow on the
post page); §5b invite-during-outage assessment (already holds,
nothing to build); §6 named non-goals.** Prompted by the operator's question:
"Let's say the internet goes down, such as in the case of Hurricane
Helene — how could Understoria continue to function?" This is the
scenario the resilience work has been building toward
(`docs/community-resilience.md`, `docs/community-reseed.md`,
`docs/storage-budget.md`), so this doc mostly NAMES what already
holds and closes the one real gap.

## 0. The scenario, stated concretely

A regional disaster takes out internet service for days or weeks.
Power is intermittent (phones charge from cars and solar), people
gather physically — shelters, church halls, a neighbor's porch —
and mutual aid is MOST needed exactly while the coordination
infrastructure is least available. The community's node may be up
but unreachable, or down entirely.

## 1. What already survives, with zero changes

- **Every member's phone keeps working.** The PWA is offline-first
  by construction: the full signed history (board, ledger, roster,
  projects, decisions) lives in each device's Dexie, and the
  installed app shell loads with no network. Members read
  everything and WRITE everything — posts, claims, confirmations,
  votes all queue in the outbox.
- **Nothing is lost; everything heals.** When connectivity returns,
  outboxes drain, pulls resume, and the same signed-record merge
  rules federation uses every day converge every device. An outage
  pauses the *sharing* of new entries; it cannot destroy the
  ledger, the roster, or anyone's identity.
- **Trust is already offline.** Signature verification is local.
  The guardian, recovery-kit, device-pairing, and removal
  ceremonies are QR device-to-device flows that never needed a
  server.
- **The node re-grows from any phone.** If the machine itself is
  destroyed, `docs/community-reseed.md` restores the whole
  community onto a fresh node from one member's device — drilled
  end-to-end.

## 2. The gap

While the internet is down, two members standing in the same
shelter cannot see each other's NEW posts. Each phone is a healthy,
complete island — and the water between the islands is exactly
where the mutual aid needs to flow.

## 3. The ladder (value per effort, descending)

1. **Storm hub** (§4) — an OPS pattern, no app changes: a
   Pi-class mirror node + WiFi access point + local DNS answering
   the community's real domain. Members join the hub's WiFi and
   their installed apps simply work. SHIPPED as a runbook.
2. **In-person exchange over QR** (§5) — two members with no hub
   at all confirm an exchange phone-to-phone. Small feature, all
   shipped patterns. SHIPPED.
3. **Snapshot gossip** — a "share recent updates as a file"
   export/import (AirDrop/Bluetooth/SD card), merging by the
   normal rules, so the board spreads hand-to-hand. Medium;
   deferred until the first two prove out in a drill.
4. **Radio mesh** — §6, named non-goal for now.

## 4. The storm hub (SHIPPED — runbook)

**The idea:** a small always-off box in a go-bag that becomes the
community's server when the internet dies. It works because of
three properties that are each ordinary on their own:

- **Mirror mode** (`MIRROR_NODE_URLS`) means the hub already holds
  every record, replicated continuously during good times.
- **TLS certificates are validated locally, not online.** A cert
  obtained (and auto-renewed) while the internet was up keeps
  working for its whole lifetime — no connectivity needed at
  verification time.
- **DNS is just a question on the local network.** A resolver on
  the hub that answers the community's REAL domain with the hub's
  own LAN address means members' installed apps — which only know
  `https://your-domain` — reach the hub without any
  reconfiguration, mixed-content problem, or new code. Same
  domain, valid cert, working app.
- **Laptops don't need the certificate at all.** The desktop app
  (`docs/desktop-appimage.md`) loads from local disk, so it can
  join a hub over plain HTTP on the LAN — no browser-trusted cert,
  no runway clock. Phones still need the cert path above; the
  AppImage narrows the exposure to them.

**Build it (in good times):**

1. A Raspberry-Pi-class box. Install the node per
   `docs/deploy-linode.md` §3–8 posture (Docker compose), with the
   SAME `NODE_FOUNDER_KEYS`, `REMOVAL_QUORUM`, and `READ_AUTH`
   posture as the primary, its own `NODE_ID` and `DATABASE_KEY`.
2. Pair it as a mirror (the in-app "Grow another root" wizard
   generates both env halves) and let members accept it on the
   consent card like any mirror. From now on it replicates
   everything, continuously.
3. Give it the cert: the simplest honest option is a second
   subdomain (e.g. `hub.your-domain`) with its own auto-renewing
   cert AND a local-DNS override for the APEX domain pointing at
   the hub — or run the hub as a true same-domain standby and copy
   the renewed cert to it on a schedule while the internet is up
   (a two-line cron; the runbook favors this because the installed
   apps then need nothing at all).
4. Configure the hub's WiFi access point + dnsmasq: SSID the
   community will recognize, DHCP handing out the hub as DNS,
   dnsmasq answering `your-domain` → the hub's LAN address.
5. **Drill it before you depend on it** (the §4 house rule): turn
   off the router's WAN, join the hub WiFi with two phones, post
   from one, see it on the other. Verify the two honest caveats
   below while you're at it.
6. **Drill a brand-new member too:** bring a phone that has never
   seen the app, join it to the hub WiFi, open the community's
   address, install the app, and scan a member's invite QR. This
   works because the hub serves the whole deployment — Caddy hands
   out the app itself, not just the API — the invite QR carries the
   community's real domain (which the hub's DNS answers), invites
   verify by signature with no network, and redemption is entirely
   local (the receipt queues and rides the normal replication
   through the hub). New members can join at the shelter.

**When the storm comes:** power the hub (wall, car inverter, or a
battery bank — the node is deliberately lightweight), members join
its WiFi, and the shelter is a functioning Understoria island:
posts flow, exchanges confirm, decisions record. When the wider
internet returns, the hub syncs back to the surviving mirrors like
any node — every record minted during the outage rides the normal
replication.

**Honest caveats (verify in the drill):**

- **Cert lifetime caps a fully-offline stretch at ~90 days** from
  the last renewal. Renewal is automatic whenever the hub sees the
  internet; a multi-month total blackout would eventually need the
  documented plain-HTTP fallback posture and its threat-model
  trade-offs.
- **Phones must accept the network's DNS.** Devices using
  encrypted DNS fall back to the network resolver when their
  provider is unreachable — which is the case in a real outage —
  but this is exactly what the drill confirms for your members'
  actual devices.
- **Clock drift** on a long-powered-off Pi can break TLS
  validation; the runbook box should keep a battery-backed RTC or
  sync its clock at each drill.

## 5. In-person exchange over QR (SHIPPED)

Two members meet with no hub at all. The helper's device renders
the canonical exchange payload, helper-signed, as a QR; the helped
member scans it (`PairDeviceCapture`, the shipped capture surface),
reviews the hours/category on their own screen, co-signs, and BOTH
devices store the completed exchange and enqueue it. Dedup-by-id
makes the double delivery harmless when connectivity returns —
the node keeps one copy, exactly as if it had been submitted once.
Same delivery posture as guardian shards: nothing is enforceable
until both signatures exist, and a photographed QR leaks only what
the final public record says anyway. The same shape can later carry
a post or a vouch — a paper bulletin board of QR codes in a shelter
lobby is a workable coordination surface.

**As built** (`apps/web/src/lib/inPersonExchange.ts` + the
`InPersonExchange` component, entered via "Confirm in person" on
the post page wherever the normal confirm button lives):

- **Two payload kinds**, mirroring the removal ceremony's
  draft/fragment pair: `understoria-exchange-offer` (helper-signed
  canonical payload + the exchange id, minted once at offer time)
  and `understoria-exchange-receipt` (the COMPLETE double-signed
  record). The same `canonicalExchangePayload` bytes the online
  `confirmExchange` path signs, so records from the two paths are
  indistinguishable downstream.
- **Replay/duplicate handling:** because the id is minted at offer
  time and rides the whole trip, both devices enqueue the same
  record and the node's idempotent-on-id `POST /exchanges` keeps
  one copy. Re-accepting an offer re-issues the stored receipt;
  re-scanning a receipt is a local no-op. Nothing doubles.
- **The fingerprint gate (§7):** the offer screen shows the
  helper's key fingerprint beside the QR and the review screen
  shows the fingerprint of the key that actually signed what was
  scanned — the same eyeball check device pairing uses. The review
  copy states plainly that signing credits hours.
- **Post-attached only (v1 scope):** the flow hangs off an
  existing claimed post BOTH members already hold — the normal
  case. Both devices refuse offers about posts they don't hold,
  offers naming parties other than that post's parties, and
  scanners who aren't the helped counterparty. Post-less
  "spontaneous help" is deliberately NOT here — that is the
  un-ratified direct-exchange-label proposal, and it stays a
  proposal.

## 5b. Inviting someone new during an outage

The question that follows §5 naturally: two people meet in the
field, one is a member, the other wants in. What holds today, with
no changes:

- **The invite itself is outage-proof.** An invite is a small,
  self-contained, inviter-SIGNED blob (`lib/invite.ts`) — minting
  one, rendering it as a QR, and verifying it all happen with zero
  network. It stays valid for 14 days, and it survives as a photo,
  a screenshot, or ink on paper. A member standing in a shelter can
  hand out invites freely; nothing about creating or carrying one
  needs the internet.
- **Redemption is already local-first.** `redeemInvite` mints the
  identity, consumes the token, and queues the signed redemption
  receipt entirely on-device — nothing crosses any wire at
  redemption time. Single-use is enforced by first-writer-wins on
  the token when receipts federate, so an invite redeemed offline
  converges exactly like one redeemed online.
- **At a storm hub, the whole journey works — including getting
  the app.** The hub serves the full deployment (the app shell via
  Caddy, not just the API), and the invite QR carries the
  community's real domain, which the hub's DNS answers. A
  brand-new phone joins the hub WiFi, opens the address, installs,
  scans, and joins — §4 drill step 6 verifies exactly this.
- **With no hub at all, the invite waits — honestly.** The one
  thing that cannot happen phone-to-phone is delivering the APP
  itself: a PWA's shell must be served from its HTTPS origin, and
  browsers offer no way to hand an installed web app to another
  phone (§6). So the field flow is: give them the invite NOW (they
  photograph the QR or take the paper), and they finish joining
  the moment they touch any connectivity — the hub's WiFi, a
  neighborhood with service, or the outage's end. The invite's
  14-day window comfortably covers a Helene-scale outage's early
  weeks; a fresh one is one tap away after that.

## 6. Non-goals, named

- **LoRa / packet-radio mesh.** A real idea for tiny signed
  records, and the record format would survive the trip — but it
  is new hardware, new transport code, and a new threat-model
  conversation. Not before the hub and QR paths have seen a real
  drill.
- **Automatic peer discovery on a LAN.** The hub is deliberately
  legible infrastructure someone chose to run (the
  `community-resilience.md` posture); phones silently meshing with
  whatever answers on the local network is the opposite of that.
- **Phone-to-phone delivery of the app itself.** A PWA's shell is
  served from its HTTPS origin by construction; no browser offers a
  way to hand the installed app to another phone the way a native
  APK can travel over AirDrop / Quick Share. The storm hub closes
  this for gathered communities (it serves the app, §4 / §5b); a
  truly serverless hand-off is native-app territory — open
  community proposal #96 again, the same door as Bluetooth mesh.
- **Bluetooth, directly.** Named with its reasons, because the
  question recurs: the Web Bluetooth API is CENTRAL-ROLE ONLY (a
  browser can connect to a peripheral but can never advertise as
  one, so two phones running the PWA structurally cannot pair),
  it does not exist on iOS at all (WebKit rejected the API), and
  it offers no background operation. Where Bluetooth genuinely
  enters: (a) the §3 snapshot-gossip files travel over AirDrop /
  Quick Share, which use Bluetooth + WiFi-Direct under the hood —
  members ride the OS transport on every platform without the app
  shipping radio code; (b) the storm hub could act as a BLE
  peripheral for Chromium-Android members, but at a few KB/s for
  a fraction of devices it is dominated by the hub's WiFi and not
  worth building; (c) true phone-to-phone Bluetooth mesh becomes
  possible only with NATIVE apps — which is exactly open community
  proposal #96, so that door is gated on a decision already on the
  community's table, not forgotten.

## 7. Threat-model / docs obligations

The storm hub adds no new record kinds and no new wire surface —
it is a mirror with a local answering machine. What §7 of
`docs/threat-model.md` was owed when §5 shipped is now paid (see
its in-person-exchange entry): the in-person exchange QR carries
exactly the fields the exchange record already publishes (nothing
new leaks), and the capture surface refuses payloads whose signer
is not a party to the post the scanner holds, with the fingerprint
display for the human check, as device pairing does.
`docs/operator-guide.md` gains a pointer to the §4 runbook.
