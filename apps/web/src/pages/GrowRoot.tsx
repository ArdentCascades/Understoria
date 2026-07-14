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
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";
import { BackLink } from "@/components/BackLink";
import { useApp } from "@/state/AppContext";
import { trustStatusWithInvites, vouchCountFor } from "@/lib/vouch";
import { listNodeEndpoints } from "@/lib/nodeEndpoints";
import { useStepFocus } from "@/lib/useStepFocus";
import {
  buildMirrorEnv,
  buildOriginHandover,
  generateMirrorToken,
  MIN_VOUCHES_TO_GROW,
  probeNewRoot,
  suggestNodeId,
  type RootCheckResult,
} from "@/lib/growRoot";

// "Grow another root" — the interactive replacement for the static
// add-a-node Help entry, launched from the Dashboard's resilience
// card. Three honestly-sized paths (run a server / recruit someone /
// pledge a seed vault); the run-it path generates the mirror-pairing
// env blocks from operator-guide §6 and verifies the result live.
//
// The wizard is gated to trusted members (>= MIN_VOUCHES_TO_GROW
// vouches — the community's existing "trusted" bar, because a mirror
// operator gains the read powers docs/operator-powers.md names).
// Honest note: the gate is UI friction, not a security boundary — the
// docs stay public, and the real controls are NODE_FOUNDER_KEYS +
// READ_AUTH + the current operator's consent to pair. The seed-vault
// path and the written guide remain open to everyone.
//
// The shared read token is generated on this device and travels only
// by the copy buttons / QR between the two operators — same delivery
// posture as guardian shards: never over the network.

type Step =
  | "choose"
  | "ask"
  | "helper"
  | "needs"
  | "settings"
  | "handover"
  | "verify";

const NEED_KEYS = ["computer", "internet", "afternoon"] as const;

function QrImage({ text, alt }: { text: string; alt: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [text]);
  if (!dataUrl) return null;
  return (
    <img
      src={dataUrl}
      alt={alt}
      className="h-56 w-56 self-center rounded-lg"
    />
  );
}

function CopyTextButton({ text }: { text: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost text-xs"
      onClick={() => {
        void navigator.clipboard?.writeText(text);
        setCopied(true);
      }}
    >
      {copied ? t("growRoot.copied") : t("common.copy")}
    </button>
  );
}

