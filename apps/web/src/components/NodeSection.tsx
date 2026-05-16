import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { db, SETTING_KEYS } from "@/db/database";
import {
  readSubmitConfig,
  writeSubmitConfig,
  type SubmitConfig,
} from "@/lib/nodeSubmit";
import { flushOutboxNow } from "@/lib/outbox";

export function NodeSection() {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<SubmitConfig>({ url: "", enabled: false });
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Load the persisted config once on mount.
  useEffect(() => {
    let cancelled = false;
    void readSubmitConfig().then((cfg) => {
      if (!cancelled) setDraft(cfg);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await writeSubmitConfig({
        url: draft.url.trim(),
        enabled: draft.enabled,
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500">
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

      <OutboxControls />
    </section>
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
  const { t, i18n } = useTranslation();
  const haveSuccess = !!lastSuccess && lastSuccess.length > 0;
  const haveError = !!lastError && lastError.length > 0;

  if (!haveSuccess && !haveError) {
    return (
      <p className="mt-3 text-xs text-moss-500 dark:text-moss-400">
        {t("profile.node.noActivity")}
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs">
      {haveSuccess && (
        <span className="chip bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100">
          {t("profile.node.lastSuccess", {
            when: new Date(lastSuccess!).toLocaleString(i18n.resolvedLanguage),
          })}
        </span>
      )}
      {haveError && (
        <span className="chip bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
          {t("profile.node.lastError", { message: lastError })}
        </span>
      )}
    </div>
  );
}
