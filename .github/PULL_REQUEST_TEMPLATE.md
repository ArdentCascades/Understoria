<!--
Thanks for sending a PR. A few things to know before you submit:

- Every commit must be signed off under the Developer Certificate
  of Origin. The CI `dco` job checks every commit on this PR. See
  CONTRIBUTING.md for the `git commit -s` and rebase examples.
- Small, focused PRs are reviewed faster than large ones. If
  yours touches more than ~500 lines or more than one feature
  area, consider splitting.
- If this touches crypto, identity, signing, panic, or anything
  in lib/{crypto,passphrase,vouch,invite}.ts or db/secrets.ts,
  label the PR `security-review` and expect a longer review cycle.
-->

## Summary

<!-- 1–3 sentences. What changes and why? -->

## Changes

<!--
Bullet list of substantive changes. Group by file or by concept.
Omit fluff like "added a comment" — call out behavior or
architecture shifts.
-->

-
-

## Tests

<!--
Which tests were added / changed? Which existing tests cover the
new path? How did you verify the change works end-to-end?
-->

-

## Checklist

- [ ] Every commit signed off (`git commit -s`)
- [ ] `npm run typecheck` clean
- [ ] `npm test` passes locally
- [ ] If this touches user-visible strings, both `en.json` and
      `es.json` updated (parity test will catch you otherwise)
- [ ] If this touches a documented behavior, the matching
      `docs/*.md` was updated
- [ ] If this touches the threat-model surface, `docs/threat-model.md`
      §7 was updated (mark items implemented or note new gaps)
- [ ] `CHANGELOG.md` `[Unreleased]` section has an entry
- [ ] PR scope matches one feature / one agent workstream; no
      unrelated drive-by changes

## Tracked follow-ups

<!--
Things this PR explicitly does NOT do but that should be tracked.
Either link to an existing issue or write a sentence so a future
reviewer can file one.
-->

-
