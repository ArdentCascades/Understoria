import { useMemo, useState } from "react";
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
import { trustStatusWithInvites } from "@/lib/vouch";
import { TrustChip } from "@/components/TrustChip";
import type { AchievementType, FlagReason, Member } from "@/types";

function flagReasonLabel(reason: FlagReason | undefined): string {
  switch (reason) {
    case "short_duration":
      return "Very short exchange — surfaced for community review.";
    case "reciprocal_pattern":
      return "Repeated reciprocal exchange with the same person — surfaced for community review.";
    case "daily_limit_warning":
      return "Near the daily exchange limit.";
    default:
      return "Flagged for community review.";
  }
}

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
          <h1 className="text-2xl font-bold tracking-tight">Your profile</h1>
          <p className="text-xs text-moss-500 dark:text-moss-400">
            Identity: {shortKey(currentMember.publicKey)}
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
          Community roles earned
        </h2>
        {myAchievements.length === 0 ? (
          <p className="text-sm text-moss-600 dark:text-moss-300">
            You haven't earned any community roles yet. They show up as you
            participate — not as trophies, but as ways of naming the shapes
            your contributions take.
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
          Your exchange history
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-moss-600 dark:text-moss-300">
            Nothing here yet. When you give or receive help, each exchange
            shows up with a signed record you can verify.
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
                      {delta > 0 ? "Helped" : "Received help from"}{" "}
                      <span className="font-medium">
                        {other?.displayName ?? "a member"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-moss-500">
                      <span>{formatRelativeTime(exchange.completedAt)}</span>
                      {exchange.flaggedForReview && (
                        <span
                          title={flagReasonLabel(exchange.flagReason)}
                          className="chip bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                        >
                          flagged for review
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
          Data & privacy
        </h2>
        <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
          Everything you see is stored locally on this device. No server. No
          analytics. No account to sign up for.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary"
            onClick={() => exportData()}
            type="button"
          >
            Export my data
          </button>
        </div>
      </section>

      <EmergencySection />
    </div>
  );
}

function EmergencySection() {
  const [confirming, setConfirming] = useState<null | "soft" | "hard">(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleConfirm() {
    if (!confirming) return;
    try {
      const { softPurge, hardPurge } = await import("@/lib/panic");
      const result =
        confirming === "soft" ? await softPurge() : await hardPurge();
      setStatus(
        `${result.mode === "soft" ? "Soft" : "Hard"} purge complete in ${Math.round(
          result.durationMs,
        )}ms.`,
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
          Emergency
        </h2>
        <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
          Two panic options for when a device is at risk. Neither contacts a
          server; both happen entirely on this device.
        </p>
        <ul className="mb-4 space-y-3 text-sm">
          <li>
            <strong>Soft purge</strong> — strips every identifying text field
            (names, descriptions, areas, skills) while keeping the signed
            exchange ledger and your keypair. Useful if a device will briefly
            be handled by a hostile party.
          </li>
          <li>
            <strong>Hard purge</strong> — wipes every table including private
            keys, rotates to a fresh node identity. Unrecoverable. The page
            will reload afterward.
          </li>
        </ul>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setConfirming("soft")}
          >
            Soft purge (anonymize)
          </button>
          <button
            type="button"
            className="btn bg-rose-600 text-white hover:bg-rose-700"
            onClick={() => setConfirming("hard")}
          >
            Hard purge (delete everything)
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
        title="Run soft purge?"
        description="Identifying text on every member and post will be blanked out. Signed exchange records and your keypair will be preserved. This is not reversible."
        confirmLabel="Yes, anonymize"
        onCancel={() => setConfirming(null)}
        onConfirm={handleConfirm}
      />
      <ConfirmDialog
        open={confirming === "hard"}
        tone="caution"
        title="Run hard purge?"
        description="Every table will be wiped — including your private keys. A fresh node identity will be generated and the app will reload. There is no undo."
        confirmLabel="Yes, wipe everything"
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
  const tone =
    balance > seed
      ? "surplus"
      : balance === seed
        ? "neutral"
        : "receiving";
  const message =
    tone === "surplus"
      ? "You've given more than you've received lately. Thank you."
      : tone === "neutral"
        ? "Your balance is right at your starting seed. That's a fine place to be."
        : "You've been receiving — that's what seed credits are for. Ask for what you need.";
  return (
    <section className="card mb-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-moss-500">
            Your balance
          </div>
          <div className="mt-1 text-4xl font-bold text-canopy-700 dark:text-canopy-300">
            {formatHours(balance)}
          </div>
        </div>
        <div className="text-right text-xs text-moss-500">
          <div>Seed: {formatHours(seed)}</div>
          <div>Balances can go negative — asking is never gated.</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-moss-600 dark:text-moss-300">{message}</p>
    </section>
  );
}

function ProfileEditor({ member }: { member: Member }) {
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
        About you
      </h2>
      <form className="flex flex-col gap-3" onSubmit={handleSave}>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Display name (pseudonym is fine)</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Skills (comma-separated)</span>
          <input
            className="input"
            placeholder="cooking, listening, spanish"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Availability</span>
          <input
            className="input"
            placeholder="e.g. Evenings and weekends"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Area (neighborhood, not address)</span>
          <input
            className="input"
            placeholder="e.g. North neighborhood"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          />
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          {savedAt && (
            <span className="text-xs text-canopy-700 dark:text-canopy-300">
              Saved {formatRelativeTime(savedAt)}
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
  if (members.length <= 1) return null;
  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500">
        Switch member (local dev)
      </h2>
      <p className="mb-3 text-xs text-moss-500">
        In a real deployment each device holds one identity. This switcher
        exists so you can walk through the full exchange flow yourself while
        testing.
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
                {shortKey(m.publicKey)} · {m.locationZone || "no area set"}
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
      setCopyStatus("Copied. Share it over Signal, in person, or on paper.");
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus(
        "Couldn't access the clipboard — select the link above and copy manually.",
      );
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
        Invites you've issued
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        A new member needs two vouches to become trusted. Your invite counts
        as the first — someone else will need to vouch for them after they
        join.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={handleIssue}
          disabled={issuing}
        >
          {issuing ? "Generating…" : "Generate invite link"}
        </button>
      </div>

      {shareUrl && (
        <div className="mt-3 rounded-xl border border-canopy-200 bg-canopy-50 p-3 dark:border-canopy-900/50 dark:bg-canopy-950/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-canopy-800 dark:text-canopy-200">
            Share this link with one person
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
              Copy link
            </button>
            {copyStatus && (
              <span className="text-canopy-800 dark:text-canopy-200">
                {copyStatus}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
            The link is single-use and expires in 14 days. If it leaks before
            redemption, revoke it below.
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
                <div className="text-sm font-medium capitalize">
                  {inv.status.replace("_", " ")}
                </div>
                <div className="text-xs text-moss-500">
                  {inv.status === "redeemed"
                    ? `Redeemed ${formatRelativeTime(inv.redeemedAt ?? 0)}`
                    : `Expires ${new Date(inv.expiresAt).toLocaleDateString()}`}
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
                    Copy
                  </button>
                  <button
                    type="button"
                    className="btn-ghost text-xs text-rose-700 dark:text-rose-300"
                    onClick={() => handleRevoke(inv.token)}
                  >
                    Revoke
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