export default function GrowRootPage() {
  const { t } = useTranslation();
  const { currentMember, vouches, invites, founderRoots } = useApp();

  const [step, setStep] = useState<Step>("choose");
  const stepRef = useStepFocus(step);

  // Needs checklist + operator-powers acknowledgment (purely local).
  const [needsChecked, setNeedsChecked] = useState<boolean[]>(
    NEED_KEYS.map(() => false),
  );
  const [ack, setAck] = useState(false);

  // The shared read token: minted ONCE for this wizard run, so the
  // env block and the handover block carry the same value on purpose.
  const [token] = useState(generateMirrorToken);
  // Origin details, fetched once on entering the settings step:
  // `url` is the member's primary node, `nodeId` what its /config
  // publishes (only present alongside a system key).
  const [origin, setOrigin] = useState<{
    url: string | null;
    nodeId: string | null;
  } | null>(null);
  const [nodeIdSuggestion, setNodeIdSuggestion] = useState<string | null>(
    null,
  );
  // /config deliberately does NOT publish READ_AUTH, so the wizard
  // asks the member (default on — the safer posture; the hint says to
  // confirm with the current operator).
  const [readAuthOn, setReadAuthOn] = useState(true);

  // The new server's address — typed on the handover step, reused by
  // the verification step.
  const [newUrl, setNewUrl] = useState("");
  const [results, setResults] = useState<RootCheckResult[] | null>(null);
  const [checking, setChecking] = useState(false);

  const pwaOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  const have = currentMember
    ? vouchCountFor(currentMember.publicKey, { vouches, invites })
    : 0;
  // The same "trusted" bar as everywhere else — which now includes
  // founding trust roots (a founder must be able to grow the second
  // node; they're precisely who the wizard exists for on day one).
  const trusted =
    currentMember !== null &&
    trustStatusWithInvites(currentMember.publicKey, {
      vouches,
      invites,
      founderRoots,
    }) === "trusted";

  useEffect(() => {
    if (!trusted || step !== "settings" || origin !== null) return;
    let cancelled = false;
    void (async () => {
      const { primary } = await listNodeEndpoints();
      let nodeId: string | null = null;
      if (primary) {
        try {
          const res = await fetch(`${primary}/config`, {
            credentials: "omit",
            mode: "cors",
          });
          if (res.ok) {
            const body = (await res.json()) as { nodeId?: unknown } | null;
            if (
              body &&
              typeof body === "object" &&
              typeof body.nodeId === "string" &&
              body.nodeId.length > 0
            ) {
              nodeId = body.nodeId;
            }
          }
        } catch {
          // The env block still renders; the id suggestion just
          // falls back to a generic prefix.
        }
      }
      if (cancelled) return;
      setOrigin({ url: primary, nodeId });
      // Generated once — re-entering the step must not reshuffle the
      // id the member may already have pasted somewhere.
      setNodeIdSuggestion((prev) => prev ?? suggestNodeId(nodeId ?? "root"));
    })();
    return () => {
      cancelled = true;
    };
  }, [trusted, step, origin]);

  const askText = t("growRoot.ask.message", {
    origin: pwaOrigin,
    guide: `${pwaOrigin}/help#add-a-node`,
  });

  const envText = useMemo(() => {
    if (!origin?.url || !nodeIdSuggestion) return null;
    return buildMirrorEnv({
      originUrl: origin.url,
      pwaOrigin,
      readAuthOn,
      token,
      nodeId: nodeIdSuggestion,
    });
  }, [origin, nodeIdSuggestion, pwaOrigin, readAuthOn, token]);

  const handoverText = useMemo(() => {
    if (newUrl.trim() === "") return null;
    return buildOriginHandover({
      newNodeUrl: newUrl.trim(),
      token,
      readAuthOn,
    });
  }, [newUrl, token, readAuthOn]);

  async function runChecks() {
    const url = newUrl.trim();
    if (url === "" || checking) return;
    setChecking(true);
    try {
      const originUrl =
        origin?.url ?? (await listNodeEndpoints()).primary;
      if (!originUrl) return;
      setResults(
        await probeNewRoot({
          url,
          originUrl,
          originNodeId: origin?.nodeId ?? null,
        }),
      );
    } finally {
      setChecking(false);
    }
  }

  const allGreen =
    results !== null &&
    results.length > 0 &&
    results.every((r) => r.ok === true);

  // ---- Gate: the wizard opens for trusted members ------------------
  if (!trusted) {
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <BackLink to="/dashboard" label={t("common.back")} />
        <section className="card flex flex-col gap-3">
          <h1 className="text-xl font-bold">{t("growRoot.gate.title")}</h1>
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {t("growRoot.gate.body", { count: MIN_VOUCHES_TO_GROW })}
          </p>
          <p className="text-sm font-medium text-canopy-800 dark:text-canopy-200">
            {t("growRoot.gate.progress", {
              have,
              need: MIN_VOUCHES_TO_GROW,
            })}
          </p>
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {t("growRoot.gate.seedVaultLead")}
          </p>
          <Link
            to="/settings"
            className="text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
          >
            {t("growRoot.gate.seedVaultLink")} →
          </Link>
          <Link
            to="/help#add-a-node"
            className="text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
          >
            {t("growRoot.gate.guideLink")} →
          </Link>
        </section>
      </div>
    );
  }

  // ---- The wizard ---------------------------------------------------
  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <BackLink to="/dashboard" label={t("common.back")} />
      <h1 className="mb-2 mt-2 text-xl font-bold">{t("growRoot.title")}</h1>

      <div ref={stepRef} tabIndex={-1} className="outline-none">
        {step === "choose" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-moss-600 dark:text-moss-300">
              {t("growRoot.intro")}
            </p>
            <button
              type="button"
              className="card flex flex-col gap-1 border-canopy-300 text-left hover:border-canopy-500 dark:border-canopy-700"
              onClick={() => setStep("needs")}
            >
              <span className="font-semibold text-canopy-900 dark:text-canopy-100">
                {t("growRoot.paths.run.title")}
              </span>
              <span className="text-sm text-moss-600 dark:text-moss-300">
                {t("growRoot.paths.run.body")}
              </span>
            </button>
            <button
              type="button"
              className="card flex flex-col gap-1 border-canopy-300 text-left hover:border-canopy-500 dark:border-canopy-700"
              onClick={() => setStep("ask")}
            >
              <span className="font-semibold text-canopy-900 dark:text-canopy-100">
                {t("growRoot.paths.ask.title")}
              </span>
              <span className="text-sm text-moss-600 dark:text-moss-300">
                {t("growRoot.paths.ask.body")}
              </span>
            </button>
            <button
              type="button"
              className="card flex flex-col gap-1 border-canopy-300 text-left hover:border-canopy-500 dark:border-canopy-700"
              onClick={() => setStep("helper")}
            >
              <span className="font-semibold text-canopy-900 dark:text-canopy-100">
                {t("growRoot.paths.help.title")}
              </span>
              <span className="text-sm text-moss-600 dark:text-moss-300">
                {t("growRoot.paths.help.body")}
              </span>
            </button>
          </div>
        )}

        {step === "ask" && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{t("growRoot.ask.title")}</h2>
            <p className="text-sm text-moss-700 dark:text-moss-200">
              {t("growRoot.ask.body")}
            </p>
            <textarea
              className="input min-h-40 text-sm"
              readOnly
              value={askText}
              aria-label={t("growRoot.ask.title")}
            />
            <div className="flex flex-wrap items-center gap-2">
              <CopyTextButton text={askText} />
            </div>
            <button
              type="button"
              className="btn-ghost self-start text-xs"
              onClick={() => setStep("choose")}
            >
              {t("common.back")}
            </button>
          </div>
        )}

        {step === "helper" && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              {t("growRoot.helper.title")}
            </h2>
            <p className="text-sm text-moss-700 dark:text-moss-200">
              {t("growRoot.helper.body")}
            </p>
            <Link
              to="/settings"
              className="text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
            >
              {t("growRoot.helper.link")} →
            </Link>
            <button
              type="button"
              className="btn-ghost self-start text-xs"
              onClick={() => setStep("choose")}
            >
              {t("common.back")}
            </button>
          </div>
        )}

        {step === "needs" && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{t("growRoot.needs.title")}</h2>
            <p className="text-sm text-moss-600 dark:text-moss-300">
              {t("growRoot.needs.intro")}
            </p>
            {NEED_KEYS.map((key, i) => (
              <label key={key} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={needsChecked[i]}
                  onChange={(e) =>
                    setNeedsChecked((prev) =>
                      prev.map((v, j) => (j === i ? e.target.checked : v)),
                    )
                  }
                />
                <span>{t(`growRoot.needs.${key}`)}</span>
              </label>
            ))}
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
              />
              <span>{t("growRoot.needs.ack")}</span>
            </label>
            <Link
              to="/help#add-a-node"
              className="text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
            >
              {t("growRoot.needs.ackLink")} →
            </Link>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() => setStep("choose")}
              >
                {t("common.back")}
              </button>
              <button
                type="button"
                className="btn-primary text-xs"
                disabled={!(needsChecked.every(Boolean) && ack)}
                onClick={() => setStep("settings")}
              >
                {t("growRoot.continue")}
              </button>
            </div>
          </div>
        )}

        {step === "settings" && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              {t("growRoot.settings.title")}
            </h2>
            {origin === null && (
              <p role="status" className="text-sm text-moss-600 dark:text-moss-300">
                {t("growRoot.settings.loading")}
              </p>
            )}
            {origin !== null && origin.url === null && (
              <>
                <p className="text-sm text-moss-700 dark:text-moss-200">
                  {t("growRoot.settings.noNode")}
                </p>
                <Link
                  to="/settings"
                  className="text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                >
                  {t("growRoot.settings.noNodeLink")} →
                </Link>
              </>
            )}
            {envText !== null && (
              <>
                <p className="text-sm text-moss-700 dark:text-moss-200">
                  {t("growRoot.settings.intro")}
                </p>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={readAuthOn}
                    onChange={(e) => setReadAuthOn(e.target.checked)}
                  />
                  <span>{t("growRoot.settings.readAuth")}</span>
                </label>
                <p className="text-xs text-moss-600 dark:text-moss-300">
                  {t("growRoot.settings.readAuthHint")}
                </p>
                <pre
                  aria-label={t("growRoot.settings.envLabel")}
                  className="overflow-x-auto rounded-xl bg-canopy-50 p-3 font-mono text-xs text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100"
                >
                  {envText}
                </pre>
                <div className="flex flex-wrap items-center gap-2">
                  <CopyTextButton text={envText} />
                </div>
                <p className="text-sm font-medium">
                  {t("growRoot.settings.placeholdersLead")}
                </p>
                <ul className="list-disc pl-5 text-sm text-moss-700 dark:text-moss-200">
                  <li>{t("growRoot.settings.placeholderDbKey")}</li>
                  <li>{t("growRoot.settings.placeholderFounders")}</li>
                  <li>{t("growRoot.settings.placeholderQuorum")}</li>
                </ul>
              </>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() => setStep("needs")}
              >
                {t("common.back")}
              </button>
              <button
                type="button"
                className="btn-primary text-xs"
                disabled={envText === null}
                onClick={() => setStep("handover")}
              >
                {t("growRoot.continue")}
              </button>
            </div>
          </div>
        )}

        {step === "handover" && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              {t("growRoot.handover.title")}
            </h2>
            <p className="text-sm text-moss-700 dark:text-moss-200">
              {t("growRoot.handover.body")}
            </p>
            <label className="flex flex-col gap-1 text-sm">
              {t("growRoot.handover.urlLabel")}
              <input
                type="url"
                className="input"
                placeholder="https://node2.example"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </label>
            <p className="text-xs text-moss-600 dark:text-moss-300">
              {t("growRoot.handover.urlHint")}
            </p>
            {handoverText !== null && (
              <>
                <pre
                  aria-label={t("growRoot.handover.label")}
                  className="overflow-x-auto rounded-xl bg-canopy-50 p-3 font-mono text-xs text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100"
                >
                  {handoverText}
                </pre>
                <div className="flex flex-wrap items-center gap-2">
                  <CopyTextButton text={handoverText} />
                </div>
                <QrImage
                  text={handoverText}
                  alt={t("growRoot.handover.qrAlt")}
                />
              </>
            )}
            <p className="text-sm text-moss-700 dark:text-moss-200">
              {t("growRoot.handover.tokenNote")}
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() => setStep("settings")}
              >
                {t("common.back")}
              </button>
              <button
                type="button"
                className="btn-primary text-xs"
                disabled={handoverText === null}
                onClick={() => setStep("verify")}
              >
                {t("growRoot.continue")}
              </button>
            </div>
          </div>
        )}

        {step === "verify" && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              {t("growRoot.verify.title")}
            </h2>
            <p className="text-sm text-moss-700 dark:text-moss-200">
              {t("growRoot.verify.intro")}
            </p>
            <label className="flex flex-col gap-1 text-sm">
              {t("growRoot.verify.urlLabel")}
              <input
                type="url"
                className="input"
                placeholder="https://node2.example"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn-secondary self-start"
              disabled={newUrl.trim() === "" || checking}
              onClick={() => void runChecks()}
            >
              {checking
                ? t("growRoot.verify.running")
                : results === null
                  ? t("growRoot.verify.run")
                  : t("growRoot.verify.rerun")}
            </button>
            {results !== null && (
              <ul className="flex flex-col gap-1">
                {results.map((r) => (
                  <li key={r.id} className="flex items-start gap-2 text-sm">
                    <span
                      aria-hidden="true"
                      className={
                        r.ok === true
                          ? "font-bold text-canopy-700 dark:text-canopy-300"
                          : r.ok === false
                            ? "font-bold text-amber-700 dark:text-amber-300"
                            : "font-bold text-moss-600 dark:text-moss-300"
                      }
                    >
                      {r.ok === true ? "✓" : r.ok === false ? "✗" : "–"}
                    </span>
                    <span>
                      {t(`growRoot.verify.check.${r.id}`)}
                      {r.detail ? ` (${r.detail})` : ""}
                      <span className="sr-only">
                        {" — "}
                        {t(
                          r.ok === true
                            ? "growRoot.verify.status.ok"
                            : r.ok === false
                              ? "growRoot.verify.status.fail"
                              : "growRoot.verify.status.unknown",
                        )}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {results !== null && !allGreen && !checking && (
              <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                {t("growRoot.verify.notYet")}
              </p>
            )}
            {allGreen && (
              <>
                <p
                  role="status"
                  className="rounded-xl bg-canopy-50 p-3 text-sm font-medium text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100"
                >
                  {t("growRoot.verify.allGreen")}
                </p>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                >
                  {t("growRoot.verify.dashboardLink")} →
                </Link>
              </>
            )}
            <button
              type="button"
              className="btn-ghost self-start text-xs"
              onClick={() => setStep("handover")}
            >
              {t("common.back")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
