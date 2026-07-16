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
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { isDemoBuild } from "@/lib/demo";
import {
  deriveCandidateNodeUrl,
  isExcludedOrigin,
} from "@/lib/nodeOriginSuggest";
import { claimFounder, fetchClaimStatus } from "@/lib/nodeClaim";
import { writeSubmitConfig } from "@/lib/nodeSubmit";
import { createMember } from "@/db/seed";
import { markOnboarded } from "@/db/onboarding";

// The UNCLAIMED-NODE gate (operator ruling, 2026-07: "if that's not
// set up it shouldn't let me use the app… people will assume their
// stuff is saving").
//
// A server-side setup wizard can build the node, but only a member's
// device can CLAIM it — and until that ceremony happens, the node
// refuses every member-gated read and write. Before this gate, the
// app served from an unclaimed node behaved like a working community:
// people onboarded, created content, sent invites — and none of it
// ever reached anyone. This gate makes the unclaimed state IMPOSSIBLE
// to miss:
//
//  - When the PWA was served by an origin whose node answers
//    `claimed: false`, the whole app is replaced by a setup screen.
//  - The founder finishes setup right there: name (if this device has
//    no identity yet), the one-time setup code from the server's boot
//    log, one button — connect + claim in a single stroke.
//  - Everyone else sees, plainly, that the community isn't ready yet
//    and nothing they make would be shared — with a re-check button
//    for when the founder finishes.
//
// Fail-open by design: the gate only engages on an AFFIRMATIVE
// `claimed: false` from the same-origin node. Dev builds, demo
// builds, static hosting (no /api), loopback origins, network
// failures, and CLAIMED nodes all render the app untouched — a
// network blip must never lock a working community out.

type GateState = "checking" | "unclaimed" | "pass";

export interface NodeSetupGateProps {
  children: React.ReactNode;
  /** Injectable for tests; defaults to the live origin + build env. */
  originOverride?: string;
  isDevOverride?: boolean;
}

export function NodeSetupGate({
  children,
  originOverride,
  isDevOverride,
}: NodeSetupGateProps) {
  const { ready, nodeId, currentMember, setCurrentMember, refreshOnboarded } =
    useApp();
  const { t } = useTranslation();
  const [state, setState] = useState<GateState>("checking");
  const [candidateUrl, setCandidateUrl] = useState<string>("");

  const isDev = isDevOverride ?? import.meta.env.DEV;
  const origin =
    originOverride ??
    (typeof window !== "undefined" ? window.location.origin : "");

  const check = useCallback(async () => {
    if (isDev || isDemoBuild() || !origin || isExcludedOrigin(origin)) {
      setState("pass");
      return;
    }
    const candidate = deriveCandidateNodeUrl(origin);
    setCandidateUrl(candidate);
    const unclaimed = await fetchClaimStatus(candidate);
    // Only an affirmative "unclaimed" gates; null (unreachable, not an
    // Understoria node) and false (claimed) both pass.
    setState(unclaimed === true ? "unclaimed" : "pass");
  }, [isDev, origin]);

  useEffect(() => {
    void check();
  }, [check]);

  // While the gate is up, re-check when the tab regains focus — the
  // founder may have claimed from another device.
  useEffect(() => {
    if (state !== "unclaimed") return;
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [state, check]);

  // "checking" renders the app: the gate must never add a boot delay
  // or flash for the overwhelmingly common claimed case. On the rare
  // unclaimed node it swaps in as soon as the probe answers.
  if (!ready || state !== "unclaimed") return <>{children}</>;

  return (
    <NodeSetupScreen
      candidateUrl={candidateUrl}
      hasIdentity={currentMember !== null}
      onClaim={async (displayName, setupToken) => {
        let publicKey = currentMember?.publicKey;
        if (!publicKey) {
          const member = await createMember(
            { displayName: displayName.trim() },
            nodeId,
          );
          await setCurrentMember(member.publicKey);
          publicKey = member.publicKey;
        }
        await writeSubmitConfig({ url: candidateUrl, enabled: true });
        const result = await claimFounder({
          url: candidateUrl,
          setupToken,
          publicKey,
        });
        if (result.ok || result.reason === "already_claimed") {
          // Claimed (by us, or by someone racing us — either way the
          // node is live now). The founder's device is onboarded: a
          // named identity that owns a community.
          await markOnboarded();
          await refreshOnboarded();
          await check();
          return null;
        }
        return result.reason;
      }}
      onRecheck={() => void check()}
      t={t}
    />
  );
}

function NodeSetupScreen({
  candidateUrl,
  hasIdentity,
  onClaim,
  onRecheck,
  t,
}: {
  candidateUrl: string;
  hasIdentity: boolean;
  onClaim: (displayName: string, setupToken: string) => Promise<string | null>;
  onRecheck: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  let origin = candidateUrl;
  try {
    origin = new URL(candidateUrl).origin;
  } catch {
    /* keep the raw URL */
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || (!hasIdentity && !displayName.trim())) return;
    setBusy(true);
    setError(null);
    try {
      const reason = await onClaim(displayName, code.trim());
      if (reason) {
        setError(t(`profile.node.claim.errors.${reason}`));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative h-dvh overflow-y-auto overscroll-contain bg-moss-50 dark:bg-moss-950">
      <div className="mx-auto max-w-md px-4 pb-10 pt-10">
        <div
          aria-hidden="true"
          className="mb-3 text-center text-5xl leading-none"
        >
          🌱
        </div>
        <h1 className="text-center text-xl font-bold">
          {t("nodeSetup.title")}
        </h1>
        <p
          role="alert"
          className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
        >
          {t("nodeSetup.body", { origin })}
        </p>

        <div className="card mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
            {t("nodeSetup.founderTitle")}
          </h2>
          <p className="mt-2 text-sm text-moss-600 dark:text-moss-300">
            {t("nodeSetup.founderIntro")}
          </p>
          <form onSubmit={handleClaim} className="mt-4 flex flex-col gap-3">
            {!hasIdentity && (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {t("nodeSetup.nameLabel")}
                </span>
                <input
                  className="input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={60}
                  required
                />
              </label>
            )}
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {t("profile.node.claim.codeLabel")}
              </span>
              <input
                className="input font-mono"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
                required
              />
              <span className="text-xs text-moss-600 dark:text-moss-300">
                {t("nodeSetup.codeHint")}
              </span>
            </label>
            {error && (
              <p
                role="alert"
                className="text-sm text-rose-700 dark:text-rose-300"
              >
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy
                ? t("profile.node.claim.claiming")
                : t("nodeSetup.claim")}
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-xl bg-moss-100 p-3 text-sm text-moss-700 dark:bg-moss-900 dark:text-moss-200">
          <p className="font-medium">{t("nodeSetup.waitingTitle")}</p>
          <p className="mt-1">{t("nodeSetup.waitingBody")}</p>
          <button
            type="button"
            className="btn-secondary mt-3 text-xs"
            onClick={onRecheck}
          >
            {t("nodeSetup.checkAgain")}
          </button>
        </div>
      </div>
    </div>
  );
}
