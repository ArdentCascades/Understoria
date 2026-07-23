/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatAbsoluteDateTime } from "@/lib/format";
import { useLiveQuery } from "dexie-react-hooks";
import { db, SETTING_KEYS } from "@/db/database";
import {
  readSubmitConfig,
  writeSubmitConfig,
  type SubmitConfig,
} from "@/lib/nodeSubmit";
import { mirrorChangeNeedsConsent } from "@/lib/mirrorConsent";
import { isDemoBuild } from "@/lib/demo";
import { flushOutboxNow } from "@/lib/outbox";
import { claimFounder, fetchClaimStatus } from "@/lib/nodeClaim";
import { useApp } from "@/state/AppContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function NodeSection() {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<SubmitConfig>({ url: "", enabled: false });
  // Last value actually written to storage. Drives the consent check so we
  // only prompt when the save would point mirroring at a destination the
  // member hasn't already confirmed.
  const [persisted, setPersisted] = useState<SubmitConfig>({
    url: "",
    enabled: false,
  });
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  // When set, the pending (trimmed) config awaiting consent confirmation.
  const [pendingSave, setPendingSave] = useState<SubmitConfig | null>(null);

  // Load the persisted config once on mount.
  useEffect(() => {
    let cancelled = false;
    void readSubmitConfig().then((cfg) => {
      if (!cancelled) {
        setDraft(cfg);
        setPersisted(cfg);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Telemetry chips. Live-queried so a successful POST in the background
  // updates the UI without a page reload.
  const lastSuccess = useLiveQuery(
    () => db.settings.get(SETTING_KEYS.communityNodeLastSuccess),
    [],
  );
  const lastError = useLiveQuery(
    () => db.settings.get(SETTING_KEYS.communityNodeLastError),
    [],
  );

  async function persist(next: SubmitConfig) {
    setSaving(true);
    try {
      await writeSubmitConfig(next);
      setPersisted(next);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: SubmitConfig = { url: draft.url.trim(), enabled: draft.enabled };
    // Enabling mirroring (or retargeting it) ships the community's trust
    // graph to a member-chosen server — require informed consent first.
    // This is consent, not prevention: it defeats accidental/social-
    // engineered misconfiguration, not an allowlist.
    if (mirrorChangeNeedsConsent(persisted, next)) {
      setPendingSave(next);
      return;
    }
    await persist(next);
  }

  // Demo builds: the federation chokepoints (readSubmitConfig,
  // enqueueOutbox, listNodeEndpoints) are hard-disabled, so offering
  // the connect form would be a lie — a URL typed here would never be
  // used. Say so honestly instead. After the hooks above, so the hook
  // order stays unconditional.
  if (isDemoBuild()) {
    return (
      <section className="card mb-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
          {t("profile.node.title")}
        </h2>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("demo.nodeSection")}
        </p>
      </section>
    );
  }

  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("profile.node.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.node.intro")}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t("profile.node.urlLabel")}</span>
          <input
            type="url"
            inputMode="url"
            className="input"
            placeholder={t("profile.node.urlPlaceholder")}
            value={draft.url}
            onChange={(e) => setDraft({ ...draft, url: e.target.value })}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-canopy-700"
            checked={draft.enabled}
            onChange={(e) =>
              setDraft({ ...draft, enabled: e.target.checked })
            }
          />
          <span>{t("profile.node.enableLabel")}</span>
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? t("common.saving") : t("profile.node.save")}
          </button>
          {savedAt && (
            <span className="text-xs text-canopy-700 dark:text-canopy-300">
              {t("profile.node.saved")}
            </span>
          )}
        </div>
      </form>

      <Telemetry lastSuccess={lastSuccess?.value} lastError={lastError?.value} />

      <FounderClaimCard url={persisted.url || draft.url} />

      <OutboxControls />

      {/* The /invite paste-recovery entry point stays reachable from
          Settings (docs/invite-redemption.md §5.1.4) — a member who
          dismissed the Board's not-joined card, or whose invite link
          arrived while they were already poking around, can always
          get back to it without a tappable link. */}
      <p className="mt-3 text-xs text-moss-600 dark:text-moss-300">
        <Link
          to="/invite"
          className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
        >
          {t("profile.node.inviteLink")}
        </Link>
      </p>

      <ConfirmDialog
        open={pendingSave !== null}
        tone="caution"
        title={t("profile.node.consent.title")}
        description={t("profile.node.consent.body")}
        confirmLabel={t("profile.node.consent.confirm")}
        cancelLabel={t("common.cancel")}
        confirmingLabel={t("common.saving")}
        onCancel={() => setPendingSave(null)}
        onConfirm={async () => {
          if (!pendingSave) return;
          await persist(pendingSave);
          setPendingSave(null);
        }}
      />
    </section>
  );
}

