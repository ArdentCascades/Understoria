import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { balanceFor, transactionHistory } from "@/lib/timebank";
import { AchievementBadge } from "@/components/AchievementBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  formatHours,
  formatRelativeTime,
  formatSignedHours,
  shortKey,
} from "@/lib/format";
import { updateMemberProfile } from "@/db/actions";
import { db } from "@/db/database";
import type { InviteRow } from "@/db/database";
import {
  issueInvite,
  revokeInvite,
} from "@/db/invites";
import {
  changePassphrase,
  disablePassphrase,
  enablePassphrase,
} from "@/db/secrets";
import { trustStatusWithInvites } from "@/lib/vouch";
import { TrustChip } from "@/components/TrustChip";
import { LanguageSection } from "@/components/LanguageSection";
import type { AchievementType, FlagReason, Member } from "@/types";

function flagReasonKey(reason: FlagReason | undefined): string {
  switch (reason) {
    case "short_duration":
      return "profile.history.flagShort";
    case "reciprocal_pattern":
      return "profile.history.flagReciprocal";
    case "daily_limit_warning":
      return "profile.history.flagDailyLimit";
    default:
      return "profile.history.flagDefault";
  }
}

const INVITE_STATUS_KEY: Record<InviteRow["status"], string> = {
  open: "profile.invites.statusOpen",
  redeemed: "profile.invites.statusRedeemed",
  revoked: "profile.invites.statusRevoked",
  expired: "profile.invites.statusExpired",
};

