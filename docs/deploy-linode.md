# Deploying Understoria on Linode

A step-by-step runbook for standing up a community node on a single
Linode (or any Docker-capable VPS). The same steps work on DigitalOcean,
Hetzner, a Raspberry Pi at someone's house, etc. — the only Linode-
specific bit is the provider UI for spinning up the VM and pointing DNS.

> **Who this is for.** An operator who is comfortable with SSH and
> `docker compose`. You do not need to know TypeScript; the bundled
> Dockerfiles handle the build.

> **What this gives you.** A running community node at `https://<your-
> domain>` with the PWA served at `/` and the federation API at `/api`.
> TLS is auto-acquired and renewed by Caddy. Member data persists in a
> named Docker volume. Auto-confirm runs every 7 days by default.

> **What this does NOT give you.** Offsite backups (template included,
> destination is yours to pick), a privacy policy, a code-of-conduct
> enforcement address, or a moderator. See "Before going public" at
> the bottom — those are non-technical and they matter.

---

## 1. Provision the Linode

**Size.** Understoria is light. A **Nanode 1 GB** ($5/mo) is enough
for a community of a few hundred members. SQLite + Node holds steady
under 200 MB RSS for that size; the limiting factor is disk for the
DB and any local backups.

**Image.** Debian 12 (or any recent Linux with Docker support).

**Networking.**
- Stackscript / cloud-init optional. Bare image is fine.
- Open ports 22, 80, 443 in the Linode Cloud Firewall.

**Disk.** The default 25 GB is plenty for the DB but TIGHT if you
keep many local backup snapshots. Consider attaching a 40-80 GB
Block Storage volume mounted at `/var/lib/docker` if you expect
heavy use.

## 2. Point DNS

Create an **A record** for the chosen domain (e.g. `understoria.example.org`)
pointing at your Linode's public IPv4. If you have IPv6, add an AAAA
record too. Wait for propagation (`dig +short understoria.example.org`
should return the IP from at least two resolvers before continuing).

> Caddy will FAIL to acquire a Let's Encrypt cert if DNS hasn't
> propagated. The failure shows up as a busy-loop in `docker compose
> logs caddy`; you'll have to wait it out and `docker compose restart
> caddy` once DNS is correct.

## 3. Install Docker on the Linode

```bash
ssh root@<your-linode-ip>

# Docker Engine + Compose plugin (Debian).
apt-get update
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl enable --now docker
docker --version
docker compose version
```

## 4. Clone the repo

```bash
mkdir -p /opt && cd /opt
git clone https://github.com/ArdentCascades/Understoria.git understoria
cd understoria

# Pin to a tagged release for production (the `main` branch may have
# unreleased work). See https://github.com/ArdentCascades/Understoria/releases
# git checkout v0.2.0
```

## 5. Generate the auto-confirm system key

This Ed25519 keypair signs auto-confirmed exchange records. It is the
**only secret** in the system; treat it like a TLS private key. See
[`auto-confirm-key.md`](./auto-confirm-key.md) for the design background
and the threat model around §4 distinguishability.

```bash
# Build the server image first so node_modules (including tweetnacl)
# are present inside.
docker compose build understoria

# Generate the key — output goes to stdout.
docker compose run --rm --no-deps --entrypoint node understoria \
  /app/scripts/generate-system-key.mjs
```

You'll see three lines like:

```
# Generated 2026-06-04T22:00:00.000Z
# Public key (sanity check, NOT a secret):
#   <base64 32-byte public key>
NODE_SYSTEM_SECRET_KEY=<base64 64-byte secret>
```

Copy the `NODE_SYSTEM_SECRET_KEY=` line. Do NOT log it, paste it into
chat, or commit it.

**If you ever want to disable auto-confirm,** leave the key empty in
`.env`. Members will then confirm manually only; the auto-confirm
endpoint will refuse all requests.

## 6. Fill in `.env`

```bash
cp .env.example .env
chmod 600 .env