// First-run founder claim (docs/member-authenticated-reads.md,
// "Claiming a fresh node"). A fresh server under the default
// READ_AUTH=on boots UNCLAIMED and refuses every community surface
// until its founding member presents the one-time setup code from
// the server's boot log. This card is the app half of that ceremony:
// it appears only while the CONNECTED node reports `claimed: false`
// on /config (fetched when the member expands the disclosure — no
// background probing), takes the code, signs the claim with the
// member's own key, and reports the node ready. Nothing here renders
// for the overwhelmingly common case of a long-claimed node.
function FounderClaimCard({ url }: { url: string }) {
  const { t } = useTranslation();
  const { currentMember } = useApp();
  const [expanded, setExpanded] = useState(false);
  // null = status unknown (probe pending/failed); boolean = the
  // node's own answer.
  const [unclaimed, setUnclaimed] = useState<boolean | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<
    | { kind: "success" }
    | { kind: "error"; message: string }
    | null
  >(null);

  const trimmedUrl = url.trim();
  if (!trimmedUrl || !currentMember) return null;

  async function handleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && unclaimed === null) {
      setUnclaimed(await fetchClaimStatus(trimmedUrl));
    }
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!currentMember || busy || !code.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await claimFounder({
        url: trimmedUrl,
        setupToken: code,
        publicKey: currentMember.publicKey,
      });
      if (res.ok) {
        setResult({ kind: "success" });
        setUnclaimed(false);
        setCode("");
      } else {
        setResult({
          kind: "error",
          message: t(`profile.node.claim.errors.${res.reason}`),
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        className="text-xs font-medium text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
        aria-expanded={expanded}
        onClick={handleExpand}
      >
        {t("profile.node.claim.toggle")}
      </button>
      {expanded && (
        <div className="mt-2 rounded-xl border border-bark-200/60 bg-bark-50 p-3 text-sm dark:border-moss-800 dark:bg-moss-900/40">
          {result?.kind === "success" ? (
            <p className="text-canopy-700 dark:text-canopy-300">
              {t("profile.node.claim.success")}
            </p>
          ) : unclaimed === null ? (
            <p className="text-moss-600 dark:text-moss-300">
              {t("profile.node.claim.statusUnknown")}
            </p>
          ) : unclaimed === false ? (
            <p className="text-moss-600 dark:text-moss-300">
              {t("profile.node.claim.alreadyClaimed")}
            </p>
          ) : (
            <form onSubmit={handleClaim} className="flex flex-col gap-2">
              <p className="text-moss-600 dark:text-moss-300">
                {t("profile.node.claim.intro")}
              </p>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium">
                  {t("profile.node.claim.codeLabel")}
                </span>
                <input
                  type="text"
                  className="input font-mono"
                  autoComplete="off"
                  spellCheck={false}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                />
              </label>
              {result?.kind === "error" && (
                <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">
                  {result.message}
                </p>
              )}
              <button
                type="submit"
                className="btn-secondary self-start"
                disabled={busy || !code.trim()}
                aria-busy={busy}
              >
                {busy
                  ? t("profile.node.claim.claiming")
                  : t("profile.node.claim.claim")}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function OutboxControls() {
  const { t } = useTranslation();
  const pending = useLiveQuery(
    () => db.outbox.where("status").equals("pending").count(),
    [],
    0,
  );
  const poisoned = useLiveQuery(
    () => db.outbox.where("status").equals("poisoned").count(),
    [],
    0,
  );
  const [retrying, setRetrying] = useState(false);

  const havePending = pending > 0;
  const havePoisoned = poisoned > 0;
  if (!havePending && !havePoisoned) return null;

  async function handleRetry() {
    setRetrying(true);
    try {
      await flushOutboxNow();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
      {havePending && (
        <span className="chip bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          {t("profile.node.pending", { count: pending })}
        </span>
      )}
      {havePoisoned && (
        <span className="chip bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
          {t("profile.node.poisoned", { count: poisoned })}
        </span>
      )}
      {havePending && (
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={handleRetry}
          disabled={retrying}
        >
          {retrying ? t("profile.node.retrying") : t("profile.node.retryNow")}
        </button>
      )}
    </div>
  );
}

function Telemetry({
  lastSuccess,
  lastError,
}: {
  lastSuccess: string | undefined;
  lastError: string | undefined;
}) {
  const { t } = useTranslation();
  const haveSuccess = !!lastSuccess && lastSuccess.length > 0;
  const haveError = !!lastError && lastError.length > 0;
  // Known server codes get their humane, translated copy instead of
  // the bare wire code. Today: the trust gates' 403s — the node
  // refuses invite announcements (and redemptions) from, vouches by,
  // and proposal closures signed by a member the community hasn't
  // fully vouched for, and the outbox records the code verbatim as
  // lastError. The *_not_trusted codes never co-occur in one
  // lastError string, so first match wins.
  const errorMessage = lastError?.includes("voucher_not_trusted")
    ? t("vouch.errors.voucher_not_trusted")
    : lastError?.includes("inviter_not_trusted")
      ? t("invite.errors.inviter_not_trusted")
      : lastError?.includes("closer_not_trusted")
        ? t("proposals.errors.closer_not_trusted")
        : lastError?.includes("newcomer_daily_limit")
          ? t("newcomer.errors.newcomer_daily_limit")
          : lastError;

  if (!haveSuccess && !haveError) {
    return (
      <p className="mt-3 text-xs text-moss-600 dark:text-moss-300">
        {t("profile.node.noActivity")}
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs">
      {haveSuccess && (
        <span className="chip bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100">
          {t("profile.node.lastSuccess", {
            when: formatAbsoluteDateTime(
              new Date(lastSuccess!).getTime(),
            ),
          })}
        </span>
      )}
      {haveError && (
        <span className="chip bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
          {t("profile.node.lastError", { message: errorMessage })}
        </span>
      )}
    </div>
  );
}
