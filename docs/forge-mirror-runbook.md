# Forge mirror — setup, honest failure analysis, and the recovery runbook

The project's code hosting must not be a single point of failure.
This runbook operationalizes the mirror layer of
[`project-continuity-plan.md`](./project-continuity-plan.md) §1:
GitHub stays the day-to-day forge; a Codeberg (or self-hosted
Forgejo) mirror holds a complete, current copy of `main` and every
tag, pushed automatically by `.github/workflows/mirror.yml`.

## 1. What the mirror does and does not survive

Stated plainly, because a mirror people over-trust is worse than no
mirror:

- **The push workflow dies with the GitHub account.** If GitHub
  terminates the repo or account, no further pushes happen — but the
  mirror already holds everything up to the moment of death, which
  is exactly the artifact continuity needs.
- A **pull**-mirror (Codeberg fetching from GitHub) would survive
  credential revocation but dies when GitHub deletes the repo, and
  Codeberg's Forgejo generally has mirror-pull disabled for resource
  reasons — **check at setup time**: if your account has it, prefer
  it and skip the push workflow.
- Neither direction survives everything. **The true backstop is the
  node layer**: every deployed node serves the complete source at
  `/source/`, and a community can re-seed the project from any of
  them ([`node-as-seed.md`](./node-as-seed.md)). The mirror exists
  so that the everyday case — one forge pressured — costs nothing.

## 2. Setup (operator/maintainer, ~15 minutes)

1. Create a Codeberg account/org and an empty repository (e.g.
   `Understoria`). Do NOT initialize it with any files.
2. Mint an access token with repository write scope.
3. In the GitHub repo settings, add:
   - secret `CODEBERG_TOKEN` — the token;
   - variable `CODEBERG_REPO` — the host path, e.g.
     `codeberg.org/<org>/Understoria`.
4. Run the "Mirror to second forge" workflow once via
   `workflow_dispatch` and confirm the mirror shows the full history
   and tags. Until step 3 is done the workflow skips green with a
   notice — forks and fresh clones are unaffected.
5. Add the mirror URL to the places members look:
   CONTRIBUTING's Releases/mirror note carries it; announce it at a
   gathering the way mirror node addresses travel.

## 3. Promoting the mirror to primary (the recovery runbook)

If GitHub becomes unavailable or untrustworthy:

1. **Declare it.** The canonical repository is wherever the
   community says it is — say it out loud on the remaining channels
   (the mirror's README, node operators' communities, the next
   release notes).
2. Contributors re-point their clones:
   `git remote set-url origin https://codeberg.org/<org>/Understoria.git`.
3. Re-point the hardcoded-URL surfaces (found by audit, currently
   four): `apps/web/src/pages/Infrastructure.tsx` (the "public
   repository" link), `apps/site/index.html`,
   `docs/deploy-linode.md`, `docs/deploy-alternatives.md` — one
   small PR on the new primary.
4. Re-establish CI: the mirror forge's CI (Woodpecker on Codeberg)
   is not set up by this runbook — until it is, gate merges on the
   local suites (`npm test`, `npm run typecheck`), which is the
   same bar CI enforces.
5. Set up a NEW mirror (back toward any forge you can reach, or a
   self-hosted Forgejo) — the layer count matters more than the
   vendor.
6. Release signing is unaffected: the key is offline, the public
   half is in every clone and source pack, and
   `scripts/verify-release.mjs` doesn't care which forge served the
   bytes ([`release-signing.md`](./release-signing.md)).

If BOTH forges are gone, go straight to the node layer:
[`bootstrap-from-a-node.md`](./bootstrap-from-a-node.md) — any
community node's `/source/` restores the project (bare-metal nodes
serve full history), and [`node-as-seed.md`](./node-as-seed.md)
proves the pack builds.
