# Security Policy

Understoria is built for organizing communities that face real
retaliation — surveillance, union-busting, state interference. A
security bug here is not abstract. We treat reports seriously and
move quickly.

This document tells you how to report a vulnerability, what to
expect after you report it, and how we coordinate disclosure.

---

## What counts as a vulnerability

If you've found something that could compromise the safety or
privacy of members or operators, that's a security bug. Examples:

- A way to forge a signed exchange, vouch, or invite
- A way to bypass the lock screen or extract a member's passphrase-
  wrapped key
- A way to read another member's secret material, posts, or
  exchanges from the server
- A way to make the node log IP addresses, member identifiers, or
  request bodies (the threat model says it doesn't — if it does,
  that's a bug)
- A way to make the panic button incomplete (data survives that
  shouldn't)
- A way to bypass rate limits or body-size caps to abuse a node
- A cryptographic flaw in the canonical exchange / vouch / invite
  payloads or signature verification

Functional bugs, UI quirks, accessibility issues, and missing
features go to the public issue tracker. Security bugs come here.

## How to report

**Preferred: encrypted Matrix DM.** Send to the Understoria
security team in the `#understoria:matrix.org` room — DM any
member of the moderation committee. Matrix gives you end-to-end
encryption by default.

**Alternative: encrypted email** to `security@understoria.example`
(placeholder until the legal entity is set up; check this repo's
SECURITY.md for the canonical address). Our PGP key fingerprint
will be published alongside the address once it exists.

**Do not** file security reports as public GitHub issues. Do not
discuss the vulnerability in public Discord/Matrix channels. Do
not post a proof-of-concept on social media before we've had a
chance to coordinate.

In your report please include, where you can:

- A short description of the issue and the impact
- Steps to reproduce, or a proof-of-concept
- The version / commit you were testing against
- Whether you've already disclosed this elsewhere
- How you'd like to be credited (if at all)

## What to expect

- **Acknowledgement within 48 hours.** A real human will reply to
  confirm we received the report. If you don't hear back, escalate
  to a different moderation-committee member — they may have been
  offline.
- **Triage within 1 week.** We'll tell you whether we believe it's
  a vulnerability, what the severity looks like, and roughly when
  we expect a fix.
- **Fix and coordinated disclosure.** We fix first, then announce.
  If you set a public disclosure deadline (90 days is common), we
  honor it. If you don't, we'll propose a timeline that gives
  active pilot communities a chance to update before the issue is
  public.
- **Credit.** We will credit you publicly in the release notes and
  the changelog, unless you ask us not to.

If we disagree about whether something is a vulnerability, we'll
say so plainly and explain our reasoning. We won't try to silence
you.

## What we will not do

- Pay bounties (we don't have the money; if that changes we'll
  update this).
- Sign NDAs.
- Treat good-faith security research as hostile. If you're acting
  in good faith — reporting a real issue, not trying to extort or
  embarrass — you have our gratitude regardless of how the report
  is framed.

## Out of scope

These don't count as vulnerabilities under this policy:

- Issues that require physical access to an unlocked device. The
  threat model (see [docs/threat-model.md](docs/threat-model.md))
  treats device-level compromise as a separate concern with its
  own mitigations.
- Issues in third-party dependencies that we haven't introduced
  ourselves. Report those upstream; ping us if you'd like us to
  bump the dependency.
- Social-engineering attacks against operators or moderators.
  Important — but not a code bug.

## Scope of this policy

This policy covers the code in this repository (the PWA in
`apps/web/`, the community node in `apps/server/`, the shared
crypto package in `packages/shared/`) and the documented
deployment paths.

Third-party hosts running modified Understoria forks operate
under their own policies. If you're not sure who's operating a
particular deployment, ask before testing against it.

---

*Security work matters because the people Understoria is built
for face real risk. Thank you for taking the time to make this
software safer.*
