# Tor sidecar for the opt-in onion front door (docs/tor-onion.md).
#
# Built in-repo from debian:bookworm-slim rather than pulling a
# third-party community image: the tor package is Debian-security-
# maintained, and this keeps the trust chain auditable — the same
# minimal-trust posture as the rest of the stack. The container runs
# tor as the packaged debian-tor user, reads its config from
# deploy/torrc (mounted read-only by compose), and keeps the onion
# identity keys in the `tor-keys` named volume.
#
# The service makes only OUTBOUND connections (that's how onion
# services work) — no published ports, no firewall changes, works
# behind NAT.
FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends tor \
    && rm -rf /var/lib/apt/lists/*

# /var/lib/tor is the HiddenServiceDir parent (named volume). The
# directory must be owned by the tor user with tight permissions or
# tor refuses to start — enforced again at runtime because the named
# volume's ownership is set on first mount.
RUN chown -R debian-tor:debian-tor /var/lib/tor \
    && chmod 700 /var/lib/tor

USER debian-tor

CMD ["tor", "-f", "/etc/tor/torrc"]
