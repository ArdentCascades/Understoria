# Contributing to Understoria

Thank you for considering a contribution. Understoria is built for
organizing communities, and a lot of the code is security-sensitive —
we review carefully and value small, focused PRs over large ones.

---

## Before you start

1. Read the [Code of Conduct](CODE_OF_CONDUCT.md) and the
   [Threat Model](docs/threat-model.md). If a change would undermine
   any mitigation in the threat model, it needs separate discussion
   first.
2. For anything larger than a one-file fix, **open an issue or
   discussion first.** Some proposals (adding tracking, removing
   encryption, leaderboards, external services) are out of scope for
   the project regardless of code quality; a quick issue saves you
   from writing code that can't merge.
3. Check that your idea fits one of the nine agent workstreams
   described in the project plan. Work outside those agents is fine,
   but name it clearly so reviewers know what they're looking at.

## Development setup

```sh
git clone https://github.com/ardentcascades/understoria.git
cd understoria
npm install
npm run dev          # hot-reload dev server at http://localhost:5173
npm test             # vitest suite
npm run typecheck    # tsc --noEmit
npm run build        # production build + PWA precache
npm run preview      # serve the built bundle
```

Node 20 or 22 is required; npm 10+.

### The test suite is the door

Every change should leave the suite green. If you're adding behavior
that isn't covered by an existing test, add a test for it. The
baseline as of this writing:

- `lib/` modules are pure and must have unit tests.
- `db/` modules (transactions, actions) must have integration tests
  with `fake-indexeddb`.
- `components/` and `pages/` are tested indirectly via the integration
  suite today. Component-level tests are welcome but not required
  unless the component has non-trivial logic.

CI runs `npm run typecheck`, `npm test`, and `npm run build`. All
three must pass.

## Commit style

- **Sign your work with `-s`.** Every commit must carry a DCO
  sign-off (Developer Certificate of Origin, `Signed-off-by:` line).
  By adding it you assert you wrote the code and are submitting it
  under AGPL-3.0-or-later.
- **Conventional-ish subjects.** `feat:`, `fix:`, `docs:`, `test:`,
  `refactor:`, `chore:`. A scope is nice if the change is tightly
  contained: `feat(crypto): …`.
- **Explain the why.** The subject line says what; the body says
  why. Bullet points are fine. No emojis in commits.
- **Keep PRs scoped.** Refactors should land separately from
  behavior changes. Large renames as their own PR. No drive-by
  unrelated changes.

## Code style

- TypeScript strict mode is non-negotiable. Fix type errors rather
  than casting them away.
- No default exports except where React conventionally expects them
  (pages).
- Prefer pure functions. When you can't, the DB layer (`db/`) owns
  side effects; keep them there.
- Do not introduce new dependencies without a conversation. Every
  npm package is an attack surface.
- Do not introduce a telemetry SDK, analytics library, or any code
  that contacts a network endpoint not explicitly defined in the
  app's own configuration. This will be rejected on sight.

## Security-sensitive changes

If your PR touches any of the following, label it `security-review`
and expect a longer review cycle:

- `lib/crypto.ts`, `lib/passphrase.ts`, `lib/bytes.ts`, `lib/invite.ts`,
  `lib/vouch.ts`
- `db/secrets.ts`, `db/actions.ts` (signing paths)
- Authentication, authorization, or trust-computation logic
- Anything that writes to `settings` or `secretKeys`
- CSP / security-header configuration

Reviewers will ask:

1. Does this change the data that ends up on disk, or in logs?
2. Does this introduce a new trust assumption?
3. Does this change a canonical-form function? (Signatures depend on
   them being stable.)
4. Does this change what `verifyExchange()`, `verifyVouch()`, or
   `decodeAndVerifyInvite()` accept?
5. What does the test suite for this add?

If any of those is hard to answer, clarify in the PR description.

## Review process

- A maintainer will respond within 7 days (usually much sooner).
  Silence longer than that means ping us; it's not intentional.
