<p align="center">
  <img src="docs/assets/understoria-logo.svg" alt="Understoria" width="120" />
</p>

<h1 align="center">Understoria</h1>

<p align="center">
  <strong>Grow power from below.</strong><br>
  A federated, encrypted mutual aid timebank for organizing communities.
</p>

<p align="center">
  <a href="#what-it-does">What It Does</a> •
  <a href="#why-it-exists">Why It Exists</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#community">Community</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-AGPL--3.0--or--later-blue" alt="License: AGPL-3.0-or-later" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/built%20with-solidarity-e34c4c" alt="Built with solidarity" />
</p>

---

## What It Does

Understoria is a platform where communities exchange help, tracked through **time credits**. One hour of help equals one hour of help — regardless of the type of work. No market pricing, no hierarchy, no algorithms deciding who gets support.

**Post what you need. Offer what you can. Build collective power.**

- **Community Board** — Post needs and offers across categories like transport, food, childcare, skilled labor, emotional support, education, and more.
- **Timebank Credits** — Every exchange earns and spends time credits. New members start with seed credits so asking for help is never gated.
- **Collective Dashboard** — See your community's total hours exchanged, active members, solidarity streaks, and milestones. The unit of progress is *us*, not *me*.
- **Achievements as Roles** — Earn community roles like Connector, Bridge Builder, and Listener — recognition without ranking.
- **End-to-End Encryption** — Key-pair identity, signed transactions, encrypted messaging. No email or phone number required.
- **Federation** — Each community runs its own node. Nodes can peer with each other to share needs and offers across groups. No central server, no single point of failure.
- **Organizing Tools** — Campaign trackers, one-on-one conversation logs, power mapping, and meeting facilitation — connecting mutual aid to collective action.

## Why It Exists

Mutual aid networks are powerful, but they're often held together by spreadsheets, group chats, and the sheer willpower of a few overworked organizers. Understoria gives communities a dedicated tool that's designed for solidarity — not engagement metrics, not ad revenue, not data extraction.

The software is built around a few core beliefs:

- **All labor has equal value.** Emotional support counts as much as plumbing.
- **Asking for help should never be gated.** Seed credits mean you can receive before you give.
- **Collective progress matters more than individual scores.** The dashboard celebrates the community, not the top contributors.
- **Privacy is a precondition for organizing.** Workers face real retaliation. The platform protects membership lists, communication patterns, and activity history.
- **Communities should own their infrastructure.** Federated, self-hosted, open source, cooperatively governed.

## Quick Start

### Run locally (development)

