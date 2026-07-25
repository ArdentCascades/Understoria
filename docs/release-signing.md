# Release signing — scheme, runbook, and honest limits

Understoria releases are signed with ONE offline Ed25519 keypair and
verified with one command. No PKI, no certificate chain, no web of
trust — the simplest scheme that delivers the property that matters:
**a captured forge account cannot mint a valid release.** Design and
verification audit: [`project-continuity-plan.md`](./project-continuity-plan.md).

## The scheme

- A maintainer generates the keypair **offline**:
  `node scripts/generate-release-key.mjs`. The secret is kept with
  the same discipline as `NODE_SYSTEM_SECRET_KEY`: offline, escrowed
  with a trusted second person, never in CI secrets, never committed.
- The **public** half is committed to
  [`scripts/release-pubkey.json`](../scripts/release-pubkey.json)
  (`{keys: [{id, publicKey, since}]}` — an array so rotation is
  representable). It therefore travels inside every source pack,
  on every forge, and in every clone.
- Each release gets `release-manifest.json` (name, tag, generatedAt,
  and every artifact's name/bytes/sha256 — deterministic bytes:
  fixed key order, LF, trailing newline) and `release-manifest.sig`
  (base64 `nacl.sign.detached` over the exact manifest bytes),
  produced by `scripts/sign-release.mjs` on the maintainer's
  machine.
- **CI verifies, never signs** (`.github/workflows/release.yml`
  runs `scripts/verify-release.mjs` when a signed manifest is
  present). This is the decisive anti-compromise property.
- Round-trip and tamper detection (flipped artifact byte, edited
  manifest, wrong key, empty registry) are locked by
  `apps/server/src/releaseSigning.test.ts`.

## Verifying a release (operators, members, auditors)

```sh
# In a directory holding the release artifacts + manifest + sig:
node scripts/verify-release.mjs .

# Better: verify against an INDEPENDENTLY OBTAINED key registry —
# another node's source pack, the mirror, an old clone:
node scripts/verify-release.mjs . --pubkey /path/to/other/release-pubkey.json
```

Exit 0 with an `OK` line naming the signing key id = verified.
Anything else fails loudly.

## Honesty paragraph — what this does and does not prove

The public key ships in the same repository it authenticates.
First contact is therefore **trust-on-first-use plus cross-channel
comparison**: the key you hold is trustworthy to the extent that the
copies on GitHub, the mirror, and N community nodes' source packs
all agree on it — an attacker would have to corrupt every channel at
once, and the older your independently obtained copy, the stronger
your check. That is honest and much better than nothing; it is not a
root-of-trust miracle. What the signature DOES prove unconditionally:
artifacts attached to a release were signed by whoever holds the
offline secret — not by whoever holds the GitHub account.

## Cutting a release (maintainer runbook)

1. Update `CHANGELOG.md`: cut `[Unreleased]` into a dated
   `[<version>]` section. Bump `package.json` versions if the
   release is more than a re-tag.
2. Tag and push: `git tag -a v<version> -m "Understoria v<version>"
   && git push origin v<version>`. The release workflow runs the
   full gate sequence, packs the source (tarball + history bundle +
   checksums + manifest), and creates the GitHub Release with the
   artifacts attached.
3. Download the built artifacts from the release, then sign them
   **offline**:
   ```sh
   RELEASE_SIGNING_SECRET_KEY=... node scripts/sign-release.mjs <dir> --tag v<version>
   ```
4. Attach the signature to the release:
   `gh release upload v<version> <dir>/release-manifest.json <dir>/release-manifest.sig`.
5. Optional CI self-check: commit the manifest + sig under
   `releases/v<version>/` — the workflow verifies rebuilt artifacts
   against it on that tag from then on.
6. Mirror step: the tag reaches the Codeberg mirror via the mirror
   workflow; attach the same artifacts to a Codeberg release
   manually (scriptable later; see the forge-mirror runbook).

A bad tag can be deleted **before announcement only** — once a
release has been announced or mirrored, cut a fixed follow-up
release instead of rewriting history under people's feet.

## Rotation and revocation

- **Rotate** (key retired on schedule or holder changes): generate a
  new keypair offline, APPEND its public half to
  `release-pubkey.json` with a new `id` and `since` — never remove
  old keys; old releases verify against them forever.
- **Revoke** (key compromised): append the new key AND add a dated
  note to this document naming the compromised key id and the last
  trustworthy release; announce on BOTH forges and to node
  operators through the community channels. Releases signed by the
  compromised key after the compromise date must be treated as
  unverified regardless of signature.

## Relationship to the other authenticity layers

Checksums (`SHA256SUMS`) prove integrity of a download; cross-node
comparison ([`bootstrap-from-a-node.md`](./bootstrap-from-a-node.md)
§3) proves N communities agree on the bytes; the release signature
adds authorship by the offline key holder. Use whichever your threat
model needs — they compose.