- Reviews are about the code, not the coder. Expect direct feedback
  and give it too.
- PRs sit at most 2 weeks waiting for author response before we
  close them with a polite note. Reopen any time.
- Squash-merge is the default. Your commit body becomes the body of
  the merge commit.

## Documentation

- If you change user-facing behavior, update the relevant guide
  (`docs/member-guide.md`, `docs/operator-guide.md`,
  `docs/organizer-guide.md`).
- If you touch security-relevant infrastructure, update
  `docs/threat-model.md`.
- `README.md` is the front door — keep the Quick Start honest.

## Translations

Translations are especially welcome.

### How the i18n layer works

- The framework is `i18next` + `react-i18next`. Setup lives in
  `apps/web/src/i18n/index.ts`.
- All user-visible strings live in `apps/web/src/i18n/locales/<lang>.json`.
- React components call `t("key.path")` after `const { t } = useTranslation()`.
- Pure modules (`lib/format.ts` and friends) call `i18n.t(...)` from
  the `@/i18n` import directly.
- The active language is auto-detected from the browser on first
  launch and persisted in `localStorage` under
  `understoria.language`. Members can change it from
  Profile → Language.

### Adding a new key

1. Add it to **every** locale file in `src/i18n/locales/`.
2. Use it in your component via `t("…")`.
3. Run `npm test` — the parity test in
   `src/i18n/parity.test.ts` will fail if any locale is missing the
   new key, by design.

### Adding a new language

1. Create `src/i18n/locales/<code>.json`. Mirror the structure of
   `en.json` exactly.
2. Register the new language in `src/i18n/index.ts` — extend
   `SUPPORTED_LANGUAGES` and `LANGUAGE_LABELS` (with the language's
   own native form for the label, e.g. `"Português"` not
   `"Portuguese"`).
3. Verify the key-parity test passes before submitting.

### Translation quality and review

The initial Spanish translation in this repo was bootstrapped without
a native-speaker review. Native speakers should expect to see things
they want to revise. Open a PR — translation revisions are exactly
the kind of small, valuable contribution we welcome.

When reviewing or contributing translations:

- **Match the voice**, not just the literal meaning. Understoria's
  English uses solidarity-tone, plainspoken language. Don't
  formalize it.
- **Keep gender inclusivity**. For Spanish, this currently means using
  inclusive forms like "niñes" rather than "niños/as." If your
  community has a different convention, propose it in an issue
  first — consistency matters.
- **Stretch interpolated values** like `{{name}}` and `{{count}}`
  carry through unchanged. Don't translate or rename them.
- **HTML inside translations** (e.g. `<strong>`) is rendered with
  React's `Trans` component on the React side. Keep the tags
  identical.

### Ongoing migration

The current build has migrated the high-traffic surface (board, nav,
post cards, urgency / category badges, relative-time formatting,
language switcher). Profile, Dashboard, PostDetail, PostForm, and
InviteAccept are still English-only. Migrating those is incremental
and welcome — each PR can take one page at a time.

## What not to contribute

- **Analytics, telemetry, crash reporters.** No.
- **Third-party identity providers** (Google, Apple, email/password
  signup). Understoria is key-pair identity on purpose.
- **Leaderboards, point multipliers, tiered membership.** The design
  principle of equal credit is fixed.
- **Closed-source dependencies.**
- **AI-generated code you haven't read and understood.** We're not
  opposed to any specific tool, but you are responsible for every
  line you submit, including whether it works and is appropriately
  licensed.

## Releases

Maintainers tag a release when a coherent slice of work lands. Tags
follow `v<major>.<minor>.<patch>` starting from `v0.1.0`. Pre-1.0
we treat everything as potentially breaking and document migrations
in the release notes.

## Getting help

- **GitHub Discussions** for questions and ideas.
- **Issues** for bugs and concrete proposals.
- **Matrix (`#understoria:matrix.org`)** for real-time conversation.

Welcome in.
