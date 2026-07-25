# Project continuity hardening — implementation plan

> **Status: PLANNED** (code-verified 2026-07-25 against the working
> tree at commit 27312e6, the two CI workflows, the pack-source
> script, the web Dockerfile, docker-compose.yml, the Infrastructure
> source card, and the docs set). Discipline model:
> docs/react-19-plan.md (verified ground truth → design → phased
> commits → gates → risks → audit trail). Context:
> authoritarian-resilience initiative, operator-approved. This plan
> hardens the project's *own* continuity — surviving pressure on its
> code-hosting and distribution channels — the way
> docs/community-resilience.md hardens each community's. Scope:
> (1) source-forge redundancy, (2) source-with-releases so members
> hold the seed of the project, (3) build/release integrity.
> **Explicitly NOT in scope:** reproducible builds as a hard
> guarantee (§8 names it as future work, honestly).

## 0. Verified ground truth

- **The Corresponding Source machinery already exists and is the
  foundation.** `scripts/pack-source.sh <output-dir>` has two modes,
  both read directly:
  - *Git mode* (bare metal, full clone): `git archive HEAD` → only
    tracked files can ever enter the tarball; plus
    `git bundle create understoria.bundle --all` (**full history,
    all refs**) when the clone is not shallow.
  - *Tar mode* (the Docker build context — `.dockerignore` strips
    `.git`, so no history bundle there): tars the whole context with
    defense-in-depth excludes (`node_modules`, `dist`, `.git`,
    `backups`, `.env*`, `*.log`, `*.db*`, `.cache`, `.turbo`,
    `coverage`) layered on top of `.dockerignore`'s own scrubbing.
  - Output: `understoria-source.tar.gz`, `understoria.bundle` (git
    mode only), `SHA256SUMS`, and `manifest.json`
    (`{name, version, commit, generatedAt, files[{name,bytes,sha256}]}`).
  - The script's header states plainly: checksums prove INTEGRITY,
    not AUTHENTICITY — "compare against another node's bundle, a
    mirror, or the project's signed tags."
- **Every Docker node serves its source automatically.**
  `apps/web/Dockerfile` has a dedicated `source-pack` stage
  (`RUN bash scripts/pack-source.sh /out/source`); the busybox
  runtime stage copies it into the served dist
  (`COPY --from=source-pack /out/source /dist/source`), and Caddy's
  plain `file_server` serves it at `/source/*` — no special route
  needed. Bare metal: `scripts/pack-source.sh apps/web/dist/source`
  (invoked in docs/deploy-alternatives.md lines 161 and 352).
  `scripts/make-flash-drive.sh:131` packs the source onto flash
  drives too — an existing offline distribution channel.
