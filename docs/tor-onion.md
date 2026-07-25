# Tor onion front door — operator runbook

Your node can publish a Tor **onion service**: a second, parallel
front door at a `.onion` address that keeps working when the
clearnet domain is DNS-blocked, IP-blocked, or seized. It's opt-in,
additive, and invisible to default deployments — the design and its
honest limits are in [`tor-onion-plan.md`](./tor-onion-plan.md).

What it gives you: reachability under network blocking, transport
encryption and endpoint authentication from Tor itself (the address
IS the public key — no CA involved), and no inbound firewall changes
ever (onion services make only outbound connections; this works
behind NAT).

What it does NOT give you: the node still sees exactly what it saw
before (Tor changes the transport, not the trust model); a member's
Tor use is itself visible to their network operator and conspicuous
in some places; and Tor Browser wipes site storage on exit, so an
onion-origin session is effectively a **fresh device every time**
(see "Member experience" below).

## Enable it (Docker deployment)

The tor sidecar is behind a compose *profile* — nothing starts
without it:

```sh
docker compose --profile onion up -d --build
```

First launch generates the onion identity. Read your address:

```sh
docker compose --profile onion exec tor cat /var/lib/tor/understoria/hostname
```

That prints something like `<56 characters>.onion`. Members reach
the app at `http://<address>.onion` and the node at
`http://<address>.onion/api` — plain `http://` is correct here; Tor
provides the encryption TLS would (the Caddy onion vhost also
strips the app server's HSTS header, which has no meaning on an
onion origin).

Optionally set `ONION_MARK_SECRET` in `.env` (any long random
string) before enabling: it stamps onion-lane requests so a later
server version can give Tor users their own rate-limit bucket. It
is inert until that lane ships and is configured — see the
"Rate limiting" note below for the interim guidance.

## Back up the onion identity — do this immediately

The file `hs_ed25519_secret_key` inside the tor volume **is your
censorship-resistant address**. Lose it and the address on every
printed wallet card dies with it; let it leak and whoever holds it
can impersonate your community with Tor itself vouching for them.

```sh
docker compose --profile onion exec tor \
  cat /var/lib/tor/understoria/hs_ed25519_secret_key > onion-identity.key
```

Store it exactly like your `DATABASE_KEY` escrow: offline, with a
trusted second person, and **away from the database backups** — a
seized backup drive should never yield both the community's data
and its address identity.

## Rotation (if the key is compromised or you want a fresh address)

1. `docker compose --profile onion stop tor`
2. `docker compose --profile onion run --rm --entrypoint sh tor -c 'rm -rf /var/lib/tor/understoria'`
3. `docker compose --profile onion up -d tor` — a new address is
   generated; read it with the `hostname` command above.
4. Re-do the identity backup, and **reprint the paper** that carried
   the old address. Paper outlives rotation — treat every copy of
   the old address as stale and say so at the next gathering.

## Test it end-to-end

From any machine with [Tor Browser](https://www.torproject.org/):

1. Open `http://<your-address>.onion` — the app loads.
2. The app derives its node suggestion from the origin: it should
   offer `http://<your-address>.onion/api` as the community node.
   Accept it.
3. Confirm the node answers: `http://<your-address>.onion/api/health`
   in the same browser returns ok.

From a terminal with a local tor client running:

```sh
curl --socks5-hostname 127.0.0.1:9050 -sI http://<your-address>.onion/api/health
```

(Also verify the header difference: that response carries **no**
`Strict-Transport-Security`, while your clearnet
`https://<domain>/api/health` still does.)

## Bare-metal variant (no Docker)

Install tor from your distribution (`apt install tor`), then in
`/etc/tor/torrc`:

```
HiddenServiceDir /var/lib/tor/understoria/
HiddenServicePort 80 127.0.0.1:8081
```

Add an onion vhost to your Caddyfile that mirrors the one in
`deploy/Caddyfile` (the `http://:8080` block) but listens on
`http://:8081` and binds loopback only:

```caddyfile
http://:8081 {
	bind 127.0.0.1
	# ... copy the onion block's headers/handles from deploy/Caddyfile,
	# with your bare-metal root and upstream from deploy-alternatives.md
}
```

Then `systemctl enable --now tor`, and read the address from
`/var/lib/tor/understoria/hostname`. The identity backup and
rotation steps are the same files, same discipline.

## Member experience — the honest caveats

- **Tor Browser forgets.** Site storage (the app's entire local
  database) is wiped when Tor Browser closes. Members using the
  onion exclusively are a fresh device every session: fine for
  reading the board and checking events, painful for holding an
  identity. Members who need a durable identity under blocking
  should keep the app installed on a phone/computer (clearnet or a
  mirror) and treat the onion as the read-mostly fallback — or
  re-import their identity kit each session.
- **Rate limiting (until the onion lane ships).** All Tor visitors
  share one IP bucket on the node — a few active Tor members can
  exhaust the default `RATE_LIMIT_MAX=60`/min between them. If Tor
  members report sluggishness or errors, raise `RATE_LIMIT_MAX`
  as an interim measure; a dedicated onion rate-limit lane (keyed
  by `ONION_MARK_SECRET`) is the planned fix.
- **Print the address.** The onion address is only useful to members
  who have it *before* the blocking starts. Put it on the printed
  backup surfaces (wallet cards / poster — see
  [`paper-systems.md`](./paper-systems.md)) and read it out at a
  gathering, the same way the mirror addresses travel.

## Rollback

`docker compose --profile onion down` stops the onion door;
**keep the `tor-keys` volume** unless you deliberately intend to
rotate — deleting it destroys the address. Default (non-profile)
deployments are unaffected by everything on this page.