Requires Node 20+. On a fresh Debian/Ubuntu host you may also need
`build-essential` and `python3` so the optional community-node
workspace can compile its native SQLite binding — see
[Operator Guide §3](docs/operator-guide.md#3-build-from-source) for
the apt-get one-liner.

```bash
# Clone the repo
git clone https://github.com/ardentcascades/understoria.git
cd understoria

# Install dependencies
npm install

# Start the PWA dev server (port 5173)
npm run dev
```

The PWA runs at `http://localhost:5173`. No backend required for the
PWA itself — every member's data lives in their browser's IndexedDB.

To also run the optional community node (Fastify + SQLite, port 8787):

```bash
# In a separate terminal
npm run dev:server
```

Then in the PWA, **Profile → Community node** → paste
`http://localhost:8787` and tick "Mirror finalized exchanges to this
node." Finalized exchanges mirror to the node and the outbox status
chip shows delivery progress.

`npm test` runs the full vitest suite across all workspaces.
`npm run build` produces the PWA static bundle that a community node
serves.

### Deploy a community node

Two paths, both supported:

- **PWA-only** — serve the built `dist/` over HTTPS from any static
  host. Members' data stays on their devices.
- **PWA + Fastify node** — run the multi-stage Dockerfile via
  `docker compose up -d` from the repo root. Adds a community-wide
  ledger of signed exchanges; the foundation for federation.

A Caddy reverse-proxy config, VPS notes, Raspberry Pi walk-through,
and full env-var reference are in the
[Node Operator Guide](docs/operator-guide.md).

The Node.js server with federation, cross-node exchanges, and
Docker deployment is the next major workstream
(Agent 3 on the roadmap).

## Architecture

```
┌──────────────────────────────────────────────────┐
│                    Client (PWA)                   │
│  React + TypeScript + Tailwind + IndexedDB        │
│  Offline-first, installable, works on cheap phones│
└──────────────────┬───────────────────────────────┘
                   │
                   │ REST API + E2E Encrypted Messages
                   │
┌──────────────────▼───────────────────────────────┐
│                 Community Node                    │
│  Node.js + SQLite/SQLCipher                       │
│  Self-hosted, Docker-deployable                   │
└──────────┬───────────────────────┬───────────────┘
           │                       │
           │ Federation Protocol   │
           │                       │
┌──────────▼──────┐    ┌──────────▼──────┐
│   Peer Node A   │    │   Peer Node B   │
│   (Neighborhood │    │   (Workplace    │
│    mutual aid)  │    │    organizing)  │
└─────────────────┘    └─────────────────┘
```

### Key Design Decisions

- **Identity** — Ed25519 key pairs. No email, no phone number, no external identity provider. Your public key is your identity.
- **Trust** — Web-of-trust vouching. New members need two vouches from existing members. Mirrors how real organizing works.
- **Transactions** — Every exchange is signed by both parties. Verifiable by any node without a central authority.
- **Data** — Encrypted at rest (SQLCipher). Minimal logging. No IP addresses stored. Panic button for emergency data purge.
- **Federation** — Nodes peer voluntarily. Shared needs/offers broadcast across the network. Cross-node exchanges recorded on both sides.
- **Sync** — CRDT-based data model. Nodes operate independently when disconnected, reconcile when reconnected.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS, Workbox (PWA) |
| Local Storage | IndexedDB (Dexie.js) |
| Backend | Node.js (Fastify) |
| Database | SQLite + SQLCipher |
| Crypto | tweetnacl / libsodium.js (Ed25519, X25519, XSalsa20-Poly1305) |
| Federation | ActivityPub-inspired protocol, CRDTs |
| Deployment | Docker, single-command deploy |

## Project Structure

```
understoria/
├── apps/
│   ├── web/                 # React PWA (main client)
│   └── server/              # Node.js community server
├── packages/
│   ├── crypto/              # Key management, signing, encryption
│   ├── federation/          # Node-to-node protocol
│   ├── shared/              # Shared types and utilities
│   └── timebank/            # Credit system logic
├── docs/
│   ├── member-guide.md      # How to use the app
│   ├── operator-guide.md    # How to deploy a node
│   ├── organizer-guide.md   # How to introduce to a group
│   ├── threat-model.md      # Security analysis
│   └── political-education/ # History of mutual aid + timebanking
├── docker-compose.yml
├── LICENSE                  # AGPL-3.0-or-later
└── README.md
```

## Documentation

| For | Read |
|-----|------|
| First-time setup on a Debian / Ubuntu VM | [Quickstart](docs/quickstart.md) |
| Members using the app | [Member Guide](docs/member-guide.md) |
| People introducing the app to a group | [Organizer's Guide](docs/organizer-guide.md) |
| Operators deploying a node | [Node Operator Guide](docs/operator-guide.md) |
| Anyone — staying safe while using Understoria | [Opsec Guide](docs/opsec-guide.md) |
| Developers and contributors | [Developer Guide](docs/developer-guide.md), [Contributing](CONTRIBUTING.md) |
| Understanding the security posture | [Threat Model](docs/threat-model.md) |
| Governance and decision-making | [Governance](GOVERNANCE.md), [Code of Conduct](CODE_OF_CONDUCT.md) |
| Where the work is heading | [Roadmap](docs/roadmap.md) |
| Study groups and political grounding | [Political Education](docs/political-education/) |
| Trademark and brand use | [Trademark Policy](TRADEMARK.md) |

## Contributing

Understoria is built by and for organizing communities. Contributions
are welcome from anyone who shares the project's values. Start with
[CONTRIBUTING.md](CONTRIBUTING.md) and the
[Developer Guide](docs/developer-guide.md).

All contributions are made under the
[Developer Certificate of Origin (DCO)](https://developercertificate.org/).
Sign off every commit with `git commit -s`.

### Areas where help is needed

- **Frontend development** — React, TypeScript, accessibility, responsive design
- **Cryptography review** — Audit the identity and encryption implementations
- **Federation protocol** — Design and test node-to-node communication (Agent 3)
- **Documentation** — Guides, tutorials, and translations (especially Spanish)
- **Community testing** — If you're part of a mutual aid network or organizing group and want to pilot Understoria, we want to hear from you
- **Design** — UI/UX, illustrations, iconography that signals solidarity without being cheesy

## Community

- **Discussions** — [GitHub Discussions](https://github.com/your-org/understoria/discussions) for questions, ideas, and conversation
- **Issues** — [GitHub Issues](https://github.com/your-org/understoria/issues) for bugs and feature requests
- **Matrix** — `#understoria:matrix.org` for real-time chat (encrypted by default)

We make decisions through modified consensus. Major decisions go through a community proposal process. See [GOVERNANCE.md](GOVERNANCE.md) for details.

## Roadmap

The full agent-by-agent decomposition, including ordering rationale
and open design questions, lives in [`docs/roadmap.md`](docs/roadmap.md).
The phase view below is a public summary.

### Phase 1: Foundations
- [x] Project plan and architecture
- [x] Core PWA with community board, exchange flow, and credits
- [x] Threat model and security hardening plan
- [x] Code of Conduct and governance draft
- [ ] Paper prototype testing with pilot communities

### Phase 2: Hardening *(active)*
- [x] Ed25519 key-pair identity and signed exchange transactions
- [x] Cryptographic invites + web-of-trust vouching
- [x] Passphrase-wrapped private keys
- [x] Panic button (soft + hard purge)
- [x] Anti-gaming safeguards
- [x] Milestones, achievements, solidarity streaks
- [x] Member guide and operator guide drafts
- [x] End-to-end encrypted messaging
- [x] Device pairing — same-identity transfer to a second device via local QR + one-time passphrase, with fingerprint verification and a paired-device inventory on Profile
- [x] Community calendar — agenda / month / week view aggregating project deadlines, post expiries, and exchange density (5th bottom-nav tab)

### Phase 3: Federation *(active)*
- [x] Community node server with Docker deployment
- [x] Signed-exchange verification on the server
- [x] Spanish translation
- [x] Federation protocol and cross-node exchanges (server endpoints, pull loop, PWA surfacing done; full lifecycle sync pending)
- [x] Posts / vouches / invites endpoints on the server
- [x] Per-task comment threads + federation (signed, tombstone-merge soft delete) + community flag-for-review via the existing disputes surface
- [ ] Organizing module: campaigns, power mapping, meeting tools

### Phase 4: Launch
- [ ] Pilot deployment with 3 communities
- [ ] Workshop curriculum and training sessions
- [ ] v1.0 release

### Phase 5: Commons governance *(planned)*

Staged additions based on Elinor Ostrom's design principles for
governing the commons, plus standalone additions drawn from the
Kerala model and the potlatch tradition. See
[`docs/roadmap.md`](docs/roadmap.md#agents-11--15-ostrom-commons-extension)
for the full breakdown, the items that were absorbed into existing
agents, and the items that are deferred behind explicit gates.

- [x] Per-node configuration + operator transparency (Agent 11)
- [x] In-app onboarding & political literacy (Agent 16)
- [x] Breadth & reciprocity Dashboard additions (Agent 18a)
- [x] Shared "Decisions" surface for proposals, disputes, and recall (Agents 13 + 14, with reversibility tiers folded in)
- [ ] Moderation queue and graduated sanctions (Agent 12)
- [ ] Per-peer federation agreements (Agent 15)

Phase 5 does not block Phase 4 — a v1.0 pilot can ship with Agents 11 and 16 only.

## Ethical Use

Understoria was built for mutual aid, labor organizing, and community solidarity. It is specifically designed to protect the people who use it from surveillance and retaliation.

Using this software to surveil workers, facilitate union-busting, harvest personal data for commercial purposes, or undermine the organizing efforts of any community violates the spirit of this project.

While the AGPL license grants broad usage rights, we ask that anyone who deploys Understoria honor the values it was built to serve.

## Acknowledgments

Understoria stands on the shoulders of movements and thinkers who came before: from Peter Kropotkin's *Mutual Aid* to the Black Panther Party's survival programs, from Edgar Cahn's timebanking work to the countless mutual aid networks that emerged during the COVID-19 pandemic. This software is a small contribution to a very old tradition.

We also owe a debt to the open-source projects that make this possible: [Matrix](https://matrix.org), [Mastodon](https://joinmastodon.org), [Signal](https://signal.org), [Automerge](https://automerge.org), and many others.

## License

Understoria is licensed under the [GNU Affero General Public License v3.0 or later](LICENSE).

This means you are free to use, modify, and distribute this software, provided that any modified versions you run as a network service are also made available under the same license. This ensures the code remains open and community-owned.

The name "Understoria" and associated logos are trademarks of the Understoria Cooperative. You may fork the code freely, but use of the name and branding requires permission. See [TRADEMARK.md](TRADEMARK.md) for details.

---

<p align="center">
  <em>Built with solidarity, not surveillance.</em><br>
  <em>One hour of help = one hour of help.</em>
</p>
