# Start a new community from an existing node

Your community runs Understoria. You want to start one for your
neighborhood, your workplace, your family across town. This guide
walks the whole path using **only your community's own server** —
no GitHub account, no app store, no Docker required, no permission
from anyone.

> **This guide lives in the app too.** Every node serves a
> plain-language version at **Menu → Community infrastructure → The
> software itself → "Start a new community from this download"** —
> so nobody needs this repository (or any forge) to read it. Keep
> the two telling the same story; the in-app copy is
> `apps/web/src/content/startCommunity.ts` (+ `.es.ts`).

> **Who this is for.** Someone comfortable following terminal
> instructions carefully, but who has never deployed a server.
> Where this guide hands off to the operator runbooks, it says so
> and tells you exactly where to pick up. If the words "terminal"
> and "command" are new to you, do this next to a member who's
> done it — that's how this knowledge is supposed to travel anyway.

> **Why this works.** Understoria is free software (AGPL licensed),
> and every deployed node serves its own source code — the exact
> code it is running — at `/source/`. That isn't a courtesy; the
> license requires it, and the project builds it in so that no
> single company, host, or repository can ever be the only place
> the software lives. Every community is a seed.

---

## 1. What you need

- A computer with a terminal (Linux or macOS in the commands below;
  a Raspberry Pi works).
- About 15 minutes to *try* the app locally (§4). Deploying a real
  node for members is a longer afternoon (§5) and needs a domain
  and a small server — the runbooks cover that.
- The address of any Understoria community node you can reach —
  usually your own community's (the same address you open the app
  at).

## 2. Get the software

### The in-app way

Open your community's Understoria in a browser. Open the **Menu**
(top right) → **Community infrastructure** → find the card called
**"The software itself."** It shows the version and commit your
community's server is running, and links:

- **Download the source** — the code, as a compressed archive.
- **Checksums** — a small file used to verify the download (§3).
- **Full history bundle** — offered by some servers (§2a). If you
  see it, prefer it.

Download the source archive **and** the checksums file into the
same folder.

### The terminal way

The same files, fetched directly (replace the domain with your
community's):

```bash
mkdir understoria-download && cd understoria-download
curl -fsSO https://understoria.example.org/source/understoria-source.tar.gz
curl -fsSO https://understoria.example.org/source/SHA256SUMS
# Optional: see what version/commit you just fetched.
curl -fsS https://understoria.example.org/source/manifest.json
```

### 2a. The history bundle, if offered

Nodes deployed straight from a git checkout also serve
`understoria.bundle` — the project's **entire development history**
in one file. It's bigger (tens of MB instead of a few), and `git`
consumes it directly:

```bash
curl -fsSO https://understoria.example.org/source/understoria.bundle
git clone understoria.bundle understoria
cd understoria
```

Take this path if you have git installed: you get everything the
plain archive has, *plus* history, signed tags, and the ability to
pull future updates like any git checkout. If you took this path,
skip §3's extraction step — but still verify (§3).

## 3. Verify what you downloaded

A checksum is a fingerprint: a short string computed from the
file's exact bytes. If even one byte of the download changed — a
flaky connection, a truncated file — the fingerprint changes
completely. Check it before building anything:

```bash
# Linux (both files in the same folder):
sha256sum -c SHA256SUMS

# macOS:
shasum -a 256 -c SHA256SUMS
```

You want to see `understoria-source.tar.gz: OK` (and the bundle's
`OK`, if you fetched it). Anything else: delete and re-download.

**Be honest with yourself about what this proves.** The checksum
came from the same server as the file, so it proves the download
arrived *intact* — it cannot prove nobody *changed the source on
that server*. In practice you already extend the operator that
trust every day: they serve you the running app itself. If you want
independent confirmation, it's easy and worth doing once:

```bash
# Fetch a second community's checksums for the same version and
# compare — two operators would have to collude to fool this.
curl -fsS https://other-node.example.net/source/SHA256SUMS
```

Same version (check each node's `manifest.json`), same checksum, on
nodes run by different people → you can be confident. The project's
public repository and its signed tags remain a third reference
point whenever it's reachable.

Then unpack (the archive extracts *into the current folder*, so
make one first):

```bash
mkdir understoria
tar -xzf understoria-source.tar.gz -C understoria
cd understoria
```

## 4. Try it before you commit to anything

You can run the whole app on your own machine in about 15 minutes
and walk a real exchange end to end. Follow
[`quickstart.md`](./quickstart.md) **starting at its step 1 (build
prerequisites)** — and when it says to clone the repository, skip
that: you're already sitting in the source folder. Everything else
applies unchanged, because what you downloaded *is* the repository
contents.

This is worth doing even if you're sure. You'll onboard yourself,
post a need, and confirm an exchange — which means when your first
real member gets stuck, you'll have seen their screen before.

## 5. Deploy it for your community

Two runbooks, both written for this moment — pick by how you want
to run it:

- **[`deploy-linode.md`](./deploy-linode.md)** — Docker Compose on
  a small VPS ($5/month class). The most-traveled path;
  `scripts/setup.sh` automates most of it.
- **[`deploy-alternatives.md`](./deploy-alternatives.md)** —
  rootless Podman, or plain bare metal with systemd (no containers
  at all — the right shape for donated hardware).

One translation to make as you read them, since both open with
`git clone` from the public repository:

- **If you took the bundle path (§2a)** — nothing to translate.
  Your folder is a real git checkout; follow the runbooks exactly
  as written from their build steps onward.
- **If you took the plain archive** — where a runbook says to
  clone into `/opt/understoria`, instead copy your verified archive
  to the server and extract it there:

  ```bash
  scp understoria-source.tar.gz SHA256SUMS root@<your-server>:/opt/
  ssh root@<your-server>
  cd /opt && sha256sum -c SHA256SUMS && mkdir understoria \
    && tar -xzf understoria-source.tar.gz -C understoria
  cd understoria
  ```

  Then continue with the runbook's next step (the interactive
  setup, or the manual build). Everything else — the system key,
  `.env`, founder keys, backups, the "before going public"
  checklist — applies unchanged.

**Updating later, without git:** a plain archive has no history, so
"`git pull` for updates" becomes: download the newer
`understoria-source.tar.gz` from any node running the newer version
(the `manifest.json` tells you what a node runs), verify it,
extract it over a *fresh* folder, carry over your `.env`, and
redeploy per the runbook's redeploy section. Your data is safe
through this — it lives in the Docker volume or
`/var/lib/understoria`, never in the source folder. If you'd rather
have normal `git pull` updates, switch to a git checkout whenever
you like: fetch `understoria.bundle` from any full-clone node,
`git clone` it into a fresh folder, carry your `.env` over, and
deploy from there — the public repository is never required.

## 6. You're now a seed too

The moment your node is up, it serves *its own* source at
`/source/` — automatically, from the same build. Your members can
verify what they're running, and the next neighborhood can
bootstrap from **you** the way you just bootstrapped from your
community. That's the design: the software spreads along the same
trust lines the communities do, and no single point — not GitHub,
not the project's authors, not any one operator — can take it away
from everyone at once.

Two habits keep the chain strong:

- **Redeploy occasionally.** Your node serves the source of what it
  runs; running something recent means seeding something recent.
- **Know a second node.** The compare-two-nodes verification in §3
  only works if communities can name each other. Peering
  ([`add-a-node.md`](./add-a-node.md)) gives you that for free.

Questions the runbooks don't answer live where all the others do:
[`operator-guide.md`](./operator-guide.md) — §7a is the section
about exactly this machinery.
