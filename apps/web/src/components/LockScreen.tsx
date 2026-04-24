import { useState } from "react";
import { useApp } from "@/state/AppContext";
import { shortKey } from "@/lib/format";

export function LockScreen() {
  const { currentMember, unlock } = useApp();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await unlock(passphrase);
      if (result === "wrong_passphrase") {
        setError("That passphrase didn't match. Try again.");
      } else if (result === "nothing_to_unlock") {
        setError(
          "No wrapped keys on this device — nothing to unlock. (If you're seeing this, reload the page.)",
        );
      } else {
        setPassphrase("");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="mb-2 flex items-center gap-3">
          <span aria-hidden="true" className="text-3xl">
            {"\u{1F512}"}
          </span>
          <h1 className="text-xl font-bold tracking-tight">
            This device is locked
          </h1>
        </div>
        <p className="mb-4 text-sm text-moss-600 dark:text-moss-300">
          {currentMember ? (
            <>
              Enter your passphrase to unlock{" "}
              <span className="font-medium">{currentMember.displayName}</span>'s
              identity on this device.{" "}
              <span className="block text-xs text-moss-500 dark:text-moss-400">
                Key: {shortKey(currentMember.publicKey)}
              </span>
            </>
          ) : (
            <>Enter your passphrase to unlock this device.</>
          )}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Passphrase</span>
            <input
              type="password"
              autoFocus
              className="input"
              autoComplete="current-password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              required
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || passphrase.length === 0}
          >
            {submitting ? "Unlocking…" : "Unlock"}
          </button>
        </form>
        <p className="mt-4 text-xs text-moss-500 dark:text-moss-400">
          Forgotten passphrases cannot be recovered — by design. If you've
          lost yours, the only path is Profile → Emergency → Hard purge and
          starting over with a fresh identity.
        </p>
      </div>
    </div>
  );
}