export default function ProfilePage() {
  const {
    currentMember,
    members,
    exchanges,
    achievements,
    invites,
    vouches,
    nodeId,
    setCurrentMember,
  } = useApp();
  const { t } = useTranslation();

  if (!currentMember) return null;

  const trust = trustStatusWithInvites(currentMember.publicKey, {
    vouches,
    invites,
  });
  const myInvites = invites.filter(
    (inv) => inv.inviterKey === currentMember.publicKey,
  );

  const balance = useMemo(
    () => balanceFor(currentMember, exchanges),
    [currentMember, exchanges],
  );
  const history = useMemo(
    () => transactionHistory(currentMember.publicKey, exchanges),
    [currentMember, exchanges],
  );
  const memberMap = useMemo(
    () => new Map(members.map((m) => [m.publicKey, m])),
    [members],
  );
  const myAchievements = useMemo(
    () =>
      achievements
        .filter((a) => a.memberKey === currentMember.publicKey)
        .sort((a, b) => b.earnedAt - a.earnedAt),
    [achievements, currentMember.publicKey],
  );

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("profile.title")}
          </h1>
          <p className="text-xs text-moss-500 dark:text-moss-400">
            {t("profile.identity", { key: shortKey(currentMember.publicKey) })}
          </p>
        </div>
        <TrustChip status={trust} />
      </header>

      <BalanceCard balance={balance} seed={currentMember.seedBalance} />

      <ProfileEditor member={currentMember} />

      <InvitesSection
        member={currentMember}
        nodeId={nodeId}
        invites={myInvites}
      />

      <section className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
          {t("profile.rolesEarned.title")}
        </h2>
        {myAchievements.length === 0 ? (
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {t("profile.rolesEarned.empty")}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {myAchievements.map((a) => (
              <li key={a.id}>
                <AchievementBadge
                  type={a.achievementType as AchievementType}
                  earnedAt={a.earnedAt}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
          {t("profile.history.title")}
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {t("profile.history.empty")}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-moss-100 dark:divide-moss-800">
            {history.map(({ exchange, delta, counterparty }) => {
              const other = memberMap.get(counterparty);
              return (
                <li
                  key={exchange.id}
                  className="flex items-center gap-3 py-3"
                >
                  <CategoryBadge category={exchange.category} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">
                      {delta > 0
                        ? t("profile.history.helped")
                        : t("profile.history.received")}{" "}
                      <span className="font-medium">
                        {other?.displayName ?? t("common.memberFallback")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-moss-500">
                      <span>{formatRelativeTime(exchange.completedAt)}</span>
                      {exchange.flaggedForReview && (
                        <span
                          title={t(flagReasonKey(exchange.flagReason))}
                          className="chip bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                        >
                          {t("profile.history.flag")}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      delta > 0
                        ? "text-canopy-700 dark:text-canopy-300"
                        : "text-moss-600 dark:text-moss-300"
                    }`}
                  >
                    {formatSignedHours(delta)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <MemberSwitcher
        members={members}
        currentMember={currentMember}
        onSwitch={setCurrentMember}
      />

      <section className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
          {t("profile.data.title")}
        </h2>
        <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
          {t("profile.data.intro")}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary"
            onClick={() => exportData()}
            type="button"
          >
            {t("profile.data.export")}
          </button>
        </div>
      </section>

      <LanguageSection />

      <SecuritySection />

      <EmergencySection />
    </div>
  );
}

function SecuritySection() {
  const { lockState, lock, refreshLockState } = useApp();
  const { t } = useTranslation();
  const [mode, setMode] = useState<"idle" | "enable" | "change" | "disable">(
    "idle",
  );
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [current, setCurrent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function reset() {
    setMode("idle");
    setPass1("");
    setPass2("");
    setCurrent("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      if (mode === "enable") {
        if (pass1 !== pass2)
          throw new Error(t("profile.security.errorMismatch"));
        await enablePassphrase(pass1);
        setSuccess(t("profile.security.successEnable"));
      } else if (mode === "change") {
        if (pass1 !== pass2)
          throw new Error(t("profile.security.errorMismatchNew"));
        await changePassphrase(current, pass1);
        setSuccess(t("profile.security.successChange"));
      } else if (mode === "disable") {
        await disablePassphrase();
        setSuccess(t("profile.security.successDisable"));
      }
      await refreshLockState();
      reset();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const protectionOn = lockState !== "unprotected";

  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("profile.security.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {protectionOn
          ? t("profile.security.summaryProtected")
          : t("profile.security.summaryUnprotected")}
      </p>

      {success && (
        <p
          role="status"
          className="mb-3 rounded-xl bg-canopy-50 p-3 text-sm text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100"
        >
          {success}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {!protectionOn && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              reset();
              setMode("enable");
              setSuccess(null);
            }}
          >
            {t("profile.security.enable")}
          </button>
        )}
        {protectionOn && (
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                reset();
                setMode("change");
                setSuccess(null);
              }}
            >
              {t("profile.security.change")}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                reset();
                setMode("disable");
                setSuccess(null);
              }}
            >
              {t("profile.security.disable")}
            </button>
            <button
              type="button"
              className="btn bg-rose-600 text-white hover:bg-rose-700"
              onClick={() => lock()}
            >
              {t("profile.security.lockNow")}
            </button>
          </>
        )}
      </div>

      {mode !== "idle" && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          {mode === "change" && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">
                {t("profile.security.currentPassphrase")}
              </span>
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
            </label>
          )}
          {mode !== "disable" && (
            <>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">
                  {mode === "change"
                    ? t("profile.security.newPassphrase")
                    : t("profile.security.passphrase")}
                </span>
                <input
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  value={pass1}
                  onChange={(e) => setPass1(e.target.value)}
                  minLength={8}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">
                  {t("profile.security.repeat")}
                </span>
                <input
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  value={pass2}
                  onChange={(e) => setPass2(e.target.value)}
                  minLength={8}
                  required
                />
              </label>
              <p className="text-xs text-moss-500 dark:text-moss-400">
                {t("profile.security.passphraseHint")}
              </p>
            </>
          )}
          {mode === "disable" && (
            <p className="text-sm text-moss-600 dark:text-moss-300">
              {t("profile.security.disableWarn")}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={reset}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy
                ? t("profile.security.working")
                : mode === "enable"
                  ? t("profile.security.submitEnable")
                  : mode === "change"
                    ? t("profile.security.submitChange")
                    : t("profile.security.submitDisable")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function EmergencySection() {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState<null | "soft" | "hard">(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleConfirm() {
    if (!confirming) return;
    try {
      const { softPurge, hardPurge } = await import("@/lib/panic");
      const result =
        confirming === "soft" ? await softPurge() : await hardPurge();
      const ms = Math.round(result.durationMs);
      setStatus(
        result.mode === "soft"
          ? t("profile.emergency.completedSoft", { ms })
          : t("profile.emergency.completedHard", { ms }),
      );
      if (confirming === "hard") {
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setConfirming(null);
    }
  }

  return (
    <>
      <section className="card border-rose-200 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
          {t("profile.emergency.title")}
        </h2>
        <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
          {t("profile.emergency.intro")}
        </p>
        <ul className="mb-4 space-y-3 text-sm">
          <li>{t("profile.emergency.softBullet")}</li>
          <li>{t("profile.emergency.hardBullet")}</li>
        </ul>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setConfirming("soft")}
          >
            {t("profile.emergency.softButton")}
          </button>
          <button
            type="button"
            className="btn bg-rose-600 text-white hover:bg-rose-700"
            onClick={() => setConfirming("hard")}
          >
            {t("profile.emergency.hardButton")}
          </button>
        </div>
        {status && (
          <p
            role="status"
            className="mt-3 text-xs text-moss-600 dark:text-moss-300"
          >
            {status}
          </p>
        )}
      </section>
      <ConfirmDialog
        open={confirming === "soft"}
        tone="caution"
        title={t("profile.emergency.softTitle")}
        description={t("profile.emergency.softConfirmDescription")}
        confirmLabel={t("profile.emergency.softConfirm")}
        onCancel={() => setConfirming(null)}
        onConfirm={handleConfirm}
      />
      <ConfirmDialog
        open={confirming === "hard"}
        tone="caution"
        title={t("profile.emergency.hardTitle")}
        description={t("profile.emergency.hardConfirmDescription")}
        confirmLabel={t("profile.emergency.hardConfirm")}
        onCancel={() => setConfirming(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

function BalanceCard({
  balance,
  seed,
}: {
  balance: number;
  seed: number;
}) {
  const { t } = useTranslation();
  const tone =
    balance > seed
      ? "surplus"
      : balance === seed
        ? "neutral"
        : "receiving";
  const messageKey = `profile.balance.${tone}`;
  return (
    <section className="card mb-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-moss-500">
            {t("profile.balance.label")}
          </div>
          <div className="mt-1 text-4xl font-bold text-canopy-700 dark:text-canopy-300">
            {formatHours(balance)}
          </div>
        </div>
        <div className="text-right text-xs text-moss-500">
          <div>{t("profile.balance.seed", { hours: formatHours(seed) })}</div>
          <div>{t("profile.balance.footerNote")}</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-moss-600 dark:text-moss-300">
        {t(messageKey)}
      </p>
    </section>
  );
}

function ProfileEditor({ member }: { member: Member }) {
  const { t } = useTranslation();
  const [name, setName] = useState(member.displayName);
  const [skills, setSkills] = useState(member.skills.join(", "));
  const [availability, setAvailability] = useState(member.availability);
  const [zone, setZone] = useState(member.locationZone);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMemberProfile(member.publicKey, {
        displayName: name.trim() || member.displayName,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        availability: availability.trim(),
        locationZone: zone.trim(),
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card mb-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("profile.about.title")}
      </h2>
      <form className="flex flex-col gap-3" onSubmit={handleSave}>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t("profile.about.name")}</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t("profile.about.skills")}</span>
          <input
            className="input"
            placeholder={t("profile.about.skillsPlaceholder")}
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t("profile.about.availability")}</span>
          <input
            className="input"
            placeholder={t("profile.about.availabilityPlaceholder")}
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t("profile.about.area")}</span>
          <input
            className="input"
            placeholder={t("profile.about.areaPlaceholder")}
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          />
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </button>
          {savedAt && (
            <span className="text-xs text-canopy-700 dark:text-canopy-300">
              {t("common.savedAt", { when: formatRelativeTime(savedAt) })}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

function MemberSwitcher({
  members,
  currentMember,
  onSwitch,
}: {
  members: Member[];
  currentMember: Member;
  onSwitch: (publicKey: string) => void;
}) {
  const { t } = useTranslation();
  if (members.length <= 1) return null;
  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("profile.memberSwitcher.title")}
      </h2>
      <p className="mb-3 text-xs text-moss-500">
        {t("profile.memberSwitcher.note")}
      </p>
      <ul className="flex flex-col gap-2">
        {members.map((m) => (
          <li key={m.publicKey}>
            <button
              type="button"
              onClick={() => onSwitch(m.publicKey)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                m.publicKey === currentMember.publicKey
                  ? "border-canopy-600 bg-canopy-50 text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100"
                  : "border-moss-200 hover:bg-moss-50 dark:border-moss-800 dark:hover:bg-moss-900"
              }`}
            >
              <div className="font-medium">{m.displayName}</div>
              <div className="text-xs text-moss-500">
                {shortKey(m.publicKey)} ·{" "}
                {m.locationZone || t("profile.memberSwitcher.noAreaSet")}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function exportData() {
  // NOTE: db.secretKeys is deliberately excluded — private keys never leave
  // the device via export. Key backup/recovery will be a separate, explicit
  // passphrase-wrapped flow (Agent 2).
  const [members, posts, exchanges, achievements, settings] = await Promise.all(
    [
      db.members.toArray(),
      db.posts.toArray(),
      db.exchanges.toArray(),
      db.achievements.toArray(),
      db.settings.toArray(),
    ],
  );
  const payload = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    data: { members, posts, exchanges, achievements, settings },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `understoria-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function InvitesSection({
  member,
  nodeId,
  invites,
}: {
  member: Member;
  nodeId: string;
  invites: InviteRow[];
}) {
  const { t, i18n } = useTranslation();
  const [issuing, setIssuing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleIssue() {
    setError(null);
    setIssuing(true);
    try {
      const { shareUrl: url } = await issueInvite({
        inviterKey: member.publicKey,
        inviterName: member.displayName,
        nodeId,
      });
      setShareUrl(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIssuing(false);
    }
  }

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus(t("common.copied"));
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus(t("common.copyFailed"));
    }
  }

  async function handleRevoke(token: string) {
    setError(null);
    try {
      await revokeInvite(member.publicKey, token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className="card mb-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("profile.invites.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.invites.intro")}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={handleIssue}
          disabled={issuing}
        >
          {issuing
            ? t("profile.invites.generating")
            : t("profile.invites.generate")}
        </button>
      </div>

      {shareUrl && (
        <div className="mt-3 rounded-xl border border-canopy-200 bg-canopy-50 p-3 dark:border-canopy-900/50 dark:bg-canopy-950/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-canopy-800 dark:text-canopy-200">
            {t("profile.invites.shareTitle")}
          </p>
          <code className="mt-1 block break-all rounded bg-white px-2 py-1 text-xs dark:bg-moss-900">
            {shareUrl}
          </code>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() => handleCopy(shareUrl)}
            >
              {t("common.copy")}
            </button>
            {copyStatus && (
              <span className="text-canopy-800 dark:text-canopy-200">
                {copyStatus}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
            {t("profile.invites.shareNote")}
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}

      {invites.length > 0 && (
        <ul className="mt-4 flex flex-col divide-y divide-moss-100 dark:divide-moss-800">
          {invites.map((inv) => (
            <li
              key={inv.token}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">
                  {t(INVITE_STATUS_KEY[inv.status])}
                </div>
                <div className="text-xs text-moss-500">
                  {inv.status === "redeemed"
                    ? t("profile.invites.redeemed", {
                        when: formatRelativeTime(inv.redeemedAt ?? 0),
                      })
                    : t("profile.invites.expires", {
                        date: new Date(inv.expiresAt).toLocaleDateString(
                          i18n.resolvedLanguage,
                        ),
                      })}
                </div>
              </div>
              {inv.status === "open" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-ghost text-xs"
                    onClick={() =>
                      handleCopy(`${window.location.origin}/invite#${inv.encoded}`)
                    }
                  >
                    {t("common.copy")}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost text-xs text-rose-700 dark:text-rose-300"
                    onClick={() => handleRevoke(inv.token)}
                  >
                    {t("profile.invites.revoke")}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