- **The pack contains everything needed to rebuild.** Verified by
  reading the modes: tar mode packs the entire context, which
  includes `package.json`, **`package-lock.json`** (the only
  lockfile — root; apps/web's was removed in PR #389), `.npmrc`
  (git-tracked, verified via `git ls-files`), `scripts/`, `deploy/`,
  `docker-compose.yml`, `.github/`, and **all 80 tracked `docs/`
  files** (docs/ is neither in `.dockerignore` nor the tar
  excludes); git mode archives the full tracked tree, a superset of
  the same. There is **no migrations directory anywhere**
  (`git ls-files | grep -E 'migrations|\.sql'` → zero hits) — the
  server's SQLite schema is code-managed, so the tree alone
  suffices to boot a node. What has NOT been verified: that
  `npm ci && npm run build` actually succeeds *from an unpacked
  tarball* — that end-to-end restore has never been exercised
  anywhere. That test is C1's whole job.
- **Member-facing surfaces exist.** `Infrastructure.tsx` →
  `SourceCard` fetches `/source/manifest.json`, links the tarball,
  history bundle (when present), and SHA256SUMS, and shows the
  integrity-vs-authenticity caution (`infra.source.caution` in
  en/es). Its "public repository" link
  (`infra.source.repo`) hardcodes
  `github.com/ArdentCascades/Understoria` — a single-forge pointer.
  docs/bootstrap-from-a-node.md is the complete member walkthrough
  (download → verify → cross-node checksum comparison → try →
  deploy → "you're now a seed too"). operator-guide §7a documents
  the whole thing and *already suggests* "keep a push mirror of the
  repository on a second forge (Codeberg, a self-hosted Forgejo)" —
  suggested, never operationalized.
- **Release story: none exists.** `git tag -l` → **empty**. Two
  workflows only (`ci.yml`, `appimage.yml`); no release workflow;
  the AppImage job uploads a CI artifact with 30-day retention — no
  publish step (manual-update-by-design per
  docs/desktop-appimage.md §6). CONTRIBUTING §Releases says
  "Maintainers tag a release … `v<major>.<minor>.<patch>` starting
  from `v0.1.0`" — **aspirational; zero tags exist**. package.json
  is at 0.3.0; docker-compose defaults
  `UNDERSTORIA_VERSION:-0.3.0`; CHANGELOG keeps a Keep-a-Changelog
  `[Unreleased]` section. **Honesty gap found:** pack-source.sh's
  header and operator-guide §7a both point members at "the
  project's signed tags" as the authenticity anchor — *those tags
  do not exist*. C2 closes this gap; until then the docs
  over-promise.
- **Build stamp (verified injection path):**
  `apps/web/vite.config.ts` `resolveBuildStamp()` — explicit
  `VITE_BUILD_STAMP` env (Docker: `ARG`→`ENV` in the Dockerfile,
  forwarded from compose `args`, runbook sets it to
  `git rev-parse --short HEAD`) → live `git rev-parse --short HEAD`
  (dev) → `""`; injected via `define`
  `__UNDERSTORIA_BUILD_STAMP__`, read by
  `apps/web/src/lib/buildStamp.ts`, shown in Settings.tsx:194.
  So a running node's stamp is comparable against a release tag's
  short hash — the comparison loop C2 needs already half-exists.
- **Signing infrastructure is plausible and idiomatic.** tweetnacl
  ^1.0.3 is a dependency of both `packages/shared` and `apps/web`.
  `packages/shared/src/crypto.ts` wraps
  `nacl.sign.keyPair`/`sign.detached`/`sign.detached.verify` (Ed25519,
  base64) — the exact primitive set a release manifest needs.
  `scripts/generate-system-key.mjs` is the existing pattern for
  keypair generation + operator key discipline ("treat the secret
  like a TLS private key"); `NODE_FOUNDER_KEYS` /
  `NODE_SYSTEM_SECRET_KEY` establish the project's key-handling
  culture. No new dependency is required for signing.
- **Forge posture:** single remote, GitHub
  `ArdentCascades/Understoria` (main + two work branches). Hardcoded
  GitHub URLs in exactly 4 source/docs surfaces:
  `Infrastructure.tsx`, `apps/site/index.html`,
  `docs/deploy-linode.md`, `docs/deploy-alternatives.md` (plus a
  proposal doc and the gitignored site dist).
- **Website:** `apps/site` is a static, framework-free showcase;
  `base: "./"` makes the build host-agnostic; its README says "host
  it anywhere". It never talks to a node. **Non-essential for
  continuity** — the in-app Help and the full docs/ folder travel
  inside every source pack (verified above).
- **Threat model:** docs/threat-model.md v0.1, §7 "Known gaps" is
  the tracked-work ledger. Grep for
  takedown/GitHub/forge → **zero hits**: the channel-pressure
  scenario (forge takedown, account compromise, website domain
  seizure) is genuinely unmodeled. Asset §2.7 ("Trust of the
  community in the software itself — losing this is terminal") is
  the asset this plan protects.
- **CI gates to preserve:** Node 22, `npm ci` with
  `ELECTRON_SKIP_BINARY_DOWNLOAD=1`, root typecheck, web lint,
  `build:server` before tests (invite-flow e2e spawns the built
  server), root `npm test`, PWA build; informational `npm audit
  --audit-level=high`; DCO check on PRs; per-ref concurrency
  groups. New workflows must not perturb any of this.

## 1. Design — the continuity model, stated honestly

Three redundant layers, weakest-dependency first:

1. **Forge layer (GitHub + a mirror).** Full history, issues/PRs,
   CI. Dies under account takedown; the mirror survives.
2. **Release layer (tagged artifacts + signed manifest).** Pinned,
   verifiable snapshots members and operators can hold offline.
   Survives forge loss if copies were downloaded; the signature
   survives even when served from an untrusted channel.
3. **Node layer (every deployment serves its Corresponding
   Source).** Already shipped. Survives everything except the loss
   of *every* community node simultaneously. Bare-metal git-mode
   nodes additionally serve the full history bundle, making them
   complete re-seed points including provenance.

What survives each channel-pressure scenario (this table goes into
threat-model §7 verbatim in C3):

| Scenario | Lost | Survives |
|---|---|---|
| GitHub repo takedown / account termination | Issues, PRs, Discussions, CI history, the canonical URL | Codeberg mirror (full history + tags), every node's source pack, every downloaded release, git-mode nodes' history bundles, every contributor clone |
| GitHub account compromise (malicious commits/releases) | Trust in unverified main | Signed release manifests (attacker lacks the offline signing key → forged releases fail verification against the published pubkey); honest history on the mirror and in clones |
| Website domain seizure (understoria showcase) | The front door | Everything — the site is marketing; docs + Help travel in every source pack; nodes are on their own domains |
| Both forges + website lost | All hosted channels | The node layer: `curl https://<any-node>/source/understoria-source.tar.gz` → unpack → deploy (docs/bootstrap-from-a-node.md, unchanged); a bare-metal node's `understoria.bundle` restores full history via `git clone understoria.bundle` |
| Release-signing key compromised | Authenticity of future releases until rotation | Integrity layer (checksums), cross-node comparison; rotation = new key + revocation note in-repo on both forges (§6 runbook) |

**History question, decided:** the Docker source pack serves the
tree-at-a-version, not history — and that *suffices for
continuity*: a new maintainer can run, audit, and fork the project
from the tree; the lockfile pins the dependency graph; docs travel
along. History is *provenance* (who wrote what, DCO trail, why),
valuable but not existential; it survives via the mirror, every
contributor clone, and every bare-metal node's bundle. We do NOT
add `.git` to the Docker context to force a bundle (it would bloat
every image build and drag repo history into every deployment's
attack surface for marginal gain). The doctrine doc says exactly
this.

**Signing scheme, simplest honest version (no PKI fantasy):** ONE
Ed25519 keypair (`RELEASE_SIGNING`), generated offline by a
maintainer with `scripts/generate-release-key.mjs` (clone of the
system-key script). The **public key is committed in-repo**
(`docs/release-signing.md` + a machine-readable
`scripts/release-pubkey.json`) and therefore travels inside every
source pack, on both forges, and on the website. Each release
attaches `release-manifest.json` = the pack-source manifest.json
shape + `{tag, artifacts: [{name, bytes, sha256}]}` and
`release-manifest.sig` = base64
`nacl.sign.detached(sha512-canonical-bytes-of-manifest, secretKey)`.
Verification is one command
(`node scripts/verify-release.mjs <dir>`), runnable from inside the
unpacked source itself. Verified by: operators fetching a release
(pubkey from an *independently obtained* copy of the repo — another
node, the mirror, an old clone), and by CI itself as a
self-check. **Stated limitation, in the docs:** the pubkey ships in
the same repo it authenticates — first-contact trust is TOFU plus
cross-channel comparison (two forges + N nodes must all agree on
the pubkey), which is honest and better than nothing, not a
root-of-trust miracle. The secret key is NEVER a repo secret used
for signing in CI — signing happens on a maintainer machine;
CI only *verifies*. (This is the decisive anti-compromise property:
a captured GitHub account cannot mint valid signatures.)

**Mirror scheme, decided (both-and, honestly):**
- *Primary:* a **Codeberg pull-mirror is NOT available**
  (Codeberg's Forgejo has repo *migration* with mirror-pull
  disabled for resource reasons — verify at setup time; if enabled
  for the account, prefer it) — so the dependable mechanism is a
  **push workflow** (`.github/workflows/mirror.yml`): on push to
  `main` and on tags, `git push --force-with-lease codeberg
  main --tags` using a Codeberg access token stored as a GitHub
  secret. Honest failure analysis, recorded: the push workflow
  **dies with the GitHub account** — but by then the mirror already
  holds everything up to the moment of death, which is exactly the
  artifact continuity needs. A pull-mirror would survive credential
  revocation but dies if GitHub deletes the repo; neither survives
  everything. **Therefore the real backstop is layer 3**: the
  documented re-seed-from-any-node path. The runbook says all
  three things.
- *Operator steps (not deliverable by this plan):* create the
  Codeberg org/repo, mint the token, set the `CODEBERG_TOKEN`
  secret, run the workflow once via `workflow_dispatch`. The plan
  delivers the workflow file + runbook with these marked as
  operator actions.

## 2. Phases

### C1 — prove the seed germinates (pack verification)

The node-as-seed doctrine is only real if the pack restores. Ship:

1. **`.github/workflows/source-pack-restore.yml`** — scheduled
   **weekly** (`cron`) + `workflow_dispatch` + on PRs touching
   `scripts/pack-source.sh`, `apps/web/Dockerfile`, or
   `.dockerignore` (path filter — near-zero per-PR cost, mirrors
   appimage.yml's pattern). Job: checkout (fetch-depth 0 so git
   mode + bundle exercise fully) → run
   `scripts/pack-source.sh /tmp/pack` → assert all four artifacts
   exist → `sha256sum -c SHA256SUMS` → **unpack the tarball into a
   clean temp dir → `npm ci` (with
   `ELECTRON_SKIP_BINARY_DOWNLOAD=1`) → `npm run typecheck` →
   `npm run build` → `npm run build:server`** → then repeat the
   restore from **tar mode** (simulate the Docker context: run
   pack-source from a `.git`-less copy filtered by .dockerignore
   semantics) so BOTH modes are proven, and
   `git clone understoria.bundle` + `git -C clone log --oneline -1`
   proves the bundle. Budget ~10 min, timeout 20, its own
   concurrency group — cannot touch existing CI.
2. **Fix any pack gaps the job finds** (none expected from the §0
   file-list audit — but the job is the proof, not the audit; if
   the smoke build fails, the fix lands in this same phase and is
   recorded here, react-19-plan §2-style).
3. **`docs/node-as-seed.md`** (short doctrine doc): the three-layer
   model, the history decision (§1), the manual drill for operators
   without CI (the same unpack-and-build steps as a copy-paste
   block), cross-linked from operator-guide §7a and
   bootstrap-from-a-node.md.

Gates: new workflow green on dispatch; existing `ci.yml` untouched
byte-for-byte; full suites, typecheck, lint at root unchanged.
Rollback: delete the workflow file; docs are inert.

### C2 — release discipline (tags + attached source + signed manifest)

1. **`scripts/generate-release-key.mjs`** — clone of
   generate-system-key.mjs (tweetnacl, base64, same stdout
   discipline); prints `RELEASE_SIGNING_SECRET_KEY=` + pubkey.
2. **`scripts/sign-release.mjs`** — maintainer-side, offline:
   takes an artifact dir (the pack-source output + AppImage when
   present), writes `release-manifest.json` (deterministic key
   order, LF, trailing newline — so its bytes are stable) and
   `release-manifest.sig`. Reads the secret from an env var/file
   path arg, never from disk defaults.
3. **`scripts/verify-release.mjs`** + committed
   `scripts/release-pubkey.json`(`{keys:[{id, publicKey, since}]}` —
   array so rotation is representable) — verifies sig + every
   artifact hash; exits nonzero loudly. No dependency beyond
   tweetnacl (already installed) and node:crypto for sha256.
4. **`.github/workflows/release.yml`** — trigger: push of `v*`
   tags. Job: checkout (full depth) → npm ci → **full gates
   (typecheck, lint, build:server, test, build)** → run
   pack-source (git mode: tarball + bundle + sums + manifest) →
   attach artifacts to a GitHub Release (`gh release create`) →
   **verify step**: if `release-manifest.json`/`.sig` were
   committed for this tag (see cadence below), run
   verify-release.mjs against the built artifacts — CI verifies,
   never signs (§1). Signing flow documented in the runbook:
   maintainer builds/downloads artifacts, signs offline, uploads
   the manifest+sig to the release (`gh release upload`). Mirror
   workflow (C3) pushes the tag to Codeberg; the release runbook
   includes manually attaching the same artifacts to a Codeberg
   release (operator step, scriptable later).
5. **First release: `v0.3.0`** on the current CHANGELOG state —
   cut the `[Unreleased]` section per Keep-a-Changelog; this makes
   CONTRIBUTING §Releases true instead of aspirational, and makes
   the "signed tags" references in pack-source.sh/operator-guide
   §7a stop over-promising. Tags are annotated; git-level tag
   signing (SSH/GPG) is optional per-maintainer, NOT the scheme —
   the nacl manifest is the scheme (one verification path,
   dependency-free beyond the repo itself).
6. **`docs/release-signing.md`**: the scheme, the TOFU/cross-channel
   honesty paragraph, key-holder discipline (same posture as
   NODE_SYSTEM_SECRET_KEY: offline, escrowed, never in CI secrets),
   rotation/revocation procedure (append new key to
   release-pubkey.json + dated revocation note + announce on both
   forges), and the verify one-liner for operators. Update
   operator-guide §7a and bootstrap-from-a-node.md §3 to add
   "verify against a signed release" as the now-real authenticity
   upgrade over cross-node comparison.

Gates: full suites/typecheck/lint; `release.yml` proven via a
`v0.3.0-rc` dry-run tag on a branch or `workflow_dispatch` variant
before the real tag; sign/verify scripts get a vitest suite in
`scripts/` or a workspace-adjacent test (round-trip, tamper
detection: flipped byte in artifact, in manifest, wrong key — all
must fail). Rollback: workflows/scripts are additive; a bad tag can
be deleted before announcement (documented as pre-announcement-only).

### C3 — forge mirror + threat model + docs surface

1. **`.github/workflows/mirror.yml`** — on push to `main` + tags +
   `workflow_dispatch`: checkout full depth,
   `git push https://token@codeberg.org/<org>/Understoria.git
   main --tags --force-with-lease` with `CODEBERG_TOKEN` secret.
   Skips gracefully (neutral, loud log line) when the secret is
   absent, so forks and the pre-setup repo stay green. Its own
   concurrency group; zero interaction with ci.yml.
2. **`docs/forge-mirror-runbook.md`**: operator steps (Codeberg
   account/org, repo creation, token scope, secret installation,
   first dispatch); the honest failure analysis from §1 (push
   dies with the account / pull dies with the repo / check at
   setup whether Codeberg mirror-pull is available and prefer it
   if so / layer 3 is the true backstop); the *recovery* runbook:
   promoting the mirror to primary (flip origin, re-point the 4
   hardcoded-URL surfaces from §0, announce in-app via the docs
   that ship with the next release); and the from-a-node re-seed
   path (link node-as-seed.md).
3. **threat-model.md §7 entry: "Channel pressure on the project
   itself"** — the survives-table from §1 verbatim, adversary
   mapping (platform/state takedown pressure = adversary rows 2/4
   applied to the project rather than a community), and what is
   NOT mitigated (reproducible builds, §6).
4. **Docs surface pass:** operator-guide §7a gains a short
   "operators as archivists" paragraph — your node IS a project
   archive, keep it serving `/source/`, and the mirror/release
   links; CONTRIBUTING gains the mirror URL + "the canonical repo
   is wherever the community says it is — currently GitHub,
   mirrored to Codeberg" + release-verification pointer;
   `Infrastructure.tsx` `infra.source.caution` / `infra.source.repo`
   strings (en+es) updated to mention the mirror and signed
   releases (i18n keys added in both locales — CONTRIBUTING's
   locale-lockstep rule); apps/site "Read the source" links gain
   the mirror. README gets the mirror badge-line.

Gates: full suites, typecheck, lint (the Infrastructure.tsx string
change is exercised by `Infrastructure.source.test.tsx` — extend
it); `mirror.yml` proven by dispatch after operator setup; locale
parity check. Rollback: all additive.

## 3. Operator decisions (marked, not made here)

| Decision | Recommendation | Owner |
|---|---|---|
| Mirror forge | Codeberg (values-aligned, EU nonprofit, Forgejo = exit-to-self-hosting path); self-hosted Forgejo as a later third leg | Operator |
| Who holds RELEASE_SIGNING secret | One maintainer, offline, escrowed exactly like NODE_SYSTEM_SECRET_KEY discipline; second escrow holder optional | Operator |
| Release cadence | Tag when a coherent slice lands (CONTRIBUTING already says this); floor of one release per quarter so the signed-artifact layer never goes stale | Operator |
| Codeberg release artifact upload | Manual per-release initially (runbook step); automate only if cadence makes it a burden | Operator |

## 4. Named risks

1. **The smoke-restore job flakes on registry weather** —
   `npm ci` from the unpacked tarball hits the live registry.
   Mitigation: weekly schedule (not PR-blocking), setup-node npm
   cache, and failure notifies rather than gates. A hard offline
   restore (`npm ci --offline` from a cached store) is future work,
   adjacent to reproducible builds.
2. **Signed-manifest false confidence** — members may read
   "signed" as "trustworthy code". The docs must keep the
   pack-source honesty posture: the signature proves *who released
   it*, nothing about what the code does. Wording review is part of
   C2's gate.
3. **Key loss** (more likely than key theft) — a lost signing key
   strands verification. Mitigation: escrow requirement in the
   runbook; rotation procedure works identically for loss;
   release-pubkey.json is an array from day one.
4. **Mirror drift/divergence** — force-with-lease on the push
   protects the mirror from a rewound GitHub main; the workflow
   logs divergence loudly instead of clobbering.
5. **Workflow interference** — all three new workflows use distinct
   concurrency groups and path/tag triggers; ci.yml is not edited
   in any phase. Gate: existing CI byte-identical.
6. **manifest.json name collision** — pack-source already emits a
   `manifest.json` (node-served); the release layer's file is named
   `release-manifest.json` specifically so the two never collide
   when a release's source pack is unpacked next to a node's.
7. **Codeberg mirror-pull assumption** — availability of Forgejo
   pull-mirroring on codeberg.org changes over time; the runbook
   instructs checking at setup rather than baking either answer in.

## 5. Audit trail — exact commands/files behind §0

- `git tag -l` → empty; `git remote -v` → single GitHub origin;
  `git branch -a` → main + 2 work branches.
- Read whole: `scripts/pack-source.sh` (modes, excludes, manifest
  writer), `apps/web/Dockerfile` (source-pack stage lines 53–57,
  runtime COPY line 68), `.dockerignore`, `deploy/Caddyfile`
  (file_server; no /source-specific rule), `.github/workflows/ci.yml`,
  `.github/workflows/appimage.yml` (artifact-only, 30-day
  retention), `docs/react-19-plan.md` (discipline model),
  operator-guide §7a (sed 630–700), CONTRIBUTING §Releases
  (lines 284–289), apps/site/README (host-agnostic, `base: "./"`).
- `git ls-files | grep -E 'migrations|\.sql'` → 0; `.npmrc` tracked;
  `git ls-files docs | wc -l` → 80.
- Build stamp: `rg VITE_BUILD_STAMP apps/web` → vite.config.ts
  resolveBuildStamp (env → git → ""), define
  `__UNDERSTORIA_BUILD_STAMP__`, lib/buildStamp.ts, Settings.tsx:194;
  docker-compose.yml:24 forwards the arg.
- Signing: `rg tweetnacl */package.json` → apps/web +
  packages/shared; `packages/shared/src/crypto.ts:85–106`
  (keyPair/detached/verify); `scripts/generate-system-key.mjs`
  read in full.
- Member surfaces: `Infrastructure.tsx` SourceCard (fetch
  manifest.json line 418, hardcoded GitHub repo link), en.json
  `infra.source.*` strings dumped and read;
  `Infrastructure.source.test.tsx` exists.
- Threat model: headings enumerated (§1–§10);
  `rg -i 'takedown|github|forge' docs/threat-model.md` → zero
  channel-pressure content.
- Hardcoded GitHub URLs: `rg -l ArdentCascades/Understoria` →
  Infrastructure.tsx, apps/site/index.html, deploy-linode.md,
  deploy-alternatives.md (+ proposal doc, gitignored site dist).

## 6. Future work (named honestly, out of scope)

- **Reproducible builds as a hard guarantee.** Today
  `npm ci` + Vite output is not bit-reproducible (timestamps, chunk
  hashing across tool versions, native better-sqlite3 builds). The
  signed manifest attests artifacts a maintainer built, NOT that
  anyone can independently reproduce identical bytes from the tree.
  Prerequisites when attempted: pinned toolchain container,
  SOURCE_DATE_EPOCH plumbing, deterministic archive flags
  (`git archive` is already deterministic given a commit — the tar
  mode is not), diffoscope in CI. Until then the honest claim is:
  "verify the source, or build from source yourself."
- Offline-capable restore drill (`npm ci --offline`).
- Automated Codeberg release artifact upload; a third self-hosted
  Forgejo leg.
