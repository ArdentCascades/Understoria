import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/state/AppContext";
import { decodeAndVerifyInvite } from "@/lib/invite";
import { redeemInvite, type RedeemError } from "@/db/invites";
import { shortKey } from "@/lib/format";

export default function InviteAcceptPage() {
  const { nodeId, setCurrentMember } = useApp();
  const navigate = useNavigate();

  const encoded = useMemo(() => {
    const hash = window.location.hash.replace(/^#/, "");
    return hash || null;
  }, []);

  const [parseResult, setParseResult] = useState<
    ReturnType<typeof decodeAndVerifyInvite> | null
  >(null);
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "error" | "done"
  >("idle");
  const [error, setError] = useState<RedeemError | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!encoded) {
      setParseResult({ ok: false, error: "malformed" });
      return;
    }
    setParseResult(decodeAndVerifyInvite(encoded));
  }, [encoded]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!encoded) return;
    if (!displayName.trim()) {
      setSubmitError("Choose a display name or pseudonym to continue.");
      return;
    }
    setStatus("submitting");
    setSubmitError(null);
    const result = await redeemInvite(encoded, displayName.trim(), nodeId);
    if (!result.ok) {
      setStatus("error");
      setError(result.error);
      return;
    }
    await setCurrentMember(result.value.member.publicKey);
    setStatus("done");
    setTimeout(() => navigate("/"), 1000);
  }

  if (!parseResult) {
    return (
      <div className="px-4 pt-6 text-sm text-moss-600 dark:text-moss-300">
        Reading invite…
      </div>
    );
  }

  if (!parseResult.ok) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold">This invite can't be used.</h1>
        <p className="mt-2 text-sm text-moss-600 dark:text-moss-300">
          {inviteErrorMessage(parseResult.error)}
        </p>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => navigate("/")}
        >
          Continue to the board
        </button>
      </div>
    );
  }

  const { invite } = parseResult;

  return (
    <div className="px-4 pb-8 pt-6">
      <div className="card">
        <h1 className="text-2xl font-bold tracking-tight">
          You've been invited
        </h1>
        <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
          <span className="font-medium">{invite.inviterName}</span> wants you in
          their mutual aid network.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-moss-500">
              Inviter key
            </dt>
            <dd className="mt-0.5 font-mono text-xs">
              {shortKey(invite.inviterKey)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-moss-500">
              Expires
            </dt>
            <dd className="mt-0.5">
              {new Date(invite.expiresAt).toLocaleString()}
            </dd>
          </div>
        </dl>

        <p className="mt-4 rounded-xl bg-moss-50 p-3 text-xs text-moss-600 dark:bg-moss-900 dark:text-moss-300">
          Before accepting: confirm that the inviter-key fingerprint above
          matches what {invite.inviterName} shared with you in person or over
          a secure channel. A link that reached you via untrusted email is
          worth a double-check.
        </p>

        {status === "done" ? (
          <p className="mt-4 rounded-xl bg-canopy-50 p-3 text-sm text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100">
            Welcome in. Redirecting to the board…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                Your display name (pseudonyms welcome)
              </span>
              <input
                className="input"
                autoFocus
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                required
              />
            </label>
            {submitError && (
              <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
                {submitError}
              </p>
            )}
            {status === "error" && error && (
              <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
                {inviteErrorMessage(error)}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/")}
              >
                Not now
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={status === "submitting"}
              >
                {status === "submitting"
                  ? "Joining…"
                  : "Accept invite and join"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function inviteErrorMessage(error: RedeemError): string {
  switch (error) {
    case "malformed":
      return "This invite link is missing or damaged. Ask the inviter to send a fresh one.";
    case "expired":
      return "This invite has expired. Ask the inviter to issue a new one.";
    case "bad_signature":
      return "This invite's signature didn't verify. Do not accept — it may have been tampered with.";
    case "already_redeemed":
      return "Someone has already used this invite. Invites are single-use.";
    case "revoked":
      return "The inviter revoked this invite.";
    case "self_redeem":
      return "You can't redeem an invite you issued yourself. Share the link with someone else.";
  }
}