# Edit with your domain, the secret key from step 5, and an ACME
# email Let's Encrypt can reach.
nano .env
```

At minimum:

```ini
DOMAIN=understoria.example.org
ACME_EMAIL=ops@example.org
NODE_SYSTEM_SECRET_KEY=<paste from step 5>
OPERATOR_NAME="Example Mutual Aid Network"
OPERATOR_CONTACT=help@example.org
```

> **Permissions matter.** `chmod 600 .env` means only root can read
> the secret. If you create a `deploy` user later, narrow ownership
> with `chown deploy:deploy .env` so docker compose can still read it.

## 7. First launch

```bash
docker compose up -d --build
```

The startup sequence is:

1. `web` builds the PWA dist into the `web-dist` volume and exits.
2. `understoria` starts, opens SQLite at `/data/understoria.db`,
   begins listening on `:8787` internally.
3. `caddy` waits for `understoria` to be healthy, then starts. It
   reaches out to Let's Encrypt over port 80 (HTTP-01 challenge) to
   acquire a cert for your `DOMAIN`.

Watch the logs:

```bash
docker compose logs -f
```

You should see Caddy print something like
`certificate obtained successfully` within a minute or two. After
that, `https://<your-domain>` serves the PWA and `https://<your-
domain>/api/health` returns `{"status":"ok"}`.

## 8. Smoke-test

```bash
# From your laptop (NOT the Linode):
curl -fsS https://<your-domain>/api/health
curl -fsS https://<your-domain>/api/config | jq

# Both should return JSON. /api/config should show your OPERATOR_NAME
# and the systemKey public-key fingerprint (the secret is never echoed).
```

Open `https://<your-domain>` in a browser, walk through onboarding,
post a NEED, and confirm an exchange from a second browser profile.
If the auto-confirm sweep is enabled, you can wait 7 days — or
temporarily lower `AUTO_CONFIRM_MIN_HOURS` in `.env` to (say) `1`
and `docker compose up -d` to re-test the system-signed code path.

## 9. Set up backups

The Linode disk is a single point of failure. The bundled script
takes online SQLite snapshots; you choose the offsite destination.

```bash
# Backup script lives in the repo; symlink it for cron.
ln -sf /opt/understoria/scripts/backup-db.sh /usr/local/sbin/understoria-backup

# Edit the bottom of the script to enable rclone / b2 / s3 offsite.
nano /opt/understoria/scripts/backup-db.sh

# Daily snapshot at 04:00 UTC.
cat >/etc/cron.d/understoria-backup <<'EOF'
0 4 * * * root /usr/local/sbin/understoria-backup >>/var/log/understoria-backup.log 2>&1
EOF
```

Test it once by running the script by hand and confirming the snapshot
lands in `/opt/understoria/backups/` AND in your offsite bucket.

**Restore drill** (do this at least once before going public):

```bash
# Stop the server, drop the snapshot into place, restart.
docker compose stop understoria
gunzip -c /opt/understoria/backups/understoria-<timestamp>.db.gz \
  | docker run --rm -i -v understoria_understoria-data:/data \
    busybox:1.37-musl sh -c 'cat > /data/understoria.db'
docker compose start understoria
```

Verify the restored DB by checking `GET /api/health` and a couple of
member-visible pages.

## 10. Redeploy on a new version

```bash
cd /opt/understoria
git fetch origin
git checkout <new-tag>

# Rebuild + restart. `web` is a one-shot so it exits after copying
# the new dist; `understoria` does a graceful SIGTERM restart.
docker compose up -d --build
```

The auto-confirm secret key SURVIVES rebuilds — it lives in `.env`,
which `git pull` doesn't touch.

---

## Before going public

The technical bundle above is necessary but not sufficient. A
mutual-aid timebank holds member data and arbitrates time-credit
disputes; a launch posture also needs:

- **Privacy policy.** What you collect, who can see what, how long
  member data persists if they leave. Required in most jurisdictions
  for any data handling; ethically required regardless.
- **Terms / Code of Conduct enforcement contact.** [`CODE_OF_CONDUCT.md`](
  ../CODE_OF_CONDUCT.md) is in the repo. Pick the actual humans who
  will receive enforcement reports and put their address there.
- **Moderator coverage.** Disputes route to `/disputes` in-app and
  to whoever owns the moderator role per [`GOVERNANCE.md`](
  ../GOVERNANCE.md). Someone has to be ready to respond.
- **Incident plan.** What you do if the system key is leaked. The
  short answer is in [`auto-confirm-key.md`](./auto-confirm-key.md)
  §6 — rotation + announcement. Have the announcement template
  pre-written.
- **A second pair of eyes on the threat model.** [`threat-model.md`](
  ./threat-model.md) §7 lists the decisions we've made. If your
  launch context (jurisdiction, member demographics, threat surface)
  differs from a typical mutual-aid org, a §7 review pass before
  inviting members is cheap insurance.

These are not tasks for a "we'll do them later" backlog. They are
the social half of the system; the code half doesn't work without
them.
